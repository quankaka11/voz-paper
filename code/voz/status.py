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


def new(title: str, slug: str | None, series: str | None, topic: str | None, fmt: str = "short") -> Path:
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
            "{SERIES}": ch.get("series", {}).get(series or "", ""), "{FORMAT}": fmt}
    for name in ("research.md", "script.md", "episode.json"):
        text = (config.TEMPLATES / name).read_text(encoding="utf-8")
        for k, v in fill.items():
            text = text.replace(k, json.dumps(v, ensure_ascii=False)[1:-1] if name.endswith(".json") else v)
        (ep_dir / name).write_text(text, encoding="utf-8")
    config.save_json(ep_dir / "sources.json", [])
    meta = {
        "id": ep_id, "slug": slug, "title": title, "series": series, "format": fmt,
        "topic_ref": f"data/topics.md#{topic}" if topic else None,
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
            "Dài" if m.get("format") == "long" else "Short",
            STAGE_VI.get(m.get("stage", "idea"), m.get("stage")), _dur(m.get("duration_s")),
            POST_VI[m["platforms"]["youtube"]["status"]], POST_VI[m["platforms"]["tiktok"]["status"]],
            str(_latest(m, "youtube", "views") or "—"), str(_latest(m, "tiktok", "views") or "—"),
        ])
    return rows


HEAD = ["ID", "Tiêu đề", "Series", "Dạng", "Trạng thái", "Thời lượng", "YouTube", "TikTok", "View YT", "View TT"]


def _dur(sec) -> str:
    if not sec:
        return "—"
    return f"{int(sec // 60)}:{int(sec % 60):02d}" if sec >= 60 else f"{sec}s"


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


def _publish_warnings(pub: dict, title: str, tt_caption: str, fmt: str = "short", chapters: list | None = None) -> list[str]:
    """Kiểm nhanh gói đăng theo khuyến nghị nền tảng (độ dài tiêu đề, dòng đầu caption TikTok, số hashtag, chương)."""
    w = []
    tags = pub.get("hashtags") or []
    if not pub.get("description"):
        w.append("thiếu publish.description (mô tả YouTube)")
    if len(title) > 100:
        w.append(f"tiêu đề YouTube {len(title)} ký tự > 100")
    elif fmt == "short" and len(title) > 60:
        w.append(f"tiêu đề YouTube {len(title)} ký tự — trên 60 dễ bị cắt ở lưới Shorts")
    elif fmt == "long" and len(title) > 70:
        w.append(f"tiêu đề YouTube {len(title)} ký tự — trên ~70 bị cắt ở trang chủ/tìm kiếm")
    if not 3 <= len(tags) <= 5:
        w.append(f"{len(tags)} hashtag — nên 3–5")
    first = tt_caption.splitlines()[0] if tt_caption else ""
    if fmt == "short" and len(first) > 90:
        w.append(f"dòng đầu caption TikTok {len(first)} ký tự — chỉ ~80–90 ký tự đầu hiện trước nút 'thêm'")
    if not pub.get("pinned_comment"):
        w.append("thiếu publish.pinned_comment (bình luận ghim câu hỏi A/B)")
    if fmt == "long" and len(chapters or []) < 3:
        w.append("dưới 3 mốc chương — đánh dấu chương trong episode.json (cảnh `chapter` hoặc trường \"chapter\")")
    return w


# Khung trống trên màn hình kết thúc 16:9 — trùng END_SLOTS trong code/studio/src/scenes/BrandScenes.tsx
END_SLOTS = [{"x": 1000, "y": 150, "w": 800, "h": 450}, {"x": 1080, "y": 650, "w": 560, "h": 315}]


def _chapter_lines(ep_dir: Path) -> list[str]:
    """Dòng mốc chương cho mô tả YouTube ("0:00 Mở đầu") từ build/props.json; luôn bắt đầu bằng 0:00."""
    p = config.load_json(ep_dir / "build" / "props.json", {}) or {}
    fps = config.channel().get("fps", 30)
    chs = p.get("chapters") or []
    if not chs:
        return []
    marks = ([] if chs[0]["frame"] == 0 else [(0, "Mở đầu")]) + [(c["frame"], c["title"]) for c in chs]
    out = []
    for f, t in marks:
        s = int(f // fps)
        stamp = f"{s // 3600}:{s // 60 % 60:02d}:{s % 60:02d}" if s >= 3600 else f"{s // 60}:{s % 60:02d}"
        out.append(f"{stamp} {re.sub(r'==|[*][*]', '', t)}")
    return out


def publish_kit(ep_dir: Path) -> Path:
    """export/publish.md: ảnh bìa, tiêu đề, mô tả, caption, hashtag, bình luận ghim, nguồn, checklist cho từng nền tảng.
    Định dạng long: mô tả có mốc chương, phụ đề .srt, vị trí phần tử màn hình kết thúc; không #Shorts, không mục TikTok."""
    from .episode import format_of

    meta = load(ep_dir)
    fmt = format_of(ep_dir)
    pub = meta.get("publish", {})
    sources = config.load_json(ep_dir / "sources.json", [])
    tags = pub.get("hashtags") or []
    data_src = [s for s in sources if s.get("type") == "data"]
    img_src = [s for s in sources if s.get("type") == "image"]
    src_lines = [f"- {s.get('publisher') or s.get('title')}: {s.get('url')}" for s in data_src]
    src_lines += [f"- Ảnh: {s.get('title')} — {s.get('author') or 'không rõ'} ({s.get('license')}"
                  f"{'; đã chỉnh: ' + s['modified'] if s.get('modified') else ''}) {s.get('url')}" for s in img_src]
    # nhạc nền CC BY bắt buộc ghi công: lấy dòng credit từ brand/music/credits.json theo tên file trong episode.json
    music = (config.load_json(ep_dir / "episode.json", {}) or {}).get("music", config.channel().get("music"))
    files = [music] if isinstance(music, str) else [t.get("src") for t in (music or []) if t.get("src")]
    credits = config.load_json(config.ROOT / "brand" / "music" / "credits.json", {}) or {}
    music_lines = []
    for m in files:
        line = (credits.get(Path(m).name) or {}).get("credit")
        if line:
            music_lines.append(line)
        else:
            print(f"  ⚠ nhạc {m} chưa có dòng ghi công trong brand/music/credits.json")
    ch = config.channel()
    title = pub.get("title") or meta["title"]
    desc = pub.get("description", "").strip()
    name = ep_dir.name
    chapters = _chapter_lines(ep_dir) if fmt == "long" else []
    verb = "Đăng ký" if fmt == "long" else "Theo dõi"
    follow = f"🔔 {verb} {ch.get('channel', 'VOZ STORY')} ({ch.get('handle', '')}) — {ch.get('tagline', '')}".strip()
    credit_lines = [*src_lines, *(f"- Nhạc: {m}" for m in music_lines)]
    blocks = [
        desc,
        "\n".join(["Mục lục:", *chapters]) if chapters else "",
        follow,
        "\n".join(["Nguồn:", *credit_lines]) if credit_lines else "",
        " ".join((["#Shorts"] if fmt == "short" else []) + tags),
    ]
    yt_desc = "\n\n".join(b for b in blocks if b)
    tt_caption = "\n".join(filter(None, [pub.get("tiktok_caption") or title, " ".join(tags)]))
    if music_lines:
        tt_caption += "".join(f"\nNhạc: {m}" for m in music_lines)
    pinned = pub.get("pinned_comment", "").strip()
    warns = _publish_warnings(pub, title, tt_caption, fmt, chapters)
    dur = meta.get("duration_s")
    dur_txt = (f"{int(dur // 60)}:{int(dur % 60):02d}" if dur else "?") if fmt == "long" else f"{dur or '?'}s"
    cover = next((f"export/{name}_cover.{e}" for e in ("jpg", "png") if (ep_dir / "export" / f"{name}_cover.{e}").exists()),
                 f"export/{name}_cover.png")
    warn_md = "".join(f"- ⚠ {w}\n" for w in warns)
    after = f"""## Sau khi đăng
```
python voz.py post {meta['id']} youtube --url <link>
{"python voz.py post " + meta['id'] + " tiktok --url <link>" + chr(10) if fmt == "short" else ""}python voz.py metrics {meta['id']} youtube --views N --likes N --comments N --avg-view-pct N   # sau 48h và 7 ngày
```
"""
    if fmt == "long":
        pct = lambda sl: f"trái {sl['x'] / 19.2:.0f}%, trên {sl['y'] / 10.8:.0f}%, rộng {sl['w'] / 19.2:.0f}%"
        md = f"""# {meta['id']} — gói đăng bài (video dài 16:9)

- Video: `export/{name}.mp4` ({dur_txt})
- Ảnh thu nhỏ: `{cover}` (1280×720, ≤ 2MB)
- Phụ đề: `export/{name}.vi.srt` (tiếng Việt)
{warn_md}
## YouTube
**Tiêu đề** ({len(title)}/100 ký tự, nên ≤ 70):
```
{title}
```
**Mô tả:**
```
{yt_desc}
```
**Bình luận ghim:**
```
{pinned}
```
- [ ] Ảnh thu nhỏ: Tải lên `{cover}`
- [ ] Phụ đề: Phụ đề → Thêm ngôn ngữ **Tiếng Việt** → Tải tệp lên (có thời gian) → `{name}.vi.srt`
- [ ] Mốc chương: đã nằm trong mô tả (dòng đầu phải là 0:00, ≥ 3 chương, mỗi chương ≥ 10s)
- [ ] Màn hình kết thúc (20s cuối) — đặt phần tử chồng lên khung giấy trống trong video:
  - Video "Video gần đây nhất / Phù hợp nhất với người xem": {pct(END_SLOTS[0])}
  - Video hoặc Danh sách phát series: {pct(END_SLOTS[1])}
  - "Đăng ký": chồng lên logo tròn bên trái
- [ ] Thẻ (cards): 1–2 thẻ trỏ tới tập liên quan ở đoạn nhắc tới
- [ ] Danh sách phát series · Danh mục: **Giáo dục** · Ngôn ngữ video: Tiếng Việt
- [ ] "Altered or synthetic content": **Không** (collage/hoạt họa/giọng TTS không phải khai báo); **Có** nếu dùng ảnh AI dựng lại sự kiện thật trông như thật
- [ ] Shorts cắt từ tập này: mỗi Short gắn **Video liên quan** (Related video) trỏ về video này
- [ ] Ghim bình luận

{after}"""
    else:
        md = f"""# {meta['id']} — gói đăng bài

- Video: `export/{name}.mp4` ({dur_txt})
- Ảnh bìa (thumbnail): `{cover}` (1080×1920)
{warn_md}
## YouTube Shorts
**Tiêu đề** ({len(title)}/100 ký tự, nên ≤ 60):
```
{title}
```
**Mô tả:**
```
{yt_desc}
```
**Bình luận ghim:**
```
{pinned}
```
- [ ] Ảnh bìa: trong app YouTube (Tải lên → Chỉnh sửa ảnh thu nhỏ) chọn tải ảnh `_cover.png` nếu tài khoản có tùy chọn này; nếu chỉ cho chọn khung hình thì chọn khung rõ chữ nhất
- [ ] Thêm vào playlist series · [ ] "Altered or synthetic content": **Không** (animation/TTS không cần khai báo) · [ ] Ghim bình luận
- [ ] Nếu Short này cắt từ một video dài: gắn **Video liên quan** (Related video) trỏ về video dài

## TikTok
**Caption** (dòng đầu là hook — chỉ ~80–90 ký tự đầu hiện trước nút "thêm"):
```
{tt_caption}
```
**Bình luận ghim:**
```
{pinned}
```
- [ ] Ảnh bìa: "Chọn ảnh bìa" → **Tải lên** `_cover.png` (chữ đã nằm trong vùng 3:4 giữa ảnh nên lưới hồ sơ không cắt mất)
- [ ] Bật bình luận · [ ] Ghim bình luận câu hỏi A/B

{after}"""
    out = ep_dir / "export" / "publish.md"
    out.parent.mkdir(exist_ok=True)
    out.write_text(md, encoding="utf-8")
    print(f"→ {out.relative_to(config.ROOT)}")
    for w in warns:
        print("  ⚠", w)
    return out
