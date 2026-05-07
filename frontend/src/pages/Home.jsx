import React, { useState, useEffect, useCallback, useRef } from 'react';
import { postAPI, userAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/post/PostCard';
import StoriesBar from '../components/story/StoriesBar';
import Avatar from '../components/ui/Avatar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';

const homeStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .home-wrap {
    min-height: 100vh;
    background: #0a0a0f;
    color: #e8e6f0;
    font-family: 'DM Sans', sans-serif;
  }

  .home-inner {
    display: flex;
    justify-content: center;
    gap: 36px;
    padding: 24px 16px 80px;
    max-width: 1080px;
    margin: 0 auto;
  }

  /* ── FEED ── */
  .home-feed {
    width: 100%;
    max-width: 510px;
    flex-shrink: 0;
  }

  .home-stories-wrap {
    margin-bottom: 8px;
  }

  /* EMPTY STATE */
  .home-empty {
    text-align: center;
    padding: 64px 24px;
    background: #131320;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
  }

  .home-empty-icon {
    width: 72px; height: 72px;
    margin: 0 auto 20px;
    border-radius: 20px;
    background: rgba(124,92,252,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
  }

  .home-empty h3 {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #e8e6f0;
    margin-bottom: 8px;
  }

  .home-empty p {
    font-size: 13.5px;
    color: #5a5670;
    margin-bottom: 24px;
  }

  .home-empty-btn {
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    padding: 11px 28px;
    border-radius: 50px;
    transition: opacity 0.2s, transform 0.15s;
  }
  .home-empty-btn:hover { opacity: 0.88; transform: translateY(-1px); }

  /* END OF FEED */
  .home-end {
    text-align: center;
    padding: 32px 0;
    font-size: 13px;
    color: #3e3a54;
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
  }
  .home-end::before, .home-end::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.05);
    max-width: 80px;
  }

  /* ── SIDEBAR ── */
  .home-sidebar {
    display: none;
    width: 300px;
    flex-shrink: 0;
    padding-top: 4px;
  }

  @media (min-width: 1024px) {
    .home-sidebar { display: block; }
  }

  /* PROFILE CARD */
  .home-profile-card {
    background: #131320;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 18px;
    margin-bottom: 16px;
  }

  .home-profile-row {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: inherit;
  }

  .home-profile-name {
    font-size: 14px;
    font-weight: 600;
    color: #e8e6f0;
  }

  .home-profile-sub {
    font-size: 12px;
    color: #5a5670;
    margin-top: 2px;
  }

  .home-switch-btn {
    margin-top: 14px;
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 9px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #8a86a0;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .home-switch-btn:hover {
    background: rgba(255,255,255,0.07);
    color: #e8e6f0;
  }

  /* SUGGESTIONS CARD */
  .home-sugg-card {
    background: #131320;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 18px;
    margin-bottom: 16px;
  }

  .home-sugg-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .home-sugg-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #3e3a54;
  }

  .home-sugg-all {
    font-size: 12px;
    color: #7c5cfc;
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: color 0.2s;
  }
  .home-sugg-all:hover { color: #fc5c9c; }

  .home-sugg-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .home-sugg-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .home-sugg-link {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
    text-decoration: none;
    color: inherit;
  }

  .home-sugg-info {
    min-width: 0;
  }

  .home-sugg-name {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 600;
    color: #e8e6f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .home-sugg-sub {
    font-size: 11.5px;
    color: #3e3a54;
    margin-top: 1px;
  }

  .home-follow-btn {
    background: transparent;
    border: 1px solid rgba(124,92,252,0.35);
    border-radius: 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #7c5cfc;
    cursor: pointer;
    padding: 5px 14px;
    flex-shrink: 0;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }
  .home-follow-btn:hover {
    background: rgba(124,92,252,0.12);
    border-color: #7c5cfc;
    color: #a48ffc;
  }

  /* FOOTER */
  .home-footer {
    margin-top: 8px;
    padding: 0 4px;
    font-size: 11.5px;
    color: #2e2a42;
    line-height: 1.8;
  }

  .home-footer span {
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
  }
`;

/* ── Suggestion Item ── */
const SuggestionItem = ({ user, onFollow }) => {
  const [following, setFollowing] = useState(false);

  const handleFollow = async () => {
    setFollowing(true);
    try {
      await userAPI.follow(user._id);
      onFollow?.(user._id);
    } catch {
      setFollowing(false);
    }
  };

  if (following) return null;

  return (
    <div className="home-sugg-item">
      <Link to={`/${user.username}`} className="home-sugg-link">
        <Avatar src={user.avatar} username={user.username} size={34} />
        <div className="home-sugg-info">
          <div className="home-sugg-name">
            {user.username}
            {user.isVerified && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#7c5cfc">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            )}
          </div>
          <p className="home-sugg-sub">Recommended for you</p>
        </div>
      </Link>
      <button className="home-follow-btn" onClick={handleFollow}>
        Connect
      </button>
    </div>
  );
};

/* ── Home ── */
const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const fetchFeed = useCallback(async (pageNum = 1, append = false) => {
    try {
      const { data } = await postAPI.getFeed(pageNum);
      setPosts(prev => append ? [...prev, ...data.posts] : data.posts);
      setHasMore(data.pagination.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(1);
    userAPI.getSuggestions().then(({ data }) => setSuggestions(data.suggestions?.slice(0, 5) || []));
  }, [fetchFeed]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          const nextPage = page + 1;
          setPage(nextPage);
          fetchFeed(nextPage, true);
        }
      },
      { threshold: 0.5 }
    );
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, page, fetchFeed]);

  const handlePostDelete = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  const handleRemoveSuggestion = (userId) => {
    setSuggestions(prev => prev.filter(u => u._id !== userId));
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <>
      <style>{homeStyle}</style>
      <div className="home-wrap">
        <div className="home-inner">

          {/* ── FEED ── */}
          <div className="home-feed">

            {/* Moments bar */}
            <div className="home-stories-wrap">
              <StoriesBar />
            </div>

            {/* Posts */}
            {posts.length === 0 ? (
              <div className="home-empty">
                <div className="home-empty-icon">🌐</div>
                <h3>Your feed is quiet</h3>
                <p>Connect with people to start seeing their posts here.</p>
                <button className="home-empty-btn" onClick={() => navigate('/explore')}>
                  Find People
                </button>
              </div>
            ) : (
              <>
                {posts.map(post => (
                  <PostCard key={post._id} post={post} onDelete={handlePostDelete} />
                ))}

                <div ref={loadMoreRef} style={{ height: 24 }} />
                {loadingMore && <LoadingSpinner />}

                {!hasMore && (
                  <div className="home-end">You're all caught up ✦</div>
                )}
              </>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="home-sidebar">

            {/* Profile card */}
            <div className="home-profile-card">
              <Link to={`/${user?.username}`} className="home-profile-row">
                <Avatar src={user?.avatar} username={user?.username} size={46} />
                <div>
                  <p className="home-profile-name">{user?.username}</p>
                  <p className="home-profile-sub">{user?.fullName}</p>
                </div>
              </Link>
              <button className="home-switch-btn" onClick={logout}>
                Switch Account
              </button>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="home-sugg-card">
                <div className="home-sugg-header">
                  <span className="home-sugg-title">People to follow</span>
                  <button className="home-sugg-all">See all</button>
                </div>
                <div className="home-sugg-list">
                  {suggestions.map(s => (
                    <SuggestionItem
                      key={s._id}
                      user={s}
                      onFollow={handleRemoveSuggestion}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="home-footer">
              <p>Made with ❤️ on <span>Pulse</span></p>
              <p>© {new Date().getFullYear()} Pulse · All rights reserved</p>
            </div>
          </aside>

        </div>
      </div>
    </>
  );
};

export default Home;