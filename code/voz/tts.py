"""Client ZipVoice (TTS tiếng Việt tự host) + chuẩn hóa văn bản trước khi đọc."""
from __future__ import annotations

import base64
import hashlib
import json
import re
import time
from pathlib import Path

import requests

from . import config

ROMAN = {"I": "một", "II": "hai", "III": "ba", "IV": "bốn"}
NUM = r"(\d[\d.,]*)"
END = r"(?=[\s.,;:!?)\]]|$)"


def normalize(text: str) -> str:
    """Sửa các mẫu mà server đọc sai (đã kiểm: 39.000đ, 39K, m², quý I/2026). Giữ nguyên phần còn lại."""
    t = re.sub(r"==|\*\*", "", text)
    t = re.sub(NUM + r"\s*đ" + END, r"\1 đồng", t)
    t = re.sub(NUM + r"\s*[kK]" + END, r"\1 nghìn", t)
    t = re.sub(NUM + r"\s*tr" + END, r"\1 triệu", t)
    t = re.sub(r"\s*/\s*m²", " một mét vuông", t)
    t = re.sub(r"\s*m²", " mét vuông", t)
    t = re.sub(r"quý\s+(IV|I{1,3})\s*/\s*(\d{4})", lambda m: f"quý {ROMAN[m.group(1)]} năm {m.group(2)}", t)
    t = re.sub(r"quý\s+(IV|I{1,3})\b", lambda m: f"quý {ROMAN[m.group(1)]}", t)
    t = t.replace("→", " thành ").replace("&", " và ").replace("~", "khoảng ")
    return re.sub(r"\s{2,}", " ", t).strip()


def _server() -> tuple[str, dict]:
    e = config.env()
    url = e.get("ZIPVOICE_URL", "").rstrip("/")
    if not url:
        raise SystemExit("Thiếu ZIPVOICE_URL trong .env")
    return url, {"Authorization": f"Bearer {e.get('ZIPVOICE_API_KEY', '')}"}


def health() -> dict:
    url, h = _server()
    return requests.get(f"{url}/health", headers=h, timeout=20).json()


def preview_read(text: str) -> list[dict]:
    url, h = _server()
    r = requests.post(f"{url}/v1/normalize", headers=h, json={"text": normalize(text), "lexicon": config.lexicon()}, timeout=60)
    r.raise_for_status()
    return r.json()


def synthesize(text: str, out_mp3: Path, voice: str | None = None, speed: float | None = None,
               caption_words: int | None = None, verify: bool = False) -> dict:
    """Gọi /v1/tts, ghi mp3, trả {duration_ms, captions:[{text,startMs,endMs}], sentences, read_text}."""
    ch = config.channel()
    url, h = _server()
    body = {
        "text": normalize(text),
        "voice": voice or ch.get("voice", "nam_bac_tram"),
        "format": "mp3",
        "response": "json",
        "caption_words": caption_words or ch.get("caption_words", 5),
        "lexicon": config.lexicon(),
        "verify": verify,
    }
    if speed or ch.get("speed"):
        body["speed"] = speed or ch.get("speed")
    last = None
    for attempt in range(3):
        try:
            r = requests.post(f"{url}/v1/tts", headers=h, json=body, timeout=300)
            if r.status_code == 200:
                break
            last = f"HTTP {r.status_code}: {r.text[:300]}"
        except requests.RequestException as ex:  # tunnel trycloudflare hay rớt
            last = str(ex)
        time.sleep(2 * (attempt + 1))
    else:
        raise SystemExit(f"TTS lỗi ({last}). Kiểm tra server ZipVoice / URL tunnel trong .env")
    d = r.json()
    out_mp3.parent.mkdir(parents=True, exist_ok=True)
    out_mp3.write_bytes(base64.b64decode(d["audio_base64"]))
    return {
        "duration_ms": round(d["duration_seconds"] * 1000),
        "voice": d.get("voice"),
        "speed": d.get("speed"),
        "captions": [{"text": c["text"], "startMs": round(c["start"] * 1000), "endMs": round(c["end"] * 1000)} for c in d["captions"]],
        "sentences": [{"text": s["text"], "read": s.get("read"), "startMs": round(s["start"] * 1000), "endMs": round(s["end"] * 1000)} for s in d["sentences"]],
    }


def cache_key(text: str, voice: str, speed, caption_words) -> str:
    raw = json.dumps([normalize(text), voice, speed, caption_words, config.lexicon()], ensure_ascii=False, sort_keys=True)
    return hashlib.sha1(raw.encode("utf-8")).hexdigest()[:16]
