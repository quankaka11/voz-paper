---
name: voz-produce
description: Sản xuất video VOZ STORY từ episode.json đã duyệt tới file mp4 cuối — tạo giọng đọc ZipVoice, render nháp, duyệt contact sheet bằng mắt, sửa đồng bộ hình–lời, render bản cuối 1080x1920, chuẩn hóa âm lượng, ảnh bìa, kiểm tra kỹ thuật và biên tập. Dùng khi người dùng nói "render", "dựng video", "tạo video", "xuất video", "làm bản nháp", hoặc sau khi kịch bản được duyệt.
---

# Sản xuất video

## 0. Kiểm tra môi trường (mỗi phiên)
```bash
python voz.py health
```
- ZipVoice lỗi → URL tunnel trycloudflare đổi mỗi lần server khởi động lại: nhờ người dùng cập nhật `ZIPVOICE_URL` trong `.env`.
- Thiếu `node_modules` → `cd code/studio && npm install`.

## 1. Bản nháp (≈ 2–4 phút)
```bash
python voz.py render VOZ-xxx --draft        # → build/draft.mp4 (540p) + build/sheet.jpg
```
- Đọc bảng thời lượng: tổng 45–60s, không có `⚠ không thấy cue`.
- **Xem `build/sheet.jpg` bằng Read** (12 khung chia đều). Soát: chữ tràn/chồng, highlight sai chỗ, cảnh trống quá lâu,
  phụ đề (hộp đen y ≈ 1250–1400) đè lên chữ/nhãn, chữ bị máy quay zoom cắt mép, chữ thiếu dấu, nhiều hơn một điểm màu nổi mỗi khung.
- Xem kỹ quanh mốc chuyển cảnh và lúc các `cue` bật: trích khung từ draft bằng ffmpeg
  (`ffmpeg -ss <giây> -i build/draft.mp4 -frames:v 1 x.jpg`) rồi ghép vài khung lại để Read.
- Cần xem kỹ một thời điểm: `cd code/studio && npx remotion still src/index.ts Episode out.png --frame=<f> --props=<build/props.json> --public-dir=<build>`.
- Sửa → chỉ cảnh có `vo` thay đổi mới gọi lại TTS (có cache theo nội dung).

## 2. Nghe
Mở `build/audio/sXX.mp3` hoặc nhờ người dùng nghe bản nháp. Đọc sai từ → `config/lexicon.json`, rồi `--force-tts`.

## 3. Bản cuối (≈ 5–7 phút cho 55s)
```bash
python voz.py render VOZ-xxx               # → export/VOZ-xxx_slug.mp4 + export/VOZ-xxx_slug_cover.png
```
Lệnh tự: render 1080×1920 H.264 yuv420p 30fps → loudnorm −14 LUFS → ảnh bìa → contact sheet → kiểm tra kỹ thuật.
Chỉ làm lại bìa: `python voz.py cover VOZ-xxx`. Kiểm lại file: `python voz.py check VOZ-xxx`.

## 4. Checklist trước khi báo "xong"
Kỹ thuật (lệnh check in ra): 1080×1920 · 45–60s · có âm thanh · −14 ±2 LUFS.
Biên tập (tự soát trên sheet + script):
- [ ] 3 giây đầu có vật thể/con số cụ thể, không chào hỏi; khung 0,0s không trống.
- [ ] ≥ 60% cảnh có hình thật (collage/map/document/image); hình đổi mỗi 1,5–3 giây.
- [ ] Bản đồ có Việt Nam → thấy Hoàng Sa, Trường Sa; `document` chỉ trích câu thật.
- [ ] SFX không át giọng đọc (nghe bản nháp; giảm `sfx_volume` nếu cần).
- [ ] Mọi số liệu thật có `Nguồn:`; số giả định có nhãn `Minh họa`.
- [ ] Không khẳng định quá mức (lừa đảo, nghe lén…), có nêu giới hạn.
- [ ] Không logo thật trên bìa / cảnh phone; ảnh có license trong `sources.json`.
- [ ] Chính tả tiếng Việt trên màn hình đúng dấu.
- [ ] Kết bằng câu hỏi A/B.
- [ ] Bố cục cảnh khác các tập trước (chống inauthentic content).

## 5. Cập nhật trạng thái
```bash
python voz.py status VOZ-xxx --stage rendered
python voz.py publish-kit VOZ-xxx            # tiêu đề, mô tả, hashtag, nguồn → export/publish.md
```
Báo người dùng: đường dẫn mp4 + bìa, thời lượng, các điểm cần họ nghe/duyệt. Người dùng duyệt xong → `--stage approved`.
