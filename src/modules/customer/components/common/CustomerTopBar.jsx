import { Bell, MapPin, Sun, Moon } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { notificationAcknowledged } from "../../../../store/slices/notificationSlice";
import { selectHasNewNotification } from "../../../../store/selectors/notificationSelectors";
import useTheme from "../../../../hooks/useTheme";

export default function CustomerTopBar() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const hasNewNotification = useAppSelector(selectHasNewNotification);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const sessionData = localStorage.getItem("session_details");
  const sessionInfo = sessionData
    ? JSON.parse(sessionData)
    : {
        restaurant_name: "DineFlow",
        table_number: "...",
      };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const hiddenRoutes = [
    "/customer/cart",
    "/customer/profile",
    "/customer/notification",
    "/customer/orders",
    "/customer/menu",
  ];

  const shouldHide =
    hiddenRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/customer/orders/ORD") ||
    location.pathname.startsWith("/customer/dish/");

  if (shouldHide) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 transition-all duration-300 ease-out px-4 pt-4 z-[200] ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="relative rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 shadow-lg">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />

        <div className="relative px-4 py-2 flex items-center justify-between">
          {/* Restaurant Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {sessionInfo.restaurant_name}
            </h1>
            <div className="flex items-center gap-1 mt-1">
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <MapPin className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                  Table {sessionInfo.table_number}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* 🔥 NEW: Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-purple-500 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-500 animate-scale-in" />
              ) : (
                <Moon className="w-5 h-5 text-purple-600 animate-scale-in" />
              )}
            </button>

            {/* Notification Bell */}
            <Link to="/customer/notification">
              <button
                onClick={() => dispatch(notificationAcknowledged())}
                className="relative p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {hasNewNotification && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
