import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const authLinkClass =
  'px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-md font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-300 whitespace-nowrap';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white/5 backdrop-blur-md border-b border-white/10">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 w-full min-w-0">
          <div className="flex items-center gap-2 sm:gap-8 min-w-0">
            <Link to="/" className="text-lg sm:text-2xl font-bold text-indigo-500 whitespace-nowrap shrink-0">
              TYPEVERSE
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-slate-300 hover:text-white transition-colors">
                Home
              </Link>
              {isAuthenticated && (
                <Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              )}
              <Link to="/leaderboard" className="text-slate-300 hover:text-white transition-colors">
                Leaderboard
              </Link>
              <Link to="/about" className="text-slate-300 hover:text-white transition-colors">
                About
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <Link to="/profile" className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                  <User size={20} />
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={authLinkClass}>
                  Login
                </Link>
                <Link to="/signup" className={authLinkClass}>
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
