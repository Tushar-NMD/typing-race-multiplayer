import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Trophy, ArrowLeft } from 'lucide-react';
import { matchService } from '../services/matchService';

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('global');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        console.log('🏆 Fetching leaderboard, activeTab:', activeTab);
        let response;

        if (activeTab === 'friends') {
          response = await matchService.getFriendLeaderboard();
          console.log('👥 Friend leaderboard response:', response);
        } else {
          const period = activeTab === 'global' ? 'all' : activeTab === 'weekly' ? 'week' : 'month';
          response = await matchService.getLeaderboard(period);
          console.log('🏆 Global leaderboard response:', response);
        }

        if (response.success) {
          console.log('✅ Leaderboard data:', response.data);
          setLeaderboardData(response.data);
        } else {
          console.warn('⚠️ Leaderboard API returned success: false');
          setLeaderboardData([]);
        }
      } catch (error) {
        console.error('❌ Failed to fetch leaderboard:', error);
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar isLoggedIn={true} />

      <div className="container mx-auto px-4 py-16">
        <Link to="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white transition mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-center mb-12">
          <Trophy className="text-yellow-500 mr-4" size={48} />
          <h1 className="text-4xl font-bold">Leaderboard</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4 mb-8">
            {['global', 'weekly', 'monthly', 'friends'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-lg font-semibold capitalize transition ${
                  activeTab === tab ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-slate-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left">Rank</th>
                  <th className="px-6 py-4 text-left">Player</th>
                  <th className="px-6 py-4 text-left">WPM</th>
                  <th className="px-6 py-4 text-left">Accuracy</th>
                  <th className="px-6 py-4 text-left">Games</th>
                </tr>
              </thead>
              <tbody>
                {!loading && leaderboardData.length > 0 ? (
                  leaderboardData.map((player, index) => {
                    const rank = index + 1;
                    return (
                      <tr
                        key={rank}
                        className={`border-t border-slate-700 hover:bg-slate-750 transition ${
                          rank <= 3 ? 'bg-slate-750' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-slate-400">#{rank}</span>
                            {rank === 1 && <span className="text-xl">🥇</span>}
                            {rank === 2 && <span className="text-xl">🥈</span>}
                            {rank === 3 && <span className="text-xl">🥉</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold">{player.username}</td>
                        <td className="px-6 py-4 text-indigo-500 font-bold">{player.avgWpm || player.bestWpm}</td>
                        <td className="px-6 py-4 text-green-500">{player.avgAccuracy}%</td>
                        <td className="px-6 py-4 text-slate-400">{player.games}</td>
                      </tr>
                    );
                  })
                ) : !loading ? (
                  <tr className="border-t border-slate-700">
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                      No data available for this leaderboard yet.
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
        </div>
      </div>
    </div>
  );
}
