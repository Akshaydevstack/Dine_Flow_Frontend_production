import { CheckCircle, ArrowRight, ShoppingBag } from "lucide-react";

export default function OrderSuccessModal({
  orderId = "#0000", 
  onClose,
  onViewOrders,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
      
      {/* 1. BACKDROP (Glassmorphism) */}
      <div 
        className="absolute inset-0 bg-gray-900/40 dark:bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={onClose} 
      />

      {/* 2. MODAL CARD */}
      <div
        className="
          relative
          w-full max-w-[360px]
          rounded-[2.5rem]
          bg-white dark:bg-gray-900
          border border-white dark:border-gray-800
          shadow-[0_20px_50px_rgba(0,0,0,0.3)]
          p-8
          text-center
          z-10
          animate-in zoom-in-95 duration-300
        "
      >
        {/* Glow Effect behind icon */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -z-10" />

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-green-500/20">
              <CheckCircle className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-black dark:text-white tracking-tight">
            Order Confirmed!
          </h2>
          <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">
            Reference: <span className="text-purple-600 dark:text-purple-400">{orderId}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed px-4">
            Your culinary experience has begun. We'll notify you when it's ready.
          </p>
        </div>

        {/* Actions - Themed Buttons */}
        <div className="space-y-3">
          <button
            onClick={onViewOrders}
            className="
              w-full
              bg-gray-900 dark:bg-white
              text-white dark:text-gray-900
              py-4
              rounded-2xl
              font-black
              text-xs
              uppercase
              tracking-widest
              transition-all
              active:scale-95
              flex items-center justify-center gap-2
              shadow-xl dark:shadow-none
            "
          >
            Track Order <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="
              w-full
              bg-gray-50 dark:bg-gray-800
              text-gray-500 dark:text-gray-300
              py-4
              rounded-2xl
              font-black
              text-xs
              uppercase
              tracking-widest
              transition-all
              hover:bg-gray-100 dark:hover:bg-gray-700
              active:scale-95
              flex items-center justify-center gap-2
            "
          >
            <ShoppingBag className="w-4 h-4" /> Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}