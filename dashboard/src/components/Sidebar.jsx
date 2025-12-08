import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListVideo, MonitorPlay, Settings, LogOut, User, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
    const { user, logout } = useAuth();

    const links = [
        { to: "/", icon: MonitorPlay, label: "Devices" },
        { to: "/playlists", icon: ListVideo, label: "Playlists" },
        { to: "/media", icon: LayoutDashboard, label: "Media Library" },
    ];

    if (user?.role === 'admin') {
        links.push({ to: "/users", icon: Users, label: "Users" });
    }

    return (
        <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col h-full">
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <MonitorPlay className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Ads Manager
                    </h1>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                            isActive
                                ? "bg-blue-50 text-blue-600 shadow-sm"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <link.icon className="w-5 h-5" />
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 space-y-2">
                {/* User Profile */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <User className="w-4 h-4 text-blue-600" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.username || 'Admin'}</p>
                        <p className="text-xs text-gray-500 truncate">Role: {user?.role || 'undefined'}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
