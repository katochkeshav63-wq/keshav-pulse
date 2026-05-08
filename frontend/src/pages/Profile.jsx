import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { userAPI, postAPI, reelAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { BsBookmark, BsPersonSquare, BsCameraReels, BsChatDots } from 'react-icons/bs'
import { RiVideoLine } from 'react-icons/ri'

const profileStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .pr-page {
    max-width: 935px;
    margin: 0 auto;
    padding: 32px 16px 80px;
    font-family: 'DM Sans', sans-serif;
    color: #e8e6f0;
  }

  /* ── HEADER ── */
  .pr-header {
    display: flex;
    flex-direction: column;
    gap: 28px;
    margin-bottom: 40px;
  }

  @media (min-width: 768px) {
    .pr-header { flex-direction: row; gap: 60px; }
  }

  .pr-avatar-wrap {
    display: flex;
    justify-content: center;
  }

  @media (min-width: 768px) {
    .pr-avatar-wrap { justify-content: flex-start; }
  }

  /* Avatar gradient ring */
  .pr-avatar-ring {
    padding: 3px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    display: inline-flex;
  }

  .pr-avatar-gap {
    background: #0a0a0f;
    border-radius: 50%;
    padding: 3px;
    display: flex;
  }

  .pr-info { flex: 1; }

  /* Username row */
  .pr-username-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .pr-username {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: #e8e6f0;
  }

  .pr-verified {
    color: #7c5cfc;
  }

  /* Buttons */
  .pr-btn-primary {
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    padding: 8px 20px;
    border-radius: 10px;
    transition: opacity 0.2s, transform 0.15s;
    box-shadow: 0 4px 14px rgba(124,92,252,0.25);
  }
  .pr-btn-primary:hover { opacity: 0.88; transform: scale(1.02); }

  .pr-btn-outline {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.15);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #c0bcd4;
    cursor: pointer;
    padding: 8px 20px;
    border-radius: 10px;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
  }
  .pr-btn-outline:hover {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.25);
    color: #e8e6f0;
  }

  .pr-btn-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.12);
    color: #6e6a80;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .pr-btn-icon:hover { background: rgba(255,255,255,0.07); color: #e8e6f0; }

  /* Stats */
  .pr-stats {
    display: flex;
    gap: 28px;
    margin-bottom: 16px;
  }

  .pr-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    gap: 1px;
  }

  .pr-stat-num {
    font-family: 'Syne', sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: #e8e6f0;
  }

  .pr-stat-label {
    font-size: 12px;
    color: #5a5670;
  }

  /* Bio */
  .pr-fullname {
    font-size: 14px;
    font-weight: 600;
    color: #e8e6f0;
    margin-bottom: 4px;
  }

  .pr-bio {
    font-size: 13.5px;
    color: #a8a4be;
    white-space: pre-wrap;
    line-height: 1.6;
    margin-bottom: 4px;
  }

  .pr-website {
    font-size: 13px;
    font-weight: 600;
    color: #7c5cfc;
    text-decoration: none;
    transition: color 0.2s;
  }
  .pr-website:hover { color: #fc5c9c; }

  /* ── TABS ── */
  .pr-tabs-wrap {
    border-top: 1px solid rgba(255,255,255,0.07);
    margin-bottom: 2px;
  }

  .pr-tabs {
    display: flex;
    justify-content: center;
    gap: 4px;
    padding: 0 4px;
  }

  .pr-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 13px 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #4a4660;
    background: transparent;
    border: none;
    border-top: 2px solid transparent;
    margin-top: -1px;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
    font-family: 'DM Sans', sans-serif;
  }

  .pr-tab.active {
    color: #e8e6f0;
    border-top-color: #7c5cfc;
  }

  .pr-tab:hover:not(.active) { color: #8a86a0; }

  /* ── GRIDS ── */
  .pr-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
  }

  .pr-grid-item {
    position: relative;
    aspect-ratio: 1;
    background: #131320;
    cursor: pointer;
    overflow: hidden;
  }

  .pr-grid-item.reel { aspect-ratio: 9/16; }

  .pr-grid-item img,
  .pr-grid-item video {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: brightness 0.2s;
    display: block;
  }

  .pr-grid-item:hover img,
  .pr-grid-item:hover video { filter: brightness(0.65); }

  .pr-grid-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .pr-grid-item:hover .pr-grid-overlay { opacity: 1; }

  .pr-grid-stats {
    display: flex;
    align-items: center;
    gap: 16px;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
  }

  .pr-grid-badge {
    position: absolute;
    top: 8px; right: 8px;
    color: #fff;
  }

  .pr-grid-bottom {
    position: absolute;
    bottom: 8px; left: 8px; right: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .pr-grid-views {
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 1px 4px rgba(0,0,0,0.7);
  }

  .pr-grid-duration {
    background: rgba(0,0,0,0.55);
    color: #fff;
    font-size: 10px;
    border-radius: 20px;
    padding: 2px 7px;
  }

  /* Play button overlay */
  .pr-play-btn {
    width: 44px; height: 44px;
    background: rgba(0,0,0,0.55);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ── EMPTY STATES ── */
  .pr-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 64px 24px;
    gap: 12px;
  }

  .pr-empty-icon {
    width: 72px; height: 72px;
    border-radius: 22px;
    background: rgba(124,92,252,0.08);
    border: 1px solid rgba(124,92,252,0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
    color: #4a4660;
  }

  .pr-empty h3 {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #e8e6f0;
  }

  .pr-empty p {
    font-size: 13px;
    color: #4a4660;
    max-width: 260px;
    line-height: 1.6;
  }

  /* ── MODALS ── */
  .pr-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.82);
    backdrop-filter: blur(12px);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .pr-post-modal {
    background: #131320;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 22px;
    overflow: hidden;
    max-width: 820px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    box-shadow: 0 32px 80px rgba(0,0,0,0.7);
  }

  .pr-post-modal-media {
    width: 480px;
    flex-shrink: 0;
    background: #07070e;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 640px) {
    .pr-post-modal { flex-direction: column; }
    .pr-post-modal-media { width: 100%; }
  }

  .pr-post-modal-media img {
    width: 100%;
    object-fit: contain;
    max-height: 80vh;
    display: block;
  }

  .pr-post-modal-side {
    flex: 1;
    padding: 20px;
    min-width: 0;
    overflow-y: auto;
  }

  .pr-post-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .pr-post-modal-user {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .pr-post-modal-username {
    font-size: 13.5px;
    font-weight: 600;
    color: #e8e6f0;
  }

  .pr-post-modal-caption {
    font-size: 13.5px;
    color: #a8a4be;
    line-height: 1.55;
  }

  .pr-reel-modal {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    max-height: 90vh;
  }

  .pr-reel-modal video {
    max-height: 85vh;
    border-radius: 18px;
    max-width: 340px;
    box-shadow: 0 0 60px rgba(124,92,252,0.15);
  }

  .pr-reel-close {
    position: absolute;
    top: 10px; right: 10px;
    z-index: 10;
    width: 34px; height: 34px;
    background: rgba(0,0,0,0.6);
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s;
  }
  .pr-reel-close:hover { background: rgba(0,0,0,0.85); }

  .pr-reel-info {
    position: absolute;
    bottom: 20px; left: 16px; right: 16px;
  }

  .pr-reel-info-name {
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 1px 6px rgba(0,0,0,0.6);
  }

  .pr-reel-info-caption {
    font-size: 12px;
    color: rgba(255,255,255,0.75);
    margin-top: 3px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

/* ── Post Grid ── */
const PostGrid = ({ posts, onSelect }) => (
  <div className="pr-grid">
    {posts.map(post => (
      <div key={post._id} className="pr-grid-item" onClick={() => onSelect(post)}>
        {post.media?.[0]?.type === 'video' ? (
          <video src={post.media[0].url} muted />
        ) : (
          <img src={post.media?.[0]?.url} alt={post.caption} loading="lazy" />
        )}
        <div className="pr-grid-overlay">
          <div className="pr-grid-stats">
            <span>❤️ {post.likes?.length || 0}</span>
            <span>💬 {post.comments?.length || 0}</span>
          </div>
        </div>
        {post.media?.length > 1 && (
          <div className="pr-grid-badge">
            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: '#fff' }}>
              <path d="M2 6a2 2 0 0 1 2-2h4a1 1 0 1 1 0 2H4v12h12v-4a1 1 0 1 1 2 0v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6zm15-4a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3h-3a1 1 0 1 1 0-2h3V3a1 1 0 0 1 1-1z" />
            </svg>
          </div>
        )}
        {post.media?.[0]?.type === 'video' && (
          <div className="pr-grid-badge"><RiVideoLine size={16} /></div>
        )}
      </div>
    ))}
  </div>
)

/* ── Reels Grid ── */
const ReelsGrid = ({ reels, onSelect }) => (
  <div className="pr-grid">
    {reels.map(reel => (
      <div key={reel._id} className="pr-grid-item reel" onClick={() => onSelect(reel)}>
        {reel.video?.thumbnail ? (
          <img src={reel.video.thumbnail} alt="" loading="lazy" />
        ) : (
          <video src={reel.video?.url} muted />
        )}
        <div className="pr-grid-overlay">
          <div className="pr-play-btn">
            <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, fill: '#fff', marginLeft: 2 }}>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className="pr-grid-bottom">
          <span className="pr-grid-views">▶ {reel.views?.length?.toLocaleString() || 0}</span>
          {reel.video?.duration && (
            <span className="pr-grid-duration">{reel.video.duration.toFixed(1)}s</span>
          )}
        </div>
      </div>
    ))}
  </div>
)

/* ── Profile ── */
const Profile = () => {
  const { username } = useParams()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [reelsLoading, setReelsLoading] = useState(false)
  const [following, setFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')
  const [selectedPost, setSelectedPost] = useState(null)
  const [selectedReel, setSelectedReel] = useState(null)

  const isOwnProfile = currentUser?.username === username

  useEffect(() => {
    setLoading(true)
    userAPI.getProfile(username)
      .then(({ data }) => {
        setProfile(data.user)
        setFollowing(data.user.followers?.some(f => f._id === currentUser?._id))
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [username, currentUser?._id, navigate])

  useEffect(() => {
    if (!profile?._id) return
    setPostsLoading(true)
    postAPI.getUserPosts(profile._id)
      .then(({ data }) => setPosts(data.posts || []))
      .catch(() => {})
      .finally(() => setPostsLoading(false))
  }, [profile?._id])

  useEffect(() => {
    if (activeTab !== 'reels' || !profile?._id || reels.length > 0) return
    setReelsLoading(true)
    reelAPI.getUserReels(profile._id)
      .then(({ data }) => setReels(data.reels || []))
      .catch(() => {})
      .finally(() => setReelsLoading(false))
  }, [activeTab, profile?._id, reels.length])

  const handleFollow = async () => {
    const prev = following
    setFollowing(!prev)
    setProfile(p => ({
      ...p,
      followers: prev
        ? p.followers.filter(f => f._id !== currentUser._id)
        : [...p.followers, { _id: currentUser._id }],
    }))
    try { await userAPI.follow(profile._id) }
    catch { setFollowing(prev) }
  }

  const handleMessage = () => navigate(`/messages/${profile.username}`)

  if (loading) return <LoadingSpinner fullScreen />
  if (!profile) return null

  const TABS = [
    { id: 'posts',  label: 'Posts',   icon: null },
    { id: 'reels',  label: 'Clips',   icon: <BsCameraReels size={12} /> },
    ...(isOwnProfile ? [{ id: 'saved', label: 'Saved', icon: <BsBookmark size={12} /> }] : []),
    { id: 'tagged', label: 'Tagged',  icon: <BsPersonSquare size={12} /> },
  ]

  return (
    <>
      <style>{profileStyle}</style>
      <div className="pr-page">

        {/* ── HEADER ── */}
        <div className="pr-header">

          {/* Avatar */}
          <div className="pr-avatar-wrap">
            <div className="pr-avatar-ring">
              <div className="pr-avatar-gap">
                <Avatar
                  src={profile.avatar}
                  username={profile.username}
                  size={typeof window !== 'undefined' && window.innerWidth < 768 ? 80 : 148}
                />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="pr-info">
            {/* Username row */}
            <div className="pr-username-row">
              <h1 className="pr-username">{profile.username}</h1>

              {profile.isVerified && (
                <svg className="pr-verified" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              )}

              {isOwnProfile ? (
                <>
                  <Link to="/profile/edit" className="pr-btn-outline">Edit Profile</Link>
                  <button className="pr-btn-outline">Archive</button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleFollow}
                    className={following ? 'pr-btn-outline' : 'pr-btn-primary'}
                  >
                    {following ? 'Following' : 'Connect'}
                  </button>
                  <button onClick={handleMessage} className="pr-btn-outline">
                    <BsChatDots size={14} /> Message
                  </button>
                  <button className="pr-btn-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="5" r="1" fill="currentColor" />
                      <circle cx="12" cy="12" r="1" fill="currentColor" />
                      <circle cx="12" cy="19" r="1" fill="currentColor" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="pr-stats">
              <div className="pr-stat">
                <span className="pr-stat-num">{profile.postsCount?.toLocaleString() || 0}</span>
                <span className="pr-stat-label">posts</span>
              </div>
              <button className="pr-stat">
                <span className="pr-stat-num">{profile.followers?.length?.toLocaleString() || 0}</span>
                <span className="pr-stat-label">followers</span>
              </button>
              <button className="pr-stat">
                <span className="pr-stat-num">{profile.following?.length?.toLocaleString() || 0}</span>
                <span className="pr-stat-label">following</span>
              </button>
            </div>

            {/* Bio */}
            <div>
              {profile.fullName && <p className="pr-fullname">{profile.fullName}</p>}
              {profile.bio && <p className="pr-bio">{profile.bio}</p>}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="pr-website">
                  {profile.website}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="pr-tabs-wrap">
          <div className="pr-tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pr-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB CONTENT ── */}
        {activeTab === 'posts' && (
          postsLoading ? <LoadingSpinner /> :
          posts.length === 0 ? (
            <div className="pr-empty">
              <div className="pr-empty-icon">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <h3>{isOwnProfile ? 'Share your first post' : 'No Posts Yet'}</h3>
              {isOwnProfile && <p>When you share photos or videos, they'll appear here.</p>}
            </div>
          ) : <PostGrid posts={posts} onSelect={setSelectedPost} />
        )}

        {activeTab === 'reels' && (
          reelsLoading ? <LoadingSpinner /> :
          reels.length === 0 ? (
            <div className="pr-empty">
              <div className="pr-empty-icon">
                <BsCameraReels size={28} />
              </div>
              <h3>{isOwnProfile ? 'Share your first clip' : 'No Clips Yet'}</h3>
              {isOwnProfile && (
                <>
                  <p>Share short clips to reach a bigger audience.</p>
                  <button className="pr-btn-primary" style={{ marginTop: 8 }} onClick={() => navigate('/reels')}>
                    Create Clip
                  </button>
                </>
              )}
            </div>
          ) : <ReelsGrid reels={reels} onSelect={setSelectedReel} />
        )}

        {activeTab === 'saved' && isOwnProfile && (
          <div className="pr-empty">
            <div className="pr-empty-icon"><BsBookmark size={26} /></div>
            <h3>Nothing saved yet</h3>
            <p>Posts you bookmark will appear here.</p>
          </div>
        )}

        {activeTab === 'tagged' && (
          <div className="pr-empty">
            <div className="pr-empty-icon"><BsPersonSquare size={26} /></div>
            <h3>No tags yet</h3>
            <p>Photos and videos you're tagged in will appear here.</p>
          </div>
        )}

        {/* ── POST MODAL ── */}
        {selectedPost && (
          <div className="pr-modal-overlay" onClick={() => setSelectedPost(null)}>
            <div className="pr-post-modal" onClick={e => e.stopPropagation()}>
              <div className="pr-post-modal-media">
                <img src={selectedPost.media?.[0]?.url} alt="" />
              </div>
              <div className="pr-post-modal-side">
                <div className="pr-post-modal-header">
                  <div className="pr-post-modal-user">
                    <Avatar src={profile.avatar} username={profile.username} size={34} />
                    <span className="pr-post-modal-username">{profile.username}</span>
                  </div>
                  {!isOwnProfile && (
                    <button onClick={handleMessage} className="pr-btn-outline" style={{ fontSize: 12 }}>
                      <BsChatDots size={13} /> Message
                    </button>
                  )}
                </div>
                <p className="pr-post-modal-caption">
                  <span style={{ fontWeight: 600, color: '#e8e6f0', marginRight: 6 }}>{profile.username}</span>
                  {selectedPost.caption}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── REEL MODAL ── */}
        {selectedReel && (
          <div className="pr-modal-overlay" onClick={() => setSelectedReel(null)}>
            <div className="pr-reel-modal" onClick={e => e.stopPropagation()}>
              <button className="pr-reel-close" onClick={() => setSelectedReel(null)}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
              <video
                src={selectedReel.video?.url}
                controls
                autoPlay
                loop
                playsInline
              />
              <div className="pr-reel-info">
                <p className="pr-reel-info-name">{selectedReel.user?.username}</p>
                {selectedReel.caption && (
                  <p className="pr-reel-info-caption">{selectedReel.caption}</p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}

export default Profile