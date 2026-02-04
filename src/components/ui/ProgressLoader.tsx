'use client'

import React from 'react'

interface ProgressLoaderProps {
    progress: number
    message?: string
    subMessage?: string
}

const ProgressLoader: React.FC<ProgressLoaderProps> = ({
    progress,
    message = "Loading...",
    subMessage = "Please wait while we prepare your dashboard"
}) => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50/90 backdrop-blur-md">
            <div className="w-full max-w-md px-8">
                {/* Glow effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                {/* Percentage Display */}
                <div className="relative mb-12 text-center">
                    <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 tabular-nums">
                        {Math.round(progress)}%
                    </span>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-purple-500 rounded-full" />
                </div>

                {/* Text Area */}
                <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
                        {message}
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                        {subMessage}
                    </p>
                </div>

                {/* Progress Bar Container */}
                <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    {/* Animated Progress Bar */}
                    <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 transition-all duration-500 ease-out rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                        style={{ width: `${progress}%` }}
                    >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-6 flex justify-between items-center px-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        SuperAdmin v2.0
                    </span>
                    <div className="flex gap-1.5">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${progress >= (i * 33) ? 'bg-purple-500 scale-110' : 'bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
        </div>
    )
}

export default ProgressLoader
