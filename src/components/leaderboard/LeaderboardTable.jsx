import React, { useState, useEffect } from 'react';
import { Trophy, Award } from 'lucide-react';
import AvatarCanvas from '../avatar/AvatarCanvas';

export default function LeaderboardTable() {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: 'instant' });

    const students = JSON.parse(localStorage.getItem('vdvh_students') || '[]');
    const lockedScores = JSON.parse(localStorage.getItem('vdvh_locked_scores') || '[]');
    const classes = JSON.parse(localStorage.getItem('vdvh_classes') || '[]');

    // Calculate aggregated scores & total stamps per student
    const ranked = students.map(s => {
      const sScores = lockedScores.filter(ls => ls.student_id === s.id);
      const totalScore = sScores.reduce((acc, curr) => acc + curr.score, 0);
      const totalStamps = sScores.reduce((acc, curr) => acc + (curr.stamp_level || 0), 0);
      const className = classes.find(c => c.id === s.class_id)?.name || 'Lớp 8A1';

      return {
        ...s,
        className,
        totalScore,
        totalStamps,
        lessonsCompleted: sScores.length
      };
    });

    // Rank by total score, then by current stars
    ranked.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return b.current_star - a.current_star;
    });

    setLeaderboardData(ranked);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'HS';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const top1 = leaderboardData[0];
  const top2 = leaderboardData[1];
  const top3 = leaderboardData[2];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* HEADER TITLE */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <Trophy className="w-6 h-6 text-purple-600 shrink-0" />
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            Bảng xếp hạng {top1?.className || 'Lớp 8A1'}
          </h1>
        </div>
        <p className="text-xs font-semibold text-slate-500 pl-8">
          Xếp theo điểm cao nhất và số huy hiệu đạt được
        </p>
      </div>

      {/* TOP 3 PODIUM SHOWCASE */}
      <div className="grid grid-cols-3 gap-3 items-end pt-2 max-w-xl mx-auto">
        {/* Rank 2 (Left) */}
        {top2 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center space-y-2.5 shadow-sm">
            <div className="w-14 h-14 bg-purple-100 border border-purple-200 rounded-xl mx-auto flex items-center justify-center font-black text-purple-700 text-base">
              {getInitials(top2.name)}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500">Hạng 2</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">{top2.totalScore} đ</div>
            </div>
          </div>
        ) : <div />}

        {/* Rank 1 (Center - Elevated & Dark Purple) */}
        {top1 ? (
          <div className="bg-[#362A5C] border-2 border-[#E0B85C] rounded-xl p-5 text-center space-y-3 transform -translate-y-2 shadow-sm">
            <div className="w-16 h-16 bg-[#E0B85C] text-[#362A5C] rounded-xl mx-auto flex items-center justify-center font-black text-lg shadow-sm">
              {getInitials(top1.name)}
            </div>
            <div>
              <div className="text-xs font-bold text-[#E0B85C]">Hạng 1</div>
              <div className="text-base font-black text-white mt-0.5">{top1.totalScore} đ</div>
            </div>
          </div>
        ) : <div />}

        {/* Rank 3 (Right) */}
        {top3 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center space-y-2.5 shadow-sm">
            <div className="w-14 h-14 bg-purple-100 border border-purple-200 rounded-xl mx-auto flex items-center justify-center font-black text-purple-700 text-base">
              {getInitials(top3.name)}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500">Hạng 3</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">{top3.totalScore} đ</div>
            </div>
          </div>
        ) : <div />}
      </div>

      {/* FULL LEADERBOARD TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[11px]">
              <tr>
                <th className="p-3.5 w-12 text-center">#</th>
                <th className="p-3.5">Học sinh</th>
                <th className="p-3.5 text-center">Stamp</th>
                <th className="p-3.5 text-right">Điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboardData.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 text-center font-black text-slate-700 text-xs">
                    {idx + 1}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <AvatarCanvas avatarConfig={student.avatar_config} size={32} />
                      <span>{student.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-center font-bold text-slate-600">
                    {student.totalStamps}
                  </td>
                  <td className="p-3.5 text-right font-black text-slate-900 text-xs">
                    {student.totalScore}đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
