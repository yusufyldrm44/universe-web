import api from './api';

export const getPendingListings = () =>
  api.get('/admin/listings/pending').then((r) => r.data.listings ?? r.data);

export const getPendingEvents = () =>
  api.get('/admin/events/pending').then((r) => r.data.events ?? r.data);

export const approveListing = (id) =>
  api.put(`/admin/listings/${id}/approve`).then((r) => r.data);

export const rejectListing = (id) =>
  api.put(`/admin/listings/${id}/reject`).then((r) => r.data);

export const approveEvent = (id) =>
  api.put(`/admin/events/${id}/approve`).then((r) => r.data);

export const rejectEvent = (id) =>
  api.put(`/admin/events/${id}/reject`).then((r) => r.data);

export const getUsers = () =>
  api.get('/admin/users').then((r) => r.data.users ?? r.data);
