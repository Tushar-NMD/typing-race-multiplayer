import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Target, Zap, Trophy, Bot, Cpu, Activity, ShieldCheck, 
  ArrowLeft, ArrowRight, Sparkles, Terminal, Layers, Globe,
  CheckCircle2, Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function About() {
  const { isAuthenticated, openAuthModal } = useAuth();

  const corePillars = [
    {
      icon: Bot,
      title: "Adaptive Ghost AI Rivalry",
      tag: "Neural Model v2.4",
      accent: "from-indigo-500 to-purple-600",
      border: "border-indigo-500/20 group-hover:border-indigo-500/40",
      description: "Unlike static computer bots that type at fixed intervals, our neural Ghost AI analyzes your real-time burst velocity and calculates micro-adjustments to push your speed beyond human limits."
    },
    {
      icon: Activity,
      title: "Sub-5ms Binary WebSocket Netcode",
      tag: "120Hz Stream",
      accent: "from-cyan-500 to-blue-600",
      border: "border-cyan-500/20 group-hover:border-cyan-500/40",
      description: "Binary frame streaming guarantees every single keystroke is synchronized instantaneously across global rooms with zero dropped frames and optimistic client prediction."
    },
    {
      icon: Target,
      title: "Per-Keystroke Telemetry Engine",
      tag: "Microsecond Precision",
      accent: "from-emerald-500 to-teal-600",
      border: "border-emerald-500/20 group-hover:border-emerald-500/40",
      description: "Every character strike is measured for hesitation deltas, burst spikes, and error fatigue. Comprehensive ECharts graphs decode your typing ergonomics."
    },
    {
      icon: Trophy,
      title: "Global Seasons & Matchmaking",
      tag: "Competitive Arena",
      accent: "from-amber-500 to-orange-600",
      border: "border-amber-500/20 group-hover:border-amber-500/40",
      description: "Climb through seasonal ranks, create private multiplayer scrim rooms with instant shareable invite codes, and challenge friends on real-time leaderboards."
    }
  ];

  const techSpecs = [
    { label: "Frontend Engine", value: "React 19 + Vite HMR" },
    { label: "Netcode Protocol", value: "Socket.IO Binary Framing" },
    { label: "Telemetry Charts", value: "Apache ECharts 6.1" },
    { label: "Security & Auth", value: "JWT + Google OAuth 2.0" },
    { label: "Styling Architecture", value: "Tailwind CSS + Glassmorphism" },
    { label: "Anti-Cheat Audit", value: "Server-Validated Keystroke Timestamps" }
  ];

  const comparisonFeatures = [
    {
      title: "Self-Tuning AI Rivals",
      us: "Dynamically mirrors human typing fatigue and burst pacing",
      them: "Rigid static timer that types at flat robotic speeds"
    },
    {
      title: "WebSocket Netcode",
      us: "True real-time binary streaming with < 5ms packet latency",
      them: "Polling or delayed REST updates with noticeable lag"
    },
    {
      title: "Keystroke Telemetry",
      us: "Instant hesitation charts, WPM burst velocity, and accuracy curves",
      them: "Only basic overall WPM and error count at the very end"
    },
    {
      title: "Competitive Matchmaking",
      us: "Ranked global leaderboards, private rooms, and spectator support",
      them: "Isolated single-player modes with generic leaderboards"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-indigo-500/30 selection:text-white pb-24">
      {/* Radiant Specular Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[85vw] max-w-5xl h-[450px] bg-indigo-600/15 blur-[150px] pointer-events-none rounded-full -z-10" />
      <div className="fixed top-1/2 -left-20 w-[40vw] h-[400px] bg-cyan-600/10 blur-[160px] pointer-events-none rounded-full -z-10" />
      <div className="fixed bottom-0 right-10 w-[35vw] h-[350px] bg-purple-600/10 blur-[140px] pointer-events-none rounded-full -z-10" />

      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-slate-400 hover:text-white transition-colors group px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-indigo-400" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-cyan-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono uppercase tracking-wider mb-5 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <Sparkles size={13} className="text-indigo-400" />
            <span>Architected for Extreme Typing Velocity</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight">
            The Next-Generation <span className="bg-gradient-to-r from-white via-indigo-200 to-cyan-300 bg-clip-text text-transparent">Competitive Typing</span> Ecosystem
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-400 font-mono max-w-2xl mx-auto leading-relaxed mb-8">
            TypeVerse was forged to transform typing practice into an esports-grade competitive arena. Built with zero dropped frames, adaptive neural ghost AI, and instant telemetry analysis.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 backdrop-blur-md">
              <Zap size={13} className="text-cyan-400" />
              Sub-5ms Packet Latency
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 backdrop-blur-md">
              <Bot size={13} className="text-indigo-400" />
              Neural Ghost AI Engine
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 backdrop-blur-md">
              <ShieldCheck size={13} className="text-emerald-400" />
              Anti-Cheat Keystroke Verification
            </span>
          </div>
        </div>

        {/* Mission Statement Glass Box */}
        <div className="relative rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-10 backdrop-blur-2xl mb-16 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-300 mb-4">
              <Terminal size={13} className="text-indigo-400" />
              <span>ORIGIN & MISSION</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-4">
              Why We Engineered TypeVerse
            </h2>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4 font-light">
              Traditional typing tests are rigid, boring, and disconnected. They treat typing speed as an isolated metric rather than a dynamic physiological flow state.
            </p>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
              We engineered TypeVerse from the ground up for software developers, competitive gamers, and writers who want to break plateaus. By pairing human racers against self-calibrating Ghost AI and streaming real-time room netcode, we provide the ultimate training ground to double your burst speed.
            </p>
          </div>
        </div>

        {/* Core Architectural Pillars (Bento Grid) */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-2">Core Innovations</h2>
            <h3 className="text-2xl sm:text-4xl font-black font-display text-white">Esports-Grade Features</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {corePillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={index}
                  className={`group relative rounded-3xl bg-slate-900/40 border ${pillar.border} p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between overflow-hidden`}
                >
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/[0.02] rounded-full blur-2xl pointer-events-none group-hover:bg-white/[0.05] transition-all" />

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pillar.accent} p-[1.5px] shadow-lg`}>
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white">
                          <Icon size={22} className="text-white" />
                        </div>
                      </div>
                      <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-300">
                        {pillar.tag}
                      </span>
                    </div>

                    <h4 className="text-xl font-bold text-white mb-2 font-display group-hover:text-indigo-300 transition-colors">
                      {pillar.title}
                    </h4>

                    <p className="text-slate-400 text-sm leading-relaxed font-light">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* The TypeVerse Advantage: Comparison Matrix */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-2">Competitive Edge</h2>
            <h3 className="text-2xl sm:text-4xl font-black font-display text-white">Why TypeVerse Outperforms</h3>
          </div>

          <div className="rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-xl overflow-hidden">
            <div className="divide-y divide-white/5">
              {comparisonFeatures.map((item, idx) => (
                <div key={idx} className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-white/[0.02] transition-colors">
                  <div className="md:col-span-4 font-bold text-white font-display text-base">
                    {item.title}
                  </div>
                  <div className="md:col-span-4 text-xs sm:text-sm text-emerald-300 flex items-start gap-2 bg-emerald-500/[0.06] border border-emerald-500/20 p-3 rounded-xl font-mono">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item.us}</span>
                  </div>
                  <div className="md:col-span-4 text-xs sm:text-sm text-slate-500 flex items-start gap-2 bg-white/[0.02] border border-white/5 p-3 rounded-xl font-mono">
                    <span className="text-rose-400 shrink-0 font-bold">✕</span>
                    <span>{item.them}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Architecture Specs Showcase */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-2">Engineering Stack</h2>
            <h3 className="text-2xl sm:text-4xl font-black font-display text-white">Under the Hood</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono">
            {techSpecs.map((spec, i) => (
              <div 
                key={i}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md hover:border-white/20 transition-all"
              >
                <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">
                  {spec.label}
                </div>
                <div className="text-sm font-semibold text-white">
                  {spec.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Footer Card */}
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-cyan-600/20 border border-white/15 p-8 sm:p-12 backdrop-blur-2xl text-center overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.8)]">
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500/20 blur-[90px] rounded-full pointer-events-none" />

          <h3 className="text-2xl sm:text-4xl font-black font-display text-white mb-3">
            Ready to Discover Your Peak Typing Speed?
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-slate-300 font-mono max-w-xl mx-auto mb-8 leading-relaxed">
            Take on our adaptive Ghost AI bot, climb the Hall of Titans global leaderboard, and track your telemetry stats in real time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/ai-practice"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Duel Ghost AI</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              to="/leaderboard"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <Trophy size={15} className="text-amber-400" />
              <span>Explore Leaderboard</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
