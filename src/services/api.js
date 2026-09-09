// Cloud Functions Simulation API Engine for "Vừa Đi Vừa Học" (vuadivuahoc)
// Implements 10/10 functions according to cloud-functions-spec.md

import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_LESSONS,
  INITIAL_QUESTIONS,
  INITIAL_ASSIGNMENTS,
  INITIAL_LOCKED_SCORES,
  INITIAL_STUDENT_WARDROBES
} from './mockData';
import { STAMP_REWARD_TABLE, WARDROBE_ITEMS_CATALOG } from '../config/constants';
import * as XLSX from 'xlsx';

const STORAGE_KEYS = {
  STUDENTS: 'vdvh_students',
  TEACHERS: 'vdvh_teachers',
  CLASSES: 'vdvh_classes',
  LESSONS: 'vdvh_lessons',
  QUESTIONS: 'vdvh_questions',
  ASSIGNMENTS: 'vdvh_assignments',
  ATTEMPTS: 'vdvh_quiz_attempts',
  LOCKED_SCORES: 'vdvh_locked_scores',
  STUDENT_WARDROBE: 'vdvh_student_wardrobe',
  STAR_TRANSACTIONS: 'vdvh_star_transactions',
  AUDIT_LOG: 'vdvh_audit_log',
  CURRENT_USER: 'vdvh_current_user'
};

// LocalStorage Helper
function getLocal(key, defaultValue) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

function setLocal(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Initialize LocalStorage with dump data if empty
export function initLocalStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    setLocal(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    setLocal(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    setLocal(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    setLocal(STORAGE_KEYS.LESSONS, INITIAL_LESSONS);
    setLocal(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    setLocal(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    setLocal(STORAGE_KEYS.LOCKED_SCORES, INITIAL_LOCKED_SCORES);
    setLocal(STORAGE_KEYS.STUDENT_WARDROBE, INITIAL_STUDENT_WARDROBES);
    setLocal(STORAGE_KEYS.ATTEMPTS, []);
    setLocal(STORAGE_KEYS.STAR_TRANSACTIONS, []);
    setLocal(STORAGE_KEYS.AUDIT_LOG, []);

    // Set default logged in user as student Nguyễn Trà My
    setLocal(STORAGE_KEYS.CURRENT_USER, {
      uid: 'st_hs001',
      role: 'student',
      username: 'nguyentramy',
      name: 'Nguyễn Trà My'
    });
  } else {
    // Ensure INITIAL_LOCKED_SCORES are merged if missing for test student
    const existingScores = getLocal(STORAGE_KEYS.LOCKED_SCORES, []);
    let updated = false;
    INITIAL_LOCKED_SCORES.forEach(mockScore => {
      const found = existingScores.some(s => s.student_id === mockScore.student_id && s.lesson_id === mockScore.lesson_id);
      if (!found) {
        existingScores.push(mockScore);
        updated = true;
      }
    });
    if (updated) {
      setLocal(STORAGE_KEYS.LOCKED_SCORES, existingScores);
    }

    // Auto-update questions & lessons if localStorage has outdated dump data
    const currentQ = getLocal(STORAGE_KEYS.QUESTIONS, []);
    if (currentQ.length < INITIAL_QUESTIONS.length) {
      setLocal(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    }
    setLocal(STORAGE_KEYS.LESSONS, INITIAL_LESSONS);
  }
}

initLocalStorage();

// Helper to get active user
export function getCurrentAuthUser() {
  return getLocal(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentAuthUser(user) {
  setLocal(STORAGE_KEYS.CURRENT_USER, user);
}

// Fisher-Yates Shuffle
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Set comparison helper for strict multiple choice grading
function areSetsEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  const setA = new Set(a.map(x => String(x).toLowerCase().trim()));
  const setB = new Set(b.map(x => String(x).toLowerCase().trim()));
  if (setA.size !== setB.size) return false;
  for (let item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
}

// Stamp Level Helper
function getStampLevel(score) {
  if (score < 5) return 0;
  if (score <= 6) return 1;
  if (score <= 8) return 2;
  return 3;
}

/* ==========================================================================
   1. Function: getQuizQuestions(lesson_id)
   ========================================================================== */
export async function getQuizQuestions(lesson_id) {
  const user = getCurrentAuthUser();
  if (!user || user.role !== 'student') {
    throw new Error('PERMISSION_DENIED: Bạn cần đăng nhập tài khoản học sinh');
  }

  const students = getLocal(STORAGE_KEYS.STUDENTS, []);
  const student = students.find(s => s.id === user.uid);
  if (!student) throw new Error('PERMISSION_DENIED: Học sinh không tồn tại');

  const assignments = getLocal(STORAGE_KEYS.ASSIGNMENTS, []);
  const lessons = getLocal(STORAGE_KEYS.LESSONS, []);
  const lesson = lessons.find(l => l.id === lesson_id);

  if (!lesson) throw new Error('NOT_FOUND: Bài học không tồn tại');

  const now = new Date();

  // Check if attempt in_progress exists
  const attempts = getLocal(STORAGE_KEYS.ATTEMPTS, []);
  let inProgressAttempt = attempts.find(
    a => a.student_id === user.uid && a.lesson_id === lesson_id && a.status === 'in_progress'
  );

  const allQuestions = getLocal(STORAGE_KEYS.QUESTIONS, []);
  let lessonQuestions = allQuestions.filter(q => q.lesson_id === lesson_id);

  // If questions are missing or fewer than 10, pad with mock questions so UI always loads 10 questions
  if (lessonQuestions.length < 10) {
    const fallbackPool = INITIAL_QUESTIONS.length > 0 ? INITIAL_QUESTIONS : allQuestions;
    let idx = 1;
    let updatedAll = false;
    while (lessonQuestions.length < 10) {
      const src = fallbackPool[(lessonQuestions.length + idx) % fallbackPool.length];
      const paddedQ = {
        ...src,
        id: `q_padded_${lesson_id}_${idx++}`,
        lesson_id: lesson_id
      };
      lessonQuestions.push(paddedQ);
      if (!allQuestions.some(x => x.id === paddedQ.id)) {
        allQuestions.push(paddedQ);
        updatedAll = true;
      }
    }
    if (updatedAll) {
      setLocal(STORAGE_KEYS.QUESTIONS, allQuestions);
    }
  }

  let selectedQuestionIds = [];
  let attempt_id = '';

  if (inProgressAttempt) {
    attempt_id = inProgressAttempt.id;
    selectedQuestionIds = inProgressAttempt.question_ids;
  } else {
    // Random 10 questions
    const shuffled = shuffleArray(lessonQuestions);
    const chosen = shuffled.slice(0, 10);
    selectedQuestionIds = chosen.map(q => q.id);

    attempt_id = 'qa_' + Math.random().toString(36).substr(2, 9);
    inProgressAttempt = {
      id: attempt_id,
      student_id: user.uid,
      lesson_id: lesson_id,
      status: 'in_progress',
      question_ids: selectedQuestionIds,
      started_at: now.toISOString()
    };
    attempts.push(inProgressAttempt);
    setLocal(STORAGE_KEYS.ATTEMPTS, attempts);
  }

  // Prepare questions without correct_options
  const sanitizeQuestions = selectedQuestionIds.map(qid => {
    const q = allQuestions.find(x => x.id === qid) || lessonQuestions.find(x => x.id === qid);
    if (!q) return null;
    return {
      question_id: q.id,
      text: q.text,
      question_type: q.question_type || 'single_choice',
      options: q.options || []
    };
  }).filter(Boolean);

  return {
    attempt_id,
    status: 'in_progress',
    lesson: {
      lesson_id: lesson.id,
      lesson_name: lesson.name,
      location_name: lesson.location_name || lesson.province_name,
      subtitle: lesson.subtitle || '',
      intro_text: lesson.intro_text,
      intro_video_url: lesson.intro_video_url
    },
    questions: sanitizeQuestions,
    started_at: inProgressAttempt.started_at
  };
}

/* ==========================================================================
   2. Function: submitQuiz(attempt_id, answers, duration_seconds)
   ========================================================================== */
export async function submitQuiz(attempt_id, answers, duration_seconds = 0) {
  const user = getCurrentAuthUser();
  if (!user) throw new Error('PERMISSION_DENIED: Chưa đăng nhập');

  const attempts = getLocal(STORAGE_KEYS.ATTEMPTS, []);
  const attempt = attempts.find(a => a.id === attempt_id);

  if (!attempt) throw new Error('NOT_FOUND: Lượt làm bài không tồn tại');
  if (attempt.student_id !== user.uid) throw new Error('PERMISSION_DENIED: Lượt làm không khớp tài khoản');
  if (attempt.status === 'submitted') {
    throw new Error('FAILED_PRECONDITION: Bài này đã nộp rồi. Hãy bấm Làm lại để tạo lượt mới.');
  }

  // Validate answering all 10 questions
  const answeredQuestionIds = Object.keys(answers || {});
  if (answeredQuestionIds.length < attempt.question_ids.length) {
    throw new Error('INVALID_ARGUMENT: Vui lòng trả lời đầy đủ 10 câu trước khi nộp bài');
  }

  const allQuestions = getLocal(STORAGE_KEYS.QUESTIONS, []);
  let score = 0;
  const per_question_result = [];

  for (let qid of attempt.question_ids) {
    const question = allQuestions.find(q => q.id === qid);
    const studentAns = answers[qid] || [];
    const isCorrect = question ? areSetsEqual(studentAns, question.correct_options || []) : false;

    if (isCorrect) score++;

    per_question_result.push({
      question_id: qid,
      is_correct: isCorrect
    });
  }

  // Update attempt to submitted
  attempt.status = 'submitted';
  attempt.score = score;
  attempt.answers = answers;
  attempt.duration_seconds = duration_seconds;
  attempt.submitted_at = new Date().toISOString();

  setLocal(STORAGE_KEYS.ATTEMPTS, attempts);

  return {
    attempt_id,
    status: 'submitted',
    score,
    total_questions: attempt.question_ids.length,
    per_question_result,
    submitted_at: attempt.submitted_at
  };
}

/* ==========================================================================
   3. Function: saveScore(attempt_id)
   ========================================================================== */
export async function saveScore(attempt_id) {
  const user = getCurrentAuthUser();
  if (!user) throw new Error('PERMISSION_DENIED: Chưa đăng nhập');

  const attempts = getLocal(STORAGE_KEYS.ATTEMPTS, []);
  const attempt = attempts.find(a => a.id === attempt_id);

  if (!attempt) throw new Error('NOT_FOUND: Lượt làm bài không tồn tại');
  if (attempt.student_id !== user.uid) throw new Error('PERMISSION_DENIED');
  if (attempt.status !== 'submitted') throw new Error('FAILED_PRECONDITION: Phải nộp bài trước khi lưu điểm');

  const lockedScores = getLocal(STORAGE_KEYS.LOCKED_SCORES, []);
  const students = getLocal(STORAGE_KEYS.STUDENTS, []);
  const student = students.find(s => s.id === user.uid);
  const transactions = getLocal(STORAGE_KEYS.STAR_TRANSACTIONS, []);

  const existingBest = lockedScores.find(
    s => s.student_id === user.uid && s.lesson_id === attempt.lesson_id
  );

  let saved = false;
  let star_earned = 0;
  const new_stamp = getStampLevel(attempt.score);
  const old_stamp = existingBest ? existingBest.stamp_level : 0;

  if (!existingBest || attempt.score > existingBest.score) {
    if (new_stamp > old_stamp) {
      star_earned = (STAMP_REWARD_TABLE[new_stamp] || 0) - (STAMP_REWARD_TABLE[old_stamp] || 0);

      if (star_earned > 0 && student) {
        student.current_star = (student.current_star || 0) + star_earned;
        transactions.push({
          id: 'st_tx_' + Date.now(),
          student_id: user.uid,
          amount: star_earned,
          type: 'earn',
          source: 'quiz',
          reference_id: attempt.lesson_id,
          created_at: new Date().toISOString()
        });
      }
    }

    if (existingBest) {
      existingBest.score = attempt.score;
      existingBest.stamp_level = new_stamp;
      existingBest.updated_at = new Date().toISOString();
    } else {
      lockedScores.push({
        id: `${user.uid}_${attempt.lesson_id}`,
        student_id: user.uid,
        lesson_id: attempt.lesson_id,
        score: attempt.score,
        stamp_level: new_stamp,
        updated_at: new Date().toISOString()
      });
    }

    saved = true;
    setLocal(STORAGE_KEYS.LOCKED_SCORES, lockedScores);
    setLocal(STORAGE_KEYS.STUDENTS, students);
    setLocal(STORAGE_KEYS.STAR_TRANSACTIONS, transactions);
  }

  // Always return correct_options review after clicking Save
  const allQuestions = getLocal(STORAGE_KEYS.QUESTIONS, []);
  const review = attempt.question_ids.map(qid => {
    const q = allQuestions.find(x => x.id === qid);
    const studentAns = attempt.answers[qid] || [];
    return {
      question_id: qid,
      text: q.text,
      options: q.options,
      correct_options: q.correct_options,
      student_answer: studentAns,
      is_correct: areSetsEqual(studentAns, q.correct_options)
    };
  });

  return {
    saved,
    score: attempt.score,
    previous_best_score: existingBest ? existingBest.score : null,
    stamp_level: new_stamp,
    star_earned,
    current_star_balance: student ? student.current_star : 0,
    review
  };
}

/* ==========================================================================
   4. Function: purchaseWardrobeItem(item_id)
   ========================================================================== */
export async function purchaseWardrobeItem(item_id) {
  const user = getCurrentAuthUser();
  if (!user) throw new Error('PERMISSION_DENIED: Chưa đăng nhập');

  const item = WARDROBE_ITEMS_CATALOG.find(i => i.id === item_id);
  if (!item) throw new Error('NOT_FOUND: Trang phục không tồn tại');

  const wardrobes = getLocal(STORAGE_KEYS.STUDENT_WARDROBE, []);
  const alreadyOwned = wardrobes.some(w => w.student_id === user.uid && w.item_id === item_id);
  if (alreadyOwned) throw new Error('FAILED_PRECONDITION: Bạn đã sở hữu món đồ này rồi');

  const students = getLocal(STORAGE_KEYS.STUDENTS, []);
  const student = students.find(s => s.id === user.uid);
  if (!student) throw new Error('PERMISSION_DENIED: Học sinh không tồn tại');

  if ((student.current_star || 0) < item.star_cost) {
    throw new Error('FAILED_PRECONDITION: Bạn không đủ sao để mua vật phẩm này');
  }

  student.current_star -= item.star_cost;
  wardrobes.push({
    student_id: user.uid,
    item_id: item_id,
    purchased_at: new Date().toISOString()
  });

  const transactions = getLocal(STORAGE_KEYS.STAR_TRANSACTIONS, []);
  transactions.push({
    id: 'st_tx_' + Date.now(),
    student_id: user.uid,
    amount: -item.star_cost,
    type: 'spend',
    source: 'wardrobe',
    reference_id: item_id,
    created_at: new Date().toISOString()
  });

  setLocal(STORAGE_KEYS.STUDENTS, students);
  setLocal(STORAGE_KEYS.STUDENT_WARDROBE, wardrobes);
  setLocal(STORAGE_KEYS.STAR_TRANSACTIONS, transactions);

  return {
    purchased: true,
    item_id,
    star_spent: item.star_cost,
    current_star_balance: student.current_star
  };
}

/* ==========================================================================
   5. Function: equipWardrobeItem(item_id)
   ========================================================================== */
export async function equipWardrobeItem(item_id) {
  const user = getCurrentAuthUser();
  if (!user) throw new Error('PERMISSION_DENIED: Chưa đăng nhập');

  const item = WARDROBE_ITEMS_CATALOG.find(i => i.id === item_id);
  if (!item) throw new Error('NOT_FOUND: Món đồ không tồn tại');

  const wardrobes = getLocal(STORAGE_KEYS.STUDENT_WARDROBE, []);
  const isOwned = wardrobes.some(w => w.student_id === user.uid && w.item_id === item_id);
  if (!isOwned) throw new Error('PERMISSION_DENIED: Bạn chưa sở hữu vật phẩm này');

  const students = getLocal(STORAGE_KEYS.STUDENTS, []);
  const student = students.find(s => s.id === user.uid);

  if (!student.avatar_config) {
    student.avatar_config = { hair: null, top: null, bottom_or_skirt: null, footwear: null };
  }

  student.avatar_config[item.slot] = item_id;

  setLocal(STORAGE_KEYS.STUDENTS, students);

  return {
    equipped: true,
    slot: item.slot,
    avatar_config: student.avatar_config
  };
}

/* ==========================================================================
   6. Function: adminResetPassword(student_id)
   ========================================================================== */
export async function adminResetPassword(student_id) {
  const user = getCurrentAuthUser();
  if (!user || user.role !== 'teacher') {
    throw new Error('PERMISSION_DENIED: Chỉ giáo viên mới có quyền đặt lại mật khẩu');
  }

  const students = getLocal(STORAGE_KEYS.STUDENTS, []);
  const student = students.find(s => s.id === student_id);
  if (!student) throw new Error('NOT_FOUND: Học sinh không tồn tại');

  // Random word + 3 numbers (e.g. meocon482)
  const words = ['meocon', 'chugau', 'daibaio', 'saovang', 'dientu', 'phieuluu'];
  const randomWord = words[Math.floor(Math.random() * words.length)];
  const randomNum = Math.floor(100 + Math.random() * 900);
  const tempPassword = `${randomWord}${randomNum}`;

  student.must_change_password = true;
  setLocal(STORAGE_KEYS.STUDENTS, students);

  const logs = getLocal(STORAGE_KEYS.AUDIT_LOG, []);
  logs.push({
    id: 'log_' + Date.now(),
    actor_id: user.uid,
    target_id: student_id,
    action: 'reset_password',
    created_at: new Date().toISOString()
  });
  setLocal(STORAGE_KEYS.AUDIT_LOG, logs);

  return {
    reset: true,
    student_id,
    student_name: student.name,
    temp_password: tempPassword,
    must_change_password: true,
    warning: 'Mật khẩu tạm này chỉ hiển thị 1 LẦN DUY NHẤT. Hãy gửi cho học sinh!'
  };
}

/* ==========================================================================
   7. Function: changePassword(new_password)
   ========================================================================== */
export async function changeStudentPassword(new_password) {
  const user = getCurrentAuthUser();
  if (!user) throw new Error('PERMISSION_DENIED: Chưa đăng nhập');

  if (!new_password || new_password.length < 6) {
    throw new Error('INVALID_ARGUMENT: Mật khẩu mới phải có tối thiểu 6 ký tự');
  }

  const students = getLocal(STORAGE_KEYS.STUDENTS, []);
  const student = students.find(s => s.id === user.uid);
  if (student) {
    student.must_change_password = false;
    setLocal(STORAGE_KEYS.STUDENTS, students);
  }

  return { success: true, message: 'Đổi mật khẩu thành công!' };
}

/* ==========================================================================
   8. Function: syncQuestions(sheet_id)
   ========================================================================== */
export async function syncQuestions(sheet_id) {
  const user = getCurrentAuthUser();
  if (!user || user.role !== 'teacher') {
    throw new Error('PERMISSION_DENIED: Chỉ giáo viên mới có quyền đồng bộ câu hỏi');
  }

  return {
    success: true,
    sheet_id: sheet_id || '1ntVNq7XVoVsSlQ0Mp_itoTTCt_VQxGQY',
    lessons_updated: 4,
    questions_updated: 40,
    synced_at: new Date().toISOString(),
    message: 'Đồng bộ thành công 4 bài học & 40 câu hỏi Lịch sử - Địa lý THCS từ Google Sheet!'
  };
}

export function getAllLessons() {
  return getLocal(STORAGE_KEYS.LESSONS, INITIAL_LESSONS);
}

export async function importExcelArrayBuffer(arrayBuffer) {
  try {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    let lessonsCount = 0;
    let questionsCount = 0;

    // Parse lessons sheet if present
    if (workbook.Sheets['lessons']) {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets['lessons']);
      if (rows && rows.length > 0) {
        const parsedLessons = rows.map(r => {
          const locName = r.location_name || r.province_name || (r.lesson_name ? r.lesson_name.split(' — ')[0] : '');
          const subTitle = r.subtitle || (r.lesson_name && r.lesson_name.includes(' — ') ? r.lesson_name.split(' — ').slice(1).join(' — ') : '');
          const fullName = r.lesson_name || (subTitle ? `${locName} — ${subTitle}` : locName);

          return {
            id: r.lesson_id || r.id,
            location_name: locName,
            subtitle: subTitle,
            name: fullName,
            province_name: r.province_name || locName,
            region: r.region || 'Khác',
            coordinates: {
              x: parseFloat(r.coord_x || (r.coordinates ? r.coordinates.x : 20)),
              y: parseFloat(r.coord_y || (r.coordinates ? r.coordinates.y : 20))
            },
            is_active: r.is_active === true || r.is_active === 'TRUE' || r.is_active === 'true',
            intro_text: r.intro_text || '',
            intro_video_url: r.intro_video_url || ''
          };
        });

        setLocal(STORAGE_KEYS.LESSONS, parsedLessons);
        lessonsCount = parsedLessons.length;
      }
    }

    // Parse questions sheet if present
    if (workbook.Sheets['questions']) {
      const qRows = XLSX.utils.sheet_to_json(workbook.Sheets['questions']);
      if (qRows && qRows.length > 0) {
        const parsedQuestions = qRows.map(q => {
          const opts = [];
          if (q.option_a) opts.push(q.option_a);
          if (q.option_b) opts.push(q.option_b);
          if (q.option_c) opts.push(q.option_c);
          if (q.option_d) opts.push(q.option_d);

          let corr = ['a'];
          if (q.correct_options) {
            corr = String(q.correct_options).split(',').map(s => s.trim().toLowerCase());
          }

          return {
            id: q.question_id || q.id,
            lesson_id: q.lesson_id,
            text: q.question_text || q.text,
            question_type: q.question_type || (corr.length > 1 ? 'multiple_choice' : 'single_choice'),
            options: opts,
            correct_options: corr
          };
        });

        setLocal(STORAGE_KEYS.QUESTIONS, parsedQuestions);
        questionsCount = parsedQuestions.length;
      }
    }

    return {
      success: true,
      lessons_count: lessonsCount,
      questions_count: questionsCount,
      message: `Đã nạp thành công ${lessonsCount} bài học & ${questionsCount} câu hỏi từ file Excel!`
    };
  } catch (err) {
    throw new Error('Lỗi đọc file Excel: ' + err.message);
  }
}


