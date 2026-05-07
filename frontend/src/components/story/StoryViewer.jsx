import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { storyAPI } from '../../utils/api';
import Avatar from '../ui/Avatar';
import { AiOutlineClose, AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { formatDistanceToNow } from 'date-fns';

const STORY_DURATION = 5000;

const viewerStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');

  .sv-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
  }

  /* NAV ARROWS */
  .sv-nav {
    position: absolute;
    z-index: 30;
    width: 42px; height: 42px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(8px);
    color: rgba(255,255,255,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, transform 0.15s;
  }
  .sv-nav:hover {
    background: rgba(255,255,255,0.14);
    color: #fff;
    transform: scale(1.08);
  }
  .sv-nav.left  { left: 20px; }
  .sv-nav.right { right: 20px; }

  /* CARD */
  .sv-card {
    position: relative;
    width: 100%;
    max-width: 400px;
    height: 100%;
    max-height: 710px;
    border-radius: 26px;
    overflow: hidden;
    background: #0a0a0f;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.07),
      0 32px 80px rgba(0,0,0,0.8),
      0 0 60px rgba(124,92,252,0.08);
  }

  /* PROGRESS BARS */
  .sv-progress-row {
    display: flex;
    gap: 4px;
    margin-bottom: 12px;
  }

  .sv-progress-track {
    flex: 1;
    height: 2.5px;
    background: rgba(255,255,255,0.18);
    border-radius: 2px;
    overflow: hidden;
  }

  .sv-progress-fill {
    height: 100%;
    border-radius: 2px;
    background: #fff;
    transition: none;
  }

  .sv-progress-fill.complete {
    background: linear-gradient(90deg, #7c5cfc, #fc5c9c);
  }

  /* TOP OVERLAY */
  .sv-top {
    position: absolute;
    top: 0; left: 0; right: 0;
    z-index: 20;
    padding: 14px 16px 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 100%);
  }

  .sv-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sv-user-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sv-username {
    font-size: 13.5px;
    font-weight: 600;
    color: #fff;
    text-decoration: none;
    font-family: 'DM Sans', sans-serif;
  }

  .sv-time {
    font-size: 11px;
    color: rgba(255,255,255,0.45);
  }

  .sv-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px; height: 32px;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    border: none;
    color: rgba(255,255,255,0.7);
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .sv-close-btn:hover {
    background: rgba(255,255,255,0.2);
    color: #fff;
  }

  /* MEDIA */
  .sv-media {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sv-media img,
  .sv-media video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  /* BOTTOM OVERLAY */
  .sv-bottom {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    z-index: 20;
    padding: 0 16px 20px;
    background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%);
  }

  .sv-caption {
    font-size: 13.5px;
    color: rgba(255,255,255,0.88);
    line-height: 1.5;
    margin-bottom: 12px;
  }

  .sv-bottom-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .sv-like-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px; height: 40px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    border: none;
    cursor: pointer;
    color: rgba(255,255,255,0.7);
    transition: background 0.2s, transform 0.2s;
  }
  .sv-like-btn:hover {
    background: rgba(252,92,156,0.18);
    transform: scale(1.1);
  }
  .sv-like-btn.liked {
    background: rgba(252,92,156,0.15);
    color: #fc5c9c;
  }

  /* LIKE POP */
  @keyframes likePop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.35); }
    70%  { transform: scale(0.9); }
    100% { transform: scale(1); }
  }
  .sv-like-btn.liked svg {
    animation: likePop 0.35s ease-out;
  }

  /* PAUSE INDICATOR */
  .sv-paused-badge {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.5);
    border-radius: 50%;
    width: 52px; height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 25;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
  }
  .sv-paused-badge.visible { opacity: 1; }

  /* TAP ZONES */
  .sv-taps {
    position: absolute;
    inset: 0;
    display: flex;
    z-index: 10;
  }
  .sv-tap { flex: 1; }
`;

const StoryViewer = ({ group, onClose, onPrev, onNext, hasPrev, hasNext }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [liked, setLiked] = useState(false);

  const startTimeRef = useRef(null);
  const elapsedRef = useRef(0);
  const animFrameRef = useRef(null);

  const currentStory = group.stories[currentIndex];

  const goToNext = useCallback(() => {
    if (currentIndex < group.stories.length - 1) {
      setCurrentIndex(i => i + 1);
      setProgress(0);
      elapsedRef.current = 0;
    } else {
      onNext ? onNext() : onClose();
    }
  }, [currentIndex, group.stories.length, onNext, onClose]);

  useEffect(() => {
    if (paused) {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const duration = currentStory?.media?.type === 'video' ? 15000 : STORY_DURATION;
    startTimeRef.current = performance.now() - elapsedRef.current;

    const animate = (now) => {
      const elapsed = now - startTimeRef.current;
      elapsedRef.current = elapsed;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);

      if (pct < 100) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        goToNext();
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [currentIndex, paused, goToNext, currentStory]);

  useEffect(() => {
    if (currentStory?._id) {
      storyAPI.view(currentStory._id).catch(() => {});
    }
  }, [currentStory?._id]);

  const handleTapLeft = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setProgress(0);
      elapsedRef.current = 0;
    } else {
      onPrev?.();
    }
  };

  return (
    <>
      <style>{viewerStyle}</style>
      <div className="sv-overlay">

        {/* LEFT NAV */}
        {hasPrev && (
          <button className="sv-nav left" onClick={onPrev}>
            <BsChevronLeft size={18} />
          </button>
        )}

        {/* CARD */}
        <div
          className="sv-card"
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >

          {/* TOP */}
          <div className="sv-top">
            {/* Progress bars */}
            <div className="sv-progress-row">
              {group.stories.map((_, i) => (
                <div key={i} className="sv-progress-track">
                  <div
                    className={`sv-progress-fill ${i < currentIndex ? 'complete' : ''}`}
                    style={{
                      width: i < currentIndex
                        ? '100%'
                        : i === currentIndex
                          ? `${progress}%`
                          : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="sv-header-row">
              <div className="sv-user-row">
                <Avatar src={group.user.avatar} username={group.user.username} size={34} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Link to={`/${group.user.username}`} onClick={onClose} className="sv-username">
                    {group.user.username}
                  </Link>
                  <span className="sv-time">
                    {formatDistanceToNow(new Date(currentStory?.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <button className="sv-close-btn" onClick={onClose}>
                <AiOutlineClose size={16} />
              </button>
            </div>
          </div>

          {/* MEDIA */}
          <div className="sv-media">
            {currentStory?.media?.type === 'video' ? (
              <video
                key={currentStory._id}
                src={currentStory.media.url}
                autoPlay
                playsInline
              />
            ) : (
              <img
                key={currentStory._id}
                src={currentStory?.media?.url}
                alt="moment"
              />
            )}
          </div>

          {/* PAUSE BADGE */}
          <div className={`sv-paused-badge ${paused ? 'visible' : ''}`}>
            <svg width="18" height="20" viewBox="0 0 18 20" fill="rgba(255,255,255,0.8)">
              <rect x="0" y="0" width="6" height="20" rx="2" />
              <rect x="10" y="0" width="6" height="20" rx="2" />
            </svg>
          </div>

          {/* BOTTOM */}
          <div className="sv-bottom">
            {currentStory?.caption && (
              <p className="sv-caption">{currentStory.caption}</p>
            )}
            <div className="sv-bottom-row">
              <button
                className={`sv-like-btn ${liked ? 'liked' : ''}`}
                onClick={() => setLiked(l => !l)}
              >
                {liked
                  ? <AiFillHeart size={22} />
                  : <AiOutlineHeart size={22} />
                }
              </button>
            </div>
          </div>

          {/* TAP ZONES */}
          <div className="sv-taps">
            <div className="sv-tap" onClick={handleTapLeft} />
            <div className="sv-tap" onClick={goToNext} />
          </div>
        </div>

        {/* RIGHT NAV */}
        {hasNext && (
          <button className="sv-nav right" onClick={onNext}>
            <BsChevronRight size={18} />
          </button>
        )}
      </div>
    </>
  );
};

export default StoryViewer;