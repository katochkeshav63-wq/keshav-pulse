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

const Messages = () => {
  const { userId } = useParams(); // this is actually a username from the URL
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

  // FIX: Keep a ref of activeUser so socket listeners always have the latest value
  const activeUserRef = useRef(null);
  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);

  // Init socket
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current.emit('user_connected', user._id);

    socketRef.current.on('online_users', (users) => setOnlineUsers(users));

    // FIX: Use activeUserRef instead of activeUser to avoid stale closure
    socketRef.current.on('receive_message', (msg) => {
      const senderId = msg.sender?._id || msg.sender;
      if (String(senderId) === String(activeUserRef.current?._id)) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socketRef.current.on('user_typing', ({ senderId }) => {
      if (String(senderId) === String(activeUserRef.current?._id)) {
        setTyping(true);
      }
    });

    socketRef.current.on('user_stop_typing', ({ senderId }) => {
      if (String(senderId) === String(activeUserRef.current?._id)) {
        setTyping(false);
      }
    });

    return () => socketRef.current?.disconnect();
  }, [user._id]);

  // Load conversations
  useEffect(() => {
    messageAPI
      .getInbox()
      .then(({ data }) => setConversations(data.conversations || []))
      .catch(() => {})
      .finally(() => setLoadingConvos(false));
  }, []);

  // FIX: Load messages by first fetching the user profile to get the real _id,
  // then use that _id to fetch the conversation (not the username string).
  useEffect(() => {
    if (!userId) {
      setActiveUser(null);
      setMessages([]);
      return;
    }

    setLoadingMsgs(true);
    setMessages([]);
    setActiveUser(null);

    userAPI
      .getProfile(userId) // userId here is a username
      .then(({ data }) => {
        const fetchedUser = data.user;
        setActiveUser(fetchedUser);

        // Now use the real MongoDB _id to fetch messages
        return messageAPI.getConversation(fetchedUser._id);
      })
      .then(({ data }) => setMessages(data.messages || []))
      .catch(() => navigate('/messages'))
      .finally(() => setLoadingMsgs(false));
  }, [userId, navigate]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeUser || sending) return;
    setSending(true);
    const msgText = text;
    setText('');

    // Optimistic update
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
      const { data } = await messageAPI.send({
        receiverId: activeUser._id,
        text: msgText,
      });
      setMessages((prev) =>
        prev.map((m) => (m._id === tempMsg._id ? data.message : m))
      );
      // Emit via socket
      socketRef.current?.emit('send_message', {
        ...data.message,
        receiverId: activeUser._id,
      });
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
      socketRef.current?.emit('typing', {
        receiverId: activeUser._id,
        senderId: user._id,
      });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('stop_typing', {
          receiverId: activeUser._id,
          senderId: user._id,
        });
      }, 1500);
    }
  };

  const isOnline = (uid) => onlineUsers.includes(String(uid));

  return (
    <div className="flex h-screen bg-[#0f0f14] text-gray-200 overflow-hidden">

      {/* SIDEBAR */}
      <div
        className={`${
          userId ? 'hidden md:flex' : 'flex'
        } flex-col w-full md:w-80 border-r border-white/10 bg-[#15151c]/80 backdrop-blur-xl`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
          <span className="font-semibold">{user.username}</span>
          <button className="p-2 rounded-lg hover:bg-white/10 transition">✏️</button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loadingConvos ? (
            <LoadingSpinner />
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p>No messages yet</p>
            </div>
          ) : (
            conversations.map(({ user: u, lastMessage, unreadCount }) => (
              <button
                key={u._id}
                onClick={() => navigate(`/messages/${u.username}`)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition
                  ${userId === u.username ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                <div className="relative">
                  <Avatar src={u.avatar} username={u.username} size={46} />
                  {isOnline(u._id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#15151c]" />
                  )}
                </div>

                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">{u.username}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {lastMessage?.text || 'Media'} ·{' '}
                    {formatDistanceToNow(new Date(lastMessage?.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                {unreadCount > 0 && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* CHAT AREA */}
      {userId && activeUser ? (
        <div className="flex-1 flex flex-col">

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 bg-[#15151c]/80 backdrop-blur-xl">
            <button
              onClick={() => navigate('/messages')}
              className="md:hidden"
            >
              <AiOutlineArrowLeft size={20} />
            </button>

            <Avatar
              src={activeUser.avatar}
              username={activeUser.username}
              size={40}
            />

            <div>
              <p className="text-sm font-semibold">{activeUser.username}</p>
              <p className="text-xs text-gray-400">
                {isOnline(activeUser._id) ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            {loadingMsgs ? (
              <LoadingSpinner />
            ) : (
              <>
                {messages.map((msg) => {
                  const isMine =
                    msg.sender?._id === user._id ||
                    msg.sender === user._id;

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow
                          ${
                            isMine
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-[#1e1e28] text-gray-200'
                          }`}
                      >
                        {msg.media ? (
                          <img
                            src={msg.media.url}
                            alt=""
                            className="rounded-lg"
                          />
                        ) : (
                          msg.text
                        )}
                      </div>
                    </div>
                  );
                })}

                {typing && (
                  <p className="text-xs text-gray-400">Typing...</p>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* INPUT */}
          <form
            onSubmit={handleSend}
            className="p-4 border-t border-white/10 flex items-center gap-3 bg-[#15151c]/80 backdrop-blur-xl"
          >
            <input
              type="text"
              value={text}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="flex-1 bg-[#1e1e28] border border-white/10 rounded-full px-4 py-2 text-sm outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
          Select a conversation
        </div>
      )}
    </div>
  );
};

export default Messages;