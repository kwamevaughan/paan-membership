import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Icon } from "@iconify/react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import Footer from "@/layouts/footer";

export default function HRLogin() {
    const [email, setEmail] = useState("");
    const [showPasswordField, setShowPasswordField] = useState(false);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [mode] = useState("light");
    const router = useRouter();

    useEffect(() => {
        const savedEmail = localStorage.getItem("hr_remembered_email");
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!captchaVerified) {
            toast.error("Please verify the CAPTCHA.", { icon: "⚠️" });
            return;
        }
    
        const { data: user, error: fetchError } = await supabase
            .from("hr_users")
            .select("username, password")
            .eq("username", email)
            .single();
    
        if (fetchError || !user) {
            console.error("Fetch error:", fetchError);
            toast.error("Invalid email or password.", { icon: "❌" });
            return;
        }
    
        const passwordMatch = await bcrypt.compare(password, user.password);
    
        if (!passwordMatch) {
            console.error('Password mismatch');
            toast.error("Invalid email or password.", { icon: "❌" });
            return;
        }
    
        console.log('Password matched');
        localStorage.setItem("hr_session", "authenticated");
        document.cookie = "hr_session=authenticated; path=/; max-age=2592000";
    
        if (rememberMe) {
            localStorage.setItem("hr_remembered_email", email);
            localStorage.setItem("hr_session_expiry", Date.now() + 30 * 24 * 60 * 60 * 1000);
        } else {
            localStorage.removeItem("hr_remembered_email");
            localStorage.removeItem("hr_session_expiry");
        }
    
        toast.success("Login successful! Redirecting...", { icon: "✅" });
        console.log("Redirecting to /hr/overview");
        await router.push("/hr/overview"); // Remove setTimeout for immediate redirect
    };

    const handleMagicLink = async (e) => {
        e.preventDefault();

        const loadingToast = toast.loading("Please wait...");
        const startTime = Date.now();

        console.log("Starting Magic Link process...");

        const userStart = Date.now();
        const { data: user, error: fetchError } = await supabase
            .from("hr_users")
            .select("username")
            .eq("username", email)
            .single();
        console.log(`User check took: ${Date.now() - userStart}ms`);

        if (fetchError || !user) {
            toast.error("Email not found.", { id: loadingToast, icon: "❌" });
            console.log(`Total time (failed at user check): ${Date.now() - startTime}ms`);
            return;
        }

        const tokenStart = Date.now();
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const { error: insertError } = await supabase
            .from("magic_tokens")
            .insert({
                username: email,
                token: token,
                expires_at: expiresAt.toISOString(),
            });
        console.log(`Token insertion took: ${Date.now() - tokenStart}ms`);

        if (insertError) {
            console.error("Token insert error:", insertError);
            toast.error("Failed to generate recovery link. Please try again.", { id: loadingToast, icon: "❌" });
            console.log(`Total time (failed at token insert): ${Date.now() - startTime}ms`);
            return;
        }

        const magicLink = `${window.location.origin}/hr/verify?token=${token}&email=${encodeURIComponent(email)}`;

        const emailStart = Date.now();
        try {
            const response = await fetch("/api/send-magic-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, magicLink }),
            });

            console.log(`Email API call took: ${Date.now() - emailStart}ms`);

            if (!response.ok) {
                throw new Error(await response.text());
            }

            toast.success("Recovery link sent! Check your email.", { id: loadingToast, icon: "📧" });
            setEmail("");
        } catch (error) {
            console.error("Error sending magic link:", error);
            toast.error("Failed to send recovery link. Please try again.", { id: loadingToast, icon: "❌" });
        }
        console.log(`Total time: ${Date.now() - startTime}ms`);
    };

    const handleSubmit = (e) => {
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
                        <p className="mt-6 text-base text-gray-600">Welcome to PAAN Member Management Dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <label className="block text-sm font-medium text-[#231812] mb-1">E-mail</label>
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
                                <label className="block text-sm font-medium text-[#231812] mb-1">Password</label>
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
                                        onChange={() => setCaptchaVerified(true)}
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
                                <a
                                    href="/"
                                    className="flex-1 py-3 px-4 bg-[#231812] text-white font-semibold rounded-lg shadow-md hover:bg-[#4a2e24] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#231812] focus:ring-offset-2 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <Icon icon="mdi:arrow-left" className="h-5 w-5" />
                                    Return
                                </a>
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
                                {showPasswordField ? "Sign in using magic link" : "Sign in using password"}
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
        </div>
    );
}