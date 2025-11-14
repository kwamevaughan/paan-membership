import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * GET /api/summit/ticket-types - Fetch all ticket types
 * POST /api/summit/ticket-types - Create new ticket type
 */
export default async function handler(req, res) {
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

  if (req.method === "GET") {
    return handleGet(supabase, req, res);
  } else if (req.method === "POST") {
    return handlePost(supabase, req, res, user);
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

/**
 * GET handler - Fetch all ticket types
 */
async function handleGet(supabase, req, res) {
  try {
    const { activeOnly } = req.query;

    let query = supabase
      .from("ticket_types")
      .select("*")
      .order("category")
      .order("price");

    if (activeOnly === "true") {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[API] Error fetching ticket types:", error);
      return res.status(500).json({ error: "Failed to fetch ticket types" });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("[API] Error in ticket types GET endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST handler - Create new ticket type
 */
async function handlePost(supabase, req, res, user) {
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

    // Insert new ticket type
    const { data, error } = await supabase
      .from("ticket_types")
      .insert({
        name: name.trim(),
        description: description?.trim() || "",
        price: parseFloat(price),
        original_price: original_price ? parseFloat(original_price) : null,
        currency: currency || "USD",
        category: category.trim(),
        features: features || [],
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) {
      console.error("[API] Error creating ticket type:", error);
      return res.status(500).json({ error: "Failed to create ticket type" });
    }

    console.log(`[AUDIT] Ticket type created: ${data.id} by user ${user.id}`);

    return res.status(201).json({
      success: true,
      data,
      message: "Ticket type created successfully",
    });
  } catch (error) {
    console.error("[API] Error in ticket types POST endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
