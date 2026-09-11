import React, { useState } from 'react';
import { LogIn, User, Lock, Compass, UserPlus, Eye, EyeOff } from 'lucide-react';
import { setCurrentAuthUser } from '../services/api';
import { useActiveTheme } from '../services/theme';
import { removeVietnameseTones } from '../utils/textUtils';

export default function StudentLoginPage({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { logoUrl } = useActiveTheme();

  const handleLogin = (e) => {
    e.preventDefault();
    const students = JSON.parse(localStorage.getItem('vdvh_students') || '[]');
    const student = students.find(s => s.username === username || s.id === username);
    
    if (!student) {
      alert('Tài khoản học sinh không tồn tại. Vui lòng kiểm tra lại hoặc Đăng ký.');
      return;
    }

    if (student.is_active === false) {
      alert('Tài khoản của bạn đã bị ngừng kích hoạt. Vui lòng liên hệ quản trị viên.');
      return;
    }

    setCurrentAuthUser({
      uid: student.id,
      role: 'student',
      username: student.username,
      name: student.name
    });
    onLoginSuccess('student');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-sm">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        {/* Raccoon Logo (50% larger size: 80x80px) */}
        <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto shadow-md border-2 border-[#58cc02]/30 bg-[#58cc02]/10 transition-transform hover:scale-105 p-0.5">
          <img 
            src={logoUrl} 
            alt="Logo Vừa Đi Vừa Học - Raccoon Thám Hiểm" 
            className="w-full h-full object-cover rounded-xl transition-opacity duration-300"
          />
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          Vừa Đi Vừa Học
        </h1>
        <p className="text-xs font-extrabold text-[#58cc02] uppercase tracking-wider">
          Lịch sử & Địa Lý
        </p>
      </div>

      {/* Student Login Form */}
      <form onSubmit={handleLogin} className="space-y-3.5">
        <div>
          <label className="text-xs font-extrabold text-slate-700 mb-1 block">
            Tên đăng nhập
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={username}
              onChange={e => setUsername(removeVietnameseTones(e.target.value).toLowerCase())}
              placeholder="VD: nguyenvana"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-900 font-extrabold focus:outline-none focus:border-[#58cc02] font-mono"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-700 mb-1 block">Mật khẩu</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(removeVietnameseTones(e.target.value))}
              placeholder="Nhập mật khẩu..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-9 text-xs text-slate-900 font-extrabold focus:outline-none focus:border-[#58cc02] font-mono"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              title={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" className="w-full btn-duo-green py-2.5 text-xs font-bold gap-2">
          <LogIn className="w-4 h-4" />
          Đăng nhập
        </button>
      </form>

      {/* Switch to Register link - Unlink "Chưa có tài khoản?" & Add distinct spacing */}
      <div className="pt-4 border-t border-slate-200 text-center flex items-center justify-center gap-2.5 text-xs">
        <UserPlus className="w-4 h-4 text-[#58cc02] shrink-0" />
        <span className="font-extrabold text-slate-600">Chưa có tài khoản?</span>
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-black text-[#58cc02] hover:text-[#46a302] underline transition-colors px-1 py-0.5"
        >
          Đăng ký
        </button>
      </div>
    </div>
  );
}
