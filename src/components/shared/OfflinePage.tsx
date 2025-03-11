import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { WifiOff, RefreshCw, Sun, Moon } from 'lucide-react';

import { useNetwork } from '@/hooks/useNetwork';

function OfflinePage() {
  const isOnline = useNetwork();
  const [isRotating, setIsRotating] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  const handleRefresh = () => {
    setIsRotating(true);
    if (navigator.onLine) {
      window.location.reload();
    } else {
      setTimeout(() => {
        setIsRotating(false);
      }, 1500);
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-gradient-to-br from-gray-50 to-white'} flex items-center justify-center p-4`}
    >
      <button
        onClick={toggleTheme}
        className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-300 ${isDark ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-white hover:bg-gray-100'} shadow-lg`}
      >
        {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

      <div
        className={`max-w-md w-full transform transition-all duration-500 ${isOnline ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div
          className={`${isDark ? 'bg-zinc-900/80 backdrop-blur-lg border-zinc-800' : 'bg-white border-gray-200'} rounded-2xl p-8 shadow-2xl border transition-colors duration-300`}
        >
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div
                className={`absolute inset-0 animate-ping rounded-full ${isDark ? 'bg-red-500' : 'bg-red-400'} opacity-20`}
              ></div>
              <div className="relative">
                <WifiOff
                  className={`w-16 h-16 ${isDark ? 'text-red-500' : 'text-red-400'} animate-pulse`}
                />
              </div>
            </div>

            <h1
              className={`text-3xl font-bold mt-4 ${isDark ? 'text-zinc-100' : 'text-gray-900'}`}
            >
              You&lsquo;re Offline
            </h1>

            <p
              className={`text-lg ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}
            >
              Please check your internet connection and try again
            </p>

            <div
              className={`w-full h-2 ${isDark ? 'bg-zinc-800' : 'bg-gray-200'} rounded-full overflow-hidden`}
            >
              <div
                className={`h-full ${isDark ? 'bg-red-500' : 'bg-red-400'} animate-[shimmer_2s_infinite]`}
              ></div>
            </div>

            <button
              onClick={handleRefresh}
              className={`group relative inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${isDark ? 'bg-zinc-100 text-zinc-900 hover:bg-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
            >
              <RefreshCw
                className={`w-5 h-5 transition-transform ${isRotating ? 'animate-spin' : 'group-hover:rotate-180'}`}
              />
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfflinePage;
