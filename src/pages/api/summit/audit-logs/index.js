import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * GET /api/summit/audit-logs
 * Fetch audit logs with filtering and pagination
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createSupabaseServerClient(req, res);

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify admin role
    const { data: hrUser, error: hrError } = await supabase
      .from("hr_users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (hrError || !hrUser || hrUser.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Parse query parameters
    const {
      page = 1,
      limit = 50,
      action,
      entity_type,
      user_id,
      start_date,
      end_date,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = supabase
      .from("audit_logs")
      .select(
        `
        *,
        user:hr_users(id, name, email)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    // Apply filters
    if (action) {
      query = query.eq("action", action);
    }

    if (entity_type) {
      query = query.eq("entity_type", entity_type);
    }

    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    if (start_date) {
      query = query.gte("created_at", start_date);
    }

    if (end_date) {
      query = query.lte("created_at", end_date);
    }

    const { data: logs, error, count } = await query;

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch audit logs",
    });
  }
}
