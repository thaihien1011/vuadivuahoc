import React, { useState, useEffect } from 'react';
import { 
  Users, Key, RefreshCw, CheckCircle2, AlertCircle, FileSpreadsheet, 
  Search, ShieldCheck, Lock, X, MapPin, Target
} from 'lucide-react';
import { adminResetPassword, syncQuestions, importExcelArrayBuffer } from '../../services/api';
import InteractiveMap from '../map/InteractiveMap';
import { INITIAL_LESSONS } from '../../services/mockData';

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'sync' | 'map'
  const [students, setStudents] = useState([]);
  const [resetModalData, setResetModalData] = useState(null);
  const [sheetId, setSheetId] = useState('1ntVNq7XVoVsSlQ0Mp_itoTTCt_VQxGQY');
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const list = JSON.parse(localStorage.getItem('vdvh_students') || '[]');
    setStudents(list);
  };

  const handleResetPass = async (studentId, studentName) => {
    try {
      const res = await adminResetPassword(studentId);
      setResetModalData({
        name: studentName,
        temp_password: res.temp_password,
        must_change_password: res.must_change_password
      });
      loadData();
    } catch (err) {
      alert('Lỗi reset mật khẩu: ' + err.message);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSyncing(true);
      setSyncStatus(null);
      const buffer = await file.arrayBuffer();
      const res = await importExcelArrayBuffer(buffer);
      setSyncStatus(res);
    } catch (err) {
      setSyncStatus({ success: false, error: err.message });
    } finally {
      setSyncing(false);
      e.target.value = '';
    }
  };

  const handleSyncSheet = async () => {
    try {
      setSyncing(true);
      setSyncStatus(null);
      const res = await syncQuestions(sheetId);
      setSyncStatus(res);
    } catch (err) {
      setSyncStatus({ success: false, error: err.message });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* BRAND HEADER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Cổng quản trị giáo viên</h1>
            <p className="text-xs font-bold text-purple-600 uppercase">admin.vuadivuahoc</p>
          </div>
        </div>
      </div>

      {/* MINIMALIST TEXT SUB-TABS (WITH UNDERLINE HIGHLIGHT) */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-8 shadow-sm rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('students')}
          className={`text-xs font-black uppercase tracking-wider pb-1 transition-all shrink-0 ${
            activeTab === 'students'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-400 hover:text-slate-700 border-b-2 border-transparent'
          }`}
        >
          Lớp học ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`text-xs font-black uppercase tracking-wider pb-1 transition-all shrink-0 ${
            activeTab === 'sync'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-400 hover:text-slate-700 border-b-2 border-transparent'
          }`}
        >
          Đồng bộ Google Sheet
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`text-xs font-black uppercase tracking-wider pb-1 transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'map'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-400 hover:text-slate-700 border-b-2 border-transparent'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          Hiệu chỉnh tọa độ bản đồ
        </button>
      </div>

      {/* TAB 1: DANH SÁCH HỌC SINH */}
      {activeTab === 'students' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-extrabold text-slate-900">Danh sách học sinh</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-900 font-extrabold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Học sinh</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Lớp</th>
                  <th className="p-3">Stars</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-extrabold text-slate-900">{st.name}</td>
                    <td className="p-3 font-mono text-slate-600">{st.username}</td>
                    <td className="p-3 font-bold text-slate-600">{st.class || 'Lớp 8A1'}</td>
                    <td className="p-3 font-extrabold text-amber-600">⭐ {st.current_star || 0}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleResetPass(st.id, st.name)}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold px-3 py-1.5 rounded-lg border border-purple-200 text-xs inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Key className="w-3.5 h-3.5" />
                        Reset mật khẩu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ĐỒNG BỘ NẠP FILE EXCEL & GOOGLE SHEET */}
      {activeTab === 'sync' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          {/* UPLOAD FILE EXCEL THỰC TẾ */}
          <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Nạp dữ liệu trực tiếp từ File Excel (.xlsx / .csv)</h3>
                <p className="text-xs text-slate-500">Tải lên file `google_sheet_template_updated.xlsx` để nạp 65 bài học & ngân hàng câu hỏi mới nhất</p>
              </div>
            </div>

            <div className="pt-2">
              <label className="cursor-pointer inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold px-5 py-3 rounded-xl text-xs shadow-md hover:shadow-lg transition-all">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Chọn File Excel Từ Máy Tính</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* GOOGLE SHEET ONLINE SYNC */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Đồng bộ trực tuyến từ Google Sheet</h3>
                <p className="text-xs text-slate-500">Nhập ID file Google Sheet để cập nhật tự động từ xa</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 block">Google Sheet ID:</label>
              <input
                type="text"
                value={sheetId}
                onChange={e => setSheetId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={handleSyncSheet}
              disabled={syncing}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Đang đồng bộ...' : 'Đồng bộ từ Google Sheet'}
            </button>
          </div>

          {syncStatus && (
            <div className={`p-4 rounded-xl border text-xs space-y-1 ${
              syncStatus.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="font-extrabold">
                {syncStatus.success ? '🎉 NẠP DỮ LIỆU THÀNH CÔNG!' : '❌ LỖI ĐỒNG BỘ'}
              </div>
              <div>{syncStatus.message || syncStatus.error}</div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HIỆU CHỈNH TỌA ĐỘ BẢN ĐỒ */}
      {activeTab === 'map' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Công cụ hiệu chỉnh tọa độ bản đồ Việt Nam</h3>
              <p className="text-xs text-slate-500 mt-0.5">Bật Chế Độ Chấm Tọa Độ để căn chỉnh ghim, sao chép hoặc xuất dữ liệu JSON 65 địa điểm</p>
            </div>
          </div>

          <div className="h-[750px] overflow-hidden rounded-xl border border-slate-200">
            <InteractiveMap 
              lessons={INITIAL_LESSONS} 
              lockedScores={[]} 
              onSelectLesson={(lessonId) => console.log('Admin selected lesson:', lessonId)}
              isAdminMode={true}
            />
          </div>
        </div>
      )}

      {/* 1-TIME DISPLAY RESET PASSWORD MODAL */}
      {resetModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-5 border border-slate-200 shadow-2xl relative">
            <button 
              onClick={() => setResetModalData(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mx-auto">
              <Key className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">RESET MẬT KHẨU THÀNH CÔNG</h3>
              <p className="text-xs text-slate-500 font-extrabold mt-1">Học sinh: {resetModalData.name}</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-left space-y-2">
              <div className="text-xs text-slate-500 font-bold">Mật khẩu tạm thời 1 lần:</div>
              <div className="text-2xl font-black text-purple-800 font-mono tracking-widest text-center select-all bg-white p-2.5 rounded-lg border border-purple-300">
                {resetModalData.temp_password}
              </div>
              <div className="text-[10px] text-purple-700 font-bold text-center">
                ⚠️ Cần yêu cầu học sinh đổi lại mật khẩu mới ở lần đăng nhập tới.
              </div>
            </div>

            <button
              onClick={() => setResetModalData(null)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
