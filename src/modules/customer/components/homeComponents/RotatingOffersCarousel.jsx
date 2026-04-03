import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";


export default function RotatingOffersCarousel() {
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  // AUTO-ROTATE OFFERS
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % rotatingOffers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // STATIC DATA
  const rotatingOffers = [
    {
      title: "Chef's Special",
      desc: "Seasonal tasting menu with fresh ingredients",
      icon: "👨‍🍳",
      color: "from-orange-500 to-red-500",
      buttonText: "Explore",
    },
    {
      title: "Express Delivery",
      desc: "Get your order in 30 mins or it's free!",
      icon: "⚡",
      color: "from-green-500 to-emerald-500",
      buttonText: "Order Now",
    },
    {
      title: "Sommelier's Selection",
      desc: "Premium wine tasting with artisanal pairings",
      icon: "🍷",
      color: "from-purple-500 to-blue-500",
      buttonText: "Book Now",
    },
    {
      title: "Family Feast",
      desc: "30% off on orders above ₹1500",
      icon: "👨‍👩‍👧‍👦",
      color: "from-pink-500 to-rose-500",
      buttonText: "Grab Deal",
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Special Offers
        </h2>
        <div className="flex gap-1">
          {rotatingOffers.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentOfferIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentOfferIndex
                  ? "bg-purple-600 w-4"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative h-48 rounded-2xl overflow-hidden shadow-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentOfferIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`absolute inset-0 bg-gradient-to-br ${rotatingOffers[currentOfferIndex].color} p-6 text-white`}
          >
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-3">
                  <Sparkles className="w-4 h-4" /> Limited Time
                </div>
                <h2 className="text-xl font-bold mb-2">
                  {rotatingOffers[currentOfferIndex].title}
                </h2>
                <p className="text-white/90 text-sm">
                  {rotatingOffers[currentOfferIndex].desc}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <button className="px-6 py-2.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-white/30 transition-colors">
                  {rotatingOffers[currentOfferIndex].buttonText}
                </button>
                <div className="text-5xl opacity-20">
                  {rotatingOffers[currentOfferIndex].icon}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
