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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center relative selection:bg-indigo-500/30">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-4xl h-[400px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full -z-10" />
        <div className="text-center p-8 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-2xl">
          <Bot className="w-14 h-14 text-indigo-400 animate-bounce mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white mb-2">Synthesizing Prompt Lore...</h2>
          <p className="text-xs sm:text-sm text-slate-400 font-mono">Generating a high-velocity {settings.topic} track via AI engine</p>
        </div>
      </div>
    );
  }

  if (finished) {
    const playerWon = input.length === text.length && botProgress < text.length;
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-indigo-500/30 selection:text-white pb-24">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-4xl h-[400px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full -z-10" />
        <Navbar />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36">
          <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-center">
            <h1 className="text-3xl sm:text-4xl font-black font-display text-white mb-2">Ghost Race Concluded</h1>
            <h2 className={`text-xl sm:text-2xl font-bold mb-8 font-mono ${playerWon ? 'text-emerald-400' : 'text-rose-400'}`}>
              {playerWon ? '🏆 You Outpaced the Ghost Bot!' : '🤖 Ghost Bot Claimed Victory!'}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 font-mono mb-8">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <p className="text-xs text-slate-400 uppercase mb-1">Your Speed</p>
                <p className="text-2xl sm:text-3xl font-black text-indigo-300">{wpm}</p>
                <span className="text-[10px] text-slate-500 font-normal">WPM</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <p className="text-xs text-slate-400 uppercase mb-1">Bot Speed</p>
                <p className="text-2xl sm:text-3xl font-black text-purple-300">{botWpm}</p>
                <span className="text-[10px] text-slate-500 font-normal">WPM</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <p className="text-xs text-slate-400 uppercase mb-1">Accuracy</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">{accuracy}%</p>
                <span className="text-[10px] text-slate-500 font-normal">Precision</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <p className="text-xs text-slate-400 uppercase mb-1">Elapsed</p>
                <p className="text-2xl sm:text-3xl font-black text-white">{timeElapsed}s</p>
                <span className="text-[10px] text-slate-500 font-normal">Time</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8 font-mono">
              <button
                type="button"
                onClick={() => navigate('/ai-practice')}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
              >
                Race Again
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>

            {/* AI Coach Feedback Section */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 text-left shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Bot className="w-6 h-6 text-indigo-400" />
                <h3 className="text-lg font-bold font-display text-white">AI Coach Diagnostic</h3>
              </div>
              
              {coachLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-4 bg-white/5 rounded w-1/2" />
                </div>
              ) : coachFeedback ? (
                <>
                  <p className="text-slate-300 text-sm mb-6 italic border-l-2 border-indigo-400 pl-3.5 py-1">
                    "{coachFeedback.feedback}"
                  </p>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <h4 className="text-sm font-bold text-indigo-300 mb-1">Targeted Weakness Drill</h4>
                    <p className="text-xs text-slate-400 font-mono mb-4">A custom training track generated targeting the keys you hesitated on or missed.</p>
                    <button
                      type="button"
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
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                    >
                      Start Targeted Drill Race
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 font-mono">Telemetry feedback synced with profile.</p>
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
    <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-indigo-500/30 selection:text-white pb-24">
      {/* Specular Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[85vw] max-w-4xl h-[420px] bg-indigo-600/15 blur-[150px] pointer-events-none rounded-full -z-10" />
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36">
        {/* Duel Progress Trackers */}
        <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-6 font-mono space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-bold text-indigo-300">
              <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-indigo-400" /> You (Player)</div>
              <div>{wpm} WPM</div>
            </div>
            <div className="w-full bg-white/[0.05] border border-white/10 rounded-full h-3 overflow-hidden p-[1px]">
              <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-200" style={{ width: `${playerProgressPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-bold text-purple-300">
              <div className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5 text-purple-400" /> Ghost Bot ({settings.botSpeed})</div>
              <div>{botWpm} WPM</div>
            </div>
            <div className="w-full bg-white/[0.05] border border-white/10 rounded-full h-3 overflow-hidden p-[1px]">
              <div className="bg-gradient-to-r from-purple-500 to-rose-400 h-full rounded-full transition-all duration-500" style={{ width: `${botProgressPct}%` }} />
            </div>
          </div>
        </div>

        {/* Real-time Telemetry Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 font-mono">
          <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl text-center">
            <span className="text-[11px] text-slate-400 uppercase">Time Elapsed</span>
            <span className="block text-2xl font-black text-white mt-1">{timeElapsed}s</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl text-center">
            <span className="text-[11px] text-slate-400 uppercase">Your Velocity</span>
            <span className="block text-2xl font-black text-indigo-300 mt-1">{wpm} <span className="text-xs font-normal text-slate-500">WPM</span></span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl text-center">
            <span className="text-[11px] text-slate-400 uppercase">Accuracy</span>
            <span className="block text-2xl font-black text-emerald-400 mt-1">{accuracy}%</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl text-center">
            <span className="text-[11px] text-slate-400 uppercase">Mistakes</span>
            <span className="block text-2xl font-black text-rose-400 mt-1">{mistakes}</span>
          </div>
        </div>

        {/* Text Prompt Target Card */}
        <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] mb-6">
          <p className="text-xl sm:text-2xl leading-relaxed font-mono relative select-none">
            {text.split('').map((char, index) => {
              let color = 'text-slate-500';
              if (index < input.length) {
                color = input[index] === char ? 'text-emerald-400 font-semibold' : 'text-rose-400 bg-rose-500/20 rounded';
              }
              const isPlayerCursor = index === input.length;
              const isBotCursor = index === Math.floor(botProgress);
              
              return (
                <span key={index} className="relative">
                  {isBotCursor && (
                    <span className="absolute -left-1 -bottom-1 w-2 h-1 bg-purple-400 animate-pulse rounded-full" />
                  )}
                  {isPlayerCursor && (
                    <span className="cursor-blink absolute -left-0.5 top-0 bottom-0 bg-indigo-400 w-0.5" aria-hidden="true" />
                  )}
                  <span className={color}>{char}</span>
                </span>
              );
            })}
          </p>
        </div>

        {/* Keystroke Receiver Input */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          disabled={finished}
          placeholder="Start typing to begin the race against Ghost AI..."
          className="w-full px-6 py-4 rounded-2xl bg-white/[0.04] border border-white/15 focus:outline-none focus:border-indigo-400/60 focus:bg-white/[0.07] text-white font-mono text-lg sm:text-xl resize-none backdrop-blur-md transition-all shadow-xl"
          rows={3}
          autoFocus
        />
      </div>
    </div>
  );
}
