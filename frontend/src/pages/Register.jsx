import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AiOutlineInstagram } from 'react-icons/ai'

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    fullName: '',
    username: '',
    password: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    if (form.username.length < 3) {
      return setError('Username must be at least 3 characters')
    }

    setLoading(true)

    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed'
      )
    } finally {
      setLoading(false)
    }
  }

  const isValid =
    form.email &&
    form.fullName &&
    form.username &&
    form.password.length >= 6

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl">

          {/* LOGO */}
          <div className="flex flex-col items-center mb-8">

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center shadow-lg">
              <AiOutlineInstagram className="text-white text-4xl" />
            </div>

            <h1 className="text-white text-3xl font-bold mt-4">
              Create Account
            </h1>

            <p className="text-gray-400 text-sm mt-2 text-center">
              Join the community and start sharing moments.
            </p>

          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-5 text-center">
              {error}
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 focus:border-pink-500 text-white rounded-xl px-4 py-3 outline-none transition"
            />

            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 focus:border-pink-500 text-white rounded-xl px-4 py-3 outline-none transition"
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={30}
              className="w-full bg-white/5 border border-white/10 focus:border-pink-500 text-white rounded-xl px-4 py-3 outline-none transition"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full bg-white/5 border border-white/10 focus:border-pink-500 text-white rounded-xl px-4 py-3 outline-none transition"
            />

            <button
              type="submit"
              disabled={loading || !isValid}
              className="w-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

          </form>

          {/* LOGIN */}
          <div className="mt-8 text-center">

            <p className="text-gray-400 text-sm">
              Already have an account?
            </p>

            <Link
              to="/login"
              className="inline-block mt-2 text-pink-400 hover:text-pink-300 font-semibold transition"
            >
              Log In
            </Link>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Register