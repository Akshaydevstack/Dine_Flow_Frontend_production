import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import waiterImage from "./../../../assets/waiter.png";

// ── Session helpers ───────────────────────────────────────────────────────────
function getSessionDetails() {
  try {
    const raw = localStorage.getItem("session_details");
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function getUserDetails() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

// ── Chat persistence ──────────────────────────────────────────────────────────
const getChatKey = (id) => `waiter_chat_${id || "guest"}`;

function loadMessages(tableId) {
  try {
    const raw = sessionStorage.getItem(getChatKey(tableId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveMessages(tableId, messages) {
  try {
    sessionStorage.setItem(getChatKey(tableId), JSON.stringify(messages.slice(-40)));
  } catch (e) { console.warn("Chat persist failed:", e); }
}

function makeWelcome(restaurantName = "our restaurant", userName = "", id = 0) {
  const greeting = userName ? `Hello ${userName}! 👋` : "Hello! 👋";
  const content = `${greeting} I'm Arjun, your personal AI Waiter at ${restaurantName}.\n\nI'm here to make your dining experience seamless. Here are a few things I can do for you:\n\n🍽️ Recommend dishes based on your cravings\n🛒 Manage your cart and place orders instantly\n📜 Look up your past orders for quick reordering\n📨 Take feedback or complaints directly to the manager\n\nWhat are you in the mood for today?`;

  return {
    id: id, role: "assistant", tools: [],
    content: content,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

const QUICK_PROMPTS = [
  { label: "🔥 Spicy", message: "What are your spicy dishes?" },
  { label: "🥗 Veg", message: "Show me vegetarian options" },
  { label: "🛒 Cart", message: "Show my cart" },
  { label: "🕐 History", message: "Show my past orders" },
  { label: "📝 Feedback", message: "I want to leave some feedback" },
  { label: "⚠️ Complaint", message: "I have a complaint" },
];

const TOOL_LABELS = {
  tool_search_menu: "Searched Menu",
  tool_get_personalized_recommendations: "Personalized Picks",
  tool_get_past_orders: "Order History",
  tool_get_restaurant_info: "Restaurant Info",
  tool_check_table_availability: "Table Check",
  cart_add: "Added to Cart",
  cart_view: "Cart View",
  cart_update: "Cart Updated",
  cart_remove: "Item Removed",
  cart_clear: "Cart Cleared",
  place_order: "Order Placed",
  cancel_order: "Order Cancelled",
  tool_send_receipt: "📧 Email Sent",
  tool_send_feedback: "📨 Feedback Sent to Admin"
};

// ── Sub-components ────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2.5 px-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-violet-400/60 dark:bg-violet-400/60 animate-bounce"
          style={{ animationDelay: `${i * 0.18}s`, animationDuration: "0.9s" }}
        />
      ))}
    </div>
  );
}

function ToolBadge({ name }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
      {TOOL_LABELS[name] || name}
    </span>
  );
}

function DishCard({ dish, onSend, onNavigate }) {
  const [state, setState] = useState("idle");

  const handleAdd = (e) => {
    e.stopPropagation();
    if (state !== "idle") return;
    setState("loading");
    onSend(`Add ${dish.name} to my cart`);
    setTimeout(() => { setState("done"); setTimeout(() => setState("idle"), 2500); }, 800);
  };

  return (
    <div 
      onClick={() => onNavigate(`/customer/dish/${dish.dish_id}`)}
      className="dish-card cursor-pointer flex-shrink-0 w-[138px] rounded-2xl overflow-hidden flex flex-col bg-white/80 dark:bg-[#1a2035]/90 border border-indigo-100 dark:border-white/5 backdrop-blur-md shadow-sm transition-transform active:scale-95 hover:shadow-md"
    >
      <div className="relative h-[96px] overflow-hidden bg-slate-100 dark:bg-[#0e1220]">
        {dish.image
          ? <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-4xl opacity-10">🍽️</div>}
        {dish.prep_time && (
          <span className="absolute top-2 right-2 text-[9px] font-semibold px-2 py-0.5 rounded-md bg-white/80 dark:bg-black/60 text-slate-700 dark:text-slate-200 backdrop-blur-sm">
            {dish.prep_time}
          </span>
        )}
      </div>
      <div className="p-2.5 flex flex-col gap-2 flex-1">
        <div>
          <h4 className="text-[12px] font-semibold text-slate-800 dark:text-white leading-tight line-clamp-2">{dish.name}</h4>
          <p className="text-[12px] font-bold mt-0.5 text-violet-600 dark:text-violet-400">₹{dish.price}</p>
        </div>
        {dish.available !== false && (
          <button
            onClick={handleAdd}
            disabled={state !== "idle"}
            className={`mt-auto w-full text-[11px] font-semibold py-1.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1
              ${state === "done" 
                ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white" 
                : "bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-[#252b43] dark:text-indigo-300 dark:border-white/5"}`}
          >
            {state === "loading"
              ? <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              : state === "done" ? "✓ Added!" : "+ Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );
}

function CartItem({ item, onSend, onNavigate }) {
  const hasDiscount = item.original_price && parseFloat(item.original_price) > parseFloat(item.price);
  return (
    <div 
      onClick={() => onNavigate("/customer/cart")}
      className="flex items-center gap-3 px-4 py-2.5 border-b border-indigo-50 dark:border-white/5 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
    >
      <img src={item.image || "https://res.cloudinary.com/dxsimc9dz/image/upload/v1738734327/placeholder.jpg"} alt={item.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-slate-100 dark:bg-[#0e1220]" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-slate-800 dark:text-white truncate">{item.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-[11px] text-violet-600 dark:text-violet-400">₹{item.price}</p>
          {hasDiscount && (
            <p className="text-[9px] text-slate-400 dark:text-slate-500 line-through">
              ₹{item.original_price}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center rounded-xl overflow-hidden flex-shrink-0 bg-slate-50 border border-indigo-100 dark:bg-[#0e1220] dark:border-white/5">
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onSend(`Update ${item.name} quantity to ${item.quantity - 1}`);
          }}
          className="w-7 h-7 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#252b43] transition-colors"
        >−</button>
        <span className="text-[12px] font-bold w-6 text-center text-slate-800 dark:text-white">{item.quantity}</span>
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onSend(`Update ${item.name} quantity to ${item.quantity + 1}`);
          }}
          className="w-7 h-7 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#252b43] transition-colors"
        >+</button>
      </div>
    </div>
  );
}

function CartCard({ cart, onSend, onNavigate }) {
  const total = cart.reduce((sum, item) => sum + parseFloat(item.total || item.price * item.quantity), 0);
  return (
    <div className="w-full rounded-2xl overflow-hidden animate-slide-up bg-white/80 dark:bg-[#1a2035]/90 border border-indigo-100 dark:border-white/5 backdrop-blur-md shadow-sm">
      <div 
        onClick={() => onNavigate("/customer/cart")}
        className="flex justify-between items-center px-4 py-2.5 bg-indigo-50/50 dark:bg-white/5 border-b border-indigo-100 dark:border-white/5 cursor-pointer hover:bg-indigo-50 dark:hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-slate-800 dark:text-white">🛒 Your Cart</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
            {cart.length} item{cart.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onSend("Clear cart"); 
          }} 
          className="text-[11px] font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="max-h-[200px] overflow-y-auto hide-scrollbar">
        {cart.map((item, i) => <CartItem key={i} item={item} onSend={onSend} onNavigate={onNavigate} />)}
      </div>
      <div 
        onClick={() => onNavigate("/customer/cart")}
        className="px-4 py-3 border-t border-indigo-100 dark:border-white/5 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-[12px] text-slate-500 dark:text-slate-400">Total</span>
          <span className="text-[15px] font-bold text-slate-800 dark:text-white">₹{total.toFixed(2)}</span>
        </div>
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onSend("Place my order"); 
          }}
          className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-95 bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-md shadow-violet-500/20 dark:shadow-violet-500/30"
        >
          Place Order →
        </button>
      </div>
    </div>
  );
}

// ✅ UPDATED: Scrollable Past Order Items with Images
function PastOrderCard({ order, onSend, onNavigate }) {
  const [reorderState, setReorderState] = useState("idle");

  const handleReorder = (e) => {
    e.stopPropagation();
    if (reorderState !== "idle") return;
    setReorderState("loading");
    onSend(`Reorder order ${order.order_id}`);
    setTimeout(() => { setReorderState("done"); setTimeout(() => setReorderState("idle"), 2000); }, 800);
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "?") return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const statusMap = {
    RECEIVED:  "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30",
    ACCEPTED:  "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30",
    PREPARING: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/30",
    READY:     "text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-500/10 dark:border-violet-500/30",
    COMPLETED: "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-500/10 dark:border-slate-500/30",
    CANCELLED: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/30",
  };

  const status = order.status || "RECEIVED";
  const statusClasses = statusMap[status] || statusMap["RECEIVED"];
  
  // Safely handle both array format (new) and fallback strings (old)
  const isItemArray = Array.isArray(order.items);
  const itemsList = isItemArray ? order.items : [];

  return (
    <div
      className="w-full rounded-2xl overflow-hidden animate-slide-up transition-transform bg-white/80 dark:bg-[#1a2035]/90 border border-indigo-100 dark:border-white/5 backdrop-blur-md shadow-sm hover:shadow-md"
    >
      <div 
        onClick={() => onNavigate(`/customer/orders/${order.order_id}`)}
        className="flex justify-between items-center cursor-pointer px-4 py-2.5 bg-indigo-50/50 dark:bg-white/5 border-b border-indigo-100 dark:border-white/5"
      >
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-slate-800 dark:text-white">📋 Order #{order.order_id?.slice(-8)}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusClasses}`}>
            {status}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">{formatDate(order.date)}</span>
      </div>

      {/* 🚀 New Scrollable Items Area with Images */}
      <div className="max-h-[160px] overflow-y-auto hide-scrollbar bg-white/40 dark:bg-black/10">
        {itemsList.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2 border-b border-indigo-50 dark:border-white/5 last:border-0">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0 bg-slate-100 dark:bg-[#0e1220]" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs flex-shrink-0 bg-slate-100 dark:bg-[#0e1220] opacity-50">🍽️</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-slate-800 dark:text-white truncate">
                {item.quantity ? `${item.quantity} × ` : ""}{item.name || item.dish_name || "Item"}
              </p>
            </div>
            <p className="text-[12px] font-medium text-slate-800 dark:text-white">
              ₹{item.total || item.total_price || item.unit_price}
            </p>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-indigo-100 dark:border-white/5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[12px] text-slate-500 dark:text-slate-400">Total</span>
          <span className="text-[15px] font-bold text-slate-800 dark:text-white">₹{order.total}</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleReorder}
            disabled={reorderState !== "idle"}
            className={`flex-1 py-2 rounded-xl text-[12px] font-semibold transition-all active:scale-95 flex items-center justify-center gap-1
              ${reorderState === "done"
                ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
                : "bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-[#252b43] dark:text-indigo-300 dark:border-white/5 hover:bg-indigo-100 dark:hover:bg-indigo-500/10"}`}
          >
            {reorderState === "loading" ? (
              <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            ) : reorderState === "done" ? (
              "✓ Reordered!"
            ) : (
              "⟳ Reorder"
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(`/customer/orders/${order.order_id}`); }}
            className="flex-1 py-2 rounded-xl text-[12px] font-semibold transition-all active:scale-95 bg-slate-50 text-slate-600 border border-slate-200 dark:bg-[#0e1220] dark:text-slate-400 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-[#252b43]"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ UPDATED: Scrollable Current Order Items with Images
function OrderCard({ order, onNavigate }) {
  const itemsList = Array.isArray(order.items) ? order.items : [];
  
  return (
    <div 
      onClick={() => onNavigate(`/customer/orders/${order.order_id}`)}
      className="w-full rounded-2xl overflow-hidden cursor-pointer animate-slide-up active:scale-[0.99] transition-transform bg-white/80 dark:bg-[#1a2035]/90 border border-emerald-200 dark:border-emerald-500/20 backdrop-blur-md shadow-sm hover:shadow-md"
    >
      <div className="flex justify-between items-center px-4 py-2.5 bg-emerald-50 dark:bg-emerald-500/5 border-b border-emerald-100 dark:border-emerald-500/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[13px] font-semibold text-slate-800 dark:text-white">Order Confirmed</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">#{order.order_id?.slice(-8)}</span>
      </div>
      
      {/* 🚀 New Scrollable Items Area with Images */}
      <div className="max-h-[160px] overflow-y-auto hide-scrollbar bg-white/40 dark:bg-black/10">
        {itemsList.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2 border-b border-emerald-50 dark:border-white/5 last:border-0">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0 bg-slate-100 dark:bg-[#0e1220]" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs flex-shrink-0 bg-slate-100 dark:bg-[#0e1220] opacity-50">🍽️</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-slate-800 dark:text-white truncate">
                {item.quantity ? `${item.quantity} × ` : ""}{item.name || item.dish_name || "Item"}
              </p>
            </div>
            <p className="text-[12px] font-medium text-slate-800 dark:text-white">
              ₹{item.total || item.total_price || item.unit_price}
            </p>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-emerald-100 dark:border-white/5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[12px] text-slate-500 dark:text-slate-400">Total Paid</span>
          <span className="text-[15px] font-bold text-slate-800 dark:text-white">₹{order.total}</span>
        </div>
        <div className="text-center text-[11px] font-medium py-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 group-hover:bg-emerald-100 transition-colors">
          Tap to track your order →
        </div>
      </div>
    </div>
  );
}

function Message({ msg, isAnimating, animatedText, onNavigate, onSend }) {
  const isUser = msg.role === "user";
  const content = isAnimating && animatedText !== undefined ? animatedText : msg.content;
  const showCards = !isAnimating && !isUser;

  if (isUser) {
    return (
      <div className="flex justify-end mb-3 animate-scale-in">
        <div className="max-w-[78%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-[14px] leading-relaxed break-words bg-slate-100 text-slate-800 border border-slate-200 dark:bg-[#1f253d] dark:border-white/5 dark:text-slate-200 shadow-sm">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-5 animate-slide-up">
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5 border border-violet-200 bg-white dark:border-violet-500/20 dark:bg-[#0e1220] shadow-sm">
        <img src={waiterImage} alt="AI Waiter" className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col gap-3 min-w-0 flex-1">
        {content && (
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words mt-0.5 text-slate-700 dark:text-slate-300">
            {content}
          </p>
        )}
        
        {showCards && msg.dishes?.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar" style={{ WebkitOverflowScrolling: "touch" }}>
            {msg.dishes.map((dish, i) => (
              <DishCard key={i} dish={dish} onSend={onSend} onNavigate={onNavigate} />
            ))}
          </div>
        )}
        
        {showCards && msg.cart?.length > 0 && <CartCard cart={msg.cart} onSend={onSend} onNavigate={onNavigate} />}
        {showCards && msg.current_order && <OrderCard order={msg.current_order} onNavigate={onNavigate} />}
        {showCards && msg.past_orders?.length > 0 && (
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center gap-2 text-[12px] font-medium text-indigo-500 dark:text-indigo-400">
              <span className="text-sm">📜</span>
              <span>Your recent orders</span>
            </div>
            {msg.past_orders.map((order, i) => (
              <PastOrderCard key={i} order={order} onSend={onSend} onNavigate={onNavigate} />
            ))}
          </div>
        )}
        {showCards && msg.bottom_text && (
          <p className="text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">{msg.bottom_text}</p>
        )}
        {showCards && msg.tools?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.tools.map((t, i) => <ToolBadge key={i} name={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Clear Chat Confirm Overlay ────────────────────────────────────────────────
function ClearConfirm({ onConfirm, onCancel }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center px-6 bg-slate-900/20 dark:bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-xs rounded-2xl p-5 animate-scale-in bg-white/95 dark:bg-[#161b2e]/95 border border-indigo-100 dark:border-white/10 shadow-xl">
        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-red-50 border border-red-100 dark:bg-red-500/10 dark:border-red-500/20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 dark:text-red-400">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </div>
        <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-1">Clear chat history?</h3>
        <p className="text-[13px] mb-5 text-slate-500 dark:text-slate-400">All messages will be removed. This can't be undone.</p>
        <div className="flex gap-2.5">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95 bg-slate-100 text-slate-600 border border-slate-200 dark:bg-[#1a2035] dark:text-slate-300 dark:border-white/5">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-95 bg-gradient-to-br from-red-500 to-red-600 shadow-md shadow-red-500/20 dark:shadow-red-500/30">
            Clear chat
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AiWaiter({ onClose }) {
  const navigate = useNavigate();
  
  const { current_table_id: tableId, table_number, restaurant_name } = getSessionDetails();
  const { name: userName } = getUserDetails();

  const [messages, setMessages] = useState(() => {
    const saved = loadMessages(tableId);
    if (saved?.length > 0) return saved;
    return [makeWelcome(restaurant_name, userName, 0)];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [animatingId, setAnimatingId] = useState(null);
  const [animatedText, setAnimatedText] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // ✅ NEW: Track if we should animate the welcome message on mount
  const animateOnMount = useRef(messages.length === 1);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const idRef = useRef(
    Math.max(0, ...messages.map(m => m.id ?? 0)) + 1
  );

  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  useEffect(() => { saveMessages(tableId, messages); }, [messages, tableId]);
  
  // Slide up panel on mount
  useEffect(() => { 
    const t = setTimeout(() => setIsOpen(true), 50); 
    return () => clearTimeout(t); 
  }, []);
  
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, animatedText]);

  const cancelAnim = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setAnimatingId(null); setAnimatedText("");
  }, []);

  const startStream = useCallback((id, text) => {
    if (!text) return;
    cancelAnim();
    setAnimatingId(id); setAnimatedText("");
    let i = 0;
    const step = () => {
      if (i < text.length) { i++; setAnimatedText(text.slice(0, i)); timerRef.current = setTimeout(step, 8); }
      else { setAnimatingId(null); setAnimatedText(""); }
    };
    step();
  }, [cancelAnim]);

  // ✅ NEW: Trigger animation exactly once if it's the very first message!
  useEffect(() => {
    if (animateOnMount.current) {
      // Delay it by 350ms so the chat window has time to finish its slide-up animation!
      const t = setTimeout(() => {
        startStream(messages[0].id, messages[0].content);
      }, 350);
      
      animateOnMount.current = false;
      return () => clearTimeout(t);
    }
  }, [startStream, messages]);

  const send = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    cancelAnim();
    setMessages(prev => [...prev, { id: idRef.current++, role: "user", content: trimmed, time: now(), tools: [] }]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await axiosClient.post("/ai/ai-waiter/", { message: trimmed }, { headers: { "X-Table-Id": tableId || "" } });
      const msg = {
        id: idRef.current++, role: "assistant", time: now(),
        content: data.response || "", bottom_text: data.bottom_text || null,
        tools: data.tools_used || [], dishes: data.dishes || [],
        cart: data.cart || [], past_orders: data.past_orders || [],
        current_order: data.current_order || null,
      };
      setMessages(prev => [...prev, msg]);
      startStream(msg.id, msg.content);
    } catch {
      const err = { id: idRef.current++, role: "assistant", time: now(), tools: [],
        content: "I encountered a network issue. Please try again." };
      setMessages(prev => [...prev, err]);
      startStream(err.id, err.content);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [loading, tableId, cancelAnim, startStream]);

  const handleClearChat = () => {
    cancelAnim();
    const freshId = idRef.current++; // Give it a new ID so React knows it's a new message
    const fresh = makeWelcome(restaurant_name, userName, freshId);
    
    setMessages([fresh]);
    saveMessages(tableId, [fresh]);
    setShowClearConfirm(false);
    
    // Re-trigger the animation instantly when cleared
    startStream(freshId, fresh.content);
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } };
  const handleClose = () => { setIsOpen(false); setTimeout(() => onClose?.(), 280); };
  const handleNavigate = (path) => { setIsOpen(false); setTimeout(() => { onClose?.(); navigate(path); }, 280); };
  
  const isFirstOpen = messages.length <= 1;

  return (
    <>
      <style>{`
        @keyframes slideUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn  { from { opacity:0; transform:scale(0.95); }      to { opacity:1; transform:scale(1); } }
        @keyframes fadeIn   { from { opacity:0; }                              to { opacity:1; } }
        .animate-slide-up   { animation: slideUp  0.28s cubic-bezier(0.16,1,0.3,1) forwards; }
        .animate-scale-in   { animation: scaleIn  0.2s  cubic-bezier(0.16,1,0.3,1) forwards; }
        .animate-fade-in    { animation: fadeIn   0.28s ease forwards; }
        .hide-scrollbar     { scrollbar-width:none; -ms-overflow-style:none; }
        .hide-scrollbar::-webkit-scrollbar { display:none; }
        .dish-card:active   { transform:scale(0.97); }
        * { -webkit-tap-highlight-color:transparent; }
      `}</style>

      <div
        className={`fixed inset-0 z-[9999] flex items-end justify-center transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}>

        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={handleClose} />

        {/* Sheet */}
        <div
          className={`relative w-full max-w-2xl mx-auto flex flex-col rounded-t-[26px] shadow-2xl overflow-hidden transition-transform duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] bg-slate-50 dark:bg-gradient-to-b dark:from-[#161b2e] dark:to-[#0e1220] border-t border-indigo-100 dark:border-white/5 ${isOpen ? "translate-y-0" : "translate-y-full"}`}
          style={{ height: "calc(100dvh - env(safe-area-inset-top) - 16px)" }}>

          {/* Drag pill */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full z-10 bg-slate-300 dark:bg-white/10" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between px-4 pt-6 pb-2.5 flex-shrink-0 border-b border-indigo-100 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-violet-200 bg-white dark:border-white/10 dark:bg-[#0e1220]">
                  <img src={waiterImage} alt="AI Waiter" className="w-full h-full object-cover" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#161b2e] shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
              </div>
              <div>
                <h2 className="text-[14px] font-bold text-slate-800 dark:text-white leading-tight">AI Waiter</h2>
                <p className="text-[10px] mt-0.5 text-slate-500 dark:text-slate-400">
                  {restaurant_name ? `${restaurant_name} · Table ${table_number || tableId}` : "Always here to help"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {messages.length > 1 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all active:scale-95 bg-red-50 text-red-500 border border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                  Clear
                </button>
              )}
              <button onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors bg-slate-100 text-slate-500 border border-indigo-100 dark:bg-[#1f253d] dark:text-slate-400 dark:border-white/5 hover:dark:bg-[#252b43]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 hide-scrollbar overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
            {messages.map((msg) => (
              <Message
                key={msg.id} msg={msg}
                isAnimating={animatingId === msg.id}
                animatedText={animatingId === msg.id ? animatedText : undefined}
                onNavigate={handleNavigate}
                onSend={send}
              />
            ))}
            {loading && (
              <div className="flex gap-3 animate-slide-up">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5 border border-violet-200 bg-white dark:border-white/10 dark:bg-[#0e1220]">
                  <img src={waiterImage} alt="AI Waiter" className="w-full h-full object-cover" />
                </div>
                <TypingDots />
              </div>
            )}
            <div ref={bottomRef} className="h-2" />
          </div>

          {/* Quick Prompts */}
          {isFirstOpen && (
            <div className="relative z-10 px-4 pb-2 flex-shrink-0 animate-fade-in">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                {QUICK_PROMPTS.map((p) => (
                  <button key={p.label} onClick={() => send(p.message)} disabled={loading}
                    className="flex-shrink-0 text-[11px] font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all active:scale-95 bg-indigo-50 border border-indigo-100 text-indigo-600 dark:bg-[#1a2035] dark:border-white/5 dark:text-indigo-300">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="relative z-10 px-3 pt-2 flex-shrink-0 border-t border-indigo-50 dark:border-white/5"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
            <div className="flex items-end gap-2 rounded-2xl px-2 py-1 transition-all bg-white border border-indigo-100 dark:bg-[#1f253d] dark:border-white/5 shadow-sm">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                }}
                onKeyDown={handleKey}
                placeholder="Ask your waiter…"
                disabled={loading}
                rows={1}
                className="flex-1 resize-none bg-transparent px-3 py-2 text-[14px] outline-none min-h-[40px] max-h-[100px] text-slate-800 dark:text-slate-200 placeholder-slate-400"
                style={{ caretColor: "#a78bfa" }}
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="w-9 h-9 mb-0.5 flex-shrink-0 rounded-xl flex items-center justify-center text-white transition-all active:scale-90 disabled:opacity-30 bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-md shadow-violet-500/20 dark:shadow-violet-500/40">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Clear confirm overlay */}
          {showClearConfirm && (
            <ClearConfirm
              onConfirm={handleClearChat}
              onCancel={() => setShowClearConfirm(false)}
            />
          )}
        </div>
      </div>
    </>
  );
}