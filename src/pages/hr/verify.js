// src/pages/hr/verify.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

export default function Verify() {
    const router = useRouter();
    const { token, email } = router.query;

    useEffect(() => {
        const verifyToken = async () => {
            if (!token || !email) return;

            const { data: tokenData, error: fetchError } = await supabase
                .from("magic_tokens")
                .select("username, expires_at")
                .eq("token", token)
                .eq("username", email)
                .single();

            if (fetchError || !tokenData) {
                toast.error("Invalid or expired link.", { icon: "❌" });
                setTimeout(() => router.push("/hr/login"), 2000);
                return;
            }

            const expiresAt = new Date(tokenData.expires_at);
            if (new Date() > expiresAt) {
                toast.error("Link has expired.", { icon: "❌" });
                setTimeout(() => router.push("/hr/login"), 2000);
                return;
            }

            await supabase.from("magic_tokens").delete().eq("token", token);

            localStorage.setItem("hr_session", "authenticated");
            toast.success("Login successful! Redirecting...", { icon: "✅" });
            setTimeout(() => router.push("/hr/overview"), 1000);
        };

        verifyToken();
    }, [token, email, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-[#f05d23] bg-opacity-50">

            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <Image
                    src="/assets/images/logo-tagline-orange.svg"
                    alt="Growthpad Consulting Group Logo"
                    width={350}
                    height={150}
                    className="mx-auto animate-fade-in mb-6"
                />
                <h2 className="text-xl font-semibold text-[#231812]">Verifying your login to GCG Career Management Dashboard...</h2>
            </div>
        </div>
    );
}