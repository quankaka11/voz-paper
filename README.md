# VOZ STORY

Xưởng sản xuất video explainer kiểu Vox (YouTube Shorts / TikTok, 9:16, 45–60s, giọng đọc tiếng Việt)
cho series **"Những hệ thống vô hình chi phối cuộc sống"**. Video được dựng bằng code (Remotion) từ một file
`episode.json` — không cần phần mềm dựng phim.

![logo](brand/voz-logo-full.png)

## Cài đặt (một lần)
```powershell
winget install -e --id Gyan.FFmpeg
python -m pip install -r code/requirements.txt
cd code/studio; npm install; npx remotion browser ensure; cd ../..
python voz.py health        # kiểm tra server TTS, ffmpeg, studio
```
`.env` cần `ZIPVOICE_URL`, `ZIPVOICE_API_KEY`; tùy chọn `PEXELS_API_KEY`, `PIXABAY_API_KEY` (đăng ký miễn phí).

## Làm một video
Trong Claude Code chỉ cần nói: *"Làm video VOZ-001"* — Claude theo skill `voz-workflow`.
Các lệnh bên dưới:

```powershell
python voz.py status                                  # bảng mọi tập → videos/INDEX.md
python voz.py new "Tiêu đề" --series ai-tra-tien --topic 4
python voz.py build VOZ-001                            # tạo giọng đọc + căn thời lượng
python voz.py render VOZ-001 --draft                   # nháp 540p → build/draft.mp4, build/sheet.jpg
python voz.py render VOZ-001                           # bản cuối → export/VOZ-001_slug.mp4 + _cover.png
python voz.py status VOZ-001 --stage approved          # sau khi bạn xem và duyệt
python voz.py publish-kit VOZ-001                      # tiêu đề, mô tả, hashtag → export/publish.md
python voz.py post VOZ-001 youtube --url <link>        # sau khi đăng
python voz.py metrics VOZ-001 tiktok --views 3400 --likes 210 --comments 33 --avg-view-pct 48
```
Tiện ích: `python voz.py say "câu" [--dry]` (nghe thử giọng/phát âm), `img search|pick|cutout` (ảnh có license), `brand` (xuất logo).

## Mỗi video nằm ở đâu?
```
videos/
├── INDEX.md                                  ← bảng trạng thái (tự sinh)
└── VOZ-001_ung-dung-mien-phi-kiem-tien/
    ├── meta.json        ← trạng thái sản xuất + trạng thái đăng YouTube/TikTok + số liệu
    ├── research.md      ← nghiên cứu, nguồn
    ├── script.md        ← kịch bản dạng bảng
    ├── episode.json     ← danh sách cảnh (Claude viết)
    ├── sources.json     ← nguồn số liệu & license ảnh
    ├── assets/          ← ảnh dùng trong video
    └── export/
        ├── VOZ-001_ung-dung-mien-phi-kiem-tien.mp4        ← video đăng
        ├── VOZ-001_ung-dung-mien-phi-kiem-tien_cover.png  ← ảnh bìa 9:16
        └── publish.md                                      ← nội dung để copy khi đăng
```

**Trạng thái sản xuất:** Ý tưởng → Đã nghiên cứu → Có kịch bản → Đã render → Đã duyệt → Đã đăng
**Trạng thái đăng (mỗi nền tảng):** chưa đăng → hẹn giờ → đã đăng (→ đã gỡ)

## Thư mục khác
| Thư mục | Nội dung |
|---|---|
| `data/` | Nghiên cứu gốc: chủ đề, phong cách, mục tiêu |
| `docs/` | Nghiên cứu công cụ & bản quyền, hướng dẫn giọng đọc, định dạng `episode.json` |
| `config/` | Tên kênh, giọng mặc định, series, từ điển phát âm |
| `brand/` | Logo, nhạc nền (`brand/music/`, chỉ từ YouTube Audio Library) |
| `code/studio/` | Remotion: 10 loại cảnh, phụ đề, nền giấy, logo, ảnh bìa (`npm run studio` để xem trực tiếp) |
| `code/voz/` | CLI Python |
| `.claude/skills/` | Quy trình cho Claude Code: workflow, research, script, assets, produce, publish |
