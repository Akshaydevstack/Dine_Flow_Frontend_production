import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import TableStatusGrid from "../components/dashboardComponemts/TableStatusGrid";
import WelcomeAdmin from "../components/dashboardComponemts/WelcomeAdmin";
import OrderStatusChart from "../components/charts/OrderStatusChart";
import KitchenLoadChart from "../components/charts/KitchenLoadChart";
import HourlySalesChart from "../components/charts/HourlySalesChart";
import CategoryDistributionChart from "../components/charts/CategoryDistributionChart";
import DishPerformanceChart from "../components/charts/DishPerformanceChart";
import AdminActionCards from "../components/dashboardComponemts/AdminActionCards";
import RecentOrdersWidget from "../components/dashboardComponemts/RecentOrderswidget";
import RecentReviewsWidget from "../components/dashboardComponemts/RecentReviewsWidget";
import TableSessionsWidget from "../components/dashboardComponemts/Tablesessionswidget";

 import {
  fetchAdminTables,
  fetchAdminTableStats,
  selectAdminTables,
  selectAdminTableLoading,
  selectAdminTableFilters,
  selectAdminTableStats,
} from "../../../store/slices/restaurantAdminSlice/adminTableSlice";

import {
  fetchAdminDashboard,
  fetchKitchenDashboard,
  fetchCategoryStats,
  fetchCustomerStatus,
  fetchDishStats,
  selectDashboardOrderStats,
  selectDashboardKitchenStats,
  selectCategoryStats,
  selectDashboardLoading,
  selectCategoryStatsLoading,
  selectDashboardFetched,
} from "../../../store/slices/restaurantAdminSlice/adminChartSlice";

import {
  fetchAdminReviews,
  selectAdminReviewFilters,
} from "../../../store/slices/restaurantAdminSlice/adminReviewSlice";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const tables = useSelector(selectAdminTables);
  const tableLoading = useSelector(selectAdminTableLoading);
  const filters = useSelector(selectAdminTableFilters);
  const tableStats = useSelector(selectAdminTableStats);

  const orderStats = useSelector(selectDashboardOrderStats);
  const kitchenStats = useSelector(selectDashboardKitchenStats);
  const categoryStats = useSelector(selectCategoryStats);
  const dashboardLoading = useSelector(selectDashboardLoading);
  const categoryLoading = useSelector(selectCategoryStatsLoading);
  const chartFetched = useSelector(selectDashboardFetched);
  const reviewFilters = useSelector(selectAdminReviewFilters);

  useEffect(() => {
    if (!chartFetched) {
      dispatch(fetchAdminTables(filters));
      dispatch(fetchAdminTableStats());
      dispatch(fetchAdminDashboard());
      dispatch(fetchKitchenDashboard());
      dispatch(fetchCategoryStats());
      dispatch(fetchCustomerStatus());
      dispatch(fetchDishStats());
      dispatch(fetchAdminReviews(reviewFilters));
    }
  }, [dispatch, chartFetched, filters, reviewFilters]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-2 lg:p-4 space-y-5">
      {/* ── SECTION 1: WELCOME & CARDS ── */}
      <div className="space-y-4">
        <WelcomeAdmin adminName="DineFlow Admin" />
        <AdminActionCards />
      </div>

      {/* ── SECTION 2: TABLE MAP & OVERVIEW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 h-[520px] overflow-hidden">
          <TableStatusGrid
            tables={tables}
            loading={tableLoading}
            stats={tableStats}
            onRefresh={null}
          />
        </div>
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 h-[520px] overflow-hidden">
          <OrderStatusChart data={orderStats} loading={dashboardLoading} />
        </div>
      </div>

      {/* ── SECTION 3: LIVE FEEDS (The overlapping part in screenshot) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
        <div className="h-[620px]">
          <RecentOrdersWidget
            onShowAll={() => navigate("/restaurant/admin/order-management")}
          />
        </div>
        <div className="h-[640px]">
          <RecentReviewsWidget onShowAll={() => navigate("/restaurant/admin/review-management")} />
        </div>
      </div>

      {/* ── SECTION 4: KITCHEN & SALES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-0">
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 h-[575px] overflow-hidden">
          <KitchenLoadChart data={kitchenStats} loading={dashboardLoading} />
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 h-[575px] overflow-hidden">
          <HourlySalesChart />
        </div>
      </div>

      {/* ── SECTION 5: PERFORMANCE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 h-[480px] overflow-hidden">
          <CategoryDistributionChart
            data={categoryStats}
            loading={categoryLoading}
          />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 h-[480px] overflow-hidden">
          <DishPerformanceChart />
        </div>
      </div>

      {/* ── SECTION 6: TABLE SESSIONS ── */}
      <div className="pb-8">
        <TableSessionsWidget
          onShowAll={() => navigate("/restaurant/admin/table-sessions")}
        />
      </div>
    </div>
  );
}