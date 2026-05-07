import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// Users
export const userAPI = {
  getProfile: (username) => API.get(`/users/${username}`),
  updateProfile: (data) => API.put('/users/profile', data),
  follow: (userId) => API.put(`/users/${userId}/follow`),
  getSuggestions: () => API.get('/users/suggestions'),
  getFollowers: (userId) => API.get(`/users/${userId}/followers`),
  getFollowing: (userId) => API.get(`/users/${userId}/following`),
};

// Posts
export const postAPI = {
  create: (data) => API.post('/posts', data),
  getFeed: (page = 1) => API.get(`/posts/feed?page=${page}`),
  getExplore: (page = 1) => API.get(`/posts/explore?page=${page}`),
  getPost: (id) => API.get(`/posts/${id}`),
  getUserPosts: (userId, page = 1) => API.get(`/posts/user/${userId}?page=${page}`),
  getSaved: () => API.get('/posts/saved'),
  like: (id) => API.put(`/posts/${id}/like`),
  save: (id) => API.put(`/posts/${id}/save`),
  comment: (id, data) => API.post(`/posts/${id}/comment`, data),
  deleteComment: (postId, commentId) => API.delete(`/posts/${postId}/comment/${commentId}`),
  delete: (id) => API.delete(`/posts/${id}`),
};

// Stories
export const storyAPI = {
  getFeed: () => API.get('/stories/feed'),
  create: (data) => API.post('/stories', data),
  view: (id) => API.put(`/stories/${id}/view`),
  delete: (id) => API.delete(`/stories/${id}`),
};

// Notifications
export const notificationAPI = {
  getAll: () => API.get('/notifications'),
  markRead: () => API.put('/notifications/read'),
  getUnreadCount: () => API.get('/notifications/unread-count'),
};

// Messages
export const messageAPI = {
  getInbox: () => API.get('/messages'),
  getConversation: (userId, page = 1) => API.get(`/messages/${userId}?page=${page}`),
  send: (data) => API.post('/messages', data),
};

// Search
export const searchAPI = {
  search: (query, type) => API.get(`/search?q=${query}${type ? `&type=${type}` : ''}`),
};

export default API;

// Reels
export const reelAPI = {
  create:      (data)          => API.post('/reels', data),
  getFeed:     (page = 1)      => API.get(`/reels/feed?page=${page}`),
  getExplore:  (page = 1)      => API.get(`/reels/explore?page=${page}`),
  getReel:     (id)            => API.get(`/reels/${id}`),
  getUserReels:(userId)        => API.get(`/reels/user/${userId}`),
  like:        (id)            => API.put(`/reels/${id}/like`),
  save:        (id)            => API.put(`/reels/${id}/save`),
  view:        (id)            => API.put(`/reels/${id}/view`),
  comment:     (id, data)      => API.post(`/reels/${id}/comment`, data),
  delete:      (id)            => API.delete(`/reels/${id}`),
};
