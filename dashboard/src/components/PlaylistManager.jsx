import React, { useEffect, useState, useRef } from 'react';
import { getPlaylists, createPlaylist, getMedia, updatePlaylist, deletePlaylist, deployPlaylist } from '../api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Plus, ListVideo, Film, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Edit2, X, Eye, Rocket, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

function PlaylistManager() {
    const [playlists, setPlaylists] = useState([]);
    const [media, setMedia] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPlaylist, setEditingPlaylist] = useState(null);
    const [newName, setNewName] = useState('');
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [playIndex, setPlayIndex] = useState(0); // Ever-increasing counter
    const [isPlaying, setIsPlaying] = useState(false);
    const [showDeployModal, setShowDeployModal] = useState(false);
    const [deploying, setDeploying] = useState(false);
    const videoRef = useRef(null);

    // Derived previewIndex
    const previewIndex = selectedPlaylist?.items?.length
        ? ((playIndex % selectedPlaylist.items.length) + selectedPlaylist.items.length) % selectedPlaylist.items.length
        : 0;

    useEffect(() => {
        console.log("PlaylistManager mounted");
        loadPlaylists();
        loadMedia();
    }, []);

    const loadPlaylists = async () => {
        try {
            console.log("Fetching playlists...");
            const res = await getPlaylists();
            console.log("Playlists loaded:", res.data);
            setPlaylists(res.data);
        } catch (error) {
            console.error('Failed to load playlists', error);
            alert('Không thể tải playlists: ' + (error.response?.data?.message || error.message));
        }
    };

    const loadMedia = async () => {
        try {
            const res = await getMedia();
            setMedia(res.data);
        } catch (error) {
            console.error('Failed to load media', error);
            alert('Không thể tải media: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCreate = async () => {
        if (!newPlaylistName) return;
        try {
            await createPlaylist({ name: newPlaylistName, items: [] });
            setNewPlaylistName('');
            loadPlaylists();
        } catch (error) {
            console.error('Failed to create playlist', error);
            alert('Không thể tạo playlist: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleAddToPlaylist = async (playlist, mediaItem) => {
        try {
            const newItem = {
                url: mediaItem.url,
                url: mediaItem.url,
                duration: mediaItem.duration || (mediaItem.mimeType.startsWith('image/') ? 10 : 0),
                type: mediaItem.mimeType.startsWith('image/') ? 'image' : 'video',
                filename: mediaItem.filename
            };
            const newItems = [...(playlist.items || []), newItem];
            await updatePlaylist(playlist.id, { items: newItems });
            loadPlaylists();
            if (selectedPlaylist && selectedPlaylist.id === playlist.id) {
                setSelectedPlaylist({ ...playlist, items: newItems });
            }
        } catch (error) {
            console.error('Failed to add to playlist', error);
            alert('Không thể thêm media vào playlist: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleUpdateDuration = async (playlist, index, duration) => {
        try {
            const newItems = [...(playlist.items || [])];
            newItems[index].duration = parseInt(duration) || 0;
            await updatePlaylist(playlist.id, { items: newItems });
            loadPlaylists();
            if (selectedPlaylist && selectedPlaylist.id === playlist.id) {
                setSelectedPlaylist({ ...playlist, items: newItems });
            }
        } catch (error) {
            console.error('Failed to update duration', error);
            alert('Không thể cập nhật duration: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleMoveItem = async (playlist, index, direction) => {
        try {
            const newItems = [...(playlist.items || [])];
            if (direction === 'up' && index > 0) {
                [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
            } else if (direction === 'down' && index < newItems.length - 1) {
                [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
            }
            await updatePlaylist(playlist.id, { items: newItems });
            loadPlaylists();
            if (selectedPlaylist && selectedPlaylist.id === playlist.id) {
                setSelectedPlaylist({ ...playlist, items: newItems });
            }
        } catch (error) {
            console.error('Failed to move item', error);
            alert('Không thể di chuyển item: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleRemoveFromPlaylist = async (playlist, index) => {
        try {
            const newItems = [...(playlist.items || [])];
            newItems.splice(index, 1);
            await updatePlaylist(playlist.id, { items: newItems });
            loadPlaylists();
            if (selectedPlaylist && selectedPlaylist.id === playlist.id) {
                setSelectedPlaylist({ ...playlist, items: newItems });
            }
        } catch (error) {
            console.error('Failed to remove from playlist', error);
            alert('Không thể xóa item khỏi playlist: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEditPlaylist = (playlist, e) => {
        e.stopPropagation();
        setEditingPlaylist(playlist);
        setNewName(playlist.name);
        setShowEditModal(true);
    };

    const handleRenamePlaylist = async () => {
        if (!newName.trim()) {
            alert('Vui lòng nhập tên playlist');
            return;
        }

        try {
            await updatePlaylist(editingPlaylist.id, { name: newName.trim() });
            loadPlaylists();
            setShowEditModal(false);
            setEditingPlaylist(null);
            if (selectedPlaylist?.id === editingPlaylist.id) {
                setSelectedPlaylist({ ...selectedPlaylist, name: newName.trim() });
            }
        } catch (error) {
            console.error('Failed to rename playlist', error);
            alert('Không thể đổi tên playlist: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeletePlaylist = async () => {
        if (!confirm(`Bạn có chắc muốn xóa playlist "${editingPlaylist.name}"?`)) {
            return;
        }

        try {
            await deletePlaylist(editingPlaylist.id);
            loadPlaylists();
            setShowEditModal(false);
            setEditingPlaylist(null);
            if (selectedPlaylist?.id === editingPlaylist.id) {
                setSelectedPlaylist(null);
            }
        } catch (error) {
            console.error('Failed to delete playlist', error);
            alert('Không thể xóa playlist: ' + (error.response?.data?.message || error.message));
        }
    };

    // Preview handlers
    const handleOpenPreview = () => {
        setPlayIndex(0);
        setIsPlaying(true);
        setShowPreviewModal(true);
    };

    const handleClosePreview = () => {
        setShowPreviewModal(false);
        setIsPlaying(false);
        setPlayIndex(0);
    };

    const handleNext = () => {
        if (!selectedPlaylist?.items) return;
        setPlayIndex(prev => prev + 1);
    };

    const handlePrev = () => {
        if (!selectedPlaylist?.items) return;
        setPlayIndex(prev => prev - 1);
    };

    // Auto-advance for images
    useEffect(() => {
        if (!isPlaying || !selectedPlaylist?.items?.length || !showPreviewModal) return;

        const currentItem = selectedPlaylist.items[previewIndex];

        // Only auto-advance for images
        if (currentItem.type === 'image') {
            // Default to 5 seconds if duration is missing or 0
            const duration = (currentItem.duration || 5) * 1000;
            const timer = setTimeout(() => {
                handleNext();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isPlaying, previewIndex, showPreviewModal, playIndex]);

    // Video ended handler
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Force play to ensure seamless transition
        video.play().catch(e => console.log("Auto-play prevented:", e));

        const handleVideoEnd = () => {
            handleNext();
        };

        video.addEventListener('ended', handleVideoEnd);
        return () => video.removeEventListener('ended', handleVideoEnd);
    }, [previewIndex, playIndex]);

    // Deploy handlers
    const handleDeploy = async () => {
        if (!selectedPlaylist) return;

        setDeploying(true);
        try {
            await deployPlaylist(selectedPlaylist.id);
            setShowDeployModal(false);
            alert('✅ Playlist deployed successfully!');
        } catch (error) {
            console.error('Deploy failed', error);
            alert('❌ Deploy thất bại: ' + (error.response?.data?.message || error.message));
        } finally {
            setDeploying(false);
        }
    };

    const getMediaUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${url}`;
    };


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Playlists</h2>
                    <p className="text-gray-500 dark:text-gray-400">Create and manage video sequences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-12rem)]">
                {/* Sidebar List */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <Card className="flex-1 flex flex-col">
                        <CardHeader>
                            <CardTitle>Your Playlists</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto space-y-2">
                            <div className="flex gap-2 mb-4">
                                <Input
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    placeholder="New Playlist Name"
                                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                />
                                <Button onClick={handleCreate} size="icon" variant="primary">
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>

                            {playlists.map((playlist) => (
                                <div
                                    key={playlist.id}
                                    onClick={() => setSelectedPlaylist(playlist)}
                                    className={cn(
                                        "p-3 rounded-xl cursor-pointer transition-all border flex items-center justify-between group",
                                        selectedPlaylist?.id === playlist.id
                                            ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 shadow-sm"
                                            : "bg-white dark:bg-gray-800 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
                                    )}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center",
                                            selectedPlaylist?.id === playlist.id ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                        )}>
                                            <ListVideo className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{playlist.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{playlist.items?.length || 0} videos</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleEditPlaylist(playlist, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-blue-100 rounded-lg transition-all"
                                        title="Chỉnh sửa playlist"
                                    >
                                        <Edit2 className="w-4 h-4 text-blue-600" />
                                    </button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                    {selectedPlaylist ? (
                        <Card className="flex-1 flex flex-col">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <span className="text-gray-500 dark:text-gray-400 font-normal">Editing:</span>
                                    <span className="text-gray-900 dark:text-gray-100">{selectedPlaylist.name}</span>
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleOpenPreview}
                                        disabled={!selectedPlaylist.items?.length}
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Preview
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => setShowDeployModal(true)}
                                        disabled={!selectedPlaylist.items?.length}
                                    >
                                        <Rocket className="w-4 h-4 mr-2" />
                                        Apply
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Current Sequence</h4>
                                        {selectedPlaylist.items?.length === 0 ? (
                                            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                                                <Film className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                                <p className="text-gray-500 dark:text-gray-400">No videos in this playlist yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {selectedPlaylist.items?.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm group">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="w-16 h-9 bg-gray-900 rounded overflow-hidden flex-shrink-0">
                                                            {item.type === 'image' ? (
                                                                <img src={getMediaUrl(item.url)} className="w-full h-full object-cover" alt={item.filename} />
                                                            ) : (
                                                                <video src={getMediaUrl(item.url)} className="w-full h-full object-cover" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate" title={item.filename}>{item.filename}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                                <span className="uppercase bg-gray-100 dark:bg-gray-700 px-1.5 rounded">{item.type}</span>
                                                                <div className="flex items-center gap-1">
                                                                    <span>Duration:</span>
                                                                    <input
                                                                        type="number"
                                                                        className="w-12 px-1 py-0.5 border rounded text-center bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                                                        value={item.duration || (item.type === 'video' ? 0 : 5)}
                                                                        onChange={(e) => handleUpdateDuration(selectedPlaylist, idx, e.target.value)}
                                                                    />
                                                                    <span>s</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="text-gray-400 hover:text-gray-600"
                                                                onClick={() => handleMoveItem(selectedPlaylist, idx, 'up')}
                                                                disabled={idx === 0}
                                                            >
                                                                <ArrowUp className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="text-gray-400 hover:text-gray-600"
                                                                onClick={() => handleMoveItem(selectedPlaylist, idx, 'down')}
                                                                disabled={idx === (selectedPlaylist.items?.length || 0) - 1}
                                                            >
                                                                <ArrowDown className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="text-red-500 hover:bg-red-50"
                                                                onClick={() => handleRemoveFromPlaylist(selectedPlaylist, idx)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Available Media</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {media.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="group relative aspect-video bg-gray-900 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all"
                                                    onClick={() => handleAddToPlaylist(selectedPlaylist, item)}
                                                >
                                                    {item.mimeType?.startsWith('image/') ? (
                                                        <img src={getMediaUrl(item.url)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={item.filename} />
                                                    ) : (
                                                        <video src={getMediaUrl(item.url)} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/0 transition-colors">
                                                        <Plus className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all" />
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs text-white truncate flex-1">{item.filename}</p>
                                                            {item.mimeType?.startsWith('image/') ? <ImageIcon className="w-3 h-3 text-white/70 ml-2" /> : <Film className="w-3 h-3 text-white/70 ml-2" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <ListVideo className="w-16 h-16 mb-4 opacity-20" />
                            <p>Select a playlist to start editing</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Playlist Modal */}
            {showEditModal && editingPlaylist && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Edit Playlist</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Playlist Info */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <ListVideo className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="font-medium">{editingPlaylist.name}</div>
                                    <div className="text-sm text-gray-500">{editingPlaylist.items?.length || 0} videos</div>
                                </div>
                            </div>
                        </div>

                        {/* Rename Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tên playlist</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập tên playlist mới"
                            />
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={handleRenamePlaylist}
                            >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Đổi tên
                            </Button>
                            <Button
                                variant="secondary"
                                className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                onClick={handleDeletePlaylist}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa playlist
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreviewModal && selectedPlaylist?.items?.length > 0 && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col">
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent z-10">
                        <div className="flex items-center justify-between text-white">
                            <div>
                                <h3 className="text-xl font-bold">{selectedPlaylist.name}</h3>
                                <p className="text-sm opacity-75">
                                    {previewIndex + 1} / {selectedPlaylist.items.length}
                                </p>
                            </div>
                            <button
                                onClick={handleClosePreview}
                                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Media Display */}
                    <div className="flex-1 flex items-center justify-center">
                        {selectedPlaylist.items[previewIndex]?.type === 'image' ? (
                            <img
                                src={getMediaUrl(selectedPlaylist.items[previewIndex].url)}
                                alt={selectedPlaylist.items[previewIndex].filename}
                                className="max-w-full max-h-full object-contain"
                            />
                        ) : (
                            <video
                                ref={videoRef}
                                src={getMediaUrl(selectedPlaylist.items[previewIndex].url)}
                                className="max-w-full max-h-full object-contain"
                                autoPlay
                                muted
                                key={playIndex} // Use playIndex to force remount even if index wraps
                            />
                        )}
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex items-center justify-center gap-4 text-white">
                            <button
                                onClick={handlePrev}
                                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                            >
                                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
                            </button>
                            <button
                                onClick={handleNext}
                                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Deploy Confirmation Modal */}
            {showDeployModal && selectedPlaylist && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowDeployModal(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Deploy Playlist</h3>
                            <button onClick={() => setShowDeployModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Playlist Info */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Rocket className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="font-medium">{selectedPlaylist.name}</div>
                                    <div className="text-sm text-gray-600">{selectedPlaylist.items?.length || 0} media items</div>
                                </div>
                            </div>
                            <div className="text-sm text-blue-800 bg-blue-100 p-3 rounded-lg">
                                <strong>⚠️ Warning:</strong> This will update all connected client websites with this playlist.
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => setShowDeployModal(false)}
                                disabled={deploying}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={handleDeploy}
                                disabled={deploying}
                            >
                                <Rocket className="w-4 h-4 mr-2" />
                                {deploying ? 'Deploying...' : 'Deploy Now'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PlaylistManager;
