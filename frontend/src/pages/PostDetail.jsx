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

const pdStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .pd-page {
    min-height: 100vh;
    background: #0a0a0f;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    font-family: 'DM Sans', sans-serif;
    color: #e8e6f0;
    position: relative;
  }

  /* Ambient glow */
  .pd-page::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124,92,252,0.07) 0%, transparent 70%);
    top: -150px; left: -150px;
    pointer-events: none;
  }

  /* CLOSE BTN */
  .pd-close {
    position: fixed;
    top: 18px; right: 18px;
    z-index: 30;
    width: 38px; height: 38px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, transform 0.15s;
  }
  .pd-close:hover {
    background: rgba(255,255,255,0.15);
    color: #fff;
    transform: scale(1.08);
  }

  /* CARD */
  .pd-card {
    width: 100%;
    max-width: 980px;
    display: flex;
    flex-direction: column;
    border-radius: 26px;
    overflow: hidden;
    background: #131320;
    border: 1px solid rgba(255,255,255,0.07);
    box-shadow: 0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,92,252,0.08);
    position: relative;
    z-index: 1;
  }

  @media (min-width: 768px) {
    .pd-card { flex-direction: row; }
  }

  /* MEDIA PANEL */
  .pd-media {
    flex: 1;
    background: #07070e;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    min-height: 300px;
  }

  @media (min-width: 768px) {
    .pd-media { min-height: 500px; }
  }

  .pd-media img,
  .pd-media video {
    width: 100%;
    max-height: 80vh;
    object-fit: contain;
    display: block;
  }

  /* Media nav arrows */
  .pd-media-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 36px; height: 36px;
    border-radius: 50%;
    background: rgba(19,19,32,0.8);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.1);
    color: #e8e6f0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 20px;
    transition: background 0.2s, transform 0.15s;
    z-index: 5;
    line-height: 1;
  }
  .pd-media-arrow:hover {
    background: rgba(124,92,252,0.3);
    transform: translateY(-50%) scale(1.08);
  }
  .pd-media-arrow.left  { left: 12px; }
  .pd-media-arrow.right { right: 12px; }

  /* Dot indicators */
  .pd-dots {
    position: absolute;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 5px;
    align-items: center;
  }

  .pd-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    border: none;
    background: rgba(255,255,255,0.25);
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
    padding: 0;
  }
  .pd-dot.active {
    background: #7c5cfc;
    transform: scale(1.35);
  }

  /* RIGHT PANEL */
  .pd-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    border-left: 1px solid rgba(255,255,255,0.07);
    background: #131320;
  }

  @media (min-width: 768px) {
    .pd-panel { width: 360px; flex-shrink: 0; }
  }

  /* Panel header */
  .pd-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    flex-shrink: 0;
  }

  .pd-user-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .pd-username {
    font-size: 13.5px;
    font-weight: 600;
    color: #e8e6f0;
    text-decoration: none;
    transition: color 0.15s;
  }
  .pd-username:hover { color: #7c5cfc; }

  .pd-location {
    font-size: 11.5px;
    color: #4a4660;
    margin-top: 1px;
  }

  .pd-more-btn {
    background: transparent;
    border: none;
    color: #4a4660;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 8px;
    transition: background 0.2s, color 0.2s;
  }
  .pd-more-btn:hover { background: rgba(255,255,255,0.06); color: #e8e6f0; }

  /* Comments scroll area */
  .pd-comments {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .pd-comments::-webkit-scrollbar { width: 3px; }
  .pd-comments::-webkit-scrollbar-thumb { background: rgba(124,92,252,0.2); border-radius: 2px; }

  .pd-comment-row {
    display: flex;
    gap: 10px;
  }

  .pd-comment-body {
    flex: 1;
    min-width: 0;
  }

  .pd-comment-text {
    font-size: 13.5px;
    color: #c0bcd4;
    line-height: 1.5;
  }

  .pd-comment-author {
    font-weight: 600;
    color: #e8e6f0;
    margin-right: 5px;
    text-decoration: none;
    transition: color 0.15s;
  }
  .pd-comment-author:hover { color: #7c5cfc; }

  .pd-comment-time {
    font-size: 11px;
    color: #3e3a54;
    margin-top: 3px;
    display: block;
  }

  /* ACTIONS */
  .pd-actions {
    border-top: 1px solid rgba(255,255,255,0.07);
    padding: 12px 16px 8px;
    flex-shrink: 0;
  }

  .pd-action-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .pd-action-left {
    display: flex;
    gap: 14px;
    align-items: center;
  }

  .pd-action-btn {
    background: transparent;
    border: none;
    color: #6e6a80;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 8px;
    transition: color 0.2s, transform 0.15s;
  }
  .pd-action-btn:hover { color: #e8e6f0; transform: scale(1.12); }
  .pd-action-btn.liked { color: #fc5c9c; }
  .pd-action-btn.saved { color: #7c5cfc; }

  .pd-likes {
    font-size: 13px;
    font-weight: 600;
    color: #c8c4da;
  }

  /* COMMENT INPUT */
  .pd-input-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    border-top: 1px solid rgba(255,255,255,0.07);
    padding: 10px 16px;
    background: rgba(0,0,0,0.1);
    flex-shrink: 0;
  }

  .pd-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    color: #c8c4da;
  }
  .pd-input::placeholder { color: #3e3a54; }

  .pd-reply-btn {
    background: transparent;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #7c5cfc;
    cursor: pointer;
    padding: 4px 10px;
    border-radius: 8px;
    transition: background 0.2s;
  }
  .pd-reply-btn:hover { background: rgba(124,92,252,0.1); }
`;

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
    <>
      <style>{pdStyle}</style>
      <div className="pd-page">

        {/* Close */}
        <button className="pd-close" onClick={() => navigate(-1)}>
          <AiOutlineClose size={16} />
        </button>

        <div className="pd-card">

          {/* ── MEDIA ── */}
          <div className="pd-media">
            {currentMedia?.type === 'video' ? (
              <video src={currentMedia.url} controls playsInline />
            ) : (
              <img src={currentMedia?.url} alt="post media" />
            )}

            {post.media?.length > 1 && (
              <>
                <div className="pd-dots">
                  {post.media.map((_, i) => (
                    <button
                      key={i}
                      className={`pd-dot ${i === mediaIndex ? 'active' : ''}`}
                      onClick={() => setMediaIndex(i)}
                    />
                  ))}
                </div>

                {mediaIndex > 0 && (
                  <button
                    className="pd-media-arrow left"
                    onClick={() => setMediaIndex(i => i - 1)}
                  >‹</button>
                )}

                {mediaIndex < post.media.length - 1 && (
                  <button
                    className="pd-media-arrow right"
                    onClick={() => setMediaIndex(i => i + 1)}
                  >›</button>
                )}
              </>
            )}
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="pd-panel">

            {/* Header */}
            <div className="pd-panel-header">
              <div className="pd-user-row">
                <Avatar src={post.user?.avatar} username={post.user?.username} size={36} />
                <div>
                  <Link to={`/${post.user?.username}`} className="pd-username">
                    {post.user?.username}
                  </Link>
                  {post.location && (
                    <p className="pd-location">📍 {post.location}</p>
                  )}
                </div>
              </div>
              <button className="pd-more-btn">
                <AiOutlineMore size={20} />
              </button>
            </div>

            {/* Comments */}
            <div className="pd-comments">

              {/* Caption as first comment */}
              {post.caption && (
                <div className="pd-comment-row">
                  <Avatar src={post.user?.avatar} username={post.user?.username} size={32} />
                  <div className="pd-comment-body">
                    <p className="pd-comment-text">
                      <Link to={`/${post.user?.username}`} className="pd-comment-author">
                        {post.user?.username}
                      </Link>
                      {post.caption}
                    </p>
                    <span className="pd-comment-time">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              )}

              {/* Comments list */}
              {post.comments?.map(c => (
                <div key={c._id} className="pd-comment-row">
                  <Avatar src={c.user?.avatar} username={c.user?.username} size={30} />
                  <div className="pd-comment-body">
                    <p className="pd-comment-text">
                      <Link to={`/${c.user?.username}`} className="pd-comment-author">
                        {c.user?.username}
                      </Link>
                      {c.text}
                    </p>
                    <span className="pd-comment-time">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="pd-actions">
              <div className="pd-action-row">
                <div className="pd-action-left">
                  <button
                    className={`pd-action-btn ${liked ? 'liked' : ''}`}
                    onClick={handleLike}
                  >
                    {liked ? <AiFillHeart size={25} /> : <AiOutlineHeart size={25} />}
                  </button>

                  <button
                    className="pd-action-btn"
                    onClick={() => commentRef.current?.focus()}
                  >
                    <AiOutlineComment size={24} />
                  </button>

                  <button className="pd-action-btn">
                    <AiOutlineSend size={23} />
                  </button>
                </div>

                <button
                  className={`pd-action-btn ${saved ? 'saved' : ''}`}
                  onClick={handleSave}
                >
                  {saved ? <BsBookmarkFill size={21} /> : <BsBookmark size={21} />}
                </button>
              </div>

              <p className="pd-likes">
                {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
              </p>
            </div>

            {/* Comment input */}
            <form className="pd-input-bar" onSubmit={handleComment}>
              <BsEmojiSmile size={17} style={{ color: '#3e3a54', flexShrink: 0 }} />
              <input
                ref={commentRef}
                className="pd-input"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a reply…"
              />
              {comment.trim() && (
                <button type="submit" className="pd-reply-btn">Reply</button>
              )}
            </form>

          </div>
        </div>
      </div>
    </>
  );
};

export default PostDetail;