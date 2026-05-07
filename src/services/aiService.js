import api from './api';

export const improveDescription = (title, description, type) =>
  api.post('/ai/improve-description', { title, description, type })
    .then((r) => r.data.improved);

export const suggestCategory = (title, description) =>
  api.post('/ai/suggest-category', { title, description })
    .then((r) => r.data);

export const suggestPrice = (title, description, type, condition) =>
  api.post('/ai/suggest-price', { title, description, type, condition })
    .then((r) => r.data.suggestion);
