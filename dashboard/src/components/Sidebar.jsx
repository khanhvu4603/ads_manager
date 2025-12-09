import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListVideo, MonitorPlay, Settings, LogOut, User, Users, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/logo.png';
import logoDark from '../assets/logo_dark.png';

export function Sidebar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const links = [
        { to: "/", icon: MonitorPlay, label: "Devices" },
        { to: "/playlists", icon: ListVideo, label: "Playlists" },
        { to: "/media", icon: LayoutDashboard, label: "Media Library" },
    ];

    if (user?.role === 'admin') {
        links.push({ to: "/users", icon: Users, label: "Users" });
    }

    return (
        <aside className="w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col h-full transition-colors duration-200">
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <img src={theme === 'dark' ? logo : logoDark} alt="Logo" className="h-14 w-auto object-contain" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent transition-all">
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
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                        )}
                    >
                        <link.icon className="w-5 h-5" />
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">

                {/* Theme Switcher */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                >
                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <User className="w-4 h-4 text-blue-600" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.username || 'Admin'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Role: {user?.role || 'undefined'}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
