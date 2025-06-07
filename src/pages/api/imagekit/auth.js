// api/imagekit/auth.js
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createHmac } from "crypto";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Initialize Supabase with request and response objects
    const supabaseServer = createSupabaseServerClient(req, res);

    // Check Supabase user session
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

    // Get the private key
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
      console.error("IMAGEKIT_PRIVATE_KEY is not configured");
      throw new Error("IMAGEKIT_PRIVATE_KEY is not configured");
    }

    // Generate a unique token
    const token = uuidv4();

    // Get the current time and calculate expire (10 minutes from now)
    const now = Date.now();
    const expire = Math.floor(now / 1000) + 600; // 600 seconds = 10 minutes

    // Log the current time and expire for debugging
    console.log("Generating ImageKit auth:", {
      currentTime: new Date(now).toISOString(),
      expireUnix: expire,
      expireDate: new Date(expire * 1000).toISOString(),
    });

    // Create the signature
    const signature = createHmac("sha1", privateKey)
      .update(token + expire)
      .digest("hex");

    // Log the response for debugging
    console.log("ImageKit auth response:", { signature, token, expire });

    // Return the authentication parameters
    res.status(200).json({
      signature,
      token,
      expire,
    });
  } catch (error) {
    console.error("ImageKit auth error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
