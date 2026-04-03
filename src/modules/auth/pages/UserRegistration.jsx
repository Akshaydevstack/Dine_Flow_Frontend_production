import { useState, useEffect, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate, useLocation } from "react-router-dom";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Hooks & Config
import { registrationSchema } from "../../../validations/registrationSchema";
import useTheme from "../../../hooks/useTheme";
import axiosClient from "../../../api/axiosClient";
import { auth } from "../../../firebase/firebaseConfig";

// Components
import ErrorOverlay from "../../../components/ui/ErrorOverlay";

export default function UserRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  // Extract state passed from Login page
  const {
    restaurant_id,
    mobile_number,
    current_table_id,
    qr_code_token,
  } = location.state || {};

  // State
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const recaptchaVerifierRef = useRef(null);

  // Redirect if no mobile number (security check)
  useEffect(() => {
    if (!mobile_number) {
      navigate("/customer/login", { replace: true });
    }
  }, [mobile_number, navigate]);

  // Error Handling
  useEffect(() => {
    if (error) setShowError(true);
  }, [error]);

  // Cleanup Recaptcha
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          console.error("Recaptcha cleanup error", e);
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setError(null);
    const { mobile_number } = values;

    if (!mobile_number || mobile_number.length < 10) {
      setError("Enter a valid 10-digit mobile number.");
      setSubmitting(false);
      return;
    }

    // 1. Check User Existence (Reverse logic of login: User MUST NOT exist)
    try {
      const res = await axiosClient.post("/auth/check-user/", {
        restaurant_id,
        mobile_number: "+91" + mobile_number,
        current_table_id,
        qr_code_token,
      });

      if (res.data.exists) {
        setError(res.data.message || "User already exists. Please login.");
        setSubmitting(false);
        return;
      }
    } catch (err) {
      setError(
        err?.response?.data?.error || "Server error while checking user."
      );
      setSubmitting(false);
      return;
    }

    // 2. Send OTP
    try {
      setLoadingOtp(true);
      setupRecaptcha();

      const confirmation = await signInWithPhoneNumber(
        auth,
        "+91" + mobile_number,
        recaptchaVerifierRef.current
      );

      window.confirmationResult = confirmation;
      navigate("/customer/verify-otp", {
        replace: true,
        state: {
          flow: "register",
          ...values, // Pass name, email, etc.
          restaurant_id,
          qr_code_token,
          current_table_id,
        },
      });
    } catch (err) {
      console.error("sendOtp error:", err);
      setError(err?.message || "Failed to send OTP.");
    } finally {
      setLoadingOtp(false);
      setSubmitting(false);
    }
  };

  if (!mobile_number) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center gradient-bg text-gray-900 dark:text-gray-100 p-4 font-body overflow-hidden relative selection:bg-purple-500/30">
      
      {/* =======================
          BACKGROUND (STATIC / NO ANIMATION)
          ======================= */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] left-[10%] w-24 h-24 bg-pink-500/10 rounded-full blur-[40px]" />
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

      {/* Hidden Recaptcha */}
      <div id="recaptcha-container" className="hidden"></div>

      {/* =======================
          MAIN CARD CONTENT 
          ======================= */}
      <div className="w-full max-w-md relative z-10 flex flex-col items-center gap-6">
        
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center justify-center animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-brand font-bold text-gray-900 dark:text-white drop-shadow-sm mb-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-400">
            Dine Flow
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-widest uppercase text-[10px]">
            New Account
          </p>
        </div>

        {/* Registration Card */}
        <div className="w-full glass relative overflow-hidden rounded-3xl p-[1px] shadow-2xl animate-slide-up-delay-2">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[23px] p-6 sm:p-8 relative">
            
            {/* Header Text */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                Almost There!
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Finish setting up your profile.
              </p>
            </div>

            <Formik
              initialValues={{
                first_name: "",
                email: "",
                mobile_number: mobile_number || "",
              }}
              validationSchema={registrationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-5">
                  
                  {/* Name Input */}
                  <div className="group space-y-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                      Full Name
                    </label>
                    <Field
                      name="first_name"
                      type="text"
                      placeholder="e.g. Akshay Bharathan"
                      className={`
                        w-full px-4 py-3.5 
                        bg-gray-50 dark:bg-gray-800/50 
                        border-2 rounded-xl text-lg font-heading font-semibold tracking-wide
                        text-gray-900 dark:text-white placeholder-gray-400 
                        transition-all duration-200
                        focus:outline-none focus:bg-white dark:focus:bg-gray-800
                        ${
                          errors.first_name && touched.first_name
                            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                            : "border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-purple-300 dark:hover:border-purple-700"
                        }
                      `}
                    />
                    <ErrorMessage name="first_name" component="div" className="text-xs font-medium text-red-500 px-1 animate-slide-up" />
                  </div>

                  {/* Email Input */}
                  <div className="group space-y-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                      Email Address
                    </label>
                    <Field
                      name="email"
                      type="email"
                      placeholder="akshay@example.com"
                      className={`
                        w-full px-4 py-3.5 
                        bg-gray-50 dark:bg-gray-800/50 
                        border-2 rounded-xl text-lg font-heading font-semibold tracking-wide
                        text-gray-900 dark:text-white placeholder-gray-400 
                        transition-all duration-200
                        focus:outline-none focus:bg-white dark:focus:bg-gray-800
                        ${
                          errors.email && touched.email
                            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                            : "border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-purple-300 dark:hover:border-purple-700"
                        }
                      `}
                    />
                    <ErrorMessage name="email" component="div" className="text-xs font-medium text-red-500 px-1 animate-slide-up" />
                  </div>

                  {/* Mobile Input (Read Only / Pre-filled) */}
                  <div className="group space-y-2 opacity-70 cursor-not-allowed">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                      Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 z-10">
                         <span className="text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                          🇮🇳 +91
                        </span>
                      </div>
                      <Field
                        name="mobile_number"
                        type="tel"
                        disabled
                        className="w-full pl-20 pr-4 py-3.5 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-lg font-heading font-semibold tracking-wide text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <div className="absolute right-3 text-green-500 animate-scale-in">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || loadingOtp}
                    className="w-full py-3.5 mt-2 rounded-xl btn-primary font-heading font-bold text-white shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || loadingOtp ? (
                       <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Processing...</span>
                       </div>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Create Account
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    )}
                  </button>
                </Form>
              )}
            </Formik>

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