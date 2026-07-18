import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ResultChart from '../components/ResultChart';
import { useSettings } from '../context/SettingsContext';
import { matchService } from '../services/matchService';

const sampleText = "The quick brown fox jumps over the lazy dog. Practice makes perfect. Keep typing to improve your speed and accuracy. Focus on the words and let your fingers do the work.";

export default function PracticeGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playTypingSound } = useSettings();
  const settings = location.state || { time: 60, difficulty: 'medium' };

  const [timeLeft, setTimeLeft] = useState(settings.time);
  const [input, setInput] = useState('');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [mistakes, setMistakes] = useState(0);
  const [chartData, setChartData] = useState({ time: [], wpm: [], raw: [] });
  const inputRef = useRef(null);

  const statsRef = useRef({ wpm: 0, accuracy: 100, mistakes: 0 });
  useEffect(() => {
    statsRef.current = { wpm, accuracy, mistakes };
  }, [wpm, accuracy, mistakes]);

  useEffect(() => {
    if (started && timeLeft > 0 && !finished) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        setChartData(prev => ({
          time: [...prev.time, `${settings.time - timeLeft + 1}s`],
          wpm: [...prev.wpm, statsRef.current.wpm],
          raw: [...prev.raw, statsRef.current.accuracy]
        }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !finished) {
      setFinished(true);
      // Save practice result to backend
      matchService.savePracticeResult({
        wpm: statsRef.current.wpm,
        accuracy: statsRef.current.accuracy,
        mistakes: statsRef.current.mistakes
      }).catch(err => console.error("Failed to save practice result:", err));
    }
  }, [started, timeLeft, finished, settings.time]);

  useEffect(() => {
    if (input.length > 0) {
      const words = input.trim().split(' ').length;
      const minutes = (settings.time - timeLeft) / 60;
      const calculatedWpm = minutes > 0 ? Math.round(words / minutes) : 0;
      setWpm(calculatedWpm);

      let correct = 0;
      for (let i = 0; i < input.length; i++) {
        if (input[i] === sampleText[i]) correct++;
      }
      const calculatedAccuracy = Math.round((correct / input.length) * 100);
      setAccuracy(calculatedAccuracy);
      setMistakes(input.length - correct);
    }
  }, [input, timeLeft, settings.time]);

  const handleInputChange = (e) => {
    if (!started) setStarted(true);
    // Play sound if input increased (a character was typed)
    if (e.target.value.length > input.length) {
      playTypingSound();
    }
    setInput(e.target.value);
  };

  const handleRestart = () => {
    setTimeLeft(settings.time);
    setInput('');
    setStarted(false);
    setFinished(false);
    setWpm(0);
    setAccuracy(100);
    setMistakes(0);
    setChartData({ time: [], wpm: [], raw: [] });
  };

  if (finished) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar isLoggedIn={true} />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-slate-800 rounded-xl p-8 text-center">
            <h1 className="text-4xl font-bold mb-8">Your Result</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-700 rounded-lg p-6">
                <p className="text-slate-400 text-sm mb-2">WPM</p>
                <p className="text-3xl font-bold text-indigo-500">{wpm}</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6">
                <p className="text-slate-400 text-sm mb-2">Accuracy</p>
                <p className="text-3xl font-bold text-green-500">{accuracy}%</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6">
                <p className="text-slate-400 text-sm mb-2">Mistakes</p>
                <p className="text-3xl font-bold text-red-500">{mistakes}</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6">
                <p className="text-slate-400 text-sm mb-2">Time</p>
                <p className="text-3xl font-bold">{settings.time}s</p>
              </div>
            </div>
            
            <div className="mb-8 bg-slate-700/30 rounded-xl p-4">
              <ResultChart data={{
                series1Name: 'WPM',
                series2Name: 'Accuracy (%)',
                time: chartData.time,
                wpm: chartData.wpm,
                raw: chartData.raw
              }} />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleRestart}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Restart
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar isLoggedIn={true} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm mb-1">Time Left</p>
              <p className="text-2xl font-bold">{timeLeft}s</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm mb-1">Current WPM</p>
              <p className="text-2xl font-bold text-indigo-500">{wpm}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm mb-1">Accuracy</p>
              <p className="text-2xl font-bold text-green-500">{accuracy}%</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm mb-1">Mistakes</p>
              <p className="text-2xl font-bold text-red-500">{mistakes}</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-8 mb-6">
            <p className="text-2xl leading-relaxed mb-6 font-mono relative">
              {sampleText.split('').map((char, index) => {
                let color = 'text-slate-500';
                if (index < input.length) {
                  color = input[index] === char ? 'text-green-500' : 'text-red-500';
                }
                const isCursor = index === input.length;
                return (
                  <span key={index} className="relative">
                    {isCursor && (
                      <span
                        className="cursor-blink absolute -left-0.5 top-0 bottom-0"
                        aria-hidden="true"
                      />
                    )}
                    <span className={color}>{char}</span>
                  </span>
                );
              })}
              {/* Cursor at very end */}
              {input.length === sampleText.length && (
                <span className="cursor-blink ml-0.5" style={{height: '1.25em'}} aria-hidden="true" />
              )}
            </p>
          </div>

          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            disabled={finished}
            placeholder="Start typing here..."
            className="w-full px-6 py-4 bg-slate-800 border-2 border-slate-600 rounded-xl focus:outline-none focus:border-indigo-500 text-xl font-mono resize-none"
            rows="4"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
