import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * PATCH /api/summit/promo-codes/[id] - Update promo code
 * DELETE /api/summit/promo-codes/[id] - Delete promo code
 */
export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Promo code ID is required" });
  }

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

  if (req.method === "PATCH") {
    return handlePatch(supabase, req, res, id, user);
  } else if (req.method === "DELETE") {
    return handleDelete(supabase, req, res, id, user);
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handlePatch(supabase, req, res, id, user) {
  try {
    const {
      code,
      description,
      discount_type,
      discount_value,
      valid_from,
      valid_until,
      usage_limit,
      applicable_ticket_types,
      is_active,
    } = req.body;

    // Validate required fields
    if (!code || !discount_type || !discount_value) {
      return res.status(400).json({
        error: "Code, discount type, and discount value are required",
      });
    }

    // Validate discount value
    if (parseFloat(discount_value) <= 0) {
      return res.status(400).json({ error: "Discount value must be greater than 0" });
    }

    if (discount_type === "percentage" && parseFloat(discount_value) > 100) {
      return res.status(400).json({ error: "Percentage discount cannot exceed 100%" });
    }

    // Update promo code
    const { data, error } = await supabase
      .from("promo_codes")
      .update({
        code: code.toUpperCase(),
        description: description?.trim() || "",
        discount_type,
        discount_value: parseFloat(discount_value),
        valid_from,
        valid_until: valid_until || null,
        usage_limit: usage_limit ? parseInt(usage_limit) : null,
        applicable_ticket_types: applicable_ticket_types || [],
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Promo code not found" });
      }
      console.error("[API] Error updating promo code:", error);
      return res.status(500).json({ error: "Failed to update promo code" });
    }

    console.log(`[AUDIT] Promo code updated: ${data.code} by user ${user.id}`);

    return res.status(200).json({
      success: true,
      data,
      message: "Promo code updated successfully",
    });
  } catch (error) {
    console.error("[API] Error in promo code PATCH endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleDelete(supabase, req, res, id, user) {
  try {
    const { error } = await supabase.from("promo_codes").delete().eq("id", id);

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Promo code not found" });
      }
      console.error("[API] Error deleting promo code:", error);
      return res.status(500).json({ error: "Failed to delete promo code" });
    }

    console.log(`[AUDIT] Promo code deleted: ${id} by user ${user.id}`);

    return res.status(200).json({
      success: true,
      message: "Promo code deleted successfully",
    });
  } catch (error) {
    console.error("[API] Error in promo code DELETE endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
