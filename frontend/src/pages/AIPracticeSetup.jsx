import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Bot, ArrowLeft } from 'lucide-react';

export default function AIPracticeSetup() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    topic: 'sci-fi',
    difficulty: 'medium', // Determines text length
    botSpeed: 'adaptive' // bot behavior
  });

  const handleStart = () => {
    navigate('/ai-practice/game', { state: settings });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar isLoggedIn={true} />

      <div className="container mx-auto px-4 py-16">
        <Link to="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white transition mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-center space-x-4 mb-12">
          <Bot className="w-10 h-10 text-indigo-500" />
          <h1 className="text-4xl font-bold text-center">AI Ghost Race Setup</h1>
        </div>

        <div className="max-w-2xl mx-auto bg-slate-800 rounded-xl p-8 space-y-8 shadow-2xl border border-indigo-500/20">
          <div>
            <label className="block text-lg font-semibold mb-4 text-indigo-200">Select Topic</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['sci-fi', 'cyberpunk', 'coding history', 'fantasy'].map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSettings({ ...settings, topic })}
                  className={`py-3 rounded-lg font-semibold capitalize transition ${
                    settings.topic === topic
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {topic.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold mb-4 text-indigo-200">Text Length (Difficulty)</label>
            <div className="grid grid-cols-3 gap-4">
              {['easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSettings({ ...settings, difficulty: diff })}
                  className={`py-3 rounded-lg font-semibold capitalize transition ${
                    settings.difficulty === diff
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-400 mt-2">
              {settings.difficulty === 'easy' && '15-25 words'}
              {settings.difficulty === 'medium' && '30-40 words'}
              {settings.difficulty === 'hard' && '50-60 words'}
            </p>
          </div>

          <div>
            <label className="block text-lg font-semibold mb-4 text-indigo-200">Ghost Bot Intelligence</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSettings({ ...settings, botSpeed: 'adaptive' })}
                className={`py-4 px-4 rounded-lg text-left transition ${
                  settings.botSpeed === 'adaptive'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <div className="font-bold mb-1">Adaptive (Recommended)</div>
                <div className="text-sm opacity-80">Bot matches your speed dynamically for a close race.</div>
              </button>
              <button
                onClick={() => setSettings({ ...settings, botSpeed: 'fixed-60' })}
                className={`py-4 px-4 rounded-lg text-left transition ${
                  settings.botSpeed === 'fixed-60'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <div className="font-bold mb-1">Fixed 60 WPM</div>
                <div className="text-sm opacity-80">Bot types at a consistent 60 words per minute.</div>
              </button>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-lg font-bold hover:from-indigo-500 hover:to-purple-500 transition transform hover:scale-[1.02] shadow-xl"
          >
            Generate AI Prompt & Start Race
          </button>
        </div>
      </div>
    </div>
  );
}
