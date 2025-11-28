import React from 'react';

/**
 * LoadingScreen component - Hiển thị khi đang chuyển route
 */
const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-stone-900 bg-opacity-90 dark:bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinning loader */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-amber-200 dark:border-amber-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-amber-600 dark:border-t-amber-500 rounded-full animate-spin"></div>
        </div>

        {/* Loading text */}
        <div className="flex items-center space-x-1">
          <span className="text-stone-600 dark:text-stone-300 font-medium">Đang tải</span>
          <span className="animate-pulse">.</span>
          <span className="animate-pulse animation-delay-200">.</span>
          <span className="animate-pulse animation-delay-400">.</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
