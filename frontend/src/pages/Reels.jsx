import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { reelAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import CreateReelModal from '../components/reel/CreateReelModal'
import { formatDistanceToNow } from 'date-fns'
import {
  AiFillHeart, AiOutlineHeart,
  AiOutlineComment, AiOutlineSend,
  AiOutlineClose, AiOutlinePlus,
} from 'react-icons/ai'
import {
  BsBookmark, BsBookmarkFill,
  BsThreeDotsVertical, BsMusicNote,
  BsVolumeMute, BsVolumeUp
} from 'react-icons/bs'
import { RiLoaderLine } from 'react-icons/ri'

/* ───────────── Comment Drawer ───────────── */
const CommentDrawer = ({ reel, onClose, onCommentAdded }) => {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 200) }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    try {
      const { data } = await reelAPI.comment(reel._id, { text })
      onCommentAdded(data.comment)
      setText('')
    } catch {}
    finally { setSending(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur" onClick={onClose}>
      <div
        className="bg-[#0f0f12] border border-white/10 w-full max-w-lg rounded-t-2xl md:rounded-2xl max-h-[70vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between px-4 py-3 border-b border-white/10">
          <span className="text-white font-semibold">Comments</span>
          <AiOutlineClose onClick={onClose} className="text-white cursor-pointer" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
          {reel.comments?.map(c => (
            <div key={c._id} className="flex gap-3">
              <Avatar src={c.user?.avatar} username={c.user?.username} size={32} />
              <div className="bg-white/5 px-3 py-2 rounded-xl">
                <p className="text-xs text-gray-300">{c.user?.username}</p>
                <p className="text-sm text-white">{c.text}</p>
                <p className="text-[10px] text-gray-500">
                  {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="flex gap-2 p-3 border-t border-white/10">
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-white/10 text-white rounded-full px-4 py-2 outline-none"
          />
          <button className="text-cyan-400 font-semibold">Post</button>
        </form>
      </div>
    </div>
  )
}

/* ───────────── Reel Card ───────────── */
const ReelCard = ({ reel: initialReel, isActive, muted, onMuteToggle }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const videoRef = useRef(null)

  const [reel, setReel] = useState(initialReel)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likesCount, setLikesCount] = useState(reel.likes?.length || 0)
  const [commentsCount, setCommentsCount] = useState(reel.comments?.length || 0)
  const [showComments, setShowComments] = useState(false)

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) videoRef.current.play()
      else videoRef.current.pause()
    }
  }, [isActive])

  const handleLike = () => {
    setLiked(!liked)
    setLikesCount(c => liked ? c - 1 : c + 1)
    reelAPI.like(reel._id)
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">

      {/* Video */}
      <video
        ref={videoRef}
        src={reel.video?.url}
        className="w-full h-full object-cover"
        loop
        muted={muted}
      />

      {/* Top controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={onMuteToggle} className="bg-black/40 p-2 rounded-full text-white backdrop-blur">
          {muted ? <BsVolumeMute /> : <BsVolumeUp />}
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/40 to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <Avatar src={reel.user?.avatar} username={reel.user?.username} size={36} />
          <span className="text-white font-semibold">{reel.user?.username}</span>
        </div>
        <p className="text-sm text-gray-300">{reel.caption}</p>
      </div>

      {/* Right Actions */}
      <div className="absolute right-3 bottom-20 flex flex-col items-center gap-5">

        <button onClick={handleLike}>
          {liked ? <AiFillHeart className="text-red-500" size={28} /> : <AiOutlineHeart className="text-white" size={28} />}
          <p className="text-white text-xs">{likesCount}</p>
        </button>

        <button onClick={() => setShowComments(true)}>
          <AiOutlineComment className="text-white" size={26} />
          <p className="text-white text-xs">{commentsCount}</p>
        </button>

        <button onClick={() => setSaved(!saved)}>
          {saved ? <BsBookmarkFill className="text-white" /> : <BsBookmark className="text-white" />}
        </button>

        <button>
          <AiOutlineSend className="text-white -rotate-12" />
        </button>

      </div>

      {showComments && (
        <CommentDrawer
          reel={reel}
          onClose={() => setShowComments(false)}
          onCommentAdded={(c) => {
            setReel(r => ({ ...r, comments: [...r.comments, c] }))
          }}
        />
      )}
    </div>
  )
}

/* ───────────── Reels Page ───────────── */
const Reels = () => {
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [muted, setMuted] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    reelAPI.getExplore().then(({ data }) => {
      setReels(data.reels)
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <div className="relative h-screen bg-[#050507] text-white overflow-hidden">

      {/* Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-lg font-bold">
        Reels
      </div>

      {/* Create Button */}
      <button
        onClick={() => setShowCreate(true)}
        className="absolute top-4 right-4 z-20 bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
      >
        <AiOutlinePlus /> Create
      </button>

      {/* Reel List */}
      <div ref={containerRef} className="h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
        {reels.map((reel, i) => (
          <div key={reel._id} className="h-screen snap-start">
            <ReelCard
              reel={reel}
              isActive={i === activeIndex}
              muted={muted}
              onMuteToggle={() => setMuted(m => !m)}
            />
          </div>
        ))}
      </div>

      {showCreate && (
        <CreateReelModal onClose={() => setShowCreate(false)} />
      )}
    </div>
  )
}

export default Reels