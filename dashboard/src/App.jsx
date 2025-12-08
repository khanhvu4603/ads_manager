import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import Analytics from './components/Analytics';
import PlaylistManager from './components/PlaylistManager';
import DeviceList from './components/DeviceList';
import MediaLibrary from './components/MediaLibrary';
import UserManager from './components/UserManager';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallback from './pages/AuthCallback';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex h-screen bg-gray-50/50 font-sans text-gray-900">
                  <Sidebar />
                  <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                      <Routes>
                        <Route index element={<DeviceList />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="playlists" element={<PlaylistManager />} />
                        <Route path="devices" element={<DeviceList />} />
                        <Route path="media" element={<MediaLibrary />} />
                        <Route path="users" element={<UserManager />} />
                      </Routes>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
