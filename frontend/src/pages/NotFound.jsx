import React from 'react';
import { Link } from 'react-router-dom';

const nfStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .nf-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0a0f;
    padding: 24px;
    font-family: 'DM Sans', sans-serif;
    color: #e8e6f0;
    position: relative;
    overflow: hidden;
  }

  /* Ambient glow blobs */
  .nf-root::before {
    content: '';
    position: absolute;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124,92,252,0.12) 0%, transparent 70%);
    top: -100px; left: -100px;
    pointer-events: none;
  }

  .nf-root::after {
    content: '';
    position: absolute;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(252,92,156,0.08) 0%, transparent 70%);
    bottom: -80px; right: -80px;
    pointer-events: none;
  }

  .nf-card {
    width: 100%;
    max-width: 420px;
    background: #131320;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 28px;
    padding: 48px 36px;
    text-align: center;
    box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,92,252,0.08);
    position: relative;
    z-index: 1;
  }

  /* 404 big number */
  .nf-number {
    font-family: 'Syne', sans-serif;
    font-size: 96px;
    font-weight: 800;
    line-height: 1;
    background: linear-gradient(135deg, #7c5cfc 0%, #fc5c9c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 6px;
    letter-spacing: -4px;
    position: relative;
  }

  .nf-number::after {
    content: '404';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #7c5cfc 0%, #fc5c9c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: blur(24px);
    opacity: 0.35;
    z-index: -1;
  }

  /* Logo mark */
  .nf-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 52px; height: 52px;
    border-radius: 16px;
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    margin-bottom: 24px;
    box-shadow: 0 8px 24px rgba(124,92,252,0.35);
  }

  .nf-logo-text {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: #fff;
  }

  .nf-title {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #e8e6f0;
    margin-bottom: 10px;
  }

  .nf-desc {
    font-size: 13.5px;
    color: #5a5670;
    line-height: 1.65;
    margin-bottom: 32px;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
  }

  .nf-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    border: none;
    border-radius: 50px;
    padding: 12px 32px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    text-decoration: none;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 8px 24px rgba(124,92,252,0.3);
  }
  .nf-btn:hover {
    opacity: 0.88;
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(124,92,252,0.4);
  }

  .nf-divider {
    width: 40px;
    height: 1px;
    background: rgba(255,255,255,0.07);
    margin: 28px auto 20px;
  }

  .nf-footer {
    font-size: 11.5px;
    color: #2e2a42;
    letter-spacing: 0.3px;
  }

  .nf-footer span {
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 600;
  }
`;

const NotFound = () => (
  <>
    <style>{nfStyle}</style>
    <div className="nf-root">
      <div className="nf-card">

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div className="nf-logo">
            <span className="nf-logo-text">P</span>
          </div>
        </div>

        {/* 404 */}
        <div className="nf-number">404</div>

        <h1 className="nf-title">Page not found</h1>

        <p className="nf-desc">
          This page doesn't exist or may have been moved. Double-check the link or head back to your feed.
        </p>

        {/* CTA */}
        <Link to="/" className="nf-btn">
          {/* Arrow icon */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Feed
        </Link>

        <div className="nf-divider" />

        <p className="nf-footer">
          <span>Pulse</span> · Error 404
        </p>

      </div>
    </div>
  </>
);

export default NotFound;