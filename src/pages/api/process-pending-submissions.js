import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { sendEmails } from "../../../utils/emailUtils";
import { format } from "date-fns";

function replaceTemplateTags(template, data) {
  return template.replace(/{{(\w+)}}/g, (match, key) => {
    if (key === "answersTable") return match;
    return data[key] !== undefined && data[key] !== null ? data[key] : match;
  });
}

function formatAnswer(answer, question) {
  if (!answer || answer === "[]") {
    return "None provided";
  }
  try {
    const parsed = typeof answer === "string" ? JSON.parse(answer) : answer;
    if (Array.isArray(parsed) && parsed.length > 0) {
      if (question.is_open_ended && question.structured_answers?.fields) {
        const formatted = parsed
          .map((item) => {
            const details = JSON.parse(item.customText || "{}");
            const formattedFields = question.structured_answers.fields
              .map((field) => {
                const fieldName = field.name.toLowerCase();
                const value = details[fieldName] || "N/A";
                return `${field.name}: ${value}`;
              })
              .join(", ");
            return `- ${formattedFields}`;
          })
          .filter((text) => text !== "- ")
          .join("\n");
        return formatted;
      }
      if (question.is_open_ended && !question.structured_answers) {
        const formatted =
          parsed
            .map((item) => {
              const text = item.text || item.customText || "N/A";
              const link = item.link ? ` (Link: ${item.link})` : "";
              return text + link;
            })
            .filter((text) => text !== "N/A")
            .join("\n") || "None provided";
        return formatted;
      }
      const formatted = parsed
        .map((item) =>
          typeof item === "string"
            ? item
            : item.option || item.customText || "N/A"
        )
        .filter((text) => text !== "N/A")
        .join(", ");
      return formatted;
    }
    const result = parsed.toString();
    return result;
  } catch (e) {
    console.error(
      `Error formatting answer for Q${question.id}:`,
      e.message,
      answer
    );
    return answer.toString();
  }
}

export default async function handler(req, res) {
  const functionStart = Date.now();
  console.log("[process-pending-submissions] Function handler started");

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const supabaseServer = createSupabaseServerClient(req, res);
  console.log(
    "[process-pending-submissions] Supabase client created:",
    (Date.now() - functionStart) / 1000,
    "seconds"
  );

  // Get the oldest submission that needs email processing
  const { data: responses, error: fetchError } = await supabaseServer
    .from("responses")
    .select("*")
    .eq("email_sent", false)
    .not("email_data", "is", null)
    .order("submitted_at", { ascending: true })
    .limit(1);

  console.log(
    "[process-pending-submissions] DB query completed:",
    (Date.now() - functionStart) / 1000,
    "seconds"
  );

  if (fetchError) {
    console.error(
      "[process-pending-submissions] Failed to fetch pending submission:",
      fetchError
    );
    return res
      .status(500)
      .json({
        message: "Failed to fetch pending submission",
        error: fetchError.message,
      });
  }

  if (!responses || responses.length === 0) {
    return res
      .status(200)
      .json({ message: "No pending submissions to process." });
  }

  const response = responses[0];
  console.log(
    "[process-pending-submissions] Found submission:",
    response.user_id,
    "at",
    (Date.now() - functionStart) / 1000,
    "seconds"
  );

  // Mark processing start time (don't change status - that's for application status)
  await supabaseServer
    .from("responses")
    .update({ processed_at: new Date().toISOString() })
    .eq("user_id", response.user_id);

  console.log(
    "[process-pending-submissions] Marked processing start:",
    (Date.now() - functionStart) / 1000,
    "seconds"
  );

  try {
    // Parse the email data
    let emailPayload;
    try {
      emailPayload = JSON.parse(response.email_data);
    } catch (parseError) {
      console.error(
        "[process-pending-submissions] Failed to parse email_data:",
        parseError
      );
      throw new Error("Invalid email_data format");
    }

    const {
      userId,
      agencyName,
      yearEstablished,
      headquartersLocation,
      registeredOfficeAddress,
      websiteUrl,
      primaryContactName,
      primaryContactRole,
      primaryContactEmail,
      primaryContactPhone,
      primaryContactLinkedin,
      phoneNumber,
      countryOfResidence,
      languagesSpoken,
      opening,
      opening_id,
      job_type,
      answers,
      country,
      device,
      submittedAt,
      referenceNumber,
    } = emailPayload;

    console.log(
      "[process-pending-submissions] Processing submission for:",
      primaryContactName
    );

    // Get questions for formatting answers
    const { data: filteredQuestions, error: questionsError } =
      await supabaseServer
        .from("interview_questions")
        .select("id, text, is_open_ended, structured_answers, order")
        .eq("job_type", job_type)
        .order("order", { ascending: true });

    if (questionsError) {
      throw new Error("Failed to fetch questions: " + questionsError.message);
    }

    // Format answers table
    const answersTable = filteredQuestions
      .map((q) => {
        const answer = answers[q.id - 1];
        const formattedAnswer = formatAnswer(answer, q);
        return {
          question: q.text,
          answer: formattedAnswer,
          id: q.id,
          is_open_ended: q.is_open_ended,
          structured_answers: q.structured_answers,
          order: q.order,
        };
      })
      .filter((qa) => qa.answer !== "None provided")
      .sort((a, b) => a.order - b.order);

    // Get email templates
    const templateNames =
      job_type === "freelancer"
        ? ["freelancerCandidateEmail", "freelancerAdminEmail"]
        : ["agencyCandidateEmail", "agencyAdminEmail"];

    const { data: templates, error: templateError } = await supabaseServer
      .from("email_templates")
      .select("name, subject, body")
      .in("name", templateNames);

    if (templateError) {
      throw new Error(
        "Failed to fetch email templates: " + templateError.message
      );
    }

    const candidateTemplate =
      templates.find((t) => t.name === templateNames[0])?.body || "";
    const adminTemplate =
      templates.find((t) => t.name === templateNames[1])?.body || "";
    const candidateSubject =
      templates.find((t) => t.name === templateNames[0])?.subject ||
      "Application Received";
    const adminSubject =
      templates.find((t) => t.name === templateNames[1])?.subject ||
      `New Application Submission from ${primaryContactName} - ${opening} - ${
        job_type === "freelancer" ? "Freelancer" : `Agency ${agencyName}`
      }`;

    // Prepare email data
    const emailData = {
      primaryContactName,
      primaryContactEmail,
      phoneNumber:
        job_type === "freelancer" ? phoneNumber : primaryContactPhone,
      countryOfResidence:
        job_type === "freelancer" ? countryOfResidence : headquartersLocation,
      languagesSpoken: job_type === "freelancer" ? languagesSpoken : null,
      opening,
      opening_id,
      job_type,
      answers,
      questions: filteredQuestions,
      answersTable,
      submittedAt: submittedAt || new Date().toISOString(),
      submissionDate: format(
        new Date(submittedAt || new Date()),
        "d MMMM yyyy"
      ),
      referenceNumber,
      candidateTemplate: replaceTemplateTags(candidateTemplate, {
        primaryContactName,
        agencyName,
        job_type,
      }),
      adminTemplate,
      candidateSubject: replaceTemplateTags(candidateSubject, {
        primaryContactName,
        agencyName,
        job_type,
      }),
      adminSubject: replaceTemplateTags(adminSubject, {
        primaryContactName,
        agencyName,
        opening,
        job_type,
      }),
    };

    if (job_type === "agency") {
      Object.assign(emailData, {
        agencyName,
        yearEstablished,
        headquartersLocation,
        registeredOfficeAddress,
        websiteUrl,
        primaryContactRole,
        primaryContactPhone,
        primaryContactLinkedin,
        companyRegistrationUrl: null,
        portfolioWorkUrl: null,
        agencyProfileUrl: null,
      });
    }

    console.log(
      "[process-pending-submissions] About to send emails for:",
      primaryContactName,
      "at",
      (Date.now() - functionStart) / 1000,
      "seconds"
    );

    // Send emails
    await sendEmails(emailData);

    console.log(
      "[process-pending-submissions] Emails sent successfully for:",
      primaryContactName,
      "at",
      (Date.now() - functionStart) / 1000,
      "seconds"
    );

    // Mark email as sent
    await supabaseServer
      .from("responses")
      .update({
        email_sent: true,
        processed_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("user_id", response.user_id);

    console.log(
      "[process-pending-submissions] Final DB update completed:",
      (Date.now() - functionStart) / 1000,
      "seconds"
    );
    console.log(
      "[process-pending-submissions] Function completed in",
      (Date.now() - functionStart) / 1000,
      "seconds"
    );

    return res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.error(
      "[process-pending-submissions] Processing failed:",
      error.message
    );

    // Mark processing as failed (don't change status - that's for application status)
    await supabaseServer
      .from("responses")
      .update({
        processed_at: new Date().toISOString(),
        error_message: error.message,
      })
      .eq("user_id", response.user_id);

    // Also log to submission_errors
    await supabaseServer.from("submission_errors").insert([
      {
        user_id: response.user_id,
        error_message: "Email processing failed",
        error_details: { message: error.message, stack: error.stack },
      },
    ]);

    return res
      .status(500)
      .json({ message: "Failed to process submission", error: error.message });
  }
}
