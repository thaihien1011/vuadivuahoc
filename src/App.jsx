import React, { useState, useEffect } from 'react';
import StudentLoginPage from './pages/StudentLoginPage';
import StudentRegisterPage from './pages/StudentRegisterPage';
import TeacherLoginPage from './pages/TeacherLoginPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import TeacherDashboard from './components/admin/TeacherDashboard';
import MustChangePasswordPage from './pages/MustChangePasswordPage';
import { getCurrentAuthUser, setCurrentAuthUser } from './services/api';
import { LogOut } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [appPortal, setAppPortal] = useState('student'); // 'student' (vuadivuahoc) | 'admin' (admin.vuadivuahoc)
  const [studentAuthMode, setStudentAuthMode] = useState('login'); // 'login' | 'register'
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    // Separate portals based on domain / path / hash
    if (window.location.hash === '#admin' || window.location.pathname.startsWith('/admin') || window.location.hostname.startsWith('admin')) {
      setAppPortal('admin');
    }
    checkAuth();
  }, []);

  const checkAuth = () => {
    const user = getCurrentAuthUser();
    setCurrentUser(user);

    if (user && user.role === 'student') {
      const students = JSON.parse(localStorage.getItem('vdvh_students') || '[]');
      const st = students.find(s => s.id === user.uid);
      if (st && st.must_change_password) {
        setMustChangePassword(true);
      } else {
        setMustChangePassword(false);
      }
    }
  };

  const handleLoginSuccess = () => {
    checkAuth();
  };

  const handleLogout = () => {
    setCurrentAuthUser(null);
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* PORTAL 1: STUDENT WEB APP (vuadivuahoc) - 100% CLEAN NO TOP DEMO BAR */}
      {appPortal === 'student' && (
        <>
          {!currentUser || currentUser.role !== 'student' ? (
            <div className="app-container min-h-screen flex items-center justify-center p-4">
              {studentAuthMode === 'login' ? (
                <StudentLoginPage
                  onLoginSuccess={handleLoginSuccess}
                  onSwitchToRegister={() => setStudentAuthMode('register')}
                />
              ) : (
                <StudentRegisterPage
                  onRegisterSuccess={handleLoginSuccess}
                  onSwitchToLogin={() => setStudentAuthMode('login')}
                />
              )}
            </div>
          ) : mustChangePassword ? (
            <div className="app-container">
              <MustChangePasswordPage onPasswordChanged={checkAuth} />
            </div>
          ) : (
            <StudentDashboardPage onLogout={handleLogout} />
          )}
        </>
      )}

      {/* PORTAL 2: TEACHER ADMIN WEB APP (admin.vuadivuahoc) */}
      {appPortal === 'admin' && (
        <>
          {!currentUser || currentUser.role !== 'teacher' ? (
            <div className="app-container min-h-screen flex items-center justify-center p-4">
              <TeacherLoginPage onLoginSuccess={handleLoginSuccess} />
            </div>
          ) : (
            <div className="app-container p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="badge bg-purple-100 text-purple-800 border border-purple-300 text-xs font-bold">
                  admin.vuadivuahoc — Phiên làm việc Giáo viên: {currentUser.name}
                </span>
                <button onClick={handleLogout} className="btn-duo-outline text-xs py-2 px-3">
                  <LogOut className="w-4 h-4" /> Đăng Xuất Giáo Viên
                </button>
              </div>
              <TeacherDashboard />
            </div>
          )}
        </>
      )}
    </div>
  );
}
