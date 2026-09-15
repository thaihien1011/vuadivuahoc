import React, { useState, useEffect } from 'react';
import { Shirt, Star, Scissors, Footprints, Check, RotateCcw, Sparkles, X, User } from 'lucide-react';
import AvatarCanvas from '../avatar/AvatarCanvas';
import { WARDROBE_ITEMS_CATALOG, WARDROBE_SLOTS } from '../../config/constants';
import { purchaseWardrobeItem, equipWardrobeItem, unequipWardrobeSlot, getLiveStudentWardrobe, getCurrentAuthUser } from '../../services/api';

export default function WardrobeShop({ studentData, onUpdateStudent }) {
  const [activeSlotFilter, setActiveSlotFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all'); // 'all' | 'female' | 'male'
  const [ownedItemIds, setOwnedItemIds] = useState([]);
  const [loadingAction, setLoadingAction] = useState(null);

  const currentUser = getCurrentAuthUser();
  const currentAvatarConfig = studentData?.avatar_config || {};
  const currentUserId = currentUser?.uid;

  const studentGender = studentData?.gender || currentUser?.gender || 'female';
  const studentBody = studentData?.body || (studentGender === 'female' ? 'base_female' : 'base');

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: 'instant' });

    async function loadOwnedItems() {
      if (currentUserId) {
        const liveOwned = await getLiveStudentWardrobe(currentUserId);
        setOwnedItemIds(liveOwned);
      }
    }
    loadOwnedItems();
  }, [currentUserId, studentData]);

  const handleBuyItem = async (item) => {
    if ((studentData?.current_star || 0) < item.star_cost) {
      alert(`Bạn cần có ${item.star_cost} Star 🌟 để mua món đồ này. Hãy làm bài quiz để tích lũy thêm Star nhé!`);
      return;
    }

    try {
      setLoadingAction(item.id);
      await purchaseWardrobeItem(item.id);
      const liveOwned = await getLiveStudentWardrobe(currentUserId);
      setOwnedItemIds(liveOwned);
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
      alert(err.message || 'Lỗi mặc/tháo đồ');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUnequipSlot = async (slotKey) => {
    try {
      setLoadingAction(slotKey);
      await unequipWardrobeSlot(slotKey);
      if (onUpdateStudent) onUpdateStudent();
    } catch (err) {
      alert(err.message || 'Lỗi tháo đồ');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUnequipAll = async () => {
    try {
      setLoadingAction('all_slots');
      await unequipWardrobeSlot(WARDROBE_SLOTS.HAIR);
      await unequipWardrobeSlot(WARDROBE_SLOTS.TOP);
      await unequipWardrobeSlot(WARDROBE_SLOTS.BOTTOM_OR_SKIRT);
      await unequipWardrobeSlot(WARDROBE_SLOTS.FOOTWEAR);
      if (onUpdateStudent) onUpdateStudent();
    } catch (err) {
      alert(err.message || 'Lỗi tháo tất cả trang phục');
    } finally {
      setLoadingAction(null);
    }
  };

  const filteredItems = WARDROBE_ITEMS_CATALOG.filter(item => {
    const matchesSlot = activeSlotFilter === 'all' || item.slot === activeSlotFilter;
    const matchesGender = genderFilter === 'all' || 
      item.gender_target === genderFilter || 
      item.gender_target === 'unisex' || 
      item.gender_target === 'all';
    return matchesSlot && matchesGender;
  });

  const getEquippedItem = (slotKey) => {
    const itemId = currentAvatarConfig[slotKey];
    if (!itemId) return null;
    return WARDROBE_ITEMS_CATALOG.find(i => i.id === itemId) || null;
  };

  const hasEquippedAny = Object.values(currentAvatarConfig).some(val => !!val);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER TITLE & STAR BALANCE CARD */}
      <div className="bg-white border border-slate-200 p-4 md:p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-purple-100 border border-purple-300 rounded-xl flex items-center justify-center text-purple-700 shadow-sm">
              <Shirt className="w-6 h-6 shrink-0" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Tủ Đồ Nhân Vật 2D
              </h1>
              <p className="text-xs font-semibold text-slate-500">
                Thay đổi trang phục & Tháo mặc đồ dễ dàng bằng Star tích lũy
              </p>
            </div>
          </div>
        </div>

        {/* PROMINENT STAR BALANCE CARD */}
        <div className="flex items-center gap-3 bg-amber-50 border-2 border-amber-300 px-4 py-2.5 rounded-2xl shadow-sm self-start md:self-auto">
          <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center text-amber-950 shadow-sm animate-bounce">
            <Star className="w-5 h-5 fill-amber-950" />
          </div>
          <div>
            <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
              Số Star hiện có:
            </div>
            <div className="text-xl font-black text-amber-900 leading-none">
              {studentData?.current_star || 0} ⭐
            </div>
          </div>
        </div>
      </div>

      {/* MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {/* LEFT COLUMN: LIVE 2D AVATAR SHOWCASE */}
        <div className="space-y-3.5">
          {/* Gender & Body Indicator */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold shadow-sm">
            <span className="text-slate-500 flex items-center gap-1.5">
              <User className="w-4 h-4 text-purple-600" />
              <span>Giới tính:</span>
            </span>
            <span className={`px-2.5 py-1 rounded-full font-black text-xs ${
              studentGender === 'female' 
                ? 'bg-pink-100 text-pink-700 border border-pink-300' 
                : 'bg-sky-100 text-sky-700 border border-sky-300'
            }`}>
              {studentGender === 'female' ? '👧 Nữ (Body Female)' : '👦 Nam (Base Body)'}
            </span>
          </div>

          {/* Avatar Canvas Container */}
          <div className="bg-[#362A5C] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[240px] shadow-sm relative border-2 border-purple-500/40">
            <AvatarCanvas 
              avatarConfig={currentAvatarConfig} 
              gender={studentGender} 
              body={studentBody} 
              size={190} 
            />
            {hasEquippedAny && (
              <button
                onClick={handleUnequipAll}
                className="mt-3 bg-purple-900/80 hover:bg-rose-600 text-purple-200 hover:text-white border border-purple-400/30 px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition-all shadow-sm"
                title="Bấm để tháo toàn bộ trang phục về thân body gốc"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tháo tất cả đồ về Body</span>
              </button>
            )}
          </div>

          {/* Equipped Info & Unequip Actions Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5 shadow-sm">
            <div className="font-black text-slate-800 border-b border-slate-100 pb-1.5 flex items-center justify-between">
              <span>Trang phục đang mặc:</span>
              <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md">
                {hasEquippedAny ? 'Có đồ đang mặc' : 'Thân Body Gốc'}
              </span>
            </div>

            {[
              { slot: WARDROBE_SLOTS.HAIR, label: 'Tóc' },
              { slot: WARDROBE_SLOTS.TOP, label: 'Áo' },
              { slot: WARDROBE_SLOTS.BOTTOM_OR_SKIRT, label: 'Quần / Váy' },
              { slot: WARDROBE_SLOTS.FOOTWEAR, label: 'Giày' }
            ].map(({ slot, label }) => {
              const item = getEquippedItem(slot);
              return (
                <div key={slot} className="flex items-center justify-between text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-400">{label}:</span>
                    <span className="font-bold text-slate-900">
                      {item ? item.name : <span className="text-slate-400 font-normal italic">Body gốc</span>}
                    </span>
                  </div>
                  {item && (
                    <button
                      onClick={() => handleUnequipSlot(slot)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                      title={`Tháo ${item.name}`}
                    >
                      <X className="w-3 h-3" /> Tháo
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: CATALOG GRID & FILTERS */}
        <div className="md:col-span-2 space-y-4">
          {/* Slot & Gender Filter Controls */}
          <div className="bg-white border border-slate-200 p-3 rounded-2xl space-y-2.5 shadow-sm">
            {/* Category Slot Tabs */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveSlotFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                  activeSlotFilter === 'all'
                    ? 'bg-[#362A5C] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả loại
              </button>
              <button
                onClick={() => setActiveSlotFilter(WARDROBE_SLOTS.HAIR)}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${
                  activeSlotFilter === WARDROBE_SLOTS.HAIR
                    ? 'bg-[#362A5C] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" /> Tóc
              </button>
              <button
                onClick={() => setActiveSlotFilter(WARDROBE_SLOTS.TOP)}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${
                  activeSlotFilter === WARDROBE_SLOTS.TOP
                    ? 'bg-[#362A5C] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Shirt className="w-3.5 h-3.5" /> Áo
              </button>
              <button
                onClick={() => setActiveSlotFilter(WARDROBE_SLOTS.BOTTOM_OR_SKIRT)}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${
                  activeSlotFilter === WARDROBE_SLOTS.BOTTOM_OR_SKIRT
                    ? 'bg-[#362A5C] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Quần / Váy
              </button>
              <button
                onClick={() => setActiveSlotFilter(WARDROBE_SLOTS.FOOTWEAR)}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${
                  activeSlotFilter === WARDROBE_SLOTS.FOOTWEAR
                    ? 'bg-[#362A5C] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Footprints className="w-3.5 h-3.5" /> Giày
              </button>
            </div>

            {/* Gender Filter Pills */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs font-bold">
              <span className="text-slate-400 text-[11px]">Giới tính trang phục:</span>
              <button
                onClick={() => setGenderFilter('all')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold transition-all ${
                  genderFilter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setGenderFilter('female')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold transition-all ${
                  genderFilter === 'female'
                    ? 'bg-pink-600 text-white'
                    : 'bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200'
                }`}
              >
                👧 Nữ
              </button>
              <button
                onClick={() => setGenderFilter('male')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold transition-all ${
                  genderFilter === 'male'
                    ? 'bg-sky-600 text-white'
                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
                }`}
              >
                👦 Nam
              </button>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredItems.map((item) => {
              const isOwned = ownedItemIds.includes(item.id);
              const isEquipped = currentAvatarConfig[item.slot] === item.id;
              const isLoading = loadingAction === item.id;

              const slotFolder = item.slot === WARDROBE_SLOTS.BOTTOM_OR_SKIRT ? 'bottom' : item.slot;
              const thumbPath = `/assets/avatar/thumb/${slotFolder}/${item.fileName || `${item.id}.png`}`;
              const fullImgPath = item.imagePath || `/assets/avatar/${slotFolder}/${item.id}.png`;

              // Gender badge renderer
              const isItemFemale = item.gender_target === 'female';
              const isItemMale = item.gender_target === 'male';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between min-h-[240px] transition-all shadow-sm ${
                    isEquipped
                      ? 'bg-[#362A5C] text-white border-purple-500 ring-2 ring-purple-400/50'
                      : 'bg-white text-slate-900 border-purple-200 hover:border-purple-500'
                  }`}
                >
                  <div className="space-y-2">
                    {/* SKIN PREVIEW CONTAINER WITH GENDER BADGE OVERLAY */}
                    <div className="w-full h-32 bg-white rounded-xl border-2 border-purple-500/60 flex items-center justify-center p-2 relative overflow-hidden group shadow-inner">
                      {/* GENDER TARGET BADGE OVERLAY ON TOP-RIGHT */}
                      <div className="absolute top-1.5 right-1.5 z-20">
                        {isItemFemale ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-pink-100 text-pink-700 border border-pink-300 shadow-sm flex items-center gap-0.5">
                            👧 Nữ
                          </span>
                        ) : isItemMale ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-sky-100 text-sky-700 border border-sky-300 shadow-sm flex items-center gap-0.5">
                            👦 Nam
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-100 text-purple-700 border border-purple-300 shadow-sm flex items-center gap-0.5">
                            ✨ Nam & Nữ
                          </span>
                        )}
                      </div>

                      <img 
                        src={thumbPath} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = fullImgPath;
                        }}
                        className="max-h-[75%] max-w-[75%] w-auto h-auto object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-110 z-10 pointer-events-none"
                      />
                    </div>

                    <div>
                      <h4 className="font-extrabold text-xs mb-1 line-clamp-1">
                        {item.name}
                      </h4>

                      {!isOwned && (
                        <div className="flex items-center gap-1 text-amber-500 font-extrabold text-[11px]">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{item.star_cost} sao</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACTION BUTTON: EQUIP / UNEQUIP TOGGLE OR BUY */}
                  <div className="pt-2">
                    {isEquipped ? (
                      <button
                        onClick={() => handleEquipItem(item)}
                        disabled={isLoading}
                        className="w-full bg-slate-800 hover:bg-rose-600 text-white font-extrabold py-1.5 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 transition-colors shadow-sm"
                        title="Đang mặc - Bấm để tháo món đồ này ra"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Đang mặc (Bấm tháo)</span>
                      </button>
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
                        Mua ngay ({item.star_cost} ⭐)
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
