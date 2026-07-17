import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import PracticeGame from './pages/PracticeGame';
import Multiplayer from './pages/Multiplayer';
import WaitingRoom from './pages/WaitingRoom';
import MultiplayerGame from './pages/MultiplayerGame';
import Leaderboard from './pages/Leaderboard';
import History from './pages/History';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import Settings from './pages/Settings';
import About from './pages/About';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationContainer from './components/NotificationContainer';

function App() {
  return (
    <Router>
      <NotificationContainer />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
        <Route path="/practice/game" element={<ProtectedRoute><PracticeGame /></ProtectedRoute>} />
        <Route path="/multiplayer" element={<ProtectedRoute><Multiplayer /></ProtectedRoute>} />
        <Route path="/multiplayer/waiting" element={<ProtectedRoute><WaitingRoom /></ProtectedRoute>} />
        <Route path="/multiplayer/game" element={<ProtectedRoute><MultiplayerGame /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
