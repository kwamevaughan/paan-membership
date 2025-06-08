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

      const cookies = getBrowserCookies();
      console.log("[HRLogin] Browser cookies after login:", cookies);

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
    <div className="relative min-h-screen overflow-hidden">
      {/* Background with Video and Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <iframe
          className="w-full h-full object-cover scale-105"
          src="https://www.youtube.com/embed/InDtkDgVb1Q?autoplay=1&loop=1&playlist=InDtkDgVb1Q&controls=0&mute=1&showinfo=0&rel=0&modestbranding=1&fs=0"
          frameBorder="0"
          allow="autoplay; fullscreen"
          title="Background Video"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-blue-500/10 animate-pulse"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-orange-500/20 to-transparent rounded-full blur-xl animate-pulse"></div>
      <div
        className="absolute bottom-32 right-16 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-transparent rounded-full blur-xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 py-20">
        <div className="w-full max-w-xl">
          {/* Glassmorphism Card */}
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* Logo with Animation */}
            <div className="text-center mb-8">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://paan.africa"
                className="inline-block group"
              >
                <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-lg p-3 shadow-2xl">
                  <Image
                    src="/assets/images/logo.svg"
                    alt="PAAN Logo"
                    width={180}
                    height={180}
                    className="mx-auto transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-blue-500/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                </div>
              </a>
            </div>

            {/* Enhanced Typography */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-blue-200 to-sky-600 bg-clip-text text-transparent">
                  PAAN
                </span>{" "}
                Dashboard
              </h1>
              <p className="text-lg text-gray-200 mb-6 max-w-md mx-auto leading-relaxed">
                Access the Pan-African Agency Network Member Management
                Dashboard
              </p>
              <div className="relative mb-6">
                <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-white mb-1">
                  E-mail
                </label>
                <div className="flex items-center">
                  <Icon
                    icon="mdi:email-outline"
                    className="absolute left-3 text-white h-5 w-5"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-300 hover:bg-white/20"
                    placeholder="Enter GCG email"
                    required
                  />
                </div>
              </div>

              {showPasswordField && (
                <div className="relative animate-fade-in">
                  <label className="block text-sm font-medium text-white mb-1">
                    Password
                  </label>
                  <div className="flex items-center relative">
                    <Icon
                      icon="mdi:lock-outline"
                      className="absolute left-3 text-white h-5 w-5"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-300 hover:bg-white/20"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-white hover:text-blue-400 focus:outline-none transition-colors"
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
                    <label className="flex items-center text-sm text-white">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-400 focus:ring-blue-400 border-white/30 rounded bg-white/10"
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
                      theme="dark"
                    />
                  </div>
                </>
              )}

              {showPasswordField ? (
                <div className="flex justify-between gap-4">
                  <button
                    type="submit"
                    className="group relative flex-1 py-3 px-4 bg-gradient-to-r from-blue-400 to-sky-600 text-white font-semibold rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden flex items-center justify-center gap-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    <span className="relative z-10">Sign In</span>
                    <Icon
                      icon="mdi:login"
                      className="relative z-10 h-5 w-5 group-hover:rotate-45 transition-transform duration-300"
                    />
                  </button>
                  <Link
                    href="/"
                    className="group relative flex-1 py-3 px-4 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden flex items-center justify-center gap-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    <span className="relative z-10">Return</span>
                    <Icon
                      icon="mdi:arrow-left"
                      className="relative z-10 h-5 w-5 group-hover:rotate-45 transition-transform duration-300"
                    />
                  </Link>
                </div>
              ) : (
                <button
                  type="submit"
                  className="group relative w-full py-3 px-4 bg-gradient-to-r from-blue-400 to-sky-600 text-white font-semibold rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden flex items-center justify-center gap-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  <span className="relative z-10">Send Magic Link</span>
                  <Icon
                    icon="mdi:email-fast"
                    className="relative z-10 h-5 w-5 group-hover:rotate-45 transition-transform duration-300"
                  />
                </button>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowPasswordField(!showPasswordField)}
                  className="text-base text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showPasswordField
                    ? "Sign in using magic link"
                    : "Sign in using password"}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-xs text-gray-300">
              Powered by{" "}
              <a
                href="https://paan.africa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 font-medium hover:text-blue-300 transition-colors"
              >
                Pan-African Agency Network (PAAN)
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Social Media Footer */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl">
          {[
            {
              href: "https://x.com/paan_network",
              icon: "fa6-brands:square-x-twitter",
              color: "hover:text-blue-400",
              label: "Follow us on X",
            },
            {
              href: "https://www.youtube.com/@PAAN-AFRICA",
              icon: "mdi:youtube",
              color: "hover:text-red-500",
              label: "Subscribe on YouTube",
            },
            {
              href: "https://www.linkedin.com/company/pan-african-agency-network/",
              icon: "mdi:linkedin",
              color: "hover:text-blue-600",
              label: "Connect on LinkedIn",
            },
            {
              href: "https://www.facebook.com/panafricanagencynetwork",
              icon: "mdi:facebook",
              color: "hover:text-blue-500",
              label: "Follow on Facebook",
            },
          ].map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative p-2 text-white ${social.color} transition-all duration-300 hover:scale-110 hover:-translate-y-1 rounded-lg hover:bg-white/10`}
              aria-label={social.label}
            >
              <Icon icon={social.icon} className="w-6 h-6" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                {social.label}
              </div>
            </a>
          ))}
        </div>
      </div>

      <Toaster />
    </div>
  );
}
