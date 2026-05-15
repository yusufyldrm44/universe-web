import api from './api';

export const getTopics = (category) =>
  api.get('/forum/topics', { params: category ? { category } : {} })
    .then((r) => r.data.topics ?? r.data);

export const getTopicDetail = (id) =>
  api.get(`/forum/topics/${id}`).then((r) => r.data);

export const createTopic = (data) =>
  api.post('/forum/topics', data).then((r) => r.data);

export const replyTopic = (id, content) =>
  api.post(`/forum/topics/${id}/reply`, { content }).then((r) => r.data);

export const likeTopic = (id) =>
  api.post(`/forum/topics/${id}/like`).then((r) => r.data);

export const deleteTopic = (id) =>
  api.delete(`/forum/topics/${id}`).then((r) => r.data);
