import api from './api';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

export const getMe = () =>
  api.get('/users/me').then((r) => r.data.user ?? r.data);

export const updateProfile = (data) =>
  api.put('/users/me', data).then((r) => r.data.user ?? r.data);

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return api.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};

export const getAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http')) return avatarUrl;
  return `${BASE_URL}/${avatarUrl}`;
};
