import React, { memo } from "react";
import { useSelector } from "react-redux";
import { StarIcon, MessageSquareIcon, ArrowRightIcon } from "lucide-react";
import { selectAdminReviews, selectAdminReviewLoading } from "../../../../store/slices/restaurantAdminSlice/adminReviewSlice";

const RecentReviewsWidget = memo(({ onShowAll }) => {
  const reviews = useSelector(selectAdminReviews);
  const loading = useSelector(selectAdminReviewLoading);
  const recentReviews = reviews.slice(0, 10);

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>

      <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 tracking-tight">Guest Experience</h2>
            </div>
            <button onClick={onShowAll} className="group flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors">
              Show all <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
            Live stream of customer ratings and comments. Monitor dish-specific performance and dining satisfaction.
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
          {loading && reviews.length === 0 ? (
             <div className="h-full flex items-center justify-center animate-pulse text-[10px] font-bold text-gray-400 uppercase">Loading Feedback...</div>
          ) : recentReviews.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-50 text-center py-10">
              <MessageSquareIcon size={30} className="text-slate-300 mb-2" />
              <span className="text-[10px] font-bold uppercase">No feedback yet</span>
            </div>
          ) : (
            recentReviews.map((review) => (
              <div key={review.public_id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{review.user_name || "Anonymous"}</span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} size={10} className={`${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] font-bold text-blue-500 mb-1 uppercase italic">{review.dish_name || "General Feedback"}</p>
                <div className="flex gap-2">
                  <MessageSquareIcon size={12} className="text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed italic">"{review.comment || "Rated without comment."}"</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {!loading && recentReviews.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <button onClick={onShowAll} className="w-full py-2 rounded-xl text-xs font-bold text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 transition-all">
              View All Feedback →
            </button>
          </div>
        )}
      </div>
    </>
  );
});

export default RecentReviewsWidget;