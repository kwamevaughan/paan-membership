// pages/api/notify-google.js
import { notifyGoogle } from "../../lib/indexing";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    console.log("Attempting to notify Google for URL:", url);
    await notifyGoogle(url);
    console.log("Successfully notified Google for URL:", url);
    res.status(200).json({ message: "Google notified successfully" });
  } catch (error) {
    console.error("Error in /api/notify-google:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      details: error.details,
    });
    res
      .status(500)
      .json({ error: "Failed to notify Google", details: error.message });
  }
}
