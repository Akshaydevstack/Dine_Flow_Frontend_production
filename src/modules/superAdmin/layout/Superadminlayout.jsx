import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import SuperAdminSidebar from "../components/Superadminsidebar";

const SIDEBAR_COLLAPSED_W = 60;
const SIDEBAR_EXPANDED_W  = 192;

export default function SuperAdminLayout() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 768);

  /* ── Initialise theme from localStorage on mount ── */
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
    } else if (saved === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // Respect OS preference if no saved value
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsExpanded(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = isExpanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0f1e] transition-colors duration-300">

      {/* ── SIDEBAR (desktop only) ── */}
      {!isMobile && (
        <div
          style={{ width: sidebarWidth }}
          className="fixed left-0 top-0 h-full z-40 transition-[width] duration-300 ease-in-out"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <SuperAdminSidebar isExpanded={isExpanded} />
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main
        style={{ marginLeft: isMobile ? 0 : sidebarWidth }}
        className="flex-1 min-h-screen min-w-0 overflow-x-hidden transition-[margin-left] duration-300 ease-in-out"
      >
        <Outlet />
      </main>
    </div>
  );
}