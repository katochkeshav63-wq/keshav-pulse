import React, { useState, useEffect, useRef } from 'react';
import { storyAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import StoryViewer from './StoryViewer';
import { AiOutlinePlus } from 'react-icons/ai';

const storiesStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@400;500&display=swap');

  .sb-wrap {
    background: #131320;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 22px;
    padding: 16px 14px;
    margin-bottom: 24px;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
  }

  .sb-label {
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #3e3a54;
    margin-bottom: 14px;
    padding: 0 4px;
  }

  .sb-scroll {
    display: flex;
    gap: 18px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
  }
  .sb-scroll::-webkit-scrollbar { display: none; }

  /* STORY ITEM */
  .sb-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
    cursor: pointer;
  }

  .sb-ring {
    padding: 2.5px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    transition: transform 0.2s, background 0.2s;
    position: relative;
  }

  .sb-item:hover .sb-ring {
    transform: scale(1.06);
  }

  /* Unviewed — gradient ring */
  .sb-ring.unviewed {
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
  }

  /* Viewed — muted ring */
  .sb-ring.viewed {
    background: rgba(255,255,255,0.1);
  }

  /* Add story ring */
  .sb-ring.add {
    background: rgba(124,92,252,0.25);
    border: 1.5px dashed rgba(124,92,252,0.5);
    padding: 2px;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
  }
  .sb-item:hover .sb-ring.add {
    background: rgba(124,92,252,0.35);
    border-color: rgba(124,92,252,0.9);
  }

  /* Inner white gap */
  .sb-avatar-wrap {
    background: #131320;
    border-radius: 50%;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Plus badge */
  .sb-plus {
    position: absolute;
    bottom: 1px;
    right: 1px;
    width: 20px; height: 20px;
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #131320;
    box-shadow: 0 2px 8px rgba(124,92,252,0.5);
  }

  /* Username */
  .sb-name {
    font-size: 11.5px;
    font-weight: 500;
    color: #6e6a80;
    text-align: center;
    width: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.2s;
  }
  .sb-item:hover .sb-name { color: #e8e6f0; }

  .sb-name.you {
    color: #7c5cfc;
    font-weight: 600;
  }

  /* Unviewed dot */
  .sb-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c5cfc, #fc5c9c);
    margin-top: -4px;
    flex-shrink: 0;
  }

  /* SKELETON */
  .sb-skeleton {
    display: flex;
    gap: 18px;
    overflow-x: auto;
    padding-bottom: 4px;
  }
  .sb-skeleton::-webkit-scrollbar { display: none; }

  .sb-skel-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
  }

  .sb-skel-circle {
    width: 62px; height: 62px;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
    animation: sbPulse 1.4s ease-in-out infinite;
  }

  .sb-skel-line {
    width: 44px; height: 8px;
    border-radius: 4px;
    background: rgba(255,255,255,0.05);
    animation: sbPulse 1.4s ease-in-out infinite;
  }

  @keyframes sbPulse {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 0.8; }
  }
`;

const StoriesBar = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [selectedStoryGroup, setSelectedStoryGroup] = useState(null);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data } = await storyAPI.getFeed();
        setStories(data.stories || []);
      } catch (err) {
        console.error('Error fetching stories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  const handleStoryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('media', file);
    try {
      await storyAPI.create(formData);
      const { data } = await storyAPI.getFeed();
      setStories(data.stories || []);
    } catch (err) {
      console.error('Error creating story:', err);
    }
  };

  const openStory = (group, index) => {
    setSelectedStoryGroup(group);
    setSelectedGroupIndex(index);
  };

  const navigateStory = (direction) => {
    const newIndex = selectedGroupIndex + direction;
    if (newIndex >= 0 && newIndex < stories.length) {
      setSelectedGroupIndex(newIndex);
      setSelectedStoryGroup(stories[newIndex]);
    } else {
      setSelectedStoryGroup(null);
    }
  };

  if (loading) {
    return (
      <>
        <style>{storiesStyle}</style>
        <div className="sb-wrap">
          <div className="sb-skeleton">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="sb-skel-item">
                <div className="sb-skel-circle" style={{ animationDelay: `${i * 0.1}s` }} />
                <div className="sb-skel-line" style={{ animationDelay: `${i * 0.1}s` }} />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{storiesStyle}</style>

      <div className="sb-wrap">
        <p className="sb-label">Moments</p>

        <div className="sb-scroll">

          {/* ADD MOMENT */}
          <div className="sb-item" onClick={() => fileInputRef.current?.click()}>
            <div className="sb-ring add" style={{ position: 'relative' }}>
              <div className="sb-avatar-wrap">
                <Avatar src={user?.avatar} username={user?.username} size={52} />
              </div>
              <div className="sb-plus">
                <AiOutlinePlus size={11} color="#fff" />
              </div>
            </div>
            <span className="sb-name you">Add</span>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={handleStoryUpload}
            />
          </div>

          {/* STORY BUBBLES */}
          {stories.map((group, index) => (
            <div
              key={group.user._id}
              className="sb-item"
              onClick={() => openStory(group, index)}
            >
              <div className={`sb-ring ${group.hasUnviewed ? 'unviewed' : 'viewed'}`}>
                <div className="sb-avatar-wrap">
                  <Avatar
                    src={group.user.avatar}
                    username={group.user.username}
                    size={52}
                  />
                </div>
              </div>
              <span className="sb-name">{group.user.username}</span>
              {group.hasUnviewed && <div className="sb-dot" />}
            </div>
          ))}
        </div>
      </div>

      {/* STORY VIEWER */}
      {selectedStoryGroup && (
        <StoryViewer
          group={selectedStoryGroup}
          onClose={() => setSelectedStoryGroup(null)}
          onPrev={() => navigateStory(-1)}
          onNext={() => navigateStory(1)}
          hasPrev={selectedGroupIndex > 0}
          hasNext={selectedGroupIndex < stories.length - 1}
        />
      )}
    </>
  );
};

export default StoriesBar;