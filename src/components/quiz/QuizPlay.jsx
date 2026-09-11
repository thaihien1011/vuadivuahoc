import React, { useState, useEffect } from 'react';
import { 
  BookOpen, HelpCircle, Clock, CheckCircle2, XCircle, RotateCcw, 
  Save, LogOut, Award, Star, AlertCircle, AlertTriangle, PlayCircle, ChevronRight, ShieldCheck, X,
  ArrowLeft, ChevronDown, ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getQuizQuestions, submitQuiz, saveScore, saveInProgressAnswers } from '../../services/api';

export default function QuizPlay({ lessonId, onBackToMap, onScoreSaved }) {
  const [activeTab, setActiveTab] = useState('intro'); // 'intro' | 'quiz'
  const [showFullText, setShowFullText] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const [submitResult, setSubmitResult] = useState(null);
  const [saveResult, setSaveResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [warningModal, setWarningModal] = useState({ isOpen: false, title: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Timer counter
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Load quiz questions
  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        setError(null);
        const data = await getQuizQuestions(lessonId);
        setQuizData(data);
        if (data && data.saved_answers) {
          setUserAnswers(data.saved_answers);
        }
      } catch (err) {
        setError(err.message || 'Lỗi nạp bài học');
      } finally {
        setLoading(false);
      }
    }
    if (lessonId) loadQuiz();
  }, [lessonId]);

  const handleSelectOption = (questionId, optionKey, isMultipleChoice) => {
    setUserAnswers(prev => {
      const currentAns = prev[questionId] || [];
      let newAns = {};
      if (isMultipleChoice) {
        if (currentAns.includes(optionKey)) {
          newAns = { ...prev, [questionId]: currentAns.filter(x => x !== optionKey) };
        } else {
          newAns = { ...prev, [questionId]: [...currentAns, optionKey] };
        }
      } else {
        newAns = { ...prev, [questionId]: [optionKey] };
      }

      if (quizData && quizData.attempt_id) {
        saveInProgressAnswers(quizData.attempt_id, newAns);
      }
      return newAns;
    });
  };

  const handleSubmitQuiz = async () => {
    if (!quizData) return;

    const answeredCount = Object.keys(userAnswers).filter(k => (userAnswers[k] || []).length > 0).length;
    if (answeredCount < quizData.questions.length) {
      setWarningModal({
        isOpen: true,
        title: 'Chưa Hoàn Thành Bài Quiz',
        message: `Bạn mới trả lời ${answeredCount}/${quizData.questions.length} câu. Vui lòng hoàn thành đủ 10 câu trước khi nộp bài!`
      });
      return;
    }

    try {
      setIsTimerRunning(false);
      const res = await submitQuiz(quizData.attempt_id, userAnswers, timerSeconds);
      setSubmitResult(res);
      setShowResultModal(true);
    } catch (err) {
      setWarningModal({
        isOpen: true,
        title: 'Lỗi Nộp Bài',
        message: err.message || 'Lỗi nộp bài. Vui lòng thử lại!'
      });
    }
  };

  const handleRetryQuiz = async () => {
    setShowResultModal(false);
    setSubmitResult(null);
    setSaveResult(null);
    setUserAnswers({});
    setTimerSeconds(0);
    setIsTimerRunning(true);
    try {
      setLoading(true);
      const data = await getQuizQuestions(lessonId, true); // Force new attempt
      setQuizData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScore = async () => {
    if (!quizData) return;
    try {
      const res = await saveScore(quizData.attempt_id);
      setSaveResult(res);

      if (res.star_earned > 0) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }

      if (onScoreSaved) onScoreSaved();
    } catch (err) {
      setWarningModal({
        isOpen: true,
        title: 'Lỗi Lưu Điểm',
        message: err.message || 'Lỗi lưu điểm. Vui lòng thử lại!'
      });
    }
  };

  const formatTimer = (totalSeconds) => {
    const validSecs = Number.isFinite(Number(totalSeconds)) ? Math.max(0, Math.floor(Number(totalSeconds))) : 0;
    const mins = Math.floor(validSecs / 60);
    const secs = validSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center my-8 shadow-sm">
        <div className="w-12 h-12 border-4 border-[#58cc02] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-bold">Đang nạp bài học & câu hỏi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center my-8 shadow-sm space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-800">Không Thể Truy Cập Bài Học</h3>
        <p className="text-slate-500 text-xs font-medium max-w-md mx-auto">{error}</p>
        <button 
          onClick={onBackToMap} 
          className="btn-duo-green py-3 px-6 text-xs font-black gap-2 inline-flex items-center mx-auto shadow-md hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          Quay Về Bản Đồ
        </button>
      </div>
    );
  }

  if (!quizData || !quizData.lesson) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center my-8 shadow-sm space-y-4">
        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-800">Dữ Liệu Bài Học Chưa Sẵn Sàng</h3>
        <p className="text-slate-500 text-xs font-medium max-w-md mx-auto">Vui lòng thử chọn một địa danh khác trên bản đồ.</p>
        <button 
          onClick={onBackToMap} 
          className="btn-duo-green py-3 px-6 text-xs font-black gap-2 inline-flex items-center mx-auto shadow-md hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          Quay Về Bản Đồ
        </button>
      </div>
    );
  }

  const { lesson, questions } = quizData;
  const answeredCount = Object.keys(userAnswers).filter(k => (userAnswers[k] || []).length > 0).length;
  const progressPercent = questions && questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const formatYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-36 sm:pb-20">
      {/* 1. TOP BAR HEADER (REPLACED "X" WITH "<- HÀNH TRÌNH") */}
      <div className="flex items-center justify-between gap-4 py-1">
        <button 
          onClick={onBackToMap}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          Hành Trình
        </button>

        {/* Progress Bar */}
        <div className="flex-1 duo-progress-bg">
          <div className="duo-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Timer Chip */}
        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 font-mono font-extrabold text-xs px-3 py-1.5 rounded-full border border-amber-200">
          <Clock className="w-4 h-4 text-amber-600" />
          {formatTimer(timerSeconds)}
        </div>
      </div>

      {/* 2. NAVIGATION TABS (TEXT + HIGHLIGHT UNDERLINE STYLE) */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('intro')}
          className={`pb-2.5 px-4 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'intro'
              ? 'text-[#58cc02] border-[#58cc02]'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          Thông tin chung
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`pb-2.5 px-4 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'quiz'
              ? 'text-[#58cc02] border-[#58cc02]'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          Quiz
        </button>
      </div>

      {/* 3. TAB 1: THÔNG TIN CHUNG (VIDEO TOP -> TEXT COLLAPSE -> QUIZ BUTTON) */}
      {activeTab === 'intro' && (() => {
        const hasVideo = Boolean(lesson.intro_video_url && lesson.intro_video_url.trim());
        const hasText = Boolean(lesson.intro_text && lesson.intro_text.trim());

        return (
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
            <h2 className="text-xl font-black text-slate-800">
              {lesson.location_name || lesson.province_name || lesson.name}
              {lesson.subtitle && (
                <span className="font-semibold text-slate-600"> — {lesson.subtitle}</span>
              )}
            </h2>

            {/* 1. VIDEO (Hide completely if intro_video_url is empty) */}
            {hasVideo && (
              <div className="aspect-video w-full max-h-[320px] rounded-xl overflow-hidden border border-slate-200 bg-black">
                <iframe
                  src={formatYoutubeEmbedUrl(lesson.intro_video_url)}
                  title="Lesson Video"
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            {/* 2. TEXT UNDER VIDEO (Hide completely if intro_text is empty) */}
            {hasText && (
              <div>
                <div 
                  className="text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200"
                  style={hasVideo && !showFullText ? {
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  } : {}}
                >
                  {lesson.intro_text}
                </div>

                {/* If video exists and text length > 160, show "Xem thêm" / "Thu gọn" button */}
                {hasVideo && lesson.intro_text.length > 160 && (
                  <button
                    onClick={() => setShowFullText(!showFullText)}
                    className="mt-2 text-xs font-extrabold text-[#58cc02] hover:underline flex items-center gap-1 focus:outline-none"
                  >
                    {showFullText ? (
                      <>Thu gọn <ChevronUp className="w-3.5 h-3.5" /></>
                    ) : (
                      <>Xem thêm <ChevronDown className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* 3. BUTTON "BẮT ĐẦU QUIZ NGAY" */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveTab('quiz')}
                className="bg-[#58cc02] hover:bg-[#46a302] text-white font-extrabold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm shadow-md hover:shadow-lg"
              >
                Bắt đầu quiz ngay
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* TAB 2: QUIZ EXERCISES */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          {questions.map((q, qIdx) => {
            const isMultiple = q.question_type === 'multiple_choice';
            const selectedKeys = userAnswers[q.question_id] || [];

            return (
              <div key={q.question_id} className="duo-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                    CÂU {qIdx + 1} / 10
                  </span>

                  {isMultiple && (
                    <span className="font-bold text-xs text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                      Chọn TẤT CẢ đáp án đúng
                    </span>
                  )}
                </div>

                <h3 className="text-lg md:text-xl font-black text-slate-800 leading-snug">
                  {q.text}
                </h3>

                {/* Duolingo Option Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {q.options.map((optText, optIdx) => {
                    const optionKey = String.fromCharCode(97 + optIdx); // 'a', 'b', 'c', 'd'
                    const isSelected = selectedKeys.includes(optionKey);

                    return (
                      <button
                        key={optionKey}
                        onClick={() => handleSelectOption(q.question_id, optionKey, isMultiple)}
                        className={`p-4 rounded-2xl text-left border-2 flex items-center gap-3 transition-all ${
                          isSelected
                            ? 'bg-sky-50 border-sky-500 text-sky-900 font-extrabold'
                            : 'bg-white border-gray-200 text-slate-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs uppercase border-2 ${
                          isSelected ? 'bg-sky-500 text-white border-sky-600' : 'bg-gray-100 text-slate-500 border-gray-300'
                        }`}>
                          {optionKey}
                        </span>
                        <span className="text-sm font-semibold flex-1">{optText}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* DUOLINGO FIXED BOTTOM CHECK ACTION BAR (MOBILE ELEVATED ABOVE BOTTOM NAV) */}
          <div className="fixed bottom-[60px] sm:bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 sm:p-4 z-40">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
              <div className="text-xs text-slate-600 font-bold">
                Đã trả lời: <span className="text-emerald-600 font-black text-sm">{answeredCount}/10</span> câu
              </div>

              <button
                onClick={handleSubmitQuiz}
                className="btn-duo-green px-6 sm:px-10 py-2.5 sm:py-3.5 text-xs sm:text-base shrink-0"
              >
                KIỂM TRA & NỘP BÀI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST-QUIZ MODAL */}
      {showResultModal && submitResult && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="duo-card max-w-md w-full p-6 text-center space-y-6 border-b-8 border-b-amber-500 animate-duo-bounce shadow-2xl">
            <Award className="w-20 h-20 text-amber-400 mx-auto drop-shadow-md" />
            
            <div>
              <h2 className="text-2xl font-black text-slate-800">KẾT QUẢ BÀI THI</h2>
              <p className="text-xs text-slate-500">Vừa Đi Vừa Học — Sử & Địa THCS</p>
            </div>

            <div className="bg-amber-50 p-6 rounded-2xl border-2 border-amber-300">
              <div className="text-5xl font-black text-amber-600 mb-1">
                {submitResult.score} <span className="text-base text-slate-500 font-bold">/ 10 Điểm</span>
              </div>
              <div className="text-xs text-slate-500 font-semibold">
                Thời gian: <span className="font-mono text-slate-800">{formatTimer(submitResult.duration_seconds)}</span>
              </div>
            </div>

            {saveResult && (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-xs space-y-1">
                {saveResult.saved ? (
                  <>
                    <div className="font-extrabold text-emerald-700 text-sm">
                      🎉 ĐÃ LƯU KỶ LỤC MỚI THÀNH CÔNG!
                    </div>
                    <div className="text-slate-600">
                      Mốc Stamp: <span className="font-black text-amber-600">Mốc {saveResult.stamp_level}</span> | Thưởng: <span className="font-black text-amber-600">+{saveResult.star_earned} Star 🌟</span>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-600 font-semibold">
                    Lượt thi này ({saveResult.score}đ) chưa vượt quá điểm cao nhất trước đó ({saveResult.previous_best_score}đ). Đã giữ kỷ lục cũ!
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3 pt-2">
              {!saveResult ? (
                <>
                  <button onClick={handleSaveScore} className="w-full btn-duo-green py-3.5">
                    <Save className="w-5 h-5" />
                    LƯU ĐIỂM & ĐỔI SAO
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleRetryQuiz} className="btn-duo-blue py-3 text-xs">
                      <RotateCcw className="w-4 h-4" />
                      Làm Lại
                    </button>
                    <button onClick={onBackToMap} className="btn-duo-outline py-3 text-xs">
                      Thoát Về Bản Đồ
                    </button>
                  </div>
                </>
              ) : (
                <button onClick={onBackToMap} className="w-full btn-duo-green py-3.5">
                  HOÀN TẤT & QUAY VỀ
                </button>
              )}
            </div>

            {/* Answer Review list after save */}
            {saveResult?.review && (
              <div className="pt-4 border-t border-gray-200 text-left space-y-3 max-h-60 overflow-y-auto pr-2">
                <h4 className="font-black text-xs text-slate-700 uppercase">Xem Chi Tiết Đáp Án Đúng:</h4>
                {saveResult.review.map((item, rIdx) => (
                  <div key={item.question_id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                    <div className="font-bold text-slate-800 mb-1">
                      Câu {rIdx + 1}: {item.text}
                    </div>
                    <div className="text-slate-500">
                      Đáp án đúng: <span className="font-extrabold text-emerald-600 uppercase">{item.correct_options.join(', ')}</span> | Bạn chọn: <span className="font-bold text-slate-800 uppercase">{item.student_answer.join(', ') || 'Bỏ trống'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WARNING / ERROR MODAL */}
      {warningModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-amber-400 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-none">
            <div className="w-14 h-14 bg-amber-100 border border-amber-300 rounded-full flex items-center justify-center mx-auto text-amber-600">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                {warningModal.title}
              </h3>
              <p className="text-sm font-semibold text-slate-600 mt-2 leading-relaxed">
                {warningModal.message}
              </p>
            </div>
            <button
              onClick={() => setWarningModal({ isOpen: false, title: '', message: '' })}
              className="w-full btn-duo-green py-3 text-sm font-black uppercase tracking-wider"
            >
              Đã Hiểu & Tiếp Tục Làm Bài
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
