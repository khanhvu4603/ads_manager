import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { registerDevice } from './api';
import { cacheVideo, clearOldCache } from './utils/cache';

const SOCKET_URL = 'http://localhost:4000';

function App() {
  const [deviceId, setDeviceId] = useState(localStorage.getItem('deviceId'));
  const [playlist, setPlaylist] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [playIndex, setPlayIndex] = useState(0); // Ever-increasing counter
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    initializeDevice();
  }, []);

  const initializeDevice = async () => {
    let id = deviceId;
    try {
      // Always register as "Main Device"
      const res = await registerDevice('127.0.0.1', 'Main Device');
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
      // Register device with socket for status tracking
      if (id) {
        socket.emit('register-device', { deviceId: id });
      }
    });

    socket.on('playlistDeployed', (playlist) => {
      console.log('Playlist update received', playlist);
      if (playlist && playlist.items) {
        setPlaylist(playlist);
        updateMediaCache(playlist.items);
      }
    });
  };

  const updateMediaCache = async (items) => {
    const cachedItems = [];
    for (const item of items) {
      const fullUrl = item.url.startsWith('http') ? item.url : `http://localhost:4000${item.url}`;
      const cachedUrl = await cacheVideo(fullUrl);
      if (cachedUrl) {
        cachedItems.push({
          ...item,
          url: cachedUrl, // Blob URL
          originalUrl: fullUrl
        });
      }
    }
    setMediaItems(cachedItems);
    // Clear old cache
    clearOldCache(items.map(item => item.url.startsWith('http') ? item.url : `http://localhost:4000${item.url}`));
    setIsPlaying(true);
    setPlayIndex(0); // Reset counter on new playlist
  };

  const fetchPlaylist = async (deviceData) => {
    if (deviceData.playlist && deviceData.playlist.items) {
      setPlaylist(deviceData.playlist);
      updateMediaCache(deviceData.playlist.items);
    }
  };

  const handleNext = () => {
    setPlayIndex((prev) => prev + 1); // Always increment to trigger effect
  };

  // Derived current index
  const currentIndex = mediaItems.length > 0 ? playIndex % mediaItems.length : 0;

  // Auto-advance logic
  useEffect(() => {
    if (!mediaItems.length) return;

    const currentItem = mediaItems[currentIndex];

    if (currentItem.type === 'image') {
      const duration = (currentItem.duration || 5) * 1000;
      const timer = setTimeout(() => {
        handleNext();
      }, duration);
      return () => clearTimeout(timer);
    }

    // For video, we wait for onEnded event
    if (currentItem.type === 'video' && videoRef.current) {
      videoRef.current.src = currentItem.url;
      videoRef.current.play().catch(e => console.error("Autoplay failed", e));
    }
  }, [playIndex, mediaItems]); // Depend on playIndex, not currentIndex

  return (
    <div className="bg-black h-screen w-screen flex items-center justify-center overflow-hidden">
      {mediaItems.length > 0 ? (
        <>
          {mediaItems[currentIndex].type === 'image' ? (
            <img
              src={mediaItems[currentIndex].url}
              className="w-full h-full object-contain"
              alt="Signage content"
            />
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              onEnded={handleNext}
              muted
              autoPlay
              playsInline
            />
          )}
        </>
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
