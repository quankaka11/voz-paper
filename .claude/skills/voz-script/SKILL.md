---
name: voz-script
description: Viết kịch bản video ngắn 45–60s kiểu Vox cho VOZ STORY và chuyển thành episode.json chạy được — hook 3 giây theo công thức "hiện tượng cụ thể + nghịch lý + lời hứa giải thích", cấu trúc hỏi → lần dấu vết → cơ chế → kiểm tra giả định → kết luận + câu hỏi bình luận, lời đọc tối ưu cho TTS tiếng Việt, chọn loại cảnh, cue khớp hình với lời, ảnh bìa. Dùng sau voz-research, hoặc khi người dùng nói "viết kịch bản", "script", "lời đọc", "storyboard", "episode.json".
---

# Viết kịch bản + episode.json

Đọc trước: `research.md` của tập, `data/style_video.md` (mục 3 hook, 5 bố cục, 6 mô-típ), `docs/scene-types.md` (định dạng + loại cảnh).

## 1. Hook (0–3s) — quyết định tất cả
Công thức: **Hiện tượng cụ thể + Nghịch lý + Lời hứa giải thích**. Chọn 1 trong 5 kiểu:
1. Câu hỏi ai cũng từng gặp — "Ứng dụng này miễn phí. Vậy ai đang trả tiền?"
2. Hai điều tưởng không thể cùng đúng — "Đăng ký mất 2 bước. Hủy thì…"
3. Con số cụ thể — "Món 39.000 đồng. Thanh toán 70.000 đồng."
4. Một hệ thống nhiều bên — "Mua một món hàng, có ít nhất 4 bên chia tiền."
5. Khiến người xem nhìn lại mình — "Tháng này bạn trả tiền cho bao nhiêu dịch vụ không dùng?"

Cấm: chào hỏi/giới thiệu kênh, "bạn sẽ không tin được", hứa "sự thật bị che giấu", câu hỏi quá rộng, con số sốc không nguồn.
Hình cảnh đầu phải là **vật thể cụ thể** (hóa đơn, điện thoại, giá) — dùng `title` có emoji, `phone`, `receipt` hoặc `bigNumber`.

## 2. Cấu trúc 45–60s
| Mốc | Nhiệm vụ | Cảnh gợi ý |
|---|---|---|
| 0–3s | Hook — vật thể/sự việc cụ thể | title, phone, bigNumber |
| 3–8s | Câu hỏi trung tâm + video sẽ trả lời gì | title |
| 8–25s | Cơ chế thứ nhất: ví dụ, sơ đồ, phép tính | flow, receipt, compare |
| 25–43s | Bằng chứng / điểm ngoặt khiến cách hiểu ban đầu chưa đủ | bars, bigNumber, image |
| 43–60s | Kết luận + giới hạn + câu hỏi mở cho bình luận | list, question |

Mỗi cảnh phải là **một bước tiến mới** (thông tin mới), không lặp ý, không câu đệm "nhưng sự thật còn đáng sợ hơn".
Một video = **một câu hỏi trung tâm**.

## 3. Lời đọc (vo) cho TTS
- Nhịp ≈ 5 âm tiết/giây → **tổng 230–290 âm tiết** cho 50–58s. Mỗi cảnh 1–3 câu ngắn (3–7 giây).
- Văn nói, xưng "bạn"; câu ngắn; dấu chấm để ngắt nghỉ trước con số/ý chốt.
- Viết số theo cách đọc: "39.000 đồng", "84 triệu đồng một mét vuông", "quý một năm 2026" (tts.py có tự sửa một số mẫu, nhưng đừng dựa vào).
- Tên riêng nước ngoài đọc sai → thêm vào `config/lexicon.json`. Kiểm nhanh: `python voz.py say "câu" --dry`.
- Không đọc nguyên văn chữ trên màn hình; hình và lời bổ sung cho nhau.

## 4. Chọn cảnh (chống "inauthentic content")
- 8–12 cảnh. Dùng ít nhất 4 loại cảnh khác nhau; không lặp một chuỗi cảnh y hệt tập trước (xem `videos/INDEX.md` và episode.json các tập cũ).
- Mỗi cảnh có số liệu thật → `"source": "Tên nguồn, thời điểm"`. Số giả định → `"illustrative": true`.
- Dùng `cue` để phần tử hiện đúng lúc lời đọc nhắc tới (cụm từ phải xuất hiện nguyên văn trong `vo`).
- Highlight `==…==` tối đa 1–2 cụm mỗi câu chữ; `**…**` cho từ nhấn màu cam.
- Không dùng logo/thương hiệu thật trong `phone` (đặt tên chung: "App giao đồ ăn").
- Cảnh cuối luôn là `question` với 2 lựa chọn A/B cụ thể để kéo bình luận.

## 5. Ảnh bìa (`cover`)
`kicker` (tên series con) + `text` 2–6 từ có 1 cụm `==…==` + `emoji` hoặc `image` (PNG đã tách nền). Bìa nêu **mâu thuẫn**, không lặp nguyên tiêu đề.
Ví dụ: `{"kicker": "Ai đang trả tiền?", "text": "39K → ==70K==?", "emoji": "🧾"}`.

## 6. Ghi file và kiểm tra
1. `script.md`: bảng `| # | giây | lời đọc | hình | nguồn |` + 3 phương án tiêu đề.
2. `episode.json` theo `docs/scene-types.md`.
3. `python voz.py build VOZ-xxx` → xem bảng thời lượng: tổng 45–60s, không có `⚠`. Dài quá → cắt ý, không nói nhanh hơn.
4. `python voz.py status VOZ-xxx --stage scripted`.
5. Gửi người dùng bảng kịch bản để duyệt **trước khi render bản cuối**.
