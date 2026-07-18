import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import ResultChart from '../components/ResultChart';
import { getRandomParagraph, calculateWPM, calculateAccuracy } from '../utils/typingParagraphs';
import { roomService } from '../services/roomService';

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
      try {
        // Fetch room to get duration
        const roomResponse = await roomService.getRoom(roomCode);
        if (roomResponse.success) {
          const duration = roomResponse.room.duration || 60;
          setGameDuration(duration);
          setTimeLeft(duration);
        }
      } catch (error) {
        console.error('Failed to fetch room duration:', error);
      }

      // Generate random paragraph
      const newParagraph = getRandomParagraph('medium');
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
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Results Header */}
            <div className="text-center mb-12">
              <div className="text-8xl mb-4">🏆</div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent mb-2">
                Race Complete!
              </h1>
              <p className="text-slate-400 text-lg">Final standings</p>
            </div>
            
            {/* Results Cards */}
            <div className="space-y-4 mb-8">
              {results.length > 0 ? (
                results.map((result, index) => (
                  <div
                    key={result.userId}
                    className={`bg-slate-800 rounded-xl p-6 transition-all duration-300 ${
                      index === 0
                        ? 'border-2 border-yellow-500 shadow-xl shadow-yellow-500/20 scale-105'
                        : 'border border-slate-700'
                    } ${
                      result.userId === user?.id || result.userId === user?._id ? 'ring-2 ring-indigo-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {/* Rank and User Info */}
                      <div className="flex items-center space-x-6">
                        {/* Rank Badge */}
                        <div className={`flex items-center justify-center w-16 h-16 rounded-full font-bold text-2xl ${
                          index === 0 ? 'bg-yellow-500 text-slate-900' :
                          index === 1 ? 'bg-slate-400 text-slate-900' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {index === 0 ? '👑' : `#${index + 1}`}
                        </div>
                        
                        {/* User Details */}
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-2xl font-bold">
                              {result.username}
                            </h3>
                            {(result.userId === user?.id || result.userId === user?._id) && (
                              <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                YOU
                              </span>
                            )}
                            {index === 0 && (
                              <span className="bg-yellow-500 text-slate-900 px-3 py-1 rounded-full text-xs font-bold">
                                WINNER
                              </span>
                            )}
                          </div>
                          
                          {/* Stats */}
                          <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">💨</span>
                              <div>
                                <p className="text-slate-400 text-xs">Speed</p>
                                <p className="font-bold text-xl text-indigo-400">{result.wpm} WPM</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">🎯</span>
                              <div>
                                <p className="text-slate-400 text-xs">Accuracy</p>
                                <p className="font-bold text-xl text-green-400">{result.accuracy}%</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">⏱️</span>
                              <div>
                                <p className="text-slate-400 text-xs">Time</p>
                                <p className="font-bold text-lg">{Math.round(result.timeTaken)}s</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-800 rounded-xl">
                  <p className="text-slate-400">No results available yet...</p>
                </div>
              )}
            </div>

            {/* Personal Performance Graph */}
            <div className="mb-12 bg-slate-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-center">Your Performance</h2>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <ResultChart data={{
                  series1Name: 'WPM',
                  series2Name: 'Accuracy (%)',
                  time: chartData.time,
                  wpm: chartData.wpm,
                  raw: chartData.raw
                }} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/multiplayer')}
                className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🎮 Play Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-4 bg-slate-700 text-white rounded-xl font-bold text-lg hover:bg-slate-600 transition-all duration-300"
              >
                📊 Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main typing area */}
          <div className="lg:col-span-3">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm mb-1">Time</p>
                <p className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500' : ''}`}>
                  {timeLeft}s
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm mb-1">WPM</p>
                <p className="text-2xl font-bold text-indigo-500">{myStats.wpm}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm mb-1">Accuracy</p>
                <p className="text-2xl font-bold text-green-500">{myStats.accuracy}%</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm mb-1">Progress</p>
                <p className="text-2xl font-bold">{Math.round(myStats.progress)}%</p>
              </div>
            </div>

            {/* Paragraph display */}
            <div className="bg-slate-800 rounded-xl p-6 mb-6 max-h-48 overflow-y-auto">
              <div className="text-lg leading-relaxed font-mono select-none whitespace-pre-wrap break-words relative">
                {paragraph.split('').map((char, index) => {
                  let className = 'text-slate-500';
                  
                  if (index < input.length) {
                    // Already typed
                    if (input[index] === char) {
                      className = 'text-green-400';
                    } else {
                      className = 'text-red-500 bg-red-900/30 rounded px-0.5';
                    }
                  }
                  
                  // Current cursor position — render a blinking caret before this char
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
                  <span className="cursor-blink ml-0.5" style={{height: '1.25em'}} aria-hidden="true" />
                )}
              </div>
              
              {/* Error indicator */}
              {errors > 0 && (
                <div className="mt-3 flex items-center text-red-400 text-sm">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {errors} error{errors !== 1 ? 's' : ''} - Keep typing!
                </div>
              )}
            </div>

            {/* Input area */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleTyping}
              disabled={finished}
              placeholder="Start typing here..."
              className="w-full px-6 py-4 bg-slate-800 border-2 border-slate-600 rounded-xl focus:outline-none focus:border-indigo-500 text-xl font-mono resize-none disabled:opacity-50"
              rows="4"
              spellCheck="false"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />

            {finished && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-500 text-center">
                <p className="font-semibold">✓ Finished! Waiting for other players...</p>
              </div>
            )}

            {/* Live Performance Graph */}
            {!finished && chartData.time.length > 0 && (
              <div className="mt-6 bg-slate-800 rounded-xl p-4 hidden md:block">
                <h3 className="text-slate-400 text-sm font-semibold mb-2">Live Performance</h3>
                <div className="bg-slate-700/30 rounded-lg p-2 h-48">
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

          {/* Players sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-xl p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="text-2xl mr-2">🏁</span>
                Live Progress
              </h3>
              
              <div className="space-y-4">
                {/* Current user */}
                <div className="pb-4 border-b border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">👤</span>
                      <span className="font-semibold text-indigo-400">
                        {user?.username}
                      </span>
                      <span className="text-xs bg-indigo-600 px-2 py-0.5 rounded">YOU</span>
                    </div>
                    <span className="text-sm font-bold text-indigo-400">
                      {Math.round(myStats.progress)}%
                    </span>
                  </div>
                  <div className="bg-slate-700 rounded-full h-4 overflow-hidden mb-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300 ease-out flex items-center justify-end pr-2"
                      style={{ width: `${myStats.progress}%` }}
                    >
                      {myStats.progress > 10 && (
                        <span className="text-xs font-bold text-white">🏃</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>💨 {myStats.wpm} WPM</span>
                    <span>🎯 {myStats.accuracy}% accuracy</span>
                  </div>
                  {finished && (
                    <div className="mt-2 text-xs text-green-400 font-semibold flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Finished!
                    </div>
                  )}
                </div>

                {/* Other players */}
                {players.filter(p => p.userId !== user?.id && p.userId !== user?._id).length > 0 ? (
                  players.filter(p => p.userId !== user?.id && p.userId !== user?._id).map((player, index) => (
                    <div key={player.userId || index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">👥</span>
                          <span className="font-semibold">{player.username}</span>
                        </div>
                        <span className="text-sm font-bold text-green-400">
                          {Math.round(player.progress)}%
                        </span>
                      </div>
                      <div className="bg-slate-700 rounded-full h-4 overflow-hidden mb-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-300 ease-out flex items-center justify-end pr-2"
                          style={{ width: `${player.progress}%` }}
                        >
                          {player.progress > 10 && (
                            <span className="text-xs font-bold text-white">🏃</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>💨 {player.wpm} WPM</span>
                        <span>🎯 {player.accuracy}% acc</span>
                      </div>
                      {finishedPlayers.current.has(player.userId) && (
                        <div className="mt-1 text-xs text-green-400 font-semibold flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Finished!
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500 py-8">
                    <p className="text-3xl mb-2">👻</p>
                    <p className="text-sm">No other players yet</p>
                  </div>
                )}
              </div>

              {!connected && (
                <div className="mt-4 p-2 bg-yellow-500/10 border border-yellow-500 rounded text-yellow-500 text-xs text-center">
                  🔄 Reconnecting...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
