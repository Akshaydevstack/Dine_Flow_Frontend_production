import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Printer, CreditCard, Clock, Hash,
  Utensils, Loader2, AlertCircle, CheckCircle2,
  MapPin, Receipt, Users, SplitSquareHorizontal,
  CalendarDays, ShoppingBag, Banknote,
} from 'lucide-react';
import axiosClient from '../../../api/axiosClient';

/* ================================================================
   HELPERS
================================================================ */
const fmtTime     = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
const fmtDateTime = (iso) => iso ? new Date(iso).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
const timeAgo     = (iso) => {
  if (!iso) return "";
  const d = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (d < 60)     return "just now";
  if (d < 3600)   return `${Math.floor(d / 60)}m ago`;
  if (d < 86400)  return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
};

/* Payment status badge config */
const PAY_CFG = {
  PAID:    { pill: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/40", dot: "bg-emerald-500" },
  PENDING: { pill: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700/40",           dot: "bg-amber-500 animate-pulse" },
  UNPAID:  { pill: "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-700/40",                 dot: "bg-rose-500" },
};
const payConfig = (status) => PAY_CFG[status] ?? PAY_CFG.UNPAID;

/* ================================================================
   SKELETON
================================================================ */
const CheckoutSkeleton = () => (
  <div className="max-w-3xl mx-auto p-4 space-y-5 animate-pulse">
    {/* session card */}
    <div className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800" />
    {/* orders */}
    <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
    {[1,2].map((i) => (
      <div key={i} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/60 rounded-[2rem] overflow-hidden">
        <div className="h-12 bg-slate-50 dark:bg-slate-800/40" />
        <div className="p-5 space-y-4">
          {[1,2,3].map((j) => (
            <div key={j} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded-full" />
                <div className="h-2.5 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="h-3.5 w-14 bg-slate-100 dark:bg-slate-800 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    ))}
    {/* summary */}
    <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/60 rounded-3xl p-6 space-y-3">
      {[1,2,3].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="h-3 w-28 bg-slate-100 dark:bg-slate-800 rounded-full" />
          <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

/* ================================================================
   ORDER CARD
================================================================ */
const OrderCard = ({ order }) => {
  const cfg = payConfig(order.payment_status);
  return (
    <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/60 rounded-[2rem] overflow-hidden shadow-sm">
      {/* Card header */}
      <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-700/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center flex-shrink-0">
            <Receipt size={13} className="text-white" />
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 truncate">{order.order_id}</span>
        </div>
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase flex-shrink-0 ${cfg.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
          {order.payment_status}
        </div>
      </div>

      {/* Items */}
      <div className="p-5 space-y-3.5">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            {/* dish thumbnail / icon */}
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
              {item.image_url
                ? <img src={item.image_url} alt={item.dish_name} className="w-full h-full object-cover rounded-xl" onError={(e) => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }} />
                : null
              }
              <Utensils size={14} className="text-slate-400" style={item.image_url ? {display:"none"} : {}} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.dish_name}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                {item.quantity} × ₹{parseFloat(item.unit_price).toFixed(2)}
              </p>
            </div>

            <span className="text-xs font-black font-mono text-slate-700 dark:text-slate-200 flex-shrink-0">
              ₹{parseFloat(item.total_price).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Card footer — per-order subtotal */}
      {order.items.length > 1 && (
        <div className="px-5 py-3 border-t border-slate-50 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Order subtotal</span>
          <span className="text-xs font-black font-mono text-slate-700 dark:text-slate-200">
            ₹{order.items.reduce((s, i) => s + parseFloat(i.total_price), 0).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};

/* ================================================================
   MAIN
================================================================ */
const CheckoutPage = () => {
  const { tableId } = useParams();
  const navigate    = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [paying,  setPaying]  = useState(false);

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        const res = await axiosClient.get(`/order/restaurant-admin/table/${tableId}/checkout/`);
        setData(res.data);
      } catch (err) {
        console.error("Checkout fetch error", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCheckoutData();
  }, [tableId]);

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] pb-28">
      {/* skeleton header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-700/60 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="space-y-1.5 text-center">
            <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto animate-pulse" />
            <div className="h-2.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto animate-pulse" />
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>
      <CheckoutSkeleton />
    </div>
  );

  /* ── Error ── */
  if (error || !data) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex flex-col items-center justify-center gap-4 p-8">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
        <AlertCircle size={28} className="text-rose-500" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">No Active Session</h2>
        <p className="text-sm text-slate-400 mt-1">No active session found for this table.</p>
      </div>
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <ChevronLeft size={16} /> Go Back
      </button>
    </div>
  );

  const { table, summary, session, orders } = data;
  const allPaid = orders.every((o) => o.payment_status === "PAID");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] pb-28 transition-colors duration-300">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/60 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 dark:text-slate-400"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="text-center">
            <h1 className="text-base font-black text-slate-900 dark:text-white leading-none">
              Checkout · Table {table.table_number}
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-black flex items-center justify-center gap-1">
              <MapPin size={9} className="text-violet-400" />{table.zone_name}
            </p>
          </div>

          <button className="p-2 rounded-xl text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
            <Printer size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-5">

        {/* ── Session Hero Card ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-violet-700 to-purple-800 rounded-[2rem] p-6 shadow-2xl shadow-violet-500/30">
          {/* decorative circle */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="space-y-3">
              {/* table badge */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center font-black text-white text-base shadow-lg">
                  {table.table_number}
                </div>
                <div>
                  <p className="text-white font-black text-sm leading-none">{table.zone_name}</p>
                  <p className="text-white/60 text-[10px] font-bold mt-0.5">Table #{table.table_number}</p>
                </div>
              </div>

              {/* session id */}
              <div>
                <p className="text-white/50 text-[9px] font-black uppercase tracking-wider mb-0.5">Session ID</p>
                <p className="text-white font-mono text-[11px] font-bold">{session.session_id}</p>
              </div>

              {/* started at */}
              <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-bold">
                <CalendarDays size={11} />
                Started {fmtDateTime(session.started_at)} · {timeAgo(session.started_at)}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {/* session status pill */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase
                ${session.status === "active"
                  ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                  : "bg-white/15 text-white/80 border border-white/20"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${session.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-white/60"}`} />
                {session.status}
              </div>

              {/* orders count */}
              <div className="text-right">
                <p className="text-white/50 text-[9px] font-black uppercase tracking-wider">Orders</p>
                <p className="text-white font-black text-xl leading-none">{summary.orders_count}</p>
              </div>

              {/* items count */}
              <div className="text-right">
                <p className="text-white/50 text-[9px] font-black uppercase tracking-wider">Items</p>
                <p className="text-white font-black text-xl leading-none">{summary.total_items}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Strip ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Orders",  value: summary.orders_count, color: "text-slate-800 dark:text-white" },
            { label: "Items",   value: summary.total_items,  color: "text-violet-600 dark:text-violet-400" },
            { label: "Payment", value: allPaid ? "Paid" : "Pending", color: allPaid ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 text-center">
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Orders Section ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest flex items-center gap-1.5">
              <ShoppingBag size={10} /> Orders Breakdown
            </p>
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
              {summary.orders_count} {summary.orders_count === 1 ? "order" : "orders"}
            </span>
          </div>

          {orders.map((order) => (
            <OrderCard key={order.order_id} order={order} />
          ))}
        </div>

        {/* ── Financial Summary Card ── */}
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm space-y-0">
          <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-4 flex items-center gap-1.5">
            <Banknote size={11} /> Bill Summary
          </p>

          {/* Subtotal */}
          <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700/40">
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Subtotal</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{summary.total_items} items across {summary.orders_count} orders</p>
            </div>
            <span className="text-sm font-black font-mono text-slate-700 dark:text-slate-200">₹{parseFloat(summary.subtotal).toFixed(2)}</span>
          </div>

          {/* Tax */}
          <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700/40">
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Tax</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">CGST + SGST</p>
            </div>
            <span className="text-sm font-black font-mono text-rose-500">+₹{parseFloat(summary.tax).toFixed(2)}</span>
          </div>

          {/* Grand total */}
          <div className="flex justify-between items-center pt-4">
            <div>
              <p className="text-base font-black text-slate-900 dark:text-white">Grand Total</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{summary.currency}</p>
            </div>
            <span className="text-2xl font-black font-mono text-violet-600 dark:text-violet-400">
              ₹{parseFloat(summary.grand_total).toFixed(2)}
            </span>
          </div>
        </div>

      </div>

      {/* ── Bottom Action Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700/60 px-4 py-4 safe-area-bottom">
        <div className="max-w-3xl mx-auto flex gap-3">
          {/* Split Bill */}
          <button className="flex-1 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
            <SplitSquareHorizontal size={16} className="text-slate-400" />
            Split Bill
          </button>

          {/* Complete Payment */}
          <button
            disabled={paying || allPaid}
            onClick={() => setPaying(true)}
            className={`flex-1 h-14 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2
              ${allPaid
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-200 dark:border-emerald-700/40 cursor-default"
                : "bg-violet-600 text-white shadow-lg shadow-violet-500/30 hover:bg-violet-700 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
              }`}
          >
            {paying
              ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
              : allPaid
                ? <><CheckCircle2 size={16} /> All Paid</>
                : <><CreditCard size={16} /> Complete Payment</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;