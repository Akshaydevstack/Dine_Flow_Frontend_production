import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { logoutUser } from "../../../store/slices/authSlices/authSlice";
import { useAppDispatch } from "../../../store/hooks";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  LogOut,
  UserCheck,
  Table,
  UtensilsCrossed,
  Sun,
  Moon,
  ChefHat,
  PenLineIcon,
  ShieldEllipsis,
  CalendarClock,
  Settings,
  BellDotIcon
} from "lucide-react";

export default function AdminSidebar({ isExpanded }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch()

  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const handleLogout = async () => {
  if (!window.confirm("Do you want to logout?")) return;

  try {
    const resultAction = await dispatch(logoutUser());

    if (LogOut.fulfilled.match(resultAction)) {
      navigate("/login", { replace: true });
    } else {
      console.error("Logout failed:", resultAction.payload);
      alert("Logout failed. Please try again.");
    }

  } catch (error) {
    console.error("Unexpected error:", error);
  }
};
  const navLinks = [
    {
      path: "/restaurant/admin/dashboard",
      icon: <LayoutDashboard size={22} />,
      label: "Dashboard",
    },
    {
      path: "/restaurant/admin/table-management",
      icon: <Table size={22} />,
      label: "Tables",
    },
    {
      path: "/restaurant/admin/order-management",
      icon: <ShoppingBag size={22} />,
      label: "Orders",
    },
    {
      path: "/restaurant/admin/kitchenticket-management",
      icon: <ChefHat size={22} />,
      label: "Kitchen",
    },
    {
      path: "/restaurant/admin/customer-management",
      icon: <Users size={22} />,
      label: "Customers",
    },
    {
      path: "/restaurant/admin/menu-management",
      icon: <UtensilsCrossed size={22} />,
      label: "Menu",
    },
    {
      path: "/restaurant/admin/employee-management",
      icon: <UserCheck size={22} />,
      label: "Employee",
    },
    {
      path: "/restaurant/admin/review-management",
      icon: <PenLineIcon size={22} />,
      label: "Reviews",
    },
    {
      path: "/restaurant/admin/table-sessions",
      icon: <CalendarClock size={22} />,
      label: "Sessions",
    },
    {
      path: "/restaurant/admin/notification",
      icon: <BellDotIcon size={22} />,
      label: "Notification",
    },
     {
      path: "/restaurant/admin/settings",
      icon: <Settings size={22} />,
      label: "Settings",
    }
  ];

  const labelVariants = {
    hidden: { opacity: 0, x: -8, width: 0 },
    visible: {
      opacity: 1,
      x: 0,
      width: "auto",
      transition: { type: "tween", ease: "easeOut", duration: 0.2 },
    },
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700/60 shadow-lg overflow-hidden">
      {/* ── LOGO ── */}
      <div className="flex items-center h-16 px-3 flex-shrink-0 border-b border-gray-200 dark:border-gray-700/60">
        <Link
          to="/restaurant/admin/dashboard"
          className="flex items-center font-bold text-violet-600 dark:text-violet-400"
        >
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <ShieldEllipsis size={24} />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                key="logo-label"
                variants={labelVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="text-base font-bold whitespace-nowrap overflow-hidden"
              >
                Admin
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* ── NAV LINKS ── */}
      <nav className="flex-1 flex flex-col p-2 gap-0.5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
        {navLinks.map((link) => {
          const isActive =
            location.pathname === link.path ||
            location.pathname.startsWith(link.path + "/");

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center h-10 rounded-lg transition-all duration-150 overflow-hidden
                ${
                  isActive
                    ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border-l-[3px] border-violet-500"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 border-l-[3px] border-transparent"
                }`}
            >
              <div className="w-9 h-10 flex items-center justify-center flex-shrink-0">
                {link.icon}
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    key={`label-${link.path}`}
                    variants={labelVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="text-sm font-medium whitespace-nowrap overflow-hidden pr-3"
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* ── THEME TOGGLE ── */}
      <div className="px-2 pt-1 border-t border-gray-200 dark:border-gray-700/60 flex-shrink-0">
        <button
          onClick={toggleTheme}
          className="flex items-center h-10 w-full rounded-lg overflow-hidden transition-colors duration-150
            text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <div className="w-9 h-10 flex items-center justify-center flex-shrink-0">
            {isDark ? <Sun size={22} /> : <Moon size={22} />}
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                key="theme-label"
                variants={labelVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="text-sm font-medium whitespace-nowrap overflow-hidden pr-3"
              >
                {isDark ? "Light Mode" : "Dark Mode"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ── LOGOUT ── */}
      <div className="p-2 pb-4 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center h-10 w-full rounded-lg overflow-hidden font-semibold transition-all duration-150
            bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500
            text-white shadow-md shadow-violet-500/25 active:scale-95"
        >
          <div className="w-9 h-10 flex items-center justify-center flex-shrink-0">
            <LogOut size={22} />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                key="logout-label"
                variants={labelVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="text-sm font-semibold whitespace-nowrap overflow-hidden pr-3"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}