"""Gọi Remotion để render video/ảnh bìa, chuẩn hóa âm lượng, kiểm tra kỹ thuật và tạo contact sheet."""
from __future__ import annotations

import json
from fractions import Fraction
import re
import shutil
import subprocess
from pathlib import Path

from . import config

LUFS_TARGET = -14.0  # mức to phổ biến cho TikTok/Shorts


def _run(cmd: list[str], cwd: Path | None = None) -> None:
    print("  $", " ".join(f'"{c}"' if " " in c else c for c in cmd), flush=True)
    r = subprocess.run(cmd, cwd=cwd)
    if r.returncode != 0:
        raise SystemExit(f"Lệnh lỗi (exit {r.returncode})")


def remotion_render(props: Path, public_dir: Path, out: Path, scale: float = 1.0, comp: str = "Episode") -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    cmd = [config.npx(), "remotion", "render", "src/index.ts", comp, str(out),
           f"--props={props}", f"--public-dir={public_dir}", "--log=warn"]
    if scale != 1.0:
        cmd += [f"--scale={scale}", "--crf=28"]
    _run(cmd, cwd=config.STUDIO)


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


def check(mp4: Path) -> list[str]:
    """Kiểm tra kỹ thuật theo chuẩn Shorts/TikTok. Trả danh sách lỗi (rỗng = đạt)."""
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
        if (v["width"], v["height"]) != (1080, 1920):
            problems.append("độ phân giải không phải 1080x1920")
    else:
        problems.append("không có luồng hình")
    print(f"  thời lượng {dur:.1f}s")
    if dur > 60:
        problems.append("dài hơn 60s (Shorts tối đa 3 phút nhưng series nhắm 45–60s)")
    if a:
        print(f"  âm thanh {a['codec_name']} {a.get('sample_rate')}Hz  loudness {lufs} LUFS")
        if lufs is not None and abs(lufs - LUFS_TARGET) > 2:
            problems.append(f"loudness {lufs} LUFS lệch mục tiêu {LUFS_TARGET}")
    else:
        problems.append("không có âm thanh")
    return problems


def sheet(mp4: Path, out: Path, n: int = 12, width: int = 270) -> Path:
    """Contact sheet n khung chia đều để duyệt nhanh bằng mắt."""
    from PIL import Image, ImageDraw

    dur = float(probe(mp4)["format"]["duration"])
    tmp = out.parent / "_frames"
    shutil.rmtree(tmp, ignore_errors=True)
    tmp.mkdir(parents=True)
    times = [dur * (i + 0.5) / n for i in range(n)]
    for i, t in enumerate(times):
        subprocess.run([config.tool("ffmpeg"), "-y", "-loglevel", "error", "-ss", f"{t:.2f}", "-i", str(mp4),
                        "-frames:v", "1", "-vf", f"scale={width}:-1", str(tmp / f"{i:02d}.jpg")], check=True)
    ims = [Image.open(p) for p in sorted(tmp.glob("*.jpg"))]
    cols = min(6, len(ims))
    rows = (len(ims) + cols - 1) // cols
    w, h = ims[0].size
    canvas = Image.new("RGB", (cols * w, rows * (h + 24)), "white")
    d = ImageDraw.Draw(canvas)
    for i, (im, t) in enumerate(zip(ims, times)):
        x, y = (i % cols) * w, (i // cols) * (h + 24)
        canvas.paste(im, (x, y + 24))
        d.text((x + 6, y + 4), f"{t:5.1f}s", fill="black")
    canvas.save(out, quality=85)
    shutil.rmtree(tmp, ignore_errors=True)
    return out
