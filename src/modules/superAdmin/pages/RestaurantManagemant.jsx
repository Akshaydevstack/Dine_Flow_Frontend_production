import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSuperAdminRestaurants,
  createSuperAdminRestaurant,
  updateSuperAdminRestaurant,
  deleteSuperAdminRestaurant,
  setRestaurantSearch,
  setRestaurantFilter,
  setRestaurantPage,
  resetRestaurantFilters,
  clearRestaurantMessages,
  selectSuperAdminRestaurants,
  selectSuperAdminRestaurantLoading,
  selectSuperAdminRestaurantRefreshing,
  selectSuperAdminRestaurantLoadingMore,
  selectSuperAdminRestaurantFetched,
  selectSuperAdminRestaurantFilters,
  selectSuperAdminRestaurantPagination,
  selectSuperAdminRestaurantSuccess,
  selectSuperAdminRestaurantError,
} from "../../../store/slices/superAdmin/superAdminRestaurantSlice";

import {
  Search,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  MapPin,
  Clock,
  Edit3,
  Trash2,
  Eye,
  X,
  AlertCircle,
  Loader2,
  Calendar,
  DollarSign,
  Shield,
  Building2,
  Globe,
  CalendarRange,
  AlertTriangle,
  Store,
  CheckCircle2,
  Phone,
  Mail,
  Map,
  Navigation,
} from "lucide-react";

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const fmtTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

const getDateStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
};

const getMonthStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
};

const phoneDigits = (val = "") => val.replace(/^\+91/, "").replace(/\D/g, "");
const toE164 = (digits) => (digits ? `+91${digits}` : "+91");

const RULES = {
  name: (v) =>
    !v?.trim()
      ? "Restaurant name is required"
      : v.trim().length < 3
        ? "Min 3 characters"
        : null,
  email: (v) =>
    !v?.trim()
      ? "Email is required"
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        ? "Invalid email address"
        : null,
  phone: (v) => {
    const d = phoneDigits(v);
    return !d
      ? "Phone is required"
      : d.length !== 10
        ? "Must be exactly 10 digits"
        : !/^[6-9]/.test(d)
          ? "Must start with 6–9"
          : null;
  },
  gst_number: (v) =>
    !v?.trim()
      ? "GST number is required"
      : !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
            v.trim().toUpperCase(),
          )
        ? "Invalid GST (e.g. 29ABCDE1234F1Z5)"
        : null,
  fssai_license: (v) =>
    !v?.trim()
      ? "FSSAI license is required"
      : !/^\d{14}$/.test(v.trim())
        ? "Must be exactly 14 digits"
        : null,
  commission_rate: (v) =>
    !String(v ?? "").trim()
      ? "Commission rate is required"
      : isNaN(Number(v)) || Number(v) < 0 || Number(v) > 100
        ? "Must be 0–100"
        : null,
  address: (v) => (!v?.trim() ? "Address is required" : null),
  city: (v) => (!v?.trim() ? "City is required" : null),
  state: (v) => (!v?.trim() ? "State is required" : null),
  pincode: (v) =>
    !v?.trim()
      ? "Pincode is required"
      : !/^\d{6}$/.test(v.trim())
        ? "Must be 6 digits"
        : null,
  opening_time: (v) => (!v ? "Opening time is required" : null),
  closing_time: (v, f) =>
    !v
      ? "Closing time is required"
      : v <= (f?.opening_time || "")
        ? "Must be after opening time"
        : null,
  "admin.first_name": (v) => (!v?.trim() ? "Full name is required" : null),
  "admin.email": (v) =>
    !v?.trim()
      ? "Admin email is required"
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        ? "Invalid email address"
        : null,
  "admin.mobile_number": (v) => {
    const d = phoneDigits(v);
    return !d
      ? "Mobile is required"
      : d.length !== 10
        ? "Must be exactly 10 digits"
        : !/^[6-9]/.test(d)
          ? "Must start with 6–9"
          : null;
  },
  "admin.password": (v) =>
    !v?.trim()
      ? "Password is required"
      : v.length < 8
        ? "Min 8 characters"
        : !/[A-Z]/.test(v)
          ? "Need at least 1 uppercase"
          : !/[0-9]/.test(v)
            ? "Need at least 1 number"
            : null,
};

const vField = (key, val, form) => RULES[key]?.(val, form) ?? null;

/* ─── MATCHED TO DASHBOARD ───────────────────────────────────────
   Dashboard uses:
     page bg   : bg-slate-50      dark:bg-[#07101f]
     card bg   : bg-white         dark:bg-[#0c1a2e]
     inner bg  : bg-slate-50/60   dark:bg-[#0f0d19]/50  (thead, footer)
     input bg  : bg-slate-50      dark:bg-[#1c1929]  →  kept from original
     border    : border-slate-200/70  dark:border-[#2a2440]
     sub-border: border-slate-100     dark:border-[#1e1a2e]
   ──────────────────────────────────────────────────────────────── */
const panel = `bg-white dark:bg-[#0c1a2e] border border-slate-200/70 dark:border-[#2a2440] rounded-2xl`;

const inputCls = (err) => `
  w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all
  bg-slate-50 dark:bg-[#0f2035] text-slate-800 dark:text-slate-100
  placeholder:text-slate-400 dark:placeholder:text-slate-600
  focus:ring-2 focus:ring-orange-500/20
  ${
    err
      ? "border-rose-400 dark:border-rose-500/50 focus:border-rose-400"
      : "border-slate-200 dark:border-[#2a2440] focus:border-orange-400 dark:focus:border-orange-500/60"
  }
`;

const Label = ({ children, required }) => (
  <label className="block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-1.5">
    {children}
    {required && <span className="text-rose-500 ml-0.5">*</span>}
  </label>
);

const FieldErr = ({ msg }) =>
  msg ? (
    <p className="flex items-center gap-1 text-[10px] text-rose-500 mt-1 font-semibold">
      <AlertCircle size={9} className="flex-shrink-0" />
      {msg}
    </p>
  ) : null;

const PhoneInput = ({ value, onChange, error, placeholder = "XXXXXXXXXX" }) => {
  const digits = phoneDigits(value);
  return (
    <div
      className={`flex rounded-xl border overflow-hidden transition-all bg-slate-50 dark:bg-[#0f2035] focus-within:ring-2 focus-within:ring-orange-500/20
      ${error ? "border-rose-400 dark:border-rose-500/50" : "border-slate-200 dark:border-[#2a2440] focus-within:border-orange-400 dark:focus-within:border-orange-500/60"}`}
    >
      <span className="flex items-center gap-1.5 pl-3 pr-2.5 select-none whitespace-nowrap text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#112540] border-r border-slate-200 dark:border-[#2a2440]">
        🇮🇳 <span className="text-slate-500 dark:text-slate-400">+91</span>
      </span>
      <input
        type="tel"
        inputMode="numeric"
        value={digits}
        maxLength={10}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(toE164(e.target.value.replace(/\D/g, "").slice(0, 10)))
        }
        className="flex-1 min-w-0 px-3 py-2.5 text-sm outline-none bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
      />
      <span
        className={`flex items-center pr-3 text-[10px] font-black tabular-nums select-none
        ${digits.length === 10 ? "text-teal-500 dark:text-teal-400" : "text-slate-400 dark:text-slate-600"}`}
      >
        {digits.length}/10
      </span>
    </div>
  );
};

const MapPicker = ({ initialLat, initialLng, onConfirm, onClose }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const tileLayerRef = useRef(null);

  const defaultLat = initialLat || 20.5937;
  const defaultLng = initialLng || 78.9629;

  const [pos, setPos] = useState({ lat: defaultLat, lng: defaultLng });
  const [addr, setAddr] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mapStyle, setMapStyle] = useState("street");

  const TILES = {
    street: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      attr: "Tiles © Esri",
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attr: "Tiles © Esri, Maxar",
    },
  };

  const reverseGeocode = useCallback(async (lat, lng) => {
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "en" } },
      );
      const data = await res.json();
      setAddr(data.display_name || "");
      const a = data.address || {};
      setLocationData({
        city: a.city || a.town || a.village || a.county || a.suburb || "",
        state: a.state || "",
        pincode: a.postcode || "",
        road: a.road || a.neighbourhood || "",
        suburb: a.suburb || a.neighbourhood || "",
        county: a.county || "",
      });
    } catch {
      setAddr("");
      setLocationData(null);
    } finally {
      setGeocoding(false);
    }
  }, []);

  const flyTo = useCallback(
    (lat, lng, zoom = 17) => {
      if (!mapRef.current || !markerRef.current) return;
      mapRef.current.flyTo([lat, lng], zoom, { duration: 1 });
      markerRef.current.setLatLng([lat, lng]);
      setPos({ lat, lng });
      reverseGeocode(lat, lng);
    },
    [reverseGeocode],
  );

  const searchPlaces = useCallback(async (q) => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=6&countrycodes=in`,
        { headers: { "Accept-Language": "en" } },
      );
      setSuggestions(await res.json());
      setShowDropdown(true);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQuery.length > 2) searchPlaces(searchQuery);
      else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery, searchPlaces]);

  const switchStyle = useCallback((style) => {
    if (!mapRef.current) return;
    tileLayerRef.current?.remove();
    tileLayerRef.current = window.L.tileLayer(TILES[style].url, {
      attribution: TILES[style].attr,
      maxZoom: 19,
    }).addTo(mapRef.current);
    setMapStyle(style);
  }, []);

  useEffect(() => {
    if (!document.getElementById("lf-css")) {
      const lnk = document.createElement("link");
      lnk.id = "lf-css";
      lnk.rel = "stylesheet";
      lnk.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(lnk);
    }
    const initLeaflet = () => {
      if (!containerRef.current || mapRef.current) return;
      const L = window.L;
      const map = L.map(containerRef.current, { zoomControl: false }).setView(
        [defaultLat, defaultLng],
        13,
      );
      L.control.zoom({ position: "bottomright" }).addTo(map);
      tileLayerRef.current = L.tileLayer(TILES.street.url, {
        attribution: TILES.street.attr,
        maxZoom: 19,
      }).addTo(map);
      const pinIcon = L.divIcon({
        className: "",
        html: `<div style="position:relative;width:36px;height:36px;"><div style="width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:linear-gradient(135deg,#f97316,#ef4444);border:3px solid #fff;box-shadow:0 6px 20px rgba(249,115,22,0.6);position:absolute;top:0;left:2px;"></div></div>`,
        iconSize: [36, 40],
        iconAnchor: [18, 40],
      });
      const marker = L.marker([defaultLat, defaultLng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);
      markerRef.current = marker;
      mapRef.current = map;
      marker.on("dragend", (e) => {
        const { lat, lng } = e.target.getLatLng();
        setPos({ lat, lng });
        reverseGeocode(lat, lng);
      });
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setPos({ lat, lng });
        reverseGeocode(lat, lng);
      });
      reverseGeocode(defaultLat, defaultLng);
    };
    if (window.L) initLeaflet();
    else {
      const s = document.createElement("script");
      s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.onload = initLeaflet;
      document.head.appendChild(s);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-2xl flex flex-col bg-white dark:bg-[#0c1a2e] border border-slate-200/70 dark:border-[#2a2440] rounded-2xl shadow-2xl overflow-hidden"
        style={{ height: 620 }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[#1e1a2e] flex-shrink-0">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500 dark:text-orange-400 mb-0.5">
              Location Picker · Esri Maps
            </p>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Pin Restaurant Location
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 p-1 rounded-lg bg-slate-100 dark:bg-[#112540]">
              {[
                ["street", "Street"],
                ["satellite", "Satellite"],
              ].map(([s, lbl]) => (
                <button
                  key={s}
                  onClick={() => switchStyle(s)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${mapStyle === s ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                >
                  {lbl}
                </button>
              ))}
            </div>
            <button
              onClick={() =>
                navigator.geolocation?.getCurrentPosition(
                  ({ coords }) => flyTo(coords.latitude, coords.longitude, 17),
                  () => {},
                  { enableHighAccuracy: true },
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 border border-orange-200 dark:border-orange-500/25 transition-all"
            >
              <Navigation size={12} /> My Location
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1e1a2e] transition-all"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="px-5 py-3 border-b border-slate-100 dark:border-[#1e1a2e] flex-shrink-0 relative">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              placeholder="Search for a place, address, or landmark…"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm outline-none bg-slate-50 dark:bg-[#0f2035] border border-slate-200 dark:border-[#2a2440] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 dark:focus:border-orange-500/60 transition-all"
            />
            {searching ? (
              <Loader2
                size={13}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-orange-500"
              />
            ) : (
              searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSuggestions([]);
                    setShowDropdown(false);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={13} />
                </button>
              )
            )}
          </div>
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute left-5 right-5 top-full mt-1 z-[2000] bg-white dark:bg-[#0c1a2e] border border-slate-200 dark:border-[#2a2440] rounded-xl shadow-2xl overflow-hidden">
              {suggestions.map((s, i) => (
                <button
                  key={s.place_id}
                  onClick={() => {
                    flyTo(parseFloat(s.lat), parseFloat(s.lon), 17);
                    setSearchQuery(s.display_name);
                    setSuggestions([]);
                    setShowDropdown(false);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors ${i < suggestions.length - 1 ? "border-b border-slate-100 dark:border-[#1e1a2e]" : ""}`}
                >
                  <MapPin
                    size={13}
                    className="text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
                      {s.address?.road ||
                        s.address?.suburb ||
                        s.display_name.split(",")[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                      {s.display_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className="flex-1 min-h-0 relative"
          onClick={() => setShowDropdown(false)}
        >
          <div ref={containerRef} className="w-full h-full" />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
            <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold whitespace-nowrap">
              Search above · Click map · Drag the pin
            </div>
          </div>
        </div>

        <div className="px-5 py-4 flex-shrink-0 border-t border-slate-100 dark:border-[#1e1a2e] bg-slate-50/60 dark:bg-[#0f0d19]/60">
          <div className="mb-3 min-h-[18px]">
            {geocoding ? (
              <p className="text-[10px] text-orange-500 animate-pulse flex items-center gap-1">
                <Loader2 size={9} className="animate-spin" /> Fetching address…
              </p>
            ) : addr ? (
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 font-medium flex items-center gap-1.5">
                <MapPin size={10} className="text-orange-500 flex-shrink-0" />
                {addr}
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400 dark:text-slate-500">
              <span>
                Lat:{" "}
                <strong className="text-slate-700 dark:text-slate-200">
                  {pos.lat.toFixed(6)}
                </strong>
              </span>
              <span>
                Lng:{" "}
                <strong className="text-slate-700 dark:text-slate-200">
                  {pos.lng.toFixed(6)}
                </strong>
              </span>
            </div>
            <button
              onClick={() =>
                onConfirm({
                  lat: pos.lat,
                  lng: pos.lng,
                  address: addr,
                  locationData,
                })
              }
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25 transition-all active:scale-95"
            >
              <MapPin size={14} /> Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActiveBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider
    ${
      active
        ? "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 ring-1 ring-teal-200 dark:ring-teal-500/20"
        : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700/50"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${active ? "bg-teal-500 animate-pulse" : "bg-slate-400"}`}
    />
    {active ? "Active" : "Inactive"}
  </span>
);

const OpenBadge = ({ open }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase
    ${
      open
        ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400"
        : "bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500"
    }`}
  >
    <span
      className={`w-1 h-1 rounded-full ${open ? "bg-orange-500" : "bg-slate-400"}`}
    />
    {open ? "Open" : "Closed"}
  </span>
);

const Toast = ({ message, type, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-2xl border backdrop-blur-sm
      ${
        type === "success"
          ? "bg-white/95 dark:bg-[#0c1a2e]/95 border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-300"
          : "bg-white/95 dark:bg-[#0c1a2e]/95 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 size={17} className="flex-shrink-0" />
      ) : (
        <AlertCircle size={17} className="flex-shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
};

const ErrorBanner = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div className="mx-8 mt-4 flex items-start gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300">
      <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
      <p className="text-xs font-semibold flex-1">{message}</p>
      <button
        onClick={onDismiss}
        className="text-rose-400 hover:text-rose-600 transition-colors flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
};

const BLANK = {
  name: "",
  slug: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  phone: "+91",
  email: "",
  is_open: true,
  opening_time: "09:00",
  closing_time: "23:00",
  gst_number: "",
  fssai_license: "",
  commission_rate: "",
  latitude: "",
  longitude: "",
  is_active: true,
  admin: { email: "", mobile_number: "+91", first_name: "", password: "" },
};

const DETAIL_KEYS = [
  "name",
  "email",
  "phone",
  "gst_number",
  "fssai_license",
  "commission_rate",
];
const LOCATION_KEYS = [
  "address",
  "city",
  "state",
  "pincode",
  "opening_time",
  "closing_time",
];
const ADMIN_KEYS = [
  "admin.first_name",
  "admin.email",
  "admin.mobile_number",
  "admin.password",
];

const RestaurantDrawer = ({
  open,
  onClose,
  editing,
  onSave,
  saving,
  saveError,
  onClearError,
}) => {
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [tab, setTab] = useState("details");
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        editing
          ? {
              ...BLANK,
              ...editing,
              phone: editing.phone || "+91",
              admin: { ...BLANK.admin },
            }
          : { ...BLANK },
      );
      setErrors({});
      setTouched({});
      setTab("details");
      onClearError?.();
    }
  }, [editing, open]);

  const getVal = (key) =>
    key.startsWith("admin.")
      ? (form.admin?.[key.replace("admin.", "")] ?? "")
      : (form[key] ?? "");

  const set = (key, val) => {
    if (key.startsWith("admin.")) {
      const k = key.replace("admin.", "");
      setForm((f) => ({ ...f, admin: { ...f.admin, [k]: val } }));
    } else {
      setForm((f) => ({ ...f, [key]: val }));
    }
    if (touched[key])
      setErrors((e) => ({ ...e, [key]: vField(key, val, form) }));
  };

  const blur = (key) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors((e) => ({ ...e, [key]: vField(key, getVal(key), form) }));
  };

  const validate = () => {
    const allKeys = [
      ...DETAIL_KEYS,
      ...LOCATION_KEYS,
      ...(editing ? [] : ADMIN_KEYS),
    ];
    const errs = {};
    allKeys.forEach((k) => {
      const e = vField(k, getVal(k), form);
      if (e) errs[k] = e;
    });
    setErrors(errs);
    setTouched(Object.fromEntries(allKeys.map((k) => [k, true])));
    if (Object.keys(errs).some((k) => DETAIL_KEYS.includes(k)))
      setTab("details");
    else if (Object.keys(errs).some((k) => LOCATION_KEYS.includes(k)))
      setTab("location");
    else if (Object.keys(errs).some((k) => ADMIN_KEYS.includes(k)))
      setTab("admin_acc");
    return Object.keys(errs).length === 0;
  };

  const tabErrCount = {
    details: DETAIL_KEYS.filter((k) => errors[k]).length,
    location: LOCATION_KEYS.filter((k) => errors[k]).length,
    admin_acc: ADMIN_KEYS.filter((k) => errors[k]).length,
  };

  const tabs = [
    ["details", "Details"],
    ["location", "Location & Hours"],
    ...(!editing ? [["admin_acc", "Admin Account"]] : []),
  ];
  const passVal = getVal("admin.password") || "";
  const passRules = [
    { ok: passVal.length >= 8, label: "8+ characters" },
    { ok: /[A-Z]/.test(passVal), label: "1 uppercase" },
    { ok: /[0-9]/.test(passVal), label: "1 number" },
  ];

  if (!open) return null;

  return (
    <>
      {showMap && (
        <MapPicker
          initialLat={parseFloat(form.latitude) || undefined}
          initialLng={parseFloat(form.longitude) || undefined}
          onClose={() => setShowMap(false)}
          onConfirm={({ lat, lng, locationData: ld }) => {
            setForm((f) => ({
              ...f,
              latitude: lat.toFixed(6),
              longitude: lng.toFixed(6),
              address: ld
                ? [ld.road, ld.suburb, ld.county].filter(Boolean).join(", ") ||
                  f.address
                : f.address,
              city: ld?.city || f.city,
              state: ld?.state || f.state,
              pincode: ld?.pincode || f.pincode,
            }));
            setErrors((e) => ({
              ...e,
              address: null,
              city: null,
              state: null,
              pincode: null,
            }));
            setShowMap(false);
          }}
        />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-end">
        <div
          className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px]"
          onClick={onClose}
        />
        <div className="relative w-full max-w-xl h-full flex flex-col bg-white dark:bg-[#0c1a2e] border-l border-slate-200 dark:border-[#2a2440] shadow-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 flex-shrink-0" />
          <div className="flex items-center justify-between px-7 py-5 flex-shrink-0 border-b border-slate-100 dark:border-[#1e1a2e]">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500 dark:text-orange-400 mb-0.5">
                {editing ? "Editing" : "New Entry"}
              </p>
              <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                {editing ? editing.name : "Add Restaurant"}
              </h2>
              {editing && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                  {editing.public_id}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e1a2e] transition-all"
            >
              <X size={18} />
            </button>
          </div>
          <ErrorBanner message={saveError} onDismiss={onClearError} />
          <div className="flex gap-0 px-7 pt-4 pb-0 flex-shrink-0">
            {tabs.map(([id, lbl]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`relative px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all
                ${tab === id ? "border-orange-500 text-orange-600 dark:text-orange-400" : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
              >
                {lbl}
                {tabErrCount[id] > 0 && (
                  <span className="absolute -top-1 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[7px] font-black flex items-center justify-center">
                    {tabErrCount[id]}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="h-px bg-slate-100 dark:bg-[#1e1a2e] mx-7 flex-shrink-0" />
          <div className="flex-1 overflow-y-auto px-7 py-5">
            {tab === "details" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label required>Restaurant Name</Label>
                  <input
                    type="text"
                    value={getVal("name")}
                    onChange={(e) => set("name", e.target.value)}
                    onBlur={() => blur("name")}
                    placeholder="e.g. Saffron Courtyard"
                    className={inputCls(errors.name)}
                  />
                  <FieldErr msg={errors.name} />
                </div>
                <div className="col-span-2">
                  <Label>URL Slug</Label>
                  <input
                    type="text"
                    value={getVal("slug")}
                    onChange={(e) =>
                      set(
                        "slug",
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-"),
                      )
                    }
                    placeholder="auto-generated if blank"
                    className={inputCls(false)}
                  />
                </div>
                <div>
                  <Label required>Email</Label>
                  <input
                    type="email"
                    value={getVal("email")}
                    onChange={(e) => set("email", e.target.value)}
                    onBlur={() => blur("email")}
                    placeholder="admin@restaurant.in"
                    className={inputCls(errors.email)}
                  />
                  <FieldErr msg={errors.email} />
                </div>
                <div>
                  <Label required>Phone</Label>
                  <PhoneInput
                    value={getVal("phone")}
                    onChange={(v) => set("phone", v)}
                    error={!!errors.phone}
                  />
                  <FieldErr msg={errors.phone} />
                </div>
                <div>
                  <Label required>GST Number</Label>
                  <input
                    type="text"
                    value={getVal("gst_number")}
                    onChange={(e) =>
                      set("gst_number", e.target.value.toUpperCase())
                    }
                    onBlur={() => blur("gst_number")}
                    placeholder="29ABCDE1234F1Z5"
                    maxLength={15}
                    className={inputCls(errors.gst_number)}
                  />
                  <FieldErr msg={errors.gst_number} />
                </div>
                <div>
                  <Label required>FSSAI License</Label>
                  <input
                    type="text"
                    value={getVal("fssai_license")}
                    onChange={(e) =>
                      set(
                        "fssai_license",
                        e.target.value.replace(/\D/g, "").slice(0, 14),
                      )
                    }
                    onBlur={() => blur("fssai_license")}
                    placeholder="14-digit number"
                    maxLength={14}
                    className={inputCls(errors.fssai_license)}
                  />
                  <FieldErr msg={errors.fssai_license} />
                </div>
                <div className="col-span-2">
                  <Label required>Commission Rate</Label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={getVal("commission_rate")}
                      onChange={(e) => set("commission_rate", e.target.value)}
                      onBlur={() => blur("commission_rate")}
                      placeholder="e.g. 12.50"
                      className={inputCls(errors.commission_rate)}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 pointer-events-none select-none">
                      %
                    </span>
                  </div>
                  <FieldErr msg={errors.commission_rate} />
                </div>
                <div className="col-span-2 pt-1 flex gap-6">
                  {[
                    { key: "is_active", label: "Active", color: "orange" },
                    { key: "is_open", label: "Currently Open", color: "teal" },
                  ].map((t) => (
                    <label
                      key={t.key}
                      className="flex items-center gap-3 cursor-pointer select-none"
                    >
                      <button
                        type="button"
                        onClick={() => set(t.key, !form[t.key])}
                        className={`relative w-10 h-5 rounded-full transition-all duration-200 ${form[t.key] ? (t.color === "orange" ? "bg-gradient-to-r from-orange-500 to-red-500 shadow-md shadow-orange-500/30" : "bg-teal-500 shadow-md shadow-teal-500/30") : "bg-slate-200 dark:bg-slate-700"}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${form[t.key] ? "translate-x-5" : ""}`}
                        />
                      </button>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {t.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {tab === "location" && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/25 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
                    <Map size={16} className="text-white" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-black text-orange-700 dark:text-orange-300">
                      Pick Location on Map
                    </p>
                    {form.latitude && form.longitude ? (
                      <p className="text-[10px] font-mono text-orange-500 dark:text-orange-400 mt-0.5 truncate">
                        {parseFloat(form.latitude).toFixed(5)},{" "}
                        {parseFloat(form.longitude).toFixed(5)}
                      </p>
                    ) : (
                      <p className="text-[10px] text-orange-400/70 mt-0.5">
                        Tap to open map and pin exact location
                      </p>
                    )}
                  </div>
                  <MapPin
                    size={15}
                    className="flex-shrink-0 text-orange-400 group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors"
                  />
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label required>Street Address</Label>
                    <textarea
                      value={getVal("address")}
                      onChange={(e) => set("address", e.target.value)}
                      onBlur={() => blur("address")}
                      placeholder="Building, Street, Area"
                      rows={2}
                      className={`${inputCls(errors.address)} resize-none`}
                    />
                    <FieldErr msg={errors.address} />
                  </div>
                  <div>
                    <Label required>City</Label>
                    <input
                      type="text"
                      value={getVal("city")}
                      onChange={(e) => set("city", e.target.value)}
                      onBlur={() => blur("city")}
                      placeholder="e.g. Kannur"
                      className={inputCls(errors.city)}
                    />
                    <FieldErr msg={errors.city} />
                  </div>
                  <div>
                    <Label required>State</Label>
                    <input
                      type="text"
                      value={getVal("state")}
                      onChange={(e) => set("state", e.target.value)}
                      onBlur={() => blur("state")}
                      placeholder="e.g. Kerala"
                      className={inputCls(errors.state)}
                    />
                    <FieldErr msg={errors.state} />
                  </div>
                  <div>
                    <Label required>Pincode</Label>
                    <input
                      type="text"
                      value={getVal("pincode")}
                      onChange={(e) =>
                        set(
                          "pincode",
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      onBlur={() => blur("pincode")}
                      placeholder="670001"
                      maxLength={6}
                      className={inputCls(errors.pincode)}
                    />
                    <FieldErr msg={errors.pincode} />
                  </div>
                  <div>
                    <Label>
                      Coordinates{" "}
                      <span className="normal-case tracking-normal text-[8px] font-medium">
                        (via map)
                      </span>
                    </Label>
                    <div className="flex gap-1.5">
                      <input
                        readOnly
                        value={form.latitude}
                        placeholder="Lat"
                        className={`${inputCls(false)} text-xs cursor-default text-slate-400`}
                      />
                      <input
                        readOnly
                        value={form.longitude}
                        placeholder="Lng"
                        className={`${inputCls(false)} text-xs cursor-default text-slate-400`}
                      />
                    </div>
                  </div>
                  <div>
                    <Label required>Opens At</Label>
                    <input
                      type="time"
                      value={getVal("opening_time")}
                      onChange={(e) => set("opening_time", e.target.value)}
                      onBlur={() => blur("opening_time")}
                      className={inputCls(errors.opening_time)}
                    />
                    <FieldErr msg={errors.opening_time} />
                  </div>
                  <div>
                    <Label required>Closes At</Label>
                    <input
                      type="time"
                      value={getVal("closing_time")}
                      onChange={(e) => set("closing_time", e.target.value)}
                      onBlur={() => blur("closing_time")}
                      className={inputCls(errors.closing_time)}
                    />
                    <FieldErr msg={errors.closing_time} />
                  </div>
                </div>
              </div>
            )}
            {tab === "admin_acc" && !editing && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 flex items-start gap-3">
                  <AlertCircle
                    size={15}
                    className="text-amber-500 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
                    These credentials create the restaurant's admin account.
                    Ensure the email is valid — it cannot be changed easily.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label required>Full Name</Label>
                    <input
                      type="text"
                      value={getVal("admin.first_name")}
                      onChange={(e) => set("admin.first_name", e.target.value)}
                      onBlur={() => blur("admin.first_name")}
                      placeholder="Admin's full name"
                      className={inputCls(errors["admin.first_name"])}
                    />
                    <FieldErr msg={errors["admin.first_name"]} />
                  </div>
                  <div>
                    <Label required>Mobile</Label>
                    <PhoneInput
                      value={getVal("admin.mobile_number")}
                      onChange={(v) => set("admin.mobile_number", v)}
                      error={!!errors["admin.mobile_number"]}
                    />
                    <FieldErr msg={errors["admin.mobile_number"]} />
                  </div>
                  <div className="col-span-2">
                    <Label required>Admin Email</Label>
                    <input
                      type="email"
                      value={getVal("admin.email")}
                      onChange={(e) => set("admin.email", e.target.value)}
                      onBlur={() => blur("admin.email")}
                      placeholder="admin@restaurant.in"
                      className={inputCls(errors["admin.email"])}
                    />
                    <FieldErr msg={errors["admin.email"]} />
                  </div>
                  <div className="col-span-2">
                    <Label required>Temporary Password</Label>
                    <input
                      type="password"
                      value={getVal("admin.password")}
                      onChange={(e) => set("admin.password", e.target.value)}
                      onBlur={() => blur("admin.password")}
                      placeholder="Min 8 chars · 1 uppercase · 1 number"
                      className={inputCls(errors["admin.password"])}
                    />
                    <FieldErr msg={errors["admin.password"]} />
                    {passVal && (
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        {passRules.map((r) => (
                          <span
                            key={r.label}
                            className={`flex items-center gap-1.5 text-[10px] font-semibold ${r.ok ? "text-teal-600 dark:text-teal-400" : "text-slate-400 dark:text-slate-600"}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${r.ok ? "bg-teal-500" : "bg-slate-300 dark:bg-slate-700"}`}
                            />
                            {r.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between px-7 py-4 flex-shrink-0 border-t border-slate-100 dark:border-[#1e1a2e] bg-slate-50/60 dark:bg-[#0f0d19]/60">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1e1a2e] hover:text-slate-700 dark:hover:text-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => validate() && onSave(form)}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Plus size={15} />
                  {editing ? "Save Changes" : "Create Restaurant"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const ViewModal = ({ restaurant: r, onClose, onEdit }) => {
  if (!r) return null;
  const details = [
    { icon: Phone, label: "Phone", val: r.phone },
    { icon: Mail, label: "Email", val: r.email },
    {
      icon: Clock,
      label: "Hours",
      val: `${fmtTime(r.opening_time)} – ${fmtTime(r.closing_time)}`,
    },
    { icon: DollarSign, label: "Commission", val: `${r.commission_rate}%` },
    { icon: Shield, label: "GST", val: r.gst_number },
    { icon: Building2, label: "FSSAI", val: r.fssai_license },
    { icon: Calendar, label: "Joined", val: fmt(r.created_at) },
    { icon: Globe, label: "Public ID", val: r.public_id },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0c1a2e] border border-slate-200/70 dark:border-[#2a2440] rounded-2xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
        <div className="h-0.5 w-full bg-gradient-to-r from-orange-500 to-red-500" />
        <div className="px-6 py-5 border-b border-slate-100 dark:border-[#1e1a2e] flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-orange-500/25 flex-shrink-0">
                {r.name[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <ActiveBadge active={r.is_active} />
                  <OpenBadge open={r.is_open} />
                </div>
                <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  {r.name}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e1a2e] transition-all flex-shrink-0"
            >
              <X size={17} />
            </button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-2">
            <MapPin size={11} /> {r.address}, {r.city}, {r.state} – {r.pincode}
          </p>
        </div>
        <div className="overflow-y-auto p-5 grid grid-cols-2 gap-2.5">
          {details.map((d) => (
            <div
              key={d.label}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#0f2035] border border-slate-100 dark:border-[#2a2440]"
            >
              <d.icon
                size={12}
                className="text-orange-500 dark:text-orange-400 mt-0.5 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 mb-0.5">
                  {d.label}
                </p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 break-all leading-snug">
                  {d.val}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 pt-0 flex-shrink-0">
          <button
            onClick={() => {
              onEdit(r);
              onClose();
            }}
            className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Edit3 size={15} /> Edit Restaurant
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteModal = ({ restaurant, onClose, onConfirm, loading }) => {
  if (!restaurant) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white dark:bg-[#0c1a2e] border border-slate-200/70 dark:border-[#2a2440] rounded-2xl shadow-2xl p-7 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-rose-500" />
        </div>
        <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
          Remove Restaurant?
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
          You are about to permanently delete
        </p>
        <p className="text-sm font-black text-rose-500 mb-3 px-4 truncate">
          "{restaurant.name}"
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-5">
          This action is irreversible.
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-[#2a2440] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#0f2035] transition-all"
          >
            Keep it
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}{" "}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const Pill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap
    ${
      active
        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm shadow-orange-500/25"
        : "bg-white dark:bg-[#0f2035] border border-slate-200 dark:border-[#2a2440] text-slate-500 dark:text-slate-400 hover:border-orange-300 dark:hover:border-orange-500/40 hover:text-orange-600 dark:hover:text-orange-400"
    }`}
  >
    {label}
  </button>
);

const DatePill = ({ label, sublabel, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-start px-3.5 py-2.5 rounded-xl border transition-all whitespace-nowrap
    ${
      active
        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent shadow-md shadow-orange-500/25"
        : "bg-white dark:bg-[#0f2035] border-slate-200 dark:border-[#2a2440] text-slate-600 dark:text-slate-300 hover:border-orange-300 dark:hover:border-orange-500/40 hover:text-orange-600 dark:hover:text-orange-400"
    }`}
  >
    <span className="text-[10px] font-black uppercase tracking-wider leading-none">
      {label}
    </span>
    <span
      className={`text-[9px] font-mono mt-1 leading-none ${active ? "text-white/75" : "text-slate-400 dark:text-slate-500"}`}
    >
      {sublabel}
    </span>
  </button>
);

const SkeletonRows = () => (
  <>
    <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}.shim{background:linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;border-radius:6px;}.dark .shim{background:linear-gradient(90deg,#0c1a2e 25%,#112540 50%,#0c1a2e 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;border-radius:6px;}`}</style>
    {[...Array(6)].map((_, i) => (
      <tr key={i} className="border-b border-slate-100 dark:border-[#1e1a2e]">
        {[40, 28, 32, 28, 16, 20, 20, 12].map((w, j) => (
          <td key={j} className="px-5 py-3.5">
            <div className="shim h-3.5" style={{ width: `${w * 3}px` }} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

const STAT_COLORS = {
  orange: {
    bg: "bg-orange-50 dark:bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    ring: "ring-orange-200 dark:ring-orange-500/20",
  },
  teal: {
    bg: "bg-teal-50 dark:bg-teal-500/10",
    text: "text-teal-600 dark:text-teal-400",
    ring: "ring-teal-200 dark:ring-teal-500/20",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-500/10",
    text: "text-rose-500 dark:text-rose-400",
    ring: "ring-rose-200 dark:ring-rose-500/20",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    text: "text-indigo-600 dark:text-indigo-400",
    ring: "ring-indigo-200 dark:ring-indigo-500/20",
  },
};

const StatCard = ({ label, value, icon: Icon, color }) => {
  const s = STAT_COLORS[color];
  return (
    <div
      className={`${panel} p-5 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none transition-shadow`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ring-1 ${s.bg} ${s.text} ${s.ring}`}
      >
        <Icon size={16} />
      </div>
      <p className="text-[26px] font-black text-slate-900 dark:text-white leading-none mb-1">
        {value}
      </p>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
    </div>
  );
};

const TABLE_HEADERS = [
  "Restaurant",
  "Location",
  "Contact",
  "Hours",
  "Commission",
  "Status",
  "Joined",
  "",
];

const FilterPanel = ({ filters, dispatch, onClearAll, onClearSearch }) => {
  const dates = useMemo(() => {
    const today = getDateStr(0),
      last7 = getDateStr(-6),
      last30 = getDateStr(-29),
      monthStart = getMonthStart();
    return { today, last7, last30, monthStart };
  }, []);

  const isToday =
    filters.dateMode === "exact" && filters.exactDate === dates.today;
  const isLast7 =
    filters.dateMode === "range" &&
    filters.startDate === dates.last7 &&
    filters.endDate === dates.today;
  const isLast30 =
    filters.dateMode === "range" &&
    filters.startDate === dates.last30 &&
    filters.endDate === dates.today;

  const clearDate = () =>
    dispatch(
      setRestaurantFilter({
        dateMode: null,
        exactDate: null,
        startDate: null,
        endDate: null,
      }),
    );
  const applyToday = () =>
    isToday
      ? clearDate()
      : dispatch(
          setRestaurantFilter({
            dateMode: "exact",
            exactDate: dates.today,
            startDate: null,
            endDate: null,
          }),
        );
  const applyLast7 = () =>
    isLast7
      ? clearDate()
      : dispatch(
          setRestaurantFilter({
            dateMode: "range",
            exactDate: null,
            startDate: dates.last7,
            endDate: dates.today,
          }),
        );
  const applyLast30 = () =>
    isLast30
      ? clearDate()
      : dispatch(
          setRestaurantFilter({
            dateMode: "range",
            exactDate: null,
            startDate: dates.last30,
            endDate: dates.today,
          }),
        );

  const hasDateFilter =
    filters.dateMode !== null || filters.startDate || filters.endDate;
  const hasActiveFilters =
    filters.isActive !== null || hasDateFilter || filters.sortBy !== "newest";

  const dateCls =
    "pl-8 pr-3 py-1.5 rounded-lg text-[11px] font-semibold outline-none bg-white dark:bg-[#0f2035] border border-slate-200 dark:border-[#2a2440] text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 cursor-pointer transition-all";

  return (
    <div className={`${panel} mb-5 shadow-sm dark:shadow-none overflow-hidden`}>
      <div className="h-0.5 w-full bg-gradient-to-r from-orange-500 to-red-500" />
      <div className="p-5 space-y-5">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex-1 min-w-[160px]">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Store size={9} /> Status
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                ["all", "All"],
                ["true", "Active"],
                ["false", "Inactive"],
              ].map(([val, lbl]) => (
                <Pill
                  key={val}
                  label={lbl}
                  active={
                    val === "all"
                      ? filters.isActive === null
                      : String(filters.isActive) === val
                  }
                  onClick={() =>
                    dispatch(
                      setRestaurantFilter({
                        isActive: val === "all" ? null : val === "true",
                      }),
                    )
                  }
                />
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
              <SlidersHorizontal size={9} /> Sort By
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                ["newest", "Newest"],
                ["oldest", "Oldest"],
                ["nameAsc", "A→Z"],
                ["nameDesc", "Z→A"],
              ].map(([val, lbl]) => (
                <Pill
                  key={val}
                  label={lbl}
                  active={filters.sortBy === val}
                  onClick={() => dispatch(setRestaurantFilter({ sortBy: val }))}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-[#1e1a2e]" />

        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
            <CalendarRange size={9} /> Date Joined
          </p>
          <div className="flex flex-wrap items-start gap-2.5">
            <DatePill
              label="Today"
              sublabel={`created_date=${dates.today}`}
              active={isToday}
              onClick={applyToday}
            />
            <DatePill
              label="Last 7 days"
              sublabel={`${dates.last7} → ${dates.today}`}
              active={isLast7}
              onClick={applyLast7}
            />
            <DatePill
              label="Last 30 days"
              sublabel={`${dates.last30} → ${dates.today}`}
              active={isLast30}
              onClick={applyLast30}
            />
            <div className="flex items-center self-center text-slate-300 dark:text-slate-700 select-none px-1 text-xs">
              ·
            </div>
            <div className="flex items-center gap-2 flex-wrap self-center">
              <div className="relative">
                <Calendar
                  size={11}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="date"
                  value={filters.startDate || ""}
                  max={filters.endDate || dates.today}
                  onChange={(e) =>
                    dispatch(
                      setRestaurantFilter({
                        dateMode: e.target.value
                          ? "range"
                          : filters.endDate
                            ? "range"
                            : null,
                        exactDate: null,
                        startDate: e.target.value || null,
                      }),
                    )
                  }
                  className={dateCls}
                />
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                to
              </span>
              <div className="relative">
                <Calendar
                  size={11}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="date"
                  value={filters.endDate || ""}
                  min={filters.startDate || undefined}
                  max={dates.today}
                  onChange={(e) =>
                    dispatch(
                      setRestaurantFilter({
                        dateMode: e.target.value
                          ? "range"
                          : filters.startDate
                            ? "range"
                            : null,
                        exactDate: null,
                        endDate: e.target.value || null,
                      }),
                    )
                  }
                  className={dateCls}
                />
              </div>
              {hasDateFilter && (
                <button
                  onClick={clearDate}
                  className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-600 transition-colors ml-1"
                >
                  <X size={10} /> Clear
                </button>
              )}
            </div>
          </div>
          {hasDateFilter && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
                <Calendar
                  size={10}
                  className="text-orange-500 dark:text-orange-400"
                />
                <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 font-mono">
                  {filters.dateMode === "exact"
                    ? `created_date=${filters.exactDate}`
                    : `created_date_gte=${filters.startDate || "…"} · created_date_lte=${filters.endDate || "…"}`}
                </span>
              </div>
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <div className="pt-1 border-t border-slate-100 dark:border-[#1e1a2e]">
            <button
              onClick={() => {
                onClearAll();
                onClearSearch();
              }}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-rose-500 hover:text-rose-600 transition-colors"
            >
              <X size={10} /> Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function RestaurantManagement() {
  const dispatch = useDispatch();
  const restaurants = useSelector(selectSuperAdminRestaurants);
  const loading = useSelector(selectSuperAdminRestaurantLoading);
  const isRefreshing = useSelector(selectSuperAdminRestaurantRefreshing);
  const loadingMore = useSelector(selectSuperAdminRestaurantLoadingMore);
  const fetched = useSelector(selectSuperAdminRestaurantFetched);
  const filters = useSelector(selectSuperAdminRestaurantFilters);
  const pagination = useSelector(selectSuperAdminRestaurantPagination);
  const successMsg = useSelector(selectSuperAdminRestaurantSuccess);
  const errorMsg = useSelector(selectSuperAdminRestaurantError);

  const [search, setSearch] = useState(filters.searchQuery ?? "");
  const [showFilters, setShowFilters] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [drawerError, setDrawerError] = useState(null);

  const isMounted = useRef(false);
  const observer = useRef();

  const lastRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      observer.current?.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && pagination.hasNext)
          dispatch(setRestaurantPage(filters.currentPage + 1));
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, pagination.hasNext, filters.currentPage, dispatch],
  );

  useEffect(() => {
    if (!fetched) dispatch(fetchSuperAdminRestaurants(filters));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    dispatch(fetchSuperAdminRestaurants(filters));
  }, [
    dispatch,
    filters.searchQuery,
    filters.isActive,
    filters.dateMode,
    filters.exactDate,
    filters.startDate,
    filters.endDate,
    filters.sortBy,
    filters.currentPage,
  ]);

  useEffect(() => {
    const t = setTimeout(() => dispatch(setRestaurantSearch(search)), 400);
    return () => clearTimeout(t);
  }, [search, dispatch]);

  useEffect(() => {
    if (successMsg) {
      setToast({ msg: successMsg, type: "success" });
      dispatch(clearRestaurantMessages());
      setDrawerOpen(false);
      setEditing(null);
      setDrawerError(null);
    }
    if (errorMsg) {
      const msg =
        typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg);
      if (drawerOpen) setDrawerError(msg);
      else setToast({ msg, type: "error" });
      dispatch(clearRestaurantMessages());
    }
  }, [successMsg, errorMsg, drawerOpen, dispatch]);

  const handleSave = async (form) => {
    setSaving(true);
    setDrawerError(null);
    if (editing) {
      const { admin, ...rest } = form;
      await dispatch(
        updateSuperAdminRestaurant({ publicId: editing.public_id, data: rest }),
      );
    } else {
      await dispatch(createSuperAdminRestaurant(form));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingId(deleting.public_id);
    await dispatch(deleteSuperAdminRestaurant(deleting.public_id));
    setDeletingId(null);
    setDeleting(null);
  };

  const openCreate = () => {
    setEditing(null);
    setDrawerError(null);
    setDrawerOpen(true);
  };
  const openEdit = (r) => {
    setEditing(r);
    setDrawerError(null);
    setDrawerOpen(true);
  };

  const activeFilterCount =
    (filters.isActive !== null ? 1 : 0) +
    (filters.dateMode !== null || filters.startDate || filters.endDate
      ? 1
      : 0) +
    (filters.sortBy !== "newest" ? 1 : 0);

  const totalActive = restaurants.filter((r) => r.is_active).length;
  const totalInactive = restaurants.filter((r) => !r.is_active).length;
  const totalOpen = restaurants.filter((r) => r.is_open).length;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 dark:bg-[#07101f] transition-colors duration-300">
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
      <RestaurantDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
          setDrawerError(null);
        }}
        editing={editing}
        onSave={handleSave}
        saving={saving}
        saveError={drawerError}
        onClearError={() => setDrawerError(null)}
      />
      <ViewModal
        restaurant={viewing}
        onClose={() => setViewing(null)}
        onEdit={openEdit}
      />
      <DeleteModal
        restaurant={deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={!!deletingId}
      />

      <div className="p-5 lg:p-7 max-w-[1400px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 min-w-0">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-orange-500 dark:text-orange-400 mb-1">
              Super Admin · Management
            </p>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Restaurants
              {pagination.totalItems > 0 && (
                <span className="ml-3 text-sm font-medium text-slate-400 dark:text-slate-500 tracking-normal">
                  {pagination.totalItems} total
                </span>
              )}
            </h1>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl flex-shrink-0 text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25 transition-all active:scale-95"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Restaurant</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* Search + controls */}
        <div className="flex items-center gap-2 mb-5 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, city, email…"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm outline-none bg-white dark:bg-[#0c1a2e] border border-slate-200/70 dark:border-[#2a2440] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 dark:focus:border-orange-500/50 shadow-sm dark:shadow-none transition-all"
            />
            {isRefreshing ? (
              <Loader2
                size={13}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-orange-500"
              />
            ) : (
              search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition-colors"
                >
                  <X size={13} />
                </button>
              )
            )}
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`relative p-2.5 rounded-xl border flex-shrink-0 transition-all shadow-sm dark:shadow-none
            ${
              showFilters || activeFilterCount > 0
                ? "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400"
                : "bg-white dark:bg-[#0c1a2e] border-slate-200/70 dark:border-[#2a2440] text-slate-400 hover:text-orange-500 dark:hover:text-orange-400"
            }`}
          >
            <SlidersHorizontal size={16} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-[8px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            onClick={() =>
              dispatch(
                fetchSuperAdminRestaurants({ ...filters, currentPage: 1 }),
              )
            }
            className="p-2.5 rounded-xl flex-shrink-0 bg-white dark:bg-[#0c1a2e] border border-slate-200/70 dark:border-[#2a2440] text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 shadow-sm dark:shadow-none transition-all"
          >
            <RefreshCw
              size={16}
              className={
                loading || isRefreshing
                  ? "animate-spin text-orange-500 dark:text-orange-400"
                  : ""
              }
            />
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard
            label="Total"
            value={pagination.totalItems || restaurants.length}
            icon={Store}
            color="orange"
          />
          <StatCard
            label="Active"
            value={totalActive}
            icon={CheckCircle2}
            color="teal"
          />
          <StatCard
            label="Inactive"
            value={totalInactive}
            icon={X}
            color="rose"
          />
          <StatCard
            label="Open Now"
            value={totalOpen}
            icon={Clock}
            color="indigo"
          />
        </div>

        {showFilters && (
          <FilterPanel
            filters={filters}
            dispatch={dispatch}
            onClearAll={() => dispatch(resetRestaurantFilters())}
            onClearSearch={() => setSearch("")}
          />
        )}

        {/* Table */}
        {loading && !loadingMore ? (
          <div
            className={`${panel} overflow-hidden shadow-sm dark:shadow-none`}
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#1e1a2e] bg-slate-50/60 dark:bg-[#0f0d19]/50">
                  {TABLE_HEADERS.map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <SkeletonRows />
              </tbody>
            </table>
          </div>
        ) : restaurants.length === 0 ? (
          <div
            className={`${panel} flex flex-col items-center justify-center py-20 shadow-sm dark:shadow-none`}
          >
            <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center mb-4">
              <Store
                size={28}
                className="text-orange-400 dark:text-orange-500"
              />
            </div>
            <p className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
              No restaurants
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">
              Add your first restaurant to get started
            </p>
            <button
              onClick={openCreate}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/20 transition-all"
            >
              + Add Restaurant
            </button>
          </div>
        ) : (
          <div
            className={`${panel} overflow-hidden shadow-sm dark:shadow-none`}
          >
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-[#1e1a2e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                  All Restaurants
                </p>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  · {restaurants.length} loaded
                </span>
              </div>
              {isRefreshing && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-orange-500 dark:text-orange-400">
                  <Loader2 size={12} className="animate-spin" /> Syncing
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#1e1a2e] bg-slate-50/50 dark:bg-[#0f0d19]/40">
                    {TABLE_HEADERS.map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((r, i) => (
                    <tr
                      key={r.public_id}
                      ref={i === restaurants.length - 1 ? lastRef : null}
                      className={`group transition-colors ${i < restaurants.length - 1 ? "border-b border-slate-100 dark:border-[#1e1a2e]" : ""} hover:bg-orange-50/40 dark:hover:bg-orange-500/5`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-black bg-gradient-to-br from-orange-500 to-red-600 shadow-md shadow-orange-500/20">
                            {r.name[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-[200px]">
                              {r.name}
                            </p>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                              {r.public_id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {r.city}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          {r.state} {r.pincode}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {r.phone}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[140px]">
                          {r.email}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {fmtTime(r.opening_time)} – {fmtTime(r.closing_time)}
                        </p>
                        <div className="mt-1">
                          <OpenBadge open={r.is_open} />
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-black text-orange-600 dark:text-orange-400">
                          {r.commission_rate}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <ActiveBadge active={r.is_active} />
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {fmt(r.created_at)}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setViewing(r)}
                            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => openEdit(r)}
                            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleting(r)}
                            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {loadingMore && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white dark:bg-[#0c1a2e] border border-slate-200/70 dark:border-[#2a2440] shadow-sm dark:shadow-none">
              <Loader2
                size={14}
                className="animate-spin text-orange-500 dark:text-orange-400"
              />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Loading more
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
