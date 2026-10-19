"""Tổng hợp bộ hiệu ứng âm thanh (SFX) cho studio: code/studio/src/assets/sfx/<tên>.wav.

Tự sinh bằng numpy (nhiễu lọc, sóng sin có đường bao) nên không phụ thuộc license bên ngoài.
Muốn dùng tiếng thật: thả file .wav cùng tên vào thư mục đó (nguồn CC0 / YouTube Audio Library) rồi ghi
vào docs/style-guide.md. Chạy lại: python code/voz/tools/make_sfx.py
"""
import sys
import wave
from pathlib import Path

import numpy as np

OUT = Path(__file__).resolve().parents[2] / "studio" / "src" / "assets" / "sfx"
SR = 44100
rng = np.random.default_rng(11)


def t(sec):
    return np.arange(int(SR * sec)) / SR


def env(n, a=0.005, r=0.2, shape=3.0):
    """Đường bao attack nhanh + nhả theo hàm mũ."""
    x = np.arange(n) / SR
    att = np.clip(x / max(a, 1e-4), 0, 1)
    return att * np.exp(-x / max(r, 1e-4) * shape / 3)


def bandpass(x, lo, hi):
    """Lọc dải bằng FFT (đủ cho tiếng động ngắn)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = ((f >= lo) & (f <= hi)).astype(float)
    m = np.convolve(m, np.ones(9) / 9, mode="same")
    return np.fft.irfft(X * m, len(x))


def sweep_noise(sec, f0, f1, width=0.6):
    """Nhiễu trắng lọc dải có tần số trung tâm quét f0→f1 (tiếng gió vút)."""
    n = int(SR * sec)
    noise = rng.normal(0, 1, n)
    out = np.zeros(n)
    seg = 512
    for s in range(0, n, seg):
        c = f0 + (f1 - f0) * (s / n)
        blk = noise[max(0, s - seg): s + seg * 2]
        y = bandpass(blk, c * (1 - width / 2), c * (1 + width / 2))
        a = s - max(0, s - seg)
        out[s: s + seg] = y[a: a + min(seg, n - s)]
    return out


def norm(x, peak=0.8):
    return x / (np.abs(x).max() + 1e-9) * peak


def fade(x, ms=6):
    k = int(SR * ms / 1000)
    x[:k] *= np.linspace(0, 1, k)
    x[-k:] *= np.linspace(1, 0, k)
    return x


def save(name, x, peak=0.8):
    OUT.mkdir(parents=True, exist_ok=True)
    y = (fade(norm(x, peak)) * 32767).astype("<i2")
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(y.tobytes())


def main():
    # whoosh — chuyển cảnh trượt
    n = int(SR * 0.5)
    x = sweep_noise(0.5, 300, 2600, 0.9)
    bell = np.sin(np.linspace(0, np.pi, n)) ** 2.2
    save("whoosh", x * bell, 0.7)

    # swish — vút ngắn (mũi tên, nét vẽ, phóng to)
    n = int(SR * 0.22)
    x = sweep_noise(0.22, 1800, 5200, 0.7) * np.sin(np.linspace(0, np.pi, n)) ** 1.5
    save("swish", x, 0.5)

    # paper — giấy lướt/đặt xuống: chỉ tiếng xào xạc cao tần, KHÔNG có nhịp trầm (nghe như tiếng gõ khi lặp nhiều lần)
    n = int(SR * 0.26)
    crk = rng.normal(0, 1, n) * (rng.random(n) < 0.05) * 2
    hiss = bandpass(rng.normal(0, 1, n) + crk, 2500, 10000)
    save("paper", hiss * env(n, 0.012, 0.08) * np.sin(np.linspace(0, np.pi, n)) ** 0.4, 0.45)

    # tape — xé băng dính: chuỗi tiếng tách dày dần
    n = int(SR * 0.38)
    clicks = (rng.random(n) < np.linspace(0.02, 0.18, n)) * rng.normal(0, 1, n) * 4
    x = bandpass(clicks + rng.normal(0, 0.3, n), 1200, 7000) * np.sin(np.linspace(0, np.pi, n)) ** 0.7
    save("tape", x, 0.55)

    # pop — bật ra (emoji, ghim, chấm bản đồ)
    n = int(SR * 0.13)
    f = np.linspace(900, 260, n)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.05)
    save("pop", x, 0.7)

    # click — nhãn hộp đen, phím chọn: tiếng "tách" nhỏ, cao
    n = int(SR * 0.05)
    x = bandpass(rng.normal(0, 1, n), 3000, 9000) * env(n, 0.0005, 0.006) + np.sin(2 * np.pi * 3600 * t(0.05)) * env(n, 0.0005, 0.008) * 0.3
    save("click", x, 0.45)

    # type — phím máy chữ nhẹ (không có thân trầm)
    n = int(SR * 0.06)
    x = bandpass(rng.normal(0, 1, n), 2500, 8000) * env(n, 0.0005, 0.01)
    save("type", x, 0.4)

    # thud — con số lớn hiện ra: "vụt" giấy dày lướt vào + đuôi xào xạc (thay tiếng đập trầm cũ)
    n = int(SR * 0.32)
    x = sweep_noise(0.32, 3500, 1200, 0.8) * np.sin(np.linspace(0, np.pi, n)) ** 1.2
    save("thud", x, 0.5)

    # stamp — đóng dấu: tiếng giấy bị ép (nhiễu trung-cao ngắn), không có nhịp trầm
    n = int(SR * 0.2)
    x = bandpass(rng.normal(0, 1, n), 1500, 7000) * env(n, 0.002, 0.04)
    save("stamp", x, 0.45)

    # marker — bút dạ quang quét: nhiễu trung tần rung nhẹ
    n = int(SR * 0.4)
    am = 0.7 + 0.3 * np.sin(2 * np.pi * 38 * t(0.4))
    x = bandpass(rng.normal(0, 1, n), 2500, 6000) * am * np.sin(np.linspace(0, np.pi, n)) ** 0.5
    save("marker", x, 0.35)

    # ding — chuông nhỏ (kết luận, con số chốt)
    n = int(SR * 1.0)
    x = sum(a * np.sin(2 * np.pi * 1320 * k * t(1.0)) * env(n, 0.001, 0.5 / k) for k, a in [(1, 1), (2.76, 0.4), (5.4, 0.15)])
    save("ding", x, 0.45)

    # riser — căng dần trước điểm bất ngờ
    n = int(SR * 1.2)
    x = sweep_noise(1.2, 400, 4000, 0.5) * np.linspace(0, 1, n) ** 2
    save("riser", x, 0.5)
    print("saved", OUT)


if __name__ == "__main__":
    sys.exit(main())
