# Nghiên cứu công cụ làm video kiểu Vox (17/10/2026)

Tóm tắt deep research về công cụ, bản quyền và chính sách kiếm tiền. Kết luận đã áp dụng vào dự án.
Mục đánh dấu *(chưa xác minh)* cần kiểm tra lại trước khi ra quyết định quan trọng.

## Stack đã chọn

| Lớp | Lựa chọn | Lý do |
|---|---|---|
| Dựng hình | **Remotion 4** (React/TSX) — `code/studio` | Agent điều khiển bằng JSON props; có captions, paths, transitions, google-fonts. Miễn phí cho cá nhân / công ty ≤ 3 người (từ 4 người: trả phí; theo dõi thay đổi license ở v5). |
| Giọng đọc | **ZipVoice tự host** (+ PhoWhisper ASR) | Có sẵn, trả kèm timing câu + phụ đề; clone được giọng riêng. |
| Phụ đề | Timing từ ZipVoice → `Captions.tsx` | Không cần chạy ASR lại. |
| Âm thanh / QA | **ffmpeg** (winget `Gyan.FFmpeg`) | loudnorm −14 LUFS, ffprobe kiểm tra, contact sheet. |
| Ảnh | Wikimedia Commons, Openverse (không key); Pexels, Pixabay (key miễn phí) | Lọc license dùng thương mại; ghi nguồn tự động vào `sources.json`. |
| Tách nền | **rembg** model `isnet-general-use` | Model mặc định `bria-rmbg` cần trả phí khi dùng thương mại → không dùng. |
| Bìa | `remotion still` (chung component với video) | Một bộ nhận diện cho cả video lẫn bìa. |
| Đăng | YouTube Studio / TikTok Studio thủ công (giai đoạn đầu) | Xem mục "Tự động đăng" bên dưới. |

### Vì sao không chọn công cụ khác

| Công cụ | Nhận xét |
|---|---|
| Motion Canvas / Revideo | Hợp vector animation nhưng tình trạng bảo trì không rõ. |
| MoviePy v2 | Chậm khi nhiều layer, khó làm kinetic typography. |
| Manim | Mạnh về toán, yếu với collage ảnh. |
| Editly | JSON đơn giản nhưng ít hiệu ứng, một người bảo trì. |
| Shotstack / Creatomate | Render cloud trả phí ($39/tháng/250 phút với Shotstack). |
| MoneyPrinterTurbo, ShortGPT | Kiểu "stock slideshow" — đúng mẫu YouTube coi là *inauthentic content*. Chỉ tham khảo module tìm Pexels. |

## Bản quyền nguồn hình

| Nguồn | Kiếm tiền | Lưu ý |
|---|---|---|
| Pexels | OK, không bắt buộc ghi công | Không mô tả người nhận diện được theo hướng xấu; không ngụ ý họ/thương hiệu ủng hộ. |
| Pixabay | OK | Phải cache, cấm tải hàng loạt có hệ thống. |
| Wikimedia Commons | Tùy file | Chỉ PD / CC0 / CC BY / CC BY-SA. Tránh NC, ND. Ghi tác giả + license. |
| Openverse | Lọc `commercial,modification` | Trang tổng hợp — xác minh license tại trang gốc. |
| Our World in Data | CC BY 4.0 | Ghi "Nguồn: X – xử lý bởi Our World in Data". |
| Natural Earth | Public domain | Dùng cho bản đồ. |
| OpenStreetMap | ODbL | Ghi "© OpenStreetMap contributors"; tự render từ dữ liệu, không tải tile hàng loạt. |
| GADM | **Cấm thương mại** | Không dùng. Lưu ý: ranh giới 63 tỉnh đã lỗi thời sau sáp nhập 07/2025. |
| Unsplash API | Vùng xám | API bắt buộc hotlink → không hợp pipeline render. |
| unDraw | OK, nhưng cấm tải tự động | Chỉ dùng thủ công. |
| Nhạc | YouTube Audio Library | Tránh Content ID. |

Luật SHTT Việt Nam không có "fair use" kiểu Mỹ — chỉ có ngoại lệ trích dẫn hợp lý *(chưa thẩm định pháp lý)*.
Logo Shopee/Grab/Netflix… chỉ dùng để nhận diện khi bình luận, không dùng trên bìa theo cách ngụ ý tài trợ.

## Font có đủ dấu tiếng Việt (Google Fonts, OFL)

- Tiêu đề serif: **Playfair Display** (đang dùng), Newsreader, Source Serif 4, Lora.
- Thân chữ / phụ đề: **Be Vietnam Pro** (đang dùng), Inter, Lexend, Montserrat.
- Nhãn số liệu: **Oswald** (đang dùng), Barlow Condensed, Anton.
- Viết tay: **Patrick Hand** (đang dùng).
- Tránh (thiếu subset vietnamese): Bebas Neue, DM Serif Display, Archivo Black, Permanent Marker.

## Chính sách kiếm tiền

**YouTube**
- Từ 15/07/2025 "repetitious content" đổi thành **"inauthentic content"**: không kiếm tiền với nội dung theo mẫu lặp,
  "minimal or no narrative, commentary, or educational value", hoặc AI làm từ template chung chung.
- Được phép: dùng chung intro/outro, series cùng định dạng nhưng **mỗi tập một luận điểm riêng**, dùng AI trong quy trình.
- → Mỗi tập phải có câu hỏi riêng, số liệu + nguồn riêng, góc nhìn Việt Nam, bố cục cảnh khác nhau.
- Nhãn AI chỉ bắt buộc với nội dung *chân thực* (người thật, sự kiện thật bị chỉnh, cảnh giả như thật). Script/TTS/animation không cần khai báo.
- YPP đã có ở Việt Nam: 1.000 subscriber + 10 triệu lượt xem Shorts trong 90 ngày (hoặc 4.000 giờ xem video dài).

**TikTok**
- Creator Rewards Program *có vẻ chưa mở cho Việt Nam (chưa xác minh trên trang chính thức)* và chỉ tính video > 1 phút.
- Hướng kiếm tiền khả thi ở VN: affiliate TikTok Shop, quà LIVE, hợp đồng nhãn hàng. Không dùng VPN để lách.
- → TikTok dùng để kéo khán giả; nếu sau này cần CRP thì làm bản > 60s.

## Tự động đăng

- **YouTube Data API v3**: upload ~100 unit (từ 12/2025), mặc định 100 lượt/ngày. Project chưa qua audit → video bị khóa *private*.
  Khả thi sau khi nộp audit (miễn phí).
- **TikTok Content Posting API**: app chưa audit chỉ đăng `SELF_ONLY`; audit yêu cầu app phục vụ nhiều người dùng → **không khả thi cho một người**.
- → Giai đoạn đầu đăng thủ công; `python voz.py publish-kit` chuẩn bị sẵn tiêu đề, mô tả, hashtag, bìa.

## Hiệu năng render đo trên máy này

16 nhân, RTX 3050 Laptop: ~4–5 khung/giây ở 1080×1920 (cả cảnh trống) → video 55s ≈ 5–7 phút.
Concurrency 4–6 tốt nhất; `--gl=angle` (GPU) chậm hơn. Bản nháp `--draft` (540p) nhanh gấp ~2 lần.

## Nguồn chính

Remotion [license](https://www.remotion.pro/license), [captions](https://www.remotion.dev/docs/captions/create-tiktok-style-captions) ·
[Pexels license](https://www.pexels.com/license/) · [Pixabay license](https://pixabay.com/service/license-summary/) ·
[Commons credit line](https://commons.wikimedia.org/wiki/Commons:Credit_line) · [rembg](https://github.com/danielgatis/rembg) ·
[GADM license](https://gadm.org/license.html) · [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/) ·
[YouTube monetization policy](https://support.google.com/youtube/answer/1311392) · [AI disclosure](https://support.google.com/youtube/answer/14328491) ·
[YPP](https://support.google.com/youtube/answer/13429240) · [YouTube quota](https://developers.google.com/youtube/v3/determine_quota_cost) ·
[TikTok Content Posting API](https://developers.tiktok.com/doc/content-posting-api-get-started) ·
[Plagiarism Today về inauthentic content](https://www.plagiarismtoday.com/2025/07/08/youtube-targets-inauthentic-content/)
