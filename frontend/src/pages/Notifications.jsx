import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationAPI, userAPI } from '../utils/api';
import Avatar from '../components/ui/Avatar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const NOTIF_TEXT = {
  like: 'liked your photo.',
  comment: (n) => `commented: ${n.comment || ''}`,
  follow: 'started following you.',
  mention: 'mentioned you in a comment.',
  tag: 'tagged you in a photo.',
  reply: 'replied to your comment.',
  story_like: 'liked your moment.',
};

/* ── type → emoji/icon config ── */
const NOTIF_META = {
  like:       { emoji: '❤️',  accent: '#fc5c9c' },
  comment:    { emoji: '💬',  accent: '#7c5cfc' },
  follow:     { emoji: '👤',  accent: '#7c5cfc' },
  mention:    { emoji: '📣',  accent: '#fc5c9c' },
  tag:        { emoji: '🏷️', accent: '#7c5cfc' },
  reply:      { emoji: '↩️',  accent: '#7c5cfc' },
  story_like: { emoji: '⚡',  accent: '#fc5c9c' },
};

const notifStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .nf-page {
    min-height: 100vh;
    background: #0a0a0f;
    color: #e8e6f0;
    font-family: 'DM Sans', sans-serif;
    padding-bottom: 80px;
  }

  @media (min-width: 768px) {
    .nf-page { padding-bottom: 16px; }
  }

  .nf-container {
    max-width: 600px;
    margin: 0 auto;
  }

  /* STICKY HEADER */
  .nf-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: rgba(10,10,15,0.85);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(255,255,255,0.07);
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nf-title {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 700;
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .nf-mark-all {
    font-size: 12px;
    font-weight: 600;
    color: #7c5cfc;
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    padding: 4px 8px;
    border-radius: 8px;
    transition: background 0.2s;
  }
  .nf-mark-all:hover { background: rgba(124,92,252,0.1); }

  /* SECTION LABEL */
  .nf-section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.1px;
    text-transform: uppercase;
    color: #3e3a54;
    padding: 16px 20px 8px;
  }

  /* NOTIFICATION ITEM */
  .nf-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    transition: background 0.15s;
    position: relative;
    cursor: default;
  }

  .nf-item:hover { background: rgba(255,255,255,0.03); }

  .nf-item.unread {
    background: rgba(124,92,252,0.06);
  }

  .nf-item.unread::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    border-radius: 0 2px 2px 0;
    background: linear-gradient(180deg, #7c5cfc, #fc5c9c);
  }

  /* Avatar with type badge */
  .nf-avatar-wrap {
    position: relative;
    flex-shrink: 0;
  }

  .nf-type-badge {
    position: absolute;
    bottom: -2px; right: -2px;
    width: 20px; height: 20px;
    border-radius: 50%;
    background: #1c1b2e;
    border: 2px solid #0a0a0f;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    line-height: 1;
  }

  .nf-body {
    flex: 1;
    min-width: 0;
  }

  .nf-text {
    font-size: 13.5px;
    color: #c0bcd4;
    line-height: 1.5;
  }

  .nf-sender {
    font-weight: 600;
    color: #e8e6f0;
    text-decoration: none;
    transition: color 0.15s;
  }
  .nf-sender:hover { color: #7c5cfc; }

  .nf-time {
    font-size: 11px;
    color: #3e3a54;
    display: block;
    margin-top: 3px;
  }

  /* Post thumbnail */
  .nf-thumb {
    width: 44px; height: 44px;
    border-radius: 10px;
    object-fit: cover;
    border: 1px solid rgba(255,255,255,0.07);
    flex-shrink: 0;
    transition: opacity 0.2s;
  }
  .nf-thumb:hover { opacity: 0.8; }

  /* Follow button */
  .nf-follow-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    padding: 7px 16px;
    border-radius: 20px;
    border: none;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.15s;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .nf-follow-btn.not-following {
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    color: #fff;
    box-shadow: 0 4px 14px rgba(124,92,252,0.3);
  }
  .nf-follow-btn.not-following:hover { opacity: 0.88; transform: scale(1.03); }

  .nf-follow-btn.is-following {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.12);
    color: #6e6a80;
  }
  .nf-follow-btn.is-following:hover {
    background: rgba(255,255,255,0.05);
    color: #e8e6f0;
  }

  /* EMPTY STATE */
  .nf-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 80px 24px;
    gap: 12px;
  }

  .nf-empty-icon {
    width: 72px; height: 72px;
    border-radius: 22px;
    background: rgba(124,92,252,0.08);
    border: 1px solid rgba(124,92,252,0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    margin-bottom: 8px;
  }

  .nf-empty h3 {
    font-family: 'Syne', sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: #e8e6f0;
  }

  .nf-empty p {
    font-size: 13px;
    color: #4a4660;
    max-width: 260px;
    line-height: 1.6;
  }

  /* DIVIDER between sections */
  .nf-section-divider {
    height: 1px;
    background: rgba(255,255,255,0.05);
    margin: 4px 0;
  }
`;

/* ── Follow Button ── */
const FollowButton = ({ userId }) => {
  const [following, setFollowing] = useState(false);

  const handleFollow = async () => {
    setFollowing(f => !f);
    try {
      await userAPI.follow(userId);
    } catch {
      setFollowing(f => !f);
    }
  };

  return (
    <button
      onClick={handleFollow}
      className={`nf-follow-btn ${following ? 'is-following' : 'not-following'}`}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  );
};

/* ── Notification Item ── */
const NotificationItem = ({ notification }) => {
  const n = notification;
  const text = typeof NOTIF_TEXT[n.type] === 'function'
    ? NOTIF_TEXT[n.type](n)
    : NOTIF_TEXT[n.type] || '';

  const meta = NOTIF_META[n.type] || { emoji: '🔔', accent: '#7c5cfc' };

  return (
    <div className={`nf-item ${!n.isRead ? 'unread' : ''}`}>
      {/* Avatar + badge */}
      <div className="nf-avatar-wrap">
        <Link to={`/${n.sender?.username}`}>
          <Avatar src={n.sender?.avatar} username={n.sender?.username} size={44} />
        </Link>
        <div className="nf-type-badge">{meta.emoji}</div>
      </div>

      {/* Body */}
      <div className="nf-body">
        <p className="nf-text">
          <Link to={`/${n.sender?.username}`} className="nf-sender">
            {n.sender?.username}
          </Link>{' '}
          {text}
        </p>
        <span className="nf-time">
          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
        </span>
      </div>

      {/* Action */}
      <div style={{ flexShrink: 0 }}>
        {n.type === 'follow' ? (
          <FollowButton userId={n.sender?._id} />
        ) : n.post ? (
          <Link to={`/p/${n.post._id}`}>
            <img
              src={n.post.media?.[0]?.url}
              alt="post"
              className="nf-thumb"
            />
          </Link>
        ) : null}
      </div>
    </div>
  );
};

/* ── Notifications Page ── */
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationAPI.getAll()
      .then(({ data }) => setNotifications(data.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    notificationAPI.markRead().catch(() => {});
  }, []);

  const now = new Date();
  const today    = notifications.filter(n => (now - new Date(n.createdAt)) < 86400000);
  const thisWeek = notifications.filter(n => { const d = now - new Date(n.createdAt); return d >= 86400000 && d < 604800000; });
  const older    = notifications.filter(n => (now - new Date(n.createdAt)) >= 604800000);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <>
      <style>{notifStyle}</style>
      <div className="nf-page">
        <div className="nf-container">

          {/* Header */}
          <div className="nf-header">
            <span className="nf-title">Activity</span>
            {notifications.length > 0 && (
              <button className="nf-mark-all">Mark all read</button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="nf-empty">
              <div className="nf-empty-icon">🔔</div>
              <h3>All quiet here</h3>
              <p>When people like, comment, or follow you, it'll show up here.</p>
            </div>
          ) : (
            <>
              {today.length > 0 && (
                <section>
                  <p className="nf-section-label">Today</p>
                  {today.map(n => <NotificationItem key={n._id} notification={n} />)}
                </section>
              )}

              {thisWeek.length > 0 && (
                <>
                  {today.length > 0 && <div className="nf-section-divider" />}
                  <section>
                    <p className="nf-section-label">This Week</p>
                    {thisWeek.map(n => <NotificationItem key={n._id} notification={n} />)}
                  </section>
                </>
              )}

              {older.length > 0 && (
                <>
                  {(today.length > 0 || thisWeek.length > 0) && <div className="nf-section-divider" />}
                  <section>
                    <p className="nf-section-label">Earlier</p>
                    {older.map(n => <NotificationItem key={n._id} notification={n} />)}
                  </section>
                </>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
};

export default Notifications;