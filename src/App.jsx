import React, { useState, useEffect } from 'react';
import StudentLoginPage from './pages/StudentLoginPage';
import StudentRegisterPage from './pages/StudentRegisterPage';
import TeacherLoginPage from './pages/TeacherLoginPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import TeacherDashboard from './components/admin/TeacherDashboard';
import MustChangePasswordPage from './pages/MustChangePasswordPage';
import { getCurrentAuthUser, setCurrentAuthUser, getLiveStudent } from './services/api';
import { LogOut, ShieldCheck, UserCheck, ExternalLink } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [appPortal, setAppPortal] = useState('student'); // 'student' (vuadivuahoc) | 'admin' (admin.vuadivuahoc)
  const [studentAuthMode, setStudentAuthMode] = useState('login'); // 'login' | 'register'
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    // 1. Detect subdomain or path or hash for Admin vs Student Portal
    const host = window.location.hostname;
    const path = window.location.pathname;
    const hash = window.location.hash;

    if (host.startsWith('admin.') || path.startsWith('/admin') || hash === '#admin') {
      setAppPortal('admin');
    } else {
      setAppPortal('student');
    }

    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = getCurrentAuthUser();

    if (user && (user.role === 'teacher' || user.role === 'superadmin')) {
      setCurrentUser(user);
      setAppPortal('admin');
    } else if (user && user.role === 'student') {
      const liveStudent = await getLiveStudent(user.uid);
      if (!liveStudent) {
        // Student was deleted on Firestore -> auto logout to show clean Login/Register!
        setCurrentAuthUser(null);
        setCurrentUser(null);
        return;
      }
      setCurrentUser(user);
      if (liveStudent.must_change_password) {
        setMustChangePassword(true);
      } else {
        setMustChangePassword(false);
      }
    } else {
      setCurrentUser(null);
    }
  };

  const handleLoginSuccess = () => {
    checkAuth();
  };

  const handleLogout = () => {
    setCurrentAuthUser(null);
    setCurrentUser(null);
  };


  const switchPortal = (portal) => {
    setAppPortal(portal);
    if (portal === 'admin') {
      window.location.hash = '#admin';
    } else {
      window.location.hash = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* PORTAL 1: STUDENT WEB APP (vuadivuahoc) */}
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
          {!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'superadmin') ? (
            <div className="app-container min-h-screen flex items-center justify-center p-4">
              <TeacherLoginPage onLoginSuccess={handleLoginSuccess} />
            </div>
          ) : (
            <div className="app-container p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6 max-w-5xl mx-auto">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm ${
                    currentUser.role === 'superadmin' 
                      ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                      : 'bg-purple-100 text-purple-900 border border-purple-300'
                  }`}>
                    <ShieldCheck className={`w-4 h-4 ${currentUser.role === 'superadmin' ? 'text-amber-700' : 'text-purple-700'}`} />
                    {currentUser.role === 'superadmin' 
                      ? '👑 CỔNG QUẢN TRỊ SUPER ADMIN' 
                      : 'CỔNG QUẢN TRỊ ADMIN (admin.vuadivuahoc)'}
                  </span>
                  <span className="text-xs font-extrabold text-slate-500 hidden sm:inline">
                    | Phiên đăng nhập: {currentUser.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold border border-rose-200 text-xs py-1.5 px-3 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Đăng Xuất
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
