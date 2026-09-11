import React, { useState } from 'react';
import { WARDROBE_ITEMS_CATALOG } from '../../config/constants';

/**
 * AvatarCanvas - Dynamic 2D Layered Avatar Renderer (PNG Layers with SVG Fallback)
 * Layers Order (Z-Index from bottom to top):
 * 1. Base Body / Skin (public/assets/avatar/body/base.png)
 * 2. Bottom / Skirt (public/assets/avatar/bottom/<id>.png)
 * 3. Footwear (public/assets/avatar/footwear/<id>.png)
 * 4. Top / Shirt (public/assets/avatar/top/<id>.png)
 * 5. Hair / Hat (public/assets/avatar/hair/<id>.png)
 */
export default function AvatarCanvas({ avatarConfig = {}, body = null, gender = null, size = 160, className = '' }) {
  const [imgErrors, setImgErrors] = useState({});

  // Determine body type: base (boy) vs base_female (girl)
  let activeBody = body;
  if (!activeBody) {
    if (gender) {
      activeBody = (gender === 'female' || gender === 'nữ' || gender === 'Nữ') ? 'base_female' : 'base';
    } else {
      const user = JSON.parse(localStorage.getItem('vdvh_current_user') || '{}');
      const students = JSON.parse(localStorage.getItem('vdvh_students') || '[]');
      const st = students.find(s => s.id === user?.uid);
      const studentGender = st?.gender || user?.gender || 'female';
      activeBody = st?.body || (studentGender === 'female' || studentGender === 'nữ' ? 'base_female' : 'base');
    }
  }

  if (activeBody === 'body_female') {
    activeBody = 'base_female';
  }

  const getEquippedItem = (slot) => {
    const itemId = avatarConfig ? avatarConfig[slot] : null;
    return itemId ? WARDROBE_ITEMS_CATALOG.find(i => i.id === itemId) : null;
  };

  const hairItem = getEquippedItem('hair');
  const topItem = getEquippedItem('top');
  const bottomItem = getEquippedItem('bottom_or_skirt');
  const footwearItem = getEquippedItem('footwear');

  const handleImageError = (key) => {
    setImgErrors(prev => ({ ...prev, [key]: true }));
  };

  // PNG Layer Image Paths
  const bodyPng = activeBody === 'base_female'
    ? '/assets/avatar/body/base_female.png' 
    : '/assets/avatar/body/base.png';
  const bottomPng = bottomItem?.imagePath || (bottomItem ? `/assets/avatar/bottom/${bottomItem.id}.png` : null);
  const footwearPng = footwearItem?.imagePath || (footwearItem ? `/assets/avatar/footwear/${footwearItem.id}.png` : null);
  const topPng = topItem?.imagePath || (topItem ? `/assets/avatar/top/${topItem.id}.png` : null);
  const hairPng = hairItem?.imagePath || (hairItem ? `/assets/avatar/hair/${hairItem.id}.png` : null);

  const hasPngAssets = !imgErrors['body'] || !imgErrors['hair'] || !imgErrors['top'];

  return (
    <div 
      className={`relative inline-flex items-center justify-center rounded-xl bg-[#362A5C] border border-purple-400/30 p-2 shadow-sm overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 1. PNG LAYER STACKING RENDERER */}
      <div className="relative w-full h-full">
        {/* Layer 1: Base Body */}
        {!imgErrors['body'] && (
          <img 
            src={bodyPng} 
            alt="Base Body" 
            onError={() => handleImageError('body')}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10" 
          />
        )}

        {/* Layer 2: Bottom / Skirt */}
        {bottomPng && !imgErrors[bottomItem?.id] && (
          <img 
            src={bottomPng} 
            alt="Bottom" 
            onError={() => handleImageError(bottomItem?.id)}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20" 
          />
        )}

        {/* Layer 3: Footwear */}
        {footwearPng && !imgErrors[footwearItem?.id] && (
          <img 
            src={footwearPng} 
            alt="Footwear" 
            onError={() => handleImageError(footwearItem?.id)}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-30" 
          />
        )}

        {/* Layer 4: Top */}
        {topPng && !imgErrors[topItem?.id] && (
          <img 
            src={topPng} 
            alt="Top" 
            onError={() => handleImageError(topItem?.id)}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-40" 
          />
        )}

        {/* Layer 5: Hair */}
        {hairPng && !imgErrors[hairItem?.id] && (
          <img 
            src={hairPng} 
            alt="Hair" 
            onError={() => handleImageError(hairItem?.id)}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-50" 
          />
        )}

        {/* 2. SVG FALLBACK RENDERER (Renders when PNG assets are not present) */}
        {imgErrors['body'] && (
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
            <defs>
              <radialGradient id="avatarGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0b1120" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="90" fill="url(#avatarGlow)" />

            {/* BASE BODY & SKIN */}
            <ellipse cx="100" cy="70" rx="32" ry="36" fill="#fbcfe8" />
            <circle cx="66" cy="72" r="7" fill="#fbcfe8" />
            <circle cx="134" cy="72" r="7" fill="#fbcfe8" />
            <ellipse cx="88" cy="68" rx="4" ry="5" fill="#1e1b4b" />
            <ellipse cx="112" cy="68" rx="4" ry="5" fill="#1e1b4b" />
            <circle cx="89" cy="66" r="1.5" fill="#ffffff" />
            <circle cx="113" cy="66" r="1.5" fill="#ffffff" />
            <path d="M 92 82 Q 100 90 108 82" fill="none" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="80" cy="76" r="4" fill="#f43f5e" opacity="0.3" />
            <circle cx="120" cy="76" r="4" fill="#f43f5e" opacity="0.3" />
            <rect x="93" y="102" width="14" height="14" fill="#f87171" opacity="0.6" rx="3" />

            {/* LAYER 1: BOTTOM */}
            {bottomItem?.id === 'wi_bottom_002' ? (
              <path d="M 75 145 L 65 175 L 135 175 L 125 145 Z" fill="#f43f5e" />
            ) : bottomItem?.id === 'wi_bottom_003' ? (
              <g>
                <rect x="74" y="145" width="24" height="22" rx="3" fill="#84cc16" />
                <rect x="102" y="145" width="24" height="22" rx="3" fill="#84cc16" />
              </g>
            ) : (
              <g>
                <rect x="76" y="145" width="22" height="36" rx="4" fill="#0ea5e9" />
                <rect x="102" y="145" width="22" height="36" rx="4" fill="#0ea5e9" />
              </g>
            )}

            {/* LAYER 2: FOOTWEAR */}
            {footwearItem?.id === 'wi_shoes_002' ? (
              <g fill="#d97706">
                <rect x="72" y="172" width="26" height="18" rx="4" />
                <rect x="102" y="172" width="26" height="18" rx="4" />
              </g>
            ) : footwearItem?.id === 'wi_shoes_003' ? (
              <g fill="#65a30d">
                <rect x="74" y="180" width="24" height="8" rx="2" />
                <rect x="102" y="180" width="24" height="8" rx="2" />
              </g>
            ) : (
              <g fill="#06b6d4">
                <ellipse cx="84" cy="184" rx="13" ry="7" />
                <ellipse cx="116" cy="184" rx="13" ry="7" />
                <rect x="75" y="186" width="20" height="3" fill="#ffffff" />
                <rect x="107" y="186" width="20" height="3" fill="#ffffff" />
              </g>
            )}

            {/* LAYER 3: TOP */}
            {topItem?.id === 'wi_top_002' ? (
              <path d="M 68 112 Q 100 106 132 112 L 126 165 L 74 165 Z" fill="#10b981" />
            ) : topItem?.id === 'wi_top_003' ? (
              <g fill="#8b5cf6">
                <rect x="68" y="112" width="64" height="42" rx="8" />
                <rect x="88" y="132" width="24" height="16" fill="#7c3aed" rx="3" />
              </g>
            ) : (
              <g fill="#6366f1">
                <path d="M 68 112 L 132 112 L 128 148 L 72 148 Z" />
                <circle cx="100" cy="130" r="8" fill="#f59e0b" />
              </g>
            )}

            {/* LAYER 4: HAIR */}
            {hairItem?.id === 'wi_hair_002' ? (
              <g fill="#ec4899">
                <path d="M 65 65 C 65 35 135 35 135 65 C 135 50 65 50 65 65 Z" />
                <path d="M 130 55 Q 160 65 145 90 Q 130 75 130 55 Z" />
              </g>
            ) : hairItem?.id === 'wi_hair_003' ? (
              <g>
                <path d="M 64 62 C 64 36 136 36 136 62 Z" fill="#f59e0b" />
                <path d="M 60 62 L 140 62 L 140 67 L 60 67 Z" fill="#d97706" />
              </g>
            ) : (
              <path d="M 64 65 C 64 35 136 35 136 65 C 136 50 120 40 100 40 C 80 40 64 50 64 65 Z" fill="#3b82f6" />
            )}
          </svg>
        )}
      </div>
    </div>
  );
}
