import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Trophy, Globe, Bot, ChevronRight, Keyboard, Activity, Zap,
  Volume2, VolumeX, RotateCcw, Sparkles, Shield, Flame, BarChart3,
  ArrowRight, Check, ArrowUpRight, Users, Plus, Copy, Target, Brain, RefreshCw
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

// Curated interactive test sentences
const SAMPLE_SENTENCES = [
  "The high-performance neural engine synchronizes keystroke velocity with zero dropped frames across global arenas.",
  "Adaptive ghost rivals calibrate difficulty dynamically to push your burst typing speed beyond human limits.",
  "Precision telemetry captures per-key latency and biometric rhythm for competitive esport typists worldwide."
];

// Switch sound synthesis using native Web Audio API
const playSwitchSound = (switchType = 'thock') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (switchType === 'blue') {
      // Crisp high-frequency clicky
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(950, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.035);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } else if (switchType === 'red') {
      // Smooth linear quiet tap
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.045);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);
      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } else {
      // Deep Topre / Brown tactile thock
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch {
    // Ignore audio errors if user has not interacted or browser restricts audio
  }
};

export default function Landing() {
  const { openAuthModal, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-trigger auth modal if redirected with ?auth=login or ?auth=signup
  useEffect(() => {
    const authParam = searchParams.get('auth');
    if (authParam === 'login' || authParam === 'signup') {
      openAuthModal(authParam);
      searchParams.delete('auth');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, openAuthModal, setSearchParams]);

  // Handle protected actions directly without redirects if user is unauthenticated
  const handleProtectedAction = (path, mode = 'login') => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      openAuthModal(mode);
    }
  };

  // Hero Interactive Speed Test State
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [testStartTime, setTestStartTime] = useState(null);
  const [testWpm, setTestWpm] = useState(0);
  const [testAccuracy, setTestAccuracy] = useState(100);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeHeroTab, setActiveHeroTab] = useState('test'); // 'test' | 'duel'
  const inputRef = useRef(null);

  // Ghost AI difficulty tab state in Bento Grid
  const [ghostLevel, setGhostLevel] = useState('phantom'); // 'scout' | 'phantom' | 'apex' | 'overdrive'
  const [selectedSwitch, setSelectedSwitch] = useState('thock');

  // Create Room interactive simulation state
  const [roomCopied, setRoomCopied] = useState(false);
  const [selectedRoomMode, setSelectedRoomMode] = useState('custom');

  const handleCopyRoomCode = () => {
    setRoomCopied(true);
    setTimeout(() => setRoomCopied(false), 2200);
  };

  // AI Fault Tracker interactive simulation state
  const [aiScanStage, setAiScanStage] = useState('remediation'); // 'scanning' | 'detected' | 'remediation'
  const [isScanningFaults, setIsScanningFaults] = useState(false);

  const triggerAiFaultScan = () => {
    setIsScanningFaults(true);
    setAiScanStage('scanning');
    setTimeout(() => {
      setAiScanStage('detected');
      setTimeout(() => {
        setAiScanStage('remediation');
        setIsScanningFaults(false);
      }, 1100);
    }, 900);
  };

  // Live Simulation state for Duel visualizer
  const [simProgress, setSimProgress] = useState({ player: 0, ghost: 0, rival: 0 });
  const [simRunning, setSimRunning] = useState(true);

  const targetSentence = SAMPLE_SENTENCES[sentenceIndex];

  // Simulated Race Duel Animation
  useEffect(() => {
    if (activeHeroTab !== 'duel' || !simRunning) return;
    const interval = setInterval(() => {
      setSimProgress((prev) => {
        if (prev.player >= 100) {
          return { player: 0, ghost: 0, rival: 0 };
        }
        return {
          player: Math.min(100, prev.player + 1.8),
          ghost: Math.min(100, prev.ghost + 1.6 + (Math.random() * 0.4 - 0.2)),
          rival: Math.min(100, prev.rival + 1.3 + (Math.random() * 0.3 - 0.15)),
        };
      });
    }, 100);
    return () => clearInterval(interval);
  }, [activeHeroTab, simRunning]);

  // Handle typing inside interactive hero speed test
  const handleInputChange = (e) => {
    const val = e.target.value;
    if (isTestCompleted) return;

    if (!testStartTime && val.length > 0) {
      setTestStartTime(Date.now());
    }

    if (soundEnabled && val.length > userInput.length) {
      playSwitchSound(selectedSwitch);
    }

    setUserInput(val);

    // Calculate real-time stats
    const now = Date.now();
    const elapsedMinutes = Math.max(0.01, ((now - (testStartTime || now)) / 1000) / 60);
    const wordsTyped = val.length / 5;
    const currentWpm = Math.round(wordsTyped / elapsedMinutes);
    setTestWpm(Math.min(260, Math.max(0, currentWpm)));

    // Calculate Accuracy
    let errors = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== targetSentence[i]) {
        errors++;
      }
    }
    const acc = val.length > 0 ? Math.max(0, Math.round(((val.length - errors) / val.length) * 100)) : 100;
    setTestAccuracy(acc);

    // Check completion
    if (val.length >= targetSentence.length) {
      setIsTestCompleted(true);
    }
  };

  const resetSpeedTest = useCallback(() => {
    setUserInput('');
    setTestStartTime(null);
    setTestWpm(0);
    setTestAccuracy(100);
    setIsTestCompleted(false);
    setSentenceIndex((prev) => (prev + 1) % SAMPLE_SENTENCES.length);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const ghostLevels = {
    scout: { title: 'Scout AI', wpm: '60 WPM', reaction: '380ms', color: 'emerald', desc: 'Smooth baseline pacing for beginners. Micro-bursts designed for rhythmic flow.' },
    phantom: { title: 'Phantom AI', wpm: '95 WPM', reaction: '210ms', color: 'indigo', desc: 'Adaptive machine learning model that mirrors your exact bursts and fatigue cycles.' },
    apex: { title: 'Apex Neural', wpm: '130 WPM', reaction: '120ms', color: 'purple', desc: 'Competitive esport tier. Zero hesitation, instant recovery on complex punctuation.' },
    overdrive: { title: 'Overdrive X', wpm: '170+ WPM', reaction: '45ms', color: 'rose', desc: 'Superhuman throughput. For Grandmasters testing the absolute boundaries of speed.' },
  };

  return (
    <div className="relative w-full min-h-screen bg-[#030712] text-slate-100 selection:bg-indigo-500/30 selection:text-white font-sans overflow-x-hidden">
      {/* Floating Modern Overflowing Navbar */}
      <Navbar />

      {/* Deep Cyber Ambient Aura & Mesh Grids */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[90vw] max-w-[1200px] h-[550px] bg-gradient-to-b from-indigo-600/20 via-purple-600/15 to-transparent blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-[40%] -left-[10%] w-[50vw] h-[50vw] bg-cyan-600/10 blur-[160px] rounded-full pointer-events-none" />
        <div className="absolute top-[65%] -right-[10%] w-[50vw] h-[50vw] bg-purple-600/10 blur-[160px] rounded-full pointer-events-none" />
        
        {/* Subtle engineering grid with radial fade */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800e_1px,transparent_1px),linear-gradient(to_bottom,#8080800e_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_25%,#000_65%,transparent_100%)]" />
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-32 sm:pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        {/* Subtle Typing Performance Telemetry Graph Background */}
        <div 
          className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl h-[420px] sm:h-[580px] pointer-events-none -z-10 opacity-40 select-none [mask-image:radial-gradient(ellipse_80%_60%_at_50%_45%,#000_55%,transparent_95%)]"
          aria-hidden="true"
        >
          <img 
            src="/typing-performance-graph.svg" 
            alt="Typing Performance Telemetry Graph" 
            className="w-full h-full object-contain filter drop-shadow-[0_0_35px_rgba(99,102,241,0.35)]"
          />
        </div>

        {/* Version & Release Protocol Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg mb-8 hover:border-indigo-500/40 transition-all duration-300 group cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs sm:text-sm font-semibold tracking-wide bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
            TYPEVERSE 2.0 PROTOCOL
          </span>
          <span className="hidden sm:inline w-px h-3.5 bg-white/20" />
          <span className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-indigo-300 transition-colors">
            Zero-Lag Socket Engine
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>

        {/* Master Display Headline - All white text and smaller font */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-4xl mx-auto mb-4">
          The Apex Arena for Extreme Typists
        </h1>

        {/* Subtitle with Different Monospace Font Style */}
        <p className="font-mono text-xs sm:text-sm md:text-base text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          Duel against our self-tuning Ghost AI, conquer zero-latency global multiplayer rooms, and stream per-keystroke telemetry at 120 FPS.
        </p>

        {/* Primary CTA Buttons - Duel Ghost AI bg removed, clean fit styling */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mb-6 z-10">
          <button
            type="button"
            onClick={() => handleProtectedAction('/ai-practice')}
            className="w-full sm:w-auto flex-1 group flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl border border-white/15 hover:border-white/30 text-white font-semibold text-sm hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            <Bot size={18} className="text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
            <span>Duel Ghost AI</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono tracking-wider uppercase border border-white/15 text-slate-400 rounded">
              SOLO
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleProtectedAction('/multiplayer')}
            className="w-full sm:w-auto flex-1 group flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl border border-white/15 hover:border-cyan-500/40 text-white font-semibold text-sm hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            <Globe size={18} className="text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
            <span>Multiplayer Race</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono tracking-wider uppercase border border-cyan-500/30 text-cyan-400 rounded">
              LIVE
            </span>
          </button>
        </div>

        {/* Feature Highlights Quick Tags */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12 z-10 font-mono text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
            <Users size={13} className="text-cyan-400" />
            Create Custom Rooms &amp; Race Friends
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            <Target size={13} className="text-indigo-400" />
            AI Fault-Tracking &amp; Targeted Practice
          </span>
        </div>

        {/* Live Platform Telemetry Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl p-4 sm:p-5 rounded-2xl bg-slate-950/60 backdrop-blur-xl border border-white/10 shadow-2xl mb-14 text-left">
          <div className="flex items-center gap-3.5 px-3 py-1.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">&lt; 4ms</div>
              <div className="text-xs text-slate-400 font-medium">Socket Latency</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 px-3 py-1.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Bot size={20} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">Dynamic</div>
              <div className="text-xs text-slate-400 font-medium">Ghost AI Engine</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 px-3 py-1.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Flame size={20} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">184 WPM</div>
              <div className="text-xs text-slate-400 font-medium">Apex Speed Today</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 px-3 py-1.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Shield size={20} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">99.98%</div>
              <div className="text-xs text-slate-400 font-medium">Anti-Cheat Verify</div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SHOWSTOPPER: INTERACTIVE SPEED TEST & RACE SIMULATOR */}
        {/* ======================================================== */}
        <div className="w-full max-w-5xl relative group perspective-1000 z-20 text-left">
          {/* Subtle Ambient Halo */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-cyan-500/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none" />

          <div className="relative rounded-3xl border border-white/15 bg-slate-950/85 backdrop-blur-2xl shadow-[0_20px_70px_rgba(0,0,0,0.7)] overflow-hidden">
            {/* Terminal Window Header & Tab Switcher */}
            <div className="px-4 sm:px-6 py-3.5 border-b border-white/10 bg-white/[0.03] flex flex-wrap items-center justify-between gap-3">
              {/* Traffic light dots */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline">
                  typeverse-arena://live-preview.v2
                </span>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                <button
                  onClick={() => setActiveHeroTab('test')}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                    activeHeroTab === 'test'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Keyboard size={14} />
                  <span>Interactive Speed Test</span>
                </button>
                <button
                  onClick={() => setActiveHeroTab('duel')}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                    activeHeroTab === 'duel'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bot size={14} />
                  <span>Neural Duel Simulator</span>
                </button>
              </div>

              {/* Audio & Reset Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    soundEnabled
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                      : 'bg-white/5 border-white/10 text-slate-500'
                  }`}
                  title={soundEnabled ? 'Mechanical Sound FX Enabled' : 'Muted'}
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                {activeHeroTab === 'test' ? (
                  <button
                    onClick={resetSpeedTest}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Reset Test"
                  >
                    <RotateCcw size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => setSimRunning(!simRunning)}
                    className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 text-xs font-mono transition-colors"
                    title={simRunning ? 'Pause Race Simulation' : 'Resume Race Simulation'}
                  >
                    {simRunning ? 'PAUSE' : 'RESUME'}
                  </button>
                )}
              </div>
            </div>

            {/* TAB CONTENT 1: INTERACTIVE TYPING SPEED TEST */}
            {activeHeroTab === 'test' && (
              <div className="p-5 sm:p-8 space-y-6">
                {/* Real-time Telemetry HUD */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 font-mono text-sm">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-xs text-slate-500 block uppercase tracking-wider">Speed</span>
                      <span className="text-2xl sm:text-3xl font-black text-indigo-400">
                        {testWpm} <span className="text-xs text-slate-400 font-sans">WPM</span>
                      </span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div>
                      <span className="text-xs text-slate-500 block uppercase tracking-wider">Accuracy</span>
                      <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                        {testAccuracy}%
                      </span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div>
                      <span className="text-xs text-slate-500 block uppercase tracking-wider">Progress</span>
                      <span className="text-2xl sm:text-3xl font-black text-purple-400">
                        {Math.min(100, Math.round((userInput.length / targetSentence.length) * 100))}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 hidden sm:inline">Tactile feedback:</span>
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-indigo-300">
                      {selectedSwitch.toUpperCase()} SWITCH
                    </span>
                  </div>
                </div>

                {/* Target Sentence Display with Live Highlighting */}
                <div
                  onClick={() => inputRef.current?.focus()}
                  className="relative p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10 text-lg sm:text-xl md:text-2xl font-mono leading-relaxed tracking-wide min-h-[7rem] cursor-text transition-all focus-within:border-indigo-500/50"
                >
                  <p className="select-none break-words">
                    {targetSentence.split('').map((char, idx) => {
                      let colorClass = 'text-slate-500';
                      let isCursor = false;

                      if (idx < userInput.length) {
                        if (userInput[idx] === char) {
                          colorClass = 'text-emerald-400 font-medium';
                        } else {
                          colorClass = 'text-rose-400 bg-rose-500/20 underline font-medium';
                        }
                      } else if (idx === userInput.length) {
                        isCursor = true;
                        colorClass = 'text-white font-bold';
                      }

                      return (
                        <span key={idx} className={`relative ${colorClass}`}>
                          {isCursor && (
                            <span className="inline-block w-[2px] h-[1.2em] bg-indigo-400 align-middle animate-pulse mr-[-2px] shadow-[0_0_8px_#818cf8]" />
                          )}
                          {char}
                        </span>
                      );
                    })}
                  </p>

                  {/* Hidden real input that captures keystrokes smoothly */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    className="absolute inset-0 opacity-0 cursor-text w-full h-full"
                    spellCheck="false"
                    autoComplete="off"
                    autoCapitalize="off"
                  />
                </div>

                {/* Bottom guidance & Test Completion Banner */}
                {isTestCompleted ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-purple-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Trophy size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">Test Completed! Score: {testWpm} WPM</h4>
                        <p className="text-xs text-slate-300">
                          Accuracy: {testAccuracy}% · Ready to duel the Ghost AI with these stats?
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={resetSpeedTest}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                      >
                        Try Again
                      </button>
                      <button
                        type="button"
                        onClick={() => handleProtectedAction('/ai-practice')}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>Battle Ghost AI</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      Click text area to start typing. Instant live telemetry.
                    </span>
                    <span className="text-slate-500">
                      Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10 text-slate-300">Space</kbd> between words
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: LIVE NEURAL DUEL SIMULATOR */}
            {activeHeroTab === 'duel' && (
              <div className="p-5 sm:p-8 space-y-6">
                <div className="space-y-4">
                  {/* Lane 1: You */}
                  <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/25 relative overflow-hidden">
                    <div className="flex items-center justify-between text-sm font-semibold mb-2">
                      <span className="flex items-center gap-2 text-white">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center text-xs text-white">
                          🏎️
                        </span>
                        You (Human Typist)
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                          Pos #1
                        </span>
                      </span>
                      <span className="font-mono text-indigo-300 font-bold">114 WPM · 99.4% Acc</span>
                    </div>
                    <div className="h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-150 relative"
                        style={{ width: `${simProgress.player}%` }}
                      >
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#ffffff]" />
                      </div>
                    </div>
                  </div>

                  {/* Lane 2: Ghost AI */}
                  <div className="p-4 rounded-2xl bg-purple-600/10 border border-purple-500/25 relative overflow-hidden">
                    <div className="flex items-center justify-between text-sm font-semibold mb-2">
                      <span className="flex items-center gap-2 text-white">
                        <span className="w-6 h-6 rounded-lg bg-purple-500 flex items-center justify-center text-xs text-white">
                          🤖
                        </span>
                        Ghost AI (Neural v2.4)
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                          Adaptive Pace
                        </span>
                      </span>
                      <span className="font-mono text-purple-300 font-bold">108 WPM · 99.8% Acc</span>
                    </div>
                    <div className="h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-150 relative"
                        style={{ width: `${simProgress.ghost}%` }}
                      >
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#ffffff]" />
                      </div>
                    </div>
                  </div>

                  {/* Lane 3: Peer Rival */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                    <div className="flex items-center justify-between text-sm font-semibold mb-2">
                      <span className="flex items-center gap-2 text-slate-300">
                        <span className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center text-xs text-white">
                          ⚡
                        </span>
                        Neo_Typist (Global Match)
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-400">
                          Rank: Master
                        </span>
                      </span>
                      <span className="font-mono text-slate-400 font-bold">96 WPM · 98.1% Acc</span>
                    </div>
                    <div className="h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/10">
                      <div
                        className="h-full bg-slate-600 rounded-full transition-all duration-150 relative"
                        style={{ width: `${simProgress.rival}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Real-time telemetry log feed */}
                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-slate-400 space-y-1">
                  <div className="text-emerald-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    [WEBSOCKET] Multi-peer room synchronized · 4 racers connected at 3.2ms jitter
                  </div>
                  <div className="text-purple-300">
                    [GHOST_AI] Target trajectory set to 108 WPM (interpolating human fatigue delta)
                  </div>
                  <div className="text-slate-500">
                    [CLIENT] Hardware acceleration active (120 FPS transform cycle)
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: CORE ARENA MECHANICS (CREATE ROOM & AI FAULT TRACKING) */}
      {/* ======================================================== */}
      <section className="py-20 sm:py-28 relative border-t border-white/10 bg-slate-950/70 overflow-hidden">
        {/* Soft Ambient Radiance */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-600/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-cyan-400 uppercase font-mono">
              FLAGSHIP CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-5xl font-black mt-3 mb-4 text-white">
              Host Custom Lobbies. Correct Faults with AI.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-light">
              Create instant zero-friction multiplayer rooms for you and your friends, or type with our neural engine that monitors keystroke faults and automatically generates targeted practice drills.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* FEATURE CARD 1: CREATE CUSTOM ROOM & PARTY LOBBY */}
            <div className="rounded-3xl bg-slate-900/50 border border-white/10 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-cyan-500/40 transition-all duration-300">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
                    <Users size={24} />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/25 text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    Instant Private Lobbies
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Create Private Rooms &amp; Race Friends
                </h3>
                <p className="text-slate-300/80 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  Spin up zero-latency multiplayer rooms in 1 click. Share your unique room code or direct link with friends, configure custom word sets, and race head-to-head.
                </p>

                {/* Interactive Room Visualization */}
                <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 space-y-4">
                  {/* Room Header with Code & Copy Button */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Private Lobby Code</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-lg font-mono font-black text-cyan-300 tracking-wider">ROOM #ARENA-8492</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">ACTIVE</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCopyRoomCode}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {roomCopied ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span className="text-emerald-400">Code Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} className="text-cyan-400" />
                          <span>Copy Invite</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Room Mode Selector Pills */}
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">Select Game Mode</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'custom', label: 'Custom Words', badge: 'Any Text' },
                        { id: 'sprint', label: '60s Sprint', badge: 'High WPM' },
                        { id: 'pro', label: 'Hard Quotes', badge: 'Punctuation' },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setSelectedRoomMode(mode.id)}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                            selectedRoomMode === mode.id
                              ? 'bg-cyan-500/20 border-cyan-500/50 text-white shadow-sm shadow-cyan-500/20'
                              : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div className="text-xs font-bold truncate">{mode.label}</div>
                          <div className="text-[10px] text-cyan-300/80">{mode.badge}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Players in Lobby Slot Grid */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Racers in Lobby (3/4 Connected)</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                        <span className="flex items-center gap-2 text-white font-medium truncate">
                          <span className="text-sm">👑</span> You (Host)
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 shrink-0">READY</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                        <span className="flex items-center gap-2 text-slate-200 truncate">
                          <span className="text-sm">🏎️</span> Sarah_Speed
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 shrink-0">READY</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                        <span className="flex items-center gap-2 text-slate-200 truncate">
                          <span className="text-sm">🤖</span> Ghost AI Rival
                        </span>
                        <span className="text-[10px] font-mono text-purple-400 shrink-0">110 WPM</span>
                      </div>

                      <Link
                        to="/multiplayer"
                        className="p-2.5 rounded-xl border border-dashed border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/10 flex items-center justify-between text-cyan-300 transition-colors"
                      >
                        <span className="flex items-center gap-1.5 text-xs font-medium">
                          <Plus size={14} /> Invite Friend
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400">OPEN</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-400 font-mono">Zero installs · Sub-4ms WebSocket sync</span>
                <Link
                  to="/multiplayer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all"
                >
                  <span>Create Room Now</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* FEATURE CARD 2: AI FAULT TRACKING & TARGETED REMEDIATION */}
            <div className="rounded-3xl bg-slate-900/50 border border-white/10 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-indigo-500/40 transition-all duration-300">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
                    <Brain size={24} />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Target size={13} />
                    Neural Diagnostic Engine
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  AI Fault-Tracking &amp; Targeted Practice
                </h3>
                <p className="text-slate-300/80 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  Type against our neural engine. It tracks your exact hesitation and typo clusters, isolates your weak keys, and automatically generates custom practice drills to eliminate faults.
                </p>

                {/* Interactive AI Diagnostic Simulator */}
                <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 space-y-4">
                  {/* Diagnostic Stage Flow Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className={`px-2 py-0.5 rounded transition-colors ${aiScanStage === 'scanning' ? 'bg-indigo-500 text-white font-bold animate-pulse' : 'bg-white/5 text-slate-400'}`}>
                        1. Track
                      </span>
                      <span className="text-slate-600">→</span>
                      <span className={`px-2 py-0.5 rounded transition-colors ${aiScanStage === 'detected' ? 'bg-amber-500 text-black font-bold animate-pulse' : 'bg-white/5 text-slate-400'}`}>
                        2. Detect Faults
                      </span>
                      <span className="text-slate-600">→</span>
                      <span className={`px-2 py-0.5 rounded transition-colors ${aiScanStage === 'remediation' ? 'bg-emerald-500 text-black font-bold' : 'bg-white/5 text-slate-400'}`}>
                        3. AI Drill
                      </span>
                    </div>

                    <button
                      onClick={triggerAiFaultScan}
                      disabled={isScanningFaults}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw size={12} className={isScanningFaults ? 'animate-spin text-indigo-400' : 'text-indigo-400'} />
                      <span>{isScanningFaults ? 'Scanning Keystrokes...' : 'Simulate Scan'}</span>
                    </button>
                  </div>

                  {/* Detected Weak Keys Badges */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        Identified Fault Clusters
                      </span>
                      <span className="text-[10px] font-mono text-amber-400">
                        {aiScanStage === 'scanning' ? 'Analyzing latency curves...' : '3 High-Latency Bottlenecks'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded bg-rose-500/20 text-rose-300 font-mono font-bold flex items-center justify-center text-xs">P</span>
                          <span className="text-[10px] font-mono text-rose-400">73% ACC</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">+142ms Delay</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded bg-amber-500/20 text-amber-300 font-mono font-bold flex items-center justify-center text-xs">;</span>
                          <span className="text-[10px] font-mono text-amber-400">68% ACC</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">+185ms Slip</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold flex items-center justify-center text-xs">B</span>
                          <span className="text-[10px] font-mono text-indigo-400">81% ACC</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">+96ms Reach</div>
                      </div>
                    </div>
                  </div>

                  {/* Auto-Generated Practice Drill Preview */}
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                        <Sparkles size={13} />
                        Auto-Generated Remediation Drill
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">+19 WPM Expected Gain</span>
                    </div>
                    <p className="text-xs font-mono text-slate-300 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/5">
                      "Promptly prepare proper perception with practical punctuation and patient pulse."
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-400 font-mono">Tracks faults · Tailors precision text</span>
                <Link
                  to="/ai-practice"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <span>Practice Weak Keys with AI</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3: BENTO GRID FEATURE ARCHITECTURE */}
      {/* ======================================================== */}
      <section className="py-24 sm:py-32 relative border-t border-white/10 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-indigo-400 uppercase">
              ARCHITECTURAL EXCELLENCE
            </span>
            <h2 className="text-3xl sm:text-5xl font-black mt-3 mb-6 bg-gradient-to-r from-white via-indigo-100 to-slate-400 bg-clip-text text-transparent">
              Engineered for Pure Competitive Advantage
            </h2>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-light">
              Every millisecond counts. Built from the ground up with low-level websocket pipelines, neural pacing engines, and esports ergonomics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Adaptive Ghost AI (Large 2 Columns) */}
            <div className="md:col-span-2 rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-indigo-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-[90px] rounded-full pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Bot size={26} />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-xs font-semibold text-indigo-300">
                    Self-Learning Neural Rival
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Dynamic Ghost AI Rivalry
                </h3>
                <p className="text-slate-300/80 leading-relaxed font-normal max-w-xl mb-6">
                  Unlike predictable computer bots, our Ghost AI analyzes your real-time burst velocity and calculates micro-adjustments to keep you in the flow zone.
                </p>

                {/* Interactive Level Switcher */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                  {Object.entries(ghostLevels).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => setGhostLevel(key)}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        ghostLevel === key
                          ? 'bg-indigo-600/20 border-indigo-500/50 shadow-md shadow-indigo-600/20 text-white'
                          : 'bg-white/[0.03] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-300">{item.title}</div>
                      <div className="text-base font-black text-indigo-400 mt-0.5">{item.wpm}</div>
                    </button>
                  ))}
                </div>

                {/* Selected Level Description Banner */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                  <Sparkles size={18} className="text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-indigo-300">
                      {ghostLevels[ghostLevel].title} · Reaction: {ghostLevels[ghostLevel].reaction}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {ghostLevels[ghostLevel].desc}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>Adaptive difficulty updates every 500ms</span>
                <button
                  type="button"
                  onClick={() => handleProtectedAction('/ai-practice')}
                  className="text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Launch Ghost Arena <ArrowUpRight size={14} />
                </button>
              </div>
            </div>

            {/* Bento Card 2: Sub-5ms Websocket Engine */}
            <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-cyan-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
              
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
                  <Activity size={26} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Zero-Latency Netcode
                </h3>
                <p className="text-slate-300/80 text-sm leading-relaxed mb-6 font-normal">
                  Binary WebSocket frame streaming guarantees your keystrokes are transmitted instantly with optimistic client prediction.
                </p>

                {/* Visual Ping Gauge */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Packet Stream:</span>
                    <span className="text-emerald-400 font-bold">120 Hz</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Round-trip latency:</span>
                    <span className="text-cyan-300 font-bold">3.4 ms</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Packet loss:</span>
                    <span className="text-emerald-400 font-bold">0.00%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 w-full animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>Multi-region relays</span>
                <span className="text-cyan-400 font-medium">99.99% SLA</span>
              </div>
            </div>

            {/* Bento Card 3: Mechanical Sound Engine */}
            <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-purple-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-60 h-60 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                  <Keyboard size={26} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Mechanical Acoustics
                </h3>
                <p className="text-slate-300/80 text-sm leading-relaxed mb-6 font-normal">
                  Synthesized acoustic profiles simulating luxury switches. Click any profile to sample the tactile sound:
                </p>

                {/* Switch acoustic tester buttons */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { id: 'thock', name: 'Topre Thock', desc: 'Electro-capacitive' },
                    { id: 'blue', name: 'Cherry Blue', desc: 'Clicky & Sharp' },
                    { id: 'red', name: 'Gateron Red', desc: 'Smooth Linear' },
                    { id: 'brown', name: 'Holy Panda', desc: 'Tactile Pop' },
                  ].map((sw) => (
                    <button
                      key={sw.id}
                      onClick={() => {
                        setSelectedSwitch(sw.id);
                        playSwitchSound(sw.id);
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        selectedSwitch === sw.id
                          ? 'bg-purple-600/20 border-purple-500/50 text-white'
                          : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-200">{sw.name}</div>
                      <div className="text-[10px] text-purple-300/70">{sw.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>Web Audio API Synthesizer</span>
                <span className="text-purple-400 font-medium">Zero-lag audio</span>
              </div>
            </div>

            {/* Bento Card 4: Keystroke Telemetry & Ergonomics */}
            <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />

              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
                  <BarChart3 size={26} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Deep Keystroke Telemetry
                </h3>
                <p className="text-slate-300/80 text-sm leading-relaxed mb-6 font-normal">
                  Visualize error clusters, finger travel distance, and speed variation curves powered by interactive analytics.
                </p>

                {/* Heatmap Mini Visualizer */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Key Frequency Heatmap
                  </div>
                  <div className="flex gap-1.5 justify-center">
                    {['Q', 'W', 'E', 'R', 'T', 'Y'].map((k) => (
                      <span
                        key={k}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold border ${
                          k === 'E' || k === 'T'
                            ? 'bg-amber-500/30 border-amber-500/60 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1.5 justify-center">
                    {['A', 'S', 'D', 'F', 'G', 'H'].map((k) => (
                      <span
                        key={k}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold border ${
                          k === 'A'
                            ? 'bg-amber-500/30 border-amber-500/60 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                            : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>Per-key latency tracking</span>
                <span className="text-amber-400 font-medium">Heatmap V2</span>
              </div>
            </div>

            {/* Bento Card 5: Ranked Seasons & Global Trophies */}
            <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group hover:border-emerald-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                  <Trophy size={26} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Competitive Seasons
                </h3>
                <p className="text-slate-300/80 text-sm leading-relaxed mb-6 font-normal">
                  Ascend from Novice to Grandmaster in seasonal leagues with skill-based matchmaking and anti-decay algorithms.
                </p>

                {/* League Badges */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { tier: 'Gold', elo: '1400', color: 'border-yellow-500/40 text-yellow-400' },
                    { tier: 'Diamond', elo: '1800', color: 'border-cyan-500/40 text-cyan-300' },
                    { tier: 'Grandmaster', elo: '2200+', color: 'border-purple-500/40 text-purple-400' },
                  ].map((lg) => (
                    <div key={lg.tier} className={`p-2.5 rounded-xl bg-white/[0.02] border text-center ${lg.color}`}>
                      <div className="text-xs font-black">{lg.tier}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{lg.elo} ELO</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>Season 3 currently active</span>
                <Link to="/leaderboard" className="text-emerald-400 font-semibold hover:underline">
                  Leaderboard →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 3: ARCHITECTURE COMPARISON */}
      {/* ======================================================== */}
      <section className="py-24 relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs sm:text-sm font-bold tracking-widest text-cyan-400 uppercase">
            WHY TYPEVERSE DOMINATES
          </span>
          <h2 className="text-3xl sm:text-5xl font-black mt-2 text-white">
            Beyond Traditional Typing Tests
          </h2>
          <p className="text-slate-400 mt-4 text-base max-w-2xl mx-auto">
            See how modern engineering elevates competitive typing from a simple input form to an esport-grade arena.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-xs font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Capability</th>
                  <th className="py-4 px-6 font-semibold text-indigo-400">Typeverse 2.0</th>
                  <th className="py-4 px-6 font-semibold text-slate-500">Legacy Typing Sites</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {[
                  { feat: 'Network Latency', us: '< 4ms WebSocket Stream', them: '100ms - 250ms HTTP Polling' },
                  { feat: 'Ghost AI Technology', us: 'Self-tuning Adaptive Neural Model', them: 'Rigid static-speed counter' },
                  { feat: 'Per-Keystroke Telemetry', us: 'Full velocity curve & error heatmaps', them: 'Single average WPM number' },
                  { feat: 'Tactile Acoustic Engine', us: 'Web Audio API switch synthesis', them: 'None / generic audio clicks' },
                  { feat: 'Matchmaking Rooms', us: 'Zero-reload instant private lobbies', them: 'Clunky page refreshes' },
                  { feat: 'Input Capture Precision', us: 'Microsecond timestamp validation', them: 'DOM change event polling' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-200">{row.feat}</td>
                    <td className="py-4 px-6 font-semibold text-emerald-400 flex items-center gap-2">
                      <Check size={16} className="text-emerald-400 shrink-0" />
                      <span>{row.us}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">{row.them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 4: LIVE LEADERBOARD SNEAK PEEK */}
      {/* ======================================================== */}
      <section className="py-20 relative bg-slate-950/60 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                GLOBAL HALL OF FAME
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
                Top Racers of the Season
              </h2>
            </div>
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-all"
            >
              <span>View Full Leaderboards</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { rank: 1, name: 'KinesisMaster', wpm: 184, acc: '99.8%', badge: '👑 Grandmaster #1', flag: '🇺🇸', color: 'from-amber-500/20 to-indigo-500/10' },
              { rank: 2, name: 'VoidStriker', wpm: 176, acc: '99.4%', badge: '⚡ Grandmaster #2', flag: '🇯🇵', color: 'from-slate-400/20 to-indigo-500/10' },
              { rank: 3, name: 'CyberTypist_99', wpm: 169, acc: '99.1%', badge: '🔥 Grandmaster #3', flag: '🇩🇪', color: 'from-amber-700/20 to-indigo-500/10' },
            ].map((player) => (
              <div
                key={player.rank}
                className={`p-6 rounded-3xl bg-gradient-to-b ${player.color} border border-white/10 backdrop-blur-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black font-mono text-white/90">
                    #{player.rank}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-bold text-white">
                    {player.badge}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{player.flag}</span>
                  <div>
                    <h3 className="font-bold text-white text-lg">{player.name}</h3>
                    <p className="text-xs text-slate-400">Competitive Ranked Arena</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Speed</span>
                    <div className="text-2xl font-black text-white">{player.wpm} <span className="text-xs text-indigo-400">WPM</span></div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Accuracy</span>
                    <div className="text-2xl font-black text-emerald-400">{player.acc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 5: FINAL HIGH-CONVERSION CTA */}
      {/* ======================================================== */}
      <section className="py-28 sm:py-36 relative overflow-hidden flex items-center justify-center border-t border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-[#030712] to-[#030712] -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-cyan-600/20 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-indigo-300 font-semibold mb-6">
            <Flame size={14} className="text-amber-400" />
            100% Free · Browser Native · Zero Installs
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight mb-6">
            Your keyboard awaits.
          </h2>
          <p className="text-lg sm:text-xl text-slate-300/80 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Join thousands of typists and experience the most fluid, competitive typing arena ever built.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-white/20 hover:border-white/40 text-white text-sm sm:text-base font-medium hover:bg-white/5 transition-all duration-200 text-center cursor-pointer"
            >
              Start Racing Now
            </button>
            <button
              type="button"
              onClick={() => handleProtectedAction('/ai-practice')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/20 hover:border-white/40 text-white text-sm sm:text-base font-medium hover:bg-white/5 transition-all duration-200 text-center cursor-pointer"
            >
              Practice vs Ghost AI
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 6: PRO DEVELOPER FOOTER */}
      {/* ======================================================== */}
      <footer className="border-t border-white/10 bg-[#02050e] py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand column */}
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-4 group">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Keyboard size={18} />
                </div>
                <span className="text-xl font-black tracking-wider text-white">
                  TYPE<span className="text-indigo-400">VERSE</span>
                </span>
              </Link>
              <p className="text-slate-400 text-sm max-w-sm mb-4 leading-relaxed font-light">
                The next-generation competitive typing platform engineered with zero dropped frames, adaptive neural ghost AI, and real-time telemetry.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                All Systems Operational (v2.5.0)
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Game Modes</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><Link to="/ai-practice" className="hover:text-indigo-400 transition-colors">Ghost AI Duel</Link></li>
                <li><Link to="/multiplayer" className="hover:text-indigo-400 transition-colors">Multiplayer Matchmaking</Link></li>
                <li><Link to="/practice" className="hover:text-indigo-400 transition-colors">Solo Zen Practice</Link></li>
                <li><Link to="/leaderboard" className="hover:text-indigo-400 transition-colors">Ranked Seasons</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Platform</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><Link to="/about" className="hover:text-indigo-400 transition-colors">Architecture & Specs</Link></li>
                <li><Link to="/leaderboard" className="hover:text-indigo-400 transition-colors">Global ELO</Link></li>
                <li>
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="hover:text-indigo-400 transition-colors text-left cursor-pointer"
                  >
                    Player Sign In
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openAuthModal('signup')}
                    className="hover:text-indigo-400 transition-colors text-left cursor-pointer"
                  >
                    Create Account
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Ergonomics</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li className="text-slate-400">Sub-5ms Latency</li>
                <li className="text-slate-400">Acoustic Synthesizer</li>
                <li className="text-slate-400">Per-Key Heatmaps</li>
                <li className="text-slate-400">Anti-Cheat Engine</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-mono">
            <div>
              &copy; {new Date().getFullYear()} Typeverse Arena. Crafted with extreme speed.
            </div>
            <div className="flex items-center gap-4">
              <span>WebSocket 120Hz</span>
              <span>·</span>
              <span>React 19 Core</span>
              <span>·</span>
              <span>Built by Senior Engineers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

