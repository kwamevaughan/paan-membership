import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Initialize Supabase client
  const supabaseServer = createSupabaseServerClient(req, res);

  try {
    const { data, error } = await supabaseServer
      .from("email_groups")
      .select("id, name"); // Back to id, name only
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching email groups:", error);
    res.status(500).json({ error: "Failed to fetch email groups" });
  }
}
