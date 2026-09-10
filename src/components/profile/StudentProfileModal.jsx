import React, { useState, useEffect } from 'react';
import { User, Star, Award, BookOpen, X, LogOut, CheckCircle2, Palette } from 'lucide-react';
import AvatarCanvas from '../avatar/AvatarCanvas';
import { THEMES, getCurrentTheme, applyTheme } from '../../services/theme';

export default function StudentProfileModal({ studentData, onClose, onLogout }) {
  const [activeTheme, setActiveTheme] = useState(getCurrentTheme());

  useEffect(() => {
    const handleThemeChange = () => {
      setActiveTheme(getCurrentTheme());
    };
    window.addEventListener('vdvh_theme_changed', handleThemeChange);
    return () => window.removeEventListener('vdvh_theme_changed', handleThemeChange);
  }, []);

  const handleSelectTheme = (themeId) => {
    applyTheme(themeId);
    setActiveTheme(themeId);
  };

  const lockedScores = JSON.parse(localStorage.getItem('vdvh_locked_scores') || '[]')
    .filter(ls => ls.student_id === studentData?.id);

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="duo-card max-w-lg w-full p-6 text-center space-y-5 animate-duo-bounce shadow-2xl relative border-b-8 border-b-sky-600 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        <div className="pt-2">
          <AvatarCanvas avatarConfig={studentData?.avatar_config} size={100} className="mx-auto mb-2" />
          <h3 className="text-xl font-black text-slate-800">{studentData?.name || 'Nguyễn Văn A'}</h3>
          <span className="badge bg-sky-100 text-sky-800 border border-sky-300 font-extrabold text-xs">
            Lớp 8A1 • Trường THCS Trần Phú
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500 mx-auto mb-1" />
            <div className="text-lg font-black text-amber-700">{studentData?.current_star || 0}</div>
            <div className="text-[10px] font-bold text-amber-800 uppercase">TỔNG SỐ STAR 🌟</div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
            <Award className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <div className="text-lg font-black text-emerald-700">{lockedScores.length}</div>
            <div className="text-[10px] font-bold text-emerald-800 uppercase">STAMP ĐÃ ĐẠT 🏅</div>
          </div>
        </div>

        {/* THEME SELECTION MENU */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-3">
          <div className="flex items-center gap-2 font-extrabold text-xs text-slate-800">
            <Palette className="w-4 h-4 text-purple-600" />
            <span>Chọn Giao Diện Theme:</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {THEMES.map((theme) => {
              const isSelected = activeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50 text-slate-900 font-extrabold'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1">
                      <div className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: theme.primaryColor }} />
                      <div className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: theme.accentColor }} />
                    </div>
                    <span className="text-xs font-bold">{theme.name}</span>
                  </div>

                  {isSelected ? (
                    <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Đang dùng
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold">Chọn</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onLogout} className="btn-duo-outline flex-1 text-rose-600 border-rose-200 text-xs">
            <LogOut className="w-4 h-4" />
            ĐĂNG XUẤT
          </button>
          <button onClick={onClose} className="btn-duo-green flex-1 text-xs">
            ĐÓNG
          </button>
        </div>
      </div>
    </div>
  );
}
