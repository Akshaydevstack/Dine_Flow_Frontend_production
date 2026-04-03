import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import imageCompression from "browser-image-compression"; // <-- Added this
import {
  fetchAdminDishes,
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  setDishSearch,
  setDishFilter,
  setDishPage,
  resetDishFilters,
  updateAdminDish,
  deleteAdminDish,
  createAdminDish,
  clearDishMessages,
  clearCategoryMessages,
  selectAdminDishes,
  selectAdminCategories,
  selectAdminCategoriesCount,
  selectAdminCategoriesLoading,
  selectAdminCategoryError,
  selectAdminCategorySuccess,
  selectAdminDishFilters,
  selectAdminDishPagination,
  selectAdminDishLoading,
  selectAdminDishRefreshing,
  selectAdminDishLoadingMore,
  selectAdminDishFetched,
  selectAdminDishSuccess,
  selectAdminDishMutationError,
} from "../../../store/slices/restaurantAdminSlice/adminDishSlice";
import {
  Search,
  Plus,
  Filter,
  Edit3,
  Trash2,
  Flame,
  Star,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  X,
  Upload,
  ChevronDown,
  Zap,
  TrendingUp,
  SlidersHorizontal,
  ImagePlus,
  CheckCircle2,
  AlertCircle,
  Tag,
  UtensilsCrossed,
  LayoutGrid,
  Pencil,
  Save,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Hash,
  Calendar,
  MessageSquare,
  ShoppingBag,
  DollarSign,
  ChevronUp,
  BarChart2,
} from "lucide-react";

/* ================================================================
   CLOUDINARY CONFIG
================================================================ */

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;
const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/avif",
];

/* ================================================================
   HELPERS
================================================================ */
const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString([], {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
const fmtTime = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
const timeAgo = (iso) => {
  if (!iso) return "";
  const d = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  if (d < 604800) return `${Math.floor(d / 86400)}d ago`;
  return fmtDate(iso);
};

/* ================================================================
   IMAGE OPTIMIZATION (CLIENT + CLOUDINARY)
================================================================ */

// 1. Fast Client Compression
// Resizes giant camera photos down to a manageable size (~1MB) for fast upload
const fastClientCompress = async (file) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };
  return await imageCompression(file, options);
};

// 2. Cloudinary Magic Injector
// Injects auto-formatting (f_auto) and auto-quality (q_auto) to the returned URL
const getOptimizedUrl = (rawUrl) => {
  if (!rawUrl) return rawUrl;
  return rawUrl.replace("/upload/", "/upload/c_limit,w_800/f_auto/q_auto/");
};

// 3. Upload Function
const uploadToCloudinary = async (file, folder = "dishes") => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  fd.append("folder", folder);
  const res = await axios.post(CLOUDINARY_URL, fd);

  // Return the auto-optimized URL for your database
  return getOptimizedUrl(res.data.secure_url);
};

/* ================================================================
   TOAST BANNER
================================================================ */
const ToastBanner = ({ success, error }) => {
  if (!success && !error) return null;
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold border ${
        success
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
   TAB BAR
================================================================ */
const TabBar = ({ active, onChange, categoryCount, dishCount }) => (
  <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl w-fit">
    {[
      {
        id: "dishes",
        label: "Dishes",
        icon: UtensilsCrossed,
        count: dishCount,
      },
      {
        id: "categories",
        label: "Categories",
        icon: LayoutGrid,
        count: categoryCount,
      },
    ].map(({ id, label, icon: Icon, count }) => (
      <button
        key={id}
        onClick={() => onChange(id)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all
          ${active === id ? "bg-white dark:bg-slate-900 text-violet-600 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
      >
        <Icon size={15} />
        {label}
        {count !== undefined && (
          <span
            className={`text-[10px] font-black px-1.5 py-0.5 rounded-full
            ${active === id ? "bg-violet-100 dark:bg-violet-500/20 text-violet-600" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}
          >
            {count}
          </span>
        )}
      </button>
    ))}
  </div>
);

/* ================================================================
   SINGLE IMAGE UPLOADER
================================================================ */
const SingleImageUploader = ({
  value,
  onChange,
  placeholder = "Upload image",
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef();

  const processFile = async (file) => {
    setError("");
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Unsupported format");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Max ${MAX_FILE_SIZE_MB}MB`);
      return;
    }
    setUploading(true);
    try {
      const compressedFile = await fastClientCompress(file);
      onChange(await uploadToCloudinary(compressedFile, "categories"));
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800">
          <img
            src={value}
            alt="category"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/90 text-slate-800 rounded-xl text-xs font-black"
            >
              <Pencil size={12} /> Change
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-500 text-white rounded-xl text-xs font-black"
            >
              <X size={12} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all
            ${dragOver ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10" : "border-slate-200 dark:border-slate-700 hover:border-violet-400"}
            ${uploading ? "cursor-not-allowed opacity-70" : ""}`}
        >
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
            {uploading ? (
              <>
                <Loader2 size={28} className="animate-spin text-violet-500" />
                <span className="text-xs font-bold text-violet-500">
                  Uploading…
                </span>
              </>
            ) : (
              <>
                <Upload
                  size={26}
                  className={dragOver ? "text-violet-500" : ""}
                />
                <span className="text-xs font-bold uppercase">
                  {placeholder}
                </span>
                <span className="text-[10px]">
                  JPG, PNG, WebP, AVIF · Max {MAX_FILE_SIZE_MB}MB
                </span>
              </>
            )}
          </div>
        </div>
      )}
      {error && (
        <p className="text-xs text-rose-500 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files[0]) processFile(e.target.files[0]);
          e.target.value = "";
        }}
        disabled={uploading}
      />
    </div>
  );
};

/* ================================================================
   MULTI IMAGE UPLOADER
================================================================ */
const MultiImageUploader = ({ images, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const inputRef = useRef();

  const processFiles = async (files) => {
    setUploadErrors([]);
    const valid = [],
      errors = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: unsupported`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        errors.push(`${file.name}: too large`);
        continue;
      }
      valid.push(file);
    }
    if (errors.length) setUploadErrors(errors);
    if (!valid.length) return;
    setUploading(true);
    const uploaded = [];
    for (let i = 0; i < valid.length; i++) {
      try {
        setUploadStatus(`Compressing ${i + 1}/${valid.length}…`);
        const compressedFile = await fastClientCompress(valid[i]);
        setUploadStatus(`Uploading ${i + 1}/${valid.length}…`);
        uploaded.push(await uploadToCloudinary(compressedFile, "dishes"));
      } catch {
        setUploadErrors((p) => [...p, `${valid[i].name}: failed`]);
      }
    }
    onChange([...images, ...uploaded]);
    setUploading(false);
    setUploadStatus("");
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Dish Images ({images.length})
        {images.length > 0 && (
          <span className="ml-2 text-[9px] text-violet-500 normal-case font-bold">
            · Cloudinary Optimized
          </span>
        )}
      </label>
      <div
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          processFiles(Array.from(e.dataTransfer.files));
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all
          ${dragOver ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10" : "border-slate-200 dark:border-slate-700 hover:border-violet-400"}
          ${uploading ? "cursor-not-allowed opacity-70" : ""}`}
      >
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-400">
          {uploading ? (
            <>
              <Loader2 size={32} className="animate-spin text-violet-500" />
              <span className="text-xs font-bold text-violet-500">
                {uploadStatus}
              </span>
            </>
          ) : (
            <>
              <Upload size={28} className={dragOver ? "text-violet-500" : ""} />
              <span className="text-xs font-bold uppercase">
                {dragOver ? "Drop to upload" : "Drag & drop or click"}
              </span>
              <span className="text-[10px]">
                JPG, PNG, WebP · Max {MAX_FILE_SIZE_MB}MB
              </span>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            processFiles(Array.from(e.target.files));
            e.target.value = "";
          }}
          disabled={uploading}
        />
      </div>
      {uploadErrors.length > 0 && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 space-y-1">
          {uploadErrors.map((e, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-[10px] text-rose-500"
            >
              <AlertCircle size={12} />
              {e}
            </div>
          ))}
        </div>
      )}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(images.filter((_, i) => i !== idx));
                  }}
                  className="p-1.5 bg-rose-500 rounded-lg text-white"
                >
                  <X size={12} />
                </button>
              </div>
              {idx === 0 && (
                <div className="absolute bottom-1 left-1 bg-violet-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded">
                  Main
                </div>
              )}
            </div>
          ))}
          <div
            onClick={(e) => {
              e.stopPropagation();
              !uploading && inputRef.current?.click();
            }}
            className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-violet-400 flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-violet-500 gap-1 transition-colors"
          >
            <ImagePlus size={18} />
            <span className="text-[9px] font-bold uppercase">Add more</span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================================================================
   DISH FORM
================================================================ */
const EMPTY_DISH_FORM = {
  name: "",
  description: "",
  price: "",
  original_price: "",
  prep_time: "",
  category: "",
  is_veg: true,
  is_spicy: false,
  is_available: true,
  is_popular: false,
  is_quick_bites: false,
  is_trending: false,
  priority: 0,
};

const DishForm = ({
  initial = EMPTY_DISH_FORM,
  categories,
  onSubmit,
  onClose,
  title,
  submitLabel,
}) => {
  const [form, setFormState] = useState({ ...initial });
  const [images, setImages] = useState(
    Array.isArray(initial.images)
      ? initial.images
      : initial.images
        ? [initial.images]
        : [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setFormState((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      e.price = "Invalid price";
    if (!form.category) e.category = "Select category";
    if (form.prep_time && isNaN(form.prep_time))
      e.prep_time = "Must be a number";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const ok = await onSubmit({
        ...form,
        price: parseFloat(form.price),
        original_price: form.original_price
          ? parseFloat(form.original_price)
          : null,
        prep_time: form.prep_time ? parseInt(form.prep_time) : null,
        priority: parseInt(form.priority) || 0,
        images,
        image_url: images[0] ?? null,
      });
      if (!ok) setErrors({ submit: "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  };

  const Toggle = ({ label, field }) => (
    <button
      type="button"
      onClick={() => set(field, !form[field])}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all
        ${form[field] ? "bg-violet-600 border-violet-600 text-white" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"}`}
    >
      {label}
    </button>
  );

  const inputCls = (err) =>
    `w-full px-4 py-3 rounded-2xl border ${err ? "border-rose-400" : "border-slate-200 dark:border-slate-700"} bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 ring-violet-500/20 text-sm`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full sm:max-w-2xl bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Fill in the details below
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <MultiImageUploader images={images} onChange={setImages} />
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Dish Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Paneer Tikka Masala"
              className={inputCls(errors.name)}
            />
            {errors.name && (
              <p className="text-xs text-rose-500 mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              placeholder="Short description…"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 ring-violet-500/20 text-sm resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Price *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="0.00"
                className={inputCls(errors.price)}
              />
              {errors.price && (
                <p className="text-xs text-rose-500 mt-1">{errors.price}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Original Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.original_price}
                onChange={(e) => set("original_price", e.target.value)}
                placeholder="0.00"
                className={inputCls(false)}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Prep Time (mins)
              </label>
              <input
                type="number"
                min="0"
                value={form.prep_time}
                onChange={(e) => set("prep_time", e.target.value)}
                placeholder="e.g. 20"
                className={inputCls(errors.prep_time)}
              />
              {errors.prep_time && (
                <p className="text-xs text-rose-500 mt-1">{errors.prep_time}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Priority
              </label>
              <input
                type="number"
                min="0"
                value={form.priority}
                onChange={(e) => set("priority", e.target.value)}
                className={inputCls(false)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Category *
              </label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={`appearance-none ${inputCls(errors.category)} pr-10`}
                >
                  <option value="">— Select —</option>
                  {categories.map((c) => (
                    <option key={c.public_id} value={c.public_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
              {errors.category && (
                <p className="text-xs text-rose-500 mt-1">{errors.category}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Tags & Availability
            </label>
            <div className="flex flex-wrap gap-2">
              <Toggle label="🥦 Veg" field="is_veg" />
              <Toggle label="🌶 Spicy" field="is_spicy" />
              <Toggle label="✅ Available" field="is_available" />
              <Toggle label="⭐ Popular" field="is_popular" />
              <Toggle label="⚡ Quick Bites" field="is_quick_bites" />
              <Toggle label="🔥 Trending" field="is_trending" />
            </div>
          </div>
          {errors.submit && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 text-sm">
              <X size={16} />
              {errors.submit}
            </div>
          )}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 rounded-2xl bg-violet-600 text-white text-sm font-black hover:bg-violet-700 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            {submitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

const AddDishModal = ({ categories, onClose }) => {
  const dispatch = useDispatch();
  const handleSubmit = async (p) => {
    const r = await dispatch(createAdminDish(p));
    if (!r.error) {
      onClose();
      return true;
    }
    return false;
  };
  return (
    <DishForm
      initial={EMPTY_DISH_FORM}
      categories={categories}
      onSubmit={handleSubmit}
      onClose={onClose}
      title="Add New Dish"
      submitLabel="Add Dish"
    />
  );
};

const EditDishModal = ({ dish, categories, onClose }) => {
  const dispatch = useDispatch();
  const resolvedCategory =
    typeof dish.category === "object" && dish.category !== null
      ? dish.category.public_id
      : (dish.category_public_id ?? dish.category ?? "");
  const initial = {
    name: dish.name ?? "",
    description: dish.description ?? "",
    price: dish.price ?? "",
    original_price: dish.original_price ?? "",
    prep_time: dish.prep_time ?? "",
    category: resolvedCategory,
    is_veg: dish.is_veg ?? true,
    is_spicy: dish.is_spicy ?? false,
    is_available: dish.is_available ?? true,
    is_popular: dish.is_popular ?? false,
    is_quick_bites: dish.is_quick_bites ?? false,
    is_trending: dish.is_trending ?? false,
    priority: dish.priority ?? 0,
    images: dish.images,
  };
  const handleSubmit = async (p) => {
    const r = await dispatch(
      updateAdminDish({ publicId: dish.public_id, data: p }),
    );
    if (!r.error) {
      onClose();
      return true;
    }
    return false;
  };
  return (
    <DishForm
      initial={initial}
      categories={categories}
      onSubmit={handleSubmit}
      onClose={onClose}
      title={`Edit — ${dish.name}`}
      submitLabel="Save Changes"
    />
  );
};

/* ================================================================
   CATEGORY FORM MODAL
================================================================ */
const CategoryFormModal = ({ initial = null, onClose }) => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAdminCategoriesLoading);
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [nameError, setNameError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Category name is required");
      return;
    }
    const data = {
      name: name.trim(),
      image: image || null,
      is_active: isActive,
    };
    const result = isEdit
      ? await dispatch(
          updateAdminCategory({ publicId: initial.public_id, data }),
        )
      : await dispatch(createAdminCategory(data));
    if (!result.error) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
              <Tag size={18} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {isEdit ? "Edit Category" : "New Category"}
              </h2>
              <p className="text-xs text-slate-400">
                {isEdit
                  ? `Editing "${initial.name}"`
                  : "Create a menu category"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Category Image
            </label>
            <SingleImageUploader
              value={image}
              onChange={setImage}
              placeholder="Upload category image"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              placeholder="e.g. Starters, Main Course, Beverages…"
              className={`w-full px-4 py-3 rounded-2xl border ${nameError ? "border-rose-400" : "border-slate-200 dark:border-slate-700"} bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 ring-violet-500/20 text-sm`}
            />
            {nameError && (
              <p className="text-xs text-rose-500 mt-1">{nameError}</p>
            )}
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div>
              <p className="text-sm font-black text-slate-800 dark:text-white">
                Active
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Inactive categories hidden from customers
              </p>
            </div>
            <button type="button" onClick={() => setIsActive((v) => !v)}>
              {isActive ? (
                <ToggleRight size={32} className="text-violet-600" />
              ) : (
                <ToggleLeft size={32} className="text-slate-400" />
              )}
            </button>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 rounded-2xl bg-violet-600 text-white text-sm font-black hover:bg-violet-700 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isLoading
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================================================================
   CATEGORY CARD
================================================================ */
const CategoryCard = ({ cat, dishCount, onEdit }) => {
  const dispatch = useDispatch();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    await dispatch(deleteAdminCategory(cat.public_id));
    setDeleting(false);
    setConfirming(false);
  };
  const handleToggleActive = async (e) => {
    e.stopPropagation();
    setToggling(true);
    await dispatch(
      updateAdminCategory({
        publicId: cat.public_id,
        data: { is_active: !cat.is_active },
      }),
    );
    setToggling(false);
  };

  return (
    <div
      className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10 hover:border-violet-200 dark:hover:border-violet-800 ${!cat.is_active ? "opacity-60" : ""}`}
    >
      <div className="relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={cat.image || "https://via.placeholder.com/400x300?text=No+Image"}
          alt={cat.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-3 right-3">
          <button
            onClick={handleToggleActive}
            disabled={toggling}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase backdrop-blur-sm ${cat.is_active ? "bg-emerald-500/90 text-white" : "bg-slate-700/80 text-slate-300"}`}
          >
            {toggling ? (
              <Loader2 size={10} className="animate-spin" />
            ) : (
              <span
                className={`w-1.5 h-1.5 rounded-full ${cat.is_active ? "bg-white" : "bg-slate-400"}`}
              />
            )}
            {cat.is_active ? "Active" : "Inactive"}
          </button>
        </div>
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-xl">
          {dishCount} {dishCount === 1 ? "dish" : "dishes"}
        </div>
      </div>
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-black text-slate-900 dark:text-white text-sm truncate">
            {cat.name}
          </h3>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5 truncate">
            {cat.public_id}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {confirming ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-rose-500">Sure?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-2.5 py-1.5 rounded-xl bg-rose-500 text-white text-[10px] font-black flex items-center gap-1"
              >
                {deleting && <Loader2 size={10} className="animate-spin" />}Yes
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black"
              >
                No
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onEdit}
                className="p-2 rounded-xl text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   CATEGORY MANAGEMENT
================================================================ */
const CategoryManagement = ({ dishes }) => {
  const dispatch = useDispatch();
  const categories = useSelector(selectAdminCategories);
  const categoriesCount = useSelector(selectAdminCategoriesCount);
  const categoriesLoading = useSelector(selectAdminCategoriesLoading);
  const categoryError = useSelector(selectAdminCategoryError);
  const categorySuccess = useSelector(selectAdminCategorySuccess);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [searchCat, setSearchCat] = useState("");
  const [filterActive, setFilterActive] = useState("all");

  useEffect(() => {
    if (categoryError || categorySuccess) {
      const t = setTimeout(() => dispatch(clearCategoryMessages()), 3500);
      return () => clearTimeout(t);
    }
  }, [categoryError, categorySuccess, dispatch]);

  const dishCountMap = dishes.reduce((acc, d) => {
    const id =
      typeof d.category === "object" ? d.category?.public_id : d.category;
    if (id) acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  const filtered = categories.filter((c) => {
    const matchName = c.name.toLowerCase().includes(searchCat.toLowerCase());
    const matchActive =
      filterActive === "all" ||
      (filterActive === "active" ? c.is_active : !c.is_active);
    return matchName && matchActive;
  });
  const activeCount = categories.filter((c) => c.is_active).length;
  const inactiveCount = categories.length - activeCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Categories
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Organise your menu into sections
            {categoriesCount > 0 && (
              <span className="ml-2 text-violet-500 font-bold">
                · {categoriesCount} total
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1 sm:w-56">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={15}
            />
            <input
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 ring-violet-500/20 text-sm"
              placeholder="Search categories…"
              value={searchCat}
              onChange={(e) => setSearchCat(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              setEditingCat(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-black hover:bg-violet-700 shadow-lg shadow-violet-500/30 whitespace-nowrap"
          >
            <Plus size={16} /> New Category
          </button>
        </div>
      </div>
      <ToastBanner success={categorySuccess} error={categoryError} />
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total",
            value: categoriesCount,
            color: "text-slate-900 dark:text-white",
          },
          { label: "Active", value: activeCount, color: "text-emerald-600" },
          { label: "Inactive", value: inactiveCount, color: "text-slate-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center"
          >
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-black uppercase text-slate-400 mt-0.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {[
          ["all", "All"],
          ["active", "Active"],
          ["inactive", "Inactive"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilterActive(val)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all ${filterActive === val ? "bg-violet-600 text-white border-violet-600" : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-violet-300"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {categoriesLoading && categories.length === 0 ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin text-violet-600" size={36} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
          <Tag size={40} className="mb-3 opacity-30" />
          <p className="font-bold uppercase text-xs tracking-widest">
            {searchCat ? "No matching categories" : "No categories yet"}
          </p>
          {!searchCat && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-xs font-black hover:bg-violet-700"
            >
              + Create your first category
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((cat) => (
            <CategoryCard
              key={cat.public_id}
              cat={cat}
              dishCount={dishCountMap[cat.public_id] || 0}
              onEdit={() => {
                setEditingCat(cat);
                setShowModal(true);
              }}
            />
          ))}
        </div>
      )}
      {showModal && (
        <CategoryFormModal
          initial={editingCat}
          onClose={() => {
            setShowModal(false);
            setEditingCat(null);
          }}
        />
      )}
    </div>
  );
};

/* ================================================================
   ★ COMPACT DISH CARD — completely redesigned
================================================================ */
const DishCard = React.forwardRef(({ dish, onEdit }, ref) => {
  const dispatch = useDispatch();
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState(null); // null = collapsed, "info"|"price"|"reviews"

  const toggleAvailability = async (e) => {
    e.stopPropagation();
    setIsUpdating(true);
    await dispatch(
      updateAdminDish({
        publicId: dish.public_id,
        data: { is_available: !dish.is_available },
      }),
    );
    setIsUpdating(false);
  };
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    await dispatch(deleteAdminDish(dish.public_id));
    setDeleting(false);
    setConfirming(false);
  };

  const imageSrc =
    (Array.isArray(dish.images) && dish.images.length > 0
      ? dish.images[0]
      : typeof dish.images === "string" && dish.images
        ? dish.images
        : dish.image_url || null) ||
    "https://via.placeholder.com/400x300?text=No+Image";

  const hasDiscount =
    dish.original_price &&
    parseFloat(dish.original_price) > parseFloat(dish.price);
  const discountPct = hasDiscount
    ? Math.round(
        ((parseFloat(dish.original_price) - parseFloat(dish.price)) /
          parseFloat(dish.original_price)) *
          100,
      )
    : 0;
  const edited = dish.updated_at && dish.updated_at !== dish.created_at;
  const reviews = Array.isArray(dish.reviews) ? dish.reviews : [];

  return (
    <div
      ref={ref}
      className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/8 hover:border-violet-200 dark:hover:border-violet-800/60 ${!dish.is_available ? "opacity-55" : ""}`}
    >
      {/* ── TOP: image left + info right ── */}
      <div className="flex gap-0 p-3 pb-0">
        {/* Image thumbnail */}
        <div className="relative flex-shrink-0 w-[88px] h-[88px] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={imageSrc}
            alt={dish.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* veg dot */}
          <div
            className={`absolute top-1.5 left-1.5 w-4 h-4 rounded-md border-2 ${dish.is_veg ? "border-emerald-500 bg-white dark:bg-slate-900" : "border-rose-500 bg-white dark:bg-slate-900"} flex items-center justify-center`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${dish.is_veg ? "bg-emerald-500" : "bg-rose-500"}`}
            />
          </div>
          {!dish.is_available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <EyeOff size={18} className="text-white" />
            </div>
          )}
          {hasDiscount && (
            <div className="absolute bottom-1 right-1 bg-rose-500 text-white text-[8px] font-black px-1 py-0.5 rounded-md leading-none">
              -{discountPct}%
            </div>
          )}
        </div>

        {/* Info block */}
        <div className="flex-1 min-w-0 pl-3 pt-0.5">
          {/* Category + flags row */}
          <div className="flex items-center gap-1 mb-1 flex-wrap">
            <span className="text-[9px] font-black uppercase tracking-wider text-violet-500 dark:text-violet-400">
              {dish.category_name}
            </span>
            {dish.is_spicy && <span className="text-[9px]">🌶</span>}
            {dish.is_trending && <span className="text-[9px]">🔥</span>}
            {dish.is_quick_bites && <span className="text-[9px]">⚡</span>}
            {dish.is_popular && <span className="text-[9px]">⭐</span>}
          </div>

          {/* Name */}
          <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight line-clamp-1">
            {dish.name}
          </h3>

          {/* Description */}
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-snug mt-0.5 line-clamp-1">
            {dish.description || "No description"}
          </p>

          {/* Price row */}
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-base font-black text-slate-900 dark:text-white">
              ₹{dish.price}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-slate-400 line-through">
                ₹{dish.original_price}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="mx-3 mt-2.5 grid grid-cols-4 divide-x divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
        {[
          {
            label: "Prep",
            value: dish.prep_time ? `${dish.prep_time}m` : "—",
            icon: <Clock size={9} />,
          },
          {
            label: "Rating",
            value:
              dish.average_rating && dish.average_rating !== "0.00"
                ? dish.average_rating
                : "—",
            icon: <Star size={9} className="text-amber-400" />,
          },
          {
            label: "Orders",
            value: dish.total_orders ?? 0,
            icon: <ShoppingBag size={9} />,
          },
          {
            label: "Priority",
            value: dish.priority ?? 0,
            icon: <Hash size={9} />,
          },
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            className="flex flex-col items-center py-2 px-1 bg-slate-50/50 dark:bg-slate-800/30"
          >
            <div className="flex items-center gap-0.5 text-slate-400 mb-0.5">
              {icon}
            </div>
            <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 leading-none">
              {value}
            </span>
            <span className="text-[8px] font-bold uppercase text-slate-400 mt-0.5 tracking-wide">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── ACTION ROW ── */}
      <div className="mx-3 mt-2 flex items-center gap-1.5">
        {/* Availability toggle */}
        <button
          onClick={toggleAvailability}
          disabled={isUpdating}
          title={dish.is_available ? "Hide dish" : "Show dish"}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all
            ${
              dish.is_available
                ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
            }`}
        >
          {isUpdating ? (
            <Loader2 size={10} className="animate-spin" />
          ) : dish.is_available ? (
            <Eye size={10} />
          ) : (
            <EyeOff size={10} />
          )}
          {dish.is_available ? "Live" : "Hidden"}
        </button>

        {/* Edit */}
        <button
          onClick={() => onEdit()}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-violet-300 hover:text-violet-600 dark:hover:border-violet-700 dark:hover:text-violet-400 transition-all"
        >
          <Pencil size={10} /> Edit
        </button>

        {/* Delete */}
        {confirming ? (
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-2 py-1.5 rounded-xl bg-rose-500 text-white text-[10px] font-black flex items-center gap-0.5"
            >
              {deleting && <Loader2 size={9} className="animate-spin" />}Yes
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirming(false);
              }}
              className="px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={handleDelete}
            className="ml-auto p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* ── DETAIL TABS — each tab opens independently ── */}
      <div className="mx-3 mt-2 mb-3">
        {/* Tab pills */}
        <div className="flex gap-1">
          {[
            { id: "info", label: "Info", icon: <Hash size={9} /> },
            { id: "price", label: "Pricing", icon: <DollarSign size={9} /> },
            {
              id: "reviews",
              label: `Reviews${reviews.length > 0 ? ` (${reviews.length})` : ""}`,
              icon: <MessageSquare size={9} />,
            },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(activeTab === t.id ? null : t.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase border transition-all
                ${
                  activeTab === t.id
                    ? "bg-violet-600 text-white border-violet-600"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:border-violet-300 hover:text-violet-500"
                }`}
            >
              {t.icon}
              {t.label}
              {activeTab === t.id && <ChevronUp size={8} />}
            </button>
          ))}
        </div>

        {/* ── Tab: INFO ── */}
        {activeTab === "info" && (
          <div className="mt-2 space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                  Dish ID
                </p>
                <p className="text-[9px] font-mono text-slate-600 dark:text-slate-300 truncate mt-0.5">
                  {dish.public_id}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                  Restaurant
                </p>
                <p className="text-[9px] font-mono text-slate-600 dark:text-slate-300 truncate mt-0.5">
                  {dish.restaurant_id}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                Category ID
              </p>
              <p className="text-[9px] font-mono text-slate-600 dark:text-slate-300 truncate mt-0.5">
                {typeof dish.category === "string"
                  ? dish.category
                  : (dish.category?.public_id ?? dish.category)}
                <span className="text-slate-400 ml-1">
                  · {dish.category_name}
                </span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <Calendar size={7} /> Created
                </p>
                <p className="text-[9px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  {fmtDate(dish.created_at)}
                </p>
                <p className="text-[8px] text-slate-400">
                  {timeAgo(dish.created_at)}
                </p>
              </div>
              <div
                className={`px-2.5 py-1.5 rounded-xl border ${edited ? "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30" : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800"}`}
              >
                <p
                  className={`text-[8px] font-black uppercase tracking-wider flex items-center gap-1 ${edited ? "text-amber-500" : "text-slate-400"}`}
                >
                  <RefreshCw size={7} /> Updated
                </p>
                {edited ? (
                  <>
                    <p className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                      {fmtDate(dish.updated_at)}
                    </p>
                    <p className="text-[8px] text-amber-400/70">
                      {timeAgo(dish.updated_at)}
                    </p>
                  </>
                ) : (
                  <p className="text-[8px] text-slate-400 mt-0.5">
                    Never modified
                  </p>
                )}
              </div>
            </div>
            {/* Extra images */}
            {Array.isArray(dish.images) && dish.images.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                {dish.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: PRICING ── */}
        {activeTab === "price" && (
          <div className="mt-2 space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-violet-50 dark:bg-violet-900/10 px-2.5 py-2 rounded-xl border border-violet-100 dark:border-violet-800/30">
                <p className="text-[8px] font-black uppercase text-violet-400 tracking-wider">
                  Sale Price
                </p>
                <p className="text-base font-black text-violet-600 dark:text-violet-400 mt-0.5">
                  ₹{dish.price}
                </p>
              </div>
              <div
                className={`px-2.5 py-2 rounded-xl border ${hasDiscount ? "bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30" : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800"}`}
              >
                <p
                  className={`text-[8px] font-black uppercase tracking-wider ${hasDiscount ? "text-rose-400" : "text-slate-400"}`}
                >
                  Original
                </p>
                <p
                  className={`text-base font-black mt-0.5 ${hasDiscount ? "text-rose-500 line-through" : "text-slate-400"}`}
                >
                  {dish.original_price ? `₹${dish.original_price}` : "—"}
                </p>
              </div>
            </div>
            {hasDiscount && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800/30 bg-emerald-50 dark:bg-emerald-900/10">
                <span className="text-[9px] font-black uppercase text-emerald-500">
                  Savings
                </span>
                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                  ₹
                  {(
                    parseFloat(dish.original_price) - parseFloat(dish.price)
                  ).toFixed(2)}{" "}
                  · {discountPct}% off
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: REVIEWS ── */}
        {activeTab === "reviews" && (
          <div className="mt-2">
            {reviews.length === 0 ? (
              <div className="flex items-center justify-center py-4 text-slate-400">
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  No reviews yet
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {reviews.map((rev) => (
                  <div
                    key={rev.public_id}
                    className="px-2.5 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={rev.user_avatar}
                          alt={rev.user_name}
                          className="w-4 h-4 rounded-full border border-slate-200"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <span className="text-[9px] font-black text-slate-700 dark:text-slate-200">
                          {rev.user_name}
                        </span>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star
                            key={i}
                            size={7}
                            className="text-amber-400"
                            fill="currentColor"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 italic">
                      "{rev.comment}"
                    </p>
                    <p className="text-[8px] text-slate-300 dark:text-slate-600 mt-0.5">
                      {timeAgo(rev.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
DishCard.displayName = "DishCard";

/* ================================================================
   ★ FILTER PANEL — redesigned, well-aligned, compact
================================================================ */
const FilterPanel = ({
  filters,
  categories,
  flagFilters,
  onSort,
  onCategory,
  onVeg,
  onAvailability,
  onFlag,
  onClear,
  activeCount,
}) => {
  const Pill = ({ label, active, onClick, color = "violet" }) => {
    const activeStyles = {
      violet: "bg-violet-600 text-white border-violet-600",
      emerald: "bg-emerald-500 text-white border-emerald-500",
      rose: "bg-rose-500   text-white border-rose-500",
      amber: "bg-amber-500  text-white border-amber-500",
      orange: "bg-orange-500 text-white border-orange-500",
      blue: "bg-blue-500   text-white border-blue-500",
    };
    return (
      <button
        onClick={onClick}
        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border transition-all whitespace-nowrap
          ${active ? activeStyles[color] : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-violet-300 dark:hover:border-violet-700 bg-white dark:bg-slate-900"}`}
      >
        {label}
      </button>
    );
  };

  const Row = ({ label, children }) => (
    <div className="grid grid-cols-[80px_1fr] items-start gap-3">
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 pt-1.5">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );

  const Divider = () => (
    <div className="border-t border-slate-100 dark:border-slate-800" />
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={13} className="text-violet-500" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Filters
          </span>
          {activeCount > 0 && (
            <span className="bg-violet-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="text-[9px] font-black uppercase text-rose-500 hover:text-rose-600 flex items-center gap-1"
          >
            <X size={10} /> Clear all
          </button>
        )}
      </div>

      <div className="p-4 space-y-3.5">
        {/* Sort & Category — inline row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              Sort by
            </p>
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => onSort(e.target.value)}
                className="w-full appearance-none px-3 py-2 pr-7 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-[11px] font-bold outline-none focus:ring-2 ring-violet-500/20 cursor-pointer"
              >
                <option value="priority">Priority</option>
                <option value="priceLow">Price ↑</option>
                <option value="priceHigh">Price ↓</option>
                <option value="popular">Popular</option>
                <option value="newest">Newest</option>
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              Category
            </p>
            <div className="relative">
              <select
                value={filters.category ?? ""}
                onChange={(e) => onCategory(e.target.value)}
                className="w-full appearance-none px-3 py-2 pr-7 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-[11px] font-bold outline-none focus:ring-2 ring-violet-500/20 cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.public_id} value={c.public_id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        <Divider />

        {/* Type */}
        <Row label="Type">
          <Pill
            label="All"
            active={filters.isVeg === null}
            onClick={() => onVeg(null)}
          />
          <Pill
            label="🥦 Veg"
            active={filters.isVeg === true}
            onClick={() => onVeg(true)}
            color="emerald"
          />
          <Pill
            label="🍖 Non-Veg"
            active={filters.isVeg === false}
            onClick={() => onVeg(false)}
            color="rose"
          />
        </Row>

        <Divider />

        {/* Availability */}
        <Row label="Status">
          <Pill
            label="All"
            active={filters.isAvailable === null}
            onClick={() => onAvailability(null)}
          />
          <Pill
            label="✅ Available"
            active={filters.isAvailable === true}
            onClick={() => onAvailability(true)}
            color="emerald"
          />
          <Pill
            label="🚫 Hidden"
            active={filters.isAvailable === false}
            onClick={() => onAvailability(false)}
            color="rose"
          />
        </Row>

        <Divider />

        {/* Flags */}
        <Row label="Tags">
          <Pill
            label="🌶 Spicy"
            active={flagFilters.isSpicy === true}
            onClick={() => onFlag("isSpicy")}
            color="orange"
          />
          <Pill
            label="⭐ Popular"
            active={flagFilters.isPopular === true}
            onClick={() => onFlag("isPopular")}
            color="amber"
          />
          <Pill
            label="⚡ Quick"
            active={flagFilters.isQuickBites === true}
            onClick={() => onFlag("isQuickBites")}
            color="blue"
          />
          <Pill
            label="🔥 Trending"
            active={flagFilters.isTrending === true}
            onClick={() => onFlag("isTrending")}
            color="violet"
          />
        </Row>
      </div>
    </div>
  );
};

/* ================================================================
   MAIN COMPONENT
================================================================ */
const INIT_FLAG_FILTERS = {
  isSpicy: null,
  isPopular: null,
  isQuickBites: null,
  isTrending: null,
};

const DishManagement = () => {
  const dispatch = useDispatch();
  const dishes = useSelector(selectAdminDishes);
  const filters = useSelector(selectAdminDishFilters);
  const pagination = useSelector(selectAdminDishPagination);
  const loading = useSelector(selectAdminDishLoading);
  const isRefreshing = useSelector(selectAdminDishRefreshing);
  const loadingMore = useSelector(selectAdminDishLoadingMore);
  const fetched = useSelector(selectAdminDishFetched);
  const categories = useSelector(selectAdminCategories);
  const categoriesCount = useSelector(selectAdminCategoriesCount);
  const dishSuccess = useSelector(selectAdminDishSuccess);
  const dishError = useSelector(selectAdminDishMutationError);

  const [activeTab, setActiveTab] = useState("dishes");
  const [searchTerm, setSearchTerm] = useState(filters.searchQuery);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [flagFilters, setFlagFilters] = useState(INIT_FLAG_FILTERS);

  const observer = useRef();
  const isMounted = useRef(false);

  useEffect(() => {
    if (dishSuccess || dishError) {
      const t = setTimeout(() => dispatch(clearDishMessages()), 3500);
      return () => clearTimeout(t);
    }
  }, [dishSuccess, dishError, dispatch]);

  useEffect(() => {
    if (!fetched) {
      dispatch(fetchAdminCategories());
      dispatch(fetchAdminDishes(filters));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    dispatch(fetchAdminDishes(filters));
  }, [
    dispatch,
    filters.searchQuery,
    filters.category,
    filters.isVeg,
    filters.isSpicy,
    filters.isAvailable,
    filters.priceMin,
    filters.priceMax,
    filters.sortBy,
    filters.currentPage,
  ]);

  useEffect(() => {
    const t = setTimeout(() => dispatch(setDishSearch(searchTerm)), 400);
    return () => clearTimeout(t);
  }, [searchTerm, dispatch]);

  const lastDishRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && pagination.hasNext)
          dispatch(setDishPage(filters.currentPage + 1));
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, pagination.hasNext, filters.currentPage, dispatch],
  );

  const handleSort = (v) => dispatch(setDishFilter({ sortBy: v }));
  const handleCategory = (v) =>
    dispatch(setDishFilter({ category: v || null }));
  const handleVeg = (v) => dispatch(setDishFilter({ isVeg: v }));
  const handleAvailability = (v) => dispatch(setDishFilter({ isAvailable: v }));

  const handleFlag = (key) => {
    const val = flagFilters[key] === true ? null : true;
    setFlagFilters((p) => ({ ...p, [key]: val }));
    const apiMap = { isSpicy: "isSpicy", isAvailable: "isAvailable" };
    if (apiMap[key]) dispatch(setDishFilter({ [apiMap[key]]: val }));
  };

  const clearAllFilters = () => {
    setFlagFilters(INIT_FLAG_FILTERS);
    dispatch(
      setDishFilter({
        isVeg: null,
        category: null,
        isSpicy: null,
        isAvailable: null,
        sortBy: "priority",
      }),
    );
    setSearchTerm("");
  };

  // Stats
  const availableCount = dishes.filter((d) => d.is_available).length;
  const unavailableCount = dishes.filter((d) => !d.is_available).length;
  const vegCount = dishes.filter((d) => d.is_veg).length;
  const nonVegCount = dishes.filter((d) => !d.is_veg).length;

  const activeFilterCount =
    Object.values(flagFilters).filter(Boolean).length +
    (filters.isVeg !== null ? 1 : 0) +
    (filters.isAvailable !== null ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (searchTerm ? 1 : 0);

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] p-4 lg:p-8 transition-colors duration-300">
        {/* PAGE HEADER */}
        <header className="flex flex-col gap-5 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Menu Inventory
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Manage dishes, categories, pricing, and availability
                {pagination.totalItems > 0 && (
                  <span className="ml-2 text-violet-500 font-bold">
                    · {pagination.totalItems} total
                  </span>
                )}
              </p>
            </div>
            <TabBar
              active={activeTab}
              onChange={setActiveTab}
              categoryCount={categoriesCount}
              dishCount={pagination.totalItems}
            />
          </div>
        </header>

        {/* ══════════ TAB: DISHES ══════════ */}
        {activeTab === "dishes" && (
          <>
            {/* Stats strip */}
            {(dishes.length > 0 || pagination.totalItems > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                {[
                  {
                    label: "Total",
                    value: pagination.totalItems || dishes.length,
                    color: "text-slate-800 dark:text-white",
                    bg: "bg-white dark:bg-slate-900",
                  },
                  {
                    label: "Available",
                    value: availableCount,
                    color: "text-emerald-600",
                    bg: "bg-emerald-50 dark:bg-emerald-900/20",
                  },
                  {
                    label: "Unavailable",
                    value: unavailableCount,
                    color: "text-rose-500",
                    bg: "bg-rose-50 dark:bg-rose-900/20",
                  },
                  {
                    label: "Veg",
                    value: vegCount,
                    color: "text-green-600",
                    bg: "bg-green-50 dark:bg-green-900/20",
                  },
                  {
                    label: "Non-Veg",
                    value: nonVegCount,
                    color: "text-orange-500",
                    bg: "bg-orange-50 dark:bg-orange-900/20",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`${s.bg} border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center`}
                  >
                    <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mt-0.5">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  className="w-full pl-12 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 ring-violet-500/20 placeholder-slate-400"
                  placeholder="Search dishes…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isRefreshing && (
                  <Loader2
                    size={14}
                    className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-violet-400"
                  />
                )}
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`relative flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all font-black text-sm
                  ${
                    showFilters || activeFilterCount > 0
                      ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-500/30"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 hover:border-violet-300"
                  }`}
              >
                <SlidersHorizontal size={17} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${showFilters ? "bg-white/20 text-white" : "bg-violet-600 text-white"}`}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Refresh */}
              <button
                onClick={() =>
                  dispatch(fetchAdminDishes({ ...filters, currentPage: 1 }))
                }
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <RefreshCw
                  size={20}
                  className={
                    loading || isRefreshing
                      ? "animate-spin text-violet-400"
                      : ""
                  }
                />
              </button>

              {/* Add */}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-3 bg-violet-600 text-white rounded-2xl shadow-lg shadow-violet-500/30 hover:bg-violet-700 transition-all font-black text-sm"
              >
                <Plus size={20} /> Add Dish
              </button>
            </div>

            <ToastBanner success={dishSuccess} error={dishError} />

            {/* ── Filter panel ── */}
            {showFilters && (
              <div className="mb-5">
                <FilterPanel
                  filters={filters}
                  categories={categories}
                  flagFilters={flagFilters}
                  onSort={handleSort}
                  onCategory={handleCategory}
                  onVeg={handleVeg}
                  onAvailability={handleAvailability}
                  onFlag={handleFlag}
                  onClear={clearAllFilters}
                  activeCount={activeFilterCount}
                />
              </div>
            )}

            {/* Grid */}
            {loading && !loadingMore ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2
                  className="animate-spin text-violet-600 mb-4"
                  size={40}
                />
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
                  Loading Kitchen...
                </p>
              </div>
            ) : dishes.length === 0 && !isRefreshing ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <span className="text-5xl mb-4">🍽️</span>
                <p className="font-bold uppercase text-xs tracking-widest">
                  No dishes found
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-5 py-2.5 bg-violet-600 text-white rounded-2xl text-xs font-black hover:bg-violet-700"
                >
                  + Add your first dish
                </button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4 transition-opacity duration-200 ${isRefreshing ? "opacity-60" : "opacity-100"}`}
              >
                {dishes.map((dish, index) => (
                  <DishCard
                    key={dish.public_id}
                    dish={dish}
                    ref={index === dishes.length - 1 ? lastDishRef : null}
                    onEdit={() => setEditingDish(dish)}
                  />
                ))}
              </div>
            )}

            {loadingMore && (
              <div className="flex justify-center p-12">
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-3 rounded-full shadow-lg border border-slate-100 dark:border-slate-800">
                  <Loader2 className="animate-spin text-violet-600" size={20} />
                  <span className="text-xs font-black uppercase text-slate-500 tracking-widest">
                    Loading more dishes…
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════════ TAB: CATEGORIES ══════════ */}
        {activeTab === "categories" && <CategoryManagement dishes={dishes} />}
      </div>

      {showAddModal && (
        <AddDishModal
          categories={categories}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {editingDish && (
        <EditDishModal
          dish={editingDish}
          categories={categories}
          onClose={() => setEditingDish(null)}
        />
      )}
    </>
  );
};

export default DishManagement;
