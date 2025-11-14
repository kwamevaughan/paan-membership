import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * GET /api/summit/promo-codes/[id]/usage
 * Fetches usage statistics for a promo code
 */
export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!id) {
    return res.status(400).json({ error: "Promo code ID is required" });
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

    // Fetch promo code details
    const { data: promoCode, error: promoError } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("id", id)
      .single();

    if (promoError) {
      if (promoError.code === "PGRST116") {
        return res.status(404).json({ error: "Promo code not found" });
      }
      console.error("[API] Error fetching promo code:", promoError);
      return res.status(500).json({ error: "Failed to fetch promo code" });
    }

    // Fetch all purchases using this promo code
    const { data: purchases, error: purchasesError } = await supabase
      .from("ticket_purchases")
      .select(
        `
        id,
        final_amount,
        discount_amount,
        created_at,
        purchaser:purchasers(full_name, email)
      `
      )
      .eq("promo_code", promoCode.code)
      .order("created_at", { ascending: false });

    if (purchasesError) {
      console.error("[API] Error fetching purchases:", purchasesError);
      return res.status(500).json({ error: "Failed to fetch purchases" });
    }

    const totalDiscount = purchases.reduce(
      (sum, p) => sum + parseFloat(p.discount_amount || 0),
      0
    );

    return res.status(200).json({
      success: true,
      data: {
        promoCode,
        usageCount: purchases.length,
        totalDiscount,
        purchases,
      },
    });
  } catch (error) {
    console.error("[API] Error in promo code usage endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
