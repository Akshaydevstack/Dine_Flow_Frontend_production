import { useAppSelector } from "../../../../store/hooks";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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
    <div className="mb-1">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-md font-bold text-gray-900 dark:text-white">
          Popular Categories
        </h2>
        <Link
          to="/customer/menu"
          className="text-purple-600 dark:text-purple-400 text-xs font-medium flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
        {catLoading ? (
          skeletonArray.map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center flex-shrink-0 min-w-[80px] animate-pulse"
            >
              {/* Maintains height, but background-less look uses a subtle circle for the skeleton */}
              <div className="w-14 h-14 rounded-full mb-1 flex-shrink-0 bg-gray-200 dark:bg-gray-800"></div>
              <div className="w-12 h-2.5 bg-gray-200 dark:bg-gray-800 rounded mt-1"></div>
            </div>
          ))
        ) : (
          categories.map((cat) => (
            <button
              key={cat.public_id}
              onClick={() => handleCategoryClick(cat.public_id)}
              className="flex flex-col items-center flex-shrink-0 min-w-[80px]"
            >
              {/* Height maintained at w-14 (56px). Background classes removed. */}
              <div className="w-14 h-14 mb-1 flex-shrink-0 overflow-hidden">
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