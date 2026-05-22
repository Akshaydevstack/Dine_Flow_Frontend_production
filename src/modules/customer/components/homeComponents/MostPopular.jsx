import { Star, TrendingUp, Clock } from "lucide-react";
import { useAppDispatch } from "../../../../store/hooks";
import { addToCart } from "../../../../store/slices/cartSlice";
import { useNavigate } from "react-router-dom";

// ... (imports remain the same)

export default function MostPopular({ trending = [], isLoading = false }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleAddToCart = (dish, e) => {
    e.stopPropagation();
    dispatch(
      addToCart({
        dish_id: dish.public_id,
        name: dish.name,
        price: dish.price,
        image: dish.images?.[0],
        quantity: 1,
      })
    );
  };

  const handleDishClick = (dishId) => {
    navigate(`/customer/dish/${dishId}`);
  };


  // SKELETON STATE
  if (isLoading) {
    return (
      <div className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div>
              <div className="w-28 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-1" />
              <div className="w-32 h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex gap-3">
              <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="flex justify-between mt-2">
                  <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-6 w-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!trending || trending.length === 0) return null;

  return (
     // ... (Keep your existing return JSX here)
    <div className="pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Most Popular
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Customer favorites
            </p>
          </div>
        </div>
        <button className="text-sm font-medium text-orange-600 dark:text-orange-400">
          Trending now →
        </button>
      </div>

      {/* Dishes List */}
      <div className="space-y-3">
        {trending.slice(0, 4).map((item, index) => (
          <div
            key={item.public_id}
            onClick={() => handleDishClick(item.public_id)}
            className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 shadow-sm cursor-pointer"
          >
            <div className="flex gap-3">
              {/* Ranking Badge & Image */}
              <div className="relative flex-shrink-0">
                <div className="absolute -top-1 -left-1 w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center z-10">
                  <span className="text-xs font-bold text-white">
                    #{index + 1}
                  </span>
                </div>
                <img
                  src={item.images?.[0] || "/api/placeholder/60/60"}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover"
                  loading="lazy"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
                    {item.name}
                  </h3>
                  <div className="text-base font-bold text-gray-900 dark:text-white">
                    ₹{item.price}
                  </div>
                </div>

                {/* Added Description */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                  {item.description || "Popular choice among customers"}
                </p>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium">
                      {item.average_rating || "4.5"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">•</span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{item.prep_time || 20} min</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {item.total_orders && (
                    <div className="text-xs text-gray-500">
                      {item.total_orders}+ orders
                    </div>
                  )}
                  {!item.total_orders && <div />}
                  
                  <button
                    onClick={(e) => handleAddToCart(item, e)}
                    className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-orange-500/25 active:scale-95 transition-all uppercase"
                  >
                    ADD
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}