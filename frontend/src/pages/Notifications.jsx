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
  story_like: 'liked your story.',
};

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
      className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-300
        ${following
          ? 'bg-white/10 text-gray-300 hover:bg-white/20'
          : 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white hover:opacity-90 shadow-md'
        }`}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  );
};

const NotificationItem = ({ notification }) => {
  const n = notification;

  const text =
    typeof NOTIF_TEXT[n.type] === 'function'
      ? NOTIF_TEXT[n.type](n)
      : NOTIF_TEXT[n.type] || '';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 transition-all duration-200
        ${!n.isRead
          ? 'bg-white/5 backdrop-blur border-l-2 border-pink-500'
          : 'hover:bg-white/5'
        }`}
    >
      <Link to={`/${n.sender?.username}`}>
        <Avatar src={n.sender?.avatar} username={n.sender?.username} size={44} />
      </Link>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 leading-snug">
          <Link to={`/${n.sender?.username}`} className="font-semibold hover:underline">
            {n.sender?.username}
          </Link>{' '}
          {text}{' '}
          <span className="text-gray-500 text-xs">
            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
          </span>
        </p>
      </div>

      <div className="flex-shrink-0">
        {n.type === 'follow' ? (
          <FollowButton userId={n.sender?._id} />
        ) : n.post ? (
          <Link to={`/p/${n.post._id}`}>
            <img
              src={n.post.media?.[0]?.url}
              alt=""
              className="w-11 h-11 object-cover rounded-lg border border-white/10"
            />
          </Link>
        ) : null}
      </div>
    </div>
  );
};

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

  const today = notifications.filter(n => (now - new Date(n.createdAt)) < 86400000);

  const thisWeek = notifications.filter(n => {
    const diff = now - new Date(n.createdAt);
    return diff >= 86400000 && diff < 604800000;
  });

  const older = notifications.filter(n => (now - new Date(n.createdAt)) >= 604800000);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#121212] to-black text-white pb-20 md:pb-4">

      <div className="max-w-[600px] mx-auto">

        {/* Header */}
        <div className="px-4 py-4 sticky top-0 backdrop-blur-xl bg-black/40 border-b border-white/10 z-10">
          <h1 className="text-lg font-semibold tracking-tight">Notifications</h1>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 px-6">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-5">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>

            <h3 className="text-lg font-semibold mb-1">No notifications yet</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              When people interact with you, you'll see it here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">

            {today.length > 0 && (
              <section>
                <p className="text-xs uppercase tracking-wide text-gray-500 px-4 py-3">Today</p>
                {today.map(n => <NotificationItem key={n._id} notification={n} />)}
              </section>
            )}

            {thisWeek.length > 0 && (
              <section>
                <p className="text-xs uppercase tracking-wide text-gray-500 px-4 py-3">This week</p>
                {thisWeek.map(n => <NotificationItem key={n._id} notification={n} />)}
              </section>
            )}

            {older.length > 0 && (
              <section>
                <p className="text-xs uppercase tracking-wide text-gray-500 px-4 py-3">Earlier</p>
                {older.map(n => <NotificationItem key={n._id} notification={n} />)}
              </section>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default Notifications;