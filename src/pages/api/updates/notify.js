import { notifyMembers } from "../../../../utils/notificationUtils";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { title, description, tier_restriction, cta_text, cta_url, category, tags } = req.body;

    // Check for required fields
    if (!title || !description || !tier_restriction) {
      console.error("Missing required fields:", { title, description, tier_restriction });
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await notifyMembers({
      title,
      description,
      tier_restriction,
      cta_text,
      cta_url,
      category,
      tags,
      req,
      res,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in notification handler:", error);
    return res.status(500).json({ error: error.message });
  }
} 