import { Star, Zap, Clock } from "lucide-react";
import { useAppDispatch } from "../../../../store/hooks";
import { addToCart } from "../../../../store/slices/cartSlice";
import { useNavigate } from "react-router-dom";

// ... (imports remain the same)

export default function QuickBites({ quickBites = [], isLoading = false }) {
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
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div>
              <div className="w-24 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-1" />
              <div className="w-20 h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[260px] bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex gap-3 flex-shrink-0">
              <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!quickBites || quickBites.length === 0) return null;

  return (
     // ... (Keep your existing return JSX here)
    <div className="pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Quick Bites
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Fast & delicious
            </p>
          </div>
        </div>
        <button className="text-sm font-medium text-blue-600 dark:text-blue-400">
          Quick order →
        </button>
      </div>

      {/* Horizontal Scroll for Mobile */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
        {quickBites.map((dish) => (
          <div
            key={dish.public_id}
            onClick={() => handleDishClick(dish.public_id)}
            className="min-w-[260px] bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 shadow-sm flex-shrink-0 cursor-pointer"
          >
            <div className="flex gap-3">
              {/* Image */}
              <div className="relative flex-shrink-0">
                <img
                  src={dish.images?.[0] || "/api/placeholder/80/80"}
                  alt={dish.name}
                  className="w-20 h-20 rounded-lg object-cover"
                  loading="lazy"
                />
                <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded">
                  {dish.prep_time || 15}min
                </div>
                {dish.is_veg ? (
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full border border-green-600">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full m-auto mt-0.5" />
                  </div>
                ) : (
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full border border-red-600">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full m-auto mt-0.5" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">
                  {dish.name}
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                  {dish.description?.slice(0,40) || "Perfect quick meal"}
                </p>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium">
                      {dish.average_rating || "4.5"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">•</span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Quick</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold text-gray-900 dark:text-white">
                      ₹{dish.price}
                    </div>
                    {dish.original_price && dish.original_price > dish.price && (
                      <div className="text-xs text-gray-400 line-through">
                        ₹{dish.original_price}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(dish, e)}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition-all uppercase"
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