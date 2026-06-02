import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Bell,
  User,
  QrCode,
  Users,
  Table,
  ShoppingBag,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAppSelector ,useAppDispatch} from "../../../../store/hooks";
import { useState, useEffect, useRef } from "react";


import { fetchWaiterCart } from "../../../../store/slices/waiterSlice/waiterCartSlice";

export default function WaiterBottomNav() {

  const {cartCount, fetched} = useAppSelector((state) => state.waiterCart)
  const dispatch = useAppDispatch()

  const location = useLocation();

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(()=>{
      if (!fetched){
        dispatch(fetchWaiterCart())
      }
    })

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
    { path: "/waiter/tables", icon: Table, label: "Tables" },
    { path: "/waiter/menu", icon: UtensilsCrossed, label: "Menu" },
    { path: "/waiter/cart", icon: ShoppingBag, label: "Cart" },
    {
      path: "/waiter/orders",
      icon: ClipboardList,
      label: "Orders"
    },
    { path: "/waiter/profile", icon: User, label: "Profile" },
  ];

  // Show only 5 items max for bottom nav, hide some in priority order
  const visibleNavItems = navItems.slice(0, 5);

  const shouldHide =
    location.pathname.startsWith("/waiter/orders/") ||
    location.pathname.startsWith("/waiter/tables/") ||
    location.pathname.startsWith("/waiter/order-details/") ||
    location.pathname.startsWith("/waiter/scan/") ||
    location.pathname.startsWith("/waiter/qr/");

  if (shouldHide) return null;

  return (
    <nav
      className={`fixed bottom-4 sm:bottom-6 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none transition-all duration-500 ease-in-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
      }`}
    >
      <div className="pointer-events-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-amber-200/50 dark:border-amber-800/50 shadow-2xl rounded-[1.8rem] sm:rounded-[2rem] p-1 w-full max-w-[450px]">
        <div className="flex justify-around items-center">
          {visibleNavItems.map((item) => {
  const isActive =
    location.pathname === item.path ||
    (item.path === "/waiter/orders" &&
      location.pathname.startsWith("/waiter/orders/")) ||
    (item.path === "/waiter/tables" &&
      location.pathname.startsWith("/waiter/tables/"));

  return (
    <Link
      key={item.path}
      to={item.path}
      className="relative flex-1 flex flex-col items-center justify-center py-2 sm:py-2.5 group min-w-0"
    >
      {isActive && (
        <div className="absolute inset-x-1 inset-y-1 bg-amber-50 dark:bg-amber-500/20 rounded-[1rem] sm:rounded-[1.2rem] scale-95 transition-transform duration-300" />
      )}

      <div
        className={`relative transition-all duration-300 ${
          isActive ? "translate-y-0" : "translate-y-1"
        }`}
      >
        <item.icon
          className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${
            isActive
              ? "text-amber-600 dark:text-amber-400 fill-amber-600/10 dark:fill-amber-400/10"
              : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
          }`}
          strokeWidth={isActive ? 2.5 : 2}
        />

        {/* CART BADGE */}
        {item.path === "/waiter/cart" && cartCount > 0 && (
          <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-gray-900">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        )}

       
      </div>

      <span
        className={`text-[9px] sm:text-[10px] font-semibold mt-0.5 sm:mt-1 transition-all duration-300 truncate w-full text-center px-1 ${
          isActive
            ? "text-amber-600 dark:text-amber-400 opacity-100 translate-y-0"
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
