import React, { useState, useEffect } from 'react';
import { User, Star, Award, CheckCircle2, Save, GraduationCap, Palette, LogOut } from 'lucide-react';
import AvatarCanvas from '../components/avatar/AvatarCanvas';
import { THEMES, getCurrentTheme, applyTheme } from '../services/theme';
import { syncStudentToFirestore } from '../services/api';

export default function StudentProfilePage({ studentData, onUpdateStudent, onLogout }) {
  const [name, setName] = useState(studentData?.name || 'Nguyễn Trà My');
  const [className, setClassName] = useState(studentData?.class || 'Lớp 8/8');
  const [gender, setGender] = useState(studentData?.gender || 'female');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
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

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaveSuccessMsg('');

    const students = JSON.parse(localStorage.getItem('vdvh_students') || '[]');
    const studentIdx = students.findIndex(s => s.id === studentData?.id);

    const bodyType = gender === 'female' ? 'body_female' : 'base';

    let updatedStudentObj = null;
    if (studentIdx !== -1) {
      students[studentIdx].name = name.trim();
      students[studentIdx].class = className.trim();
      students[studentIdx].gender = gender;
      students[studentIdx].body = bodyType;
      updatedStudentObj = students[studentIdx];
      localStorage.setItem('vdvh_students', JSON.stringify(students));
    } else {
      updatedStudentObj = {
        id: studentData?.id || 'st_ntm001',
        name: name.trim(),
        username: studentData?.username || 'nguyentramy',
        class: className.trim(),
        gender: gender,
        body: bodyType,
        current_star: studentData?.current_star || 0,
        avatar_config: studentData?.avatar_config || {}
      };
    }

    const currentAuth = JSON.parse(localStorage.getItem('vdvh_current_auth_user') || '{}');
    if (currentAuth.uid === (studentData?.id || 'st_ntm001')) {
      currentAuth.name = name.trim();
      currentAuth.gender = gender;
      currentAuth.body = bodyType;
      localStorage.setItem('vdvh_current_auth_user', JSON.stringify(currentAuth));
    }

    syncStudentToFirestore(updatedStudentObj);

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudentObj);
    }

    setSaveSuccessMsg('Đã cập nhật thông tin thành công!');
    setTimeout(() => {
      setSaveSuccessMsg('');
    }, 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      {/* HEADER TITLE */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Hồ sơ học sinh</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-black text-sm text-slate-900 leading-tight">
              {studentData?.name || name || 'Nguyễn Văn A'}
            </div>
            <span className="badge theme-profile-badge font-mono font-bold text-[11px] px-2.5 py-0.5 mt-0.5 inline-block">
              ID: {studentData?.id || 'st_hs001'}
            </span>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title="Đăng xuất tài khoản"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Đăng xuất</span>
            </button>
          )}
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 font-extrabold text-xs flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#58cc02]" />
          {saveSuccessMsg}
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
          <div className="text-xl font-black text-amber-600 mb-0.5">⭐ {studentData?.current_star || 0}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
          <div className="text-xl font-black text-[#58cc02] mb-0.5">🏅 {lockedScores.length} Stamp</div>
        </div>
      </div>

      {/* THEME SELECTION SECTION */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Giao Diện & Theme App</h3>
            <p className="text-xs text-slate-500 font-bold">Chọn phong cách màu sắc ứng dụng bạn yêu thích</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {THEMES.map((theme) => {
            const isSelected = activeTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelectTheme(theme.id)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${theme.previewBadge}`}>
                    THEME
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-black bg-purple-600 text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Đang dùng
                    </span>
                  )}
                </div>

                <div>
                  <div className="font-extrabold text-xs text-slate-900">{theme.name}</div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: theme.primaryColor }} />
                  <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: theme.accentColor }} />
                  <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: theme.bgColor }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* EDIT PROFILE FORM */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-200">
          <AvatarCanvas avatarConfig={studentData?.avatar_config} size={64} className="shrink-0" />
          <div>
            <h3 className="text-base font-extrabold text-slate-900">{studentData?.name || 'Nguyễn Văn A'}</h3>
            <p className="text-xs font-bold text-slate-500">{studentData?.class || 'Lớp 8A1'} • Trường THCS Trần Phú</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="text-xs font-extrabold text-slate-700 mb-1 block">
              Họ và tên
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nhập họ và tên..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 font-extrabold focus:outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 mb-1 block">
              Lớp
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 z-10" />
              <select
                value={className}
                onChange={e => setClassName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 font-extrabold focus:outline-none focus:border-sky-500 appearance-none cursor-pointer"
              >
                <option value="Lớp 8/8">Lớp 8/8</option>
                <option value="Không liên kết">Không liên kết</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 mb-1 block">
              Giới tính & Nhân vật (Body)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                  gender === 'male'
                    ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>👦 Nam (Body Base)</span>
              </button>

              <button
                type="button"
                onClick={() => setGender('female')}
                className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                  gender === 'female'
                    ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>👧 Nữ (Body Female)</span>
              </button>
            </div>
          </div>

          <div className="pt-1">
            <button type="submit" className="w-full btn-duo-blue py-2.5 text-xs font-bold gap-2">
              <Save className="w-4 h-4" />
              Lưu
            </button>
          </div>
        </form>
      </div>

      {/* DEDICATED LOGOUT SECTION */}
      {onLogout && (
        <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Tài Khoản & Đăng Xuất</h3>
              <p className="text-xs text-slate-500 font-bold">Thoát khỏi phiên làm việc hiện tại trên thiết bị này</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
