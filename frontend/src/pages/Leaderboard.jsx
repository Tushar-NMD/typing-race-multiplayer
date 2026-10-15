import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Trophy, ArrowLeft, Crown, Flame, Globe, Users, Calendar, 
  Medal, Zap, Search, TrendingUp, Sparkles, Target, Award,
  ChevronRight, RefreshCw
} from 'lucide-react';
import { matchService } from '../services/matchService';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('global');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('avgWpm'); // 'avgWpm' | 'bestWpm' | 'avgAccuracy' | 'winRate'

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      let response;

      if (activeTab === 'friends') {
        response = await matchService.getFriendLeaderboard();
      } else {
        const period = activeTab === 'global' ? 'all' : activeTab === 'weekly' ? 'week' : 'month';
        response = await matchService.getLeaderboard(period, 50);
      }

      if (response && response.success && Array.isArray(response.data)) {
        setLeaderboardData(response.data);
      } else {
        setLeaderboardData([]);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...leaderboardData];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => item.username?.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      const valA = Number(a[sortBy] ?? a.avgWpm ?? 0);
      const valB = Number(b[sortBy] ?? b.avgWpm ?? 0);
      return valB - valA;
    });

    return result;
  }, [leaderboardData, searchQuery, sortBy]);

  // Top 3 Podium typists
  const topThree = useMemo(() => {
    return filteredAndSortedData.slice(0, 3);
  }, [filteredAndSortedData]);

  // Global high stats
  const stats = useMemo(() => {
    if (!leaderboardData.length) return { highestWpm: 0, avgAccuracy: 0, totalRacers: 0 };
    const maxWpm = Math.max(...leaderboardData.map(d => Number(d.bestWpm || d.avgWpm || 0)));
    const avgAcc = Math.round(
      leaderboardData.reduce((acc, curr) => acc + Number(curr.avgAccuracy || 0), 0) / leaderboardData.length
    );
    return {
      highestWpm: maxWpm || 0,
      avgAccuracy: avgAcc || 0,
      totalRacers: leaderboardData.length
    };
  }, [leaderboardData]);

  const tabs = [
    { id: 'global', label: 'All-Time Global', icon: Globe },
    { id: 'weekly', label: 'Weekly Sprint', icon: Flame },
    { id: 'monthly', label: 'Monthly Season', icon: Calendar },
    { id: 'friends', label: 'Friends Circle', icon: Users, protected: true },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-indigo-500/30 selection:text-white pb-24">
      {/* Radiant specular glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-5xl h-[400px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full -z-10" />
      <div className="fixed top-1/3 -right-20 w-[40vw] h-[400px] bg-purple-600/10 blur-[150px] pointer-events-none rounded-full -z-10" />
      <div className="fixed bottom-0 left-10 w-[30vw] h-[300px] bg-cyan-600/10 blur-[130px] pointer-events-none rounded-full -z-10" />

      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to={isAuthenticated ? "/dashboard" : "/"} 
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-slate-400 hover:text-white transition-colors group px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-indigo-400" />
            <span>{isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}</span>
          </Link>

          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 disabled:opacity-50 cursor-pointer"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Hero Banner Header */}
        <div className="text-center mb-10 sm:mb-12 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-indigo-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase tracking-wider mb-4 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <Trophy size={13} className="text-amber-400" />
            <span>TypeVerse Hall of Titans</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-white mb-4">
            Global Speed <span className="bg-gradient-to-r from-amber-300 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">Rankings</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-400 font-mono max-w-2xl mx-auto leading-relaxed">
            Live telemetry leaderboard. The fastest keystroke velocities authenticated with real-time anti-cheat validation.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 max-w-2xl mx-auto mt-8 font-mono">
            <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5 mb-1">
                <Flame size={13} className="text-amber-400" />
                Peak Burst
              </div>
              <div className="text-lg sm:text-2xl font-black text-amber-300">
                {stats.highestWpm} <span className="text-xs text-slate-400 font-normal">WPM</span>
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5 mb-1">
                <Target size={13} className="text-emerald-400" />
                Avg Accuracy
              </div>
              <div className="text-lg sm:text-2xl font-black text-emerald-400">
                {stats.avgAccuracy || 98}%
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5 mb-1">
                <Users size={13} className="text-indigo-400" />
                Ranked Typists
              </div>
              <div className="text-lg sm:text-2xl font-black text-indigo-300">
                {stats.totalRacers}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PODIUM OF TOP 3 (Shown when we have at least 1 racer) */}
        {/* ======================================================== */}
        {!loading && topThree.length > 0 && !searchQuery && (
          <div className="mb-12">
            <div className="text-center mb-6">
              <span className="text-xs font-mono text-slate-400 tracking-wider uppercase inline-flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-400" />
                Current Podium Leaders
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-4xl mx-auto">
              {/* 2nd Place (Silver) */}
              <div className="order-2 md:order-1">
                {topThree[1] ? (
                  <div className="relative rounded-3xl bg-slate-900/40 border border-slate-300/20 p-5 sm:p-6 backdrop-blur-xl text-center group hover:border-slate-300/40 transition-all duration-300 hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-800 border border-slate-400/40 text-slate-300 text-xs font-mono font-bold flex items-center gap-1">
                      <span>🥈</span> #2 Silver
                    </div>
                    
                    <div className="w-16 h-16 mx-auto mb-3 mt-1 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 p-[1.5px] shadow-lg shadow-slate-400/10">
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-display font-black text-xl text-white">
                        {topThree[1].username?.[0]?.toUpperCase() || '2'}
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-white truncate px-2">{topThree[1].username}</h3>
                    <div className="text-2xl font-black text-slate-200 font-mono mt-1">
                      {topThree[1].avgWpm || topThree[1].bestWpm} <span className="text-xs text-slate-400 font-normal">WPM</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10 flex justify-center gap-4 text-xs font-mono text-slate-400">
                      <span>Acc: <strong className="text-emerald-400">{topThree[1].avgAccuracy}%</strong></span>
                      <span>Races: <strong className="text-slate-200">{topThree[1].games}</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="h-44 rounded-3xl border border-dashed border-white/10 flex items-center justify-center text-xs text-slate-500 font-mono">
                    #2 Spot Available
                  </div>
                )}
              </div>

              {/* 1st Place (Gold Titan) - Elevated */}
              <div className="order-1 md:order-2">
                {topThree[0] ? (
                  <div className="relative rounded-3xl bg-gradient-to-b from-amber-500/15 via-slate-900/60 to-slate-950/80 border-2 border-amber-400/50 p-6 sm:p-7 backdrop-blur-2xl text-center group hover:border-amber-400/80 transition-all duration-300 md:-translate-y-4 shadow-[0_20px_50px_rgba(245,158,11,0.2)]">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-mono font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/40 uppercase tracking-wider">
                      <Crown size={14} className="fill-slate-950" />
                      Grand Champion
                    </div>
                    
                    <div className="w-20 h-20 mx-auto mb-3 mt-2 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 p-[2px] shadow-xl shadow-amber-500/30">
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-display font-black text-2xl text-amber-300">
                        {topThree[0].username?.[0]?.toUpperCase() || '1'}
                      </div>
                    </div>

                    <h3 className="font-extrabold text-lg sm:text-xl text-white truncate px-2">{topThree[0].username}</h3>
                    <div className="text-3xl sm:text-4xl font-black text-amber-300 font-mono mt-1">
                      {topThree[0].avgWpm || topThree[0].bestWpm} <span className="text-xs text-amber-400/70 font-normal">WPM</span>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-amber-500/20 flex justify-center gap-5 text-xs font-mono">
                      <span className="text-slate-300">Acc: <strong className="text-emerald-400">{topThree[0].avgAccuracy}%</strong></span>
                      <span className="text-slate-300">Win Rate: <strong className="text-amber-300">{topThree[0].winRate || 100}%</strong></span>
                      <span className="text-slate-300">Races: <strong className="text-white">{topThree[0].games}</strong></span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* 3rd Place (Bronze) */}
              <div className="order-3">
                {topThree[2] ? (
                  <div className="relative rounded-3xl bg-slate-900/40 border border-amber-700/30 p-5 sm:p-6 backdrop-blur-xl text-center group hover:border-amber-700/50 transition-all duration-300 hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-800 border border-amber-700/40 text-amber-500 text-xs font-mono font-bold flex items-center gap-1">
                      <span>🥉</span> #3 Bronze
                    </div>
                    
                    <div className="w-16 h-16 mx-auto mb-3 mt-1 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-900 p-[1.5px] shadow-lg shadow-amber-700/20">
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-display font-black text-xl text-white">
                        {topThree[2].username?.[0]?.toUpperCase() || '3'}
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-white truncate px-2">{topThree[2].username}</h3>
                    <div className="text-2xl font-black text-amber-500 font-mono mt-1">
                      {topThree[2].avgWpm || topThree[2].bestWpm} <span className="text-xs text-slate-400 font-normal">WPM</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10 flex justify-center gap-4 text-xs font-mono text-slate-400">
                      <span>Acc: <strong className="text-emerald-400">{topThree[2].avgAccuracy}%</strong></span>
                      <span>Races: <strong className="text-slate-200">{topThree[2].games}</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="h-44 rounded-3xl border border-dashed border-white/10 flex items-center justify-center text-xs text-slate-500 font-mono">
                    #3 Spot Available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TABS & CONTROLS TOOLBAR */}
        {/* ======================================================== */}
        <div className="mb-6 space-y-4">
          {/* Main Period Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDisabled = tab.protected && !isAuthenticated;

              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-500/25 to-purple-500/25 text-white border border-white/20 shadow-lg shadow-indigo-500/10 backdrop-blur-md' 
                      : isDisabled
                        ? 'text-slate-600 cursor-not-allowed'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                  <span>{tab.label}</span>
                  {tab.protected && !isAuthenticated && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-white/5 rounded text-slate-500 font-mono">
                      Login
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search and Sort Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search racer username..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/50 focus:bg-white/[0.07] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs px-1.5 py-0.5 rounded"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-slate-500 uppercase tracking-wider shrink-0 mr-1 text-[11px]">Sort By:</span>
              {[
                { id: 'avgWpm', label: 'Avg WPM' },
                { id: 'bestWpm', label: 'Peak Burst' },
                { id: 'avgAccuracy', label: 'Accuracy' },
                { id: 'games', label: 'Races Run' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                    sortBy === opt.id
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                      : 'text-slate-400 hover:text-white bg-white/[0.02] border border-white/5 hover:border-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* LEADERBOARD TABLE CARD */}
        {/* ======================================================== */}
        <div className="rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] sm:text-xs font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-4 sm:px-6 w-20 text-center">Rank</th>
                  <th className="py-4 px-4 sm:px-6">Contender</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Avg Speed</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Peak WPM</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Accuracy</th>
                  <th className="py-4 px-4 sm:px-6 text-right hidden sm:table-cell">Races</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs sm:text-sm">
                {/* Loading Skeleton */}
                {loading && (
                  <>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-4 px-4 sm:px-6 text-center">
                          <div className="w-8 h-8 rounded-xl bg-white/5 mx-auto" />
                        </td>
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 shrink-0" />
                            <div className="space-y-1.5">
                              <div className="w-28 h-3.5 rounded bg-white/5" />
                              <div className="w-16 h-2.5 rounded bg-white/5" />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="w-14 h-4 rounded bg-white/5 ml-auto" />
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="w-12 h-4 rounded bg-white/5 ml-auto" />
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="w-12 h-4 rounded bg-white/5 ml-auto" />
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-right hidden sm:table-cell">
                          <div className="w-8 h-4 rounded bg-white/5 ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </>
                )}

                {/* Empty State */}
                {!loading && filteredAndSortedData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 px-4 text-center">
                      <div className="w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-4 text-slate-500">
                        <Trophy size={28} className="text-slate-600" />
                      </div>
                      <h4 className="text-base font-bold text-white mb-1">
                        {searchQuery ? 'No racers match your search' : 'No telemetry recorded for this season yet'}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono max-w-sm mx-auto mb-6">
                        {searchQuery 
                          ? 'Try clearing the search query to view all racers in this division.'
                          : 'Be the pioneer to hit the track and claim the #1 Grand Champion spot today.'}
                      </p>
                      <Link
                        to="/ai-practice"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all"
                      >
                        <Zap size={14} />
                        <span>Race in Arena</span>
                      </Link>
                    </td>
                  </tr>
                )}

                {/* Racer Rows */}
                {!loading && filteredAndSortedData.map((player, index) => {
                  const rank = index + 1;
                  const isTopOne = rank === 1;
                  const isTopTwo = rank === 2;
                  const isTopThree = rank === 3;
                  const isCurrentUser = user?.username && player.username === user.username;

                  const avgWpm = player.avgWpm || player.bestWpm || 0;
                  const peakWpm = player.bestWpm || avgWpm;
                  const accuracy = player.avgAccuracy || 100;

                  return (
                    <tr
                      key={player.userId || player.username || index}
                      className={`transition-colors duration-150 group ${
                        isCurrentUser
                          ? 'bg-indigo-500/10 hover:bg-indigo-500/15'
                          : isTopOne 
                            ? 'bg-amber-500/[0.04] hover:bg-amber-500/[0.08]' 
                            : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      {/* Rank Badge */}
                      <td className="py-4 px-4 sm:px-6 text-center">
                        {isTopOne ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/40 text-amber-300 font-black text-sm shadow-sm">
                            👑
                          </span>
                        ) : isTopTwo ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-300/15 border border-slate-300/40 text-slate-200 font-black text-sm shadow-sm">
                            🥈
                          </span>
                        ) : isTopThree ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-700/20 border border-amber-700/40 text-amber-500 font-black text-sm shadow-sm">
                            🥉
                          </span>
                        ) : (
                          <span className="inline-block text-xs font-bold text-slate-500 group-hover:text-slate-300">
                            #{rank}
                          </span>
                        )}
                      </td>

                      {/* Contender Name & Avatar */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-display font-black text-xs sm:text-sm shrink-0 border ${
                            isTopOne
                              ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                              : isTopTwo
                                ? 'bg-slate-300/15 border-slate-300/30 text-slate-200'
                                : isTopThree
                                  ? 'bg-amber-700/20 border-amber-700/40 text-amber-400'
                                  : 'bg-white/[0.05] border-white/10 text-slate-300'
                          }`}>
                            {player.username?.[0]?.toUpperCase() || 'R'}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold truncate text-sm ${
                                isCurrentUser ? 'text-indigo-400' : 'text-white'
                              }`}>
                                {player.username}
                              </span>
                              {isCurrentUser && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span>Win Rate: {player.winRate || 0}%</span>
                              <span className="hidden sm:inline">·</span>
                              <span className="hidden sm:inline">{player.wins || 0} Wins</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Average WPM */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className="text-base sm:text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                            {avgWpm}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-normal">WPM</span>
                        </div>
                      </td>

                      {/* Peak Burst WPM */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <span className="font-semibold text-xs sm:text-sm text-amber-300/90">
                          {peakWpm}
                        </span>
                      </td>

                      {/* Accuracy */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${
                          accuracy >= 97
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : accuracy >= 93
                              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                              : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        }`}>
                          {accuracy}%
                        </span>
                      </td>

                      {/* Games count */}
                      <td className="py-4 px-4 sm:px-6 text-right text-slate-400 text-xs hidden sm:table-cell">
                        {player.games}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
              Ready to climb the leaderboard ladder?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Challenge our dynamic Ghost AI or jump into 0ms latency global matchmaking rooms.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/ai-practice"
              className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-white font-semibold text-xs transition-all flex items-center gap-2"
            >
              <span>Duel Ghost</span>
              <ChevronRight size={14} />
            </Link>
            <Link
              to="/multiplayer"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
            >
              <span>Multiplayer Race</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
