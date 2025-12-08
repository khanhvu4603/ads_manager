import React, { useEffect, useState } from 'react';
import { getDevices } from '../api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Monitor, Wifi, WifiOff, Clock, PlaySquare } from 'lucide-react';
import { cn } from '../lib/utils';

import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function DeviceList() {
    const [devices, setDevices] = useState([]);

    useEffect(() => {
        loadDevices();

        const socket = io(SOCKET_URL);
        socket.on('device-status-update', ({ deviceId, status }) => {
            setDevices(prev => prev.map(d =>
                d.id === deviceId ? { ...d, status, lastSeen: new Date() } : d
            ));
        });

        return () => socket.disconnect();
    }, []);

    const loadDevices = async () => {
        try {
            const res = await getDevices();
            // Filter to show only "Main Device" or ID 1 as requested
            const mainDevices = res.data.filter(d => d.name === 'Main Device' || d.id === 1);
            setDevices(mainDevices.length > 0 ? mainDevices : res.data.slice(0, 1));
        } catch (error) {
            console.error('Failed to load devices', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Devices</h2>
                    <p className="text-gray-500">Manage your connected screens</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {devices.filter(d => d.status === 'online').length} Online
                    </div>
                    <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        {devices.filter(d => d.status !== 'online').length} Offline
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map((device) => (
                    <Card key={device.id} className="group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">
                                {device.name}
                            </CardTitle>
                            {device.status === 'online' ? (
                                <Wifi className="h-4 w-4 text-green-500" />
                            ) : (
                                <WifiOff className="h-4 w-4 text-gray-400" />
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 mb-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                    device.status === 'online' ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"
                                )}>
                                    <Monitor className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{device.ip}</div>
                                    <p className="text-xs text-gray-500">ID: #{device.id}</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <PlaySquare className="w-4 h-4" />
                                        <span>Playlist</span>
                                    </div>
                                    <span className="font-medium text-gray-900">
                                        {device.playlist ? device.playlist.name : 'None'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Clock className="w-4 h-4" />
                                        <span>Last Seen</span>
                                    </div>
                                    <span className="text-gray-900">
                                        {new Date(device.lastSeen).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default DeviceList;
