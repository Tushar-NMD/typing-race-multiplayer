import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { User, Edit2, Trophy, ArrowLeft, Flame, Target, Award, Calendar, Check, X, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

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
  const [profileUser, setProfileUser] = useState(user);

  useEffect(() => {
    const fetchFreshData = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response.success && response.user) {
          setProfileUser(response.user);
          setFormData({
            name: response.user.name || '',
            email: response.user.email || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch fresh user data', err);
      }
    };
    fetchFreshData();
  }, []);

  const achievements = [
    { id: 1, name: 'Speed Demon', description: 'Surpass 100 WPM burst speed', icon: '⚡', unlocked: (profileUser?.highestWPM || 0) >= 100 },
    { id: 2, name: 'Flawless Flow', description: 'Reach 100% accuracy in a match', icon: '🎯', unlocked: (profileUser?.accuracy || 0) >= 100 },
    { id: 3, name: 'Century Club', description: 'Complete 100 authenticated races', icon: '💯', unlocked: (profileUser?.gamesPlayed || 0) >= 100 },
    { id: 4, name: 'Apex Winner', description: 'Win 50 multiplayer race matches', icon: '👑', unlocked: (profileUser?.wins || 0) >= 50 }
  ];

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await updateUser(formData);

    if (result.success) {
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setProfileUser(prev => ({ ...prev, ...formData }));
    } else {
      setError(result.error || 'Failed to update profile');
    }

    setLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Active Contender';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-indigo-500/30 selection:text-white pb-24">
      {/* Specular Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-4xl h-[400px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full -z-10" />
      <div className="fixed bottom-0 right-10 w-[35vw] h-[350px] bg-purple-600/10 blur-[150px] pointer-events-none rounded-full -z-10" />

      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-slate-400 hover:text-white transition-colors group px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-indigo-400" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm font-mono flex items-center gap-2">
            <Shield size={16} className="text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-mono flex items-center gap-2">
            <Check size={16} className="text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Profile Identity Card */}
        <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-400 p-[2px] shadow-xl shadow-indigo-500/25">
                  <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center font-display font-black text-3xl text-white">
                    {profileUser?.name?.[0]?.toUpperCase() || 'R'}
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-4 border-slate-950" title="Online" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono uppercase mb-1">
                  <Sparkles size={11} className="text-indigo-400" />
                  Racer Telemetry Card
                </div>
                <h1 className="text-2xl sm:text-3xl font-black font-display text-white">{profileUser?.name}</h1>
                <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">@{profileUser?.username}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-2 justify-center sm:justify-start">
                  <Calendar size={13} className="text-slate-500" />
                  <span>Joined {formatDate(profileUser?.createdAt)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Edit2 size={14} className="text-indigo-400" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="mt-6 pt-6 border-t border-white/10 space-y-4 font-mono text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 mb-1.5 font-bold">Display Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-indigo-400/50"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-bold">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-indigo-400/50"
                  placeholder="racer@typeverse.com"
                />
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Aggregate Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 font-mono mb-8">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl text-center">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <Flame size={12} className="text-amber-400" /> Peak
            </p>
            <p className="text-2xl font-black text-amber-300">{profileUser?.highestWPM || 0}</p>
            <span className="text-[10px] text-slate-500">WPM</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl text-center">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Average</p>
            <p className="text-2xl font-black text-indigo-300">{profileUser?.averageWPM || 0}</p>
            <span className="text-[10px] text-slate-500">WPM</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl text-center">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <Target size={12} className="text-emerald-400" /> Accuracy
            </p>
            <p className="text-2xl font-black text-emerald-400">{profileUser?.accuracy || 0}%</p>
            <span className="text-[10px] text-slate-500">Lifetime</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl text-center">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">Races</p>
            <p className="text-2xl font-black text-white">{profileUser?.gamesPlayed || 0}</p>
            <span className="text-[10px] text-slate-500">Total Run</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl text-center">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <Award size={12} className="text-purple-400" /> Wins
            </p>
            <p className="text-2xl font-black text-purple-300">{profileUser?.wins || 0}</p>
            <span className="text-[10px] text-slate-500">Victories</span>
          </div>
        </div>

        {/* Achievements Card */}
        <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="text-amber-400" size={24} />
            <div>
              <h2 className="text-lg font-bold font-display text-white">Trophies & Milestones</h2>
              <p className="text-xs text-slate-400 font-mono">Unlock milestones through speed and accuracy challenges</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-mono">
            {achievements.map((ach) => (
              <div 
                key={ach.id} 
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  ach.unlocked 
                    ? 'bg-white/[0.04] border-amber-500/30 shadow-md shadow-amber-500/5' 
                    : 'bg-white/[0.01] border-white/5 opacity-50'
                }`}
              >
                <div className="text-3xl p-2 rounded-xl bg-white/[0.03] border border-white/10 shrink-0">
                  {ach.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-white">{ach.name}</p>
                    {ach.unlocked ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        UNLOCKED
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">
                        LOCKED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
