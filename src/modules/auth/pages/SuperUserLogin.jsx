import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../store/hooks";
import useTheme from "../../../hooks/useTheme";
import ErrorOverlay from "../../../components/ui/ErrorOverlay";
import { loginSuperAdmin } from "../../../store/slices/authSlices/authSlice";
import {
  Mail,
  Lock,
  Crown,
  Server,
  Database,
  Activity,
  Loader2,
} from "lucide-react";

export default function SuperUserLogin() {
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
        loginSuperAdmin({
          user_name: values.email,
          password: values.password,
        }),
      ).unwrap();
      const user = result.user;

      if (user.role === "super-admin" && user.is_superadmin) {
        navigate("/super-admin/dashboard");
      }
    } catch (err) {
      setError(err?.message || "Invalid super admin credentials");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center gradient-bg text-gray-900 dark:text-gray-100 p-4 font-body overflow-hidden relative selection:bg-yellow-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-yellow-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] left-[10%] w-24 h-24 bg-red-500/10 rounded-full blur-[40px]" />
      </div>

      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-6 right-6 p-3 glass rounded-full shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 hover:scale-110 z-50 group"
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      {/* Error Overlay */}
      {showError && (
        <ErrorOverlay error={error} onClose={() => setShowError(false)} />
      )}

      <div className="w-full max-w-md relative z-10 flex flex-col items-center gap-6">
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center justify-center animate-slide-up">
          {/* Crown Icon for Super Admin */}
          <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30 mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-brand font-bold text-gray-900 dark:text-white drop-shadow-sm mb-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-400">
            Dine Flow
          </h1>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-400">
            System Admin
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full glass relative overflow-hidden rounded-3xl p-[1px] shadow-2xl animate-slide-up-delay-2">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[23px] p-6 sm:p-8 relative">
            
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4">
                Master Control
              </h2>
              {/* Visual Divider for System Icons */}
              <div className="flex justify-center gap-6 opacity-50">
                <Server className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div className="w-[1px] h-5 bg-gray-300 dark:bg-gray-700"></div>
                <Database className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div className="w-[1px] h-5 bg-gray-300 dark:bg-gray-700"></div>
                <Activity className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
            </div>

            <Formik
              initialValues={{ email: "", password: "" }}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Email Input */}
                  <div className="group space-y-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                      Admin Email
                    </label>

                    <div className="relative flex items-center group">
                      <div className="absolute left-3 z-10 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-yellow-500">
                        <Mail className="w-5 h-5" />
                      </div>

                      <Field
                        name="email"
                        type="email"
                        placeholder="admin@dineflow.com"
                        className={`
                          w-full pl-11 pr-4 py-3.5 
                          bg-gray-50 dark:bg-gray-800/50 
                          border-2 rounded-xl text-lg font-heading font-semibold tracking-wide
                          text-gray-900 dark:text-white placeholder-gray-400 
                          transition-all duration-200
                          focus:outline-none focus:bg-white dark:focus:bg-gray-800
                          border-gray-200 dark:border-gray-700 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 hover:border-yellow-300 dark:hover:border-yellow-700
                        `}
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-xs font-medium text-red-500 px-1 animate-slide-up"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="group space-y-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                      Master Password
                    </label>

                    <div className="relative flex items-center group">
                      <div className="absolute left-3 z-10 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-yellow-500">
                        <Lock className="w-5 h-5" />
                      </div>

                      <Field
                        name="password"
                        type="password"
                        placeholder="••••••••••••"
                        className={`
                          w-full pl-11 pr-4 py-3.5 
                          bg-gray-50 dark:bg-gray-800/50 
                          border-2 rounded-xl text-lg font-heading font-semibold tracking-wide
                          text-gray-900 dark:text-white placeholder-gray-400 
                          transition-all duration-200
                          focus:outline-none focus:bg-white dark:focus:bg-gray-800
                          border-gray-200 dark:border-gray-700 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 hover:border-yellow-300 dark:hover:border-yellow-700
                        `}
                      />
                    </div>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-xs font-medium text-red-500 px-1 animate-slide-up"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || isSubmitting}
                    // Overriding btn-primary for a custom Gold gradient
                    className="w-full py-3.5 rounded-xl text-white font-heading font-bold shadow-lg shadow-yellow-500/20 active:scale-[0.98] transition-all relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Access...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Authenticate
                        <Server className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </Form>
              )}
            </Formik>

            {/* Warning Text */}
            <div className="mt-8 text-center animate-slide-up-delay-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3" />
                Restricted Area. Authorized Personnel Only.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex flex-col items-center animate-slide-up-delay-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            System Version v2.4.0
          </p>
        </div>
      </div>
    </div>
  );
}
