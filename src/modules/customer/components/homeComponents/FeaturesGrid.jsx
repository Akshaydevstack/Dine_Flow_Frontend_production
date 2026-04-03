import React from "react";
import {
  Search,
  Star,
  Clock,
  ChefHat,
  Sparkles,
  Shield,
  Truck,
  Award,
  CreditCard,
  ArrowRight,
  Check,
  Crown,
  Zap,
  Gem,
  Coffee,
  TrendingUp,
} from "lucide-react";
export default function FeaturesGrid() {
  const features = [
    {
      icon: Truck,
      title: "Fast",
      desc: "30 min",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Shield,
      title: "Safe",
      desc: "Hygienic",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Award,
      title: "Rated",
      desc: "4.8+",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      icon: CreditCard,
      title: "Easy Pay",
      desc: "UPI / Card",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Clock,
      title: "Live",
      desc: "Tracking",
      color: "bg-red-100 text-red-600",
    },
    {
      icon: Check,
      title: "Quality",
      desc: "Certified",
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {features.map((feature, index) => (
        <div
          key={feature.title}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <div className={`inline-flex p-2.5 rounded-lg ${feature.color} mb-3`}>
            <feature.icon className="w-5 h-5" />
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {feature.title}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {feature.desc}
          </div>
        </div>
      ))}
    </div>
  );
}
