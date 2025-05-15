import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async () => {
    const now = new Date();

    const { data: automations, error } = await supabase
        .from("automations")
        .select("*")
        .eq("active", true);

    if (error) {
        console.error("Error fetching automations:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    for (const automation of automations) {
        // Check schedule
        if (automation.schedule_type === "range") {
            const start = new Date(automation.start_date);
            const end = new Date(automation.end_date);
            if (now < start || now > end) continue;
        } else if (automation.schedule_type === "forever" || automation.schedule_type === "hourly") {
            const lastRun = automation.last_run ? new Date(automation.last_run) : new Date(0);
            const hoursSinceLastRun = (now - lastRun) / (1000 * 60 * 60);
            if (hoursSinceLastRun < automation.interval_hours) continue;
        }

        // Fetch candidates
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
            console.error("Error fetching candidates for automation", automation.id, candidateError);
            continue;
        }

        if (candidates.length === 0) continue;

        // Execute actions
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
                        .replace("{{opening}}", candidate.opening || "N/A")
                        .replace("{{score}}", candidate.responses.score);

                    const response = await fetch("https://membership.paan.africa/api/send-status-email", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ subject, body, email: candidate.email }),
                    });

                    if (!response.ok) {
                        console.error("Failed to send email for", candidate.id, await response.text());
                    }
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
                const slackWebhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
                const candidateList = candidates.slice(0, 10).map((c) => `- ${c.full_name} (Score: ${c.responses.score})`).join("\n");
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

        // Update last_run for "forever" or "hourly"
        if (automation.schedule_type === "forever" || automation.schedule_type === "hourly") {
            await supabase
                .from("automations")
                .update({ last_run: now.toISOString() })
                .eq("id", automation.id);
        }
    }

    return new Response(JSON.stringify({ message: "Automations executed" }), { status: 200 });
});