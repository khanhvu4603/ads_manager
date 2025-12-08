import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

const Analytics = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-700">Total Devices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-blue-600">12</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-700">Active Playlists</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-green-600">5</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-700">Total Impressions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-purple-600">1.2M</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
