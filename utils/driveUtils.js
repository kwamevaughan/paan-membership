// src/utils/driveUtils.js
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

export async function uploadFileToDrive(
  primaryContactName,
  opening,
  fileData,
  fileType,
  oldFileId
) {
  try {
    const cleanedServiceAccount = process.env.GOOGLE_SERVICE_ACCOUNT.replace(
      /\n/g,
      ""
    )
      .replace(/\s+/g, " ")
      .trim();
    const serviceAccountCreds = JSON.parse(cleanedServiceAccount);
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountCreds,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });
    const drive = google.drive({ version: "v3", auth });

    // Delete old file if it exists
    if (oldFileId) {
      await deleteFileFromDrive(oldFileId);
    }

    const isPdf = fileData.startsWith("JVBERi0");
    const ext = isPdf ? "pdf" : "docx";
    const fileName = `${primaryContactName} - ${opening} - ${formatDate()}.${ext}`;
    const buffer = Buffer.from(fileData, "base64");

    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);

    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
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
    return { url: fileUrl, fileId: driveResponse.data.id };
  } catch (error) {
    console.error(
      `${fileType} upload error:`,
      error.message,
      error.stack || "No stack trace"
    );
    return { url: null, fileId: null };
  }
}

export async function deleteFileFromDrive(fileId) {
    try {
        const cleanedServiceAccount = process.env.GOOGLE_SERVICE_ACCOUNT.replace(/\n/g, "").replace(/\s+/g, " ").trim();
        const serviceAccountCreds = JSON.parse(cleanedServiceAccount);
        const auth = new google.auth.GoogleAuth({
            credentials: serviceAccountCreds,
            scopes: ["https://www.googleapis.com/auth/drive.file"],
        });
        const drive = google.drive({ version: "v3", auth });

        await drive.files.delete({ fileId });
    } catch (error) {
        console.error(`Error deleting file with ID ${fileId}:`, error.message);
    }
}