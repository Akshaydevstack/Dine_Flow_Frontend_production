import { useAppSelector } from "../../../../store/hooks";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LayoutGrid } from "lucide-react"; // Using LayoutGrid as a matching icon

export default function PopularCategories() {
  const navigate = useNavigate();

  const {
    categories,
    loading: catLoading,
  } = useAppSelector((s) => s.categories);

  const handleCategoryClick = (categoryId) => {
    navigate(`/customer/menu?category=${categoryId}`);
  };

  const skeletonArray = Array.from({ length: 4 });

  return (
    <div className="mb-3">
      {/* Header - EXACT MATCH to Chef's Special */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
            <LayoutGrid className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Popular Categories
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Explore by food type
            </p>
          </div>
        </div>
        <Link
          to="/customer/menu"
          className="text-sm font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Horizontal Scroll Area */}
      <div className="flex overflow-x-auto gap-1 pb-2 no-scrollbar">
        {catLoading ? (
          skeletonArray.map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center flex-shrink-0 min-w-[80px] animate-pulse"
            >
              <div className="w-14 h-14 rounded-full mb-2 bg-gray-200 dark:bg-gray-800"></div>
              <div className="w-12 h-3 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          ))
        ) : (
          categories.map((cat) => (
            <button
              key={cat.public_id}
              onClick={() => handleCategoryClick(cat.public_id)}
              className="flex flex-col items-center flex-shrink-0 min-w-[80px] group"
            >
              {/* Image without background */}
              <div className="w-14 h-14 mb-2 flex-shrink-0 overflow-hidden transition-transform group-active:scale-90">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-contain" 
                  loading="lazy"
                />
              </div>
              <span className="text-xs font-semibold text-gray-900 dark:text-white text-center leading-tight truncate w-full px-1">
                {cat.name}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}