import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Zap, Users, Trophy, History, UserCircle, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { matchService } from '../services/matchService';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching dashboard data for user:', user);
        
        // Fetch user stats
        const statsResponse = await matchService.getUserStats();
        console.log('📊 Stats response:', statsResponse);
        if (statsResponse.success) {
          console.log('✅ Stats fetched:', statsResponse.data);
          setStats(statsResponse.data);
        } else {
          console.warn('⚠️ Stats API returned success: false');
        }

        // Fetch match history
        const historyResponse = await matchService.getUserHistory(5);
        console.log('📊 History response:', historyResponse);
        if (historyResponse.success) {
          console.log('✅ History fetched:', historyResponse.data);
          setHistory(historyResponse.data);
        } else {
          console.warn('⚠️ History API returned success: false');
        }
      } catch (error) {
        console.error('❌ Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      console.log('⚠️ User not available yet');
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="flex">
        <aside className="hidden lg:block w-64 bg-slate-800 min-h-screen border-r border-slate-700">
          <nav className="p-4 space-y-2">
            <Link to="/dashboard" className="flex items-center space-x-3 px-4 py-3 bg-slate-700 rounded-lg">
              <Zap size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/practice" className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-700 rounded-lg transition">
              <Zap size={20} />
              <span>Practice</span>
            </Link>
            <Link to="/multiplayer" className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-700 rounded-lg transition">
              <Users size={20} />
              <span>Multiplayer</span>
            </Link>
            <Link to="/leaderboard" className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-700 rounded-lg transition">
              <Trophy size={20} />
              <span>Leaderboard</span>
            </Link>
            <Link to="/history" className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-700 rounded-lg transition">
              <History size={20} />
              <span>History</span>
            </Link>
            <Link to="/friends" className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-700 rounded-lg transition">
              <UserCircle size={20} />
              <span>Friends</span>
            </Link>
            <Link to="/settings" className="flex items-center space-x-3 px-4 py-3 hover:bg-slate-700 rounded-lg transition">
              <Settings size={20} />
              <span>Settings</span>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-2">Hello {user?.name} 👋</h1>
          <p className="text-slate-400 mb-8">Ready to improve your typing speed?</p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Your Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-slate-800 rounded-lg p-6">
                <p className="text-slate-400 text-sm mb-2">Average WPM</p>
                <p className="text-3xl font-bold text-indigo-500">
                  {stats?.averageWPM !== undefined ? stats.averageWPM : user?.averageWPM || 0}
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6">
                <p className="text-slate-400 text-sm mb-2">Highest WPM</p>
                <p className="text-3xl font-bold text-green-500">
                  {stats?.highestWPM !== undefined ? stats.highestWPM : user?.highestWPM || 0}
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6">
                <p className="text-slate-400 text-sm mb-2">Accuracy</p>
                <p className="text-3xl font-bold text-blue-500">
                  {stats?.avgAccuracy !== undefined ? stats.avgAccuracy : user?.accuracy || 0}%
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6">
                <p className="text-slate-400 text-sm mb-2">Games Played</p>
                <p className="text-3xl font-bold">
                  {stats?.gamesPlayed !== undefined ? stats.gamesPlayed : user?.gamesPlayed || 0}
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6">
                <p className="text-slate-400 text-sm mb-2">Wins</p>
                <p className="text-3xl font-bold text-yellow-500">
                  {stats?.wins !== undefined ? stats.wins : user?.wins || 0}
                </p>
              </div>
            </div>
            {stats && (
              <div className="mt-4 text-sm text-slate-400">
                <p>Win Rate: <span className="text-green-400 font-bold">{stats.winRate || 0}%</span></p>
              </div>
            )}
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/practice" className="bg-indigo-600 hover:bg-indigo-700 rounded-lg p-6 text-center transition">
                <p className="font-semibold">Start Practice</p>
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
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <table className="w-full">
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
