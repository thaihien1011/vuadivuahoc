# TECHNICAL REFERENCE — Ứng dụng Gamification hỗ trợ học sinh THCS
### (Lịch sử, Địa lý, Hoạt động trải nghiệm)

> **v2 — đã chốt toàn bộ mục 10 (trừ #6 để dành lúc code).** File này gộp **toàn bộ quyết định kỹ thuật đã chốt** qua quá trình trao đổi thiết kế nghiệp vụ + kiến trúc hệ thống. Dùng làm nguồn tham chiếu duy nhất khi bắt đầu phiên chat mới để viết spec/mô tả cho Antigravity. Mọi phần còn đánh dấu **[CHƯA CHỐT]** là điểm cần quyết định thêm trước hoặc trong lúc viết spec.

---

## 0. Bối cảnh dự án

- Người thực hiện: học sinh lớp 8, dự án dự thi Cuộc thi Khoa học kỹ thuật (KHKT) cấp trường/thành phố.
- Mục tiêu MVP: ~2 tháng, phát triển theo hướng "vibe coding" trong Antigravity IDE.
- Tài nguyên sẵn có: GitHub, Antigravity IDE, Google Drive, Firebase (Auth, Firestore, Cloud Functions, Storage, Hosting), GCP, Google One AI Pro (Gemini), NotebookLM.
- Có báo cáo dự thi dạng .docx riêng (theo mẫu KHKT) — **không dùng file đó làm spec kỹ thuật**, vì viết theo văn phong nghiên cứu khoa học, thiếu chi tiết implementation. File này mới là nguồn kỹ thuật đầy đủ.

---

## 1. Gameplay Loop & Điều hướng

- Học sinh **tự do chọn bất kỳ location nào** trên bản đồ ngay từ đầu, không mở khóa tuần tự.
- Mọi location/chặng đều **nhìn thấy được** trên bản đồ, nhưng chỉ **học và làm quiz được** khi:
  - (a) **Giao bài**: giáo viên đã giao lesson đó cho đúng lớp của học sinh — có deadline riêng theo lớp, hoặc
  - (b) **Tự học**: học sinh chủ động chọn tự học — không phụ thuộc deadline của lớp, dùng hạn mặc định của hệ thống.
- Data model cho việc này: xem `ASSIGNMENTS` ở mục ERD — mỗi lesson có thể có **nhiều bản ghi assignment**: một bản ghi mặc định (`class_id = null`) cho tự học, và các bản ghi riêng theo từng lớp do giáo viên tạo khi giao bài.
- Logic kiểm tra quyền truy cập (áp dụng ở cả Security Rules và Cloud Function):
  - Vào từ "bài được giao": tìm `assignments` có `class_id == student.class_id`, `is_active == true`, `now <= deadline`.
  - Vào từ "tự học": tìm `assignments` có `class_id == null`, `is_active == true`. Bản ghi mặc định này có **`deadline = null` (đã chốt — không giới hạn thời gian)**. Logic kiểm tra: nếu `deadline == null` thì luôn cho phép, bỏ qua điều kiện `now <= deadline`.

### 1.1. Công cụ hiệu chỉnh tọa độ bản đồ (Map Coordinate Calibration)
- Tính năng **Chấm tọa độ vị trí (Click-to-Pin Tool)**, **Copy JSON** và **Xuất file JSON** được tách hoàn toàn khỏi giao diện học sinh (`InteractiveMap.jsx` với `isAdminMode=false`) và đưa vào **Cổng quản trị Giáo viên** (`TeacherDashboard.jsx`).
- Giao diện học sinh giữ bản đồ sạch sẽ, chuẩn gamification, không chứa công cụ developer/admin.
- Giáo viên/Admin truy cập tab **"🎯 Hiệu chỉnh tọa độ bản đồ"** trong Cổng quản trị để bật chế độ chấm tọa độ, căn chỉnh vị trí ghim và sao chép/xuất bộ dữ liệu 65 địa điểm.

---

## 2. Cấu trúc Quiz và cơ chế tính điểm

### 2.1. Random câu hỏi
- Ngân hàng câu hỏi mỗi lesson: **tối thiểu 10 câu** (không phải đúng 10 — linh hoạt hơn).
- Mỗi lượt làm bài: hệ thống **random 10 câu** từ ngân hàng.
- **Random luôn thực hiện ở Cloud Function phía server**, KHÔNG random ở client — tránh học sinh xem trước ngân hàng câu hỏi qua devtools.

### 2.2. Luồng làm bài và lưu điểm
- Học sinh làm lại quiz **không giới hạn số lần**.
- Sau khi nộp bài (xem điểm), có đúng **3 lựa chọn**:
  | Hành động | Ý nghĩa |
  |---|---|
  | **Làm lại** | Không lưu điểm, không ảnh hưởng dữ liệu, có thể làm lại ngay |
  | **Lưu** | So sánh điểm mới với điểm cao nhất đã lưu trước đó (`locked_scores`) của cùng lesson — **chỉ cập nhật nếu điểm mới cao hơn** |
  | **Thoát** | Quay về dashboard, không lưu điểm |
- Đây là cơ chế **"giữ điểm cao nhất"**, KHÔNG phải "khóa vĩnh viễn lần đầu" — học sinh có thể tiếp tục cải thiện điểm ở các lần Lưu sau.
- Chống farm điểm: vì làm lại không cộng thêm, luôn so sánh max, nên không cần cơ chế chống farm riêng.

### 2.3. Bảo mật đáp án
- Đáp án đúng **CHỈ trả về sau khi bấm "Lưu"** — không trả kèm lúc tải đề (`getQuizQuestions`), không trả kèm lúc chỉ xem điểm số.
- "Làm lại" và "Thoát" không có bước gọi API nào trả đáp án đúng.

### 2.4. Đồng hồ và giới hạn thời gian
- Có đồng hồ đếm giờ ghi lại thời gian làm bài của mỗi lượt.
- **Không giới hạn thời gian** làm bài.
- Đồng hồ bắt đầu chạy **ngay khi trang mount** (không có bước "bắt đầu" riêng — xem mục 2.6).

### 2.5. Loại câu hỏi: Single choice & Multiple choice
- 2 loại: `single_choice` (mặc định) và `multiple_choice`.
- Đánh dấu trong Google Sheet qua cột `question_type` — **để trống = mặc định `single_choice`** (giáo viên chỉ cần điền khi tạo câu multiple choice).
- **Quy tắc chấm điểm multiple choice: ĐÚNG TUYỆT ĐỐI** (đã chốt qua lựa chọn của người dùng) — phải chọn đủ và không thừa đáp án mới tính đúng; KHÔNG có điểm bộ phận. Mỗi câu chỉ có 2 trạng thái đúng/sai giống single choice.
- Công thức chấm dùng chung cho cả 2 loại: `is_correct = (set(student_answer) == set(question.correct_options))`
- `correct_options` trong Firestore **luôn là mảng**, kể cả single choice (mảng 1 phần tử) — để app chỉ cần 1 kiểu parse dữ liệu.

### 2.6. Intro của quiz
- Mỗi lesson có phần intro **hiển thị chung 1 trang với câu hỏi** — không tách trang/session riêng.
- Gồm: `intro_text` (text, tối đa **500 từ**, optional) và/hoặc `intro_video_url` (link video, optional).
- Chỉ hiển thị phần nào **có dữ liệu**; phần trống thì ẩn hoàn toàn (không hiện khung rỗng).
- Video hỗ trợ 3 nguồn: **YouTube, Facebook, TikTok**:
  - YouTube: nhúng iframe trực tiếp, đơn giản.
  - Facebook: dùng Facebook video plugin (`facebook.com/plugins/video.php?href=...`) — phụ thuộc cài đặt riêng tư của video gốc.
  - TikTok: **không nhúng trực tiếp bằng URL được** — cần gọi TikTok oEmbed API. Đề xuất: gọi oEmbed **một lần lúc sync** (Cloud Function), cache HTML/thumbnail vào Firestore, app chỉ đọc kết quả đã cache, không gọi API ngoài lúc runtime.

### 2.7. Thang điểm & Stamp
- Thang điểm 0–10 (10 câu, mỗi câu 1 điểm, đúng/sai nhị phân kể cả multiple choice).
- Mốc Stamp: **<5 = không đạt/không nhận Stamp**; **5–6**, **7–8**, **9–10** = 3 mức Stamp tăng dần.
- **Bảng `star_reward_table` (đã chốt):**

  | Mốc Stamp | Điểm | Star (giá trị mốc, dùng để tính chênh lệch) |
  |---|---|---|
  | 1 | 5–6 | 1 |
  | 2 | 7–8 | 2 |
  | 3 | 9–10 | 3 |

  Áp dụng theo nguyên tắc **chênh lệch**: `star_delta = star_reward_table[mốc_mới] - star_reward_table[mốc_cũ]`. Tổng star tối đa nhận được từ 1 lesson (= 1 location) là **3 star**, không bao giờ cộng dồn qua nhiều lần làm lại dù học sinh làm bao nhiêu lượt (chống farm).

  Ví dụ: lần 1 đạt 6đ (mốc 1) → +1 star. Lần 2 đạt 7đ (mốc 2) → +1 star (delta 2-1), lũy kế 2 star. Lần 3 đạt 9đ (mốc 3) → +1 star (delta 3-2), lũy kế 3 star (max). Lần 4 đạt 8đ (thấp hơn best 9đ) → không cập nhật, không có star.

---

## 3. Hệ thống Star và Wardrobe

### 3.1. Star
- Học sinh nhận Star khi **cải thiện mốc Stamp** của một lesson.
- Chỉ thưởng **phần chênh lệch** giữa mốc Stamp cũ và mới (tránh cộng trùng khi làm lại/lưu nhiều lần).
- Lưu ở **2 nơi** (luôn cập nhật cùng 1 transaction):
  - `STUDENTS.current_star`: số dư hiện tại, đọc nhanh cho UI.
  - `STAR_TRANSACTIONS`: sổ cái ghi từng lần earn/spend — phục vụ audit, đối soát.

```
transaction saveScore(attempt_id):
  attempt = get(quiz_attempts/{attempt_id})
  verify attempt.student_id == auth.uid
  best = get(locked_scores/{student_id}_{lesson_id})
  if best is null OR attempt.score > best.score:
     old_stamp = best?.stamp_level ?? 0
     new_stamp = stamp_level_of(attempt.score)
     if new_stamp > old_stamp:
        star_delta = star_reward_table[new_stamp] - star_reward_table[old_stamp]  // {1: 1, 2: 2, 3: 3} — đã chốt
        update students.current_star += star_delta
        create star_transactions { amount: star_delta, type: "earn", source: "quiz", reference_id: lesson_id }
     set locked_scores = { score: attempt.score, stamp_level: new_stamp, updated_at: now }
     return { updated: true, score: attempt.score, review: [...] }  // xem mục 2.3
  else:
     return { updated: false, score: best.score }
```

### 3.2. Wardrobe (phạm vi MVP)
- **CÓ trong MVP**: chỉ **trang phục** — tóc (dài/ngắn), áo (3 loại), quần (1), váy (1), giày (1), ủng (1), dép (1).
- **KHÔNG có trong MVP** (để V2): thay đổi ngoại hình cố định (da, ngũ quan), phụ kiện (nón, túi, trang sức, găng tay, tất, áo khoác).
- Giá mỗi skin: **đồng giá 5 sao/item cho mọi loại** (đã chốt — không phân biệt giá theo loại: tóc, áo, quần, váy, giày, ủng, dép đều 5 sao).
- Skin đã mua hiển thị đầy đủ màu, cho phép áp dụng; skin chưa mua hiển thị mờ, phải mua mới áp dụng được.
- Mọi hành động **mua** và **mặc** đều qua Cloud Function dạng transaction:
  - **Mua**: kiểm tra đủ Star → trừ Star → ghi `student_wardrobe` + `star_transactions (type: spend)`.
  - **Mặc**: kiểm tra `item_id` có trong `student_wardrobe` của học sinh đó mới cho phép cập nhật `avatar_config` — chặn trường hợp sửa request để mặc đồ chưa mua.

---

## 4. Leaderboard & Seasonal Stamp

- Leaderboard dựa trên **điểm đã Lưu** (`locked_scores`) — không tính các lượt làm thử chưa lưu.
- **Vĩnh viễn**, không reset theo tuần/tháng, điểm/Stamp không giảm theo thời gian.
- Seasonal Stamp chỉ nhận được **trong đúng khung thời gian sự kiện** (VD 30/4, 2/9); qua thời gian đó không lấy lại được.

---

## 5. Quản lý nội dung (Giáo viên soạn bài, đồng bộ dữ liệu)

### 5.1. Quy trình soạn nội dung
- Nội dung câu hỏi soạn với sự hỗ trợ **NotebookLM + Gemini** (giai đoạn soạn thảo, con người dùng, KHÔNG phải API gọi runtime trong app — không tốn chi phí API cho mỗi lượt học sinh dùng).
- Quản lý trong **1 file Google Sheet duy nhất, gồm 2 tab riêng biệt** (đã chốt — xem mục 5.2) — tiết kiệm chi phí xây UI nhập liệu riêng.

### 5.2. Cấu trúc Google Sheet (đã chốt: 1 file, 2 tab)

Lý do chọn 1 file 2 tab thay vì 2 file riêng: Google Sheets API đọc theo tên tab cụ thể (`TênTab!A1:Z`), nên 2 lệnh gọi API tách biệt hoàn toàn, không có nguy cơ đọc nhầm tab. 1 file giúp giáo viên thao tác quen thuộc (như Excel), 1 lần bấm "Đồng bộ" luôn đọc cả 2 tab cùng lúc nên dữ liệu nhất quán, chỉ cần cấp quyền Viewer cho service account 1 lần. Có sẵn file mẫu: `google_sheet_template_content.xlsx` (2 tab `lessons` + `questions`, kèm hướng dẫn và dữ liệu ví dụ).

**Tab `lessons`** (metadata cấp lesson):
| Cột | Ghi chú |
|---|---|
| `lesson_id` | Bắt buộc, khớp với `lesson_id` bên tab `questions` |
| `lesson_name` | Tên lesson/location hiển thị |
| `intro_text` | Optional, ≤500 từ |
| `intro_video_url` | Optional, YouTube/Facebook/TikTok |
| `is_active` | Giáo viên tự bật/tắt trước khi sync |

**Tab `questions`** (ngân hàng câu hỏi):
| Cột | Ghi chú |
|---|---|
| `lesson_id` | Bắt buộc, khớp với tab `lessons` |
| `question_text` | Bắt buộc |
| `question_type` | Optional, để trống = `single_choice` |
| `option_a` .. `option_d` | 4 lựa chọn |
| `correct_options` | 1 giá trị (VD `b`) nếu single choice; phân tách dấu phẩy (VD `b,d`) nếu multiple choice |
| `question_id` | Để trống khi tạo mới; Cloud Function tự sinh và ghi ngược lại sau khi sync (để lần sync sau biết insert hay update, tránh trùng) |

### 5.3. Đồng bộ Sheet → Firestore
- Nút **"Đồng bộ"** nằm trong **Trang quản trị giáo viên** (không phải trong Sheet) — giáo viên chủ động bấm, không tự động theo real-time, tránh đồng bộ dữ liệu đang soạn dở.
- Cloud Function `syncQuestions` đọc **cả 2 tab** (`lessons` và `questions`) trong cùng 1 lần chạy, qua 2 range API riêng biệt, rồi map dữ liệu với nhau qua `lesson_id`:
  1. Xác thực người gọi là giáo viên hợp lệ (Firebase Auth token).
  2. Đọc Sheet qua Google Sheets API — service account có quyền Viewer trên Sheet.
  3. Validate từng dòng: đủ 4 đáp án, có đáp án đúng, đúng định dạng theo `question_type` (single_choice phải đúng 1 correct_option; multiple_choice phải ≥2) — sai định dạng thì báo lỗi theo dòng, KHÔNG lưu câu đó.
  4. Ghi Firestore `questions` theo `lesson_id` — insert nếu `question_id` mới, update nếu đã tồn tại.
  5. Trả báo cáo: số câu hợp lệ / số câu lỗi kèm số dòng.
  6. **Chặn activate lesson nếu chưa đủ ≥10 câu hợp lệ**.

---

## 6. Tài khoản và bảo mật

### 6.1. Học sinh — Admin Reset (không dùng email)
- Học sinh **không có email cá nhân** — không có trường `recovery_email`.
- Quên mật khẩu → **giáo viên chủ nhiệm reset trực tiếp** trong Trang quản trị (không qua email, không qua bất kỳ dịch vụ email nào):

```
Bước 1: Giáo viên chọn học sinh trong danh sách lớp mình quản lý → bấm "Đặt lại mật khẩu"
Bước 2: Dialog xác nhận (tránh reset nhầm)
Bước 3: Cloud Function kiểm tra người gọi đúng là GV quản lý lớp của học sinh đó (đối chiếu class_id)
Bước 4: Sinh mật khẩu tạm ngẫu nhiên đủ mạnh → cập nhật thẳng Firebase Auth qua Admin SDK
Bước 5: Trả mật khẩu tạm về màn hình admin, hiện 1 LẦN DUY NHẤT + nút copy — không lưu, không gửi email
Bước 6: Đặt must_change_password = true — học sinh đăng nhập lần sau bắt buộc đổi mật khẩu ngay
Bước 7: Ghi security_audit_log { actor_id: teacher_id, target_id: student_id, action, created_at }
```

- **Không dùng bất kỳ dịch vụ email transactional nào (SES/SendGrid/Mailgun) cho học sinh** — đã loại bỏ hoàn toàn khỏi kiến trúc, tiết kiệm chi phí và giảm bề mặt tấn công (không còn endpoint public để spam yêu cầu reset).

### 6.2. Giáo viên — Forgot password chuẩn Firebase
- Giáo viên **có email thật** (`recovery_email` = email đăng nhập).
- Dùng tính năng quên mật khẩu **có sẵn của Firebase Auth** (`sendPasswordResetEmail()`) — gửi **link** đặt lại (không phải mật khẩu), **miễn phí**, không cần thêm dịch vụ nào.

### 6.3. Security baseline
- Firebase Auth cho xác thực — không tự xây cơ chế mật khẩu riêng.
- Identity Platform password policy (độ dài tối thiểu, độ phức tạp) — cấu hình 1 lần trong Firebase Console.
- Firestore Security Rules theo nguyên tắc **least-privilege** cho từng role.
- Không log/lưu mật khẩu ở dạng plaintext bất kỳ đâu.

### 6.4. Chống DDoS/spam & kiểm soát ngân sách
- **Firebase App Check**: gắn token xác thực vào mọi request tới Firestore/Functions — chặn request không đến từ app thật, TRƯỚC khi chạm vào tài nguyên tốn tiền.
- **Rate limit ở tầng Cloud Function** cho endpoint nhạy cảm — ngưỡng cụ thể **đã chốt**:

  | Function | Ngưỡng |
  |---|---|
  | `getQuizQuestions` | 20 lần/phút/user |
  | `submitQuiz`, `saveScore` | 10 lần/phút/user |
  | `purchaseWardrobeItem`, `equipWardrobeItem` | 15 lần/phút/user |
  | `adminResetPassword` | 5 lần/phút/giáo viên |
  | `syncQuestions` | 3 lần/phút/giáo viên |
- **GCP Billing Budget Alert** — cảnh báo khi chi phí chạm 50%/80%/100% ngân sách dự kiến.
- **Giới hạn max instances** của Cloud Functions — chặn traffic bất thường tự scale gây tốn tiền.
- Cloud Armor: **không cần ở MVP**, để dành khi traffic lớn hơn nhiều (V2).

---

## 7. Kiến trúc hệ thống

| Thành phần | Vai trò |
|---|---|
| Ứng dụng học sinh | Client chính — chọn location, làm quiz, xem leaderboard, đổi wardrobe |
| Trang quản trị giáo viên | Web app — tạo lesson, giao bài, đồng bộ câu hỏi, quản lý học sinh, reset mật khẩu |
| Firebase Auth | Xác thực đăng nhập cho cả 2 vai trò |
| Firestore | CSDL chính (NoSQL, realtime) — lưu toàn bộ dữ liệu nghiệp vụ |
| Cloud Functions | **Toàn bộ logic nghiệp vụ nhạy cảm phía server**: random câu hỏi, chấm điểm, thưởng Star, mua/mặc wardrobe, đồng bộ Sheet, reset mật khẩu |
| Firebase Storage | Ảnh, tài nguyên bài học, ảnh wardrobe |
| Firebase Hosting | Host Trang quản trị giáo viên |
| GitHub Actions | CI/CD — build, test, deploy tự động lên Firebase |
| NotebookLM + Gemini | Hỗ trợ soạn nháp nội dung (giai đoạn soạn thảo, KHÔNG dùng runtime trong app) |
| Google Sheets | Nguồn quản lý nội dung câu hỏi (xem mục 5) |

**Nguyên tắc thiết kế cốt lõi**: mọi logic có thể bị gian lận/lộ dữ liệu nếu chạy ở client (random câu hỏi, chấm điểm, cộng sao, đổi mật khẩu...) đều **PHẢI** chạy trong Cloud Function — client không bao giờ ghi trực tiếp vào các collection nhạy cảm (`locked_scores`, `star_transactions`, `student_wardrobe`, `security_audit_log`).

---

## 8. Mô hình dữ liệu (ERD đầy đủ)

```
TEACHERS
  id: string (PK)
  name: string
  recovery_email: string        // = email đăng nhập, dùng cho forgot password chuẩn Firebase

CLASSES
  id: string (PK)
  name: string
  teacher_id: string (FK -> TEACHERS)

STUDENTS
  id: string (PK)
  name: string
  class_id: string (FK -> CLASSES)
  avatar_config: json            // { hair, top, bottom/skirt, shoes }
  current_star: int
  must_change_password: boolean

LESSONS
  id: string (PK)
  teacher_id: string (FK -> TEACHERS)
  intro_text: string (optional, <=500 từ)
  intro_video_url: string (optional, YouTube/Facebook/TikTok)
  is_active: boolean

QUESTIONS
  id: string (PK)
  lesson_id: string (FK -> LESSONS)
  text: string
  question_type: string          // "single_choice" | "multiple_choice", default single_choice
  options: array<string>         // 4 lựa chọn
  correct_options: array<string> // LUÔN là mảng, kể cả single choice (1 phần tử)

ASSIGNMENTS
  id: string (PK)
  lesson_id: string (FK -> LESSONS)
  class_id: string (FK -> CLASSES, nullable)  // null = bản ghi mặc định cho tự học
  deadline: timestamp (nullable cho self-study mặc định)
  is_active: boolean

QUIZ_ATTEMPTS
  id: string (PK)
  student_id: string (FK -> STUDENTS)
  lesson_id: string (FK -> LESSONS)
  score: int
  duration_seconds: int
  created_at: timestamp
  // Lưu MỌI lượt làm, kể cả lượt không lưu điểm (phục vụ thống kê thời gian làm bài)

LOCKED_SCORES
  id: string (PK)
  student_id: string (FK -> STUDENTS)
  lesson_id: string (FK -> LESSONS)
  score: int
  stamp_level: int
  updated_at: timestamp
  // NGUỒN DUY NHẤT cho leaderboard

WARDROBE_ITEMS
  id: string (PK)
  type: string    // tóc | áo | quần | váy | giày | ủng | dép
  star_cost: int  // = 5, đồng giá mọi loại (đã chốt)

STUDENT_WARDROBE
  id: string (PK)
  student_id: string (FK -> STUDENTS)
  item_id: string (FK -> WARDROBE_ITEMS)
  purchased_at: timestamp

STAR_TRANSACTIONS
  id: string (PK)
  student_id: string (FK -> STUDENTS)
  amount: int
  type: string       // "earn" | "spend"
  source: string     // "quiz" | "wardrobe"
  reference_id: string  // lesson_id hoặc wardrobe item_id
  created_at: timestamp

SECURITY_AUDIT_LOG
  id: string (PK)
  actor_id: string (FK)    // người thực hiện hành động (thường là teacher_id)
  target_id: string (FK)   // đối tượng bị tác động (thường là student_id)
  action: string
  created_at: timestamp
```

### Quan hệ chính
- TEACHERS 1—N CLASSES, LESSONS, SECURITY_AUDIT_LOG (vai trò actor)
- CLASSES 1—N STUDENTS, ASSIGNMENTS
- LESSONS 1—N QUESTIONS, ASSIGNMENTS, QUIZ_ATTEMPTS, LOCKED_SCORES
- STUDENTS 1—N QUIZ_ATTEMPTS, LOCKED_SCORES, STUDENT_WARDROBE, STAR_TRANSACTIONS, SECURITY_AUDIT_LOG (vai trò target)
- WARDROBE_ITEMS 1—N STUDENT_WARDROBE

---

## 9. Danh sách Cloud Functions cần viết spec chi tiết

| Function | Vai trò | Ghi chú bảo mật |
|---|---|---|
| `getQuizQuestions(lesson_id)` | Random 10 câu, kiểm tra quyền truy cập (assignment + deadline), trả về KHÔNG kèm đáp án đúng | Kiểm tra giao bài/tự học theo mục 1 |
| `submitQuiz(attempt_id, answers)` | Chấm điểm, tạo `quiz_attempts`, trả điểm số (không kèm đáp án) | So khớp set() theo mục 2.5 |
| `saveScore(attempt_id)` | Transaction so sánh + cập nhật `locked_scores`, gọi logic thưởng Star, trả về review đáp án đúng | Xem pseudocode mục 3.1 |
| `purchaseWardrobeItem(item_id)` | Transaction trừ sao + ghi `student_wardrobe` | Kiểm tra đủ sao trước khi trừ |
| `equipWardrobeItem(item_id)` | Cập nhật `avatar_config` sau khi kiểm tra sở hữu | Kiểm tra `student_wardrobe` |
| `syncQuestions(lesson_id?)` | Đồng bộ Sheet → Firestore, validate, ghi báo cáo | Chỉ giáo viên gọi được, xem mục 5.3 |
| `adminResetPassword(student_id)` | Reset mật khẩu học sinh, trả mật khẩu tạm | Chỉ GV chủ nhiệm lớp đó gọi được, xem mục 6.1 |
| `createLesson` / `activateLesson` / `deactivateLesson` | CRUD lesson | Kiểm tra teacher_id sở hữu |
| `createAssignment` | Giao bài cho lớp hoặc tạo bản ghi tự học mặc định | Xem mục 1 |

---

## 10. Danh sách các điểm trước đây CHƯA CHỐT — trạng thái cập nhật

1. ✅ **Đã chốt** — Bảng giá trị Star thưởng theo mốc Stamp: `{mốc 1: 1, mốc 2: 2, mốc 3: 3}`, tính theo chênh lệch, max 3 star/lesson. Xem mục 2.7.
2. ✅ **Đã chốt** — Giá Star của Wardrobe item: đồng giá **5 sao/item** cho mọi loại. Xem mục 3.2.
3. ✅ **Đã chốt** — Cấu trúc lưu `intro_text`/`intro_video_url`: **1 file Google Sheet, 2 tab riêng** (`lessons` + `questions`). File mẫu: `google_sheet_template_content.xlsx`. Xem mục 5.2.
4. ✅ **Đã chốt** — Ngưỡng rate-limit cụ thể cho từng Cloud Function nhạy cảm. Xem mục 6.4.
5. ✅ **Đã chốt** — `deadline` mặc định cho assignment tự học = **null (không giới hạn)**. Xem mục 1.
6. ⏭️ **Để dành lúc code** — Format JSON chính xác cho request/response của từng Cloud Function. Các ví dụ trong tài liệu này chỉ mang tính minh họa; sẽ chốt cụ thể khi viết spec/code từng function trong Antigravity.
7. ✅ **Đã chốt** — Quy mô thí điểm (pilot): **~50 học sinh** (nhóm nhỏ) ở giai đoạn pilot, mở rộng lên **~300–500 học sinh** ở giai đoạn live. Dùng để ước tính chi phí/quota Firebase-GCP (Firestore reads/writes, Cloud Function invocations).

---

## 11. Việc CHƯA làm (ngoài phạm vi file này)

- Chưa có Security Rules chi tiết viết sẵn cho từng collection (đã thảo luận nguyên tắc nhưng chưa viết code).
- Chưa có pseudocode đầy đủ cho tất cả Cloud Function trong mục 9 (mới có `saveScore` ở mục 3.1).
- Chưa có format JSON request/response chi tiết cho từng Cloud Function (mục 10, điểm 6 — để dành lúc code).
- Chưa có spec chi tiết luồng UI/UX cho ứng dụng học sinh và trang quản trị giáo viên.
- Chưa xây bản demo/MVP nào — toàn bộ tài liệu này là kết quả giai đoạn thiết kế, chưa triển khai.

---

## 12. Nhật ký cập nhật

- **v2**: Chốt 6/7 điểm ở mục 10 qua phiên hỏi-đáp (bảng Star, giá Wardrobe, cấu trúc Sheet 2-tab, rate-limit, deadline tự học, quy mô pilot). Tạo file mẫu `google_sheet_template_content.xlsx`. Điểm còn lại (#6 — format JSON) để dành cho giai đoạn viết spec Cloud Function / coding.
