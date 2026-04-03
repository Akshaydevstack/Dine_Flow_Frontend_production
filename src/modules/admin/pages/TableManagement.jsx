import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../../../api/axiosClient";
import {
  fetchAdminTables,
  fetchAdminZones,
  createAdminZone,
  updateAdminZone,
  deleteAdminZone,
  createAdminTable,
  updateAdminTable,
  deleteAdminTable,
  setTableSearch,
  setTableFilter,
  setTablePage,
  resetTableFilters,
  clearTableMessages,
  clearZoneMessages,
  selectAdminTables,
  selectAdminZones,
  selectAdminTableFilters,
  selectAdminTablePagination,
  selectAdminTableLoading,
  selectAdminTableRefreshing,
  selectAdminTableLoadingMore,
  selectAdminTableFetched,
  selectAdminTableSuccess,
  selectAdminTableError,
  selectAdminZonesLoading,
  selectAdminZoneSuccess,
  selectAdminZoneError,
  selectAdminZoneFetched
} from "../../../store/slices/restaurantAdminSlice/adminTableSlice";
import {
  Search, Plus, Loader2, X, ChevronDown, SlidersHorizontal,
  CheckCircle2, AlertCircle, MapPin, Users, Pencil, Save,
  ToggleLeft, ToggleRight, QrCode, Trash2, Clock, Calendar,
  RefreshCw, User, Hash, ShoppingBag, ExternalLink,ReceiptText
} from "lucide-react";

/* ================================================================
   CONSTANTS
================================================================ */
const TABLE_TYPES = [
  { value: "standard",  label: "Standard Table", icon: "🪑" },
  { value: "counter",   label: "Counter Table",  icon: "🍽️" },
  { value: "delivery",  label: "Delivery",       icon: "📦" },
];

const STATUS_OPTS = [
  { value: "",          label: "All" },
  { value: "available", label: "✅ Available" },
  { value: "occupied",  label: "🔴 Occupied" },
  { value: "reserved",  label: "📅 Reserved" },
];

const STATUS_CONFIG = {
  occupied:  { label: "Occupied",  cls: "bg-rose-500 text-white" },
  reserved:  { label: "Reserved",  cls: "bg-amber-500 text-white" },
  available: { label: "Available", cls: "bg-emerald-500 text-white" },
};

const ZONE_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-indigo-500 to-violet-600",
];

/* ================================================================
   HELPERS
================================================================ */
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
const timeAgo = (iso) => {
  if (!iso) return "";
  const d = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (d < 60)     return "just now";
  if (d < 3600)   return `${Math.floor(d / 60)}m ago`;
  if (d < 86400)  return `${Math.floor(d / 3600)}h ago`;
  if (d < 604800) return `${Math.floor(d / 86400)}d ago`;
  return fmtDate(iso);
};

/* ================================================================
   TOAST BANNER
================================================================ */
const ToastBanner = ({ success, error }) => {
  if (!success && !error) return null;
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold border transition-all
      ${success
        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
        : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-500/20"
      }`}
    >
      {success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      {success || error}
    </div>
  );
};

/* ================================================================
   FILTER PILL
================================================================ */
const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all whitespace-nowrap
      ${active
        ? "bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-500/30"
        : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-violet-300 dark:hover:border-violet-700"
      }`}
  >
    {label}
  </button>
);

/* ================================================================
   TAB BAR
================================================================ */
const TabBar = ({ active, onChange, zoneCount, tableCount }) => (
  <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl w-fit">
    {[
      { id: "tables", label: "Tables", count: tableCount, emoji: "🪑" },
      { id: "zones",  label: "Zones",  count: zoneCount,  emoji: "📍" },
    ].map(({ id, label, count, emoji }) => (
      <button
        key={id}
        onClick={() => onChange(id)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all
          ${active === id
            ? "bg-white dark:bg-slate-900 text-violet-600 shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
      >
        <span>{emoji}</span>
        {label}
        {count !== undefined && (
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full
            ${active === id ? "bg-violet-100 dark:bg-violet-500/20 text-violet-600" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}>
            {count}
          </span>
        )}
      </button>
    ))}
  </div>
);

/* ================================================================
   QR CODE MODAL
================================================================ */
const QrCodeModal = ({ tableNumber, qrUrl, onClose }) => {
  const [dataUrl, setDataUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    let cancelled = false;
    const generate = async () => {
      setLoading(true); setError(false);
      try {
        const QRCode    = (await import("qrcode")).default;
        const tmpCanvas = document.createElement("canvas");
        await QRCode.toCanvas(tmpCanvas, qrUrl, { width: 400, margin: 2, color: { dark: "#0f172a", light: "#ffffff" }, errorCorrectionLevel: "H" });
        const SIZE = 512, PAD = 24, LABEL = 56, QR_SZ = SIZE - PAD * 2;
        const out = document.createElement("canvas");
        out.width = SIZE; out.height = SIZE + LABEL;
        const ctx = out.getContext("2d");
        ctx.fillStyle = "#ffffff"; ctx.roundRect(0, 0, SIZE, SIZE + LABEL, 24); ctx.fill();
        ctx.strokeStyle = "#7c3aed"; ctx.lineWidth = 3; ctx.roundRect(1.5, 1.5, SIZE - 3, SIZE + LABEL - 3, 23); ctx.stroke();
        ctx.drawImage(tmpCanvas, PAD, PAD, QR_SZ, QR_SZ);
        ctx.fillStyle = "#7c3aed"; ctx.font = "bold 26px system-ui, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(`Table ${tableNumber}`, SIZE / 2, SIZE + LABEL / 2);
        if (!cancelled) { setDataUrl(out.toDataURL("image/png")); setLoading(false); }
      } catch {
        if (!cancelled) {
          setDataUrl(`https://chart.googleapis.com/chart?chs=400x400&cht=qr&chl=${encodeURIComponent(qrUrl)}&choe=UTF-8&chld=H|2`);
          setLoading(false); setError(true);
        }
      }
    };
    generate();
    return () => { cancelled = true; };
  }, [qrUrl, tableNumber]);

  const handleDownload = () => {
    if (!dataUrl || error) return;
    const a = document.createElement("a");
    a.href = dataUrl; a.download = `qr-table-${tableNumber}.png`; a.click();
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(qrUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
              <QrCode size={18} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">QR Code</h2>
              <p className="text-xs text-slate-400">Table {tableNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"><X size={20} /></button>
        </div>

        <div className="px-8 pt-8 pb-2 flex flex-col items-center">
          <div className="flex items-center justify-center rounded-3xl border-2 border-slate-100 dark:border-slate-700 bg-white overflow-hidden shadow-inner">
            {loading ? <Loader2 size={32} className="animate-spin text-violet-500" /> : <img src={dataUrl} alt={`QR for Table ${tableNumber}`} className="w-full h-full object-contain" />}
          </div>
          <div className="mt-4 w-full flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate flex-1">{qrUrl}</p>
            <button onClick={handleCopy} className={`flex-shrink-0 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl transition-all ${copied ? "bg-emerald-500 text-white" : "bg-violet-100 dark:bg-violet-500/20 text-violet-600 hover:bg-violet-200"}`}>
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="flex gap-3 px-8 py-6">
          <button onClick={handleDownload} disabled={loading || error} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 text-white rounded-2xl text-sm font-black hover:bg-violet-700 transition-colors shadow-lg shadow-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed">
            <QrCode size={16} />{loading ? "Generating…" : "Download PNG"}
          </button>
          <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl text-sm font-black hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Open</a>
        </div>
        {error && <p className="px-8 pb-6 text-[10px] text-slate-400 text-center -mt-3">Install <code className="font-mono">qrcode</code> package for branded PNG downloads.</p>}
      </div>
    </div>
  );
};

/* ================================================================
   ORDERS DRAWER — slide-in from right
   Shows all orders for a table. If ongoingOnly=true shows live orders.
================================================================ */


const OrdersDrawer = ({ table, ongoingOnly, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTableOrders = async () => {
      if (!table?.public_id) return;
      
      try {
        setLoading(true);
        // Using your new Table-specific endpoint
        // Pass ongoing_only as a query parameter as defined in your Django view
        const res = await axiosClient.get(
          `/order/restaurant-admin/table/${table.public_id}/orders/?ongoing_only=${ongoingOnly}`
        );
        
        // Your backend returns { "orders": [...] }
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("Error syncing table orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTableOrders();
  }, [table?.public_id, ongoingOnly]); // Re-fetch if table changes or filter toggles

  if (!table) return null;

  const title = ongoingOnly ? "Ongoing Orders" : "All Table Orders";
  const accent = ongoingOnly ? "rose" : "violet";
  
  const theme = {
    rose: { 
      icon: "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-500", 
      badge: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20",
      total: "bg-rose-600 shadow-rose-200"
    },
    violet: { 
      icon: "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-500", 
      badge: "text-violet-600 bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20",
      total: "bg-slate-900 dark:bg-violet-600 shadow-slate-200"
    }
  }[accent];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-[#0f172a] h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 ${theme.icon}`}>
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white leading-none">{title}</h2>
              <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
                Table {table.table_number} <span className="mx-1 opacity-30">|</span> {table.zone_name || 'Main Zone'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        {/* Status Tracker Bar */}
        <div className="px-6 py-3 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                    {ongoingOnly ? "Live Activity" : "Order Logs"}
                </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">{table.public_id}</span>
        </div>

        {/* Orders List View */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[11px] font-bold uppercase tracking-widest opacity-60">Fetching from Table...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-700">
              {/* <ReceiptText size={48} strokeWidth={1} /> */}
              <p className="text-sm font-bold mt-2">No {ongoingOnly ? 'active' : ''} orders</p>
              <p className="text-[10px] opacity-60">Ready for a new session</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.order_id} className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/40 shadow-sm">
                <div className="p-4 border-b border-slate-50 dark:border-slate-800/50 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                        <Hash size={10} />
                        <span className="text-[10px] font-mono font-bold uppercase">{order.order_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={12} className="text-slate-400" />
                        <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase tracking-wider ${theme.badge}`}>
                    {order.status}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <img src={item.image} alt="" className="w-11 h-11 rounded-xl object-cover bg-slate-100 dark:bg-slate-800" />
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{order.currency} {item.unit_price}</p>
                      </div>
                    </div>
                  ))}

                  {order.special_request && (
                    <div className="mt-2 p-2 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/20 rounded-xl">
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 italic">
                        "{order.special_request}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="px-4 py-3 bg-slate-50/30 dark:bg-slate-800/20 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.payment_status}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{order.currency} {order.total}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Bill Summary */}
        {!loading && orders.length > 0 && (
  <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a]">
    <div className={`flex justify-between items-center p-5 rounded-3xl text-white shadow-xl ${theme.total}`}>
      <div>
        <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">
          {ongoingOnly ? "Current Session Total" : "History Total"}
        </p>
        <p className="text-2xl font-black tracking-tight">
          ₹{orders.reduce((acc, curr) => acc + parseFloat(curr.total), 0).toFixed(2)}
        </p>
      </div>

      {/* Conditionally render the print button only for ongoing orders */}
      {ongoingOnly ? (
        <button 
          onClick={() => console.log("Printing Invoice for:", table.public_id)}
          className="h-11 px-6 bg-white text-slate-900 dark:text-violet-700 hover:bg-slate-100 rounded-2xl text-[11px] font-black uppercase transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          <ReceiptText size={14} />
          Print Invoice
        </button>
      ) : (
        /* Optional: Show a different indicator or nothing for history */
        <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
          <Hash size={16} className="opacity-40" />
        </div>
      )}
    </div>
    
    {/* Subtle hint for non-ongoing view */}
    {!ongoingOnly && (
      <p className="text-center text-[9px] text-slate-500 mt-4 uppercase font-bold tracking-widest">
        Viewing archived logs for Table {table.table_number}
      </p>
    )}
  </div>
)}
      </div>
    </div>
  );
};
/* ================================================================
   TABLE FORM MODAL
================================================================ */
const EMPTY_TABLE = { table_number: "", capacity: "", table_type: "standard", zone: "", is_active: true, is_occupied: false, is_reserved_manual: false };

const TableFormModal = ({ initial, zones, onClose, title, submitLabel }) => {
  const dispatch = useDispatch();
  const [form,       setFormState] = useState({ ...EMPTY_TABLE, ...initial });
  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState({});

  const set = (key, val) => { setFormState((p) => ({ ...p, [key]: val })); setErrors((p) => ({ ...p, [key]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.table_number?.toString().trim()) e.table_number = "Table number is required";
    if (!form.capacity || isNaN(form.capacity) || Number(form.capacity) <= 0) e.capacity = "Enter a valid capacity";
    if (!form.zone) e.zone = "Select a zone";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const data = { ...form, table_number: form.table_number.toString(), capacity: parseInt(form.capacity) };
      const result = initial?.public_id
        ? await dispatch(updateAdminTable({ publicId: initial.public_id, data }))
        : await dispatch(createAdminTable(data));
      if (!result.error) onClose();
    } finally { setSubmitting(false); }
  };

  const Toggle = ({ label, field }) => (
    <button type="button" onClick={() => set(field, !form[field])}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all
        ${form[field] ? "bg-violet-600 border-violet-600 text-white" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"}`}
    >{label}</button>
  );

  const inputCls = (err) =>
    `w-full px-4 py-3 rounded-2xl border ${err ? "border-rose-400" : "border-slate-200 dark:border-slate-700"} bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 ring-violet-500/20 text-sm`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative z-10 w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center"><span className="text-lg">🪑</span></div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">Fill in the table details</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Table Number *</label>
              <input type="text" value={form.table_number} onChange={(e) => set("table_number", e.target.value)} placeholder="e.g. T1, 101, A-1" className={inputCls(errors.table_number)} />
              {errors.table_number && <p className="text-xs text-rose-500 mt-1">{errors.table_number}</p>}
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Capacity *</label>
              <input type="number" min="1" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="e.g. 4" className={inputCls(errors.capacity)} />
              {errors.capacity && <p className="text-xs text-rose-500 mt-1">{errors.capacity}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Table Type</label>
            <div className="flex flex-wrap gap-2">
              {TABLE_TYPES.map(({ value, label, icon }) => (
                <button key={value} type="button" onClick={() => set("table_type", value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all
                    ${form.table_type === value ? "bg-violet-600 border-violet-600 text-white" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-violet-300"}`}
                >{icon} {label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Zone *</label>
            <div className="relative">
              <select value={form.zone} onChange={(e) => set("zone", e.target.value)} className={`appearance-none ${inputCls(errors.zone)} pr-10`}>
                <option value="">— Select Zone —</option>
                {zones.map((z) => <option key={z.public_id} value={z.public_id}>{z.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {errors.zone && <p className="text-xs text-rose-500 mt-1">{errors.zone}</p>}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Status Flags</label>
            <div className="flex flex-wrap gap-2">
              <Toggle label="🟢 Active"   field="is_active" />
              <Toggle label="🔴 Occupied" field="is_occupied" />
              <Toggle label="📅 Reserved" field="is_reserved_manual" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-2xl bg-violet-600 text-white text-sm font-black hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {submitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================================================================
   ZONE FORM MODAL
================================================================ */
const ZoneFormModal = ({ initial = null, onClose }) => {
  const dispatch  = useDispatch();
  const isLoading = useSelector(selectAdminZonesLoading);
  const isEdit    = !!initial;

  const [name,        setName]        = useState(initial?.name        ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isActive,    setIsActive]    = useState(initial?.is_active   ?? true);
  const [nameError,   setNameError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setNameError("Zone name is required"); return; }
    const data = { name: name.trim(), description: description.trim() || null, is_active: isActive };
    const result = isEdit
      ? await dispatch(updateAdminZone({ publicId: initial.public_id, data }))
      : await dispatch(createAdminZone(data));
    if (!result.error) onClose();
  };

  const inputBase = "w-full px-4 py-3 rounded-2xl border bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 ring-violet-500/20 text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative z-10 w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center"><MapPin size={18} className="text-violet-600" /></div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{isEdit ? "Edit Zone" : "New Zone"}</h2>
              <p className="text-xs text-slate-400">{isEdit ? `Editing "${initial.name}"` : "Create a dining zone"}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Zone Name *</label>
            <input type="text" value={name} onChange={(e) => { setName(e.target.value); setNameError(""); }} placeholder="e.g. Main Hall, Garden, VIP Lounge…" className={`${inputBase} ${nameError ? "border-rose-400" : "border-slate-200 dark:border-slate-700"}`} />
            {nameError && <p className="text-xs text-rose-500 mt-1">{nameError}</p>}
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Optional description of this zone…" className={`${inputBase} border-slate-200 dark:border-slate-700 resize-none`} />
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div>
              <p className="text-sm font-black text-slate-800 dark:text-white">Active</p>
              <p className="text-xs text-slate-400 mt-0.5">Inactive zones are hidden from the floor plan</p>
            </div>
            <button type="button" onClick={() => setIsActive((v) => !v)}>
              {isActive ? <ToggleRight size={32} className="text-violet-600" /> : <ToggleLeft size={32} className="text-slate-400" />}
            </button>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button type="submit" disabled={isLoading} className="flex-1 py-3 rounded-2xl bg-violet-600 text-white text-sm font-black hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isLoading ? "Saving..." : isEdit ? "Save Changes" : "Create Zone"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================================================================
   ZONE CARD  (unchanged from original)
================================================================ */
const ZoneCard = ({ zone, tableCount, onEdit, gradientIdx }) => {
  const dispatch = useDispatch();
  const [confirming, setConfirming] = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [toggling,   setToggling]   = useState(false);

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return; }
    setDeleting(true);
    await dispatch(deleteAdminZone(zone.public_id));
    setDeleting(false); setConfirming(false);
  };

  const handleToggleActive = async (e) => {
    e.stopPropagation(); setToggling(true);
    await dispatch(updateAdminZone({ publicId: zone.public_id, data: { is_active: !zone.is_active } }));
    setToggling(false);
  };

  const gradient = ZONE_GRADIENTS[gradientIdx % ZONE_GRADIENTS.length];

  return (
    <div className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10 hover:border-violet-200 dark:hover:border-violet-800 ${!zone.is_active ? "opacity-60" : ""}`}>
      <div className={`relative h-36 bg-gradient-to-br ${gradient} flex items-end p-4`}>
        <div className="absolute top-3 right-3">
          <button onClick={handleToggleActive} disabled={toggling}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase backdrop-blur-sm transition-all
              ${zone.is_active ? "bg-emerald-500/90 text-white" : "bg-slate-700/80 text-slate-300"}`}
          >
            {toggling ? <Loader2 size={10} className="animate-spin" /> : <span className={`w-1.5 h-1.5 rounded-full ${zone.is_active ? "bg-white" : "bg-slate-400"}`} />}
            {zone.is_active ? "Active" : "Inactive"}
          </button>
        </div>
        <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-sm text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-xl">
          {tableCount} {tableCount === 1 ? "table" : "tables"}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="relative flex items-center gap-2">
          <MapPin size={14} className="text-white/80 flex-shrink-0" />
          <h3 className="font-black text-white text-base truncate leading-tight">{zone.name}</h3>
        </div>
      </div>

      <div className="p-4">
        {zone.description
          ? <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2 mb-3">"{zone.description}"</p>
          : <p className="text-xs text-slate-400 italic mb-3">No description</p>
        }
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider truncate">{zone.public_id}</p>
          {confirming ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-rose-500">Sure?</span>
              <button onClick={handleDelete} disabled={deleting} className="px-2.5 py-1.5 rounded-xl bg-rose-500 text-white text-[10px] font-black hover:bg-rose-600 flex items-center gap-1">
                {deleting && <Loader2 size={10} className="animate-spin" />}Yes
              </button>
              <button onClick={() => setConfirming(false)} className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black">No</button>
            </div>
          ) : (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={onEdit} className="p-2 rounded-xl text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"><Pencil size={15} /></button>
              <button onClick={handleDelete} className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"><Trash2 size={15} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   TABLE CARD — original card kept, adds:
     • all API fields displayed (IDs, timestamps, restaurant_id, qr_url)
     • "Ongoing Orders" button (always) 
     • "All Orders" button (always)
     • "Occupied by" user chip when occupied
     • light mode support
================================================================ */
const TableCard = React.forwardRef(({ table, zones, onEdit, onShowQr, onShowOrders, onShowOngoing }, ref) => {
  const dispatch = useDispatch();
  const [toggling,   setToggling]   = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [expanded,   setExpanded]   = useState(false);

  const toggleField = async (e, field) => {
    e.stopPropagation(); setToggling(field);
    await dispatch(updateAdminTable({ publicId: table.public_id, data: { [field]: !table[field] } }));
    setToggling(null);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirming) { setConfirming(true); return; }
    setDeleting(true);
    await dispatch(deleteAdminTable(table.public_id));
    setDeleting(false); setConfirming(false);
  };

  const zoneName  = typeof table.zone === "object" ? table.zone?.name : (zones.find((z) => z.public_id === table.zone)?.name ?? "—");
  const typeInfo  = TABLE_TYPES.find((t) => t.value === table.table_type) ?? TABLE_TYPES[0];
  const statusKey = table.is_occupied ? "occupied" : table.is_reserved_manual ? "reserved" : "available";
  const status    = STATUS_CONFIG[statusKey];
  const edited    = table.updated_at && table.updated_at !== table.created_at;

  return (
    <div ref={ref} className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 hover:border-violet-200 dark:hover:border-violet-800 ${!table.is_active ? "opacity-60" : ""}`}>

      {/* ── Existing card header (unchanged) ── */}
      <div className="relative h-44 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="absolute top-4 left-4">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${status.cls}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />{status.label}
          </div>
        </div>
        {!table.is_active && <div className="absolute top-4 right-4 bg-slate-700/80 text-white px-2.5 py-1 rounded-xl text-[9px] font-black uppercase">Inactive</div>}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-white tracking-tight">{table.table_number}</span>
          <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">{typeInfo.icon} {typeInfo.label}</span>
        </div>
        <div className="absolute bottom-4 right-4 bg-violet-600 text-white px-3 py-1 rounded-xl text-sm font-black flex items-center gap-1"><Users size={12} /> {table.capacity}</div>
        <div className="absolute bottom-4 left-4"><span className="text-[10px] font-black text-white/60 uppercase tracking-widest flex items-center gap-1"><MapPin size={10} /> {zoneName}</span></div>
      </div>

      <div className="p-5 flex-1 flex flex-col">

        {/* ── Existing 3-col info grid ── */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "Seats", value: `${table.capacity} pax` },
            { label: "Zone",  value: zoneName                },
            { label: "Type",  value: typeInfo.label          },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-[9px] font-black uppercase text-slate-400 mb-0.5">{label}</p>
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* ── NEW: IDs row ── */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 min-w-0">
            <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider mb-0.5">Table ID</p>
            <p className="text-[10px] font-mono text-slate-600 dark:text-slate-300 truncate">{table.public_id}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 min-w-0">
            <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider mb-0.5">Restaurant</p>
            <p className="text-[10px] font-mono text-slate-600 dark:text-slate-300 truncate">{table.restaurant_id}</p>
          </div>
        </div>

        {/* ── NEW: Zone ID row ── */}
        <div className="mb-3 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider mb-0.5">Zone ID</p>
          <p className="text-[10px] font-mono text-slate-600 dark:text-slate-300 truncate">
            {typeof table.zone === "string" ? table.zone : table.zone?.public_id}
            <span className="text-slate-400 dark:text-slate-500 ml-1.5">· {zoneName}</span>
          </p>
        </div>

        {/* ── NEW: Occupied by user ── */}
        {table.occupied_by_user_id && (
          <div className="mb-3 flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 px-3 py-2 rounded-xl">
            <User size={12} className="text-rose-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase text-rose-400 tracking-wider">Occupied by</p>
              <p className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 truncate">{table.occupied_by_user_id}</p>
            </div>
          </div>
        )}

        {/* ── Existing status toggles ── */}
        <div className="flex flex-wrap gap-1.5 mb-3 min-h-[1.5rem]">
          {[
            { field: "is_occupied",        label: "🔴 Occupied", activeClass: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-500/20",     hoverClass: "hover:border-rose-300" },
            { field: "is_reserved_manual", label: "📅 Reserved", activeClass: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-500/20", hoverClass: "hover:border-amber-300" },
            { field: "is_active",          label: "🟢 Active",   activeClass: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/20", hoverClass: "hover:border-emerald-300" },
          ].map(({ field, label, activeClass, hoverClass }) => (
            <button key={field} onClick={(e) => toggleField(e, field)} disabled={!!toggling}
              className={`flex items-center gap-1 text-[9px] font-black uppercase px-2 py-1 rounded-full border transition-all
                ${table[field] ? activeClass : `bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 ${hoverClass}`}`}
            >
              {toggling === field ? <Loader2 size={9} className="animate-spin" /> : null}
              {label}
            </button>
          ))}
        </div>

        {/* ── NEW: Timestamps ── */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider mb-0.5 flex items-center gap-1">
              <Clock size={7} /> Created
            </p>
            <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 leading-none">{fmtDate(table.created_at)}</p>
            <p className="text-[9px] text-slate-400 leading-none mt-0.5">{fmtTime(table.created_at)}</p>
            <p className="text-[9px] text-slate-300 dark:text-slate-600 leading-none mt-0.5">{timeAgo(table.created_at)}</p>
          </div>
          <div className={`px-2.5 py-1.5 rounded-xl border ${edited ? "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30" : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800"}`}>
            <p className={`text-[8px] font-black uppercase tracking-wider mb-0.5 flex items-center gap-1 ${edited ? "text-amber-500" : "text-slate-400"}`}>
              <RefreshCw size={7} /> Updated
            </p>
            {edited ? (
              <>
                <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 leading-none">{fmtDate(table.updated_at)}</p>
                <p className="text-[9px] text-amber-500/70 leading-none mt-0.5">{fmtTime(table.updated_at)}</p>
                <p className="text-[9px] text-amber-400/60 leading-none mt-0.5">{timeAgo(table.updated_at)}</p>
              </>
            ) : (
              <p className="text-[9px] text-slate-400 dark:text-slate-600">Never modified</p>
            )}
          </div>
        </div>

        {/* ── NEW: Expandable QR URL ── */}
        <div className="mb-3">
          <button onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-left group/qr">
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider flex-shrink-0">QR URL</p>
              <p className="text-[9px] font-mono text-slate-500 dark:text-slate-400 truncate">{table.qr_url}</p>
            </div>
            <ChevronDown size={10} className={`flex-shrink-0 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          {expanded && (
            <div className="mt-1.5 px-2.5 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
              <p className="text-[9px] font-mono text-slate-500 dark:text-slate-400 break-all leading-relaxed">{table.qr_url}</p>
              <a href={table.qr_url} target="_blank" rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-black uppercase text-violet-500 hover:text-violet-400 transition-colors">
                <ExternalLink size={9} /> Open in browser
              </a>
            </div>
          )}
        </div>

        {/* ── NEW: Orders buttons row ── */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Ongoing orders — rose, only relevant when occupied */}
          <button
            onClick={(e) => { e.stopPropagation(); onShowOngoing(); }}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl text-[10px] font-black uppercase border transition-all
              ${table.is_occupied
                ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300"
              }`}
          >
            {table.is_occupied && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />}
            <ShoppingBag size={11} />
            Ongoing
          </button>

          {/* All orders — violet always */}
          <button
            onClick={(e) => { e.stopPropagation(); onShowOrders(); }}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl text-[10px] font-black uppercase border bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800/50 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all"
          >
            <ShoppingBag size={11} />
            All Orders
          </button>
        </div>

        {/* ── Existing footer: QR + edit + delete ── */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button onClick={() => onShowQr()} title="Show QR" className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-500/10 dark:hover:text-violet-400 transition-colors"><QrCode size={18} /></button>
            <button onClick={() => onEdit()} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-500/10 dark:hover:text-violet-400 transition-colors"><Pencil size={18} /></button>
          </div>
          {confirming ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-rose-500">Sure?</span>
              <button onClick={handleDelete} disabled={deleting} className="px-2.5 py-1.5 rounded-xl bg-rose-500 text-white text-[10px] font-black hover:bg-rose-600 flex items-center gap-1">
                {deleting && <Loader2 size={10} className="animate-spin" />}Yes
              </button>
              <button onClick={(e) => { e.stopPropagation(); setConfirming(false); }} className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black">No</button>
            </div>
          ) : (
            <button onClick={handleDelete} className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-colors"><Trash2 size={18} /></button>
          )}
        </div>
      </div>
    </div>
  );
});
TableCard.displayName = "TableCard";

/* ================================================================
   ZONE MANAGEMENT PANEL  (unchanged from original)
================================================================ */
const ZoneManagement = ({ tables }) => {
  const dispatch      = useDispatch();
  const zones         = useSelector(selectAdminZones);
  const zonesLoading  = useSelector(selectAdminZonesLoading);
  const zoneSuccess   = useSelector(selectAdminZoneSuccess);
  const zoneError     = useSelector(selectAdminZoneError);
  const [showModal,    setShowModal]    = useState(false);
  const [editingZone,  setEditingZone]  = useState(null);
  const [searchZone,   setSearchZone]   = useState("");
  const [filterActive, setFilterActive] = useState("all");

  useEffect(() => {
    if (zoneSuccess || zoneError) {
      const t = setTimeout(() => dispatch(clearZoneMessages()), 3500);
      return () => clearTimeout(t);
    }
  }, [zoneSuccess, zoneError, dispatch]);

  const tableCountMap = tables.reduce((acc, t) => {
    const id = typeof t.zone === "object" ? t.zone?.public_id : t.zone;
    if (id) acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  const filtered = zones.filter((z) => {
    const matchName   = z.name.toLowerCase().includes(searchZone.toLowerCase());
    const matchActive = filterActive === "all" || (filterActive === "active" ? z.is_active : !z.is_active);
    return matchName && matchActive;
  });

  const activeCount   = zones.filter((z) => z.is_active).length;
  const inactiveCount = zones.length - activeCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Zones</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Organise your restaurant into dining areas
            {zones.length > 0 && <span className="ml-2 text-violet-500 font-bold">· {zones.length} total</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 ring-violet-500/20 text-sm" placeholder="Search zones…" value={searchZone} onChange={(e) => setSearchZone(e.target.value)} />
          </div>
          <button onClick={() => { setEditingZone(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-black hover:bg-violet-700 shadow-lg shadow-violet-500/30 whitespace-nowrap">
            <Plus size={16} /> New Zone
          </button>
        </div>
      </div>

      <ToastBanner success={zoneSuccess} error={zoneError} />

      <div className="grid grid-cols-3 gap-3">
        {[{ label: "Total", value: zones.length, color: "text-slate-900 dark:text-white" }, { label: "Active", value: activeCount, color: "text-emerald-600" }, { label: "Inactive", value: inactiveCount, color: "text-slate-400" }].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-black uppercase text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {[["all","All"],["active","Active"],["inactive","Inactive"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilterActive(val)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all ${filterActive === val ? "bg-violet-600 text-white border-violet-600" : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-violet-300"}`}
          >{label}</button>
        ))}
      </div>

      {zonesLoading && zones.length === 0 ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="animate-spin text-violet-600" size={36} /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
          <MapPin size={40} className="mb-3 opacity-30" />
          <p className="font-bold uppercase text-xs tracking-widest">{searchZone ? "No matching zones" : "No zones yet"}</p>
          {!searchZone && <button onClick={() => setShowModal(true)} className="mt-4 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-xs font-black hover:bg-violet-700">+ Create your first zone</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((zone, i) => (
            <ZoneCard key={zone.public_id} zone={zone} gradientIdx={i} tableCount={tableCountMap[zone.public_id] || 0} onEdit={() => { setEditingZone(zone); setShowModal(true); }} />
          ))}
        </div>
      )}

      {showModal && <ZoneFormModal initial={editingZone} onClose={() => { setShowModal(false); setEditingZone(null); }} />}
    </div>
  );
};

/* ================================================================
   MAIN COMPONENT  (original structure kept intact)
================================================================ */
const TableManagement = () => {
  const dispatch      = useDispatch();
  const tables        = useSelector(selectAdminTables);
  const zones         = useSelector(selectAdminZones);
  const filters       = useSelector(selectAdminTableFilters);
  const pagination    = useSelector(selectAdminTablePagination);
  const loading       = useSelector(selectAdminTableLoading);
  const isRefreshing  = useSelector(selectAdminTableRefreshing);
  const loadingMore   = useSelector(selectAdminTableLoadingMore);
  const fetched       = useSelector(selectAdminTableFetched);
  const zoneFetched   = useSelector(selectAdminZoneFetched)
  const tableSuccess  = useSelector(selectAdminTableSuccess);
  const tableError    = useSelector(selectAdminTableError);

  const [activeTab,      setActiveTab]      = useState("tables");
  const [searchTerm,     setSearchTerm]     = useState(filters.searchQuery);
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [editingTable,   setEditingTable]   = useState(null);
  const [showFilters,    setShowFilters]    = useState(false);
  const [showQrModal,    setShowQrModal]    = useState(null);
  const [selectedZone,   setSelectedZone]   = useState(filters.zone || "");
  const [selectedStatus, setSelectedStatus] = useState("");

  // NEW: orders drawer state
  const [ordersTarget,  setOrdersTarget]  = useState(null); // { table, ongoingOnly }

  const observer  = useRef();
  const isMounted = useRef(false);

  useEffect(() => {
    if (tableSuccess || tableError) {
      const t = setTimeout(() => dispatch(clearTableMessages()), 3500);
      return () => clearTimeout(t);
    }
  }, [tableSuccess, tableError, dispatch]);

  useEffect(() => {
    if (!zoneFetched) dispatch(fetchAdminZones());
    if (!fetched) dispatch(fetchAdminTables(filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    dispatch(fetchAdminTables(filters));
  }, [
    dispatch,
    filters.searchQuery,
    filters.isOccupied,
    filters.isReserved,
    filters.isActive,
    filters.zone,
    filters.tableType,
    filters.sortBy,
    filters.currentPage,
  ]);

  useEffect(() => {
    const t = setTimeout(() => dispatch(setTableSearch(searchTerm)), 400);
    return () => clearTimeout(t);
  }, [searchTerm, dispatch]);

  useEffect(() => {
    if (!isMounted.current) return;
    dispatch(setTableFilter({ zone: selectedZone || null }));
  }, [selectedZone, dispatch]);

  useEffect(() => {
    if (!isMounted.current) return;
    let isOccupied = null, isReserved = null;
    if (selectedStatus === "occupied")  isOccupied = true;
    if (selectedStatus === "reserved")  isReserved = true;
    if (selectedStatus === "available") { isOccupied = false; isReserved = false; }
    dispatch(setTableFilter({ isOccupied, isReserved }));
  }, [selectedStatus, dispatch]);

  const lastTableRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && pagination.hasNext) {
          dispatch(setTablePage(filters.currentPage + 1));
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, pagination.hasNext, filters.currentPage, dispatch]
  );

  const clearFilters = () => {
    setSearchTerm(""); setSelectedZone(""); setSelectedStatus("");
    dispatch(resetTableFilters());
  };

  const activeFilterCount =
    (searchTerm ? 1 : 0) + (selectedZone ? 1 : 0) + (selectedStatus ? 1 : 0);

  // NEW: stats for the strip
  const occupiedCount  = tables.filter((t) => t.is_occupied).length;
  const availableCount = tables.filter((t) => !t.is_occupied && !t.is_reserved_manual && t.is_active).length;
  const reservedCount  = tables.filter((t) => t.is_reserved_manual).length;
  const inactiveCount  = tables.filter((t) => !t.is_active).length;

  // Helper to enrich table with resolved zone name for drawers
  const enrichTable = (table) => ({
    ...table,
    zoneName: typeof table.zone === "object"
      ? table.zone?.name
      : (zones.find((z) => z.public_id === table.zone)?.name ?? table.zone ?? "—"),
  });

  return (
    <>
      {/* Orders drawer */}
      {ordersTarget && (
        <OrdersDrawer
          table={ordersTarget.table}
          ongoingOnly={ordersTarget.ongoingOnly}
          onClose={() => setOrdersTarget(null)}
        />
      )}

      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-4 lg:p-8 transition-colors duration-300">
        <header className="flex flex-col gap-5 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Table Management</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Manage tables, zones, and QR codes
                {pagination.totalItems > 0 && <span className="ml-2 text-violet-500 font-bold">· {pagination.totalItems} total</span>}
              </p>
            </div>
            <TabBar active={activeTab} onChange={setActiveTab} zoneCount={zones.length} tableCount={pagination.totalItems} />
          </div>
        </header>

        {activeTab === "tables" && (
          <>
            {/* NEW: Stats strip */}
            {(tables.length > 0 || pagination.totalItems > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                {[
                  { label: "Total",     value: pagination.totalItems || tables.length, color: "text-slate-800 dark:text-white" },
                  { label: "Available", value: availableCount,                         color: "text-emerald-500"               },
                  { label: "Occupied",  value: occupiedCount,                          color: "text-rose-500"                  },
                  { label: "Reserved",  value: reservedCount,                          color: "text-amber-500"                 },
                  { label: "Inactive",  value: inactiveCount,                          color: "text-slate-400"                 },
                ].map((s) => (
                  <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
                    <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Toolbar — unchanged */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                <input
                  className="w-full pl-12 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 ring-violet-500/20 placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="Search table number, zone, ID…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isRefreshing && (
                  <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-violet-400" />
                )}
              </div>
              <button onClick={() => setShowFilters((v) => !v)}
                className={`relative p-3 rounded-2xl border transition-all
                  ${showFilters || activeFilterCount > 0
                    ? "bg-violet-50 dark:bg-violet-500/10 border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900"
                  }`}
              >
                <SlidersHorizontal size={20} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-violet-600 text-white text-[9px] font-black flex items-center justify-center">{activeFilterCount}</span>
                )}
              </button>
              <button onClick={() => dispatch(fetchAdminTables({ ...filters, currentPage: 1 }))}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <RefreshCw size={20} className={loading || isRefreshing ? "animate-spin text-violet-400" : ""} />
              </button>
              <button onClick={() => setShowAddModal(true)} className="p-3 bg-violet-600 text-white rounded-2xl shadow-lg shadow-violet-500/30 hover:bg-violet-700 transition-all">
                <Plus size={24} />
              </button>
            </div>

            <ToastBanner success={tableSuccess} error={tableError} />

            {/* Filter panel — unchanged structure */}
            {showFilters && (
              <div className="mt-4 mb-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-5">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Zone</p>
                  <div className="relative w-full sm:w-64">
                    <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)} className="appearance-none w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm pr-10 outline-none focus:ring-2 ring-violet-500/20">
                      <option value="">All Zones</option>
                      {zones.map((z) => <option key={z.public_id} value={z.public_id}>{z.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {STATUS_OPTS.map((opt) => (
                      <FilterPill key={opt.value} label={opt.label} active={selectedStatus === opt.value} onClick={() => setSelectedStatus(opt.value)} />
                    ))}
                  </div>
                </div>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-600">✕ Clear all filters</button>
                )}
              </div>
            )}

            {/* Grid — unchanged layout */}
            {loading && !loadingMore ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="animate-spin text-violet-600 mb-4" size={40} />
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Loading tables…</p>
              </div>
            ) : tables.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <span className="text-5xl mb-4">🪑</span>
                <p className="font-bold uppercase text-xs tracking-widest">No tables found</p>
                <button onClick={() => setShowAddModal(true)} className="mt-4 px-5 py-2.5 bg-violet-600 text-white rounded-2xl text-xs font-black hover:bg-violet-700">+ Add your first table</button>
              </div>
            ) : (
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4 transition-opacity duration-200 ${isRefreshing ? "opacity-60" : "opacity-100"}`}>
                {tables.map((table, index) => (
                  <TableCard
                    key={table.public_id}
                    table={table}
                    zones={zones}
                    ref={index === tables.length - 1 ? lastTableRef : null}
                    onEdit={() => setEditingTable(table)}
                    onShowQr={() => setShowQrModal({ number: table.table_number, qr: table.qr_url })}
                    onShowOrders={() => setOrdersTarget({ table: enrichTable(table), ongoingOnly: false })}
                    onShowOngoing={() => setOrdersTarget({ table: enrichTable(table), ongoingOnly: true })}
                  />
                ))}
              </div>
            )}

            {loadingMore && (
              <div className="flex justify-center p-12">
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-3 rounded-full shadow-lg border border-slate-100 dark:border-slate-800">
                  <Loader2 className="animate-spin text-violet-600" size={20} />
                  <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Loading more…</span>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "zones" && <ZoneManagement tables={tables} />}
      </div>

      {showAddModal  && <TableFormModal zones={zones} onClose={() => setShowAddModal(false)} title="Add New Table" submitLabel="Add Table" />}
      {editingTable  && <TableFormModal initial={editingTable} zones={zones} onClose={() => setEditingTable(null)} title={`Edit Table ${editingTable.table_number}`} submitLabel="Save Changes" />}
      {showQrModal   && <QrCodeModal tableNumber={showQrModal.number} qrUrl={showQrModal.qr} onClose={() => setShowQrModal(null)} />}
    </>
  );
};

export default TableManagement;