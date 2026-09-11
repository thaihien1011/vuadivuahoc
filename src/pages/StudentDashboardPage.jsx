import React, { useState, useEffect } from 'react';
import { MapPin, ShoppingBag, Trophy, LogOut, Flame, Star, Compass, User, Sparkles } from 'lucide-react';
import InteractiveMap from '../components/map/InteractiveMap';
import QuizPlay from '../components/quiz/QuizPlay';
import WardrobeShop from '../components/wardrobe/WardrobeShop';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import DuolingoLeftSidebar from '../components/navigation/DuolingoLeftSidebar';
import StudentProfilePage from './StudentProfilePage';
import RaccoonAiModal from '../components/ai/RaccoonAiModal';
import { getCurrentAuthUser, getAllLessons } from '../services/api';
import { useActiveTheme } from '../services/theme';

export default function StudentDashboardPage({ onLogout }) {
  const { logoUrl, faceLogoUrl } = useActiveTheme();
  const [activeTab, setActiveTab] = useState('map'); // 'map' (Hành trình) | 'wardrobe' | 'leaderboard' | 'profile'
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const [studentData, setStudentData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lockedScores, setLockedScores] = useState([]);

  useEffect(() => {
    loadStudentState();
  }, [selectedLessonId, activeTab]);

  const loadStudentState = async () => {
    const user = getCurrentAuthUser();
    const students = JSON.parse(localStorage.getItem('vdvh_students') || '[]');
    const currentSt = students.find(s => s.id === user?.uid);

    setStudentData(currentSt || { name: user?.name || 'Nguyễn Văn A', class: 'Lớp 8A1', current_star: 0 });
    
    // Fetch live lessons from Cloud Firestore
    const liveLessons = await getAllLessons();
    setLessons(liveLessons);

    const allLocked = JSON.parse(localStorage.getItem('vdvh_locked_scores') || '[]');
    const studentLocked = allLocked.filter(ls => ls.student_id === user?.uid);
    setLockedScores(studentLocked);
  };

  const handleSelectLesson = (lessonId) => {
    setSelectedLessonId(lessonId);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* 1. DUOLINGO LEFT FIXED SIDEBAR */}
      <DuolingoLeftSidebar
        activeTab={activeTab}
        onTabChange={(tab) => { setSelectedLessonId(null); setActiveTab(tab); }}
        studentData={studentData}
        onLogout={onLogout}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
      />

      {/* 2. MOBILE TOP BAR (RESPONSIVE MOBILE VIEW ONLY < 768px) */}
      <div className="md:hidden sticky top-0 left-0 right-0 bg-white border-b border-slate-200 z-40 px-3 py-2 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm border border-[#58cc02]/30 bg-[#58cc02]/10 shrink-0">
            <img 
              src={logoUrl} 
              alt="Logo Raccoon" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-black text-xs text-[#58cc02] uppercase tracking-tight">VỪA ĐI VỪA HỌC</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 bg-amber-400 text-amber-950 hover:bg-amber-500 font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md border-b-2 border-amber-600 active:translate-y-0.5 transition-all"
            title="Hỏi Trợ lý Raccoon AI"
          >
            <div className="w-5 h-5 rounded-full overflow-hidden bg-white/30 border border-amber-950/20 shrink-0">
              <img src={faceLogoUrl} alt="Raccoon AI" className="w-full h-full object-cover" />
            </div>
            <span>AI Hỏi đáp</span>
          </button>
          <div className="flex items-center gap-0.5 font-extrabold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-lg text-xs">
            🔥3
          </div>
          <div className="flex items-center gap-0.5 font-extrabold text-[#ffb800] bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-lg text-xs">
            ⭐{studentData?.current_star || 0}
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. MAIN CENTER CONTENT AREA (ZERO PADDING & FULL VIEWPORT HEIGHT ALIGNMENT FOR MAP) */}
      <div className="flex-1 md:ml-56 w-full min-h-screen pb-16 md:pb-0">
        <div className={`w-full ${activeTab === 'map' ? 'p-1 sm:p-2 h-[calc(100dvh-115px)] md:h-screen flex flex-col' : 'p-3 sm:p-6 max-w-5xl mx-auto'}`}>
          {selectedLessonId ? (
            <QuizPlay
              lessonId={selectedLessonId}
              onBackToMap={() => setSelectedLessonId(null)}
              onScoreSaved={loadStudentState}
            />
          ) : (
            <>
              {activeTab === 'map' && (
                <InteractiveMap
                  lessons={lessons}
                  lockedScores={lockedScores}
                  onSelectLesson={handleSelectLesson}
                />
              )}

              {activeTab === 'wardrobe' && (
                <WardrobeShop
                  studentData={studentData}
                  onUpdateStudent={loadStudentState}
                />
              )}

              {activeTab === 'leaderboard' && (
                <LeaderboardTable />
              )}

              {activeTab === 'profile' && (
                <StudentProfilePage
                  studentData={studentData}
                  onUpdateStudent={loadStudentState}
                  onLogout={onLogout}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* FLOATING AI ASSISTANT BUTTON (DESKTOP) */}
      <button
        onClick={() => setIsAiModalOpen(true)}
        className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 font-extrabold px-5 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-white ring-4 ring-amber-400/20 group cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform overflow-hidden p-0.5 border border-amber-600/30">
          <img src={faceLogoUrl} alt="Raccoon AI" className="w-full h-full object-cover rounded-full" />
        </div>
        <span className="text-sm uppercase tracking-wide">Hỏi Trợ Lý Raccoon AI</span>
      </button>

      {/* RACCOON AI MODAL */}
      <RaccoonAiModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      {/* 4. MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-200 z-50 flex justify-around items-center px-2 shadow-xl">
        <button
          onClick={() => { setSelectedLessonId(null); setActiveTab('map'); }}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-black uppercase transition-colors ${
            activeTab === 'map' ? 'text-[#58cc02]' : 'text-slate-400'
          }`}
        >
          <MapPin className="w-4 h-4" />
          HÀNH TRÌNH
        </button>

        <button
          onClick={() => { setSelectedLessonId(null); setActiveTab('wardrobe'); }}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-black uppercase transition-colors ${
            activeTab === 'wardrobe' ? 'text-[#ce82ff]' : 'text-slate-400'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          TỦ ĐỒ
        </button>

        <button
          onClick={() => { setSelectedLessonId(null); setActiveTab('leaderboard'); }}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-black uppercase transition-colors ${
            activeTab === 'leaderboard' ? 'text-[#ffb800]' : 'text-slate-400'
          }`}
        >
          <Trophy className="w-4 h-4" />
          BXH
        </button>

        <button 
          onClick={() => { setSelectedLessonId(null); setActiveTab('profile'); }} 
          className={`flex flex-col items-center gap-0.5 text-[9px] font-black uppercase transition-colors ${
            activeTab === 'profile' ? 'text-sky-600' : 'text-slate-400'
          }`}
        >
          <User className="w-4 h-4" />
          HỒ SƠ
        </button>
      </div>
    </div>
  );
}
