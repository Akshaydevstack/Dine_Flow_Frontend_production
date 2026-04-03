import React from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, Calendar } from "lucide-react";

export default function WelcomeAdmin({ adminName = "Admin" }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden
                 bg-white dark:bg-gray-900
                 border border-gray-100 dark:border-gray-800
                 rounded-xl px-4 py-2.5 shadow-sm
                 flex items-center justify-between gap-3"
    >
      {/* Glow */}
      <div className="absolute top-[-16px] right-[-16px] w-24 h-24
                      bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Left — icon + text */}
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="relative flex-shrink-0">
          <div className="bg-orange-100 dark:bg-orange-500/20
                          text-orange-600 dark:text-orange-400
                          rounded-lg p-2">
            <UtensilsCrossed size={18} />
          </div>
          {/* Live dot */}
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full
                             rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
        </div>

        {/* Text */}
       
<div>
  <h2 className="text-base font-black text-gray-800 dark:text-white tracking-tight leading-none">
    {greeting}, {adminName}!
  </h2>
  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2">
    DineFlow is synced and monitoring{" "}
    <span className="text-orange-500 font-bold">Live Service</span>.
  </p>
</div>

      </div>

      {/* Right — date */}
      <div className="flex items-center gap-1.5 px-3 py-1.5
                      bg-gray-50 dark:bg-gray-800/50
                      rounded-lg border border-gray-100 dark:border-gray-700/50
                      flex-shrink-0">
        <Calendar size={11} className="text-gray-400" />
        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {today}
        </span>
      </div>
    </motion.div>
  );
}