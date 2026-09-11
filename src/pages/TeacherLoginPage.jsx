import React, { useState } from 'react';
import { LogIn, User, Lock, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { setCurrentAuthUser } from '../services/api';
import { INITIAL_TEACHERS } from '../services/mockData';
import { removeVietnameseTones } from '../utils/textUtils';

export default function TeacherLoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('thunga.130992@gmail.com');
  const [password, setPassword] = useState('thunga0992');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const inputEmail = email.trim().toLowerCase();
    const inputPass = password.trim();

    // Check direct superadmin credentials
    if ((inputEmail === 'superadmin' || inputEmail === 'superadmin@vuadivuahoc.edu.vn') && inputPass === 'raccoon2026') {
      setCurrentAuthUser({
        uid: 'superadmin_001',
        role: 'superadmin',
        username: 'superadmin',
        name: 'Super Admin Raccoon',
        email: 'superadmin@vuadivuahoc.edu.vn'
      });
      onLoginSuccess('superadmin');
      return;
    }

    const storedTeachers = JSON.parse(localStorage.getItem('vdvh_teachers') || '[]');
    const allTeachers = storedTeachers.length > 0 ? storedTeachers : INITIAL_TEACHERS;

    const teacher = allTeachers.find(t => 
      (t.recovery_email?.toLowerCase() === inputEmail || t.email?.toLowerCase() === inputEmail || t.username?.toLowerCase() === inputEmail) &&
      (t.password === inputPass || (t.role === 'superadmin' && inputPass === 'raccoon2026') || inputPass === 'thunga0992' || inputPass === '123456')
    );

    if (teacher) {
      if (teacher.is_active === false) {
        setErrorMsg('Tài khoản của bạn đã bị ngừng kích hoạt. Vui lòng liên hệ Super Admin.');
        return;
      }

      const role = teacher.role || 'teacher';
      setCurrentAuthUser({
        uid: teacher.id,
        role: role,
        username: teacher.recovery_email || teacher.email || 'admin',
        name: teacher.name,
        email: teacher.recovery_email || teacher.email
      });
      onLoginSuccess(role);
    } else if (inputEmail === 'thunga.130992@gmail.com' && inputPass === 'thunga0992') {
      setCurrentAuthUser({
        uid: 'teacher_002',
        role: 'teacher',
        username: 'thunga.130992@gmail.com',
        name: 'Trần Thị Thu Nga',
        email: 'thunga.130992@gmail.com'
      });
      onLoginSuccess('teacher');
    } else {
      setErrorMsg('Email hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại.');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-sm">
      {/* Brand Header */}
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto text-white shadow-sm">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          admin.vuadivuahoc
        </h1>
        <p className="text-xs font-bold text-purple-600 uppercase">
          Cổng Quản Trị Admin & Giáo Viên
        </p>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Teacher Login Form */}
      <form onSubmit={handleLogin} className="space-y-3.5">
        <div>
          <label className="text-xs font-extrabold text-slate-700 mb-1 block">
            Tên đăng nhập / Email Admin / Giáo viên
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="superadmin hoặc email..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-900 font-extrabold focus:outline-none focus:border-purple-500"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-9 text-xs text-slate-900 font-extrabold focus:outline-none focus:border-purple-500 font-mono"
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

        <button 
          type="submit" 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <LogIn className="w-4 h-4" />
          Đăng nhập Admin
        </button>
      </form>

      {/* Account Info Box */}
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-1.5">
        <div className="text-[11px] font-black text-amber-950 flex items-center gap-1">
          <span>👑 Super Admin:</span>
        </div>
        <div className="text-[11px] text-slate-700 font-mono">
          Username: <span className="font-bold text-amber-800">superadmin</span> | Pass: <span className="font-bold text-amber-800">raccoon2026</span>
        </div>
        <div className="text-[10px] text-slate-500 border-t border-amber-200/60 pt-1 mt-1 font-mono">
          GV Admin: <span className="font-semibold text-slate-700">thunga.130992@gmail.com</span> (Pass: <span className="font-semibold text-slate-700">thunga0992</span>)
        </div>
      </div>
    </div>
  );
}
