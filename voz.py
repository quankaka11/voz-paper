"""Điểm vào CLI của dự án VOZ STORY.  Dùng: python voz.py --help"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "code"))

from voz.cli import main  # noqa: E402

if __name__ == "__main__":
    main()
