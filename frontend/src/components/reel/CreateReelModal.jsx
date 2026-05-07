import React, { useState, useRef, useCallback } from 'react'
import { reelAPI } from '../../utils/api'
import { AiOutlineClose, AiOutlineVideoCamera } from 'react-icons/ai'
import { BsArrowLeft, BsMusicNote } from 'react-icons/bs'

const MAX_SECONDS = 10

const reelStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .rm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.82);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 16px;
  }

  .rm-card {
    width: 100%;
    max-width: 780px;
    background: #131320;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 26px;
    box-shadow: 0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(252,92,156,0.08);
    overflow: hidden;
    font-family: 'DM Sans', sans-serif;
    color: #e8e6f0;
  }

  /* HEADER */
  .rm-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.02);
  }

  .rm-title {
    font-family: 'Syne', sans-serif;
    font-size: 14.5px;
    font-weight: 700;
    letter-spacing: 0.3px;
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .rm-icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px; height: 34px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: #6e6a80;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .rm-icon-btn:hover {
    background: rgba(255,255,255,0.07);
    color: #e8e6f0;
  }

  .rm-next-btn {
    background: transparent;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    color: #7c5cfc;
    cursor: pointer;
    padding: 6px 14px;
    border-radius: 10px;
    transition: background 0.2s;
  }
  .rm-next-btn:hover { background: rgba(124,92,252,0.1); }

  .rm-publish-btn {
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    padding: 7px 20px;
    border-radius: 10px;
    transition: opacity 0.2s, transform 0.15s;
  }
  .rm-publish-btn:hover { opacity: 0.88; transform: scale(1.02); }
  .rm-publish-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  /* STEP 1 — SELECT */
  .rm-select {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 22px;
    padding: 52px 32px;
    position: relative;
    min-height: 340px;
  }

  .rm-select::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 55% 45% at 50% 60%, rgba(252,92,156,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .rm-drop-zone {
    width: 100%;
    max-width: 360px;
    border: 2px dashed rgba(252,92,156,0.28);
    border-radius: 22px;
    padding: 44px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: border-color 0.25s, background 0.25s;
  }
  .rm-drop-zone:hover, .rm-drop-zone.dragging {
    border-color: rgba(252,92,156,0.65);
    background: rgba(252,92,156,0.04);
  }

  .rm-upload-icon {
    width: 76px; height: 76px;
    border-radius: 22px;
    background: rgba(252,92,156,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fc5c9c;
    position: relative;
  }

  .rm-upload-icon::after {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 28px;
    border: 1px solid rgba(252,92,156,0.18);
  }

  .rm-drop-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #e8e6f0;
    text-align: center;
  }

  .rm-drop-sub {
    font-size: 12.5px;
    color: #5a5670;
    text-align: center;
    line-height: 1.5;
  }

  .rm-limit-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(252,92,156,0.1);
    border: 1px solid rgba(252,92,156,0.2);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 12px;
    color: #fc5c9c;
    font-weight: 600;
  }

  .rm-select-btn {
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    padding: 10px 30px;
    border-radius: 12px;
    transition: opacity 0.2s, transform 0.15s;
    margin-top: 4px;
  }
  .rm-select-btn:hover { opacity: 0.88; transform: translateY(-1px); }

  .rm-error {
    background: rgba(248,113,113,0.1);
    border: 1px solid rgba(248,113,113,0.22);
    border-radius: 10px;
    padding: 9px 14px;
    font-size: 13px;
    color: #f87171;
    text-align: center;
    max-width: 340px;
  }

  /* STEP 2 — PREVIEW */
  .rm-preview {
    background: #07070e;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 20px 16px;
    gap: 16px;
  }

  .rm-preview video {
    max-height: 420px;
    border-radius: 14px;
    box-shadow: 0 0 40px rgba(252,92,156,0.12);
  }

  .rm-duration-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 6px 16px;
  }

  .rm-duration-fill {
    height: 4px;
    width: 120px;
    background: rgba(255,255,255,0.08);
    border-radius: 2px;
    overflow: hidden;
  }

  .rm-duration-fill-inner {
    height: 100%;
    background: linear-gradient(90deg, #7c5cfc, #fc5c9c);
    border-radius: 2px;
    transition: width 0.3s;
  }

  .rm-duration-text {
    font-size: 12px;
    color: #6e6a80;
    font-weight: 500;
    white-space: nowrap;
  }

  /* STEP 3 — DETAILS */
  .rm-details {
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 640px) {
    .rm-details { flex-direction: row; }
  }

  .rm-details-media {
    background: #07070e;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    flex-shrink: 0;
  }

  @media (min-width: 640px) {
    .rm-details-media { width: 220px; }
  }

  .rm-details-media video {
    max-height: 280px;
    border-radius: 12px;
    width: 100%;
    object-fit: cover;
  }

  .rm-details-form {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    border-left: 1px solid rgba(255,255,255,0.06);
  }

  @media (max-width: 639px) {
    .rm-details-form { border-left: none; border-top: 1px solid rgba(255,255,255,0.06); }
  }

  .rm-field-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #4a4660;
    margin-bottom: -8px;
  }

  .rm-field {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 11px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    color: #e8e6f0;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    resize: none;
  }
  .rm-field::placeholder { color: #3e3a54; }
  .rm-field:focus {
    border-color: rgba(252,92,156,0.4);
    background: rgba(252,92,156,0.03);
  }

  .rm-audio-row {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 11px 14px;
    transition: border-color 0.2s;
  }
  .rm-audio-row:focus-within {
    border-color: rgba(252,92,156,0.4);
    background: rgba(252,92,156,0.03);
  }

  .rm-audio-row input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    color: #e8e6f0;
  }
  .rm-audio-row input::placeholder { color: #3e3a54; }

  .rm-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #3e3a54;
  }

  .rm-meta-dot {
    width: 3px; height: 3px;
    background: #3e3a54;
    border-radius: 50%;
  }

  /* PROGRESS BAR */
  .rm-progress {
    height: 3px;
    background: rgba(255,255,255,0.06);
    border-radius: 2px;
    overflow: hidden;
  }
  .rm-progress-inner {
    height: 100%;
    background: linear-gradient(90deg, #7c5cfc, #fc5c9c);
    border-radius: 2px;
    animation: shimmer 1.2s ease-in-out infinite;
  }
  @keyframes shimmer {
    0%   { opacity: 1; }
    50%  { opacity: 0.5; }
    100% { opacity: 1; }
  }
`

const CreateReelModal = ({ onClose, onCreated }) => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [duration, setDuration] = useState(null)
  const [durationError, setDurationError] = useState('')
  const [step, setStep] = useState('select')
  const [caption, setCaption] = useState('')
  const [audio, setAudio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = useCallback((selectedFile) => {
    if (!selectedFile) return
    if (!selectedFile.type.startsWith('video/')) {
      setDurationError('Please select a video file.')
      return
    }
    const objectUrl = URL.createObjectURL(selectedFile)
    const tempVideo = document.createElement('video')
    tempVideo.preload = 'metadata'
    tempVideo.onloadedmetadata = () => {
      const dur = tempVideo.duration
      setDuration(dur)
      if (dur > MAX_SECONDS) {
        setDurationError(`Video is ${dur.toFixed(1)}s — must be ≤ ${MAX_SECONDS}s`)
        URL.revokeObjectURL(objectUrl)
        return
      }
      setDurationError('')
      setFile(selectedFile)
      setPreview(objectUrl)
      setStep('preview')
    }
    tempVideo.onerror = () => setDurationError('Could not read video metadata.')
    tempVideo.src = objectUrl
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFileSelect(f)
  }, [handleFileSelect])

  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('video', file)
      if (caption.trim()) formData.append('caption', caption)
      if (audio.trim()) formData.append('audio', audio)
      const { data } = await reelAPI.create(formData)
      onCreated?.(data.reel)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const fillPercent = duration ? Math.min((duration / MAX_SECONDS) * 100, 100) : 0

  const titleMap = {
    select: 'New Clip',
    preview: 'Preview Clip',
    details: 'Clip Details',
  }

  return (
    <>
      <style>{reelStyle}</style>
      <div
        className="rm-overlay"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div className="rm-card">

          {/* HEADER */}
          <div className="rm-header">
            {step !== 'select' ? (
              <button
                className="rm-icon-btn"
                onClick={() => setStep(step === 'details' ? 'preview' : 'select')}
              >
                <BsArrowLeft size={18} />
              </button>
            ) : (
              <div style={{ width: 34 }} />
            )}

            <span className="rm-title">{titleMap[step]}</span>

            {step === 'select' ? (
              <button className="rm-icon-btn" onClick={onClose}>
                <AiOutlineClose size={17} />
              </button>
            ) : step === 'preview' ? (
              <button className="rm-next-btn" onClick={() => setStep('details')}>
                Next →
              </button>
            ) : (
              <button
                className="rm-publish-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Uploading…' : 'Go Live'}
              </button>
            )}
          </div>

          {/* STEP 1 — SELECT */}
          {step === 'select' && (
            <div className="rm-select">
              <div
                className={`rm-drop-zone ${dragging ? 'dragging' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="rm-upload-icon">
                  <AiOutlineVideoCamera size={32} />
                </div>

                <p className="rm-drop-title">Drop your clip here</p>
                <p className="rm-drop-sub">Short-form video up to {MAX_SECONDS} seconds<br/>MP4, MOV, or WebM</p>

                <span className="rm-limit-badge">
                  ⏱ Max {MAX_SECONDS}s
                </span>

                <button
                  className="rm-select-btn"
                  onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
                >
                  Browse Video
                </button>
              </div>

              {durationError && (
                <div className="rm-error">{durationError}</div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={e => handleFileSelect(e.target.files?.[0])}
              />
            </div>
          )}

          {/* STEP 2 — PREVIEW */}
          {step === 'preview' && preview && (
            <div className="rm-preview">
              <video src={preview} controls autoPlay loop />

              <div className="rm-duration-bar">
                <div className="rm-duration-fill">
                  <div
                    className="rm-duration-fill-inner"
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
                <span className="rm-duration-text">
                  {duration?.toFixed(1)}s / {MAX_SECONDS}s
                </span>
              </div>
            </div>
          )}

          {/* STEP 3 — DETAILS */}
          {step === 'details' && (
            <div className="rm-details">
              <div className="rm-details-media">
                <video src={preview} autoPlay loop muted />
              </div>

              <div className="rm-details-form">
                <span className="rm-field-label">Caption</span>
                <textarea
                  className="rm-field"
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Describe your clip…"
                  rows={3}
                />

                <span className="rm-field-label">Audio Track</span>
                <div className="rm-audio-row">
                  <BsMusicNote size={15} style={{ color: '#fc5c9c', flexShrink: 0 }} />
                  <input
                    value={audio}
                    onChange={e => setAudio(e.target.value)}
                    placeholder="Song or sound name…"
                  />
                </div>

                <div className="rm-meta">
                  <span>Duration: {duration?.toFixed(1)}s</span>
                  <div className="rm-meta-dot" />
                  <span>Max {MAX_SECONDS}s</span>
                </div>

                {error && (
                  <div className="rm-error">{error}</div>
                )}

                {loading && (
                  <div className="rm-progress">
                    <div className="rm-progress-inner" style={{ width: '100%' }} />
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default CreateReelModal