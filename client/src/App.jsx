import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { registerDevice } from './api';
import { cacheVideo, clearOldCache } from './utils/cache';

import StatusBar from './components/StatusBar';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function App() {
  const [deviceId, setDeviceId] = useState(localStorage.getItem('deviceId'));
  const [playlist, setPlaylist] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [playIndex, setPlayIndex] = useState(0); // Ever-increasing counter
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const [serverTimeOffset, setServerTimeOffset] = useState(0);

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
      // Request server time for sync
      socket.emit('request-server-time');
    });

    socket.on('server-time', ({ timestamp }) => {
      const offset = timestamp - Date.now();
      console.log('Server time offset:', offset, 'ms');
      setServerTimeOffset(offset);
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
      const fullUrl = item.url.startsWith('http') ? item.url : `${SOCKET_URL}${item.url}`;
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
    clearOldCache(items.map(item => item.url.startsWith('http') ? item.url : `${SOCKET_URL}${item.url}`));
    setIsPlaying(true);
    setPlayIndex(0); // Reset counter on new playlist
  };

  const fetchPlaylist = async (deviceData) => {
    if (deviceData.playlist && deviceData.playlist.items) {
      setPlaylist(deviceData.playlist);
      updateMediaCache(deviceData.playlist.items);
    }
  };

  // Sync Engine
  useEffect(() => {
    if (!mediaItems.length) return;

    const interval = setInterval(() => {
      // Use Server Time instead of Local Time
      const now = (Date.now() + serverTimeOffset) / 1000; // Unix timestamp in seconds

      // Calculate total cycle duration
      const totalDuration = mediaItems.reduce((acc, item) => acc + (item.duration || 10), 0);

      if (totalDuration === 0) return;

      // Find current position in cycle
      const currentCycleTime = now % totalDuration;

      let accumulatedTime = 0;
      let foundIndex = 0;
      let seekTime = 0;

      for (let i = 0; i < mediaItems.length; i++) {
        const itemDuration = mediaItems[i].duration || 10;
        if (currentCycleTime >= accumulatedTime && currentCycleTime < accumulatedTime + itemDuration) {
          foundIndex = i;
          seekTime = currentCycleTime - accumulatedTime;
          break;
        }
        accumulatedTime += itemDuration;
      }

      // Sync State
      if (foundIndex !== playIndex) {
        setPlayIndex(foundIndex);
        setIsPlaying(true);
      }

      // Sync Video Seek (drift correction)
      if (mediaItems[foundIndex].type === 'video' && videoRef.current) {
        const video = videoRef.current;
        // Only seek if drift is > 0.5s to avoid stuttering
        if (Math.abs(video.currentTime - seekTime) > 0.5) {
          console.log(`Syncing video: drift ${Math.abs(video.currentTime - seekTime).toFixed(2)}s`);
          video.currentTime = seekTime;
          // Ensure playing
          if (video.paused) video.play().catch(() => { });
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [mediaItems, playIndex]);

  // Derived current index (Simplified)
  const currentIndex = playIndex;

  return (
    <div className="bg-black h-screen w-screen flex items-center justify-center overflow-hidden relative">
      <StatusBar />
      {mediaItems.length > 0 && mediaItems[currentIndex] ? (
        <>
          {mediaItems[currentIndex].type === 'image' ? (
            <img
              src={mediaItems[currentIndex].url}
              className="w-full h-full object-contain"
              alt="Signage content"
            />
          ) : (
            <video
              key={mediaItems[currentIndex].url} // Remount on URL change mainly
              ref={videoRef}
              src={mediaItems[currentIndex].url}
              className="w-full h-full object-contain"
              muted
              autoPlay
              playsInline
            // Remove onEnded handling as it interacts poorly with Global Sync
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
