import React, { useState } from 'react';
import { Lock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { changeStudentPassword } from '../services/api';

export default function MustChangePasswordPage({ onPasswordChanged }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      await changeStudentPassword(newPassword);
      alert('Đổi mật khẩu thành công! Chào mừng bạn đến với Vừa Đi Vừa Học!');
      onPasswordChanged();
    } catch (err) {
      setError(err.message || 'Lỗi đổi mật khẩu');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="glass-panel-gold max-w-md w-full p-8 border-2 border-amber-400 space-y-6 animate-stamp shadow-2xl">
        <div className="text-center space-y-2">
          <ShieldAlert className="w-14 h-14 text-amber-400 mx-auto animate-bounce" />
          <h2 className="text-2xl font-black text-amber-300">Yêu Cầu Đổi Mật Khẩu Lần Đầu</h2>
          <p className="text-xs text-slate-300">
            Tài khoản của bạn vừa được đặt lại mật khẩu tạm thời. Để bảo mật, vui lòng tạo mật khẩu mới ngay trước khi tiếp tục.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/20 border border-rose-400 text-rose-300 text-xs rounded-lg text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 mb-1 block">Mật khẩu mới (tối thiểu 6 ký tự):</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-slate-900 border border-white/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 mb-1 block">Xác nhận mật khẩu mới:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-900 border border-white/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full btn-gold py-3 justify-center text-base font-black">
            <CheckCircle2 className="w-5 h-5" />
            Xác Nhận & Bắt Đầu Học
          </button>
        </form>
      </div>
    </div>
  );
}
