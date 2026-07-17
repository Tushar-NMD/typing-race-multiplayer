import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Calendar, Clock } from 'lucide-react';
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
        if (response.success) {
          setHistory(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [page]);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar isLoggedIn={true} />

      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-12">Game History</h1>

        <div className="max-w-6xl mx-auto bg-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Mode</th>
                <th className="px-6 py-4 text-left">WPM</th>
                <th className="px-6 py-4 text-left">Accuracy</th>
                <th className="px-6 py-4 text-left">Duration</th>
                <th className="px-6 py-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading && history.length > 0 ? (
                history.map((result, index) => (
                  <tr key={index} className="border-t border-slate-700 hover:bg-slate-750 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-slate-400" />
                        <span>{new Date(result.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-indigo-600 rounded-full text-sm">
                        Multiplayer
                      </span>
                    </td>
                    <td className="px-6 py-4 text-indigo-500 font-bold">{result.wpm}</td>
                    <td className="px-6 py-4 text-green-500">{result.accuracy}%</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        result.position === 1 
                          ? 'bg-yellow-500/20 text-yellow-500' 
                          : 'bg-slate-600/50 text-slate-300'
                      }`}>
                        #{result.position} {result.position === 1 && '🏆'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition">
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : !loading ? (
                <tr className="border-t border-slate-700">
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    No games yet. Play a multiplayer game to see your history!
                  </td>
                </tr>
              ) : (
                <tr className="border-t border-slate-700">
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
