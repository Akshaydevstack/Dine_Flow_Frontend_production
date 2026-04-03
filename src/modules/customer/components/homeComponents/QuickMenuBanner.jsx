import React from 'react'
import { Link } from 'react-router-dom'
export default function QuickMenuBanner() {
  return (
    <div className="mb-6">
          <Link
            to="/customer/menu"
            className="block bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16" />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Explore Full Menu</h3>
                  <p className="text-white/80">
                    Discover all our delicious dishes and drinks
                  </p>
                </div>
                <div className="text-3xl animate-pulse">→</div>
              </div>
            </div>
          </Link>
        </div>
  )
}
