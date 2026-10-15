import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Calendar, Clock, ArrowLeft, Trophy, Activity, ChevronLeft, ChevronRight, Zap, Target } from 'lucide-react';
import { matchService } from '../services/matchService';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await matchService.getUserHistory(10, page * 10);
        if (response.success && Array.isArray(response.data)) {
          setHistory(response.data);
        } else {
          setHistory([]);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [page]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-indigo-500/30 selection:text-white pb-24">
      {/* Specular Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-4xl h-[400px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full -z-10" />
      <div className="fixed bottom-0 left-10 w-[35vw] h-[350px] bg-purple-600/10 blur-[150px] pointer-events-none rounded-full -z-10" />

      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36">
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
            <Clock size={13} className="text-indigo-400" />
            <span>Telemetry Archives</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-3">
            Race <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">History</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-400 font-mono max-w-xl mx-auto leading-relaxed">
            Chronological audit of every match run. Keystroke telemetry, final standings, and accuracy analytics.
          </p>
        </div>

        {/* Telemetry Table Card */}
        <div className="rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-4 sm:px-6">Timestamp</th>
                  <th className="py-4 px-4 sm:px-6">Mode</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Speed</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Accuracy</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-4 px-4 sm:px-6"><div className="w-24 h-4 bg-white/5 rounded" /></td>
                        <td className="py-4 px-4 sm:px-6"><div className="w-20 h-4 bg-white/5 rounded" /></td>
                        <td className="py-4 px-4 sm:px-6 text-right"><div className="w-16 h-4 bg-white/5 rounded ml-auto" /></td>
                        <td className="py-4 px-4 sm:px-6 text-right"><div className="w-12 h-4 bg-white/5 rounded ml-auto" /></td>
                        <td className="py-4 px-4 sm:px-6 text-right"><div className="w-16 h-4 bg-white/5 rounded ml-auto" /></td>
                      </tr>
                    ))}
                  </>
                ) : history.length > 0 ? (
                  history.map((result, index) => {
                    const isWinner = result.position === 1;
                    return (
                      <tr key={index} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Calendar size={14} className="text-slate-500" />
                            <span>
                              {new Date(result.createdAt).toLocaleDateString([], { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric',
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 sm:px-6">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                            <Zap size={11} className="text-indigo-400" />
                            Multiplayer
                          </span>
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-right">
                          <span className="font-black text-white text-base">
                            {result.wpm}
                          </span>
                          <span className="text-[10px] text-slate-500 ml-1">WPM</span>
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${
                            result.accuracy >= 97
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                          }`}>
                            {result.accuracy}%
                          </span>
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isWinner
                              ? 'bg-amber-400/15 border border-amber-400/30 text-amber-300 shadow-sm'
                              : 'bg-white/[0.04] border border-white/10 text-slate-400'
                          }`}>
                            {isWinner ? '🏆 Champion' : `Rank #${result.position || '-'}`}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 px-4 text-center">
                      <Clock size={32} className="mx-auto mb-3 text-slate-600" />
                      <h4 className="text-base font-bold text-white mb-1">No Matches in Log</h4>
                      <p className="text-xs text-slate-400 font-mono max-w-sm mx-auto mb-6">
                        Complete your first race to record telemetry in this log.
                      </p>
                      <Link
                        to="/multiplayer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-xs shadow-md shadow-indigo-500/25"
                      >
                        Enter Multiplayer Arena
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-white/[0.01] flex items-center justify-between font-mono text-xs">
            <span className="text-slate-400">
              Page <strong className="text-white">{page + 1}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0 || loading}
                className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={loading || history.length < 10}
                className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
