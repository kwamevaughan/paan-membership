import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
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

      // Check if user exists in hr_users
      const { data: hrUser, error: hrError } = await supabase
        .from("hr_users")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (hrError || !hrUser) {
        // Add user to hr_users
        const { error: insertError } = await supabase
          .from("hr_users")
          .insert([{ id: session.user.id, username: email }]);

        if (insertError) {
          console.error("Error adding to hr_users:", insertError);
          toast.error("Failed to authorize user.", { icon: "❌" });
          setTimeout(() => router.push("/hr/login"), 2000);
          return;
        }
      }

      toast.success("Login successful! Redirecting...", { icon: "✅" });
      setTimeout(() => router.push("/hr/overview"), 1000);
    };

    verifyOtp();
  }, [token, email, type, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-[#f05d23] bg-opacity-50">
      <Toaster />
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
