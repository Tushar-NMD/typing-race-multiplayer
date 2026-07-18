import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useSettings } from '../context/SettingsContext';
import { Bot, User } from 'lucide-react';
import api from '../services/api';

export default function AIGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playTypingSound } = useSettings();
  const settings = location.state || { topic: 'random', difficulty: 'medium', botSpeed: 'adaptive' };

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [input, setInput] = useState('');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [mistakes, setMistakes] = useState(0);

  const [coachFeedback, setCoachFeedback] = useState(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const missedKeysMap = useRef({});

  const [botProgress, setBotProgress] = useState(0);
  const [botWpm, setBotWpm] = useState(0);
  
  const inputRef = useRef(null);

  // Refs for timer interval to access latest state without resetting interval
  const latestInputLength = useRef(input.length);
  const latestTimeElapsed = useRef(timeElapsed);

  useEffect(() => {
    latestInputLength.current = input.length;
    latestTimeElapsed.current = timeElapsed;
  }, [input.length, timeElapsed]);

  // Fetch AI generated text
  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const res = await api.get('/ai/prompt', {
          params: { topic: settings.topic, difficulty: settings.difficulty }
        });
        if (res.data.success) {
          setText(res.data.text);
        } else {
          setText("Failed to load AI text. The quick brown fox jumps over the lazy dog.");
        }
      } catch (err) {
        console.error(err);
        setText("Error connecting to AI server. Please check your API key.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrompt();
  }, [settings.topic, settings.difficulty]);

  // Timer and Bot Logic
  useEffect(() => {
    let timer;
    if (started && !finished) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        
        // Bot Logic
        setBotProgress(prev => {
          if (prev >= text.length) return text.length;
          
          let charsPerSecond = 0;
          if (settings.botSpeed === 'fixed-60') {
            charsPerSecond = (60 * 5) / 60; // 60 WPM * 5 chars per word / 60 seconds
          } else {
            // Adaptive: tries to stay slightly ahead or behind the player's current speed
            // If player is at 0, bot types slowly to encourage them
            const playerCharsPerSec = latestInputLength.current / (latestTimeElapsed.current || 1);
            charsPerSecond = Math.max(1, playerCharsPerSec * (Math.random() * 0.4 + 0.85)); 
          }
          
          const newProgress = Math.min(text.length, prev + charsPerSecond);
          
          // Update bot WPM display
          const botWords = newProgress / 5;
          const currentBotWpm = latestTimeElapsed.current > 0 ? Math.round((botWords / latestTimeElapsed.current) * 60) : 0;
          setBotWpm(currentBotWpm);
          
          return newProgress;
        });

      }, 1000);
    }
    return () => clearInterval(timer);
  }, [started, finished, text.length, settings.botSpeed]);

  // Player Stats calculation
  useEffect(() => {
    if (input.length > 0) {
      const words = input.trim().split(' ').length;
      const minutes = timeElapsed / 60;
      const calculatedWpm = minutes > 0 ? Math.round(words / minutes) : 0;
      setWpm(calculatedWpm);

      let correct = 0;
      const newMissedKeys = {};
      for (let i = 0; i < input.length; i++) {
        if (input[i] === text[i]) {
          correct++;
        } else {
          const char = text[i]?.toLowerCase();
          if (char) {
            newMissedKeys[char] = (newMissedKeys[char] || 0) + 1;
          }
        }
      }
      missedKeysMap.current = newMissedKeys;
      
      const calculatedAccuracy = Math.round((correct / input.length) * 100);
      setAccuracy(calculatedAccuracy);
      setMistakes(input.length - correct);
      
      if (input.length === text.length) {
         setFinished(true);
      }
    }
  }, [input, timeElapsed, text]);

  // Fetch Coach Feedback on finish
  useEffect(() => {
    if (finished) {
      setCoachLoading(true);
      api.post('/ai/coach', {
        wpm,
        accuracy,
        missedKeys: missedKeysMap.current,
        difficulty: settings.difficulty
      }).then(res => {
        if (res.data.success) {
          setCoachFeedback(res.data);
        }
      }).catch(err => {
        console.error('Failed to get coach feedback', err);
      }).finally(() => {
        setCoachLoading(false);
      });
    }
  }, [finished, wpm, accuracy, settings.difficulty]);
  
  // Also check if bot finished
  useEffect(() => {
    if (botProgress >= text.length && text.length > 0) {
       // If we want the game to end when the bot finishes first:
       // setFinished(true); 
       // But usually we let the player finish.
    }
  }, [botProgress, text.length]);

  const handleInputChange = (e) => {
    if (!started) setStarted(true);
    const val = e.target.value;
    
    // Prevent typing past the length
    if (val.length <= text.length) {
      if (val.length > input.length) playTypingSound();
      setInput(val);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 text-indigo-500 animate-pulse mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Generating AI Prompt...</h2>
          <p className="text-slate-400">Consulting Gemini for a {settings.topic} paragraph</p>
        </div>
      </div>
    );
  }

  if (finished) {
    const playerWon = input.length === text.length && botProgress < text.length;
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar isLoggedIn={true} />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-slate-800 rounded-xl p-8 text-center shadow-2xl border border-indigo-500/20">
            <h1 className="text-4xl font-bold mb-2">Race Finished!</h1>
            <h2 className={`text-2xl font-bold mb-8 ${playerWon ? 'text-green-500' : 'text-red-500'}`}>
              {playerWon ? 'You Beat the Ghost Bot!' : 'The Ghost Bot Won!'}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-700 rounded-lg p-6 border-b-4 border-indigo-500">
                <p className="text-slate-400 text-sm mb-2">Your WPM</p>
                <p className="text-3xl font-bold text-white">{wpm}</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6 border-b-4 border-purple-500">
                <p className="text-slate-400 text-sm mb-2">Bot WPM</p>
                <p className="text-3xl font-bold text-white">{botWpm}</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6">
                <p className="text-slate-400 text-sm mb-2">Accuracy</p>
                <p className="text-3xl font-bold text-green-500">{accuracy}%</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-6">
                <p className="text-slate-400 text-sm mb-2">Time</p>
                <p className="text-3xl font-bold text-white">{timeElapsed}s</p>
              </div>
            </div>

            <div className="flex space-x-4 mb-8">
              <button
                onClick={() => navigate('/ai-practice')}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Race Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition"
              >
                Dashboard
              </button>
            </div>

            {/* AI Coach Section */}
            <div className="bg-slate-800 rounded-xl p-8 text-left shadow-xl mb-8">
              <div className="flex items-center mb-6">
                <Bot className="w-8 h-8 text-indigo-500 mr-3" />
                <h3 className="text-2xl font-bold text-white">AI Typing Coach Analysis</h3>
              </div>
              
              {coachLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                </div>
              ) : coachFeedback ? (
                <>
                  <p className="text-slate-300 text-lg mb-8 italic border-l-4 border-indigo-500 pl-4 py-2">
                    "{coachFeedback.feedback}"
                  </p>
                  <div className="bg-slate-700/50 p-6 rounded-xl">
                    <h4 className="text-lg font-bold text-indigo-400 mb-2">Practice Your Weaknesses</h4>
                    <p className="text-slate-400 mb-6">I've generated a new paragraph specifically targeting the keys you missed most. Want to practice it?</p>
                    <button
                      onClick={() => {
                        setText(coachFeedback.practiceText);
                        setInput('');
                        setStarted(false);
                        setFinished(false);
                        setTimeElapsed(0);
                        setBotProgress(0);
                        setCoachFeedback(null);
                        missedKeysMap.current = {};
                      }}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-indigo-500 transition shadow-lg"
                    >
                      Start Targeted Practice Race
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-slate-400">Could not load coach feedback.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const playerProgressPct = text.length > 0 ? (input.length / text.length) * 100 : 0;
  const botProgressPct = text.length > 0 ? (botProgress / text.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar isLoggedIn={true} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Progress Bars */}
          <div className="bg-slate-800 rounded-xl p-6 mb-8 shadow-lg">
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1 font-semibold text-indigo-300">
                <div className="flex items-center"><User className="w-4 h-4 mr-1" /> You</div>
                <div>{wpm} WPM</div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div className="bg-indigo-500 h-3 rounded-full transition-all duration-200" style={{ width: `${playerProgressPct}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1 font-semibold text-purple-400">
                <div className="flex items-center"><Bot className="w-4 h-4 mr-1" /> Ghost Bot ({settings.botSpeed})</div>
                <div>{botWpm} WPM</div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div className="bg-purple-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${botProgressPct}%` }}></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm mb-1">Time Elapsed</p>
              <p className="text-2xl font-bold">{timeElapsed}s</p>
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

          <div className="bg-slate-800 rounded-xl p-8 mb-6 shadow-xl relative">
            {/* Bot cursor indicator on text (optional subtle highlight) */}
            <p className="text-2xl leading-relaxed mb-6 font-mono relative z-10">
              {text.split('').map((char, index) => {
                let color = 'text-slate-500';
                if (index < input.length) {
                  color = input[index] === char ? 'text-green-500' : 'text-red-500';
                }
                const isPlayerCursor = index === input.length;
                const isBotCursor = index === Math.floor(botProgress);
                
                return (
                  <span key={index} className="relative">
                    {isBotCursor && (
                       <span className="absolute -left-1 -bottom-1 w-2 h-1 bg-purple-500 animate-pulse rounded-full" />
                    )}
                    {isPlayerCursor && (
                      <span className="cursor-blink absolute -left-0.5 top-0 bottom-0 bg-indigo-500 w-0.5" aria-hidden="true" />
                    )}
                    <span className={color}>{char}</span>
                  </span>
                );
              })}
            </p>
          </div>

          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            disabled={finished}
            placeholder="Start typing to begin the race against the AI..."
            className="w-full px-6 py-4 bg-slate-800 border-2 border-slate-600 rounded-xl focus:outline-none focus:border-indigo-500 text-xl font-mono resize-none shadow-lg"
            rows="4"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
