# Phong cách hình ảnh VOZ STORY — "bảng cắt dán điều tra"

> Bản 2 (10/2026). Thay phong cách "slide giấy kem + emoji" của VOZ-001 (còn ở nhánh `test/video-fisrt`).
> Tập mẫu khoe đủ kỹ thuật: `code/samples/style-demo` (`python voz.py render code/samples/style-demo --draft`).

## 1. Vì sao đổi
VOZ-001 đúng nội dung nhưng **trông như slide**: nền phẳng, chữ chiếm gần hết khung, emoji thay hình, mỗi cảnh một thẻ chữ,
nửa dưới khung trống, cắt cảnh không âm thanh. Người xem lướt Shorts quyết định trong 1–2 giây dựa trên **chất liệu hình**,
không phải lượng chữ.

## 2. Phân tích ảnh tham khảo (5 ảnh, 19/10/2026)
| Ảnh | Kỹ thuật nhìn thấy | Đã làm thành |
|---|---|---|
| Machu Picchu (3 khung) | nền giấy kẻ ô xanh có vết bẩn; nhãn giấy xé xếp so le 3 màu (kraft / kem / vàng); ảnh núi tách nền viền trắng **tràn mép dưới**; polaroid có chú thích serif; số serif in typo mòn "2430" + chip đơn vị "m"; mũi tên trắng vẽ tay; đường nét đứt | nền `grid`, lớp `labels`/`label`, `image` + `enter: "up"`, `photo`, `number` style `letterpress` + `unit`, `arrow` |
| Dãy nhà phố | ảnh đen trắng, **một căn duy nhất có màu** → mắt đi thẳng vào chi tiết; chữ sans gọn trên đầu | `treat: "bw"` cho ảnh nền + ảnh màu đặt chồng; `text` |
| Bản đồ Thổ Nhĩ Kỳ | bản đồ xám nhạt, **quốc gia tô đỏ**, chân dung đen trắng tách nền đặt lên bản đồ, nhãn hộp đen chữ trắng in hoa | cảnh `map` (`highlight`, `points`, `layers`), lớp `tag` |
| VOX SKILL v1 vs v2 | v1: tranh minh họa phẳng trên giấy kem (giống VOZ-001). v2 (đẹp hơn rõ rệt): nền than chì, số poster vàng đậm, chân dung khắc đen trắng **dán băng dính**, dây nối xanh từ nhân vật tới hộp hạt cà phê thật, tên ghép từ **chữ cắt rời** | nền `charcoal` (mặc định), `number` style `poster`, `tape`, `string`, `ransom` |
| Bài báo NYT | mẩu báo nghiêng 3D, đen trắng, hạt film, máy trôi chậm; phụ đề hộp đen nhỏ chữ trắng in hoa | cảnh `document`, lớp hạt film toàn khung, phụ đề hộp đen |

**Mẫu số chung:** (1) mọi thứ là *vật thể giấy thật* có bóng đổ, mép xé, hơi nghiêng; (2) ảnh thật được xử lý thống nhất
(đen trắng + một điểm màu); (3) ít chữ, chữ nằm trên nhãn; (4) hạt film + vết bẩn phủ tất cả cho cùng một chất liệu;
(5) chuyển động kiểu stop-motion (giật nhẹ, "quay hai"); (6) máy quay đi trong bảng cắt dán theo lời.

Nghiên cứu thêm (nguồn thứ cấp, chưa có nguồn chính thức từ Vox): đồ hoạ Vox thường dựng ở 12fps trong timeline 24fps để có
chuyển động "giật" đặc trưng ([PremiumBeat](https://www.premiumbeat.com/blog/replicating-vox-motion-graphic/)); phong cách cắt dán
= giấy cắt tay, mép xé, băng dính, chấm halftone, mẩu báo, khối màu phẳng mỗi nhịp, tiêu đề cắt rời, và **mỗi nhịp là một tấm
poster hoàn chỉnh** trước khi thêm chuyển động ([vox-director](https://github.com/Alisa0808/vox-director)). Về giữ chân người xem:
các blog sáng tạo khuyên đổi hình mỗi 2–4 giây và dùng SFX (whoosh, pop) làm điểm nhấn, nhưng đây là kinh nghiệm cộng đồng,
cần kiểm chứng bằng biểu đồ retention của chính kênh ([klap.app](https://klap.app/blog/youtube-shorts-best-practices)).

## 3. Bảng nhận diện
- **Nền** (`tone`, đặt cho cả tập hoặc từng cảnh): `charcoal` (mặc định) · `grid` (xanh lá) · `grid-blue` · `grid-red` · `cream` · `navy` · `map`.
  Mỗi tập dùng `charcoal` làm nền chính, đổi sang 1–2 nền khác ở các nhịp chuyển ý (đổi nền = một "pattern interrupt").
- **Màu nhấn:** vàng `#F4C430` (số poster, nhãn), đỏ `#D7262E` (điểm màu duy nhất, quốc gia, con dấu), xanh teal (dây nối).
- **Giấy nhãn:** `kraft` (nâu, chữ kem) · `cream` · `yellow` · `black` · `white` · `red` · `teal`.
- **Font (đều có tiếng Việt):** Fraunces (serif tiêu đề / nhãn / số in typo) · Anton (số poster, chữ đậm hẹp) · Oswald (nhãn hộp đen, kicker) ·
  Space Mono (chữ cắt rời, hồ sơ, dòng nguồn) · Be Vietnam Pro (phụ đề, thân chữ) · Patrick Hand (ghi chú tay).
- **Xử lý ảnh** (`treat`): `bw` cho người/đồ vật nền, `color` cho **một** chi tiết cần nổi; `sepia`/`faded` cho tư liệu cũ; `dark` cho ảnh làm nền.

## 4. Quy tắc dựng
1. **Mỗi cảnh = một tấm poster cắt dán** có ≥1 hình thật (ảnh tách nền, polaroid, bản đồ, tài liệu). Cảnh chỉ có chữ: tối đa 2 cảnh/tập.
2. **Đổi hình mỗi 1,5–3 giây**: lớp mới hiện theo `cue`, máy quay lia tới chi tiết mới, hoặc chuyển cảnh. Cảnh dài >6s phải có ≥3 nhịp.
3. **Chữ trên màn hình ≤ 7 từ mỗi nhãn**, không chép lời đọc (đã có phụ đề). Chữ quan trọng trong vùng an toàn x 80–930, y 240–1200.
4. **Ảnh được tràn mép** (nhất là mép dưới, sau phụ đề) — tạo chiều sâu; chữ thì không.
5. **Máy quay:** zoom 1,03–1,12. Zoom càng lớn càng cắt mép: điểm (x, y) hiện ở `(x − camX)·zoom + 540` — kiểm chữ sát mép sau khi zoom.
6. **Chuyển cảnh** đa dạng, không lặp liên tiếp: `sheet` (giấy mới đặt chồng), `push`/`push-up` (lia bảng), `tear` (xé giấy), `zoom`, `cut`.
   Cắt thẳng (`cut`) vẫn là mặc định tốt giữa hai nhịp cùng mạch.
7. **Âm thanh:** mỗi lớp/chuyển cảnh tự có SFX (giấy, băng dính, máy chữ, đóng dấu, pop, whoosh). Nhạc nền nhẹ ở 14% (`brand/music/`, xem `credits.json`; mặc định "Investigations" — tò mò, hợp chủ đề "lần dấu vết").
   SFX do `code/voz/tools/make_sfx.py` tổng hợp → không lo bản quyền; muốn tiếng thật thì thay file `.wav` cùng tên.
8. **Một điểm đỏ mỗi khung**: chỉ một thứ được tô đỏ/màu nổi trong một khung hình.

## 5. Công thức theo nhịp kịch bản
| Nhịp | Công thức cắt dán |
|---|---|
| Hook (0–3s) | vật thể thật tách nền trồi từ đáy (`enter: "up"`) + 2–3 nhãn giấy xé đập xuống theo lời + chữ cắt rời cho từ bất ngờ |
| Mốc thời gian / nhân vật | số `poster` vàng + chân dung `bw` dán băng dính + tên `ransom` + `string` nối tới vật liên quan |
| Khám phá / kết luận nhỏ | chữ lớn `label` font `heavy` vào kiểu `stamp` + mũi tên tay chỉ vào ảnh + máy zoom tới |
| Địa lý / chuỗi cung ứng | `map`: nhìn rộng → tô đỏ nước A → đường nét đứt → zoom vào nước B → ghim nhãn hộp đen |
| Con số then chốt | `bigNumber` style `letterpress` trên `grid`, nhãn vàng giải nghĩa, ảnh `bw` tràn đáy |
| Trích nguồn | `document`: đoạn trích **thật** nghiêng 3D, bút dạ quang quét câu chính, đoạn khác mờ đi |
| So sánh | hai `photo`/`image` đối xứng, một bên `bw` một bên `color`, `tag` dưới mỗi bên, hoặc `compare` |
| Kết | `question` + lựa chọn A/B; có thể thêm ảnh tràn đáy để khung không trống |

## 5b. Intro, outro, ảnh bìa (bản 3, 20/10/2026)
- **Hook trước, thương hiệu sau.** Phần lớn người xem quyết định lướt trong 1–3 giây đầu, nên không mở bằng logo/lời chào. Cảnh `intro`
  (~2,5–3s) đặt **sau** hook: logo đập xuống có băng dính, tag series + số tập, nhãn chủ đề gạch chân vàng; lời "Cùng VOZ STORY bóc tách …".
- **Outro một ý**: sau câu hỏi A/B, thẻ kết ~5s: bong bóng "Bình luận: A hay B?" → nút đỏ "+ Theo dõi" xuất hiện, ngón tay bấm → "Đã theo dõi ✓",
  dấu + trên ảnh đại diện thành ✓ → chuông rung; logo + @handle + tagline. Shorts thường không có màn hình kết thúc → CTA phải nằm trong video.
- **Ảnh bìa** là ảnh riêng (không chèn vào video): 1–3 chữ siêu lớn tương phản cao, một vật thể thật, một điểm đỏ (dấu/mũi tên/vòng khoanh),
  chữ trong vùng 3:4 giữa ảnh. Không lặp tên series hay tiêu đề.
- Nguồn tham khảo (blog công cụ/marketing, chưa phải số liệu chính thức — kiểm lại bằng retention của kênh):
  [opus.pro](https://www.opus.pro/blog/youtube-shorts-hook-formulas), [subscribr](https://subscribr.ai/youtube-strategy/perfect-youtube-short-length-structure-hooks),
  [creatoressentials](https://www.creatoressentials.com/glossary/youtube-outro/), [capcut](https://www.capcut.com/resource/youtube-short-thumbnail),
  [kapwing](https://www.kapwing.com/resources/how-to-change-tiktok-thumbnail/), [rybbit](https://rybbit.com/tools/tiktok-character-counter).

## 6. Ranh giới biên tập (bắt buộc)
- **Bản đồ Việt Nam phải có Hoàng Sa và Trường Sa** — cảnh `map` tự vẽ hai quần đảo cùng màu Việt Nam (Natural Earth không có);
  không thêm đường biên/nhãn "South China Sea" — nếu cần gọi tên biển, dùng "Biển Đông".
- `document`: chỉ trích **câu thật** từ nguồn ghi ở `source`; `outlet` là chữ thường, không vẽ logo/măng-sét toà soạn. Ghi chép của kênh
  thì đặt `outlet` là "HỒ SƠ VOZ · …" để không bị hiểu là báo thật.
- Ảnh người thật: không đặt vào vai tiêu cực; không ghép người thật với thông điệp họ không nói.
- Mọi ảnh trong `sources.json` (xem skill `voz-assets`); ghi công CC BY trong mô tả.

## 7. Khung ngang 16:9 — video dài (bản 4, 22/10/2026)
Cùng chất liệu cắt dán, nhưng video dài cần **nhịp thở** và **bằng chứng** nhiều hơn Shorts. Mẫu đủ cảnh: `code/samples/long-test`.
Checklist nội dung đầy đủ: `docs/longform-checklist.md`.

**Bố cục**
- Toạ độ lớp theo khung **1920×1080**. Chữ quan trọng trong x 120–1800, y 70–1010; ảnh/vật thể được tràn mép.
- Khung ngang rộng → **bố cục 2 cột** là mặc định: chữ/nhãn một bên, hình một bên (cảnh dựng sẵn tự chia khi có tiêu đề).
  Collage: chia khung thành 2–3 "vùng" (vd chân dung trái — vật thể giữa — nhãn phải) thay vì xếp chồng dọc như Shorts.
- Dòng chữ không chạy hết bề ngang: tiêu đề tối đa ~60% bề rộng; nhãn ≤ 7 từ như cũ.
- Góc dưới-trái dành cho lower third (`props.lower`); dải y ≈ 900–1000 dành cho phụ đề nếu bật — đừng đặt nhãn quan trọng ở đó.
- 20s cuối là màn hình kết thúc: khung phải có 2 ô trống cho phần tử YouTube — không thêm gì đè lên.

**Nhịp**
- Không khung nào đứng yên quá 5–6 giây (Shorts: 1,5–3 giây). Video dài được phép chậm hơn ở đoạn giải thích, nhưng phải có chuyển động
  nhỏ (lớp mới theo `cue`, máy lia, đường kẻ dần).
- Mỗi 60–90 giây một **nhịp giữ chân**: đổi nền, thẻ chương, bản đồ, tư liệu thật, con số lớn, hoặc khoảng lặng trước cú lật.
- Mỗi chương nên có **một tông nền riêng** (vd chương lịch sử `cream`/`sepia`, chương hôm nay `charcoal`, chương số liệu `grid`).

**Bằng chứng trước, minh họa sau**
| Nhịp video dài | Công thức |
|---|---|
| Cold open (0–30s) | tư liệu/vật thể thật + câu hỏi trung tâm bằng nhãn giấy; chứng minh tiêu đề trong 10 giây |
| Mở chương | `chapter`: số poster + tên chương + (ảnh tách nền của nhân vật/vật thể chương đó) |
| Nhân vật lịch sử | chân dung `bw` dán băng dính + `lower` (tên, vai trò, năm sinh–mất) + `timeline` khi cần đặt vào bối cảnh |
| Tư liệu gốc | `callout`: ảnh lưu trữ in giấy, vòng tròn vàng khoanh chi tiết, nhãn đánh máy — mỗi chương lịch sử ≥ 1 lần |
| Diễn biến theo thời gian | `timeline` (sự kiện) hoặc `lineChart` (số liệu); ghi `source` |
| Địa lý / chuỗi cung ứng | `map` nhìn rộng → zoom theo lời → tuyến nét đứt; có Việt Nam là có Hoàng Sa, Trường Sa |
| Phim tư liệu | `footage` style `print` (khung phim trên giấy) — ngắn 3–6 giây, tắt tiếng gốc, ghi nguồn |
| Lời người thật | `quote` (nguyên văn có nguồn) hoặc `document` (bút dạ quang quét câu chính) |
| Kết | trả lời + `question` A/B → màn hình kết thúc tự chèn |

**Ảnh AI:** không dùng làm tư liệu hay "ảnh lịch sử" — người xem kênh giải thích tin vào hình là bằng chứng. Chỉ dùng cho nền, texture,
ảnh bìa cách điệu; dựng lại sự kiện thật trông như thật thì phải khai báo nội dung tổng hợp trên YouTube.
