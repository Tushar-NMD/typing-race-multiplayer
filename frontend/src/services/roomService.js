import api from './api';

export const roomService = {
  // Create room
  createRoom: async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },

  // Get all public rooms
  getPublicRooms: async () => {
    const response = await api.get('/rooms');
    return response.data;
  },

  // Get room by code
  getRoom: async (roomCode) => {
    const response = await api.get(`/rooms/${roomCode}`);
    return response.data;
  },

  // Join room
  joinRoom: async (roomCode, password = '') => {
    const response = await api.post(`/rooms/${roomCode}/join`, { password });
    return response.data;
  },

  // Leave room
  leaveRoom: async (roomCode) => {
    const response = await api.post(`/rooms/${roomCode}/leave`);
    return response.data;
  },

  // Delete room
  deleteRoom: async (roomCode) => {
    const response = await api.delete(`/rooms/${roomCode}`);
    return response.data;
  },
};
