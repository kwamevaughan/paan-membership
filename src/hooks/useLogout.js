import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";

export default function useLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/hr/login");
  };

  return handleLogout;
}
