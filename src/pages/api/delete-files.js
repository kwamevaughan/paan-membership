// src/pages/api/delete-files.js
import { google } from "googleapis";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { fileIds } = req.body; // Expect an array of file IDs
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return res.status(400).json({ error: "No file IDs provided" });
    }

    try {
        const serviceAccountCreds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
        const auth = new google.auth.GoogleAuth({
            credentials: serviceAccountCreds,
            scopes: ["https://www.googleapis.com/auth/drive.file"],
        });
        const drive = google.drive({ version: "v3", auth });

        // Delete each file from Google Drive
        await Promise.all(fileIds.map(fileId => 
            drive.files.delete({ fileId })
        ));

        return res.status(200).json({ message: "Files deleted successfully" });
    } catch (error) {
        console.error("Error deleting files:", error.message, error.stack || "No stack trace");
        return res.status(500).json({ error: "Failed to delete files", details: error.message });
    }
}