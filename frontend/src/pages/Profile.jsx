import { useState } from 'react';
import Navbar from '../components/Navbar';
import { User, Edit2, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const achievements = [
    { id: 1, name: 'Speed Demon', description: 'Reach 100 WPM', icon: '⚡', unlocked: (user?.highestWPM || 0) >= 100 },
    { id: 2, name: 'Perfect Game', description: '100% Accuracy', icon: '🎯', unlocked: (user?.accuracy || 0) >= 100 },
    { id: 3, name: 'Century Club', description: 'Play 100 games', icon: '💯', unlocked: (user?.gamesPlayed || 0) >= 100 },
    { id: 4, name: 'Winner Winner', description: 'Win 50 multiplayer games', icon: '👑', unlocked: (user?.wins || 0) >= 50 }
  ];

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await updateUser(formData);

    if (result.success) {
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

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
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-500">
              {success}
            </div>
          )}

          <div className="bg-slate-800 rounded-xl p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center">
                  <User size={48} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
                  <p className="text-slate-400">@{user?.username}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Joined {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
              >
                <Edit2 size={16} />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>

            {isEditing && (
              <div className="space-y-4 pt-6 border-t border-slate-700">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-slate-800 rounded-lg p-6 text-center">
              <p className="text-slate-400 text-sm mb-2">Highest WPM</p>
              <p className="text-3xl font-bold text-green-500">{user?.highestWPM || 0}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 text-center">
              <p className="text-slate-400 text-sm mb-2">Average WPM</p>
              <p className="text-3xl font-bold text-indigo-500">{user?.averageWPM || 0}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 text-center">
              <p className="text-slate-400 text-sm mb-2">Accuracy</p>
              <p className="text-3xl font-bold text-blue-500">{user?.accuracy || 0}%</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 text-center">
              <p className="text-slate-400 text-sm mb-2">Games Played</p>
              <p className="text-3xl font-bold">{user?.gamesPlayed || 0}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 text-center">
              <p className="text-slate-400 text-sm mb-2">Wins</p>
              <p className="text-3xl font-bold text-yellow-500">{user?.wins || 0}</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Trophy className="text-yellow-500" size={32} />
              <h2 className="text-2xl font-bold">Achievements</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`flex items-center space-x-4 rounded-lg p-4 ${
                    achievement.unlocked ? 'bg-slate-700' : 'bg-slate-700/50 opacity-50'
                  }`}
                >
                  <span className="text-4xl">{achievement.icon}</span>
                  <div>
                    <p className="font-semibold">{achievement.name}</p>
                    <p className="text-sm text-slate-400">{achievement.description}</p>
                    {!achievement.unlocked && (
                      <p className="text-xs text-slate-500 mt-1">🔒 Locked</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
