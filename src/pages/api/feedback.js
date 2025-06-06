import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { sendStatusEmail } from "../../../utils/emailUtils";
import { format } from "date-fns";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseServer = createSupabaseServerClient(req, res);

  try {
    const {
      feedback,
      email,
      name,
      job_type,
      reference_number,
      emoji,
      feedbackType,
      ratings
    } = req.body;

    if (!feedback || !email || !name || !job_type || !reference_number) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // Format the data for email template
    const emojiLabels = {
      "😊": "Great Experience",
      "😐": "Neutral",
      "😕": "Could Be Better",
      "😍": "Loved It",
      "🤔": "Confusing"
    };

    const feedbackTypeLabels = {
      "general": "General Feedback",
      "suggestion": "Suggestion",
      "bug": "Issue Report",
      "praise": "Praise"
    };

    const ratingToStars = (rating) => {
      return "★".repeat(rating) + "☆".repeat(5 - rating);
    };

    // Store in database
    const { data, error } = await supabaseServer
      .from("applicant_feedback")
      .insert([
        {
          feedback,
          email,
          name,
          job_type,
          reference_number,
          emoji_reaction: emoji,
          feedback_type: feedbackType,
          ease_of_use_rating: ratings?.easeOfUse || null,
          design_rating: ratings?.design || null,
          clarity_rating: ratings?.clarity || null,
          overall_rating: ratings?.overall || null,
          submitted_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error("Error inserting feedback:", error);
      return res.status(500).json({
        error: "Failed to submit feedback",
        details: error.message,
      });
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
          .replace(/{{feedback}}/g, feedback)
          .replace(/{{emoji_reaction}}/g, emoji || "😊")
          .replace(/{{emoji_label}}/g, emojiLabels[emoji] || "No Reaction")
          .replace(/{{feedback_type_label}}/g, feedbackTypeLabels[feedbackType] || "General Feedback")
          .replace(/{{ease_of_use_stars}}/g, ratingToStars(ratings?.easeOfUse || 0))
          .replace(/{{design_stars}}/g, ratingToStars(ratings?.design || 0))
          .replace(/{{clarity_stars}}/g, ratingToStars(ratings?.clarity || 0))
          .replace(/{{overall_stars}}/g, ratingToStars(ratings?.overall || 0));

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

    return res.status(200).json({
      message: "Feedback submitted successfully",
      data,
    });
  } catch (error) {
    console.error("Error in feedback submission:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
} 