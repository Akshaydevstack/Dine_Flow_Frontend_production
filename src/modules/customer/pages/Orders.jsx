import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle,
  ChefHat,
  ArrowLeft,
  X,
  RefreshCw,
  Sparkles,
  CreditCard,
  ExternalLink,
  Filter,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  MapPin,
  MessageSquare,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchOrders, cancelOrder } from "../../../store/slices/orderSlice";

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
    bgColor: "bg-gradient-to-r from-purple-500 to-indigo-500"
  },
  PAID: {
    label: "Payment Confirmed",
    gradient: "from-blue-500 to-cyan-400",
    icon: <CheckCircle className="w-4 h-4" />,
    step: 2,
    description: "Payment processed",
    bgColor: "bg-gradient-to-r from-blue-500 to-cyan-400"
  },
  ACCEPTED: {
    label: "Order Accepted",
    gradient: "from-amber-500 to-orange-400",
    icon: <ChefHat className="w-4 h-4" />,
    step: 3,
    description: "Chef preparing",
    bgColor: "bg-gradient-to-r from-amber-500 to-orange-400"
  },
  PREPARING: {
    label: "Cooking",
    gradient: "from-orange-500 to-red-400",
    icon: <ChefHat className="w-4 h-4" />,
    step: 4,
    description: "Food being prepared",
    bgColor: "bg-gradient-to-r from-orange-500 to-red-400"
  },
  READY: {
    label: "Ready for Pickup",
    gradient: "from-green-500 to-emerald-400",
    icon: <Package className="w-4 h-4" />,
    step: 5,
    description: "Ready to serve",
    bgColor: "bg-gradient-to-r from-green-500 to-emerald-400"
  },
  COMPLETED: {
    label: "Completed",
    gradient: "from-emerald-500 to-teal-400",
    icon: <CheckCircle className="w-4 h-4" />,
    step: 6,
    description: "Order delivered",
    bgColor: "bg-gradient-to-r from-emerald-500 to-teal-400"
  },
  CANCELLED: {
    label: "Cancelled",
    gradient: "from-gray-500 to-gray-400",
    icon: <X className="w-4 h-4" />,
    description: "Order cancelled",
    bgColor: "bg-gradient-to-r from-gray-500 to-gray-400"
  },
};

const PAYMENT_STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    icon: <Clock className="w-3 h-3" />
  },
  PAID: {
    label: "Paid",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    icon: <CheckCircle className="w-3 h-3" />
  },
  FAILED: {
    label: "Failed",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    icon: <X className="w-3 h-3" />
  },
  REFUNDED: {
    label: "Refunded",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    icon: <CreditCard className="w-3 h-3" />
  }
};

export default function Orders() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("active");
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterBy, setFilterBy] = useState("all");
  
  const { orders = [], loading, fetched } = useAppSelector(
    (state) => state.orders
  );

  /* =========================
     FETCH ONCE
  ========================= */
  useEffect(() => {
    if (!fetched) {
      dispatch(fetchOrders());
    }
  }, [fetched, dispatch]);

  /* =========================
     FILTER ORDERS
  ========================= */
  const activeOrders = orders.filter((o) => 
    ["CREATED", "PAID", "ACCEPTED", "PREPARING", "READY"].includes(o.status)
  );

  const pastOrders = orders.filter((o) =>
    ["COMPLETED", "CANCELLED"].includes(o.status)
  );

  const filteredOrders = (activeTab === "active" ? activeOrders : pastOrders)
    .filter(order => {
      if (filterBy === "all") return true;
      if (filterBy === "completed") return order.status === "COMPLETED";
      if (filterBy === "cancelled") return order.status === "CANCELLED";
      return true;
    });

  const handleCancel = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      await dispatch(cancelOrder(orderId));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchOrders());
    setTimeout(() => setRefreshing(false), 1000);
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
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTableDisplay = (table) => {
    if (!table || !table.table_number) return null;
    return {
      display: `Table ${table.table_number}${table.zone_name ? ` • ${table.zone_name}` : ''}`,
      hasTable: true
    };
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 pb-24">
      {/* ================= HEADER ================= */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                My Orders
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {orders.length} {orders.length === 1 ? 'order' : 'total orders'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-700 dark:text-gray-300 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === "active"
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Active ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === "past"
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            History ({pastOrders.length})
          </button>
        </div>

        {/* Filters */}
        {showFilters && activeTab === "past" && pastOrders.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setFilterBy("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterBy === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterBy("completed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterBy === "completed"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilterBy("cancelled")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterBy === "cancelled"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              Cancelled
            </button>
          </div>
        )}
      </div>

      {/* ================= CONTENT ================= */}
      <div className="px-4 py-3">
        {/* Loading State */}
        {loading && !fetched ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                </div>
                <div className="space-y-2">
                  {[1, 2].map((j) => (
                    <div key={j} className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Empty States */}
            {filteredOrders.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl" />
                  <div className="relative flex items-center justify-center w-24 h-24 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
                    {activeTab === "active" ? (
                      <Package className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <CheckCircle className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {activeTab === "active" 
                    ? "No Active Orders" 
                    : filterBy !== "all" 
                      ? `No ${filterBy} orders` 
                      : "No Past Orders"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
                  {activeTab === "active" 
                    ? "You don't have any active orders right now"
                    : filterBy !== "all"
                      ? `You don't have any ${filterBy} orders yet`
                      : "Your order history will appear here"}
                </p>
                <Link
                  to="/customer/menu"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Sparkles className="w-4 h-4" />
                  {activeTab === "active" ? "Order Now" : "Browse Menu"}
                </Link>
              </div>
            )}

            {/* Order List */}
            {filteredOrders.length > 0 && (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const tableInfo = getTableDisplay(order.table);
                  
                  return (
                    <div
                      key={order.order_id}
                      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                    >
                      {/* Order Header */}
                      <div className={`px-4 py-3 ${STATUS_CONFIG[order.status]?.bgColor || 'bg-gradient-to-r from-gray-600 to-gray-500'} text-white`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="bg-white/20 p-1.5 rounded-lg">
                              {STATUS_CONFIG[order.status]?.icon || <Package className="w-4 h-4" />}
                            </span>
                            <div>
                              <h3 className="font-bold text-sm">Order #{order.order_id.replace('ORD-', '').slice(0, 8)}</h3>
                              <p className="text-xs text-white/90 opacity-90">
                                {STATUS_CONFIG[order.status]?.description || order.status}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full mb-1">
                              {formatDate(order.created_at)}
                            </span>
                            <span className="text-xs opacity-80">
                              {formatTime(order.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Table Info - if available */}
                        {tableInfo && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-white/80 bg-white/10 px-2 py-1 rounded-lg w-fit">
                            <MapPin className="w-3 h-3" />
                            <span>{tableInfo.display}</span>
                          </div>
                        )}
                      </div>

                      {/* Payment Status */}
                      <div className="px-4 pt-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Payment Status
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${PAYMENT_STATUS_CONFIG[order.payment_status]?.bgColor} ${PAYMENT_STATUS_CONFIG[order.payment_status]?.color}`}>
                            {PAYMENT_STATUS_CONFIG[order.payment_status]?.icon}
                            {PAYMENT_STATUS_CONFIG[order.payment_status]?.label || order.payment_status}
                          </span>
                        </div>
                        
                        {/* Special Request - if exists */}
                        {order.special_request && (
                          <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800/30 flex items-start gap-2">
                            <MessageSquare className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-purple-700 dark:text-purple-300 italic">
                              "{order.special_request}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Order Items */}
                      <div className="p-4 pt-2">
                        <div className="space-y-3 mb-3">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div
                              key={item.dish_id || idx}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/40?text=Food";
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                      <Package className="w-5 h-5 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                    {item.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Qty: {item.quantity}
                                    </p>
                                    <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      ₹{parseFloat(item.unit_price).toFixed(2)} each
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <span className="font-bold text-gray-900 dark:text-white text-sm ml-2 whitespace-nowrap">
                                ₹{parseFloat(item.total).toFixed(2)}
                              </span>
                            </div>
                          ))}
                          
                          {order.items.length > 2 && (
                            <div className="text-center pt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{order.items.length - 2} more {order.items.length - 2 === 1 ? 'item' : 'items'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Order Summary */}
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                          <div className="space-y-2 mb-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                ₹{parseFloat(order.subtotal).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Tax</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                ₹{parseFloat(order.tax).toFixed(2)}
                              </span>
                            </div>
                            {parseFloat(order.discount) > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Discount</span>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                  -₹{parseFloat(order.discount).toFixed(2)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                              <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                              <div className="text-right">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                  ₹{parseFloat(order.total).toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {order.currency}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {["CREATED", "PAID", "ACCEPTED"].includes(order.status) && (
                                <button
                                  onClick={() => handleCancel(order.order_id)}
                                  className="px-3 py-1.5 border border-red-500 text-red-500 rounded-lg text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                  Cancel Order
                                </button>
                              )}
                              
                              {order.status === "READY" && (
                                <button className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-medium shadow-md hover:shadow-lg transition-shadow">
                                  Pick Up Now
                                </button>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/customer/orders/${order.order_id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-medium shadow-md hover:shadow-lg transition-shadow"
                              >
                                View Details
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Stats Summary */}
            {orders.length > 0 && (
              <div className="mt-6">
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-xl p-4 border border-purple-200/50 dark:border-purple-900/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Order Summary</h3>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Lifetime
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{orders.length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ₹{orders.reduce((sum, order) => sum + parseFloat(order.total), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {orders.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    to="/customer/menu"
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Order Again</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Reorder your favorites</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                  
                  {activeTab === "active" && activeOrders.length > 0 && (
                    <Link
                      to="/customer/support"
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Need Help?</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Contact support</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}