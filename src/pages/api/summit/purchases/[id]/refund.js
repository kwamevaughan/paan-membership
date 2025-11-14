import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * POST /api/summit/purchases/[id]/refund
 * Processes refund for a purchase with validation
 */
export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "POST") {
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

    // Extract refund reason from request body
    const { reason = "" } = req.body;

    // Fetch purchase details
    const { data: purchase, error: fetchError } = await supabase
      .from("ticket_purchases")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return res.status(404).json({ error: "Purchase not found" });
      }
      console.error("[API] Error fetching purchase:", fetchError);
      return res.status(500).json({ error: "Failed to fetch purchase" });
    }

    // Validate refund eligibility
    if (purchase.status === "refunded") {
      return res.status(400).json({ error: "Purchase has already been refunded" });
    }

    if (purchase.payment_status !== "completed") {
      return res.status(400).json({
        error: "Cannot refund a purchase that hasn't been completed",
      });
    }

    // Check if purchase is older than 30 days
    const purchaseDate = new Date(purchase.created_at);
    const daysSincePurchase = Math.floor(
      (new Date() - purchaseDate) / (1000 * 60 * 60 * 24)
    );

    if (daysSincePurchase > 30) {
      return res.status(400).json({
        error: "Cannot refund purchases older than 30 days",
      });
    }

    // Create refund transaction record
    const { error: transactionError } = await supabase
      .from("payment_transactions")
      .insert({
        purchase_id: id,
        amount: -Math.abs(purchase.final_amount),
        status: "completed",
        payment_method: "refund",
        paystack_reference: `REFUND-${purchase.payment_reference}`,
        gateway_response: {
          type: "refund",
          reason: reason,
          refunded_at: new Date().toISOString(),
          refunded_by: user.id,
        },
      });

    if (transactionError) {
      console.error("[API] Error creating refund transaction:", transactionError);
      return res.status(500).json({ error: "Failed to create refund transaction" });
    }

    // Update purchase status
    const { data: updatedPurchase, error: updateError } = await supabase
      .from("ticket_purchases")
      .update({
        status: "refunded",
        payment_status: "refunded",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("[API] Error updating purchase:", updateError);
      return res.status(500).json({ error: "Failed to update purchase status" });
    }

    // Log the refund (audit trail)
    console.log(
      `[AUDIT] Refund processed for purchase ${id} by user ${user.id}. Amount: ${purchase.final_amount}. Reason: ${reason}`
    );

    // TODO: Send refund notification email to purchaser
    // This would typically integrate with your email service

    return res.status(200).json({
      success: true,
      data: updatedPurchase,
      message: "Refund processed successfully",
    });
  } catch (error) {
    console.error("[API] Error in refund endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
