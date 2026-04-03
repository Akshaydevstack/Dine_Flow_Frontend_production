import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { registerUser, loginUser } from "../../../store/slices/authSlices/authSlice";
import ErrorOverlay from "../../../components/ui/ErrorOverlay";
import { RecaptchaVerifier } from "firebase/auth";
import { auth } from "../../../firebase/firebaseConfig";
import useTheme from "../../../hooks/useTheme";

export default function UserOtpVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authError = useAppSelector((s) => s.auth.error);
  const [showError, setShowError] = useState(authError || null);
  const { theme, setTheme } = useTheme();
  
  // Logic preserved exactly as is
  const initialForm = location.state || null;
  const flow = initialForm?.flow;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const recaptchaRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (!initialForm || !flow) {
      navigate("/customer/login", { replace: true });
    }
  }, [initialForm, flow, navigate]);

  useEffect(() => {
    if (authError) setShowError(authError);
  }, [authError]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (!recaptchaRef.current) {
      try {
        recaptchaRef.current = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
          }
        );
      } catch (err) {}
    }
    return () => {
      if (recaptchaRef.current) {
        try {
          recaptchaRef.current.clear();
        } catch {}
        recaptchaRef.current = null;
      }
    };
  }, []);

  const handleInputChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, "");
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || "";
      }
      setOtp(newOtp);

      const lastFilledIndex = Math.min(pastedData.length - 1, 5);
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  const handleVerify = async () => {
    setShowError(null);
    const otpString = otp.join("");

    if (!window.confirmationResult) {
      setShowError("OTP session expired. Please try again.");
      return;
    }

    if (otpString.length < 6) {
      setShowError("Please enter the complete 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const result = await window.confirmationResult.confirm(otpString);
      const idToken = await result.user.getIdToken();

      let action;

      if (flow === "register") {
        action = await dispatch(
          registerUser({
            ...initialForm,
            firebase_token: idToken,
            mobile_number: "+91" + initialForm.mobile_number,
          })
        );
      }

      if (flow === "login") {
        action = await dispatch(
          loginUser({
            ...initialForm,
            mobile_number: "+91" + initialForm.mobile_number,
            firebase_token: idToken,
          })
        );
      }

      if (action && action.meta.requestStatus === "fulfilled") {
        navigate("/customer/menu", { replace: true });
      } else {
        setShowError(action?.payload || "Authentication failed");
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      setShowError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setTimer(60);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

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

      {showError && (
        <ErrorOverlay error={showError} onClose={() => setShowError(null)} />
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
            Verify Your Account
          </p>
        </div>

        {/* Glass Card */}
        <div className="w-full glass relative overflow-hidden rounded-3xl p-[1px] shadow-2xl animate-slide-up-delay-2">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[23px] p-6 sm:p-8 relative">
            
            {/* Header Text */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                Enter OTP
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                We've sent a 6-digit code to <br/>
                <span className="font-bold text-gray-800 dark:text-gray-200 font-mono text-base">
                  +91 {initialForm?.mobile_number}
                </span>
              </p>
            </div>

            {/* OTP Inputs */}
            <div className="space-y-6">
              <div
                className="flex justify-center gap-2 sm:gap-3"
                onPaste={handlePaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`
                      w-10 h-14 sm:w-12 sm:h-16 
                      bg-gray-50 dark:bg-gray-800/50 border-2 
                      rounded-xl text-center text-xl sm:text-2xl font-extrabold
                      text-gray-900 dark:text-white 
                      focus:outline-none transition-all duration-300
                      ${
                        digit
                          ? "border-purple-500 focus:border-purple-500 shadow-lg shadow-purple-500/20 scale-105"
                          : "border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                      }
                    `}
                  />
                ))}
              </div>

              {/* Timer / Resend */}
              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    Resend OTP in <span className="text-purple-600 dark:text-purple-400">{timer}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 hover:underline transition-all"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={loading || otp.join("").length !== 6}
                className="w-full py-3.5 rounded-xl btn-primary font-heading font-bold text-white shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                   <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying...</span>
                   </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Verify & Continue
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </span>
                )}
              </button>
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