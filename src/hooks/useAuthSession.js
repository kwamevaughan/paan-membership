// hooks/useAuthSession.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { getSessionCached } from "@/lib/sessionCache";

export default function useAuthSession() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSessionCached();
      const sessionError = null;

      if (sessionError || !session) {
        router.push("/hr/login");
        return;
      }

      const { data: hrUser, error: hrUserError } = await supabase
        .from("hr_users")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (hrUserError || !hrUser) {
        await supabase.auth.signOut();
        router.push("/hr/login");
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          router.push("/hr/login");
        }
      }
    );

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, [router]);
}
