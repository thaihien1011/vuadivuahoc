# CLOUD FUNCTIONS SPEC — Ứng dụng Gamification hỗ trợ học sinh THCS

> Spec kỹ thuật chi tiết cho từng Cloud Function, dùng làm input trực tiếp khi viết code trong Antigravity IDE. Đây là bản chi tiết hóa của mục 9 trong `technical-reference.md`. Mọi quyết định nghiệp vụ nền tảng (bảng Star, giá Wardrobe, rate-limit, deadline...) tham chiếu `technical-reference.md` — file này chỉ tập trung vào **logic xử lý, format request/response, mã lỗi** của từng function.

**Tiến độ**: ✅ **10/10 function đã hoàn thành spec chi tiết** (9 function gốc theo mục 9 của `technical-reference.md` + 1 function bổ sung `createStudentAccount`, phát sinh vì học sinh không tự đăng ký tài khoản).

**Cấu trúc `avatar_config` (đã chốt, 4 slot):**
```json
{
  "hair": "wi_hair_001",
  "top": "wi_top_003",
  "bottom_or_skirt": "wi_bottom_002",
  "footwear": "wi_shoes_001"
}
```
Mỗi `wardrobe_items` cần field `slot` xác định thuộc slot nào trong 4 slot trên (`hair` = tóc dài/ngắn, `top` = áo 3 loại, `bottom_or_skirt` = quần hoặc váy — chọn 1, `footwear` = giày/ủng/dép — chọn 1).

**Quy ước chung cho mọi function:**
- Xác thực `auth.uid` lấy từ Firebase Auth context (Cloud Callable Function) — không nhận từ body request.
- Mọi lỗi trả về theo format `{ "error": { "code": "...", "message": "..." } }`, dùng mã lỗi chuẩn kiểu gRPC/Firebase (`PERMISSION_DENIED`, `NOT_FOUND`, `INVALID_ARGUMENT`, `FAILED_PRECONDITION`, `RESOURCE_EXHAUSTED`, `UNAVAILABLE`, `INTERNAL`).
- Rate-limit áp dụng **trước** mọi logic khác trong function (fail fast, tiết kiệm chi phí đọc Firestore).
- Các transaction (saveScore, purchaseWardrobeItem, equipWardrobeItem) bắt buộc dùng Firestore Transaction để tránh race condition khi nhiều request đến gần như đồng thời.

---

## 1. `getQuizQuestions(lesson_id)`

**Mục đích**: Random 10 câu hỏi từ ngân hàng của 1 lesson, kiểm tra quyền truy cập, trả về không kèm đáp án đúng. Tuân thủ quy tắc chống "dồn quiz": 1 attempt `in_progress` phải nộp bài mới được tạo attempt mới.

**Request**
```json
{ "lesson_id": "LS_001" }
```

**Logic xử lý (thứ tự bắt buộc):**
1. Xác thực `auth.uid`.
2. Rate-limit: **20 lần/phút/user** → vượt → `RESOURCE_EXHAUSTED`.
3. `student = get(students/{auth.uid})` — không tồn tại → `PERMISSION_DENIED`.
4. Kiểm tra quyền truy cập lesson:
   - Query `assignments` where `lesson_id == lesson_id AND class_id == student.class_id AND is_active == true`, kiểm tra `deadline == null OR now <= deadline`.
   - Nếu không có, query `assignments` where `lesson_id == lesson_id AND class_id == null AND is_active == true` (bản ghi tự học, `deadline` luôn `null`).
   - Không thỏa điều kiện nào → `PERMISSION_DENIED`.
5. `lesson = get(lessons/{lesson_id})` — `is_active == false` → `FAILED_PRECONDITION`. Không tồn tại → `NOT_FOUND`.
6. **Kiểm tra attempt đang dở**: query `quiz_attempts` where `student_id == auth.uid AND lesson_id == lesson_id AND status == "in_progress"`.
   - Có → dùng lại `attempt_id` và `question_ids` đã lưu, **không random mới**.
   - Không có → random 10 câu (Fisher-Yates) từ `questions` where `lesson_id == lesson_id`; tạo `quiz_attempts` mới (`status: "in_progress"`, lưu mảng `question_ids`).
7. Trả câu hỏi, loại bỏ field `correct_options`.

**Response (thành công)**
```json
{
  "attempt_id": "qa_xyz123",
  "status": "in_progress",
  "lesson": {
    "lesson_id": "LS_001",
    "lesson_name": "Cột cờ Hà Nội",
    "intro_text": "...",
    "intro_video_url": "https://..."
  },
  "questions": [
    {
      "question_id": "q_001",
      "text": "Cột cờ Hà Nội được xây dựng vào năm nào?",
      "question_type": "single_choice",
      "options": ["1804", "1812", "1820", "1835"]
    }
  ],
  "started_at": "2026-08-28T10:00:00Z"
}
```

**Mã lỗi**: `RESOURCE_EXHAUSTED`, `PERMISSION_DENIED`, `FAILED_PRECONDITION`, `NOT_FOUND`, `INTERNAL`.

---

## 2. `submitQuiz(attempt_id, answers, duration_seconds)`

**Mục đích**: Chấm điểm bài làm, chuyển `quiz_attempts` sang `submitted`, trả điểm số — không kèm đáp án đúng.

**Request**
```json
{
  "attempt_id": "qa_xyz123",
  "answers": {
    "q_001": ["b"],
    "q_002": ["a", "d"]
  },
  "duration_seconds": 145
}
```

**Logic xử lý (thứ tự bắt buộc):**
1. Xác thực `auth.uid`.
2. Rate-limit: **10 lần/phút/user**.
3. `attempt = get(quiz_attempts/{attempt_id})` — không tồn tại → `NOT_FOUND`.
4. `attempt.student_id == auth.uid` — sai → `PERMISSION_DENIED`.
5. `attempt.status == "in_progress"` — nếu đã `submitted` → `FAILED_PRECONDITION` ("Bài này đã nộp rồi — hãy Làm lại để tạo lượt mới").
6. **Validate `answers` đầy đủ**: so khớp `Object.keys(answers)` với `attempt.question_ids`. Thiếu câu nào hoặc có `question_id` lạ → `INVALID_ARGUMENT` ("Vui lòng trả lời đầy đủ 10 câu trước khi nộp bài") — không chấm điểm, không đổi status.
7. Với mỗi câu: `question = get(questions/{question_id})`, chấm `is_correct = (set(student_answer) == set(question.correct_options))`.
8. `score = số câu đúng` (thang 0–10).
9. Cập nhật `attempt`: `status = "submitted"`, `score`, `answers`, `duration_seconds`, `submitted_at = now`.
10. Trả điểm + đúng/sai từng câu — **không** kèm `correct_options`.

**Response (thành công)**
```json
{
  "attempt_id": "qa_xyz123",
  "status": "submitted",
  "score": 7,
  "total_questions": 10,
  "per_question_result": [
    { "question_id": "q_001", "is_correct": true },
    { "question_id": "q_002", "is_correct": false }
  ],
  "submitted_at": "2026-08-28T10:05:00Z"
}
```

**Response lỗi (thiếu câu trả lời)**
```json
{ "error": { "code": "INVALID_ARGUMENT", "message": "Vui lòng trả lời đầy đủ 10 câu trước khi nộp bài" } }
```

**Mã lỗi**: `RESOURCE_EXHAUSTED`, `NOT_FOUND`, `PERMISSION_DENIED`, `FAILED_PRECONDITION`, `INVALID_ARGUMENT`, `INTERNAL`.

---

## 3. `saveScore(attempt_id)`

**Mục đích**: So sánh điểm mới với `locked_scores` hiện tại, cập nhật nếu cao hơn, cộng Star theo chênh lệch mốc Stamp, luôn trả về đáp án đúng đầy đủ.

**Request**
```json
{ "attempt_id": "qa_xyz123" }
```

**Bảng star_reward_table (đã chốt)**: `{ mốc 1: 1, mốc 2: 2, mốc 3: 3 }`

**Logic xử lý (Firestore Transaction bắt buộc):**
1. Xác thực `auth.uid`.
2. Rate-limit: **10 lần/phút/user**.
3. `attempt = get(quiz_attempts/{attempt_id})` — không tồn tại → `NOT_FOUND`.
4. `attempt.student_id == auth.uid` — sai → `PERMISSION_DENIED`.
5. `attempt.status == "submitted"` — nếu không → `FAILED_PRECONDITION` ("Phải nộp bài trước khi lưu điểm").
6. `best = get(locked_scores/{student_id}_{lesson_id})`.
7. Nếu `best == null OR attempt.score > best.score`:
   - `old_stamp = best?.stamp_level ?? 0`; `new_stamp = stamp_level_of(attempt.score)` (0 nếu <5, 1 nếu 5-6, 2 nếu 7-8, 3 nếu 9-10).
   - Nếu `new_stamp > old_stamp`:
     - `star_delta = star_reward_table[new_stamp] - (star_reward_table[old_stamp] ?? 0)`
     - `update students/{student_id}.current_star += star_delta`
     - `create star_transactions { student_id, amount: star_delta, type: "earn", source: "quiz", reference_id: lesson_id, created_at: now }`
   - `set locked_scores/{student_id}_{lesson_id} = { score: attempt.score, stamp_level: new_stamp, updated_at: now }`
   - `saved = true`, `star_earned = star_delta` (0 nếu stamp không đổi dù điểm cao hơn).
8. Nếu điểm mới **không** cao hơn best: không cập nhật `locked_scores`, không cộng star. `saved = false`, `star_earned = 0`.
9. **Luôn** trả về `correct_options` đầy đủ cho từng câu, bất kể bước 7 hay 8 (đã chốt: học sinh luôn được xem đáp án khi bấm Lưu).

**Response (điểm cải thiện)**
```json
{
  "saved": true,
  "score": 9,
  "previous_best_score": 6,
  "stamp_level": 3,
  "star_earned": 2,
  "current_star_balance": 8,
  "review": [
    { "question_id": "q_001", "correct_options": ["b"], "student_answer": ["b"], "is_correct": true },
    { "question_id": "q_002", "correct_options": ["a", "d"], "student_answer": ["a"], "is_correct": false }
  ]
}
```

**Response (điểm không cải thiện — vẫn trả review)**
```json
{
  "saved": false,
  "score": 7,
  "previous_best_score": 9,
  "stamp_level": 3,
  "star_earned": 0,
  "current_star_balance": 8,
  "review": [ "..." ]
}
```

**Mã lỗi**: `RESOURCE_EXHAUSTED`, `NOT_FOUND`, `PERMISSION_DENIED`, `FAILED_PRECONDITION`, `INTERNAL`.

---

## 4. `syncQuestions(lesson_id?)`

**Mục đích**: Đồng bộ dữ liệu từ Google Sheet (2 tab `lessons` + `questions`) vào Firestore. Chỉ giáo viên gọi được.

**Request**
```json
{ "lesson_id": "LS_001" }
```
`lesson_id` optional — bỏ trống = đồng bộ toàn bộ Sheet; có = chỉ đồng bộ đúng lesson đó.

**Logic xử lý (thứ tự bắt buộc):**
1. Xác thực `auth.uid` là giáo viên (`get(teachers/{auth.uid})` tồn tại) — không phải → `PERMISSION_DENIED`.
2. Rate-limit: **3 lần/phút/giáo viên**.
3. Đọc Sheet qua Google Sheets API (service account quyền Viewer), 2 lệnh gọi tách biệt:
   - `lessons!A1:E1000` → parse tab `lessons`.
   - `questions!A1:I1000` → parse tab `questions`.
4. **Validate tab `lessons`** — mỗi dòng:
   - `lesson_id`, `lesson_name` bắt buộc, không rỗng → thiếu → báo lỗi dòng, bỏ qua dòng.
   - `intro_text` nếu có → kiểm tra ≤500 từ. **Vượt quá → báo lỗi dòng, KHÔNG lưu lesson đó** (đã chốt — an toàn nhất, giáo viên phải tự sửa và đồng bộ lại).
   - `intro_video_url` nếu có → domain phải thuộc youtube.com/youtu.be, facebook.com, hoặc tiktok.com → sai domain → báo lỗi dòng, bỏ field này (vẫn lưu các field khác của dòng).
   - `is_active`: parse `"TRUE"/"FALSE"` (không phân biệt hoa/thường) → giá trị khác → mặc định `false` + cảnh báo.
5. **Validate tab `questions`** — mỗi dòng:
   - `lesson_id` bắt buộc, phải khớp 1 `lesson_id` đã có (hợp lệ) trong tab `lessons` → không khớp → báo lỗi dòng, bỏ qua.
   - `question_text` bắt buộc; đủ 4 đáp án (`option_a`..`option_d`) không rỗng.
   - `question_type` rỗng → mặc định `single_choice`; có giá trị phải thuộc `{single_choice, multiple_choice}`, sai → báo lỗi dòng.
   - `correct_options`: `single_choice` → đúng 1 giá trị thuộc `{a,b,c,d}`; `multiple_choice` → ≥2 giá trị thuộc `{a,b,c,d}`, không trùng lặp.
   - Sai bất kỳ điều kiện trên → báo lỗi dòng, **không lưu câu đó**.
6. Ghi Firestore (batch write/transaction theo từng lesson):
   - `lessons/{lesson_id}` → set (merge) field hợp lệ.
   - `questions/{question_id}` → `question_id` trống trong Sheet → tạo mới (Firestore tự sinh ID), **ghi ngược `question_id` về đúng dòng trong Sheet** qua Sheets API update; có `question_id` sẵn → update (merge) đúng document.
7. **Chặn activate lesson nếu chưa đủ ≥10 câu hỏi hợp lệ**: đếm số câu hợp lệ hiện có của lesson trong Firestore sau khi ghi — nếu `<10` và Sheet đặt `is_active = TRUE` → **ghi đè `is_active = false`** trong Firestore, cảnh báo rõ trong response.
8. Trả báo cáo tổng hợp (số câu hợp lệ/lỗi kèm số dòng).

**Response (thành công, có cảnh báo)**
```json
{
  "synced_at": "2026-08-28T10:20:00Z",
  "lessons": {
    "processed": 1,
    "errors": [
      { "row": 3, "lesson_id": "LS_002", "reason": "intro_text vượt quá 500 từ (hiện có 612 từ) — lesson này KHÔNG được lưu, vui lòng sửa lại và đồng bộ lại" }
    ]
  },
  "questions": {
    "processed": 24,
    "inserted": 20,
    "updated": 4,
    "errors": [
      { "row": 15, "reason": "single_choice phải có đúng 1 correct_option, hiện có 2 (b,d)" },
      { "row": 22, "reason": "lesson_id 'LS_099' không tồn tại trong tab lessons" }
    ]
  },
  "warnings": [
    { "lesson_id": "DL_001", "message": "Chỉ có 6/10 câu hợp lệ — is_active đã bị tự động chuyển về FALSE" }
  ]
}
```

**Mã lỗi**: `RESOURCE_EXHAUSTED`, `PERMISSION_DENIED`, `UNAVAILABLE` (lỗi gọi Sheets API), `INTERNAL`.

---

## 5. `purchaseWardrobeItem(item_id)`

**Request**
```json
{ "item_id": "wi_top_003" }
```

**Logic xử lý (Firestore Transaction bắt buộc):**
1. Xác thực `auth.uid`.
2. Rate-limit: **15 lần/phút/user**.
3. `student = get(students/{auth.uid})` — không tồn tại → `PERMISSION_DENIED`.
4. `item = get(wardrobe_items/{item_id})` — không tồn tại → `NOT_FOUND`.
5. Kiểm tra **đã sở hữu chưa**: query `student_wardrobe` where `student_id == auth.uid AND item_id == item_id` — có rồi → `FAILED_PRECONDITION` ("Bạn đã sở hữu item này rồi").
6. Kiểm tra `student.current_star >= item.star_cost` (= 5, đồng giá mọi item) — không đủ → `FAILED_PRECONDITION` ("Không đủ sao để mua item này").
7. Trong transaction: `update students.current_star -= item.star_cost`; `create student_wardrobe { student_id, item_id, purchased_at: now }`; `create star_transactions { student_id, amount: -item.star_cost, type: "spend", source: "wardrobe", reference_id: item_id, created_at: now }`.
8. Trả kết quả.

**Response (thành công)**
```json
{
  "purchased": true,
  "item_id": "wi_top_003",
  "star_spent": 5,
  "current_star_balance": 3
}
```

**Response lỗi (không đủ sao)**
```json
{ "error": { "code": "FAILED_PRECONDITION", "message": "Không đủ sao để mua item này" } }
```

**Mã lỗi**: `RESOURCE_EXHAUSTED`, `PERMISSION_DENIED`, `NOT_FOUND`, `FAILED_PRECONDITION`, `INTERNAL`.

---

## 6. `equipWardrobeItem(item_id)`

**Mục đích**: Cập nhật `avatar_config` — chỉ cho phép mặc item đã sở hữu, chỉ ghi đè đúng 1 trong 4 slot.

**Request**
```json
{ "item_id": "wi_top_003" }
```

**Logic xử lý:**
1. Xác thực `auth.uid`.
2. Rate-limit: **15 lần/phút/user**.
3. `student = get(students/{auth.uid})` — không tồn tại → `PERMISSION_DENIED`.
4. `item = get(wardrobe_items/{item_id})` — không tồn tại → `NOT_FOUND`.
5. Kiểm tra **sở hữu**: query `student_wardrobe` where `student_id == auth.uid AND item_id == item_id` — không có → `PERMISSION_DENIED` ("Bạn chưa sở hữu item này").
6. Xác định `slot = item.slot` (một trong `hair`, `top`, `bottom_or_skirt`, `footwear`).
7. `update students/{auth.uid}.avatar_config.{slot} = item_id` — chỉ ghi đè đúng slot này, không đụng 3 slot còn lại.
8. Trả về `avatar_config` đầy đủ sau khi cập nhật.

**Response (thành công)**
```json
{
  "equipped": true,
  "slot": "top",
  "avatar_config": {
    "hair": "wi_hair_001",
    "top": "wi_top_003",
    "bottom_or_skirt": "wi_bottom_002",
    "footwear": "wi_shoes_001"
  }
}
```

**Mã lỗi**: `RESOURCE_EXHAUSTED`, `PERMISSION_DENIED`, `NOT_FOUND`, `INTERNAL`.

---

## 7. `adminResetPassword(student_id)`

**Request**
```json
{ "student_id": "st_hs001" }
```

**Bảng quy tắc sinh mật khẩu tạm (đã chốt)**: dạng "từ + số" dễ đọc (VD `meocon482`) — chọn 1 từ ngẫu nhiên từ danh sách từ đơn giản tiếng Việt không dấu (con vật/đồ vật quen thuộc) + 3 chữ số ngẫu nhiên. Không dùng chuỗi ngẫu nhiên hoàn toàn.

**Logic xử lý (thứ tự bắt buộc, theo 7 bước mục 6.1):**
1. Xác thực `auth.uid`.
2. Rate-limit: **5 lần/phút/giáo viên**.
3. `teacher = get(teachers/{auth.uid})` — không tồn tại → `PERMISSION_DENIED`.
4. `student = get(students/{student_id})` — không tồn tại → `NOT_FOUND`.
5. `class = get(classes/{student.class_id})` — kiểm tra `class.teacher_id == auth.uid` — sai → `PERMISSION_DENIED` ("Bạn không phải giáo viên chủ nhiệm lớp của học sinh này").
6. Sinh mật khẩu tạm theo quy tắc "từ + số".
7. Cập nhật mật khẩu Firebase Auth qua Admin SDK: `admin.auth().updateUser(student.auth_uid, { password: tempPassword })`.
8. `update students/{student_id}.must_change_password = true`.
9. `create security_audit_log { actor_id: auth.uid, target_id: student_id, action: "reset_password", created_at: now }`.
10. Trả mật khẩu tạm **1 lần duy nhất** — không lưu plaintext ở bất kỳ đâu khác.

**Response (thành công)**
```json
{
  "reset": true,
  "student_id": "st_hs001",
  "student_name": "Nguyễn Văn A",
  "temp_password": "meocon482",
  "must_change_password": true,
  "warning": "Mật khẩu này chỉ hiển thị 1 lần — hãy sao chép hoặc thông báo cho học sinh ngay."
}
```

**Mã lỗi**: `RESOURCE_EXHAUSTED`, `PERMISSION_DENIED`, `NOT_FOUND`, `INTERNAL`.

---

## 8. `createStudentAccount(name, class_id)` *(function bổ sung — không có trong danh sách 9 gốc, cần thiết vì học sinh không tự đăng ký)*

**Bối cảnh**: Học sinh KHÔNG tự đăng ký tài khoản (đã chốt). Giáo viên tạo tài khoản cho từng học sinh trong lớp mình quản lý. Vì học sinh không có email thật, dùng **email giả nội bộ** dạng `{username}@hocsinh.<appname>.local` để tạo trong Firebase Auth — học sinh chỉ biết `username`, không biết khái niệm email này. App không giới hạn theo 1 trường cụ thể — nhiều giáo viên ở nhiều trường khác nhau cùng dùng chung 1 nền tảng, mỗi người tự quản lý lớp/học sinh độc lập.

**Request**
```json
{
  "name": "Nguyễn Văn A",
  "class_id": "cl_8a1"
}
```

**Logic xử lý:**
1. Xác thực `auth.uid`.
2. `teacher = get(teachers/{auth.uid})` — không tồn tại → `PERMISSION_DENIED`.
3. `class = get(classes/{class_id})` — kiểm tra `class.teacher_id == auth.uid` — sai → `PERMISSION_DENIED` ("Bạn không quản lý lớp này").
4. Sinh `username` duy nhất: chuẩn hóa từ `name` (bỏ dấu, viết liền, chữ thường) + số ngẫu nhiên nếu trùng. VD: `nguyenvana482`.
5. Sinh mật khẩu tạm theo quy tắc "từ + số" (đã chốt). VD: `meocon482`.
6. Tạo tài khoản Firebase Auth qua Admin SDK: `admin.auth().createUser({ email: `${username}@hocsinh.appname.local`, password: tempPassword })`.
7. Tạo `students/{auth_uid}` với `name`, `class_id`, `username`, `avatar_config: { hair: null, top: null, bottom_or_skirt: null, footwear: null }`, `current_star: 0`, `must_change_password: true`.
8. `create security_audit_log { actor_id: auth.uid, target_id: student_id, action: "create_account", created_at: now }`.
9. Trả `username` + mật khẩu tạm **1 lần duy nhất**.

**Response (thành công)**
```json
{
  "created": true,
  "student_id": "st_hs001",
  "username": "nguyenvana482",
  "temp_password": "meocon482",
  "warning": "Mật khẩu này chỉ hiển thị 1 lần — hãy sao chép hoặc thông báo cho học sinh ngay."
}
```

**Mã lỗi**: `PERMISSION_DENIED`, `NOT_FOUND`, `ALREADY_EXISTS` (trùng username sau vài lần thử sinh lại), `INTERNAL`.

---

## 9. `createLesson` / `activateLesson` / `deactivateLesson`

**Nguyên tắc đã chốt**: `createLesson`/`activateLesson` tự động đồng bộ trạng thái với 1 bản ghi `assignments` tự học mặc định (`class_id=null`, `deadline=null`) — khớp luồng chính MVP "học sinh tự chọn location". `createAssignment` riêng (function #10) dùng khi giáo viên chủ động giao bài cho 1 lớp cụ thể.

### 9a. `createLesson(lesson_name, intro_text?, intro_video_url?)`
1. Xác thực `auth.uid` là giáo viên → không phải → `PERMISSION_DENIED`.
2. Validate `intro_text` ≤500 từ nếu có; `intro_video_url` domain hợp lệ (youtube/facebook/tiktok) nếu có → sai → `INVALID_ARGUMENT`.
3. Tạo `lessons/{id}` với `teacher_id = auth.uid`, `is_active = false` (mặc định tắt — chưa đủ câu hỏi thì chưa nên bật).
4. **Tự động tạo kèm** `assignments/{id}` mặc định: `lesson_id`, `class_id: null`, `deadline: null`, `is_active: false`.
5. Trả `lesson_id` để giáo viên tiếp tục thêm câu hỏi qua Sheet + `syncQuestions`.

**Response**
```json
{ "created": true, "lesson_id": "LS_003", "is_active": false }
```

### 9b. `activateLesson(lesson_id)`
1. Xác thực `auth.uid` sở hữu lesson (`lesson.teacher_id == auth.uid`) — sai → `PERMISSION_DENIED`.
2. Đếm `questions` hợp lệ where `lesson_id == lesson_id` — `<10` → `FAILED_PRECONDITION` ("Cần tối thiểu 10 câu hỏi hợp lệ để kích hoạt lesson").
3. `update lessons/{lesson_id}.is_active = true`.
4. `update assignments/{default_assignment_id}.is_active = true` (đồng bộ theo).

**Response**
```json
{ "activated": true, "lesson_id": "LS_003" }
```

### 9c. `deactivateLesson(lesson_id)`
1. Xác thực quyền sở hữu như trên.
2. `update lessons/{lesson_id}.is_active = false`.
3. `update assignments/{default_assignment_id}.is_active = false`.
4. **Không xóa** `locked_scores`/`quiz_attempts` cũ — điểm học sinh đã có vẫn giữ nguyên trên leaderboard, chỉ chặn truy cập làm bài mới.

**Response**
```json
{ "deactivated": true, "lesson_id": "LS_003" }
```

**Mã lỗi chung 9a/9b/9c**: `PERMISSION_DENIED`, `NOT_FOUND`, `FAILED_PRECONDITION`, `INVALID_ARGUMENT`, `INTERNAL`.

---

## 10. `createAssignment(lesson_id, class_id, deadline?)`

**Mục đích**: Giáo viên chủ động giao 1 lesson cụ thể cho 1 lớp cụ thể, có thể kèm deadline riêng — tách biệt với assignment tự học mặc định đã tự sinh khi `createLesson`.

**Request**
```json
{
  "lesson_id": "LS_003",
  "class_id": "cl_8a1",
  "deadline": "2026-09-15T23:59:59Z"
}
```
`deadline` optional — bỏ trống = không giới hạn thời gian (giống tự học), nhưng vẫn là bản ghi riêng cho lớp (khác bản ghi mặc định `class_id=null`).

**Logic xử lý (thứ tự bắt buộc):**
1. Xác thực `auth.uid` là giáo viên → không phải → `PERMISSION_DENIED`.
2. `lesson = get(lessons/{lesson_id})` — không tồn tại → `NOT_FOUND`. Kiểm tra `lesson.teacher_id == auth.uid` — sai → `PERMISSION_DENIED` ("Bạn không sở hữu lesson này").
3. `class = get(classes/{class_id})` — không tồn tại → `NOT_FOUND`. Kiểm tra `class.teacher_id == auth.uid` — sai → `PERMISSION_DENIED` ("Bạn không quản lý lớp này").
4. Kiểm tra `lesson.is_active == true` — chưa kích hoạt → `FAILED_PRECONDITION` ("Lesson chưa được kích hoạt, không thể giao bài").
5. **Kiểm tra trùng**: query `assignments` where `lesson_id == lesson_id AND class_id == class_id` — đã tồn tại → **update** bản ghi cũ (`deadline`, `is_active = true`) thay vì tạo mới, tránh trùng lặp.
6. Nếu `deadline` được cung cấp → validate là timestamp hợp lệ.
7. Tạo hoặc cập nhật `assignments/{id}` với `lesson_id`, `class_id`, `deadline`, `is_active = true`.
8. Trả kết quả.

**Response (thành công — tạo mới)**
```json
{
  "created": true,
  "assignment_id": "as_a7f3",
  "lesson_id": "LS_003",
  "class_id": "cl_8a1",
  "deadline": "2026-09-15T23:59:59Z",
  "is_active": true
}
```

**Response (thành công — cập nhật bản ghi đã tồn tại)**
```json
{
  "created": false,
  "updated": true,
  "assignment_id": "as_a7f3",
  "lesson_id": "LS_003",
  "class_id": "cl_8a1",
  "deadline": "2026-09-20T23:59:59Z",
  "is_active": true
}
```

**Mã lỗi**: `PERMISSION_DENIED`, `NOT_FOUND`, `FAILED_PRECONDITION`, `INVALID_ARGUMENT`, `INTERNAL`.

---

## Nhật ký cập nhật
- **28/08/2026**: Hoàn thành spec chi tiết cho 6/9 function: `getQuizQuestions`, `submitQuiz`, `saveScore`, `syncQuestions`, `purchaseWardrobeItem`, `equipWardrobeItem`. Chốt thêm cấu trúc 4-slot của `avatar_config`.
- **28/08/2026 (tiếp)**: Hoàn thành spec cho `adminResetPassword`, `createStudentAccount` (function bổ sung — học sinh không tự đăng ký), nhóm `createLesson`/`activateLesson`/`deactivateLesson`. Chốt quy tắc sinh mật khẩu tạm "từ + số", xác nhận app đa trường (không có entity SCHOOLS), ghi nhận feature V2 "Journey" (tối đa 5 location, thưởng khi hoàn thành).
- **28/08/2026 (hoàn tất)**: Hoàn thành spec cho `createAssignment` — **đủ 10/10 function**. Toàn bộ Cloud Function của MVP đã có spec chi tiết, sẵn sàng đưa vào Antigravity IDE để bắt đầu vibe coding.
