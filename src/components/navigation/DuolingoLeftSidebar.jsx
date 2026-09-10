import React from 'react';
import { 
  Compass, MapPin, ShoppingBag, Trophy, User, LogOut
} from 'lucide-react';
import AvatarCanvas from '../avatar/AvatarCanvas';
import { useActiveTheme } from '../../services/theme';

export default function DuolingoLeftSidebar({ 
  activeTab, 
  onTabChange, 
  studentData, 
  onLogout 
}) {
  const { logoUrl } = useActiveTheme();

  return (
    <aside className="w-56 bg-white border-r border-slate-200 fixed top-0 bottom-0 left-0 z-40 p-3 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        {/* BRAND LOGO */}
        <div className="flex items-center gap-2.5 px-2 pt-2">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-[#58cc02]/30 bg-[#58cc02]/10 shrink-0">
            <img 
              src={logoUrl} 
              alt="Logo Raccoon" 
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          </div>
          <div>
            <h1 className="text-base font-black text-[#58cc02] tracking-tight leading-none">
              VỪA ĐI VỪA HỌC
            </h1>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase">Lịch sử & Địa Lý</span>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="space-y-1">
          <button
            onClick={() => onTabChange('map')}
            className={`w-full duo-nav-link ${activeTab === 'map' ? 'active' : ''}`}
          >
            <MapPin className="w-5 h-5 text-[#58cc02]" />
            <span>HÀNH TRÌNH</span>
          </button>

          <button
            onClick={() => onTabChange('wardrobe')}
            className={`w-full duo-nav-link ${activeTab === 'wardrobe' ? 'active' : ''}`}
          >
            <ShoppingBag className="w-5 h-5 text-[#ce82ff]" />
            <span>TỦ ĐỒ 2D</span>
          </button>

          <button
            onClick={() => onTabChange('leaderboard')}
            className={`w-full duo-nav-link ${activeTab === 'leaderboard' ? 'active' : ''}`}
          >
            <Trophy className="w-5 h-5 text-[#ffb800]" />
            <span>XẾP HẠNG</span>
          </button>

          <button
            onClick={() => onTabChange('profile')}
            className={`w-full duo-nav-link ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <User className="w-5 h-5 text-sky-500" />
            <span>HỒ SƠ HỌC SINH</span>
          </button>
        </nav>
      </div>

      {/* USER PROFILE BOTTOM CARD */}
      <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
        <button 
          onClick={() => onTabChange('profile')}
          className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-xl transition-colors text-left flex-1 min-w-0"
        >
          <AvatarCanvas avatarConfig={studentData?.avatar_config} size={36} />
          <div className="text-left min-w-0 flex-1">
            <div className="font-extrabold text-xs sidebar-user-name truncate">
              {studentData?.name || 'Nguyễn Văn A'}
            </div>
            <div className="text-[10px] sidebar-user-subtext font-bold truncate">
              {studentData?.class || 'Lớp 8A1'} • ⭐ {studentData?.current_star || 0}
            </div>
          </div>
        </button>

        <button 
          onClick={onLogout} 
          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors shrink-0 ml-1"
          title="Đăng xuất"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
