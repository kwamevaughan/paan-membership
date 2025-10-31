import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import Image from "next/image";

export default function Verify() {
  const router = useRouter();
  const { token, email, type } = router.query;

  useEffect(() => {
    const verifyOtp = async () => {
      if (!token || !email || type !== "magiclink") return;

      // Verify OTP with Supabase Auth
      const {
        data: { session },
        error,
      } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "magiclink",
      });

      if (error) {
        console.error("Verification error:", error);
        toast.error("Invalid or expired link.", { icon: "❌" });
        setTimeout(() => router.push("/hr/login"), 2000);
        return;
      }

      // Check if user exists in hr_users and has admin role
      const { data: hrUser, error: hrError } = await supabase
        .from("hr_users")
        .select("id, role")
        .eq("id", session.user.id)
        .single();

      if (hrError || !hrUser) {
        console.error("User not found in hr_users:", hrError);
        toast.error("Access denied. You don't have admin privileges.", { 
          icon: "🚫",
          duration: 5000 
        });
        setTimeout(() => router.push("/hr/login"), 2000);
        return;
      }

      // Check if user has admin role
      if (hrUser.role !== 'admin') {
        console.error("User does not have admin role");
        toast.error("Access denied. Admin privileges required.", { 
          icon: "🚫",
          duration: 5000 
        });
        setTimeout(() => router.push("/hr/login"), 2000);
        return;
      }

      toast.success("Login successful! Redirecting...", { icon: "✅" });
      setTimeout(() => router.push("/hr/overview"), 1000);
    };

    verifyOtp();
  }, [token, email, type, router]);

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
        <h2 className="text-xl font-semibold text-[#231812]">
          Verifying your login to GCG Career Management Dashboard...
        </h2>
      </div>
    </div>
  );
}
