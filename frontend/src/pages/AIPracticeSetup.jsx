import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Bot, ArrowLeft, Sparkles, Cpu, Zap, Activity, Shield, Play } from 'lucide-react';

export default function AIPracticeSetup() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    topic: 'sci-fi',
    difficulty: 'medium',
    botSpeed: 'adaptive'
  });

  const handleStart = () => {
    navigate('/ai-practice/game', { state: settings });
  };

  const topics = [
    { id: 'sci-fi', label: 'Sci-Fi Lore', icon: '🚀', desc: 'Space exploration, quantum gates' },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: '⚡', desc: 'Neon sprawl, neural interfaces' },
    { id: 'coding history', label: 'Code Pioneers', icon: '💻', desc: 'Unix, compilers, internet origins' },
    { id: 'fantasy', label: 'Fantasy Realm', icon: '🔮', desc: 'Mythical archives, ancient spells' },
  ];

  const lengths = [
    { id: 'easy', label: 'Sprint (Easy)', words: '15-25 Words', time: '~15s' },
    { id: 'medium', label: 'Standard (Medium)', words: '30-40 Words', time: '~35s' },
    { id: 'hard', label: 'Marathon (Hard)', words: '50-65 Words', time: '~60s' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-indigo-500/30 selection:text-white pb-24">
      {/* Radiant Specular Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[85vw] max-w-4xl h-[420px] bg-indigo-600/15 blur-[150px] pointer-events-none rounded-full -z-10" />
      <div className="fixed bottom-0 left-10 w-[35vw] h-[350px] bg-cyan-600/10 blur-[150px] pointer-events-none rounded-full -z-10" />

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-cyan-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono uppercase tracking-wider mb-4 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <Bot size={13} className="text-indigo-400" />
            <span>Neural Ghost Bot v2.4</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-3">
            AI Ghost Race <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">Setup</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-400 font-mono max-w-xl mx-auto leading-relaxed">
            Configure prompt universe and neural bot intelligence. Race against a self-calibrating bot engineered to push your burst limits.
          </p>
        </div>

        {/* Configuration Glass Card */}
        <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] space-y-8">
          {/* Topic Selector */}
          <div>
            <label className="text-xs sm:text-sm font-bold font-mono text-white flex items-center gap-2 mb-3.5">
              <Sparkles size={14} className="text-indigo-400" />
              <span>Prompt Domain & Lore</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topics.map((t) => {
                const isSelected = settings.topic === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, topic: t.id })}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border-indigo-400/50 shadow-md shadow-indigo-500/10 backdrop-blur-md'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1 font-bold text-sm text-white">
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Length & Difficulty */}
          <div>
            <label className="text-xs sm:text-sm font-bold font-mono text-white flex items-center gap-2 mb-3.5">
              <Cpu size={14} className="text-cyan-400" />
              <span>Track Distance & Length</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {lengths.map((len) => {
                const isSelected = settings.difficulty === len.id;
                return (
                  <button
                    key={len.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, difficulty: len.id })}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-white border-cyan-400/50 shadow-md shadow-cyan-500/10 backdrop-blur-md'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-sm text-white mb-0.5">{len.label}</div>
                    <div className="text-[11px] font-mono text-slate-400">{len.words} · {len.time}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bot Intelligence Mode */}
          <div>
            <label className="text-xs sm:text-sm font-bold font-mono text-white flex items-center gap-2 mb-3.5">
              <Activity size={14} className="text-emerald-400" />
              <span>Ghost AI Intelligence Model</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, botSpeed: 'adaptive' })}
                className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                  settings.botSpeed === 'adaptive'
                    ? 'bg-gradient-to-r from-indigo-500/25 to-purple-500/25 border-indigo-400/60 shadow-lg shadow-indigo-500/20 backdrop-blur-md'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-white">Adaptive Neural Model</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono leading-relaxed">
                  Bot monitors your keystroke velocity every 250ms and dynamically calculates fatigue curve delta to keep you in the zone.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSettings({ ...settings, botSpeed: 'fixed-60' })}
                className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                  settings.botSpeed === 'fixed-60'
                    ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 border-cyan-400/60 shadow-lg shadow-cyan-500/20 backdrop-blur-md'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-white">Fixed 60 WPM Metronome</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Baseline
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono leading-relaxed">
                  Bot types with steady, robotic precision at 60 WPM. Great for benchmarking consistent typing stamina.
                </p>
              </button>
            </div>
          </div>

          {/* Launch Button */}
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-display font-black text-sm sm:text-base shadow-[0_4px_25px_rgba(99,102,241,0.35)] transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play size={18} className="fill-white" />
            <span>Generate Track & Duel Ghost AI</span>
          </button>
        </div>
      </div>
    </div>
  );
}
