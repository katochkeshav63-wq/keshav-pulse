import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0f0f] via-[#121212] to-black text-white px-4">
    
    <div className="w-full max-w-md text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
      
      {/* Logo */}
      <div className="mb-6 flex justify-center">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg">
          <span className="text-xl font-bold">⚡</span>
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-semibold mb-2 tracking-tight">
        Page not found
      </h1>

      <p className="text-sm text-gray-400 mb-6 leading-relaxed">
        The page you're looking for doesn’t exist or has been moved.
      </p>

      {/* Action */}
      <Link
        to="/"
        className="inline-block px-6 py-2 rounded-full text-sm font-semibold 
        bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 
        hover:opacity-90 transition-all duration-300 shadow-md"
      >
        Back to Home
      </Link>

      {/* Footer note */}
      <p className="text-xs text-gray-500 mt-6">
        Error 404 • Lost in space 🚀
      </p>
    </div>

  </div>
);

export default NotFound;