import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { fetchHRData } from "utils/hrData";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Candidate ID is required" });
  }

  try {
    const supabaseServer = createSupabaseServerClient(req, res);

    // Check authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabaseServer.auth.getSession();

    if (sessionError || !session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Use existing fetchHRData function to get all candidates with full data
    const data = await fetchHRData({
      supabaseClient: supabaseServer,
      fetchCandidates: true,
      fetchQuestions: true,
    });

    // Find the specific candidate
    const candidate = data.initialCandidates?.find((c) => c.id === id);

    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    return res.status(200).json({ candidate });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}