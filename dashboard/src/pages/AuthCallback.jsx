import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const username = searchParams.get('username');
        const id = searchParams.get('id');

        if (token && username && id) {
            // Simulate a small delay for better UX (optional)
            setTimeout(() => {
                login(token, { id, username });
                navigate('/');
            }, 1500);
        } else {
            navigate('/login');
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 flex flex-col items-center gap-6"
            >
                <div className="w-16 h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>

                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Authenticating</h2>
                    <p className="text-slate-400">Please wait while we log you in...</p>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthCallback;
