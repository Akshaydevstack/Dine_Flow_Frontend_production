import { Link } from "react-router-dom";
import { Star, Leaf, Clock, Plus, Minus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { addToCart } from "../../../../store/slices/cartSlice";
import { useNavigate } from "react-router-dom";

// ... (imports remain the same)

export default function VegSpecial({ dishes = [], isLoading = false }) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const navigate = useNavigate();

  const getCartQuantity = (dishId) => {
    const item = cartItems.find((item) => item.dish_id === dishId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (dish, e) => {
    e.stopPropagation();
    dispatch(addToCart({ dish_id: dish.public_id, quantity: 1 }));
  };

  const handleDishClick = (dishId) => {
    navigate(`/customer/dish/${dishId}`);
  };

  // SKELETON STATE
  if (isLoading) {
    return (
      <div className="pt-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div>
              <div className="w-32 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-1" />
              <div className="w-24 h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="w-16 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
              <div className="w-full h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-3" />
              <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
              <div className="w-1/2 h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4" />
              <div className="flex justify-between">
                <div className="w-12 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="w-14 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!dishes || dishes.length === 0) return null;

  return (
     // ... (Keep your existing return JSX here)
    <div className="pt-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Pure Veg Favorites
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Plant-based delights
            </p>
          </div>
        </div>
        <Link
          to="/menu?category=veg"
          className="text-sm font-medium text-green-600 dark:text-green-400"
        >
          View all →
        </Link>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-2 gap-3">
        {dishes.slice(0, 4).map((dish) => {
          const quantity = getCartQuantity(dish.public_id);

          return (
            <div
              key={dish.public_id}
              onClick={() => handleDishClick(dish.public_id)}
              className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-green-100 dark:border-green-900 shadow-sm cursor-pointer"
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={dish.images?.[0] || "/api/placeholder/160/120"}
                  alt={dish.name}
                  className="w-full h-32 object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2">
                  <div className="w-5 h-5 bg-white rounded-full border-2 border-green-600 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-white">
                      {dish.average_rating || "4.5"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">
                  {dish.name}
                </h3>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{dish.prep_time || 20} min</span>
                  </div>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {dish.total_orders || "50+"} orders
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold text-gray-900 dark:text-white">
                      ₹{dish.price}
                    </div>
                    {dish.original_price &&
                      dish.original_price > dish.price && (
                        <div className="text-xs text-gray-400 line-through">
                          ₹{dish.original_price}
                        </div>
                      )}
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(dish, e)}
                    className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 active:scale-95 transition-all uppercase"
                  >
                    ADD
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View More */}
      {dishes.length > 4 && (
        <div className="mt-4 text-center">
          <Link
            to="/menu?category=veg"
            className="inline-flex items-center gap-2 px-6 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-medium rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <Leaf className="w-4 h-4" />
            View all {dishes.length} veg dishes
          </Link>
        </div>
      )}
    </div>
  );
}