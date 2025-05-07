import { supabase } from "@/lib/supabase";

export default async function handler(req, res) {
    const { data: automations } = await supabase.from("automations").select("*").eq("active", true);
    const { data: candidates } = await supabase.from("candidates").select("*, responses(*)");

    for (const auto of automations) {
        const filtered = candidates.filter((c) => {
            const value = c[auto.condition_field] || c.responses[auto.condition_field];
            switch (auto.condition_operator) {
                case ">": return Number(value) > Number(auto.condition_value);
                case "<": return Number(value) < Number(auto.condition_value);
                case "=": return value === auto.condition_value;
                default: return false;
            }
        });

        for (const candidate of filtered) {
            if (auto.action_type === "email") {
                // Call email API (e.g., /api/send-status-email)
                await fetch("/api/send-status-email", {
                    method: "POST",
                    body: JSON.stringify({ email: candidate.email, subject: auto.action_value, body: "..." }),
                });
            } else if (auto.action_type === "status") {
                await supabase.from("responses").update({ status: auto.action_value }).eq("user_id", candidate.id);
            }
            // Add more action types as needed
        }
    }

    res.status(200).json({ message: "Automations executed" });
}