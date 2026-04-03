import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";

const SIDEBAR_COLLAPSED_W = 64;  
const SIDEBAR_EXPANDED_W  = 176; 

export default function AdminLayout() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
    <div
      className="flex min-h-screen
        bg-gray-50 dark:bg-gray-900
        transition-colors duration-300"
    >
      {/* ── SIDEBAR (desktop only) ── */}
      {!isMobile && (
        <div
          style={{ width: sidebarWidth }}
          className="fixed left-0 top-0 h-full z-40 transition-[width] duration-300 ease-in-out"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <AdminSidebar isExpanded={isExpanded} />
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main
        style={{ marginLeft: isMobile ? 0 : sidebarWidth }}
        className="flex-1 min-h-screen transition-[margin-left] duration-300 ease-in-out"
      >
        <Outlet />
      </main>
    </div>
  );
}