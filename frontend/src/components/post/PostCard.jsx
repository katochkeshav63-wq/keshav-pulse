import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postAPI } from '../../utils/api';
import Avatar from '../ui/Avatar';
import { formatDistanceToNow } from 'date-fns';
import {
  AiOutlineHeart, AiFillHeart,
  AiOutlineComment,
  AiOutlineSend,
  AiOutlineMore,
} from 'react-icons/ai';
import { BsBookmark, BsBookmarkFill, BsEmojiSmile } from 'react-icons/bs';

/* ─── Styles ─── */
const cardStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .pc-wrap {
    background: #131320;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 22px;
    margin-bottom: 28px;
    max-width: 520px;
    margin-left: auto;
    margin-right: auto;
    overflow: hidden;
    font-family: 'DM Sans', sans-serif;
    color: #e8e6f0;
    transition: box-shadow 0.3s, border-color 0.3s;
  }
  .pc-wrap:hover {
    box-shadow: 0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,92,252,0.12);
    border-color: rgba(124,92,252,0.18);
  }

  /* HEADER */
  .pc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .pc-user-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .pc-username {
    font-size: 13.5px;
    font-weight: 600;
    color: #e8e6f0;
    text-decoration: none;
    transition: color 0.2s;
  }
  .pc-username:hover { color: #7c5cfc; }

  .pc-location {
    font-size: 11.5px;
    color: #5a5670;
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .pc-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px; height: 32px;
    background: transparent;
    border: none;
    border-radius: 9px;
    color: #5a5670;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .pc-menu-btn:hover { background: rgba(255,255,255,0.06); color: #e8e6f0; }

  .pc-dropdown {
    position: absolute;
    right: 0; top: calc(100% + 6px);
    background: #1c1b2e;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.5);
    width: 170px;
    padding: 6px;
    z-index: 20;
    overflow: hidden;
  }

  .pc-dropdown-item {
    display: block;
    width: 100%;
    text-align: left;
    padding: 9px 12px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    background: transparent;
    border: none;
    color: #c0bcd4;
    border-radius: 9px;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
  }
  .pc-dropdown-item:hover { background: rgba(255,255,255,0.06); color: #e8e6f0; }
  .pc-dropdown-item.danger { color: #f87171; }
  .pc-dropdown-item.danger:hover { background: rgba(248,113,113,0.08); }

  /* MEDIA */
  .pc-media {
    position: relative;
    background: #0a0a0f;
    cursor: pointer;
    overflow: hidden;
  }

  .pc-media img,
  .pc-media video {
    width: 100%;
    max-height: 560px;
    object-fit: contain;
    display: block;
  }

  .pc-dots {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 5px;
    align-items: center;
  }

  .pc-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    border: none;
    background: rgba(255,255,255,0.3);
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
    padding: 0;
  }
  .pc-dot.active {
    background: #7c5cfc;
    transform: scale(1.3);
  }

  .pc-heart-burst {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
  .pc-heart-burst svg {
    animation: heartPop 0.7s ease-out forwards;
    filter: drop-shadow(0 0 20px rgba(252,92,156,0.8));
  }
  @keyframes heartPop {
    0%   { transform: scale(0.4); opacity: 1; }
    50%  { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(0.9); opacity: 0; }
  }

  /* ACTIONS */
  .pc-actions {
    padding: 12px 16px 6px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .pc-action-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .pc-action-left {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .pc-action-btn {
    background: transparent;
    border: none;
    color: #8a86a0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 8px;
    transition: color 0.2s, transform 0.15s;
  }
  .pc-action-btn:hover { color: #e8e6f0; transform: scale(1.12); }
  .pc-action-btn.liked { color: #fc5c9c; }
  .pc-action-btn.liked:hover { color: #fc5c9c; }
  .pc-action-btn.saved { color: #7c5cfc; }

  .pc-likes {
    font-size: 13px;
    font-weight: 600;
    color: #c8c4da;
  }

  /* CAPTION */
  .pc-caption {
    font-size: 13.5px;
    color: #a8a4be;
    line-height: 1.55;
  }

  /* COMMENTS */
  .pc-show-comments {
    background: transparent;
    border: none;
    font-size: 12.5px;
    color: #5a5670;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    padding: 0;
    transition: color 0.2s;
  }
  .pc-show-comments:hover { color: #7c5cfc; }

  .pc-comments-list {
    max-height: 130px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 4px 0;
  }
  .pc-comments-list::-webkit-scrollbar { width: 3px; }
  .pc-comments-list::-webkit-scrollbar-thumb { background: rgba(124,92,252,0.25); border-radius: 2px; }

  .pc-comment-row {
    font-size: 13px;
    color: #a8a4be;
    line-height: 1.45;
  }

  .pc-timestamp {
    font-size: 11px;
    color: #3e3a54;
    letter-spacing: 0.2px;
  }

  .pc-tag { color: #7c5cfc; text-decoration: none; }
  .pc-tag:hover { text-decoration: underline; }

  /* COMMENT INPUT */
  .pc-comment-form {
    display: flex;
    align-items: center;
    gap: 10px;
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 10px 16px;
    background: rgba(0,0,0,0.15);
  }

  .pc-comment-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: #c8c4da;
  }
  .pc-comment-input::placeholder { color: #3e3a54; }

  .pc-reply-btn {
    background: transparent;
    border: none;
    font-size: 13px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    color: #7c5cfc;
    cursor: pointer;
    padding: 2px 8px;
    border-radius: 7px;
    transition: background 0.2s;
  }
  .pc-reply-btn:hover { background: rgba(124,92,252,0.1); }
`;

const PostCard = ({ post: initialPost, onDelete }) => {
  const { user } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [liked, setLiked] = useState(post.likes?.some(l => l._id === user?._id || l === user?._id));
  const [saved, setSaved] = useState(post.saves?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [doubleClickLike, setDoubleClickLike] = useState(false);
  const commentRef = useRef(null);
  const lastTapRef = useRef(0);

  const handleLike = useCallback(async () => {
    setLiked(prev => !prev);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    try {
      await postAPI.like(post._id);
    } catch {
      setLiked(prev => !prev);
      setLikesCount(prev => liked ? prev + 1 : prev - 1);
    }
  }, [liked, post._id]);

  const handleDoubleClick = useCallback(() => {
    if (!liked) {
      setLiked(true);
      setLikesCount(prev => prev + 1);
      setDoubleClickLike(true);
      setTimeout(() => setDoubleClickLike(false), 800);
      postAPI.like(post._id).catch(() => {});
    }
  }, [liked, post._id]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) handleDoubleClick();
    lastTapRef.current = now;
  }, [handleDoubleClick]);

  const handleSave = async () => {
    setSaved(prev => !prev);
    try {
      await postAPI.save(post._id);
    } catch {
      setSaved(prev => !prev);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const { data } = await postAPI.comment(post._id, { text: comment });
      setPost(prev => ({ ...prev, comments: [...prev.comments, data.comment] }));
      setComment('');
    } catch {}
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this post?')) {
      try {
        await postAPI.delete(post._id);
        onDelete?.(post._id);
      } catch {}
    }
    setShowMenu(false);
  };

  const isOwner = user?._id === (post.user?._id || post.user);
  const currentMedia = post.media?.[mediaIndex];

  return (
    <>
      <style>{cardStyle}</style>
      <article className="pc-wrap">

        {/* HEADER */}
        <div className="pc-header">
          <div className="pc-user-row">
            <Link to={`/${post.user?.username}`}>
              <Avatar src={post.user?.avatar} username={post.user?.username} size={36} />
            </Link>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link to={`/${post.user?.username}`} className="pc-username">
                {post.user?.username}
              </Link>
              {post.location && (
                <span className="pc-location">📍 {post.location}</span>
              )}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <button className="pc-menu-btn" onClick={() => setShowMenu(!showMenu)}>
              <AiOutlineMore size={18} />
            </button>
            {showMenu && (
              <div className="pc-dropdown">
                {isOwner && (
                  <button className="pc-dropdown-item danger" onClick={handleDelete}>
                    Remove Post
                  </button>
                )}
                <Link to={`/p/${post._id}`} className="pc-dropdown-item">
                  Open Post
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* MEDIA */}
        <div
          className="pc-media"
          onDoubleClick={handleDoubleClick}
          onTouchEnd={handleTap}
        >
          {currentMedia?.type === 'video' ? (
            <video src={currentMedia.url} controls />
          ) : (
            <img src={currentMedia?.url} alt="post media" />
          )}

          {post.media?.length > 1 && (
            <div className="pc-dots">
              {post.media.map((_, i) => (
                <button
                  key={i}
                  className={`pc-dot ${i === mediaIndex ? 'active' : ''}`}
                  onClick={() => setMediaIndex(i)}
                />
              ))}
            </div>
          )}

          {doubleClickLike && (
            <div className="pc-heart-burst">
              <AiFillHeart size={88} color="#fc5c9c" />
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="pc-actions">
          <div className="pc-action-row">
            <div className="pc-action-left">
              <button
                className={`pc-action-btn ${liked ? 'liked' : ''}`}
                onClick={handleLike}
                title="Like"
              >
                {liked ? <AiFillHeart size={24} /> : <AiOutlineHeart size={24} />}
              </button>

              <button
                className="pc-action-btn"
                onClick={() => setShowComments(true)}
                title="Comment"
              >
                <AiOutlineComment size={23} />
              </button>

              <button className="pc-action-btn" title="Share">
                <AiOutlineSend size={22} />
              </button>
            </div>

            <button
              className={`pc-action-btn ${saved ? 'saved' : ''}`}
              onClick={handleSave}
              title={saved ? 'Unsave' : 'Save'}
            >
              {saved ? <BsBookmarkFill size={20} /> : <BsBookmark size={20} />}
            </button>
          </div>

          {likesCount > 0 && (
            <p className="pc-likes">{likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}</p>
          )}

          {post.caption && (
            <p className="pc-caption">
              <Link to={`/${post.user?.username}`} style={{ fontWeight: 600, color: '#e8e6f0', marginRight: 6, textDecoration: 'none' }}>
                {post.user?.username}
              </Link>
              <CaptionText text={post.caption} />
            </p>
          )}

          {post.comments?.length > 0 && (
            <button
              className="pc-show-comments"
              onClick={() => setShowComments(!showComments)}
            >
              {showComments ? '▲ Hide replies' : `▼ View ${post.comments.length} ${post.comments.length === 1 ? 'reply' : 'replies'}`}
            </button>
          )}

          {showComments && (
            <div className="pc-comments-list">
              {post.comments.map(c => (
                <p key={c._id} className="pc-comment-row">
                  <Link to={`/${c.user?.username}`} style={{ fontWeight: 600, color: '#e8e6f0', marginRight: 6, textDecoration: 'none' }}>
                    {c.user?.username}
                  </Link>
                  {c.text}
                </p>
              ))}
            </div>
          )}

          <p className="pc-timestamp">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>

        {/* COMMENT INPUT */}
        <form className="pc-comment-form" onSubmit={handleComment}>
          <BsEmojiSmile size={17} style={{ color: '#3e3a54', flexShrink: 0 }} />
          <input
            ref={commentRef}
            className="pc-comment-input"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a reply…"
          />
          {comment.trim() && (
            <button type="submit" className="pc-reply-btn">Reply</button>
          )}
        </form>
      </article>
    </>
  );
};

const CaptionText = ({ text }) => {
  const parts = text.split(/(#\w+|@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('#')) {
      return <Link key={i} to={`/explore?tag=${part.slice(1)}`} className="pc-tag">{part}</Link>;
    }
    if (part.startsWith('@')) {
      return <Link key={i} to={`/${part.slice(1)}`} className="pc-tag">{part}</Link>;
    }
    return <span key={i}>{part}</span>;
  });
};

export default PostCard;