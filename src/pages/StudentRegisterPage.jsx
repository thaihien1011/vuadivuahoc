import React, { useState } from 'react';
import { UserPlus, User, Lock, Compass, GraduationCap, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { registerStudentAsync } from '../services/api';
import { useActiveTheme } from '../services/theme';
import { removeVietnameseTones } from '../utils/textUtils';

export default function StudentRegisterPage({ onRegisterSuccess, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [className, setClassName] = useState('Không liên kết');
  const [gender, setGender] = useState('female'); // 'female' (girl - body_female) | 'male' (boy - base)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { logoUrl } = useActiveTheme();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không trùng khớp.');
      return;
    }

    setLoading(true);
    try {
      await registerStudentAsync({
        name,
        username,
        class: className,
        gender
      });
      onRegisterSuccess('student');
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi đăng ký học sinh');
    } finally {
      setLoading(false);
    }
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
              placeholder="VD: Nguyễn Văn A"
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
              onChange={e => setUsername(removeVietnameseTones(e.target.value).toLowerCase())}
              placeholder="VD: nguyenvana"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 font-extrabold focus:outline-none focus:border-sky-500 font-mono"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-700 mb-1 block">
            Lớp
          </label>
          <div className="relative">
            <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 z-10" />
            <select
              value={className}
              onChange={e => setClassName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 font-extrabold focus:outline-none focus:border-sky-500 appearance-none cursor-pointer"
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
              className={`p-2 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                gender === 'male'
                  ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>👦 Nam (Boy)</span>
            </button>

            <button
              type="button"
              onClick={() => setGender('female')}
              className={`p-2 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                gender === 'female'
                  ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>👧 Nữ (Girl)</span>
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-700 mb-1 block">Mật khẩu</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(removeVietnameseTones(e.target.value))}
              placeholder="Mật khẩu..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-9 text-xs text-slate-900 font-extrabold focus:outline-none focus:border-sky-500 font-mono"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              title={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-700 mb-1 block">Nhập lại mật khẩu</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(removeVietnameseTones(e.target.value))}
              placeholder="Xác nhận mật khẩu..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-9 text-xs text-slate-900 font-extrabold focus:outline-none focus:border-sky-500 font-mono"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
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
