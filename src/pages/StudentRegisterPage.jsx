import React, { useState } from 'react';
import { UserPlus, User, Lock, Compass, GraduationCap, CheckCircle2, ArrowLeft } from 'lucide-react';
import { setCurrentAuthUser } from '../services/api';
import { useActiveTheme } from '../services/theme';

export default function StudentRegisterPage({ onRegisterSuccess, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [className, setClassName] = useState('Lớp 8A1');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { logoUrl } = useActiveTheme();

  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không trùng khớp.');
      return;
    }

    const students = JSON.parse(localStorage.getItem('vdvh_students') || '[]');
    const existing = students.find(s => s.username === username);
    if (existing) {
      setErrorMsg('Tên đăng nhập này đã được sử dụng.');
      return;
    }

    const newStudent = {
      id: `st_${Date.now()}`,
      name: name.trim(),
      username: username.trim().toLowerCase(),
      class: className.trim(),
      current_star: 0,
      must_change_password: false,
      avatar_config: {
        hair: 'hair_style_1',
        top: 'top_casual_blue',
        bottom_or_skirt: 'bottom_pants_jeans',
        footwear: 'shoes_sneakers_white'
      }
    };

    students.push(newStudent);
    localStorage.setItem('vdvh_students', JSON.stringify(students));

    setCurrentAuthUser({
      uid: newStudent.id,
      role: 'student',
      username: newStudent.username,
      name: newStudent.name
    });

    onRegisterSuccess('student');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-sm">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto shadow-md border-2 border-sky-400/30 bg-sky-50 p-0.5">
          <img 
            src={logoUrl} 
            alt="Logo Raccoon" 
            className="w-full h-full object-cover rounded-xl transition-opacity duration-300"
          />
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          Đăng ký học sinh
        </h1>
        <p className="text-xs font-extrabold text-sky-500 uppercase tracking-wider">
          Lịch sử & Địa Lý
        </p>
      </div>

      {errorMsg && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-xs rounded-xl text-center">
          {errorMsg}
        </div>
      )}

      {/* Student Register Form */}
      <form onSubmit={handleRegister} className="space-y-3">
        <div>
          <label className="text-xs font-extrabold text-slate-700 mb-1 block">
            Họ và tên
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Nguyễn Trà My"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 font-extrabold focus:outline-none focus:border-sky-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-700 mb-1 block">
            Tên đăng nhập
          </label>
          <div className="relative">
            <Compass className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="VD: nguyentramy"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 font-extrabold focus:outline-none focus:border-sky-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-700 mb-1 block">
            Lớp
          </label>
          <div className="relative">
            <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={className}
              onChange={e => setClassName(e.target.value)}
              placeholder="VD: Lớp 8A1"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 font-extrabold focus:outline-none focus:border-sky-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-700 mb-1 block">Mật khẩu</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mật khẩu..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 font-extrabold focus:outline-none focus:border-sky-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-700 mb-1 block">Nhập lại mật khẩu</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 font-extrabold focus:outline-none focus:border-sky-500"
              required
            />
          </div>
        </div>

        <button type="submit" className="w-full btn-duo-blue py-2.5 text-xs font-bold gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Đăng ký
        </button>
      </form>

      {/* Switch back to Login */}
      <div className="pt-3 border-t border-slate-200 text-center flex items-center justify-center gap-2.5 text-xs">
        <ArrowLeft className="w-4 h-4 text-sky-600 shrink-0" />
        <span className="font-extrabold text-slate-600">Đã có tài khoản?</span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-black text-sky-600 hover:text-sky-700 underline transition-colors px-1 py-0.5"
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}
