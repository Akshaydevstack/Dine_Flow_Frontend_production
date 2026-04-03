import React, { useMemo, memo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Utensils } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MenuDistributionChart = memo(({ data, loading }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { labels: [], datasets: [] };

    return {
      labels: data.map((item) => item.category_name),
      datasets: [
        {
          label: "Dish Count",
          data: data.map((item) => item.dish_count),
          backgroundColor: [
            "rgba(245, 158, 11, 0.8)",  // Amber
            "rgba(59, 130, 246, 0.8)",  // Blue
            "rgba(16, 185, 129, 0.8)",  // Emerald
            "rgba(139, 92, 246, 0.8)",  // Violet
            "rgba(99, 102, 241, 0.8)",  // Indigo
          ],
          borderColor: [
            "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#6366f1",
          ],
          borderWidth: 1,
          borderRadius: 8,
          barThickness: 30,
        },
      ],
    };
  }, [data]);

  const options = useMemo(
    () => ({
      indexAxis: "x",
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e293b",
          padding: 12,
          cornerRadius: 10,
          titleFont: { size: 12, weight: "bold" },
          bodyFont: { size: 12 },
          callbacks: {
            label: (context) => ` ${context.raw} Dishes`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#94a3b8",
            font: { size: 10, weight: "600" },
            autoSkip: false,
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(156, 163, 175, 0.1)", drawBorder: false },
          ticks: {
            color: "#94a3b8",
            font: { size: 11, weight: "bold" },
            stepSize: 1,
          },
        },
      },
    }),
    []
  );

  // Derive summary stats for the footer
  const totalDishes = useMemo(
    () => (data || []).reduce((sum, item) => sum + item.dish_count, 0),
    [data]
  );
  const topCategory = useMemo(
    () =>
      data && data.length > 0
        ? data.reduce((max, item) =>
            item.dish_count > max.dish_count ? item : max
          )
        : null,
    [data]
  );

  if (loading && (!data || data.length === 0)) {
    return (
      <div className="h-full flex items-center justify-center animate-pulse text-slate-400 font-bold uppercase tracking-tighter">
        SYNCING MENU...
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-gray-900 transition-all">

      {/* ── HEADER ── */}
      <div className="flex-none p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400">
            <Utensils size={16} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white leading-none">
              Menu Composition
            </h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-semibold">
              Dishes per category
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 ">
              Breakdown of how your menu items are distributed across each category 
            </p>
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="flex-none grid grid-cols-2 gap-2 px-4 py-3 bg-gray-50/50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <p className="text-[9px] uppercase text-gray-400 font-bold">
            Total Dishes
          </p>
          <p className="text-sm font-black text-amber-500 leading-tight">
            {totalDishes}
          </p>
        </div>
        <div className="text-center border-l border-gray-200 dark:border-gray-700">
          <p className="text-[9px] uppercase text-gray-400 font-bold">
            Top Category
          </p>
          <p className="text-sm font-black text-blue-500 leading-tight truncate px-1">
            {topCategory ? topCategory.category_name : "—"}
          </p>
        </div>
      </div>

      {/* ── CHART ── */}
      <div className="flex-1 min-h-0 p-4">
        <Bar data={chartData} options={options} />
      </div>

      {/* ── LEGEND WITH COUNTS ── */}
      <div className="flex-none p-2 px-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-x-4 gap-y-1">
        {(data || []).map((item, index) => {
          const colors = [
            "bg-amber-400",
            "bg-blue-400",
            "bg-emerald-400",
            "bg-violet-400",
            "bg-indigo-400",
          ];
          const textColors = [
            "text-amber-500",
            "text-blue-500",
            "text-emerald-500",
            "text-violet-500",
            "text-indigo-500",
          ];
          return (
            <div
              key={item.category_name}
              className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-tighter text-gray-400"
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${colors[index % colors.length]}`}
              />
              {item.category_name}
              <span className={`ml-0.5 ${textColors[index % textColors.length]}`}>
                {item.dish_count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default MenuDistributionChart;