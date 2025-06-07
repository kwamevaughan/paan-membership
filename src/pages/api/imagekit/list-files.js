// pages/api/imagekit/list-files.js
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Authenticate user via Supabase
    const supabaseServer = createSupabaseServerClient(req, res);
    const {
      data: { user },
      error: userError,
    } = await supabaseServer.auth.getUser();
    if (userError || !user) {
      console.error(
        "Supabase auth error:",
        userError?.message || "No user found"
      );
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { path } = req.query;
    if (!path) {
      return res.status(400).json({ error: "Path is required" });
    }

    const response = await fetch(
      `https://api.imagekit.io/v1/files?path=${encodeURIComponent(path)}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.IMAGEKIT_PRIVATE_KEY + ":"
          ).toString("base64")}`,
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("ImageKit API error:", data);
      return res.status(response.status).json({
        error: data.message || "Failed to fetch files",
        details: data,
      });
    }

    // console.log(`Fetched files for path ${path}:`, data);
    res.status(200).json(data);
  } catch (error) {
    console.error("List files error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
