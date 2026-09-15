import React, { useState } from 'react';
import { LogIn, User, Lock, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginTeacherAsync } from '../services/api';
import { removeVietnameseTones } from '../utils/textUtils';

export default function TeacherLoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const user = await loginTeacherAsync(email, password);
      onLoginSuccess(user.role);
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi đăng nhập giáo viên');
    } finally {
      setLoading(false);
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
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <LogIn className="w-4 h-4" />
          {loading ? 'Đang xác thực...' : 'Đăng nhập Admin'}
        </button>
      </form>
    </div>
  );
}
