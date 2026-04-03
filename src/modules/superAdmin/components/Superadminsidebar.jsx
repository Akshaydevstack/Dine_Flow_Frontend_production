import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { logoutUser } from "../../../store/slices/authSlices/authSlice";
import { useAppDispatch } from "../../../store/hooks";
import useTheme from "../../../hooks/useTheme";
import { LogOut, Sun, Moon, Crown, Store, Users, UserCheck } from "lucide-react";

/* ─────────────────────────────────────────────
   NAV CONFIG
───────────────────────────────────────────── */
const NAV_SECTIONS = [
  {
    label: "Management & Add",
    links: [
      {
        path: "/super-admin/restaurant-management",
        icon: <Store size={22} />,
        label: "Restaurants",
      },
    ],
  },
  {
    label: "Staff & Teams",
    links: [
      {
        path: "/super-admin/restaurant-staff-management",
        icon: <Users size={22} />,
        label: "Staff Management",
      },
    ],
  },
  {
    label: "Customer Insights",
    links: [
      {
        path: "/super-admin/customer-management",
        icon: <UserCheck size={22} />,
        label: "Customers",
      },
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
   SUPER ADMIN SIDEBAR — Orange → Red accent
───────────────────────────────────────────── */
export default function SuperAdminSidebar({ isExpanded }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const handleLogout = async () => {
    if (!window.confirm("Do you want to logout?")) return;
    try {
      const resultAction = await dispatch(logoutUser());
      if (logoutUser.fulfilled.match(resultAction)) {
        navigate("/", { replace: true });
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <div
      className="flex flex-col h-full
        bg-white dark:bg-[#0c1120]
        border-r border-slate-200 dark:border-slate-800
        shadow-xl overflow-hidden transition-colors duration-300"
    >
      {/* ── LOGO ── */}
      <div
        className="flex items-center h-16 px-3 flex-shrink-0
          border-b border-slate-100 dark:border-slate-800"
      >
        <Link
          to="/super-admin/dashboard"
          className="flex items-center gap-0 min-w-0"
        >
          <div
            className="w-10 h-10 flex items-center justify-center flex-shrink-0
              rounded-xl bg-gradient-to-br from-orange-500/15 to-red-500/15 shadow-inner"
          >
            <Crown size={20} className="text-orange-500 dark:text-orange-400" />
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
                    bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
                >
                  Super Admin
                </p>
                <p
                  className="text-[9px] font-black uppercase tracking-wider leading-tight
                  text-slate-400 dark:text-slate-500"
                >
                  Control Panel
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* ── NAV — Reduced gaps ── */}
      <nav className="flex-1 flex flex-col px-2 pt-3 pb-2 gap-2 overflow-y-auto scrollbar-none">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-1">
            <p
              className={`text-[8px] font-black uppercase tracking-[0.22em]
                text-slate-400 dark:text-slate-600 px-3 mb-1.5
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
                          ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-orange-500"
                      }`}
                  >
                    <div
                      className={`w-9 h-9 flex items-center justify-center flex-shrink-0 transition-colors
                        ${
                          isActive
                            ? "text-orange-500 dark:text-orange-400"
                            : "group-hover:text-orange-500"
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
      <div className="px-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
        <button
          onClick={toggleTheme}
          className="flex items-center h-9 w-full rounded-lg overflow-hidden
            transition-all duration-200 text-slate-400 dark:text-slate-500
            hover:bg-slate-50 dark:hover:bg-slate-800/60
            hover:text-orange-500 dark:hover:text-orange-400"
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
            bg-gradient-to-r from-orange-500 to-red-500
            hover:from-orange-600 hover:to-red-600
            text-white shadow-lg shadow-orange-500/20 active:scale-95"
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