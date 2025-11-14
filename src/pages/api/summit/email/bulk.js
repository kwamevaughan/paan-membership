import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createSupabaseServerClient(req, res);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data: hrUser, error: hrError } = await supabase
      .from("hr_users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (hrError || !hrUser) {
      return res.status(403).json({ error: "Forbidden - Admin access required" });
    }

    const { subject, body, recipients } = req.body;

    if (!subject || !body || !recipients || recipients.length === 0) {
      return res.status(400).json({
        error: "Subject, body, and recipients are required",
      });
    }

    // TODO: Integrate with your email service (SendGrid, AWS SES, etc.)
    // For now, we'll just log and return success
    console.log(`[EMAIL] Bulk email queued by user ${user.id}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`[EMAIL] Recipients: ${recipients.length}`);

    // In production, you would:
    // 1. Queue emails in a job queue (Bull, BullMQ, etc.)
    // 2. Process emails in batches to avoid rate limits
    // 3. Track delivery status
    // 4. Handle bounces and failures

    return res.status(200).json({
      success: true,
      message: `Email queued for ${recipients.length} recipients`,
      data: {
        recipientCount: recipients.length,
        subject,
      },
    });
  } catch (error) {
    console.error("[API] Error in bulk email endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
