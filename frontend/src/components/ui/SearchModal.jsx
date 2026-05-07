import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { searchAPI } from '../../utils/api';
import Avatar from './Avatar';
import { AiOutlineClose, AiOutlineSearch } from 'react-icons/ai';
import { useAuth } from '../../context/AuthContext';

const SearchModal = ({ onClose }) => {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [] });
  const [loading, setLoading] = useState(false);

  const [recentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch {
      return [];
    }
  });

  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [] });
      return;
    }

    clearTimeout(debounceRef.current);
    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await searchAPI.search(query);
        setResults(data);
      } catch {
        setResults({ users: [] });
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const saveRecentSearch = (user) => {
    const updated = [user, ...recentSearches.filter(u => u._id !== user._id)].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
         onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-scaleIn"
      >

        {/* HEADER */}
        <div className="px-4 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3 bg-zinc-800 rounded-xl px-3 py-2">
            <AiOutlineSearch className="text-zinc-400" size={18} />

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder-zinc-500"
            />

            {query && (
              <button onClick={() => setQuery('')} className="text-zinc-400 hover:text-white">
                <AiOutlineClose size={16} />
              </button>
            )}
          </div>
        </div>

        {/* BODY */}
        <div className="max-h-[400px] overflow-y-auto">

          {/* LOADING */}
          {loading && (
            <div className="flex justify-center py-10">
              <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* RECENT */}
          {!query && !loading && (
            <>
              {recentSearches.length > 0 ? (
                <>
                  <div className="flex justify-between items-center px-4 py-2 text-xs text-zinc-400">
                    <span>Recent</span>
                    <button
                      onClick={() => localStorage.removeItem('recentSearches')}
                      className="hover:text-white"
                    >
                      Clear
                    </button>
                  </div>

                  {recentSearches.map(u => (
                    <UserResultItem
                      key={u._id}
                      user={u}
                      onClose={onClose}
                      onClick={() => saveRecentSearch(u)}
                    />
                  ))}
                </>
              ) : (
                <p className="text-center text-zinc-500 text-sm py-10">
                  No recent searches
                </p>
              )}
            </>
          )}

          {/* RESULTS */}
          {!loading && query && results.users?.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs text-zinc-400">Results</div>
              {results.users.map(u => (
                <UserResultItem
                  key={u._id}
                  user={u}
                  onClose={onClose}
                  onClick={() => saveRecentSearch(u)}
                />
              ))}
            </>
          )}

          {/* EMPTY */}
          {!loading && query && results.users?.length === 0 && (
            <p className="text-center text-zinc-500 text-sm py-10">
              No results for "{query}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const UserResultItem = ({ user, onClose, onClick }) => (
  <Link
    to={`/${user.username}`}
    onClick={() => {
      onClick();
      onClose();
    }}
    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition"
  >
    <Avatar src={user.avatar} username={user.username} size={40} />

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1">
        <span className="text-sm text-white font-medium truncate">
          {user.username}
        </span>

        {user.isVerified && (
          <span className="text-blue-500 text-xs">✔</span>
        )}
      </div>

      <p className="text-xs text-zinc-400 truncate">{user.fullName}</p>
      <p className="text-xs text-zinc-500">
        {user.followers?.length?.toLocaleString()} followers
      </p>
    </div>
  </Link>
);

export default SearchModal;