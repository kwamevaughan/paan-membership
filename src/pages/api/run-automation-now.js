import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { automation } = req.body;

    if (!automation || !automation.condition_field || !automation.action_type) {
        return res.status(400).json({ message: "Invalid automation data" });
    }

    let query = supabase
        .from("candidates")
        .select("id, full_name, email, responses!inner(score, status, submitted_at, user_id)");

    if (automation.condition_field === "score") {
        query = query[automation.condition_operator === ">" ? "gt" : automation.condition_operator === "<" ? "lt" : "eq"]("responses.score", automation.condition_value);
    } else if (automation.condition_field === "status") {
        query = query.eq("responses.status", automation.condition_value);
    } else if (automation.condition_field === "submitted_at") {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(automation.condition_value));
        query = query[automation.condition_operator === ">" ? "gt" : automation.condition_operator === "<" ? "lt" : "eq"]("responses.submitted_at", daysAgo.toISOString());
    }

    const { data: candidates, error: candidateError } = await query;
    if (candidateError) {
        console.error("Error fetching candidates:", candidateError);
        return res.status(500).json({ message: "Failed to fetch candidates" });
    }

    if (candidates.length === 0) {
        return res.status(200).json({ message: "No candidates matched" });
    }

    if (automation.action_type === "email") {
        const { data: template } = await supabase
            .from("email_templates")
            .select("subject, body")
            .eq("name", automation.action_value)
            .single();

        if (template) {
            for (const candidate of candidates) {
                const subject = template.subject.replace("{{fullName}}", candidate.full_name);
                const body = template.body
                    .replace("{{fullName}}", candidate.full_name)
                    .replace("{{opening}}", candidate.opening)
                    .replace("{{score}}", candidate.responses.score);

                await fetch("https://membership.paan.africa/api/send-status-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ subject, body, email: candidate.email }),
                });
            }
        }
    } else if (automation.action_type === "status") {
        for (const candidate of candidates) {
            await supabase
                .from("responses")
                .update({ status: automation.action_value })
                .eq("user_id", candidate.id);
        }
    } else if (automation.action_type === "notify") {
        if (automation.notify_type === "slack") {
            const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL || "https://hooks.slack.com/services/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";
            const candidateList = candidates.slice(0, 10).map((c) => `- ${c.full_name} (Score: ${c.responses.score})`).join("\n"); // Limit to 10 for brevity
            const message = `*Automation Triggered: ${automation.condition_field} ${automation.condition_operator} ${automation.condition_value}*\n` +
                            `${candidates.length} candidates need review:\n${candidateList}${candidates.length > 10 ? "\n...and more" : ""}\n` +
                            `View details: https://membership.paan.africa/hr/applicants`;

            await fetch(slackWebhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: message }),
            });
        } else if (automation.notify_type === "email") {
            const candidateList = candidates.map((c) => `- ${c.full_name} (Score: ${c.responses.score})`).join("\n");
            const message = `Automation Triggered: ${automation.condition_field} ${automation.condition_operator} ${automation.condition_value}\n` +
                            `${candidates.length} candidates need review:\n${candidateList}\n` +
                            `View details: https://membership.paan.africa/hr/applicants`;

            await fetch("https://membership.paan.africa/api/send-status-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: "Automation Notification",
                    body: message,
                    email: automation.action_value,
                }),
            });
        }
    }

    return res.status(200).json({ message: "Automation executed successfully" });
}