import { Link } from 'react-router-dom';
import { Zap, TrendingUp, Trophy, Globe, Target, Keyboard, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Landing() {
  const topPlayers = [
    { rank: 1, name: 'John', wpm: 120, accuracy: 98 },
    { rank: 2, name: 'Doe', wpm: 115, accuracy: 96 },
    { rank: 3, name: 'Mychel', wpm: 102, accuracy: 94 }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium text-sm mb-8 animate-pulse">
          <Zap size={16} className="fill-indigo-400" />
          <span>The Ultimate Typing Experience</span>
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6 tracking-tight">
          <span className="bg-gradient-to-br from-white via-indigo-200 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
            TYPE
          </span>
          <span className="bg-gradient-to-br from-purple-400 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
            VERSE
          </span>
        </h1>
        
        <p className="text-lg sm:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          Unleash your speed. Compete in real-time races, climb the global leaderboards, and become a typing legend.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6 items-center w-full sm:w-auto">
          <Link
            to="/practice"
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-xl text-lg font-bold hover:bg-indigo-500 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.7)] hover:-translate-y-1"
          >
            <Keyboard size={24} />
            <span>Start Practice</span>
            <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
          </Link>

          <Link
            to="/multiplayer"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-800/80 backdrop-blur-sm border border-slate-700 text-white rounded-xl text-lg font-bold hover:bg-slate-700 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1"
          >
            <Globe size={24} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
            <span>Multiplayer Race</span>
            <ChevronRight size={20} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative border-t border-white/5 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Next-Gen Features</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Everything you need to take your typing skills to the next level.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Zap size={32} />, title: "Real-time Multiplayer", desc: "Race against friends or random players worldwide with zero latency.", color: "from-blue-500 to-indigo-500" },
              { icon: <TrendingUp size={32} />, title: "Advanced Analytics", desc: "Track your WPM, accuracy, and consistency with detailed charts.", color: "from-purple-500 to-pink-500" },
              { icon: <Trophy size={32} />, title: "Global Leaderboards", desc: "Compete for the top spot and earn exclusive badges and rewards.", color: "from-amber-400 to-orange-500" },
              { icon: <Globe size={32} />, title: "Custom Themes", desc: "Personalize your typing environment with beautiful, handcrafted themes.", color: "from-emerald-400 to-teal-500" },
              { icon: <Target size={32} />, title: "Daily Challenges", desc: "Complete daily typing quests to earn XP and level up your profile.", color: "from-rose-400 to-red-500" },
              { icon: <Keyboard size={32} />, title: "Custom Tests", desc: "Create your own text snippets or import custom content to practice.", color: "from-cyan-400 to-blue-500" }
            ].map((feature, idx) => (
              <div key={idx} className="group relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                <div className={`w-14 h-14 rounded-xl mb-6 flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-lg text-white`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-indigo-300 transition-colors">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-indigo-900/10 -z-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">Hall of Fame</h2>
            <p className="text-slate-400 text-lg">The fastest typists in the Typeverse.</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-3xl border border-slate-700/50 p-2 sm:p-6 shadow-2xl">
            {topPlayers.map((player, idx) => (
              <div key={player.rank} className="group flex items-center justify-between p-4 sm:p-6 rounded-2xl hover:bg-slate-700/50 transition-colors mb-2 last:mb-0 border border-transparent hover:border-slate-600/50 cursor-default">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-lg
                    ${idx === 0 ? 'bg-amber-500 text-amber-950 shadow-amber-500/30' : 
                      idx === 1 ? 'bg-slate-300 text-slate-800 shadow-slate-300/30' : 
                      idx === 2 ? 'bg-amber-700 text-amber-100 shadow-amber-700/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                    {player.rank}
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{player.name}</div>
                    <div className="text-sm text-slate-400 mt-1">Accuracy: <span className="text-emerald-400">{player.accuracy}%</span></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    {player.wpm}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wider">WPM</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-950/20 -z-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-6xl font-black mb-8 text-white">Ready to type faster?</h2>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-10 py-5 bg-white text-indigo-950 rounded-2xl text-xl font-black hover:bg-indigo-50 transition-all duration-300 hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-[#0a0a0f] py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-black tracking-tight text-white">
            TYPE<span className="text-indigo-500">VERSE</span>
          </div>
          <div className="text-slate-500 font-medium">
            &copy; 2026 Typeverse. Crafted with speed.
          </div>
        </div>
      </footer>
    </div>
  );
}
