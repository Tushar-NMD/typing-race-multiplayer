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

    // Apply theme
    if (settings.theme === 'light') {
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
    } else {
      document.body.classList.add('theme-dark');
      document.body.classList.remove('theme-light');
    }

    // Apply font size
    let size = '16px';
    if (settings.fontSize === 'small') size = '14px';
    if (settings.fontSize === 'large') size = '18px';
    document.documentElement.style.fontSize = size;

  }, [settings]);

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
