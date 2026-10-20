---
name: voz-workflow
description: Bản đồ quy trình sản xuất một video VOZ STORY từ ý tưởng tới đăng và đo hiệu quả — các bước, skill dùng ở mỗi bước, lệnh voz.py, cổng duyệt với người dùng. Dùng khi người dùng nói "làm video", "tạo video mới", "làm tập tiếp theo", "bắt đầu tập", "quy trình", hoặc khi không rõ bước tiếp theo của một tập.
---

# Quy trình một tập VOZ STORY

| # | Bước | Skill | Lệnh / đầu ra | Trạng thái sau bước |
|---|---|---|---|---|
| 1 | Chọn chủ đề | — | `python voz.py status` xem tập nào đang chờ; chủ đề gốc ở `data/topics.md`. Tập mới: `python voz.py new "Tiêu đề" --series … --topic N` | `idea` |
| 2 | Nghiên cứu | `voz-research` | `research.md`, `sources.json` | `researched` |
| 3 | Kịch bản + bìa + nội dung đăng | `voz-script` | `script.md`, `episode.json` (kèm `intro.topic`, `cover`), `meta.json > publish`, `python voz.py build` | `scripted` |
| ⛳ | **Cổng 1: người dùng duyệt kịch bản** | | gửi bảng kịch bản + tổng thời lượng | |
| 4 | Hình ảnh (nếu cần) | `voz-assets` | `assets/`, `sources.json` | |
| 5 | Nháp | `voz-produce` | `python voz.py render VOZ-xxx --draft` → xem `build/sheet.jpg` | |
| 6 | Bản cuối | `voz-produce` | `python voz.py render VOZ-xxx` → `export/` mp4 + bìa + `publish.md` | `rendered` |
| ⛳ | **Cổng 2: người dùng xem video** | | mp4 + bìa + gói đăng; sửa theo góp ý | `approved` |
| 7 | Chốt gói đăng | `voz-publish` | sửa `meta.json > publish` nếu cần, `python voz.py publish-kit` | |
| 8 | Đăng (người dùng) + ghi trạng thái | `voz-publish` | `python voz.py post …` | `published` |
| 9 | Số liệu 48h / 7 ngày + bài học | `voz-publish` | `python voz.py metrics …`, `docs/learnings.md` | |

## Nguyên tắc xuyên suốt
- Một video = một câu hỏi trung tâm; mỗi cảnh một bước tiến mới.
- Không tố cáo, không giật tít: chỉ ra cơ chế, bằng chứng, đánh đổi và điều chưa kết luận được.
- Số liệu thật có nguồn; số giả định gắn "Minh họa".
- Mỗi tập khác bố cục tập trước (chính sách *inauthentic content* của YouTube).
- Đọc `docs/learnings.md` (nếu có) trước khi viết tập mới.
- Báo chi phí/thời gian: render bản cuối ≈ 5–7 phút; TTS miễn phí (server tự host).
