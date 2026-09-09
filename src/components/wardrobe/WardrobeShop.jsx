import React, { useState, useEffect } from 'react';
import { Shirt, Star, CheckCircle2, Scissors, Footprints, Check } from 'lucide-react';
import AvatarCanvas from '../avatar/AvatarCanvas';
import { WARDROBE_ITEMS_CATALOG, WARDROBE_SLOTS } from '../../config/constants';
import { purchaseWardrobeItem, equipWardrobeItem, getCurrentAuthUser } from '../../services/api';

export default function WardrobeShop({ studentData, onUpdateStudent }) {
  const [activeSlotFilter, setActiveSlotFilter] = useState('all');
  const [ownedItemIds, setOwnedItemIds] = useState([]);
  const [loadingAction, setLoadingAction] = useState(null);

  const currentUser = getCurrentAuthUser();
  const currentAvatarConfig = studentData?.avatar_config || {};
  const currentUserId = currentUser?.uid;

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Load owned items from localStorage
    const savedWardrobes = JSON.parse(localStorage.getItem('vdvh_student_wardrobe') || '[]');
    const studentOwned = savedWardrobes
      .filter(w => w.student_id === currentUserId)
      .map(w => w.item_id);

    setOwnedItemIds(studentOwned);
  }, [currentUserId, studentData]);

  const handleBuyItem = async (item) => {
    if ((studentData?.current_star || 0) < item.star_cost) {
      alert(`Bạn cần có ${item.star_cost} Star 🌟 để mua món đồ này. Hãy làm bài quiz để tích lũy thêm Star nhé!`);
      return;
    }

    try {
      setLoadingAction(item.id);
      await purchaseWardrobeItem(item.id);
      setOwnedItemIds(prev => [...prev, item.id]);
      if (onUpdateStudent) onUpdateStudent();
    } catch (err) {
      alert(err.message || 'Lỗi mua đồ');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEquipItem = async (item) => {
    try {
      setLoadingAction(item.id);
      await equipWardrobeItem(item.id);
      if (onUpdateStudent) onUpdateStudent();
    } catch (err) {
      alert(err.message || 'Lỗi mặc đồ');
    } finally {
      setLoadingAction(null);
    }
  };

  const filteredItems = WARDROBE_ITEMS_CATALOG.filter(item => {
    if (activeSlotFilter === 'all') return true;
    return item.slot === activeSlotFilter;
  });

  const getEquippedName = (slotKey) => {
    const itemId = currentAvatarConfig[slotKey];
    if (!itemId) return 'Mặc định';
    const found = WARDROBE_ITEMS_CATALOG.find(i => i.id === itemId);
    return found ? found.name : 'Mặc định';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER TITLE */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <Shirt className="w-6 h-6 text-purple-600 shrink-0" />
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            Tủ đồ nhân vật
          </h1>
        </div>
        <p className="text-xs font-semibold text-slate-500 pl-8">
          Đổi trang phục bằng Star tích lũy
        </p>
      </div>

      {/* MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {/* LEFT COLUMN: LIVE 2D AVATAR SHOWCASE */}
        <div className="space-y-3">
          {/* Avatar Canvas Container */}
          <div className="bg-[#362A5C] rounded-xl p-6 flex items-center justify-center min-h-[220px] shadow-sm">
            <AvatarCanvas avatarConfig={currentAvatarConfig} size={180} />
          </div>

          {/* Equipped Info Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-1.5 shadow-sm">
            <div className="text-slate-800">
              <span className="font-semibold text-slate-500">Tóc:</span> <span className="font-bold">{getEquippedName(WARDROBE_SLOTS.HAIR)}</span>
            </div>
            <div className="text-slate-800">
              <span className="font-semibold text-slate-500">Áo:</span> <span className="font-bold">{getEquippedName(WARDROBE_SLOTS.TOP)}</span>
            </div>
            <div className="text-slate-800">
              <span className="font-semibold text-slate-500">Quần / Váy:</span> <span className="font-bold">{getEquippedName(WARDROBE_SLOTS.BOTTOM_OR_SKIRT)}</span>
            </div>
            <div className="text-slate-800">
              <span className="font-semibold text-slate-500">Giày:</span> <span className="font-bold">{getEquippedName(WARDROBE_SLOTS.FOOTWEAR)}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CATALOG GRID */}
        <div className="md:col-span-2 space-y-4">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSlotFilter('all')}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                activeSlotFilter === 'all'
                  ? 'bg-[#362A5C] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveSlotFilter(WARDROBE_SLOTS.HAIR)}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
                activeSlotFilter === WARDROBE_SLOTS.HAIR
                  ? 'bg-[#362A5C] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" /> Tóc
            </button>
            <button
              onClick={() => setActiveSlotFilter(WARDROBE_SLOTS.TOP)}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
                activeSlotFilter === WARDROBE_SLOTS.TOP
                  ? 'bg-[#362A5C] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" /> Áo
            </button>
            <button
              onClick={() => setActiveSlotFilter(WARDROBE_SLOTS.BOTTOM_OR_SKIRT)}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
                activeSlotFilter === WARDROBE_SLOTS.BOTTOM_OR_SKIRT
                  ? 'bg-[#362A5C] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Quần / Váy
            </button>
            <button
              onClick={() => setActiveSlotFilter(WARDROBE_SLOTS.FOOTWEAR)}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
                activeSlotFilter === WARDROBE_SLOTS.FOOTWEAR
                  ? 'bg-[#362A5C] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" /> Giày
            </button>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredItems.map((item) => {
              const isOwned = ownedItemIds.includes(item.id);
              const isEquipped = currentAvatarConfig[item.slot] === item.id;
              const isLoading = loadingAction === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between min-h-[140px] transition-all ${
                    isEquipped
                      ? 'bg-[#362A5C] text-white border-[#362A5C]'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <div>
                    <h4 className="font-extrabold text-xs mb-1 line-clamp-2">
                      {item.name}
                    </h4>

                    {!isEquipped && (
                      <div className="flex items-center gap-1 text-amber-600 font-extrabold text-[11px]">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{item.star_cost} sao</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3">
                    {isEquipped ? (
                      <div className="space-y-1">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-[11px] font-extrabold text-emerald-300 block">
                          Đang mặc
                        </span>
                      </div>
                    ) : isOwned ? (
                      <button
                        onClick={() => handleEquipItem(item)}
                        disabled={isLoading}
                        className="w-full btn-duo-outline py-1.5 text-xs justify-center font-bold"
                      >
                        Mặc vào
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyItem(item)}
                        disabled={isLoading}
                        className="w-full btn-duo-green py-1.5 text-xs justify-center font-bold"
                      >
                        Mua ngay
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
