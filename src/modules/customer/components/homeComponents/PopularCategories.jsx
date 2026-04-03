import { useAppSelector } from "../../../../store/hooks";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function PopularCategories() {
  const navigate = useNavigate();

  const {
    categories,
    fetched: catFetched,
    loading: catLoading,
  } = useAppSelector((s) => s.categories);

  const handleCategoryClick = (categoryId) => {
    navigate(`/customer/menu?category=${categoryId}`);
  };

  // Create a dummy array of 4 items to map over for our skeleton loaders
  const skeletonArray = Array.from({ length: 4 });

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Popular Categories
        </h2>
        <Link
          to="/customer/menu"
          className="text-purple-600 dark:text-purple-400 text-sm font-medium flex items-center gap-1"
        >
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
        {catLoading ? (
          /* SKELETON STATE: Renders while waiting for Redux data */
          skeletonArray.map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center flex-shrink-0 min-w-[100px] animate-pulse"
            >
              {/* Fake Image Box */}
              <div className="w-20 h-20 rounded-2xl mb-2 flex-shrink-0 bg-gray-200 dark:bg-gray-800"></div>
              {/* Fake Text Line */}
              <div className="w-16 h-3 bg-gray-200 dark:bg-gray-800 rounded mt-1"></div>
            </div>
          ))
        ) : (
          /* ACTUAL DATA STATE: Renders once data is fetched */
          categories.map((cat) => (
            <button
              key={cat.public_id}
              onClick={() => handleCategoryClick(cat.public_id)}
              className="flex flex-col items-center flex-shrink-0 min-w-[100px]"
            >
              <div className="w-20 h-20 rounded-2xl mb-2 flex-shrink-0 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-contain"
                  style={{ display: "block" }}
                  loading="lazy"
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white text-center leading-tight">
                {cat.name}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}