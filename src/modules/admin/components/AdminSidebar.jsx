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

/* ─────────────────────────────────────────────
   NAV CONFIG (Categorized to match Super Admin)
───────────────────────────────────────────── */
const NAV_SECTIONS = [
  {
    label: "Core Operations",
    links: [
      { path: "/restaurant/admin/dashboard", icon: <LayoutDashboard size={22} />, label: "Dashboard" },
      { path: "/restaurant/admin/table-management", icon: <Table size={22} />, label: "Tables" },
      { path: "/restaurant/admin/order-management", icon: <ShoppingBag size={22} />, label: "Orders" },
      { path: "/restaurant/admin/kitchenticket-management", icon: <ChefHat size={22} />, label: "Kitchen" },
    ],
  },
  {
    label: "Management",
    links: [
      { path: "/restaurant/admin/menu-management", icon: <UtensilsCrossed size={22} />, label: "Menu" },
      { path: "/restaurant/admin/customer-management", icon: <Users size={22} />, label: "Customers" },
      { path: "/restaurant/admin/employee-management", icon: <UserCheck size={22} />, label: "Employee" },
      { path: "/restaurant/admin/review-management", icon: <PenLineIcon size={22} />, label: "Reviews" },
    ],
  },
  {
    label: "System & Config",
    links: [
      { path: "/restaurant/admin/table-sessions", icon: <CalendarClock size={22} />, label: "Sessions" },
      { path: "/restaurant/admin/notification", icon: <BellDotIcon size={22} />, label: "Notification" },
      { path: "/restaurant/admin/settings", icon: <Settings size={22} />, label: "Settings" },
    ],
  }
];

const labelVariants = {
  hidden: { opacity: 0, x: -6, width: 0 },
  visible: {
    opacity: 1,
    x: 0,
    width: "auto",
    transition: { type: "tween", ease: "easeOut", duration: 0.18 },
  },
};

/* ─────────────────────────────────────────────
   ADMIN SIDEBAR — Original Colors + Super Admin Layout
───────────────────────────────────────────── */
export default function AdminSidebar({ isExpanded }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

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
      
      if (logoutUser.fulfilled.match(resultAction)) {
        navigate("/login", { replace: true });
      } else {
        console.error("Logout failed:", resultAction.payload);
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  return (
    <div
      className="flex flex-col h-full
        bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-700/60
        shadow-xl overflow-hidden transition-colors duration-300"
    >
      {/* ── LOGO ── */}
      <div
        className="flex items-center h-16 px-3 flex-shrink-0
          border-b border-gray-200 dark:border-gray-700/60"
      >
        <Link
          to="/restaurant/admin/dashboard"
          className="flex items-center gap-0 min-w-0"
        >
          <div
            className="w-10 h-10 flex items-center justify-center flex-shrink-0
              rounded-xl bg-gradient-to-br from-violet-500/15 to-purple-500/15 shadow-inner"
          >
            <ShieldEllipsis size={20} className="text-violet-600 dark:text-violet-400" />
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                key="logo-text"
                variants={labelVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="overflow-hidden whitespace-nowrap pl-2.5"
              >
                <p
                  className="text-[10px] font-black uppercase tracking-[0.2em] leading-tight
                    bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent"
                >
                  Admin
                </p>
                <p
                  className="text-[9px] font-black uppercase tracking-wider leading-tight
                  text-gray-400 dark:text-gray-500"
                >
                  Control Panel
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* ── NAV — Grouped with reduced gaps ── */}
      <nav className="flex-1 flex flex-col px-2 pt-3 pb-2 gap-2 overflow-y-auto scrollbar-none">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-1">
            <p
              className={`text-[8px] font-black uppercase tracking-[0.22em]
                text-gray-400 dark:text-gray-500 px-3 mb-1.5
                overflow-hidden whitespace-nowrap transition-opacity duration-200
                ${isExpanded ? "opacity-100" : "opacity-0"}`}
            >
              {section.label}
            </p>

            <div className="flex flex-col gap-0.5">
              {section.links.map((link) => {
                const isActive =
                  location.pathname === link.path ||
                  location.pathname.startsWith(link.path + "/");

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center h-9 rounded-lg transition-all duration-200
                      overflow-hidden group
                      ${
                        isActive
                          ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 shadow-sm"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-violet-600 dark:hover:text-violet-400"
                      }`}
                  >
                    <div
                      className={`w-9 h-9 flex items-center justify-center flex-shrink-0 transition-colors
                        ${
                          isActive
                            ? "text-violet-700 dark:text-violet-300"
                            : "group-hover:text-violet-600 dark:group-hover:text-violet-400"
                        }`}
                    >
                      {link.icon}
                    </div>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.span
                          key={`lbl-${link.path}`}
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="text-[11px] font-bold uppercase tracking-wide
                            whitespace-nowrap overflow-hidden pr-3"
                        >
                          {link.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── THEME TOGGLE ── */}
      <div className="px-2 pt-2 border-t border-gray-200 dark:border-gray-700/60 flex-shrink-0">
        <button
          onClick={toggleTheme}
          className="flex items-center h-9 w-full rounded-lg overflow-hidden
            transition-all duration-200 text-gray-500 dark:text-gray-400
            hover:bg-gray-100 dark:hover:bg-gray-800
            hover:text-violet-600 dark:hover:text-violet-400"
        >
          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                key="theme-label"
                variants={labelVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="text-[10px] font-black uppercase tracking-widest
                  whitespace-nowrap overflow-hidden pr-3"
              >
                {isDark ? "Light" : "Dark"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ── LOGOUT ── */}
      <div className="p-2 pb-4 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center h-10 w-full rounded-lg overflow-hidden
            font-bold transition-all duration-200
            bg-gradient-to-r from-violet-600 to-purple-600
            hover:from-violet-700 hover:to-purple-700
            text-white shadow-md shadow-violet-500/25 active:scale-95"
        >
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <LogOut size={16} />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                key="logout-label"
                variants={labelVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="text-[11px] uppercase tracking-[0.1em]
                  whitespace-nowrap overflow-hidden pr-3"
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