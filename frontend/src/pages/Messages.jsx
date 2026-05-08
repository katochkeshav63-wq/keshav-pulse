import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageAPI, userAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const msgStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .msg-root {
    display: flex;
    height: 100vh;
    background: #0a0a0f;
    color: #e8e6f0;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
  }

  /* ── SIDEBAR ── */
  .msg-sidebar {
    display: flex;
    flex-direction: column;
    width: 300px;
    flex-shrink: 0;
    border-right: 1px solid rgba(255,255,255,0.07);
    background: #131320;
  }

  @media (max-width: 767px) {
    .msg-sidebar { width: 100%; }
    .msg-sidebar.hidden-mobile { display: none; }
  }

  .msg-sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 18px 14px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .msg-sidebar-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .msg-compose-btn {
    width: 34px; height: 34px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.07);
    background: transparent;
    color: #6e6a80;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    transition: background 0.2s, color 0.2s;
  }
  .msg-compose-btn:hover { background: rgba(255,255,255,0.06); color: #e8e6f0; }

  .msg-convos {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }
  .msg-convos::-webkit-scrollbar { width: 3px; }
  .msg-convos::-webkit-scrollbar-thumb { background: rgba(124,92,252,0.2); border-radius: 2px; }

  .msg-convo-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 8px;
    color: #3e3a54;
    font-size: 13px;
    padding: 40px 0;
  }

  .msg-convo-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;
    position: relative;
  }
  .msg-convo-item:hover { background: rgba(255,255,255,0.04); }
  .msg-convo-item.active { background: rgba(124,92,252,0.1); }

  .msg-avatar-wrap {
    position: relative;
    flex-shrink: 0;
  }

  .msg-online-dot {
    position: absolute;
    bottom: 1px; right: 1px;
    width: 11px; height: 11px;
    background: #4ade80;
    border-radius: 50%;
    border: 2px solid #131320;
  }

  .msg-convo-info {
    flex: 1;
    min-width: 0;
  }

  .msg-convo-name {
    font-size: 13.5px;
    font-weight: 600;
    color: #e8e6f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .msg-convo-preview {
    font-size: 12px;
    color: #4a4660;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
  }

  .msg-unread-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    flex-shrink: 0;
  }

  /* ── CHAT AREA ── */
  .msg-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #0a0a0f;
  }

  /* Chat header */
  .msg-chat-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    background: #131320;
    flex-shrink: 0;
  }

  .msg-back-btn {
    display: none;
    align-items: center;
    justify-content: center;
    width: 34px; height: 34px;
    border-radius: 10px;
    border: none;
    background: rgba(255,255,255,0.05);
    color: #8a86a0;
    cursor: pointer;
    transition: background 0.2s;
  }
  .msg-back-btn:hover { background: rgba(255,255,255,0.09); }

  @media (max-width: 767px) {
    .msg-back-btn { display: flex; }
  }

  .msg-chat-name {
    font-size: 14px;
    font-weight: 600;
    color: #e8e6f0;
  }

  .msg-chat-status {
    font-size: 11.5px;
    color: #4a4660;
    margin-top: 1px;
  }

  .msg-chat-status.online { color: #4ade80; }

  /* Messages list */
  .msg-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px 20px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .msg-messages::-webkit-scrollbar { width: 3px; }
  .msg-messages::-webkit-scrollbar-thumb { background: rgba(124,92,252,0.15); border-radius: 2px; }

  .msg-row {
    display: flex;
  }
  .msg-row.mine { justify-content: flex-end; }
  .msg-row.theirs { justify-content: flex-start; }

  .msg-bubble {
    max-width: 68%;
    padding: 10px 14px;
    border-radius: 18px;
    font-size: 13.5px;
    line-height: 1.5;
    word-break: break-word;
  }

  .msg-bubble.mine {
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    color: #fff;
    border-bottom-right-radius: 5px;
  }

  .msg-bubble.theirs {
    background: #1e1d2e;
    color: #d4d0e8;
    border-bottom-left-radius: 5px;
    border: 1px solid rgba(255,255,255,0.06);
  }

  .msg-bubble img {
    border-radius: 10px;
    max-width: 100%;
  }

  /* Typing indicator */
  .msg-typing {
    font-size: 12px;
    color: #4a4660;
    padding: 0 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .msg-typing-dots {
    display: flex;
    gap: 3px;
    align-items: center;
  }

  .msg-typing-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #7c5cfc;
    animation: typingBounce 1.2s infinite ease-in-out;
  }
  .msg-typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .msg-typing-dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes typingBounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30%            { transform: translateY(-4px); opacity: 1; }
  }

  /* INPUT */
  .msg-input-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-top: 1px solid rgba(255,255,255,0.07);
    background: #131320;
    flex-shrink: 0;
  }

  .msg-input {
    flex: 1;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    padding: 10px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    color: #e8e6f0;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
  }
  .msg-input::placeholder { color: #3e3a54; }
  .msg-input:focus {
    border-color: rgba(124,92,252,0.45);
    background: rgba(124,92,252,0.04);
  }

  .msg-send-btn {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    border: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: opacity 0.2s, transform 0.15s;
  }
  .msg-send-btn:hover:not(:disabled) { opacity: 0.88; transform: scale(1.06); }
  .msg-send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* EMPTY chat pane */
  .msg-empty-pane {
    flex: 1;
    display: none;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 12px;
    color: #3e3a54;
    font-size: 13.5px;
  }

  @media (min-width: 768px) {
    .msg-empty-pane { display: flex; }
  }

  .msg-empty-icon {
    width: 64px; height: 64px;
    border-radius: 18px;
    background: rgba(124,92,252,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    margin-bottom: 4px;
  }
`;

const Messages = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [text, setText] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const activeUserRef = useRef(null);

  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current.emit('user_connected', user._id);
    socketRef.current.on('online_users', (users) => setOnlineUsers(users));
    socketRef.current.on('receive_message', (msg) => {
      const senderId = msg.sender?._id || msg.sender;
      if (String(senderId) === String(activeUserRef.current?._id)) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    socketRef.current.on('user_typing', ({ senderId }) => {
      if (String(senderId) === String(activeUserRef.current?._id)) setTyping(true);
    });
    socketRef.current.on('user_stop_typing', ({ senderId }) => {
      if (String(senderId) === String(activeUserRef.current?._id)) setTyping(false);
    });
    return () => socketRef.current?.disconnect();
  }, [user._id]);

  useEffect(() => {
    messageAPI.getInbox()
      .then(({ data }) => setConversations(data.conversations || []))
      .catch(() => {})
      .finally(() => setLoadingConvos(false));
  }, []);

  useEffect(() => {
    if (!userId) { setActiveUser(null); setMessages([]); return; }
    setLoadingMsgs(true);
    setMessages([]);
    setActiveUser(null);
    userAPI.getProfile(userId)
      .then(({ data }) => {
        const fetchedUser = data.user;
        setActiveUser(fetchedUser);
        return messageAPI.getConversation(fetchedUser._id);
      })
      .then(({ data }) => setMessages(data.messages || []))
      .catch(() => navigate('/messages'))
      .finally(() => setLoadingMsgs(false));
  }, [userId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeUser || sending) return;
    setSending(true);
    const msgText = text;
    setText('');
    const tempMsg = {
      _id: Date.now().toString(),
      sender: user,
      receiver: activeUser,
      text: msgText,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    setMessages((prev) => [...prev, tempMsg]);
    try {
      const { data } = await messageAPI.send({ receiverId: activeUser._id, text: msgText });
      setMessages((prev) => prev.map((m) => (m._id === tempMsg._id ? data.message : m)));
      socketRef.current?.emit('send_message', { ...data.message, receiverId: activeUser._id });
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
      setText(msgText);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (activeUser) {
      socketRef.current?.emit('typing', { receiverId: activeUser._id, senderId: user._id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('stop_typing', { receiverId: activeUser._id, senderId: user._id });
      }, 1500);
    }
  };

  const isOnline = (uid) => onlineUsers.includes(String(uid));

  return (
    <>
      <style>{msgStyle}</style>
      <div className="msg-root">

        {/* ── SIDEBAR ── */}
        <div className={`msg-sidebar ${userId ? 'hidden-mobile' : ''}`}>
          <div className="msg-sidebar-header">
            <span className="msg-sidebar-title">Inbox</span>
            <button className="msg-compose-btn">✏️</button>
          </div>

          <div className="msg-convos">
            {loadingConvos ? (
              <LoadingSpinner />
            ) : conversations.length === 0 ? (
              <div className="msg-convo-empty">
                <span style={{ fontSize: 28 }}>💬</span>
                <span>No conversations yet</span>
              </div>
            ) : (
              conversations.map(({ user: u, lastMessage, unreadCount }) => (
                <button
                  key={u._id}
                  className={`msg-convo-item ${userId === u.username ? 'active' : ''}`}
                  onClick={() => navigate(`/messages/${u.username}`)}
                >
                  <div className="msg-avatar-wrap">
                    <Avatar src={u.avatar} username={u.username} size={46} />
                    {isOnline(u._id) && <span className="msg-online-dot" />}
                  </div>

                  <div className="msg-convo-info">
                    <p className="msg-convo-name">{u.username}</p>
                    <p className="msg-convo-preview">
                      {lastMessage?.text || 'Media'} ·{' '}
                      {formatDistanceToNow(new Date(lastMessage?.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  {unreadCount > 0 && <div className="msg-unread-dot" />}
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── CHAT AREA ── */}
        {userId && activeUser ? (
          <div className="msg-chat">

            {/* Header */}
            <div className="msg-chat-header">
              <button className="msg-back-btn" onClick={() => navigate('/messages')}>
                <AiOutlineArrowLeft size={17} />
              </button>

              <Avatar src={activeUser.avatar} username={activeUser.username} size={38} />

              <div>
                <p className="msg-chat-name">{activeUser.username}</p>
                <p className={`msg-chat-status ${isOnline(activeUser._id) ? 'online' : ''}`}>
                  {isOnline(activeUser._id) ? '● Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="msg-messages">
              {loadingMsgs ? (
                <LoadingSpinner />
              ) : (
                <>
                  {messages.map((msg) => {
                    const isMine = msg.sender?._id === user._id || msg.sender === user._id;
                    return (
                      <div key={msg._id} className={`msg-row ${isMine ? 'mine' : 'theirs'}`}>
                        <div className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>
                          {msg.media
                            ? <img src={msg.media.url} alt="media" />
                            : msg.text
                          }
                        </div>
                      </div>
                    );
                  })}

                  {typing && (
                    <div className="msg-typing">
                      <div className="msg-typing-dots">
                        <div className="msg-typing-dot" />
                        <div className="msg-typing-dot" />
                        <div className="msg-typing-dot" />
                      </div>
                      <span>{activeUser.username} is typing</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <form className="msg-input-bar" onSubmit={handleSend}>
              <input
                className="msg-input"
                type="text"
                value={text}
                onChange={handleTyping}
                placeholder={`Message ${activeUser.username}…`}
              />
              <button type="submit" className="msg-send-btn" disabled={!text.trim()}>
                {/* Paper plane icon */}
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        ) : (
          <div className="msg-empty-pane">
            <div className="msg-empty-icon">💬</div>
            <span>Pick a conversation to start chatting</span>
          </div>
        )}

      </div>
    </>
  );
};

export default Messages;