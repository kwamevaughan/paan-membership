// src/pages/api/get-email-template.js
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { status, fullName, opening } = req.query;

    try {
        const templateFile = `${status.toLowerCase()}Email.html`;
        const templatePath = path.join(process.cwd(), "src/templates", templateFile);
        let template = fs.readFileSync(templatePath, "utf8");

        template = template
            .replace("{{fullName}}", fullName)
            .replace("{{opening}}", opening);

        res.status(200).json({ template });
    } catch (error) {
        console.error("Error fetching email template:", error);
        res.status(500).json({ error: "Failed to fetch email template" });
    }
}