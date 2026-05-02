import api from './api';

export const getListings = (params) =>
  api.get('/listings', { params }).then((r) => r.data.listings ?? r.data);

export const getListingById = (id) =>
  api.get(`/listings/${id}`).then((r) => r.data);

export const createListing = (formData) =>
  api.post('/listings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const deleteListing = (id) =>
  api.delete(`/listings/${id}`).then((r) => r.data);
