// src/pages/api/upload-job-file.js
import { google } from "googleapis";
import { Readable } from "stream";

// Format date as "20th February 2024"
const formatDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const suffix = (day) => {
        if (day > 3 && day < 21) return "th";
        switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };
    return `${day}${suffix(day)} ${month} ${year}`;
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { fileData, fileType, opening } = req.body; // Added opening to request body

    if (!opening) {
        return res.status(400).json({ error: "Opening is required for file naming" });
    }

    try {
        const serviceAccountCreds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
        const auth = new google.auth.GoogleAuth({
            credentials: serviceAccountCreds,
            scopes: ["https://www.googleapis.com/auth/drive.file"],
        });
        const drive = google.drive({ version: "v3", auth });

        const isPdf = fileType === "pdf";
        const ext = isPdf ? "pdf" : "docx";
        const fileName = `${opening} - ${formatDate()}.${ext}`; // e.g., "Business Developer Intern - 20th February 2024.pdf"
        const buffer = Buffer.from(fileData, "base64");

        const bufferStream = new Readable();
        bufferStream.push(buffer);
        bufferStream.push(null);

        const fileMetadata = {
            name: fileName,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_NEW],
        };

        const media = {
            mimeType: isPdf
                ? "application/pdf"
                : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            body: bufferStream,
        };

        const driveResponse = await drive.files.create({
            requestBody: fileMetadata,
            media,
            fields: "id, webContentLink",
        });

        await drive.permissions.create({
            fileId: driveResponse.data.id,
            requestBody: {
                role: "reader",
                type: "anyone",
            },
        });

        const fileUrl = driveResponse.data.webContentLink;
        res.status(200).json({ url: fileUrl, fileId: driveResponse.data.id });
    } catch (error) {
        console.error("Upload error:", error.message, error.stack || "No stack trace");
        res.status(500).json({ error: "Failed to upload file" });
    }
}