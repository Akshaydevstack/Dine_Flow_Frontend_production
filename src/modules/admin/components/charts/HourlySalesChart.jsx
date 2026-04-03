import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import {
  fetchHourlySales,
  selectHourlySales,
  selectHourlySalesLoading,
} from "../../../../store/slices/restaurantAdminSlice/adminChartSlice";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTodayIST() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function utcToIST(hourStr) {
  const utcHour = parseInt(hourStr.split(":")[0], 10);
  const totalMins = utcHour * 60 + 330;
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatTime(isoStr) {
  return new Date(isoStr).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HourlySalesChart() {
  const dispatch = useDispatch();
  const hourlySales = useSelector(selectHourlySales);
  const loading = useSelector(selectHourlySalesLoading);
  const [selectedDate, setSelectedDate] = useState(getTodayIST);
  const [selectedHour, setSelectedHour] = useState(null); // which hour's orders to show
  const chartRef = useRef(null);

  useEffect(() => {
    dispatch(fetchHourlySales(selectedDate));
    setSelectedHour(null); // reset drawer on date change
  }, [dispatch, selectedDate]);

  useEffect(() => {
    if (chartRef.current && !loading) {
      chartRef.current.update("active");
    }
  }, [hourlySales, loading]);

  const chartData =
    hourlySales?.hourly_sales?.map((e) => ({
      hour: utcToIST(e.hour),
      orders: e.orders,
      revenue: e.sales,
      order_details: e.order_details ?? [],
      utcHour: e.hour, // keep original for lookup
    })) ?? [];

  const totals = hourlySales?.daily_totals;
  const hasData = chartData.length > 0;

  // The selected hour's order details
  const selectedSlot = chartData.find((d) => d.hour === selectedHour);

  // ── Chart.js click handler — select hour on point click ──────────────────
  const handleChartClick = (_, elements) => {
    if (elements.length > 0) {
      const idx = elements[0].index;
      const clickedHour = chartData[idx]?.hour;
      setSelectedHour((prev) => (prev === clickedHour ? null : clickedHour));
    }
  };

  const data = {
    labels: chartData.map((d) => d.hour),
    datasets: [
      {
        label: "Orders",
        data: chartData.map((d) => d.orders),
        borderColor: "#facc15",
        backgroundColor: (ctx) => {
          const { ctx: c, chartArea } = ctx.chart;
          if (!chartArea) return "transparent";
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, "rgba(250,204,21,0.45)");
          g.addColorStop(1, "rgba(250,204,21,0.02)");
          return g;
        },
        borderWidth: 2.5,
        pointBackgroundColor: (ctx) =>
          chartData[ctx.dataIndex]?.hour === selectedHour ? "#fff" : "#facc15",
        pointBorderColor: (ctx) =>
          chartData[ctx.dataIndex]?.hour === selectedHour ? "#facc15" : "#1f2937",
        pointBorderWidth: (ctx) =>
          chartData[ctx.dataIndex]?.hour === selectedHour ? 3 : 2,
        pointRadius: (ctx) =>
          chartData[ctx.dataIndex]?.hour === selectedHour ? 8 : 5,
        pointHoverRadius: 8,
        fill: "origin",
        tension: 0.4,
        yAxisID: "yOrders",
        order: 2,
      },
      {
        label: "Revenue (₹)",
        data: chartData.map((d) => d.revenue),
        borderColor: "#34d399",
        backgroundColor: (ctx) => {
          const { ctx: c, chartArea } = ctx.chart;
          if (!chartArea) return "transparent";
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, "rgba(52,211,153,0.45)");
          g.addColorStop(1, "rgba(52,211,153,0.02)");
          return g;
        },
        borderWidth: 2.5,
        pointBackgroundColor: (ctx) =>
          chartData[ctx.dataIndex]?.hour === selectedHour ? "#fff" : "#34d399",
        pointBorderColor: (ctx) =>
          chartData[ctx.dataIndex]?.hour === selectedHour ? "#34d399" : "#1f2937",
        pointBorderWidth: (ctx) =>
          chartData[ctx.dataIndex]?.hour === selectedHour ? 3 : 2,
        pointRadius: (ctx) =>
          chartData[ctx.dataIndex]?.hour === selectedHour ? 8 : 5,
        pointHoverRadius: 8,
        fill: "origin",
        tension: 0.4,
        yAxisID: "yRevenue",
        order: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900, easing: "easeInOutCubic" },
    onClick: handleChartClick,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          color: "#9ca3af",
          font: { size: 12 },
          usePointStyle: true,
          pointStyleWidth: 8,
          boxHeight: 8,
        },
      },
      tooltip: {
        backgroundColor: "rgba(17,24,39,0.95)",
        titleColor: "#facc15",
        bodyColor: "#e5e7eb",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) =>
            ctx.dataset.label === "Revenue (₹)"
              ? ` Revenue: ₹${Number(ctx.parsed.y).toLocaleString("en-IN")}`
              : ` Orders: ${ctx.parsed.y}`,
          afterBody: () => ["", "  Click point to see order details"],
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(55,65,81,0.4)" },
        ticks: { color: "#9ca3af", font: { size: 11 } },
      },
      yOrders: {
        type: "linear",
        position: "left",
        grid: { color: "rgba(55,65,81,0.4)" },
        ticks: { color: "#facc15", font: { size: 10 }, stepSize: 1 },
        title: { display: true, text: "Orders", color: "#facc15", font: { size: 11 } },
      },
      yRevenue: {
        type: "linear",
        position: "right",
        grid: { drawOnChartArea: false },
        ticks: {
          color: "#34d399",
          font: { size: 10 },
          callback: (v) => `₹${v.toLocaleString("en-IN")}`,
        },
        title: { display: true, text: "Revenue (₹)", color: "#34d399", font: { size: 11 } },
      },
    },
  };

  return (
    <div className="flex flex-col h-full p-5 gap-3 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap flex-shrink-0">
        <div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">
            Hourly Sales
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Revenue & order volume by IST hour · paid orders only
          </p>
        </div>
        <input
          type="date"
          value={selectedDate}
          max={getTodayIST()}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200
                     focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
        />
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-3 flex-shrink-0">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Orders</p>
          <p className="text-lg font-bold text-yellow-500">{totals?.orders ?? "—"}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
          <p className="text-lg font-bold text-emerald-500">
            {totals ? `₹${Number(totals.revenue).toLocaleString("en-IN")}` : "—"}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Avg Order</p>
          <p className="text-lg font-bold text-blue-400">
            {totals ? `₹${Number(totals.avgOrderValue).toLocaleString("en-IN")}` : "—"}
          </p>
        </div>
      </div>

      {/* ── Chart ── */}
      <div
        className="relative flex-shrink-0 transition-all duration-500 ease-in-out"
        style={{ height: selectedHour ? "35%" : "55%" }}
      >
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center
                          bg-white/40 dark:bg-gray-900/50 rounded-xl backdrop-blur-[2px]
                          text-gray-400 text-sm">
            Loading…
          </div>
        )}
        {!loading && !hasData && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-gray-400 text-sm">No paid orders on this date</p>
          </div>
        )}
        <Line ref={chartRef} data={data} options={options} />
      </div>

      {/* ── Explanation + click hint — toggles between two states ── */}
      <div className="flex-shrink-0 transition-all duration-500 ease-in-out">
        {!selectedHour ? (
          /* shown when nothing is selected */
          <div className="flex flex-col gap-2">

            {/* Click hint */}
            {hasData && (
              <button
                onClick={() => {
                  // auto-select the first (or peak) hour as a demo click
                  const peak = chartData.reduce((a, b) => b.orders > a.orders ? b : a);
                  setSelectedHour(peak.hour);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl
                           border border-dashed border-gray-300 dark:border-gray-700
                           text-gray-400 dark:text-gray-500 text-xs
                           hover:border-yellow-400/50 hover:text-yellow-500
                           transition-all duration-200 group"
              >
                <span className="text-base group-hover:scale-110 transition-transform">
                  👆
                </span>
                <span>
                  Click any point on the chart to drill into orders for that hour
                </span>
                <span className="ml-auto text-[10px] bg-gray-100 dark:bg-gray-800
                                 px-2 py-0.5 rounded-full text-gray-400">
                  or click here for peak hour
                </span>
              </button>
            )}

            {/* Legend explanation */}
            <div className="flex items-start gap-4 px-1">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-3 h-0.5 rounded-full bg-yellow-400 inline-block" />
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  Orders — number of paid orders placed in that hour
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-3 h-0.5 rounded-full bg-emerald-400 inline-block" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  Revenue — total ₹ collected in that hour
                </span>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 dark:text-gray-600 px-1 leading-relaxed">
              Each point represents one hour of the day (IST). A high order count with low revenue
              means small tickets — a low count with high revenue means big orders.
              Use this to spot your busiest and most profitable windows.
            </p>
          </div>
        ) : (
          /* shown when an hour is selected — compact context strip */
          <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] text-gray-400">
              Showing orders paid between
            </span>
            <span className="text-[10px] font-bold text-yellow-500 bg-yellow-400/10
                             px-2 py-0.5 rounded-full border border-yellow-400/20">
              {selectedHour} – {(() => {
                const [h, m] = selectedHour.split(":").map(Number);
                const next = (h + 1) % 24;
                return `${String(next).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
              })()} IST
            </span>
            <span className="text-[10px] text-gray-400">·</span>
            <span className="text-[10px] text-gray-400">
              click another point to switch hours
            </span>
          </div>
        )}
      </div>

      {/* ── Order Details Drawer — slides in from bottom ── */}
      <div
        className={`
          rounded-xl border border-gray-200 dark:border-gray-700
          bg-gray-50 dark:bg-gray-800/60 flex flex-col overflow-hidden
          transition-all duration-500 ease-in-out
          ${selectedHour
            ? "opacity-100 translate-y-0 flex-1 min-h-0"
            : "opacity-0 translate-y-4 h-0 pointer-events-none border-0 flex-shrink-0"
          }
        `}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-3 py-2 border-b
                        border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Orders at {selectedHour} IST
            </span>
            {selectedSlot && (
              <span className="text-[10px] bg-yellow-400/10 text-yellow-500 font-bold
                               px-2 py-0.5 rounded-full border border-yellow-400/20">
                {selectedSlot.orders} orders · ₹{Number(selectedSlot.revenue).toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <button
            onClick={() => setSelectedHour(null)}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                       transition-colors px-2 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            ✕ Close
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
          {!selectedSlot?.order_details?.length ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-gray-400">No order details available</p>
            </div>
          ) : (
            selectedSlot.order_details.map((order) => (
              <div
                key={order.order_id}
                className="flex items-start justify-between gap-3 p-2 rounded-lg
                           bg-white dark:bg-gray-800 border border-gray-100
                           dark:border-gray-700 hover:border-yellow-400/30
                           dark:hover:border-yellow-400/30 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200 font-mono">
                      {order.order_id}
                    </span>
                    {order.table ? (
                      <span className="text-[10px] bg-indigo-400/10 text-indigo-400
                                       px-1.5 py-0.5 rounded font-bold">
                        {order.table}
                      </span>
                    ) : (
                      <span className="text-[10px] bg-gray-400/10 text-gray-400
                                       px-1.5 py-0.5 rounded font-bold">
                        Takeaway
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">
                      {formatTime(order.paid_at)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {order.items.map((item, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-gray-500 dark:text-gray-400
                                   bg-gray-100 dark:bg-gray-700/60 px-1.5 py-0.5 rounded"
                      >
                        {item.quantity > 1 && (
                          <span className="text-yellow-500 font-bold mr-0.5">
                            {item.quantity}×
                          </span>
                        )}
                        {item.dish_name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold text-emerald-500">
                    ₹{Number(order.total).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}