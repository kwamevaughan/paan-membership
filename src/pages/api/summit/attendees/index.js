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

    const {
      page = 1,
      limit = 100,
      ticketType,
      organization,
      searchTerm,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from("attendees")
      .select(
        `
        *,
        purchase:ticket_purchases(
          id,
          status,
          payment_status,
          created_at
        ),
        purchaser:purchasers(
          full_name,
          email,
          organization,
          country,
          visa_letter_needed,
          passport_name,
          nationality
        )
      `,
        { count: "exact" }
      );

    if (ticketType) {
      query = query.eq("ticket_type", ticketType);
    }
    if (organization) {
      query = query.ilike("organization", `%${organization}%`);
    }
    if (searchTerm) {
      query = query.or(
        `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
      );
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("[API] Error fetching attendees:", error);
      return res.status(500).json({ error: "Failed to fetch attendees" });
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
    console.error("[API] Error in attendees endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
