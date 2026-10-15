import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Keyboard, ArrowRight, ShieldCheck, Mail, Lock, User, AtSign, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const navigate = useNavigate();
  const { authModal, closeAuthModal, setAuthModal, login, signup, loginWithGoogle } = useAuth();
  
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    remember: false
  });

  const [signupForm, setSignupForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Sync mode with authModal prop
  useEffect(() => {
    if (authModal?.isOpen) {
      setActiveTab(authModal.mode || 'login');
      setError('');
    }
  }, [authModal?.isOpen, authModal?.mode]);

  // Robust close handler that closes state and strips any ?auth= url params
  const handleClose = () => {
    closeAuthModal();
    if (typeof window !== 'undefined' && window.location.search.includes('auth=')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + url.hash);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && authModal?.isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authModal?.isOpen]);

  if (!authModal?.isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login({
      email: loginForm.email,
      password: loginForm.password
    });

    setLoading(false);

    if (result.success) {
      handleClose();
      navigate('/dashboard');
    } else {
      setError(result.error || 'Invalid credentials');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await signup({
      name: signupForm.name,
      username: signupForm.username,
      email: signupForm.email,
      password: signupForm.password
    });

    setLoading(false);

    if (result.success) {
      handleClose();
      navigate('/dashboard');
    } else {
      setError(result.error || 'Signup failed');
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setAuthModal((prev) => ({ ...prev, mode: tab }));
  };

  return (
    <div 
      className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Container - Ultra-sleek frosted glassmorphic card */}
      <div className="relative w-full max-w-md my-auto mx-auto max-h-[92vh] flex flex-col bg-slate-900/40 border border-white/15 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Specular Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

        {/* Close Button - Cross always accessible with high z-index & reliable handler */}
        <button
          type="button"
          id="authmodal-close-button"
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 transition-all focus:outline-none cursor-pointer z-30 shadow-sm"
          aria-label="Close authentication modal"
        >
          <X size={18} />
        </button>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto pr-1 -mr-1 custom-scrollbar flex-1 max-h-[calc(92vh-2.5rem)]">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-md p-[1.5px] shadow-lg shadow-indigo-500/20 mb-2.5 flex items-center justify-center text-white">
              <Keyboard size={20} className="text-indigo-400" />
            </div>
            <span className="text-xl font-black font-display tracking-wider bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
              TYPE<span className="text-indigo-400">VERSE</span>
            </span>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {activeTab === 'login' ? 'Sign in to access global arenas & telemetry' : 'Create your racer profile in seconds'}
            </p>
          </div>

          {/* Mode Switcher Tabs - Frosted glass pill style */}
          <div className="grid grid-cols-2 p-1 bg-white/[0.04] border border-white/10 rounded-2xl mb-5 text-xs font-semibold backdrop-blur-md">
            <button
              type="button"
              id="authmodal-tab-login"
              onClick={() => switchTab('login')}
              className={`py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white/15 text-white border border-white/20 shadow-[0_2px_12px_rgba(255,255,255,0.08)] backdrop-blur-md font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              id="authmodal-tab-signup"
              onClick={() => switchTab('signup')}
              className={`py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-white/15 text-white border border-white/20 shadow-[0_2px_12px_rgba(255,255,255,0.08)] backdrop-blur-md font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={15} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:border-indigo-400/50 focus:bg-white/[0.07] text-white placeholder:text-slate-500 text-xs sm:text-sm transition-all backdrop-blur-sm"
                    placeholder="racer@typeverse.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:border-indigo-400/50 focus:bg-white/[0.07] text-white placeholder:text-slate-500 text-xs sm:text-sm transition-all backdrop-blur-sm"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={loginForm.remember}
                    onChange={(e) => setLoginForm({ ...loginForm, remember: e.target.checked })}
                    className="rounded bg-white/10 border-white/20 text-indigo-500 focus:ring-0"
                  />
                  <span>Remember me</span>
                </label>
                <span className="text-slate-500 text-[11px]">Secure session</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 hover:from-indigo-500/35 hover:via-purple-500/35 hover:to-cyan-500/35 text-white border border-white/20 hover:border-white/35 font-semibold text-xs sm:text-sm shadow-[0_4px_25px_rgba(99,102,241,0.2)] backdrop-blur-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In to Arena'}
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:border-indigo-400/50 focus:bg-white/[0.07] text-white placeholder:text-slate-500 text-xs sm:text-sm transition-all"
                      placeholder="Alex Chen"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">Username</label>
                  <div className="relative">
                    <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      value={signupForm.username}
                      onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:border-indigo-400/50 focus:bg-white/[0.07] text-white placeholder:text-slate-500 text-xs sm:text-sm transition-all"
                      placeholder="speed_demon"
                      required
                      minLength={3}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:border-indigo-400/50 focus:bg-white/[0.07] text-white placeholder:text-slate-500 text-xs sm:text-sm transition-all"
                    placeholder="racer@typeverse.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type="password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:border-indigo-400/50 focus:bg-white/[0.07] text-white placeholder:text-slate-500 text-xs sm:text-sm transition-all"
                      placeholder="6+ chars"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">Confirm</label>
                  <div className="relative">
                    <ShieldCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type="password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:border-indigo-400/50 focus:bg-white/[0.07] text-white placeholder:text-slate-500 text-xs sm:text-sm transition-all"
                      placeholder="Repeat"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 hover:from-indigo-500/35 hover:via-purple-500/35 hover:to-cyan-500/35 text-white border border-white/20 hover:border-white/35 font-semibold text-xs sm:text-sm shadow-[0_4px_25px_rgba(99,102,241,0.2)] backdrop-blur-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Creating Account...' : 'Create Account & Race'}
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative px-3 py-0.5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              or continue with
            </span>
          </div>

          {/* Google OAuth Login Container */}
          <div className="flex justify-center w-full mb-3">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setLoading(true);
                const result = await loginWithGoogle(credentialResponse.credential);
                setLoading(false);
                if (result.success) {
                  handleClose();
                  navigate('/dashboard');
                } else {
                  setError(result.error || 'Google login failed');
                }
              }}
              onError={() => {
                setError('Google authentication failed');
              }}
              useOneTap={false}
              theme="filled_black"
              shape="pill"
              size="medium"
            />
          </div>

          {/* Switcher Footer */}
          <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5 font-mono">
            {activeTab === 'login' ? (
              <p>
                New to TypeVerse?{' '}
                <button
                  type="button"
                  id="authmodal-switch-to-signup"
                  onClick={() => switchTab('signup')}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 ml-1 cursor-pointer py-1"
                >
                  Create Account
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  id="authmodal-switch-to-login"
                  onClick={() => switchTab('login')}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 ml-1 cursor-pointer py-1"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
