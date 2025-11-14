import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * PATCH /api/summit/purchases/[id]/status
 * Updates purchase status with validation
 */
export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "PATCH") {
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

    // Extract new status from request body
    const { status: newStatus } = req.body;

    if (!newStatus) {
      return res.status(400).json({ error: "Status is required" });
    }

    // Validate status value
    const validStatuses = ["pending", "paid", "cancelled", "refunded"];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Fetch current purchase
    const { data: currentPurchase, error: fetchError } = await supabase
      .from("ticket_purchases")
      .select("id, status, payment_status")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return res.status(404).json({ error: "Purchase not found" });
      }
      console.error("[API] Error fetching purchase:", fetchError);
      return res.status(500).json({ error: "Failed to fetch purchase" });
    }

    // Validate status transition
    if (currentPurchase.status === "refunded" && newStatus !== "refunded") {
      return res.status(400).json({
        error: "Cannot change status of a refunded purchase",
      });
    }

    // Update purchase status
    const { data, error: updateError } = await supabase
      .from("ticket_purchases")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("[API] Error updating purchase status:", updateError);
      return res.status(500).json({ error: "Failed to update purchase status" });
    }

    // Log the status change (optional - you can create an audit log table)
    console.log(
      `[AUDIT] Purchase ${id} status changed from ${currentPurchase.status} to ${newStatus} by user ${user.id}`
    );

    return res.status(200).json({
      success: true,
      data,
      message: "Purchase status updated successfully",
    });
  } catch (error) {
    console.error("[API] Error in purchase status update endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
