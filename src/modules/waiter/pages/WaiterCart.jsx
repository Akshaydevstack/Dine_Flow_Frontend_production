import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
  ChefHat,
} from "lucide-react";
import {
  fetchWaiterCart,
  updateWaiterCartItem,
  removeFromWaiterCart,
  clearWaiterCart,
} from "../../../store/slices/waiterSlice/waiterCartSlice";
import { createWaiterOrder } from "../../../store/slices/waiterSlice/waiterOrderSlice";
import OrderSuccessModal from "../../customer/components/common/OrderSuccessModal";

/* =========================================================
   CART ITEM CARD
========================================================= */

const CartItemCard = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  loadingDishId,
}) => {
  const dishId = item.dish_id;
  const isLoading = loadingDishId === dishId;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="p-3">
        <div className="flex gap-3">
          {/* Image */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/64?text=Food";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1 pr-2">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {item.name}
                </h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    ₹{parseFloat(item.price || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => onRemove(dishId)}
                disabled={isLoading}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quantity counter */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                <button
                  onClick={() => onDecrease(dishId, item.quantity)}
                  disabled={isLoading || item.quantity <= 1}
                  className="p-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l-lg transition-colors disabled:opacity-50"
                >
                  <Minus className="w-3 h-3" />
                </button>

                {isLoading ? (
                  <Loader2 className="w-3 h-3 text-purple-600 animate-spin mx-3" />
                ) : (
                  <span className="px-3 font-bold text-gray-900 dark:text-white text-sm min-w-[30px] text-center">
                    {item.quantity}
                  </span>
                )}

                <button
                  onClick={() => onIncrease(dishId, item.quantity)}
                  disabled={isLoading}
                  className="p-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-lg transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <div className="text-right">
                <div className="text-base font-bold text-gray-900 dark:text-white">
                  ₹{parseFloat(item.total || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN PAGE
========================================================= */

export default function WaiterCart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector((state) => state.waiterCart.items);
  const subtotal = useSelector((state) => state.waiterCart.subtotal);
  const cartLoading = useSelector((state) => state.waiterCart.loading);
  const cartFetched = useSelector((state) => state.waiterCart.fetched);
  const cartError = useSelector((state) => state.waiterCart.error);

  // Get order state from waiterOrder slice
  const {
    currentOrder,
    loading: orderLoading,
    error: orderError,
  } = useSelector((state) => state.waiterOrder);

  const [loadingDishId, setLoadingDishId] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [note, setNote] = useState("");
  const [localError, setLocalError] = useState("");

  // Get table info from localStorage

  // Get table_public_id (this might be different from tableId)
  const table_public_id = localStorage.getItem("table_id");

  // Check if table is selected
  const hasTable = !!table_public_id;

  // Calculate tax and total
  const parsedSubtotal = parseFloat(subtotal || 0);
  const tax = parsedSubtotal * 0.18;
  const total = parsedSubtotal + tax;
  const totalItems = cartItems?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  // ── Fetch cart on mount if not already fetched
  useEffect(() => {
    if (!cartFetched) {
      dispatch(fetchWaiterCart());
    }
  }, [dispatch, cartFetched]);

  // ── Handle order success
  useEffect(() => {
    if (currentOrder) {
      setOrderSuccess(true);
      dispatch(clearWaiterCart());
    }
  }, [currentOrder, dispatch]);

  // ── Handle order error
  useEffect(() => {
    if (orderError) {
      setLocalError(
        orderError?.message || "Failed to place order. Please try again.",
      );
    }
  }, [orderError]);

  // ── Cart actions
  const handleIncrease = async (dishId, currentQty) => {
    setLoadingDishId(dishId);
    try {
      await dispatch(
        updateWaiterCartItem({ dish_id: dishId, quantity: currentQty + 1 }),
      ).unwrap();
    } catch (e) {
      console.error("Update failed", e);
    } finally {
      setLoadingDishId(null);
    }
  };

  const handleDecrease = async (dishId, currentQty) => {
    if (currentQty <= 1) return;

    setLoadingDishId(dishId);
    try {
      await dispatch(
        updateWaiterCartItem({ dish_id: dishId, quantity: currentQty - 1 }),
      ).unwrap();
    } catch (e) {
      console.error("Update failed", e);
    } finally {
      setLoadingDishId(null);
    }
  };

  const handleRemove = async (dishId) => {
    setLoadingDishId(dishId);
    try {
      await dispatch(removeFromWaiterCart(dishId)).unwrap();
    } catch (e) {
      console.error("Remove failed", e);
    } finally {
      setLoadingDishId(null);
    }
  };

  // ── Place order using the slice
  const handlePlaceOrder = async () => {
    if (!hasTable) {
      setLocalError("No table selected. Please go back and select a table.");
      return;
    }

    if (cartItems.length === 0) return;

    // Prepare order items
    const orderItems = cartItems.map((item) => ({
      dish_id: item.dish_id,
      quantity: item.quantity,
    }));

    try {
      const response = await dispatch(
        createWaiterOrder({
          table_public_id,
          special_request: note,
          items: orderItems,
        }),
      ).unwrap();

      console.log("ORDER SUCCESS", response);

      localStorage.removeItem("table_id");
      console.log(
        "localStorage after remove:",
        localStorage.getItem("table_id"),
      );
    } catch (error) {
      console.error("Order failed:", error);
    }
  };

  const handleCloseSuccess = () => {
    setOrderSuccess(false);
    navigate("/waiter/orders");
  };

  const clearLocalError = () => {
    setLocalError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 pb-20">
      {/* ── SUCCESS MODAL ── */}
      {orderSuccess && currentOrder && (
        <OrderSuccessModal
          orderId={currentOrder.order_id}
          onClose={handleCloseSuccess}
          onViewOrders={() => navigate("/waiter/orders")}
        />
      )}

      {/* ── ERROR TOAST ── */}
      {(localError || orderError) && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-sm animate-in slide-in-from-top duration-300">
          <div className="bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium flex-1">
              {localError || orderError?.message || "An error occurred"}
            </p>
            <button
              onClick={clearLocalError}
              className="p-1 hover:bg-white/20 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="px-4 py-3">
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
                  {totalItems} {totalItems === 1 ? "item" : "items"} • Table
                </p>
              </div>
            </div>

            {/* Cart icon with count */}
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="px-3 py-3">
        {/* Loading State */}
        {cartLoading && !cartFetched ? (
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
        ) : cartError ? (
          <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-5 border border-red-200 dark:border-red-900/50 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
              Failed to load cart
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
              {cartError?.message || "Please try again"}
            </p>
            <button
              onClick={() => dispatch(fetchWaiterCart())}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : !cartItems || cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Cart is empty
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
              Add items from the menu to get started with this table's order
            </p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              <Sparkles className="w-3 h-3" />
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="space-y-3">
              {cartItems.map((item) => (
                <CartItemCard
                  key={item.dish_id}
                  item={item}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                  onRemove={handleRemove}
                  loadingDishId={loadingDishId}
                />
              ))}
            </div>

            {/* No Table Warning - Only show if no table selected */}
            {!hasTable && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  No table selected. Please go back and select a table to place
                  order.
                </p>
              </div>
            )}

            {/* Order Note with Heading */}
            <div className="mt-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <ChefHat className="w-4 h-4 text-purple-500" />
                Note to kitchen
                <span className="text-xs font-normal text-gray-400">
                  (optional)
                </span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="E.g., Less spicy, extra sauce, allergies..."
                rows={2}
                className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
              />
            </div>

            {/* Order Summary */}
            <div className="mt-5">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
                  Order Summary
                </h3>

                <div className="space-y-2.5">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ₹{parsedSubtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tax (18%)
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ₹{tax.toFixed(2)}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-base font-bold text-gray-900 dark:text-white">
                          Total
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Inclusive of taxes
                        </p>
                      </div>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 space-y-3">
              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={orderLoading || !hasTable}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3.5 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                {orderLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span>Place Order • ₹{total.toFixed(2)}</span>
                )}
              </button>

              {/* Continue Shopping */}
              <button
                onClick={() => navigate(-1)}
                className="w-full text-center py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
