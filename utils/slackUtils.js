export async function notifyNewRegistrationSlack({
  primaryContactName,
  agencyName,
  primaryContactEmail,
  job_type,
  opening,
  selectedTier,
  referenceNumber,
}) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[slackUtils] SLACK_WEBHOOK_URL not set, skipping Slack notification");
    return;
  }

  const displayName = job_type === "freelancer" ? primaryContactName : agencyName;
  const message =
    `:tada: *New ${job_type === "freelancer" ? "Freelancer" : "Agency"} Registration*\n` +
    `*Name:* ${displayName || "N/A"}\n` +
    `*Contact:* ${primaryContactName || "N/A"} (${primaryContactEmail || "N/A"})\n` +
    `*Opening:* ${opening || "N/A"}\n` +
    `*Tier:* ${selectedTier || "Not specified"}\n` +
    `*Reference:* ${referenceNumber || "N/A"}\n` +
    `View in HR dashboard: https://membership.paan.africa/hr/applicants`;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });

    if (!response.ok) {
      console.error("[slackUtils] Slack notification failed:", response.status, await response.text());
    }
  } catch (error) {
    console.error("[slackUtils] Error sending Slack notification:", error);
  }
}
