import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import {
  AiOutlineHeart, AiFillHeart, AiOutlineClose,
  AiOutlineComment, AiOutlineSend, AiOutlineMore,
} from 'react-icons/ai';
import { BsBookmark, BsBookmarkFill, BsEmojiSmile } from 'react-icons/bs';

const PostDetail = () => {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comment, setComment] = useState('');
  const [mediaIndex, setMediaIndex] = useState(0);

  const commentRef = useRef(null);

  useEffect(() => {
    postAPI.getPost(postId)
      .then(({ data }) => {
        setPost(data.post);
        setLiked(data.post.likes?.some(l => l._id === user?._id || l === user?._id));
        setSaved(data.post.saves?.includes(user?._id));
        setLikesCount(data.post.likes?.length || 0);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [postId, user?._id, navigate]);

  const handleLike = async () => {
    setLiked(l => !l);
    setLikesCount(c => liked ? c - 1 : c + 1);
    try { await postAPI.like(postId); }
    catch {
      setLiked(l => !l);
      setLikesCount(c => liked ? c + 1 : c - 1);
    }
  };

  const handleSave = async () => {
    setSaved(s => !s);
    try { await postAPI.save(postId); }
    catch { setSaved(s => !s); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const { data } = await postAPI.comment(postId, { text: comment });
      setPost(p => ({ ...p, comments: [...p.comments, data.comment] }));
      setComment('');
    } catch {}
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!post) return null;

  const currentMedia = post.media?.[mediaIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#121212] to-black flex items-center justify-center px-2 md:px-6 py-4">

      <div className="w-full max-w-[1000px] flex flex-col md:flex-row rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">

        {/* Close */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 text-white/70 hover:text-white z-20"
        >
          <AiOutlineClose size={24} />
        </button>

        {/* MEDIA */}
        <div className="relative bg-black flex-1 flex items-center justify-center">
          {currentMedia?.type === 'video' ? (
            <video
              src={currentMedia.url}
              className="w-full max-h-[80vh] object-contain"
              controls
              playsInline
            />
          ) : (
            <img
              src={currentMedia?.url}
              alt=""
              className="w-full max-h-[80vh] object-contain"
            />
          )}

          {/* Indicators */}
          {post.media?.length > 1 && (
            <>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {post.media.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setMediaIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all
                      ${i === mediaIndex ? 'bg-white scale-110' : 'bg-white/30'}`}
                  />
                ))}
              </div>

              {mediaIndex > 0 && (
                <button
                  onClick={() => setMediaIndex(i => i - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full w-9 h-9 flex items-center justify-center text-white"
                >
                  ‹
                </button>
              )}

              {mediaIndex < post.media.length - 1 && (
                <button
                  onClick={() => setMediaIndex(i => i + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full w-9 h-9 flex items-center justify-center text-white"
                >
                  ›
                </button>
              )}
            </>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-[380px] flex flex-col text-white">

          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Avatar src={post.user?.avatar} username={post.user?.username} size={34} />
              <div>
                <Link to={`/${post.user?.username}`} className="text-sm font-semibold hover:underline">
                  {post.user?.username}
                </Link>
                {post.location && (
                  <p className="text-xs text-gray-400">{post.location}</p>
                )}
              </div>
            </div>
            <AiOutlineMore className="text-gray-400" />
          </div>

          {/* COMMENTS */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

            {/* Caption */}
            {post.caption && (
              <div className="flex gap-3">
                <Avatar src={post.user?.avatar} username={post.user?.username} size={32} />
                <div>
                  <p className="text-sm">
                    <span className="font-semibold mr-1">{post.user?.username}</span>
                    {post.caption}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )}

            {/* Comments */}
            {post.comments?.map(c => (
              <div key={c._id} className="flex gap-3">
                <Avatar src={c.user?.avatar} username={c.user?.username} size={30} />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold mr-1">{c.user?.username}</span>
                    {c.text}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="border-t border-white/10 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-4">
                <button onClick={handleLike} className="hover:scale-110 transition">
                  {liked
                    ? <AiFillHeart size={26} className="text-pink-500" />
                    : <AiOutlineHeart size={26} />}
                </button>

                <button onClick={() => commentRef.current?.focus()}>
                  <AiOutlineComment size={26} />
                </button>

                <AiOutlineSend size={24} />
              </div>

              <button onClick={handleSave}>
                {saved ? <BsBookmarkFill size={22} /> : <BsBookmark size={22} />}
              </button>
            </div>

            <p className="text-sm font-semibold">{likesCount} likes</p>
          </div>

          {/* COMMENT INPUT */}
          <form onSubmit={handleComment} className="border-t border-white/10 flex items-center px-4 py-3 gap-3">
            <BsEmojiSmile className="text-gray-400" />

            <input
              ref={commentRef}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-sm outline-none placeholder-gray-500"
            />

            {comment.trim() && (
              <button className="text-sm font-semibold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-4 py-1 rounded-full">
                Post
              </button>
            )}
          </form>

        </div>
      </div>
    </div>
  );
};

export default PostDetail;