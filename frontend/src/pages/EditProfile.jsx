import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    website: user?.website || '',
    isPrivate: user?.isPrivate || false,
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (avatar) formData.append('avatar', avatar);

      const { data } = await userAPI.updateProfile(formData);
      updateUser(data.user);
      setSuccess('Profile updated successfully');
      setTimeout(() => navigate(`/${data.user.username}`), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-10">

      <div className="max-w-3xl mx-auto space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold">Edit Profile</h1>
          <p className="text-sm text-zinc-400">Manage your account settings</p>
        </div>

        {/* AVATAR CARD */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-5">
          <Avatar src={avatarPreview} username={user?.username} size={64} />

          <div className="flex-1">
            <p className="font-medium">{user?.username}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-indigo-400 text-sm hover:text-indigo-300 mt-1"
            >
              Change profile photo
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* FORM CARD */}
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">

          {/* NAME */}
          <div>
            <label className="text-sm text-zinc-400">Name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          {/* USERNAME */}
          <div>
            <label className="text-sm text-zinc-400">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          {/* WEBSITE */}
          <div>
            <label className="text-sm text-zinc-400">Website</label>
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://..."
              className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          {/* BIO */}
          <div>
            <label className="text-sm text-zinc-400">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none resize-none focus:border-indigo-500"
            />
            <p className="text-xs text-zinc-500 mt-1">{form.bio.length}/150</p>
          </div>

          {/* PRIVACY */}
          <div className="pt-4 border-t border-zinc-800">
            <h3 className="text-sm font-medium mb-3">Privacy</h3>

            <label className="flex items-center justify-between cursor-pointer bg-zinc-800 px-4 py-3 rounded-xl border border-zinc-700">
              <div>
                <p className="text-sm">Private account</p>
                <p className="text-xs text-zinc-500">Only approved users can see your content</p>
              </div>

              <div className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                form.isPrivate ? 'bg-indigo-500' : 'bg-zinc-600'
              }`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                  form.isPrivate ? 'translate-x-5' : ''
                }`} />
              </div>

              <input
                type="checkbox"
                name="isPrivate"
                checked={form.isPrivate}
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>

          {/* STATUS */}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}

          {/* ACTIONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-zinc-800 hover:bg-zinc-700 px-6 py-2 rounded-xl text-sm transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;