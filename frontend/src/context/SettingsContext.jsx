import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : {
      theme: 'dark',
      fontSize: 'medium',
      typingSound: true,
      keyboardLayout: 'qwerty',
      language: 'english'
    };
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const applyThemeClass = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const effectiveTheme =
        settings.theme === 'system' ? (prefersDark ? 'dark' : 'light') : settings.theme;

      document.body.classList.toggle('theme-light', effectiveTheme === 'light');
      document.body.classList.toggle('theme-dark', effectiveTheme === 'dark');
    };

    applyThemeClass();

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyThemeClass();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme]);

  useEffect(() => {
    let size = '16px';
    if (settings.fontSize === 'small') size = '14px';
    if (settings.fontSize === 'large') size = '18px';
    document.documentElement.style.fontSize = size;
  }, [settings.fontSize]);

  // Audio Context for typing sound
  const playTypingSound = () => {
    if (!settings.typingSound) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400, audioCtx.currentTime); // 400Hz frequency
      oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      console.warn("Audio not supported or interaction needed first", e);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings, playTypingSound }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
