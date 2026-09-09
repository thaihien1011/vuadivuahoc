import React, { useState } from 'react';
import { LogIn, User, Lock, Sparkles, Shield, Compass, BookOpen } from 'lucide-react';
import { setCurrentAuthUser } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [role, setRole] = useState('student'); // 'student' | 'teacher'
  const [username, setUsername] = useState('nguyentramy');
  const [password, setPassword] = useState('123456');

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'student') {
      const students = JSON.parse(localStorage.getItem('vdvh_students') || '[]');
      const student = students.find(s => s.username === username || s.id === username);
      if (!student) {
        alert('Tài khoản học sinh không tồn tại! Vui lòng sử dụng các tài khoản mẫu bên dưới.');
        return;
      }

      setCurrentAuthUser({
        uid: student.id,
        role: 'student',
        username: student.username,
        name: student.name
      });
      onLoginSuccess('student');
    } else {
      setCurrentAuthUser({
        uid: 'teacher_001',
        role: 'teacher',
        username: 'gv_nguyenvana',
        name: 'Cô Nguyễn Thị Hoa'
      });
      onLoginSuccess('teacher');
    }
  };

  const handleQuickStudentLogin = (stId, stName, stUsername) => {
    setCurrentAuthUser({
      uid: stId,
      role: 'student',
      username: stUsername,
      name: stName
    });
    onLoginSuccess('student');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="duo-card max-w-md w-full p-8 space-y-6 border-b-8 border-b-emerald-600 shadow-2xl">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-500 rounded-3xl border-b-4 border-emerald-700 flex items-center justify-center mx-auto shadow-md animate-duo-bounce">
            <Compass className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Vừa Đi Vừa Học
          </h1>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Gamification Sử - Địa THCS
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
          <button
            type="button"
            onClick={() => { setRole('student'); setUsername('nguyentramy'); }}
            className={`py-2.5 text-xs font-black rounded-xl transition-all ${
              role === 'student'
                ? 'bg-emerald-500 text-white shadow-sm border-b-2 border-emerald-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            HỌC SINH
          </button>

          <button
            type="button"
            onClick={() => { setRole('teacher'); setUsername('hoa.nguyen'); }}
            className={`py-2.5 text-xs font-black rounded-xl transition-all ${
              role === 'teacher'
                ? 'bg-purple-500 text-white shadow-sm border-b-2 border-purple-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            GIÁO VIÊN
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              {role === 'student' ? 'Tên đăng nhập Học sinh:' : 'Email / Tài khoản Giáo viên:'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">Mật khẩu:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full btn-duo-green py-3.5 text-base">
            <LogIn className="w-5 h-5" />
            ĐĂNG NHẬP NGAY
          </button>
        </form>

        {/* Quick Demo Launchers */}
        <div className="pt-4 border-t border-gray-200 space-y-2">
          <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider text-center">
            ⚡ Đăng Nhập Nhanh Trải Nghiệm Demo:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickStudentLogin('st_hs001', 'Nguyễn Trà My', 'nguyentramy')}
              className="p-3 bg-sky-50 border-2 border-sky-200 rounded-2xl text-left hover:bg-sky-100 transition-colors"
            >
              <div className="text-xs font-black text-sky-800">Nguyễn Trà My</div>
              <div className="text-[10px] text-slate-500 font-bold">Lớp 8A1 (15 Stars)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickStudentLogin('st_hs002', 'Trần Nam', 'trannam8a1')}
              className="p-3 bg-sky-50 border-2 border-sky-200 rounded-2xl text-left hover:bg-sky-100 transition-colors"
            >
              <div className="text-xs font-black text-sky-800">Trần Nam</div>
              <div className="text-[10px] text-slate-500 font-bold">Lớp 8A1 (8 Stars)</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
