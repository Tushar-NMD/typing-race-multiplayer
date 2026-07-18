import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Moon, Sun, Monitor, Volume2, VolumeX, LogOut } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function Settings() {
  const navigate = useNavigate();
  const { settings, setSettings } = useSettings();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar isLoggedIn={true} />

      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-12">Settings</h1>

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">Appearance</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setSettings({ ...settings, theme: 'dark' })}
                    className={`flex items-center justify-center space-x-2 py-3 rounded-lg transition ${
                      settings.theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <Moon size={20} />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, theme: 'light' })}
                    className={`flex items-center justify-center space-x-2 py-3 rounded-lg transition ${
                      settings.theme === 'light' ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <Sun size={20} />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, theme: 'system' })}
                    className={`flex items-center justify-center space-x-2 py-3 rounded-lg transition ${
                      settings.theme === 'system' ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <Monitor size={20} />
                    <span>System</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Font Size</label>
                <div className="grid grid-cols-3 gap-4">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSettings({ ...settings, fontSize: size })}
                      className={`py-3 rounded-lg capitalize transition ${
                        settings.fontSize === size ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">Typing</h2>
            
            <div className="space-y-6">
              <div>
                <label className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {settings.typingSound ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    <span className="text-sm font-medium">Typing Sound</span>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, typingSound: !settings.typingSound })}
                    className={`relative w-14 h-8 rounded-full transition ${
                      settings.typingSound ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        settings.typingSound ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Keyboard Layout</label>
                <select
                  value={settings.keyboardLayout}
                  onChange={(e) => setSettings({ ...settings, keyboardLayout: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="qwerty">QWERTY</option>
                  <option value="dvorak">Dvorak</option>
                  <option value="colemak">Colemak</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">Account</h2>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition"
            >
              <LogOut size={20} />
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
