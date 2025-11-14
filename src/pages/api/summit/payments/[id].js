import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!id) {
    return res.status(400).json({ error: "Payment transaction ID is required" });
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

    const { data, error } = await supabase
      .from("payment_transactions")
      .select(
        `
        *,
        purchase:ticket_purchases(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Payment transaction not found" });
      }
      console.error("[API] Error fetching payment transaction:", error);
      return res.status(500).json({ error: "Failed to fetch transaction" });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[API] Error in payment detail endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
