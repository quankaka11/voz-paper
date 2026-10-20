"""CLI VOZ STORY.  python voz.py <lệnh> --help"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from . import assets, config, episode, render, status, tts


def _out_name(ep_dir: Path) -> str:
    return ep_dir.name  # VOZ-001_slug — tên file xuất trùng tên thư mục tập


def cmd_health(a):
    print("ZipVoice:", tts.health())
    print("ffmpeg  :", config.tool("ffmpeg"))
    print("studio  :", "OK" if (config.STUDIO / "node_modules").exists() else "chưa npm install")


def cmd_say(a):
    if a.dry:
        for s in tts.preview_read(a.text):
            print(f"{s['text']}\n  đọc: {s['read']}")
        return
    out = Path(a.out or (config.ROOT / "build" / "say.mp3"))
    r = tts.synthesize(a.text, out, voice=a.voice, speed=a.speed)
    print(f"→ {out}  ({r['duration_ms'] / 1000:.1f}s, giọng {r['voice']}, speed {r['speed']})")


def cmd_build(a):
    episode.build(episode.find(a.ep), force_tts=a.force_tts, verify=a.verify)


def cmd_render(a):
    ep = episode.find(a.ep)
    episode.build(ep, force_tts=a.force_tts)
    b = ep / "build"
    name = _out_name(ep)
    out = b / "draft.mp4" if a.draft else ep / "export" / f"{name}.mp4"
    out.unlink(missing_ok=True)  # render hỏng giữa chừng thì không để lại video cũ trông như bản mới
    render.remotion_render(b / "props.json", b, out, scale=0.5 if a.draft else 1.0)
    render.loudnorm(out)
    if not a.draft:
        render.remotion_still("Cover", b / "cover.json", b, ep / "export" / f"{name}_cover.png")
    sh = render.sheet(out, b / "sheet.jpg")
    print(f"→ video: {out}\n→ contact sheet: {sh}")
    problems = render.check(out) if not a.draft else []
    for p in problems:
        print("  ✗", p)
    if not a.draft and not problems:
        print("  ✓ đạt kiểm tra kỹ thuật")
    if not a.draft and ep.parent == config.VIDEOS:
        status.mark_rendered(ep, float(render.probe(out)["format"]["duration"]))
        status.publish_kit(ep)  # mỗi bản cuối luôn kèm gói đăng: ảnh bìa + tiêu đề/mô tả/caption/bình luận ghim


def cmd_cover(a):
    ep = episode.find(a.ep)
    episode.build(ep)
    out = ep / "export" / f"{_out_name(ep)}_cover.png"
    render.remotion_still("Cover", ep / "build" / "cover.json", ep / "build", out)
    print(f"→ {out}")


def cmd_check(a):
    ep = episode.find(a.ep)
    mp4 = ep / "export" / f"{_out_name(ep)}.mp4"
    problems = render.check(mp4)
    print("\n".join(f"  ✗ {p}" for p in problems) or "  ✓ đạt kiểm tra kỹ thuật")


def cmd_sheet(a):
    mp4 = Path(a.video)
    print("→", render.sheet(mp4, mp4.with_name(mp4.stem + "_sheet.jpg"), n=a.n))


def cmd_img(a):
    ep = episode.find(a.ep)
    if a.img_cmd == "search":
        assets.search(ep, a.query, a.source, a.n)
    elif a.img_cmd == "pick":
        assets.pick(ep, a.key, a.name)
    elif a.img_cmd == "cutout":
        assets.cutout(ep, a.file, a.model)


def cmd_brand(a):
    for comp, f in [("LogoMark", "voz-logo-mark.png"), ("LogoFull", "voz-logo-full.png"), ("LogoFullDark", "voz-logo-full-dark.png")]:
        render.remotion_still(comp, None, None, config.BRAND / f)
    print(f"→ {config.BRAND}")


def cmd_new(a):
    status.new(a.title, a.slug, a.series, a.topic)


def cmd_status(a):
    if a.ep:
        ep = episode.find(a.ep)
        if a.stage:
            status.set_stage(ep, a.stage, a.force)
        m = status.load(ep)
        print(f"{m['id']} · {m['title']}")
        print(f"  trạng thái: {status.STAGE_VI[m['stage']]}  ·  thư mục: {ep.relative_to(config.ROOT)}")
        for p in status.PLATFORMS:
            x = m["platforms"][p]
            print(f"  {p:<8} {status.POST_VI[x['status']]:<12} {x.get('url') or ''}")
        for h in m.get("history", [])[-5:]:
            print(f"    {h['at']}  {h['event']}")
    else:
        status.write_index()
        status.print_table()
        print(f"\n→ {config.VIDEOS / 'INDEX.md'}")


def cmd_post(a):
    status.post(episode.find(a.ep), a.platform, a.status, a.url, a.at)


def cmd_metrics(a):
    vals = {k: getattr(a, k) for k in status.METRIC_KEYS}
    status.add_metrics(episode.find(a.ep), a.platform, vals)


def cmd_publish_kit(a):
    status.publish_kit(episode.find(a.ep))


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="voz", description="Công cụ sản xuất video VOZ STORY")
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("health", help="kiểm tra server TTS, ffmpeg, studio").set_defaults(fn=cmd_health)

    s = sub.add_parser("say", help="đọc thử 1 câu (nghe giọng / kiểm phát âm)")
    s.add_argument("text")
    s.add_argument("--voice")
    s.add_argument("--speed", type=float)
    s.add_argument("--out")
    s.add_argument("--dry", action="store_true", help="chỉ xem server sẽ đọc thế nào, không tạo audio")
    s.set_defaults(fn=cmd_say)

    s = sub.add_parser("build", help="tạo giọng đọc từng cảnh + build/props.json")
    s.add_argument("ep")
    s.add_argument("--force-tts", action="store_true")
    s.add_argument("--verify", action="store_true", help="ASR tự kiểm câu đọc sai (chậm hơn)")
    s.set_defaults(fn=cmd_build)

    s = sub.add_parser("render", help="build + render video + ảnh bìa + kiểm tra")
    s.add_argument("ep")
    s.add_argument("--draft", action="store_true", help="bản nháp 540p nhanh, lưu ở build/draft.mp4")
    s.add_argument("--force-tts", action="store_true")
    s.set_defaults(fn=cmd_render)

    s = sub.add_parser("cover", help="chỉ render ảnh bìa 9:16")
    s.add_argument("ep")
    s.set_defaults(fn=cmd_cover)

    s = sub.add_parser("check", help="kiểm tra kỹ thuật file export")
    s.add_argument("ep")
    s.set_defaults(fn=cmd_check)

    s = sub.add_parser("sheet", help="contact sheet từ 1 file video bất kỳ")
    s.add_argument("video")
    s.add_argument("-n", type=int, default=12)
    s.set_defaults(fn=cmd_sheet)

    s = sub.add_parser("img", help="tìm / chọn / tách nền ảnh")
    isub = s.add_subparsers(dest="img_cmd", required=True)
    i = isub.add_parser("search")
    i.add_argument("ep")
    i.add_argument("query")
    i.add_argument("--source", choices=list(assets.SOURCES), default="wikimedia")
    i.add_argument("-n", type=int, default=8)
    i = isub.add_parser("pick")
    i.add_argument("ep")
    i.add_argument("key")
    i.add_argument("--as", dest="name", required=True)
    i = isub.add_parser("cutout")
    i.add_argument("ep")
    i.add_argument("file", help="đường dẫn trong thư mục tập, vd assets/nha.jpg")
    i.add_argument("--model", default="isnet-general-use")
    s.set_defaults(fn=cmd_img)

    sub.add_parser("brand", help="xuất lại logo PNG vào brand/").set_defaults(fn=cmd_brand)

    s = sub.add_parser("new", help="tạo tập mới videos/VOZ-xxx_slug/ từ mẫu")
    s.add_argument("title")
    s.add_argument("--slug", help="mặc định sinh từ tiêu đề (không dấu)")
    s.add_argument("--series", choices=list(config.channel().get("series", {})))
    s.add_argument("--topic", help="số thứ tự chủ đề trong data/topics.md")
    s.set_defaults(fn=cmd_new)

    s = sub.add_parser("status", help="bảng mọi tập (+ cập nhật videos/INDEX.md) hoặc xem/đổi trạng thái 1 tập")
    s.add_argument("ep", nargs="?")
    s.add_argument("--stage", choices=status.STAGES)
    s.add_argument("--force", action="store_true", help="cho phép lùi trạng thái")
    s.set_defaults(fn=cmd_status)

    s = sub.add_parser("post", help="ghi trạng thái đăng trên YouTube/TikTok")
    s.add_argument("ep")
    s.add_argument("platform", choices=status.PLATFORMS)
    s.add_argument("--status", choices=status.POST_STATUS, default="posted")
    s.add_argument("--url")
    s.add_argument("--at", help="thời điểm đăng/hẹn giờ, vd 2026-10-20T19:00")
    s.set_defaults(fn=cmd_post)

    s = sub.add_parser("metrics", help="ghi số liệu hiệu quả (nên ghi sau 48h và 7 ngày)")
    s.add_argument("ep")
    s.add_argument("platform", choices=status.PLATFORMS)
    for k in status.METRIC_KEYS:
        s.add_argument(f"--{k.replace('_', '-')}", dest=k, type=float)
    s.set_defaults(fn=cmd_metrics)

    s = sub.add_parser("publish-kit", help="tạo export/publish.md: tiêu đề, mô tả, hashtag, nguồn")
    s.add_argument("ep")
    s.set_defaults(fn=cmd_publish_kit)
    return p


def main(argv=None):
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")
        except AttributeError:
            pass
    a = build_parser().parse_args(argv)
    a.fn(a)
