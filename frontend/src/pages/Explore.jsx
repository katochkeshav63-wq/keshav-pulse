import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { postAPI, searchAPI } from '../utils/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { AiOutlineHeart, AiOutlineSearch, AiOutlineClose } from 'react-icons/ai';
import { RiVideoLine } from 'react-icons/ri';

const ExploreGrid = ({ posts }) => {
  if (posts.length === 0) return null;

  // Mosaic layout: every 5th group has a large featured post
  const rows = [];
  let i = 0;
  while (i < posts.length) {
    const isEvenGroup = Math.floor(i / 5) % 2 === 0;
    const group = posts.slice(i, i + 5);
    rows.push({ posts: group, isEvenGroup });
    i += 5;
  }

  return (
    <div className="space-y-0.5">
      {rows.map((row, ri) => (
        <div key={ri} className="grid gap-0.5" style={{ gridTemplateColumns: row.isEvenGroup ? '2fr 1fr 1fr' : '1fr 1fr 2fr', gridTemplateRows: 'auto' }}>
          {row.posts.map((post, pi) => {
            const isFeatured = (row.isEvenGroup && pi === 0) || (!row.isEvenGroup && pi === 2);
            return (
              <PostTile
                key={post._id}
                post={post}
                featured={isFeatured && row.posts.length >= 3}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

const PostTile = ({ post, featured }) => (
  <Link
    to={`/p/${post._id}`}
    className="relative bg-gray-100 overflow-hidden group block"
    style={{ gridRow: featured ? 'span 2' : 'span 1', aspectRatio: featured ? undefined : '1/1', height: featured ? undefined : undefined }}
  >
    <div className={`w-full ${featured ? 'aspect-square' : 'aspect-square'} bg-gray-100`}>
      {post.media?.[0]?.type === 'video' ? (
        <video src={post.media[0].url} className="w-full h-full object-cover" />
      ) : (
        <img
          src={post.media?.[0]?.url}
          alt={post.caption}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      )}
    </div>
    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
      <div className="hidden group-hover:flex items-center gap-4 text-white font-bold text-sm drop-shadow">
        <span className="flex items-center gap-1">❤️ {post.likes?.length || 0}</span>
        <span className="flex items-center gap-1">💬 {post.comments?.length || 0}</span>
      </div>
    </div>
    {post.media?.length > 1 && (
      <div className="absolute top-2 right-2 text-white drop-shadow">
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M2 6a2 2 0 0 1 2-2h4a1 1 0 1 1 0 2H4v12h12v-4a1 1 0 1 1 2 0v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6zm15-4a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3h-3a1 1 0 1 1 0-2h3V3a1 1 0 0 1 1-1z" /></svg>
      </div>
    )}
    {post.media?.[0]?.type === 'video' && (
      <div className="absolute top-2 right-2 text-white drop-shadow">
        <RiVideoLine size={16} />
      </div>
    )}
  </Link>
);

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const loadMoreRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      const { data } = await postAPI.getExplore(pageNum);
      setPosts(prev => append ? [...prev, ...data.posts] : data.posts);
      setHasMore(data.posts.length === 12);
    } catch {}
    finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        setLoadingMore(true);
        const next = page + 1;
        setPage(next);
        fetchPosts(next, true);
      }
    }, { threshold: 0.5 });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, fetchPosts]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await searchAPI.search(searchQuery);
        setSearchResults(data);
      } catch {}
      finally { setSearchLoading(false); }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  return (
    <div className="max-w-[935px] mx-auto pb-20 md:pb-0">
      {/* Search bar */}
      <div className="sticky top-0 bg-white z-10 px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="relative max-w-xs">
          <AiOutlineSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-9 pr-8 py-2 bg-gray-100 rounded-lg text-sm outline-none placeholder-gray-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <AiOutlineClose size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="px-4 py-2">
          {searchLoading ? (
            <LoadingSpinner />
          ) : searchResults ? (
            <div>
              {searchResults.users?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">Accounts</p>
                  {searchResults.users.map(u => (
                    <Link key={u._id} to={`/${u.username}`} className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2">
                      <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        {u.avatar && <img src={u.avatar} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{u.username}</p>
                        <p className="text-xs text-gray-500">{u.fullName}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {!searchResults.users?.length && <p className="text-center text-gray-500 text-sm py-8">No results for "{searchQuery}"</p>}
            </div>
          ) : null}
        </div>
      )}

      {/* Explore Grid */}
      {!searchQuery && (
        <>
          {loading ? <LoadingSpinner /> : <ExploreGrid posts={posts} />}
          <div ref={loadMoreRef} className="h-4" />
          {loadingMore && <LoadingSpinner />}
        </>
      )}
    </div>
  );
};

export default Explore;