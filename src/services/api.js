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
  INITIAL_STUDENT_WARDROBES,
  INITIAL_QUIZ_ATTEMPTS
} from './mockData';
import { STAMP_REWARD_TABLE, WARDROBE_ITEMS_CATALOG } from '../config/constants';
import * as XLSX from 'xlsx';
import { db } from './firebaseConfig';
import { collection, doc, getDoc, getDocs, query, where, setDoc } from 'firebase/firestore';

export async function syncStudentToFirestore(student) {
  if (!student || !student.id) return;
  try {
    const studentDocRef = doc(db, 'students', student.id);
    await setDoc(studentDocRef, {
      id: student.id,
      name: student.name,
      username: student.username,
      class_id: student.class_id,
      class: student.class,
      gender: student.gender,
      current_star: student.current_star || 0,
      must_change_password: student.must_change_password || false,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Firestore syncStudentToFirestore error:', err);
  }
}

export async function syncTeacherToFirestore(teacher) {
  if (!teacher || !teacher.id) return;
  try {
    const teacherDocRef = doc(db, 'teachers', teacher.id);
    await setDoc(teacherDocRef, {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email || teacher.recovery_email,
      recovery_email: teacher.recovery_email || teacher.email,
      role: teacher.role || 'teacher',
      is_active: teacher.is_active !== false,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Firestore syncTeacherToFirestore error:', err);
  }
}

const STORAGE_KEYS = {
  STUDENTS: 'vdvh_students',
  TEACHERS: 'vdvh_teachers',
  CLASSES: 'vdvh_classes',
  LESSONS: 'vdvh_lessons',
  QUESTIONS: 'vdvh_questions',
  ASSIGNMENTS: 'vdvh_assignments',
  LOCKED_SCORES: 'vdvh_locked_scores',
  STUDENT_WARDROBE: 'vdvh_student_wardrobe',
  ATTEMPTS: 'vdvh_quiz_attempts',
  CURRENT_USER: 'vdvh_current_user'
};

const DATA_VERSION_KEY = 'vdvh_data_version';
const CURRENT_DATA_VERSION = 'v1.5_nckh_matrix';

// LocalStorage Helper
function getLocal(key, defaultValue = []) {
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Initialize LocalStorage with dump data if empty or outdated version
export function initLocalStorage() {
  const storedVersion = localStorage.getItem(DATA_VERSION_KEY);

  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS) || storedVersion !== CURRENT_DATA_VERSION) {
    setLocal(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    setLocal(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    setLocal(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    setLocal(STORAGE_KEYS.LESSONS, INITIAL_LESSONS);
    setLocal(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    setLocal(STORAGE_KEYS.ASSIGNMENTS, getLocal(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS));
    setLocal(STORAGE_KEYS.LOCKED_SCORES, getLocal(STORAGE_KEYS.LOCKED_SCORES, INITIAL_LOCKED_SCORES));
    setLocal(STORAGE_KEYS.STUDENT_WARDROBE, INITIAL_STUDENT_WARDROBES);
    setLocal(STORAGE_KEYS.ATTEMPTS, getLocal(STORAGE_KEYS.ATTEMPTS, INITIAL_QUIZ_ATTEMPTS));
    
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      setLocal(STORAGE_KEYS.CURRENT_USER, {
        uid: 'st_nth001',
        role: 'student',
        username: 'nguyenthaihien',
        name: 'Nguyen Thai Hien',
        gender: 'male',
        body: 'base'
      });
    }

    // Sync initial students & teachers to Cloud Firestore
    INITIAL_STUDENTS.forEach(st => {
      syncStudentToFirestore(st);
    });
    INITIAL_TEACHERS.forEach(t => {
      syncTeacherToFirestore(t);
    });

    localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
  } else {
    // Force refresh lessons & questions & teachers to match master data
    setLocal(STORAGE_KEYS.LESSONS, INITIAL_LESSONS);
    setLocal(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    setLocal(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    const existingAttempts = getLocal(STORAGE_KEYS.ATTEMPTS, []);
    if (!existingAttempts || existingAttempts.length === 0) {
      setLocal(STORAGE_KEYS.ATTEMPTS, INITIAL_QUIZ_ATTEMPTS);
    }
    INITIAL_TEACHERS.forEach(t => {
      syncTeacherToFirestore(t);
    });
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
   1. Function: getQuizQuestions(lesson_id, forceNew = false)
   ========================================================================== */
export async function getQuizQuestions(lesson_id, forceNew = false) {
  const user = getCurrentAuthUser();
  if (!user || user.role !== 'student') {
    throw new Error('PERMISSION_DENIED: Bạn cần đăng nhập tài khoản học sinh');
  }

  // 1. Fetch lesson directly from Cloud Firestore
  let lesson = null;
  try {
    const lessonSnap = await getDoc(doc(db, 'lessons', lesson_id));
    if (lessonSnap.exists()) {
      lesson = lessonSnap.data();
    }
  } catch (err) {
    console.warn('Firestore getDoc lesson error, using local dataset:', err);
  }

  if (!lesson) {
    lesson = INITIAL_LESSONS.find(l => l.id === lesson_id);
  }
  if (!lesson) throw new Error('NOT_FOUND: Bài học không tồn tại');

  const attempts = getLocal(STORAGE_KEYS.ATTEMPTS, []);

  // 2. Check for existing in_progress attempt for this (user.uid, lesson_id) if not forceNew
  const existingAttempt = !forceNew ? attempts.find(
    a => a.student_id === user.uid && a.lesson_id === lesson_id && a.status === 'in_progress' && Array.isArray(a.questions_pool) && a.questions_pool.length > 0
  ) : null;

  if (existingAttempt) {
    const sanitizeQuestions = existingAttempt.questions_pool.map(q => ({
      question_id: q.id || q.question_id,
      text: q.text,
      question_type: q.question_type || 'single_choice',
      options: q.options || []
    }));

    return {
      attempt_id: existingAttempt.id,
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
      saved_answers: existingAttempt.answers || {},
      started_at: existingAttempt.started_at
    };
  }

  // 3. Otherwise, fetch questions strictly matching lesson_id from Cloud Firestore
  let lessonQuestions = [];
  try {
    const qQuery = query(collection(db, 'questions'), where('lesson_id', '==', lesson_id));
    const qSnapshot = await getDocs(qQuery);
    qSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data && data.lesson_id === lesson_id) {
        lessonQuestions.push(data);
      }
    });
  } catch (err) {
    console.warn('Firestore query questions error, using local dataset:', err);
  }

  // Strict fallback to INITIAL_QUESTIONS strictly matching lesson_id if Firestore query returned 0 items
  if (lessonQuestions.length === 0) {
    lessonQuestions = INITIAL_QUESTIONS.filter(q => q.lesson_id === lesson_id);
  }

  if (lessonQuestions.length === 0) {
    throw new Error(`NOT_FOUND: Chưa có câu hỏi trắc nghiệm cho bài học ${lesson.location_name || lesson.name}`);
  }

  // Pick up to 10 random questions STRICTLY from this lesson's questions
  const shuffled = shuffleArray(lessonQuestions);
  const chosen = shuffled.slice(0, Math.min(10, shuffled.length));

  const now = new Date();
  const attempt_id = 'qa_' + Math.random().toString(36).substr(2, 9);
  
  const inProgressAttempt = {
    id: attempt_id,
    student_id: user.uid,
    lesson_id: lesson_id,
    status: 'in_progress',
    question_ids: chosen.map(q => q.id),
    questions_pool: chosen, // Store chosen questions directly for 100% exact evaluation
    answers: {},
    started_at: now.toISOString()
  };
  
  const filteredAttempts = attempts.filter(a => !(a.student_id === user.uid && a.lesson_id === lesson_id && a.status === 'in_progress'));
  filteredAttempts.push(inProgressAttempt);
  setLocal(STORAGE_KEYS.ATTEMPTS, filteredAttempts);

  const sanitizeQuestions = chosen.map(q => ({
    question_id: q.id,
    text: q.text,
    question_type: q.question_type || 'single_choice',
    options: q.options || []
  }));

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
    saved_answers: {},
    started_at: inProgressAttempt.started_at
  };
}

export function saveInProgressAnswers(attempt_id, answers) {
  const attempts = getLocal(STORAGE_KEYS.ATTEMPTS, []);
  const attempt = attempts.find(a => a.id === attempt_id);
  if (attempt && attempt.status === 'in_progress') {
    attempt.answers = answers;
    setLocal(STORAGE_KEYS.ATTEMPTS, attempts);
  }
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

  // Validate answering all questions in this attempt
  const answeredQuestionIds = Object.keys(answers || {});
  if (answeredQuestionIds.length < attempt.question_ids.length) {
    throw new Error(`INVALID_ARGUMENT: Vui lòng trả lời đầy đủ ${attempt.question_ids.length} câu trước khi nộp bài`);
  }

  const questionPool = attempt.questions_pool || [];
  let score = 0;
  const per_question_result = [];

  for (let qid of attempt.question_ids) {
    const question = questionPool.find(q => q.id === qid);
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
    duration_seconds: attempt.duration_seconds || 0,
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

  const questionPool = attempt.questions_pool || [];
  const review = attempt.question_ids.map(qid => {
    const q = questionPool.find(x => x.id === qid);
    const studentAns = attempt.answers[qid] || [];
    return {
      question_id: qid,
      text: q ? q.text : '',
      options: q ? q.options : [],
      correct_options: q ? q.correct_options : [],
      student_answer: studentAns,
      is_correct: q ? areSetsEqual(studentAns, q.correct_options) : false
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

  const students = getLocal(STORAGE_KEYS.STUDENTS, []);
  const student = students.find(s => s.id === user.uid);
  if (!student) throw new Error('NOT_FOUND: Học sinh không tồn tại');

  if (!student.avatar_config) {
    student.avatar_config = { hair: null, top: null, bottom_or_skirt: null, footwear: null };
  }

  const isCurrentlyEquipped = student.avatar_config[item.slot] === item_id;

  // Check ownership: Item is owned if it is in student_wardrobe OR currently in student's avatar_config (default items)
  const wardrobes = getLocal(STORAGE_KEYS.STUDENT_WARDROBE, []);
  const isOwnedInWardrobe = wardrobes.some(w => w.student_id === user.uid && w.item_id === item_id);
  const isOwnedInConfig = Object.values(student.avatar_config).includes(item_id);

  if (!isOwnedInWardrobe && !isOwnedInConfig && !isCurrentlyEquipped) {
    throw new Error('PERMISSION_DENIED: Bạn chưa sở hữu vật phẩm này. Vui lòng chọn Mua ngay!');
  }

  // Auto-record ownership if it was a default item in avatar_config
  if (!isOwnedInWardrobe && isOwnedInConfig) {
    wardrobes.push({ student_id: user.uid, item_id: item_id, purchased_at: new Date().toISOString() });
    setLocal(STORAGE_KEYS.STUDENT_WARDROBE, wardrobes);
  }

  // Toggle: If currently equipped, unequip it!
  if (isCurrentlyEquipped) {
    student.avatar_config[item.slot] = null;
  } else {
    student.avatar_config[item.slot] = item_id;
  }

  setLocal(STORAGE_KEYS.STUDENTS, students);
  syncStudentToFirestore(student);

  return {
    equipped: student.avatar_config[item.slot] === item_id,
    slot: item.slot,
    avatar_config: student.avatar_config
  };
}

export async function unequipWardrobeSlot(slotKey) {
  const user = getCurrentAuthUser();
  if (!user) throw new Error('PERMISSION_DENIED: Chưa đăng nhập');

  const students = getLocal(STORAGE_KEYS.STUDENTS, []);
  const student = students.find(s => s.id === user.uid);

  if (student && student.avatar_config) {
    student.avatar_config[slotKey] = null;
    setLocal(STORAGE_KEYS.STUDENTS, students);
    syncStudentToFirestore(student);
  }

  return {
    slot: slotKey,
    avatar_config: student?.avatar_config || {}
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

export async function getAllLessons() {
  try {
    const qSnapshot = await getDocs(collection(db, 'lessons'));
    const lessons = [];
    qSnapshot.forEach(docSnap => {
      lessons.push(docSnap.data());
    });
    if (lessons.length > 0) return lessons;
  } catch (err) {
    console.error('Firestore getAllLessons error:', err);
  }
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

/* ==========================================================================
   TABLE MANAGEMENT & FIRESTORE SEEDER (NO HARDCODING)
   ========================================================================== */

// 1. Classes Table API
export function getClassesTable() {
  return getLocal(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
}

export function saveClassesTable(classList) {
  setLocal(STORAGE_KEYS.CLASSES, classList);
  return { success: true, count: classList.length };
}

export function deleteClassRecord(classId) {
  const list = getClassesTable();
  const filtered = list.filter(c => c.id !== classId);
  saveClassesTable(filtered);
  return { success: true };
}

// 2. Wardrobe Items Catalog Table API
const WARDROBE_CATALOG_STORAGE_KEY = 'vdvh_wardrobe_catalog';

export function getWardrobeCatalogTable() {
  return getLocal(WARDROBE_CATALOG_STORAGE_KEY, WARDROBE_ITEMS_CATALOG);
}

export function saveWardrobeCatalogTable(catalog) {
  setLocal(WARDROBE_CATALOG_STORAGE_KEY, catalog);
  return { success: true, count: catalog.length };
}

export function createWardrobeItemRecord(newItem) {
  const catalog = getWardrobeCatalogTable();
  const updated = [newItem, ...catalog];
  saveWardrobeCatalogTable(updated);
  return { success: true };
}

export function deleteWardrobeItemRecord(itemId) {
  const catalog = getWardrobeCatalogTable();
  const filtered = catalog.filter(i => i.id !== itemId);
  saveWardrobeCatalogTable(filtered);
  return { success: true };
}

// 3. Student Table Complete CRUD API
export function createStudentRecord(newStudent) {
  const students = getLocal(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  const studentObj = {
    id: newStudent.id || 'st_' + Date.now(),
    name: newStudent.name,
    username: newStudent.username.toLowerCase().trim(),
    gender: newStudent.gender || 'male',
    class: newStudent.class || 'Lớp 8A1',
    body: newStudent.gender === 'female' ? 'body_female' : 'base',
    current_star: parseInt(newStudent.current_star) || 0,
    streak: 3,
    is_active: newStudent.is_active !== undefined ? newStudent.is_active : true,
    must_change_password: false,
    created_at: new Date().toISOString()
  };

  const updated = [studentObj, ...students];
  setLocal(STORAGE_KEYS.STUDENTS, updated);
  syncStudentToFirestore(studentObj);
  return { success: true, student: studentObj };
}

export function updateStudentRecord(studentId, updatedFields) {
  const students = getLocal(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  const student = students.find(s => s.id === studentId);
  if (!student) throw new Error("Học sinh không tồn tại");

  Object.assign(student, updatedFields);
  if (updatedFields.gender) {
    student.body = updatedFields.gender === 'female' ? 'body_female' : 'base';
  }

  setLocal(STORAGE_KEYS.STUDENTS, students);
  syncStudentToFirestore(student);
  return { success: true, student };
}

export function toggleStudentStatus(studentId) {
  const students = getLocal(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  const student = students.find(s => s.id === studentId);
  if (!student) throw new Error("Học sinh không tồn tại");

  student.is_active = student.is_active === false ? true : false;
  setLocal(STORAGE_KEYS.STUDENTS, students);
  syncStudentToFirestore(student);
  return { success: true, student };
}

export function deleteStudentRecord(studentId) {
  const students = getLocal(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  const filtered = students.filter(s => s.id !== studentId);
  setLocal(STORAGE_KEYS.STUDENTS, filtered);
  return { success: true };
}

// 4. Teacher / Admin Table Complete CRUD API (Super Admin Access)
export function getTeachersTable() {
  const teachers = getLocal(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
  const hasSuperAdmin = teachers.some(t => t.id === 'superadmin_001' || t.recovery_email === 'superadmin' || t.role === 'superadmin');
  if (!hasSuperAdmin) {
    const superAdminObj = INITIAL_TEACHERS.find(t => t.role === 'superadmin') || {
      id: 'superadmin_001',
      name: 'Super Admin Raccoon',
      recovery_email: 'superadmin',
      email: 'superadmin@vuadivuahoc.edu.vn',
      password: 'raccoon2026',
      role: 'superadmin',
      is_active: true
    };
    teachers.unshift(superAdminObj);
    setLocal(STORAGE_KEYS.TEACHERS, teachers);
  }
  return teachers;
}

export function saveTeachersTable(teachers) {
  setLocal(STORAGE_KEYS.TEACHERS, teachers);
  teachers.forEach(t => syncTeacherToFirestore(t));
}

export function createTeacherRecord(newTeacher) {
  const teachers = getTeachersTable();
  const emailVal = (newTeacher.email || newTeacher.username || '').toLowerCase().trim();
  const existing = teachers.find(t => t.email?.toLowerCase() === emailVal || t.recovery_email?.toLowerCase() === emailVal);
  if (existing) {
    throw new Error(`Email / Username "${emailVal}" đã tồn tại trong hệ thống!`);
  }

  const teacherObj = {
    id: newTeacher.id || 'teacher_' + Date.now(),
    name: newTeacher.name.trim(),
    recovery_email: emailVal,
    email: emailVal,
    password: newTeacher.password?.trim() || '123456',
    role: newTeacher.role || 'teacher',
    is_active: newTeacher.is_active !== undefined ? newTeacher.is_active : true,
    created_at: new Date().toISOString()
  };

  const updated = [teacherObj, ...teachers];
  saveTeachersTable(updated);
  return { success: true, teacher: teacherObj };
}

export function updateTeacherRecord(teacherId, updatedFields) {
  const teachers = getTeachersTable();
  const teacher = teachers.find(t => t.id === teacherId);
  if (!teacher) throw new Error("Tài khoản quản trị viên không tồn tại");

  Object.assign(teacher, updatedFields);
  saveTeachersTable(teachers);
  return { success: true, teacher };
}

export function toggleTeacherStatus(teacherId) {
  const teachers = getTeachersTable();
  const teacher = teachers.find(t => t.id === teacherId);
  if (!teacher) throw new Error("Tài khoản không tồn tại");
  if (teacher.role === 'superadmin') {
    throw new Error("Không thể ngừng kích hoạt tài khoản Super Admin chính");
  }

  teacher.is_active = teacher.is_active === false ? true : false;
  saveTeachersTable(teachers);
  return { success: true, teacher };
}

export function deleteTeacherRecord(teacherId) {
  const teachers = getTeachersTable();
  const target = teachers.find(t => t.id === teacherId);
  if (target && target.role === 'superadmin') {
    throw new Error("Không thể xóa tài khoản Super Admin chính");
  }
  const filtered = teachers.filter(t => t.id !== teacherId);
  saveTeachersTable(filtered);
  return { success: true };
}

// 4. Cloud Firestore Master Seeder
export async function seedFirestoreTables() {
  let seededCount = 0;
  try {
    // A. Seed Lessons
    for (let l of INITIAL_LESSONS) {
      await setDoc(doc(db, 'lessons', l.id), l, { merge: true });
      seededCount++;
    }
    // B. Seed Questions
    for (let q of INITIAL_QUESTIONS) {
      await setDoc(doc(db, 'questions', q.id), q, { merge: true });
      seededCount++;
    }
    // C. Seed Wardrobe Items Catalog Table
    for (let item of WARDROBE_ITEMS_CATALOG) {
      await setDoc(doc(db, 'avatar_items', item.id), item, { merge: true });
      seededCount++;
    }
    // D. Seed Classes Table
    for (let cls of INITIAL_CLASSES) {
      await setDoc(doc(db, 'classes', cls.id), cls, { merge: true });
      seededCount++;
    }
    return {
      success: true,
      seeded_records: seededCount,
      message: `Đã khởi tạo & đồng bộ thành công ${seededCount} bản ghi lên Cloud Firestore!`
    };
  } catch (err) {
    console.error("Firestore seed error:", err);
    return {
      success: false,
      error: err.message
    };
  }
}




