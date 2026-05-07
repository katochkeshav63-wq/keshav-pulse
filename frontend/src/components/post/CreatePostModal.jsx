import React, { useState, useRef, useCallback } from 'react';
import { postAPI } from '../../utils/api';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { AiOutlineClose, AiOutlinePicture } from 'react-icons/ai';
import { BsArrowLeft } from 'react-icons/bs';

const STEPS = { SELECT: 'select', PREVIEW: 'preview', CAPTION: 'caption' };

const modalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .pm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 16px;
  }

  .pm-card {
    width: 100%;
    max-width: 960px;
    height: 90vh;
    max-height: 720px;
    background: #131320;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    box-shadow: 0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,92,252,0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: 'DM Sans', sans-serif;
    color: #e8e6f0;
  }

  /* HEADER */
  .pm-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.02);
    flex-shrink: 0;
  }

  .pm-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.3px;
    color: #e8e6f0;
  }

  .pm-icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px; height: 34px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: #8a86a0;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .pm-icon-btn:hover {
    background: rgba(255,255,255,0.07);
    color: #e8e6f0;
  }

  .pm-next-btn {
    background: transparent;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    color: #7c5cfc;
    cursor: pointer;
    padding: 6px 14px;
    border-radius: 10px;
    transition: background 0.2s, color 0.2s;
  }
  .pm-next-btn:hover {
    background: rgba(124,92,252,0.12);
  }

  .pm-publish-btn {
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    padding: 7px 18px;
    border-radius: 10px;
    transition: opacity 0.2s, transform 0.15s;
  }
  .pm-publish-btn:hover { opacity: 0.88; transform: scale(1.02); }
  .pm-publish-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

  /* BODY */
  .pm-body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  /* STEP 1 — SELECT */
  .pm-select {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    padding: 40px;
    position: relative;
  }

  .pm-select::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 40% at 50% 60%, rgba(124,92,252,0.07) 0%, transparent 70%);
    pointer-events: none;
  }

  .pm-drop-zone {
    width: 100%;
    max-width: 380px;
    border: 2px dashed rgba(124,92,252,0.3);
    border-radius: 20px;
    padding: 48px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    transition: border-color 0.2s, background 0.2s;
    cursor: pointer;
  }
  .pm-drop-zone:hover, .pm-drop-zone.dragging {
    border-color: rgba(124,92,252,0.7);
    background: rgba(124,92,252,0.05);
  }

  .pm-upload-icon {
    width: 72px; height: 72px;
    background: rgba(124,92,252,0.12);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7c5cfc;
  }

  .pm-select h3 {
    font-family: 'Syne', sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: #e8e6f0;
  }

  .pm-select p {
    font-size: 13px;
    color: #6e6a80;
    text-align: center;
  }

  .pm-select-btn {
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    padding: 10px 28px;
    border-radius: 12px;
    transition: opacity 0.2s, transform 0.15s;
    margin-top: 8px;
  }
  .pm-select-btn:hover { opacity: 0.88; transform: translateY(-1px); }

  .pm-hint {
    font-size: 12px;
    color: #4a4660;
  }

  /* STEP 2 — PREVIEW */
  .pm-preview {
    flex: 1;
    background: #0a0a0f;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .pm-preview img,
  .pm-preview video {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
    border-radius: 4px;
  }

  .pm-thumb-strip {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    background: rgba(19,19,32,0.9);
    backdrop-filter: blur(10px);
    padding: 10px 12px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .pm-thumb {
    width: 48px; height: 48px;
    border-radius: 10px;
    overflow: hidden;
    border: 2px solid transparent;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.15s;
    background: #1c1b26;
    display: flex; align-items: center; justify-content: center;
  }
  .pm-thumb.active { border-color: #7c5cfc; transform: scale(1.08); }
  .pm-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .pm-thumb-video {
    width: 100%; height: 100%;
    background: #252333;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; color: #7c5cfc;
  }

  /* STEP 3 — CAPTION */
  .pm-caption-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .pm-caption-media {
    width: 42%;
    background: #0a0a0f;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }
  .pm-caption-media img,
  .pm-caption-media video {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
  }

  .pm-caption-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-left: 1px solid rgba(255,255,255,0.07);
    overflow: hidden;
  }

  .pm-user-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    flex-shrink: 0;
  }

  .pm-username {
    font-size: 13.5px;
    font-weight: 600;
    color: #e8e6f0;
  }

  .pm-form {
    flex: 1;
    overflow-y: auto;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .pm-form::-webkit-scrollbar { width: 4px; }
  .pm-form::-webkit-scrollbar-thumb { background: rgba(124,92,252,0.3); border-radius: 2px; }

  .pm-field {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 12px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    color: #e8e6f0;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    resize: none;
  }
  .pm-field::placeholder { color: #4a4660; }
  .pm-field:focus {
    border-color: rgba(124,92,252,0.5);
    background: rgba(124,92,252,0.04);
  }

  .pm-char-count {
    font-size: 11px;
    color: #4a4660;
    text-align: right;
    margin-top: -8px;
  }

  .pm-field-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #5a5670;
    margin-bottom: -6px;
  }

  .pm-error {
    background: rgba(248,113,113,0.1);
    border: 1px solid rgba(248,113,113,0.25);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13px;
    color: #f87171;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .pm-card { border-radius: 20px; height: 95vh; max-height: none; }
    .pm-caption-media { display: none; }
    .pm-caption-panel { border-left: none; }
  }
`;

const CreatePostModal = ({ onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(STEPS.SELECT);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPreview, setCurrentPreview] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback((selectedFiles) => {
    const fileArray = Array.from(selectedFiles).slice(0, 10);
    if (fileArray.length === 0) return;
    setFiles(fileArray);
    const newPreviews = fileArray.map(f => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith('video/') ? 'video' : 'image',
      name: f.name,
    }));
    setPreviews(newPreviews);
    setStep(STEPS.PREVIEW);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('media', f));
      if (caption) formData.append('caption', caption);
      if (location) formData.append('location', location);
      if (tags) formData.append('tags', tags);
      const { data } = await postAPI.create(formData);
      onPostCreated?.(data.post);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === STEPS.PREVIEW) setStep(STEPS.SELECT);
    if (step === STEPS.CAPTION) setStep(STEPS.PREVIEW);
  };

  const titleMap = {
    [STEPS.SELECT]: 'New Post',
    [STEPS.PREVIEW]: 'Preview Media',
    [STEPS.CAPTION]: 'Add Details',
  };

  return (
    <>
      <style>{modalStyle}</style>
      <div
        className="pm-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="pm-card">

          {/* HEADER */}
          <div className="pm-header">
            {step !== STEPS.SELECT ? (
              <button className="pm-icon-btn" onClick={goBack}>
                <BsArrowLeft size={18} />
              </button>
            ) : (
              <div style={{ width: 34 }} />
            )}

            <span className="pm-title">{titleMap[step]}</span>

            {step === STEPS.SELECT ? (
              <button className="pm-icon-btn" onClick={onClose}>
                <AiOutlineClose size={17} />
              </button>
            ) : step === STEPS.PREVIEW ? (
              <button className="pm-next-btn" onClick={() => setStep(STEPS.CAPTION)}>
                Next →
              </button>
            ) : (
              <button
                className="pm-publish-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Sharing…' : 'Share'}
              </button>
            )}
          </div>

          {/* BODY */}
          <div className="pm-body">

            {/* STEP 1 — SELECT */}
            {step === STEPS.SELECT && (
              <div className="pm-select">
                <div
                  className={`pm-drop-zone ${dragging ? 'dragging' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="pm-upload-icon">
                    <AiOutlinePicture size={32} />
                  </div>
                  <h3>Drop your media here</h3>
                  <p>Photos and videos up to 10 files</p>
                  <button className="pm-select-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    Browse Files
                  </button>
                  <span className="pm-hint">Supports JPG, PNG, GIF, MP4, MOV</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={e => handleFileSelect(e.target.files)}
                />
              </div>
            )}

            {/* STEP 2 — PREVIEW */}
            {step === STEPS.PREVIEW && (
              <div className="pm-preview">
                {previews[currentPreview]?.type === 'video' ? (
                  <video src={previews[currentPreview].url} controls />
                ) : (
                  <img src={previews[currentPreview]?.url} alt="preview" />
                )}

                {previews.length > 1 && (
                  <div className="pm-thumb-strip">
                    {previews.map((p, i) => (
                      <div
                        key={i}
                        className={`pm-thumb ${i === currentPreview ? 'active' : ''}`}
                        onClick={() => setCurrentPreview(i)}
                      >
                        {p.type === 'video'
                          ? <div className="pm-thumb-video">▶</div>
                          : <img src={p.url} alt={`thumb-${i}`} />
                        }
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 — CAPTION */}
            {step === STEPS.CAPTION && (
              <div className="pm-caption-layout">

                <div className="pm-caption-media">
                  {previews[0]?.type === 'video' ? (
                    <video src={previews[0].url} />
                  ) : (
                    <img src={previews[0]?.url} alt="media" />
                  )}
                </div>

                <div className="pm-caption-panel">
                  <div className="pm-user-row">
                    <Avatar src={user?.avatar} username={user?.username} size={30} />
                    <span className="pm-username">{user?.username}</span>
                  </div>

                  <div className="pm-form">
                    <span className="pm-field-label">Caption</span>
                    <textarea
                      className="pm-field"
                      value={caption}
                      onChange={e => setCaption(e.target.value)}
                      placeholder="What's on your mind?"
                      maxLength={2200}
                      rows={5}
                    />
                    <div className="pm-char-count">{caption.length} / 2200</div>

                    <span className="pm-field-label">Location</span>
                    <input
                      type="text"
                      className="pm-field"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="Add a location…"
                    />

                    <span className="pm-field-label">Tags</span>
                    <input
                      type="text"
                      className="pm-field"
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                      placeholder="#pulse #vibes #photography"
                    />

                    {error && <div className="pm-error">{error}</div>}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePostModal;