import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Award, BookOpen, Play, Star, CheckCircle2, 
  X, Filter, List, Map as MapIcon, ChevronRight, RotateCcw,
  Target, Save, Copy, Download, RefreshCw, Check
} from 'lucide-react';

export default function InteractiveMap({ lessons = [], lockedScores = [], onSelectLesson, isAdminMode = false }) {
  const [activeSubTab, setActiveSubTab] = useState('map'); // 'map' (Bản đồ) | 'list' (Danh sách)
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'completed' | 'learning' | 'not_started'
  const [selectedLesson, setSelectedLesson] = useState(lessons[0] || null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);

  // Click-to-Pin Picker Tool States
  const [isPickerMode, setIsPickerMode] = useState(false);
  const [customCoords, setCustomCoords] = useState({});
  const [pickerToast, setPickerToast] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Load custom coordinates from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vdvh_custom_coordinates');
      if (saved) {
        setCustomCoords(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load custom coordinates', e);
    }
  }, []);

  const getScoreForLesson = (lessonId) => {
    return lockedScores.find(s => s.lesson_id === lessonId);
  };

  const getLocationStatus = (lessonId) => {
    const scoreInfo = getScoreForLesson(lessonId);
    if (scoreInfo && scoreInfo.score >= 8) {
      return 'completed';
    } else if (scoreInfo && scoreInfo.score > 0) {
      return 'learning';
    }
    return 'not_started';
  };

  // 65 calibrated default coordinates for BAN-DO-VIET-NAM-05-01.jpg
  const VIETNAM_LOCATIONS_MAP = {
    // Tây Bắc
    LS_DIENBIEN: { x: 15.3, y: 15.1 },
    LS_LAICHAU: { x: 15.2, y: 11.8 },
    LS_LAOCAI: { x: 21.2, y: 11.6 },
    LS_SONLA: { x: 22.0, y: 18.0 },
    LS_HOABINH: { x: 31.9, y: 21.5 },
    LS_YENBAI: { x: 25.8, y: 15.6 },

    // Đông Bắc
    LS_HAGIANG: { x: 28.2, y: 9.6 },
    LS_CAOBANG: { x: 37.4, y: 9.6 },
    LS_BACKAN: { x: 35.3, y: 12.8 },
    LS_TUYENQUANG: { x: 30.5, y: 14.2 },
    LS_THAINGUYEN: { x: 35.1, y: 16.1 },
    LS_LANGSON: { x: 41.9, y: 14.6 },
    LS_BACGIANG: { x: 38.5, y: 17.6 },
    LS_QUANGNINH: { x: 46.4, y: 18.4 },
    LS_PHUTHO: { x: 29.3, y: 17.6 },

    // Đồng bằng Sông Hồng
    LS_HANOI: { x: 35.2, y: 18.8 },
    LS_VINHPHUC: { x: 33.0, y: 17.5 },
    LS_BACNINH: { x: 37.1, y: 19.0 },
    LS_HAIDUONG: { x: 39.1, y: 20.3 },
    LS_HAIPHONG: { x: 41.3, y: 21.2 },
    LS_HUNGYEN: { x: 36.7, y: 20.9 },
    LS_THAIBINH: { x: 39.2, y: 22.4 },
    LS_HANAM: { x: 35.9, y: 22.6 },
    LS_NAMDINH: { x: 38.2, y: 24.1 },
    LS_NINHBINH: { x: 35.4, y: 24.3 },

    // Bắc Trung Bộ
    LS_THANHHOA: { x: 33.8, y: 26.8 },
    LS_NGHEAN: { x: 30.5, y: 30.9 },
    LS_HATINH: { x: 33.7, y: 36.3 },
    LS_QUANGBINH: { x: 40.1, y: 41.6 },
    LS_QUANGTRI: { x: 44.2, y: 45.6 },
    LS_THUATHIENHUE: { x: 49.5, y: 47.9 },

    // Duyên Hải Nam Trung Bộ
    LS_DANANG: { x: 53.2, y: 49.4 },
    LS_QUANGNAM: { x: 52.7, y: 53.1 },
    LS_QUANGNGAI: { x: 58.8, y: 56.6 },
    LS_BINHDINH: { x: 60.3, y: 61.8 },
    LS_PHUYEN: { x: 61.1, y: 66.5 },
    LS_KHANHHOA: { x: 61.2, y: 72.6 },
    LS_NINHTHUAN: { x: 59.4, y: 76.2 },
    LS_BINHTHUAN: { x: 51.7, y: 79.8 },

    // Tây Nguyên
    LS_KONTUM: { x: 53.5, y: 57.6 },
    LS_GIALAI: { x: 54.5, y: 63.1 },
    LS_DAKLAK: { x: 54.8, y: 69.2 },
    LS_DAKNONG: { x: 50.0, y: 73.3 },
    LS_LAMDONG: { x: 54.7, y: 74.7 },

    // Đông Nam Bộ
    LS_BINHPHUOC: { x: 43.0, y: 77.1 },
    LS_TAYNINH: { x: 36.8, y: 77.8 },
    LS_BINHDUONG: { x: 41.6, y: 79.3 },
    LS_DONGNAI: { x: 46.2, y: 79.5 },
    LS_BARIAVUNGTAU: { x: 65.5, y: 95.5 },
    LS_TPHCM: { x: 41.4, y: 81.3 },

    // Đồng bằng Sông Cửu Long
    LS_LONGAN: { x: 37.9, y: 81.2 },
    LS_TIENGIANG: { x: 37.6, y: 83.0 },
    LS_BENTRE: { x: 62.0, y: 98.0 },
    LS_DONGTHAP: { x: 32.9, y: 82.5 },
    LS_ANGIANG: { x: 28.3, y: 82.8 },
    LS_VINHLONG: { x: 35.7, y: 85.1 },
    LS_TRAVINH: { x: 38.5, y: 87.0 },
    LS_CANTHO: { x: 31.7, y: 84.9 },
    LS_HAUGIANG: { x: 32.5, y: 87.1 },
    LS_KIENGIANG: { x: 27.5, y: 86.8 },
    LS_SOCTRANG: { x: 35.4, y: 89.0 },
    LS_BACLIEU: { x: 31.3, y: 90.2 },
    LS_CAMAU: { x: 26.8, y: 91.1 }
  };

  // Get active coordinates (prioritize custom user-clicked coordinates)
  const getMapCoordinates = (lesson) => {
    if (!lesson) return { x: 50, y: 50 };
    if (customCoords[lesson.id]) {
      return customCoords[lesson.id];
    }
    if (VIETNAM_LOCATIONS_MAP[lesson.id]) {
      return VIETNAM_LOCATIONS_MAP[lesson.id];
    }
    if (lesson.coordinates && lesson.coordinates.x && lesson.coordinates.y) {
      return lesson.coordinates;
    }
    return { x: 50, y: 50 };
  };

  const removeVietnameseTones = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .trim();
  };

  const filteredLessons = lessons.filter(lesson => {
    const q = searchQuery.trim();
    const status = getLocationStatus(lesson.id);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    if (!q) return matchesStatus;

    const normQuery = removeVietnameseTones(q);
    const normQueryNoSpace = normQuery.replace(/\s+/g, '');

    const normProvince = removeVietnameseTones(lesson.province_name);
    const normProvinceNoSpace = normProvince.replace(/\s+/g, '');

    const normName = removeVietnameseTones(lesson.name);
    const normNameNoSpace = normName.replace(/\s+/g, '');

    const normRegion = removeVietnameseTones(lesson.region);

    const matchesSearch = 
      // 1. Tìm kiếm không dấu / gõ lệch vị trí dấu (vd: "hoà", "hòa", "hoa binh")
      normProvince.includes(normQuery) ||
      normName.includes(normQuery) ||
      normRegion.includes(normQuery) ||
      // 2. Tìm kiếm gõ liền không khoảng trắng (vd: "hoabinh", "dienbien", "hanoi")
      normProvinceNoSpace.includes(normQueryNoSpace) ||
      normNameNoSpace.includes(normQueryNoSpace) ||
      // 3. Tìm kiếm có dấu chính xác (vd: "Hòa Bình", "Điện Biên")
      lesson.province_name.toLowerCase().includes(q.toLowerCase()) ||
      lesson.name.toLowerCase().includes(q.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  const getZoomStyle = () => {
    if (!isZoomedIn || !selectedLesson) {
      return {
        transformOrigin: '50% 50%',
        transform: 'translate(0%, 0%) scale(1)'
      };
    }
    const coords = getMapCoordinates(selectedLesson);
    const translateX = (50 - coords.x) * 3;
    const translateY = (50 - coords.y) * 3;
    return {
      transformOrigin: '50% 50%',
      transform: `translate(${translateX}%, ${translateY}%) scale(3)`
    };
  };

  const handleSelectLocation = (lesson) => {
    setSelectedLesson(lesson);
    setIsZoomedIn(true);
    setShowSearchDropdown(false);
  };

  const handleResetZoom = () => {
    setIsZoomedIn(false);
    setSelectedLesson(null);
  };

  // CLICK-TO-PIN PICKER HANDLER
  const handleMapClick = (e) => {
    if (!isPickerMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const percentX = Number(((clickX / rect.width) * 100).toFixed(1));
    const percentY = Number(((clickY / rect.height) * 100).toFixed(1));

    const targetLesson = selectedLesson || lessons[0];
    if (!targetLesson) return;

    const newCoords = { x: percentX, y: percentY };
    const updated = {
      ...customCoords,
      [targetLesson.id]: newCoords
    };

    setCustomCoords(updated);
    localStorage.setItem('vdvh_custom_coordinates', JSON.stringify(updated));

    setPickerToast(`✅ Đã cắm ghim cho ${targetLesson.province_name} tại (X: ${percentX}%, Y: ${percentY}%)!`);
    setTimeout(() => setPickerToast(''), 4000);
  };

  const getAllCurrentCoordinates = () => {
    const full = {};
    lessons.forEach(l => {
      full[l.id] = getMapCoordinates(l);
    });
    return full;
  };

  const handleCopyJSON = () => {
    const fullCoords = getAllCurrentCoordinates();
    navigator.clipboard.writeText(JSON.stringify(fullCoords, null, 2));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  const handleDownloadJSON = () => {
    const fullCoords = getAllCurrentCoordinates();
    const blob = new Blob([JSON.stringify(fullCoords, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vietnam_locations_coords.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetCustomCoords = () => {
    if (window.confirm('Bạn có chắc muốn đặt lại tất cả tọa độ tự chọn về mặc định?')) {
      setCustomCoords({});
      localStorage.removeItem('vdvh_custom_coordinates');
      setPickerToast('🔄 Đã đặt lại tất cả tọa độ về mặc định.');
      setTimeout(() => setPickerToast(''), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-2">
      {/* 1. SUB-TABS & STATUS BADGES HEADER WITH DEV PICKER TOOL TOGGLE */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between shrink-0 rounded-xl border">
        <div className="flex items-center gap-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveSubTab('map')}
              className={`text-xs tracking-wider font-extrabold uppercase transition-all pb-1 ${
                activeSubTab === 'map'
                  ? 'text-[#58cc02] border-b-2 border-[#58cc02]'
                  : 'text-slate-400 hover:text-slate-700 border-b-2 border-transparent'
              }`}
            >
              Bản đồ
            </button>

            <button
              onClick={() => setActiveSubTab('list')}
              className={`text-xs tracking-wider font-extrabold uppercase transition-all pb-1 ${
                activeSubTab === 'list'
                  ? 'text-[#58cc02] border-b-2 border-[#58cc02]'
                  : 'text-slate-400 hover:text-slate-700 border-b-2 border-transparent'
              }`}
            >
              Danh sách
            </button>
          </div>

          {/* TOGGLE CLICK-TO-PIN PICKER TOOL BUTTON (ADMIN ONLY) */}
          {isAdminMode && (
            <button
              onClick={() => setIsPickerMode(!isPickerMode)}
              className={`text-[11px] font-black px-3 py-1 rounded-lg border flex items-center gap-1.5 transition-all shadow-sm ${
                isPickerMode 
                  ? 'bg-purple-600 text-white border-purple-700 animate-pulse' 
                  : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              {isPickerMode ? '🎯 CHẾ ĐỘ CHẤM TỌA ĐỘ (ĐANG BẬT)' : '🎯 Bật Chế Độ Chấm Tọa Độ'}
            </button>
          )}
        </div>

        {/* STATUS BADGES */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-extrabold">
          <span className="bg-[#58cc02] text-white px-2 py-0.5 rounded-full">Đã hoàn thành</span>
          <span className="bg-[#f59e0b] text-white px-2 py-0.5 rounded-full">Đang thực hiện</span>
          <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">Chưa bắt đầu</span>
        </div>
      </div>

      {/* PICKER TOOLBAR BANNER WHEN PICKER MODE IS ON (ADMIN ONLY) */}
      {isAdminMode && isPickerMode && activeSubTab === 'map' && (
        <div className="bg-purple-900 text-white p-3 rounded-xl border border-purple-700 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs z-50">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-300 animate-bounce" />
            <div>
              <span className="font-black text-amber-300">Đang chấm tọa độ cho: </span>
              <span className="font-extrabold underline">{selectedLesson?.name || 'Chưa chọn tỉnh nào'}</span>
              <span className="ml-2 text-purple-200">
                (Tọa độ hiện tại: X = {getMapCoordinates(selectedLesson).x}%, Y = {getMapCoordinates(selectedLesson).y}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJSON}
              className="bg-purple-700 hover:bg-purple-600 text-white px-2.5 py-1 rounded-md font-bold text-[11px] flex items-center gap-1 border border-purple-500"
            >
              {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedNotification ? 'Đã Copy!' : 'Copy JSON'}
            </button>

            <button
              onClick={handleDownloadJSON}
              className="bg-purple-700 hover:bg-purple-600 text-white px-2.5 py-1 rounded-md font-bold text-[11px] flex items-center gap-1 border border-purple-500"
            >
              <Download className="w-3.5 h-3.5" />
              Tải File JSON
            </button>

            <button
              onClick={handleResetCustomCoords}
              className="bg-red-800 hover:bg-red-700 text-white px-2 py-1 rounded-md font-bold text-[11px] flex items-center gap-1 border border-red-600"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Tọa Độ
            </button>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION FOR PICKER */}
      {pickerToast && (
        <div className="bg-emerald-600 text-white font-extrabold text-xs px-3 py-2 rounded-xl shadow-lg border border-emerald-400 flex items-center justify-between animate-duo-bounce z-50">
          <span>{pickerToast}</span>
          <button onClick={() => setPickerToast('')} className="p-0.5 hover:bg-emerald-700 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. DEDICATED SEARCH BAR HEADER (TREO CỐ ĐỊNH TRÊN ĐẦU — OUTSIDE MAP) */}
      {activeSubTab === 'map' && (
        <div className="relative bg-white rounded-xl border border-slate-300 p-2 shadow-sm shrink-0 z-40">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-500 ml-2 shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm địa phương Sử - Địa (gõ tên & ấn Enter)..."
              value={searchQuery}
              onFocus={() => setShowSearchDropdown(true)}
              onChange={e => {
                const val = e.target.value;
                setSearchQuery(val);
                setShowSearchDropdown(true);

                if (val.trim()) {
                  const match = lessons.find(l => 
                    l.province_name.toLowerCase().trim() === val.toLowerCase().trim() ||
                    l.name.toLowerCase().includes(val.toLowerCase())
                  );
                  if (match) {
                    setSelectedLesson(match);
                    setIsZoomedIn(true);
                  }
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && filteredLessons.length > 0) {
                  handleSelectLocation(filteredLessons[0]);
                }
              }}
              className="w-full bg-transparent text-xs text-slate-900 font-extrabold focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); handleResetZoom(); }} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Reset Zoom Button */}
            {isZoomedIn && (
              <button
                onClick={handleResetZoom}
                className="bg-slate-900 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg border border-slate-700 shadow-md flex items-center gap-1.5 hover:bg-slate-800 transition-all shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Thu nhỏ
              </button>
            )}
          </div>

          {/* AUTOCOMPLETE DROPDOWN */}
          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-300 shadow-2xl overflow-hidden max-h-56 overflow-y-auto z-50">
              {filteredLessons.length > 0 ? (
                filteredLessons.map((lesson) => {
                  const status = getLocationStatus(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleSelectLocation(lesson)}
                      className="w-full p-2.5 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500 fill-red-500" />
                        <div>
                          <div className="text-xs font-extrabold text-slate-900">{lesson.name}</div>
                          <div className="text-[10px] text-slate-500">{lesson.region}</div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        status === 'completed' 
                          ? 'bg-[#58cc02] text-white' 
                          : status === 'learning'
                          ? 'bg-[#f59e0b] text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {status === 'completed' ? 'Đã hoàn thành' : status === 'learning' ? 'Đang thực hiện' : 'Chưa bắt đầu'}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="p-3 text-xs font-bold text-slate-400 text-center">
                  Không tìm thấy địa phương nào.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. MAP CANVAS CONTAINER (KHUNG BẢN ĐỒ HOÀN TOÀN TÁCH BIỆT BÊN DƯỚI) */}
      {activeSubTab === 'map' && (
        <div className="relative flex-1 w-full h-[calc(100vh-140px)] min-h-[500px] bg-[#eaf4ff] rounded-xl border border-slate-300 shadow-sm overflow-hidden flex items-center justify-center">
          
          {/* MAP CANVAS WRAPPER (ASPECT RATIO 1000/1414 MATCHING BAN-DO-VIET-NAM-05-01.jpg) */}
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            <div 
              onClick={handleMapClick}
              className={`relative h-full aspect-[1000/1414] transition-all duration-700 cubic-bezier(0.25, 1, 0.5, 1) transform-gpu ${
                isPickerMode ? 'cursor-crosshair ring-4 ring-purple-500 rounded-lg' : ''
              }`}
              style={getZoomStyle()}
            >
              <img 
                src="/BAN-DO-VIET-NAM-05-01.jpg" 
                alt="Bản đồ Việt Nam Vector"
                className="w-full h-full object-cover pointer-events-none select-none"
                onError={(e) => {
                  e.target.src = "/vietnam-map.jpg";
                }}
              />

              {/* COMPACT GOOGLE MAPS RED LOCATION PIN (1/4 SIZE, NO EXTRA BLACK BADGE BOX) */}
              {(isZoomedIn || isPickerMode) && selectedLesson && (() => {
                const lesson = selectedLesson;
                const status = getLocationStatus(lesson.id);
                const coords = getMapCoordinates(lesson);

                return (
                  <div
                    key={lesson.id}
                    className="absolute transform -translate-x-1/2 -translate-y-full z-30 pointer-events-none"
                    style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                  >
                    <div className="relative flex flex-col items-center">
                      {/* AUTHENTIC COMPACT GOOGLE MAPS RED PIN */}
                      <div className="relative filter drop-shadow-md">
                        <svg 
                          width="12" 
                          height="16" 
                          viewBox="0 0 384 512" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z" 
                            fill="#EA4335"
                          />
                          <circle cx="192" cy="192" r="72" fill="#FFFFFF" />
                        </svg>

                        {/* Subtle pulsing ring under pin tip */}
                        <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1 bg-red-600/50 rounded-full animate-ping" />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* LOCATION DETAILS CARD AT BOTTOM */}
          {selectedLesson && !isPickerMode && (
            <div className="fixed sm:absolute bottom-[61px] sm:bottom-3 left-3 right-3 sm:left-3 sm:right-auto sm:w-80 bg-white border border-slate-300 rounded-xl p-3 z-40 animate-duo-bounce">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500 shrink-0">
                    <MapPin className="w-5 h-5 fill-red-500" />
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-slate-900 leading-tight">
                      {selectedLesson.location_name || selectedLesson.province_name || selectedLesson.name}
                      {selectedLesson.subtitle && (
                        <span className="font-bold text-slate-700"> — {selectedLesson.subtitle}</span>
                      )}
                    </h3>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                      {selectedLesson.region}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedLesson(null)} 
                  className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all shrink-0"
                  title="Đóng"
                >
                  <X className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>

              {/* ROW: STATUS (LEFT) & SCORE (RIGHT) */}
              {(() => {
                const status = getLocationStatus(selectedLesson.id);
                const scoreInfo = getScoreForLesson(selectedLesson.id);
                const hasScore = scoreInfo && typeof scoreInfo.score === 'number';

                return (
                  <div className="mb-2.5 flex items-center justify-between gap-2">
                    {/* CANH TRÁI: TRẠNG THÁI */}
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      status === 'completed'
                        ? 'bg-[#58cc02] text-white'
                        : status === 'learning'
                        ? 'bg-[#f59e0b] text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {status === 'completed' 
                        ? 'Đã hoàn thành' 
                        : status === 'learning'
                        ? 'Đang thực hiện'
                        : 'Chưa bắt đầu'}
                    </span>

                    {/* CANH PHẢI: ĐIỂM SỐ */}
                    <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      {hasScore ? `Điểm: ${scoreInfo.score}đ` : 'Chưa có điểm'}
                    </span>
                  </div>
                );
              })()}

              <button
                data-testid={`btn-quiz-popup-${selectedLesson.id}`}
                onClick={() => onSelectLesson(selectedLesson.id)}
                className="w-full btn-duo-green py-2 text-xs font-extrabold gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                Vào bài kiểm tra
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DANH SÁCH CHẶNG BÀI HỌC (LIST VIEW) */}
      {activeSubTab === 'list' && (() => {
        const attempts = JSON.parse(localStorage.getItem('vdvh_quiz_attempts') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('vdvh_current_user') || '{}');
        const studentAttempts = attempts.filter(a => a.student_id === currentUser?.uid);

        const listLessons = filteredLessons
          .filter(lesson => {
            const status = getLocationStatus(lesson.id);
            const hasAttempt = studentAttempts.some(a => a.lesson_id === lesson.id);
            const scoreInfo = getScoreForLesson(lesson.id);
            // REQUIREMENT 3: Only display lessons where student HAS clicked to do quiz
            return status !== 'not_started' || hasAttempt || scoreInfo != null;
          })
          .sort((a, b) => {
            const statusA = getLocationStatus(a.id);
            const statusB = getLocationStatus(b.id);

            // Primary order: 'learning' (in_progress) on top (1), 'completed' below (2)
            const rankA = statusA === 'learning' ? 1 : 2;
            const rankB = statusB === 'learning' ? 1 : 2;

            if (rankA !== rankB) {
              return rankA - rankB;
            }

            // Secondary order: started_at timestamp descending (newest first)
            const attemptsA = studentAttempts.filter(att => att.lesson_id === a.id);
            const attemptsB = studentAttempts.filter(att => att.lesson_id === b.id);

            const timeA = attemptsA.length > 0
              ? Math.max(...attemptsA.map(att => new Date(att.started_at || 0).getTime()))
              : (getScoreForLesson(a.id)?.submitted_at ? new Date(getScoreForLesson(a.id).submitted_at).getTime() : 0);

            const timeB = attemptsB.length > 0
              ? Math.max(...attemptsB.map(att => new Date(att.started_at || 0).getTime()))
              : (getScoreForLesson(b.id)?.submitted_at ? new Date(getScoreForLesson(b.id).submitted_at).getTime() : 0);

            return timeB - timeA;
          });

        if (listLessons.length === 0) {
          return (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3 my-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-800">Chưa Có Bài Quiz Nào Đang Thực Hiện</h3>
              <p className="text-xs font-semibold text-slate-500 max-w-sm mx-auto">
                Hãy chuyển sang tab <span className="font-extrabold text-[#58cc02]">Bản đồ</span>, chọn một địa phương bất kỳ và bấm vào <span className="font-extrabold text-sky-600">Vào bài kiểm tra</span> để khởi tạo hành trình!
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {listLessons.map((lesson) => {
                const scoreInfo = getScoreForLesson(lesson.id);
                const status = getLocationStatus(lesson.id);

                return (
                  <div key={lesson.id} data-testid={`lesson-card-${lesson.id}`} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 hover:border-emerald-400 transition-all shadow-sm">
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-xs text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        {lesson.region}
                      </span>

                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        status === 'completed' 
                          ? 'bg-[#58cc02] text-white' 
                          : status === 'learning'
                          ? 'bg-[#f59e0b] text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {status === 'completed' 
                          ? `Đã hoàn thành (${scoreInfo?.score || 0}đ)` 
                          : status === 'learning'
                          ? `Đang thực hiện ${scoreInfo?.score ? `(${scoreInfo.score}đ)` : ''}`
                          : 'Chưa bắt đầu'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm">
                      {lesson.location_name || lesson.province_name || lesson.name}
                      {lesson.subtitle && (
                        <span className="font-normal text-slate-600"> — {lesson.subtitle}</span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{lesson.intro_text}</p>

                    <button
                      data-testid={`btn-quiz-${lesson.id}`}
                      onClick={() => onSelectLesson(lesson.id)}
                      className="w-full btn-duo-green py-2 text-xs gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      Tiếp tục làm bài
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

