import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  FileText,
  Globe,
  Edit3,
  X,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  Hash,
  Locate,
} from "lucide-react";
import {
  fetchRestaurantDetails,
  updateRestaurantDetails,
  clearRestaurantMessages,
  selectRestaurantDetails,
  selectRestaurantLoading,
  selectRestaurantRefreshing,
  selectRestaurantSuccess,
  selectRestaurantError,
  selectRestaurantFetched
} from "../../../store/slices/restaurantAdminSlice/restaurantDetailsSlice";

/* ──────────────────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────────────────── */
const fmt12 = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString([], {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

/* ──────────────────────────────────────────────────────────
   TOAST BANNER  (same as DishManagement)
────────────────────────────────────────────────────────── */
const ToastBanner = ({ success, error }) => {
  if (!success && !error) return null;
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold border mb-4 ${
        success
          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
          : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
      }`}
    >
      {success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      {success || error}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   DETAIL ROW  — label + value pair inside a card
────────────────────────────────────────────────────────── */
const DetailRow = ({
  icon: Icon,
  label,
  value,
  mono = false,
  badge = null,
}) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <div className="mt-0.5 w-7 h-7 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0">
      <Icon size={13} className="text-violet-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
        {label}
      </p>
      {badge ? (
        badge
      ) : (
        <p
          className={`text-sm font-semibold text-slate-800 dark:text-slate-100 truncate ${
            mono ? "font-mono tracking-wide text-xs" : ""
          }`}
        >
          {value || "—"}
        </p>
      )}
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────
   SECTION CARD  wrapper
────────────────────────────────────────────────────────── */
const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
      <div className="w-8 h-8 rounded-2xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
        <Icon size={15} className="text-violet-600 dark:text-violet-400" />
      </div>
      <span className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
        {title}
      </span>
    </div>
    <div className="px-5 py-1">{children}</div>
  </div>
);

/* ──────────────────────────────────────────────────────────
   EDIT DRAWER
────────────────────────────────────────────────────────── */
const inputCls =
  "w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 ring-violet-500/20 text-sm transition-all";

const FieldLabel = ({ children }) => (
  <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
    {children}
  </label>
);

/* ──────────────────────────────────────────────────────────
   LEAFLET MAP PICKER  (OpenStreetMap + Nominatim, no API key)
   onAddressPick → fills address, city, state, pincode, lat, lng
────────────────────────────────────────────────────────── */
function MapPicker({ lat, lng, onAddressPick }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);
  const markerRef = useRef(null);
  const onAddressRef = useRef(onAddressPick); // always-fresh callback ref
  const skipSyncRef = useRef(false); // prevents feedback loop

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const debounceRef = useRef(null);
  const searchBoxRef = useRef(null);

  // Keep callback ref fresh on every render
  useEffect(() => {
    onAddressRef.current = onAddressPick;
  });

  /* ── Load Leaflet CSS + JS once, then init map ── */
  useEffect(() => {
    function doInit() {
      if (window.L) {
        initMap();
        return;
      }
    }
    if (document.getElementById("leaflet-css")) {
      doInit();
    } else {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    }
    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Sync external lat/lng → marker (skip when we triggered the change) ── */
  useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }
    if (!instanceRef.current || !markerRef.current) return;
    const la = parseFloat(lat);
    const lo = parseFloat(lng);
    if (isNaN(la) || isNaN(lo)) return;
    markerRef.current.setLatLng([la, lo]);
    instanceRef.current.setView([la, lo], instanceRef.current.getZoom());
  }, [lat, lng]);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const h = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target))
        setShowDrop(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function initMap() {
    if (!mapRef.current || instanceRef.current) return;
    const L = window.L;
    const la = parseFloat(lat) || 11.8745;
    const lo = parseFloat(lng) || 75.3704;
    const ll = [la, lo];

    const map = L.map(mapRef.current, { zoomControl: false }).setView(ll, 15);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    const icon = L.divIcon({
      className: "",
      html: `<div style="width:26px;height:26px;background:#7c3aed;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 10px rgba(124,58,237,.55)"></div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 26],
    });
    const marker = L.marker(ll, { draggable: true, icon }).addTo(map);

    // Drag end
    marker.on("dragend", (e) => {
      const pos = e.target.getLatLng();
      handleMapPick(pos.lat, pos.lng);
    });

    // Click on map
    map.on("click", (e) => {
      marker.setLatLng([e.latlng.lat, e.latlng.lng]);
      handleMapPick(e.latlng.lat, e.latlng.lng);
    });

    instanceRef.current = map;
    markerRef.current = marker;
  }

  /* ── Core: reverse geocode a lat/lng and emit all fields ── */
  async function handleMapPick(la, lo) {
    skipSyncRef.current = true; // we'll update form ourselves, don't re-sync marker
    const laS = la.toFixed(6);
    const loS = lo.toFixed(6);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${laS}&lon=${loS}&format=json&addressdetails=1`,
        { headers: { "Accept-Language": "en" } },
      );
      const data = await res.json();
      emitAddress(data.address || {}, laS, loS);
    } catch {
      // emit coords even if geocode fails
      onAddressRef.current({ latitude: laS, longitude: loS });
    }
  }

  /* ── Parse Nominatim address → form fields ── */
  function emitAddress(a, laS, loS) {
    const road =
      a.road || a.pedestrian || a.footway || a.street || a.amenity || "";
    const suburb = a.suburb || a.neighbourhood || a.quarter || "";
    const address = [road, suburb].filter(Boolean).join(", ");
    const city = a.city || a.town || a.village || a.county || a.district || "";
    const state = a.state || "";
    const pincode = a.postcode || "";
    onAddressRef.current({
      address,
      city,
      state,
      pincode,
      latitude: laS,
      longitude: loS,
    });
  }

  /* ── Forward search (Nominatim) ── */
  async function searchPlaces(q) {
    if (!q.trim()) {
      setSuggestions([]);
      setShowDrop(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=6&countrycodes=in`,
        { headers: { "Accept-Language": "en" } },
      );
      const data = await res.json();
      setSuggestions(data);
      setShowDrop(data.length > 0);
    } catch {
      setSuggestions([]);
    }
    setSearching(false);
  }

  /* ── Pick a suggestion from dropdown ── */
  function pickSuggestion(item) {
    const la = parseFloat(item.lat);
    const lo = parseFloat(item.lon);
    const laS = la.toFixed(6);
    const loS = lo.toFixed(6);

    if (instanceRef.current && markerRef.current) {
      skipSyncRef.current = true;
      markerRef.current.setLatLng([la, lo]);
      instanceRef.current.setView([la, lo], 16);
    }
    emitAddress(item.address || {}, laS, loS);
    setQuery(item.display_name.split(",").slice(0, 3).join(","));
    setShowDrop(false);
    setSuggestions([]);
  }

  /* ── Browser Geolocation (the fixed version) ── */
  const geolocate = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported by your browser.");
      return;
    }
    setLocating(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const la = pos.coords.latitude;
        const lo = pos.coords.longitude;

        // 1. Move the map + marker directly (no state involved)
        if (instanceRef.current && markerRef.current) {
          skipSyncRef.current = true;
          markerRef.current.setLatLng([la, lo]);
          instanceRef.current.setView([la, lo], 17);
        }

        // 2. Reverse geocode and fill all form fields
        handleMapPick(la, lo).finally(() => setLocating(false));
      },
      (err) => {
        setLocating(false);
        const msgs = {
          1: "Location permission denied. Please allow location access in your browser.",
          2: "Location unavailable. Try again.",
          3: "Location request timed out.",
        };
        setGeoError(msgs[err.code] || "Could not get location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleSearchInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPlaces(v), 420);
  };

  return (
    <div className="space-y-2">
      {/* Search + Locate row */}
      <div ref={searchBoxRef} className="relative">
        <div className="relative flex items-center gap-2">
          {/* Search input */}
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {searching ? (
                <Loader2 size={14} className="animate-spin text-violet-500" />
              ) : (
                <MapPin size={14} />
              )}
            </div>
            <input
              type="text"
              value={query}
              onChange={handleSearchInput}
              onFocus={() => suggestions.length > 0 && setShowDrop(true)}
              placeholder="Search address, landmark, area…"
              className={`${inputCls} pl-9`}
            />
          </div>

          {/* Locate me — separate button, clearly visible */}
          <button
            type="button"
            onClick={geolocate}
            disabled={locating}
            title="Use my current location"
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-violet-600 text-white text-[11px] font-black disabled:opacity-60 hover:bg-violet-700 active:scale-95 transition-all shadow-md shadow-violet-500/30 whitespace-nowrap"
          >
            {locating ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Locate size={13} />
            )}
            {locating ? "Locating…" : "My Location"}
          </button>
        </div>

        {/* Geo error */}
        {geoError && (
          <p className="mt-1.5 text-[10px] font-bold text-rose-500 flex items-center gap-1">
            <AlertCircle size={11} /> {geoError}
          </p>
        )}

        {/* Dropdown suggestions */}
        {showDrop && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-[1000] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
            {suggestions.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pickSuggestion(item)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-violet-50 dark:hover:bg-violet-900/20 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
              >
                <MapPin
                  size={13}
                  className="text-violet-500 mt-0.5 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {item.display_name.split(",").slice(0, 2).join(",")}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {item.display_name.split(",").slice(2, 5).join(",")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div
        className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative"
        style={{ height: 280 }}
      >
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
        <div className="absolute bottom-10 left-2 z-[999] pointer-events-none">
          <span className="text-[9px] font-black uppercase tracking-widest bg-white/90 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg">
            Click map or drag pin to set location
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Validation rules ── */
const VALIDATORS = {
  name: (v) => (!v.trim() ? "Restaurant name is required" : null),
  phone: (v) =>
    !v.trim()
      ? "Phone number is required"
      : !/^\+?[0-9]{7,15}$/.test(v.trim())
        ? "Enter a valid phone number (7-15 digits)"
        : null,
  email: (v) =>
    !v.trim()
      ? "Email is required"
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
        ? "Enter a valid email address"
        : null,
  address: (v) => (!v.trim() ? "Street address is required" : null),
  city: (v) => (!v.trim() ? "City is required" : null),
  state: (v) => (!v.trim() ? "State is required" : null),
  pincode: (v) =>
    !v.trim()
      ? "Pincode is required"
      : !/^[0-9]{6}$/.test(v.trim())
        ? "Pincode must be 6 digits"
        : null,
  latitude: (v) =>
    !v.toString().trim()
      ? "Latitude is required"
      : isNaN(parseFloat(v)) || parseFloat(v) < -90 || parseFloat(v) > 90
        ? "Enter a valid latitude (-90 to 90)"
        : null,
  longitude: (v) =>
    !v.toString().trim()
      ? "Longitude is required"
      : isNaN(parseFloat(v)) || parseFloat(v) < -180 || parseFloat(v) > 180
        ? "Enter a valid longitude (-180 to 180)"
        : null,
  opening_time: (v) => (!v ? "Opening time is required" : null),
  closing_time: (v, form) =>
    !v
      ? "Closing time is required"
      : v <= form.opening_time
        ? "Closing time must be after opening time"
        : null,
  gst_number: (v) =>
    !v.trim()
      ? "GST number is required"
      : !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
            v.trim().toUpperCase(),
          )
        ? "Enter a valid GST number (e.g. 32AAQCS4567M1Z8)"
        : null,
  fssai_license: (v) =>
    !v.trim()
      ? "FSSAI license is required"
      : !/^[0-9]{14}$/.test(v.trim())
        ? "FSSAI must be 14 digits"
        : null,
};

function validate(form) {
  const errs = {};
  Object.keys(VALIDATORS).forEach((k) => {
    const msg = VALIDATORS[k](form[k] ?? "", form);
    if (msg) errs[k] = msg;
  });
  return errs;
}

/* ── Small inline error message ── */
const ErrMsg = ({ msg }) =>
  msg ? (
    <p className="flex items-center gap-1 mt-1 text-[10px] font-bold text-rose-500">
      <AlertCircle size={10} className="flex-shrink-0" /> {msg}
    </p>
  ) : null;

/* ── Input border helper ── */
const fieldCls = (err) =>
  `${inputCls} ${err ? "border-rose-400 dark:border-rose-500 focus:ring-rose-400/20" : ""}`;

function EditDrawer({ restaurant, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    name: restaurant.name ?? "",
    address: restaurant.address ?? "",
    city: restaurant.city ?? "",
    state: restaurant.state ?? "",
    pincode: restaurant.pincode ?? "",
    latitude: restaurant.latitude ?? "",
    longitude: restaurant.longitude ?? "",
    phone: restaurant.phone ?? "",
    email: restaurant.email ?? "",
    is_open: restaurant.is_open ?? false,
    opening_time: restaurant.opening_time?.slice(0, 5) ?? "",
    closing_time: restaurant.closing_time?.slice(0, 5) ?? "",
    gst_number: restaurant.gst_number ?? "",
    fssai_license: restaurant.fssai_license ?? "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /* update field + clear its error */
  const set = (k) => (e) => {
    const val = e.target.value;
    setForm((f) => {
      const next = { ...f, [k]: val };
      if (touched[k]) {
        const msg = VALIDATORS[k]?.(val, next) ?? null;
        setErrors((er) => ({ ...er, [k]: msg }));
      }
      return next;
    });
  };

  /* mark touched on blur + run validation */
  const blur = (k) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    const msg = VALIDATORS[k]?.(form[k] ?? "", form) ?? null;
    setErrors((er) => ({ ...er, [k]: msg }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate all fields at once
    const errs = validate(form);
    // Mark everything touched
    const allTouched = Object.keys(VALIDATORS).reduce(
      (a, k) => ({ ...a, [k]: true }),
      {},
    );
    setTouched(allTouched);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return; // stop if any error

    const payload = { ...form };
    if (payload.opening_time?.length === 5) payload.opening_time += ":00";
    if (payload.closing_time?.length === 5) payload.closing_time += ":00";
    onSave(payload);
  };

  const errorCount = Object.values(errors).filter(Boolean).length;

  const SecHead = ({ label }) => (
    <p className="text-[9px] font-black uppercase tracking-widest text-violet-500 border-b border-violet-100 dark:border-violet-900/40 pb-1.5 mt-6 mb-4">
      {label}
    </p>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(15,23,42,.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[520px] h-full bg-white dark:bg-slate-900 flex flex-col shadow-2xl"
        style={{ animation: "slideRight .28s cubic-bezier(.32,1,.5,1)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 bg-slate-50/60 dark:bg-slate-800/30">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Edit Restaurant
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {errorCount > 0 ? (
                <span className="text-rose-500 font-bold">
                  {errorCount} field{errorCount > 1 ? "s" : ""} need attention
                </span>
              ) : (
                "All fields are required"
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 pb-8"
          noValidate
        >
          {/* ── Basic Info ── */}
          <SecHead label="Basic Info" />
          <div className="space-y-3">
            <div>
              <FieldLabel>Restaurant Name *</FieldLabel>
              <input
                className={fieldCls(errors.name && touched.name)}
                value={form.name}
                onChange={set("name")}
                onBlur={blur("name")}
                placeholder="e.g. Saffron Courtyard"
              />
              <ErrMsg msg={touched.name && errors.name} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Phone *</FieldLabel>
                <input
                  className={fieldCls(errors.phone && touched.phone)}
                  value={form.phone}
                  onChange={set("phone")}
                  onBlur={blur("phone")}
                  placeholder="+91XXXXXXXXXX"
                />
                <ErrMsg msg={touched.phone && errors.phone} />
              </div>
              <div>
                <FieldLabel>Email *</FieldLabel>
                <input
                  type="email"
                  className={fieldCls(errors.email && touched.email)}
                  value={form.email}
                  onChange={set("email")}
                  onBlur={blur("email")}
                  placeholder="hello@restaurant.in"
                />
                <ErrMsg msg={touched.email && errors.email} />
              </div>
            </div>
          </div>

          {/* ── Location ── */}
          <SecHead label="Location" />
          <div className="space-y-3">
            <div>
              <FieldLabel>Street Address *</FieldLabel>
              <input
                className={fieldCls(errors.address && touched.address)}
                value={form.address}
                onChange={set("address")}
                onBlur={blur("address")}
                placeholder="Street address"
              />
              <ErrMsg msg={touched.address && errors.address} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>City *</FieldLabel>
                <input
                  className={fieldCls(errors.city && touched.city)}
                  value={form.city}
                  onChange={set("city")}
                  onBlur={blur("city")}
                />
                <ErrMsg msg={touched.city && errors.city} />
              </div>
              <div>
                <FieldLabel>State *</FieldLabel>
                <input
                  className={fieldCls(errors.state && touched.state)}
                  value={form.state}
                  onChange={set("state")}
                  onBlur={blur("state")}
                />
                <ErrMsg msg={touched.state && errors.state} />
              </div>
              <div>
                <FieldLabel>Pincode *</FieldLabel>
                <input
                  className={fieldCls(errors.pincode && touched.pincode)}
                  value={form.pincode}
                  onChange={set("pincode")}
                  onBlur={blur("pincode")}
                  placeholder="6-digit pincode"
                  maxLength={6}
                />
                <ErrMsg msg={touched.pincode && errors.pincode} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Latitude *</FieldLabel>
                <input
                  className={fieldCls(errors.latitude && touched.latitude)}
                  value={form.latitude}
                  onChange={set("latitude")}
                  onBlur={blur("latitude")}
                  placeholder="e.g. 11.874500"
                />
                <ErrMsg msg={touched.latitude && errors.latitude} />
              </div>
              <div>
                <FieldLabel>Longitude *</FieldLabel>
                <input
                  className={fieldCls(errors.longitude && touched.longitude)}
                  value={form.longitude}
                  onChange={set("longitude")}
                  onBlur={blur("longitude")}
                  placeholder="e.g. 75.370200"
                />
                <ErrMsg msg={touched.longitude && errors.longitude} />
              </div>
            </div>
            <div>
              <FieldLabel>Pin on Map</FieldLabel>
              <MapPicker
                lat={form.latitude}
                lng={form.longitude}
                onAddressPick={(fields) => {
                  setForm((f) => ({ ...f, ...fields }));
                  // clear map-filled field errors immediately
                  setErrors((er) => ({
                    ...er,
                    address: null,
                    city: null,
                    state: null,
                    pincode: null,
                    latitude: null,
                    longitude: null,
                  }));
                }}
              />
              <p className="text-[9px] text-slate-400 mt-1.5 font-semibold">
                Search, click, or drag the pin — address fields fill
                automatically.
              </p>
            </div>
          </div>

          {/* ── Hours & Status ── */}
          <SecHead label="Hours &amp; Status" />
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div>
                <p className="text-sm font-black text-slate-800 dark:text-white">
                  Restaurant Status
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customers will see this as{" "}
                  <span
                    className={
                      form.is_open
                        ? "text-emerald-500 font-bold"
                        : "text-slate-400 font-bold"
                    }
                  >
                    {form.is_open ? "Open" : "Closed"}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, is_open: !f.is_open }))}
              >
                {form.is_open ? (
                  <ToggleRight size={34} className="text-violet-600" />
                ) : (
                  <ToggleLeft size={34} className="text-slate-400" />
                )}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Opening Time *</FieldLabel>
                <input
                  type="time"
                  className={fieldCls(
                    errors.opening_time && touched.opening_time,
                  )}
                  value={form.opening_time}
                  onChange={set("opening_time")}
                  onBlur={blur("opening_time")}
                />
                <ErrMsg msg={touched.opening_time && errors.opening_time} />
              </div>
              <div>
                <FieldLabel>Closing Time *</FieldLabel>
                <input
                  type="time"
                  className={fieldCls(
                    errors.closing_time && touched.closing_time,
                  )}
                  value={form.closing_time}
                  onChange={set("closing_time")}
                  onBlur={blur("closing_time")}
                />
                <ErrMsg msg={touched.closing_time && errors.closing_time} />
              </div>
            </div>
          </div>

          {/* ── Compliance ── */}
          <SecHead label="Compliance" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>GST Number *</FieldLabel>
              <input
                className={`${fieldCls(errors.gst_number && touched.gst_number)} font-mono text-xs tracking-wide`}
                value={form.gst_number}
                onChange={set("gst_number")}
                onBlur={blur("gst_number")}
                placeholder="32AAQCS4567M1Z8"
                maxLength={15}
              />
              <ErrMsg msg={touched.gst_number && errors.gst_number} />
            </div>
            <div>
              <FieldLabel>FSSAI License *</FieldLabel>
              <input
                className={`${fieldCls(errors.fssai_license && touched.fssai_license)} font-mono text-xs tracking-wide`}
                value={form.fssai_license}
                onChange={set("fssai_license")}
                onBlur={blur("fssai_license")}
                placeholder="14-digit number"
                maxLength={14}
              />
              <ErrMsg msg={touched.fssai_license && errors.fssai_license} />
            </div>
          </div>

          {/* Summary error banner shown only on submit-attempt */}
          {errorCount > 0 && Object.keys(touched).length > 0 && (
            <div className="mt-5 flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
              <AlertCircle
                size={15}
                className="text-rose-500 mt-0.5 flex-shrink-0"
              />
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                Please fix {errorCount} error{errorCount > 1 ? "s" : ""} before
                saving.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-2xl bg-violet-600 text-white text-sm font-black hover:bg-violet-700 flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-violet-500/30 transition-all"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <style>{`@keyframes slideRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function RestaurantDetailsPage() {
  const dispatch = useDispatch();
  const restaurant = useSelector(selectRestaurantDetails);
  const loading = useSelector(selectRestaurantLoading);
  const isRefreshing = useSelector(selectRestaurantRefreshing);
  const successMsg = useSelector(selectRestaurantSuccess);
  const errorMsg = useSelector(selectRestaurantError);
  const detailsFeched = useSelector(selectRestaurantFetched)
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if(!detailsFeched)
    dispatch(fetchRestaurantDetails());
  }, [dispatch]);

  useEffect(() => {
    if (successMsg || errorMsg) {
      setSaving(false);
      if (successMsg) setEditOpen(false);
      const t = setTimeout(() => dispatch(clearRestaurantMessages()), 3500);
      return () => clearTimeout(t);
    }
  }, [successMsg, errorMsg, dispatch]);

  const handleSave = (payload) => {
    setSaving(true);
    dispatch(updateRestaurantDetails(payload));
  };

  /* ── Skeleton ── */
  if (loading || !restaurant) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-4 lg:p-8 transition-colors duration-300">
        <style>{`
          @keyframes shimmer {
            0%   { background-position: 200% 0 }
            100% { background-position: -200% 0 }
          }
          .skel {
            background: linear-gradient(90deg,
              var(--skel-base) 25%,
              var(--skel-shine) 50%,
              var(--skel-base) 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.6s ease-in-out infinite;
          }
          :root {
            --skel-base:  #e2e8f0;
            --skel-shine: #f8fafc;
          }
          .dark {
            --skel-base:  #1e293b;
            --skel-shine: #273548;
          }
        `}</style>

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-2.5">
            <div className="skel h-9 w-64 rounded-2xl" />
            <div className="skel h-4 w-48 rounded-xl" />
          </div>
          <div className="flex gap-3">
            <div className="skel h-11 w-11 rounded-2xl" />
            <div className="skel h-11 w-32 rounded-2xl" />
          </div>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skel h-20 rounded-3xl" />
          ))}
        </div>

        {/* Detail cards — mimic the real card structure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[5, 3, 3, 3].map((rows, ci) => (
            <div
              key={ci}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden"
            >
              {/* Card header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
                <div className="skel w-8 h-8 rounded-2xl flex-shrink-0" />
                <div className="skel h-4 w-36 rounded-xl" />
              </div>
              {/* Card rows */}
              <div className="px-5 py-2 divide-y divide-slate-100 dark:divide-slate-800">
                {[...Array(rows)].map((_, ri) => (
                  <div key={ri} className="flex items-center gap-3 py-3">
                    <div className="skel w-7 h-7 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="skel h-2.5 w-16 rounded-lg" />
                      <div
                        className={`skel h-3.5 rounded-lg ${ri % 2 === 0 ? "w-3/4" : "w-1/2"}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const r = restaurant;
  const successText = typeof successMsg === "string" ? successMsg : null;
  const errorText =
    errorMsg && typeof errorMsg === "object"
      ? Object.values(errorMsg).flat().join(" ")
      : (errorMsg ?? null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-4 lg:p-8 transition-colors duration-300">
      {/* ── PAGE HEADER ── */}
      <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Restaurant Details
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            View and manage your restaurant's information
            <span className="ml-2 text-violet-500 font-bold">· {r.slug}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Refresh */}
          <button
            onClick={() => dispatch(fetchRestaurantDetails())}
            disabled={isRefreshing}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              size={18}
              className={isRefreshing ? "animate-spin text-violet-400" : ""}
            />
          </button>

          {/* Edit / Close toggle */}
          <button
            onClick={() => setEditOpen((v) => !v)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition-all shadow-lg ${
              editOpen
                ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-none"
                : "bg-violet-600 text-white hover:bg-violet-700 shadow-violet-500/30"
            }`}
          >
            {editOpen ? <X size={17} /> : <Edit3 size={17} />}
            {editOpen ? "Close Editor" : "Edit Details"}
          </button>
        </div>
      </header>

      {/* ── TOAST ── */}
      <ToastBanner success={successText} error={errorText} />

      {/* ── STAT STRIP ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Status",
            value: r.is_open ? "Open" : "Closed",
            color: r.is_open
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-500 dark:text-rose-400",
            bg: r.is_open
              ? "bg-emerald-50 dark:bg-emerald-900/20"
              : "bg-rose-50 dark:bg-rose-900/20",
          },
          {
            label: "Opening",
            value: fmt12(r.opening_time),
            color: "text-violet-600 dark:text-violet-400",
            bg: "bg-violet-50 dark:bg-violet-900/20",
          },
          {
            label: "Closing",
            value: fmt12(r.closing_time),
            color: "text-slate-800 dark:text-white",
            bg: "bg-white dark:bg-slate-900",
          },
          {
            label: "City",
            value: `${r.city}, ${r.state}`,
            color: "text-slate-800 dark:text-white",
            bg: "bg-white dark:bg-slate-900",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} border border-slate-200 dark:border-slate-800 rounded-3xl p-4 text-center`}
          >
            <p className={`text-xl font-black ${s.color} truncate`}>
              {s.value}
            </p>
            <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mt-0.5 tracking-widest">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── DETAIL GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Basic Info */}
        <SectionCard icon={Building2} title="Basic Information">
          <DetailRow icon={Building2} label="Restaurant Name" value={r.name} />
          <DetailRow icon={Phone} label="Phone" value={r.phone} />
          <DetailRow icon={Mail} label="Email" value={r.email} />
          <DetailRow icon={Hash} label="Public ID" value={r.public_id} mono />
          <DetailRow icon={FileText} label="Slug" value={r.slug} mono />
        </SectionCard>

        {/* Location */}
        <SectionCard icon={MapPin} title="Location">
          <DetailRow icon={MapPin} label="Address" value={r.address} />
          <DetailRow icon={MapPin} label="City" value={r.city} />
          <DetailRow icon={MapPin} label="State" value={r.state} />
          <DetailRow icon={MapPin} label="Pincode" value={r.pincode} />
          <DetailRow icon={Globe} label="Latitude" value={r.latitude} mono />
          <DetailRow icon={Globe} label="Longitude" value={r.longitude} mono />
        </SectionCard>

        {/* Operating Hours */}
        <SectionCard icon={Clock} title="Operating Hours">
          <DetailRow
            icon={Clock}
            label="Current Status"
            badge={
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-black uppercase px-2.5 py-1 rounded-xl border mt-0.5 ${
                  r.is_open
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                    : "bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${r.is_open ? "bg-emerald-500" : "bg-rose-500"}`}
                />
                {r.is_open ? "Open for business" : "Currently closed"}
              </span>
            }
          />
          <DetailRow
            icon={Clock}
            label="Opening Time"
            value={fmt12(r.opening_time)}
          />
          <DetailRow
            icon={Clock}
            label="Closing Time"
            value={fmt12(r.closing_time)}
          />
        </SectionCard>

        {/* Compliance */}
        <SectionCard icon={FileText} title="Compliance & Licensing">
          <DetailRow
            icon={FileText}
            label="GST Number"
            value={r.gst_number}
            mono
          />
          <DetailRow
            icon={FileText}
            label="FSSAI License"
            value={r.fssai_license}
            mono
          />
          <DetailRow
            icon={Clock}
            label="Last Updated"
            value={fmtDate(r.updated_at)}
          />
        </SectionCard>
      </div>

      {/* ── EDIT DRAWER ── */}
      {editOpen && (
        <EditDrawer
          restaurant={r}
          onClose={() => setEditOpen(false)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
