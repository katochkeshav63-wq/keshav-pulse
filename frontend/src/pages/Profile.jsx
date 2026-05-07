import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { userAPI, postAPI, reelAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
// import { AiOutlineGrid, AiOutlineHeart } from 'react-icons/ai'
import { BsBookmark, BsPersonSquare, BsCameraReels, BsChatDots } from 'react-icons/bs'
import { RiVideoLine } from 'react-icons/ri'

/* ── Post grid ── */
const PostGrid = ({ posts, onSelect }) => (
  <div className="grid grid-cols-3 gap-0.5">
    {posts.map(post => (
      <div
        key={post._id}
        className="relative aspect-square bg-gray-100 cursor-pointer group overflow-hidden"
        onClick={() => onSelect(post)}
      >
        {post.media?.[0]?.type === 'video' ? (
          <video src={post.media[0].url} className="w-full h-full object-cover" />
        ) : (
          <img
            src={post.media?.[0]?.url}
            alt={post.caption}
            className="w-full h-full object-cover group-hover:brightness-75 transition-all"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
          <div className="hidden group-hover:flex items-center gap-4 text-white font-semibold">
            <span className="flex items-center gap-1">{post.likes?.length || 0}</span>
            <span>💬 {post.comments?.length || 0}</span>
          </div>
        </div>
        {post.media?.length > 1 && (
          <div className="absolute top-2 right-2 text-white">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
              <path d="M2 6a2 2 0 0 1 2-2h4a1 1 0 1 1 0 2H4v12h12v-4a1 1 0 1 1 2 0v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6zm15-4a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3h-3a1 1 0 1 1 0-2h3V3a1 1 0 0 1 1-1z" />
            </svg>
          </div>
        )}
        {post.media?.[0]?.type === 'video' && (
          <div className="absolute top-2 right-2 text-white"><RiVideoLine size={16} /></div>
        )}
      </div>
    ))}
  </div>
)

/* ── Reels grid (thumbnail tiles) ── */
const ReelsGrid = ({ reels, onSelect }) => (
  <div className="grid grid-cols-3 gap-0.5">
    {reels.map(reel => (
      <div
        key={reel._id}
        className="relative aspect-[9/16] bg-black cursor-pointer group overflow-hidden"
        onClick={() => onSelect(reel)}
      >
        {reel.video?.thumbnail ? (
          <img src={reel.video.thumbnail} alt="" className="w-full h-full object-cover group-hover:brightness-75 transition-all" loading="lazy" />
        ) : (
          <video src={reel.video?.url} className="w-full h-full object-cover" muted />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
        {/* Play icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white ml-0.5"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        {/* Duration + views */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <span className="text-white text-xs font-semibold drop-shadow">
            ▶ {reel.views?.length?.toLocaleString() || 0}
          </span>
          {reel.video?.duration && (
            <span className="bg-black/60 text-white text-[10px] rounded-full px-1.5 py-0.5">
              {reel.video.duration.toFixed(1)}s
            </span>
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

  // Lazy-load reels only when tab is opened
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
    { id: 'posts',   label: 'POSTS'  },
    { id: 'reels',  icon: <BsCameraReels size={12} />,   label: 'REELS'  },
    ...(isOwnProfile ? [{ id: 'saved', icon: <BsBookmark size={12} />, label: 'SAVED' }] : []),
    { id: 'tagged', icon: <BsPersonSquare size={12} />,  label: 'TAGGED' },
  ]

  return (
    <div className="max-w-[935px] mx-auto px-4 py-8 pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-20 mb-10">
        <div className="flex justify-center md:justify-start">
          <Avatar src={profile.avatar} username={profile.username} size={window.innerWidth < 768 ? 77 : 150} />
        </div>

        <div className="flex-1">
          {/* Username row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h1 className="text-xl font-light">{profile.username}</h1>
            {profile.isVerified && (
              <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            )}

            {isOwnProfile ? (
              <>
                <Link to="/profile/edit" className="btn-outline text-sm px-4">Edit profile</Link>
                <button className="btn-outline text-sm px-4">Archive</button>
              </>
            ) : (
              <>
                <button onClick={handleFollow} className={following ? 'btn-outline' : 'btn-primary'}>
                  {following ? 'Following' : 'Follow'}
                </button>
                <button onClick={handleMessage} className="btn-outline flex items-center gap-2 text-sm px-4">
                  <BsChatDots size={15} /> Message
                </button>
                <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="5" r="1" fill="currentColor" />
                    <circle cx="12" cy="12" r="1" fill="currentColor" />
                    <circle cx="12" cy="19" r="1" fill="currentColor" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-8 mb-4">
            <div>
              <span className="font-semibold">{profile.postsCount?.toLocaleString()}</span>
              <span className="text-gray-500 ml-1 text-sm">posts</span>
            </div>
            <button>
              <span className="font-semibold">{profile.followers?.length?.toLocaleString()}</span>
              <span className="text-gray-500 ml-1 text-sm">followers</span>
            </button>
            <button>
              <span className="font-semibold">{profile.following?.length?.toLocaleString()}</span>
              <span className="text-gray-500 ml-1 text-sm">following</span>
            </button>
          </div>

          {/* Bio */}
          <div>
            {profile.fullName && <p className="font-semibold text-sm">{profile.fullName}</p>}
            {profile.bio && <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-900 font-semibold hover:underline">
                {profile.website}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-t border-gray-200">
        <div className="flex justify-center gap-8 md:gap-12">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 py-3 text-xs tracking-widest font-semibold border-t-2 -mt-px transition-colors
                ${activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'posts' && (
        postsLoading ? <LoadingSpinner /> :
        posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4">
              {/* <AiOutlineGrid size={28} /> */}
            </div>
            <h3 className="text-2xl font-light mb-1">{isOwnProfile ? 'Share Photos' : 'No Posts Yet'}</h3>
            {isOwnProfile && <p className="text-gray-500 text-sm">When you share photos, they will appear here.</p>}
          </div>
        ) : <PostGrid posts={posts} onSelect={setSelectedPost} />
      )}

      {activeTab === 'reels' && (
        reelsLoading ? <LoadingSpinner /> :
        reels.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4">
              <BsCameraReels size={26} />
            </div>
            <h3 className="text-2xl font-light mb-1">{isOwnProfile ? 'Share Reels' : 'No Reels Yet'}</h3>
            {isOwnProfile && (
              <>
                <p className="text-gray-500 text-sm mb-4">Share 10-second videos to reach a bigger audience.</p>
                <button onClick={() => navigate('/reels')} className="btn-primary">Create reel</button>
              </>
            )}
          </div>
        ) : <ReelsGrid reels={reels} onSelect={setSelectedReel} />
      )}

      {activeTab === 'saved' && isOwnProfile && (
        <div className="text-center py-16">
          <BsBookmark size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-sm">Posts you've saved will appear here.</p>
        </div>
      )}

      {activeTab === 'tagged' && (
        <div className="text-center py-16">
          <BsPersonSquare size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-sm">Photos and videos you've been tagged in will appear here.</p>
        </div>
      )}

      {/* ── Post detail modal ── */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center" onClick={() => setSelectedPost(null)}>
          <div className="bg-white rounded-lg overflow-hidden max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex">
              <div className="w-[500px] bg-black flex items-center flex-shrink-0">
                <img src={selectedPost.media?.[0]?.url} alt="" className="w-full object-contain max-h-[80vh]" />
              </div>
              <div className="flex-1 p-4 min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={profile.avatar} username={profile.username} size={32} />
                    <span className="font-semibold text-sm">{profile.username}</span>
                  </div>
                  {!isOwnProfile && (
                    <button onClick={handleMessage} className="flex items-center gap-1.5 text-blue-500 text-sm font-semibold hover:text-blue-700">
                      <BsChatDots size={15} /> Message
                    </button>
                  )}
                </div>
                <p className="text-sm">
                  <span className="font-semibold mr-1">{profile.username}</span>
                  {selectedPost.caption}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Reel preview modal ── */}
      {selectedReel && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setSelectedReel(null)}>
          <div className="relative max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedReel(null)} className="absolute top-3 right-3 z-10 bg-black/50 rounded-full p-1.5 text-white">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
            <video
              src={selectedReel.video?.url}
              className="max-h-[85vh] rounded-xl"
              style={{ maxWidth: '340px' }}
              controls
              autoPlay
              loop
              playsInline
            />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white text-sm font-semibold drop-shadow">{selectedReel.user?.username}</p>
              {selectedReel.caption && <p className="text-white/80 text-xs mt-0.5 line-clamp-2">{selectedReel.caption}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
