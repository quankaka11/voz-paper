---
name: voz-research
description: Nghiên cứu một chủ đề cho video VOZ STORY trước khi viết kịch bản — chốt câu hỏi trung tâm, tìm số liệu có nguồn (ưu tiên báo cáo chính thức, cơ quan quản lý, nghiên cứu), phân biệt dữ kiện / ví dụ minh họa / giả thuyết, chấm điểm chủ đề, ghi research.md và sources.json. Dùng khi người dùng nói "nghiên cứu chủ đề", "research tập", "tìm số liệu", "kiểm chứng", hoặc bắt đầu một tập mới.
---

# Nghiên cứu chủ đề VOZ STORY

Lời hứa của kênh: *"Bóc tách những hệ thống vô hình đang quyết định cách chúng ta tiêu tiền, dùng Internet và sống trong xã hội hiện đại."*
Video tốt chỉ ra **ai tham gia, cơ chế ra sao, bằng chứng nói gì, lợi ích/chi phí phân bổ thế nào — và điều gì chưa thể kết luận**.

## Đầu vào
- Thư mục tập `videos/VOZ-xxx_slug/` (tạo bằng `python voz.py new "Tiêu đề" --series ai-tra-tien --topic N` nếu chưa có).
- Chủ đề gốc trong `data/topics.md` (20 chủ đề, nhóm A–E) và nguyên tắc trong `data/style_video.md` mục 7.

## Quy trình
1. **Đọc** mục chủ đề tương ứng trong `data/topics.md` (câu hỏi khơi gợi, lưu ý kiểm chứng).
2. **Chốt 1 câu hỏi trung tâm** cụ thể, gần đời sống người Việt (vd "Một đơn 39.000đ thành 70.000đ như thế nào?"), rồi viết 3 góc tiếp cận: *tò mò*, *đời sống*, *tranh luận* → chọn góc có câu hỏi rõ nhất, chứng minh được bằng hình, không cần giật gân.
3. **Tìm nguồn** bằng WebSearch/WebFetch (gửi nhiều truy vấn song song, cả tiếng Việt lẫn tiếng Anh):
   - Ưu tiên: báo cáo chính thức, cơ quan quản lý (Bộ Công Thương, NHNN, GSO, OECD, FTC…), nghiên cứu, báo cáo ngành (CBRE, Savills, Metric, Google-Temasek e-Conomy SEA…), trang chính sách/điều khoản của chính nền tảng.
   - Tin tức chỉ để phát hiện vấn đề, không làm bằng chứng duy nhất.
   - Với mỗi con số ghi: giá trị, **đơn vị, phạm vi (khu vực/đối tượng), thời điểm**, nguồn URL, ngày truy cập.
4. **Phân loại mọi luận điểm**: `dữ kiện` (có nguồn) · `minh họa` (ví dụ giả định — video phải gắn nhãn "Minh họa") · `giả thuyết` (phải nói "có thể").
5. **Tìm góc phản biện và giới hạn**: hệ thống này mang lại giá trị gì? ngoại lệ? điều gì chưa có dữ liệu?
6. **Chấm điểm** (1–5) theo 6 tiêu chí của kênh: liên quan · tò mò · tạo thảo luận · hình ảnh hóa được · bằng chứng · mở rộng series. Bằng chứng ≤ 2 → báo người dùng trước khi viết kịch bản.
7. **Ghi kết quả**: điền `research.md` trong thư mục tập (đã có khung), và thêm từng nguồn số liệu vào `sources.json`:
   ```json
   {"type": "data", "claim": "Giá sơ cấp căn hộ HN bình quân 84 tr/m² (gồm Văn Giang)", "title": "CBRE Q1/2026 Hanoi market", "url": "https://…", "publisher": "CBRE", "date": "2026-04", "retrieved": "2026-10-17"}
   ```
8. Cập nhật trạng thái: `python voz.py status VOZ-xxx --stage researched`.

## Lằn ranh đỏ (không vi phạm)
- Không khẳng định "điện thoại nghe lén", "doanh nghiệp X lừa đảo/thao túng" khi không có bằng chứng; mặc định nhiều hệ thống tồn tại vì có giá trị thật, kèm đánh đổi.
- Không đưa con số gây sốc thiếu thời điểm/phạm vi/nguồn. Khảo sát không được nói như tỷ lệ của "người Việt".
- Không suy diễn mô hình doanh thu của một app cụ thể nếu chưa xem báo cáo/điều khoản của chính app đó — nói ở mức "các mô hình phổ biến".
- Ranh giới hành chính Việt Nam: lưu ý sáp nhập tỉnh 07/2025 (34 tỉnh) khi dùng bản đồ/số liệu theo tỉnh.

## Đầu ra mong đợi
`research.md` có: câu hỏi trung tâm, góc chọn + lý do, 5–10 dữ kiện có nguồn, 1–3 ví dụ minh họa (ghi rõ), phản biện/giới hạn, điểm chấm, gợi ý hook. Báo lại người dùng tóm tắt 5 dòng + điểm yếu nếu có.
