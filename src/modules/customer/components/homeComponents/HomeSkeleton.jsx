import React from 'react';

// Shimmer effect component
const Shimmer = () => (
  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent animate-shimmer" />
);

const SkeletonBox = ({ className }) => (
  <div className={`relative overflow-hidden bg-gray-200 dark:bg-gray-800 ${className}`}>
    <Shimmer />
  </div>
);

export default function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 px-4 pt-32 pb-28">
      
      {/* 1. Search Bar Skeleton */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl rounded-2xl" />
        <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-lg border border-gray-100 dark:border-gray-700">
          <SkeletonBox className="w-5 h-5 rounded mr-3" />
          <SkeletonBox className="flex-1 h-5 rounded" />
          <SkeletonBox className="w-10 h-10 rounded-lg ml-3" />
        </div>
      </div>

      {/* 2. Rotating Offers Carousel Skeleton */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <SkeletonBox className="h-6 w-32 rounded-lg" />
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonBox key={i} className="w-2 h-2 rounded-full" />
            ))}
          </div>
        </div>
        
        <SkeletonBox className="h-48 rounded-2xl shadow-xl" />
      </div>

      {/* 3. Popular Categories Skeleton */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <SkeletonBox className="h-6 w-40 rounded-lg" />
          <SkeletonBox className="h-4 w-16 rounded-lg" />
        </div>

        <div className="flex overflow-x-auto gap-3 pb-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center flex-shrink-0 min-w-[100px]">
              <SkeletonBox className="w-20 h-20 rounded-2xl mb-2" />
              <SkeletonBox className="h-3 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Chef's Special Section Skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <SkeletonBox className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <SkeletonBox className="h-5 w-32 rounded-lg" />
            <SkeletonBox className="h-3 w-24 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700">
              <SkeletonBox className="w-full h-36" />
              <div className="p-3 space-y-2">
                <SkeletonBox className="h-4 w-full rounded" />
                <SkeletonBox className="h-3 w-2/3 rounded" />
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-1">
                    <SkeletonBox className="h-5 w-16 rounded" />
                    <SkeletonBox className="h-3 w-20 rounded" />
                  </div>
                  <SkeletonBox className="w-16 h-8 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Quick Bites Section Skeleton (Horizontal Scroll) */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <SkeletonBox className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <SkeletonBox className="h-5 w-28 rounded-lg" />
            <SkeletonBox className="h-3 w-36 rounded" />
          </div>
        </div>

        <div className="flex overflow-x-auto gap-3 pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[280px] bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex gap-3">
                <div className="relative">
                  <SkeletonBox className="w-24 h-24 rounded-xl" />
                  <SkeletonBox className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <SkeletonBox className="h-4 w-24 rounded" />
                    <SkeletonBox className="w-4 h-4 rounded" />
                  </div>
                  <SkeletonBox className="h-3 w-full rounded" />
                  <SkeletonBox className="h-3 w-3/4 rounded" />
                  <div className="flex items-center gap-3">
                    <SkeletonBox className="h-3 w-12 rounded" />
                    <SkeletonBox className="h-3 w-8 rounded" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <SkeletonBox className="h-5 w-12 rounded" />
                    <SkeletonBox className="w-16 h-7 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Most Popular Section Skeleton (List Layout) */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <SkeletonBox className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <SkeletonBox className="h-5 w-32 rounded-lg" />
            <SkeletonBox className="h-3 w-24 rounded" />
          </div>
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <SkeletonBox className="w-16 h-16 rounded-xl" />
                  <SkeletonBox className="absolute -top-1 -right-1 w-6 h-6 rounded-full" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <SkeletonBox className="h-4 w-32 rounded" />
                      <div className="flex items-center gap-3">
                        <SkeletonBox className="h-3 w-12 rounded" />
                        <SkeletonBox className="h-3 w-8 rounded" />
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <SkeletonBox className="h-5 w-12 rounded ml-auto" />
                      <SkeletonBox className="w-12 h-7 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Features Grid Skeleton */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <SkeletonBox className="w-10 h-10 rounded-lg mx-auto mb-3" />
            <SkeletonBox className="h-4 w-16 mx-auto mb-1 rounded" />
            <SkeletonBox className="h-3 w-12 mx-auto rounded" />
          </div>
        ))}
      </div>

      {/* 8. Quick Menu Banner Skeleton */}
      <div className="mb-6">
        <SkeletonBox className="h-32 rounded-2xl" />
      </div>

      {/* 9. Restaurant Highlights Skeleton */}
      <div className="mb-8">
        <SkeletonBox className="h-6 w-32 rounded-lg mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3">
                <SkeletonBox className="w-10 h-10 rounded-lg" />
                <SkeletonBox className="h-4 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}