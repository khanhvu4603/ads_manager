import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

// CÁCH THÊM LOGO:
// 1. Copy file ảnh logo (ví dụ: logo.png) vào thư mục: client/src/assets/
// 2. Uncomment dòng import bên dưới:
import logo from 'E:/SOLARZ/ads_manager/client/src/assets/logo.png';

const StatusBar = () => {
    const [time, setTime] = useState(new Date());
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        // Update time every second
        const timer = setInterval(() => setTime(new Date()), 1000);

        // Network status listeners
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            clearInterval(timer);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Format time: 14:05
    const formattedTime = time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    // Format date: Mon, 5 Dec
    const formattedDate = time.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });

    return (
        <div className="absolute top-0 left-0 w-full z-50 px-6 py-2 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center justify-between text-white/90 font-medium tracking-wide">
                {/* Left: Brand / Logo */}
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10 shadow-sm p-1">
                        <img src={logo} alt="Logo" className="h-14 w-14 object-contain" />
                    </div>
                </div>

                {/* Right: Time & Status */}
                <div className="flex items-center gap-4 bg-black/20 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/5 shadow-lg">
                    <span className="text-xs opacity-80">{formattedDate}</span>
                    <span className="text-sm font-bold">{formattedTime}</span>
                    <div className="w-px h-3 bg-white/20 mx-1"></div>
                    {isOnline ? (
                        <Wifi className="w-4 h-4 text-green-400" />
                    ) : (
                        <WifiOff className="w-4 h-4 text-red-400" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatusBar;
