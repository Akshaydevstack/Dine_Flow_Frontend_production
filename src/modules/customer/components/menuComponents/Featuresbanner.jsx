import { Truck, Shield, Award, Clock, Star, Zap } from "lucide-react";

const features = [
  { icon: Truck,  title: "Fast Delivery",    description: "30 min or free",        gradient: "from-blue-500 to-cyan-500" },
  { icon: Shield, title: "100% Hygienic",    description: "Safe & sealed",          gradient: "from-green-500 to-emerald-500" },
  { icon: Award,  title: "Premium Quality",  description: "Fresh ingredients",      gradient: "from-yellow-500 to-amber-500" },
  { icon: Clock,  title: "Live Tracking",    description: "Track your order",       gradient: "from-purple-500 to-pink-500" },
  { icon: Star,   title: "Top Rated",        description: "4.8+ rating",            gradient: "from-orange-500 to-red-500" },
  { icon: Zap,    title: "Quick Prep",       description: "Fresh & fast",           gradient: "from-indigo-500 to-purple-500" },
];

export default function FeaturesBanner() {
  return (
    <div className="px-4 py-6">
      {/* Section label */}
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500 mb-3 text-center">
        Why Choose Us
      </p>

      {/* 2-col grid, compact cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {features.map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 shadow-sm"
          >
            {/* Icon */}
            <div className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} shadow-sm`}>
              <f.icon className="w-4 h-4 text-white" strokeWidth={2.2} />
            </div>

            {/* Text */}
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-gray-900 dark:text-white leading-tight truncate">
                {f.title}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight truncate">
                {f.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}