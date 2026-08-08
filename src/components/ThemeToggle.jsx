import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ICONS = {
  light: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  dark: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
};

const TOOLTIPS = {
  es: { light: 'Cambiar a modo oscuro', dark: 'Cambiar a modo claro' },
  en: { light: 'Switch to dark mode', dark: 'Switch to light mode' },
  fr: { light: 'Passer en mode sombre', dark: 'Passer en mode clair' },
  pt: { light: 'Alternar para modo escuro', dark: 'Alternar para modo claro' },
};

export default function ThemeToggle({ lang = 'es' }) {
  const { theme, toggleTheme } = useTheme();
  const tooltips = TOOLTIPS[lang] || TOOLTIPS.es;
  const isDark = theme === 'dark';
  const currentIcon = isDark ? ICONS.dark : ICONS.light;
  const currentTooltip = isDark ? tooltips.dark : tooltips.light;

  return (
    <button
      onClick={toggleTheme}
      title={currentTooltip}
      aria-label={currentTooltip}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.15)',
        color: 'inherit',
        padding: '8px 10px',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minWidth: '40px',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
      }}
    >
      {currentIcon}
    </button>
  );
}