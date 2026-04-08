import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B1219]">
            <div className="relative">
                {/* Outer Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 rounded-full border-t-2 border-b-2 border-blue-600/30"
                />
                
                {/* Inner Spinning Ring */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-full border-l-2 border-r-2 border-blue-500"
                />

                {/* Center Pulse */}
                <motion.div
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 m-auto w-4 h-4 bg-blue-400 rounded-full blur-sm"
                />
                
                <p className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-blue-500/60 font-medium whitespace-nowrap">
                    Loading Experience
                </p>
            </div>
        </div>
    );
};

export default Loader;
