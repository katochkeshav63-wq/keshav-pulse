import React, { useState, useEffect, useRef } from 'react'
import { reelAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import CreateReelModal from '../components/reel/CreateReelModal'
import { formatDistanceToNow } from 'date-fns'

import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineComment,
  AiOutlineSend,
  AiOutlineClose,
  AiOutlinePlus
} from 'react-icons/ai'

import {
  BsBookmark,
  BsBookmarkFill,
  BsVolumeMute,
  BsVolumeUp,
  BsThreeDots
} from 'react-icons/bs'

/* ───────────────────────── COMMENTS ───────────────────────── */

const CommentDrawer = ({ reel, onClose, onCommentAdded }) => {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 200)
  }, [])

  const submit = async (e) => {
    e.preventDefault()

    if (!text.trim() || sending) return

    setSending(true)

    try {
      const { data } = await reelAPI.comment(reel._id, { text })

      onCommentAdded(data.comment)
      setText('')
    } catch (err) {
      console.log(err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#111] rounded-t-3xl border border-white/10 h-[70vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg">Comments</h2>

          <button onClick={onClose}>
            <AiOutlineClose className="text-white text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {reel.comments?.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <Avatar
                src={comment.user?.avatar}
                username={comment.user?.username}
                size={36}
              />

              <div className="flex-1">
                <div className="bg-white/5 rounded-2xl px-4 py-3">
                  <p className="text-sm font-semibold text-white">
                    {comment.user?.username}
                  </p>

                  <p className="text-sm text-gray-300 mt-1">
                    {comment.text}
                  </p>
                </div>

                <p className="text-xs text-gray-500 mt-1 ml-2">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={submit}
          className="p-4 border-t border-white/10 flex items-center gap-3"
        >
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-white/10 text-white rounded-full px-5 py-3 outline-none"
          />

          <button
            disabled={sending}
            className="text-cyan-400 font-semibold"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  )
}

/* ───────────────────────── REEL CARD ───────────────────────── */

const ReelCard = ({ reel: initialReel, isActive, muted, onMuteToggle }) => {
  const videoRef = useRef(null)

  const [reel, setReel] = useState(initialReel)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likesCount, setLikesCount] = useState(
    initialReel.likes?.length || 0
  )

  const [commentsCount, setCommentsCount] = useState(
    initialReel.comments?.length || 0
  )

  const [showComments, setShowComments] = useState(false)

  useEffect(() => {
    if (!videoRef.current) return

    if (isActive) {
      videoRef.current.play()
    } else {
      videoRef.current.pause()
    }
  }, [isActive])

  const handleLike = () => {
    setLiked(!liked)

    setLikesCount((prev) => (liked ? prev - 1 : prev + 1))

    reelAPI.like(reel._id)
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">

      {/* VIDEO */}
      <video
        ref={videoRef}
        src={reel.video?.url}
        className="w-full h-full object-cover"
        loop
        muted={muted}
        playsInline
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

      {/* TOP BAR */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-5">

        <div>
          <h1 className="text-white text-2xl font-bold tracking-wide">
            Reels
          </h1>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={onMuteToggle}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center"
          >
            {muted ? (
              <BsVolumeMute className="text-white text-lg" />
            ) : (
              <BsVolumeUp className="text-white text-lg" />
            )}
          </button>

          <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
            <BsThreeDots className="text-white text-lg" />
          </button>

        </div>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="absolute right-4 bottom-28 z-20 flex flex-col items-center gap-6">

        <button
          onClick={handleLike}
          className="flex flex-col items-center"
        >
          {liked ? (
            <AiFillHeart className="text-red-500 text-4xl" />
          ) : (
            <AiOutlineHeart className="text-white text-4xl" />
          )}

          <span className="text-white text-xs mt-1">
            {likesCount}
          </span>
        </button>

        <button
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center"
        >
          <AiOutlineComment className="text-white text-4xl" />

          <span className="text-white text-xs mt-1">
            {commentsCount}
          </span>
        </button>

        <button
          onClick={() => setSaved(!saved)}
          className="flex flex-col items-center"
        >
          {saved ? (
            <BsBookmarkFill className="text-white text-3xl" />
          ) : (
            <BsBookmark className="text-white text-3xl" />
          )}
        </button>

        <button className="flex flex-col items-center">
          <AiOutlineSend className="text-white text-3xl -rotate-12" />
        </button>

      </div>

      {/* USER INFO */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-10">

        <div className="flex items-center gap-3 mb-4">

          <Avatar
            src={reel.user?.avatar}
            username={reel.user?.username}
            size={45}
          />

          <div>
            <h2 className="text-white font-semibold">
              {reel.user?.username}
            </h2>

            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(reel.createdAt), {
                addSuffix: true
              })}
            </p>
          </div>

        </div>

        <p className="text-sm text-gray-200 leading-relaxed max-w-md">
          {reel.caption}
        </p>

      </div>

      {/* COMMENTS */}
      {showComments && (
        <CommentDrawer
          reel={reel}
          onClose={() => setShowComments(false)}
          onCommentAdded={(comment) => {
            setReel((prev) => ({
              ...prev,
              comments: [...prev.comments, comment]
            }))

            setCommentsCount((prev) => prev + 1)
          }}
        />
      )}
    </div>
  )
}

/* ───────────────────────── PAGE ───────────────────────── */

const Reels = () => {
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [muted, setMuted] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const containerRef = useRef(null)

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const { data } = await reelAPI.getExplore()

        setReels(data.reels || [])
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }

    fetchReels()
  }, [])

  useEffect(() => {
    const container = containerRef.current

    if (!container) return

    const handleScroll = () => {
      const index = Math.round(
        container.scrollTop / window.innerHeight
      )

      setActiveIndex(index)
    }

    container.addEventListener('scroll', handleScroll)

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="relative h-screen bg-black overflow-hidden">

      {/* CREATE BUTTON */}
      <button
        onClick={() => setShowCreate(true)}
        className="absolute top-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 transition px-5 py-2 rounded-full text-white font-semibold shadow-2xl"
      >
        <AiOutlinePlus className="text-lg" />
        Create Reel
      </button>

      {/* REELS */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
      >
        {reels.map((reel, index) => (
          <div
            key={reel._id}
            className="h-screen snap-start"
          >
            <ReelCard
              reel={reel}
              isActive={index === activeIndex}
              muted={muted}
              onMuteToggle={() => setMuted((prev) => !prev)}
            />
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <CreateReelModal
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}

export default Reels