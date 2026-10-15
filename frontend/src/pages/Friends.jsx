import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Search, UserPlus, Users, Trash2, ArrowLeft, Mail, Sparkles, Check, X, Shield, Activity } from 'lucide-react';
import { friendService } from '../services/friendService';
import { useAuth } from '../context/AuthContext';

export default function Friends() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const loadFriendsData = async () => {
      try {
        setLoading(true);
        const [requestsRes, friendsRes, suggestionsRes] = await Promise.all([
          friendService.getPendingRequests().catch(() => ({ success: false })),
          friendService.getFriends().catch(() => ({ success: false })),
          friendService.getFriendSuggestions().catch(() => ({ success: false }))
        ]);

        if (requestsRes.success) setPendingRequests(requestsRes.data || []);
        if (friendsRes.success) setFriendsList(friendsRes.data || []);
        if (suggestionsRes.success) setSuggestions(suggestionsRes.data || []);
      } catch (error) {
        console.error('Failed to load friends data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFriendsData();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setSearching(true);
        const response = await friendService.searchUsers(searchQuery);
        if (response.success) {
          setSearchResults(response.data || []);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSendRequest = async (userId) => {
    try {
      const response = await friendService.sendFriendRequest(userId);
      if (response.success) {
        setSearchResults(prev => prev.filter(u => u._id !== userId));
        setSuggestions(prev => prev.filter(u => u._id !== userId));
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send friend request');
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const response = await friendService.acceptFriendRequest(requestId);
      if (response.success) {
        setPendingRequests(prev => prev.filter(r => r._id !== requestId));
        const friendsResponse = await friendService.getFriends();
        if (friendsResponse.success) {
          setFriendsList(friendsResponse.data || []);
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await friendService.rejectFriendRequest(requestId);
      if (response.success) {
        setPendingRequests(prev => prev.filter(r => r._id !== requestId));
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleRemove = async (friendId) => {
    if (confirm('Remove this friend from your circle?')) {
      try {
        const response = await friendService.removeFriend(friendId);
        if (response.success) {
          setFriendsList(prev => prev.filter(f => f._id !== friendId));
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to remove friend');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-indigo-500/30 selection:text-white pb-24">
      {/* Radiant Specular Glows */}
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

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono uppercase tracking-wider mb-4 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <Users size={13} className="text-indigo-400" />
            <span>Social Circle & Matchmaking</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-3">
            Racer <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">Friends</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-400 font-mono max-w-xl mx-auto leading-relaxed">
            Search racers across global servers, issue private scrim challenges, and track friend velocity leaderboards.
          </p>
        </div>

        <div className="space-y-6">
          {/* User Search Card */}
          <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search racers by username..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 font-mono text-sm focus:outline-none focus:border-indigo-400/50 focus:bg-white/[0.07] transition-all"
              />
            </div>

            {/* Live Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2 font-mono">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Search Matches ({searchResults.length})</p>
                {searchResults.map((foundUser) => (
                  <div key={foundUser._id} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center font-display font-bold text-indigo-300">
                        {foundUser.username?.[0]?.toUpperCase() || 'R'}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{foundUser.username}</div>
                        <div className="text-xs text-slate-400">Avg Speed: {foundUser.averageWPM || 0} WPM</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendRequest(foundUser._id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus size={14} />
                      <span>Send Request</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Friend Requests */}
          {pendingRequests.length > 0 && (
            <div className="rounded-3xl bg-slate-900/40 border border-amber-500/30 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_20px_50px_rgba(245,158,11,0.1)]">
              <h2 className="text-base font-bold font-display text-white mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span>Incoming Invitations ({pendingRequests.length})</span>
              </h2>

              <div className="space-y-3 font-mono">
                {pendingRequests.map((req) => (
                  <div key={req._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-300 font-display">
                        {req.from?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{req.from?.username || 'Unknown Racer'}</p>
                        <p className="text-xs text-slate-400">Sent you a friend connection request</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAccept(req._id)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check size={14} />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(req._id)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 border border-white/10 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <X size={14} />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connected Friends List */}
          <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Users className="text-indigo-400" size={20} />
                <h2 className="text-lg font-bold font-display text-white">Friends Circle</h2>
                <span className="font-mono text-xs text-slate-400">({friendsList.length})</span>
              </div>
            </div>

            {friendsList.length > 0 ? (
              <div className="space-y-3 font-mono">
                {friendsList.map((friend) => (
                  <div 
                    key={friend._id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center font-display font-bold text-white">
                          {friend.username?.[0]?.toUpperCase() || 'F'}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{friend.username}</div>
                        <div className="text-xs text-slate-400">
                          Peak: <strong className="text-amber-300">{friend.highestWPM || 0} WPM</strong> · Avg: {friend.averageWPM || 0} WPM
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(friend._id)}
                      className="px-3.5 py-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-xs flex items-center gap-1.5 cursor-pointer self-end sm:self-auto"
                      title="Remove from friends"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-3 text-slate-500">
                  <Users size={24} />
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Your circle is waiting</h4>
                <p className="text-xs font-mono max-w-sm mx-auto">
                  Search racers above or send invites from matches to populate your circle.
                </p>
              </div>
            )}
          </div>

          {/* Friend Suggestions */}
          {suggestions.length > 0 && (
            <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
              <div className="mb-4">
                <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-400" />
                  <span>Velocity Match Suggestions</span>
                </h2>
                <p className="text-xs text-slate-400 font-mono">Typists with similar burst speed metrics</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                {suggestions.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div>
                      <p className="font-bold text-sm text-white">{item.username}</p>
                      <p className="text-xs text-slate-400">{item.averageWPM || 0} WPM · {item.gamesPlayed || 0} races</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendRequest(item._id)}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-indigo-500/20 hover:border-indigo-500/30 border border-white/10 text-white font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus size={13} className="text-indigo-400" />
                      <span>Add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
