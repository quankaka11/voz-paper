"""Tải font Google về máy (code/studio/src/assets/fonts/) và sinh code/studio/src/fonts.generated.ts.

Render không còn tải font từ fonts.gstatic.com mỗi lần (mạng chập chờn → render video dài lỗi giữa chừng).
Danh sách họ font + độ đậm lấy từ FAMILIES bên dưới — giữ khớp với `fonts` trong code/studio/src/theme.ts.
Đường dẫn file lấy từ chính gói @remotion/google-fonts đã cài (getInfo()), chỉ các subset latin, latin-ext, vietnamese.
Chạy lại khi đổi font/độ đậm trong theme.ts:  python code/voz/tools/make_fonts.py
"""
import json
import subprocess
import sys
from pathlib import Path

import requests

STUDIO = Path(__file__).resolve().parents[2] / "studio"
OUT = STUDIO / "src" / "assets" / "fonts"
TS = STUDIO / "src" / "fonts.generated.ts"
SUBSETS = ("latin", "latin-ext", "vietnamese")

# tên module @remotion/google-fonts → độ đậm dùng trong theme.ts
FAMILIES = {
    "Fraunces": ["700", "900"],
    "PlayfairDisplay": ["700", "900"],
    "BeVietnamPro": ["500", "700", "800"],
    "Oswald": ["500", "700"],
    "Anton": ["400"],
    "SpaceMono": ["400", "700"],
    "PatrickHand": ["400"],
}


def info(module: str) -> dict:
    js = f"import {{getInfo}} from '@remotion/google-fonts/{module}'; console.log(JSON.stringify(getInfo()));"
    node = "node.exe" if sys.platform == "win32" else "node"
    r = subprocess.run([node, "--input-type=module", "-e", js], cwd=STUDIO, capture_output=True, text=True, encoding="utf-8")
    if r.returncode:
        raise SystemExit(r.stderr)
    return json.loads(r.stdout)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rows = []
    for module, weights in FAMILIES.items():
        meta = info(module)
        for w in weights:
            for sub in SUBSETS:
                url = meta["fonts"]["normal"][w].get(sub)
                if not url:
                    continue
                name = f"{module}-{w}-{sub}.woff2"
                f = OUT / name
                if not f.exists():
                    r = requests.get(url, timeout=60)
                    r.raise_for_status()
                    f.write_bytes(r.content)
                rows.append((meta["fontFamily"], w, sub, name, meta["unicodeRanges"][sub]))
    lines = [
        "// Tự sinh bởi code/voz/tools/make_fonts.py — đừng sửa tay.",
        "/* eslint-disable */",
    ]
    lines += [f"import f{i} from './assets/fonts/{n}';" for i, (_, _, _, n, _) in enumerate(rows)]
    lines += ["", "export type FontFile = {family: string; weight: string; subset: string; url: string; unicodeRange: string};",
              "export const FONT_FILES: FontFile[] = ["]
    lines += [f"  {{family: {json.dumps(fam)}, weight: '{w}', subset: '{s}', url: f{i}, unicodeRange: {json.dumps(ur)}}},"
              for i, (fam, w, s, _, ur) in enumerate(rows)]
    lines += ["];", ""]
    TS.write_text("\n".join(lines), encoding="utf-8")
    size = sum((OUT / r[3]).stat().st_size for r in rows) / 1e6
    print(f"{len(rows)} file font ({size:.1f} MB) → {OUT}\n→ {TS}")


if __name__ == "__main__":
    sys.exit(main())
