# VOZ STORY — hướng dẫn cho Claude Code

Kênh YouTube Shorts / TikTok tiếng Việt, video explainer kiểu Vox 45–60s, 9:16.
Lời hứa: *"Bóc tách những hệ thống vô hình chi phối cuộc sống."* Ngôn ngữ làm việc với người dùng: **tiếng Việt**.

## Bắt đầu mọi việc liên quan tới một tập
Dùng skill `voz-workflow` để biết bước tiếp theo; các bước chi tiết: `voz-research` → `voz-script` → `voz-assets` → `voz-produce` → `voz-publish`.

## Cấu trúc
```
config/          channel.json (tên kênh, giọng, series), lexicon.json (cách đọc từ)
brand/           logo PNG (xuất từ code/studio bằng `python voz.py brand`), music/
data/            nghiên cứu gốc của người dùng — chỉ đọc, không sửa
docs/            scene-types.md (định dạng episode.json), tooling-research.md, voice-guide.md, learnings.md
code/studio/     Remotion (React/TSX): thư viện cảnh, phụ đề, nền, logo, ảnh bìa
code/voz/        CLI Python — gọi qua `python voz.py <lệnh>` ở thư mục gốc
code/samples/    pipeline-test: tập mẫu kiểm tra sau khi sửa code
videos/INDEX.md  bảng trạng thái mọi tập (tự sinh — không sửa tay)
videos/VOZ-001_slug/
  meta.json      id, tiêu đề, series, stage, trạng thái đăng YouTube/TikTok, số liệu, lịch sử
  research.md · script.md · episode.json · sources.json · assets/
  build/         (git-ignore) audio TTS, props.json, draft.mp4, sheet.jpg
  export/        VOZ-001_slug.mp4 · VOZ-001_slug_cover.png · publish.md
```

## Quy ước
- Mã tập `VOZ-NNN` tăng dần, không tái sử dụng; thư mục = file xuất = `VOZ-NNN_slug` (slug không dấu, gạch nối).
- **Chỉ đổi trạng thái qua lệnh** (`voz.py status --stage`, `post`, `metrics`), không sửa tay `meta.json > stage/platforms` — lệnh tự ghi lịch sử và cập nhật INDEX.md.
- Stage: `idea → researched → scripted → rendered → approved → published`. `approved` chỉ khi người dùng đã xem video.
- Không tự đăng, không đổi `approved` thay người dùng.
- Sửa thư viện cảnh: chuyển động chỉ dựa vào `useCurrentFrame()`; chạy `cd code/studio && npx tsc --noEmit`, rồi `python voz.py render code/samples/pipeline-test --draft` và xem `build/sheet.jpg`.
- Đổi màu nền trong `theme.ts` → chạy lại `python code/voz/tools/make_paper.py`.
- Font phải có subset `vietnamese` (xem docs/tooling-research.md).
- Ảnh chỉ từ nguồn & license trong skill `voz-assets`; mọi nguồn ghi vào `sources.json`.

## Môi trường
- `.env`: `ZIPVOICE_URL`, `ZIPVOICE_API_KEY` (URL tunnel đổi khi server khởi động lại), tùy chọn `PEXELS_API_KEY`, `PIXABAY_API_KEY`.
- `python voz.py health` kiểm tra TTS + ffmpeg + studio.
- Windows, Python 3.12, Node 20; ffmpeg cài qua winget (code tự tìm nếu chưa có trong PATH).
- Console Windows: script Python in tiếng Việt cần `PYTHONIOENCODING=utf-8` (CLI voz đã tự xử lý).
