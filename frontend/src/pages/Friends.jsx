import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Search, UserPlus, Users, Trash2, ArrowLeft } from 'lucide-react';
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

  // Load initial data
  useEffect(() => {
    const loadFriendsData = async () => {
      try {
        setLoading(true);
        
        // Fetch pending requests
        const requestsResponse = await friendService.getPendingRequests();
        if (requestsResponse.success) {
          setPendingRequests(requestsResponse.data);
        }

        // Fetch friends list
        const friendsResponse = await friendService.getFriends();
        if (friendsResponse.success) {
          setFriendsList(friendsResponse.data);
        }

        // Fetch suggestions
        const suggestionsResponse = await friendService.getFriendSuggestions();
        if (suggestionsResponse.success) {
          setSuggestions(suggestionsResponse.data);
        }
      } catch (error) {
        console.error('Failed to load friends data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFriendsData();
  }, []);

  // Search users
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
          setSearchResults(response.data);
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

  // Send friend request
  const handleSendRequest = async (userId) => {
    try {
      const response = await friendService.sendFriendRequest(userId);
      if (response.success) {
        alert('Friend request sent!');
        setSearchResults(prev => prev.filter(u => u._id !== userId));
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send friend request');
    }
  };

  // Accept request
  const handleAccept = async (requestId) => {
    try {
      const response = await friendService.acceptFriendRequest(requestId);
      if (response.success) {
        setPendingRequests(prev => prev.filter(r => r._id !== requestId));
        // Refresh friends list
        const friendsResponse = await friendService.getFriends();
        if (friendsResponse.success) {
          setFriendsList(friendsResponse.data);
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to accept request');
    }
  };

  // Reject request
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

  // Remove friend
  const handleRemove = async (friendId) => {
    if (confirm('Remove this friend?')) {
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
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <Link to="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white transition mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold mb-12">Friends</h1>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Search Box */}
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by username..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-3 border-t border-slate-700 pt-4">
                <p className="text-sm text-slate-400 mb-3">Search Results ({searchResults.length})</p>
                {searchResults.map((foundUser) => (
                  <div key={foundUser._id} className="flex items-center justify-between bg-slate-700 rounded-lg p-4">
                    <div>
                      <p className="font-semibold">{foundUser.username}</p>
                      <p className="text-sm text-slate-400">WPM: {foundUser.averageWPM || 0}</p>
                    </div>
                    <button
                      onClick={() => handleSendRequest(foundUser._id)}
                      className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2"
                    >
                      <UserPlus size={16} />
                      <span>Add</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-6 border border-yellow-500/20">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="text-2xl mr-2">📬</span>
                Pending Requests ({pendingRequests.length})
              </h2>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between bg-slate-700 rounded-lg p-4">
                    <div>
                      <p className="font-semibold">{request.from?.username}</p>
                      <p className="text-sm text-slate-400">Wants to be your friend</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAccept(request._id)}
                        className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(request._id)}
                        className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Users className="text-indigo-500" size={24} />
              <h2 className="text-xl font-bold">Friends List</h2>
              <span className="text-sm text-slate-400">({friendsList.length})</span>
            </div>
            {friendsList.length > 0 ? (
              <div className="space-y-3">
                {friendsList.map((friend) => (
                  <div key={friend._id} className="flex items-center justify-between bg-slate-700 rounded-lg p-4 hover:bg-slate-600/50 transition">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div>
                        <p className="font-semibold">{friend.username}</p>
                        <p className="text-sm text-slate-400">
                          Best: {friend.highestWPM || 0} WPM • Avg: {friend.averageWPM || 0} WPM
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(friend._id)}
                      className="px-4 py-2 bg-slate-600 rounded-lg hover:bg-red-600 transition flex items-center space-x-2"
                    >
                      <Trash2 size={16} />
                      <span>Remove</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p className="text-2xl mb-2">👥</p>
                <p>No friends yet. Add someone using the search above!</p>
              </div>
            )}
          </div>

          {/* Friend Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-6 border border-indigo-500/20">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="text-2xl mr-2">⭐</span>
                Friend Suggestions
              </h2>
              <p className="text-sm text-slate-400 mb-4">Users with similar typing speed</p>
              <div className="space-y-3">
                {suggestions.map((suggestion) => (
                  <div key={suggestion._id} className="flex items-center justify-between bg-slate-700 rounded-lg p-4">
                    <div>
                      <p className="font-semibold">{suggestion.username}</p>
                      <p className="text-sm text-slate-400">
                        {suggestion.averageWPM} WPM • {suggestion.gamesPlayed} games
                      </p>
                    </div>
                    <button
                      onClick={() => handleSendRequest(suggestion._id)}
                      className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2"
                    >
                      <UserPlus size={16} />
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
