import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Initialize Supabase client
  const supabaseServer = createSupabaseServerClient(req, res);

  // Fetch email group details
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Group ID is required" });
  }

  try {
    const { data, error } = await supabaseServer
      .from("email_groups")
      .select("id, name, emails")
      .eq("id", id)
      .single();
    if (error) throw error;
    if (!data) throw new Error("Group not found");

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching email group details:", error);
    res
      .status(404)
      .json({ error: error.message || "Failed to fetch group details" });
  }
}