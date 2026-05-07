import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailOrUsername: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="min-h-screen bg-gradient-to-br from-[#0f0f14] via-[#12121a] to-[#1a1a24] flex items-center justify-center px-4 text-gray-200">
    <div className="w-full max-w-[380px]">

      {/* Login Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-10 shadow-2xl">

        {/* App Name (replace logo) */}
        <h1 className="text-2xl font-bold text-center mb-8 tracking-wide">
          YourApp ✨
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm px-3 py-2 mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Input */}
          <input
            name="emailOrUsername"
            type="text"
            placeholder="Email or Username"
            value={form.emailOrUsername}
            onChange={handleChange}
            required
            autoComplete="username"
            className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-white/10 focus:border-purple-500 outline-none text-sm placeholder-gray-500 transition"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-white/10 focus:border-purple-500 outline-none text-sm placeholder-gray-500 transition"
          />

          <button
            type="submit"
            disabled={loading || !form.emailOrUsername || !form.password}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-white/10" />
          <span className="mx-3 text-xs text-gray-500">OR</span>
          <div className="flex-1 border-t border-white/10" />
        </div>

        {/* Social Login */}
        <button className="w-full flex items-center justify-center gap-2 text-sm bg-[#1a1a24] border border-white/10 rounded-lg py-2 hover:bg-[#22222c] transition">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Continue with Facebook
        </button>

        {/* Forgot */}
        <div className="text-center mt-5">
          <a href="#" className="text-xs text-gray-400 hover:text-white transition">
            Forgot password?
          </a>
        </div>
      </div>

      {/* Register */}
      <div className="mt-4 text-center text-sm text-gray-400">
        Don’t have an account?{' '}
        <Link to="/register" className="text-purple-400 font-semibold hover:underline">
          Create one
        </Link>
      </div>

      {/* Optional footer */}
      <div className="text-center mt-6 text-xs text-gray-600">
        Built with a different vibe ⚡
      </div>
    </div>
  </div>
);
};

export default Login;
