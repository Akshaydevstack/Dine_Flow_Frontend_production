import { X } from "lucide-react";

export default function ActiveFilters({
  filters,
  categories,
  onClearAll,
  onRemoveCategory,
  onRemoveVeg,
  onRemoveSpicy,
}) {
  const getCategoryName = (id) => {
    if (id === "all") return null;
    return categories.find((c) => c.public_id === id)?.name ?? null;
  };

  const categoryName = getCategoryName(filters.selectedCategory);

  return (
    <div
      className="px-3 py-0.5 bg-violet-50/70 dark:bg-violet-950/20 border-b border-violet-100 dark:border-violet-900/30 flex items-center gap-1.5 overflow-x-auto"
      style={{ scrollbarWidth: "none" }}
    >
      <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap flex-shrink-0">
        Active
      </span>

      {categoryName && (
        <Chip label={categoryName} onRemove={onRemoveCategory} color="violet" />
      )}
      {filters.isVeg && (
        <Chip label="🌿 Veg" onRemove={onRemoveVeg} color="emerald" />
      )}
      {filters.isSpicy && (
        <Chip label="🌶 Spicy" onRemove={onRemoveSpicy} color="rose" />
      )}

      <button
        onClick={onClearAll}
        className="ml-auto flex-shrink-0 text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 whitespace-nowrap transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}

function Chip({ label, onRemove, color }) {
  const styles = {
    violet:  "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
    emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    rose:    "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  };

  return (
    <span
      className={`inline-flex items-center gap-0.5 pl-2 pr-1 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap flex-shrink-0 ${styles[color]}`}
    >
      {label}
      <button
        onClick={onRemove}
        className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label={`Remove ${label}`}
      >
        <X className="w-2 h-2" />
      </button>
    </span>
  );
}