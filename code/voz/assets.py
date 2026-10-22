"""Tìm ảnh hợp lệ bản quyền cho video kiếm tiền, tải ứng viên, chọn ảnh + ghi nguồn, tách nền.

Nguồn: Wikimedia Commons & Openverse (không cần key), Pexels & Pixabay (cần key miễn phí trong .env).
Chỉ nhận license cho phép dùng thương mại và chỉnh sửa (PD, CC0, CC BY, CC BY-SA, Pexels, Pixabay).
"""
from __future__ import annotations

import datetime as dt
import re
import shutil
import time
from io import BytesIO
from pathlib import Path

import requests

from . import config

UA = {"User-Agent": "VOZStory/1.0 (personal explainer video tool; python-requests)"}
BLOCKED = re.compile(r"\b(nc|nd)\b|non-?commercial|no-?deriv|fair use|all rights reserved", re.I)


def _strip_html(s: str | None) -> str:
    return re.sub(r"<[^>]+>", "", s or "").strip()


WIKI_STEPS = (250, 330, 500, 960, 1280)  # kích thước thumbnail chuẩn; tải ảnh gốc/nhỏ lẻ hay bị upload.wikimedia.org trả 429


def _wiki_thumb(ii: dict) -> str | None:
    """URL thumbnail cỡ chuẩn. Khi ảnh gốc nhỏ hơn cỡ yêu cầu, API trả ảnh gốc ('unscaled') → tự dựng URL /thumb/."""
    url, th, w = (ii.get("url") or "").split("?")[0], ii.get("thumburl"), ii.get("width") or 0
    if th and "/thumb/" in th:
        return th
    if not url or "/commons/" not in url:
        return th or url
    steps = [s for s in WIKI_STEPS if s < w]
    if not steps:
        return th or url
    name = url.rsplit("/", 1)[1]
    ext = "" if name.lower().endswith((".jpg", ".jpeg", ".png", ".gif")) else ".png"
    return url.replace("/commons/", "/commons/thumb/", 1) + f"/{steps[-1]}px-{name}{ext}"


def _wikimedia(q: str, n: int) -> list[dict]:
    r = requests.get("https://commons.wikimedia.org/w/api.php", headers=UA, timeout=30, params={
        "action": "query", "format": "json", "generator": "search", "gsrsearch": f"{q} filetype:bitmap",
        "gsrnamespace": 6, "gsrlimit": n * 2, "prop": "imageinfo", "iiprop": "url|extmetadata|size", "iiurlwidth": 1600,
    })
    out = []
    for p in (r.json().get("query", {}).get("pages", {}) or {}).values():
        ii = (p.get("imageinfo") or [{}])[0]
        md = ii.get("extmetadata", {})
        lic = _strip_html(md.get("LicenseShortName", {}).get("value"))
        if not lic or BLOCKED.search(lic):
            continue
        if (ii.get("width") or 0) < 400:  # quá nhỏ cho video 1080p; ảnh gốc nhỏ cũng hay bị chặn 429
            continue
        out.append({
            "id": str(p["pageid"]), "source": "wikimedia", "title": p["title"].removeprefix("File:"),
            "url": _wiki_thumb(ii), "page": ii.get("descriptionurl"),
            "author": _strip_html(md.get("Artist", {}).get("value"))[:120], "license": lic,
            "license_url": md.get("LicenseUrl", {}).get("value"),
            "attribution_required": md.get("AttributionRequired", {}).get("value", "true") != "false",
        })
    return out[:n]


def _openverse(q: str, n: int) -> list[dict]:
    r = requests.get("https://api.openverse.org/v1/images/", headers=UA, timeout=30,
                     params={"q": q, "license_type": "commercial,modification", "page_size": n, "mature": "false"})
    out = []
    for it in r.json().get("results", []):
        lic = f"{it.get('license', '').upper()} {it.get('license_version') or ''}".strip()
        out.append({
            "id": it["id"], "source": "openverse", "title": it.get("title") or "", "url": it.get("url"),
            "page": it.get("foreign_landing_url"), "author": it.get("creator") or "", "license": lic,
            "license_url": it.get("license_url"), "attribution_required": it.get("license") not in ("cc0", "pdm"),
            "note": "Openverse là trang tổng hợp — xác minh license tại trang gốc trước khi dùng",
        })
    return out


def _pexels(q: str, n: int) -> list[dict]:
    key = config.env().get("PEXELS_API_KEY")
    if not key:
        raise SystemExit("Thiếu PEXELS_API_KEY trong .env (đăng ký miễn phí: https://www.pexels.com/api/)")
    r = requests.get("https://api.pexels.com/v1/search", headers={"Authorization": key, **UA}, timeout=30,
                     params={"query": q, "per_page": n})
    return [{
        "id": str(p["id"]), "source": "pexels", "title": p.get("alt") or "", "url": p["src"]["large2x"],
        "page": p["url"], "author": p.get("photographer", ""), "license": "Pexels License",
        "license_url": "https://www.pexels.com/license/", "attribution_required": False,
    } for p in r.json().get("photos", [])]


def _pixabay(q: str, n: int) -> list[dict]:
    key = config.env().get("PIXABAY_API_KEY")
    if not key:
        raise SystemExit("Thiếu PIXABAY_API_KEY trong .env (đăng ký miễn phí: https://pixabay.com/api/docs/)")
    r = requests.get("https://pixabay.com/api/", headers=UA, timeout=30,
                     params={"key": key, "q": q, "per_page": max(3, n), "safesearch": "true"})
    return [{
        "id": str(h["id"]), "source": "pixabay", "title": h.get("tags", ""), "url": h["largeImageURL"],
        "page": h["pageURL"], "author": h.get("user", ""), "license": "Pixabay Content License",
        "license_url": "https://pixabay.com/service/license-summary/", "attribution_required": False,
    } for h in r.json().get("hits", [])[:n]]


SOURCES = {"wikimedia": _wikimedia, "openverse": _openverse, "pexels": _pexels, "pixabay": _pixabay}


def search(ep_dir: Path, query: str, source: str = "wikimedia", n: int = 8) -> Path:
    """Tải ứng viên vào assets/_candidates/, ghi candidates.json và contact sheet có đánh số."""
    from PIL import Image, ImageDraw

    cands = SOURCES[source](query, n)
    cdir = ep_dir / "assets" / "_candidates"
    cdir.mkdir(parents=True, exist_ok=True)
    tiles = []
    for c in cands:
        key = f"{c['source']}_{re.sub(r'[^A-Za-z0-9-]', '', c['id'])[:24]}"
        f = cdir / f"{key}.jpg"
        try:
            if not f.exists():
                for attempt in range(4):  # upload.wikimedia.org hay trả 429 khi tải dồn
                    img = requests.get(c["url"], headers=UA, timeout=60)
                    if img.status_code != 429:
                        break
                    time.sleep(3 * (attempt + 1))
                img.raise_for_status()
                Image.open(BytesIO(img.content)).convert("RGB").save(f, quality=92)
                time.sleep(1.2)
        except Exception as ex:  # noqa: BLE001 — ảnh hỏng thì bỏ qua
            print(f"  bỏ {key}: {ex}")
            continue
        c.update({"key": key, "file": f.name, "query": query})
        tiles.append(c)
    db = config.load_json(cdir / "candidates.json", {})  # đọc lại ngay trước khi ghi: nhiều lần tìm song song không xoá của nhau
    db.update({c["key"]: c for c in tiles})
    config.save_json(cdir / "candidates.json", db)
    if not tiles:
        raise SystemExit("Không có ứng viên phù hợp license. Thử từ khóa tiếng Anh hoặc nguồn khác.")
    tw, th = 320, 260
    sheet = Image.new("RGB", (tw * min(4, len(tiles)), (th + 40) * ((len(tiles) + 3) // 4)), "white")
    d = ImageDraw.Draw(sheet)
    for i, c in enumerate(tiles):
        im = Image.open(cdir / c["file"])
        im.thumbnail((tw - 8, th - 8))
        x, y = (i % 4) * tw, (i // 4) * (th + 40)
        sheet.paste(im, (x + 4, y + 4))
        d.text((x + 6, y + th), f"{c['key']}", fill="black")
        d.text((x + 6, y + th + 16), c["license"][:40], fill="gray")
    out = cdir / f"sheet_{re.sub(r'[^a-z0-9]+', '-', query.lower())[:30]}.jpg"
    sheet.save(out, quality=85)
    for c in tiles:
        print(f"  {c['key']:<28} {c['license']:<22} {c['title'][:50]}")
    print(f"→ xem ảnh: {out}")
    return out


def pick(ep_dir: Path, key: str, name: str) -> Path:
    """Chuyển ứng viên vào assets/<name>.jpg và ghi nguồn vào sources.json."""
    cdir = ep_dir / "assets" / "_candidates"
    db = config.load_json(cdir / "candidates.json", {})
    if key not in db:
        raise SystemExit(f"Không có ứng viên {key}")
    c = db[key]
    dst = ep_dir / "assets" / f"{name}.jpg"
    shutil.copy2(cdir / c["file"], dst)
    add_source(ep_dir, {
        "type": "image", "file": f"assets/{dst.name}", "title": c["title"], "author": c["author"],
        "license": c["license"], "license_url": c.get("license_url"), "url": c["page"], "via": c["source"],
        "attribution_required": c.get("attribution_required", True), "retrieved": dt.date.today().isoformat(),
    })
    print(f"→ {dst.relative_to(ep_dir)}  ({c['license']}; credit: {c['author'] or '—'})")
    return dst


def add_manual(ep_dir: Path, file: str, name: str | None, title: str, author: str, license: str, url: str,
               kind: str | None = None) -> Path:
    """Đưa ảnh/phim tải tay (NARA, Library of Congress, Prelinger, Europeana… — các kho chặn tải tự động) vào assets/
    và ghi nguồn. License NC/ND bị từ chối như với `img search`."""
    if BLOCKED.search(license):
        raise SystemExit(f"License '{license}' không cho dùng thương mại/chỉnh sửa — không dùng được")
    src = Path(file)
    if not src.exists():
        raise SystemExit(f"Không thấy file {src}")
    dst = ep_dir / "assets" / f"{name or src.stem}{src.suffix.lower()}"
    dst.parent.mkdir(parents=True, exist_ok=True)
    if src.resolve() != dst.resolve():
        shutil.copy2(src, dst)
    kind = kind or ("video" if dst.suffix in (".mp4", ".mov", ".webm") else "image")
    free = re.search(r"public domain|\bpd\b|pdm|cc0|no known (copyright )?restrictions", license, re.I)
    add_source(ep_dir, {
        "type": kind, "file": f"assets/{dst.name}", "title": title, "author": author, "license": license,
        "license_url": None, "url": url, "via": "manual", "attribution_required": not free,
        "retrieved": dt.date.today().isoformat(),
    })
    print(f"→ {dst.relative_to(ep_dir)}  ({license}; nguồn: {url})")
    return dst


def add_source(ep_dir: Path, entry: dict) -> None:
    f = ep_dir / "sources.json"
    data = config.load_json(f, [])
    data = [d for d in data if not (entry.get("file") and d.get("file") == entry["file"])]
    data.append(entry)
    config.save_json(f, data)


def _drop_specks(alpha, keep_ratio: float = 0.03):
    """Bỏ mảnh vụn rời (mép bàn, khung tranh còn sót) nhỏ hơn 3% mảng lớn nhất — sticker viền trắng sẽ lộ rõ chúng."""
    import numpy as np
    from PIL import Image
    try:
        from scipy import ndimage
    except ImportError:
        return alpha
    a = np.asarray(alpha).copy()
    lab, n = ndimage.label(a > 0)
    if n <= 1:
        return alpha
    sizes = ndimage.sum(a > 0, lab, range(1, n + 1))
    small = [i + 1 for i, v in enumerate(sizes) if v < sizes.max() * keep_ratio]
    a[np.isin(lab, small)] = 0
    return Image.fromarray(a)


def cutout(ep_dir: Path, rel: str, model: str = "isnet-general-use") -> Path:
    """Tách nền (rembg). Không dùng model mặc định bria-rmbg vì license thương mại phải trả phí."""
    try:
        from rembg import new_session, remove
    except ImportError:
        raise SystemExit('Chưa cài rembg: python -m pip install "rembg[cpu]"')
    from PIL import Image

    src = ep_dir / rel
    out = src.with_name(src.stem + "_cut.png")
    im = remove(Image.open(src), session=new_session(model)).convert("RGBA")
    # bỏ vùng bán trong suốt (bóng mờ của vật thể phía sau), làm cứng mép
    a = im.getchannel("A").point(lambda v: 0 if v < 110 else (255 if v > 200 else v))
    im.putalpha(a)
    a = _drop_specks(a)
    im.putalpha(a)
    bbox = a.getbbox()
    if bbox:
        im = im.crop(bbox)
    im.save(out)
    print(f"→ {out.relative_to(ep_dir)}")
    return out
