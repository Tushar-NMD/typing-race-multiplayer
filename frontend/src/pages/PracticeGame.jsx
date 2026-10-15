import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ResultChart from '../components/ResultChart';
import { useSettings } from '../context/SettingsContext';
import { matchService } from '../services/matchService';
import { getRandomParagraph } from '../utils/typingParagraphs';
import { Clock, Flame, Target, AlertCircle, RotateCcw, LayoutDashboard, Sparkles, Trophy } from 'lucide-react';

export default function PracticeGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playTypingSound } = useSettings();
  const settings = location.state || { time: 60, difficulty: 'medium', language: 'english' };
  const [sampleText, setSampleText] = useState(() => {
    if (settings.customText && settings.customText.trim()) {
      return settings.customText.trim();
    }
    return getRandomParagraph(settings.language, settings.time);
  });

  const [timeLeft, setTimeLeft] = useState(settings.time);
  const [input, setInput] = useState('');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [mistakes, setMistakes] = useState(0);
  const [chartData, setChartData] = useState({ time: [], wpm: [], raw: [] });
  const inputRef = useRef(null);

  const statsRef = useRef({ wpm: 0, accuracy: 100, mistakes: 0 });
  useEffect(() => {
    statsRef.current = { wpm, accuracy, mistakes };
  }, [wpm, accuracy, mistakes]);

  useEffect(() => {
    if (started && timeLeft > 0 && !finished) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        setChartData(prev => ({
          time: [...prev.time, `${settings.time - timeLeft + 1}s`],
          wpm: [...prev.wpm, statsRef.current.wpm],
          raw: [...prev.raw, statsRef.current.accuracy]
        }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !finished) {
      setFinished(true);
      matchService.savePracticeResult({
        wpm: statsRef.current.wpm,
        accuracy: statsRef.current.accuracy,
        mistakes: statsRef.current.mistakes
      }).catch(err => console.error("Failed to save practice result:", err));
    }
  }, [started, timeLeft, finished, settings.time]);

  useEffect(() => {
    if (input.length > 0) {
      const words = input.trim().split(/\s+/).length;
      const minutes = (settings.time - timeLeft) / 60;
      const calculatedWpm = minutes > 0 ? Math.round(words / minutes) : 0;
      setWpm(calculatedWpm);

      let correct = 0;
      for (let i = 0; i < input.length; i++) {
        if (input[i] === sampleText[i]) correct++;
      }
      const calculatedAccuracy = Math.round((correct / input.length) * 100);
      setAccuracy(calculatedAccuracy);
      setMistakes(input.length - correct);
    }
  }, [input, timeLeft, settings.time, sampleText]);

  const handleInputChange = (e) => {
    if (!started) setStarted(true);
    if (e.target.value.length > input.length) {
      playTypingSound();
    }
    setInput(e.target.value);
  };

  const handleRestart = () => {
    setTimeLeft(settings.time);
    setInput('');
    setStarted(false);
    setFinished(false);
    setWpm(0);
    setAccuracy(100);
    setMistakes(0);
    setChartData({ time: [], wpm: [], raw: [] });
    if (settings.customText && settings.customText.trim()) {
      setSampleText(settings.customText.trim());
    } else {
      setSampleText(getRandomParagraph(settings.language, settings.time));
    }
  };

  if (finished) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-indigo-500/30 selection:text-white pb-24">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-4xl h-[400px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full -z-10" />
        <Navbar />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36">
          <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center mx-auto mb-4 text-amber-300">
              <Trophy size={32} />
            </div>

            <h1 className="text-3xl sm:text-4xl font-black font-display text-white mb-2">Practice Completed</h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mb-8">Performance telemetry successfully recorded to profile archive</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 font-mono mb-8">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <p className="text-xs text-slate-400 uppercase mb-1 flex items-center justify-center gap-1">
                  <Flame size={12} className="text-amber-400" /> Speed
                </p>
                <p className="text-2xl sm:text-3xl font-black text-amber-300">{wpm}</p>
                <span className="text-[10px] text-slate-500 font-normal">WPM</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <p className="text-xs text-slate-400 uppercase mb-1 flex items-center justify-center gap-1">
                  <Target size={12} className="text-emerald-400" /> Accuracy
                </p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">{accuracy}%</p>
                <span className="text-[10px] text-slate-500 font-normal">Precision</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <p className="text-xs text-slate-400 uppercase mb-1 flex items-center justify-center gap-1">
                  <AlertCircle size={12} className="text-rose-400" /> Flaws
                </p>
                <p className="text-2xl sm:text-3xl font-black text-rose-400">{mistakes}</p>
                <span className="text-[10px] text-slate-500 font-normal">Misses</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <p className="text-xs text-slate-400 uppercase mb-1 flex items-center justify-center gap-1">
                  <Clock size={12} className="text-indigo-400" /> Duration
                </p>
                <p className="text-2xl sm:text-3xl font-black text-white">{settings.time}s</p>
                <span className="text-[10px] text-slate-500 font-normal">Elapsed</span>
              </div>
            </div>
            
            <div className="mb-8 rounded-2xl bg-white/[0.02] border border-white/5 p-4">
              <ResultChart data={{
                series1Name: 'WPM',
                series2Name: 'Accuracy (%)',
                time: chartData.time,
                wpm: chartData.wpm,
                raw: chartData.raw
              }} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 font-mono">
              <button
                type="button"
                onClick={handleRestart}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>Restart Session</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LayoutDashboard size={15} />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-indigo-500/30 selection:text-white pb-24">
      {/* Specular Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-4xl h-[400px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full -z-10" />
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36">
        {/* Real-time Telemetry Status Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 font-mono">
          <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl text-center">
            <span className="text-[11px] text-slate-400 uppercase flex items-center justify-center gap-1 mb-1">
              <Clock size={12} className="text-cyan-400" /> Remaining
            </span>
            <span className="text-2xl font-black text-white">{timeLeft}s</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl text-center">
            <span className="text-[11px] text-slate-400 uppercase flex items-center justify-center gap-1 mb-1">
              <Flame size={12} className="text-amber-400" /> Current Speed
            </span>
            <span className="text-2xl font-black text-amber-300">{wpm} <span className="text-xs font-normal text-slate-500">WPM</span></span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl text-center">
            <span className="text-[11px] text-slate-400 uppercase flex items-center justify-center gap-1 mb-1">
              <Target size={12} className="text-emerald-400" /> Accuracy
            </span>
            <span className="text-2xl font-black text-emerald-400">{accuracy}%</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl text-center">
            <span className="text-[11px] text-slate-400 uppercase flex items-center justify-center gap-1 mb-1">
              <AlertCircle size={12} className="text-rose-400" /> Mistakes
            </span>
            <span className="text-2xl font-black text-rose-400">{mistakes}</span>
          </div>
        </div>

        {/* Text Prompt Target Card */}
        <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] mb-6">
          <p className="text-xl sm:text-2xl leading-relaxed font-mono relative select-none">
            {sampleText.split('').map((char, index) => {
              let color = 'text-slate-500';
              if (index < input.length) {
                color = input[index] === char ? 'text-emerald-400 font-semibold' : 'text-rose-400 bg-rose-500/20 rounded';
              }
              const isCursor = index === input.length;
              return (
                <span key={index} className="relative">
                  {isCursor && (
                    <span
                      className="cursor-blink absolute -left-0.5 top-0 bottom-0 bg-indigo-400 w-0.5"
                      aria-hidden="true"
                    />
                  )}
                  <span className={color}>{char}</span>
                </span>
              );
            })}
            {input.length === sampleText.length && (
              <span className="cursor-blink ml-0.5 bg-indigo-400 w-0.5 inline-block" style={{ height: '1.25em' }} aria-hidden="true" />
            )}
          </p>
        </div>

        {/* Keystroke Receiver */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          disabled={finished}
          placeholder="Start typing prompt text above to trigger live telemetry..."
          className="w-full px-6 py-4 rounded-2xl bg-white/[0.04] border border-white/15 focus:outline-none focus:border-indigo-400/60 focus:bg-white/[0.07] text-white font-mono text-lg sm:text-xl resize-none backdrop-blur-md transition-all shadow-xl"
          rows={3}
          autoFocus
        />
      </div>
    </div>
  );
}
