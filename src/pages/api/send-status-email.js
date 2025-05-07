// src/pages/api/send-status-email.js
import { sendStatusEmail } from "../../../utils/emailUtils";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { fullName, email, opening, status, subject, body } = req.body;

    try {
        await sendStatusEmail({ fullName, email, opening, status, subject, template: body });
        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending status email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
}