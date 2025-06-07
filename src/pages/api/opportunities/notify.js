import { notifyMembers } from "../../../../utils/notificationUtils";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { 
      title, 
      description, 
      tier_restriction, 
      job_type,
      project_type,
      skills_required,
      location,
      deadline,
      budget,
      category,
      tags 
    } = req.body;

    // Check for required fields
    if (!title || !description || !tier_restriction) {
      console.error("Missing required fields:", { title, description, tier_restriction });
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Format opportunity details for email
    const opportunityDetails = {
      job_type,
      project_type,
      skills_required: Array.isArray(skills_required) ? skills_required.join(', ') : skills_required,
      location,
      deadline: deadline ? new Date(deadline).toLocaleDateString() : null,
      budget,
      category,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : [])
    };

    const result = await notifyMembers({
      title,
      description,
      tier_restriction,
      category,
      tags,
      opportunityDetails,
      req,
      res,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in notification handler:", error);
    return res.status(500).json({ error: error.message });
  }
} 