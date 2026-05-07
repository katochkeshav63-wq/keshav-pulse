import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import CreatePostModal from '../post/CreatePostModal'
import SearchModal from '../ui/SearchModal'
import Avatar from '../ui/Avatar'
import {
  AiOutlineHome, AiFillHome,
  AiOutlineHeart, AiFillHeart,
  AiOutlinePlusSquare,
  AiOutlineMessage, AiFillMessage,
  AiOutlineMenu,
} from 'react-icons/ai'
import { BsSearch, BsCameraReels, BsCameraReelsFill } from 'react-icons/bs'

/* ─── Inline styles injected once ─── */
const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --pulse-bg: #0a0a0f;
    --pulse-surface: #12121a;
    --pulse-border: rgba(255,255,255,0.07);
    --pulse-accent: #7c5cfc;
    --pulse-accent2: #fc5c9c;
    --pulse-text: #e8e6f0;
    --pulse-muted: #6e6a80;
    --pulse-hover: rgba(124,92,252,0.12);
    --pulse-active: rgba(124,92,252,0.2);
    --sidebar-w: 240px;
    --sidebar-icon-w: 72px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--pulse-bg);
    color: var(--pulse-text);
  }

  .pulse-layout {
    display: flex;
    min-height: 100vh;
    background: var(--pulse-bg);
  }

  /* ── SIDEBAR ── */
  .pulse-sidebar {
    position: fixed;
    left: 0; top: 0;
    height: 100%;
    width: var(--sidebar-w);
    background: var(--pulse-surface);
    border-right: 1px solid var(--pulse-border);
    display: flex;
    flex-direction: column;
    padding: 20px 12px;
    z-index: 40;
    transition: width 0.3s ease;
  }

  /* collapsed to icon-only on lg (1024–1279) */
  @media (max-width: 1279px) and (min-width: 768px) {
    .pulse-sidebar { width: var(--sidebar-icon-w); }
    .pulse-main    { margin-left: var(--sidebar-icon-w); }
    .pulse-label   { display: none !important; }
    .pulse-logo-full { display: none !important; }
    .pulse-logo-short { display: flex !important; }
  }

  /* hidden on mobile */
  @media (max-width: 767px) {
    .pulse-sidebar { display: none; }
    .pulse-main    { margin-left: 0 !important; padding-bottom: 72px; }
  }

  .pulse-logo {
    padding: 8px 10px 20px;
    margin-bottom: 4px;
  }

  .pulse-logo-full {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, var(--pulse-accent), var(--pulse-accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .pulse-logo-short {
    display: none;
    width: 36px; height: 36px;
    background: linear-gradient(135deg, var(--pulse-accent), var(--pulse-accent2));
    border-radius: 10px;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 15px;
    color: #fff;
  }

  .pulse-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .pulse-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 12px;
    border-radius: 14px;
    cursor: pointer;
    border: none;
    background: transparent;
    color: var(--pulse-muted);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.2s, color 0.2s, transform 0.15s;
    width: 100%;
    text-align: left;
  }

  .pulse-nav-item:hover {
    background: var(--pulse-hover);
    color: var(--pulse-text);
    transform: translateX(2px);
  }

  .pulse-nav-item.active {
    background: var(--pulse-active);
    color: #fff;
  }

  .pulse-nav-item.active .pulse-icon {
    color: var(--pulse-accent);
  }

  .pulse-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    flex-shrink: 0;
    transition: color 0.2s;
  }

  .pulse-label {
    white-space: nowrap;
    overflow: hidden;
  }

  .pulse-divider {
    height: 1px;
    background: var(--pulse-border);
    margin: 10px 4px;
  }

  /* More menu popup */
  .pulse-more-popup {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    width: 220px;
    background: #1c1b26;
    border: 1px solid var(--pulse-border);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    padding: 8px;
    overflow: hidden;
  }

  .pulse-more-popup button {
    display: block;
    width: 100%;
    text-align: left;
    padding: 10px 14px;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    background: transparent;
    border: none;
    color: var(--pulse-text);
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .pulse-more-popup button:hover {
    background: var(--pulse-hover);
  }

  .pulse-more-popup button.danger {
    color: #f87171;
  }

  /* ── MAIN ── */
  .pulse-main {
    flex: 1;
    margin-left: var(--sidebar-w);
    min-height: 100vh;
    background: var(--pulse-bg);
  }

  .pulse-main-inner {
    max-width: 900px;
    margin: 0 auto;
    padding: 28px 20px;
  }

  /* ── MOBILE NAV ── */
  .pulse-mobile-nav {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: rgba(18, 18, 26, 0.95);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid var(--pulse-border);
    z-index: 40;
  }

  @media (max-width: 767px) {
    .pulse-mobile-nav { display: flex; }
  }

  .pulse-mobile-nav a,
  .pulse-mobile-nav button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 14px 0;
    color: var(--pulse-muted);
    background: transparent;
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: color 0.2s, transform 0.15s;
    position: relative;
  }

  .pulse-mobile-nav a:hover,
  .pulse-mobile-nav button:hover {
    color: var(--pulse-text);
    transform: translateY(-2px);
  }

  .pulse-mobile-nav a.active-mobile {
    color: var(--pulse-accent);
  }

  .pulse-mobile-nav a.active-mobile::after {
    content: '';
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px; height: 4px;
    border-radius: 50%;
    background: var(--pulse-accent);
  }

  /* Create button glow */
  .pulse-create-btn .pulse-icon {
    color: var(--pulse-accent2);
  }

  .pulse-create-btn:hover .pulse-icon {
    filter: drop-shadow(0 0 6px var(--pulse-accent2));
  }
`

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const navItems = [
    {
      to: '/',
      label: 'Feed',
      icon: <AiOutlineHome size={22} />,
      activeIcon: <AiFillHome size={22} />,
      end: true,
    },
    {
      label: 'Discover',
      icon: <BsSearch size={20} />,
      activeIcon: <BsSearch size={20} />,
      onClick: () => setShowSearch(true),
    },
    {
      to: '/reels',
      label: 'Clips',
      icon: <BsCameraReels size={20} />,
      activeIcon: <BsCameraReelsFill size={20} />,
    },
    {
      to: '/messages',
      label: 'Inbox',
      icon: <AiOutlineMessage size={22} />,
      activeIcon: <AiFillMessage size={22} />,
    },
    {
      to: '/notifications',
      label: 'Activity',
      icon: <AiOutlineHeart size={22} />,
      activeIcon: <AiFillHeart size={22} />,
    },
    {
      label: 'New Post',
      icon: <AiOutlinePlusSquare size={22} />,
      activeIcon: <AiOutlinePlusSquare size={22} />,
      onClick: () => setShowCreate(true),
      className: 'pulse-create-btn',
    },
  ]

  return (
    <>
      <style>{globalStyle}</style>

      <div className="pulse-layout">

        {/* ── SIDEBAR ── */}
        <aside className="pulse-sidebar">

          {/* Logo */}
          <div className="pulse-logo">
            <span className="pulse-logo-full">Pulse</span>
            <span className="pulse-logo-short">P</span>
          </div>

          {/* Nav Items */}
          <nav className="pulse-nav">
            {navItems.map(item => {
              if (item.onClick) {
                return (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className={`pulse-nav-item ${item.className || ''}`}
                  >
                    <span className="pulse-icon">{item.icon}</span>
                    <span className="pulse-label">{item.label}</span>
                  </button>
                )
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `pulse-nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="pulse-icon">
                        {isActive ? item.activeIcon : item.icon}
                      </span>
                      <span className="pulse-label">{item.label}</span>
                    </>
                  )}
                </NavLink>
              )
            })}

            {/* Profile nav */}
            <NavLink
              to={`/${user?.username}`}
              className={({ isActive }) =>
                `pulse-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="pulse-icon">
                <Avatar src={user?.avatar} username={user?.username} size={22} />
              </span>
              <span className="pulse-label">My Profile</span>
            </NavLink>
          </nav>

          {/* More menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="pulse-nav-item"
            >
              <span className="pulse-icon"><AiOutlineMenu size={22} /></span>
              <span className="pulse-label">More</span>
            </button>

            {showMoreMenu && (
              <div className="pulse-more-popup">
                <button onClick={() => { navigate(`/${user?.username}`); setShowMoreMenu(false) }}>
                  My Profile
                </button>
                <button onClick={() => { navigate('/profile/edit'); setShowMoreMenu(false) }}>
                  Settings
                </button>
                <button onClick={() => { navigate('/saved'); setShowMoreMenu(false) }}>
                  Saved Posts
                </button>
                <div className="pulse-divider" />
                <button className="danger" onClick={logout}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="pulse-main">
          <div className="pulse-main-inner">
            <Outlet />
          </div>
        </main>

        {/* Modals */}
        {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
        {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}

        {/* ── MOBILE NAV ── */}
        <nav className="pulse-mobile-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active-mobile' : ''}>
            {({ isActive }) => isActive ? <AiFillHome size={22} /> : <AiOutlineHome size={22} />}
          </NavLink>

          <button onClick={() => setShowSearch(true)}>
            <BsSearch size={20} />
          </button>

          <NavLink to="/reels" className={({ isActive }) => isActive ? 'active-mobile' : ''}>
            {({ isActive }) => isActive ? <BsCameraReelsFill size={20} /> : <BsCameraReels size={20} />}
          </NavLink>

          <button onClick={() => setShowCreate(true)} style={{ color: 'var(--pulse-accent2)' }}>
            <AiOutlinePlusSquare size={24} />
          </button>

          <NavLink to="/notifications" className={({ isActive }) => isActive ? 'active-mobile' : ''}>
            {({ isActive }) => isActive ? <AiFillHeart size={22} /> : <AiOutlineHeart size={22} />}
          </NavLink>

          <NavLink to={`/${user?.username}`} className={({ isActive }) => isActive ? 'active-mobile' : ''}>
            <Avatar src={user?.avatar} username={user?.username} size={24} />
          </NavLink>
        </nav>
      </div>
    </>
  )
}

export default Layout