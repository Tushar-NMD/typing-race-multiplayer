import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft, Target, Clock, Globe, FileText, Sparkles, Play } from 'lucide-react';

export default function Practice() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    difficulty: 'medium',
    time: 60,
    language: 'english',
    customText: ''
  });

  const handleStart = () => {
    navigate('/practice/game', { state: settings });
  };

  const difficultyLevels = [
    { id: 'easy', label: 'Zen / Easy', desc: 'Common words, no punctuation', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30' },
    { id: 'medium', label: 'Balanced', desc: 'Standard paragraphs & punctuation', color: 'from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/30' },
    { id: 'hard', label: 'Overdrive', desc: 'Numbers, symbols & code terms', color: 'from-rose-500/20 to-orange-500/20 text-rose-300 border-rose-500/30' }
  ];

  const timeOptions = [15, 30, 60, 120];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-indigo-500/30 selection:text-white pb-24">
      {/* Specular Ambient Glows */}
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
            <Target size={13} className="text-indigo-400" />
            <span>Solo Telemetry Lab</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-3">
            Custom Practice <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">Session</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-400 font-mono max-w-xl mx-auto leading-relaxed">
            Zero-pressure solo sprint. Calibrate finger dexterity, build muscle memory, and analyze keystroke accuracy curves.
          </p>
        </div>

        {/* Configuration Glass Card */}
        <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] space-y-8">
          {/* Difficulty Level */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <label className="text-xs sm:text-sm font-bold font-mono text-white flex items-center gap-2">
                <Sparkles size={14} className="text-indigo-400" />
                <span>Difficulty Tier</span>
              </label>
              <span className="text-xs font-mono text-slate-400 uppercase">{settings.difficulty}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {difficultyLevels.map((diff) => {
                const isSelected = settings.difficulty === diff.id;
                return (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, difficulty: diff.id })}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? `bg-gradient-to-br ${diff.color} shadow-lg backdrop-blur-md`
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-sm text-white mb-1">{diff.label}</div>
                    <div className="text-[11px] font-mono opacity-80 leading-snug">{diff.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Limit */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <label className="text-xs sm:text-sm font-bold font-mono text-white flex items-center gap-2">
                <Clock size={14} className="text-cyan-400" />
                <span>Sprint Duration</span>
              </label>
              <span className="text-xs font-mono text-slate-400">{settings.time} Seconds</span>
            </div>

            <div className="grid grid-cols-4 gap-3 font-mono">
              {timeOptions.map((t) => {
                const isSelected = settings.time === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSettings({ ...settings, time: t })}
                    className={`py-3 rounded-2xl text-center text-sm font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-500/25 to-purple-500/25 text-white border-white/25 shadow-md shadow-indigo-500/10 backdrop-blur-md'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    {t}s
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="text-xs sm:text-sm font-bold font-mono text-white flex items-center gap-2 mb-3">
              <Globe size={14} className="text-purple-400" />
              <span>Vocabulary Language</span>
            </label>

            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 focus:outline-none focus:border-indigo-400/50 text-white font-mono text-sm backdrop-blur-sm cursor-pointer"
            >
              <option value="english" className="bg-slate-900 text-white">English (Default Corpus)</option>
              <option value="spanish" className="bg-slate-900 text-white">Spanish (Español)</option>
              <option value="french" className="bg-slate-900 text-white">French (Français)</option>
              <option value="german" className="bg-slate-900 text-white">German (Deutsch)</option>
            </select>
          </div>

          {/* Custom Text Option */}
          <div>
            <label className="text-xs sm:text-sm font-bold font-mono text-white flex items-center gap-2 mb-3">
              <FileText size={14} className="text-amber-400" />
              <span>Custom Text Override (Optional)</span>
            </label>

            <textarea
              value={settings.customText}
              onChange={(e) => setSettings({ ...settings, customText: e.target.value })}
              placeholder="Paste code snippets, book excerpts, or custom training prompts here..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 focus:outline-none focus:border-indigo-400/50 text-white placeholder:text-slate-500 font-mono text-xs sm:text-sm resize-none backdrop-blur-sm transition-all"
            />
          </div>

          {/* Start Button */}
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-display font-black text-sm sm:text-base shadow-[0_4px_25px_rgba(99,102,241,0.3)] transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play size={18} className="fill-white" />
            <span>Launch Solo Practice Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}
