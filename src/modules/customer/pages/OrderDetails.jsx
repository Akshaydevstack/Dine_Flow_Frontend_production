import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  X,
  ShoppingBag,
  Package,
  ChefHat,
  Truck,
  Shield,
  CreditCard,
  Calendar,
  MapPin,
  Receipt,
  Tag,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Printer,
  Share2,
} from "lucide-react";
import axiosClient from "../../../api/axiosClient";

/* =========================
   STATUS CONFIG
========================= */

const STATUS_CONFIG = {
  CREATED: {
    label: "Order Placed",
    gradient: "from-purple-500 to-indigo-500",
    icon: <Clock className="w-4 h-4" />,
    step: 1,
    description: "Order received",
    bgColor: "bg-gradient-to-r from-purple-500 to-indigo-500",
  },
  PAID: {
    label: "Payment Confirmed",
    gradient: "from-blue-500 to-cyan-400",
    icon: <CheckCircle className="w-4 h-4" />,
    step: 2,
    description: "Payment processed",
    bgColor: "bg-gradient-to-r from-blue-500 to-cyan-400",
  },
  ACCEPTED: {
    label: "Order Accepted",
    gradient: "from-amber-500 to-orange-400",
    icon: <ChefHat className="w-4 h-4" />,
    step: 3,
    description: "Chef preparing",
    bgColor: "bg-gradient-to-r from-amber-500 to-orange-400",
  },
  PREPARING: {
    label: "Cooking",
    gradient: "from-orange-500 to-red-400",
    icon: <ChefHat className="w-4 h-4" />,
    step: 4,
    description: "Food being prepared",
    bgColor: "bg-gradient-to-r from-orange-500 to-red-400",
  },
  READY: {
    label: "Ready for Pickup",
    gradient: "from-green-500 to-emerald-400",
    icon: <Package className="w-4 h-4" />,
    step: 5,
    description: "Ready to serve",
    bgColor: "bg-gradient-to-r from-green-500 to-emerald-400",
  },
  COMPLETED: {
    label: "Completed",
    gradient: "from-emerald-500 to-teal-400",
    icon: <CheckCircle className="w-4 h-4" />,
    step: 6,
    description: "Order delivered",
    bgColor: "bg-gradient-to-r from-emerald-500 to-teal-400",
  },
  CANCELLED: {
    label: "Cancelled",
    gradient: "from-gray-500 to-gray-400",
    icon: <X className="w-4 h-4" />,
    description: "Order cancelled",
    bgColor: "bg-gradient-to-r from-gray-500 to-gray-400",
  },
};

const PAYMENT_STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    icon: <Clock className="w-3 h-3" />,
  },
  PAID: {
    label: "Paid",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  FAILED: {
    label: "Failed",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    icon: <X className="w-3 h-3" />,
  },
  REFUNDED: {
    label: "Refunded",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    icon: <CreditCard className="w-3 h-3" />,
  },
};

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/order/customer/${orderId}/`);
      setOrder(response.data.order);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrder();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTableNumber = () => {
    try {
      const sessionDetails = JSON.parse(
        localStorage.getItem("session_details") || "{}",
      );
      return sessionDetails.table_number || "01";
    } catch {
      return "01";
    }
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
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 animate-pulse"
              >
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Order Not Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The order you're looking for doesn't exist.
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

  return (
   <div className="min-h-screen bg-gradient-to-b from-gray-00 to-gray-200 dark:from-gray-900 dark:to-gray-900 pb-2">
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
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Order Details
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                #{order.order_id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <RefreshCw
                className={`w-4 h-4 text-gray-500 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
            <button className="p-2 rounded-lg border border-gray-200 dark:border-gray-700">
              <Share2 className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 py-3">
        {/* Order Status Banner */}
        <div className="mb-4">
          <div
            className={`rounded-xl p-4 text-white ${STATUS_CONFIG[order.status]?.bgColor}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                {STATUS_CONFIG[order.status]?.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold">
                  {STATUS_CONFIG[order.status]?.label}
                </h2>
                <p className="text-sm text-white/90">
                  {order.status === "CANCELLED"
                    ? "This order has been cancelled"
                    : STATUS_CONFIG[order.status]?.description}
                </p>
              </div>
            </div>

            {/* Payment Status */}
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-white/80" />
                  <span className="text-sm">Payment</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${PAYMENT_STATUS_CONFIG[order.payment_status]?.bgColor} ${PAYMENT_STATUS_CONFIG[order.payment_status]?.color}`}
                >
                  {PAYMENT_STATUS_CONFIG[order.payment_status]?.icon}
                  {PAYMENT_STATUS_CONFIG[order.payment_status]?.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
            Order Information
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Order Date</span>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">
                  {formatDate(order.created_at)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(order.created_at)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>Table Number</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                Table {getTableNumber()}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <ShoppingBag className="w-4 h-4" />
                <span>Order ID</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                #{order.order_id}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
            Order Items ({order.items.length})
          </h3>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.dish_id}
                className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z'%3E%3C/path%3E%3Cline x1='3' y1='6' x2='21' y2='6'%3E%3C/line%3E%3Cpath d='M16 10a4 4 0 0 1-8 0'%3E%3C/path%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity}
                      </span>
                      <span className="text-xs text-gray-300 dark:text-gray-600">
                        •
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ₹{item.unit_price} each
                      </span>
                    </div>
                  </div>
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-sm whitespace-nowrap">
                  ₹{item.total}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
            Order Summary
          </h3>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="text-gray-900 dark:text-white font-medium">
                ₹{order.subtotal}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Tax (5%)</span>
              <span className="text-gray-900 dark:text-white font-medium">
                ₹{order.tax}
              </span>
            </div>

            {parseFloat(order.discount) > 0 && (
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">
                    Discount
                  </span>
                </div>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  -₹{order.discount}
                </span>
              </div>
            )}

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
                  ₹{order.total}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="space-y-3">
          {order.status === "CANCELLED" ? (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <X className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Order Cancelled
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This order has been cancelled and is no longer active.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Need Help Section */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Need Help?
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Contact our support team for assistance
                    </p>
                  </div>
                </div>
              </div>

              {/* Reorder Button */}
              <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reorder This Order
                </div>
              </button>
            </>
          )}

          {/* Back to Orders */}
          <button
            onClick={() => navigate("/customer/orders")}
            className="w-full py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm font-semibold"
          >
            Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
}
