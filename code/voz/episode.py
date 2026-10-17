"""Đọc episode.json, tạo giọng đọc theo từng cảnh, căn thời lượng và xuất build/props.json cho Remotion."""
from __future__ import annotations

import math
import re
import shutil
import unicodedata
from pathlib import Path

from . import config, tts

SCENE_TYPES = {"title", "bigNumber", "list", "question", "receipt", "bars", "compare", "flow", "image", "phone"}


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
    if isinstance(node, dict):
        if "cue" in node and "atMs" not in node:
            ms = _cue_ms(str(node["cue"]), captions)
            if ms is None:
                warn.append(f"không thấy cue '{node['cue']}' trong lời đọc")
            else:
                node["atMs"] = ms
        for v in node.values():
            _resolve_cues(v, captions, warn)
    elif isinstance(node, list):
        for v in node:
            _resolve_cues(v, captions, warn)


def _sync_tree(src: Path, dst: Path):
    if not src.exists():
        return
    for f in src.rglob("*"):
        if f.is_file() and "_candidates" not in f.parts:
            t = dst / f.relative_to(src)
            if not t.exists() or t.stat().st_mtime < f.stat().st_mtime:
                t.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(f, t)


def build(ep_dir: Path, force_tts: bool = False, verify: bool = False) -> dict:
    ch = config.channel()
    fps = ch.get("fps", 30)
    spec = config.load_json(ep_dir / "episode.json")
    if not spec:
        raise SystemExit(f"Thiếu {ep_dir / 'episode.json'}")
    meta = config.load_json(ep_dir / "meta.json", {})
    build_dir = ep_dir / "build"
    voice = spec.get("voice") or ch.get("voice")
    speed = spec.get("speed") or ch.get("speed")
    cw = spec.get("caption_words") or ch.get("caption_words", 5)
    pad = spec.get("pad", ch.get("scene_pad_seconds", 0.35))

    scenes, rows, warns = [], [], []
    seen = set()
    for i, sc in enumerate(spec["scenes"]):
        sid = sc.get("id") or f"s{i + 1:02d}"
        if sid in seen:
            raise SystemExit(f"Trùng id cảnh: {sid}")
        seen.add(sid)
        if sc["type"] not in SCENE_TYPES:
            warns.append(f"{sid}: loại cảnh lạ '{sc['type']}' (có: {', '.join(sorted(SCENE_TYPES))})")
        props = sc.get("props", {})
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
            "source": sc.get("source"), "illustrative": bool(sc.get("illustrative")), "props": props,
        })
        rows.append((sid, sc["type"], frames / fps, len(vo.split())))

    _sync_tree(ep_dir / "assets", build_dir / "assets")
    music = spec.get("music")
    if music:
        src = (config.ROOT / music) if not Path(music).is_absolute() else Path(music)
        if not src.exists():
            raise SystemExit(f"Không thấy nhạc nền {src}")
        (build_dir / "music").mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, build_dir / "music" / src.name)
        music = f"music/{src.name}"

    brand = {"name": ch.get("channel", "VOZ STORY"), "handle": ch.get("handle", "")}
    props = {
        "id": meta.get("id", ep_dir.name), "title": meta.get("title", ""), "brand": brand,
        "music": music, "musicVolume": spec.get("music_volume", ch.get("music_volume", 0.08)),
        "showCaptions": spec.get("captions", True), "showWatermark": spec.get("watermark", True), "scenes": scenes,
    }
    config.save_json(build_dir / "props.json", props)
    cover = dict(spec.get("cover") or {"text": meta.get("title", "")})
    cover.setdefault("brand", brand)
    cover.setdefault("episodeNo", re.sub(r"\D", "", meta.get("id", ""))[-2:] or None)
    config.save_json(build_dir / "cover.json", cover)

    total = sum(r[2] for r in rows)
    print(f"\n{'cảnh':<6}{'loại':<11}{'giây':>6}  {'từ':>4}")
    for sid, typ, sec, words in rows:
        print(f"{sid:<6}{typ:<11}{sec:>6.1f}  {words:>4}")
    lo, hi = ch.get("target_seconds", [45, 60])
    flag = "" if lo <= total <= hi else f"  ⚠ ngoài khoảng mục tiêu {lo}–{hi}s"
    print(f"TỔNG  {total:.1f}s{flag}")
    for w in warns:
        print("  ⚠", w)
    return {"props": props, "total_seconds": total, "warnings": warns}
