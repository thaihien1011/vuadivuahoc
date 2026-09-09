import React, { useState, useEffect } from 'react';
import { MapPin, ShoppingBag, Trophy, LogOut, Flame, Star, Compass, User } from 'lucide-react';
import InteractiveMap from '../components/map/InteractiveMap';
import QuizPlay from '../components/quiz/QuizPlay';
import WardrobeShop from '../components/wardrobe/WardrobeShop';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import DuolingoLeftSidebar from '../components/navigation/DuolingoLeftSidebar';
import StudentProfilePage from './StudentProfilePage';
import { getCurrentAuthUser } from '../services/api';

export default function StudentDashboardPage({ onLogout }) {
  const [activeTab, setActiveTab] = useState('map'); // 'map' (Hành trình) | 'wardrobe' | 'leaderboard' | 'profile'
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  const [studentData, setStudentData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lockedScores, setLockedScores] = useState([]);

  useEffect(() => {
    loadStudentState();
  }, [selectedLessonId, activeTab]);

  const loadStudentState = () => {
    const user = getCurrentAuthUser();
    const students = JSON.parse(localStorage.getItem('vdvh_students') || '[]');
    const currentSt = students.find(s => s.id === user?.uid);

    setStudentData(currentSt || { name: user?.name || 'Nguyễn Trà My', class: 'Lớp 8A1', current_star: 0 });
    setLessons(JSON.parse(localStorage.getItem('vdvh_lessons') || '[]'));

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
      />

      {/* 2. MOBILE TOP BAR (RESPONSIVE MOBILE VIEW ONLY < 768px) */}
      <div className="md:hidden sticky top-0 left-0 right-0 bg-white border-b border-slate-200 z-40 px-3 py-2 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#58cc02] rounded-lg flex items-center justify-center text-white">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-black text-xs text-[#58cc02] uppercase tracking-tight">VỪA ĐI VỪA HỌC</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 font-extrabold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-xs">
            🔥 3
          </div>
          <div className="flex items-center gap-1 font-extrabold text-[#ffb800] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-xs">
            ⭐ {studentData?.current_star || 0}
          </div>
        </div>
      </div>

      {/* 3. MAIN CENTER CONTENT AREA (ZERO PADDING & FULL VIEWPORT HEIGHT ALIGNMENT FOR MAP) */}
      <div className="flex-1 md:ml-56 w-full min-h-screen">
        <div className={`w-full ${activeTab === 'map' ? 'p-1 sm:p-2 h-screen flex flex-col' : 'p-3 sm:p-6 max-w-5xl mx-auto'}`}>
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
                />
              )}
            </>
          )}
        </div>
      </div>

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
