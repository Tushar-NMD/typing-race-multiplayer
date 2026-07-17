import { Link } from 'react-router-dom';
import { Zap, TrendingUp, Trophy, Globe, Target } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Landing() {
  const topPlayers = [
    { rank: 1, name: 'John', wpm: 120 },
    { rank: 2, name: 'Doe', wpm: 115 },
    { rank: 3, name: 'Mychel', wpm: 102 }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <section className="py-12 sm:py-20 text-center px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            TYPEVERSE
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Practice your typing. Race with friends. Improve your speed.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
            <Link
              to="/practice"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors text-center"
            >
              Start Typing
            </Link>
            <Link
              to="/multiplayer"
              className="w-full sm:w-auto px-8 py-4 bg-slate-700 text-white rounded-lg text-lg font-semibold hover:bg-slate-600 transition-colors text-center"
            >
              Create Room
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
            <div className="text-center">
              <Zap className="mx-auto mb-4 text-indigo-500" size={40} />
              <h3 className="text-base sm:text-xl font-semibold mb-2">Multiplayer</h3>
            </div>
            <div className="text-center">
              <TrendingUp className="mx-auto mb-4 text-indigo-500" size={40} />
              <h3 className="text-base sm:text-xl font-semibold mb-2">Statistics</h3>
            </div>
            <div className="text-center">
              <Trophy className="mx-auto mb-4 text-indigo-500" size={40} />
              <h3 className="text-base sm:text-xl font-semibold mb-2">Leaderboard</h3>
            </div>
            <div className="text-center">
              <Globe className="mx-auto mb-4 text-indigo-500" size={40} />
              <h3 className="text-base sm:text-xl font-semibold mb-2">Global Ranking</h3>
            </div>
            <div className="text-center col-span-2 sm:col-span-1">
              <Target className="mx-auto mb-4 text-indigo-500" size={40} />
              <h3 className="text-base sm:text-xl font-semibold mb-2">Daily Challenge</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Top Players</h2>
          <div className="max-w-md mx-auto bg-slate-800 rounded-lg p-6">
            {topPlayers.map((player) => (
              <div key={player.rank} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                <div className="flex items-center gap-4">
                  <span className="text-xl sm:text-2xl font-bold text-indigo-500 w-8">{player.rank}</span>
                  <span className="text-base sm:text-lg">{player.name}</span>
                </div>
                <span className="text-slate-400 text-sm sm:text-base">{player.wpm} WPM</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-800 border-t border-slate-700 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2026 Typeverse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
