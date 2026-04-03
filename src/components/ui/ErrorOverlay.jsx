import React from "react";

export default function ErrorOverlay({ error, onClose }) {
  if (!error) return null;

 
  const message =
    typeof error === "string"
      ? error
      : error?.message ||
        error?.error ||
        error?.detail ||
        (typeof error === "object" ? JSON.stringify(error, null, 2) : "An unknown error occurred");

  return (
   
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade"
      onClick={onClose} 
    >
      
      {/* Modal Container 
          - Uses 'glass' utility
          - Uses 'animate-scale-in' for entrance
          - Red border glow to signify error
      */}
      <div 
        className="glass relative w-full max-w-md p-6 m-4 overflow-hidden shadow-2xl rounded-2xl border border-red-500/30 animate-scale-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        
        {/* Decorative Top Shimmer - Red Gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-80 animate-shimmer-fast" />

        {/* Background Red Glow Blob */}
        <div className="absolute top-[-50%] left-[-20%] w-64 h-64 bg-red-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Close 'X' Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-light hover:text-red-500 transition-colors duration-300 p-1 rounded-full hover:bg-red-500/10"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content Section */}
        <div className="relative z-10 flex flex-col items-center text-center">
          
          {/* Animated Icon Wrapper */}
          <div className="relative mb-4 group">
            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse-ring-1" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border border-red-500/30 text-red-500 shadow-glow">
              <svg 
                className="w-8 h-8 animate-float" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">
            Error Detected
          </h2>

          {/* Message Area with Custom Scrollbar handling */}
          <div className="w-full max-h-60 overflow-y-auto no-scrollbar my-2 px-2">
            <p className="text-text-muted dark:text-gray-300 text-sm leading-relaxed font-medium break-words">
              {message}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="mt-6 w-full btn-secondary border-red-200 dark:border-red-900/30 hover:border-red-500 dark:hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 group"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}