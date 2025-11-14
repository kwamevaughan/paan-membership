import { createSupabaseServerClient } from "@/lib/supabaseServer";

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

    const { data: promoCodes, error: promoError } = await supabase
      .from("promo_codes")
      .select("*");

    if (promoError) throw promoError;

    let purchaseQuery = supabase
      .from("ticket_purchases")
      .select("promo_code, discount_amount, final_amount, payment_status")
      .not("promo_code", "is", null)
      .eq("payment_status", "completed");

    if (dateFrom) {
      purchaseQuery = purchaseQuery.gte("created_at", dateFrom);
    }
    if (dateTo) {
      purchaseQuery = purchaseQuery.lte("created_at", dateTo);
    }

    const { data: purchases, error: purchaseError } = await purchaseQuery;

    if (purchaseError) throw purchaseError;

    const promoStats = promoCodes.map((promo) => {
      const promoUses = purchases.filter((p) => p.promo_code === promo.code);
      const totalDiscount = promoUses.reduce(
        (sum, p) => sum + parseFloat(p.discount_amount || 0),
        0
      );
      const totalRevenue = promoUses.reduce(
        (sum, p) => sum + parseFloat(p.final_amount),
        0
      );

      return {
        code: promo.code,
        description: promo.description,
        discountType: promo.discount_type,
        discountValue: promo.discount_value,
        usageCount: promoUses.length,
        totalDiscount,
        totalRevenue,
        redemptionRate:
          promo.usage_limit > 0 ? (promoUses.length / promo.usage_limit) * 100 : 0,
      };
    });

    return res.status(200).json({
      success: true,
      data: promoStats.sort((a, b) => b.usageCount - a.usageCount),
    });
  } catch (error) {
    console.error("[API] Error in promo code analytics endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
