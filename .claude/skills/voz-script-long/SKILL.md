---
name: voz-script-long
description: Viết kịch bản video DÀI 16:9 (10–14 phút) kiểu Vox cho VOZ STORY và chuyển thành episode.json chạy được — lời hứa & đóng gói trước, dàn ý 3–5 chương (cổng duyệt), cold open 30 giây, vòng mở, nhịp giữ chân 60–90 giây, lời đọc ~3.000 âm tiết cho TTS, chọn cảnh tư liệu (callout, timeline, lineChart, map, quote, footage), mốc chương YouTube, ảnh bìa 1280×720, danh sách Shorts cắt ra. Dùng khi tập có "format": "long", hoặc người dùng nói "video dài", "kịch bản dài", "long-form", "viết chương".
---

# Viết kịch bản video dài (format `long`)

Đọc trước: `research.md` của tập (bản dài), **`docs/longform-checklist.md`** (mục 2–5), **`docs/style-guide.md`** (mục 4 + mục 7 khung 16:9),
`docs/scene-types.md` (định dạng + cảnh video dài), mẫu `code/samples/long-test/episode.json`, `docs/learnings.md` nếu có.
Shorts 45–60s dùng skill `voz-script`.

## 0. Hai trụ — hai khung kể chuyện
| Trụ | Khung 4 nhịp | Ví dụ |
|---|---|---|
| **A. Hệ thống vô hình** | Vật thể quen thuộc → ai tham gia & tiền/dữ liệu chảy thế nào → bằng chứng + cú lật → giá trị, đánh đổi, điều chưa biết | Mã giảm giá, mở rộng đường, đơn đồ ăn |
| **B. Lịch sử một hệ thống** | Thế giới trước khi có X → nhân vật & khoảnh khắc ra đời → vì sao lan ra (cơ chế) → hệ quả hôm nay ở Việt Nam + điều còn dang dở | Container, đường sắt Bắc–Nam, cáp biển |
Trụ B **luôn quay về Việt Nam** ở 25–35% cuối; trụ A **luôn có lịch sử ngắn** (1 chương) để giải thích vì sao hệ thống thành ra như vậy.

## 1. Lời hứa & đóng gói — làm TRƯỚC
1. Viết 3 tiêu đề (≤ 70 ký tự) + 3 ý tưởng ảnh bìa (headline 1–3 chữ, vật thể thật, một điểm đỏ, `panel` màu). Ghi vào `script.md`.
2. Chọn cặp tiêu đề–bìa **hứa cùng một điều**; ghi "10 giây đầu chứng minh lời hứa bằng: …".
3. Mọi cảnh về sau phải phục vụ lời hứa này — đoạn nào không phục vụ thì cắt.

## 2. Dàn ý — ⛳ cổng duyệt 0 (gửi người dùng trước khi viết lời)
- 3–5 chương × 2–3 phút. Mỗi chương: **câu hỏi nhỏ → bằng chứng → một phát hiện** + vòng mở sang chương sau.
- Cú lật/kiểm tra giả định ở ~70% thời lượng.
- Bảng vòng mở trong `script.md`: mở ở đâu, đóng ở đâu (câu hỏi trung tâm mở ở s01, đóng ở phần kết).
- Gửi: câu hỏi trung tâm · 3 tiêu đề · 3 ý tưởng bìa · bảng chương · danh sách tư liệu chính. Chờ duyệt.

## 3. Cấu trúc thời gian (12 phút)
| Mốc | Nhiệm vụ | Cảnh gợi ý |
|---|---|---|
| 0:00–0:30 | **Cold open**: tư liệu/vật thể/con số cụ thể + nghịch lý + lời hứa; không chào hỏi | collage (ảnh thật + nhãn), callout, bigNumber, map |
| 0:30–1:00 | Câu hỏi trung tâm + vì sao bạn nên quan tâm + 1–2 vòng mở | collage, title `lines` |
| ~0:30 | *(tự chèn)* intro kênh ≤ 5s | `intro` |
| 1:00–9:30 | 3–5 chương, mỗi chương mở bằng `chapter` | xem bảng cảnh mục 5 |
| ~8:00 | Cú lật / kiểm tra giả định (đổi nền + nhạc) | document, lineChart, quote |
| 9:30–11:00 | Kết: trả lời câu hỏi, nối đời sống người xem, giới hạn, câu hỏi A/B | collage, question |
| cuối | *(tự chèn)* màn hình kết thúc 20s | `outro` |
**Nhịp giữ chân mỗi 60–90 giây** (lập bảng trong `script.md`): điều bất ngờ · đổi nền · bản đồ · tư liệu thật · con số lớn · câu hỏi · khoảng lặng.

## 4. Lời đọc (vo)
- **2.800–3.200 âm tiết** cho 12 phút (giọng `blv` ≈ 3,5–4,5 âm tiết/giây gồm nghỉ — đo lại sau `build`). Mỗi chương 500–800 âm tiết.
- Cảnh dài 4–10 giây, 1–3 câu; câu ngắn, văn nói, xưng "bạn"; số viết theo cách đọc ("1.200 container mỗi tháng").
- Trước cú lật: câu ngắn + cảnh không lời 0,5–1s (`duration`) hoặc `pad` lớn hơn để tạo khoảng lặng.
- **Cắt lặp**: đọc lại cả kịch bản, xoá mọi câu nhắc lại điều đã nói (trừ một câu tóm tắt ở đầu mỗi chương).
- Tên nước ngoài: cách đọc quen với người Việt, thêm vào `config/lexicon.json`; lần đầu xuất hiện kèm `props.lower` (tên gốc + vai trò).
- Không đọc lại chữ trên màn hình; không câu đệm giật gân.

## 5. Chọn cảnh (khung 1920×1080)
- Ước lượng 90–150 cảnh. **≥ 70% có hình thật**; cảnh chỉ có chữ ≤ 10%.
- Không khung nào đứng yên > 5–6 giây: mỗi câu một `cue` mới hoặc một điểm nhìn `camera`.
- Bộ cảnh video dài: `chapter` (mở chương) · `callout` (ảnh tư liệu khoanh vàng — trụ B ≥ 1 lần/chương) · `timeline` · `lineChart` ·
  `quote` (nguyên văn có nguồn) · `footage` (phim tư liệu 3–6s) · `props.lower` (lower third) — cùng các cảnh cũ (`collage`, `map`,
  `document`, `bigNumber`, `bars`, `compare`, `flow`, `receipt`, `image`).
- Toạ độ collage theo 1920×1080, bố cục 2–3 vùng ngang; chữ trong x 120–1800, y 70–1010; chừa góc dưới-trái khi dùng `lower`.
- Mỗi chương một tông nền (`props.tone`); chuyển cảnh `tear` vào thẻ chương, đa dạng ở chỗ khác.
- Số liệu thật → `source`; giả định → `illustrative: true`. `cue` phải có nguyên văn trong `vo`.
- Nhạc theo chương: `"music": [{"from": "s01", "src": "brand/music/investigations.mp3"}, {"from": "c3", "src": "brand/music/deliberate-thought.mp3"}]`.
- Liệt kê tư liệu cần tìm (cột "hình" trong `script.md`) — thường 60–120 ảnh/phim; ưu tiên public domain (xem skill `voz-assets`).
- Khác bố cục tập trước (chống inauthentic content): thứ tự cảnh, kiểu cold open, tông nền.

## 6. Ảnh bìa 16:9 — 3 phương án (`covers`), người dùng chọn
Viết 3 phương án trong `"covers": [{"id": "…", …}]` (mỗi phương án một góc: con số nghịch lý / câu hỏi đời sống / vật thể lịch sử),
render `python voz.py cover VOZ-xxx` → `export/<tập>_cover_<id>.png`, Read từng ảnh soát lỗi ghép, gửi người dùng chọn → `"cover_pick": "<id>"`.
Ưu tiên **một vật thể chính** tách nền sạch; ghép nhiều lớp (`layers`) chỉ khi bố cục rõ ràng. Ví dụ một phương án:
`{"kicker": "Cỗ máy phía sau cuộc sống", "headline": "1 hộp **thép**", "lines": [{"text": "làm cả thế giới rẻ đi?", "color": "yellow"}],
"image": "assets/container_cut.png", "imageW": 620, "panel": "red", "stamp": "1956"}` — thumbnail 1280×720; toạ độ `circle`/`arrow`
theo khung đó; góc dưới-phải trống. Xem nhanh: `python voz.py cover VOZ-xxx` rồi Read PNG.

## 7. Shorts cắt từ tập (3–4)
Trong `script.md` bảng "Shorts cắt từ tập này": cảnh nguồn · phát hiện trọn vẹn · câu kết dẫn về video dài. Mỗi Short làm thành
tập riêng `--format short` (skill `voz-script`), dùng lại assets/research, bố cục dọc riêng (không crop 16:9).

## 8. Nội dung đăng
`meta.json > publish`: `title`, `description` (2–3 câu, câu đầu có từ khóa người Việt sẽ tìm), `hashtags` (3–5), `pinned_comment`
(câu hỏi A/B). Mục lục chương, nguồn, phụ đề, màn hình kết thúc do `publish-kit` tự sinh (skill `voz-publish`).

## 9. Ghi file và kiểm tra
1. `script.md` theo mẫu bản dài (đóng gói, vòng mở, bảng theo chương, nhịp giữ chân, Shorts).
2. `episode.json`: `"format": "long"`, `intro`, `cover`, cảnh `chapter` mở mỗi chương.
3. `python voz.py build VOZ-xxx` → bảng thời lượng: tổng 600–840s (10–14 phút, chưa tính outro 20s), không `⚠` (cue, file, chương).
   Dài quá → cắt ý/cắt chương, không đọc nhanh hơn.
4. Soát `docs/longform-checklist.md` mục 4–5.
5. `python voz.py status VOZ-xxx --stage scripted` → ⛳ cổng duyệt 1: gửi người dùng bảng kịch bản + tổng thời lượng **trước khi tìm tư liệu hàng loạt và render**.
