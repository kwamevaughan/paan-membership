// pages/api/imagekit/auth-media.js
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    // ImageKit expects POST for MediaLibrary auth
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

    // Fetch authentication parameters from ImageKit (or generate server-side)
    const response = await fetch("https://api.imagekit.io/v1/auth", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          process.env.IMAGEKIT_PRIVATE_KEY + ":"
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        purpose: "media_library",
        path: "/Blog",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("ImageKit auth-media error:", data);
      return res.status(response.status).json(data);
    }

    console.log("ImageKit auth-media success:", data);
    res.status(200).json(data);
  } catch (error) {
    console.error("ImageKit auth-media error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
