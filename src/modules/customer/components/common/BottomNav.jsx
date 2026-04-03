import {
  Home,
  Utensils,
  ShoppingBag,
  ReceiptText,
  UserRound,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../../../../store/hooks";
import { fetchCart } from "../../../../store/slices/cartSlice";

export default function BottomNav() {
  const location = useLocation();
  const { cartCount, fetched } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!fetched) {
      dispatch(fetchCart());
    }
  }, [fetched, dispatch]);

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        // Always show at the very top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling Down - Hide
        setIsVisible(false);
      } else {
        // Scrolling Up - Show
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, []);

  const navItems = [
    { path: "/customer/home", icon: Home, label: "Home" },
    { path: "/customer/menu", icon: Utensils, label: "Menu" },
    { path: "/customer/cart", icon: ShoppingBag, label: "Cart", isCart: true },
    { path: "/customer/orders", icon: ReceiptText, label: "Orders" },
    { path: "/customer/profile", icon: UserRound, label: "Account" },
  ];

  const shouldHide =
    location.pathname.startsWith("/customer/dish/") ||
    location.pathname.startsWith("/customer/orders/ORD") ||
    location.pathname.startsWith("/customer/notification");

  if (shouldHide) return null;

  return (
    <nav
      className={`fixed bottom-2 sm:bottom-6 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none transition-all duration-500 ease-in-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
      }`}
    >
      {/* REDUCED outer padding to p-1 */}
      <div className="pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl rounded-[1.8rem] sm:rounded-[2rem] p-1 w-full max-w-[400px]">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                // REDUCED vertical padding to py-1.5 sm:py-2
                className="relative flex-1 flex flex-col items-center justify-center py-1.5 sm:py-2 group min-w-0"
              >
                {isActive && (
                  // ADJUSTED inset-y to fit the tighter layout
                  <div className="absolute inset-x-1 inset-y-0.5 bg-indigo-50 dark:bg-indigo-500/20 rounded-[1.2rem] scale-95 transition-transform duration-300" />
                )}

                <div
                  className={`relative transition-all duration-300 ${
                    isActive ? "translate-y-0" : "translate-y-1"
                  }`}
                >
                  <item.icon
                    className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-300 ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400 fill-indigo-600/10 dark:fill-indigo-400/10"
                        : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  {item.isCart && !isActive && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 w-4 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                      {cartCount}
                    </span>
                  )}
                </div>

                <span
                  // REDUCED margin-top to mt-0.5
                  className={`text-[10px] sm:text-[11px] font-semibold mt-0.5 transition-all duration-300 truncate w-full text-center px-1 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400 opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2 absolute bottom-0"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}