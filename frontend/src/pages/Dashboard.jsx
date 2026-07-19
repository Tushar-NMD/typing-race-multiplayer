import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Zap, Users, Trophy, History, UserCircle, Settings, Bot } from 'lucide-react';
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
        console.error('❌ Failed to fetch dashboard data:', error);
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    if (user) {
      fetchData(true);
      intervalId = setInterval(() => fetchData(false), 3000); // Poll every 3 seconds for real-time updates
    } else {
      console.log('⚠️ User not available yet');
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="flex flex-col lg:flex-row">
        <aside className="w-full lg:w-64 bg-slate-800 lg:min-h-screen border-b lg:border-r border-slate-700 overflow-x-auto">
          <nav className="p-4 flex lg:block flex-row space-x-2 lg:space-x-0 lg:space-y-2">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center space-x-3 px-4 py-3 bg-slate-700 rounded-lg">
              <Zap size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/practice" className="flex-shrink-0 flex items-center space-x-3 px-4 py-3 hover:bg-slate-700 rounded-lg transition">
              <Zap size={20} />
              <span>Practice</span>
            </Link>
            <Link to="/ai-practice" className="flex-shrink-0 flex items-center space-x-3 px-4 py-3 hover:bg-slate-700 rounded-lg transition">
              <Bot size={20} />
              <span>Ghost AI Race</span>
            </Link>
            <Link to="/multiplayer" className="flex-shrink-0 flex items-center space-x-3 px-4 py-3 hover:bg-slate-700 rounded-lg transition">
              <Users size={20} />
              <span>Multiplayer</span>
            </Link>
            <Link to="/leaderboard" className="flex-shrink-0 flex items-center space-x-3 px-4 py-3 hover:bg-slate-700 rounded-lg transition">
              <Trophy size={20} />
              <span>Leaderboard</span>
            </Link>
            <Link to="/history" className="flex-shrink-0 flex items-center space-x-3 px-4 py-3 hover:bg-slate-700 rounded-lg transition">
              <History size={20} />
              <span>History</span>
            </Link>
            <Link to="/friends" className="flex-shrink-0 flex items-center space-x-3 px-4 py-3 hover:bg-slate-700 rounded-lg transition">
              <UserCircle size={20} />
              <span>Friends</span>
            </Link>
            <Link to="/settings" className="flex-shrink-0 flex items-center space-x-3 px-4 py-3 hover:bg-slate-700 rounded-lg transition">
              <Settings size={20} />
              <span>Settings</span>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 min-w-0 p-8 overflow-x-hidden">
          <h1 className="text-3xl font-bold mb-2">Hello {user?.name} 👋</h1>
          <p className="text-slate-400 mb-8">Ready to improve your typing speed?</p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Recent Performance</h2>
            <div className="bg-slate-800 rounded-xl px-8 py-6">
              <ResultsPage 
                mockData={
                  history.length > 0 ? {
                    series1Name: 'WPM',
                    series2Name: 'Accuracy (%)',
                    time: history.length === 1 ? ['Start', new Date(history[0].createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})] : [...history].reverse().map(h => new Date(h.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})),
                    wpm: history.length === 1 ? [0, history[0].wpm] : [...history].reverse().map(h => h.wpm),
                    raw: history.length === 1 ? [0, history[0].accuracy] : [...history].reverse().map(h => h.accuracy) // Using accuracy as the secondary line for dashboard
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

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/practice" className="bg-indigo-600 hover:bg-indigo-700 rounded-lg p-6 text-center transition">
                <p className="font-semibold">Start Practice</p>
              </Link>
              <Link to="/ai-practice" className="bg-purple-600 hover:bg-purple-700 rounded-lg p-6 text-center transition">
                <p className="font-semibold">Race AI Bot</p>
              </Link>
              <Link to="/multiplayer" className="bg-slate-800 hover:bg-slate-700 rounded-lg p-6 text-center transition">
                <p className="font-semibold">Create Room</p>
              </Link>
              <Link to="/multiplayer" className="bg-slate-800 hover:bg-slate-700 rounded-lg p-6 text-center transition">
                <p className="font-semibold">Join Room</p>
              </Link>
              <Link to="/leaderboard" className="bg-slate-800 hover:bg-slate-700 rounded-lg p-6 text-center transition">
                <p className="font-semibold">Leaderboard</p>
              </Link>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Recent Games</h2>
            <div className="bg-slate-800 rounded-lg overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Position</th>
                    <th className="px-6 py-3 text-left">WPM</th>
                    <th className="px-6 py-3 text-left">Accuracy</th>
                    <th className="px-6 py-3 text-left">Mistakes</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && history.length > 0 ? (
                    history.map((result, index) => (
                      <tr key={index} className="border-t border-slate-700 hover:bg-slate-700/50 transition">
                        <td className="px-6 py-4 text-sm">
                          {new Date(result.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            result.position === 1 
                              ? 'bg-yellow-500/20 text-yellow-500' 
                              : 'bg-slate-600/50 text-slate-300'
                          }`}>
                            #{result.position}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-indigo-500 font-bold">{result.wpm}</td>
                        <td className="px-6 py-4">{result.accuracy}%</td>
                        <td className="px-6 py-4 text-red-400">{result.mistakes}</td>
                      </tr>
                    ))
                  ) : !loading ? (
                    <tr className="border-t border-slate-700">
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                        No games played yet. Start playing to see your history!
                      </td>
                    </tr>
                  ) : (
                    <tr className="border-t border-slate-700">
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                        Loading...
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
