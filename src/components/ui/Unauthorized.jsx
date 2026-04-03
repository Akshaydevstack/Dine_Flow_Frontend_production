import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useTheme from '../../hooks/useTheme';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4 gradient-bg text-gray-900 dark:text-gray-100 font-body">
      
      <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] animate-float-slow pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-float-slow-reverse pointer-events-none" />
      
     
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-particle-0" />
      <div className="absolute top-3/4 left-1/3 w-3 h-3 bg-purple-400/30 rounded-full animate-particle-1" />
      <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-emerald-400/30 rounded-full animate-particle-2" />

      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-6 right-6 p-3 glass rounded-full shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:scale-110 z-50 group"
      >
         {theme === "dark" ? "☀️" : "🌙"}
      </button>

   
      <div className="w-full max-w-lg relative z-10">
        
        <div className="glass rounded-3xl border-t border-white/20 dark:border-white/10 shadow-2xl overflow-hidden text-center relative p-8">
            
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 animate-shimmer-fast" />

            {/* Icon Section with Pulse Rings */}
            <div className="relative mb-8 mt-4 flex justify-center items-center">
                {/* Pulse Rings */}
                <div className="absolute w-24 h-24 rounded-full border-2 border-red-500/20 animate-pulse-ring-1" />
                <div className="absolute w-24 h-24 rounded-full border-2 border-red-500/20 animate-pulse-ring-2" />
                
                {/* Lock Icon Wrapper */}
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center shadow-lg animate-float">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="w-10 h-12 text-red-500 dark:text-red-400 drop-shadow-md"
                    >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>
            </div>

            {/* Text Content */}
            <div className="space-y-4 px-4">
                <h1 className="text-4xl md:text-5xl font-heading font-bold animate-slide-up">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-red-500">
                        Access Denied
                    </span>
                </h1>
                
                <p className="text-lg text-gray-600 dark:text-gray-400 animate-slide-up-delay-2 font-medium">
                    Wait, you're not supposed to be here.
                </p>
                
                <p className="text-sm text-gray-500 dark:text-gray-500 max-w-sm mx-auto animate-slide-up-delay-3 leading-relaxed">
                    This page is restricted. You don't have the necessary permissions to view this content.
                </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 mb-2 flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up-delay-4">
                <button 
                  onClick={() => navigate(-1)}
                  className="btn-secondary w-full sm:w-auto min-w-[140px] group flex items-center justify-center gap-2"
                >
                   <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span> Go Back
                </button>
            </div>
            
            {/* Footer ID */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 animate-slide-up-delay-4 opacity-50">
                <p className="text-xs font-mono">
                    Error Code: 403_FORBIDDEN
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}