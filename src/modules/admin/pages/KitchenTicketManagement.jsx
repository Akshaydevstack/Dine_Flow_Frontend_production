import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminKitchenTickets,
  updateTicketStatus,
  updateItemStatus,
  setTicketSearch,
  setTicketStatusFilter,
  setTicketSortBy,
  setTicketPage,
  setTicketDateRange,
  clearTicketDateRange,
  resetTicketFilters,
  clearTicketError,
  selectKitchenTickets,
  selectKitchenTicketFilters,
  selectKitchenTicketPagination,
  selectKitchenTicketLoading,
  selectKitchenTicketRefreshing,
  selectKitchenTicketLoadingMore,
  selectKitchenTicketFetched,
  selectKitchenTicketError,
  selectKitchenTicketMutating,
  selectKitchenItemMutating,
} from "../../../store/slices/restaurantAdminSlice/Adminkitchenticketslice";

import {
  Search, RefreshCw, Loader2, SlidersHorizontal, AlertCircle,
  ChefHat, Clock, CheckCircle, XCircle, Flame, Timer,
  ClipboardList, Hash, Hourglass, Play, Square,
  Calendar, CalendarRange, ArrowRight, History,
} from "lucide-react";

/* ================================================================
   STATUS CONFIG
================================================================ */
const S = {
  RECEIVED:  { label: "Received",  dot: "bg-sky-400 animate-pulse",      bg: "bg-sky-500/10 dark:bg-sky-500/15",      text: "text-sky-600 dark:text-sky-400",      border: "border-sky-200 dark:border-sky-500/30",      track: "bg-sky-500",     step: 0 },
  ACCEPTED:  { label: "Accepted",  dot: "bg-violet-500 animate-pulse",   bg: "bg-violet-500/10 dark:bg-violet-500/15", text: "text-violet-600 dark:text-violet-400", border: "border-violet-200 dark:border-violet-500/30", track: "bg-violet-500",  step: 1 },
  PREPARING: { label: "Preparing", dot: "bg-amber-500 animate-pulse",    bg: "bg-amber-500/10 dark:bg-amber-500/15",   text: "text-amber-600 dark:text-amber-400",   border: "border-amber-200 dark:border-amber-500/30",  track: "bg-amber-500",   step: 2 },
  READY:     { label: "Ready",     dot: "bg-emerald-500",                bg: "bg-emerald-500/10 dark:bg-emerald-500/15",text: "text-emerald-600 dark:text-emerald-400",border: "border-emerald-200 dark:border-emerald-500/30",track: "bg-emerald-500", step: 3 },
  CANCELLED: { label: "Cancelled", dot: "bg-rose-500",                   bg: "bg-rose-500/10 dark:bg-rose-500/15",     text: "text-rose-600 dark:text-rose-400",     border: "border-rose-200 dark:border-rose-500/30",    track: "bg-rose-500",    step: -1 },
};

const ITEM_S = {
  PENDING:   { label: "Pending",   cls: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700" },
  PREPARING: { label: "Cooking",   cls: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20" },
  READY:     { label: "Ready",     cls: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" },
  CANCELLED: { label: "Cancelled", cls: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20" },
};

const PIPE        = ["RECEIVED", "ACCEPTED", "PREPARING", "READY"];
const PIPE_LABELS = ["Received", "Accepted", "Cooking",   "Ready"];

const TICKET_ACTIONS = {
  RECEIVED:  { label: "Accept Ticket", emoji: "✅", next: "ACCEPTED",  bg: "bg-violet-600 hover:bg-violet-700 shadow-violet-500/25" },
  ACCEPTED:  { label: "Start Cooking", emoji: "🔥", next: "PREPARING", bg: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/25" },
  PREPARING: { label: "Mark Ready",    emoji: "🎯", next: "READY",     bg: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25" },
};

const ITEM_ACTIONS = {
  PENDING:   { label: "Start", next: "PREPARING", icon: Play,        cls: "text-amber-600 border-amber-200 dark:border-amber-500/20 hover:bg-amber-50 dark:hover:bg-amber-500/10" },
  PREPARING: { label: "Done",  next: "READY",     icon: CheckCircle, cls: "text-emerald-600 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" },
};

/* ================================================================
   DATE / TIME HELPERS
================================================================ */

/** "02:45:09 PM" */
const fmt = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

/** "Mar 15, 2024 · 02:45 PM" — full date+time */
const fmtFull = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

/** "Today" / "Yesterday" / "15 Mar" */
const fmtDate = (iso) => {
  if (!iso) return null;
  const d     = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yest  = new Date(today); yest.setDate(today.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { day: "2-digit", month: "short" });
};

/** "5m ago" / "2h 10m" */
const elapsed = (iso) => {
  if (!iso) return "—";
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (m < 1)   return "just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ${m % 60}m` : `${Math.floor(h / 24)}d`;
};

/** Difference in seconds between two ISO strings */
const diffSec = (a, b) => {
  if (!a || !b) return null;
  return Math.round((new Date(b) - new Date(a)) / 1000);
};

/** "1m 30s" */
const fmtSec = (s) => {
  if (s === null || s === undefined) return null;
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
};

/* ================================================================
   FILTER PILL
================================================================ */
const Pill = ({ label, active, onClick }) => (
  <button onClick={onClick}
    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap
      ${active
        ? "bg-amber-500 text-white border-amber-500 shadow-sm"
        : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 hover:border-amber-300"
      }`}
  >{label}</button>
);

/* ================================================================
   DATE RANGE PICKER
================================================================ */
const DateRangePicker = ({ dateFrom, dateTo, onChange, onClear }) => {
  const hasRange = dateFrom || dateTo;
  return (
    <div>
      <p className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-1.5">
        <CalendarRange size={11} />
        Date Range
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {/* From */}
        <div className="relative">
          <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => onChange({ dateFrom: e.target.value })}
            className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold outline-none focus:ring-2 ring-amber-500/20 focus:border-amber-400 transition-all"
          />
        </div>

        <ArrowRight size={14} className="text-slate-400 flex-shrink-0" />

        {/* To */}
        <div className="relative">
          <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => onChange({ dateTo: e.target.value })}
            className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold outline-none focus:ring-2 ring-amber-500/20 focus:border-amber-400 transition-all"
          />
        </div>

        {/* Quick presets */}
        {[
          {
            label: "Today",
            fn: () => { const t = new Date().toISOString().slice(0, 10); onChange({ dateFrom: t, dateTo: t }); },
          },
          {
            label: "Last 7d",
            fn: () => {
              const to   = new Date().toISOString().slice(0, 10);
              const from = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
              onChange({ dateFrom: from, dateTo: to });
            },
          },
          {
            label: "This Month",
            fn: () => {
              const now  = new Date();
              const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
              onChange({ dateFrom: from, dateTo: now.toISOString().slice(0, 10) });
            },
          },
        ].map((p) => (
          <button
            key={p.label}
            onClick={p.fn}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider hover:border-amber-300 dark:hover:border-amber-700 transition-all whitespace-nowrap"
          >
            {p.label}
          </button>
        ))}

        {hasRange && (
          <button onClick={onClear} className="text-[10px] font-black uppercase text-rose-400 hover:text-rose-500 transition-colors">
            ✕ Clear
          </button>
        )}
      </div>
    </div>
  );
};

/* ================================================================
   STAT CARD
================================================================ */
const StatCard = ({ label, value, color }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
    <p className={`text-xl font-black ${color}`}>{value}</p>
    <p className="text-[10px] font-black uppercase text-slate-400 mt-0.5 tracking-widest">{label}</p>
  </div>
);

/* ================================================================
   SKELETON
================================================================ */
const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden animate-pulse">
    <div className="h-24 bg-slate-100 dark:bg-slate-800" />
    <div className="p-4 space-y-3">
      <div className="h-3 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="h-3 w-28 bg-slate-100 dark:bg-slate-800 rounded" />
      <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
      <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
    </div>
  </div>
);

/* ================================================================
   TICKET CARD
================================================================ */
/* ================================================================
   TICKET CARD (Fixed Height + Hidden Scrollbar)
================================================================ */
const TicketCard = React.forwardRef(({ ticket, ticketMutating, itemMutating }, ref) => {
  const dispatch = useDispatch();
  const sc       = S[ticket.status] ?? S.RECEIVED;
  const action   = TICKET_ACTIONS[ticket.status];
  const pipeStep = PIPE.indexOf(ticket.status);
  const isClosed = ["READY", "CANCELLED"].includes(ticket.status);
  const busy     = !!ticketMutating;

  /* ── Phase durations ── */
  const waitToAccept = diffSec(ticket.created_at,   ticket.accepted_at);
  const acceptToPrep = diffSec(ticket.accepted_at,  ticket.preparing_at);
  const prepToReady  = diffSec(ticket.preparing_at, ticket.ready_at);
  const totalTime    = diffSec(ticket.created_at,   ticket.ready_at ?? ticket.cancelled_at);

  const handleTicketAction = () => {
    if (!action || busy) return;
    dispatch(updateTicketStatus({ publicId: ticket.public_id, status: action.next }));
  };

  const handleItemAction = (item, nextStatus) => {
    dispatch(updateItemStatus({ itemId: item.id, status: nextStatus, ticketPublicId: ticket.public_id }));
  };

  /* ── All ticket-level timestamps as ordered rows ── */
  const ticketTimestamps = [
    { label: "Created",   iso: ticket.created_at,   dur: null },
    { label: "Accepted",  iso: ticket.accepted_at,  dur: waitToAccept != null ? `+${fmtSec(waitToAccept)}` : null },
    { label: "Cooking",   iso: ticket.preparing_at, dur: acceptToPrep != null ? `+${fmtSec(acceptToPrep)}` : null },
    { label: "Ready",     iso: ticket.ready_at,     dur: prepToReady  != null ? `+${fmtSec(prepToReady)}`  : null },
    { label: "Cancelled", iso: ticket.cancelled_at, dur: null },
    { label: "Updated",   iso: ticket.updated_at,   dur: null },
  ].filter((r) => r.iso);

  return (
    <div
      ref={ref}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col transition-all duration-200
        hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30 hover:-translate-y-0.5
        h-[580px]
        ${busy ? "opacity-70 pointer-events-none" : ""}
        ${ticket.status === "CANCELLED" ? "opacity-60 saturate-50" : ""}`}
    >

      {/* ── HEADER BAND (Locked) ── */}
      <div className={`relative px-5 pt-5 pb-4 flex-shrink-0 ${sc.bg} border-b ${sc.border}`}>
        {/* Status badge */}
        <div className="absolute top-4 right-4">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase ${sc.bg} ${sc.text} ${sc.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {sc.label}
            {busy && <Loader2 size={10} className="animate-spin ml-1" />}
          </div>
        </div>

        <div className="pr-24">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={13} className={sc.text} />
            <span className={`font-black text-sm font-mono tracking-tight ${sc.text}`}>{ticket.public_id}</span>
          </div>
          <div className="flex items-center gap-2">
            <Hash size={11} className="text-slate-400" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{ticket.order_id}</span>
          </div>
        </div>

        {/* Created timestamp + elapsed in header */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar size={11} className="text-slate-400" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {fmtDate(ticket.created_at)} · {fmt(ticket.created_at)}
            </span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${sc.bg} border ${sc.border}`}>
            <Hourglass size={10} className={sc.text} />
            <span className={`text-[10px] font-black ${sc.text}`}>{elapsed(ticket.created_at)}</span>
          </div>
        </div>

        <p className={`text-[9px] font-mono mt-1.5 ${sc.text} opacity-70`}>
          {fmtFull(ticket.created_at)}
        </p>
      </div>

      {/* ── PIPELINE (Locked) ── */}
      {ticket.status !== "CANCELLED" && (
        <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center">
            {PIPE.map((step, i) => {
              const done    = i < pipeStep;
              const current = i === pipeStep;
              const stc     = S[step];
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                      ${done || current ? `${stc.track} border-transparent` : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"}`}>
                      {done    && <CheckCircle size={11} className="text-white" />}
                      {current && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className={`text-[8px] font-black uppercase leading-none whitespace-nowrap
                      ${done || current ? stc.text : "text-slate-300 dark:text-slate-700"}`}>
                      {PIPE_LABELS[i]}
                    </span>
                    {(done || current) && (() => {
                      const tsMap = {
                        RECEIVED:  ticket.created_at,
                        ACCEPTED:  ticket.accepted_at,
                        PREPARING: ticket.preparing_at,
                        READY:     ticket.ready_at,
                      };
                      const ts = tsMap[step];
                      return ts ? (
                        <span className={`text-[7px] font-mono ${stc.text} opacity-70 mt-0.5`}>
                          {fmt(ts)}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  {i < PIPE.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 transition-all ${i < pipeStep ? sc.track : "bg-slate-100 dark:bg-slate-800"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SCROLLABLE MIDDLE SECTION ── */}
      {/* 👇 FIX: Scrollbar hidden visually but still scrollable 👇 */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* FULL TIMESTAMP TIMELINE */}
        {ticketTimestamps.length > 0 && (
          <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2.5 flex items-center gap-1">
              <History size={9} />
              Timeline
            </p>
            <div className="space-y-2">
              {ticketTimestamps.map((r, i) => {
                const isLast    = i === ticketTimestamps.length - 1;
                const isCurrent = r.label.toUpperCase() === ticket.status ||
                  (r.label === "Created" && ticket.status === "RECEIVED");
                return (
                  <div key={r.label} className="flex items-start gap-2.5">
                    <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0
                        ${r.label === "Cancelled" ? "bg-rose-500" : r.label === "Updated" ? "bg-slate-300 dark:bg-slate-600" : isCurrent ? `${sc.dot.split(" ")[0]} ring-2 ring-offset-1 ring-${sc.dot.split("bg-")[1]?.split(" ")[0]}` : "bg-slate-200 dark:bg-slate-700"}`}
                      />
                      {!isLast && <div className="w-px h-4 bg-slate-100 dark:bg-slate-800 mt-1" />}
                    </div>
                    <div className="flex-1 min-w-0 -mt-0.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`text-[10px] font-black uppercase tracking-wide
                          ${r.label === "Cancelled" ? "text-rose-500" : r.label === "Updated" ? "text-slate-400 dark:text-slate-500" : isCurrent ? sc.text : "text-slate-500 dark:text-slate-400"}`}>
                          {r.label}
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
                            {fmt(r.iso)}
                          </span>
                          {r.dur && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg border ${sc.bg} ${sc.text} ${sc.border}`}>
                              {r.dur}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[8px] font-mono text-slate-300 dark:text-slate-700 mt-0.5">
                        {fmtFull(r.iso)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {totalTime !== null && ticket.ready_at && (
                <div className={`flex items-center justify-between pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800`}>
                  <div className="flex items-center gap-2">
                    <Timer size={11} className={sc.text} />
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">Total time</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${sc.bg} ${sc.text} border ${sc.border}`}>
                    {fmtSec(totalTime)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ITEMS */}
        <div className="px-5 py-3">
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">
            {ticket.items?.length} Item{ticket.items?.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-2">
            {ticket.items?.map((item) => {
              const isc        = ITEM_S[item.status] ?? ITEM_S.PENDING;
              const itemAction = ITEM_ACTIONS[item.status];
              const itemBusy   = !!itemMutating?.[item.id];
              const itemDur    = diffSec(item.started_at, item.finished_at);

              return (
                <div key={item.id} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden">
                  <div className="flex items-center gap-2.5 px-3 py-2.5">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black flex-shrink-0 ${sc.bg} ${sc.text} border ${sc.border}`}>
                      ×{item.quantity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.dish_name}</p>
                      <p className="text-[9px] text-slate-400 font-mono">{item.dish_id}</p>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase flex-shrink-0 border ${isc.cls}`}>
                      {isc.label}
                    </span>
                  </div>

                  {(item.started_at || item.finished_at || item.prep_time_seconds != null || item.estimated_prep_time_seconds != null) && (
                    <div className="px-3 pb-2 grid grid-cols-2 gap-1.5">
                      {item.started_at && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-100 dark:border-slate-700">
                          <p className="text-[8px] font-black uppercase text-slate-400">Started</p>
                          <p className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">{fmt(item.started_at)}</p>
                          <p className="text-[8px] font-mono text-slate-400">{fmtFull(item.started_at)}</p>
                        </div>
                      )}
                      {item.finished_at && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-100 dark:border-slate-700">
                          <p className="text-[8px] font-black uppercase text-slate-400">Finished</p>
                          <p className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">{fmt(item.finished_at)}</p>
                          <p className="text-[8px] font-mono text-slate-400">{fmtFull(item.finished_at)}</p>
                        </div>
                      )}
                      {item.prep_time_seconds != null && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-100 dark:border-slate-700">
                          <p className="text-[8px] font-black uppercase text-slate-400">Actual prep</p>
                          <p className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">{fmtSec(item.prep_time_seconds)}</p>
                        </div>
                      )}
                      {item.estimated_prep_time_seconds != null && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-100 dark:border-slate-700">
                          <p className="text-[8px] font-black uppercase text-slate-400">Est. prep</p>
                          <p className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">{fmtSec(item.estimated_prep_time_seconds)}</p>
                        </div>
                      )}
                      {itemDur !== null && (
                        <div className={`col-span-2 rounded-xl px-2.5 py-1.5 border ${sc.bg} ${sc.border}`}>
                          <p className="text-[8px] font-black uppercase text-slate-400">Cook duration</p>
                          <p className={`text-[10px] font-mono font-black ${sc.text}`}>{fmtSec(itemDur)}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {ticket.status === "PREPARING" && itemAction && (
                    <div className="px-3 pb-2.5">
                      <button
                        disabled={itemBusy}
                        onClick={() => handleItemAction(item, itemAction.next)}
                        className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[10px] font-black uppercase transition-all disabled:opacity-50 ${itemAction.cls}`}
                      >
                        {itemBusy
                          ? <Loader2 size={11} className="animate-spin" />
                          : <itemAction.icon size={11} />
                        }
                        {itemAction.label}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── TICKET ACTION FOOTER (Locked to bottom) ── */}
      <div className="p-4 pt-3 flex-shrink-0 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900">
        {action && !isClosed && (
          <button
            onClick={handleTicketAction}
            disabled={busy}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 ${action.bg}`}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : action.emoji}
            {action.label}
          </button>
        )}
        {ticket.status === "READY" && (
          <div className="w-full py-3 flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl">
            <span className="text-base">🎉</span>
            <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">Ready for Pickup</span>
          </div>
        )}
        {ticket.status === "CANCELLED" && (
          <div className="w-full py-3 flex items-center justify-center border border-dashed border-rose-200 dark:border-rose-500/20 rounded-2xl">
            <span className="text-xs font-black uppercase text-rose-400 tracking-widest">❌ Cancelled</span>
          </div>
        )}
      </div>
    </div>
  );
});
TicketCard.displayName = "TicketCard";

/* ================================================================
   EMPTY STATE
================================================================ */
const EmptyState = ({ filtered, onReset }) => (
  <div className="col-span-full flex flex-col items-center justify-center h-64 text-slate-400">
    <span className="text-5xl mb-4">🍽️</span>
    <p className="font-bold uppercase text-xs tracking-widest">
      {filtered ? "No tickets match your filters" : "No kitchen tickets yet"}
    </p>
    {filtered && (
      <button onClick={onReset} className="mt-4 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-black hover:bg-amber-600">
        Clear filters
      </button>
    )}
  </div>
);

/* ================================================================
   MAIN COMPONENT
================================================================ */
const KitchenTicketManagement = () => {
  const dispatch = useDispatch();

  const tickets      = useSelector(selectKitchenTickets);
  const filters      = useSelector(selectKitchenTicketFilters);
  const pagination   = useSelector(selectKitchenTicketPagination);
  const loading      = useSelector(selectKitchenTicketLoading);
  const isRefreshing = useSelector(selectKitchenTicketRefreshing);
  const loadingMore  = useSelector(selectKitchenTicketLoadingMore);
  const fetched      = useSelector(selectKitchenTicketFetched);
  const error        = useSelector(selectKitchenTicketError);
  const ticketMutating = useSelector(selectKitchenTicketMutating);
  const itemMutating   = useSelector(selectKitchenItemMutating);

  const [searchTerm,  setSearchTerm]  = useState(filters.searchQuery);
  const [showFilters, setShowFilters] = useState(false);

  const observerRef = useRef();
  const isMounted   = useRef(false);

  useEffect(() => {
    if (error) { const t = setTimeout(() => dispatch(clearTicketError()), 4000); return () => clearTimeout(t); }
  }, [error, dispatch]);

  useEffect(() => {
    if (!fetched) dispatch(fetchAdminKitchenTickets(filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    dispatch(fetchAdminKitchenTickets(filters));
  }, [dispatch, filters.searchQuery, filters.statusFilter, filters.sortBy, filters.currentPage, filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    const t = setTimeout(() => dispatch(setTicketSearch(searchTerm)), 400);
    return () => clearTimeout(t);
  }, [searchTerm, dispatch]);

  const lastCardRef = useCallback((node) => {
    if (loading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && pagination.hasNext)
        dispatch(setTicketPage(filters.currentPage + 1));
    });
    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, pagination.hasNext, filters.currentPage, dispatch]);

  const handleRefresh    = () => dispatch(fetchAdminKitchenTickets({ ...filters, currentPage: 1 }));
  const handleReset      = () => { setSearchTerm(""); dispatch(resetTicketFilters()); };
  const handleDateChange = (range) => dispatch(setTicketDateRange(range));
  const handleDateClear  = () => dispatch(clearTicketDateRange());

  const counts = tickets.reduce((a, t) => { a[t.status] = (a[t.status] || 0) + 1; return a; }, {});

  const dateRangeLabel =
    filters.dateFrom && filters.dateTo   ? `${filters.dateFrom} → ${filters.dateTo}` :
    filters.dateFrom                     ? `From ${filters.dateFrom}` :
    filters.dateTo                       ? `To ${filters.dateTo}` : null;

  const activeFilterCount =
    (filters.statusFilter !== "all" ? 1 : 0) +
    (filters.sortBy !== "newest"    ? 1 : 0) +
    (searchTerm                     ? 1 : 0) +
    (filters.dateFrom || filters.dateTo ? 1 : 0);

  const isFiltered = activeFilterCount > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-4 lg:p-8 transition-colors duration-300">

      {/* ── HEADER ── */}
      <header className="flex flex-col lg:flex-row justify-between mb-8 gap-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ChefHat className="text-amber-500" size={28} />
            Kitchen Tickets
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Live cook queue · full ticket detail
            {pagination.totalItems > 0 && (
              <span className="ml-2 text-amber-500 font-bold">· {pagination.totalItems} total</span>
            )}
          </p>
          {/* Active date range badge */}
          {dateRangeLabel && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wide">
              <CalendarRange size={10} />
              {dateRangeLabel}
              <button onClick={handleDateClear} className="ml-1 hover:text-rose-500 transition-colors">✕</button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="w-full pl-12 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 ring-amber-500/20 text-sm"
              placeholder="Search ticket, order, dish…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isRefreshing && <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-amber-400" />}
          </div>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`relative p-3 rounded-2xl border transition-all
              ${showFilters || activeFilterCount > 0
                ? "bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-700 text-amber-600"
                : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900"}`}
          >
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button onClick={handleRefresh} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-colors">
            <RefreshCw size={20} className={(loading || isRefreshing) ? "animate-spin text-amber-500" : ""} />
          </button>
        </div>
      </header>

      {/* ── STATS ── */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard label="Total"     value={pagination.totalItems || tickets.length} color="text-slate-700 dark:text-white" />
        <StatCard label="Received"  value={counts.RECEIVED  || 0} color="text-sky-600 dark:text-sky-400" />
        <StatCard label="Accepted"  value={counts.ACCEPTED  || 0} color="text-violet-600 dark:text-violet-400" />
        <StatCard label="Preparing" value={counts.PREPARING || 0} color="text-amber-600 dark:text-amber-400" />
        <StatCard label="Ready"     value={counts.READY     || 0} color="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Cancelled" value={counts.CANCELLED || 0} color="text-rose-500 dark:text-rose-400" />
      </div>

      {/* ── FILTER PANEL ── */}
      {showFilters && (
        <div className="mb-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-5">
          {/* Status */}
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {[
                ["all",       "All"],
                ["RECEIVED",  "🔵 Received"],
                ["ACCEPTED",  "🟣 Accepted"],
                ["PREPARING", "🟠 Preparing"],
                ["READY",     "🟢 Ready"],
                ["CANCELLED", "🔴 Cancelled"],
              ].map(([v, l]) => (
                <Pill key={v} label={l} active={filters.statusFilter === v} onClick={() => dispatch(setTicketStatusFilter(v))} />
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Sort by</p>
            <div className="flex flex-wrap gap-2">
              {[
                ["newest",  "Newest"],
                ["oldest",  "Oldest"],
                ["updated", "Recently Updated"],
                ["status",  "By Status"],
              ].map(([v, l]) => (
                <Pill key={v} label={l} active={filters.sortBy === v} onClick={() => dispatch(setTicketSortBy(v))} />
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
            <DateRangePicker
              dateFrom={filters.dateFrom}
              dateTo={filters.dateTo}
              onChange={handleDateChange}
              onClear={handleDateClear}
            />
          </div>

          {activeFilterCount > 0 && (
            <button onClick={handleReset} className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-600">
              ✕ Clear all
            </button>
          )}
        </div>
      )}

      {/* ── ERROR ── */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-200 dark:border-rose-500/20 text-sm font-bold">
          <AlertCircle size={18} />{error}
        </div>
      )}

      {/* ── GRID ── */}
      {loading && !loadingMore ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-200 ${isRefreshing ? "opacity-60" : "opacity-100"}`}>
          {tickets.length === 0
            ? <EmptyState filtered={isFiltered} onReset={handleReset} />
            : tickets.map((ticket, i) => (
              <TicketCard
                key={ticket.public_id}
                ticket={ticket}
                ticketMutating={ticketMutating[ticket.public_id]}
                itemMutating={itemMutating}
                ref={i === tickets.length - 1 ? lastCardRef : null}
              />
            ))
          }
        </div>
      )}

      {/* ── LOAD MORE ── */}
      {loadingMore && (
        <div className="flex justify-center p-12">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-3 rounded-full shadow-lg border border-slate-100 dark:border-slate-800">
            <Loader2 className="animate-spin text-amber-500" size={20} />
            <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Loading more…</span>
          </div>
        </div>
      )}

      {tickets.length > 0 && !loadingMore && (
        <p className="text-center text-xs text-slate-400 font-medium mt-5">
          Showing <span className="font-bold text-slate-600 dark:text-slate-300">{tickets.length}</span> of{" "}
          <span className="font-bold text-slate-600 dark:text-slate-300">{pagination.totalItems}</span> tickets
        </p>
      )}
    </div>
  );
};

export default KitchenTicketManagement;