import { sendStatusEmail } from "../../../utils/emailUtils";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    primaryContactName,
    primaryContactEmail,
    opening,
    status,
    subject,
    body,
  } = req.body;

  // Validate primaryContactEmail
  if (!primaryContactEmail) {
    return res.status(400).json({ error: "Primary contact email is required" });
  }

  // Optional: Add email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(primaryContactEmail)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  try {
    await sendStatusEmail({
      primaryContactName,
      primaryContactEmail,
      opening,
      status,
      subject,
      template: body,
    });
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending status email:", error);
    res
      .status(500)
      .json({ error: "Failed to send email", details: error.message });
  }
}
