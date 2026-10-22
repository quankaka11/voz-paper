import {cancelRender, continueRender, delayRender} from 'remotion';
import {FONT_FILES} from '../fonts.generated';

const loaded = new Set<string>();

/**
 * Nạp một họ font từ file woff2 đi kèm bundle (code/voz/tools/make_fonts.py) — không gọi mạng khi render.
 * Mỗi độ đậm × subset (latin, latin-ext, vietnamese) là một FontFace có unicode-range như Google Fonts.
 * Trả tên họ font để dùng trong CSS.
 */
export const loadLocalFont = (family: string): string => {
  if (typeof FontFace === 'undefined') return family;
  const files = FONT_FILES.filter((f) => f.family === family);
  if (!files.length) throw new Error(`Chưa có file font ${family} — chạy python code/voz/tools/make_fonts.py`);
  for (const f of files) {
    const key = `${family}-${f.weight}-${f.subset}`;
    if (loaded.has(key)) continue;
    loaded.add(key);
    const handle = delayRender(`Nạp font ${key}`);
    const face = new FontFace(family, `url(${f.url}) format('woff2')`, {weight: f.weight, style: 'normal', unicodeRange: f.unicodeRange});
    face
      .load()
      .then(() => {
        // lib.dom của TS bản này thiếu FontFaceSet.add (trình duyệt đều có)
        (document.fonts as unknown as {add: (f: FontFace) => void}).add(face);
        continueRender(handle);
      })
      // file font hỏng/thiếu thì dừng render, không để âm thầm thay bằng font khác (chữ tiếng Việt sẽ sai)
      .catch((err) => cancelRender(new Error(`Không nạp được font ${key}: ${err}`)));
  }
  return family;
};
