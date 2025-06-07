import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
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

    const { fileIds } = req.body;
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ error: "fileIds array is required" });
    }

    const response = await fetch(
      "https://api.imagekit.io/v1/files/bulkDelete",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.IMAGEKIT_PRIVATE_KEY + ":"
          ).toString("base64")}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ fileIds }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("ImageKit delete error:", data);
      return res.status(response.status).json({
        error: data.message || "Failed to delete files",
        details: data,
      });
    }

    console.log(`Deleted files:`, fileIds);
    res
      .status(200)
      .json({ message: "Files deleted successfully", deletedFileIds: fileIds });
  } catch (error) {
    console.error("Delete files error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
