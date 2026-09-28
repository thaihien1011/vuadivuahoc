import React, { useState } from 'react';
import { LogIn, User, Lock, Sparkles, Shield, Compass, BookOpen, Eye, EyeOff } from 'lucide-react';
import { setCurrentAuthUser, loginStudentAsync, loginTeacherAsync } from '../services/api';
import { removeVietnameseTones } from '../utils/textUtils';

export default function LoginPage({ onLoginSuccess }) {
  const [role, setRole] = useState('student'); // 'student' | 'teacher'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (role === 'student') {
      try {
        await loginStudentAsync(username, password);
        onLoginSuccess('student');
      } catch (err) {
        setErrorMsg(err.message || 'Lỗi đăng nhập học sinh');
      }
    } else {
      try {
        const user = await loginTeacherAsync(username, password);
        onLoginSuccess(user.role || 'teacher');
      } catch (err) {
        setErrorMsg(err.message || 'Lỗi đăng nhập giáo viên');
      }
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
          <div className="w-16 h-16 rounded-3xl border-b-4 border-emerald-700 overflow-hidden mx-auto shadow-md animate-duo-bounce bg-emerald-500 p-1">
            <img src="/assets/logo_default.png" alt="Logo Raccoon" className="w-full h-full object-cover rounded-2xl" />
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
                onChange={e => setUsername(removeVietnameseTones(e.target.value).toLowerCase())}
                placeholder="VD: nguyentramy"
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(removeVietnameseTones(e.target.value))}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl py-3 pl-10 pr-10 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                title={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" className="w-full btn-duo-green py-3.5 text-base">
            <LogIn className="w-5 h-5" />
            ĐĂNG NHẬP NGAY
          </button>
        </form>
      </div>
    </div>
  );
}
