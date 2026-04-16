import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  ArrowLeft,
  Sparkles,
  Tag,
  ChefHat,
  AlertCircle,
  Loader2,
  MapPin,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../../../store/slices/cartSlice";
import { createOrder } from "../../../store/slices/orderSlice";

import OrderSuccessModal from "../components/common/OrderSuccessModal";

export default function Cart() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [showSuccess, setShowSuccess] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [specialRequest, setSpecialRequest] = useState("");

  // Validation States
  const [locatingUser, setLocatingUser] = useState(false);
  const [orderError, setOrderError] = useState("");

  const {
    items,
    subtotal,
    loading,
    fetched,
    original_subtotal,
    total_discount,
    cartCount,
  } = useAppSelector((state) => state.cart);

  const { currentOrder } = useAppSelector((state) => state.orders);

  const sessionDetails = JSON.parse(
    localStorage.getItem("session_details") || "{}",
  );
  const table_public_id = sessionDetails?.current_table_id;
  const table_number = sessionDetails?.table_number || "01";

  /* ---------------- FETCH CART ---------------- */
  useEffect(() => {
    if (!fetched) {
      dispatch(fetchCart());
    }
  }, [fetched, dispatch]);

  /* ---------------- CART ACTIONS ---------------- */
  const handleIncrease = (dish_id, quantity) => {
    dispatch(updateCartItem({ dish_id, quantity: quantity + 1 }));
  };

  const handleDecrease = (dish_id, quantity) => {
    if (quantity > 1) {
      dispatch(updateCartItem({ dish_id, quantity: quantity - 1 }));
    }
  };

  const handleRemove = (dish_id) => {
    dispatch(removeFromCart(dish_id));
  };

  /* ---------------- DRF ERROR PARSER ---------------- */
  const extractErrorMessage = (payload) => {
    if (!payload) return "Failed to place order.";
    if (typeof payload === "string") return payload;

    if (payload.detail) return payload.detail;
    if (payload.message) return payload.message;
    if (payload.error) return payload.error;
    if (payload.non_field_errors) return payload.non_field_errors[0];

    const keys = Object.keys(payload);
    if (keys.length > 0) {
      const firstError = payload[keys[0]];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0];
      } else if (typeof firstError === "string") {
        return firstError;
      }
    }

    return "Failed to place order.";
  };

  /* ---------------- DISTANCE FORMATTER ---------------- */
  // ⚡ FIX: Updated to catch "(Distance: 2128m)" and convert to "(Distance: 2.13 km)"
  const formatDistanceError = (errorString) => {
    if (typeof errorString !== "string") {
      return "An error occurred while placing your order.";
    }

    // Look specifically for the exact format your backend sends
    const meterRegex = /\(Distance:\s*([0-9.,]+)m\)/i;
    const match = errorString.match(meterRegex);

    if (match) {
      const meters = parseFloat(match[1].replace(/,/g, ""));

      if (!isNaN(meters) && meters >= 1000) {
        const kilometers = (meters / 1000).toFixed(2);
        // Replace "(Distance: 2128m)" with "(Distance: 2.13 km)"
        return errorString.replace(match[0], `(Distance: ${kilometers} km)`);
      }
    }

    // Also keep a generic catch-all just in case the backend format changes slightly
    const genericMeterRegex = /([0-9.,]+)\s*meters?/i;
    const genericMatch = errorString.match(genericMeterRegex);
    if (genericMatch) {
      const meters = parseFloat(genericMatch[1].replace(/,/g, ""));
      if (!isNaN(meters) && meters >= 1000) {
        const kilometers = (meters / 1000).toFixed(2);
        return errorString.replace(genericMatch[0], `${kilometers} km`);
      }
    }

    return errorString;
  };

  /* ---------------- PLACE ORDER ---------------- */
  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    if (!table_public_id) {
      alert("No table selected. Please scan a QR code to continue.");
      return;
    }

    setOrderError("");
    setLocatingUser(true);

    let userLat = null;
    let userLng = null;

    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        });
        userLat = position.coords.latitude;
        userLng = position.coords.longitude;
      } catch (err) {
        setLocatingUser(false);
        if (err.code === 1) {
          setOrderError(
            "Please allow location access to place a dine-in order.",
          );
        } else {
          setOrderError(
            "Could not determine your location. Please check your device settings.",
          );
        }
        return;
      }
    } else {
      setLocatingUser(false);
      setOrderError("Geolocation is not supported by your browser.");
      return;
    }

    setLocatingUser(false);
    setLoadingOrder(true);

    const orderItems = items.map((item) => ({
      dish_id: item.dish_id,
      quantity: item.quantity,
    }));

    const action = await dispatch(
      createOrder({
        table_public_id,
        items: orderItems,
        special_request: specialRequest,
        user_latitude: userLat,
        user_longitude: userLng,
      }),
    );

    if (createOrder.fulfilled.match(action)) {
      dispatch(clearCart());
      setShowSuccess(true);
    } else {
      const rawErrorMessage = extractErrorMessage(action.payload);
      const formattedErrorMessage = formatDistanceError(rawErrorMessage);
      setOrderError(formattedErrorMessage);
    }

    setLoadingOrder(false);
  };

  const parsedSubtotal = parseFloat(subtotal) || 0;
  const parsedOriginalSubtotal = parseFloat(original_subtotal) || 0;
  const totalSavings = parseFloat(total_discount) || 0;

  const hasDiscount = totalSavings > 0 && parsedOriginalSubtotal > 0;

  const tax = parsedSubtotal * 0.18;
  const total = parsedSubtotal + tax;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 pb-24">
      {/* ---------- HEADER ---------- */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Your Cart
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {items.length} {items.length === 1 ? "item" : "items"} • Table{" "}
                {table_number}
              </p>
            </div>
          </div>
          <div className="relative">
            <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ---------- CONTENT ---------- */}
      <div className="px-3 py-3">
        {loading && !fetched ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl p-3 animate-pulse"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && items.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
              Add some delicious items from our menu to get started!
            </p>
            <Link
              to="/customer/menu"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              <Sparkles className="w-3 h-3" />
              Browse Menu
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((item) => {
                const itemSavings = parseFloat(item.item_discount) || 0;
                const hasItemDiscount =
                  itemSavings > 0 && item.original_price !== "None";

                return (
                  <div
                    key={item.dish_id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-3">
                      <div className="flex gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/64?text=Food";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          {hasItemDiscount && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-[8px] text-white font-bold">
                                -{item.item_discount_percentage}%
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex-1 pr-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                {item.name}
                              </h3>
                              <div className="flex items-center gap-1 mt-0.5">
                                {hasItemDiscount ? (
                                  <>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                      ₹{parseFloat(item.price).toFixed(2)}
                                    </span>
                                    <span className="text-xs text-gray-400 line-through">
                                      ₹
                                      {parseFloat(item.original_price).toFixed(
                                        2,
                                      )}
                                    </span>
                                    {itemSavings > 0 && (
                                      <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded">
                                        Save ₹{itemSavings.toFixed(2)}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    ₹{parseFloat(item.price).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemove(item.dish_id)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                              <button
                                onClick={() =>
                                  handleDecrease(item.dish_id, item.quantity)
                                }
                                disabled={item.quantity <= 1}
                                className="p-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l-lg transition-colors disabled:opacity-50"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3 font-bold text-gray-900 dark:text-white text-sm min-w-[30px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleIncrease(item.dish_id, item.quantity)
                                }
                                className="p-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-lg transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-right">
                              <div className="text-base font-bold text-gray-900 dark:text-white">
                                ₹{parseFloat(item.total).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <ChefHat className="w-4 h-4 text-purple-500" />
                <span className="flex-1">Special Request</span>
              </label>
              <textarea
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                placeholder="E.g., Less spicy, extra sauce, allergies, or any special instructions..."
                rows={2}
                className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
              />
            </div>

            <div className="mt-5 space-y-4">
              {hasDiscount && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-xl p-3 border border-green-100 dark:border-green-800/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Tag className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          Great Savings!
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Total discount applied
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 dark:text-gray-500 text-xs line-through">
                        ₹{parsedOriginalSubtotal.toFixed(2)}
                      </div>
                      <div className="text-green-600 dark:text-green-400 font-bold">
                        -₹{totalSavings.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
                  Order Summary
                </h3>

                <div className="space-y-2.5">
                  {hasDiscount && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Original Price
                      </span>
                      <span className="text-gray-400 dark:text-gray-500 line-through">
                        ₹{parsedOriginalSubtotal.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {hasDiscount && (
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-400 text-[10px] font-bold">
                            ↓
                          </span>
                        </div>
                        <span className="text-green-600 dark:text-green-400">
                          Discount Applied
                        </span>
                      </div>
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        -₹{totalSavings.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      Subtotal
                    </span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      ₹{parsedSubtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tax (18%)
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      ₹{tax.toFixed(2)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-base font-bold text-gray-900 dark:text-white">
                          Total
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Inclusive of all taxes
                        </div>
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        ₹{total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {hasDiscount && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <Sparkles className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          You saved ₹{totalSavings.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-green-600 dark:text-green-400 text-xs bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                        {Math.round(
                          (totalSavings / parsedOriginalSubtotal) * 100,
                        )}
                        % OFF
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {!table_public_id && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    No table selected. Please scan a QR code to continue.
                  </p>
                </div>
              )}

              {orderError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50 flex items-center gap-2 animate-pulse">
                  <MapPin className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                    {orderError}
                  </p>
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={
                  loadingOrder ||
                  locatingUser ||
                  items.length === 0 ||
                  !table_public_id
                }
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3.5 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                {locatingUser ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying location...
                  </span>
                ) : loadingOrder ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Place Order • ₹${total.toFixed(2)}`
                )}
              </button>

              <Link
                to="/customer/menu"
                className="block w-full text-center py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>

      {showSuccess && (
        <OrderSuccessModal
          orderId={currentOrder?.order_id}
          onClose={() => {
            setShowSuccess(false);
            navigate("/customer/menu");
          }}
          onViewOrders={() => navigate("/customer/orders")}
        />
      )}
    </div>
  );
}
