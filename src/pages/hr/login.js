
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Icon } from "@iconify/react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";
import { supabase } from "@/lib/supabase";
import Footer from "@/layouts/footer";
import Link from "next/link";

export default function HRLogin() {
  const [email, setEmail] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(true);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mode] = useState("light");
  const router = useRouter();

  useEffect(() => {
    console.log("[HRLogin] Component mounted");
    const savedEmail = localStorage.getItem("hr_remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const getBrowserCookies = () => {
    const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
      const [name, value] = cookie.split("=");
      acc[name] = value || "";
      return acc;
    }, {});
    return cookies;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("[HRLogin] Form submitted, handleLogin called");

    if (!captchaVerified) {
      console.log("[HRLogin] CAPTCHA not verified");
      toast.error("Please verify the CAPTCHA.", { icon: "⚠️" });
      return;
    }

    try {
      console.log("[HRLogin] Attempting login with email:", email);
      const {
        data: { user, session },
        error: authError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("[HRLogin] Auth response:", {
        user: user ? { id: user.id, email: user.email } : null,
        session: session
          ? { access_token: session.access_token.slice(0, 10) + "..." }
          : null,
        authError: authError ? authError.message : null,
      });

      if (authError) {
        console.error("[HRLogin] Supabase auth error:", authError);
        toast.error(authError.message || "Invalid email or password.", {
          icon: "❌",
        });
        return;
      }

      if (!session) {
        console.error("[HRLogin] No session returned");
        toast.error("No session established. Please try again.", {
          icon: "❌",
        });
        return;
      }

      // Log cookies
      const cookies = getBrowserCookies();
      console.log("[HRLogin] Browser cookies after login:", cookies);

      // Verify session
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession();
      console.log("[HRLogin] Current session after login:", {
        currentSession: currentSession
          ? { access_token: currentSession.access_token.slice(0, 10) + "..." }
          : null,
        sessionError: sessionError ? sessionError.message : null,
      });

      if (sessionError || !currentSession) {
        console.error("[HRLogin] Session verification failed:", sessionError);
        toast.error("Failed to verify session.", { icon: "❌" });
        return;
      }

      // Verify user in hr_users
      console.log("[HRLogin] Checking hr_users for user ID:", user.id);
      const { data: hrUser, error: hrError } = await supabase
        .from("hr_users")
        .select("id")
        .eq("id", user.id)
        .single();

      console.log("[HRLogin] HR User check:", {
        hrUser,
        hrError: hrError ? hrError.message : null,
      });

      if (hrError || !hrUser) {
        console.log("[HRLogin] Adding user to hr_users");
        const { error: insertError } = await supabase
          .from("hr_users")
          .insert([{ id: user.id, username: email }]);
        if (insertError) {
          console.error("[HRLogin] Error adding to hr_users:", insertError);
          toast.error("Failed to authorize user.", { icon: "❌" });
          return;
        }
        console.log("[HRLogin] Added user to hr_users:", {
          id: user.id,
          username: email,
        });
      }

      if (rememberMe) {
        localStorage.setItem("hr_remembered_email", email);
      } else {
        localStorage.removeItem("hr_remembered_email");
      }

      console.log("[HRLogin] Attempting redirect to /hr/overview");
      toast.success("Login successful! Redirecting...", { icon: "✅" });
      await router.push("/hr/overview").catch((err) => {
        console.error("[HRLogin] Redirect error:", err);
        toast.error("Failed to redirect. Please navigate manually.", {
          icon: "❌",
        });
      });
    } catch (error) {
      console.error("[HRLogin] Unexpected error:", error);
      toast.error("An unexpected error occurred.", { icon: "❌" });
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    console.log("[HRLogin] Form submitted, handleMagicLink called");
    const loadingToast = toast.loading("Please wait...");

    try {
      console.log("[HRLogin] Sending magic link to:", email);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/hr/verify`,
        },
      });

      console.log("[HRLogin] OTP response:", {
        error: error ? error.message : null,
      });

      if (error) {
        console.error("[HRLogin] OTP error:", error);
        toast.error("Failed to send magic link.", {
          id: loadingToast,
          icon: "❌",
        });
        return;
      }

      toast.success("Magic link sent! Check your email.", {
        id: loadingToast,
        icon: "📧",
      });
      setEmail("");
    } catch (error) {
      console.error("[HRLogin] OTP unexpected error:", error);
      toast.error("An unexpected error occurred.", {
        id: loadingToast,
        icon: "❌",
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      "[HRLogin] handleSubmit called, showPasswordField:",
      showPasswordField
    );
    if (showPasswordField) {
      handleLogin(e);
    } else {
      handleMagicLink(e);
    }
  };

  return (
    <div className="min-h-screen flex pt-14 flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-[#f05d23] bg-opacity-50">
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 transform transition-all duration-500 hover:shadow-2xl">
          <div className="mb-8 text-center">
            <Image
              src="/assets/images/logo.svg"
              alt="PAAN Logo"
              width={200}
              height={150}
              className="mx-auto animate-fade-in"
            />
            <p className="mt-6 text-base text-gray-600">
              Welcome to PAAN Member Management Dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-medium text-[#231812] mb-1">
                E-mail
              </label>
              <div className="flex items-center">
                <Icon
                  icon="mdi:email-outline"
                  className="absolute left-3 text-[#231812] h-5 w-5"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-[#f05d23] focus:border-transparent transition-all duration-200 text-[#231812] placeholder-gray-400"
                  placeholder="Enter GCG email"
                  required
                />
              </div>
            </div>

            {showPasswordField && (
              <div className="relative animate-fade-in">
                <label className="block text-sm font-medium text-[#231812] mb-1">
                  Password
                </label>
                <div className="flex items-center relative">
                  <Icon
                    icon="mdi:lock-outline"
                    className="absolute left-3 text-[#231812] h-5 w-5"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-[#f05d23] focus:border-transparent transition-all duration-200 text-[#231812] placeholder-gray-400"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#231812] hover:text-[#f05d23] focus:outline-none transition-colors"
                  >
                    <Icon
                      icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                      className="h-5 w-5"
                    />
                  </button>
                </div>
              </div>
            )}

            {showPasswordField && (
              <>
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm text-[#231812]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="mr-2 h-4 w-4 text-[#f05d23] focus:ring-[#f05d23] border-gray-300 rounded"
                    />
                    Remember me
                  </label>
                </div>

                <div className="flex justify-center">
                  <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                    onChange={(value) => {
                      console.log("[HRLogin] ReCAPTCHA verified:", !!value);
                      setCaptchaVerified(!!value);
                    }}
                    className="transform scale-90 origin-center"
                  />
                </div>
              </>
            )}

            {showPasswordField ? (
              <div className="flex justify-between gap-4">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-[#f05d23] text-white font-semibold rounded-lg shadow-md hover:bg-[#d94f1e] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#f05d23] focus:ring-offset-2 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Icon icon="mdi:login" className="h-5 w-5" />
                  Sign In
                </button>
                <Link
                  href="/"
                  className="flex-1 py-3 px-4 bg-[#231812] text-white font-semibold rounded-lg shadow-md hover:bg-[#4a2e24] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#231812] focus:ring-offset-2 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Icon icon="mdi:arrow-left" className="h-5 w-5" />
                  Return
                </Link>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#f05d23] text-white font-semibold rounded-lg shadow-md hover:bg-[#d94f1e] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#f05d23] focus:ring-offset-2 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Icon icon="mdi:email-fast" className="h-5 w-5" />
                Send me a magic link
              </button>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowPasswordField(!showPasswordField)}
                className="text-base text-[#f05d23] hover:text-[#d94f1e] transition-colors"
              >
                {showPasswordField
                  ? "Sign in using magic link"
                  : "Sign in using password"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            Powered by{" "}
            <a
              href="https://paan.africa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#f05d23] font-medium hover:text-[#d94f1e] transition-colors"
            >
              Pan-African Agency Network (PAAN)
            </a>
          </p>
        </div>
      </div>
      <Footer mode={mode} isSidebarOpen={false} />
      <Toaster />
    </div>
  );
}
