import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import Navbar from '../components/Navbar';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await signup({
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password
    });

    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 pb-8">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-md p-5 sm:p-8 shadow-lg">
          <Link to="/" className="block text-center text-2xl sm:text-3xl font-bold text-indigo-500 mb-2">
            TYPEVERSE
          </Link>
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">Create Account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-md text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-md focus:outline-none focus:border-indigo-400/50 text-white placeholder:text-slate-400"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-md focus:outline-none focus:border-indigo-400/50 text-white placeholder:text-slate-400"
                placeholder="Choose a username"
                required
                minLength={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-md focus:outline-none focus:border-indigo-400/50 text-white placeholder:text-slate-400"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-md focus:outline-none focus:border-indigo-400/50 text-white placeholder:text-slate-400"
                placeholder="Create a password"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-md focus:outline-none focus:border-indigo-400/50 text-white placeholder:text-slate-400"
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="my-6 text-center text-slate-400">
            <span>or</span>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setLoading(true);
                const result = await loginWithGoogle(credentialResponse.credential);
                setLoading(false);
                if (result.success) {
                  navigate('/dashboard');
                } else {
                  setError(result.error);
                }
              }}
              onError={() => {
                console.error('Signup Failed');
                setError('Google signup failed');
              }}
              useOneTap
            />
          </div>

          <p className="mt-6 text-center text-slate-400 text-sm sm:text-base">
            Already have account?{' '}
            <Link to="/login" className="text-indigo-500 hover:text-indigo-400">
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
