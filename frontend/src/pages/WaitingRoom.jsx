import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Copy, Check, Crown, Users } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { roomService } from '../services/roomService';

export default function WaitingRoom() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get('code');
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canStart, setCanStart] = useState(false);

  // Helper functions
  const getUserId = () => {
    if (!user) return null;
    return user._id || user.id;
  };

  const getHostId = () => {
    if (!room?.hostId) return null;
    return typeof room.hostId === 'object' ? room.hostId._id : room.hostId;
  };

  const inviteLink = `${window.location.origin}/multiplayer?code=${roomCode}`;
  
  // Debug: Log user object
  console.log('👤 Current user object:', user);
  
  const isHost = getHostId() === getUserId();
  
  console.log('🎯 Host check:', {
    roomHostId: getHostId(),
    userId: getUserId(),
    userObject: user,
    isHost,
    roomHostIdRaw: room?.hostId
  });

  // Debug logging for button state
  useEffect(() => {
    console.log('🔍 Button state debug:', {
      isHost,
      canStart,
      playersLength: players.length,
      readyCount: players.filter(p => p.ready).length,
      shouldBeDisabled: !canStart || players.length < 2
    });
  }, [isHost, canStart, players]);

  // Fetch room data and join socket room
  useEffect(() => {
    if (!roomCode) {
      navigate('/multiplayer');
      return;
    }

    const fetchRoom = async () => {
      try {
        console.log('📡 Fetching room data for:', roomCode);
        const response = await roomService.getRoom(roomCode);
        console.log('📡 Room response:', response);
        
        if (response.success) {
          console.log('📡 Room data:', response.room);
          console.log('📡 Host ID:', response.room.hostId);
          console.log('📡 Current user ID:', user?._id);
          
          setRoom(response.room);
          setPlayers(response.room.players);
          
          // Set current user's ready status from room data
          const currentPlayer = response.room.players.find(p => {
            const userId = getUserId();
            console.log('🔍 Comparing player:', { playerId: p.userId, userId, match: p.userId === userId });
            return p.userId === userId;
          });
          console.log('📡 Current player in room:', currentPlayer);
          
          if (currentPlayer) {
            setReady(currentPlayer.ready);
            console.log('📡 Setting ready status to:', currentPlayer.ready);
          }
          
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ Error fetching room:', err);
        setError('Failed to load room');
        setTimeout(() => navigate('/multiplayer'), 2000);
      }
    };

    fetchRoom();
  }, [roomCode, navigate, user]);

  // Socket.IO event handlers
  useEffect(() => {
    if (!socket || !connected || !roomCode) return;

    console.log('🔌 Joining socket room:', roomCode);
    
    // Join the socket room
    socket.emit('join-room', { roomCode });

    // Listen for room state updates
    socket.on('room-state', (data) => {
      console.log('📊 Received room state:', data);
      setRoom(data);
      setPlayers(data.players);
    });

    // Player joined
    socket.on('player-joined', (data) => {
      console.log('Player joined:', data.username);
      // Refresh room data
      roomService.getRoom(roomCode).then(res => {
        if (res.success) {
          setPlayers(res.room.players);
        }
      });
    });

    // Player left
    socket.on('player-left', (data) => {
      console.log('Player left:', data.username);
      setPlayers(prev => prev.filter(p => p.userId !== data.userId));
    });

    // Player ready status changed
    socket.on('player-ready-status', (data) => {
      console.log('Player ready status changed:', data);
      setPlayers(prev => {
        const updated = prev.map(p => 
          p.userId === data.userId 
            ? { ...p, ready: data.isReady }
            : p
        );
        console.log('Updated players:', updated);
        
        // Check if all players are ready (at least 2 players)
        const readyCount = updated.filter(p => p.ready).length;
        const totalCount = updated.length;
        console.log(`Ready count: ${readyCount}/${totalCount}`);
        
        if (readyCount >= 2 && readyCount === totalCount) {
          setCanStart(true);
        } else {
          setCanStart(false);
        }
        
        return updated;
      });
    });

    // All players ready
    socket.on('all-players-ready', (data) => {
      console.log('🎯 RECEIVED all-players-ready event:', data);
      console.log('🎯 Current canStart before update:', canStart);
      setCanStart(data.canStart);
      console.log('🎯 Setting canStart to:', data.canStart);
    });

    // Game starting countdown
    socket.on('game-starting', (data) => {
      console.log('🎮 Received game-starting event:', data);
      startCountdown();
    });

    // Error from server
    socket.on('error', (data) => {
      setError(data.message);
    });

    // Cleanup
    return () => {
      socket.off('room-state');
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('player-ready-status');
      socket.off('all-players-ready');
      socket.off('game-starting');
      socket.off('error');
    };
  }, [socket, connected, roomCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleReady = () => {
    if (!socket) return;
    
    const newReadyState = !ready;
    console.log(`Toggling ready: ${ready} → ${newReadyState}`);
    setReady(newReadyState);
    socket.emit('toggle-ready', { roomCode, isReady: newReadyState });
  };

  const handleStart = () => {
    if (!socket || !isHost) {
      console.log('Cannot start: no socket or not host');
      return;
    }
    
    const readyCount = players.filter(p => p.ready).length;
    console.log(`Attempting to start game. Ready players: ${readyCount}/${players.length}, canStart: ${canStart}`);
    
    if (readyCount < 2) {
      setError('Need at least 2 ready players to start');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!canStart) {
      setError('Not all players are ready yet');
      setTimeout(() => setError(''), 3000);
      return;
    }

    console.log(`✅ Starting game for room: ${roomCode}`);
    socket.emit('start-game', { roomCode });
  };

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);
    
    const timer = setInterval(() => {
      count--;
      if (count === 0) {
        setCountdown('GO!');
        setTimeout(() => {
          clearInterval(timer);
          navigate(`/multiplayer/game?code=${roomCode}`);
        }, 500);
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const handleLeave = async () => {
    try {
      if (socket) {
        socket.emit('leave-room', { roomCode });
      }
      await roomService.leaveRoom(roomCode);
      navigate('/multiplayer');
    } catch (err) {
      console.error('Error leaving room:', err);
      navigate('/multiplayer');
    }
  };

  // Countdown screen
  if (countdown !== null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-indigo-500 animate-pulse">
            {countdown}
          </h1>
          <p className="text-2xl text-slate-400 mt-8">Get ready to type!</p>
        </div>
      </div>
    );
  }

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center relative selection:bg-indigo-500/30">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-4xl h-[400px] bg-cyan-600/15 blur-[140px] pointer-events-none rounded-full -z-10" />
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Connecting to Room Stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-indigo-500/30 selection:text-white pb-24">
      {/* Specular Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[85vw] max-w-4xl h-[420px] bg-cyan-600/15 blur-[150px] pointer-events-none rounded-full -z-10" />
      <div className="fixed bottom-0 right-10 w-[35vw] h-[350px] bg-indigo-600/10 blur-[150px] pointer-events-none rounded-full -z-10" />

      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm font-mono flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Room Header Info Card */}
        <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase mb-2">
                <Users size={12} className="text-cyan-400" />
                Live Scrim Room
              </div>
              <p className="text-xs text-slate-400 font-mono">Room Pass Code</p>
              <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-white mt-0.5">
                {roomCode}
              </h1>
              {isHost && (
                <span className="inline-flex items-center gap-1 mt-2.5 px-3 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold">
                  <Crown size={12} /> You are Room Host
                </span>
              )}
            </div>

            <div className="sm:text-right flex flex-col sm:items-end">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-white font-mono text-xs transition-all cursor-pointer shadow-sm"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-cyan-400" />}
                <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
              </button>
              <p className="text-xs text-slate-400 font-mono mt-2">
                Sprint: {room?.duration}s · Language: {room?.language}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 font-mono text-xs text-slate-400 truncate">
            {inviteLink}
          </div>
        </div>

        {/* Players List Card */}
        <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold font-display text-white flex items-center gap-2.5">
              <Users size={20} className="text-cyan-400" />
              <span>Contenders ({players.length}/{room?.maxPlayers || 4})</span>
            </h2>
            {!connected && (
              <span className="text-amber-400 text-xs font-mono animate-pulse">
                Reconnecting socket...
              </span>
            )}
          </div>
          
          <div className="space-y-3 font-mono">
            {players.map((player, index) => {
              const hostId = getHostId();
              const userId = getUserId();
              const playerIsHost = player.userId === hostId || player.userId?._id === hostId;
              const isCurrentUser = player.userId === userId;
              
              return (
                <div
                  key={player.userId || index}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center font-display font-bold text-white">
                      {player.username?.[0]?.toUpperCase() || 'P'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 font-bold text-sm text-white">
                        <span>{player.username}</span>
                        {playerIsHost && (
                          <Crown size={14} className="text-amber-400 fill-amber-400" />
                        )}
                        {isCurrentUser && (
                          <span className="text-[10px] bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 px-1.5 py-0.2 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    player.ready 
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' 
                      : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${player.ready ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    {player.ready ? 'Ready' : 'Not Ready'}
                  </span>
                </div>
              );
            })}
            
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, (room?.maxPlayers || 4) - players.length) }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-dashed border-white/5 opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-slate-600 text-xs">
                    ?
                  </div>
                  <span className="text-xs text-slate-500">Waiting for racer to connect...</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 font-mono">
          <button
            type="button"
            onClick={handleLeave}
            className="flex-1 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 font-semibold text-xs transition-all cursor-pointer"
          >
            Leave Room
          </button>
          
          <button
            type="button"
            onClick={handleToggleReady}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-xs transition-all cursor-pointer border ${
              ready 
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-md shadow-emerald-500/10' 
                : 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-md shadow-amber-500/10'
            }`}
          >
            {ready ? '✓ Locked In Ready' : 'Mark Ready to Race'}
          </button>

          {isHost && (
            <button
              type="button"
              onClick={handleStart}
              disabled={!canStart || players.length < 2}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {players.length < 2 
                ? 'Need 2+ Players' 
                : !canStart 
                  ? `Waiting (${players.filter(p => p.ready).length}/${players.length} Ready)`
                  : 'Start Match'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
