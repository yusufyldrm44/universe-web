import api from './api';

export const getRooms = () =>
  api.get('/messages/rooms').then((r) => {
    const raw = r.data.rooms ?? r.data;
    return (Array.isArray(raw) ? raw : []).map((room) => ({
      ...room,
      other_user: room.other_user ?? {
        id: room.other_user_id,
        full_name: room.other_user_name,
        university: room.other_user_university,
      },
      last_message:
        room.last_message != null
          ? typeof room.last_message === 'object'
            ? room.last_message
            : { content: room.last_message, created_at: room.last_message_at }
          : null,
    }));
  });

export const getOrCreateRoom = (targetUserId) =>
  api.post('/messages/rooms', { other_user_id: targetUserId }).then((r) => r.data.room ?? r.data);

export const getMessages = (roomId) =>
  api.get(`/messages/rooms/${roomId}/messages`).then((r) => r.data.messages ?? r.data);

export const sendMessage = (roomId, content) =>
  api.post(`/messages/rooms/${roomId}/messages`, { content }).then((r) => r.data.message ?? r.data);

export const searchUsers = (q) =>
  api.get('/users/search', { params: { q } }).then((r) => r.data.users ?? r.data);
