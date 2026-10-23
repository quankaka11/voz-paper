"""Gọi Remotion để render video/ảnh bìa, chuẩn hóa âm lượng, kiểm tra kỹ thuật và tạo contact sheet."""
from __future__ import annotations

import hashlib
import json
from fractions import Fraction
import re
import shutil
import subprocess
from pathlib import Path

from . import config

LUFS_TARGET = -14.0  # mức to phổ biến cho YouTube/TikTok (YouTube chuẩn hóa về khoảng -14)


def _run(cmd: list[str], cwd: Path | None = None) -> None:
    print("  $", " ".join(f'"{c}"' if " " in c else c for c in cmd), flush=True)
    r = subprocess.run(cmd, cwd=cwd)
    if r.returncode != 0:
        raise SystemExit(f"Lệnh lỗi (exit {r.returncode})")


def remotion_render(props: Path, public_dir: Path, out: Path, scale: float = 1.0, comp: str = "Episode", concurrency: int | None = None) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    cmd = [config.npx(), "remotion", "render", "src/index.ts", comp, str(out),
           f"--props={props}", f"--public-dir={public_dir}", "--log=warn"]
    cmd += [f"--scale={scale}", "--crf=28"] if scale != 1.0 else ["--crf=18"]
    if concurrency:
        cmd.append(f"--concurrency={concurrency}")
    _run(cmd, cwd=config.STUDIO)


SEG_FRAMES = 3600  # 2 phút/đoạn ở 30fps


def _signature(props: Path, public_dir: Path, scale: float) -> str:
    """Dấu vân tay của lần render: nội dung props + tên/kích thước file trong assets/audio/music + scale.
    Không dùng thời điểm sửa file: đổi nhánh git (mỗi tập một nhánh) ghi lại file ảnh làm đổi mtime → mất các đoạn đã render."""
    h = hashlib.sha1(props.read_bytes() + f"|{scale}".encode())
    for sub in ("assets", "audio", "music"):
        d = public_dir / sub
        if d.exists():
            for f in sorted(x for x in d.rglob("*") if x.is_file()):
                h.update(f"{f.relative_to(public_dir).as_posix()}:{f.stat().st_size}|".encode())
    return h.hexdigest()[:12]


def remotion_render_parts(props: Path, public_dir: Path, out: Path, scale: float = 1.0, seg_frames: int = SEG_FRAMES,
                          concurrency: int | None = None) -> None:
    """Render video dài theo đoạn: bundle một lần → mỗi đoạn `seg_frames` frame một file (không tiếng) → âm thanh
    render riêng một lượt → nối bằng ffmpeg (không mã hóa lại hình). Đoạn đã xong được giữ lại: render hỏng giữa
    chừng thì chạy lại lệnh sẽ tiếp từ đoạn dở. Tập ngắn (≤ 1,5 đoạn) render một lượt như cũ."""
    props, public_dir, out = props.resolve(), public_dir.resolve(), out.resolve()  # remotion chạy ở thư mục studio
    total = sum(s["durationInFrames"] for s in (config.load_json(props, {}) or {}).get("scenes", []))
    if total <= seg_frames * 1.5:
        remotion_render(props, public_dir, out, scale, concurrency=concurrency)
        return
    # thư mục tạm ngoài public dir (không bị bundle sao chép) và ngoài export/ (không lọt vào git)
    work = config.ROOT / "build" / "render" / f"{public_dir.parent.name}_{out.stem}"
    sig = _signature(props, public_dir, scale)
    if (config.load_json(work / "manifest.json", {}) or {}).get("sig") != sig:
        shutil.rmtree(work, ignore_errors=True)  # props/ảnh/giọng đã đổi → các đoạn cũ không còn đúng
        work.mkdir(parents=True)
        config.save_json(work / "manifest.json", {"sig": sig, "frames": total, "seg_frames": seg_frames})
    bundle = work / "bundle"
    if not (bundle / "index.html").exists():
        _run([config.npx(), "remotion", "bundle", "src/index.ts", f"--out-dir={bundle}", f"--public-dir={public_dir}", "--log=warn"],
             cwd=config.STUDIO)
    common = [f"--props={props}", "--log=warn"] + ([f"--scale={scale}", "--crf=28"] if scale != 1.0 else ["--crf=18"])
    if concurrency:  # máy ít RAM: bản cuối 1080p với 6 luồng có thể làm hết bộ nhớ
        common.append(f"--concurrency={concurrency}")
    ranges = [(a, min(a + seg_frames, total) - 1) for a in range(0, total, seg_frames)]
    parts = []
    for i, (a, b) in enumerate(ranges):
        part = work / f"part_{i:02d}.mp4"
        parts.append(part)
        if part.exists():
            print(f"  đoạn {i + 1}/{len(ranges)} (frame {a}–{b}) đã có, bỏ qua", flush=True)
            continue
        print(f"  đoạn {i + 1}/{len(ranges)} (frame {a}–{b})", flush=True)
        tmp = work / f"part_{i:02d}.partial.mp4"
        _run([config.npx(), "remotion", "render", str(bundle), "Episode", str(tmp), f"--frames={a}-{b}", "--muted", *common],
             cwd=config.STUDIO)
        tmp.replace(part)
    audio = work / "audio.wav"
    if not audio.exists():
        print("  âm thanh (một lượt)", flush=True)
        tmp = work / "audio.partial.wav"
        _run([config.npx(), "remotion", "render", str(bundle), "Episode", str(tmp), "--codec=wav", f"--props={props}", "--log=warn"],
             cwd=config.STUDIO)
        tmp.replace(audio)
    lst = work / "parts.txt"
    lst.write_text("".join(f"file '{p.name}'\n" for p in parts), encoding="utf-8")
    out.parent.mkdir(parents=True, exist_ok=True)
    _run([config.tool("ffmpeg"), "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-i", str(audio),
          "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", str(out)])
    shutil.rmtree(work, ignore_errors=True)


def write_srt(props: Path, out: Path) -> Path | None:
    """Phụ đề .srt từ timing giọng đọc (cùng cụm chữ với phụ đề trong hình) — tải lên YouTube làm phụ đề CC tiếng Việt."""
    p = config.load_json(props, {}) or {}
    fps = config.channel().get("fps", 30)
    ts = lambda ms: f"{int(ms // 3600000):02d}:{int(ms // 60000) % 60:02d}:{int(ms // 1000) % 60:02d},{int(ms % 1000):03d}"
    rows, start = [], 0
    for sc in p.get("scenes", []):
        off = start * 1000 / fps
        caps = sc.get("captions") or []
        for i, c in enumerate(caps):
            end = min(c["endMs"] + 300, caps[i + 1]["startMs"]) if i + 1 < len(caps) else c["endMs"] + 300
            rows.append((off + c["startMs"], off + end, re.sub(r"==|\*\*", "", c["text"])))
        start += sc["durationInFrames"]
    if not rows:
        return None
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(f"{i}\n{ts(a)} --> {ts(b)}\n{t}\n" for i, (a, b, t) in enumerate(rows, 1)), encoding="utf-8")
    return out


def thumbnail_jpg(png: Path, limit_mb: float = 2.0) -> Path:
    """YouTube nhận thumbnail ≤ 2MB: PNG quá giới hạn thì lưu thêm bản JPG cùng tên (giảm chất lượng tới khi vừa)."""
    if png.stat().st_size <= limit_mb * 1e6:
        return png
    from PIL import Image

    jpg = png.with_suffix(".jpg")
    im = Image.open(png).convert("RGB")
    for q in (92, 88, 84, 80, 75):
        im.save(jpg, quality=q, optimize=True)
        if jpg.stat().st_size <= limit_mb * 1e6:
            break
    return jpg


def cover_stills(build: Path, export: Path, name: str) -> list[Path]:
    """Ảnh bìa chính (build/cover.json → <tên>_cover.png) + mọi phương án (build/covers/<id>.json → <tên>_cover_<id>.png).
    Bundle một lần cho tất cả; ảnh > 2MB tự có thêm bản JPG."""
    jobs = [(build / "cover.json", export / f"{name}_cover.png")]
    jobs += [(f, export / f"{name}_cover_{f.stem}.png") for f in sorted((build / "covers").glob("*.json"))]
    for old in export.glob(f"{name}_cover_*.*"):  # phương án đã bỏ khỏi episode.json thì xoá ảnh cũ
        old.unlink()
    if len(jobs) == 1:
        remotion_still("Cover", jobs[0][0], build, jobs[0][1])
        return [thumbnail_jpg(jobs[0][1])]
    bundle = config.ROOT / "build" / "render" / f"{build.parent.name}_covers"
    shutil.rmtree(bundle, ignore_errors=True)
    _run([config.npx(), "remotion", "bundle", "src/index.ts", f"--out-dir={bundle}", f"--public-dir={build.resolve()}", "--log=warn"],
         cwd=config.STUDIO)
    outs = []
    for props, out in jobs:
        out.parent.mkdir(parents=True, exist_ok=True)
        _run([config.npx(), "remotion", "still", str(bundle), "Cover", str(out.resolve()), f"--props={props.resolve()}", "--log=warn"],
             cwd=config.STUDIO)
        outs.append(thumbnail_jpg(out))
    shutil.rmtree(bundle, ignore_errors=True)
    return outs


def remotion_still(comp: str, props: Path | None, public_dir: Path | None, out: Path, frame: int = 0) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    cmd = [config.npx(), "remotion", "still", "src/index.ts", comp, str(out), f"--frame={frame}", "--log=warn"]
    if props:
        cmd.append(f"--props={props}")
    if public_dir:
        cmd.append(f"--public-dir={public_dir}")
    _run(cmd, cwd=config.STUDIO)


def loudnorm(mp4: Path) -> None:
    """Chuẩn hóa âm lượng về -14 LUFS, giữ nguyên luồng hình."""
    tmp = mp4.with_suffix(".norm.mp4")
    _run([config.tool("ffmpeg"), "-y", "-loglevel", "error", "-i", str(mp4), "-c:v", "copy",
          "-af", f"loudnorm=I={LUFS_TARGET}:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
          "-movflags", "+faststart", str(tmp)])
    tmp.replace(mp4)


def probe(mp4: Path) -> dict:
    out = subprocess.run([config.tool("ffprobe"), "-v", "error", "-show_streams", "-show_format", "-of", "json", str(mp4)],
                         capture_output=True, text=True, encoding="utf-8")
    return json.loads(out.stdout or "{}")


def measure_lufs(mp4: Path) -> float | None:
    r = subprocess.run([config.tool("ffmpeg"), "-hide_banner", "-nostats", "-i", str(mp4), "-af", "ebur128", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)
    return float(m[-1]) if m else None


def check(mp4: Path, fmt: str = "short") -> list[str]:
    """Kiểm tra kỹ thuật theo định dạng (short: Shorts/TikTok · long: YouTube 16:9). Trả danh sách lỗi (rỗng = đạt)."""
    fc = config.fmt_conf(fmt)
    info = probe(mp4)
    v = next((s for s in info.get("streams", []) if s["codec_type"] == "video"), None)
    a = next((s for s in info.get("streams", []) if s["codec_type"] == "audio"), None)
    dur = float(info.get("format", {}).get("duration", 0))
    size_mb = mp4.stat().st_size / 1e6
    lufs = measure_lufs(mp4) if a else None
    problems = []
    print(f"  file     {mp4.name}  ({size_mb:.1f} MB)")
    if v:
        fps = float(Fraction(v.get("r_frame_rate", "0/1")))
        print(f"  hình     {v['width']}x{v['height']} {v['codec_name']} {fps:.0f}fps {v.get('pix_fmt')}")
        rw, rh = fc["resolution"]
        if (v["width"], v["height"]) != (rw, rh):
            problems.append(f"độ phân giải không phải {rw}x{rh} ({fmt})")
    else:
        problems.append("không có luồng hình")
    print(f"  thời lượng {dur:.1f}s")
    lo, hi = fc["target_seconds"]
    if dur > hi:
        problems.append(f"dài hơn {hi}s" + (" (Shorts/TikTok tối đa 3 phút)" if fmt == "short" else ""))
    if fmt == "long" and dur < lo:
        problems.append(f"ngắn hơn {lo}s — video dài dưới 8 phút không chèn được quảng cáo giữa video")
    if a:
        print(f"  âm thanh {a['codec_name']} {a.get('sample_rate')}Hz  loudness {lufs} LUFS")
        if lufs is not None and abs(lufs - LUFS_TARGET) > 2:
            problems.append(f"loudness {lufs} LUFS lệch mục tiêu {LUFS_TARGET}")
    else:
        problems.append("không có âm thanh")
    return problems


def scene_times(props: Path, at: float = 0.8) -> tuple[list[float], list[str]]:
    """Mốc chụp mỗi cảnh (giây) tại `at` thời lượng cảnh — lúc hầu hết lớp đã hiện — kèm nhãn "id · loại"."""
    p = config.load_json(props, {}) or {}
    fps = config.channel().get("fps", 30)
    times, labels, start = [], [], 0
    for sc in p.get("scenes", []):
        d = sc["durationInFrames"]
        times.append((start + d * at) / fps)
        labels.append(f"{sc['id']} · {sc['type']}")
        start += d
    return times, labels


def sheet(mp4: Path, out: Path, n: int = 12, width: int | None = None,
          times: list[float] | None = None, labels: list[str] | None = None) -> Path:
    """Contact sheet để duyệt bằng mắt: n khung chia đều, hoặc đúng các mốc `times` (vd mỗi cảnh một khung — scene_times).
    Khung ngang: ảnh rộng hơn, ít cột hơn."""
    from PIL import Image, ImageDraw

    info = probe(mp4)
    dur = float(info["format"]["duration"])
    v = next((s for s in info.get("streams", []) if s["codec_type"] == "video"), {})
    wide = v.get("width", 0) > v.get("height", 1)
    width = width or (400 if wide else 270)
    tmp = out.parent / "_frames"
    shutil.rmtree(tmp, ignore_errors=True)
    tmp.mkdir(parents=True)
    times = [min(t, dur - 0.05) for t in times] if times else [dur * (i + 0.5) / n for i in range(n)]
    for i, t in enumerate(times):
        subprocess.run([config.tool("ffmpeg"), "-y", "-loglevel", "error", "-ss", f"{t:.2f}", "-i", str(mp4),
                        "-frames:v", "1", "-vf", f"scale={width}:-1", str(tmp / f"{i:02d}.jpg")], check=True)
    ims = [Image.open(p) for p in sorted(tmp.glob("*.jpg"))]
    cols = min(4 if wide else 6, len(ims))
    rows = (len(ims) + cols - 1) // cols
    w, h = ims[0].size
    canvas = Image.new("RGB", (cols * w, rows * (h + 24)), "white")
    d = ImageDraw.Draw(canvas)
    for i, (im, t) in enumerate(zip(ims, times)):
        x, y = (i % cols) * w, (i // cols) * (h + 24)
        canvas.paste(im, (x, y + 24))
        stamp = f"{int(t // 60)}:{t % 60:04.1f}" if t >= 60 else f"{t:5.1f}s"
        d.text((x + 6, y + 4), f"{stamp}  {labels[i]}" if labels and i < len(labels) else stamp, fill="black")
    canvas.save(out, quality=85)
    shutil.rmtree(tmp, ignore_errors=True)
    return out
