import {
  User,
  MapPin,
  Phone,
  Clock,
  Star,
  ShoppingCart,
  Package,
  ChevronRight,
  Sparkles,
  Heart,
  Settings,
  LogOut,
  TrendingUp,
  Edit2,
  X,
  Save,
  Plus,
  Key,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { logoutUser } from "../../../store/slices/authSlices/authSlice";
import { fetchRestaurantDetails } from "../../../store/slices/restaurantDetailsSlice";
import { fetchOrders } from "../../../store/slices/orderSlice";

import {
  fetchUserProfile,
  updateUserProfile,
  updateMobileWithFirebase,
  createAddress,
  checkMobileAvailability, 
} from "../../../store/slices/userProfileSlice";

import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../../firebase/firebaseConfig";

export default function Profile() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const authUser = useAppSelector((state) => state.auth.user);
  const cartItems = useAppSelector((state) => state.cart.items);
  const { orders, fetched: orderFetched } = useAppSelector(
    (state) => state.orders,
  );

  const {
    restaurant,
    loading: restaurantLoading,
    error: restaurantError,
    fetched: restaurantFetched,
  } = useAppSelector((state) => state.restaurantDetails);

  const { profile, fetched: profileFetched } = useAppSelector(
    (state) => state.userProfile,
  );
  const displayUser = profile || authUser;

  // ----------------------------------------------------
  // PROFILE EDIT & OTP STATE
  // ----------------------------------------------------
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [editForm, setEditForm] = useState({
    first_name: "",
    email: "",
    mobile_number: "",
  });

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    if (displayUser) {
      let mobile = displayUser.mobile_number || "";
      if (mobile.startsWith("+91")) mobile = mobile.replace("+91", "");
      setEditForm({
        first_name: displayUser.first_name || displayUser.name || "",
        email: displayUser.email || "",
        mobile_number: mobile,
      });
    }
  }, [displayUser]);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        },
      );
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!editForm.first_name.trim()) errors.first_name = "Name is required.";
    if (!editForm.email.trim() || !/^\S+@\S+\.\S+$/.test(editForm.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!/^\d{10}$/.test(editForm.mobile_number)) {
      errors.mobile_number = "Mobile number must be exactly 10 digits.";
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileErrors({});
    setIsSubmittingProfile(true);

    const originalMobile = (displayUser.mobile_number || "").replace("+91", "");
    const mobileChanged = editForm.mobile_number !== originalMobile;
    const nameOrEmailChanged =
      editForm.first_name !== displayUser.first_name ||
      editForm.email !== displayUser.email;

    try {
      // PHASE 1: IF MOBILE CHANGED, VERIFY DB FIRST, THEN TRIGGER OTP
      if (mobileChanged && !showOtp) {
        const formattedMobile = `+91${editForm.mobile_number}`;

        // ✅ 1. Check Database Availability BEFORE Firebase
        try {
          const checkRes = await dispatch(
            checkMobileAvailability(formattedMobile),
          ).unwrap();
          if (!checkRes.available) {
            setProfileErrors({ mobile_number: checkRes.message });
            setIsSubmittingProfile(false);
            return; // Stop right here, don't trigger Firebase!
          }
        } catch (err) {
          setProfileErrors({
            mobile_number: "Could not verify if number is available.",
          });
          setIsSubmittingProfile(false);
          return;
        }

        // ✅ 2. Number is available! Trigger Firebase OTP
        setupRecaptcha();
        const appVerifier = window.recaptchaVerifier;
        const confirmation = await signInWithPhoneNumber(
          auth,
          formattedMobile,
          appVerifier,
        );
        setConfirmationResult(confirmation);
        setShowOtp(true);
        setIsSubmittingProfile(false);
        return; // Stop here and wait for OTP input
      }

      // PHASE 2: IF OTP IS SHOWING, VERIFY IT
      if (showOtp && confirmationResult) {
        if (!otp || otp.length < 6) {
          setProfileErrors({ otp: "Please enter a valid 6-digit OTP." });
          setIsSubmittingProfile(false);
          return;
        }

        const result = await confirmationResult.confirm(otp);
        const firebaseToken = await result.user.getIdToken(true);

        // Dispatch Backend Update
        await dispatch(
          updateMobileWithFirebase({
            mobile_number: `+91${editForm.mobile_number}`,
            firebase_token: firebaseToken,
          }),
        ).unwrap();
      }

      // PHASE 3: UPDATE NAME/EMAIL IF NEEDED
      if (nameOrEmailChanged) {
        await dispatch(
          updateUserProfile({
            first_name: editForm.first_name,
            email: editForm.email,
          }),
        ).unwrap();
      }

      alert("Profile updated successfully!");
      closeEditMode();
    } catch (error) {
      console.error(error);
      if (
        error &&
        typeof error === "object" &&
        !error.message &&
        !error.detail &&
        !error.code
      ) {
        setProfileErrors(error); // DRF errors
      } else {
        alert(
          error?.message ||
            error?.detail ||
            "Verification or update failed. Please try again.",
        );
      }
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const closeEditMode = () => {
    setIsEditing(false);
    setShowOtp(false);
    setOtp("");
    setConfirmationResult(null);
    setProfileErrors({});
  };

  // ----------------------------------------------------
  // ADDRESS FORM STATE & VALIDATION
  // ----------------------------------------------------
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressErrors, setAddressErrors] = useState({});
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    address_line: "",
    city: "",
    state: "",
    pincode: "",
    is_default: false,
  });

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!addressForm.label.trim()) errors.label = "Label is required.";
    if (!addressForm.address_line.trim())
      errors.address_line = "Full address is required.";
    if (!addressForm.city.trim()) errors.city = "City is required.";
    if (!addressForm.state.trim()) errors.state = "State is required.";
    if (!/^\d{6}$/.test(addressForm.pincode))
      errors.pincode = "Pincode must be exactly 6 digits.";

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }

    setAddressErrors({});
    setIsAddingAddress(true);

    try {
      await dispatch(createAddress(addressForm)).unwrap();
      alert("Address added successfully!");
      setShowAddressForm(false);
      setAddressForm({
        label: "Home",
        address_line: "",
        city: "",
        state: "",
        pincode: "",
        is_default: false,
      });
    } catch (error) {
      if (error && typeof error === "object" && !error.message && !error.detail)
        setAddressErrors(error);
      else alert(error?.message || error?.detail || "Failed to add address.");
    } finally {
      setIsAddingAddress(false);
    }
  };

  useEffect(() => {
    if (!restaurantFetched) dispatch(fetchRestaurantDetails());
    if (!orderFetched) dispatch(fetchOrders());
    if (!profileFetched) dispatch(fetchUserProfile());
  }, [restaurantFetched, orderFetched, profileFetched, dispatch]);

  const handleLogout = () => dispatch(logoutUser());
  const getErrorText = (err) => (Array.isArray(err) ? err[0] : err);

  const activeOrders =
    orders?.filter((o) =>
      ["CREATED", "PAID", "ACCEPTED", "PREPARING", "READY"].includes(o.status),
    ) || [];

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (parseFloat(item.total) || 0),
    0,
  );
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-28">
      {/* Invisible ReCAPTCHA Container */}
      <div id="recaptcha-container"></div>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
          <button
            onClick={() => navigate("/customer/settings")}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 py-3">
        {/* User Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 mb-4 shadow-sm">
          {!isEditing ? (
            <>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-md shrink-0">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="truncate">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {displayUser?.first_name ||
                          displayUser?.name ||
                          "Guest User"}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {displayUser?.email || "No email provided"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {displayUser?.mobile_number || "No mobile number"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setProfileErrors({});
                      }}
                      className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shrink-0"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        4.5
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Regular customer
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </>
          ) : (
            // Edit Profile Form
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-purple-600" /> Edit Profile
                </h3>
                <button
                  type="button"
                  onClick={closeEditMode}
                  className="p-1 text-gray-400 hover:text-gray-600 bg-gray-50 dark:bg-gray-700 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled={showOtp}
                  className={`w-full mt-1 p-2.5 bg-gray-50 dark:bg-gray-900 border ${profileErrors.first_name ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none`}
                  value={editForm.first_name}
                  onChange={(e) => {
                    setEditForm({ ...editForm, first_name: e.target.value });
                    if (profileErrors.first_name)
                      setProfileErrors({ ...profileErrors, first_name: null });
                  }}
                />
                {profileErrors.first_name && (
                  <p className="text-red-500 text-[10px] mt-1 ml-1">
                    {getErrorText(profileErrors.first_name)}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled={showOtp}
                  className={`w-full mt-1 p-2.5 bg-gray-50 dark:bg-gray-900 border ${profileErrors.email ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none`}
                  value={editForm.email}
                  onChange={(e) => {
                    setEditForm({ ...editForm, email: e.target.value });
                    if (profileErrors.email)
                      setProfileErrors({ ...profileErrors, email: null });
                  }}
                />
                {profileErrors.email && (
                  <p className="text-red-500 text-[10px] mt-1 ml-1">
                    {getErrorText(profileErrors.email)}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Mobile Number
                </label>
                <div className="flex relative mt-1">
                  <span
                    className={`inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 ${profileErrors.mobile_number ? "border-red-500" : "border-gray-200"} rounded-l-lg dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`}
                  >
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    disabled={showOtp}
                    className={`w-full p-2.5 bg-gray-50 dark:bg-gray-900 border ${profileErrors.mobile_number ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-r-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none`}
                    value={editForm.mobile_number}
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, "");
                      setEditForm({ ...editForm, mobile_number: onlyNums });
                      if (profileErrors.mobile_number)
                        setProfileErrors({
                          ...profileErrors,
                          mobile_number: null,
                        });
                    }}
                  />
                </div>
                {profileErrors.mobile_number && (
                  <p className="text-red-500 text-[10px] mt-1 ml-1">
                    {getErrorText(profileErrors.mobile_number)}
                  </p>
                )}
              </div>

              {showOtp && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800 animate-in fade-in zoom-in duration-300">
                  <label className="text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1 mb-2">
                    <Key className="w-3 h-3" /> Enter OTP sent to +91{" "}
                    {editForm.mobile_number}
                  </label>
                  <input
                    type="number"
                    placeholder="Enter 6-digit OTP"
                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none text-center tracking-[0.5em] font-bold"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      if (profileErrors.otp)
                        setProfileErrors({ ...profileErrors, otp: null });
                    }}
                  />
                  {profileErrors.otp && (
                    <p className="text-red-500 text-[10px] mt-1 ml-1 text-center">
                      {getErrorText(profileErrors.otp)}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingProfile}
                className="w-full py-2.5 mt-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-70"
              >
                {isSubmittingProfile ? (
                  "Processing..."
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {showOtp
                      ? "Verify & Save"
                      : editForm.mobile_number !==
                          (displayUser.mobile_number || "").replace("+91", "")
                        ? "Send OTP & Save"
                        : "Save Changes"}
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 text-center shadow-sm">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {orders?.length || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total Orders
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 text-center shadow-sm">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
              <ShoppingCart className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {cartItems?.length || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Cart Items
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 text-center shadow-sm">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {activeOrders.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Active Orders
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${activeTab === "profile" ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700"}`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("restaurant")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${activeTab === "restaurant" ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700"}`}
          >
            Restaurant
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${activeTab === "orders" ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700"}`}
          >
            Orders
          </button>
        </div>

        {/* Profile Tab Content */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            {/* My Addresses Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Saved Addresses
                  </h3>
                </div>
                {!showAddressForm && (
                  <button
                    onClick={() => {
                      setShowAddressForm(true);
                      setAddressErrors({});
                    }}
                    className="text-xs font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1 bg-purple-50 dark:bg-purple-900/30 px-2 py-1.5 rounded-md hover:bg-purple-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add New
                  </button>
                )}
              </div>

              {showAddressForm ? (
                <form
                  onSubmit={handleAddAddress}
                  className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl space-y-3 mb-2 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      New Address
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="p-1 bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-600 shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Label (e.g. Home, Work)"
                        className={`w-full p-2.5 bg-white dark:bg-gray-800 border ${addressErrors.label ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none`}
                        value={addressForm.label}
                        onChange={(e) => {
                          setAddressForm({
                            ...addressForm,
                            label: e.target.value,
                          });
                          if (addressErrors.label)
                            setAddressErrors({ ...addressErrors, label: null });
                        }}
                      />
                      {addressErrors.label && (
                        <p className="text-red-500 text-[10px] mt-1 ml-1">
                          {getErrorText(addressErrors.label)}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <textarea
                        placeholder="Full Address Line"
                        rows="2"
                        className={`w-full p-2.5 bg-white dark:bg-gray-800 border ${addressErrors.address_line ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none`}
                        value={addressForm.address_line}
                        onChange={(e) => {
                          setAddressForm({
                            ...addressForm,
                            address_line: e.target.value,
                          });
                          if (addressErrors.address_line)
                            setAddressErrors({
                              ...addressErrors,
                              address_line: null,
                            });
                        }}
                      />
                      {addressErrors.address_line && (
                        <p className="text-red-500 text-[10px] mt-1 ml-1">
                          {getErrorText(addressErrors.address_line)}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="City"
                        className={`w-full p-2.5 bg-white dark:bg-gray-800 border ${addressErrors.city ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none`}
                        value={addressForm.city}
                        onChange={(e) => {
                          setAddressForm({
                            ...addressForm,
                            city: e.target.value,
                          });
                          if (addressErrors.city)
                            setAddressErrors({ ...addressErrors, city: null });
                        }}
                      />
                      {addressErrors.city && (
                        <p className="text-red-500 text-[10px] mt-1 ml-1">
                          {getErrorText(addressErrors.city)}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="State"
                        className={`w-full p-2.5 bg-white dark:bg-gray-800 border ${addressErrors.state ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none`}
                        value={addressForm.state}
                        onChange={(e) => {
                          setAddressForm({
                            ...addressForm,
                            state: e.target.value,
                          });
                          if (addressErrors.state)
                            setAddressErrors({ ...addressErrors, state: null });
                        }}
                      />
                      {addressErrors.state && (
                        <p className="text-red-500 text-[10px] mt-1 ml-1">
                          {getErrorText(addressErrors.state)}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <input
                        type="tel"
                        maxLength={6}
                        placeholder="Pincode"
                        className={`w-full p-2.5 bg-white dark:bg-gray-800 border ${addressErrors.pincode ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none`}
                        value={addressForm.pincode}
                        onChange={(e) => {
                          const onlyNums = e.target.value.replace(/\D/g, "");
                          setAddressForm({ ...addressForm, pincode: onlyNums });
                          if (addressErrors.pincode)
                            setAddressErrors({
                              ...addressErrors,
                              pincode: null,
                            });
                        }}
                      />
                      {addressErrors.pincode && (
                        <p className="text-red-500 text-[10px] mt-1 ml-1">
                          {getErrorText(addressErrors.pincode)}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        id="is_default"
                        checked={addressForm.is_default}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            is_default: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <label
                        htmlFor="is_default"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Set as default address
                      </label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isAddingAddress}
                    className="w-full mt-2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-70"
                  >
                    {isAddingAddress ? "Saving..." : "Save Address"}
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  {displayUser?.addresses?.length > 0 ? (
                    displayUser.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700"
                      >
                        <MapPin className="w-4 h-4 text-purple-500 mt-1 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {addr.label}
                            </span>
                            {addr.is_default && (
                              <span className="text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {addr.address_line}, {addr.city}, {addr.state} -{" "}
                            {addr.pincode}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        No addresses saved yet.
                      </p>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="text-xs font-medium text-purple-600 hover:underline"
                      >
                        Add your first address
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/customer/menu"
                  className="p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl flex flex-col items-center gap-2 transition-colors border border-transparent hover:border-purple-100 dark:hover:border-purple-800"
                >
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Order Now
                  </span>
                </Link>
                <Link
                  to="/customer/orders"
                  className="p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl flex flex-col items-center gap-2 transition-colors border border-transparent hover:border-purple-100 dark:hover:border-purple-800"
                >
                  <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    My Orders
                  </span>
                </Link>
                <Link
                  to="/customer/cart"
                  className="p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl flex flex-col items-center gap-2 transition-colors border border-transparent hover:border-purple-100 dark:hover:border-purple-800"
                >
                  <ShoppingCart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    My Cart
                  </span>
                </Link>
                <Link
                  to="/customer/favorites"
                  className="p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl flex flex-col items-center gap-2 transition-colors border border-transparent hover:border-purple-100 dark:hover:border-purple-800"
                >
                  <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Favorites
                  </span>
                </Link>
              </div>
            </div>

            {/* Cart Summary */}
            {cartItems.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Current Cart
                    </h3>
                  </div>
                  <Link
                    to="/customer/cart"
                    className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1 font-medium"
                  >
                    View Cart <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {cartItems.slice(0, 2).map((item) => (
                    <div
                      key={item.dish_id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {item.name}{" "}
                          <span className="text-gray-400 text-xs ml-1">
                            x{item.quantity}
                          </span>
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        ₹{item.total}
                      </span>
                    </div>
                  ))}
                  {cartItems.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1">
                      +{cartItems.length - 2} more items
                    </div>
                  )}
                  <div className="pt-3 mt-1 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Cart Total
                      </span>
                      <span className="text-base font-bold text-purple-600 dark:text-purple-400">
                        ₹{cartTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Restaurant Tab Content */}
        {activeTab === "restaurant" && (
          <div>
            {restaurantLoading && (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                Loading restaurant details...
              </div>
            )}
            {restaurantError && (
              <div className="text-center py-6 text-red-500 text-sm">
                {restaurantError?.message || "Failed to load restaurant"}
              </div>
            )}
            {restaurant && !restaurantLoading && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"></span>
                    Restaurant Information
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg shrink-0">
                        <MapPin className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5">
                          Address
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          {restaurant.address}, {restaurant.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg shrink-0">
                        <Phone className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5">
                          Contact
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {restaurant.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg shrink-0">
                        <Clock className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5">
                          Operating Hours
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {restaurant.opening_time} - {restaurant.closing_time}
                        </p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block ${restaurant.is_open ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
                        >
                          {restaurant.is_open ? "Open Now" : "Closed"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                    About {restaurant.name}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Welcome to {restaurant.name}, located in {restaurant.city}.
                    Experience quality food and excellent service.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Orders Tab Content */}
        {activeTab === "orders" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Order History
              </h3>
            </div>
            {orders?.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.order_id}
                    className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          #{order.order_id.slice(-8)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(order.created_at)}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.status === "CANCELLED" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : order.status === "COMPLETED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          ₹{order.total}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {order.items?.length || 0} items
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/customer/orders/${order.order_id}`}
                      className="inline-flex mt-1 text-xs font-medium text-purple-600 dark:text-purple-400 items-center gap-1 hover:underline"
                    >
                      View Details <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
                {orders.length > 5 && (
                  <div className="pt-2 text-center">
                    <Link
                      to="/customer/orders"
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 py-2 px-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 transition-colors inline-block"
                    >
                      View all {orders.length} orders
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  No orders yet
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
                  Looks like you haven't made your first order.
                </p>
                <Link
                  to="/customer/menu"
                  className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Browse Menu
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
