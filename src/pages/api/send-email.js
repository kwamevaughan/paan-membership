import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify user authentication
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { fullName, email, subject, body, jobType } = req.body;

  // Validate inputs
  if (!email || !subject || !body || !jobType) {
    return res
      .status(400)
      .json({ error: "Email, subject, body, and jobType are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  // Determine sender email based on jobType
  const senderEmail =
    jobType === "Agency"
      ? process.env.AGENCY_EMAIL
      : process.env.FREELANCER_EMAIL;

  if (!senderEmail) {
    return res
      .status(400)
      .json({ error: "Invalid jobType or sender email not configured" });
  }

  // Create Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"PAAN HR Team" <${process.env.EMAIL_USER}>`,
      to: email,
      replyTo: process.env.EMAIL_REPLYTO,
      subject,
      html: body,
      headers: {
        "X-Entity-Ref-ID": user.id, // Track user for auditing
      },
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("[API/send-email] Error sending email:", error);
    res
      .status(500)
      .json({ error: "Failed to send email", details: error.message });
  }
}
