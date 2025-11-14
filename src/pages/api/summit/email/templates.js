import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function handler(req, res) {
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

  if (req.method === "GET") {
    return handleGet(res);
  } else if (req.method === "POST") {
    return handlePost(req, res, user);
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleGet(res) {
  try {
    // Return predefined email templates
    const templates = [
      {
        id: "purchase-confirmation",
        name: "Purchase Confirmation",
        subject: "Your Summit Ticket Purchase Confirmation",
        body: `<p>Dear {name},</p>
<p>Thank you for purchasing tickets to the PAAN Summit!</p>
<p>Your ticket type: {ticket_type}</p>
<p>We look forward to seeing you at the event.</p>`,
      },
      {
        id: "event-reminder",
        name: "Event Reminder",
        subject: "PAAN Summit - Event Reminder",
        body: `<p>Hi {name},</p>
<p>This is a reminder about the upcoming PAAN Summit.</p>
<p>Don't forget to bring your ticket confirmation.</p>`,
      },
      {
        id: "visa-letter",
        name: "Visa Letter",
        subject: "Your Visa Letter for PAAN Summit",
        body: `<p>Dear {name},</p>
<p>Please find attached your visa invitation letter for the PAAN Summit.</p>`,
      },
    ];

    return res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("[API] Error fetching email templates:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handlePost(req, res, user) {
  try {
    const { name, subject, body } = req.body;

    if (!name || !subject || !body) {
      return res.status(400).json({
        error: "Name, subject, and body are required",
      });
    }

    // TODO: Store custom templates in database
    console.log(`[AUDIT] Email template created by user ${user.id}`);

    return res.status(201).json({
      success: true,
      message: "Email template created successfully",
      data: {
        id: `custom-${Date.now()}`,
        name,
        subject,
        body,
      },
    });
  } catch (error) {
    console.error("[API] Error creating email template:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
