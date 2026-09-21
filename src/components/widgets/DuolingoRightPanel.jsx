import React, { useState, useEffect } from 'react';
import { Flame, Star, Award, Trophy, ShoppingBag, CheckCircle2, ChevronRight } from 'lucide-react';
import AvatarCanvas from '../avatar/AvatarCanvas';
import { getLiveStudents, getLiveLockedScores } from '../../services/api';

export default function DuolingoRightPanel({ studentData, onNavigate }) {
  const [lockedScores, setLockedScores] = useState([]);
  const [topStudents, setTopStudents] = useState([]);

  useEffect(() => {
    async function loadRightPanelData() {
      if (studentData?.id) {
        const scores = await getLiveLockedScores(studentData.id);
        setLockedScores(scores);
      }
      const allStudents = await getLiveStudents();
      const sorted = [...allStudents].sort((a, b) => (b.current_star || 0) - (a.current_star || 0));
      setTopStudents(sorted.slice(0, 3));
    }
    loadRightPanelData();
  }, [studentData?.id, studentData?.current_star]);

  return (
    <div className="w-[340px] hidden lg:block space-y-6 pt-6 pr-4">
      {/* 1. STATUS STATS BAR */}
      <div className="flex items-center justify-between gap-2 p-2">
        {/* Streak Flame */}
        <div className="flex items-center gap-1.5 font-black text-amber-500 text-sm">
          <Flame className="w-6 h-6 fill-amber-500 text-amber-500 animate-duo-bounce" />
          <span>3</span>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1.5 font-black text-[#ffb800] text-sm">
          <Star className="w-6 h-6 fill-[#ffb800] text-[#ffb800]" />
          <span>{studentData?.current_star || 0}</span>
        </div>

        {/* Stamps */}
        <div className="flex items-center gap-1.5 font-black text-[#ff4b4b] text-sm">
          <Award className="w-6 h-6 fill-[#ff4b4b] text-[#ff4b4b]" />
          <span>{lockedScores.length}</span>
        </div>
      </div>

      {/* 2. LEAGUE WIDGET (BẢNG XẾP HẠNG TUẦN) */}
      <div className="duo-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#ffb800]" />
            BẢNG XẾP HẠNG
          </h3>
          <button 
            onClick={() => onNavigate('leaderboard')}
            className="text-xs font-extrabold text-[#1cb0f6] uppercase hover:underline"
          >
            XEM ALL
          </button>
        </div>

        <div className="space-y-3">
          {topStudents.map((st, idx) => (
            <div key={st.id} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-2.5">
                <span className="font-black text-xs text-slate-400 w-4">{idx + 1}</span>
                <AvatarCanvas avatarConfig={st.avatar_config} size={32} />
                <span className="font-extrabold text-xs text-slate-800">{st.name}</span>
              </div>
              <span className="font-black text-xs text-[#ffb800]">{st.current_star} 🌟</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. DAILY QUESTS CARD (NHIỆM VỤ HÀNG NGÀY) */}
      <div className="duo-card p-5 space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#58cc02]" />
          NHIỆM VỤ HÀNG NGÀY
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div>
              <div className="font-extrabold text-emerald-900">Hoàn thành 1 bài quiz</div>
              <div className="text-[10px] text-emerald-700">Đã xong (1/1)</div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-[#58cc02] fill-[#58cc02]" />
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div>
              <div className="font-extrabold text-amber-900">Đạt mốc 8 điểm trở lên</div>
              <div className="text-[10px] text-amber-700">Đã xong (+2 Stars 🌟)</div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-[#ffb800] fill-[#ffb800]" />
          </div>
        </div>
      </div>

      {/* 4. AVATAR WARDROBE PREVIEW CARD */}
      <div className="duo-card p-5 text-center space-y-3">
        <AvatarCanvas avatarConfig={studentData?.avatar_config} size={100} className="mx-auto" />
        <button
          onClick={() => onNavigate('wardrobe')}
          className="w-full btn-duo-blue py-2.5 text-xs gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          VÀO TỦ ĐỒ ĐỔI TRANG PHỤC
        </button>
      </div>
    </div>
  );
}
