import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Key, UserPlus, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:4000/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`http://localhost:4000/users/${id}`);
                fetchUsers();
            } catch (err) {
                alert('Failed to delete user');
            }
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:4000/users', formData);
            setIsCreateOpen(false);
            setFormData({ username: '', password: '' });
            fetchUsers();
        } catch (err) {
            alert('Failed to create user');
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`http://localhost:4000/users/${selectedUser.id}/password`, { password: newPassword });
            setIsPasswordOpen(false);
            setNewPassword('');
            setSelectedUser(null);
            alert('Password updated successfully');
        } catch (err) {
            alert('Failed to update password');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
                <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add User
                </Button>
            </div>

            <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-0">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Username</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Created At</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">{user.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.role || 'user'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => { setSelectedUser(user); setIsPasswordOpen(true); }}
                                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                            title="Change Password"
                                        >
                                            <Key className="w-4 h-4" />
                                        </button>
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Create User Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-[400px] shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Create New User</h3>
                            <button onClick={() => setIsCreateOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <Input
                                placeholder="Username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                            <Input
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <Button type="submit" className="w-full">Create User</Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {isPasswordOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-[400px] shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Change Password for {selectedUser.username}</h3>
                            <button onClick={() => { setIsPasswordOpen(false); setSelectedUser(null); }}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <Input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <Button type="submit" className="w-full">Update Password</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;
