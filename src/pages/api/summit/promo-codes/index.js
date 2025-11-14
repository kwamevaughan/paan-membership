import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * GET /api/summit/promo-codes - Fetch all promo codes
 * POST /api/summit/promo-codes - Create new promo code
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

async function handleGet(supabase, req, res) {
  try {
    const { activeOnly } = req.query;

    let query = supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (activeOnly === "true") {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[API] Error fetching promo codes:", error);
      return res.status(500).json({ error: "Failed to fetch promo codes" });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("[API] Error in promo codes GET endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handlePost(supabase, req, res, user) {
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

    // Check if code already exists
    const { data: existingCode } = await supabase
      .from("promo_codes")
      .select("id")
      .eq("code", code.toUpperCase())
      .single();

    if (existingCode) {
      return res.status(400).json({ error: "Promo code already exists" });
    }

    // Insert new promo code
    const { data, error } = await supabase
      .from("promo_codes")
      .insert({
        code: code.toUpperCase(),
        description: description?.trim() || "",
        discount_type,
        discount_value: parseFloat(discount_value),
        valid_from: valid_from || new Date().toISOString(),
        valid_until: valid_until || null,
        usage_limit: usage_limit ? parseInt(usage_limit) : null,
        used_count: 0,
        applicable_ticket_types: applicable_ticket_types || [],
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) {
      console.error("[API] Error creating promo code:", error);
      return res.status(500).json({ error: "Failed to create promo code" });
    }

    console.log(`[AUDIT] Promo code created: ${data.code} by user ${user.id}`);

    return res.status(201).json({
      success: true,
      data,
      message: "Promo code created successfully",
    });
  } catch (error) {
    console.error("[API] Error in promo codes POST endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
