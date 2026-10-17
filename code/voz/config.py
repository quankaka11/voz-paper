"""Đường dẫn, cấu hình kênh, biến môi trường và vị trí công cụ ngoài (ffmpeg, npx)."""
from __future__ import annotations

import glob
import json
import os
import shutil
import sys
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CODE = ROOT / "code"
STUDIO = CODE / "studio"
VIDEOS = ROOT / "videos"
BRAND = ROOT / "brand"
CONFIG = ROOT / "config"
TEMPLATES = CODE / "voz" / "templates"


def load_json(p: Path, default=None):
    if not p.exists():
        return default
    return json.loads(p.read_text(encoding="utf-8"))


def save_json(p: Path, data) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


@lru_cache
def env() -> dict[str, str]:
    """Đọc .env ở gốc dự án; biến môi trường hệ thống được ưu tiên."""
    out: dict[str, str] = {}
    f = ROOT / ".env"
    if f.exists():
        for line in f.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            out[k.strip()] = v.strip().strip('"').strip("'")
    for k in list(out):
        if os.environ.get(k):
            out[k] = os.environ[k]
    return out


@lru_cache
def channel() -> dict:
    return load_json(CONFIG / "channel.json", {})


@lru_cache
def lexicon() -> dict[str, str]:
    d = load_json(CONFIG / "lexicon.json", {})
    return {k: v for k, v in d.items() if not k.startswith("_")}


def tool(name: str) -> str:
    """Tìm ffmpeg/ffprobe: PATH → thư mục winget → bản ffmpeg đi kèm Remotion."""
    exe = name + (".exe" if sys.platform == "win32" else "")
    found = shutil.which(name)
    if found:
        return found
    local = os.environ.get("LOCALAPPDATA", "")
    hits = glob.glob(os.path.join(local, "Microsoft", "WinGet", "Packages", "Gyan.FFmpeg*", "*", "bin", exe))
    if hits:
        return hits[0]
    hits = glob.glob(str(STUDIO / "node_modules" / "@remotion" / "compositor-*" / exe))
    if hits:
        return hits[0]
    raise SystemExit(f"Không tìm thấy {name}. Cài: winget install -e --id Gyan.FFmpeg")


def npx() -> str:
    return "npx.cmd" if sys.platform == "win32" else "npx"
