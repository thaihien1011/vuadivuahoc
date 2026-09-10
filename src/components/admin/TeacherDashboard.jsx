import React, { useState, useEffect } from 'react';
import { 
  Users, Key, RefreshCw, CheckCircle2, AlertCircle, FileSpreadsheet, 
  Search, ShieldCheck, Lock, X, MapPin, Target, Download, Filter, Star, Flame, Trophy, Database, Plus, Edit3, Save, Trash2, UserPlus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  adminResetPassword, syncQuestions, importExcelArrayBuffer,
  getClassesTable, saveClassesTable, deleteClassRecord,
  getWardrobeCatalogTable, saveWardrobeCatalogTable, createWardrobeItemRecord, deleteWardrobeItemRecord,
  createStudentRecord, updateStudentRecord, deleteStudentRecord,
  seedFirestoreTables
} from '../../services/api';
import InteractiveMap from '../map/InteractiveMap';
import { INITIAL_LESSONS } from '../../services/mockData';

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'classes' | 'wardrobe_catalog' | 'sync' | 'map'
  const [students, setStudents] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [wardrobeCatalog, setWardrobeCatalog] = useState([]);
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [resetModalData, setResetModalData] = useState(null);
  const [sheetId, setSheetId] = useState('1ntVNq7XVoVsSlQ0Mp_itoTTCt_VQxGQY');
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // New Class Form State
  const [newClassName, setNewClassName] = useState('');

  // Editing Wardrobe Item State
  const [editingItem, setEditingItem] = useState(null);

  // Student Modals State
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    username: '',
    gender: 'male',
    class: 'Lớp 8/8',
    current_star: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const list = JSON.parse(localStorage.getItem('vdvh_students') || '[]');
    setStudents(list);
    setClassesList(getClassesTable());
    setWardrobeCatalog(getWardrobeCatalogTable());
  };

  const handleCreateStudent = (e) => {
    e.preventDefault();
    if (!studentForm.name.trim() || !studentForm.username.trim()) {
      alert('Vui lòng nhập đầy đủ Họ tên và Username');
      return;
    }
    try {
      createStudentRecord(studentForm);
      loadData();
      setIsAddStudentOpen(false);
      setStudentForm({ name: '', username: '', gender: 'male', class: 'Lớp 8/8', current_star: 0 });
      alert(`Đã tạo học sinh "${studentForm.name}" thành công!`);
    } catch (err) {
      alert('Lỗi tạo học sinh: ' + err.message);
    }
  };

  const handleUpdateStudentSubmit = (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      updateStudentRecord(editingStudent.id, editingStudent);
      loadData();
      setEditingStudent(null);
      alert(`Đã cập nhật thông tin học sinh "${editingStudent.name}"!`);
    } catch (err) {
      alert('Lỗi cập nhật: ' + err.message);
    }
  };

  const handleDeleteStudent = (studentId, studentName) => {
    if (confirm(`Bạn có chắc chắn muốn xóa học sinh "${studentName}" khỏi hệ thống?`)) {
      deleteStudentRecord(studentId);
      loadData();
      alert(`Đã xóa học sinh "${studentName}".`);
    }
  };

  const handleDeleteClass = (classId, className) => {
    if (confirm(`Bạn có chắc chắn muốn xóa lớp "${className}"?`)) {
      deleteClassRecord(classId);
      loadData();
      alert(`Đã xóa lớp "${className}".`);
    }
  };

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    const newCls = {
      id: 'cls_' + Date.now(),
      name: newClassName.trim(),
      grade: 8,
      created_at: new Date().toISOString()
    };
    const updated = [...classesList, newCls];
    setClassesList(updated);
    saveClassesTable(updated);
    setNewClassName('');
    alert(`Đã thêm lớp "${newCls.name}" thành công vào Bảng Classes!`);
  };

  const handleSaveItemEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;
    const updated = wardrobeCatalog.map(item => item.id === editingItem.id ? editingItem : item);
    setWardrobeCatalog(updated);
    saveWardrobeCatalogTable(updated);
    setEditingItem(null);
    alert(`Đã cập nhật thông tin vật phẩm "${editingItem.name}" thành công!`);
  };

  const handleSeedDatabase = async () => {
    try {
      setSyncing(true);
      setSyncStatus(null);
      const res = await seedFirestoreTables();
      setSyncStatus(res);
    } catch (err) {
      setSyncStatus({ success: false, error: err.message });
    } finally {
      setSyncing(false);
    }
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

  // EXPORT NCKH EXCEL REPORT FOR TEACHERS
  const exportNckhExcelReport = () => {
    if (!students || students.length === 0) {
      alert('Chưa có dữ liệu học sinh để xuất báo cáo.');
      return;
    }

    const reportData = students.map((st, index) => ({
      'STT': index + 1,
      'Mã Học Sinh (ID)': st.id,
      'Họ và Tên': st.name,
      'Tên Đăng Nhập (Username)': st.username,
      'Giới Tính': st.gender === 'male' ? 'Nam (Boy)' : st.gender === 'female' ? 'Nữ (Girl)' : 'Chưa chọn',
      'Lớp': st.class || 'Không liên kết',
      'Số Sao Tích Lũy (⭐)': st.current_star || 0,
      'Chuỗi Ngày Học (🔥)': st.streak || 3,
      'Trạng Thái Mật Khẩu': st.must_change_password ? 'Cần đổi mật khẩu' : 'Bình thường'
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo Cáo NCKH THCS Trần Phú');

    // Auto-fit column widths
    worksheet['!cols'] = [
      { wch: 6 },  // STT
      { wch: 15 }, // ID
      { wch: 25 }, // Họ tên
      { wch: 18 }, // Username
      { wch: 14 }, // Giới tính
      { wch: 16 }, // Lớp
      { wch: 18 }, // Sao
      { wch: 18 }, // Streak
      { wch: 20 }  // Pass status
    ];

    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Bao_Cao_NCKH_Thuc_Nghiem_THCS_Tran_Phu_${today}.xlsx`);
  };

  // Unique classes list for filter
  const classList = Array.from(new Set(students.map(s => s.class || 'Không liên kết')));

  // Filtered students
  const filteredStudents = students.filter(st => {
    const matchClass = selectedClass === 'ALL' || (st.class || 'Không liên kết') === selectedClass;
    const matchSearch = !searchQuery.trim() || 
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      st.username.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchSearch;
  });

  // Calculate summary metrics
  const totalStars = students.reduce((acc, st) => acc + (st.current_star || 0), 0);
  const avgStars = students.length ? Math.round(totalStars / students.length) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* BRAND HEADER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Cổng Quản Trị Giáo Viên</h1>
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">Domain: admin.vuadivuahoc • THCS Trần Phú 2026</p>
          </div>
        </div>

        {/* 1-CLICK NCKH EXCEL EXPORT BUTTON */}
        <button
          onClick={exportNckhExcelReport}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Báo Cáo Excel NCKH</span>
        </button>
      </div>

      {/* SUMMARY METRICS METERS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
            <Users className="w-4 h-4 text-purple-600" />
            <span>Tổng Học Sinh</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{students.length} <span className="text-xs font-normal text-slate-400">em</span></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Tổng Sao Tích Lũy</span>
          </div>
          <div className="text-2xl font-black text-amber-600">{totalStars} ⭐</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
            <Trophy className="w-4 h-4 text-sky-600" />
            <span>Trung Bình Sao/Em</span>
          </div>
          <div className="text-2xl font-black text-sky-600">{avgStars} ⭐</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Tổng Số Lớp</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">{classList.length} <span className="text-xs font-normal text-slate-400">lớp</span></div>
        </div>
      </div>

      {/* MINIMALIST TEXT SUB-TABS */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-6 shadow-sm rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('students')}
          className={`text-xs font-black uppercase tracking-wider pb-1 transition-all shrink-0 ${
            activeTab === 'students'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-400 hover:text-slate-700 border-b-2 border-transparent'
          }`}
        >
          Học Sinh ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`text-xs font-black uppercase tracking-wider pb-1 transition-all shrink-0 ${
            activeTab === 'classes'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-400 hover:text-slate-700 border-b-2 border-transparent'
          }`}
        >
          Bảng Lớp Học ({classesList.length})
        </button>

        <button
          onClick={() => setActiveTab('wardrobe_catalog')}
          className={`text-xs font-black uppercase tracking-wider pb-1 transition-all shrink-0 ${
            activeTab === 'wardrobe_catalog'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-400 hover:text-slate-700 border-b-2 border-transparent'
          }`}
        >
          Bảng Trang Phục Avatar ({wardrobeCatalog.length})
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`text-xs font-black uppercase tracking-wider pb-1 transition-all shrink-0 ${
            activeTab === 'sync'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-400 hover:text-slate-700 border-b-2 border-transparent'
          }`}
        >
          Đồng Bộ Database
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
          Tọa Độ Bản Đồ
        </button>
      </div>

      {/* TAB 1: DANH SÁCH HỌC SINH + SEARCH & CLASS FILTER & ADD STUDENT */}
      {activeTab === 'students' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">Danh sách học sinh thực nghiệm ({filteredStudents.length}/{students.length})</h3>
              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Thêm Học Sinh</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              {/* SEARCH BAR */}
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm học sinh..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* CLASS FILTER */}
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">Tất cả các lớp</option>
                {classList.map(cls => (
                  <option key={cls} value={cls}>Lớp {cls}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-900 font-extrabold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Học sinh</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Giới tính</th>
                  <th className="p-3">Lớp</th>
                  <th className="p-3">Điểm Sao</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-400 font-bold">
                      Không tìm thấy học sinh phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-extrabold text-slate-900">{st.name}</td>
                      <td className="p-3 font-mono text-slate-600">{st.username}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                          st.gender === 'male' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                          st.gender === 'female' ? 'bg-pink-50 text-pink-700 border border-pink-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {st.gender === 'male' ? '👦 Nam' : st.gender === 'female' ? '👧 Nữ' : 'Chưa rõ'}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-600">{st.class || 'Không liên kết'}</td>
                      <td className="p-3 font-extrabold text-amber-600">⭐ {st.current_star || 0}</td>
                      <td className="p-3 text-right flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingStudent({ ...st })}
                          className="bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold px-2 py-1 rounded-lg border border-sky-200 text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleResetPass(st.id, st.name)}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded-lg border border-purple-200 text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Key className="w-3 h-3" />
                          Reset
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(st.id, st.name)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2 py-1 rounded-lg border border-rose-200 text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: QUẢN LÝ BẢNG LỚP HỌC (CLASSES TABLE) */}
      {activeTab === 'classes' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-black text-slate-900">Quản lý Bảng Lớp Học (Classes Table)</h3>
              <p className="text-xs text-slate-500">Khởi tạo và cập nhật danh sách lớp học trong cơ sở dữ liệu hệ thống</p>
            </div>

            <form onSubmit={handleAddClass} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nhập tên lớp mới (vd: 8/8)..."
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-bold"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-4 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Lớp</span>
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-900 font-extrabold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Mã Lớp (ID)</th>
                  <th className="p-3">Tên Lớp</th>
                  <th className="p-3">Khối Học</th>
                  <th className="p-3">Sĩ Số Học Sinh</th>
                  <th className="p-3 text-right">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classesList.map((cls) => {
                  const studentCount = students.filter(s => (s.class || 'Không liên kết') === cls.name).length;
                  return (
                    <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-slate-500">{cls.id}</td>
                      <td className="p-3 font-extrabold text-slate-900">{cls.name}</td>
                      <td className="p-3 font-bold text-slate-600">Khối {cls.grade || 8}</td>
                      <td className="p-3 font-extrabold text-purple-700">{studentCount} học sinh</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded-md font-extrabold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Đang hoạt động
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: QUẢN LÝ BẢNG TRANG PHỤC AVATAR (AVATAR_ITEMS TABLE) */}
      {activeTab === 'wardrobe_catalog' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-black text-slate-900">Bảng Quản Lý Trang Phục Avatar 2D (Avatar Items Table)</h3>
              <p className="text-xs text-slate-500">Khai báo thông số vật phẩm, tên tiếng Việt, slot vị trí và giá sao quy đổi</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-900 font-extrabold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Mã (ID)</th>
                  <th className="p-3">Ảnh Xem Trước</th>
                  <th className="p-3">Tên Hiển Thị (Name)</th>
                  <th className="p-3">Vị Trí (Slot)</th>
                  <th className="p-3">Giới Tính Target</th>
                  <th className="p-3">Giá Sao (Star Cost)</th>
                  <th className="p-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wardrobeCatalog.map((item) => {
                  const isEditing = editingItem && editingItem.id === item.id;
                  const thumbPath = `/assets/avatar/thumb/${item.slot}/${item.fileName}`;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-slate-500">{item.id}</td>
                      <td className="p-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-purple-200 p-1 flex items-center justify-center shadow-inner">
                          <img src={thumbPath} alt={item.name} className="max-w-full max-h-full object-contain" />
                        </div>
                      </td>
                      <td className="p-3 font-extrabold text-slate-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingItem.name}
                            onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                            className="bg-white border border-purple-300 rounded px-2 py-1 text-xs font-extrabold text-slate-900"
                          />
                        ) : item.name}
                      </td>
                      <td className="p-3 font-bold text-slate-600 uppercase">{item.slot}</td>
                      <td className="p-3">
                        {isEditing ? (
                          <select
                            value={editingItem.gender_target}
                            onChange={e => setEditingItem({ ...editingItem, gender_target: e.target.value })}
                            className="bg-white border border-purple-300 rounded px-2 py-1 text-xs font-bold"
                          >
                            <option value="male">Nam (male)</option>
                            <option value="female">Nữ (female)</option>
                            <option value="all">Tất cả (all)</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                            item.gender_target === 'male' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                            item.gender_target === 'female' ? 'bg-pink-50 text-pink-700 border border-pink-200' :
                            'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {item.gender_target === 'male' ? 'Nam' : item.gender_target === 'female' ? 'Nữ' : 'Tất cả'}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-extrabold text-amber-600">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editingItem.star_cost}
                            onChange={e => setEditingItem({ ...editingItem, star_cost: parseInt(e.target.value) || 0 })}
                            className="bg-white border border-purple-300 rounded px-2 py-1 text-xs font-bold w-16 text-center"
                          />
                        ) : `${item.star_cost} ⭐`}
                      </td>
                      <td className="p-3 text-right">
                        {isEditing ? (
                          <button
                            onClick={handleSaveItemEdit}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1 shadow-sm transition-all"
                          >
                            <Save className="w-3.5 h-3.5" /> Lưu
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingItem({ ...item })}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold px-3 py-1.5 rounded-lg border border-purple-200 text-xs inline-flex items-center gap-1 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Sửa
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ĐỒNG BỘ NẠP FILE EXCEL & CLOUD FIRESTORE SEEDER */}
      {activeTab === 'sync' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          {/* MASTER FIRESTORE DATABASE SEEDER */}
          <div className="border border-purple-200 bg-purple-50/50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Khởi Tạo & Đồng Bộ Tất Cả Bảng Dữ Liệu Lên Cloud Firestore</h3>
                <p className="text-xs text-slate-500">Đẩy dữ liệu chuẩn của các bảng `classes`, `students`, `lessons`, `questions`, `avatar_items` trực tiếp lên Cloud Database</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSeedDatabase}
                disabled={syncing}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-extrabold px-5 py-3 rounded-xl text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Database className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Đang khởi tạo Database...' : 'Khởi Tạo & Đồng Bộ Cloud Firestore'}</span>
              </button>
            </div>
          </div>

          <hr className="border-slate-200" />

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
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
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

      {/* MODAL 1: THÊM HỌC SINH MỚI */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl relative">
            <button 
              onClick={() => setIsAddStudentOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-black text-slate-900">Thêm Học Sinh Mới</h3>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Họ và Tên:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trần Văn Nam"
                  value={studentForm.name}
                  onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Username (Tên đăng nhập không dấu):</label>
                <input
                  type="text"
                  required
                  placeholder="tranvannam"
                  value={studentForm.username}
                  onChange={e => setStudentForm({ ...studentForm, username: e.target.value.toLowerCase().trim() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Giới Tính:</label>
                  <select
                    value={studentForm.gender}
                    onChange={e => setStudentForm({ ...studentForm, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="male">Nam (Boy)</option>
                    <option value="female">Nữ (Girl)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Lớp Học:</label>
                  <select
                    value={studentForm.class}
                    onChange={e => setStudentForm({ ...studentForm, class: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    {classList.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                    <option value="Lớp 8/8">Lớp 8/8</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Số Sao Khởi Tạo (⭐):</label>
                <input
                  type="number"
                  value={studentForm.current_star}
                  onChange={e => setStudentForm({ ...studentForm, current_star: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow-md cursor-pointer"
                >
                  Tạo Học Sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SỬA HỌC SINH */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl relative">
            <button 
              onClick={() => setEditingStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-sky-600" />
              <h3 className="text-base font-black text-slate-900">Sửa Thông Tin Học Sinh</h3>
            </div>

            <form onSubmit={handleUpdateStudentSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Họ và Tên:</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Username:</label>
                <input
                  type="text"
                  disabled
                  value={editingStudent.username}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Giới Tính:</label>
                  <select
                    value={editingStudent.gender}
                    onChange={e => setEditingStudent({ ...editingStudent, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="male">Nam (Boy)</option>
                    <option value="female">Nữ (Girl)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Lớp Học:</label>
                  <select
                    value={editingStudent.class || 'Lớp 8/8'}
                    onChange={e => setEditingStudent({ ...editingStudent, class: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    {classList.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                    <option value="Lớp 8/8">Lớp 8/8</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Điểm Sao Tích Lũy (⭐):</label>
                <input
                  type="number"
                  value={editingStudent.current_star || 0}
                  onChange={e => setEditingStudent({ ...editingStudent, current_star: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-amber-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs px-5 py-2 rounded-xl shadow-md cursor-pointer"
                >
                  Cập Nhật
                </button>
              </div>
            </form>
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
