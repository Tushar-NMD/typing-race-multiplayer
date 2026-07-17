import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Practice() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    difficulty: 'medium',
    time: 60,
    language: 'english'
  });

  const handleStart = () => {
    navigate('/practice/game', { state: settings });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar isLoggedIn={true} />

      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-12">Practice Mode</h1>

        <div className="max-w-2xl mx-auto bg-slate-800 rounded-xl p-8 space-y-8">
          <div>
            <label className="block text-lg font-semibold mb-4">Difficulty</label>
            <div className="grid grid-cols-3 gap-4">
              {['easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSettings({ ...settings, difficulty: diff })}
                  className={`py-3 rounded-lg font-semibold capitalize transition ${
                    settings.difficulty === diff
                      ? 'bg-indigo-600'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold mb-4">Time (seconds)</label>
            <div className="grid grid-cols-4 gap-4">
              {[15, 30, 60, 120].map((time) => (
                <button
                  key={time}
                  onClick={() => setSettings({ ...settings, time })}
                  className={`py-3 rounded-lg font-semibold transition ${
                    settings.time === time
                      ? 'bg-indigo-600'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {time}s
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold mb-4">Language</label>
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

          <div>
            <label className="block text-lg font-semibold mb-4">Custom Text (Optional)</label>
            <textarea
              placeholder="Enter your custom text here..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-indigo-500 h-32 resize-none"
            />
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-indigo-600 text-white rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
          >
            Start Practice
          </button>
        </div>
      </div>
    </div>
  );
}
