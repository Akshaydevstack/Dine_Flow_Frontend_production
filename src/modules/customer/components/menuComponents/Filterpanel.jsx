import React from "react";
import { X, Sparkles, Flame, Tag, TrendingUp, Award, Leaf } from "lucide-react";

const SORT_OPTIONS = [
  { id: "priority", label: "Best Match", icon: Sparkles, description: "Our top recommendations" },
  { id: "popular", label: "Most Popular", icon: Flame, description: "Customer favorites" },
  { id: "price-low", label: "Price: Low to High", icon: Tag, description: "Budget friendly" }, 
  { id: "price-high", label: "Price: High to Low", icon: TrendingUp, description: "Premium selections" },
  { id: "newest", label: "Newest First", icon: Award, description: "Latest additions" },
];

export default function FilterPanel({
  filters,
  categories,
  onClose,
  onSortChange,
  onCategorySelect,
  onClearAll,
  onToggleVeg,
  onToggleSpicy,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pt-16 pb-24 sm:items-center sm:p-4">
      
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-full sm:max-h-[85vh] animate-slide-up overflow-hidden">
        
        {/* HEADER */}
        <div className="flex-none flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
          <div>
            {/* Reduced from text-lg to text-base */}
            <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
              Filters & Sorting
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Customize your dining experience
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close filters"
          >
            {/* Slightly smaller X icon */}
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          
          {/* Dietary Preferences */}
          <div>
            <h3 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-green-600" />
              Dietary
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <FilterToggle
                label="Veg Only"
                icon="🌱"
                isActive={filters.isVeg}
                onClick={onToggleVeg}
                activeColor="bg-green-500"
              />
              <FilterToggle
                label="Spicy"
                icon="🌶️"
                isActive={filters.isSpicy}
                onClick={onToggleSpicy}
                activeColor="bg-red-500"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <h3 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2.5">
              Sort By
            </h3>
            <div className="space-y-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onSortChange(option.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all active:scale-[0.98] ${
                    filters.sortBy === option.id
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-100 dark:border-gray-800/60 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      filters.sortBy === option.id
                        ? "bg-purple-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {/* Slightly smaller icons in the list */}
                    <option.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div
                      // Reduced from text-sm to text-[13px]
                      className={`font-semibold text-[13px] leading-none mb-1 ${
                        filters.sortBy === option.id
                          ? "text-purple-700 dark:text-purple-300"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {option.label}
                    </div>
                    {/* Reduced from text-[11px] to text-[10px] */}
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-none mt-1">
                      {option.description}
                    </div>
                  </div>
                  {filters.sortBy === option.id && (
                    <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          {categories && categories.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2.5">
                Categories
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <CategoryChip
                  label="All Dishes"
                  icon="🍽️"
                  isActive={filters.selectedCategory === "all"}
                  onClick={() => {
                    onCategorySelect("all");
                    onClose();
                  }}
                />
                {categories.map((category) => (
                  <CategoryChip
                    key={category.public_id}
                    label={category.name}
                    icon={category.icon}
                    isActive={filters.selectedCategory === category.public_id}
                    onClick={() => {
                      onCategorySelect(category.public_id);
                      onClose();
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex-none p-4 border-t border-gray-100 dark:border-gray-800/50 bg-transparent z-10">
          <div className="flex gap-3">
            <button
              onClick={() => {
                onClearAll();
                onClose();
              }}
              // Reduced from text-sm to text-[13px]
              className="flex-1 px-3 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl text-[13px] font-bold transition-colors active:scale-95"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              // Reduced from text-sm to text-[13px]
              className="flex-1 px-3 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-xl text-[13px] font-bold shadow-md transition-all active:scale-95"
            >
              Apply Filters
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}

function FilterToggle({ label, icon, isActive, onClick, activeColor }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border font-medium transition-all duration-200 active:scale-95 ${
        isActive
          ? `${activeColor} border-transparent text-white shadow-sm`
          : "border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700"
      }`}
    >
      {/* Slightly smaller emoji */}
      <span className="text-sm">{icon}</span>
      {/* Reduced from text-xs to text-[11px] */}
      <span className="text-[11px] font-semibold">{label}</span>
    </button>
  );
}

function CategoryChip({ label, icon, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border font-medium transition-all duration-200 active:scale-95 ${
        isActive
          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-sm"
          : "border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700"
      }`}
    >
      {/* Slightly smaller emoji */}
      {icon && <span className="text-sm">{icon}</span>}
      {/* Reduced from text-xs to text-[11px] */}
      <span className="truncate text-[11px] font-semibold">{label}</span>
    </button>
  );
}