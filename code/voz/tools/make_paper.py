"""Tạo nền giấy dựng sẵn cho studio (code/studio/src/assets/bg-{light,dark}-{0..3}.jpg).

Nền = màu giấy × thớ giấy × hạt film × vignette, nướng sẵn thành JPG đặc để Remotion
không phải blend mỗi frame (nhanh hơn ~2 lần). Chạy lại khi đổi màu trong theme.ts.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

OUT = Path(__file__).resolve().parents[2] / "studio" / "src" / "assets"
W, H = 1080, 1920
TONES = {"light": ((0xF2, 0xEA, 0xDB), 0.22, 0.16, (80, 60, 30), 0.18), "dark": ((0x14, 0x21, 0x3D), 0.12, 0.10, (0, 0, 0), 0.45)}


def main():
    rng = np.random.default_rng(7)
    fib = rng.normal(0, 1, (240, 135))
    fib = np.asarray(Image.fromarray(((fib - fib.min()) / np.ptp(fib) * 255).astype("uint8")).resize((W, H), Image.BICUBIC)
                     .filter(ImageFilter.GaussianBlur(6)), dtype=np.float32) / 255
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / np.sqrt(2)
    for tone, (rgb, fib_a, grain_a, vig_rgb, vig_a) in TONES.items():
        for i in range(4):
            g = np.clip(rng.normal(0.5, 0.15, (H, W)), 0, 1).astype(np.float32)
            base = np.ones((H, W, 3), np.float32) * np.array(rgb, np.float32) / 255
            # multiply: base * (1 - a + a*tex)
            base *= (1 - fib_a + fib_a * (0.55 + 0.45 * fib))[..., None]
            base *= (1 - grain_a + grain_a * (0.6 + 0.8 * g))[..., None]
            v = np.clip((r - 0.55) / 0.45, 0, 1)[..., None] * vig_a
            base = base * (1 - v) + np.array(vig_rgb, np.float32) / 255 * v
            Image.fromarray((np.clip(base, 0, 1) * 255).astype("uint8")).save(OUT / f"bg-{tone}-{i}.jpg", quality=88)
    print("saved", OUT)


if __name__ == "__main__":
    sys.exit(main())
