import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * POST /api/summit/promo-codes/validate
 * Validates a promo code and returns discount information
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createSupabaseServerClient(req, res);

    const { code, ticketTypeIds = [] } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Promo code is required" });
    }

    // Fetch promo code
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error) {
      return res.status(200).json({
        valid: false,
        message: "Invalid promo code",
      });
    }

    const now = new Date();
    const validFrom = new Date(data.valid_from);
    const validUntil = data.valid_until ? new Date(data.valid_until) : null;

    // Check validity period
    if (now < validFrom) {
      return res.status(200).json({
        valid: false,
        message: "Promo code is not yet active",
      });
    }

    if (validUntil && now > validUntil) {
      return res.status(200).json({
        valid: false,
        message: "Promo code has expired",
      });
    }

    // Check usage limit
    if (data.usage_limit && data.used_count >= data.usage_limit) {
      return res.status(200).json({
        valid: false,
        message: "Promo code usage limit reached",
      });
    }

    // Check applicable ticket types
    if (
      data.applicable_ticket_types &&
      data.applicable_ticket_types.length > 0 &&
      ticketTypeIds.length > 0
    ) {
      const hasApplicableTicket = ticketTypeIds.some((id) =>
        data.applicable_ticket_types.includes(id)
      );

      if (!hasApplicableTicket) {
        return res.status(200).json({
          valid: false,
          message: "Promo code is not applicable to selected ticket types",
        });
      }
    }

    return res.status(200).json({
      valid: true,
      promoCode: data,
      message: "Promo code is valid",
    });
  } catch (error) {
    console.error("[API] Error in promo code validation endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
