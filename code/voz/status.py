"""Quản lý tập: tạo thư mục chuẩn, trạng thái sản xuất, trạng thái đăng từng nền tảng, số liệu, bảng INDEX.md."""
from __future__ import annotations

import datetime as dt
import json
import re
import unicodedata
from pathlib import Path

from . import config

STAGES = ["idea", "researched", "scripted", "rendered", "approved", "published"]
STAGE_VI = {
    "idea": "Ý tưởng", "researched": "Đã nghiên cứu", "scripted": "Có kịch bản",
    "rendered": "Đã render", "approved": "Đã duyệt", "published": "Đã đăng",
}
PLATFORMS = ["youtube", "tiktok"]
POST_STATUS = ["not_posted", "scheduled", "posted", "removed"]
POST_VI = {"not_posted": "—", "scheduled": "⏰ hẹn giờ", "posted": "✅ đã đăng", "removed": "⛔ đã gỡ"}
METRIC_KEYS = ["views", "likes", "comments", "shares", "saves", "avg_view_pct", "subs_gained"]


def now() -> str:
    return dt.datetime.now().isoformat(timespec="minutes")


def slugify(s: str, max_len: int = 40) -> str:
    s = unicodedata.normalize("NFD", s.lower()).replace("đ", "d")
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:max_len].rstrip("-")


def episodes() -> list[Path]:
    prefix = config.channel().get("id_prefix", "VOZ")
    return sorted(d for d in config.VIDEOS.glob(f"{prefix}-*") if (d / "meta.json").exists())


def load(ep_dir: Path) -> dict:
    return config.load_json(ep_dir / "meta.json", {})


def save(ep_dir: Path, meta: dict, event: str | None = None) -> None:
    meta["updated"] = now()
    if event:
        meta.setdefault("history", []).append({"at": meta["updated"], "event": event})
    config.save_json(ep_dir / "meta.json", meta)
    write_index()


def new(title: str, slug: str | None, series: str | None, topic: str | None) -> Path:
    ch = config.channel()
    prefix = ch.get("id_prefix", "VOZ")
    nums = [int(m.group(1)) for d in config.VIDEOS.glob(f"{prefix}-*") if (m := re.match(rf"{prefix}-(\d+)", d.name))]
    ep_id = f"{prefix}-{(max(nums) + 1 if nums else 1):03d}"
    slug = slugify(slug or title)
    ep_dir = config.VIDEOS / f"{ep_id}_{slug}"
    if series and series not in ch.get("series", {}):
        raise SystemExit(f"Series lạ '{series}'. Có: {', '.join(ch.get('series', {}))}")
    for sub in ("assets", "export"):
        (ep_dir / sub).mkdir(parents=True, exist_ok=True)
    (ep_dir / "assets" / ".gitkeep").touch()
    (ep_dir / "export" / ".gitkeep").touch()
    fill = {"{ID}": ep_id, "{TITLE}": title, "{DATE}": dt.date.today().isoformat(),
            "{SERIES}": ch.get("series", {}).get(series or "", "")}
    for name in ("research.md", "script.md", "episode.json"):
        text = (config.TEMPLATES / name).read_text(encoding="utf-8")
        for k, v in fill.items():
            text = text.replace(k, json.dumps(v, ensure_ascii=False)[1:-1] if name.endswith(".json") else v)
        (ep_dir / name).write_text(text, encoding="utf-8")
    config.save_json(ep_dir / "sources.json", [])
    meta = {
        "id": ep_id, "slug": slug, "title": title, "series": series, "topic_ref": f"data/topics.md#{topic}" if topic else None,
        "stage": "idea", "created": now(), "updated": now(), "duration_s": None,
        "files": {"video": f"export/{ep_id}_{slug}.mp4", "cover": f"export/{ep_id}_{slug}_cover.png"},
        "publish": {"title": title, "description": "", "hashtags": []},
        "platforms": {p: {"status": "not_posted", "url": None, "posted_at": None, "metrics": []} for p in PLATFORMS},
        "history": [],
    }
    save(ep_dir, meta, "tạo tập")
    print(f"→ {ep_dir.relative_to(config.ROOT)}")
    return ep_dir


def set_stage(ep_dir: Path, stage: str, force: bool = False) -> None:
    meta = load(ep_dir)
    old = meta.get("stage", "idea")
    if not force and STAGES.index(stage) < STAGES.index(old):
        print(f"  (giữ '{old}' — muốn lùi về '{stage}' thì thêm --force)")
        return
    meta["stage"] = stage
    save(ep_dir, meta, f"stage: {old} → {stage}")
    print(f"  {meta['id']}: {STAGE_VI[old]} → {STAGE_VI[stage]}")


def mark_rendered(ep_dir: Path, duration_s: float) -> None:
    """Gọi sau khi render bản cuối."""
    meta = load(ep_dir)
    if not meta:
        return
    meta["duration_s"] = round(duration_s, 1)
    if STAGES.index(meta.get("stage", "idea")) < STAGES.index("rendered"):
        meta["stage"] = "rendered"
    save(ep_dir, meta, f"render bản cuối ({duration_s:.1f}s)")


def post(ep_dir: Path, platform: str, status: str, url: str | None, at: str | None) -> None:
    meta = load(ep_dir)
    p = meta["platforms"][platform]
    p["status"] = status
    if url:
        p["url"] = url
    if status in ("posted", "scheduled"):
        p["posted_at"] = at or now()
    if all(meta["platforms"][x]["status"] == "posted" for x in PLATFORMS) or (
        status == "posted" and STAGES.index(meta["stage"]) >= STAGES.index("approved")
    ):
        meta["stage"] = "published"
    save(ep_dir, meta, f"{platform}: {status}" + (f" {url}" if url else ""))
    print(f"  {meta['id']} {platform}: {POST_VI[status]}")


def add_metrics(ep_dir: Path, platform: str, values: dict) -> None:
    meta = load(ep_dir)
    snap = {"at": now(), **{k: (int(v) if float(v).is_integer() else v) for k, v in values.items() if v is not None}}
    meta["platforms"][platform].setdefault("metrics", []).append(snap)
    save(ep_dir, meta, f"số liệu {platform}")
    print(f"  {meta['id']} {platform}: {snap}")


def _latest(meta: dict, platform: str, key: str):
    m = meta["platforms"][platform].get("metrics") or []
    return m[-1].get(key) if m else None


def table() -> list[list[str]]:
    rows = []
    for d in episodes():
        m = load(d)
        rows.append([
            m["id"], m["title"][:48], config.channel().get("series", {}).get(m.get("series") or "", "")[:22],
            STAGE_VI.get(m.get("stage", "idea"), m.get("stage")), f"{m['duration_s']}s" if m.get("duration_s") else "—",
            POST_VI[m["platforms"]["youtube"]["status"]], POST_VI[m["platforms"]["tiktok"]["status"]],
            str(_latest(m, "youtube", "views") or "—"), str(_latest(m, "tiktok", "views") or "—"),
        ])
    return rows


HEAD = ["ID", "Tiêu đề", "Series", "Trạng thái", "Dài", "YouTube", "TikTok", "View YT", "View TT"]


def print_table() -> None:
    rows = table()
    if not rows:
        print("Chưa có tập nào. Tạo: python voz.py new \"Tiêu đề\" --series ai-tra-tien --topic 1")
        return
    w = [max(len(str(r[i])) for r in rows + [HEAD]) for i in range(len(HEAD))]
    for r in [HEAD] + rows:
        print("  ".join(str(c).ljust(w[i]) for i, c in enumerate(r)))


def write_index() -> None:
    """videos/INDEX.md — bảng tổng tự sinh, đừng sửa tay."""
    rows = table()
    lines = [
        "# Danh sách video VOZ STORY", "",
        f"> Tự sinh bởi `python voz.py status` lúc {now()}. Đừng sửa tay — sửa qua lệnh `voz.py`.", "",
        "| " + " | ".join(HEAD) + " |", "|" + "---|" * len(HEAD),
    ]
    for d, r in zip(episodes(), rows):
        r = list(r)
        r[1] = f"[{r[1]}]({d.name}/)"
        lines.append("| " + " | ".join(r) + " |")
    counts = {s: 0 for s in STAGES}
    for d in episodes():
        counts[load(d).get("stage", "idea")] += 1
    lines += ["", "**Tổng:** " + " · ".join(f"{STAGE_VI[s]}: {n}" for s, n in counts.items() if n), "",
              "Trạng thái sản xuất: " + " → ".join(STAGE_VI[s] for s in STAGES), ""]
    config.VIDEOS.mkdir(exist_ok=True)
    (config.VIDEOS / "INDEX.md").write_text("\n".join(lines), encoding="utf-8")


def publish_kit(ep_dir: Path) -> Path:
    """export/publish.md: tiêu đề, mô tả, hashtag, nguồn, checklist đăng cho từng nền tảng."""
    meta = load(ep_dir)
    pub = meta.get("publish", {})
    sources = config.load_json(ep_dir / "sources.json", [])
    tags = pub.get("hashtags") or []
    data_src = [s for s in sources if s.get("type") == "data"]
    img_src = [s for s in sources if s.get("type") == "image"]
    src_lines = [f"- {s.get('publisher') or s.get('title')}: {s.get('url')}" for s in data_src]
    src_lines += [f"- Ảnh: {s.get('title')} — {s.get('author') or 'không rõ'} ({s.get('license')}) {s.get('url')}" for s in img_src]
    desc = pub.get("description", "").strip()
    yt_desc = "\n".join(filter(None, [desc, "", "Nguồn:" if src_lines else "", *src_lines, "", " ".join(["#Shorts", *tags])]))
    tt_caption = " ".join(filter(None, [pub.get("tiktok_caption") or pub.get("title", meta["title"]), *tags]))
    name = ep_dir.name
    md = f"""# {meta['id']} — gói đăng bài

- Video: `export/{name}.mp4` ({meta.get('duration_s') or '?'}s)
- Ảnh bìa: `export/{name}_cover.png`

## YouTube Shorts
**Tiêu đề** (≤ 100 ký tự, hiện {len(pub.get('title', ''))}):
```
{pub.get('title', meta['title'])}
```
**Mô tả:**
```
{yt_desc}
```
- [ ] Chọn ảnh bìa (app YouTube) · [ ] Thêm vào playlist series · [ ] "Altered or synthetic content": **Không** (animation/TTS không cần khai báo)

## TikTok
**Caption:**
```
{tt_caption}
```
- [ ] Tải ảnh bìa · [ ] Bật bình luận · [ ] Ghim bình luận câu hỏi A/B

## Sau khi đăng
```
python voz.py post {meta['id']} youtube --url <link>
python voz.py post {meta['id']} tiktok --url <link>
python voz.py metrics {meta['id']} youtube --views N --likes N --comments N --avg-view-pct N   # sau 48h và 7 ngày
```
"""
    out = ep_dir / "export" / "publish.md"
    out.parent.mkdir(exist_ok=True)
    out.write_text(md, encoding="utf-8")
    print(f"→ {out.relative_to(config.ROOT)}")
    return out
