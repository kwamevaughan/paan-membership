import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * PATCH /api/summit/ticket-types/[id] - Update ticket type
 * DELETE /api/summit/ticket-types/[id] - Deactivate ticket type
 */
export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Ticket type ID is required" });
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

/**
 * PATCH handler - Update ticket type
 */
async function handlePatch(supabase, req, res, id, user) {
  try {
    const {
      name,
      description,
      price,
      original_price,
      currency,
      category,
      features,
      is_active,
    } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        error: "Name, price, and category are required fields",
      });
    }

    // Validate price
    if (parseFloat(price) <= 0) {
      return res.status(400).json({ error: "Price must be greater than 0" });
    }

    // Validate original_price if provided
    if (original_price && parseFloat(original_price) < parseFloat(price)) {
      return res.status(400).json({
        error: "Original price must be greater than or equal to current price",
      });
    }

    // Update ticket type
    const { data, error } = await supabase
      .from("ticket_types")
      .update({
        name: name.trim(),
        description: description?.trim() || "",
        price: parseFloat(price),
        original_price: original_price ? parseFloat(original_price) : null,
        currency: currency || "USD",
        category: category.trim(),
        features: features || [],
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Ticket type not found" });
      }
      console.error("[API] Error updating ticket type:", error);
      return res.status(500).json({ error: "Failed to update ticket type" });
    }

    console.log(`[AUDIT] Ticket type updated: ${id} by user ${user.id}`);

    return res.status(200).json({
      success: true,
      data,
      message: "Ticket type updated successfully",
    });
  } catch (error) {
    console.error("[API] Error in ticket type PATCH endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * DELETE handler - Soft delete (deactivate) ticket type
 */
async function handleDelete(supabase, req, res, id, user) {
  try {
    // Check if there are active purchases with this ticket type
    const { data: activePurchases, error: checkError } = await supabase
      .from("purchase_items")
      .select("id, purchase:ticket_purchases!inner(status)")
      .eq("ticket_type_id", id)
      .in("purchase.status", ["pending", "paid"]);

    if (checkError) {
      console.error("[API] Error checking active purchases:", checkError);
      return res.status(500).json({ error: "Failed to check active purchases" });
    }

    if (activePurchases && activePurchases.length > 0) {
      return res.status(400).json({
        error:
          "Cannot delete ticket type with active purchases. Set it to inactive instead.",
        activePurchases: activePurchases.length,
      });
    }

    // Soft delete by setting inactive
    const { data, error } = await supabase
      .from("ticket_types")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Ticket type not found" });
      }
      console.error("[API] Error deactivating ticket type:", error);
      return res.status(500).json({ error: "Failed to deactivate ticket type" });
    }

    console.log(`[AUDIT] Ticket type deactivated: ${id} by user ${user.id}`);

    return res.status(200).json({
      success: true,
      data,
      message: "Ticket type deactivated successfully",
    });
  } catch (error) {
    console.error("[API] Error in ticket type DELETE endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
