import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Home, ArrowLeft, SearchX } from 'lucide-react';
import useTheme from '../../hooks/useTheme';

export default function NotFound() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex items-center justify-center gradient-bg text-gray-900 dark:text-gray-100 p-4 font-body overflow-hidden relative selection:bg-orange-500/30">
      
      {/* =======================
          BACKGROUND (STATIC)
          ======================= */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-orange-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[20%] w-32 h-32 bg-yellow-500/10 rounded-full blur-[40px]" />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-6 right-6 p-3 glass rounded-full shadow-lg hover:shadow-orange-500/20 transition-all duration-300 hover:scale-110 z-50 group"
      >
         {theme === "dark" ? "☀️" : "🌙"}
      </button>

      {/* =======================
          MAIN CARD CONTENT 
          ======================= */}
      <div className="w-full max-w-md relative z-10 flex flex-col items-center gap-6">
        
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center justify-center animate-slide-up">
          <h1 className="text-5xl font-brand font-bold text-gray-900 dark:text-white drop-shadow-sm mb-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-400">
            Dine Flow
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-widest uppercase text-[10px]">
            Error 404
          </p>
        </div>

        {/* Glass Card */}
        <div className="w-full glass relative overflow-hidden rounded-3xl p-[1px] shadow-2xl animate-slide-up-delay-2">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[23px] p-8 relative text-center">
            
            {/* Animated Icon */}
            <div className="mb-8 flex justify-center relative">
               {/* Pulse Ring */}
               <div className="absolute w-24 h-24 rounded-full border-2 border-orange-500/20 animate-pulse-ring-1" />
               
               <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 flex items-center justify-center shadow-lg border border-orange-100 dark:border-orange-500/20 animate-float-slow">
                  <div className="relative">
                    <UtensilsCrossed className="w-10 h-10 text-orange-500 dark:text-orange-400 opacity-80" />
                    <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
                        <SearchX className="w-4 h-4 text-red-500" />
                    </div>
                  </div>
               </div>
            </div>

            {/* Text Content */}
            <div className="mb-8 space-y-3">
              <h2 className="text-4xl font-heading font-extrabold text-gray-900 dark:text-white">
                Off the Menu?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">
                We couldn't find the page you're looking for.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                The table might have been moved, deleted, or never existed in the first place.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
               <button 
                  onClick={() => navigate(-1)}
                  className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 font-heading font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Go Back
               </button>

               <Link to="/" className="flex-1">
                 <button className="w-full h-full py-3.5 rounded-xl btn-primary font-heading font-bold text-white shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Home className="w-4 h-4" />
                    Home Page
                 </button>
               </Link>
            </div>

            {/* Error Code Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800/50 opacity-60">
                <p className="text-xs font-mono text-gray-400 dark:text-gray-500 tracking-wider">
                    STATUS: 404_NOT_FOUND
                </p>
            </div>

          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-4 flex gap-4 text-xs text-gray-400 dark:text-gray-500 animate-slide-up-delay-4">
          <span className="hover:text-orange-500 cursor-pointer transition-colors">
            Report Issue
          </span>
          <span>•</span>
          <span className="hover:text-orange-500 cursor-pointer transition-colors">
            Sitemap
          </span>
        </div>
      </div>
    </div>
  );
}