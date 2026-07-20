import { Link } from 'react-router-dom';
import { TrendingUp, Trophy, Globe, Target, Bot, ChevronRight, Keyboard, Activity, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';

export default function Landing() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const lineInterval = setInterval(() => {
      setVisibleLines(prev => {
        if (prev < 9) return prev + 1;
        clearInterval(lineInterval);
        return prev;
      });
    }, 600);
    return () => clearInterval(lineInterval);
  }, []);

  return (
    <div className="w-full h-full bg-slate-900 min-h-screen overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[min(90vw,36rem)] h-48 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />

        <h1 className="relative w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto mb-5 marquee-viewport">
          <div className="marquee-track">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="marquee-item text-3xl sm:text-4xl md:text-5xl font-black tracking-[0.2em] bg-gradient-to-b from-white via-indigo-100 to-indigo-400/60 bg-clip-text text-transparent"
              >
                TYPEVERSE
              </span>
            ))}
          </div>
        </h1>
        
        <p className="relative text-lg sm:text-xl text-slate-400/90 mb-14 max-w-2xl mx-auto font-light leading-relaxed">
          Compete in real-time, outrun the ghost AI, and climb global ranks in a typing arena built for speed.
        </p>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 w-full max-w-3xl z-10">
          <Link to="/ai-practice" className="hero-glass-cta hero-glass-cta-ai group">
            <span className="hero-glass-cta-shimmer" aria-hidden="true" />
            <span className="hero-glass-cta-glow hero-glass-cta-glow-ai" aria-hidden="true" />
            <span className="hero-glass-cta-inner">
              <span className="hero-glass-cta-icon hero-glass-cta-icon-ai">
                <Bot size={26} />
              </span>
              <span className="hero-glass-cta-copy">
                <span className="hero-glass-cta-title">Race Ghost AI</span>
                <span className="hero-glass-cta-sub">Adaptive neural rival · live WPM duel</span>
              </span>
              <ChevronRight size={20} className="hero-glass-cta-arrow text-purple-300/70 group-hover:text-purple-200 group-hover:translate-x-1 transition-all" />
            </span>
          </Link>

          <Link to="/multiplayer" className="hero-glass-cta hero-glass-cta-mp group">
            <span className="hero-glass-cta-shimmer" aria-hidden="true" />
            <span className="hero-glass-cta-glow hero-glass-cta-glow-mp" aria-hidden="true" />
            <span className="hero-glass-cta-inner">
              <span className="hero-glass-cta-icon hero-glass-cta-icon-mp">
                <Globe size={26} />
              </span>
              <span className="hero-glass-cta-copy">
                <span className="hero-glass-cta-title">Multiplayer Race</span>
                <span className="hero-glass-cta-sub">Zero-lag rooms · global matchmaking</span>
              </span>
              <ChevronRight size={20} className="hero-glass-cta-arrow text-cyan-300/70 group-hover:text-cyan-200 group-hover:translate-x-1 transition-all" />
            </span>
          </Link>
        </div>

        <div className="relative mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-500">
          <span className="inline-flex items-center gap-2">
            <Zap size={14} className="text-indigo-400" />
            Real-time sync
          </span>
          <span className="hidden sm:inline w-px h-4 bg-white/10" />
          <span className="inline-flex items-center gap-2">
            <Activity size={14} className="text-purple-400" />
            Live analytics
          </span>
          <span className="hidden sm:inline w-px h-4 bg-white/10" />
          <span className="inline-flex items-center gap-2">
            <Trophy size={14} className="text-amber-400" />
            Ranked ladders
          </span>
        </div>
        
        {/* Floating UI Elements / Dashboard Preview Concept */}
        <div className="mt-24 w-full max-w-5xl relative group perspective-[2000px]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent z-10"></div>
          <div className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden transform transition-transform duration-700 hover:rotate-x-[2deg] hover:rotate-y-[2deg] hover:scale-[1.02]">
            {/* Fake Window Header */}
            <div className="h-10 border-b border-white/10 bg-white/5 flex items-center px-4 gap-2">
              <div className="w-3 h-3 flex-shrink-0 rounded-full bg-red-500/90 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              <div className="w-3 h-3 flex-shrink-0 rounded-full bg-yellow-500/90 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
              <div className="w-3 h-3 flex-shrink-0 rounded-full bg-green-500/90 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            </div>
            {/* Fake Window Content */}
            <div className="p-4 sm:p-8 flex items-center justify-center min-h-[16rem] sm:min-h-[24rem] opacity-90 font-mono text-xs sm:text-base text-indigo-200/80">
              <div className="max-w-2xl text-left space-y-3 w-full">
                {visibleLines > 0 && <div><span className="text-slate-500">// Initialize high-performance engine</span></div>}
                {visibleLines > 1 && <div><span className="text-indigo-400">const</span> <span className="text-yellow-200">player</span> = <span className="text-green-300">new</span> <span className="text-blue-300">Typist</span>(&#123; latency: <span className="text-orange-300">'0ms'</span> &#125;);</div>}
                {visibleLines > 2 && <br/>}
                {visibleLines > 3 && <div><span className="text-slate-500">// Configure neural loadout</span></div>}
                {visibleLines > 4 && <div><span className="text-yellow-200">player</span>.<span className="text-blue-300">equip</span>(<span className="text-orange-300">'Ghost_AI_Core'</span>);</div>}
                {visibleLines > 5 && <div><span className="text-yellow-200">player</span>.<span className="text-blue-300">setTargetWPM</span>(<span className="text-purple-400">180</span>);</div>}
                {visibleLines > 6 && <div><span className="text-yellow-200">player</span>.<span className="text-blue-300">enableOverdrive</span>(<span className="text-indigo-400">true</span>);</div>}
                {visibleLines > 7 && <br/>}
                {visibleLines > 8 && <div><span className="text-slate-500">// Connect to competitive matchmaking</span></div>}
                {visibleLines > 8 && <div><span className="text-indigo-400">await</span> <span className="text-yellow-200">player</span>.<span className="text-blue-300">connectToLobby</span>(<span className="text-orange-300">'Global_Elite_Ranked'</span>);</div>}
                {visibleLines > 8 && <div className="animate-pulse text-emerald-400 pt-2">{'>'} Connection established. Loading arena..._</div>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative z-10 border-t border-white/5 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-6xl font-black mb-6 bg-gradient-to-r from-white via-indigo-100 to-slate-400 bg-clip-text text-transparent">Engineered for Speed</h2>
            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto font-light">Precision tools and dynamic environments designed to push your WPM beyond its limits.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Bot size={28} />, title: "Adaptive Ghost AI", desc: "Train against a neural opponent that learns your weaknesses and challenges you dynamically.", color: "indigo" },
              { icon: <Activity size={28} />, title: "Live Multiplayer", desc: "Experience zero-latency races with real-time websocket synchronization.", color: "purple" },
              { icon: <TrendingUp size={28} />, title: "Deep Analytics", desc: "Visualize every keystroke, error rate, and burst speed with gorgeous interactive charts.", color: "blue" },
              { icon: <Trophy size={28} />, title: "Global Ladders", desc: "Ascend from Bronze to Grandmaster in competitive seasonal leaderboards.", color: "amber" },
              { icon: <Keyboard size={28} />, title: "Pro Mechanics", desc: "Customizable layouts, raw input handling, and mechanical switch audio feedback.", color: "emerald" },
              { icon: <Target size={28} />, title: "Daily Gauntlet", desc: "Curated texts and precision challenges updated daily to keep your skills sharp.", color: "rose" }
            ].map((feature, idx) => (
              <div key={idx} className="group relative bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:bg-white/[0.05] transition-all duration-500 overflow-hidden flex flex-col justify-between h-full">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-[50px] group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
                
                <div>
                  <div className="w-14 h-14 rounded-2xl mb-8 flex items-center justify-center bg-white/5 border border-white/10 text-white shadow-lg group-hover:scale-110 transition-transform duration-500 group-hover:text-indigo-400">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed font-light">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden flex items-center justify-center z-10 border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#030712] to-[#030712] -z-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl sm:text-7xl font-black mb-8 text-white tracking-tight">Your keyboard awaits.</h2>
          <p className="text-xl text-indigo-200/60 mb-12 max-w-2xl mx-auto font-light">Join thousands of typists and experience the most fluid, competitive typing platform ever created.</p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-12 py-5 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-full text-xl font-bold hover:bg-white/10 hover:border-white/20 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all duration-300"
          >
            Start Typing Now
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#030712] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-black tracking-tighter text-white">
            TYPE<span className="text-indigo-500">VERSE</span>
          </div>
          <div className="text-slate-500 font-medium text-sm">
            &copy; {new Date().getFullYear()} Typeverse. Crafted with extreme speed.
          </div>
        </div>
      </footer>
    </div>
  );
}
