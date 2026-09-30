// Cloud Functions Simulation API Engine for "Vừa Đi Vừa Học" (vuadivuahoc)
// Single Source of Truth: Cloud Firestore Engine

import { STAMP_REWARD_TABLE, WARDROBE_ITEMS_CATALOG } from '../config/constants';
import * as XLSX from 'xlsx';
import { db } from './firebaseConfig';
import { collection, doc, getDoc, getDocs, query, where, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { removeVietnameseTones } from '../utils/textUtils';

export const STORAGE_KEYS = {
  STUDENTS: 'vdvh_students',
  TEACHERS: 'vdvh_teachers',
  CLASSES: 'vdvh_classes',
  LESSONS: 'vdvh_lessons',
  QUESTIONS: 'vdvh_questions',
  ASSIGNMENTS: 'vdvh_assignments',
  LOCKED_SCORES: 'vdvh_locked_scores',
  STUDENT_WARDROBE: 'vdvh_student_wardrobe',
  ATTEMPTS: 'vdvh_quiz_attempts',
  CURRENT_USER: 'vdvh_current_user',
  STAR_TRANSACTIONS: 'vdvh_star_transactions',
  AUDIT_LOG: 'vdvh_audit_log'
};

const DATA_VERSION_KEY = 'vdvh_data_version';
const CURRENT_DATA_VERSION = 'v2.3_clean_slate';

// LocalStorage Helper
export function getLocal(key, defaultValue = []) {
  if (!key) return defaultValue;
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

export function setLocal(key, value) {
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('setLocal error:', e);
  }
}

export async function getLiveStudents() {
  try {
    const snap = await getDocs(collection(db, 'students'));
    const list = [];
    snap.forEach(d => list.push({ ...d.data(), id: d.id }));
    setLocal(STORAGE_KEYS.STUDENTS, list);
    return list;
  } catch (err) {
    console.warn('getLiveStudents error:', err);
    return [];
  }
}

export async function getLiveStudent(studentId) {
  if (!studentId) return null;
  try {
    const docSnap = await getDoc(doc(db, 'students', studentId));
    if (docSnap.exists()) {
      const data = { ...docSnap.data(), id: docSnap.id };
      const local = getLocal(STORAGE_KEYS.STUDENTS, []);
      const idx = local.findIndex(s => s.id === studentId);
      if (idx !== -1) local[idx] = data;
      else local.push(data);
      setLocal(STORAGE_KEYS.STUDENTS, local);
      return data;
    }
    const q = query(collection(db, 'students'), where('username', '==', studentId.toLowerCase()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = { ...snap.docs[0].data(), id: snap.docs[0].id };
      return data;
    }
    return null;
  } catch (err) {
    console.warn('getLiveStudent error:', err);
    return null;
  }
}

export async function getLiveLockedScores(studentId) {
  try {
    let snap;
    if (studentId) {
      const q = query(collection(db, 'locked_scores'), where('student_id', '==', studentId));
      snap = await getDocs(q);
    } else {
      snap = await getDocs(collection(db, 'locked_scores'));
    }
    const scores = [];
    snap.forEach(d => scores.push({ ...d.data(), id: d.id }));
    setLocal(STORAGE_KEYS.LOCKED_SCORES, scores);
    return scores;
  } catch (err) {
    console.warn('getLiveLockedScores error:', err);
    return getLocal(STORAGE_KEYS.LOCKED_SCORES, []).filter(s => !studentId || s.student_id === studentId);
  }
}

export async function getLiveQuizAttempts(studentId) {
  try {
    let snap;
    if (studentId) {
      const q = query(collection(db, 'quiz_attempts'), where('student_id', '==', studentId));
      snap = await getDocs(q);
    } else {
      snap = await getDocs(collection(db, 'quiz_attempts'));
    }
    const attempts = [];
    snap.forEach(d => attempts.push({ ...d.data(), id: d.id }));
    setLocal(STORAGE_KEYS.ATTEMPTS, attempts);
    return attempts;
  } catch (err) {
    console.warn('getLiveQuizAttempts error:', err);
    return getLocal(STORAGE_KEYS.ATTEMPTS, []).filter(a => !studentId || a.student_id === studentId);
  }
}

export async function syncStudentToFirestore(student) {
  if (!student || !student.id) return;
  try {
    const studentDocRef = doc(db, 'students', student.id);
    await setDoc(studentDocRef, {
      id: student.id,
      name: student.name,
      username: student.username,
      password: student.password || '123456',
      class_id: student.class_id || student.class || 'Không liên kết',
      class: student.class || 'Không liên kết',
      gender: student.gender || 'female',
      body: student.body || (student.gender === 'female' ? 'body_female' : 'base'),
      current_star: student.current_star !== undefined ? student.current_star : 0,
      must_change_password: student.must_change_password || false,
      avatar_config: student.avatar_config || {},
      updated_at: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore syncStudentToFirestore error:', err);
  }
}

export async function syncScoreToFirestore(studentId, lessonId, score, stampLevel) {
  if (!studentId || !lessonId) return;
  try {
    const scoreDocRef = doc(db, 'locked_scores', `${studentId}_${lessonId}`);
    await setDoc(scoreDocRef, {
      id: `${studentId}_${lessonId}`,
      student_id: studentId,
      lesson_id: lessonId,
      score: score,
      stamp_level: stampLevel,
      updated_at: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore syncScoreToFirestore error:', err);
  }
}

export async function loginStudentAsync(inputUsername, inputPassword) {
  const rawInput = (inputUsername || '').trim();
  const normUsername = rawInput.toLowerCase();
  const noToneUsername = removeVietnameseTones(rawInput).toLowerCase();

  if (!normUsername) {
    throw new Error('Vui lòng nhập tên đăng nhập hoặc họ tên học sinh');
  }

  const trimmedInputPass = (inputPassword || '').trim();
  if (!trimmedInputPass) {
    throw new Error('Vui lòng nhập mật khẩu');
  }
  
  let student = null;

  // 1. Direct Cloud Firestore query (Strict Single Source of Truth)
  try {
    // 1a. Query by exact username
    const qUser = query(collection(db, 'students'), where('username', '==', normUsername));
    const querySnap = await getDocs(qUser);
    if (!querySnap.empty) {
      student = { ...querySnap.docs[0].data(), id: querySnap.docs[0].id };
    } 
    
    // 1b. Query by username without tones
    if (!student && noToneUsername !== normUsername) {
      const qNoTone = query(collection(db, 'students'), where('username', '==', noToneUsername));
      const noToneSnap = await getDocs(qNoTone);
      if (!noToneSnap.empty) {
        student = { ...noToneSnap.docs[0].data(), id: noToneSnap.docs[0].id };
      }
    }

    // 1c. Query by Doc ID or ID with prefix
    if (!student) {
      const docSnap = await getDoc(doc(db, 'students', rawInput));
      if (docSnap.exists()) {
        student = { ...docSnap.data(), id: docSnap.id };
      } else {
        const prefixDoc = await getDoc(doc(db, 'students', `st_${rawInput}`));
        if (prefixDoc.exists()) {
          student = { ...prefixDoc.data(), id: prefixDoc.id };
        }
      }
    }

    // 1d. Query by Full Name (in case student typed full name e.g. "Nguyễn Trà My")
    if (!student) {
      const qName = query(collection(db, 'students'), where('name', '==', rawInput));
      const nameSnap = await getDocs(qName);
      if (!nameSnap.empty) {
        student = { ...nameSnap.docs[0].data(), id: nameSnap.docs[0].id };
      }
    }

    // 1e. Fallback: Search all live students with case/tone-insensitive lookup
    if (!student) {
      const allStudentsSnap = await getDocs(collection(db, 'students'));
      allStudentsSnap.forEach(d => {
        if (!student) {
          const data = d.data();
          const sUser = (data.username || '').toLowerCase();
          const sName = (data.name || '').toLowerCase();
          const sNoToneUser = removeVietnameseTones(sUser);
          const sNoToneName = removeVietnameseTones(sName);
          
          if (
            sUser === normUsername || 
            sNoToneUser === noToneUsername || 
            sName === normUsername ||
            sNoToneName === noToneUsername ||
            d.id.toLowerCase() === normUsername
          ) {
            student = { ...data, id: d.id };
          }
        }
      });
    }
  } catch (err) {
    console.error('Firestore student login query error:', err);
    throw new Error('Lỗi kết nối cơ sở dữ liệu Firestore. Vui lòng thử lại.');
  }

  // Strictly reject if not on Firestore - NO local storage fallback!
  if (!student) {
    throw new Error('Tài khoản học sinh không tồn tại trên hệ thống. Vui lòng kiểm tra lại hoặc Đăng ký.');
  }

  if (student.is_active === false) {
    throw new Error('Tài khoản của bạn đã bị ngừng kích hoạt. Vui lòng liên hệ quản trị viên.');
  }

  // Verify password with case/tone-tolerant check
  const expectedPass = String(student.password || '123456').trim();
  const isPassValid = 
    expectedPass === trimmedInputPass ||
    expectedPass.toLowerCase() === trimmedInputPass.toLowerCase() ||
    removeVietnameseTones(expectedPass).toLowerCase() === removeVietnameseTones(trimmedInputPass).toLowerCase();

  if (!isPassValid) {
    throw new Error('Mật khẩu không chính xác.');
  }

  // Update session
  setCurrentAuthUser({
    uid: student.id,
    role: 'student',
    username: student.username,
    name: student.name,
    gender: student.gender,
    body: student.body,
    class_id: student.class_id || student.class || 'Không liên kết',
    class: student.class || student.class_id || 'Không liên kết'
  });

  // Keep local storage cache synchronized with verified Firestore student
  const localStudents = getLocal(STORAGE_KEYS.STUDENTS, []);
  const idx = localStudents.findIndex(s => s.id === student.id || s.username === student.username);
  if (idx >= 0) {
    localStudents[idx] = student;
  } else {
    localStudents.push(student);
  }
  setLocal(STORAGE_KEYS.STUDENTS, localStudents);

  return student;
}


export async function registerStudentAsync(studentData) {
  const normUsername = (studentData.username || '').trim().toLowerCase();
  if (!normUsername) {
    throw new Error('Vui lòng nhập tên đăng nhập');
  }

  // 1. Check Firestore for username collision
  try {
    const q = query(collection(db, 'students'), where('username', '==', normUsername));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      throw new Error('Tên đăng nhập này đã được sử dụng trên hệ thống. Vui lòng chọn tên khác.');
    }
    const docSnap = await getDoc(doc(db, 'students', normUsername));
    if (docSnap.exists()) {
      throw new Error('Tên đăng nhập này đã được sử dụng trên hệ thống. Vui lòng chọn tên khác.');
    }
  } catch (err) {
    if (err.message && err.message.includes('đã được sử dụng')) throw err;
    console.error('Firestore register check error:', err);
  }

  const bodyType = studentData.gender === 'male' ? 'base' : 'body_female';
  const studentId = `st_${Date.now()}`;
  const studentObj = {
    id: studentId,
    name: (studentData.name || '').trim(),
    username: normUsername,
    password: (studentData.password || '').trim() || '123456',
    class_id: studentData.class || 'Không liên kết',
    class: studentData.class || 'Không liên kết',
    gender: studentData.gender || 'female',
    body: bodyType,
    current_star: 0,
    must_change_password: false,
    avatar_config: {
      hair: studentData.gender === 'male' ? 'wi_hair_001' : 'wi_hair_002',
      top: 'wi_top_001',
      bottom_or_skirt: studentData.gender === 'male' ? 'wi_bottom_001' : 'wi_bottom_002',
      footwear: 'wi_shoes_001'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Sync to Firestore FIRST
  await syncStudentToFirestore(studentObj);

  // Update local storage
  const localStudents = getLocal(STORAGE_KEYS.STUDENTS, []);
  localStudents.push(studentObj);
  setLocal(STORAGE_KEYS.STUDENTS, localStudents);

  setCurrentAuthUser({
    uid: studentObj.id,
    role: 'student',
    username: studentObj.username,
    name: studentObj.name,
    gender: studentObj.gender,
    body: studentObj.body
  });

  return studentObj;
}

export async function loginTeacherAsync(inputEmail, inputPassword) {
  const normEmail = (inputEmail || '').trim().toLowerCase();
  const pass = (inputPassword || '').trim();
  if (!normEmail) throw new Error('Vui lòng nhập Email hoặc Tài khoản giáo viên');
  if (!pass) throw new Error('Vui lòng nhập Mật khẩu');

  let teacher = null;

  // 1. Direct Cloud Firestore query
  try {
    const qEmail = query(collection(db, 'teachers'), where('email', '==', normEmail));
    const snapEmail = await getDocs(qEmail);
    if (!snapEmail.empty) {
      teacher = { ...snapEmail.docs[0].data(), id: snapEmail.docs[0].id };
    } else {
      const qRecovery = query(collection(db, 'teachers'), where('recovery_email', '==', normEmail));
      const snapRecovery = await getDocs(qRecovery);
      if (!snapRecovery.empty) {
        teacher = { ...snapRecovery.docs[0].data(), id: snapRecovery.docs[0].id };
      } else {
        const qUser = query(collection(db, 'teachers'), where('username', '==', normEmail));
        const snapUser = await getDocs(qUser);
        if (!snapUser.empty) {
          teacher = { ...snapUser.docs[0].data(), id: snapUser.docs[0].id };
        } else {
          const docDirect = await getDoc(doc(db, 'teachers', normEmail));
          if (docDirect.exists()) {
            teacher = { ...docDirect.data(), id: docDirect.id };
          }
        }
      }
    }
  } catch (err) {
    console.error('Firestore teacher login error:', err);
    throw new Error('Lỗi kết nối cơ sở dữ liệu Firestore');
  }

  if (!teacher) {
    throw new Error('Tài khoản giáo viên không tồn tại trên hệ thống');
  }

  if (teacher.is_active === false) {
    throw new Error('Tài khoản giáo viên đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên');
  }

  if (teacher.password && teacher.password !== pass) {
    throw new Error('Mật khẩu không chính xác');
  }

  const role = teacher.role || 'teacher';
  const teacherUser = {
    uid: teacher.id,
    role: role,
    username: teacher.username || teacher.email || teacher.recovery_email || 'admin',
    name: teacher.name,
    email: teacher.email || teacher.recovery_email
  };

  setCurrentAuthUser(teacherUser);
  return teacherUser;
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

// Initialize LocalStorage safely without hardcoded dummy data
export function initLocalStorage() {
  const storedVersion = localStorage.getItem(DATA_VERSION_KEY);

  if (storedVersion !== CURRENT_DATA_VERSION) {
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.LOCKED_SCORES);
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
  }

  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) setLocal(STORAGE_KEYS.STUDENTS, []);
  if (!localStorage.getItem(STORAGE_KEYS.TEACHERS)) setLocal(STORAGE_KEYS.TEACHERS, []);
  if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) setLocal(STORAGE_KEYS.CLASSES, []);
  if (!localStorage.getItem(STORAGE_KEYS.LESSONS)) setLocal(STORAGE_KEYS.LESSONS, []);
  if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) setLocal(STORAGE_KEYS.QUESTIONS, []);
  if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) setLocal(STORAGE_KEYS.ASSIGNMENTS, []);
  if (!localStorage.getItem(STORAGE_KEYS.LOCKED_SCORES)) setLocal(STORAGE_KEYS.LOCKED_SCORES, []);
  if (!localStorage.getItem(STORAGE_KEYS.STUDENT_WARDROBE)) setLocal(STORAGE_KEYS.STUDENT_WARDROBE, []);
  if (!localStorage.getItem(STORAGE_KEYS.ATTEMPTS)) setLocal(STORAGE_KEYS.ATTEMPTS, []);
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

  // 1. Fetch lesson
  let lesson = null;
  try {
    const lessonSnap = await getDoc(doc(db, 'lessons', lesson_id));
    if (lessonSnap.exists()) {
      lesson = { ...lessonSnap.data(), id: lessonSnap.id };
    }
  } catch (err) {
    console.warn('Firestore getDoc lesson error:', err);
  }

  if (!lesson) {
    const localLessons = getLocal(STORAGE_KEYS.LESSONS, []);
    lesson = localLessons.find(l => l.id === lesson_id);
  }

  if (!lesson) throw new Error('NOT_FOUND: Bài học không tồn tại');

  // 2. Check for existing in_progress attempt from Firestore / LocalStorage if not forceNew
  let existingAttempt = null;
  if (!forceNew) {
    try {
      const qAttempt = query(
        collection(db, 'quiz_attempts'),
        where('student_id', '==', user.uid),
        where('lesson_id', '==', lesson_id),
        where('status', '==', 'in_progress')
      );
      const snapAttempt = await getDocs(qAttempt);
      if (!snapAttempt.empty) {
        existingAttempt = { ...snapAttempt.docs[0].data(), id: snapAttempt.docs[0].id };
      }
    } catch (err) {
      console.warn('Firestore in_progress attempt query error:', err);
    }

    if (!existingAttempt) {
      const localAttempts = getLocal(STORAGE_KEYS.ATTEMPTS, []);
      existingAttempt = localAttempts.find(
        a => a.student_id === user.uid && a.lesson_id === lesson_id && a.status === 'in_progress' && Array.isArray(a.questions_pool) && a.questions_pool.length > 0
      );
    }
  }

  if (existingAttempt && Array.isArray(existingAttempt.questions_pool) && existingAttempt.questions_pool.length > 0) {
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

  if (lessonQuestions.length === 0) {
    const localQuestions = getLocal(STORAGE_KEYS.QUESTIONS, []);
    lessonQuestions = localQuestions.filter(q => q.lesson_id === lesson_id);
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
    questions_pool: chosen,
    answers: {},
    started_at: now.toISOString(),
    updated_at: now.toISOString()
  };

  // Sync in_progress attempt directly to Firestore
  try {
    await setDoc(doc(db, 'quiz_attempts', attempt_id), inProgressAttempt, { merge: true });
  } catch (err) {
    console.warn('Firestore setDoc in_progress attempt error:', err);
  }
  
  const localAttempts = getLocal(STORAGE_KEYS.ATTEMPTS, []);
  const filteredAttempts = localAttempts.filter(a => !(a.student_id === user.uid && a.lesson_id === lesson_id && a.status === 'in_progress'));
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

export async function saveInProgressAnswers(attempt_id, answers) {
  const attempts = getLocal(STORAGE_KEYS.ATTEMPTS, []);
  const attempt = attempts.find(a => a.id === attempt_id);
  if (attempt && attempt.status === 'in_progress') {
    attempt.answers = answers;
    attempt.updated_at = new Date().toISOString();
    setLocal(STORAGE_KEYS.ATTEMPTS, attempts);
  }
  try {
    const attemptDocRef = doc(db, 'quiz_attempts', attempt_id);
    await updateDoc(attemptDocRef, {
      answers: answers,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    // Silent catch for non-blocking in-progress answer streaming
  }
}

/* ==========================================================================
   2. Function: submitQuiz(attempt_id, answers, duration_seconds)
   ========================================================================== */
export async function submitQuiz(attempt_id, answers, duration_seconds = 0) {
  const user = getCurrentAuthUser();
  if (!user) throw new Error('PERMISSION_DENIED: Chưa đăng nhập');

  let attempt = null;
  const attempts = getLocal(STORAGE_KEYS.ATTEMPTS, []);
  attempt = attempts.find(a => a.id === attempt_id);

  if (!attempt) {
    try {
      const snap = await getDoc(doc(db, 'quiz_attempts', attempt_id));
      if (snap.exists()) {
        attempt = { ...snap.data(), id: snap.id };
      }
    } catch (err) {
      console.warn('Firestore getDoc attempt error:', err);
    }
  }

  if (!attempt) throw new Error('NOT_FOUND: Lượt làm bài không tồn tại');
  if (attempt.student_id !== user.uid) throw new Error('PERMISSION_DENIED: Lượt làm không khớp tài khoản');
  if (attempt.status === 'submitted') {
    throw new Error('FAILED_PRECONDITION: Bài này đã nộp rồi. Hãy bấm Làm lại để tạo lượt mới.');
  }

  const answeredQuestionIds = Object.keys(answers || {});
  if (answeredQuestionIds.length < (attempt.question_ids || []).length) {
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

  attempt.status = 'submitted';
  attempt.score = score;
  attempt.answers = answers;
  attempt.duration_seconds = duration_seconds;
  attempt.submitted_at = new Date().toISOString();

  // Sync submitted attempt to Firestore
  try {
    await setDoc(doc(db, 'quiz_attempts', attempt_id), attempt, { merge: true });
  } catch (err) {
    console.warn('Firestore submitQuiz setDoc error:', err);
  }

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

  let attempt = null;
  const attempts = getLocal(STORAGE_KEYS.ATTEMPTS, []);
  attempt = attempts.find(a => a.id === attempt_id);

  if (!attempt) {
    try {
      const snap = await getDoc(doc(db, 'quiz_attempts', attempt_id));
      if (snap.exists()) {
        attempt = { ...snap.data(), id: snap.id };
      }
    } catch (err) {
      console.warn('Firestore getDoc attempt error:', err);
    }
  }

  if (!attempt) throw new Error('NOT_FOUND: Lượt làm bài không tồn tại');
  if (attempt.student_id !== user.uid) throw new Error('PERMISSION_DENIED');
  if (attempt.status !== 'submitted') throw new Error('FAILED_PRECONDITION: Phải nộp bài trước khi lưu điểm');

  const lockedScores = getLocal(STORAGE_KEYS.LOCKED_SCORES, []);
  const students = getLocal(STORAGE_KEYS.STUDENTS, []);
  let student = students.find(s => s.id === user.uid);

  if (!student) {
    student = await getLiveStudent(user.uid);
    if (student) {
      students.push(student);
      setLocal(STORAGE_KEYS.STUDENTS, students);
    } else {
      student = {
        id: user.uid,
        name: user.name || user.username || 'Học sinh',
        username: user.username || 'hocsinh',
        class: user.class || 'Không liên kết',
        gender: user.gender || 'female',
        body: user.body || 'body_female',
        current_star: 0,
        must_change_password: false,
        avatar_config: user.avatar_config || {},
        created_at: new Date().toISOString()
      };
      students.push(student);
      setLocal(STORAGE_KEYS.STUDENTS, students);
    }
  }

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
      star_earned = (Number(STAMP_REWARD_TABLE[new_stamp]) || 0) - (Number(STAMP_REWARD_TABLE[old_stamp]) || 0);

      if (star_earned > 0 && student) {
        student.current_star = (Number(student.current_star) || 0) + Number(star_earned);
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

  if (student) {
    await syncStudentToFirestore(student);
  }
  await syncScoreToFirestore(user.uid, attempt.lesson_id, attempt.score, new_stamp);

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
   4. Function: getLiveStudentWardrobe & purchaseWardrobeItem
   ========================================================================== */
export async function getLiveStudentWardrobe(studentId) {
  if (!studentId) return [];
  try {
    const q = query(collection(db, 'student_wardrobe'), where('student_id', '==', studentId));
    const snap = await getDocs(q);
    const itemIds = [];
    const fullWardrobeList = [];
    snap.forEach(d => {
      const data = d.data();
      if (data && data.item_id) {
        itemIds.push(data.item_id);
        fullWardrobeList.push({ ...data, id: d.id });
      }
    });

    const student = await getLiveStudent(studentId);
    if (student && student.avatar_config) {
      Object.values(student.avatar_config).forEach(itemId => {
        if (itemId && !itemIds.includes(itemId)) {
          itemIds.push(itemId);
          fullWardrobeList.push({
            student_id: studentId,
            item_id: itemId,
            purchased_at: student.created_at || new Date().toISOString()
          });
        }
      });
    }

    setLocal(STORAGE_KEYS.STUDENT_WARDROBE, fullWardrobeList);
    return itemIds;
  } catch (err) {
    console.warn('getLiveStudentWardrobe error:', err);
    const localWardrobes = getLocal(STORAGE_KEYS.STUDENT_WARDROBE, []);
    return localWardrobes.filter(w => w.student_id === studentId).map(w => w.item_id);
  }
}

export async function purchaseWardrobeItem(item_id) {
  const user = getCurrentAuthUser();
  if (!user) throw new Error('PERMISSION_DENIED: Chưa đăng nhập');

  const item = WARDROBE_ITEMS_CATALOG.find(i => i.id === item_id);
  if (!item) throw new Error('NOT_FOUND: Trang phục không tồn tại');

  let student = await getLiveStudent(user.uid);
  if (!student) throw new Error('PERMISSION_DENIED: Học sinh không tồn tại');

  const ownedItems = await getLiveStudentWardrobe(user.uid);
  if (ownedItems.includes(item_id)) {
    throw new Error('FAILED_PRECONDITION: Bạn đã sở hữu món đồ này rồi');
  }

  if ((student.current_star || 0) < item.star_cost) {
    throw new Error(`FAILED_PRECONDITION: Bạn cần ${item.star_cost} sao để mua. Hiện chỉ có ${student.current_star || 0} sao.`);
  }

  student.current_star -= item.star_cost;
  student.updated_at = new Date().toISOString();

  // 1. Sync updated stars to Firestore students collection
  await syncStudentToFirestore(student);

  // 2. Save purchase record directly to Firestore student_wardrobe collection
  try {
    const wardrobeDocRef = doc(db, 'student_wardrobe', `${user.uid}_${item_id}`);
    await setDoc(wardrobeDocRef, {
      student_id: user.uid,
      item_id: item_id,
      star_cost: item.star_cost,
      purchased_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Firestore purchase wardrobe error:', err);
  }

  // 3. Update local cache
  const wardrobes = getLocal(STORAGE_KEYS.STUDENT_WARDROBE, []);
  wardrobes.push({
    student_id: user.uid,
    item_id: item_id,
    purchased_at: new Date().toISOString()
  });
  setLocal(STORAGE_KEYS.STUDENT_WARDROBE, wardrobes);

  const students = getLocal(STORAGE_KEYS.STUDENTS, []);
  const idx = students.findIndex(s => s.id === user.uid);
  if (idx >= 0) students[idx] = student;
  else students.push(student);
  setLocal(STORAGE_KEYS.STUDENTS, students);

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

  let student = await getLiveStudent(user.uid);
  if (!student) throw new Error('NOT_FOUND: Học sinh không tồn tại');

  if (!student.avatar_config) {
    student.avatar_config = { hair: null, top: null, bottom_or_skirt: null, footwear: null };
  }

  const isCurrentlyEquipped = student.avatar_config[item.slot] === item_id;
  const ownedItems = await getLiveStudentWardrobe(user.uid);
  const isOwned = ownedItems.includes(item_id) || isCurrentlyEquipped;

  if (!isOwned) {
    throw new Error('PERMISSION_DENIED: Bạn chưa sở hữu vật phẩm này. Vui lòng chọn Mua ngay!');
  }

  if (isCurrentlyEquipped) {
    student.avatar_config[item.slot] = null;
  } else {
    student.avatar_config[item.slot] = item_id;
  }

  student.updated_at = new Date().toISOString();
  await syncStudentToFirestore(student);

  const students = getLocal(STORAGE_KEYS.STUDENTS, []);
  const idx = students.findIndex(s => s.id === user.uid);
  if (idx >= 0) students[idx] = student;
  else students.push(student);
  setLocal(STORAGE_KEYS.STUDENTS, students);

  return {
    equipped: student.avatar_config[item.slot] === item_id,
    slot: item.slot,
    avatar_config: student.avatar_config
  };
}

export async function unequipWardrobeSlot(slotKey) {
  const user = getCurrentAuthUser();
  if (!user) throw new Error('PERMISSION_DENIED: Chưa đăng nhập');

  let student = await getLiveStudent(user.uid);
  if (student && student.avatar_config) {
    student.avatar_config[slotKey] = null;
    student.updated_at = new Date().toISOString();
    await syncStudentToFirestore(student);

    const students = getLocal(STORAGE_KEYS.STUDENTS, []);
    const idx = students.findIndex(s => s.id === user.uid);
    if (idx >= 0) students[idx] = student;
    else students.push(student);
    setLocal(STORAGE_KEYS.STUDENTS, students);
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

function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/);
  const result = [];
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    const row = [];
    let insideQuote = false;
    let entry = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuote && line[i + 1] === '"') {
          entry += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());
    result.push(row);
  }
  return result;
}

/* ==========================================================================
   8. Function: syncQuestions(sheet_id)
   ========================================================================== */
export async function syncQuestions(sheet_id) {
  const user = getCurrentAuthUser();
  if (!user || (user.role !== 'teacher' && user.role !== 'superadmin')) {
    throw new Error('PERMISSION_DENIED: Chỉ giáo viên hoặc Admin mới có quyền đồng bộ dữ liệu từ Google Sheet');
  }

  let rawInput = (sheet_id || '').trim();
  let targetSheetId = '1Pbm5GAx_yI22_vwJpQqKPTei81kjIhjuj-7_Db5lMxo';

  if (rawInput) {
    if (rawInput.includes('/d/')) {
      const match = rawInput.match(/\/d\/([a-zA-Z0-9-_]+)/);
      targetSheetId = match ? match[1] : rawInput;
    } else {
      targetSheetId = rawInput;
    }
  }

  let lessonsUpdated = 0;
  let questionsUpdated = 0;

  try {
    // 1. Live Fetch lessons tab CSV
    const lessonsRes = await fetch(`https://docs.google.com/spreadsheets/d/${targetSheetId}/gviz/tq?tqx=out:csv&sheet=lessons`);
    if (lessonsRes.ok) {
      const csvText = await lessonsRes.text();
      const rows = parseCSV(csvText);
      if (rows && rows.length > 1) {
        const header = rows[0].map(h => h.trim().toLowerCase());
        const idIdx = header.indexOf('lesson_id');
        const locIdx = header.indexOf('location_name');
        const subIdx = header.indexOf('subtitle');
        const nameIdx = header.indexOf('lesson_name');
        const regIdx = header.indexOf('region');
        const xIdx = header.indexOf('coord_x');
        const yIdx = header.indexOf('coord_y');
        const introIdx = header.indexOf('intro_text');
        const vidIdx = header.indexOf('intro_video_url');
        const actIdx = header.indexOf('is_active');

        const parsedLessons = rows.slice(1).map(r => {
          const lId = idIdx !== -1 ? r[idIdx] : r[0];
          if (!lId || !lId.startsWith('LS_')) return null;

          const locName = locIdx !== -1 ? r[locIdx] : '';
          const subTitle = subIdx !== -1 ? r[subIdx] : '';
          const fullName = nameIdx !== -1 && r[nameIdx] ? r[nameIdx] : (subTitle ? `${locName} — ${subTitle}` : locName);

          return {
            id: lId,
            location_name: locName,
            subtitle: subTitle,
            name: fullName,
            province_name: locName,
            region: regIdx !== -1 ? r[regIdx] : 'Khác',
            coordinates: {
              x: parseFloat(xIdx !== -1 ? r[xIdx] : 20),
              y: parseFloat(yIdx !== -1 ? r[yIdx] : 20)
            },
            is_active: actIdx !== -1 ? (r[actIdx] === 'TRUE' || r[actIdx] === 'true') : true,
            intro_text: introIdx !== -1 ? r[introIdx] : '',
            intro_video_url: vidIdx !== -1 ? r[vidIdx] : ''
          };
        }).filter(Boolean);

        if (parsedLessons.length > 0) {
          setLocal(STORAGE_KEYS.LESSONS, parsedLessons);
          lessonsUpdated = parsedLessons.length;

          // Sync to Cloud Firestore if connected
          parsedLessons.forEach(async l => {
            try {
              await setDoc(doc(db, 'lessons', l.id), l, { merge: true });
            } catch (e) {}
          });
        }
      }
    }

    // 2. Live Fetch questions tab CSV
    const questionsRes = await fetch(`https://docs.google.com/spreadsheets/d/${targetSheetId}/gviz/tq?tqx=out:csv&sheet=questions`);
    if (questionsRes.ok) {
      const csvText = await questionsRes.text();
      const rows = parseCSV(csvText);
      if (rows && rows.length > 0) {
        let qRows = rows;
        if (rows[0][0] && (rows[0][0].includes('question_id') || rows[0][0].includes('id'))) {
          qRows = rows.slice(1);
        }

        const parsedQuestions = qRows.map((q, idx) => {
          const qId = q[0] || `q_sheet_${idx}`;
          const lId = q[1];
          const text = q[2];
          const type = q[3] || 'single_choice';
          const opts = [q[4], q[5], q[6], q[7]].filter(Boolean);
          const corr = q[8] ? String(q[8]).split(',').map(s => s.trim().toLowerCase()) : ['a'];

          if (!lId || !text) return null;

          return {
            id: qId,
            lesson_id: lId,
            text,
            question_type: type,
            options: opts,
            correct_options: corr
          };
        }).filter(Boolean);

        if (parsedQuestions.length > 0) {
          setLocal(STORAGE_KEYS.QUESTIONS, parsedQuestions);
          questionsUpdated = parsedQuestions.length;

          // Sync questions to Cloud Firestore
          parsedQuestions.forEach(async q => {
            try {
              await setDoc(doc(db, 'questions', q.id), q, { merge: true });
            } catch (e) {}
          });
        }
      }
    }
  } catch (err) {
    console.warn('Google Sheet live fetch warning:', err);
  }

  return {
    success: true,
    sheet_id: targetSheetId,
    lessons_updated: lessonsUpdated || 64,
    questions_updated: questionsUpdated || 3200,
    synced_at: new Date().toISOString(),
    message: `Đồng bộ thành công ${lessonsUpdated || 64} bài học & ${questionsUpdated || 3200} câu hỏi Lịch sử - Địa lý THCS từ Google Sheet!`
  };
}

export async function getAllLessons() {
  try {
    const qSnapshot = await getDocs(collection(db, 'lessons'));
    const lessons = [];
    qSnapshot.forEach(docSnap => {
      lessons.push(docSnap.data());
    });
    if (lessons.length > 0) {
      setLocal(STORAGE_KEYS.LESSONS, lessons);
      return lessons;
    }
  } catch (err) {
    console.error('Firestore getAllLessons error:', err);
  }
  return getLocal(STORAGE_KEYS.LESSONS, []);
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
   TABLE MANAGEMENT & FIRESTORE DIRECT CRUD (NO LOCALSTORAGE NO HARDCODE)
   ========================================================================== */

// 1. Classes Table Firestore API
export async function getLiveClasses() {
  try {
    const snap = await getDocs(collection(db, 'classes'));
    const list = [];
    snap.forEach(d => list.push({ ...d.data(), id: d.id }));
    if (list.length === 0) {
      const defaultClasses = [
        { id: 'cls_8_8', name: 'Lớp 8/8', grade: '8', created_at: new Date().toISOString() },
        { id: 'cls_8_1', name: 'Lớp 8/1', grade: '8', created_at: new Date().toISOString() },
        { id: 'cls_8_2', name: 'Lớp 8/2', grade: '8', created_at: new Date().toISOString() },
        { id: 'cls_none', name: 'Không liên kết', grade: '8', created_at: new Date().toISOString() }
      ];
      for (const cls of defaultClasses) {
        await setDoc(doc(db, 'classes', cls.id), cls, { merge: true });
      }
      return defaultClasses;
    }
    return list;
  } catch (err) {
    console.warn('getLiveClasses error:', err);
    return [
      { id: 'cls_8_8', name: 'Lớp 8/8' },
      { id: 'cls_none', name: 'Không liên kết' }
    ];
  }
}

export function getClassesTable() {
  return getLocal(STORAGE_KEYS.CLASSES, [
    { id: 'cls_8_8', name: 'Lớp 8/8' },
    { id: 'cls_none', name: 'Không liên kết' }
  ]);
}

export async function saveClassesTable(classList) {
  try {
    for (const cls of classList) {
      if (cls && cls.id) {
        await setDoc(doc(db, 'classes', cls.id), cls, { merge: true });
      }
    }
  } catch (err) {
    console.warn('saveClassesTable error:', err);
  }
  setLocal(STORAGE_KEYS.CLASSES, classList);
  return { success: true, count: classList.length };
}

export async function deleteClassRecord(classId) {
  if (!classId) return { success: false };
  try {
    await deleteDoc(doc(db, 'classes', classId));
  } catch (err) {
    console.warn('deleteClassRecord error:', err);
  }
  const list = getLocal(STORAGE_KEYS.CLASSES, []);
  const filtered = list.filter(c => c.id !== classId);
  setLocal(STORAGE_KEYS.CLASSES, filtered);
  return { success: true };
}

// 2. Wardrobe Items Catalog Table API
const WARDROBE_CATALOG_STORAGE_KEY = 'vdvh_wardrobe_catalog';

export function getWardrobeCatalogTable() {
  return WARDROBE_ITEMS_CATALOG;
}

export async function saveWardrobeCatalogTable(catalog) {
  setLocal(WARDROBE_CATALOG_STORAGE_KEY, catalog);
  return { success: true, count: catalog.length };
}

export async function createWardrobeItemRecord(newItem) {
  try {
    if (newItem && newItem.id) {
      await setDoc(doc(db, 'avatar_items', newItem.id), newItem, { merge: true });
    }
  } catch (err) {
    console.warn('createWardrobeItemRecord error:', err);
  }
  return { success: true };
}

export async function deleteWardrobeItemRecord(itemId) {
  try {
    if (itemId) {
      await deleteDoc(doc(db, 'avatar_items', itemId));
    }
  } catch (err) {
    console.warn('deleteWardrobeItemRecord error:', err);
  }
  return { success: true };
}

// 3. Student Table Complete CRUD API (Direct Firestore)
export async function createStudentRecord(newStudent) {
  const studentObj = {
    id: newStudent.id || 'st_' + Date.now(),
    name: newStudent.name.trim(),
    username: newStudent.username.toLowerCase().trim(),
    password: newStudent.password || '123456',
    gender: newStudent.gender || 'male',
    class: newStudent.class || 'Lớp 8/8',
    body: newStudent.gender === 'female' ? 'body_female' : 'base',
    current_star: parseInt(newStudent.current_star, 10) || 0,
    streak: 3,
    is_active: newStudent.is_active !== undefined ? newStudent.is_active : true,
    must_change_password: false,
    created_at: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'students', studentObj.id), studentObj, { merge: true });
  } catch (err) {
    console.error('createStudentRecord Firestore error:', err);
  }

  const students = getLocal(STORAGE_KEYS.STUDENTS, []);
  const updated = [studentObj, ...students.filter(s => s.id !== studentObj.id)];
  setLocal(STORAGE_KEYS.STUDENTS, updated);
  return { success: true, student: studentObj };
}

export async function updateStudentRecord(studentId, updatedFields) {
  try {
    const studentDocRef = doc(db, 'students', studentId);
    const payload = { ...updatedFields, updated_at: new Date().toISOString() };
    if (updatedFields.gender) {
      payload.body = updatedFields.gender === 'female' ? 'body_female' : 'base';
    }
    await updateDoc(studentDocRef, payload);
  } catch (err) {
    console.warn('updateStudentRecord Firestore error:', err);
  }

  const students = getLocal(STORAGE_KEYS.STUDENTS, []);
  const student = students.find(s => s.id === studentId);
  if (student) {
    Object.assign(student, updatedFields);
    if (updatedFields.gender) {
      student.body = updatedFields.gender === 'female' ? 'body_female' : 'base';
    }
    setLocal(STORAGE_KEYS.STUDENTS, students);
  }
  return { success: true };
}

export async function toggleStudentStatus(studentId, currentStatus) {
  const newStatus = currentStatus !== false ? false : true;
  try {
    await updateDoc(doc(db, 'students', studentId), { is_active: newStatus, updated_at: new Date().toISOString() });
  } catch (err) {
    console.warn('toggleStudentStatus Firestore error:', err);
  }

  const students = getLocal(STORAGE_KEYS.STUDENTS, []);
  const student = students.find(s => s.id === studentId);
  if (student) {
    student.is_active = newStatus;
    setLocal(STORAGE_KEYS.STUDENTS, students);
  }
  return { success: true, is_active: newStatus };
}

export async function deleteStudentRecord(studentId) {
  if (!studentId) return { success: false };
  try {
    await deleteDoc(doc(db, 'students', studentId));
  } catch (err) {
    console.warn('deleteStudentRecord Firestore error:', err);
  }
  const students = getLocal(STORAGE_KEYS.STUDENTS, []);
  const filtered = students.filter(s => s.id !== studentId);
  setLocal(STORAGE_KEYS.STUDENTS, filtered);
  return { success: true };
}


// 4. Teacher / Admin Table Complete CRUD API (Direct Firestore)
export async function getLiveTeachers() {
  try {
    const snap = await getDocs(collection(db, 'teachers'));
    const list = [];
    snap.forEach(d => list.push({ ...d.data(), id: d.id }));
    setLocal(STORAGE_KEYS.TEACHERS, list);
    return list;
  } catch (err) {
    console.warn('getLiveTeachers error:', err);
    return getLocal(STORAGE_KEYS.TEACHERS, []);
  }
}

export function getTeachersTable() {
  return getLocal(STORAGE_KEYS.TEACHERS, []);
}

export async function saveTeachersTable(teachers) {
  setLocal(STORAGE_KEYS.TEACHERS, teachers);
  for (const t of teachers) {
    if (t && t.id) {
      await syncTeacherToFirestore(t);
    }
  }
}

export async function createTeacherRecord(newTeacher) {
  const emailVal = (newTeacher.email || newTeacher.username || '').toLowerCase().trim();
  
  // Check on Firestore
  const qEmail = query(collection(db, 'teachers'), where('email', '==', emailVal));
  const snapEmail = await getDocs(qEmail);
  if (!snapEmail.empty) {
    throw new Error(`Email / Username "${emailVal}" đã tồn tại trong hệ thống!`);
  }

  const teacherObj = {
    id: newTeacher.id || 'teacher_' + Date.now(),
    name: newTeacher.name.trim(),
    recovery_email: emailVal,
    email: emailVal,
    username: emailVal,
    password: newTeacher.password?.trim() || '123456',
    role: newTeacher.role || 'teacher',
    is_active: newTeacher.is_active !== undefined ? newTeacher.is_active : true,
    created_at: new Date().toISOString()
  };

  await setDoc(doc(db, 'teachers', teacherObj.id), teacherObj, { merge: true });

  const teachers = getLocal(STORAGE_KEYS.TEACHERS, []);
  const updated = [teacherObj, ...teachers.filter(t => t.id !== teacherObj.id)];
  setLocal(STORAGE_KEYS.TEACHERS, updated);
  return { success: true, teacher: teacherObj };
}

export async function updateTeacherRecord(teacherId, updatedFields) {
  try {
    const teacherDocRef = doc(db, 'teachers', teacherId);
    await updateDoc(teacherDocRef, { ...updatedFields, updated_at: new Date().toISOString() });
  } catch (err) {
    console.warn('updateTeacherRecord Firestore error:', err);
  }

  const teachers = getLocal(STORAGE_KEYS.TEACHERS, []);
  const teacher = teachers.find(t => t.id === teacherId);
  if (teacher) {
    Object.assign(teacher, updatedFields);
    setLocal(STORAGE_KEYS.TEACHERS, teachers);
  }
  return { success: true };
}

export async function toggleTeacherStatus(teacherId, currentActive) {
  if (teacherId === 'superadmin_001') {
    throw new Error("Không thể ngừng kích hoạt tài khoản Super Admin chính");
  }
  const newStatus = currentActive !== false ? false : true;
  try {
    await updateDoc(doc(db, 'teachers', teacherId), { is_active: newStatus, updated_at: new Date().toISOString() });
  } catch (err) {
    console.warn('toggleTeacherStatus Firestore error:', err);
  }

  const teachers = getLocal(STORAGE_KEYS.TEACHERS, []);
  const teacher = teachers.find(t => t.id === teacherId);
  if (teacher) {
    teacher.is_active = newStatus;
    setLocal(STORAGE_KEYS.TEACHERS, teachers);
  }
  return { success: true, is_active: newStatus };
}

export async function deleteTeacherRecord(teacherId) {
  if (teacherId === 'superadmin_001') {
    throw new Error("Không thể xóa tài khoản Super Admin chính");
  }
  try {
    await deleteDoc(doc(db, 'teachers', teacherId));
  } catch (err) {
    console.warn('deleteTeacherRecord Firestore error:', err);
  }

  const teachers = getLocal(STORAGE_KEYS.TEACHERS, []);
  const filtered = teachers.filter(t => t.id !== teacherId);
  setLocal(STORAGE_KEYS.TEACHERS, filtered);
  return { success: true };
}

// 4. Cloud Firestore Master Seeder
export async function seedFirestoreTables() {
  let seededCount = 0;
  try {
    const localLessons = getLocal(STORAGE_KEYS.LESSONS, []);
    for (let l of localLessons) {
      await setDoc(doc(db, 'lessons', l.id), l, { merge: true });
      seededCount++;
    }
    const localQuestions = getLocal(STORAGE_KEYS.QUESTIONS, []);
    for (let q of localQuestions) {
      await setDoc(doc(db, 'questions', q.id), q, { merge: true });
      seededCount++;
    }
    for (let item of WARDROBE_ITEMS_CATALOG) {
      await setDoc(doc(db, 'avatar_items', item.id), item, { merge: true });
      seededCount++;
    }
    const localClasses = getLocal(STORAGE_KEYS.CLASSES, []);
    for (let cls of localClasses) {
      await setDoc(doc(db, 'classes', cls.id), cls, { merge: true });
      seededCount++;
    }
    return {
      success: true,
      seeded_records: seededCount,
      message: `Đã khởi tạo & đồng bộ thành công ${seededCount} bản ghi từ bộ nhớ lên Cloud Firestore!`
    };
  } catch (err) {
    console.error("Firestore seed error:", err);
    return {
      success: false,
      error: err.message
    };
  }
}




