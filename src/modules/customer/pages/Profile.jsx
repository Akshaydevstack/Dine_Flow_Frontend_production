import { 
  User, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Award, 
  Shield, 
  Truck, 
  ShoppingCart, 
  Package, 
  ChevronRight,
  Sparkles,
  Heart,
  Settings,
  LogOut,
  Calendar,
  TrendingUp,
  CreditCard,
  Leaf,
  Flame
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { logoutUser } from "../../../store/slices/authSlices/authSlice";
import { fetchRestaurantDetails } from "../../../store/slices/restaurantDetailsSlice";
import { fetchOrders } from "../../../store/slices/orderSlice";


export default function Profile() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const user = useAppSelector((state) => state.auth.user);
  const cartItems = useAppSelector((state) => state.cart.items);
  const {orders,fetched : orderFetched} = useAppSelector((state) => state.orders);
  
  const { restaurant, loading, error,fetched:restaurantFetched } = useAppSelector(
    (state) => state.restaurantDetails
  );

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  useEffect(() => {
    if (!restaurantFetched) {
      dispatch(fetchRestaurantDetails());
    }
    if (!orderFetched)
      dispatch(fetchOrders())
  }, [restaurantFetched, dispatch]);

  const activeOrders = orders?.filter(o => 
    ["CREATED", "PAID", "ACCEPTED", "PREPARING", "READY"].includes(o.status)
  ) || [];

  const cartTotal = cartItems.reduce((sum, item) => 
    sum + (parseFloat(item.total) || 0), 0
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
          <button 
            onClick={() => navigate("/customer/settings")}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <Settings className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 py-3">
        {/* User Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {user?.name || "Guest User"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email || "Sign in to access your account"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    4.5
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Regular customer
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full mt-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {orders?.length || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total Orders
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
              <ShoppingCart className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {cartItems?.length || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Cart Items
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {activeOrders.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Active Orders
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "profile"
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("restaurant")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "restaurant"
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Restaurant
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "orders"
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Orders
          </button>
        </div>

        {/* Profile Tab Content */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            {/* Cart Summary */}
            {cartItems.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Current Cart
                    </h3>
                  </div>
                  <Link 
                    to="/customer/cart"
                    className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1"
                  >
                    View Cart
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                
                <div className="space-y-2">
                  {cartItems.slice(0, 2).map((item) => (
                    <div key={item.dish_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {item.name} x{item.quantity}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{item.total}
                      </span>
                    </div>
                  ))}
                  
                  {cartItems.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                      +{cartItems.length - 2} more items
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Cart Total</span>
                      <span className="text-base font-bold text-gray-900 dark:text-white">
                        ₹{cartTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Orders */}
            {orders?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Recent Orders
                    </h3>
                  </div>
                  <Link 
                    to="/customer/orders"
                    className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1"
                  >
                    View All
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {orders.slice(0, 2).map((order) => (
                    <div key={order.order_id} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          #{order.order_id.slice(-8)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(order.created_at)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            order.status === "CANCELLED" 
                              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                              : order.status === "COMPLETED"
                              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          ₹{order.total}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {order.items?.length || 0} items
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/customer/menu"
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col items-center gap-1"
                >
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">Order Now</span>
                </Link>
                <Link
                  to="/customer/orders"
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col items-center gap-1"
                >
                  <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">My Orders</span>
                </Link>
                <Link
                  to="/customer/cart"
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col items-center gap-1"
                >
                  <ShoppingCart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">My Cart</span>
                </Link>
                <Link
                  to="/customer/favorites"
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col items-center gap-1"
                >
                  <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">Favorites</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Restaurant Tab Content */}
        {activeTab === "restaurant" && (
          <div>
            {loading && (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                Loading restaurant details...
              </div>
            )}

            {error && (
              <div className="text-center py-6 text-red-500">
                {error?.message || "Failed to load restaurant"}
              </div>
            )}

            {restaurant && !loading && (
              <>
                {/* Restaurant Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"></span>
                    Restaurant Information
                  </h2>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Address</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {restaurant.address}, {restaurant.city}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Contact</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {restaurant.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Operating Hours</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {restaurant.opening_time} - {restaurant.closing_time}
                        </p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${
                          restaurant.is_open 
                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {restaurant.is_open ? "Open Now" : "Closed"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">
                    About {restaurant.name}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Welcome to {restaurant.name}, located in {restaurant.city}. 
                    Experience quality food and excellent service.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Orders Tab Content */}
        {activeTab === "orders" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Order History
              </h3>
            </div>
            
            {orders?.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.order_id} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          #{order.order_id.slice(-8)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(order.created_at)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            order.status === "CANCELLED" 
                              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                              : order.status === "COMPLETED"
                              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          ₹{order.total}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {order.items?.length || 0} items
                        </div>
                      </div>
                    </div>
                    <Link 
                      to={`/customer/orders/${order.order_id}`}
                      className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1"
                    >
                      View Details
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
                
                {orders.length > 5 && (
                  <div className="pt-2 text-center">
                    <Link 
                      to="/customer/orders"
                      className="text-xs text-purple-600 dark:text-purple-400 font-medium"
                    >
                      View all {orders.length} orders
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No orders yet
                </p>
                <Link 
                  to="/customer/menu"
                  className="inline-block mt-3 text-xs text-purple-600 dark:text-purple-400"
                >
                  Browse Menu
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}