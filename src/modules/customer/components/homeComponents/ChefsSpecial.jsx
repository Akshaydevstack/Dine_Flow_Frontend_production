import React from "react";
import { Star, Clock, Flame, Plus } from "lucide-react";
import { useAppDispatch } from "../../../../store/hooks";
import { addToCart } from "../../../../store/slices/cartSlice";
import { useNavigate } from "react-router-dom";

export default function ChefsSpecial({ popular = [], isLoading = false }) {
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

  // If we are loading OR if we initially have no data, show the skeleton
  if (isLoading || popular.length === 0) {
    return (
      <div>
        {/* Skeleton Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div>
              <div className="w-24 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-1" />
              <div className="w-32 h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="w-16 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 p-3"
            >
              <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-3" />
              <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4" />
              <div className="flex items-center justify-between">
                <div className="w-12 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="w-14 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Chef's Special
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Most popular this week
            </p>
          </div>
        </div>
        <button className="text-sm font-medium text-red-500 flex items-center gap-1">
          View all
          <span className="text-lg">→</span>
        </button>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-2 gap-3">
        {popular.slice(0, 4).map((dish) => (
          <div
            key={dish.public_id}
            onClick={() => handleDishClick(dish.public_id)}
            className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            {/* Image Section */}
            <div className="relative">
              <div className="aspect-square overflow-hidden">
                <img
                  src={dish.images?.[0] || "/api/placeholder/200/200"}
                  alt={dish.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {dish.is_spicy && (
                  <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-medium rounded-full">
                    🌶️ SPICY
                  </span>
                )}
                {dish.is_veg ? (
                  <div className="w-6 h-6 bg-white rounded-full border-2 border-green-600 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-white rounded-full border-2 border-red-600 flex items-center justify-center">
                    <div className="w-2 h-2 bg-red-600 rounded-full" />
                  </div>
                )}
              </div>

              {/* Rating Badge */}
              <div className="absolute bottom-2 right-2">
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

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                {dish.description || "Delicious special dish"}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{dish.prep_time || 20} min</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {dish.total_orders || "500+"} orders
                </span>
              </div>

              {/* Price & CTA */}
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
                  className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all uppercase"
                >
                  ADD
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Horizontal Scroll Alternative (For more items) */}
      {popular.length > 4 && (
        <div className="mt-4 flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {popular.slice(4, 8).map((dish) => (
            <div
              key={dish.public_id}
              onClick={() => handleDishClick(dish.public_id)}
              className="min-w-[177px] bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-100 dark:border-gray-800 cursor-pointer"
            >
              <div className="relative mb-2">
                <img
                  src={dish.images?.[0] || "/api/placeholder/120/120"}
                  alt={dish.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                {dish.is_veg && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border border-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full m-auto mt-1" />
                  </div>
                )}
              </div>

              <h4 className="font-medium text-gray-900 dark:text-white text-xs mb-1 line-clamp-1">
                {dish.name}
              </h4>

              <div className="flex items-center gap-1 mb-2">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-medium">
                  {dish.average_rating || "4.5"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  ₹{dish.price}
                </div>
                <button
                  onClick={(e) => handleAddToCart(dish, e)}
                  className="w-7 h-7 bg-red-500 text-white rounded-md flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}