import api from './api';

export const getEvents = () =>
  api.get('/events').then((r) => r.data.events ?? r.data);

export const createEvent = (data) =>
  api.post('/events', data).then((r) => r.data);

export const joinEvent = (id) =>
  api.post(`/events/${id}/join`).then((r) => r.data);
