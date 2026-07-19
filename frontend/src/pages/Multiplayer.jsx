import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Users, Lock, ArrowLeft } from 'lucide-react';
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

  // Fetch public rooms when tab is active
  useEffect(() => {
    if (activeTab === 'public') {
      fetchPublicRooms();
    }
  }, [activeTab]);

  const fetchPublicRooms = async () => {
    try {
      setLoading(true);
      const response = await roomService.getPublicRooms();
      if (response.success) {
        setPublicRooms(response.rooms);
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
      if (response.success) {
        // Navigate to waiting room with room code
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

    if (roomCode.length !== 6) {
      setError('Room code must be 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await roomService.joinRoom(roomCode);
      if (response.success) {
        navigate(`/multiplayer/waiting?code=${roomCode}`);
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
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <Link to="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white transition mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-center mb-12">Multiplayer</h1>

        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                activeTab === 'create' ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              Create Room
            </button>
            <button
              onClick={() => setActiveTab('join')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                activeTab === 'join' ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              Join Room
            </button>
            <button
              onClick={() => setActiveTab('public')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                activeTab === 'public' ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              Public Rooms
            </button>
          </div>

          {activeTab === 'create' && (
            <form onSubmit={handleCreateRoom} className="bg-slate-800 rounded-xl p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Max Players</label>
                <div className="grid grid-cols-4 gap-4">
                  {[2, 4, 6, 8].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, maxPlayers: num })}
                      className={`py-3 rounded-lg font-semibold transition ${
                        createForm.maxPlayers === num ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password (Optional)</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Set a password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Game Duration</label>
                <div className="grid grid-cols-4 gap-4">
                  {[15, 30, 60, 120].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, duration: time })}
                      className={`py-3 rounded-lg font-semibold transition ${
                        createForm.duration === time ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      {time}s
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={createForm.language}
                  onChange={(e) => setCreateForm({ ...createForm, language: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={!createForm.isPrivate}
                  onChange={(e) => setCreateForm({ ...createForm, isPrivate: !e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm">Make room public</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white rounded-lg text-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </form>
          )}

          {activeTab === 'join' && (
            <form onSubmit={handleJoinRoom} className="bg-slate-800 rounded-xl p-8">
              <label className="block text-sm font-medium mb-2">Enter Room Code</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6 uppercase"
                placeholder="Enter 6-digit room code"
                maxLength={6}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white rounded-lg text-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Joining...' : 'Join Room'}
              </button>
            </form>
          )}

          {activeTab === 'public' && (
            <div className="bg-slate-800 rounded-xl p-8">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading rooms...</p>
                </div>
              ) : publicRooms.length > 0 ? (
                <div className="space-y-4">
                  {publicRooms.map((room) => (
                    <div key={room._id} className="flex items-center justify-between bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center space-x-4">
                        <Users size={24} className="text-indigo-500" />
                        <div>
                          <p className="font-semibold">{room.roomCode}</p>
                          <p className="text-sm text-slate-400">
                            {room.players.length}/{room.maxPlayers} players • {room.duration}s • {room.language}
                          </p>
                        </div>
                        {room.password && <Lock size={16} className="text-yellow-500" />}
                      </div>
                      <button
                        onClick={() => handleJoinPublicRoom(room.roomCode, !!room.password)}
                        disabled={room.players.length >= room.maxPlayers || room.status !== 'waiting'}
                        className="px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {room.players.length >= room.maxPlayers ? 'Full' : 'Join'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No public rooms available</p>
                  <p className="text-sm mt-2">Create a room to get started!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
