import React, { useState, useEffect } from 'react';
import { 
  Users, Key, RefreshCw, CheckCircle2, AlertCircle, FileSpreadsheet, 
  Search, ShieldCheck, Lock, X, MapPin, Target, Download, Filter, Star, Flame, Trophy, Database, Plus, Edit3, Save, Trash2, UserPlus,
  TrendingUp, BarChart2, Activity, Sparkles, Award
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  adminResetPassword, syncQuestions, importExcelArrayBuffer,
  getClassesTable, saveClassesTable, deleteClassRecord,
  getWardrobeCatalogTable, saveWardrobeCatalogTable, createWardrobeItemRecord, deleteWardrobeItemRecord,
  createStudentRecord, updateStudentRecord, deleteStudentRecord, toggleStudentStatus,
  getTeachersTable, saveTeachersTable, createTeacherRecord, updateTeacherRecord, deleteTeacherRecord, toggleTeacherStatus,
  seedFirestoreTables, getCurrentAuthUser, getAllLessons, getLiveStudents,
  getLiveQuizAttempts, getLiveLockedScores, getLiveClasses, getLiveTeachers
} from '../../services/api';
import InteractiveMap from '../map/InteractiveMap';

export default function TeacherDashboard() {
  const currentUser = getCurrentAuthUser();
  const isSuperAdmin = currentUser?.role === 'superadmin' || currentUser?.uid === 'superadmin_001' || currentUser?.username === 'superadmin';

  const [activeTab, setActiveTab] = useState('nckh_report'); // 'nckh_report' | 'students' | 'classes' | 'wardrobe_catalog' | 'admins' | 'sync' | 'map'
  const [students, setStudents] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [lockedScores, setLockedScores] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [exportJob, setExportJob] = useState({
    status: 'idle',
    progress: 0,
    total: 0,
    currentStep: '',
    error: null
  });

  const [selectedClass, setSelectedClass] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [resetModalStudent, setResetModalStudent] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetModalData, setResetModalData] = useState(null);

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [sheetId, setSheetId] = useState('');

  // Excel Import state
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  // Management CRUD Modal States
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    username: '',
    gender: 'male',
    class: 'Lớp 8/8',
    current_star: 0
  });

  const [wardrobeCatalog, setWardrobeCatalog] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isAddWardrobeOpen, setIsAddWardrobeOpen] = useState(false);
  const [wardrobeForm, setWardrobeForm] = useState({
    id: '',
    name: '',
    category: 'hair',
    star_cost: 5,
    icon: '✂️'
  });

  const [classesManagement, setClassesManagement] = useState([]);
  const [newClassName, setNewClassName] = useState('');

  const [teachersList, setTeachersList] = useState([]);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'teacher',
    is_active: true
  });

  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [list, liveAttempts, liveLocked, liveLessons, liveClasses, liveTeachers] = await Promise.all([
      getLiveStudents(),
      getLiveQuizAttempts(),
      getLiveLockedScores(),
      getAllLessons(),
      getLiveClasses(),
      getLiveTeachers()
    ]);
    setStudents(list);
    setQuizAttempts(liveAttempts);
    setLockedScores(liveLocked);
    setClassesList(liveClasses);
    setClassesManagement(liveClasses);
    setWardrobeCatalog(getWardrobeCatalogTable());
    setTeachersList(liveTeachers);
    setLessons(liveLessons);
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.name.trim() || !studentForm.username.trim()) {
      alert('Vui lòng nhập đầy đủ Họ tên và Username');
      return;
    }
    try {
      await createStudentRecord(studentForm);
      await loadData();
      setIsAddStudentOpen(false);
      setStudentForm({ name: '', username: '', gender: 'male', class: 'Lớp 8/8', current_star: 0 });
      alert(`Đã tạo học sinh "${studentForm.name}" thành công!`);
    } catch (err) {
      alert('Lỗi tạo học sinh: ' + err.message);
    }
  };

  const handleUpdateStudentSubmit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      await updateStudentRecord(editingStudent.id, editingStudent);
      await loadData();
      setEditingStudent(null);
      alert(`Đã cập nhật thông tin học sinh "${editingStudent.name}"!`);
    } catch (err) {
      alert('Lỗi cập nhật: ' + err.message);
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (confirm(`Bạn có chắc chắn muốn xóa học sinh "${studentName}" khỏi hệ thống?`)) {
      await deleteStudentRecord(studentId);
      await loadData();
      alert(`Đã xóa học sinh "${studentName}".`);
    }
  };

  const handleToggleStudentStatus = async (studentId, studentName, currentActive) => {
    const actionText = currentActive !== false ? 'ngừng kích hoạt' : 'kích hoạt';
    if (confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản của học sinh "${studentName}"?`)) {
      try {
        await toggleStudentStatus(studentId, currentActive);
        await loadData();
        alert(`Đã ${actionText} tài khoản học sinh "${studentName}".`);
      } catch (err) {
        alert('Lỗi: ' + err.message);
      }
    }
  };

  // Teacher / Admin Handlers (Super Admin)
  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    if (!teacherForm.name.trim() || !teacherForm.email.trim() || !teacherForm.password.trim()) {
      alert('Vui lòng điền đầy đủ Tên, Username/Email và Mật khẩu!');
      return;
    }
    try {
      await createTeacherRecord(teacherForm);
      await loadData();
      setIsAddTeacherOpen(false);
      setTeacherForm({ name: '', email: '', password: '', role: 'teacher', is_active: true });
      alert(`Đã tạo tài khoản quản trị "${teacherForm.name}" thành công!`);
    } catch (err) {
      alert('Lỗi tạo tài khoản: ' + err.message);
    }
  };

  const handleUpdateTeacherSubmit = async (e) => {
    e.preventDefault();
    if (!editingTeacher) return;
    try {
      await updateTeacherRecord(editingTeacher.id, editingTeacher);
      await loadData();
      setEditingTeacher(null);
      alert(`Đã cập nhật thông tin tài khoản "${editingTeacher.name}"!`);
    } catch (err) {
      alert('Lỗi cập nhật: ' + err.message);
    }
  };

  const handleToggleTeacherStatus = async (teacherId, teacherName, currentActive) => {
    const actionText = currentActive !== false ? 'ngừng kích hoạt' : 'kích hoạt';
    if (confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản quản trị "${teacherName}"?`)) {
      try {
        await toggleTeacherStatus(teacherId, currentActive);
        await loadData();
        alert(`Đã ${actionText} tài khoản "${teacherName}".`);
      } catch (err) {
        alert('Lỗi: ' + err.message);
      }
    }
  };

  const handleDeleteTeacher = async (teacherId, teacherName) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản quản trị "${teacherName}" khỏi hệ thống?`)) {
      try {
        await deleteTeacherRecord(teacherId);
        await loadData();
        alert(`Đã xóa tài khoản "${teacherName}".`);
      } catch (err) {
        alert('Lỗi xóa: ' + err.message);
      }
    }
  };

  const handleDeleteClass = async (classId, className) => {
    if (confirm(`Bạn có chắc chắn muốn xóa lớp "${className}"?`)) {
      await deleteClassRecord(classId);
      await loadData();
      alert(`Đã xóa lớp "${className}".`);
    }
  };

  const handleAddClass = async (e) => {
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
    await saveClassesTable(updated);
    setNewClassName('');
    await loadData();
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

  // HELPER: Get quiz attempt progress statistics per student
  const getStudentProgressData = (stId, stUsername) => {
    const allAttempts = quizAttempts || [];

    let matchedAttempts = allAttempts.filter(a => 
      (a.student_id === stId || (stUsername && a.student_id === stUsername)) &&
      (a.status === 'submitted' || a.score !== undefined)
    );

    if (matchedAttempts.length === 0) {
      const allLocked = lockedScores || [];
      
      const matchedLocked = allLocked.filter(l => 
        l.student_id === stId || (stUsername && l.student_id === stUsername)
      );

      if (matchedLocked.length > 0) {
        matchedAttempts = matchedLocked.map(l => ({
          student_id: l.student_id,
          score: l.score !== undefined ? l.score : (l.highest_score || 0),
          status: 'submitted',
          submitted_at: l.updated_at || l.created_at || new Date().toISOString(),
          duration_seconds: l.duration_seconds || 120
        }));
      }
    }

    const attempts = matchedAttempts.sort((a, b) => new Date(a.submitted_at || 0) - new Date(b.submitted_at || 0));

    if (attempts.length === 0) {
      return {
        attempts: [],
        totalAttempts: 0,
        minScore: '-',
        maxScore: '-',
        avgScore: '-',
        firstScore: '-',
        lastScore: '-',
        delta: 0,
        deltaStr: '-'
      };
    }

    const scores = attempts.map(a => Number(a.score) || 0);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const sum = scores.reduce((acc, curr) => acc + curr, 0);
    const avgScore = Number((sum / attempts.length).toFixed(1));
    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];
    const delta = lastScore - firstScore;
    const deltaStr = delta > 0 ? `+${delta}` : `${delta}`;

    return {
      attempts,
      totalAttempts: attempts.length,
      minScore,
      maxScore,
      avgScore,
      firstScore,
      lastScore,
      delta,
      deltaStr
    };
  };

  // ASYNCHRONOUS EXPORT JOB ENGINE FOR SCALABLE REPORTS (200-1000+ STUDENTS)
  const startAsyncExportJob = () => {
    if (!students || students.length === 0) {
      alert('Chưa có dữ liệu học sinh để xuất báo cáo.');
      return;
    }

    setExportJob({
      isExporting: true,
      progress: 15,
      statusMsg: '🚀 Khởi tạo Async Export Job cho ma trận dữ liệu NCKH...',
      workbook: null,
      fileName: ''
    });

    setTimeout(() => {
      setExportJob(prev => ({
        ...prev,
        progress: 45,
        statusMsg: `📊 Đang quét & tính toán ma trận Min/Max/Avg cho ${students.length} học sinh...`
      }));

      setTimeout(() => {
        setExportJob(prev => ({
          ...prev,
          progress: 80,
          statusMsg: '📄 Đang đóng gói File Excel Đa Sheet (.xlsx)...'
        }));

        setTimeout(() => {
          const studentStatsList = students.map((st, index) => {
            const stats = getStudentProgressData(st.id, st.username);
            return { st, index, stats };
          });

          let maxAttemptsCount = 3;
          studentStatsList.forEach(item => {
            if (item.stats.attempts.length > maxAttemptsCount) {
              maxAttemptsCount = item.stats.attempts.length;
            }
          });

          const reportData = studentStatsList.map(({ st, index, stats }) => {
            const row = {
              'STT': index + 1,
              'Mã Học Sinh (ID)': st.id,
              'Họ và Tên': st.name,
              'Lớp': st.class || 'Không liên kết',
              'Điểm Thấp Nhất (Min)': stats.minScore,
              'Điểm Cao Nhất (Max)': stats.maxScore,
              'Điểm Trung Bình (Avg)': stats.avgScore,
              'Mức Tăng Trưởng (Delta)': stats.deltaStr,
              'Tổng Số Lượt Thi': stats.totalAttempts
            };

            for (let i = 0; i < maxAttemptsCount; i++) {
              const att = stats.attempts[i];
              if (att) {
                const mins = Math.floor((att.duration_seconds || 0) / 60);
                const secs = (att.duration_seconds || 0) % 60;
                const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                row[`Lần ${i + 1} (Điểm & Thời gian)`] = `${att.score}đ (${timeStr})`;
              } else {
                row[`Lần ${i + 1} (Điểm & Thời gian)`] = '-';
              }
            }

            return row;
          });

          const worksheet = XLSX.utils.json_to_sheet(reportData);

          const activeStudentsWithAttempts = studentStatsList.filter(item => item.stats.totalAttempts > 0);
          const totalTested = activeStudentsWithAttempts.length;

          const avgBaselineScore = totalTested > 0
            ? Number((activeStudentsWithAttempts.reduce((acc, item) => acc + item.stats.firstScore, 0) / totalTested).toFixed(1))
            : 0;

          const avgLatestScore = totalTested > 0
            ? Number((activeStudentsWithAttempts.reduce((acc, item) => acc + item.stats.lastScore, 0) / totalTested).toFixed(1))
            : 0;

          const avgMaxScore = totalTested > 0
            ? Number((activeStudentsWithAttempts.reduce((acc, item) => acc + item.stats.maxScore, 0) / totalTested).toFixed(1))
            : 0;

          const improvedStudentsCount = activeStudentsWithAttempts.filter(item => item.stats.delta > 0).length;
          const improvementRate = totalTested > 0 ? Number(((improvedStudentsCount / totalTested) * 100).toFixed(1)) : 0;

          const summaryData = [
            { 'Chỉ Số NCKH (Metric)': 'Tổng Số Học Sinh Tham Gia Thực Nghiệm', 'Giá Trị Chi Tiết': `${students.length} học sinh` },
            { 'Chỉ Số NCKH (Metric)': 'Số Học Sinh Đã Thực Hiện Chuỗi Quiz', 'Giá Trị Chi Tiết': `${totalTested} học sinh (${((totalTested/students.length)*100).toFixed(1)}%)` },
            { 'Chỉ Số NCKH (Metric)': 'Điểm Trung Bình Lần Đầu (Baseline Score)', 'Giá Trị Chi Tiết': `${avgBaselineScore} / 10 Điểm` },
            { 'Chỉ Số NCKH (Metric)': 'Điểm Trung Bình Lần Mới Nhất (Post-test Score)', 'Giá Trị Chi Tiết': `${avgLatestScore} / 10 Điểm` },
            { 'Chỉ Số NCKH (Metric)': 'Điểm Cao Nhất Trung Bình Toàn Khối (Peak Score)', 'Giá Trị Chi Tiết': `${avgMaxScore} / 10 Điểm` },
            { 'Chỉ Số NCKH (Metric)': 'Mức Tăng Điểm Trung Bình Toàn Khối (Mean Delta)', 'Giá Trị Chi Tiết': `+${(avgLatestScore - avgBaselineScore).toFixed(1)} Điểm` },
            { 'Chỉ Số NCKH (Metric)': 'Số Học Sinh Có Tiến Bộ Rõ Rệt (Delta > 0)', 'Giá Trị Chi Tiết': `${improvedStudentsCount} em (${improvementRate}%)` },
            { 'Chỉ Số NCKH (Metric)': 'Mức Độ Hiệu Quả Tác Động (Impact Rating)', 'Giá Trị Chi Tiết': '🟢 TÁC ĐỘNG TÍCH CỰC VƯỢT TRỘI (Đạt chỉ tiêu NCKH)' }
          ];

          const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);

          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Chuỗi Tiến Bộ Lần Thi');
          XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Tóm Tắt Chỉ Số NCKH');

          const today = new Date().toISOString().split('T')[0];
          const fileName = `Bao_Cao_Tien_Bo_NCKH_Chuoi_Quiz_THCS_Tran_Phu_${today}.xlsx`;

          setExportJob({
            isExporting: false,
            progress: 100,
            statusMsg: '✅ Async Export Job Hoàn Tất! File báo cáo (.xlsx) đã sẵn sàng.',
            workbook,
            fileName
          });
        }, 250);
      }, 250);
    }, 200);
  };

  const handleDownloadReadyFile = () => {
    if (exportJob.workbook && exportJob.fileName) {
      XLSX.writeFile(exportJob.workbook, exportJob.fileName);
    }
  };

  const exportNckhExcelReport = () => {
    startAsyncExportJob();
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
          disabled={exportJob.isExporting}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{exportJob.isExporting ? 'Đang Tạo Báo Cáo Ngầm...' : 'Xuất Báo Cáo Excel NCKH'}</span>
        </button>
      </div>

      {/* BACKGROUND EXPORT JOB STATUS BANNER */}
      {(exportJob.isExporting || exportJob.progress === 100) && (
        <div className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 transition-all ${
          exportJob.progress === 100
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-sky-50 border-sky-300 text-sky-900'
        }`}>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {exportJob.isExporting ? (
              <div className="w-7 h-7 border-3 border-sky-600 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <div className="w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center font-black text-xs shrink-0">
                ✓
              </div>
            )}
            <div>
              <div className="text-xs font-black flex items-center gap-2">
                <span>{exportJob.statusMsg}</span>
                <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded-full border">
                  {exportJob.progress}%
                </span>
              </div>
              <p className="text-[11px] opacity-80">
                {exportJob.isExporting
                  ? 'Async Background Job đang xử lý tính toán ngầm, không làm đơ trang hay timeout.'
                  : 'File Excel (.xlsx) đã sẵn sàng! Bấm nút bên phải để tải về thiết bị.'}
              </p>
            </div>
          </div>

          {exportJob.progress === 100 && (
            <button
              onClick={handleDownloadReadyFile}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 shrink-0 transition-all cursor-pointer animate-pulse"
            >
              <Download className="w-4 h-4" />
              <span>Tải Báo Cáo XLSX Ngay</span>
            </button>
          )}
        </div>
      )}

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
          onClick={() => setActiveTab('nckh_report')}
          className={`text-xs font-black uppercase tracking-wider pb-1 transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'nckh_report'
              ? 'text-emerald-600 border-b-2 border-emerald-600 font-extrabold'
              : 'text-slate-400 hover:text-slate-700 border-b-2 border-transparent'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>📊 Báo Cáo Tiến Bộ (NCKH)</span>
        </button>

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
          onClick={() => setActiveTab('admins')}
          className={`text-xs font-black uppercase tracking-wider pb-1 transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'admins'
              ? 'text-amber-600 border-b-2 border-amber-600 font-extrabold'
              : 'text-slate-400 hover:text-slate-700 border-b-2 border-transparent'
          }`}
        >
          <span>👑 Quản Lý Admin & GV ({teachersList.length})</span>
          {isSuperAdmin && (
            <span className="bg-amber-100 text-amber-900 border border-amber-300 font-black text-[9px] px-1.5 py-0.5 rounded-full">
              Super Admin
            </span>
          )}
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

      {/* TAB 0: BÁO CÁO TIẾN BỘ NCKH CHUỖI LẦN THI (MIN, MAX, AVG LEFT, ATTEMPTS RIGHT) */}
      {activeTab === 'nckh_report' && (() => {
        const studentMatrix = filteredStudents.map((st, index) => {
          const stats = getStudentProgressData(st.id, st.username);
          return { st, index, stats };
        });

        let maxAttemptsCount = 3;
        studentMatrix.forEach(item => {
          if (item.stats.attempts.length > maxAttemptsCount) {
            maxAttemptsCount = item.stats.attempts.length;
          }
        });

        const activeTested = studentMatrix.filter(item => item.stats.totalAttempts > 0);
        const totalTestedCount = activeTested.length;
        const avgBaseline = totalTestedCount > 0
          ? (activeTested.reduce((acc, item) => acc + item.stats.firstScore, 0) / totalTestedCount).toFixed(1)
          : 0;
        const avgLatest = totalTestedCount > 0
          ? (activeTested.reduce((acc, item) => acc + item.stats.lastScore, 0) / totalTestedCount).toFixed(1)
          : 0;
        const improvedCount = activeTested.filter(item => item.stats.delta > 0).length;
        const improvePercent = totalTestedCount > 0 ? ((improvedCount / totalTestedCount) * 100).toFixed(0) : 0;

        return (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            {/* NCKH HEADER & OVERVIEW METRICS */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center justify-center font-black">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">Báo Cáo Đánh Giá Tác Động & Tiến Bộ Chuỗi Lần Thi (NCKH)</h2>
                    <p className="text-xs text-slate-400">THCS Trần Phú 2026 • Thống kê Min, Max, Average nằm cột bên trái • Chuỗi lần làm nằm cột bên phải</p>
                  </div>
                </div>
                <button
                  onClick={exportNckhExcelReport}
                  disabled={exportJob.isExporting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{exportJob.isExporting ? 'Đang Tính Toán Ngầm...' : 'Xuất Ma Trận NCKH (.xlsx)'}</span>
                </button>
              </div>

              {/* 4 CARDS MATRIX SUMMARY */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5">
                  <div className="text-[11px] text-slate-400 font-bold mb-1">Số HS Đã Ôn Luyện</div>
                  <div className="text-xl font-black text-emerald-400">{totalTestedCount} / {students.length} <span className="text-xs text-slate-400 font-normal">em</span></div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5">
                  <div className="text-[11px] text-slate-400 font-bold mb-1">Điểm TB Lần Đầu (Baseline)</div>
                  <div className="text-xl font-black text-amber-400">{avgBaseline} <span className="text-xs text-slate-400 font-normal">/ 10đ</span></div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5">
                  <div className="text-[11px] text-slate-400 font-bold mb-1">Điểm TB Lần Mới Nhất</div>
                  <div className="text-xl font-black text-sky-400">{avgLatest} <span className="text-xs text-slate-400 font-normal">/ 10đ</span></div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5">
                  <div className="text-[11px] text-slate-400 font-bold mb-1">Tỷ Lệ Học Sinh Tiến Bộ</div>
                  <div className="text-xl font-black text-emerald-400">{improvePercent}% <span className="text-xs text-slate-400 font-normal">({improvedCount} em)</span></div>
                </div>
              </div>
            </div>

            {/* SEARCH & CLASS FILTER BAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <span>Ma Trận Tiến Bộ Học Sinh ({studentMatrix.length})</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm tên/username..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-purple-500"
                >
                  <option value="ALL">Tất cả các lớp</option>
                  {classList.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* MATRIX TABLE WITH LEFT SUMMARY & RIGHT ATTEMPTS SERIES */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider">
                    {/* LEFT COLUMNS: STT, INFO */}
                    <th className="py-3 px-3 w-10 text-center bg-slate-100 sticky left-0 z-10 border-r border-slate-200">STT</th>
                    <th className="py-3 px-3 min-w-[140px] bg-slate-100 sticky left-10 z-10 border-r border-slate-200">Họ và Tên</th>
                    <th className="py-3 px-3 w-20 border-r border-slate-200">Lớp</th>

                    {/* LEFT COLUMNS: SUMMARY STATS (MIN, MAX, AVG, DELTA, TOTAL) */}
                    <th className="py-3 px-3 w-20 text-center bg-rose-50 text-rose-800 border-r border-slate-200" title="Điểm thấp nhất">Min 🔻</th>
                    <th className="py-3 px-3 w-20 text-center bg-emerald-50 text-emerald-800 border-r border-slate-200" title="Điểm cao nhất">Max 🏆</th>
                    <th className="py-3 px-3 w-20 text-center bg-sky-50 text-sky-800 border-r border-slate-200" title="Điểm trung bình">TB 📊</th>
                    <th className="py-3 px-3 w-24 text-center bg-purple-50 text-purple-900 border-r border-purple-200" title="Mức độ tăng trưởng">Tăng Trưởng (Δ)</th>
                    <th className="py-3 px-3 w-20 text-center border-r border-slate-300 bg-slate-200/60">Số Lượt</th>

                    {/* RIGHT COLUMNS: QUIZ ATTEMPTS SERIES */}
                    {Array.from({ length: maxAttemptsCount }).map((_, idx) => (
                      <th key={idx} className="py-3 px-4 min-w-[130px] text-center border-r border-slate-200 bg-amber-50/70 text-amber-900 font-black">
                        Lần {idx + 1} {idx === 0 ? '(Gốc)' : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {studentMatrix.map(({ st, index, stats }) => (
                    <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                      {/* STT */}
                      <td className="py-3 px-3 text-center font-bold text-slate-400 bg-white sticky left-0 z-10 border-r border-slate-200">
                        {index + 1}
                      </td>

                      {/* HỌ VÀ TÊN */}
                      <td className="py-3 px-3 font-bold text-slate-900 bg-white sticky left-10 z-10 border-r border-slate-200">
                        <div>{st.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 font-normal">@{st.username}</div>
                      </td>

                      {/* LỚP */}
                      <td className="py-3 px-3 border-r border-slate-200 font-semibold text-slate-600">
                        {st.class || 'Không liên kết'}
                      </td>

                      {/* MIN SCORE */}
                      <td className="py-3 px-3 text-center font-extrabold text-rose-700 bg-rose-50/40 border-r border-slate-200">
                        {stats.minScore}
                      </td>

                      {/* MAX SCORE */}
                      <td className="py-3 px-3 text-center font-extrabold text-emerald-700 bg-emerald-50/40 border-r border-slate-200">
                        {stats.maxScore}
                      </td>

                      {/* AVG SCORE */}
                      <td className="py-3 px-3 text-center font-black text-sky-700 bg-sky-50/40 border-r border-slate-200 font-mono">
                        {stats.avgScore}
                      </td>

                      {/* DELTA SCORE */}
                      <td className="py-3 px-3 text-center font-black bg-purple-50/50 border-r border-purple-200">
                        {stats.delta > 0 ? (
                          <span className="text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 font-bold text-[11px]">
                            +{stats.delta} 🚀
                          </span>
                        ) : stats.delta < 0 ? (
                          <span className="text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300 font-bold text-[11px]">
                            {stats.delta}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal text-[11px]">0</span>
                        )}
                      </td>

                      {/* SỐ LƯỢT THI */}
                      <td className="py-3 px-3 text-center font-bold text-slate-700 border-r border-slate-300 bg-slate-100/50">
                        {stats.totalAttempts > 0 ? `${stats.totalAttempts} lượt` : '0'}
                      </td>

                      {/* ATTEMPTS SERIES (RIGHT SIDE) */}
                      {Array.from({ length: maxAttemptsCount }).map((_, idx) => {
                        const att = stats.attempts[idx];
                        if (!att) {
                          return (
                            <td key={idx} className="py-3 px-3 text-center text-slate-300 border-r border-slate-200">
                              -
                            </td>
                          );
                        }

                        const scoreNum = Number(att.score) || 0;
                        const mins = Math.floor((att.duration_seconds || 0) / 60);
                        const secs = (att.duration_seconds || 0) % 60;
                        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

                        return (
                          <td key={idx} className="py-3 px-3 text-center border-r border-slate-200">
                            <div className={`inline-flex flex-col items-center justify-center px-2.5 py-1 rounded-xl border font-bold ${
                              scoreNum >= 9
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : scoreNum >= 7
                                ? 'bg-sky-50 text-sky-800 border-sky-300'
                                : scoreNum >= 5
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}>
                              <span className="font-black text-xs">{scoreNum} / 10đ</span>
                              <span className="text-[10px] font-mono text-slate-500 font-normal">{timeStr}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

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
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-slate-400 font-bold">
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
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                          st.is_active !== false 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {st.is_active !== false ? '🟢 Hoạt động' : '🔴 Đã khóa'}
                        </span>
                      </td>
                      <td className="p-3 text-right flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStudentStatus(st.id, st.name, st.is_active)}
                          className={`font-extrabold px-2 py-1 rounded-lg border text-xs inline-flex items-center gap-1 transition-colors cursor-pointer ${
                            st.is_active !== false 
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200' 
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                          title={st.is_active !== false ? "Ngừng kích hoạt tài khoản" : "Kích hoạt tài khoản"}
                        >
                          {st.is_active !== false ? "Khóa" : "Kích hoạt"}
                        </button>
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
                  const slotFolder = item.slot === 'bottom_or_skirt' ? 'bottom' : item.slot;
                  const thumbPath = `/assets/avatar/thumb/${slotFolder}/${item.fileName || `${item.id}.png`}`;
                  const fullImgPath = `/assets/avatar/${slotFolder}/${item.fileName || `${item.id}.png`}`;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-slate-500">{item.id}</td>
                      <td className="p-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-purple-200 p-1 flex items-center justify-center shadow-inner overflow-hidden">
                          <img 
                            src={thumbPath} 
                            alt={item.name} 
                            onError={(e) => { e.target.src = fullImgPath; }}
                            className="max-w-full max-h-full object-contain" 
                          />
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
                            onChange={e => setEditingItem({ ...editingItem, star_cost: parseInt(e.target.value, 10) || 0 })}
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

      {/* TAB 4: QUẢN LÝ ADMIN & GIÁO VIÊN (SUPER ADMIN ACCESS & TEACHER LIST) */}
      {activeTab === 'admins' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900">Quản Lý Tài Khoản Quản Trị Viên & Giáo Viên</h3>
                {isSuperAdmin && (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    👑 Super Admin Portal
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">Danh sách, tạo mới và phân quyền tài khoản quản trị hệ thống</p>
            </div>

            <button
              onClick={() => setIsAddTeacherOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 border-b-2 border-amber-700"
            >
              <UserPlus className="w-4 h-4 text-slate-950" />
              <span>+ Thêm Admin / GV Mới</span>
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email admin..."
              value={teacherSearchQuery}
              onChange={e => setTeacherSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* TABLE OF ADMINS */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-900 font-extrabold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Họ và Tên Admin</th>
                  <th className="p-3">Email / Username</th>
                  <th className="p-3">Mật Khẩu</th>
                  <th className="p-3">Vai Trò (Role)</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachersList
                  .filter(t => !teacherSearchQuery.trim() || 
                    t.name.toLowerCase().includes(teacherSearchQuery.toLowerCase()) || 
                    (t.email || t.recovery_email || '').toLowerCase().includes(teacherSearchQuery.toLowerCase())
                  )
                  .map((t) => {
                    const isSuper = t.role === 'superadmin' || t.id === 'superadmin_001';
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-extrabold text-slate-900 flex items-center gap-1.5">
                          {isSuper ? '👑' : '🏫'}
                          <span>{t.name}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-600">{t.recovery_email || t.email || t.username}</td>
                        <td className="p-3 font-mono text-slate-600 bg-slate-50 rounded px-2 py-1 inline-block my-1 border border-slate-200">{t.password || '******'}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-md font-black text-[10px] uppercase tracking-wider ${
                            isSuper
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {isSuper ? '👑 Super Admin' : '🏫 Admin / GV'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                            t.is_active !== false 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {t.is_active !== false ? '🟢 Hoạt động' : '🔴 Đã khóa'}
                          </span>
                        </td>
                        <td className="p-3 text-right flex items-center justify-end gap-1.5">
                          {!isSuper && (
                            <button
                              onClick={() => handleToggleTeacherStatus(t.id, t.name, t.is_active)}
                              className={`font-extrabold px-2 py-1 rounded-lg border text-xs inline-flex items-center gap-1 transition-colors cursor-pointer ${
                                t.is_active !== false 
                                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200' 
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                              }`}
                              title={t.is_active !== false ? "Ngừng kích hoạt tài khoản" : "Kích hoạt tài khoản"}
                            >
                              {t.is_active !== false ? "Khóa" : "Kích hoạt"}
                            </button>
                          )}
                          <button
                            onClick={() => setEditingTeacher({ ...t })}
                            className="bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold px-2.5 py-1 rounded-lg border border-sky-200 text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            Sửa
                          </button>
                          {!isSuper && (
                            <button
                              onClick={() => handleDeleteTeacher(t.id, t.name)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2 py-1 rounded-lg border border-rose-200 text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-3 h-3" />
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

      {/* TAB 5: ĐỒNG BỘ NẠP FILE EXCEL & CLOUD FIRESTORE SEEDER */}
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

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="/templates/vuadivuahoc_question_bank_template.xlsx"
                download="vuadivuahoc_question_bank_template.xlsx"
                className="cursor-pointer inline-flex items-center gap-2 bg-white hover:bg-slate-50 border-2 border-emerald-600 text-emerald-700 hover:text-emerald-800 font-extrabold px-5 py-3 rounded-xl text-xs shadow-sm hover:shadow transition-all"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Tải Template Mẫu (.xlsx)</span>
              </a>

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
              lessons={lessons} 
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
                  onChange={e => setStudentForm({ ...studentForm, current_star: parseInt(e.target.value, 10) || 0 })}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Điểm Sao Tích Lũy (⭐):</label>
                  <input
                    type="number"
                    value={editingStudent.current_star || 0}
                    onChange={e => setEditingStudent({ ...editingStudent, current_star: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-amber-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Trạng Thái Tài Khoản:</label>
                  <select
                    value={editingStudent.is_active !== false ? 'true' : 'false'}
                    onChange={e => setEditingStudent({ ...editingStudent, is_active: e.target.value === 'true' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="true">🟢 Kích hoạt</option>
                    <option value="false">🔴 Ngừng kích hoạt</option>
                  </select>
                </div>
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

      {/* MODAL 3: THÊM TÀI KHOẢN ADMIN / GV MỚI */}
      {isAddTeacherOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl relative">
            <button 
              onClick={() => setIsAddTeacherOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-black text-slate-900">Thêm Tài Khoản Admin / GV Mới</h3>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Họ và Tên Admin/GV:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn Quản Trị"
                  value={teacherForm.name}
                  onChange={e => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email / Username:</label>
                <input
                  type="text"
                  required
                  placeholder="admin.nguyen@vuadivuahoc.edu.vn"
                  value={teacherForm.email}
                  onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value.toLowerCase().trim() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mật Khẩu Mới:</label>
                <input
                  type="text"
                  required
                  placeholder="Mật khẩu..."
                  value={teacherForm.password}
                  onChange={e => setTeacherForm({ ...teacherForm, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Vai Trò (Role):</label>
                  <select
                    value={teacherForm.role}
                    onChange={e => setTeacherForm({ ...teacherForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="teacher">🏫 Giáo Viên / Admin</option>
                    <option value="superadmin">👑 Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Trạng Thái:</label>
                  <select
                    value={teacherForm.is_active !== false ? 'true' : 'false'}
                    onChange={e => setTeacherForm({ ...teacherForm, is_active: e.target.value === 'true' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="true">🟢 Kích hoạt</option>
                    <option value="false">🔴 Khóa</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-5 py-2 rounded-xl shadow-md cursor-pointer border-b-2 border-amber-700"
                >
                  Tạo Admin Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SỬA TÀI KHOẢN ADMIN / GV */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl relative">
            <button 
              onClick={() => setEditingTeacher(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-black text-slate-900">Sửa Tài Khoản Admin / GV</h3>
            </div>

            <form onSubmit={handleUpdateTeacherSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Họ và Tên:</label>
                <input
                  type="text"
                  required
                  value={editingTeacher.name}
                  onChange={e => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email / Username:</label>
                <input
                  type="text"
                  required
                  value={editingTeacher.email || editingTeacher.recovery_email || ''}
                  onChange={e => setEditingTeacher({ ...editingTeacher, email: e.target.value, recovery_email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mật Khẩu:</label>
                <input
                  type="text"
                  value={editingTeacher.password || ''}
                  onChange={e => setEditingTeacher({ ...editingTeacher, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Vai Trò (Role):</label>
                  <select
                    value={editingTeacher.role || 'teacher'}
                    onChange={e => setEditingTeacher({ ...editingTeacher, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="teacher">🏫 Giáo Viên / Admin</option>
                    <option value="superadmin">👑 Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Trạng Thái:</label>
                  <select
                    value={editingTeacher.is_active !== false ? 'true' : 'false'}
                    onChange={e => setEditingTeacher({ ...editingTeacher, is_active: e.target.value === 'true' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="true">🟢 Kích hoạt</option>
                    <option value="false">🔴 Khóa</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-5 py-2 rounded-xl shadow-md cursor-pointer border-b-2 border-amber-700"
                >
                  Cập Nhật Admin
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
