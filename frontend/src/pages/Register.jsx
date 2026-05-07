import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', fullName: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isValid = form.email && form.fullName && form.username && form.password.length >= 6;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[350px]">
        <div className="bg-white border border-gray-300 rounded px-10 py-8 mb-3">
          {/* Logo */}
          <div className="text-center mb-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/200px-Instagram_logo.svg.png"
              alt="Instagram"
              className="h-12 mx-auto object-contain"
            />
          </div>

          <p className="text-gray-500 text-center font-semibold text-base leading-5 mb-5">
            Sign up to see photos and videos from your friends.
          </p>

          <button className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-4 rounded-lg text-sm mb-4 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Log in with Facebook
          </button>

          <div className="flex items-center mb-4">
            <div className="flex-1 border-t border-gray-300" />
            <span className="mx-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">or</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded text-red-600 text-xs px-3 py-2 mb-3 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              name="email"
              type="email"
              placeholder="Mobile number or email"
              value={form.email}
              onChange={handleChange}
              required
              className="input-field text-xs"
            />
            <input
              name="fullName"
              type="text"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
              className="input-field text-xs"
            />
            <input
              name="username"
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={30}
              className="input-field text-xs"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="input-field text-xs"
            />

            <button
              type="submit"
              disabled={loading || !isValid}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-1.5 px-4 rounded-lg text-sm transition-colors mt-2"
            >
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>

          <p className="text-gray-400 text-xs text-center mt-4 leading-4">
            By signing up, you agree to our{' '}
            <a href="#" className="font-semibold">Terms</a>,{' '}
            <a href="#" className="font-semibold">Privacy Policy</a> and{' '}
            <a href="#" className="font-semibold">Cookies Policy</a>.
          </p>
        </div>

        <div className="bg-white border border-gray-300 rounded px-10 py-4 text-center text-sm">
          Have an account?{' '}
          <Link to="/login" className="text-blue-500 font-semibold hover:text-blue-700">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
