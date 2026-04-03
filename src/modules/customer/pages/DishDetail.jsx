import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Flame,
  Leaf,
  Star,
  ShoppingCart,
  Plus,
  Minus,
  Tag,
  MessageCircle,
  Check,
  X,
  Share2,
  AlertCircle,
  User,
  Edit3,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { addToCart, updateCartItem } from "../../../store/slices/cartSlice";
import axiosClient from "../../../api/axiosClient";

export default function DishDetails() {
  const { dishId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dish, setDish] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const cartItems = useAppSelector((state) => state.cart.items);
  const existingCartItem = cartItems.find((item) => item.dish_id === dishId);

  useEffect(() => {
    fetchDish();
  }, [dishId]);

  
  const fetchDish = async () => {
  setLoading(true);
  try {
    const response = await axiosClient.get(`/menu/customer/dishe/${dishId}/`);
    const dishData = response.data;

    setDish(dishData);

    // ✅ AI TRACKING CALL
    try {
      await axiosClient.post("/ai/track-view/", {
        dish: dishData,
      });
    } catch (err) {
      console.error("AI tracking failed:", err);
    }

    if (existingCartItem) {
      setQuantity(existingCartItem.quantity);
    }
  } catch (error) {
    console.error("Error fetching dish:", error);
  } finally {
    setLoading(false);
  }
};

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!dish || addingToCart) return;

    setAddingToCart(true);

    try {
      if (existingCartItem) {
        await dispatch(
          updateCartItem({
            dish_id: dish.public_id,
            quantity: quantity,
          }),
        );
      } else {
        await dispatch(
          addToCart({
            dish_id: dish.public_id,
            name: dish.name,
            price: dish.price,
            original_price: dish.original_price,
            quantity: quantity,
            image: dish.images?.[0] || null,
            is_veg: dish.is_veg,
          }),
        );
      }

      setShowAddedToCart(true);
      setTimeout(() => setShowAddedToCart(false), 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/customer/cart");
  };

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim() || submittingReview) return;

    setSubmittingReview(true);
    try {
      const sessionDetails = JSON.parse(
        localStorage.getItem("session_details") || "{}",
      );

      const reviewPayload = {
        dish: dish.public_id,
        user_avatar: sessionDetails.user_avatar || "https://avatar.png",
        rating: newReview.rating,
        comment: newReview.comment.trim(),
      };

      await axiosClient.post("/menu/customer/reviews/", reviewPayload);

      await fetchDish();

      setNewReview({ rating: 5, comment: "" });
      setShowReviewForm(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: dish.name,
          text: `Check out ${dish.name} - ${dish.description}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      setShowShareOptions(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
    setShowShareOptions(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const calculateDiscount = () => {
    if (!dish?.original_price || dish.original_price === "None") return 0;
    const original = parseFloat(dish.original_price);
    const current = parseFloat(dish.price);
    return Math.round(((original - current) / original) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </div>
          </div>
        </div>
        <div className="px-3 py-3">
          <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-3 bg-gray-200 dark:bg-gray-700 rounded"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Dish Not Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The dish you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full text-sm font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount();
  const totalPrice = parseFloat(dish.price) * quantity;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <ArrowLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">
                {dish.category_name}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Dish Details
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <Share2 className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 py-3">
        {/* Image Gallery - Simple Scroll */}
        <div className="mb-4">
          <div className="relative">
            <div className="w-full h-64 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={dish.images[selectedImage]}
                alt={dish.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z'%3E%3C/path%3E%3Cline x1='3' y1='6' x2='21' y2='6'%3E%3C/line%3E%3Cpath d='M16 10a4 4 0 0 1-8 0'%3E%3C/path%3E%3C/svg%3E";
                }}
              />
            </div>

            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-3 left-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {discount}% OFF
                </div>
              </div>
            )}

            {/* Veg/Non-Veg Badge */}
            <div className="absolute top-3 right-3">
              <div
                className={`w-6 h-6 rounded-full border-2 ${dish.is_veg ? "border-green-500" : "border-red-500"} flex items-center justify-center bg-white dark:bg-gray-800`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${dish.is_veg ? "bg-green-500" : "bg-red-500"}`}
                />
              </div>
            </div>

            {/* Image Counter */}
            {dish.images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                <span className="text-xs text-white font-medium">
                  {selectedImage + 1}/{dish.images.length}
                </span>
              </div>
            )}
          </div>

          {/* Horizontal Image Scroll - Simple */}
          {dish.images.length > 1 && (
            <div className="mt-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {dish.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index
                        ? "border-purple-500"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${dish.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dish Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4">
          <div className="mb-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {dish.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {dish.description}
            </p>

            {/* Price */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ₹{dish.price}
              </span>
              {dish.original_price && dish.original_price !== "None" && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{dish.original_price}
                </span>
              )}
              {dish.is_quick_bites && (
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded">
                  Quick Bite
                </span>
              )}
            </div>
          </div>

          {/* Dish Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Prep Time
                </span>
              </div>
              <span className="text-gray-900 dark:text-white font-medium">
                {dish.prep_time} mins
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {dish.is_veg ? (
                  <Leaf className="w-4 h-4 text-green-500" />
                ) : (
                  <Flame className="w-4 h-4 text-red-500" />
                )}
                <span className="text-gray-600 dark:text-gray-400">Type</span>
              </div>
              <span className="text-gray-900 dark:text-white font-medium">
                {dish.is_veg ? "Vegetarian" : "Non-Vegetarian"}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-600 dark:text-gray-400">Rating</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-900 dark:text-white font-medium">
                  {dish.average_rating}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  ({dish.review_count} reviews)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Total Orders
                </span>
              </div>
              <span className="text-gray-900 dark:text-white font-medium">
                {dish.total_orders}
              </span>
            </div>
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Select Quantity
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Total: ₹{totalPrice.toFixed(2)}
              </div>
            </div>
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg">
              <button
                onClick={handleDecrease}
                className="p-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l-lg transition-colors disabled:opacity-50"
                disabled={quantity <= 1}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-4 font-bold text-gray-900 dark:text-white text-sm min-w-[40px] text-center">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="p-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Reviews ({dish.review_count})
            </h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-sm text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Write Review
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Your Rating:
                </span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() =>
                        setNewReview({ ...newReview, rating: star })
                      }
                      className="p-1"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newReview.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview({ ...newReview, comment: e.target.value })
                }
                placeholder="Share your experience..."
                className="w-full h-20 p-3 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg resize-none"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {newReview.comment.length}/500 characters
                </span>
                <button
                  onClick={handleSubmitReview}
                  disabled={!newReview.comment.trim() || submittingReview}
                  className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-3">
            {dish.reviews.length > 0 ? (
              dish.reviews.map((review) => (
                <div
                  key={review.public_id}
                  className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {review.user_avatar ? (
                          <img
                            src={review.user_avatar}
                            alt={review.user_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {review.user_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {review.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No reviews yet. Be the first to review!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Share Options Modal */}
        {showShareOptions && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 w-full max-w-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Share Dish
                </h3>
                <button
                  onClick={() => setShowShareOptions(false)}
                  className="p-1"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-3">
                <button
                  onClick={copyToClipboard}
                  className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center gap-3 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Copy Link
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Copy dish link to clipboard
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Added to Cart Notification */}
        {showAddedToCart && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-xl p-4 shadow-lg z-50 animate-slideDown">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Added to cart!
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {quantity} × {dish.name}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddToCart}
            disabled={!dish.is_available || addingToCart}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingToCart ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding...
              </span>
            ) : existingCartItem ? (
              "Update Cart"
            ) : (
              "Add to Cart"
            )}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={!dish.is_available}
            className="px-5 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm font-semibold"
          >
            Buy Now
          </button>
        </div>

        {!dish.is_available && (
          <div className="mt-2 text-center">
            <span className="text-xs text-red-500 dark:text-red-400">
              Currently unavailable
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
