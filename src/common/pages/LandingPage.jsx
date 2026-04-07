import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChefHat,
  QrCode,
  Smartphone,
  CreditCard,
  Clock,
  Utensils,
  Sparkles,
  Users,
  LayoutDashboard,
  Cpu,
  TrendingUp,
  Star,
  MessageSquare,
  CheckCircle2,
  X,
  Menu,
  ArrowRight,
  IndianRupee,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Zap,
  Bot,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import useTheme from "../../hooks/useTheme";

/* ─── NAV LINKS ─────────────────────────────────────────── */
const navLinks = [
  { name: "How It Works", href: "#workflow" },
  { name: "Features", href: "#features" },
  { name: "AI Waiter", href: "#ai-features" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Pricing", href: "#pricing" },
];

/* ─── STATS ──────────────────────────────────────────────── */
const stats = [
  { value: "40%", label: "Faster Table Turns", icon: Clock },
  { value: "25%", label: "Revenue Boost", icon: TrendingUp },
  { value: "99%", label: "Order Accuracy", icon: CheckCircle2 },
  { value: "50%", label: "Less Wait Time", icon: Zap },
];

/* ─── WORKFLOW STEPS ─────────────────────────────────────── */
const workflowSteps = [
  {
    step: "01",
    title: "Scan & Browse",
    desc: "Guest scans the table QR code. Browser opens your digital menu instantly — no app download required.",
    icon: QrCode,
    color: "from-blue-500 to-blue-600",
    glow: "rgba(59,130,246,0.25)",
  },
  {
    step: "02",
    title: "Order Digitally",
    desc: "Guests customise dishes and place orders from their phones. Frictionless OTP login keeps it secure.",
    icon: Smartphone,
    color: "from-purple-500 to-purple-600",
    glow: "rgba(168,85,247,0.25)",
  },
  {
    step: "03",
    title: "Kitchen Display",
    desc: "Orders appear on the KDS instantly. Chefs prep and mark tickets ready — no lost paper tickets ever.",
    icon: ChefHat,
    color: "from-orange-500 to-orange-600",
    glow: "rgba(249,115,22,0.25)",
  },
  {
    step: "04",
    title: "Pay & Leave",
    desc: "Customer reviews the digital bill, splits it with friends, and pays via UPI or card instantly.",
    icon: CreditCard,
    color: "from-emerald-500 to-emerald-600",
    glow: "rgba(16,185,129,0.25)",
  },
];

/* ─── FEATURES ───────────────────────────────────────────── */
const features = [
  {
    icon: Zap,
    title: "Frictionless Login",
    desc: "Invisible reCAPTCHA and instant SMS OTPs — customers log in securely in seconds with zero passwords.",
    tags: ["Zero Passwords", "Bot Protection", "Verified Numbers"],
    accent: "purple",
  },
  {
    icon: ChefHat,
    title: "Live Kitchen Routing",
    desc: "Orders route to specific kitchen stations automatically. Chefs mark items ready; waiters are notified instantly.",
    tags: ["Station Routing", "Prep Timers", "Real-time Sync"],
    accent: "blue",
  },
  {
    icon: IndianRupee,
    title: "Unified Payments",
    desc: "Accept UPI, Credit Cards, and Cash in one flow. Let customers split bills at the table digitally.",
    tags: ["Zero-touch UPI", "Split Bills", "Digital Receipts"],
    accent: "emerald",
  },
  {
    icon: Utensils,
    title: "Smart Inventory",
    desc: "Track raw materials in real-time. Get low-stock alerts before you run out of key ingredients.",
    tags: ["Recipe Management", "Low Stock Alerts", "Wastage Logs"],
    accent: "orange",
  },
  {
    icon: Users,
    title: "Staff Management",
    desc: "Role-based permissions for waiters, managers, and chefs — everyone sees only what they need.",
    tags: ["Shift Scheduling", "Performance", "Access Control"],
    accent: "pink",
  },
  {
    icon: LayoutDashboard,
    title: "Central Dashboard",
    desc: "Manage menus, pricing, and advanced analytics for a single cafe or a 50-location chain.",
    tags: ["Live Sales Data", "Multi-outlet", "Tax Reports"],
    accent: "blue",
  },
];

/* ─── ACCENT MAP ─────────────────────────────────────────── */
const accentMap = {
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
  },
  pink: {
    bg: "bg-pink-100 dark:bg-pink-900/30",
    text: "text-pink-600 dark:text-pink-400",
    border: "border-pink-200 dark:border-pink-800",
  },
};

/* ─── AI FEATURES ────────────────────────────────────────── */
const aiFeatures = [
  {
    icon: MessageSquare,
    title: "Dina: Conversational AI Waiter",
    desc: "Customers type complex requests like 'I want something spicy, but my friend is vegan.' Dina understands the flavours, checks the live menu, and recommends the perfect dishes.",
    iconColor: "text-blue-400 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-gray-800",
    iconBorder: "border-blue-200 dark:border-gray-700",
  },
  {
    icon: Star,
    title: "Semantic Taste Recommendations",
    desc: "Our engine learns a customer's taste profile based on what they view and order, suggesting perfect add-ons automatically — no annoying popups.",
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-50 dark:bg-gray-800",
    iconBorder: "border-yellow-200 dark:border-gray-700",
  },
  {
    icon: Cpu,
    title: "Smart Context Memory",
    desc: "Dina remembers table context throughout the meal. If a guest asks 'Can I get another one of those?', she knows exactly what they ordered 10 minutes ago.",
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-100 dark:bg-gray-800",
    iconBorder: "border-purple-200 dark:border-gray-700",
  },
];

/* ─── CHAT MESSAGES ──────────────────────────────────────── */
const chatMessages = [
  {
    role: "user",
    text: "I want something spicy, but my friend is vegan. Any suggestions?",
  },
  {
    role: "ai",
    text: "Great combo! For you, I'd suggest our Andhra Chilli Chicken (🔥🔥🔥) or Mutton Rogan Josh. For your vegan friend — our Veg Chilli Garlic Noodles or the Spicy Tofu Curry are crowd favourites.",
  },
  {
    role: "user",
    text: "Add the Andhra Chilli Chicken and Spicy Tofu Curry.",
  },
  {
    role: "ai",
    text: "Done! ✅ Added both to your order. Shall I also add garlic naan on the side? It pairs brilliantly with both.",
  },
];

/* ─── TESTIMONIALS ───────────────────────────────────────── */
const testimonials = [
  {
    name: "Rajesh Iyer",
    role: "Owner, Spice Garden",
    initials: "RI",
    gradient: "from-purple-500 to-blue-600",
    rating: 5,
    text: "Table turns went up 38% in the first month alone. The kitchen display is a game-changer — chefs love it and we've had zero lost orders since switching.",
  },
  {
    name: "Ananya Krishnan",
    role: "GM, The Coastal House",
    initials: "AK",
    gradient: "from-blue-500 to-cyan-500",
    rating: 5,
    text: "Dina is phenomenal. Our guests keep complimenting our 'AI waiter' — they think it's magic. Revenue from upsells alone paid for the subscription in Week 1.",
  },
  {
    name: "Mohammed Farhan",
    role: "Director, Curry Co.",
    initials: "MF",
    gradient: "from-orange-500 to-pink-500",
    rating: 5,
    text: "Managing 8 outlets from one dashboard was a dream. DineFlow made it real. The multi-location analytics alone is worth every rupee.",
  },
];

/* ─── PRICING PLANS ──────────────────────────────────────── */
const pricingPlans = [
  {
    name: "Starter",
    description: "Perfect for cafes & food trucks",
    price: "₹999",
    period: "/month",
    features: [
      { text: "Up to 100 orders/day", included: true },
      { text: "Contactless QR Ordering", included: true },
      { text: "Basic Kitchen Display (KDS)", included: true },
      { text: "Zero-Wait UPI Payments", included: true },
      { text: "Email Support", included: true },
      { text: "Dina AI Waiter", included: false },
      { text: "Smart Recommendations", included: false },
    ],
    cta: "Contact Sales",
    popular: false,
    ctaStyle:
      "bg-gray-100 dark:bg-[#252836] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700",
  },
  {
    name: "Professional",
    description: "Best for growing restaurants",
    price: "₹2,499",
    period: "/month",
    features: [
      { text: "Unlimited Orders", included: true },
      { text: "Advanced QR Branding", included: true },
      { text: "Smart Station Routing KDS", included: true },
      { text: "Frictionless OTP Login", included: true },
      { text: "Dina Conversational AI Waiter", included: true },
      { text: "Semantic Taste Recommendations", included: true },
      { text: "Priority WhatsApp Support", included: true },
    ],
    cta: "Book a Demo",
    popular: true,
    ctaStyle:
      "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/20",
  },
  {
    name: "Enterprise",
    description: "For chains & multi-outlets",
    price: "Custom",
    period: "",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Multi-location Dashboard", included: true },
      { text: "Centralized Cloud Kitchen", included: true },
      { text: "Predictive AI Inventory", included: true },
      { text: "24/7 Dedicated Account Manager", included: true },
      { text: "Custom API Integrations", included: true },
      { text: "Custom Analytics Reports", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
    ctaStyle:
      "bg-gray-100 dark:bg-[#252836] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700",
  },
];

/* ─── KDS ORDERS ─────────────────────────────────────────── */
const kdsOrders = [
  {
    table: 4,
    items: "2× Butter Chicken, 4× Garlic Naan",
    status: "Cooking",
    statusClass:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  {
    table: 7,
    items: "1× Paneer Tikka, 2× Coke Zero",
    status: "Preparing",
    statusClass:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    table: 2,
    items: "1× Masala Dosa, 1× Filter Coffee",
    status: "Ready ✓",
    statusClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
];

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const observerRef = useRef(null);

  /* Scroll → nav style */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Smooth scroll */
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  /* Intersection observer for scroll-reveal */
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisibleItems(
              (prev) => new Set([...prev, e.target.dataset.reveal]),
            );
          }
        });
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll("[data-reveal]")
      .forEach((el) => observerRef.current.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const reveal = (id, delay = 0) => ({
    "data-reveal": id,
    style: {
      opacity: visibleItems.has(id) ? 1 : 0,
      transform: visibleItems.has(id) ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.6s ${delay}s ease, transform 0.6s ${delay}s ease`,
    },
  });

  const dark = theme === "dark";

  return (
    <div
      className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-300 ${
        dark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* ── GLOBAL STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .gradient-text {
          background: linear-gradient(135deg, #a855f7, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gradient-text-hero {
          background: linear-gradient(135deg, #c084fc 0%, #818cf8 50%, #60a5fa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .card-hover {
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
        }
        .glow-purple { box-shadow: 0 0 40px rgba(168,85,247,0.15); }
        .glow-purple:hover { box-shadow: 0 8px 50px rgba(168,85,247,0.25); }
        .btn-cta {
          background: linear-gradient(135deg, #9333ea, #3b82f6);
          transition: all 0.25s ease;
        }
        .btn-cta:hover {
          background: linear-gradient(135deg, #7e22ce, #2563eb);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(147,51,234,0.35);
        }
        .mesh-bg {
          background-image:
            radial-gradient(ellipse 80% 60% at 20% 0%, rgba(147,51,234,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 10%, rgba(59,130,246,0.07) 0%, transparent 60%);
        }
        .mesh-bg-light {
          background-image:
            radial-gradient(ellipse 80% 60% at 20% 0%, rgba(147,51,234,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 10%, rgba(59,130,246,0.04) 0%, transparent 60%);
        }
        .chat-bubble-ai {
          animation: fadeSlideUp 0.4s ease;
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .kds-pulse { animation: kdsPulse 2s infinite; }
        @keyframes kdsPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .popular-ring {
          outline: 2px solid #9333ea;
          outline-offset: 2px;
        }
        .nav-link-underline::after {
          content: '';
          display: block;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(90deg, #9333ea, #3b82f6);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s ease;
        }
        .nav-link-underline:hover::after { transform: scaleX(1); }
        .badge-popular {
          background: linear-gradient(135deg, #9333ea, #3b82f6);
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #4b4b6b; border-radius: 3px; }
      `}</style>

      {/* ════════════════════════════════════
          NAVBAR
      ════════════════════════════════════ */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? `${dark ? "bg-gray-900/90" : "bg-white/90"} backdrop-blur-xl border-b ${dark ? "border-gray-800" : "border-gray-200"} shadow-sm`
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group select-none">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/40 transition-shadow">
              <ChefHat className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-extrabold gradient-text tracking-tight">
              DineFlow
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <a
                key={l.name}
                href={l.href}
                className={`nav-link-underline text-sm font-semibold pb-0.5 transition-colors duration-200 ${
                  dark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {l.name}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setTheme(dark ? "light" : "dark")}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors ${
                dark
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
            >
              {dark ? "☀️" : "🌙"}
            </button>
            <a
              href="#demo"
              className="btn-cta px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-purple-500/20"
            >
              Book a Demo
            </a>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setTheme(dark ? "light" : "dark")}
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                dark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
              }`}
            >
              {dark ? "☀️" : "🌙"}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                dark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
              }`}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className={`md:hidden border-t ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} shadow-xl`}
          >
            <div className="px-4 pt-3 pb-5 flex flex-col gap-1">
              {navLinks.map((l) => (
                <a
                  key={l.name}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`py-3 text-sm font-semibold border-b ${
                    dark
                      ? "text-gray-300 border-gray-800"
                      : "text-gray-700 border-gray-100"
                  }`}
                >
                  {l.name}
                </a>
              ))}
              <div className="flex pt-4">
                <a
                  href="#demo"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 py-3.5 rounded-xl text-center font-bold text-sm text-white btn-cta"
                >
                  Book a Demo
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ════════════════════════════════════
          HERO
      ════════════════════════════════════ */}
      <section
        className={`relative pt-28 pb-16 md:pt-44 md:pb-28 px-4 overflow-hidden ${dark ? "mesh-bg" : "mesh-bg-light"}`}
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${dark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.04)"} 1px, transparent 1px),
                            linear-gradient(90deg, ${dark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.04)"} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-14 relative z-10">
          {/* Left Copy */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-[10px] sm:text-xs font-bold uppercase tracking-widest
              bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300
              border border-purple-200 dark:border-purple-800/60"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Restaurant OS
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 text-gray-900 dark:text-white">
              Run Your Restaurant
              <br className="hidden md:block" />
              <span className="gradient-text-hero"> Without the Chaos</span>
            </h1>

            <p
              className={`text-base sm:text-lg mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}
            >
              DineFlow integrates QR ordering, live kitchen displays, and
              seamless UPI payments into one powerful platform. Serve faster,
              earn more.
            </p>

            <div className="flex justify-center lg:justify-start mb-12">
              <a
                href="#demo"
                className="btn-cta w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white shadow-xl shadow-purple-500/25"
              >
                Book a Personalized Demo
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map(({ value, label, icon: Icon }) => (
                <div
                  key={label}
                  className={`rounded-2xl p-4 text-center border transition-colors card-hover ${
                    dark
                      ? "bg-[#1F1D2B] border-gray-800"
                      : "bg-white border-gray-200 shadow-sm"
                  }`}
                >
                  <div className="text-2xl sm:text-3xl font-extrabold gradient-text mb-1">
                    {value}
                  </div>
                  <div
                    className={`text-[10px] sm:text-[11px] font-semibold flex items-center justify-center gap-1 ${dark ? "text-gray-500" : "text-gray-500"}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — KDS Visual */}
          <div className="flex-1 w-full max-w-lg relative mt-8 lg:mt-0">
            {/* Floating badge — QR */}
            <div
              className={`absolute -right-2 sm:-right-4 top-4 sm:top-8 z-10 flex items-center gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl shadow-xl border card-hover ${
                dark
                  ? "bg-[#252836] border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 sm:p-2 rounded-lg">
                <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div
                  className={`text-[10px] sm:text-xs font-bold ${dark ? "text-white" : "text-gray-900"}`}
                >
                  Instant QR Menu
                </div>
                <div className="text-[9px] sm:text-[10px] text-gray-500">No app needed</div>
              </div>
            </div>

            {/* Floating badge — UPI */}
            <div
              className={`absolute -left-2 sm:-left-4 bottom-12 sm:bottom-20 z-10 flex items-center gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl shadow-xl border card-hover ${
                dark
                  ? "bg-[#252836] border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 sm:p-2 rounded-lg">
                <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div
                  className={`text-[10px] sm:text-xs font-bold ${dark ? "text-white" : "text-gray-900"}`}
                >
                  UPI Pay at Table
                </div>
                <div className="text-[9px] sm:text-[10px] text-gray-500">
                  Split bills digitally
                </div>
              </div>
            </div>

            {/* KDS Card */}
            <div
              className={`rounded-[2rem] border-[6px] sm:border-[8px] shadow-2xl p-4 sm:p-5 ${
                dark
                  ? "bg-[#1F1D2B] border-[#252836]"
                  : "bg-white border-gray-100"
              }`}
            >
              <div
                className={`flex justify-between items-center mb-4 sm:mb-5 pb-3 sm:pb-4 border-b ${dark ? "border-gray-800" : "border-gray-100"}`}
              >
                <div>
                  <h3
                    className={`font-bold text-xs sm:text-sm ${dark ? "text-white" : "text-gray-900"}`}
                  >
                    Live Kitchen Display
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                    Spice Garden — Table Zone A
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold">
                  <span className="kds-pulse w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Live
                </div>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {kdsOrders.map((o, i) => (
                  <div
                    key={i}
                    className={`p-2.5 sm:p-3.5 rounded-xl border flex justify-between items-center transition-all hover:scale-[1.01] ${
                      dark
                        ? "bg-[#252836] border-gray-800"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <div>
                      <div
                        className={`text-xs sm:text-sm font-bold ${dark ? "text-white" : "text-gray-900"}`}
                      >
                        Table {o.table}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 max-w-[140px] sm:max-w-[180px] truncate">
                        {o.items}
                      </div>
                    </div>
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-lg text-[9px] sm:text-xs font-bold ${o.statusClass}`}
                    >
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mini sparkline bar */}
              <div
                className={`mt-4 pt-4 border-t ${dark ? "border-gray-800" : "border-gray-100"}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                    Peak Hours Today
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-purple-500">
                    7–9 PM
                  </span>
                </div>
                <div
                  className={`h-1.5 rounded-full overflow-hidden ${dark ? "bg-gray-800" : "bg-gray-200"}`}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════ */}
      <section
        id="workflow"
        className={`py-16 md:py-24 border-y scroll-mt-20 ${
          dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16" {...reveal("wf-header")}>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 ${
                dark
                  ? "bg-purple-950/60 text-purple-300 border border-purple-800/60"
                  : "bg-purple-50 text-purple-600 border border-purple-200"
              }`}
            >
              <Sparkles className="w-3 h-3" /> The Flow
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              The Perfect Dining Loop
            </h2>
            <p
              className={`text-sm sm:text-base max-w-xl mx-auto ${dark ? "text-gray-400" : "text-gray-600"}`}
            >
              A seamless, end-to-end journey from the moment your customer sits
              down to when they leave — zero friction, every step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative">
            {/* Connector */}
            <div
              className={`hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px ${
                dark
                  ? "bg-gradient-to-r from-transparent via-gray-700 to-transparent"
                  : "bg-gradient-to-r from-transparent via-gray-200 to-transparent"
              }`}
            />

            {workflowSteps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  {...reveal(`wf-${i}`, i * 0.1)}
                  className="flex flex-col items-center text-center group relative z-10"
                >
                  <div
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center mb-4 md:mb-5 shadow-lg
                    transition-all duration-300 group-hover:-translate-y-2`}
                    style={{ boxShadow: `0 10px 30px ${s.glow}` }}
                  >
                    <Icon className="w-8 h-8 md:w-9 md:h-9" />
                  </div>
                  <div className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-600 tracking-widest mb-1.5 md:mb-2">
                    {s.step}
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          FEATURES
      ════════════════════════════════════ */}
      <section
        id="features"
        className={`py-16 md:py-24 scroll-mt-20 ${dark ? "bg-gray-950" : "bg-gray-50"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16" {...reveal("feat-header")}>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 ${
                dark
                  ? "bg-blue-950/60 text-blue-300 border border-blue-800/60"
                  : "bg-blue-50 text-blue-600 border border-blue-200"
              }`}
            >
              <Zap className="w-3 h-3" /> Platform
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Everything You Need to Scale
            </h2>
            <p
              className={`text-sm sm:text-base max-w-2xl mx-auto ${dark ? "text-gray-400" : "text-gray-600"}`}
            >
              Replace multiple disjointed softwares with one unified,
              cloud-native platform designed for modern Indian restaurants.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              const ac = accentMap[f.accent];
              return (
                <div
                  key={i}
                  {...reveal(`feat-${i}`, i * 0.07)}
                  className={`card-hover glow-purple rounded-3xl p-6 md:p-7 border transition-colors cursor-default ${
                    dark
                      ? "bg-gray-900 border-gray-800 hover:border-purple-800/50"
                      : "bg-white border-gray-200 hover:border-purple-300 shadow-sm"
                  }`}
                >
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl border flex items-center justify-center mb-4 md:mb-5 ${ac.bg} ${ac.border}`}
                  >
                    <Icon className={`w-4 h-4 md:w-5 md:h-5 ${ac.text}`} />
                  </div>
                  <h4 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {f.title}
                  </h4>
                  <p
                    className={`text-xs md:text-sm leading-relaxed mb-4 md:mb-5 min-h-0 md:min-h-[3.5rem] ${dark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {f.desc}
                  </p>
                  <div
                    className={`pt-4 border-t flex flex-wrap gap-2 ${dark ? "border-gray-800" : "border-gray-100"}`}
                  >
                    {f.tags.map((t) => (
                      <span
                        key={t}
                        className={`text-[10px] md:text-xs px-2 py-1 md:px-2.5 md:py-1 rounded-lg font-semibold ${
                          dark
                            ? "bg-gray-800 text-gray-400"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          AI WAITER SECTION
      ════════════════════════════════════ */}
      <section
        id="ai-features"
        className={`py-16 md:py-24 border-y scroll-mt-20 ${
          dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left */}
            <div className="flex-1" {...reveal("ai-left")}>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6 ${
                  dark
                    ? "bg-purple-950/60 text-purple-300 border border-purple-800/60"
                    : "bg-purple-50 text-purple-600 border border-purple-200"
                }`}
              >
                <Sparkles className="w-3 h-3" /> AI-Powered Dining
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 md:mb-5">
                Smart Technology for
                <br className="hidden sm:block" />
                <span className="gradient-text sm:ml-0 ml-1">Smarter Restaurants</span>
              </h2>
              <p
                className={`text-sm sm:text-base leading-relaxed mb-8 md:mb-10 max-w-md ${dark ? "text-gray-400" : "text-gray-600"}`}
              >
                DineFlow doesn't just digitise your menu — it understands it.
                Our built-in AI tools act as your best waiter and your smartest
                manager.
              </p>

              <div className="space-y-6 md:space-y-7">
                {aiFeatures.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 md:gap-4">
                      <div
                        className={`mt-0.5 p-2.5 md:p-3 rounded-xl border flex-shrink-0 ${f.iconBg} ${f.iconBorder}`}
                      >
                        <Icon className={`w-4 h-4 md:w-5 md:h-5 ${f.iconColor}`} />
                      </div>
                      <div>
                        <h4 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-1">
                          {f.title}
                        </h4>
                        <p
                          className={`text-xs md:text-sm leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — Two panels */}
            <div
              className="flex-1 w-full space-y-4"
              {...reveal("ai-right", 0.1)}
            >
              {/* Chat Demo */}
              <div className="bg-[#1A1C23] rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
                <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-blue-500" />
                <div className="p-4 md:p-5 border-b border-gray-800 flex items-center gap-3">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold text-white">
                      Dina — AI Waiter
                    </p>
                    <p className="text-[10px] md:text-xs text-emerald-400 font-medium">
                      ● Online · Spice Garden
                    </p>
                  </div>
                </div>
                <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                  {chatMessages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[82%] px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-[11px] sm:text-sm leading-relaxed chat-bubble-ai ${
                          m.role === "user"
                            ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-sm"
                            : "bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-sm"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insights Panel */}
              <div className="bg-[#1A1C23] rounded-3xl p-4 md:p-5 border border-gray-800 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold text-white">
                      AI Insights Dashboard
                    </p>
                    <p className="text-[10px] md:text-xs text-gray-500">
                      Real-time recommendations
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                  {[
                    {
                      label: "Peak Hours",
                      value: "7–9 PM",
                      color: "text-emerald-400",
                    },
                    {
                      label: "Top Combo",
                      value: "Burger + Fries",
                      color: "text-pink-400",
                    },
                    {
                      label: "Prep Alert",
                      value: "+15 Avocado",
                      color: "text-orange-400",
                    },
                  ].map((it) => (
                    <div
                      key={it.label}
                      className="bg-gray-800/60 rounded-xl p-2.5 md:p-3 border border-gray-700/50"
                    >
                      <p className="text-[9px] md:text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">
                        {it.label}
                      </p>
                      <p className={`text-[11px] md:text-xs font-bold ${it.color} truncate`}>
                        {it.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════ */}
      <section
        id="testimonials"
        className={`py-16 md:py-24 border-y scroll-mt-20 ${
          dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-14" {...reveal("testi-header")}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Loved by Restaurateurs Across India
            </h2>
            <p
              className={`text-sm sm:text-base max-w-xl mx-auto ${dark ? "text-gray-400" : "text-gray-600"}`}
            >
              Real results from real restaurants — no fluff, just honest
              feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                {...reveal(`testi-${i}`, i * 0.1)}
                className={`card-hover rounded-3xl p-6 md:p-7 border transition-colors ${
                  dark
                    ? "bg-gray-950 border-gray-800 hover:border-gray-700"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm"
                }`}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4 md:mb-5">
                  {Array(t.rating)
                    .fill(0)
                    .map((_, si) => (
                      <Star
                        key={si}
                        className="w-3.5 h-3.5 md:w-4 md:h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                </div>
                <p
                  className={`text-xs md:text-sm leading-relaxed mb-5 md:mb-6 italic ${dark ? "text-gray-300" : "text-gray-700"}`}
                >
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-[10px] md:text-xs font-bold flex-shrink-0`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">
                      {t.name}
                    </p>
                    <p className="text-[10px] md:text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          PRICING
      ════════════════════════════════════ */}
      <section
        id="pricing"
        className={`py-16 md:py-24 scroll-mt-20 ${dark ? "bg-gray-950" : "bg-gray-50"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-14" {...reveal("price-header")}>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 ${
                dark
                  ? "bg-purple-950/60 text-purple-300 border border-purple-800/60"
                  : "bg-purple-50 text-purple-600 border border-purple-200"
              }`}
            >
              <IndianRupee className="w-3 h-3" /> Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Transparent Pricing for India
            </h2>
            <p
              className={`text-sm sm:text-base max-w-xl mx-auto ${dark ? "text-gray-400" : "text-gray-600"}`}
            >
              No hidden charges. Start small and scale as your restaurant grows.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                {...reveal(`price-${i}`, i * 0.1)}
                className={`relative rounded-3xl p-6 md:p-8 border flex flex-col transition-all card-hover ${
                  plan.popular
                    ? `popular-ring shadow-2xl shadow-purple-500/10 ${dark ? "bg-[#1F1D2B] border-purple-700/50" : "bg-white border-purple-400/40"}`
                    : `${dark ? "bg-gray-900 border-gray-800 hover:border-gray-700" : "bg-white border-gray-200 shadow-sm hover:border-gray-300"}`
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge-popular text-white text-[10px] md:text-xs font-bold px-4 py-1 md:px-5 md:py-1.5 rounded-full shadow-lg tracking-wide uppercase">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-5 md:mb-6 mt-2 md:mt-0">
                  <h3 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white mb-1">
                    {plan.name}
                  </h3>
                  <p
                    className={`text-xs md:text-sm ${dark ? "text-gray-500" : "text-gray-500"}`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 mb-6 md:mb-7">
                  <span className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-xs md:text-sm font-medium ml-1 ${dark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-6 md:mb-8 flex-1">
                  {plan.features.map((feat, fi) => (
                    <li key={fi} className="flex items-center gap-2.5">
                      {feat.included ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 dark:text-gray-700 flex-shrink-0" />
                      )}
                      <span
                        className={`text-xs md:text-sm ${
                          feat.included
                            ? dark
                              ? "text-gray-300"
                              : "text-gray-700"
                            : "text-gray-400 dark:text-gray-600 line-through"
                        }`}
                      >
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#demo"
                  className={`block w-full py-3 md:py-3.5 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm text-center transition-all ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════ */}
      <section id="demo" className="relative py-20 md:py-28 px-4 bg-gray-900 overflow-hidden border-y border-gray-800 scroll-mt-20">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(147,51,234,0.14), transparent)",
          }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div
          className="max-w-4xl mx-auto text-center relative z-10"
          {...reveal("cta")}
        >
          <div className="w-14 h-14 md:w-16 md:h-16 mx-auto rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-6 md:mb-8 shadow-xl">
            <Star className="w-7 h-7 md:w-8 md:h-8 text-yellow-400 fill-yellow-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 md:mb-5 tracking-tight leading-[1.1]">
            Ready to Transform
            <br />
            Your Restaurant?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-400 mb-8 md:mb-10 max-w-xl mx-auto leading-relaxed">
            Join successful restaurants across India using DineFlow to increase
            efficiency, boost revenue, and delight every guest.
          </p>
          <div className="flex justify-center">
            <a
              href="mailto:contact@dineflow.store"
              className="btn-cta w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 md:px-10 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base font-bold text-white shadow-xl shadow-purple-500/25"
            >
              Book a Personalized Demo <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </a>
          </div>
          <p className="mt-6 md:mt-7 text-xs md:text-sm text-gray-500 font-medium">
            Discover how DineFlow fits your unique needs.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════
          FOOTER
      ════════════════════════════════════ */}
      <footer
        className={`py-10 md:py-14 border-t ${dark ? "bg-gray-950 border-gray-900" : "bg-white border-gray-200"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10 mb-10 md:mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link
                to="/"
                className="flex items-center gap-2.5 mb-4 md:mb-5 select-none"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                  <ChefHat className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-extrabold gradient-text tracking-tight">
                  DineFlow
                </span>
              </Link>
              <p
                className={`text-xs md:text-sm leading-relaxed mb-5 md:mb-6 max-w-xs ${dark ? "text-gray-500" : "text-gray-500"}`}
              >
                The all-in-one OS for modern Indian restaurants. Point of Sale,
                Smart KDS, QR Ordering, and Seamless UPI Payments.
              </p>
              <div className="flex gap-2">
                {[
                  { Icon: Facebook, href: "#" },
                  { Icon: Twitter, href: "#" },
                  { Icon: Instagram, href: "#" },
                  { Icon: Linkedin, href: "#" },
                  { Icon: Youtube, href: "#" },
                ].map(({ Icon, href }, idx) => (
                  <a
                    key={idx}
                    href={href}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all hover:border-purple-500 hover:text-purple-500 ${
                      dark
                        ? "bg-gray-900 border-gray-800 text-gray-500"
                        : "bg-gray-100 border-gray-200 text-gray-500"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4
                className={`font-bold uppercase text-[10px] md:text-xs tracking-widest mb-4 md:mb-5 ${dark ? "text-gray-500" : "text-gray-500"}`}
              >
                Product
              </h4>
              <ul className="space-y-2.5 md:space-y-3">
                {[
                  { label: "Features", href: "#features" },
                  { label: "AI Waiter (Dina)", href: "#ai-features" },
                  { label: "Pricing", href: "#pricing" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className={`text-xs md:text-sm transition-colors hover:text-purple-500 ${dark ? "text-gray-500" : "text-gray-500"}`}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4
                className={`font-bold uppercase text-[10px] md:text-xs tracking-widest mb-4 md:mb-5 ${dark ? "text-gray-500" : "text-gray-500"}`}
              >
                Company
              </h4>
              <ul className="space-y-2.5 md:space-y-3">
                {[
                  "About Us",
                  "Contact",
                  "Privacy Policy",
                  "Terms of Service",
                ].map((label) => (
                  <li key={label}>
                    <a
                      href="#"
                      className={`text-xs md:text-sm transition-colors hover:text-purple-500 ${dark ? "text-gray-500" : "text-gray-500"}`}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className={`pt-6 md:pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-2 md:gap-3 ${dark ? "border-gray-900" : "border-gray-100"}`}
          >
            <p
              className={`text-[10px] md:text-xs text-center md:text-left ${dark ? "text-gray-700" : "text-gray-400"}`}
            >
              © {new Date().getFullYear()} DineFlow Technologies. All rights
              reserved.
            </p>
            <p
              className={`text-[10px] md:text-xs ${dark ? "text-gray-700" : "text-gray-400"}`}
            >
              Made with ❤️ in India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}