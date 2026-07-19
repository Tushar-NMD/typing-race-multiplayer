import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import PracticeGame from './pages/PracticeGame';
import AIPracticeSetup from './pages/AIPracticeSetup';
import AIGame from './pages/AIGame';
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

const GlobalBackground = () => (
  <>
    <div className="global-bg fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/20 blur-[150px] mix-blend-screen animate-[pulse_10s_ease-in-out_infinite_reverse]"></div>
      <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-blue-600/20 blur-[100px] mix-blend-screen animate-[pulse_6s_ease-in-out_infinite]"></div>
    </div>
    <div className="fixed inset-0 opacity-20 mix-blend-overlay pointer-events-none -z-10"></div>
    <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
  </>
);

function App() {
  return (
    <Router>
      <div className="font-sans selection:bg-indigo-500/30 text-slate-200 min-h-screen">
        <GlobalBackground />
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
          <Route path="/ai-practice" element={<ProtectedRoute><AIPracticeSetup /></ProtectedRoute>} />
          <Route path="/ai-practice/game" element={<ProtectedRoute><AIGame /></ProtectedRoute>} />
          <Route path="/multiplayer" element={<ProtectedRoute><Multiplayer /></ProtectedRoute>} />
          <Route path="/multiplayer/waiting" element={<ProtectedRoute><WaitingRoom /></ProtectedRoute>} />
          <Route path="/multiplayer/game" element={<ProtectedRoute><MultiplayerGame /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
