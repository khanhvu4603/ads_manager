import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export function Button({ className, variant = 'primary', size = 'md', as = 'button', children, ...props }) {
    const variants = {
        primary: "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-200 shadow-lg",
        secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm",
        ghost: "hover:bg-gray-100 text-gray-600",
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-red-200 shadow-lg",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-sm",
        lg: "px-6 py-3 text-base",
        icon: "p-2",
    };

    const Component = motion[as] || motion.button;

    return (
        <Component
            whileTap={{ scale: 0.96 }}
            className={cn(
                "inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </Component>
    );
}
