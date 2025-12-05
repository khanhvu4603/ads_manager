import React from 'react';
import { cn } from '../../lib/utils';

export function Input({ className, ...props }) {
    return (
        <input
            className={cn(
                "flex h-10 w-full rounded-xl border border-gray-200 bg-white/50 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                className
            )}
            {...props}
        />
    );
}
