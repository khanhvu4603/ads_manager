import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4000',
    timeout: 30000, // 30 seconds timeout
});

export const getDevices = () => api.get('/devices');
export const registerDevice = (ip, name) => api.post('/devices/register', { ip, name });
export const updateDeviceStatus = (id, status) => api.put(`/devices/${id}/status`, { status });

export const getPlaylists = () => api.get('/playlists');
export const createPlaylist = (data) => api.post('/playlists', data);
export const updatePlaylist = (id, data) => api.patch(`/playlists/${id}`, data);
export const deletePlaylist = (id) => api.delete(`/playlists/${id}`);
export const deployPlaylist = (id) => api.post(`/playlists/${id}/deploy`);

export const getMedia = () => api.get('/media');
export const uploadMedia = (formData) => api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteMedia = (id) => api.delete(`/media/${id}`);
export const renameMedia = (id, newFilename) => api.patch(`/media/${id}/rename`, { filename: newFilename });

export default api;
