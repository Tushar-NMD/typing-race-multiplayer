import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { 
  Zap, Users, Trophy, History as HistoryIcon, UserCircle, Settings, Bot, 
  ArrowRight, Flame, Target, Award, Plus, Sparkles, ChevronRight, Activity, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { matchService } from '../services/matchService';
import ResultsPage from './ResultsPage';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId;
    
    const fetchData = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        
        // Fetch user stats
        const statsResponse = await matchService.getUserStats();
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

        // Fetch match history
        const historyResponse = await matchService.getUserHistory(20);
        if (historyResponse.success) {
          setHistory(historyResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    if (user) {
      fetchData(true);
      intervalId = setInterval(() => fetchData(false), 4000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Zap, active: true },
    { name: 'Practice', path: '/practice', icon: Target },
    { name: 'Ghost AI Race', path: '/ai-practice', icon: Bot },
    { name: 'Multiplayer', path: '/multiplayer', icon: Users },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'History', path: '/history', icon: HistoryIcon },
    { name: 'Friends', path: '/friends', icon: UserCircle },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-indigo-500/30 selection:text-white pb-20">
      {/* Radiant ambient glow lights */}
      <div className="fixed top-0 left-1/3 w-[70vw] max-w-4xl h-[400px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full -z-10" />
      <div className="fixed bottom-10 right-10 w-[40vw] h-[350px] bg-purple-600/10 blur-[150px] pointer-events-none rounded-full -z-10" />

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 flex flex-col lg:flex-row gap-6">
        {/* Sleek Frosted Glass Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-3.5 sm:p-4 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] lg:sticky lg:top-28">
            {/* User Quick Info */}
            <div className="p-3.5 mb-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1.5px] shrink-0 shadow-md shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-display font-black text-white text-base">
                  {user?.name?.[0]?.toUpperCase() || 'R'}
                </div>
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-white truncate">{user?.name || 'Racer'}</h4>
                <p className="text-xs text-slate-400 font-mono truncate">@{user?.username || 'pilot'}</p>
              </div>
            </div>

            {/* Nav list */}
            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1 pb-1 lg:pb-0 custom-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 lg:shrink ${
                      item.active
                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-white/20 shadow-md shadow-indigo-500/10 font-semibold backdrop-blur-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon size={18} className={item.active ? 'text-indigo-400' : 'text-slate-500'} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Dashboard Workspace */}
        <main className="flex-1 min-w-0 space-y-6 sm:space-y-8">
          {/* Welcome Header */}
          <div className="relative rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 blur-[80px] pointer-events-none rounded-full" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-indigo-300 text-xs font-mono uppercase tracking-wider mb-2">
                  <Sparkles size={12} className="text-indigo-400" />
                  Telemetry Dashboard
                </div>
                <h1 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight">
                  Welcome back, {user?.name || 'Pilot'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
                  Ready to push your keystroke burst velocity past personal records?
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/ai-practice"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Bot size={15} />
                  <span>Race Ghost AI</span>
                </Link>
                <Link
                  to="/multiplayer"
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-white font-semibold text-xs backdrop-blur-md transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Users size={15} className="text-cyan-400" />
                  <span>Multiplayer</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 font-mono">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Flame size={13} className="text-amber-400" />
                Peak Burst
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300">
                {stats?.highestWPM || 0} <span className="text-xs font-normal text-slate-400">WPM</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Activity size={13} className="text-indigo-400" />
                Average WPM
              </div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-300">
                {stats?.averageWPM || 0} <span className="text-xs font-normal text-slate-400">WPM</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Target size={13} className="text-emerald-400" />
                Accuracy
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                {stats?.avgAccuracy || 0}%
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl">
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Award size={13} className="text-purple-400" />
                Win Rate
              </div>
              <div className="text-2xl sm:text-3xl font-black text-purple-300">
                {stats?.winRate || 0}%
              </div>
            </div>
          </div>

          {/* Performance Telemetry Graph Section */}
          <section className="rounded-3xl bg-slate-900/40 border border-white/10 p-5 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-display text-white">Performance Velocity Stream</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Real-time WPM acceleration & accuracy consistency curve</p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl">
              <ResultsPage 
                mockData={
                  history.length > 0 ? {
                    series1Name: 'WPM',
                    series2Name: 'Accuracy (%)',
                    time: history.length === 1 
                      ? ['Start', new Date(history[0].createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})] 
                      : [...history].reverse().map(h => new Date(h.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})),
                    wpm: history.length === 1 ? [0, history[0].wpm] : [...history].reverse().map(h => h.wpm),
                    raw: history.length === 1 ? [0, history[0].accuracy] : [...history].reverse().map(h => h.accuracy)
                  } : null
                }
                mockStats={
                  stats ? {
                    wpm: stats.highestWPM || 0,
                    accuracy: stats.avgAccuracy || 0,
                    raw: stats.averageWPM || 0,
                    consistency: stats.winRate || 0,
                    characters: { correct: stats.gamesPlayed || 0, incorrect: stats.wins || 0, extra: 0, missed: 0 },
                    time: '-',
                    language: 'Aggregate',
                    difficulty: 'Profile',
                    testType: 'All Time'
                  } : null
                }
              />
            </div>
          </section>

          {/* Quick Play Launchpad */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold font-display text-white mb-4">Launchpad & Scrims</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <Link 
                to="/practice" 
                className="group p-5 rounded-2xl bg-slate-900/40 hover:bg-white/[0.05] border border-white/10 hover:border-indigo-500/40 backdrop-blur-xl transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-105 transition-transform">
                  <Target size={20} />
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Solo Practice</h4>
                <p className="text-xs text-slate-400 font-mono">Custom text, languages, and untimed zen pacing</p>
              </Link>

              <Link 
                to="/ai-practice" 
                className="group p-5 rounded-2xl bg-slate-900/40 hover:bg-white/[0.05] border border-white/10 hover:border-purple-500/40 backdrop-blur-xl transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
                  <Bot size={20} />
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Ghost AI Arena</h4>
                <p className="text-xs text-slate-400 font-mono">Self-tuning dynamic neural bot matching your speed</p>
              </Link>

              <Link 
                to="/multiplayer" 
                className="group p-5 rounded-2xl bg-slate-900/40 hover:bg-white/[0.05] border border-white/10 hover:border-cyan-500/40 backdrop-blur-xl transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
                  <Users size={20} />
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Multiplayer Room</h4>
                <p className="text-xs text-slate-400 font-mono">Create or join rooms with zero dropped frame netcode</p>
              </Link>

              <Link 
                to="/leaderboard" 
                className="group p-5 rounded-2xl bg-slate-900/40 hover:bg-white/[0.05] border border-white/10 hover:border-amber-500/40 backdrop-blur-xl transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                  <Trophy size={20} />
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Hall of Titans</h4>
                <p className="text-xs text-slate-400 font-mono">Climb global divisions and compare against friends</p>
              </Link>
            </div>
          </section>

          {/* Recent Match History Table */}
          <section className="rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-display text-white">Recent Match Telemetry</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Your recorded race runs & performance breakdowns</p>
              </div>
              <Link 
                to="/history" 
                className="text-xs font-mono text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                View Full Log <ChevronRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4 sm:px-6">Timestamp</th>
                    <th className="py-3.5 px-4 sm:px-6">Outcome</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">WPM</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Accuracy</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Mistakes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {!loading && history.length > 0 ? (
                    history.slice(0, 8).map((result, index) => {
                      const isFirst = result.position === 1;
                      return (
                        <tr key={index} className="hover:bg-white/[0.03] transition-colors">
                          <td className="py-3.5 px-4 sm:px-6 text-slate-300">
                            {new Date(result.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-4 sm:px-6">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isFirst
                                ? 'bg-amber-400/15 border border-amber-400/30 text-amber-300'
                                : 'bg-white/[0.04] border border-white/10 text-slate-300'
                            }`}>
                              {isFirst ? '🏆 Winner (#1)' : `Rank #${result.position || '-'}`}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-right font-black text-white">
                            {result.wpm} <span className="text-[10px] text-slate-500 font-normal">WPM</span>
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            <span className={`font-semibold ${
                              result.accuracy >= 95 ? 'text-emerald-400' : 'text-slate-300'
                            }`}>
                              {result.accuracy}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-right text-rose-400/90">
                            {result.mistakes || 0}
                          </td>
                        </tr>
                      );
                    })
                  ) : !loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 px-4 text-center text-slate-400">
                        <Clock size={24} className="mx-auto mb-2 text-slate-500" />
                        <p>No race telemetry logged yet. Hop into the arena to build your record!</p>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 px-4 text-center text-slate-400">
                        Loading match telemetry...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
