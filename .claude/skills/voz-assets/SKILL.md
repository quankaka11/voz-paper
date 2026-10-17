---
name: voz-assets
description: Tìm và chuẩn bị hình ảnh hợp lệ bản quyền cho video VOZ STORY (kênh kiếm tiền) — tìm ảnh trên Wikimedia Commons, Openverse, Pexels, Pixabay, xem contact sheet để chọn, ghi nguồn/license tự động, tách nền làm hiệu ứng cắt dán kiểu Vox. Dùng khi kịch bản cần ảnh thật (nhà ở, đường phố, đồ vật), khi người dùng nói "tìm ảnh", "hình minh họa", "cắt dán", "tách nền", "cutout".
---

# Hình ảnh cho VOZ STORY

## Khi nào cần ảnh thật
Phần lớn cảnh được **vẽ bằng code** (receipt, flow, bars, phone…) — rẻ, rõ, không lo bản quyền. Chỉ tìm ảnh khi
cần cảm giác thực tế: khu chung cư, đường phố đông xe, ly trà sữa, người giao hàng… Mỗi tập thường 0–3 ảnh.

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
   Xem lại kết quả; nếu còn vệt nền thì dùng `style: polaroid` thay vì `cutout`.
5. **Dùng** trong episode.json: `{"type": "image", "props": {"src": "assets/chung-cu_cut.png", "style": "cutout", "credit": "Tên tác giả / CC BY 4.0"}}`.
   License yêu cầu ghi công (CC BY, CC BY-SA) → điền `credit`, và mô tả video sẽ liệt kê từ `sources.json`.

## Quy tắc license (bắt buộc)
- Chỉ dùng: Public Domain, CC0, CC BY, CC BY-SA, Pexels License, Pixabay License. Công cụ đã chặn NC/ND.
- Openverse là trang tổng hợp → mở `url` trang gốc kiểm tra license trước khi dùng cho bản cuối.
- Không dùng ảnh có **người nhận diện được** cho vai tiêu cực (nạn nhân bị lừa, người nghiện điện thoại…) — vi phạm điều khoản Pexels/Pixabay và quyền hình ảnh.
- Logo/thương hiệu (Grab, Shopee…) trong ảnh: chỉ khi đang nói trung lập về chính thương hiệu đó; không để trên bìa.
- Không lấy ảnh từ Google Images, báo chí, ảnh chụp màn hình video người khác.
- GADM cấm thương mại; bản đồ dùng Natural Earth / dữ liệu OSM (ghi "© OpenStreetMap contributors").
- Nhạc nền chỉ từ YouTube Audio Library, lưu vào `brand/music/`.

## Biểu tượng
Ưu tiên emoji (đã có trong mọi loại cảnh) cho đồng bộ và nhẹ. Cần icon vector thì dùng bộ license MIT/Apache (Lucide, Tabler) — tải SVG thủ công vào `assets/`.
