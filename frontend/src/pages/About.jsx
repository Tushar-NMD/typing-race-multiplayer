import Navbar from '../components/Navbar';
import { Target, Zap, Trophy } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          About Typeverse
        </h1>
        
        <div className="bg-slate-800 rounded-xl p-8 mb-8">
          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            Typeverse is a modern typing practice platform designed to help you improve your typing speed and accuracy through engaging practice sessions and competitive multiplayer races.
          </p>
          <p className="text-lg text-slate-300 leading-relaxed">
            Whether you're a beginner looking to build your skills or an experienced typist aiming to break records, Typeverse provides the tools and community to help you reach your goals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 text-center">
            <Target className="mx-auto mb-4 text-indigo-500" size={48} />
            <h3 className="text-xl font-bold mb-2">Practice</h3>
            <p className="text-slate-400">
              Customizable practice sessions with different difficulty levels and time modes
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 text-center">
            <Zap className="mx-auto mb-4 text-indigo-500" size={48} />
            <h3 className="text-xl font-bold mb-2">Compete</h3>
            <p className="text-slate-400">
              Race against friends in real-time multiplayer typing competitions
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 text-center">
            <Trophy className="mx-auto mb-4 text-indigo-500" size={48} />
            <h3 className="text-xl font-bold mb-2">Improve</h3>
            <p className="text-slate-400">
              Track your progress with detailed statistics and climb the global leaderboard
            </p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Features</h2>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start">
              <span className="text-indigo-500 mr-2">•</span>
              <span>Real-time multiplayer typing races with friends</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 mr-2">•</span>
              <span>Detailed statistics tracking including WPM, accuracy, and improvement over time</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 mr-2">•</span>
              <span>Global, weekly, and monthly leaderboards</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 mr-2">•</span>
              <span>Customizable practice modes with multiple difficulty levels</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 mr-2">•</span>
              <span>Friends system to challenge and compete with others</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 mr-2">•</span>
              <span>Achievement system to track milestones and progress</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-500 mr-2">•</span>
              <span>Multiple language support for international users</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
