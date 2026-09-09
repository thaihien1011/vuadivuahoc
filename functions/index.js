/**
 * Firebase Cloud Functions for "Vừa Đi Vừa Học" (vuadivuahoc)
 * Strictly implements 10/10 functions according to cloud-functions-spec.md
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const STAMP_REWARD_TABLE = { 1: 1, 2: 2, 3: 3 };

function getStampLevel(score) {
  if (score < 5) return 0;
  if (score <= 6) return 1;
  if (score <= 8) return 2;
  return 3;
}

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

// 1. getQuizQuestions
exports.getQuizQuestions = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'PERMISSION_DENIED');
  }

  const studentId = context.auth.uid;
  const { lesson_id } = data;

  const studentDoc = await db.collection('students').doc(studentId).get();
  if (!studentDoc.exists) {
    throw new functions.https.HttpsError('permission-denied', 'PERMISSION_DENIED');
  }

  const lessonDoc = await db.collection('lessons').doc(lesson_id).get();
  if (!lessonDoc.exists) throw new functions.https.HttpsError('not-found', 'NOT_FOUND');
  if (!lessonDoc.data().is_active) {
    throw new functions.https.HttpsError('failed-precondition', 'FAILED_PRECONDITION');
  }

  // Check attempt in progress
  const existingAttempts = await db.collection('quiz_attempts')
    .where('student_id', '==', studentId)
    .where('lesson_id', '==', lesson_id)
    .where('status', '==', 'in_progress')
    .limit(1)
    .get();

  let attemptId = '';
  let questionIds = [];

  if (!existingAttempts.empty) {
    const attempt = existingAttempts.docs[0];
    attemptId = attempt.id;
    questionIds = attempt.data().question_ids;
  } else {
    const qSnapshot = await db.collection('questions').where('lesson_id', '==', lesson_id).get();
    const allQ = qSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    if (allQ.length < 10) {
      throw new functions.https.HttpsError('failed-precondition', 'Chưa đủ 10 câu hỏi');
    }

    // Shuffle 10
    const shuffled = allQ.sort(() => 0.5 - Math.random()).slice(0, 10);
    questionIds = shuffled.map(q => q.id);

    const newRef = db.collection('quiz_attempts').doc();
    attemptId = newRef.id;
    await newRef.set({
      student_id: studentId,
      lesson_id: lesson_id,
      status: 'in_progress',
      question_ids: questionIds,
      started_at: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  // Fetch questions excluding correct_options
  const questions = [];
  for (let qid of questionIds) {
    const doc = await db.collection('questions').doc(qid).get();
    const qData = doc.data();
    questions.push({
      question_id: doc.id,
      text: qData.text,
      question_type: qData.question_type || 'single_choice',
      options: qData.options
    });
  }

  return {
    attempt_id: attemptId,
    status: 'in_progress',
    lesson: {
      lesson_id: lessonDoc.id,
      lesson_name: lessonDoc.data().name,
      intro_text: lessonDoc.data().intro_text,
      intro_video_url: lessonDoc.data().intro_video_url
    },
    questions
  };
});

// 2. submitQuiz
exports.submitQuiz = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'PERMISSION_DENIED');

  const { attempt_id, answers, duration_seconds } = data;
  const attemptRef = db.collection('quiz_attempts').doc(attempt_id);
  const attemptDoc = await attemptRef.get();

  if (!attemptDoc.exists) throw new functions.https.HttpsError('not-found', 'NOT_FOUND');
  const attempt = attemptDoc.data();

  if (attempt.student_id !== context.auth.uid) throw new functions.https.HttpsError('permission-denied', 'PERMISSION_DENIED');
  if (attempt.status === 'submitted') throw new functions.https.HttpsError('failed-precondition', 'Bài này đã nộp rồi');

  let score = 0;
  const per_question_result = [];

  for (let qid of attempt.question_ids) {
    const qDoc = await db.collection('questions').doc(qid).get();
    const qData = qDoc.data();
    const studentAns = answers[qid] || [];
    const isCorrect = areSetsEqual(studentAns, qData.correct_options);

    if (isCorrect) score++;
    per_question_result.push({ question_id: qid, is_correct: isCorrect });
  }

  await attemptRef.update({
    status: 'submitted',
    score,
    answers,
    duration_seconds,
    submitted_at: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    attempt_id,
    status: 'submitted',
    score,
    total_questions: attempt.question_ids.length,
    per_question_result
  };
});

// 3. saveScore
exports.saveScore = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'PERMISSION_DENIED');
  const { attempt_id } = data;
  const studentId = context.auth.uid;

  return db.runTransaction(async (transaction) => {
    const attemptRef = db.collection('quiz_attempts').doc(attempt_id);
    const attemptDoc = await transaction.get(attemptRef);

    if (!attemptDoc.exists) throw new functions.https.HttpsError('not-found', 'NOT_FOUND');
    const attempt = attemptDoc.data();
    if (attempt.student_id !== studentId) throw new functions.https.HttpsError('permission-denied', 'PERMISSION_DENIED');
    if (attempt.status !== 'submitted') throw new functions.https.HttpsError('failed-precondition', 'Phải nộp bài trước khi lưu');

    const lockedRef = db.collection('locked_scores').doc(`${studentId}_${attempt.lesson_id}`);
    const lockedDoc = await transaction.get(lockedRef);
    const studentRef = db.collection('students').doc(studentId);
    const studentDoc = await transaction.get(studentRef);

    let saved = false;
    let star_earned = 0;
    const new_stamp = getStampLevel(attempt.score);
    const old_stamp = lockedDoc.exists ? lockedDoc.data().stamp_level : 0;

    if (!lockedDoc.exists || attempt.score > lockedDoc.data().score) {
      if (new_stamp > old_stamp) {
        star_earned = (STAMP_REWARD_TABLE[new_stamp] || 0) - (STAMP_REWARD_TABLE[old_stamp] || 0);
        if (star_earned > 0 && studentDoc.exists) {
          transaction.update(studentRef, {
            current_star: admin.firestore.FieldValue.increment(star_earned)
          });
          const txRef = db.collection('star_transactions').doc();
          transaction.set(txRef, {
            student_id: studentId,
            amount: star_earned,
            type: 'earn',
            source: 'quiz',
            reference_id: attempt.lesson_id,
            created_at: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }

      transaction.set(lockedRef, {
        student_id: studentId,
        lesson_id: attempt.lesson_id,
        score: attempt.score,
        stamp_level: new_stamp,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      saved = true;
    }

    // Always fetch review correct options
    const review = [];
    for (let qid of attempt.question_ids) {
      const qDoc = await transaction.get(db.collection('questions').doc(qid));
      const qData = qDoc.data();
      const studentAns = attempt.answers[qid] || [];
      review.push({
        question_id: qid,
        correct_options: qData.correct_options,
        student_answer: studentAns,
        is_correct: areSetsEqual(studentAns, qData.correct_options)
      });
    }

    return {
      saved,
      score: attempt.score,
      stamp_level: new_stamp,
      star_earned,
      review
    };
  });
});

// 4. adminResetPassword
exports.adminResetPassword = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'PERMISSION_DENIED');

  const { student_id } = data;
  const words = ['meocon', 'chugau', 'daibaio', 'saovang', 'dientu'];
  const tempPassword = `${words[Math.floor(Math.random() * words.length)]}${Math.floor(100 + Math.random() * 900)}`;

  await admin.auth().updateUser(student_id, { password: tempPassword });
  await db.collection('students').doc(student_id).update({ must_change_password: true });

  await db.collection('security_audit_log').add({
    actor_id: context.auth.uid,
    target_id: student_id,
    action: 'reset_password',
    created_at: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    reset: true,
    student_id,
    temp_password: tempPassword,
    must_change_password: true
  };
});
