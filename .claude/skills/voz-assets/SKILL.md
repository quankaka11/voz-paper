---
name: voz-assets
description: Tìm và chuẩn bị hình ảnh hợp lệ bản quyền cho video VOZ STORY (kênh kiếm tiền) — tìm ảnh trên Wikimedia Commons, Openverse, Pexels, Pixabay, xem contact sheet để chọn, ghi nguồn/license tự động, tách nền làm hiệu ứng cắt dán kiểu Vox. Dùng khi kịch bản cần ảnh thật (nhà ở, đường phố, đồ vật), khi người dùng nói "tìm ảnh", "hình minh họa", "cắt dán", "tách nền", "cutout".
---

# Hình ảnh cho VOZ STORY

## Khi nào cần ảnh thật
Phong cách cắt dán (`docs/style-guide.md`) dựa vào **ảnh thật đã xử lý**: mỗi tập thường **4–8 ảnh** (vật thể chính của hook,
chân dung nhân vật, đồ vật đại diện cho từng ý, ảnh nền tràn đáy). Sơ đồ/số liệu vẫn vẽ bằng code.
Ưu tiên theo thứ tự:
1. **Vật thể tách nền được** (phin, điện thoại, tờ tiền, toà nhà, xe máy) → `cutout` → lớp `image` viền trắng sticker.
2. **Chân dung lịch sử** phạm vi công cộng trên Wikimedia (tranh, tranh khắc) → `cutout` + `treat: "bw"` trông như tranh khắc.
3. **Ảnh bối cảnh** (đường phố, cánh đồng) → lớp `photo` (polaroid/print) hoặc `image` style `full` với `treat: "bw"`/`dark`.
Một ảnh có thể dùng nhiều lần (tràn đáy ở cảnh này, polaroid ở cảnh khác) — đổi `treat`/khung để không lặp.

## Quy trình
1. **Tìm** (từ khóa tiếng Anh thường cho nhiều kết quả hơn):
   ```bash
   python voz.py img search VOZ-xxx "Hanoi apartment buildings"                 # Wikimedia (mặc định)
   python voz.py img search VOZ-xxx "food delivery motorbike" --source openverse
   python voz.py img search VOZ-xxx "bubble tea" --source pexels                # cần PEXELS_API_KEY
   python voz.py img search VOZ-xxx "receipt" --source pixabay                  # cần PIXABAY_API_KEY
   ```
   Lệnh tải ứng viên vào `assets/_candidates/` và in đường dẫn contact sheet.
2. **Xem** contact sheet bằng công cụ Read (đọc ảnh) → chọn ảnh rõ chủ thể, ít chữ/logo, hợp bố cục dọc.
3. **Chọn**: `python voz.py img pick VOZ-xxx <key> --as chung-cu` → `assets/chung-cu.jpg` + ghi vào `sources.json`.
4. **Tách nền** (hiệu ứng cắt dán): `python voz.py img cutout VOZ-xxx assets/chung-cu.jpg` → `assets/chung-cu_cut.png`.
   Xem lại kết quả trên nền xám (ghép thử bằng PIL rồi Read); còn tay người, mảnh bàn… thì xoá vùng đó bằng PIL rồi
   `crop(getbbox())`. Vệt nền khó sửa → dùng `photo` thay cho `image`.
   Ảnh Wikimedia: công cụ tự lấy thumbnail cỡ chuẩn (≤1280px) và bỏ ảnh < 400px — Wikimedia trả 429 khi tải ảnh gốc nhỏ lẻ hoặc tải dồn;
   gặp 429 thì đợi ~1 phút rồi tìm lại với từ khoá hẹp hơn.
5. **Dùng** trong episode.json — thường là lớp của `collage`:
   `{"kind": "image", "src": "assets/chung-cu_cut.png", "w": 600, "treat": "bw", "x": 540, "y": 1960, "anchor": "bottom", "enter": "up"}`,
   hoặc cảnh `image`: `{"type": "image", "props": {"src": "assets/chung-cu_cut.png", "style": "cutout", "credit": "Tên tác giả / CC BY 4.0"}}`.
   License yêu cầu ghi công (CC BY, CC BY-SA) → điền `credit`, và mô tả video sẽ liệt kê từ `sources.json`.

## Quy tắc license (bắt buộc)
- Chỉ dùng: Public Domain, CC0, CC BY, CC BY-SA, Pexels License, Pixabay License. Công cụ đã chặn NC/ND.
- Openverse là trang tổng hợp → mở `url` trang gốc kiểm tra license trước khi dùng cho bản cuối.
- Không dùng ảnh có **người nhận diện được** cho vai tiêu cực (nạn nhân bị lừa, người nghiện điện thoại…) — vi phạm điều khoản Pexels/Pixabay và quyền hình ảnh.
- Logo/thương hiệu (Grab, Shopee…) trong ảnh: chỉ khi đang nói trung lập về chính thương hiệu đó; không để trên bìa.
- Không lấy ảnh từ Google Images, báo chí, ảnh chụp màn hình video người khác.
- GADM cấm thương mại; bản đồ dùng Natural Earth / dữ liệu OSM (ghi "© OpenStreetMap contributors").
- Nhạc nền: YouTube Audio Library (tải tay) hoặc Kevin MacLeod / incompetech.com (CC BY 4.0) — lưu vào `brand/music/` và **ghi dòng credit vào `brand/music/credits.json`** (publish-kit tự chèn vào mô tả YouTube + caption TikTok). Không dùng nhạc trend/nhạc có bản quyền.

## Xử lý ảnh (`treat`)
`bw` (mặc định cho người/đồ vật nền) · `color` (chỉ cho **một** chi tiết cần nổi trong khung) · `sepia`/`faded` (tư liệu cũ) · `dark` (ảnh làm nền).
Hạt film phủ toàn khung giúp ảnh từ nhiều nguồn trông cùng chất liệu — không cần chỉnh màu tay.

## Bản đồ
Cảnh `map` dùng Natural Earth 50m (gói `world-atlas`, public domain) có sẵn — không cần tải ảnh bản đồ. Việt Nam luôn kèm Hoàng Sa, Trường Sa.

## Biểu tượng
Emoji chỉ là phương án dự phòng (hiện dạng sticker viền trắng); ưu tiên ảnh vật thể thật. Cần icon vector thì dùng bộ license MIT/Apache (Lucide, Tabler) — tải SVG thủ công vào `assets/`.
