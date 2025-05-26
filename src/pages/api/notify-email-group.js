import { createSupabaseServerClient } from "@/lib/supabaseServer";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Initialize Supabase client
  const supabaseServer = createSupabaseServerClient(req, res);

  const { groupIds, jobTitle, jobId, jobType, expiresOn } = req.body;

  if (!Array.isArray(groupIds) || groupIds.length === 0) {
    return res.status(400).json({ error: "At least one group ID is required" });
  }

  // Validate jobType if provided
  const validJobTypes = ["agencies", "freelancers"];
  if (jobType && !validJobTypes.includes(jobType)) {
    return res.status(400).json({ error: "Invalid job type" });
  }

  try {
    // Fetch email groups
    const { data: groupsData, error: groupError } = await supabaseServer
      .from("email_groups")
      .select("name, emails")
      .in("id", groupIds);
    if (groupError || !groupsData || groupsData.length === 0) {
      throw new Error("One or more email groups not found");
    }

    const emailList = groupsData
      .flatMap((group) => (group.emails || "").split(","))
      .filter((email) => email.trim());
    const groupNames = groupsData.map((g) => g.name).join(", ");

    // Fetch job details including slug and job_type
    const { data: jobData, error: jobFetchError } = await supabaseServer
      .from("job_openings")
      .select("slug, job_type")
      .eq("id", jobId)
      .single();
    if (jobFetchError || !jobData) throw new Error("Job not found");

    // Use jobType from payload if provided, otherwise fallback to jobData.job_type
    const effectiveJobType = jobType || jobData.job_type || "agencies";
    if (!validJobTypes.includes(effectiveJobType)) {
      throw new Error("Job type in database is invalid");
    }

    // Fetch email template
    const { data: templateData, error: templateError } = await supabaseServer
      .from("email_templates")
      .select("subject, body")
      .eq("name", "jobPostedNotification")
      .single();
    if (templateError || !templateData) {
      throw new Error("Job posting notification template not found");
    }

    const { subject, body } = templateData;
    const baseUrl = process.env.BASE_URL || "https://membership.paan.africa";
    const jobUrl = `${baseUrl}/jobs/${jobData.slug}`;
    const interviewUrl = `${baseUrl}/interview?opening=${encodeURIComponent(
      jobTitle
    )}&job_type=${encodeURIComponent(effectiveJobType)}`;

    // Replace placeholders in email template
    const finalSubject = subject
      .replace("{{jobTitle}}", jobTitle)
      .replace("{{jobUrl}}", jobUrl)
      .replace("{{interviewUrl}}", interviewUrl);
    const finalBody = body
      .replace("{{jobTitle}}", jobTitle)
      .replace("{{jobUrl}}", jobUrl)
      .replace("{{interviewUrl}}", interviewUrl)
      .replace("{{expiresOn}}", expiresOn || "N/A")
      .replace("{{jobType}}", effectiveJobType);

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Create a notification job
    const notificationJobId = uuidv4();
    const { error: insertError } = await supabaseServer
      .from("notification_jobs")
      .insert({
        id: notificationJobId,
        total_emails: emailList.length,
        status: "sending",
      });
    if (insertError) throw new Error("Failed to create notification job");

    // Batch emails
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < emailList.length; i += batchSize) {
      batches.push(emailList.slice(i, i + batchSize));
    }

    // Send emails in background and update job status
    const sendEmails = async () => {
      let sentCount = 0;
      try {
        for (const batch of batches) {
          await transporter.sendMail({
            from: `"Growthpad Consulting Group" <${process.env.EMAIL_USER}>`,
            replyTo: process.env.EMAIL_REPLYTO,
            to: batch,
            subject: finalSubject,
            html: finalBody,
            text: `A new job "${jobTitle}" (${effectiveJobType}) has been posted. Expires on: ${
              expiresOn || "N/A"
            }. Apply here: ${interviewUrl}. View details: ${jobUrl}. Regards, HR Team`,
          });
          sentCount += batch.length;
          await supabaseServer
            .from("notification_jobs")
            .update({ sent_emails: sentCount })
            .eq("id", notificationJobId);
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 1s delay
        }
        await supabaseServer
          .from("notification_jobs")
          .update({ status: "completed", sent_emails: emailList.length })
          .eq("id", notificationJobId);
      } catch (error) {
        console.error("Background email sending failed:", error);
        await supabaseServer
          .from("notification_jobs")
          .update({ status: "failed" })
          .eq("id", notificationJobId);
      }
    };

    sendEmails().catch(console.error);

    res.status(200).json({
      message: `Sending emails to ${groupNames} (${emailList.length} recipients) in the background`,
      jobId: notificationJobId,
      total: emailList.length,
    });
  } catch (error) {
    console.error("Error initiating email notification:", error);
    res.status(500).json({ error: "Failed to initiate notification" });
  }
}
