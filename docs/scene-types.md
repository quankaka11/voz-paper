# Định dạng `episode.json` và thư viện cảnh

Mỗi tập là một file `episode.json` mô tả **danh sách cảnh**. Claude viết file này; `python voz.py build` tạo giọng đọc
cho từng cảnh, đo thời lượng, khớp thời điểm hiện chữ và xuất `build/props.json` cho Remotion
(`code/studio`). Không cần viết TSX mới cho từng tập.

```jsonc
{
  "voice": "nam_bac_tram",        // tùy chọn, mặc định lấy từ config/channel.json
  "speed": null,                  // null = tốc độ gợi ý của giọng
  "music": "brand/music/x.mp3",   // tùy chọn, nhạc nền (YouTube Audio Library), tự giảm còn 8%
  "cover": {"kicker": "Ai đang trả tiền?", "text": "App ==miễn phí== kiếm tiền từ đâu?", "emoji": "📱"},
  "scenes": [
    {
      "id": "s01",                // duy nhất trong tập
      "type": "title",            // một trong các loại bên dưới
      "vo": "Lời đọc của cảnh.",  // giọng đọc; thời lượng cảnh = thời lượng đọc + 0,35s
      "duration": 2.5,            // chỉ dùng khi cảnh không có vo (giây)
      "source": "CBRE, Q1/2026",  // hiện "Nguồn: …" — BẮT BUỘC khi cảnh có số liệu thật
      "illustrative": true,       // hiện nhãn "Minh họa" — BẮT BUỘC khi số liệu là ví dụ giả định
      "props": { }
    }
  ]
}
```

## Cú pháp chữ (mọi trường text)

| Viết | Hiển thị |
|---|---|
| `==miễn phí==` | quét bút dạ quang vàng (tối đa 1–2 cụm mỗi câu) |
| `**ai**` | chữ màu cam nhấn |

## Khớp hình với lời đọc: `cue`

Phần tử nào có `"cue": "cụm từ trong vo"` sẽ hiện **đúng lúc giọng đọc nói tới cụm đó**
(so khớp không dấu, không phân biệt hoa thường). Không có `cue` → các phần tử hiện đều trong 60% đầu cảnh.
`build` báo `⚠ không thấy cue` nếu cụm không có trong lời đọc.

## Các loại cảnh

| type | Dùng khi | props |
|---|---|---|
| `title` | Hook, câu hỏi trung tâm, chuyển ý | `kicker?`, `text`, `sub?`, `emoji?`, `size?` (mặc định 104) |
| `bigNumber` | Một con số gây chú ý | `kicker?`, `value` **hoặc** `countTo` (+`prefix`, `suffix`, `decimals`), `label`, `note?`, `color?` |
| `receipt` | Bóc tách hóa đơn / các lớp phí | `kicker?`, `title`, `items: [{label, value, note?, cue?}]`, `total: {label, value, cue?}` — giá trị bắt đầu bằng `-` tô xanh |
| `bars` | So sánh số liệu | `kicker?`, `title`, `unit`, `bars: [{label, value, display?, highlight?, cue?}]`, `max?` |
| `compare` | Hai phía đối lập (đăng ký vs hủy, rẻ vs đắt) | `kicker?`, `title?`, `left/right: {title, tone: good\|bad\|neutral, items: [string \| {text, cue}]}` |
| `flow` | Sơ đồ hệ thống / dòng tiền | `layout: radial\|chain`, `title?`, `center?: Node` (radial), `nodes: Node[]`, `direction: out\|in`, `arrowLabels?: string[]` — `Node = {label, emoji?, note?, highlight?, cue?}` |
| `list` | Tóm tắt 2–4 ý | `kicker?`, `title?`, `items: [{emoji?, text, color?, cue?}]` |
| `phone` | Mô phỏng màn hình app (không dùng logo thật) | `app`, `tagline?`, `price?`, `rows: [{emoji, label, value?, highlight?, cue?}]`, `stamp?`, `kicker?`, `title?` |
| `image` | Ảnh thật / cắt dán | `src: "assets/x.jpg"`, `style: polaroid\|cutout\|full`, `kenburns: in\|out\|left\|right`, `kicker?`, `text?`, `credit?`, `tilt?` |
| `question` | Kết bài: câu hỏi mở cho bình luận (nền navy, có logo) | `text`, `options?: string[]` (A/B), `sub?` (mặc định "Còn bạn thì sao?") |

`props.tone: "dark"` đặt bất kỳ cảnh nào lên nền navy.

## Bố cục & vùng an toàn (1080×1920)

- Nội dung chính nằm trong y ≈ 240–1200, x ≈ 80–930 (tránh cột nút bên phải và mô tả ở đáy của TikTok/Shorts).
- Phụ đề tự động ở y ≈ 1240–1400, từ đang đọc tô vàng.
- Watermark VOZ STORY góc trên-trái, dòng nguồn góc trên-phải.
- Mỗi cảnh tự đẩy máy chậm (scale 1 → 1,035) và hiện dần 4 frame đầu.

## Thêm loại cảnh mới

1. Viết component trong `code/studio/src/scenes/` (mọi chuyển động phải dựa trên `useCurrentFrame()`, không dùng CSS animation).
2. Đăng ký trong `code/studio/src/scenes/index.ts` và thêm tên vào `SCENE_TYPES` của `code/voz/episode.py`.
3. Thêm cảnh mẫu vào `code/studio/src/demo.json`, chạy `npx tsc --noEmit` và render thử.
4. Cập nhật bảng trên.
