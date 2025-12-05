import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
});

export const registerDevice = (ip, name) => api.post('/devices/register', { ip, name });
export const getPlaylist = (deviceId) => api.get(`/devices/${deviceId}`); // Assuming we get device info which includes playlist
// Actually, backend returns device with playlist relation.
// Or we can fetch playlist by ID if we know it.
// Let's use getDevice to get the assigned playlist.

export default api;
