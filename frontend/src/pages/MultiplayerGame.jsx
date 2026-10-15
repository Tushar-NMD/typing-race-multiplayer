import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import ResultChart from '../components/ResultChart';
import { getRandomParagraph, calculateWPM, calculateAccuracy } from '../utils/typingParagraphs';
import { roomService } from '../services/roomService';
import {
  Trophy,
  Zap,
  Target,
  Clock,
  ArrowRight,
  RotateCcw,
  LayoutDashboard,
  Users,
  AlertCircle,
  CheckCircle2,
  Crown,
  Medal,
  Flag,
  Sparkles,
  WifiOff
} from 'lucide-react';

export default function MultiplayerGame() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get('code');
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const { playTypingSound } = useSettings();
  
  const [paragraph, setParagraph] = useState('');
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameDuration, setGameDuration] = useState(60);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [finished, setFinished] = useState(false);
  const [myStats, setMyStats] = useState({ wpm: 0, accuracy: 100, progress: 0 });
  const [players, setPlayers] = useState([]);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [errors, setErrors] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [chartData, setChartData] = useState({ time: [], wpm: [], raw: [] });
  
  const myStatsRef = useRef(myStats);
  useEffect(() => {
    myStatsRef.current = myStats;
  }, [myStats]);
  
  const inputRef = useRef(null);
  const lastEmitTime = useRef(0);
  const finishedPlayers = useRef(new Set());

  // Initialize game
  useEffect(() => {
    if (!roomCode || !socket) {
      navigate('/multiplayer');
      return;
    }

    const initializeGame = async () => {
      let duration = 60;
      let language = 'english';
      try {
        // Fetch room to get duration
        const roomResponse = await roomService.getRoom(roomCode);
        if (roomResponse.success) {
          duration = roomResponse.room.duration || 60;
          language = roomResponse.room.language || 'english';
          setGameDuration(duration);
          setTimeLeft(duration);
        }
      } catch (error) {
        console.error('Failed to fetch room duration:', error);
      }

      // Generate random paragraph
      const newParagraph = getRandomParagraph(language, duration);
      setParagraph(newParagraph);
      setGameStartTime(Date.now());
    };

    initializeGame();

    // Focus input
    inputRef.current?.focus();

    // Socket event listeners
    socket.on('player-progress', (data) => {
      setPlayers(prev => {
        const existing = prev.find(p => p.userId === data.userId);
        if (existing) {
          return prev.map(p => p.userId === data.userId ? { ...p, ...data } : p);
        }
        return [...prev, data];
      });
    });

    socket.on('player-finished', (data) => {
      console.log('Player finished:', data);
      
      // Track finished players
      finishedPlayers.current.add(data.userId);
      
      setResults(prev => {
        const exists = prev.find(r => r.userId === data.userId);
        if (exists) return prev;
        const newResults = [...prev, data].sort((a, b) => b.wpm - a.wpm);
        return newResults;
      });
    });

    socket.on('game-ended', () => {
      console.log('Game ended signal received');
      setShowResults(true);
    });

    return () => {
      socket.off('player-progress');
      socket.off('player-finished');
      socket.off('game-ended');
    };
  }, [roomCode, socket, navigate]);

  // Timer countdown
  useEffect(() => {
    if (finished || showResults) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        
        // Record stats for graph
        setChartData(c => ({
          time: [...c.time, `${gameDuration - newTime}s`],
          wpm: [...c.wpm, myStatsRef.current.wpm],
          raw: [...c.raw, myStatsRef.current.accuracy]
        }));

        if (newTime <= 0) {
          // Time's up - force finish
          if (!finished) {
            setFinished(true);
            const elapsed = gameDuration; // Use actual game duration
            const finalWpm = myStatsRef.current.wpm;
            const finalAccuracy = myStatsRef.current.accuracy;
            
            socket?.emit('game-complete', {
              roomCode,
              wpm: finalWpm,
              accuracy: finalAccuracy,
              timeTaken: elapsed,
              paragraph
            });
          }
          
          // End game after timer runs out
          setTimeout(() => {
            socket?.emit('end-game', { roomCode });
          }, 2000);
          
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [finished, showResults, gameDuration, paragraph, roomCode, socket]);

  // Handle typing
  const handleTyping = (e) => {
    if (finished || showResults) return;

    const value = e.target.value;
    
    // Prevent typing beyond paragraph length
    if (value.length > paragraph.length) {
      return;
    }
    
    // Play sound if input increased
    if (value.length > input.length) {
      playTypingSound();
    }

    setInput(value);

    // Calculate stats
    const progress = Math.min((value.length / paragraph.length) * 100, 100);
    let correct = 0;
    let currentErrors = 0;
    
    for (let i = 0; i < value.length; i++) {
      if (value[i] === paragraph[i]) {
        correct++;
      } else {
        currentErrors++;
      }
    }
    
    setCorrectChars(correct);
    setErrors(currentErrors);
    
    const elapsed = Math.max((Date.now() - gameStartTime) / 1000, 1);
    const wpm = calculateWPM(correct, elapsed);
    const accuracy = calculateAccuracy(correct, value.length);

    setMyStats({ wpm, accuracy, progress });

    // Emit progress (throttled to every 100ms for smoother updates)
    const now = Date.now();
    if (now - lastEmitTime.current > 100) {
      socket?.emit('typing-progress', {
        roomCode,
        progress,
        wpm,
        accuracy
      });
      lastEmitTime.current = now;
    }

    // Check if finished
    if (value.length === paragraph.length && currentErrors === 0) {
      handleFinish();
    }
  };

  const handleFinish = () => {
    if (finished) return;
    
    setFinished(true);
    const elapsed = (Date.now() - gameStartTime) / 1000;
    
    // Calculate final stats
    const finalWpm = calculateWPM(correctChars, elapsed);
    const finalAccuracy = calculateAccuracy(correctChars, input.length);
    
    socket?.emit('game-complete', {
      roomCode,
      wpm: finalWpm,
      accuracy: finalAccuracy,
      timeTaken: elapsed,
      paragraph: paragraph // Send paragraph for database storage
    });

    console.log(`Finished! WPM: ${finalWpm}, Accuracy: ${finalAccuracy}%`);
  };

  // Results screen
  if (showResults) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-indigo-500/30 selection:text-white pb-24">
        {/* Ambient background glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-4xl h-[400px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full -z-10" />
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-mono font-medium mb-4">
              <Trophy className="w-3.5 h-3.5" />
              <span>MATCH CONCLUDED</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-white mb-3">
              Race Podium
            </h1>
            <p className="text-sm sm:text-base text-slate-400 font-mono">
              Final verified standings for Room <span className="text-indigo-400 font-bold">#{roomCode}</span>
            </p>
          </div>
          
          {/* Results Cards List */}
          <div className="space-y-4 mb-10">
            {results.length > 0 ? (
              results.map((result, index) => {
                const isCurrentUser = result.userId === user?.id || result.userId === user?._id;
                const isWinner = index === 0;

                return (
                  <div
                    key={result.userId}
                    className={`rounded-3xl backdrop-blur-2xl p-5 sm:p-6 transition-all duration-300 relative overflow-hidden ${
                      isWinner
                        ? 'bg-amber-500/[0.08] border-2 border-amber-400/50 shadow-[0_0_40px_rgba(245,158,11,0.2)]'
                        : isCurrentUser
                        ? 'bg-slate-900/60 border-2 border-indigo-500/60 shadow-[0_0_30px_rgba(99,102,241,0.15)]'
                        : 'bg-slate-900/40 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {isWinner && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/15 blur-2xl pointer-events-none rounded-full" />
                    )}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Left: Rank & User */}
                      <div className="flex items-center gap-4 sm:gap-5">
                        {/* Rank Badge */}
                        <div
                          className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-black text-lg sm:text-xl font-mono shrink-0 shadow-lg ${
                            index === 0
                              ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 ring-2 ring-amber-300/50'
                              : index === 1
                              ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 ring-2 ring-slate-300/30'
                              : index === 2
                              ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 ring-2 ring-amber-600/30'
                              : 'bg-white/[0.05] border border-white/10 text-slate-400'
                          }`}
                        >
                          {index === 0 ? <Crown className="w-6 h-6" /> : `#${index + 1}`}
                        </div>
                        
                        {/* User Details */}
                        <div>
                          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                            <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                              {result.username}
                            </h3>
                            {isCurrentUser && (
                              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold">
                                YOU
                              </span>
                            )}
                            {isWinner && (
                              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                WINNER
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-mono">
                            Completed in <span className="text-slate-200 font-semibold">{Math.round(result.timeTaken || 0)}s</span>
                          </p>
                        </div>
                      </div>

                      {/* Right: Telemetry Grid */}
                      <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0 font-mono">
                        <div className="text-center sm:text-right">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Velocity</p>
                          <p className="text-xl sm:text-2xl font-black text-indigo-400">
                            {result.wpm} <span className="text-xs text-slate-400 font-normal">WPM</span>
                          </p>
                        </div>
                        
                        <div className="w-px h-8 bg-white/10 hidden sm:block" />

                        <div className="text-center sm:text-right">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Precision</p>
                          <p className="text-xl sm:text-2xl font-black text-emerald-400">
                            {result.accuracy}%
                          </p>
                        </div>

                        <div className="w-px h-8 bg-white/10 hidden sm:block" />

                        <div className="text-center sm:text-right">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Time</p>
                          <p className="text-xl sm:text-2xl font-black text-white">
                            {Math.round(result.timeTaken)}s
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-2xl">
                <Users className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-40" />
                <p className="text-slate-400 font-mono text-sm">Aggregating telemetry results from arena...</p>
              </div>
            )}
          </div>

          {/* Personal Performance Graph */}
          <div className="mb-8 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white">Your Velocity Curve</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Speed trajectory & precision consistency</p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-slate-300">
                Live Telemetry
              </span>
            </div>
            
            <div className="rounded-2xl bg-slate-950/40 border border-white/5 p-4">
              <ResultChart data={{
                series1Name: 'WPM',
                series2Name: 'Accuracy (%)',
                time: chartData.time,
                wpm: chartData.wpm,
                raw: chartData.raw
              }} />
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 font-mono">
            <button
              onClick={() => navigate('/multiplayer')}
              className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 group"
            >
              <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              <span>Queue Another Match</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-4 px-6 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-white font-bold text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-5 h-5 text-slate-400" />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Game Screen
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-indigo-500/30 selection:text-white pb-24">
      {/* Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-5xl h-[420px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full -z-10" />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main typing arena */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Telemetry HUD */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 font-mono">
              {/* Time Remaining */}
              <div className={`rounded-2xl p-4 backdrop-blur-xl transition-all duration-300 relative overflow-hidden ${
                timeLeft <= 10
                  ? 'bg-rose-500/10 border-2 border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.2)] animate-pulse'
                  : 'bg-slate-900/40 border border-white/10'
              }`}>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>TIME REMAINING</span>
                  <Clock className={`w-3.5 h-3.5 ${timeLeft <= 10 ? 'text-rose-400' : 'text-slate-400'}`} />
                </div>
                <p className={`text-2xl sm:text-3xl font-black ${timeLeft <= 10 ? 'text-rose-400' : 'text-white'}`}>
                  {timeLeft}s
                </p>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Countdown</div>
              </div>

              {/* Velocity */}
              <div className="rounded-2xl bg-slate-900/40 border border-white/10 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>VELOCITY</span>
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-indigo-400">{myStats.wpm}</p>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">WPM (Words/Min)</div>
              </div>

              {/* Precision */}
              <div className="rounded-2xl bg-slate-900/40 border border-white/10 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>PRECISION</span>
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">{myStats.accuracy}%</p>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Accuracy Ratio</div>
              </div>

              {/* Track Completion */}
              <div className="rounded-2xl bg-slate-900/40 border border-white/10 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>PROGRESS</span>
                  <Flag className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-cyan-400">{Math.round(myStats.progress)}%</p>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">Lap Distance</div>
              </div>
            </div>

            {/* Paragraph Display Container */}
            <div className="rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
                    Arena Target Track
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {input.length} / {paragraph.length} chars
                </span>
              </div>

              {/* Paragraph Characters */}
              <div className="text-lg sm:text-xl leading-relaxed font-mono select-none whitespace-pre-wrap break-words min-h-[120px] max-h-56 overflow-y-auto pr-2">
                {paragraph.split('').map((char, index) => {
                  let className = 'text-slate-500 transition-colors';
                  
                  if (index < input.length) {
                    if (input[index] === char) {
                      className = 'text-emerald-400 font-semibold';
                    } else {
                      className = 'text-rose-400 bg-rose-500/25 rounded px-0.5 underline decoration-rose-500';
                    }
                  }
                  
                  // Current cursor position
                  const isCursor = index === input.length;
                  
                  return (
                    <span key={index} className="relative">
                      {isCursor && (
                        <span
                          className="cursor-blink absolute -left-0.5 top-0 bottom-0"
                          aria-hidden="true"
                        />
                      )}
                      <span className={className}>
                        {char === ' ' ? '\u00A0' : char}
                      </span>
                    </span>
                  );
                })}
                {/* Cursor at very end of text */}
                {input.length === paragraph.length && (
                  <span className="cursor-blink ml-0.5" style={{ height: '1.25em' }} aria-hidden="true" />
                )}
              </div>
              
              {/* Error indicator */}
              {errors > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors} typo{errors !== 1 ? 's' : ''} detected — Correct your buffer to proceed</span>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleTyping}
                disabled={finished}
                placeholder={finished ? "Finished! Stand by for final race rankings..." : "Type the passage here..."}
                className="w-full px-6 py-4 bg-slate-950/60 border border-white/15 focus:border-indigo-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 text-lg sm:text-xl font-mono text-white placeholder-slate-600 resize-none transition-all shadow-inner disabled:opacity-50"
                rows="4"
                spellCheck="false"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>

            {finished && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center font-mono flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-sm sm:text-base">Track Finished! Awaiting other pilots to cross the finish line...</span>
              </div>
            )}

            {/* Live Performance Graph */}
            {!finished && chartData.time.length > 2 && (
              <div className="rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl hidden md:block">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    Live Telemetry Stream
                  </span>
                  <span className="text-xs font-mono text-indigo-400">
                    Real-time
                  </span>
                </div>
                <div className="rounded-xl bg-slate-950/40 border border-white/5 p-3 h-48">
                  <ResultChart 
                    className="h-full"
                    data={{
                      series1Name: 'WPM',
                      series2Name: 'Accuracy (%)',
                      time: chartData.time,
                      wpm: chartData.wpm,
                      raw: chartData.raw
                    }} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Players Live Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-2xl p-6 shadow-2xl sticky top-28 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold font-display text-white">Live Grid</h3>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-slate-400">
                  {players.length + 1} Racers
                </span>
              </div>
              
              <div className="space-y-4">
                {/* Current user */}
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-indigo-300">
                        {user?.username}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                        YOU
                      </span>
                    </div>
                    <span className="text-xs font-bold font-mono text-indigo-300">
                      {Math.round(myStats.progress)}%
                    </span>
                  </div>

                  {/* Progress bar track */}
                  <div className="bg-slate-950/60 rounded-full h-3 overflow-hidden mb-2 border border-white/5">
                    <div
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${myStats.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="text-indigo-400 font-semibold">{myStats.wpm} WPM</span>
                    <span className="text-emerald-400 font-semibold">{myStats.accuracy}% ACC</span>
                  </div>

                  {finished && (
                    <div className="mt-2 text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Finished!</span>
                    </div>
                  )}
                </div>

                {/* Other players */}
                {players.filter(p => p.userId !== user?.id && p.userId !== user?._id).length > 0 ? (
                  players.filter(p => p.userId !== user?.id && p.userId !== user?._id).map((player, index) => {
                    const isOpponentFinished = finishedPlayers.current.has(player.userId);
                    return (
                      <div key={player.userId || index} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium font-mono text-slate-200 truncate max-w-[130px]">
                            {player.username}
                          </span>
                          <span className="text-xs font-bold font-mono text-emerald-400">
                            {Math.round(player.progress || 0)}%
                          </span>
                        </div>

                        <div className="bg-slate-950/60 rounded-full h-2.5 overflow-hidden mb-2 border border-white/5">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-300 ease-out rounded-full"
                            style={{ width: `${player.progress || 0}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>{player.wpm || 0} WPM</span>
                          <span>{player.accuracy || 100}% ACC</span>
                        </div>

                        {isOpponentFinished && (
                          <div className="mt-1.5 text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Finished!</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-slate-500 py-6 font-mono text-xs">
                    <p className="text-2xl mb-1">🏁</p>
                    <p>No other drivers in lane</p>
                  </div>
                )}
              </div>

              {!connected && (
                <div className="mt-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono text-center flex items-center justify-center gap-1.5">
                  <WifiOff className="w-3.5 h-3.5 shrink-0" />
                  <span>Reconnecting to Grid...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
