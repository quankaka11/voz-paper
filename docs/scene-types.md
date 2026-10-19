# Định dạng `episode.json` và thư viện cảnh

Mỗi tập là một file `episode.json` mô tả **danh sách cảnh**. Claude viết file này; `python voz.py build` tạo giọng đọc
cho từng cảnh, đo thời lượng, khớp thời điểm hiện chữ và xuất `build/props.json` cho Remotion
(`code/studio`). Không cần viết TSX mới cho từng tập. Phong cách & quy tắc dựng: **`docs/style-guide.md`**.
Ví dụ đầy đủ: `code/samples/style-demo/episode.json`.

```jsonc
{
  "voice": "nam_bac_tram",        // tùy chọn, mặc định lấy từ config/channel.json
  "speed": null,                  // null = tốc độ gợi ý của giọng
  "tone": "charcoal",             // nền mặc định của tập (xem "Nền")
  "music": "brand/music/investigations.mp3", // nhạc nền (mặc định lấy config/channel.json > music), mức 14%, tự vào/ra nhỏ dần
  "sfx": true, "sfx_volume": 1.0, // hiệu ứng âm thanh tự động (giấy, băng dính, whoosh…)
  "grain": 1.0,                   // độ hạt film phủ toàn khung (0 = tắt)
  "cover": {"kicker": "Ai đang trả tiền?", "lines": ["App ==miễn phí==", "kiếm tiền", "từ đâu?"], "image": "assets/phone_cut.png"},
  "scenes": [
    {
      "id": "s01",                // duy nhất trong tập
      "type": "collage",          // một trong các loại bên dưới
      "transition": "sheet",      // chuyển VÀO cảnh này (xem "Chuyển cảnh"), mặc định auto
      "vo": "Lời đọc của cảnh.",  // giọng đọc; thời lượng cảnh = thời lượng đọc + 0,35s
      "duration": 2.5,            // chỉ dùng khi cảnh không có vo (giây)
      "source": "CBRE, Q1/2026",  // hiện "Nguồn: …" — BẮT BUỘC khi cảnh có số liệu thật
      "illustrative": true,       // hiện nhãn "Minh họa" — BẮT BUỘC khi số liệu là ví dụ giả định
      "props": { "tone": "grid", "camera": "in", "...": "..." }
    }
  ]
}
```

## Cú pháp chữ (mọi trường text)

| Viết | Hiển thị |
|---|---|
| `==miễn phí==` | quét bút dạ quang vàng (tối đa 1–2 cụm mỗi câu) |
| `**ai**` | chữ màu nhấn (đỏ/cam; trên nhãn tối là vàng) |

## Khớp hình với lời đọc: `cue`, `outCue`

Phần tử nào có `"cue": "cụm từ trong vo"` sẽ hiện **đúng lúc giọng đọc nói tới cụm đó**
(so khớp không dấu, không phân biệt hoa thường). `"outCue"` = lúc phần tử rời khung (để thay bằng phần tử khác trong cùng cảnh).
Không có `cue` → dùng `"at": giây` hoặc các phần tử hiện đều trong 60% đầu cảnh.
`build` báo `⚠ không thấy cue` nếu cụm không có trong lời đọc, `⚠ thiếu file ảnh` nếu `src` chưa có.

## Các loại cảnh

| type | Dùng khi | props |
|---|---|---|
| `collage` | **Mặc định cho hầu hết nhịp** — poster cắt dán tự do | `layers: Layer[]` (bảng dưới), `camera?`, `handheld?` |
| `map` | Địa lý, chuỗi cung ứng, "ở đâu" | `views: [{center: [kinh, vĩ], zoom, cue?, move?}]`, `highlight: [{country, color?, cue?, lift?}]`, `points: [{at: [kinh, vĩ], label?, cue?, dot?, side?: left}]`, `routes: [{from, to, cue?, bend?, drawFrames?}]`, `layers?` (toạ độ màn hình) |
| `document` | Trích nguồn thật, bút dạ quang quét câu chính | `outlet`, `date?`, `headline?`, `image?`, `caption?`, `paragraphs: [string \| {text, cue}]` (`==…==` = câu được quét, đoạn khác mờ đi), `tilt?`, `paper?: news\|white` |
| `title` | Hook, câu hỏi trung tâm, chuyển ý | `kicker?`, `text` **hoặc** `lines: [string \| {text, color?, cue?}]` (chồng nhãn giấy), `sub?`, `emoji?`, `size?`, `image?` (ảnh trồi từ đáy: `{src, w?, x?, bottom?, treat?, rot?}`) |
| `bigNumber` | Một con số gây chú ý | `kicker?`, `value` **hoặc** `countTo` (+`prefix`, `suffix`, `decimals`), `unit?`, `label`, `note?`, `style?: letterpress\|poster\|ink`, `color?`, `image?` |
| `receipt` | Bóc tách hóa đơn / các lớp phí | `kicker?`, `title`, `items: [{label, value, note?, cue?}]`, `total: {label, value, cue?}` — giá trị bắt đầu bằng `-` tô xanh |
| `bars` | So sánh số liệu (cột giấy xé) | `kicker?`, `title`, `unit`, `bars: [{label, value, display?, highlight?, cue?}]`, `max?` |
| `compare` | Hai phía đối lập | `kicker?`, `title?`, `left/right: {title, tone: good\|bad\|neutral, items: [string \| {text, cue}]}` |
| `flow` | Sơ đồ hệ thống / dòng tiền | `layout: radial\|chain`, `title?`, `center?: Node`, `nodes: Node[]`, `direction: out\|in`, `arrowLabels?` — `Node = {label, emoji?, img?, treat?, note?, highlight?, cue?}` |
| `list` | Tóm tắt 2–4 ý | `kicker?`, `title?`, `items: [{emoji?, text, color?, cue?}]` |
| `phone` | Mô phỏng màn hình app (không dùng logo thật) | `app`, `tagline?`, `price?`, `rows: [{emoji, label, value?, highlight?, cue?}]`, `stamp?`, `kicker?`, `title?` |
| `image` | Một ảnh lớn | `src`, `style: polaroid\|cutout\|full`, `kenburns: in\|out\|left\|right`, `treat?`, `kicker?`, `text?`, `caption?`, `credit?`, `tilt?` |
| `question` | Kết bài: câu hỏi mở A/B | `text`, `options?: string[]`, `sub?` (mặc định "Còn bạn thì sao?") |

## Lớp cắt dán (`layers` của `collage` / `map`)

Chung cho mọi lớp: `kind`, `x`, `y` (px trong khung 1080×1920), `anchor: center|top|bottom|left|right|tl|tr|bl|br` (mặc định center),
`rot` (độ), `scale`, `cue`/`at`, `outCue`/`out`, `enter`, `sfx` (tên hoặc `false`), `opacity`, `wobble: false` (tắt rung tay).
Thứ tự trong mảng = thứ tự chồng (sau đè trước); nét vẽ (`arrow`, `string`, `scribble`) luôn nằm trên cùng.

| kind | Trông như | props riêng | vào mặc định · SFX |
|---|---|---|---|
| `image` | ảnh **tách nền** viền trắng sticker | `src` (PNG `_cut`), `w`/`h`, `treat: color\|bw\|sepia\|faded\|dark`, `border` (px, 0 = không viền), `kenburns: false` | drop · paper |
| `photo` | ảnh in / polaroid có băng dính | `src`, `w`, `h`, `frame: polaroid\|print\|none`, `caption?`, `treat`, `tape?` | drop · paper |
| `label` | nhãn giấy xé | `text`, `color: kraft\|cream\|yellow\|black\|white\|red\|teal`, `font: serif\|heavy\|condensed\|mono\|sans\|hand`, `size`, `upper?`, `maxWidth?`, `worn?` | slap · paper |
| `labels` | chồng nhãn so le (Machu Picchu) | `lines: [string \| {text, color?, size?, indent?, rot?}]`, `size`, `stagger` (frame) | slap · paper |
| `tag` | hộp đen chữ trắng in hoa | `text`, `size`, `color` | slap · click |
| `ransom` | chữ cắt rời từng ký tự | `text`, `size`, `font: mono\|serif\|mix`, `speed` (frame/ký tự) | type · type |
| `number` | số lớn | `value` hoặc `countTo` (+`countFrom`, `prefix`, `suffix`, `decimals`, `countFrames`), `style: letterpress\|poster\|ink`, `size`, `unit`, `color` | slap · thud |
| `stamp` | con dấu mực | `text`, `size`, `color` | stamp · stamp |
| `tape` | băng dính giấy | `w`, `h` | fade · tape |
| `emoji` | emoji sticker | `char`, `size` | pop · pop |
| `pin` | đinh ghim | `size`, `color` | pop · pop |
| `text` | chữ tự do (không nền) | `text`, `font`, `size`, `weight`, `color`, `w`, `align` | rise · — |
| `arrow` | mũi tên vẽ tay | `from: [x, y]`, `to: [x, y]`, `bend` (−0,5…0,5), `color`, `width`, `drawFrames` | draw · swish |
| `string` | dây nối bảng điều tra | `from`, `to`, `color`, `width`, `pins?` | draw · swish |
| `scribble` | vòng khoanh bút | `x`, `y`, `w`, `h`, `color` | draw · marker |
| `dim` | phủ tối toàn khung (làm nổi lớp sau nó) | `color` | fade · — |

`enter`: `slap` (đập xuống) · `stamp` · `drop` (rơi từ trên) · `pop` · `rise` · `up` (trồi từ mép dưới, cho ảnh tràn đáy) ·
`left`/`right` (trượt vào) · `fade` · `type` · `draw` · `none`. Chuyển động đồ vật chạy "on twos" (giữ mỗi tư thế 2 frame) như stop-motion.

## Máy quay (`props.camera`)

- Chuỗi: `in` (mặc định, đẩy chậm 1 → 1,045) · `out` · `left` · `right` · `up` · `down` · `none`.
- Danh sách điểm nhìn theo lời: `[{"zoom": 1}, {"cue": "hộp hạt", "x": 600, "y": 800, "zoom": 1.1, "move": 20}]` —
  phần tử đầu không `cue` = khung mở cảnh; mỗi điểm sau lia tới (x, y) trong `move` frame kể từ cue.
  Máy không lia quá mép bảng; zoom > 1 sẽ cắt mép — giữ chữ cách mép ≥ `(1 − 1/zoom)·540` px.
- `props.handheld: true` thêm rung tay nhẹ. Cảnh `map` có máy riêng (`views`).

## Nền (`tone`)

`charcoal` (mặc định) · `grid` (giấy kẻ ô xanh lá) · `grid-blue` · `grid-red` · `cream` · `navy` · `map`.
Đặt cho cả tập (`episode.tone`) hoặc từng cảnh (`props.tone`). Tên cũ `light`/`dark` = `cream`/`navy`.
Nền dựng sẵn bằng `python code/voz/tools/make_paper.py` (chạy lại khi đổi màu).

## Chuyển cảnh (`scene.transition`)

`auto` (mặc định, xoay vòng) · `cut` · `sheet` (tờ giấy mới đặt chồng) · `push` (lia ngang) · `push-up` (lia dọc) · `tear` (mép giấy xé quét lên) · `zoom`.
Chuyển cảnh dài 9 frame, chồng lên đầu cảnh mới — **không** làm lệch giọng đọc/phụ đề. Mỗi kiểu có SFX riêng.

## Âm thanh

SFX (`code/studio/src/assets/sfx/*.wav`, sinh bằng `python code/voz/tools/make_sfx.py`): `whoosh`, `swish`, `paper`, `tape`, `pop`,
`click`, `type`, `thud`, `stamp`, `marker`, `ding`, `riser`. Lớp và chuyển cảnh tự gắn SFX; đổi bằng `"sfx": "ding"` hoặc tắt `"sfx": false`.
Tắt cả tập: `"sfx": false`; chỉnh mức: `"sfx_volume": 0.7`.

## Bố cục & vùng an toàn (1080×1920)

- Chữ quan trọng nằm trong y ≈ 240–1200, x ≈ 80–930 (tránh cột nút bên phải và mô tả ở đáy của TikTok/Shorts).
- Ảnh/đồ vật **được phép** tràn ra ngoài vùng này (nhất là mép dưới).
- Phụ đề hộp đen tự động ở y ≈ 1250–1400, từ đang đọc chuyển vàng.
- Watermark VOZ STORY góc trên-trái, dòng nguồn (nhãn đánh máy) góc trên-phải.
- Hạt film + nhấp nháy nhẹ phủ toàn khung (trừ phụ đề, watermark).

## Thêm loại cảnh / loại lớp mới

1. Loại lớp: thêm vào `LayerBody` + `DEFAULTS` trong `code/studio/src/ui/Layers.tsx`; thành phần hình đặt ở `ui/collage.tsx`.
2. Loại cảnh: component trong `code/studio/src/scenes/` (mọi chuyển động dựa trên `useCurrentFrame()`, không CSS animation),
   đăng ký ở `scenes/index.ts` và thêm tên vào `SCENE_TYPES` của `code/voz/episode.py`.
3. Thêm ví dụ vào `code/samples/style-demo`, chạy `npx tsc --noEmit` và render thử.
4. Cập nhật bảng trên.
