import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChefHat,
  QrCode,
  Zap,
  BarChart3,
  ArrowRight,
  Menu,
  X,
  CheckCircle2,
  Smartphone,
  CreditCard,
  Clock,
  Utensils,
  Sparkles,
  Users,
  LayoutDashboard,
  BellRing,
  Cloud,
  Shield,
  Cpu,
  TrendingUp,
  Star,
  Coffee,
  Pizza,
  Wine,
  MessageSquare,
  Quote,
  Award,
  Trophy,
  Heart,
  TrendingDown,
  DollarSign,
  ZapOff,
  Users as UsersIcon,
  Calendar,
  Globe,
  Target,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Gift,
  Sparkle,
} from "lucide-react";

import useTheme from "../../hooks/useTheme";


export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activePricing, setActivePricing] = useState(1); // Start with Professional plan
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });



  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mouse move effect for interactive elements
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Auto rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);



  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#workflow" },
    { name: "AI Features", href: "#ai-features" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Pricing", href: "#pricing" },
  ];

  const stats = [
    {
      value: "40%",
      label: "Faster Service",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      value: "25%",
      label: "Higher Revenue",
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      value: "90%",
      label: "Customer Satisfaction",
      icon: <Heart className="w-4 h-4" />,
    },
    {
      value: "50%",
      label: "Reduced Errors",
      icon: <TrendingDown className="w-4 h-4" />,
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Owner, The Golden Dragon",
      content:
        "DineFlow transformed our restaurant. Orders are 40% faster, and our staff loves the intuitive interface. Our revenue increased by 25% in just 3 months!",
      rating: 5,
      image: "SD",
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Miguel Rodriguez",
      role: "Head Chef, La Pasta Bella",
      content:
        "The kitchen display system is a game-changer. We've reduced order errors by 90% and our ticket times are down 30%. Our chefs can focus on cooking, not paperwork.",
      rating: 5,
      image: "MR",
      color: "from-orange-500 to-red-500",
    },
    {
      name: "Emily Johnson",
      role: "Operations Manager, Urban Bistro",
      content:
        "The AI insights helped us optimize our menu and reduce food waste by 35%. Customer satisfaction scores are through the roof since we implemented DineFlow.",
      rating: 5,
      image: "EJ",
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "David Kim",
      role: "CEO, Burger Junction Chain",
      content:
        "Across our 12 locations, DineFlow has standardized operations and given us real-time visibility. Our managers now make data-driven decisions daily.",
      rating: 5,
      image: "DK",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      description: "Perfect for small cafes & food trucks",
      price: "$49",
      period: "/month",
      features: [
        { text: "Up to 50 orders/day", included: true },
        { text: "Basic QR Ordering", included: true },
        { text: "Simple Kitchen Display", included: true },
        { text: "Manual Inventory", included: true },
        { text: "Email Support", included: true },
        { text: "AI Insights", included: false },
        { text: "Staff Management", included: false },
        { text: "Advanced Analytics", included: false },
      ],
      cta: "Start Free Trial",
      popular: false,
      color: "from-gray-400 to-gray-600",
    },
    {
      name: "Professional",
      description: "Best for restaurants & bistros",
      price: "$149",
      period: "/month",
      features: [
        { text: "Up to 300 orders/day", included: true },
        { text: "Advanced QR Ordering", included: true },
        { text: "Smart Kitchen Display", included: true },
        { text: "Automated Inventory", included: true },
        { text: "Priority Support", included: true },
        { text: "AI Insights", included: true },
        { text: "Staff Management", included: true },
        { text: "Advanced Analytics", included: true },
      ],
      cta: "Get Started",
      popular: true,
      color: "from-purple-500 to-blue-500",
    },
    {
      name: "Enterprise",
      description: "For restaurant chains & groups",
      price: "Custom",
      period: "",
      features: [
        { text: "Unlimited Orders", included: true },
        { text: "Custom QR Branding", included: true },
        { text: "Multi-location KDS", included: true },
        { text: "Predictive Inventory", included: true },
        { text: "24/7 Dedicated Support", included: true },
        { text: "Advanced AI Suite", included: true },
        { text: "Enterprise Management", included: true },
        { text: "Custom Analytics", included: true },
      ],
      cta: "Contact Sales",
      popular: false,
      color: "from-yellow-500 to-orange-500",
    },
  ];

  const companies = [
    { name: "Starbucks", logo: "☕" },
    { name: "McDonald's", logo: "🍟" },
    { name: "Pizza Hut", logo: "🍕" },
    { name: "Dominos", logo: "🔥" },
    { name: "KFC", logo: "🍗" },
    { name: "Burger King", logo: "👑" },
  ];

  return (
    <div className="min-h-screen font-body text-text bg-bg selection:bg-purple-500/30 overflow-x-hidden">
      {/* =======================
          BACKGROUND ANIMATIONS 
          ======================= */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-float-slow" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-float-slow-reverse" />
        <div className="absolute top-[40%] left-[20%] w-32 h-32 bg-orange-500/10 rounded-full blur-[60px] animate-float-delay-1" />
        <div className="absolute top-[20%] right-[15%] w-24 h-24 bg-green-500/5 rounded-full blur-[40px] animate-float-delay-2" />

        {/* Interactive particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* =======================
          NAVBAR 
          ======================= */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent ${
          isScrolled
            ? "glass py-3 shadow-sm border-gray-200/50 dark:border-white/5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md"
            : "bg-transparent py-4 md:py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group cursor-pointer select-none"
            >
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-purple-500/20 transform group-hover:rotate-12 transition-transform duration-300">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-brand font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-400">
                DineFlow
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 relative group px-1"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10 animate-pulse-glow"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>

              <Link to="/customer/register">
                <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-white gradient-primary shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all duration-300 ring-2 ring-transparent hover:ring-purple-300 dark:hover:ring-purple-900 animate-pulse-slow">
                  Get Started Free
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 text-gray-600 dark:text-gray-200 glass rounded-lg animate-pulse-glow"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 dark:text-gray-200 glass rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-white/10 absolute w-full left-0 animate-slide-up shadow-2xl z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
            <div className="px-4 pt-4 pb-6 space-y-4 flex flex-col">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-gray-800 dark:text-gray-200 py-3 border-b border-gray-100 dark:border-white/5 hover:text-purple-500 transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4">
                <Link
                  to="/customer/login"
                  className="w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <button className="w-full py-3 rounded-xl font-bold border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-gray-800 dark:text-white hover:scale-105 transform transition-transform">
                    Log In
                  </button>
                </Link>
                <Link
                  to="/customer/register"
                  className="w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <button className="w-full py-3 rounded-xl font-bold text-white gradient-primary shadow-lg hover:scale-105 transform transition-transform">
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
      <section className="relative pt-28 pb-16 lg:pt-40 lg:pb-24 px-4 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Text Content */}
        <div className="flex-1 text-center lg:text-left z-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm hover:shadow-md transition-shadow cursor-default group animate-bounce-subtle">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500 group-hover:scale-125 transition-transform"></span>
            </span>
            Loved by 10,000+ Restaurants Worldwide
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-heading font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-4 lg:mb-6 tracking-tight animate-shimmer">
            Transform Your Restaurant
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 animate-shimmer bg-[length:200%_auto]">
              Experience
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 lg:mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium animate-slide-up-delay-1">
            All-in-one platform for QR ordering, kitchen management, payments,
            and analytics. Designed to delight customers and empower staff.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 lg:mb-12 animate-slide-up-delay-2">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="glass p-4 rounded-2xl text-center hover:scale-105 transition-all duration-300 group hover:shadow-xl hover:shadow-purple-500/10 border border-transparent hover:border-purple-500/30"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-slide-up-delay-3">
            <Link to="/customer/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white gradient-primary shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group animate-pulse-slow">
                Start Free 14-Day Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </Link>
            <Link to="/demo" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-gray-700 dark:text-white glass hover:bg-white/60 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 transform">
                <span className="bg-gray-200 dark:bg-white/20 p-1 rounded-full group-hover:rotate-12 transition-transform">
                  <LayoutDashboard className="w-4 h-4" />
                </span>
                Live Demo
              </button>
            </Link>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="flex-1 relative z-10 w-full max-w-lg lg:max-w-xl animate-float-slow px-4 sm:px-0 mt-8 lg:mt-0">
          <div className="relative aspect-square">
            {/* Main Device Frame */}
            <div className="absolute inset-0 glass rounded-[2.5rem] border-8 border-white/80 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col z-20 transition-all duration-500 hover:shadow-purple-500/20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:scale-105 transform">
              {/* Status Bar */}
              <div className="h-12 px-6 flex items-center justify-between bg-white/80 dark:bg-black/30 backdrop-blur-sm border-b border-gray-100 dark:border-white/5">
                <div className="text-xs font-bold text-gray-800 dark:text-white">
                  12:30 PM
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse-glow"></div>
                  <div className="w-5 h-5 rounded-full gradient-primary opacity-90 animate-pulse-slow"></div>
                </div>
              </div>

              {/* App Content */}
              <div className="flex-1 p-4 md:p-6 relative bg-gradient-to-b from-gray-50/50 to-white dark:from-transparent dark:to-gray-900/50 overflow-hidden">
                {/* Floating Orders */}
                <div className="absolute top-4 left-4 glass p-3 rounded-2xl flex items-center gap-2 animate-float-delay-1 border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-900/20 hover:scale-110 transition-transform">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center animate-pulse-glow">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-800 dark:text-white">
                      Order #42
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Ready
                    </div>
                  </div>
                </div>

                {/* Live Orders List */}
                <div className="space-y-3 mt-16">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="glass p-4 rounded-2xl hover:scale-[1.02] transition-transform border border-gray-100 dark:border-white/5 hover:border-purple-500/30 animate-slide-up-delay-1"
                      style={{ animationDelay: `${item * 0.2}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${item === 1 ? "bg-orange-100 text-orange-600" : item === 2 ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"} hover:rotate-12 transition-transform`}
                          >
                            {item === 1 ? "🍕" : item === 2 ? "🥗" : "🍔"}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 dark:text-white text-sm">
                              Table {item + 3}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {item} item{item > 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-bold ${item === 1 ? "bg-orange-100 text-orange-700" : item === 2 ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"} animate-pulse-slow`}
                        >
                          {item === 1
                            ? "Cooking"
                            : item === 2
                              ? "Preparing"
                              : "Ready"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Navigation */}
                <div className="absolute bottom-4 left-4 right-4 glass p-2 rounded-2xl border border-white/20 bg-white/80 dark:bg-black/40 backdrop-blur-sm">
                  <div className="flex justify-around">
                    {["🏠", "📱", "📊", "👨‍🍳", "⚙️"].map((icon, i) => (
                      <button
                        key={i}
                        className={`p-2 rounded-xl transition-all duration-300 ${i === 1 ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:scale-110" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:scale-105"} transform`}
                      >
                        <span className="text-lg">{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -inset-10 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-full blur-3xl opacity-60 -z-10 animate-pulse-glow" />

            {/* Floating Features */}
            <div className="absolute -right-3 top-8 glass p-3 rounded-2xl shadow-xl animate-float-delay-1 flex items-center gap-2 border border-white/40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl transition-transform hover:scale-110 hover:rotate-3 max-w-[140px]">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl animate-bounce-subtle">
                <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-xs font-bold pr-2 text-gray-800 dark:text-gray-200">
                Scan to Order
              </div>
            </div>

            <div className="absolute -left-3 bottom-20 glass p-3 rounded-2xl shadow-xl animate-float-delay-2 flex items-center gap-2 border border-white/40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl transition-transform hover:scale-110 hover:-rotate-3 max-w-[140px]">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl animate-bounce-subtle-reverse">
                <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-xs font-bold pr-2 text-gray-800 dark:text-gray-200">
                Real-time Updates
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================
          FEATURES SECTION 
          ======================= */}
      <section
        id="features"
        className="py-16 lg:py-24 relative bg-gradient-to-b from-white/40 to-gray-50/50 dark:from-black/20 dark:to-gray-900/20 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-4 animate-pulse-glow">
              <Zap className="w-3 h-3 animate-pulse" />
              Powerful Features
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 dark:text-white mb-4">
              Everything Your Restaurant Needs
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From contactless ordering to smart kitchen management, we've got
              you covered
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: <QrCode className="w-6 h-6" />,
                title: "Contactless Ordering",
                desc: "Guests scan QR codes to order from their phones. No app downloads needed.",
                color: "from-blue-500 to-cyan-500",
                features: [
                  "QR code generation",
                  "Digital menu",
                  "Customizable orders",
                ],
              },
              {
                icon: <ChefHat className="w-6 h-6" />,
                title: "Kitchen Display System",
                desc: "Real-time order management for chefs. Reduce errors and improve efficiency.",
                color: "from-orange-500 to-red-500",
                features: [
                  "Order routing",
                  "Prep timers",
                  "Chef notifications",
                ],
              },
              {
                icon: <CreditCard className="w-6 h-6" />,
                title: "Smart Payments",
                desc: "Split bills, tips, and multiple payment methods in one seamless flow.",
                color: "from-purple-500 to-pink-500",
                features: [
                  "Contactless pay",
                  "Split bills",
                  "Digital receipts",
                ],
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Live Analytics",
                desc: "Real-time insights into sales, customer behavior, and menu performance.",
                color: "from-green-500 to-emerald-500",
                features: [
                  "Sales dashboard",
                  "Trend analysis",
                  "Performance metrics",
                ],
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Staff Management",
                desc: "Manage schedules, roles, and performance for your entire team.",
                color: "from-indigo-500 to-purple-500",
                features: [
                  "Shift scheduling",
                  "Role management",
                  "Performance tracking",
                ],
              },
              {
                icon: <Utensils className="w-6 h-6" />,
                title: "Inventory Control",
                desc: "Automated stock tracking with alerts for low inventory items.",
                color: "from-yellow-500 to-amber-500",
                features: [
                  "Stock alerts",
                  "Waste tracking",
                  "Supplier management",
                ],
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative glass p-6 lg:p-8 rounded-3xl border border-white/50 dark:border-white/5 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col h-full animate-slide-up-delay-2"
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 animate-pulse-slow`}
                >
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm mb-4 flex-grow">
                  {feature.desc}
                </p>
                <div className="space-y-2">
                  {feature.features.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 group/item hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3 text-green-500 group-hover/item:scale-125 transition-transform" />
                      <span className="group-hover/item:translate-x-1 transition-transform">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 h-1 w-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent group-hover:w-full transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =======================
          TESTIMONIALS SECTION 
          ======================= */}
      <section
        id="testimonials"
        className="py-16 lg:py-24 bg-gradient-to-b from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-black/50 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-20 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-500/20 text-yellow-600 dark:text-yellow-300 text-xs font-bold uppercase tracking-wider mb-4 animate-pulse-glow">
              <Star className="w-3 h-3" />
              Customer Stories
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 dark:text-white mb-4">
              Loved by Restaurant Owners
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See what restaurateurs are saying about their experience with
              DineFlow
            </p>
          </div>

          {/* Testimonials */}
          <div className="relative">
            {/* Testimonial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`glass p-8 rounded-3xl border transition-all duration-500 transform ${
                    activeTestimonial === index
                      ? "scale-105 border-purple-500/30 shadow-2xl shadow-purple-500/20"
                      : "scale-95 border-white/50 dark:border-white/5 opacity-90 hover:opacity-100"
                  }`}
                  onMouseEnter={() => setActiveTestimonial(index)}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-bold text-xl shadow-lg animate-pulse-slow`}
                    >
                      {testimonial.image}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        {testimonial.role}
                      </p>
                      <div className="flex gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400 animate-bounce-subtle"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                    </div>
                    <Quote className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                </div>
              ))}
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center items-center gap-3 mb-12">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeTestimonial === index
                      ? "bg-purple-500 scale-125"
                      : "bg-gray-300 dark:bg-gray-700 hover:scale-110"
                  }`}
                />
              ))}
            </div>

            {/* Achievement Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  value: "10K+",
                  label: "Restaurants",
                  icon: <ChefHat className="w-6 h-6" />,
                  color: "bg-blue-500",
                },
                {
                  value: "2M+",
                  label: "Orders Daily",
                  icon: <Coffee className="w-6 h-6" />,
                  color: "bg-green-500",
                },
                {
                  value: "99%",
                  label: "Satisfaction",
                  icon: <Heart className="w-6 h-6" />,
                  color: "bg-pink-500",
                },
                {
                  value: "24/7",
                  label: "Support",
                  icon: <ShieldCheck className="w-6 h-6" />,
                  color: "bg-purple-500",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="glass p-6 rounded-2xl text-center hover:scale-105 transition-transform duration-300 animate-slide-up-delay-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg animate-pulse-slow`}
                  >
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =======================
          WORKFLOW SECTION 
          ======================= */}
      <section
        id="workflow"
        className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black border-y border-gray-200 dark:border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-20 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-500/20 text-green-600 dark:text-green-300 text-xs font-bold uppercase tracking-wider mb-4 animate-pulse-glow">
              <Clock className="w-3 h-3 animate-spin-slow" />
              Simple Process
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 dark:text-white mb-4">
              From Order to Kitchen in Seconds
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A seamless workflow that delights customers and empowers your
              staff
            </p>
          </div>

          <div className="relative">
            {/* Mobile Steps */}
            <div className="md:hidden space-y-8">
              {[
                {
                  step: "1",
                  title: "Scan & Browse",
                  desc: "Guests scan QR code to view digital menu",
                  icon: <QrCode className="w-6 h-6" />,
                  color: "bg-blue-500",
                },
                {
                  step: "2",
                  title: "Place Order",
                  desc: "Customize items and submit order instantly",
                  icon: <Smartphone className="w-6 h-6" />,
                  color: "bg-purple-500",
                },
                {
                  step: "3",
                  title: "Kitchen Prep",
                  desc: "Order appears on kitchen display system",
                  icon: <ChefHat className="w-6 h-6" />,
                  color: "bg-orange-500",
                },
                {
                  step: "4",
                  title: "Serve & Pay",
                  desc: "Food served, bill settled digitally",
                  icon: <CreditCard className="w-6 h-6" />,
                  color: "bg-green-500",
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 glass p-6 rounded-3xl hover:scale-105 transition-transform duration-300 animate-slide-up-delay-2"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div
                    className={`${step.color} text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg animate-pulse-slow hover:rotate-12 transition-transform`}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Timeline */}
            <div className="hidden md:block relative">
              <div className="absolute top-12 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 opacity-20 z-0 animate-pulse-glow"></div>

              <div className="grid grid-cols-4 gap-8 relative z-10">
                {[
                  {
                    title: "Scan & Browse",
                    desc: "Guests scan QR code to view digital menu",
                    icon: <QrCode className="w-8 h-8" />,
                  },
                  {
                    title: "Place Order",
                    desc: "Customize items and submit order instantly",
                    icon: <Smartphone className="w-8 h-8" />,
                  },
                  {
                    title: "Kitchen Prep",
                    desc: "Order appears on kitchen display system",
                    icon: <ChefHat className="w-8 h-8" />,
                  },
                  {
                    title: "Serve & Pay",
                    desc: "Food served, bill settled digitally",
                    icon: <CreditCard className="w-8 h-8" />,
                  },
                ].map((step, index) => (
                  <div
                    key={index}
                    className="text-center group animate-slide-up-delay-2"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-white/5 flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 relative hover:rotate-3">
                      {step.icon}
                      <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm shadow-lg animate-pulse-slow">
                        {index + 1}
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm group-hover:translate-y-1 transition-transform">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================
          AI FEATURES SECTION 
          ======================= */}
      <section
        id="ai-features"
        className="py-16 lg:py-24 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 text-left animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse-glow">
                <Sparkles className="w-3 h-3 animate-spin-slow" />
                AI-Powered Insights
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 dark:text-white mb-6">
                Smart Technology for
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 animate-shimmer bg-[length:200%_auto]">
                  Smarter Restaurants
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Our AI analyzes your data to provide actionable insights that
                boost efficiency and revenue
              </p>

              <div className="space-y-6">
                {[
                  {
                    title: "Demand Forecasting",
                    desc: "Predict busy hours and ingredient needs to minimize waste",
                    icon: <TrendingUp className="w-5 h-5" />,
                  },
                  {
                    title: "Smart Recommendations",
                    desc: "Suggest add-ons and combos based on customer preferences",
                    icon: <Star className="w-5 h-5" />,
                  },
                  {
                    title: "Kitchen Optimization",
                    desc: "Automatically balance chef workload for faster service",
                    icon: <Cpu className="w-5 h-5" />,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-white/5 group hover:scale-105 transform animate-slide-up-delay-2"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0 shadow-lg group-hover:rotate-12 transition-transform animate-pulse-slow">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 relative w-full">
              <div className="relative glass rounded-3xl p-3 border border-white/20 shadow-2xl animate-float-slow bg-white/30 dark:bg-white/5 hover:scale-105 transition-transform duration-300">
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-pulse-glow">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">
                        AI Insights Dashboard
                      </h4>
                      <p className="text-gray-400 text-sm">
                        Real-time recommendations
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="glass p-4 rounded-xl hover:scale-105 transition-transform">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300 text-sm">
                          Peak Hours Today
                        </span>
                        <span className="text-green-400 text-sm font-bold animate-pulse">
                          7-9 PM
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-progress"
                          style={{ width: "85%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="glass p-4 rounded-xl hover:scale-105 transition-transform">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300 text-sm">
                          Recommended Prep
                        </span>
                        <span className="text-orange-400 text-sm font-bold animate-pulse">
                          +15 Avocado Toast
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Based on Sunday brunch trends
                      </div>
                    </div>

                    <div className="glass p-4 rounded-xl hover:scale-105 transition-transform">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300 text-sm">
                          Popular Combo
                        </span>
                        <span className="text-pink-400 text-sm font-bold animate-pulse">
                          Burger + Fries + Drink
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Suggested to 42% of burger orders
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================
          PRICING SECTION 
          ======================= */}
      <section
        id="pricing"
        className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-20 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4 animate-pulse-glow">
              <DollarSign className="w-3 h-3" />
              Simple Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 dark:text-white mb-4">
              Plans That Grow With You
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Start small, scale big. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative glass p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular
                    ? "scale-105 border-purple-500/30 shadow-2xl shadow-purple-500/20 md:mt-0 mt-0"
                    : "border-white/50 dark:border-white/5 hover:border-purple-500/20"
                } animate-slide-up-delay-2`}
                style={{ animationDelay: `${index * 0.2}s` }}
                onMouseEnter={() => setActivePricing(index)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold animate-bounce-subtle">
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {plan.description}
                  </p>
                  <div className="mt-6 flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          feature.included
                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                        }`}
                      >
                        {feature.included ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                      </div>
                      <span
                        className={`text-sm ${feature.included ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-600"}`}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  to={
                    plan.name === "Enterprise"
                      ? "/contact"
                      : "/customer/register"
                  }
                >
                  <button
                    className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
                      plan.popular
                        ? "gradient-primary text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </Link>

                {plan.name === "Starter" && (
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
                    🎉 Free 14-day trial included
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Pricing FAQ */}
          <div className="mt-20 max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  q: "Can I switch plans later?",
                  a: "Yes, you can upgrade or downgrade anytime. Changes take effect immediately.",
                },
                {
                  q: "Is there a setup fee?",
                  a: "No setup fees. Start with your free trial and only pay when you're ready.",
                },
                {
                  q: "Do you offer discounts for annual plans?",
                  a: "Yes! Save 20% when you pay annually. Contact sales for custom enterprise discounts.",
                },
                {
                  q: "What support is included?",
                  a: "All plans include email support. Professional and Enterprise include priority phone and chat support.",
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="glass p-6 rounded-2xl hover:scale-105 transition-transform duration-300 animate-slide-up-delay-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                    {faq.q}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =======================
          CTA SECTION 
          ======================= */}
      <section className="py-16 lg:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 -z-20"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 -z-10 mix-blend-overlay"></div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto glass rounded-full flex items-center justify-center mb-8 animate-float-slow shadow-2xl border border-white/20 bg-white/10 backdrop-blur-md hover:rotate-180 transition-transform duration-500">
            <Star className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-300" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white mb-4 lg:mb-6 tracking-tight drop-shadow-lg animate-shimmer">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-lg sm:text-xl text-purple-100 mb-8 lg:mb-12 max-w-2xl mx-auto font-medium leading-relaxed animate-slide-up-delay-1">
            Join thousands of successful restaurants using DineFlow to increase
            efficiency, boost revenue, and delight customers
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up-delay-2">
            <Link to="/customer/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold text-purple-900 bg-white hover:bg-gray-50 transition-all shadow-2xl hover:scale-105 hover:shadow-white/20 transform duration-200 flex items-center justify-center gap-2 group animate-pulse-glow">
                Start Free 14-Day Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </Link>
            <Link to="/demo" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold text-white border border-white/30 hover:bg-white/10 transition-colors backdrop-blur-sm hover:scale-105 transform">
                Book a Personalized Demo
              </button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-purple-200/60 font-medium animate-pulse">
            No credit card required • No setup fees • Cancel anytime
          </p>
        </div>
      </section>

      {/* =======================
          FOOTER 
          ======================= */}
      <footer className="py-12 lg:py-16 border-t border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center gap-3 mb-6 animate-slide-up">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md hover:rotate-12 transition-transform duration-300">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-brand font-bold text-gray-900 dark:text-white">
                  DineFlow
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 max-w-md animate-slide-up-delay-1">
                The all-in-one restaurant management platform that helps you
                deliver exceptional dining experiences while growing your
                business.
              </p>
              <div className="flex gap-4 animate-slide-up-delay-2">
                {[
                  {
                    icon: <Twitter className="w-5 h-5" />,
                    label: "Twitter",
                    color: "hover:bg-blue-500",
                  },
                  {
                    icon: <Facebook className="w-5 h-5" />,
                    label: "Facebook",
                    color: "hover:bg-blue-700",
                  },
                  {
                    icon: <Instagram className="w-5 h-5" />,
                    label: "Instagram",
                    color: "hover:bg-pink-600",
                  },
                  {
                    icon: <Linkedin className="w-5 h-5" />,
                    label: "LinkedIn",
                    color: "hover:bg-blue-600",
                  },
                  {
                    icon: <Youtube className="w-5 h-5" />,
                    label: "YouTube",
                    color: "hover:bg-red-600",
                  },
                ].map((social, index) => (
                  <div
                    key={index}
                    className="w-10 h-10 rounded-lg glass flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-white transition-all cursor-pointer hover:scale-110 transform ${social.color}"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {social.icon}
                  </div>
                ))}
              </div>
            </div>

            {[
              {
                title: "Product",
                links: [
                  "Features",
                  "AI Insights",
                  "Pricing",
                  "Integrations",
                  "API",
                ],
              },
              {
                title: "Resources",
                links: [
                  "Blog",
                  "Help Center",
                  "Guides",
                  "Case Studies",
                  "Status",
                ],
              },
              {
                title: "Company",
                links: ["About", "Careers", "Partners", "Contact", "Security"],
              },
            ].map((section, index) => (
              <div
                key={index}
                className="animate-slide-up-delay-2"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <h4 className="font-bold text-gray-900 dark:text-white mb-6 text-sm uppercase tracking-wider">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href="#"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors hover:translate-x-1 inline-block transform"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 animate-slide-up-delay-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} DineFlow. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
              <a
                href="#"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors hover:scale-110 inline-block transform"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors hover:scale-110 inline-block transform"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors hover:scale-110 inline-block transform"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
