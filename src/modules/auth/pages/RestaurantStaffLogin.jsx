import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../store/hooks";
import useTheme from "../../../hooks/useTheme";
import ErrorOverlay from "../../../components/ui/ErrorOverlay";
import { loginStaff } from "../../../store/slices/authSlices/authSlice";
import { 
  User, 
  Lock, 
  ShieldCheck, 
  LayoutDashboard, 
  ChefHat, 
  UtensilsCrossed 
} from "lucide-react";

export default function RestaurantStaffLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error) setShowError(true);
  }, [error]);

  const handleSubmit = async (values, { setSubmitting }) => {
    setError(null);
    setLoading(true);

    try {
      const result = await dispatch(
        loginStaff({
          user_name: values.username,
          password: values.password,
        })
      ).unwrap();

      const user = result.user;
      
      switch (user.role) {
        case "restaurant-admin":
          navigate("/restaurant/admin/dashboard");
          break;
        case "kitchen-staff":
          navigate("/kitchen/display");
          break;
        case "waiter":
          navigate("/waiter/tables");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setError(err?.message || "Invalid username or password");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center gradient-bg text-gray-900 dark:text-gray-100 p-4 font-body overflow-hidden relative selection:bg-purple-500/30">
      
      {/* =======================
          BACKGROUND (STATIC / COPIED FROM USER LOGIN)
          ======================= */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] left-[10%] w-24 h-24 bg-indigo-500/10 rounded-full blur-[40px]" />
        <div className="absolute bottom-[30%] right-[15%] w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px]" />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-6 right-6 p-3 glass rounded-full shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:scale-110 z-50 group"
        aria-label="Toggle theme"
      >
        <div className="relative w-6 h-6 flex items-center justify-center overflow-hidden">
          <span
            className={`absolute transition-all duration-500 ${theme === "dark" ? "rotate-90 opacity-0 translate-y-4" : "rotate-0 opacity-100 translate-y-0"}`}
          >
            ☀️
          </span>
          <span
            className={`absolute transition-all duration-500 ${theme === "dark" ? "rotate-0 opacity-100 translate-y-0" : "-rotate-90 opacity-0 -translate-y-4"}`}
          >
            🌙
          </span>
        </div>
      </button>

      {/* Error Overlay */}
      {showError && (
        <ErrorOverlay error={error} onClose={() => setShowError(false)} />
      )}

      {/* =======================
          MAIN CARD CONTENT 
          ======================= */}
      <div className="w-full max-w-md relative z-10 flex flex-col items-center gap-6">
        
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center justify-center animate-slide-up">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-3">
             <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-brand font-bold text-gray-900 dark:text-white drop-shadow-sm mb-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-400">
            Dine Flow
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-widest uppercase text-[10px]">
            Staff Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full glass relative overflow-hidden rounded-3xl p-[1px] shadow-2xl animate-slide-up-delay-2">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[23px] p-6 sm:p-8 relative">
            
            {/* Header Text / Role Divider */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4">
                Access Workspace
              </h2>
              {/* Visual Divider for Roles */}
              <div className="flex justify-center gap-6 opacity-50">
                <LayoutDashboard className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div className="w-[1px] h-5 bg-gray-300 dark:bg-gray-700"></div>
                <ChefHat className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div className="w-[1px] h-5 bg-gray-300 dark:bg-gray-700"></div>
                <UtensilsCrossed className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
            </div>

            <Formik
              initialValues={{ username: "", password: "" }}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Username Input */}
                  <div className="group space-y-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                      Username / ID
                    </label>

                    <div className="relative flex items-center group">
                      <div className="absolute left-3 z-10 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-purple-500">
                         <User className="w-5 h-5" />
                      </div>
                      
                      <Field
                        name="username"
                        type="text"
                        placeholder="Enter Staff ID"
                        className={`
                          w-full pl-11 pr-4 py-3.5 
                          bg-gray-50 dark:bg-gray-800/50 
                          border-2 rounded-xl text-lg font-heading font-semibold tracking-wide
                          text-gray-900 dark:text-white placeholder-gray-400 
                          transition-all duration-200
                          focus:outline-none focus:bg-white dark:focus:bg-gray-800
                          border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-purple-300 dark:hover:border-purple-700
                        `}
                      />
                    </div>
                    <ErrorMessage name="username" component="div" className="text-xs font-medium text-red-500 px-1 animate-slide-up" />
                  </div>

                  {/* Password Input */}
                  <div className="group space-y-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                      Password
                    </label>

                    <div className="relative flex items-center group">
                      <div className="absolute left-3 z-10 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-purple-500">
                         <Lock className="w-5 h-5" />
                      </div>
                      
                      <Field
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className={`
                          w-full pl-11 pr-4 py-3.5 
                          bg-gray-50 dark:bg-gray-800/50 
                          border-2 rounded-xl text-lg font-heading font-semibold tracking-wide
                          text-gray-900 dark:text-white placeholder-gray-400 
                          transition-all duration-200
                          focus:outline-none focus:bg-white dark:focus:bg-gray-800
                          border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-purple-300 dark:hover:border-purple-700
                        `}
                      />
                    </div>
                    <ErrorMessage name="password" component="div" className="text-xs font-medium text-red-500 px-1 animate-slide-up" />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="w-full py-3.5 rounded-xl btn-primary font-heading font-bold text-white shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                       <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Authenticating...</span>
                       </div>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Login to Dashboard
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    )}
                  </button>
                </Form>
              )}
            </Formik>

            {/* Support Link */}
            <div className="mt-8 text-center animate-slide-up-delay-4">
               <p className="text-xs text-gray-400 dark:text-gray-500">
                 Forgot credentials? Contact <span className="text-purple-600 dark:text-purple-400 font-bold cursor-pointer hover:underline">Admin</span>
               </p>
            </div>
            
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex flex-col items-center animate-slide-up-delay-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Protected by reCAPTCHA and Firebase
          </p>
          <div className="mt-2 flex gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span className="hover:text-purple-500 cursor-pointer transition-colors">
              Privacy Policy
            </span>
            <span>•</span>
            <span className="hover:text-purple-500 cursor-pointer transition-colors">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}