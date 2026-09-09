import React from 'react';

// Theme Management System
export const THEMES = [
  {
    id: 'default',
    name: '🟢 Mặc định (Duolingo Classic)',
    description: 'Phong cách Duolingo xanh lá tươi sáng, trực quan, năng động.',
    primaryColor: '#58cc02',
    accentColor: '#1cb0f6',
    bgColor: '#ffffff',
    previewBadge: 'bg-[#58cc02] text-white border border-[#46a302]'
  },
  {
    id: 'purple',
    name: '💜 Purple Pastel Theme',
    description: 'Tím đậm sang trọng, điểm nhấn tím pastel & vàng đồng.',
    primaryColor: '#362A5C',
    accentColor: '#C9AFFB',
    bgColor: '#F5F2FB',
    previewBadge: 'bg-[#362A5C] text-[#C9AFFB] border border-[#C9AFFB]'
  },
  {
    id: 'explorer',
    name: '📜 Explorer Theme',
    description: 'Nền giấy bản đồ cổ, màu Navy & hổ phách Amber khám phá.',
    primaryColor: '#1B2437',
    accentColor: '#E0A458',
    bgColor: '#F5F0E6',
    previewBadge: 'bg-[#1B2437] text-[#E0A458] border border-[#E0A458]'
  }
];

export function getCurrentTheme() {
  return localStorage.getItem('vdvh_theme') || 'default';
}

export function getThemeLogo(themeId) {
  const current = themeId || getCurrentTheme();
  if (current === 'purple') return '/assets/logo_purple.png';
  if (current === 'explorer') return '/assets/logo_explorer.png';
  return '/assets/logo_default.png';
}

export function applyTheme(themeId) {
  const validTheme = ['default', 'purple', 'explorer'].includes(themeId) ? themeId : 'default';
  localStorage.setItem('vdvh_theme', validTheme);
  document.documentElement.setAttribute('data-theme', validTheme);
  window.dispatchEvent(new CustomEvent('vdvh_theme_changed', { detail: { theme: validTheme } }));
}

export function initTheme() {
  const current = getCurrentTheme();
  applyTheme(current);
}

// React Hook to observe active theme & dynamic theme logo
export function useActiveTheme() {
  const [themeState, setThemeState] = React.useState({
    theme: getCurrentTheme(),
    logoUrl: getThemeLogo(getCurrentTheme())
  });

  React.useEffect(() => {
    const handleThemeChange = (e) => {
      const activeTheme = e.detail?.theme || getCurrentTheme();
      setThemeState({
        theme: activeTheme,
        logoUrl: getThemeLogo(activeTheme)
      });
    };

    window.addEventListener('vdvh_theme_changed', handleThemeChange);
    return () => window.removeEventListener('vdvh_theme_changed', handleThemeChange);
  }, []);

  return themeState;
}
