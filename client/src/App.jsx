import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { registerDevice } from './api';
import { cacheVideo, clearOldCache } from './utils/cache';

const SOCKET_URL = 'http://localhost:3000';

function App() {
  const [deviceId, setDeviceId] = useState(localStorage.getItem('deviceId'));
  const [playlist, setPlaylist] = useState(null);
  const [videoUrls, setVideoUrls] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    initializeDevice();
  }, []);

  const initializeDevice = async () => {
    let id = deviceId;
    // Simple IP detection is hard from client, backend sees it.
    // We'll send a random name or ID.
    // Actually, backend registers by IP. We just need to ping it.
    try {
      const res = await registerDevice('127.0.0.1', `Client-${Math.floor(Math.random() * 1000)}`);
      // In real app, IP is detected by server.
      // We store the DB ID.
      if (res.data && res.data.id) {
        id = res.data.id;
        setDeviceId(id);
        localStorage.setItem('deviceId', id);
        fetchPlaylist(res.data);
      }
    } catch (error) {
      console.error('Registration failed', error);
    }

    const socket = io(SOCKET_URL);
    socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    socket.on('playlist-update-all', (data) => {
      console.log('Playlist update received', data);
      // Re-fetch device info to get new playlist
      if (id) refreshPlaylist(id);
    });

    // Also listen for specific device update if needed
    if (id) {
      socket.on(`playlist-update-${id}`, () => refreshPlaylist(id));
    }
  };

  const refreshPlaylist = async (id) => {
    // We need an endpoint to get device info or playlist.
    // reusing register endpoint or a new get endpoint.
    // Let's use register to refresh/get info.
    try {
      const res = await registerDevice('127.0.0.1'); // Update last seen
      fetchPlaylist(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPlaylist = async (deviceData) => {
    if (deviceData.playlist && deviceData.playlist.items) {
      setPlaylist(deviceData.playlist);
      const urls = deviceData.playlist.items; // These are backend URLs
      // Cache them
      const cachedUrls = [];
      for (const url of urls) {
        // Backend URL: http://localhost:3000/uploads/...
        // But items might be relative or absolute.
        // Assuming relative from backend.
        const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;
        const cachedUrl = await cacheVideo(fullUrl);
        if (cachedUrl) cachedUrls.push(cachedUrl);
      }
      setVideoUrls(cachedUrls);
      // Clear old cache
      clearOldCache(urls.map(u => u.startsWith('http') ? u : `http://localhost:3000${u}`));
      setIsPlaying(true);
    }
  };

  const handleVideoEnded = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videoUrls.length);
  };

  useEffect(() => {
    if (videoRef.current && videoUrls.length > 0) {
      videoRef.current.src = videoUrls[currentVideoIndex];
      videoRef.current.play().catch(e => console.error("Autoplay failed", e));
    }
  }, [currentVideoIndex, videoUrls]);

  return (
    <div className="bg-black h-screen w-screen flex items-center justify-center overflow-hidden">
      {videoUrls.length > 0 ? (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onEnded={handleVideoEnded}
          muted // Autoplay requires muted usually
          autoPlay
          playsInline
        />
      ) : (
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Digital Signage Player</h1>
          <p className="text-xl">Waiting for playlist...</p>
          <p className="text-sm text-gray-500 mt-4">Device ID: {deviceId}</p>
        </div>
      )}
    </div>
  );
}

export default App;
