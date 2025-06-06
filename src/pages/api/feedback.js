import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { sendStatusEmail } from "../../../utils/emailUtils";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { feedback, email, name, job_type, reference_number } = req.body;

    if (!feedback || !email || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("Received feedback submission:", {
      name,
      email,
      job_type,
      reference_number,
      feedback
    });

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
        const formatDate = (date) => {
          return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
          });
        };

        // Create a more meaningful subject line
        const emailSubject = reference_number 
          ? `New Feedback Submission - ${reference_number}`
          : `New Feedback from ${name} - ${job_type || 'General'} Feedback`;

        const emailTemplate = templates.body
          .replace(/{{name}}/g, name)
          .replace(/{{email}}/g, email)
          .replace(/{{job_type}}/g, job_type || "N/A")
          .replace(/{{reference_number}}/g, reference_number || "N/A")
          .replace(/{{submitted_at}}/g, formatDate(new Date()))
          .replace(/{{feedback}}/g, feedback);

        await sendStatusEmail({
          primaryContactName: "PAAN Support",
          primaryContactEmail: process.env.SUPPORT_EMAIL,
          opening: "Feedback Submission",
          status: "feedback",
          subject: emailSubject,
          template: emailTemplate,
        });
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