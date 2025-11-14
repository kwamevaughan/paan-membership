import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * GET /api/summit/purchases/[id]
 * Fetches complete purchase details with all related data
 */
export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!id) {
    return res.status(400).json({ error: "Purchase ID is required" });
  }

  try {
    const supabase = createSupabaseServerClient(req, res);

    // Verify admin authorization
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

    // Fetch purchase with all related data
    const { data: purchase, error: purchaseError } = await supabase
      .from("ticket_purchases")
      .select(
        `
        *,
        purchaser:purchasers(*),
        items:purchase_items(
          id,
          ticket_type_id,
          ticket_name,
          quantity,
          unit_price,
          total_price,
          ticket_type:ticket_types(name, category, features)
        ),
        attendees:attendees(*),
        transactions:payment_transactions(*)
      `
      )
      .eq("id", id)
      .single();

    if (purchaseError) {
      if (purchaseError.code === "PGRST116") {
        return res.status(404).json({ error: "Purchase not found" });
      }
      console.error("[API] Error fetching purchase:", purchaseError);
      return res.status(500).json({ error: "Failed to fetch purchase" });
    }

    return res.status(200).json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    console.error("[API] Error in purchase detail endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
