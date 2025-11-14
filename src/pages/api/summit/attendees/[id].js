import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!id) {
    return res.status(400).json({ error: "Attendee ID is required" });
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

    const { full_name, email, role, organization } = req.body;

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
    }

    const { data, error } = await supabase
      .from("attendees")
      .update({
        full_name,
        email,
        role,
        organization,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Attendee not found" });
      }
      console.error("[API] Error updating attendee:", error);
      return res.status(500).json({ error: "Failed to update attendee" });
    }

    console.log(`[AUDIT] Attendee updated: ${id} by user ${user.id}`);

    return res.status(200).json({
      success: true,
      data,
      message: "Attendee updated successfully",
    });
  } catch (error) {
    console.error("[API] Error in attendee update endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
