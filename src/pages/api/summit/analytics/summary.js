import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { fetchSummaryStatistics } from "@/utils/summitDbUtils";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createSupabaseServerClient(req, res);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data: hrUser, error: hrError } = await supabase
      .from("hr_users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (hrError || !hrUser) {
      return res.status(403).json({ error: "Forbidden - Admin access required" });
    }

    const { dateFrom, dateTo } = req.query;

    const data = await fetchSummaryStatistics(supabase, { dateFrom, dateTo });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[API] Error in summary analytics endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
