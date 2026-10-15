import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Users, Lock, ArrowLeft, PlusCircle, LogIn, Globe, Clock, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { roomService } from '../services/roomService';

export default function Multiplayer() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('create');
  const [roomCode, setRoomCode] = useState('');
  const [publicRooms, setPublicRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createForm, setCreateForm] = useState({
    maxPlayers: 4,
    password: '',
    duration: 60,
    language: 'english',
    isPrivate: false
  });

  useEffect(() => {
    if (activeTab === 'public') {
      fetchPublicRooms();
    }
  }, [activeTab]);

  const fetchPublicRooms = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await roomService.getPublicRooms();
      if (response.success) {
        setPublicRooms(response.rooms || []);
      }
    } catch (err) {
      setError('Failed to load public rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await roomService.createRoom(createForm);
      if (response.success && response.room) {
        navigate(`/multiplayer/waiting?code=${response.room.roomCode}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setError('');

    if (roomCode.trim().length !== 6) {
      setError('Room code must be exactly 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await roomService.joinRoom(roomCode.trim().toUpperCase());
      if (response.success) {
        navigate(`/multiplayer/waiting?code=${roomCode.trim().toUpperCase()}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPublicRoom = async (code, hasPassword) => {
    if (hasPassword) {
      const password = prompt('Enter room password:');
      if (!password) return;
      
      try {
        const response = await roomService.joinRoom(code, password);
        if (response.success) {
          navigate(`/multiplayer/waiting?code=${code}`);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid password');
      }
    } else {
      try {
        const response = await roomService.joinRoom(code);
        if (response.success) {
          navigate(`/multiplayer/waiting?code=${code}`);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to join room');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-indigo-500/30 selection:text-white pb-24">
      {/* Specular Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-4xl h-[400px] bg-cyan-600/15 blur-[140px] pointer-events-none rounded-full -z-10" />
      <div className="fixed bottom-0 right-10 w-[35vw] h-[350px] bg-indigo-600/10 blur-[150px] pointer-events-none rounded-full -z-10" />

      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-slate-400 hover:text-white transition-colors group px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-cyan-400" />
            <span>Back to Dashboard</span>
          </Link>

          {activeTab === 'public' && (
            <button
              onClick={fetchPublicRooms}
              disabled={loading}
              className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-cyan-400' : ''} />
              <span>Refresh</span>
            </button>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Users size={13} className="text-cyan-400" />
            <span>Binary WebSocket Arena</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-3">
            Multiplayer <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">Lobby</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-400 font-mono max-w-xl mx-auto leading-relaxed">
            Create a custom scrim room, join via 6-digit access code, or battle in public matchmaking matches at zero dropped frames.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm font-mono flex items-center gap-2 animate-in fade-in">
            <Shield size={16} className="text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-3 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl mb-8 gap-1.5">
          {[
            { id: 'create', label: 'Create Room', icon: PlusCircle },
            { id: 'join', label: 'Join Room', icon: LogIn },
            { id: 'public', label: 'Public Rooms', icon: Globe }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 text-white border border-white/20 shadow-md shadow-cyan-500/10 backdrop-blur-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Icon size={16} className={isSelected ? 'text-cyan-400' : 'text-slate-500'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Create Room */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateRoom} className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-bold font-mono text-white mb-3">
                Max Typists in Room
              </label>
              <div className="grid grid-cols-4 gap-3 font-mono">
                {[2, 4, 6, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, maxPlayers: num })}
                    className={`py-3 rounded-2xl font-bold text-sm border transition-all cursor-pointer ${
                      createForm.maxPlayers === num
                        ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border-cyan-400/50 text-white shadow-md'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    {num} Typists
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold font-mono text-white mb-2">
                  Sprint Duration
                </label>
                <div className="grid grid-cols-4 gap-2 font-mono">
                  {[15, 30, 60, 120].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, duration: t })}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        createForm.duration === t
                          ? 'bg-cyan-500/20 border-cyan-400/50 text-white shadow-sm'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold font-mono text-white mb-2">
                  Room Language
                </label>
                <select
                  value={createForm.language}
                  onChange={(e) => setCreateForm({ ...createForm, language: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400/50"
                >
                  <option value="english" className="bg-slate-900">English</option>
                  <option value="spanish" className="bg-slate-900">Spanish</option>
                  <option value="french" className="bg-slate-900">French</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold font-mono text-white mb-2">
                Room Access Password (Optional)
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Leave empty for public or friends join"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 font-mono text-xs sm:text-sm focus:outline-none focus:border-cyan-400/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <input
                type="checkbox"
                id="publicCheckbox"
                checked={!createForm.isPrivate}
                onChange={(e) => setCreateForm({ ...createForm, isPrivate: !e.target.checked })}
                className="w-4 h-4 rounded bg-white/10 border-white/20 text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="publicCheckbox" className="text-xs sm:text-sm font-mono text-slate-300 cursor-pointer select-none">
                List this lobby publicly on the global room board
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display font-black text-sm sm:text-base shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Generating Scrim Room...' : 'Create & Enter Waiting Room'}</span>
            </button>
          </form>
        )}

        {/* Tab 2: Join Room via Code */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinRoom} className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] max-w-lg mx-auto text-center space-y-6">
            <div>
              <h3 className="text-xl font-bold font-display text-white mb-2">Direct Access Code</h3>
              <p className="text-xs text-slate-400 font-mono">
                Enter the 6-character room pass-key generated by the room host.
              </p>
            </div>

            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. 8K2M9X"
              maxLength={6}
              required
              className="w-full py-4 text-center text-3xl sm:text-4xl font-mono font-black tracking-[0.4em] uppercase bg-white/[0.04] border border-white/15 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/60 focus:bg-white/[0.08] transition-all"
            />

            <button
              type="submit"
              disabled={loading || roomCode.length !== 6}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display font-black text-sm sm:text-base shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Authenticating Room...' : 'Join Race Lobby'}</span>
            </button>
          </form>
        )}

        {/* Tab 3: Public Rooms List */}
        {activeTab === 'public' && (
          <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)]">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400 mx-auto mb-3" />
                <p className="text-xs font-mono text-slate-400">Scanning active WebSocket game rooms...</p>
              </div>
            ) : publicRooms.length > 0 ? (
              <div className="space-y-3 font-mono">
                {publicRooms.map((room) => {
                  const isFull = room.players.length >= room.maxPlayers;
                  const isWaiting = room.status === 'waiting';

                  return (
                    <div 
                      key={room._id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                          <Users size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-white">{room.roomCode}</span>
                            {room.password && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                                <Lock size={10} /> Locked
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {room.players.length}/{room.maxPlayers} Typists · {room.duration}s Sprint · {room.language}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoinPublicRoom(room.roomCode, !!room.password)}
                        disabled={isFull || !isWaiting}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                      >
                        {isFull ? 'Full (Maxed)' : !isWaiting ? 'In Race' : 'Join Match'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-14">
                <div className="w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-3 text-slate-500">
                  <Users size={28} className="text-cyan-400/60" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">No Public Lobbies Found</h4>
                <p className="text-xs text-slate-400 font-mono max-w-sm mx-auto mb-6">
                  There are currently no open public lobbies. Click "Create Room" to start your own match and invite racers!
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-md shadow-cyan-500/20"
                >
                  Create New Match
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
