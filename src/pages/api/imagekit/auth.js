// pages/api/imagekit/auth.js
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createHmac } from "crypto";
import { v4 as uuidv4 } from "uuid";

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

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
      console.error("IMAGEKIT_PRIVATE_KEY is not configured");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const token = uuidv4();
    const now = Date.now();
    const expire = Math.floor(now / 1000) + 600; // 10 minutes

    console.log("Generating ImageKit auth:", {
      currentTime: new Date(now).toISOString(),
      expireUnix: expire,
      expireDate: new Date(expire * 1000).toISOString(),
    });

    const signature = createHmac("sha1", privateKey)
      .update(token + expire)
      .digest("hex");

    res.status(200).json({
      signature,
      token,
      expire,
      // Add for MediaLibrary compatibility
      privateKey: privateKey, // Optional: For testing only; remove in production
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    });
  } catch (error) {
    console.error("ImageKit auth error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
