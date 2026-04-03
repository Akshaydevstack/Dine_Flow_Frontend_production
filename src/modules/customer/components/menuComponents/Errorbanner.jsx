import { AlertCircle, X, RefreshCw } from "lucide-react";

export default function ErrorBanner({ error, onRetry, onDismiss }) {
  return (
    <div className="fixed top-4 left-4 right-4 z-[100] animate-slide-down">
      <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
              Something went wrong
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200">
              {error.message || "An unexpected error occurred. Please try again."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
              aria-label="Retry"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}