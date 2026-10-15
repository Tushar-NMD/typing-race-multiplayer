import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Moon, Sun, Monitor, Volume2, VolumeX, LogOut, ArrowLeft, Settings as SettingsIcon, Sliders, Keyboard, Shield } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const navigate = useNavigate();
  const { settings, setSettings } = useSettings();
  const { logout } = useAuth();

  const handleLogout = () => {
    if (logout) logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-indigo-500/30 selection:text-white pb-24">
      {/* Radiant Specular Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-4xl h-[400px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full -z-10" />
      <div className="fixed bottom-0 right-10 w-[35vw] h-[350px] bg-purple-600/10 blur-[150px] pointer-events-none rounded-full -z-10" />

      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-slate-400 hover:text-white transition-colors group px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-indigo-400" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono uppercase tracking-wider mb-4 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <Sliders size={13} className="text-indigo-400" />
            <span>Cockpit Preferences</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-3">
            System <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">Settings</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-400 font-mono max-w-xl mx-auto leading-relaxed">
            Personalize typography, mechanical keystroke audio feedback, and keyboard layouts.
          </p>
        </div>

        <div className="space-y-6">
          {/* Appearance Card */}
          <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <Sun className="text-indigo-400" size={18} />
              <h2 className="text-base font-bold font-display text-white">Display & Theme</h2>
            </div>

            <div className="space-y-5 font-mono text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 font-bold mb-3">Interface Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'dark', label: 'Obsidian Dark', icon: Moon },
                    { id: 'light', label: 'Light Mode', icon: Sun },
                    { id: 'system', label: 'System Sync', icon: Monitor }
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = settings.theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSettings({ ...settings, theme: t.id })}
                        className={`flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-400/50 text-white font-bold shadow-md'
                            : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        <Icon size={16} className={isSelected ? 'text-indigo-400' : 'text-slate-500'} />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-3">Typing Prompt Font Size</label>
                <div className="grid grid-cols-3 gap-3">
                  {['small', 'medium', 'large'].map((size) => {
                    const isSelected = settings.fontSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSettings({ ...settings, fontSize: size })}
                        className={`py-3 rounded-2xl capitalize border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-400/50 text-white font-bold shadow-md'
                            : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Typing & Sound Card */}
          <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <Keyboard className="text-cyan-400" size={18} />
              <h2 className="text-base font-bold font-display text-white">Audio & Keybinds</h2>
            </div>

            <div className="space-y-5 font-mono text-xs sm:text-sm">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-cyan-400">
                    {settings.typingSound ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Mechanical Switch Audio</p>
                    <p className="text-xs text-slate-400">Acoustic tactile feedback on each keystroke</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, typingSound: !settings.typingSound })}
                  className={`relative w-14 h-8 rounded-full transition-colors cursor-pointer border ${
                    settings.typingSound
                      ? 'bg-indigo-600 border-indigo-400 shadow-md shadow-indigo-600/30'
                      : 'bg-white/[0.08] border-white/15'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                      settings.typingSound ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-2">Keyboard Layout</label>
                <select
                  value={settings.keyboardLayout || 'qwerty'}
                  onChange={(e) => setSettings({ ...settings, keyboardLayout: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-cyan-400/50 cursor-pointer"
                >
                  <option value="qwerty" className="bg-slate-900">QWERTY (Standard)</option>
                  <option value="dvorak" className="bg-slate-900">Dvorak (Ergonomic)</option>
                  <option value="colemak" className="bg-slate-900">Colemak (Flow)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-2">Default Practice Language</label>
                <select
                  value={settings.language || 'english'}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-cyan-400/50 cursor-pointer"
                >
                  <option value="english" className="bg-slate-900">English</option>
                  <option value="spanish" className="bg-slate-900">Spanish</option>
                  <option value="french" className="bg-slate-900">French</option>
                  <option value="german" className="bg-slate-900">German</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account & Session Card */}
          <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <Shield className="text-rose-400" size={18} />
              <h2 className="text-base font-bold font-display text-white">Session Security</h2>
            </div>

            <p className="text-xs text-slate-400 font-mono">
              Terminating your active session invalidates your telemetry token and signs you out on this device.
            </p>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out of TypeVerse Arena</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
