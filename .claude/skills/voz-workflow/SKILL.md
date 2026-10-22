---
name: voz-workflow
description: Bản đồ quy trình sản xuất một video VOZ STORY từ ý tưởng tới đăng và đo hiệu quả — các bước, skill dùng ở mỗi bước, lệnh voz.py, cổng duyệt với người dùng. Dùng khi người dùng nói "làm video", "tạo video mới", "làm tập tiếp theo", "bắt đầu tập", "quy trình", hoặc khi không rõ bước tiếp theo của một tập.
---

# Quy trình một tập VOZ STORY

Hai định dạng (`episode.json > format`): **long** — video dài 16:9, 10–14 phút (định dạng chính) · **short** — Shorts/TikTok 9:16
(phễu cho video dài, hoặc tập độc lập). Checklist video dài: `docs/longform-checklist.md` · chủ đề đã thẩm định: `docs/topics-long.md`.

## Video dài (long)
| # | Bước | Skill | Lệnh / đầu ra | Trạng thái sau bước |
|---|---|---|---|---|
| 1 | Chọn chủ đề (checklist mục 0) | — | `docs/topics-long.md`; `python voz.py new "Tiêu đề" --format long --series …` | `idea` |
| 2 | Nghiên cứu sâu + dàn ý chương | `voz-research` | `research.md` bản dài, `sources.json` | `researched` |
| ⛳ | **Cổng 0: người dùng duyệt dàn ý** | | câu hỏi trung tâm, 3 tiêu đề, 3 ý tưởng bìa, bảng chương | |
| 3 | Kịch bản + bìa + nội dung đăng | `voz-script-long` | `script.md`, `episode.json`, `meta.json > publish`, `python voz.py build` | `scripted` |
| ⛳ | **Cổng 1: người dùng duyệt kịch bản** | | bảng kịch bản theo chương + tổng thời lượng | |
| 4 | Tư liệu hình (60–120) | `voz-assets` | `img search` / `img add`, `assets/`, `sources.json` | |
| 5 | Nháp | `voz-produce` | `python voz.py render VOZ-xxx --draft` (20–35 phút) → `build/sheet.jpg` | |
| 6 | Bản cuối | `voz-produce` | `python voz.py render VOZ-xxx` (50–90 phút, theo đoạn) → mp4 + bìa + `.vi.srt` + `publish.md` | `rendered` |
| ⛳ | **Cổng 2: người dùng xem video** | | | `approved` |
| 7 | 3–4 Shorts phễu | `voz-script` mục 7 → `voz-produce` | tập `--format short` riêng | |
| 8 | Đăng + ghi trạng thái | `voz-publish` | video dài trước, Shorts rải 7–10 ngày; `python voz.py post …` | `published` |
| 9 | Số liệu 48h / 7 ngày + bài học | `voz-publish` | `metrics`, CTR/giữ chân → `docs/learnings.md` | |

Thời gian ước tính một tập 12 phút: 60–90 giờ công (tập đầu), 37–50 giờ khi đã quen (`docs/longform-research.md` mục 6).

## Shorts (short)

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
- Báo chi phí/thời gian: render bản cuối Short ≈ 5–7 phút, video dài 12 phút ≈ 50–90 phút; TTS miễn phí (server tự host).
- Video dài: ≤ 2 tập/tuần; mỗi tập có góc nhìn và nghiên cứu riêng (chính sách *inauthentic content* xét cả kênh).
