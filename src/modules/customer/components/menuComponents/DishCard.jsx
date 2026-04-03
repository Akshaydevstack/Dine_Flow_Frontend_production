import { Star, Clock, Flame, ShoppingCart, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { addToCart } from "../../../../store/slices/cartSlice";
import { useNavigate } from "react-router-dom";

/* ── Veg / Non-veg dot ───────────────────────────────────────────────────── */
function VegDot({ isVeg }) {
  return (
    <span className={`inline-flex items-center justify-center w-[18px] h-[18px] rounded-sm border-2 bg-white flex-shrink-0 ${isVeg ? "border-emerald-500" : "border-rose-500"}`}>
      <div className={`w-2 h-2 rounded-full ${isVeg ? "bg-emerald-500" : "bg-rose-500"}`} />
    </span>
  );
}

/* ── Cart hook ───────────────────────────────────────────────────────────── */
function useCartActions(dishId) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const cartItems = useAppSelector((s) => s.cart.items);
  const inCart = cartItems.some((i) => i.dish_id === dishId);

  const handleAdd = async (e) => {
    e?.stopPropagation();
    setLoading(true);
    try { await dispatch(addToCart({ dish_id: dishId, quantity: 1 })).unwrap(); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleGoToCart = (e) => { e?.stopPropagation(); navigate("/customer/cart"); };
  return { inCart, loading, handleAdd, handleGoToCart };
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (p) => { const n = parseFloat(p); return isNaN(n) ? "0" : n.toLocaleString("en-IN", { maximumFractionDigits: 0 }); };
const getDiscount = (orig, price) => (orig && parseFloat(orig) > parseFloat(price))
  ? Math.round(((orig - price) / orig) * 100) : 0;

/* ── Cart Button ─────────────────────────────────────────────────────────── */
function CartButton({ inCart, loading, onAdd, onGoToCart, compact = false }) {
  if (inCart) {
    return (
      <button
        onClick={onGoToCart}
        className={`flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-500/20 whitespace-nowrap
          ${compact ? "px-2.5 py-1.5 text-[10px]" : "px-3.5 py-2 text-[11px]"}`}
      >
        <ShoppingCart className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
        Cart
      </button>
    );
  }
  return (
    <button
      onClick={onAdd}
      disabled={loading}
      className={`bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-violet-500/20 disabled:opacity-50 whitespace-nowrap
        ${compact ? "px-3 py-1.5 text-[10px]" : "px-4 py-2 text-[11px]"}`}
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "+ Add"}
    </button>
  );
}

/* =========================================================================
   GRID CARD — 2-col, image top, info bottom
========================================================================= */
export function DishCardGrid({ dish }) {
  const navigate = useNavigate();
  const { inCart, loading, handleAdd, handleGoToCart } = useCartActions(dish.public_id);
  const disc = getDiscount(dish.original_price, dish.price);

  return (
    <div
      onClick={() => navigate(`/customer/dish/${dish.public_id}`)}
      className={`group flex flex-col bg-white dark:bg-gray-900 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.98]
        ${inCart
          ? "ring-1 ring-emerald-400/60 dark:ring-emerald-500/40 shadow-md shadow-emerald-500/10"
          : "shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800"
        }`}
    >
      {/* Image */}
      <div className="relative h-[120px] bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
        {dish.images?.[0]
          ? <img src={dish.images[0]} alt={dish.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">🍽️</div>
        }
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

        {/* Veg dot — top left */}
        <div className="absolute top-2 left-2"><VegDot isVeg={dish.is_veg} /></div>

        {/* Spicy — top right */}
        {dish.is_spicy && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-lg shadow-md flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 text-white" />
          </div>
        )}

        {/* Bottom badges */}
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-1">
          <div className="flex flex-col gap-1">
            {dish.is_popular && (
              <span className="self-start flex items-center gap-0.5 px-1.5 py-[3px] bg-amber-500 rounded-md shadow">
                <Star className="w-2.5 h-2.5 text-white fill-white" />
                <span className="text-white text-[9px] font-bold">Popular</span>
              </span>
            )}
            {disc > 0 && (
              <span className="self-start px-1.5 py-[3px] bg-emerald-500 rounded-md shadow">
                <span className="text-white text-[9px] font-bold">{disc}% OFF</span>
              </span>
            )}
          </div>

          {/* Rating + prep */}
          <div className="flex flex-col items-end gap-1">
            {dish.average_rating > 0 && (
              <span className="flex items-center gap-0.5 px-1.5 py-[3px] bg-black/60 backdrop-blur-sm rounded-md">
                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                <span className="text-white text-[9px] font-bold">{parseFloat(dish.average_rating).toFixed(1)}</span>
              </span>
            )}
            {dish.prep_time && (
              <span className="flex items-center gap-0.5 px-1.5 py-[3px] bg-black/60 backdrop-blur-sm rounded-md">
                <Clock className="w-2.5 h-2.5 text-white/80" />
                <span className="text-white/90 text-[9px] font-medium">{dish.prep_time}m</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-2.5 flex flex-col flex-1">
        <h3 className="font-bold text-[12.5px] text-gray-900 dark:text-white leading-tight line-clamp-1 mb-0.5">
          {dish.name}
        </h3>
        {dish.category_name && (
          <span className="text-[9.5px] font-semibold text-violet-500 dark:text-violet-400 mb-1">{dish.category_name}</span>
        )}
        <p className="text-[9.5px] text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed flex-1 mb-2">
          {dish.description || ""}
        </p>

        {/* Price row */}
        <div className="flex items-center justify-between gap-1 mt-auto pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <div className="min-w-0">
            <p className="text-[14px] font-black text-gray-900 dark:text-white leading-none">₹{fmt(dish.price)}</p>
            {disc > 0 && (
              <p className="text-[9px] text-gray-400 line-through leading-tight mt-0.5">₹{fmt(dish.original_price)}</p>
            )}
          </div>
          <CartButton inCart={inCart} loading={loading} onAdd={handleAdd} onGoToCart={handleGoToCart} compact />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   LIST CARD — full-width horizontal row
========================================================================= */
export function DishCardList({ dish }) {
  const navigate = useNavigate();
  const { inCart, loading, handleAdd, handleGoToCart } = useCartActions(dish.public_id);
  const disc = getDiscount(dish.original_price, dish.price);

  return (
    <div
      onClick={() => navigate(`/customer/dish/${dish.public_id}`)}
      className={`group flex bg-white dark:bg-gray-900 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.99]
        ${inCart
          ? "ring-1 ring-emerald-400/60 dark:ring-emerald-500/40 shadow-md shadow-emerald-500/10"
          : "shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800"
        }`}
    >
      {/* Image */}
      <div className="relative w-[100px] flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800">
        {dish.images?.[0]
          ? <img src={dish.images[0]} alt={dish.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">🍽️</div>
        }
        <div className="absolute top-2 left-2"><VegDot isVeg={dish.is_veg} /></div>
        {dish.is_popular && (
          <div className="absolute bottom-0 inset-x-0 py-1 bg-amber-500 flex items-center justify-center gap-0.5">
            <Star className="w-2.5 h-2.5 text-white fill-white" />
            <span className="text-white text-[9px] font-bold">Popular</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
        <div>
          <div className="flex items-start gap-1 mb-0.5">
            <h3 className="font-bold text-[13px] text-gray-900 dark:text-white leading-tight line-clamp-1 flex-1">
              {dish.name}
            </h3>
            {dish.is_spicy && <Flame className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />}
          </div>
          {dish.category_name && (
            <p className="text-[9.5px] font-semibold text-violet-500 dark:text-violet-400 mb-1">{dish.category_name}</p>
          )}
          {dish.description && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed mb-1.5">{dish.description}</p>
          )}
          <div className="flex flex-wrap gap-1">
            {dish.prep_time && (
              <span className="flex items-center gap-0.5 px-1.5 py-[3px] bg-gray-100 dark:bg-gray-800 rounded-md text-[9px] font-semibold text-gray-500">
                <Clock className="w-2.5 h-2.5" />{dish.prep_time}m
              </span>
            )}
            {dish.average_rating > 0 && (
              <span className="flex items-center gap-0.5 px-1.5 py-[3px] bg-amber-50 dark:bg-amber-950/30 rounded-md text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                <Star className="w-2.5 h-2.5 fill-current" />{parseFloat(dish.average_rating).toFixed(1)}
              </span>
            )}
            {disc > 0 && (
              <span className="px-1.5 py-[3px] bg-emerald-50 dark:bg-emerald-950/30 rounded-md text-[9px] font-bold text-emerald-600">
                {disc}% OFF
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[14px] font-black text-gray-900 dark:text-white">₹{fmt(dish.price)}</span>
            {disc > 0 && <span className="text-[9.5px] text-gray-400 line-through">₹{fmt(dish.original_price)}</span>}
          </div>
          <CartButton inCart={inCart} loading={loading} onAdd={handleAdd} onGoToCart={handleGoToCart} />
        </div>
      </div>
    </div>
  );
}

/* ── Quick section card ──────────────────────────────────────────────────── */
export function DishCardQuick({ dish }) {
  const navigate = useNavigate();
  const { inCart, loading, handleAdd, handleGoToCart } = useCartActions(dish.public_id);
  const disc = getDiscount(dish.original_price, dish.price);

  return (
    <div
      onClick={() => navigate(`/customer/dish/${dish.public_id}`)}
      className={`group flex flex-col w-40 flex-shrink-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.98]
        ${inCart
          ? "ring-1 ring-emerald-400/60 dark:ring-emerald-500/40"
          : "border border-gray-100 dark:border-gray-800 shadow-sm"
        }`}
    >
      <div className="relative h-[100px] bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
        {dish.images?.[0]
          ? <img src={dish.images[0]} alt={dish.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">🍽️</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-2 left-2"><VegDot isVeg={dish.is_veg} /></div>
        {disc > 0 && (
          <span className="absolute bottom-2 left-2 px-1.5 py-[3px] bg-emerald-500 rounded-md text-white text-[9px] font-bold shadow">
            {disc}% OFF
          </span>
        )}
        {dish.average_rating > 0 && (
          <span className="absolute bottom-2 right-2 flex items-center gap-0.5 px-1.5 py-[3px] bg-black/60 backdrop-blur-sm rounded-md">
            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
            <span className="text-white text-[9px] font-bold">{parseFloat(dish.average_rating).toFixed(1)}</span>
          </span>
        )}
      </div>
      <div className="p-2.5 flex flex-col flex-1">
        <h3 className="font-bold text-[12px] text-gray-900 dark:text-white leading-tight line-clamp-1 mb-0.5">{dish.name}</h3>
        <p className="text-[9px] text-gray-400 line-clamp-2 leading-relaxed flex-1 mb-2">{dish.description || ""}</p>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-[13px] font-black text-gray-900 dark:text-white leading-none">₹{fmt(dish.price)}</p>
            {disc > 0 && <p className="text-[9px] text-gray-400 line-through leading-tight">₹{fmt(dish.original_price)}</p>}
          </div>
          <CartButton inCart={inCart} loading={loading} onAdd={handleAdd} onGoToCart={handleGoToCart} compact />
        </div>
      </div>
    </div>
  );
}

export default function DishCard({ dish, variant = "vertical" }) {
  if (variant === "horizontal") return <DishCardList dish={dish} />;
  return <DishCardGrid dish={dish} />;
}