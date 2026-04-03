import { Star, Clock, ArrowRight, Sparkles } from "lucide-react";
import { useAppDispatch } from "../../../../store/hooks";
import { Link, useNavigate } from "react-router-dom";
import { addToCart } from "../../../../store/slices/cartSlice";

export default function RecommendedDishes({ dishes = [], isLoading = false }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleAddToCart = (dish, e) => {
    e.stopPropagation();
    dispatch(addToCart({ dish_id: dish.public_id, quantity: 1 }));
  };

  const handleDishClick = (dishId) => {
    navigate(`/customer/dish/${dishId}`);
  };

  // Skeleton loader — shows while AI is computing
  if (isLoading) {
    return (
      <div className="pt-2 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-5 w-44 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
            <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/2" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!dishes || dishes.length === 0) return null;

  return (
    <div className="pt-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Recommended For You
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Personalised picks based on your taste
          </p>
        </div>
        <Link
          to="/menu"
          className="text-purple-600 dark:text-purple-400 text-sm font-medium flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Dishes List */}
      <div className="space-y-3">
        {dishes.slice(0, 6).map((dish) => (
          <div
            key={dish.public_id}
            onClick={() => handleDishClick(dish.public_id)}
            className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 shadow-sm cursor-pointer"
          >
            <div className="flex gap-3">
              {/* Image */}
              <div className="relative flex-shrink-0">
                <img
                  src={dish.images?.[0] || "/api/placeholder/80/80"}
                  alt={dish.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="absolute -top-1 -right-1 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold rounded">
                  For You
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
                    {dish.name}
                  </h3>
                  <div className="text-base font-bold text-gray-900 dark:text-white">
                    ₹{dish.price}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium">
                      {dish.average_rating || "4.5"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">•</span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{dish.prep_time || 20} min</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  {dish.description || "Delicious recommended dish"}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {dish.is_veg ? (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        <span>Veg</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <div className="w-2 h-2 bg-red-600 rounded-full" />
                        <span>Non-Veg</span>
                      </div>
                    )}
                    {dish.is_spicy && (
                      <span className="text-xs text-red-500">🌶️ Spicy</span>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(dish, e)}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold rounded-lg active:scale-95 transition-all uppercase"
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