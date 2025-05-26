import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
    
  // Initialize Supabase client
  const supabaseServer = createSupabaseServerClient(req, res);

  const { jobId } = req.query;

  if (!jobId) {
    return res.status(400).json({ error: "Job ID is required" });
  }

  try {
    const { data, error } = await supabaseServer
      .from("notification_jobs")
      .select("status, total_emails, sent_emails")
      .eq("id", jobId)
      .single();
    if (error || !data) throw new Error("Job not found");

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching email status:", error);
    res.status(404).json({ error: "Job not found" });
  }
}
