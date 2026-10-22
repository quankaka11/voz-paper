"""Đọc episode.json, tạo giọng đọc theo từng cảnh, căn thời lượng và xuất build/props.json cho Remotion."""
from __future__ import annotations

import math
import re
import shutil
import unicodedata
from pathlib import Path

from . import config, tts

SCENE_TYPES = {"title", "bigNumber", "list", "question", "receipt", "bars", "compare", "flow", "image", "phone",
               "collage", "map", "document", "intro", "outro"}
TRANSITIONS = {"auto", "cut", "sheet", "push", "push-up", "tear", "zoom"}
TONES = {"charcoal", "cream", "navy", "grid", "grid-blue", "grid-red", "map", "light", "dark"}


def find(ep: str) -> Path:
    """Nhận 'VOZ-001', '1', '001', tên thư mục hoặc đường dẫn → thư mục tập."""
    p = Path(ep)
    if p.is_dir() and ((p / "episode.json").exists() or (p / "meta.json").exists()):
        return p.resolve()
    prefix = config.channel().get("id_prefix", "VOZ")
    m = re.fullmatch(rf"(?:{prefix}-?)?(\d+)", ep, re.I)
    key = f"{prefix}-{int(m.group(1)):03d}" if m else ep
    hits = sorted(d for d in config.VIDEOS.glob(f"{key}*") if d.is_dir())
    if not hits:
        raise SystemExit(f"Không tìm thấy tập '{ep}' trong {config.VIDEOS}")
    return hits[0]


def format_of(ep_dir: Path) -> str:
    """Định dạng của tập: episode.json > format, mặc định channel.json > format ("short")."""
    spec = config.load_json(ep_dir / "episode.json", {}) or {}
    return spec.get("format") or config.channel().get("format", "short")


def _fold(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower()).replace("đ", "d")
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def _cue_ms(cue: str, captions: list[dict]) -> int | None:
    """Thời điểm (ms, tính từ đầu cảnh) lời đọc chạm tới cụm `cue`, nội suy theo ký tự trong cụm phụ đề."""
    spans, text = [], ""
    for c in captions:
        f = _fold(c["text"])
        spans.append((len(text), len(text) + len(f), c["startMs"], c["endMs"]))
        text += f + " "
    i = text.find(_fold(cue))
    if i < 0:
        return None
    for a, b, s, e in spans:
        if a <= i <= b:
            return round(s + (e - s) * (i - a) / max(1, b - a))
    return None


def _resolve_cues(node, captions: list[dict], warn: list[str]):
    """cue → atMs (lúc xuất hiện / máy quay tới), outCue → outAtMs (lúc rời khung)."""
    if isinstance(node, dict):
        for key, dst in (("cue", "atMs"), ("outCue", "outAtMs")):
            if key in node and dst not in node:
                ms = _cue_ms(str(node[key]), captions)
                if ms is None:
                    warn.append(f"không thấy {key} '{node[key]}' trong lời đọc")
                else:
                    node[dst] = ms
        for v in node.values():
            _resolve_cues(v, captions, warn)
    elif isinstance(node, list):
        for v in node:
            _resolve_cues(v, captions, warn)


def _check_files(node, ep_dir: Path, warn: list[str]):
    """Cảnh báo ảnh khai báo trong props mà chưa có file (src, image, img)."""
    if isinstance(node, dict):
        for k, v in node.items():
            if k in ("src", "image", "img") and isinstance(v, str) and not v.startswith(("http:", "https:", "data:")):
                if not (ep_dir / v).exists():
                    warn.append(f"thiếu file ảnh {v}")
            else:
                _check_files(v, ep_dir, warn)
    elif isinstance(node, list):
        for v in node:
            _check_files(v, ep_dir, warn)


def _sync_tree(src: Path, dst: Path):
    if not src.exists():
        return
    for f in src.rglob("*"):
        if f.is_file() and "_candidates" not in f.parts:
            t = dst / f.relative_to(src)
            if not t.exists() or t.stat().st_mtime < f.stat().st_mtime:
                t.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(f, t)


def _brand_conf(ch: dict, spec: dict, key: str) -> dict | None:
    """Cấu hình intro/outro: channel.json > key, ghi đè bằng episode.json > key; `false` (hoặc enabled: false) = tắt."""
    conf = ch.get(key) or {}
    over = spec.get(key)
    if over is False:
        return None
    merged = {**conf, **(over if isinstance(over, dict) else {})}
    return None if merged.get("enabled") is False else merged


def _with_brand_scenes(spec: dict, ch: dict, meta: dict) -> list[dict]:
    """Chèn cảnh `intro` sau hook (mặc định sau cảnh 1) và `outro` ở cuối — trừ khi episode.json đã tự có cảnh loại đó."""
    scenes = [dict(sc) for sc in spec["scenes"]]
    types = {sc.get("type") for sc in scenes}
    name = ch.get("channel", "VOZ STORY")
    ep_no = re.sub(r"\D", "", meta.get("id", ""))[-2:] or None
    intro = _brand_conf(ch, spec, "intro")
    if intro and "intro" not in types:
        topic = (intro.get("topic") or "").strip()
        vo = (intro.get("vo") if topic else intro.get("vo_plain")) or ""
        vo = vo.format(channel=name, topic=topic).strip()
        words = topic.split()
        props = {
            "series": intro.get("series", (ch.get("series") or {}).get(meta.get("series", ""), "")),
            "topic": intro.get("label") or topic or meta.get("title", ""),
            "episodeNo": ep_no,
        }
        if topic and _fold(" ".join(words[:3])) in _fold(vo):
            props["topicCue"] = {"cue": " ".join(words[:3])}
        sc = {"id": "intro", "type": "intro", "vo": vo, "transition": intro.get("transition", "zoom"), "props": props}
        if intro.get("min_duration"):
            sc["min_duration"] = intro["min_duration"]
        scenes.insert(min(int(intro.get("after", 1)), len(scenes)), sc)
    outro = _brand_conf(ch, spec, "outro")
    if outro and "outro" not in types:
        last = scenes[-1] if scenes else {}
        has_ab = last.get("type") == "question" and len((last.get("props") or {}).get("options") or []) >= 2
        comment = outro.get("comment") or (outro.get("comment_ab") if has_ab else None) or "Bình luận ý kiến của bạn"
        cues = {k: {"cue": v} for k, v in (outro.get("cues") or {}).items() if v}
        props = {
            "name": name, "handle": ch.get("handle", ""), "comment": comment,
            "cta": outro.get("cta", "Theo dõi"), "ctaDone": outro.get("cta_done", "Đã theo dõi"),
            "tagline": ch.get("tagline") if outro.get("tagline", True) else None, "cues": cues,
        }
        vo = (outro.get("vo_ab") if has_ab else None) or outro.get("vo", "")
        sc = {"id": "outro", "type": "outro", "vo": vo.format(channel=name).strip(),
              "transition": outro.get("transition", "sheet"), "props": props, "min_duration": outro.get("min_duration", 4.5)}
        scenes.append(sc)
        for s in scenes:  # dòng "Theo dõi để xem tập tiếp theo" nhỏ của cảnh question là thừa khi đã có outro
            if s.get("type") == "question":
                s["props"] = {**(s.get("props") or {}), "endCard": False}
    return scenes


def build(ep_dir: Path, force_tts: bool = False, verify: bool = False) -> dict:
    ch = config.channel()
    fps = ch.get("fps", 30)
    spec = config.load_json(ep_dir / "episode.json")
    if not spec:
        raise SystemExit(f"Thiếu {ep_dir / 'episode.json'}")
    meta = config.load_json(ep_dir / "meta.json", {})
    fmt = format_of(ep_dir)
    fc = config.fmt_conf(fmt)
    build_dir = ep_dir / "build"
    voice = spec.get("voice") or ch.get("voice")
    speed = spec.get("speed") or ch.get("speed")
    cw = spec.get("caption_words") or ch.get("caption_words", 5)
    pad = spec.get("pad", ch.get("scene_pad_seconds", 0.35))

    scenes, rows, warns = [], [], []
    seen = set()
    for i, sc in enumerate(_with_brand_scenes(spec, ch, meta)):
        sid = sc.get("id") or f"s{i + 1:02d}"
        if sid in seen:
            raise SystemExit(f"Trùng id cảnh: {sid}")
        seen.add(sid)
        if sc["type"] not in SCENE_TYPES:
            warns.append(f"{sid}: loại cảnh lạ '{sc['type']}' (có: {', '.join(sorted(SCENE_TYPES))})")
        props = sc.get("props", {})
        if sc.get("transition") and sc["transition"] not in TRANSITIONS:
            warns.append(f"{sid}: chuyển cảnh lạ '{sc['transition']}' (có: {', '.join(sorted(TRANSITIONS))})")
        tone = props.get("tone") or props.get("bg")
        if tone and tone not in TONES:
            warns.append(f"{sid}: nền lạ '{tone}' (có: {', '.join(sorted(TONES))})")
        fw = []
        _check_files(props, ep_dir, fw)
        warns += [f"{sid}: {w}" for w in fw]
        audio, captions, dur_ms = None, [], None
        vo = (sc.get("vo") or "").strip()
        if vo:
            mp3 = build_dir / "audio" / f"{sid}.mp3"
            cache_f = build_dir / "tts" / f"{sid}.json"
            key = tts.cache_key(vo, voice, speed, cw)
            cached = config.load_json(cache_f)
            if not force_tts and cached and cached.get("key") == key and mp3.exists():
                res = cached
            else:
                print(f"  TTS {sid} …", flush=True)
                res = tts.synthesize(vo, mp3, voice=voice, speed=speed, caption_words=cw, verify=verify)
                res["key"] = key
                config.save_json(cache_f, res)
            audio = f"audio/{sid}.mp3"
            captions = res["captions"]
            dur_ms = res["duration_ms"]
            sw = []
            _resolve_cues(props, captions, sw)
            warns += [f"{sid}: {w}" for w in sw]
        seconds = (dur_ms / 1000 + sc.get("pad", pad)) if dur_ms else float(sc.get("duration", 2.5))
        seconds = max(seconds, float(sc.get("min_duration", 0)))
        frames = math.ceil(seconds * fps)
        scenes.append({
            "id": sid, "type": sc["type"], "durationInFrames": frames, "audio": audio, "captions": captions,
            "source": sc.get("source"), "illustrative": bool(sc.get("illustrative")), "transition": sc.get("transition"),
            "props": props,
        })
        rows.append((sid, sc["type"], frames / fps, len(vo.split())))

    _sync_tree(ep_dir / "assets", build_dir / "assets")
    music = spec.get("music", ch.get("music"))  # "music": null trong episode.json = tắt nhạc
    if music:
        src = (config.ROOT / music) if not Path(music).is_absolute() else Path(music)
        if not src.exists():
            raise SystemExit(f"Không thấy nhạc nền {src}")
        (build_dir / "music").mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, build_dir / "music" / src.name)
        music = f"music/{src.name}"

    brand = {"name": ch.get("channel", "VOZ STORY"), "handle": ch.get("handle", "")}
    props = {
        "id": meta.get("id", ep_dir.name), "title": meta.get("title", ""), "format": fmt, "brand": brand,
        "music": music, "musicVolume": spec.get("music_volume", ch.get("music_volume", 0.08)),
        "showCaptions": spec.get("captions", fc["captions"]), "showWatermark": spec.get("watermark", True),
        "tone": spec.get("tone") or ch.get("tone"), "sfx": spec.get("sfx", ch.get("sfx", True)),
        "sfxVolume": spec.get("sfx_volume", ch.get("sfx_volume", 1.0)), "grain": spec.get("grain", ch.get("grain", 1.0)),
        "scenes": scenes,
    }
    config.save_json(build_dir / "props.json", props)
    cover = dict(spec.get("cover") or {"text": meta.get("title", "")})
    cover.setdefault("brand", brand)
    cover.setdefault("format", fmt)
    cover.setdefault("tone", spec.get("tone") or ch.get("tone"))
    cover.setdefault("episodeNo", re.sub(r"\D", "", meta.get("id", ""))[-2:] or None)
    config.save_json(build_dir / "cover.json", cover)

    total = sum(r[2] for r in rows)
    print(f"\n{'cảnh':<6}{'loại':<11}{'giây':>6}  {'từ':>4}")
    for sid, typ, sec, words in rows:
        print(f"{sid:<6}{typ:<11}{sec:>6.1f}  {words:>4}")
    lo, hi = fc["target_seconds"]
    flag = "" if lo <= total <= hi else f"  ⚠ ngoài khoảng mục tiêu {lo}–{hi}s ({fmt})"
    print(f"TỔNG  {total:.1f}s  · định dạng {fmt}{flag}")
    for w in warns:
        print("  ⚠", w)
    return {"props": props, "total_seconds": total, "warnings": warns, "format": fmt}
