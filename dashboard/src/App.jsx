import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import DeviceList from './components/DeviceList';
import PlaylistManager from './components/PlaylistManager';
import MediaLibrary from './components/MediaLibrary';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50/50 font-sans text-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <Routes>
              <Route path="/" element={<DeviceList />} />
              <Route path="/playlists" element={<PlaylistManager />} />
              <Route path="/media" element={<MediaLibrary />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
