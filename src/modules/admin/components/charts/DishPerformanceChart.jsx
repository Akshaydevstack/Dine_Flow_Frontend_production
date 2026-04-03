import React, { useMemo, useCallback, memo, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Trophy, TrendingUp, IndianRupee, CalendarDays, X } from "lucide-react";
import {
  fetchTopDishes,
  selectTopDishes,
  selectTopDishesLoading,
} from "../../../../store/slices/restaurantAdminSlice/adminChartSlice";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const MEDAL_STYLES = [
  "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300",
  "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  "bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400",
  "bg-indigo-100 text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400",
];

const BAR_COLORS = ["#fbbf24", "#94a3b8", "#cd7f32", "#3b82f6", "#6366f1"];

function getTodayIST() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

// ─── Stable sub-components ───────────────────────────────────────────────────

const StatsBar = memo(({ count, totalQty, totalRevenue }) => (
  <div className="flex-none grid grid-cols-3 px-4 py-3 bg-gray-50/50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
    <div className="text-center">
      <p className="text-[9px] uppercase text-gray-400 font-bold">Dishes</p>
      <p className="text-sm font-black text-orange-500 leading-tight">{count}</p>
    </div>
    <div className="text-center border-l border-gray-200 dark:border-gray-700">
      <p className="text-[9px] uppercase text-gray-400 font-bold">Units Sold</p>
      <p className="text-sm font-black text-blue-500 leading-tight">{totalQty}</p>
    </div>
    <div className="text-center border-l border-gray-200 dark:border-gray-700">
      <p className="text-[9px] uppercase text-gray-400 font-bold">Revenue</p>
      <div className="flex items-center justify-center text-emerald-500">
        <IndianRupee size={10} className="mt-0.5" />
        <p className="text-sm font-black leading-tight">{totalRevenue.toLocaleString("en-IN")}</p>
      </div>
    </div>
  </div>
));

const DateFilterBar = memo(({ selectedDate, today, onChange, onClear }) => (
  <div className="flex-none px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
    <CalendarDays size={12} className="text-gray-400 flex-shrink-0" />
    {selectedDate ? (
      <span className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
        {selectedDate}
        <button
          onClick={onClear}
          title="Clear — show all-time"
          className="hover:opacity-70 transition-opacity"
        >
          <X size={10} />
        </button>
      </span>
    ) : (
      <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">
        All time
      </span>
    )}
    <input
      type="date"
      max={today}
      value={selectedDate}
      onChange={onChange}
      className="ml-auto text-[11px] font-semibold text-gray-600 dark:text-gray-300
        bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700
        rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-orange-400 cursor-pointer"
    />
  </div>
));

const RankingList = memo(({ dishes, selectedDate }) => {
  if (dishes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <p className="text-2xl">📭</p>
        <p className="text-[11px] text-gray-400 font-semibold">
          No data{selectedDate ? ` for ${selectedDate}` : ""}
        </p>
      </div>
    );
  }
  return dishes.map((dish, idx) => (
    <div
      key={dish.dish_id}
      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50"
    >
      <div className="flex items-center gap-3">
        <span
          className={`text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-lg ${
            MEDAL_STYLES[idx] ?? MEDAL_STYLES[4]
          }`}
        >
          {idx + 1}
        </span>
        <div>
          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
            {dish.dish_name}
          </p>
          <p className="text-[9px] text-slate-400 font-bold uppercase">
            Qty: {dish.total_quantity}
          </p>
        </div>
      </div>
      <div className="text-right flex flex-col items-end">
        <div className="flex items-center text-emerald-600 dark:text-emerald-400">
          <IndianRupee size={10} />
          <span className="text-xs font-black">
            {dish.total_revenue.toLocaleString("en-IN")}
          </span>
        </div>
        <span className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">
          Revenue
        </span>
      </div>
    </div>
  ));
});

// ─── Main component ──────────────────────────────────────────────────────────

const DishPerformanceChart = memo(() => {
  const dispatch = useDispatch();
  const data    = useSelector(selectTopDishes);
  const loading = useSelector(selectTopDishesLoading);

  const today = useRef(getTodayIST()).current;
  const [selectedDate, setSelectedDate] = useState("");

  // On mount → fetch all-time (no date)
  // On date change → fetch for that specific date
  // On clear → selectedDate becomes "" → fetch all-time again
  useEffect(() => {
    dispatch(fetchTopDishes(selectedDate || null));
  }, [dispatch, selectedDate]);

  const handleDateChange = useCallback((e) => {
    setSelectedDate(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedDate("");
  }, []);

  const dishes = data?.top_5_dishes || [];

  // ── Chart ─────────────────────────────────────────────────
  const chartData = useMemo(
    () => ({
      labels: dishes.map((d) => d.dish_name),
      datasets: [
        {
          label: "Quantity Sold",
          data: dishes.map((d) => d.total_quantity),
          backgroundColor: BAR_COLORS.slice(0, dishes.length),
          borderRadius: 6,
          barThickness: 18,
        },
      ],
    }),
    [dishes]
  );

  const options = useMemo(
    () => ({
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600, easing: "easeInOutCubic" },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e293b",
          padding: 12,
          cornerRadius: 8,
          callbacks: { label: (ctx) => ` Sold: ${ctx.raw} units` },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#94a3b8", font: { size: 10 } },
        },
        y: {
          grid: { display: false },
          ticks: { color: "#94a3b8", font: { size: 10, weight: "bold" } },
        },
      },
    }),
    []
  );

  // ── Derived stats ─────────────────────────────────────────
  const totalRevenue = useMemo(
    () => dishes.reduce((sum, d) => sum + (d.total_revenue || 0), 0),
    [dishes]
  );
  const totalQty = useMemo(
    () => dishes.reduce((sum, d) => sum + (d.total_quantity || 0), 0),
    [dishes]
  );

  // Full-page loader only on very first mount with no data yet
  if (loading && !data) {
    return (
      <div className="h-full flex items-center justify-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-[10px]">
        Calculating Top Sellers...
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-gray-900 transition-all">

      {/* ── HEADER ── */}
      <div className="flex-none p-4 border-b border-gray-100 dark:border-gray-800 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex-shrink-0">
          <TrendingUp size={16} />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 dark:text-white leading-none flex items-center gap-2">
            Dish Performance
            <Trophy size={13} className="text-amber-400" />
          </h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-semibold">
            {selectedDate ? `Top sellers · ${selectedDate}` : "All-time top sellers"}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">
            Ranks your best-performing dishes by quantity sold and 
            filter by date or view all-time performance.
          </p>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <StatsBar count={dishes.length} totalQty={totalQty} totalRevenue={totalRevenue} />

      {/* ── DATE FILTER ── */}
      <DateFilterBar
        selectedDate={selectedDate}
        today={today}
        onChange={handleDateChange}
        onClear={handleClear}
      />

      {/* ── CHART (always mounted, loading overlay so no flicker) ── */}
      <div className="flex-none h-[150px] px-4 pt-3 relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center
                          bg-white/40 dark:bg-gray-900/50 rounded-xl backdrop-blur-[2px]
                          text-gray-400 text-[10px] uppercase font-bold tracking-widest">
            Loading...
          </div>
        )}
        <Bar data={chartData} options={options} />
      </div>

      {/* ── RANKING LIST ── */}
      <div
        className="flex-1 overflow-y-auto px-4 pb-4 pt-3 space-y-2 min-h-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <RankingList dishes={dishes} selectedDate={selectedDate} />
      </div>

    </div>
  );
});

export default DishPerformanceChart;