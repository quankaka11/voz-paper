---
name: voz-script
description: Viết kịch bản video ngắn (Shorts/TikTok 9:16) 45–60s kiểu Vox cho VOZ STORY — kể cả Shorts cắt từ video dài để làm phễu — và chuyển thành episode.json chạy được — hook 3 giây theo công thức "hiện tượng cụ thể + nghịch lý + lời hứa giải thích", cấu trúc hỏi → lần dấu vết → cơ chế → kiểm tra giả định → kết luận + câu hỏi bình luận, lời đọc tối ưu cho TTS tiếng Việt, chọn loại cảnh, cue khớp hình với lời, ảnh bìa. Dùng sau voz-research, hoặc khi người dùng nói "viết kịch bản", "script", "lời đọc", "storyboard", "episode.json" cho tập short; video dài 16:9 dùng voz-script-long.
---

# Viết kịch bản + episode.json (format `short`)

> Video dài 16:9 (`"format": "long"`) → skill **`voz-script-long`**. Skill này cho Shorts/TikTok 9:16, gồm cả Shorts làm phễu
> cho video dài (mục 7).

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

## 2. Cấu trúc: hook → intro kênh → nội dung 45–60s → câu hỏi → outro
Hai nhịp thương hiệu **tự chèn** khi `build` (cấu hình chung ở `config/channel.json > intro/outro`, không viết vào `scenes`):
- `intro` (~2,5–3s) ngay **sau cảnh hook**: logo đập xuống + tên series + chủ đề, lời đọc "Cùng VOZ STORY bóc tách {topic}."
  Mỗi tập khai báo `"intro": {"topic": "…", "label": "…"}` — `topic` 3–5 từ để đọc (vd "mô hình ứng dụng miễn phí"),
  `label` ≤ 7 từ hiện trên màn hình (vd "App miễn phí kiếm tiền từ đâu?"). Hook không chào hỏi, không nhắc tên kênh — tên kênh để intro lo.
- `outro` (~5s) sau câu hỏi A/B: bong bóng bình luận, nút **Theo dõi** được bấm, chuông, logo + @handle; lời đọc kêu gọi
  bình luận + theo dõi. Cảnh `question` cuối vì thế **không** cần tự nói "theo dõi kênh".
Tắt cho một tập: `"intro": false` / `"outro": false`. Tổng video thường 55–70s (giới hạn kỹ thuật < 3 phút).

| Mốc | Nhiệm vụ | Cảnh gợi ý |
|---|---|---|
| 0–3s | Hook — vật thể/sự việc cụ thể | collage (ảnh thật + nhãn), receipt, bigNumber |
| 3–6s | *(tự chèn)* intro kênh + chủ đề | `intro` |
| 3–8s | Câu hỏi trung tâm + video sẽ trả lời gì | collage, title (`lines`) |
| 8–25s | Cơ chế thứ nhất: ví dụ, sơ đồ, phép tính | collage, map, flow, receipt, compare |
| 25–43s | Bằng chứng / điểm ngoặt (đổi nền ở đây — nhịp bất ngờ lớn nhất giữa video) | document, bigNumber, bars, map |
| 43–60s | Kết luận + giới hạn + câu hỏi mở cho bình luận | collage, question |
| cuối | *(tự chèn)* kêu gọi bình luận + theo dõi | `outro` |

Mỗi cảnh phải là **một bước tiến mới** (thông tin mới), không lặp ý, không câu đệm "nhưng sự thật còn đáng sợ hơn".
Một video = **một câu hỏi trung tâm**.

## 3. Lời đọc (vo) cho TTS
- Nhịp ≈ 5 âm tiết/giây → **phần nội dung 230–290 âm tiết** (45–60s, chưa tính intro/outro). Mỗi cảnh 1–3 câu ngắn (3–7 giây).
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

## 5. Ảnh bìa / thumbnail (`cover`) — bắt buộc mỗi tập
Làm **3 phương án** trong `"covers": [{"id": …}, …]` để người dùng chọn (`"cover_pick": "<id>"`); `python voz.py cover VOZ-xxx` render tất cả.
Ảnh PNG riêng 1080×1920 (`export/…_cover.png`), tải lên TikTok/YouTube khi đăng. Công thức cuốn hút:
- `headline`: **1–3 chữ siêu lớn** (Anton vàng viền mực, `**chữ**` tô đỏ) nêu vật thể/mâu thuẫn — "App **miễn phí**", "39K → **70K**".
  Tránh số 0 đứng riêng (font hẹp, dễ đọc thành chữ O).
- `lines`: 1 nhãn câu hỏi ngắn (2–4 từ) — **không** lặp `kicker` (tên series) hay tiêu đề video.
- `image`: vật thể thật tách nền tràn đáy (`imageW` 700–1000; `treat` mặc định `bw`).
- **Một điểm đỏ**: `stamp` (con dấu trên mảnh giấy, 2–3 từ gây tò mò), `arrow: true` (mũi tên từ chữ xuống vật thể) hoặc `circle: {x, y, rx, ry}`.
- Chữ quan trọng trong y 300–1600 (lưới TikTok cắt 3:4). Bìa nêu **mâu thuẫn**, không chép tiêu đề.
Ví dụ: `{"kicker": "Ai đang trả tiền?", "headline": "App **miễn phí**", "lines": [{"text": "Tiền từ đâu ra?", "color": "yellow"}],
"image": "assets/dien-thoai_cut.png", "imageW": 760, "stamp": "Không phải bạn?", "arrow": true}`.
Xem nhanh: `python voz.py cover VOZ-xxx` rồi Read file PNG (thu nhỏ) — chữ phải đọc được ở cỡ ô lưới (~1/3 màn hình điện thoại).

## 5b. Nội dung đăng — viết cùng lúc với kịch bản
Ghi `meta.json > publish` (xem skill `voz-publish` mục 1): `title`, `description`, `hashtags`, `tiktok_caption`, `pinned_comment`.
Render bản cuối tự sinh `export/publish.md` từ các trường này.

## 6. Ghi file và kiểm tra
1. `script.md`: bảng `| # | giây | lời đọc | hình (ảnh cần tìm, lớp, nền, chuyển cảnh) | nguồn |` + 3 phương án tiêu đề.
2. `episode.json` theo `docs/scene-types.md`.
3. `python voz.py build VOZ-xxx` → xem bảng thời lượng: phần nội dung (trừ `intro`/`outro`) 45–60s, không có `⚠`. Dài quá → cắt ý, không nói nhanh hơn.
4. `python voz.py status VOZ-xxx --stage scripted`.
5. Gửi người dùng bảng kịch bản để duyệt **trước khi render bản cuối**.

## 7. Short làm phễu cho video dài
Mỗi video dài có 3–4 Short (bảng "Shorts cắt từ tập này" trong `script.md` của tập dài). Tạo Short đi kèm:
`python voz.py new "Tiêu đề Short" --parent VOZ-NNN` → `videos/VOZ-NNN_slug/shorts/VOZ-NNN-Sk_slug/` (mã `VOZ-NNN-Sk`, format short,
cùng series), chép assets cần dùng từ video dài, ghi nguồn lại vào `sources.json` của Short. Lệnh khác nhận mã Short: `python voz.py render VOZ-007-S1`.
`publish.md` của Short tự ghi video dài cần gắn "Video liên quan" (kèm link nếu video dài đã `post`).
- **Một phát hiện trọn vẹn** trong 45–60s (người xem không cần xem bản dài vẫn hiểu) + **một câu hỏi lớn hơn** mà video dài trả lời.
  Không cắt kiểu teaser bỏ lửng — Short giữ chân kém thì không được đẩy, cũng không kéo được ai.
- Hook 3 giây theo mục 1; bố cục **dọc riêng** (toạ độ 1080×1920), không crop từ khung 16:9.
- Câu kết (thay câu hỏi A/B): "Vì sao [câu hỏi lớn]? Bản đầy đủ ở video liên quan ngay bên dưới." — publish.md nhắc gắn **Video liên quan**.
- Đăng rải 7–10 ngày sau video dài; Short nào có lượt xem/chia sẻ bất thường → ghi vào `docs/learnings.md` làm ứng viên chủ đề dài.
