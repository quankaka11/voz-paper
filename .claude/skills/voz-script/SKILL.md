---
name: voz-script
description: Viết kịch bản video ngắn 45–60s kiểu Vox cho VOZ STORY và chuyển thành episode.json chạy được — hook 3 giây theo công thức "hiện tượng cụ thể + nghịch lý + lời hứa giải thích", cấu trúc hỏi → lần dấu vết → cơ chế → kiểm tra giả định → kết luận + câu hỏi bình luận, lời đọc tối ưu cho TTS tiếng Việt, chọn loại cảnh, cue khớp hình với lời, ảnh bìa. Dùng sau voz-research, hoặc khi người dùng nói "viết kịch bản", "script", "lời đọc", "storyboard", "episode.json".
---

# Viết kịch bản + episode.json

Đọc trước: `research.md` của tập, `data/style_video.md` (mục 3 hook), **`docs/style-guide.md`** (phong cách cắt dán — bắt buộc),
`docs/scene-types.md` (định dạng + loại cảnh + lớp), và mẫu `code/samples/style-demo/episode.json`.

## 1. Hook (0–3s) — quyết định tất cả
Công thức: **Hiện tượng cụ thể + Nghịch lý + Lời hứa giải thích**. Chọn 1 trong 5 kiểu:
1. Câu hỏi ai cũng từng gặp — "Ứng dụng này miễn phí. Vậy ai đang trả tiền?"
2. Hai điều tưởng không thể cùng đúng — "Đăng ký mất 2 bước. Hủy thì…"
3. Con số cụ thể — "Món 39.000 đồng. Thanh toán 70.000 đồng."
4. Một hệ thống nhiều bên — "Mua một món hàng, có ít nhất 4 bên chia tiền."
5. Khiến người xem nhìn lại mình — "Tháng này bạn trả tiền cho bao nhiêu dịch vụ không dùng?"

Cấm: chào hỏi/giới thiệu kênh, "bạn sẽ không tin được", hứa "sự thật bị che giấu", câu hỏi quá rộng, con số sốc không nguồn.
Hình cảnh đầu phải là **vật thể cụ thể có thật** (ảnh tách nền trồi từ đáy khung, hóa đơn, điện thoại, con số) + nhãn giấy xé
đập xuống theo lời — dùng `collage` (xem công thức Hook trong style-guide mục 5), `receipt` hoặc `bigNumber`. Khung đầu tiên (0,0s) không được trống.

## 2. Cấu trúc 45–60s
| Mốc | Nhiệm vụ | Cảnh gợi ý |
|---|---|---|
| 0–3s | Hook — vật thể/sự việc cụ thể | collage (ảnh thật + nhãn), receipt, bigNumber |
| 3–8s | Câu hỏi trung tâm + video sẽ trả lời gì | collage, title (`lines`) |
| 8–25s | Cơ chế thứ nhất: ví dụ, sơ đồ, phép tính | collage, map, flow, receipt, compare |
| 25–43s | Bằng chứng / điểm ngoặt (đổi nền ở đây — nhịp bất ngờ lớn nhất giữa video) | document, bigNumber, bars, map |
| 43–60s | Kết luận + giới hạn + câu hỏi mở cho bình luận | collage, question |

Mỗi cảnh phải là **một bước tiến mới** (thông tin mới), không lặp ý, không câu đệm "nhưng sự thật còn đáng sợ hơn".
Một video = **một câu hỏi trung tâm**.

## 3. Lời đọc (vo) cho TTS
- Nhịp ≈ 5 âm tiết/giây → **tổng 230–290 âm tiết** cho 50–58s. Mỗi cảnh 1–3 câu ngắn (3–7 giây).
- Văn nói, xưng "bạn"; câu ngắn; dấu chấm để ngắt nghỉ trước con số/ý chốt.
- Viết số theo cách đọc: "39.000 đồng", "84 triệu đồng một mét vuông", "quý một năm 2026" (tts.py có tự sửa một số mẫu, nhưng đừng dựa vào).
- Tên riêng nước ngoài đọc sai → thêm vào `config/lexicon.json`. Kiểm nhanh: `python voz.py say "câu" --dry`.
- Không đọc nguyên văn chữ trên màn hình; hình và lời bổ sung cho nhau.

## 4. Chọn cảnh và dựng hình (phong cách cắt dán)
- 8–12 cảnh, **≥ 60% là `collage`/`map`/`document`** (có hình thật). Cảnh chỉ có chữ (`title` text, `list`, `question`) tối đa 3.
- **Đổi hình mỗi 1,5–3 giây**: trong một cảnh, mỗi câu/cụm ý có một lớp mới (`cue`) hoặc một điểm nhìn máy quay mới (`camera`).
  Cảnh dài > 6 giây cần ≥ 3 nhịp hình.
- Mỗi ý trừu tượng → tìm **vật thể đại diện** (tờ tiền, hóa đơn, điện thoại, toà nhà, chân dung, bản đồ) rồi mới tới chữ.
  Liệt kê ảnh cần tìm trong `script.md` (cột "hình") để bước `voz-assets` đi tìm — thường 4–8 ảnh/tập.
- Chữ trên màn hình ≤ 7 từ mỗi nhãn; không chép lại lời đọc (đã có phụ đề).
- Bố cục theo toạ độ 1080×1920: chữ trong x 80–930, y 240–1200; ảnh được tràn mép (nhất là mép dưới). Một điểm màu đỏ/vàng nổi mỗi khung.
- Đổi nền (`tone`) 1–2 lần mỗi tập ở nhịp chuyển ý; chuyển cảnh (`transition`) đa dạng, không lặp liên tiếp.
- Dùng ít nhất 5 loại lớp/cảnh khác nhau; không lặp một chuỗi bố cục y hệt tập trước (chống "inauthentic content").
- Mỗi cảnh có số liệu thật → `"source": "Tên nguồn, thời điểm"`. Số giả định → `"illustrative": true`.
- `cue` phải xuất hiện nguyên văn trong `vo`. Highlight `==…==` tối đa 1–2 cụm mỗi câu chữ.
- `document` chỉ trích câu thật từ nguồn; ghi chép của kênh đặt `outlet: "HỒ SƠ VOZ · …"`. `map` có Việt Nam → tự có Hoàng Sa, Trường Sa.
- Không dùng logo/thương hiệu thật trong `phone` (đặt tên chung: "App giao đồ ăn").
- Cảnh cuối luôn là `question` với 2 lựa chọn A/B cụ thể để kéo bình luận.

## 5. Ảnh bìa (`cover`)
`kicker` (tên series con) + `lines` (2–3 nhãn giấy, 2–4 từ mỗi nhãn) hoặc `text` + `image` (PNG đã tách nền, tràn đáy, đen trắng
mặc định — `treat` để đổi). Bìa nêu **mâu thuẫn**, không lặp nguyên tiêu đề.
Ví dụ: `{"kicker": "Ai đang trả tiền?", "lines": ["Món 39K", {"text": "trả 70K?", "color": "yellow"}], "image": "assets/hoa-don_cut.png"}`.

## 6. Ghi file và kiểm tra
1. `script.md`: bảng `| # | giây | lời đọc | hình (ảnh cần tìm, lớp, nền, chuyển cảnh) | nguồn |` + 3 phương án tiêu đề.
2. `episode.json` theo `docs/scene-types.md`.
3. `python voz.py build VOZ-xxx` → xem bảng thời lượng: tổng 45–60s, không có `⚠`. Dài quá → cắt ý, không nói nhanh hơn.
4. `python voz.py status VOZ-xxx --stage scripted`.
5. Gửi người dùng bảng kịch bản để duyệt **trước khi render bản cuối**.
