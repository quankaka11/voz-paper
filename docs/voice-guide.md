# Giọng đọc VOZ STORY

## Hiện tại

- Giọng kênh: **`blv`** — giọng clone của một thành viên trong đội (ZipVoice). Đổi ở `config/channel.json` (`voice`).
  Giọng dự phòng có sẵn trên server: `nam_bac_tram` (nam Bắc, trầm ~125 Hz). Không clone giọng người ngoài đội.
- Nghe thử: `python voz.py say "câu bất kỳ"` → `build/say.mp3`. Xem server sẽ đọc thế nào: thêm `--dry`.
- Từ đọc sai → thêm vào `config/lexicon.json` (vd `"Shopee": "sốp pi"`).
- Chuẩn hóa tự động trong `code/voz/tts.py`: `39.000đ` → "đồng", `39K` → "nghìn", `m²` → "mét vuông", `quý I/2026` → "quý một năm 2026".

## Viết lời cho TTS

**Video dài (10–14 phút):** đo thực tế giọng `blv` (VOZ-007, 22/10/2026): 1.889 âm tiết chữ viết → 530 giây nội dung, tức
**≈ 3,6 âm tiết/giây gồm nghỉ giữa cảnh** (số viết bằng chữ số đọc ra dài hơn). → 10 phút ≈ 2.150 âm tiết, 12 phút ≈ 2.550 âm tiết.
Chống đều đều: chia lời thành cảnh 4–10 giây, đặt khoảng lặng (cảnh không lời 0,5–1s hoặc `pad`) trước cú lật, đổi nhạc theo chương.
Tên nước ngoài: đọc theo cách quen của người Việt (Mỹ, Pháp, "Mắc-Lin"), thêm vào `config/lexicon.json`, hiện chữ gốc trên lower third.

**Shorts:**

- Nhịp mục tiêu **≈ 5 âm tiết/giây** → video 55s ≈ 250–290 âm tiết lời đọc (đã trừ khoảng nghỉ giữa cảnh).
- Câu ngắn, mỗi câu một ý. Dấu chấm tạo ngắt nghỉ; dấu phẩy tạo nhịp.
- Viết số theo cách muốn đọc: "39.000 đồng", "84 triệu đồng một mét vuông". Tránh viết tắt lạ.
- Văn nói kiểu trò chuyện ("bạn có để ý…"), không đọc kiểu phát thanh viên.

## Giọng clone riêng (khi bạn thu mẫu)

Kết quả nghiên cứu (chi tiết nguồn trong lịch sử phiên làm việc, nhiều nhận định *chưa kiểm chứng*):

- **Hồ sơ giọng mục tiêu**: "người anh/chị hiểu chuyện kể bạn nghe", 25–35 tuổi, cao độ trung bình hơi trầm,
  năng lượng vừa–cao, "có nụ cười trong giọng", không hô hào. Nam hay nữ đều được — quan trọng là **giữ cố định**
  để thành giọng thương hiệu. Chưa có dữ liệu cho thấy giọng Bắc hay Nam hiệu quả hơn.
- Nghiên cứu về narration: giọng hào hứng được đánh giá cuốn và dễ hiểu hơn giọng đều đều.
- Giọng TTS mặc định của CapCut/TikTok bị dùng tràn lan → giọng riêng giúp nhận diện và an toàn hơn với chính sách "inauthentic content".
- Kênh tham khảo phong cách (chỉ để nghe, **không clone giọng người khác**): Web5ngay (kể chuyện kiến thức, giọng trò chuyện),
  Spiderum (đọc tiểu luận, nhịp chậm), Vietnam Innovators/Vietcetera (host thật).

### Cách thu mẫu để clone

1. Mic USB/dynamic cardioid, cách miệng 10–20 cm, có pop filter. Phòng nhỏ nhiều vải (tủ quần áo, chăn) — **vang phòng là kẻ thù số 1**.
2. WAV mono 44,1/48 kHz, đỉnh ≈ −6 dBFS, cắt khoảng lặng đầu/cuối, không nhạc, không lọc ồn quá tay.
3. README ZipVoice khuyên mẫu ngắn: thử cả bản ~3 giây và bản 6–10 giây; transcript phải khớp từng chữ.
4. Đọc đúng giọng của kênh, có câu hỏi + con số + chỗ ngắt + từ nhấn, ví dụ:
   *"Bạn có biết vì sao ly trà sữa 50 nghìn mà quán vẫn lỗ không? Câu trả lời nằm ở… tiền mặt bằng."*
5. Thu nhiều take, nghe A/B chọn bản tốt nhất. Có thể giữ 2 mẫu: "hook" (năng lượng cao) và "giải thích" (bình hơn).
6. Đăng giọng lên server: `POST /v1/voices` (file + `voice_id` + `transcript`), rồi đổi `voice` trong `config/channel.json`.
7. Thử speed 1.0–1.15 và đo âm tiết/giây (mục tiêu ~5–5,8).
