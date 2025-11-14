import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * GET /api/summit/purchases
 * Fetches all ticket purchases with pagination and filters
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
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

    // Extract query parameters
    const {
      page = 1,
      limit = 50,
      status,
      paymentStatus,
      dateFrom,
      dateTo,
      ticketType,
      searchTerm,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = supabase
      .from("ticket_purchases")
      .select(
        `
        id,
        total_amount,
        currency,
        status,
        payment_method,
        payment_status,
        payment_reference,
        promo_code,
        discount_amount,
        final_amount,
        created_at,
        updated_at,
        paid_at,
        purchaser:purchasers(
          id,
          full_name,
          email,
          phone,
          organization,
          country
        )
      `,
        { count: "exact" }
      );

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (paymentStatus) {
      query = query.eq("payment_status", paymentStatus);
    }
    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo);
    }
    if (searchTerm) {
      // Note: Supabase doesn't support OR across joined tables easily
      // This is a simplified version - you may need to adjust based on your needs
      query = query.or(
        `payment_reference.ilike.%${searchTerm}%`
      );
    }

    // Apply pagination and sorting
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("[API] Error fetching purchases:", error);
      return res.status(500).json({ error: "Failed to fetch purchases" });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("[API] Error in purchases endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
