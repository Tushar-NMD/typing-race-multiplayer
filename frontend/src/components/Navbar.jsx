import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Menu, X, Keyboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout, isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    ...(isAuthenticated ? [{ name: 'Dashboard', path: '/dashboard' }] : []),
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-2 sm:px-6 pt-2 sm:pt-4 pointer-events-none transition-all duration-300">
      {/* Radiant ambient glow overflowing behind and beneath the navbar */}
      <div 
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl h-24 bg-gradient-to-r from-indigo-500/25 via-purple-500/30 to-cyan-500/25 blur-3xl pointer-events-none -z-10 opacity-70 animate-pulse" 
        style={{ animationDuration: '6s' }}
        aria-hidden="true"
      />
      <div 
        className="absolute top-8 left-1/2 -translate-x-1/2 w-[80%] max-w-4xl h-12 bg-indigo-600/20 blur-2xl pointer-events-none -z-10"
        aria-hidden="true" 
      />

      {/* Floating Island Navigation Container */}
      <nav 
        ref={menuRef}
        className={`pointer-events-auto max-w-7xl mx-auto rounded-2xl border transition-all duration-300 relative ${
          scrolled 
            ? 'bg-slate-950/85 backdrop-blur-2xl border-white/15 shadow-[0_12px_45px_rgba(0,0,0,0.65)] py-2 sm:py-2.5' 
            : 'bg-slate-900/70 backdrop-blur-xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.45)] py-2 sm:py-3'
        }`}
      >
        {/* Subtle top edge specular highlight line */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent pointer-events-none" />

        <div className="px-3 sm:px-6 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-6 min-w-0">
            <Link 
              to="/" 
              className="flex items-center gap-2 group whitespace-nowrap focus:outline-none"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-white">
                  <Keyboard size={16} className="text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <span className="text-base sm:text-xl font-black font-display tracking-wider bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent group-hover:brightness-110 transition-all">
                TYPE<span className="text-indigo-400">VERSE</span>
              </span>
            </Link>

            {/* Desktop Navigation Links - No active bg, no underline */}
            <div className="hidden md:flex items-center gap-5 ml-3">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm transition-colors duration-150 ${
                      active
                        ? 'text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Action CTAs & Auth Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <NotificationBell />
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2 py-1.5 text-slate-300 hover:text-white rounded-lg transition-colors text-xs sm:text-sm font-medium"
                  title="Profile"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {user?.username ? user.username.charAt(0).toUpperCase() : <User size={13} />}
                  </div>
                  <span className="hidden sm:inline font-medium text-slate-200 max-w-[90px] truncate">
                    {user?.username || 'Profile'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Sign In - Opens Login Popup Modal */}
                <button
                  id="navbar-signin-btn"
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="hidden sm:inline-block px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-300 hover:text-white transition-colors font-medium whitespace-nowrap cursor-pointer"
                >
                  Sign In
                </button>
                {/* Get Started - Glass background that opens Signup Popup Modal */}
                <button
                  id="navbar-getstarted-btn"
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 text-xs sm:text-sm text-white font-medium bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-cyan-500/20 hover:from-indigo-500/30 hover:via-purple-500/25 hover:to-cyan-500/30 border border-white/15 hover:border-indigo-400/40 backdrop-blur-md rounded-xl shadow-[0_2px_12px_rgba(99,102,241,0.18)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.3)] transition-all duration-300 whitespace-nowrap cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 pt-3 pb-3 px-4 border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl rounded-b-2xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-1.5 text-sm transition-colors ${
                  isActive(link.path)
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {!isAuthenticated && (
              <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="flex-1 text-center py-2 text-xs text-slate-300 hover:text-white border border-white/10 rounded-xl font-medium cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('signup');
                  }}
                  className="flex-1 text-center py-2 text-xs text-white font-medium bg-gradient-to-r from-indigo-500/25 via-purple-500/20 to-cyan-500/25 border border-white/15 hover:border-indigo-400/40 backdrop-blur-md rounded-xl shadow-[0_2px_8px_rgba(99,102,241,0.2)] transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            )}

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Websocket Engine Online
              </span>
              <span className="text-slate-500 font-mono">v2.5.0</span>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
