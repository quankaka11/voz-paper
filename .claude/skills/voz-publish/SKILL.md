---
name: voz-publish
description: Chuẩn bị đăng và theo dõi video VOZ STORY — video dài YouTube 16:9 (mục lục chương, phụ đề, màn hình kết thúc, thẻ) và YouTube Shorts / TikTok — viết tiêu đề, mô tả có nguồn, hashtag, caption, tạo gói đăng export/publish.md, ghi trạng thái đã đăng/hẹn giờ kèm link, nhập số liệu hiệu quả và phân tích để cải tiến. Dùng khi người dùng nói "đăng video", "tiêu đề", "hashtag", "caption", "đã đăng", "cập nhật trạng thái", "số liệu", "phân tích hiệu quả".
---

# Đăng bài & theo dõi

## 1. Viết nội dung đăng (ngay khi viết kịch bản; chốt lại trước khi đăng)
Mỗi tập luôn có gói đăng đầy đủ — render bản cuối tự sinh `export/publish.md`. Ghi vào `meta.json > publish` của tập:
- `title` — YouTube Shorts ≤ 100 ký tự (nên ≤ 60 để không bị cắt). Nêu **vấn đề**, không lặp chữ trên bìa, không giật tít.
- `description` — 1–2 câu tóm tắt lời giải + câu hỏi mời bình luận. Danh sách nguồn được thêm tự động từ `sources.json`.
- `hashtags` — 3–5 thẻ: 1 thẻ series (`#AiĐangTrảTiền`), 1–2 thẻ chủ đề (`#KinhTếĐờiSống`, `#ThươngMạiĐiệnTử`), `#VOZSTORY`. Không nhồi thẻ trend không liên quan.
- `tiktok_caption` — **dòng đầu ≤ 90 ký tự là hook** (chỉ phần này hiện trước nút "thêm"), có từ khoá để TikTok tìm kiếm;
  dòng 2 là câu hỏi A/B kéo bình luận. Hashtag tự nối thêm.
- `pinned_comment` — bình luận ghim (cả YouTube và TikTok): nhắc lại câu hỏi A/B + 2 lựa chọn, vd
  "📌 Bạn chọn bên nào?\nA. …\nB. …\nComment A hoặc B nhé 👇".

Mô tả YouTube tự thêm dòng "🔔 Theo dõi VOZ STORY…", nguồn số liệu, ghi công ảnh (kèm phần đã chỉnh sửa) và nhạc.
`publish-kit` in `⚠` khi tiêu đề > 60 ký tự, dòng đầu caption > 90, hashtag ngoài 3–5, thiếu mô tả hoặc bình luận ghim.

**Ảnh bìa (thumbnail)** `export/…_cover.png`: TikTok → "Chọn ảnh bìa" → *Tải lên*. YouTube Shorts → trong app khi tải lên/chỉnh sửa,
tải ảnh nếu tài khoản có tùy chọn; nếu chỉ cho chọn khung hình thì chọn khung rõ chữ nhất (YouTube thay đổi tính năng này theo thời gian).

Rồi chạy `python voz.py publish-kit VOZ-xxx` → `export/publish.md` (ảnh bìa, tiêu đề, mô tả, caption, bình luận ghim, checklist).

## 1b. Video dài (format `long`)
- `title` ≤ 100 ký tự, **nên ≤ 70** (bị cắt ở trang chủ/tìm kiếm): câu hỏi hoặc mâu thuẫn cụ thể, khớp lời hứa của ảnh bìa.
- `description`: 2–3 câu, câu đầu chứa từ khóa người Việt sẽ tìm ("vì sao…", tên hệ thống). Mục lục chương (từ cảnh `chapter`),
  dòng "🔔 Đăng ký…", nguồn, ghi công ảnh/nhạc **tự sinh** — không viết lại. Không `#Shorts`, không mục TikTok.
- `hashtags` 3–5 · `pinned_comment` câu hỏi A/B.
- `publish.md` bản dài có checklist: thumbnail 1280×720 · phụ đề `.vi.srt` (Tiếng Việt) · màn hình kết thúc (2 phần tử Video đặt
  đúng khung trống + Đăng ký) · 1–2 thẻ · danh sách phát series · Danh mục Giáo dục · khai báo nội dung tổng hợp nếu dùng ảnh AI trông như thật.
- Nếu tài khoản có "Thử nghiệm & so sánh" ảnh bìa: chuẩn bị 2–3 bìa (`cover` khác nhau → `python voz.py cover`, đổi tên file).
- Shorts phễu (skill `voz-script` mục 7): đăng rải 7–10 ngày sau, mỗi Short gắn **Video liên quan** trỏ về video dài.
- Nhịp đăng: ≤ 2 video dài/tuần; ưu tiên đều đặn (vd mỗi 7–10 ngày) hơn là dồn.

## 2. Người dùng tự đăng (thủ công)
API TikTok không cho cá nhân đăng công khai; API YouTube chỉ đăng *private* khi chưa audit → đăng tay qua Studio.
Gợi ý giờ đăng thử nghiệm: 11h30–12h30 hoặc 19h–21h (giờ VN), rồi so sánh qua số liệu — đừng coi là quy tắc.

## 3. Ghi trạng thái
```bash
python voz.py post VOZ-xxx youtube --url https://youtube.com/shorts/...
python voz.py post VOZ-xxx tiktok --url https://www.tiktok.com/@.../video/...
python voz.py post VOZ-xxx tiktok --status scheduled --at 2026-10-20T19:00   # hẹn giờ
python voz.py status                                                       # bảng tổng + videos/INDEX.md
```
Trạng thái nền tảng: `not_posted` → `scheduled` → `posted` (→ `removed`). Tập chuyển `published` khi đã đăng.

## 4. Số liệu (sau 48 giờ và sau 7 ngày)
```bash
python voz.py metrics VOZ-xxx youtube --views 1200 --likes 80 --comments 14 --shares 5 --saves 9 --avg-view-pct 71 --subs-gained 6
python voz.py metrics VOZ-xxx tiktok  --views 3400 --likes 210 --comments 33 --shares 12 --saves 40 --avg-view-pct 48
```
Mỗi lần ghi là một snapshot có thời điểm trong `meta.json`.

## 5. Phân tích & cải tiến (khi có ≥ 3 tập đã đăng)
Đọc mọi `videos/*/meta.json` + `episode.json`, so sánh theo: kiểu hook (cảnh s01), series, thời lượng, loại cảnh, giờ đăng.
Ưu tiên chỉ số: **% xem trung bình** (giữ chân) → bình luận thực chất → lưu/chia sẻ → follow mới / lượt xem.
Video dài: thêm **CTR ảnh bìa** (lượt hiển thị → lượt xem), **% còn lại ở giây 30**, **thời lượng xem trung bình** (phút) và **điểm rơi
lớn nhất** trên biểu đồ giữ chân (ứng với cảnh nào trong `episode.json`) — ghi tay trong `docs/learnings.md` vì `metrics` chỉ lưu các
trường chung. Mốc sau 6 video dài: median ≥ 5K view, giữ chân ≥ 35%, CTR ≥ 4%. Không kết luận từ một video đơn lẻ;
chỉ đổi **một biến** mỗi lần thử. Ghi kết luận vào `docs/learnings.md` (ngày, giả thuyết, bằng chứng, quyết định) để các tập sau áp dụng.
