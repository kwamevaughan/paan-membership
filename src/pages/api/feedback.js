import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { sendEmails } from "../../../utils/emailUtils";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { feedback, email, name, job_type, reference_number } = req.body;

    if (!feedback || !email || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const supabaseServer = createSupabaseServerClient(req, res);

    const { error } = await supabaseServer.from("applicant_feedback").insert([
      {
        feedback,
        email,
        name,
        job_type,
        reference_number,
        submitted_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error submitting feedback:", error);
      return res.status(500).json({ error: "Failed to submit feedback" });
    }

    // Send email notification
    try {
      const { data: templates, error: templateError } = await supabaseServer
        .from("email_templates")
        .select("name, subject, body")
        .eq("name", "feedbackNotification")
        .single();

      if (templateError) {
        console.error("Error fetching email template:", templateError);
        // Continue with success response even if email fails
      } else {
        const emailData = {
          feedback,
          name,
          email,
          job_type,
          reference_number,
          submitted_at: new Date().toLocaleString(),
          candidateTemplate: templates.body,
          candidateSubject: templates.subject,
          fromEmail: process.env.AGENCY_EMAIL,
          fromName: "PAAN Agency",
          toEmail: process.env.SUPPORT_EMAIL,
          toName: "PAAN Support",
          replyTo: email,
          replyToName: name,
        };

        await sendEmails(emailData);
      }
    } catch (emailError) {
      console.error("Error sending feedback email:", emailError);
      // Continue with success response even if email fails
    }

    return res.status(200).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error in feedback submission:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
} 