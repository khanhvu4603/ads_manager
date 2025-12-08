import React, { useEffect, useState } from 'react';
import { getMedia, uploadMedia, deleteMedia, renameMedia } from '../api';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Upload, Film, Play, Image as ImageIcon, X, Link as LinkIcon, Edit2, Trash2 } from 'lucide-react';

function MediaLibrary() {
    const [media, setMedia] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [customFilename, setCustomFilename] = useState('');
    const [editingMedia, setEditingMedia] = useState(null);
    const [newFilename, setNewFilename] = useState('');

    useEffect(() => {
        loadMedia();
    }, []);

    // Cleanup preview URL when component unmounts
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const loadMedia = async () => {
        try {
            const res = await getMedia();
            setMedia(res.data);
        } catch (error) {
            console.error('Failed to load media', error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (50MB max)
            const maxSize = 50 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('File quá lớn! Vui lòng chọn file nhỏ hơn 50MB');
                return;
            }

            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setMediaUrl(''); // Clear URL if file is selected
            // Set default filename (without extension)
            const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            setCustomFilename(nameWithoutExt);
        }
    };

    const handleUpload = async () => {
        // Validate: must have either file or URL
        if (!selectedFile && !mediaUrl) {
            alert('Vui lòng upload file hoặc nhập URL');
            return;
        }

        if (!customFilename.trim() && selectedFile) {
            alert('Vui lòng nhập tên file');
            return;
        }

        const formData = new FormData();

        // Priority: File upload > URL
        if (selectedFile) {
            // Create new file with custom name
            const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.'));
            const newFileName = customFilename.trim() + fileExtension;
            const renamedFile = new File([selectedFile], newFileName, { type: selectedFile.type });
            formData.append('file', renamedFile);
        } else if (mediaUrl) {
            formData.append('media_url', mediaUrl);
        }

        setUploading(true);
        try {
            await uploadMedia(formData);
            loadMedia();
            // Reset and close modal
            setShowUploadModal(false);
            setSelectedFile(null);
            setPreviewUrl('');
            setMediaUrl('');
            setCustomFilename('');
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload thất bại: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (item) => {
        setEditingMedia(item);
        setNewFilename(item.filename);
        setShowEditModal(true);
    };

    const handleRename = async () => {
        if (!newFilename.trim()) {
            alert('Vui lòng nhập tên file mới');
            return;
        }

        try {
            await renameMedia(editingMedia.id, newFilename.trim());
            loadMedia();
            setShowEditModal(false);
            setEditingMedia(null);
            setNewFilename('');
        } catch (error) {
            console.error('Rename failed', error);
            alert('Đổi tên thất bại: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Bạn có chắc muốn xóa "${editingMedia.filename}"?`)) {
            return;
        }

        try {
            await deleteMedia(editingMedia.id);
            loadMedia();
            setShowEditModal(false);
            setEditingMedia(null);
        } catch (error) {
            console.error('Delete failed', error);
            alert('Xóa thất bại: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Media Library</h2>
                    <p className="text-gray-500">Manage your video and image assets</p>
                </div>
                <Button variant="primary" onClick={() => setShowUploadModal(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Add Media
                </Button>
            </div>

            {media.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <Film className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No media yet</h3>
                    <p className="text-gray-500 max-w-sm text-center mt-2">
                        Upload your first video or image to get started. Supported formats: MP4, WebM, JPG, PNG.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {media.map((item) => (
                        <Card key={item.id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
                            <div className="relative aspect-video bg-gray-900">
                                {item.mimeType?.startsWith('image/') ? (
                                    <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${item.url}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={item.filename} />
                                ) : (
                                    <>
                                        <video src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${item.url}`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50">
                                                <Play className="w-5 h-5 text-white fill-white" />
                                            </div>
                                        </div>
                                    </>
                                )}
                                {/* Edit Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(item);
                                    }}
                                    className="absolute top-2 right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-10"
                                    title="Chỉnh sửa"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                            <CardContent className="p-4 bg-white">
                                <p className="font-medium text-gray-900 truncate" title={item.filename}>{item.filename}</p>
                                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                    <div className="flex items-center gap-1">
                                        {item.mimeType?.startsWith('image/') ? <ImageIcon className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                                        <span className="uppercase tracking-wider">{item.mimeType?.split('/')[1] || 'FILE'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowUploadModal(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Add New Media</h3>
                            <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* File Upload Area */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors bg-gray-50">
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={uploading}
                                />
                                {previewUrl ? (
                                    <div className="text-center">
                                        {selectedFile?.type.startsWith('video/') ? (
                                            <video src={previewUrl} className="mx-auto h-32 object-cover rounded" controls />
                                        ) : (
                                            <img src={previewUrl} alt="Preview" className="mx-auto h-32 object-cover rounded" />
                                        )}
                                        <p className="text-xs text-gray-500 mt-2">Click to change file</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                        <div className="flex justify-center text-sm text-gray-600">
                                            <span>Upload a file</span>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, MP4 up to 50MB</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Custom Filename Input (only show when file is selected) */}
                        {selectedFile && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tên file</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        key="filename-input"
                                        type="text"
                                        value={customFilename}
                                        onChange={(e) => setCustomFilename(e.target.value)}
                                        placeholder="Nhập tên file"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={uploading}
                                        autoFocus
                                    />
                                    <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-2 rounded">
                                        {selectedFile.name.substring(selectedFile.name.lastIndexOf('.'))}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Tên hiển thị trong thư viện media</p>
                            </div>
                        )}

                        {/* OR Separator */}
                        <div className="flex items-center gap-4 my-4">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <span className="text-sm text-gray-500 font-medium">OR</span>
                            <div className="flex-1 border-t border-gray-300"></div>
                        </div>

                        {/* URL Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <LinkIcon className="w-4 h-4 inline mr-1" />
                                Media URL (External)
                            </label>
                            <input
                                type="text"
                                value={mediaUrl}
                                onChange={(e) => {
                                    setMediaUrl(e.target.value);
                                    if (e.target.value) {
                                        setSelectedFile(null);
                                        setPreviewUrl('');
                                    }
                                }}
                                placeholder="https://example.com/video.mp4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={uploading}
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter a direct URL to a video or image</p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => setShowUploadModal(false)}
                                disabled={uploading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={handleUpload}
                                disabled={uploading || (!selectedFile && !mediaUrl)}
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingMedia && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Edit Media</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Preview */}
                        <div className="mb-4 bg-gray-900 rounded-xl overflow-hidden aspect-video">
                            {editingMedia.mimeType?.startsWith('image/') ? (
                                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${editingMedia.url}`} className="w-full h-full object-cover" alt={editingMedia.filename} />
                            ) : (
                                <video src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${editingMedia.url}`} className="w-full h-full object-cover" controls />
                            )}
                        </div>

                        {/* Rename Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tên file</label>
                            <input
                                type="text"
                                value={newFilename}
                                onChange={(e) => setNewFilename(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập tên file mới"
                            />
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={handleRename}
                            >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Đổi tên
                            </Button>
                            <Button
                                variant="secondary"
                                className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                onClick={handleDelete}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa file
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MediaLibrary;
