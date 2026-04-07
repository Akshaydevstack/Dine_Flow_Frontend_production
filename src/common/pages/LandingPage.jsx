import React, { useState, useEffect } from "react";
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
  ShieldCheck,
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
  Zap
} from "lucide-react";

import useTheme from "../../hooks/useTheme";

// Navigation links mapped to section IDs for smooth scrolling
const navLinks = [
  { name: "How It Works", href: "#workflow" },
  { name: "Features", href: "#features" },
  { name: "AI Waiter & Insights", href: "#ai-features" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Pricing", href: "#pricing" },
];

const stats = [
  { value: "40%", label: "Faster Table Turns", icon: <Clock className="w-4 h-4" /> },
  { value: "25%", label: "Revenue Boost", icon: <TrendingUp className="w-4 h-4" /> },
  { value: "99%", label: "Order Accuracy", icon: <CheckCircle2 className="w-4 h-4" /> },
  { value: "50%", label: "Less Wait Time", icon: <TrendingUp className="w-4 h-4 transform rotate-180" /> },
];

// Pricing in INR
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
    cta: "Start Free Trial",
    popular: false,
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
    cta: "Get Started",
    popular: true,
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
  },
];

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll implementation for anchor links
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gray-50 dark:bg-gray-950 dark:text-gray-100 selection:bg-purple-500/30 overflow-x-hidden transition-colors duration-300">
      
      {/* =======================
          NAVBAR 
          ======================= */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
          isScrolled
            ? "py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-gray-200 dark:border-gray-800 shadow-sm"
            : "py-5 bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group cursor-pointer select-none">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
                DineFlow
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
              <Link to="/customer/register">
                <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
                  Get Started Free
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-200"
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-200"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full w-full left-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-xl">
            <div className="px-4 pt-4 pb-6 flex flex-col space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-gray-800 dark:text-gray-200 py-3 border-b border-gray-100 dark:border-gray-800"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4">
                <Link to="/customer/login" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                    Log In
                  </button>
                </Link>
                <Link to="/customer/register" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600">
                    Sign Up Free
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* =======================
          HERO SECTION 
          ======================= */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 px-4 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-6">
            Run Your Restaurant <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
              Without the Chaos
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
            DineFlow integrates QR ordering, kitchen display systems, and seamless UPI payments into one powerful platform. Serve faster, earn more.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-12">
            <Link to="/customer/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-[#5B50FF] hover:bg-[#4a3fe0] transition-colors flex items-center justify-center gap-2 shadow-lg">
                Start 14-Day Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/demo" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-gray-300 bg-[#252836] border border-gray-700 hover:bg-[#2d303e] transition-colors flex items-center justify-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Book a Demo
              </button>
            </Link>
          </div>

          {/* Quick Stats extracted from design */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-[#1F1D2B] p-4 rounded-2xl text-center border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center gap-1">
                  {stat.icon} {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visual - KDS Representation */}
        <div className="flex-1 relative w-full max-w-lg lg:max-w-xl">
          <div className="bg-white dark:bg-[#1F1D2B] rounded-[2rem] border-[8px] border-gray-200 dark:border-[#252836] shadow-2xl p-4 md:p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="font-bold text-gray-800 dark:text-white">Live Kitchen Display</h3>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-3 py-1 rounded-full font-bold">Real-time Sync</span>
            </div>
            
            <div className="space-y-4">
              {[
                { table: 4, items: "2x Butter Chicken, 4x Naan", status: "Cooking", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
                { table: 7, items: "1x Paneer Tikka, 2x Coke", status: "Preparing", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
                { table: 2, items: "1x Masala Dosa, 1x Coffee", status: "Ready", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" }
              ].map((order, i) => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-[#252836] rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">Table {order.table}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{order.items}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${order.color}`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating UI Badges */}
          <div className="absolute -right-4 top-12 bg-white dark:bg-[#252836] p-3 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg"><QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
            <div className="text-sm font-bold text-gray-900 dark:text-white pr-2">Instant QR Menu</div>
          </div>
          <div className="absolute -left-4 bottom-24 bg-white dark:bg-[#252836] p-3 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg"><IndianRupee className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
            <div className="text-sm font-bold text-gray-900 dark:text-white pr-2">UPI Pay at Table</div>
          </div>
        </div>
      </section>

      {/* =======================
          HOW IT WORKS (Workflow) 
          ======================= */}
      <section id="workflow" className="py-20 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">The Perfect Dining Loop</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A seamless, end-to-end journey from the moment your customer sits down to the moment they leave.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Scan & Browse", desc: "Guest scans the table QR code. Their browser opens your digital menu instantly. No app downloads required.", icon: <QrCode className="w-8 h-8" />, color: "bg-blue-500" },
              { step: "02", title: "Order Digitally", desc: "Guests customize dishes and place orders directly from their phones. Frictionless OTP login keeps it secure.", icon: <Smartphone className="w-8 h-8" />, color: "bg-purple-500" },
              { step: "03", title: "Kitchen Display", desc: "Orders instantly pop up on the Kitchen Display System (KDS). Chefs prep and mark tickets as ready.", icon: <ChefHat className="w-8 h-8" />, color: "bg-orange-500" },
              { step: "04", title: "Pay & Leave", desc: "Customer reviews the digital bill, splits it with friends if needed, and pays via UPI or Card instantly.", icon: <CreditCard className="w-8 h-8" />, color: "bg-green-500" },
            ].map((flow, index) => (
              <div key={index} className="relative flex flex-col items-center text-center group">
                <div className={`w-20 h-20 rounded-2xl ${flow.color} text-white flex items-center justify-center mb-6 shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300 relative z-10`}>
                  {flow.icon}
                </div>
                {/* Connector line for desktop */}
                {index !== 3 && <div className="hidden md:block absolute top-10 left-[60%] w-full h-[2px] bg-gray-200 dark:bg-gray-800 z-0"></div>}
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{flow.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{flow.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =======================
          FEATURES SECTION 
          ======================= */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-950 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Everything You Need to Scale</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Replace multiple disjointed softwares with one unified, cloud-native platform designed for modern Indian restaurants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Zap />, title: "Frictionless Login", desc: "Say goodbye to passwords. We use invisible reCAPTCHA and instant SMS OTPs so your customers can log in securely in seconds.", features: ["Zero Passwords", "Bot Protection", "Verified Phone Numbers"] },
              { icon: <ChefHat />, title: "Live Kitchen Routing", desc: "No more lost paper tickets. Orders route directly to the specific kitchen stations. Chefs mark items ready, and waiters get notified instantly.", features: ["Station Routing", "Prep Timers", "Real-time Sync"] },
              { icon: <IndianRupee />, title: "Unified Payments", desc: "Accept UPI, Credit Cards, and Cash in one flow. Let customers split bills at the table digitally without holding up your staff.", features: ["Zero-touch UPI", "Split Bills", "Digital Receipts"] },
              { icon: <Utensils />, title: "Smart Inventory", desc: "Track raw materials in real-time. Get alerts before you run out of key ingredients, preventing out-of-stock disappointments.", features: ["Recipe Management", "Low Stock Alerts", "Wastage Logs"] },
              { icon: <Users />, title: "Staff Management", desc: "Keep your data secure. Assign specific permissions to waiters, managers, and chefs to ensure everyone only sees what they need.", features: ["Shift Scheduling", "Performance Tracking", "Access Control"] },
              { icon: <LayoutDashboard />, title: "Central Dashboard", desc: "Manage menus, pricing, and view advanced analytics for a single cafe or a 50-location chain from one central hub.", features: ["Live Sales Data", "Multi-outlet Ready", "Tax Reports"] },
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:border-purple-500/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 h-20">{feature.desc}</p>
                <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                  {feature.features.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =======================
          AI FEATURES SECTION 
          ======================= */}
      <section id="ai-features" className="py-20 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4" /> AI-Powered Dining
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
              Smart Technology for Smarter Restaurants
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              DineFlow doesn't just digitize your menu—it understands it. Our built-in AI tools act as your best waiter and smartest manager.
            </p>

            <div className="space-y-6">
              {[
                { title: "Dina: Your Conversational AI Waiter", desc: "Customers can type complex requests like 'I want something spicy, but my friend is vegan.' Dina understands the flavors, checks the live menu, and recommends the perfect dishes.", icon: <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" /> },
                { title: "Semantic Taste Recommendations", desc: "No more annoying popups. Our engine learns a customer's taste profile (e.g., spicy + meat) based on what they view and order, suggesting perfect add-ons automatically.", icon: <Star className="w-6 h-6 text-yellow-500" /> },
                { title: "Smart Context Memory", desc: "Dina remembers table context throughout the meal. If a guest asks 'Can I get another one of those?', she knows exactly what they ordered 10 minutes ago.", icon: <Cpu className="w-6 h-6 text-purple-600 dark:text-purple-400" /> },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="mt-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Visual Box (Matching the Screenshot aesthetic) */}
          <div className="flex-1 w-full bg-[#1A1C23] rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-gray-800">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-blue-500"></div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-purple-500/20 p-3 rounded-full">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">AI Insights Dashboard</h3>
                <p className="text-gray-400 text-sm">Real-time recommendations</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 font-medium">Peak Hours Today</span>
                  <span className="text-green-400 font-bold">7-9 PM</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2 mt-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-300 font-medium">Recommended Prep</span>
                  <span className="text-orange-400 font-bold">+15 Avocado Toast</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Based on Sunday brunch trends</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-300 font-medium">Popular Combo</span>
                  <span className="text-pink-400 font-bold">Burger + Fries + Drink</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Suggested to 42% of burger orders</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================
          PRICING SECTION 
          ======================= */}
      <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-950 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Transparent Pricing for India</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">No hidden charges. Start small and scale up as your restaurant grows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white dark:bg-[#1F1D2B] p-8 rounded-3xl border flex flex-col transition-all duration-300 ${
                  plan.popular ? "border-purple-500 shadow-xl scale-105 z-10" : "border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-800"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{plan.description}</p>
                <div className="flex items-baseline mb-8">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2 font-medium">{plan.period}</span>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      {feature.included ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 dark:text-gray-700 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-600"}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                <Link to={plan.name === "Enterprise" ? "/contact" : "/customer/register"}>
                  <button className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md"
                      : "bg-gray-100 dark:bg-[#252836] hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-900 dark:text-white border border-transparent dark:border-gray-700"
                  }`}>
                    {plan.cta}
                  </button>
                </Link>
                {plan.name === "Starter" && (
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
                    🎉 Free 14-day trial included
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =======================
          CTA SECTION 
          ======================= */}
      <section className="py-24 px-4 bg-gray-900 text-white border-y border-gray-800 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-20 h-20 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-8 border border-gray-700 shadow-xl">
            <Star className="w-10 h-10 text-yellow-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join successful restaurants across India using DineFlow to increase efficiency, boost revenue, and delight customers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/customer/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-10 py-4 rounded-2xl text-lg font-bold text-gray-900 bg-white hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2">
                Start Free 14-Day Trial
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/demo" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-10 py-4 rounded-2xl text-lg font-bold text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-all">
                Book a Personalized Demo
              </button>
            </Link>
          </div>
          <p className="mt-8 text-sm text-gray-400 font-medium">
            No credit card required • Set up in 10 minutes • Cancel anytime
          </p>
        </div>
      </section>

      {/* =======================
          FOOTER 
          ======================= */}
      <footer className="py-12 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <ChefHat className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">DineFlow</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-xs leading-relaxed">
                The all-in-one OS for modern Indian restaurants. Point of Sale, Smart KDS, QR Ordering, and Seamless UPI Payments.
              </p>
              <div className="flex gap-4">
                {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, idx) => (
                  <div key={idx} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:text-white dark:hover:bg-purple-600 cursor-pointer transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-sm tracking-wider">Product</h4>
              <ul className="space-y-3">
                {["Features", "AI Insights", "Pricing", "Hardware", "Integrations"].map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase().replace(' ', '-')}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase text-sm tracking-wider">Company</h4>
              <ul className="space-y-3">
                {["About Us", "Contact", "Privacy Policy", "Terms of Service"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} DineFlow Technologies. All rights reserved.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Made with ❤️ in India</p>
          </div>
        </div>
      </footer>
    </div>
  );
}