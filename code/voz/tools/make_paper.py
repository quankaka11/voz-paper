"""Tạo nền giấy dựng sẵn cho studio (code/studio/src/assets/).

- bg-<tone>.jpg  : nền tĩnh từng tông (than chì, kem, navy, giấy kẻ ô xanh/lam/đỏ, biển bản đồ) — thớ giấy,
                   vết bẩn, vết xước, vignette nướng sẵn để Remotion không phải blend mỗi frame.
- grain-<i>.png  : 4 lớp hạt film + bụi trong suốt, phủ lên MỌI thứ (cả ảnh) và đổi mỗi 2 frame → khung hình
                   "sống" và các ảnh cắt dán từ nhiều nguồn trông cùng một chất liệu.
- *-wide.*       : cùng bộ trên cho khung ngang 1920×1080 (định dạng long) — tạo riêng để thớ giấy, ô lưới, hạt
                   film không bị kéo méo.
Chạy lại khi đổi màu trong theme.ts.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parents[2] / "studio" / "src" / "assets"
W, H = 1080, 1920  # đặt lại theo từng định dạng trong main()

# tông: (màu nền, độ thớ giấy, độ vết bẩn, màu vignette, độ vignette, lưới (màu, alpha) | None, vết xước)
TONES = {
    "charcoal": ((0x37, 0x37, 0x39), 0.16, 0.34, (0, 0, 0), 0.6, None, 0.05),
    "cream": ((0xF2, 0xEA, 0xDB), 0.22, 0.10, (80, 60, 30), 0.20, None, 0.0),
    "navy": ((0x14, 0x21, 0x3D), 0.12, 0.14, (0, 0, 0), 0.45, None, 0.05),
    "grid": ((0x3E, 0x7B, 0x3A), 0.10, 0.30, (5, 20, 5), 0.55, ((235, 230, 200), 0.42), 0.10),
    "grid-blue": ((0x2C, 0x5A, 0x8C), 0.10, 0.30, (5, 10, 25), 0.55, ((230, 235, 240), 0.40), 0.10),
    "grid-red": ((0x9A, 0x3B, 0x2E), 0.10, 0.30, (25, 5, 5), 0.55, ((240, 225, 205), 0.38), 0.10),
    "map": ((0xD8, 0xD6, 0xD0), 0.14, 0.10, (40, 40, 40), 0.30, None, 0.0),
}
CELL = 92  # ô lưới (px)


def _sh(a, b):
    """Kích thước lưới nhiễu (hàng, cột) viết cho khung dọc → đảo lại ở khung ngang để hạt không bị kéo méo."""
    return (a, b) if H >= W else (b, a)


def _noise(rng, shape_small, blur, size=None):
    size = size or (W, H)
    n = rng.normal(0, 1, shape_small)
    n = (n - n.min()) / np.ptp(n)
    img = Image.fromarray((n * 255).astype("uint8")).resize(size, Image.BICUBIC).filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(img, dtype=np.float32) / 255


def _scratches(rng, a):
    img = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(img)
    for _ in range(int(140 * a / 0.1)):
        x, y = rng.uniform(0, W), rng.uniform(0, H)
        ang, ln = rng.uniform(0, np.pi), rng.uniform(8, 70)
        d.line([(x, y), (x + np.cos(ang) * ln, y + np.sin(ang) * ln)], fill=int(rng.uniform(60, 200)), width=1)
    for _ in range(int(160 * a / 0.1)):  # chấm bụi mờ
        x, y, r = rng.uniform(0, W), rng.uniform(0, H), rng.uniform(0.5, 1.6)
        d.ellipse([x - r, y - r, x + r, y + r], fill=int(rng.uniform(40, 110)))
    return np.asarray(img.filter(ImageFilter.GaussianBlur(0.6)), dtype=np.float32) / 255


def _grid(rng, rgb, a, grime):
    img = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(img)
    ox, oy = 26, 40
    for x in range(ox, W, CELL):
        d.line([(x, 0), (x, H)], fill=255, width=3)
    for y in range(oy, H, CELL):
        d.line([(0, y), (W, y)], fill=255, width=3)
    g = np.asarray(img.filter(ImageFilter.GaussianBlur(0.8)), dtype=np.float32) / 255
    # nét lưới mòn không đều: chỗ bẩn thì mờ đi, thêm đứt đoạn
    wear = np.clip(0.35 + 0.9 * _noise(rng, _sh(60, 34), 4) - 0.5 * grime, 0, 1)
    return g * wear * a, np.array(rgb, np.float32) / 255


def make_set(seed: int, size: tuple[int, int], suffix: str = "") -> None:
    """Nền từng tông + 4 lớp hạt film cho một kích thước khung. suffix "" = khung dọc, "-wide" = khung ngang."""
    global W, H
    W, H = size
    rng = np.random.default_rng(seed)
    fib = _noise(rng, _sh(240, 135), 6)
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / np.sqrt(2)
    for tone, (rgb, fib_a, stain_a, vig_rgb, vig_a, grid, scratch_a) in TONES.items():
        base = np.ones((H, W, 3), np.float32) * np.array(rgb, np.float32) / 255
        base *= (1 - fib_a + fib_a * (0.55 + 0.45 * fib))[..., None]
        # vết bẩn lớn (loang màu) + vết đốm nhỏ
        stain = _noise(rng, _sh(14, 8), 40) * 0.6 + _noise(rng, _sh(70, 40), 6) * 0.4
        base *= (1 - stain_a + stain_a * (0.45 + 0.75 * stain))[..., None]
        g = np.clip(rng.normal(0.5, 0.12, (H, W)), 0, 1).astype(np.float32)
        base *= (0.94 + 0.12 * g)[..., None]
        mott = _noise(rng, _sh(480, 270), 1.2)  # thớ bìa các-tông mịn
        base *= (0.93 + 0.14 * mott)[..., None]
        if grid:
            ga, gc = _grid(rng, grid[0], grid[1], stain)
            base = base * (1 - ga[..., None]) + gc * ga[..., None]
        if scratch_a:
            s = _scratches(rng, scratch_a)[..., None] * scratch_a * 2.2
            base = base * (1 - s) + np.array([0.92, 0.9, 0.85], np.float32) * s
        v = np.clip((r - 0.45) / 0.55, 0, 1)[..., None] ** 1.4 * vig_a
        base = base * (1 - v) + np.array(vig_rgb, np.float32) / 255 * v
        Image.fromarray((np.clip(base, 0, 1) * 255).astype("uint8")).save(OUT / f"bg-{tone}{suffix}.jpg", quality=90)

    # hạt film trong suốt: nửa độ phân giải (hạt to, tự nhiên hơn), xám ±, kèm bụi trắng/đen thưa
    gw, gh = W // 2, H // 2
    for i in range(4):
        g = rng.normal(0, 1, (gh, gw)).astype(np.float32)
        val = np.where(g > 0, 255, 0).astype("uint8")
        alpha = np.clip(np.abs(g) * 16, 0, 46).astype("uint8")
        rgba = np.dstack([val, val, val, alpha])
        im = Image.fromarray(rgba, "RGBA")
        d = ImageDraw.Draw(im)
        for _ in range(14):  # bụi film thưa, đổi chỗ mỗi lớp
            x, y, rr = rng.uniform(0, gw), rng.uniform(0, gh), rng.uniform(0.5, 1.3)
            c = 230 if rng.random() < 0.5 else 15
            d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=(c, c, c, int(rng.uniform(60, 120))))
        im.save(OUT / f"grain-{i}{suffix}.png", optimize=True)
    return rng


def main():
    rng = make_set(7, (1080, 1920))  # khung dọc: giữ seed 7 → bộ nền cũ không đổi khi chạy lại

    # mặt nạ "mực in mòn" (mask-image) cho số/chữ in typo và con dấu: trắng đặc, lỗ thủng nhỏ trong suốt
    S = 512
    m = Image.new("L", (S, S), 255)
    d = ImageDraw.Draw(m)
    for _ in range(900):
        x, y, rr = rng.uniform(0, S), rng.uniform(0, S), rng.uniform(0.6, 2.6)
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=int(rng.uniform(0, 90)))
    blot = _noise(rng, (24, 24), 3, (S, S))
    a = np.asarray(m, dtype=np.float32) / 255 * np.clip(0.55 + 1.6 * blot, 0, 1) ** 0.6
    a = np.clip((a - 0.25) / 0.6, 0, 1)
    Image.fromarray(np.dstack([np.full((S, S, 3), 255, "uint8"), (a * 255).astype("uint8")]), "RGBA").save(OUT / "speckle.png", optimize=True)

    make_set(8, (1920, 1080), "-wide")

    for old in OUT.glob("bg-light-*.jpg"):
        old.unlink()
    for old in OUT.glob("bg-dark-*.jpg"):
        old.unlink()
    print("saved", OUT)


if __name__ == "__main__":
    sys.exit(main())
