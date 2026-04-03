import React from "react";
import { ChefHat, Crown, Gem, Coffee } from "lucide-react";
export default function RestaurantHighlights() {
  const highlights = [
    { icon: ChefHat, text: "Master Chef", color: "text-amber-600" },
    { icon: Gem, text: "Premium", color: "text-blue-600" },
    { icon: Coffee, text: "Brewmaster", color: "text-amber-800" },
    { icon: Crown, text: "Awarded", color: "text-yellow-600" },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Why Choose Us
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {highlights.map((highlight, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <highlight.icon className={`w-5 h-5 ${highlight.color}`} />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {highlight.text}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
