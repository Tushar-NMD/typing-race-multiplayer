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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
              {error}
            </div>
          )}

          {/* Room Info */}
          <div className="bg-slate-800 rounded-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-slate-400 text-sm mb-1">Room Code</p>
                <p className="text-3xl font-bold tracking-wider">{roomCode}</p>
                <p className="text-slate-400 text-sm mt-2">{room?.name}</p>
                {isHost && (
                  <span className="inline-block mt-2 px-3 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-full border border-yellow-500">
                    👑 You are the Host
                  </span>
                )}
              </div>
              <div className="text-right">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                  <span>{copied ? 'Copied!' : 'Copy Invite'}</span>
                </button>
                <p className="text-slate-400 text-sm mt-2">
                  {room?.duration}s • {room?.language}
                </p>
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <p className="text-sm text-slate-300 truncate">{inviteLink}</p>
            </div>
          </div>

          {/* Players List */}
          <div className="bg-slate-800 rounded-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <Users className="mr-2" size={24} />
                Players ({players.length}/{room?.maxPlayers})
              </h2>
              {!connected && (
                <span className="text-yellow-500 text-sm">
                  🔄 Reconnecting...
                </span>
              )}
            </div>
            
            <div className="space-y-4">
              {players.map((player, index) => {
                const hostId = getHostId();
                const userId = getUserId();
                const playerIsHost = player.userId === hostId || player.userId?._id === hostId;
                const isCurrentUser = player.userId === userId;
                
                return (
                  <div
                    key={player.userId || index}
                    className="flex items-center justify-between bg-slate-700 rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        player.ready ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <span className="font-semibold flex items-center">
                        {player.username}
                        {playerIsHost && (
                          <Crown className="ml-2 text-yellow-500" size={16} />
                        )}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-indigo-600 px-2 py-1 rounded">YOU</span>
                        )}
                      </span>
                    </div>
                    <span className={`text-sm font-semibold ${
                      player.ready ? 'text-green-500' : 'text-yellow-500'
                    }`}>
                      {player.ready ? '✓ Ready' : '⏳ Not Ready'}
                    </span>
                  </div>
                );
              })}
              
              {/* Empty slots */}
              {Array.from({ length: room?.maxPlayers - players.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="flex items-center justify-between bg-slate-700/50 rounded-lg p-4 opacity-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 rounded-full bg-slate-500" />
                    <span className="text-slate-400">Waiting for player...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleLeave}
              className="flex-1 py-4 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition"
            >
              Leave Room
            </button>
            
            {/* Host can also toggle ready */}
            <button
              onClick={handleToggleReady}
              className={`flex-1 py-4 rounded-lg font-semibold transition ${
                ready 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              {ready ? '✓ Ready!' : 'Mark Ready'}
            </button>

            {isHost && (
              <button
                onClick={handleStart}
                disabled={!canStart || players.length < 2}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {players.length < 2 
                  ? 'Need 2+ Players' 
                  : !canStart 
                    ? `Waiting for Ready (${players.filter(p => p.ready).length}/${players.length})`
                    : '🎮 Start Game'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
