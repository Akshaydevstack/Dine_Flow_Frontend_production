import { useRef, useState, useEffect } from "react";

// ==========================================
// 💀 SKELETON COMPONENT
// ==========================================
export function CategoryFilterSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800/60">
      <div className="flex gap-3 overflow-hidden px-4 py-2">
        {/* Render 7 skeleton pills to fill the horizontal space on mobile */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1">
            {/* Image placeholder */}
            <div className="w-[50px] h-[50px] rounded-[14px] bg-gray-200 dark:bg-gray-800 animate-pulse" />
            {/* Text placeholder */}
            <div className="h-2.5 w-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mt-0.5" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 🏷️ REAL CATEGORY COMPONENT
// ==========================================
export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategorySelect,
  isLoading // <-- Added isLoading prop
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const selected = container.querySelector("[data-selected='true']");
    if (selected) {
      selected.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selectedCategory]);

  // Return the skeleton if data is loading
  if (isLoading) {
    return <CategoryFilterSkeleton />;
  }

  // Ensure categories is an array before spreading
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  const allCategories = [
    { public_id: "all", name: "All", image: null },
    ...safeCategories,
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800/60">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 py-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {allCategories.map((cat) => (
          <CategoryPill
            key={cat.public_id}
            category={cat}
            isSelected={selectedCategory === cat.public_id}
            onSelect={() => onCategorySelect(cat.public_id)}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryPill({ category, isSelected, onSelect }) {
  const [imgError, setImgError] = useState(false);
  const isAll = category.public_id === "all";
  const hasImg = !isAll && !!category.image && !imgError;

  return (
    <button
      data-selected={isSelected}
      onClick={onSelect}
      className="flex-shrink-0 flex flex-col items-center gap-1 transition-all duration-200 active:scale-95"
      aria-label={category.name}
    >
      <div
        className={`
          relative w-[50px] h-[50px] rounded-[14px] overflow-hidden
          flex items-center justify-center
          transition-all duration-200
          ${isSelected
            ? "ring-2 ring-violet-600 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
            : ""
          }
        `}
      >
        {hasImg ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          /* "All" pill — keep a neutral bg only for the icon placeholder */
          <div
            className={`
              w-full h-full flex items-center justify-center
              transition-colors duration-200
              ${isSelected ? "bg-violet-600" : "bg-gray-100 dark:bg-gray-800"}
            `}
          >
            {isAll && <AllIcon active={isSelected} />}
          </div>
        )}
      </div>

      <span
        className={`
          text-[10px] font-semibold leading-tight text-center max-w-[54px] truncate
          transition-colors duration-200
          ${isSelected
            ? "text-violet-600 dark:text-violet-400"
            : "text-gray-500 dark:text-gray-400"
          }
        `}
      >
        {category.name}
      </span>
    </button>
  );
}

function AllIcon({ active }) {
  const color = active ? "white" : "#9ca3af";
  const size = 5;
  const gap = 3.5;
  const positions = [0, 1, 2].flatMap((row) =>
    [0, 1, 2].map((col) => ({
      x: col * (size + gap),
      y: row * (size + gap),
    }))
  );
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      {positions.map(({ x, y }, i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={size}
          height={size}
          rx="1.5"
          fill={color}
          opacity={i === 4 ? 1 : 0.7}
        />
      ))}
    </svg>
  );
}