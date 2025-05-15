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
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };
  return `${day}${suffix(day)} ${month} ${year}`;
};

// Utility to validate base64 string
function isValidBase64(str) {
  try {
    if (!str || typeof str !== "string") return false;
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(str)) return false;
    Buffer.from(str, "base64");
    return true;
  } catch (error) {
    console.error("Base64 validation error:", error.message);
    return false;
  }
}

export async function uploadFileToDrive(
  primaryContactName,
  opening,
  fileData,
  fileType,
  oldFileId,
  mimeType = "application/pdf"
) {
  try {
    // Validate and extract base64 string
    let base64String;
    if (typeof fileData === "string") {
      base64String = fileData;
    } else if (fileData && typeof fileData === "object") {
      if (fileData.data) {
        base64String = fileData.data;
      } else if (fileData.base64) {
        base64String = fileData.base64;
      } else if (fileData.file) {
        base64String = fileData.file;
      } else {
        throw new Error(
          "Invalid fileData format: no data, base64, or file property"
        );
      }
    } else {
      throw new Error(`Invalid fileData type: ${typeof fileData}`);
    }

    // Remove data URI prefix if present
    if (base64String.startsWith("data:")) {
      base64String = base64String.split(",")[1];
    }

    // Validate base64 string
    if (!isValidBase64(base64String)) {
      throw new Error(`Invalid base64 string for ${fileType}`);
    }

    console.log(
      `Uploading ${fileType} with base64 length: ${base64String.length}, MIME type: ${mimeType}`
    );

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
      await deleteFileFromDrive(oldFileId, auth);
    }

    // Determine file extension based on MIME type
    const mimeTypeMap = {
      "application/pdf": ".pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ".docx",
      "application/octet-stream": ".pdf",
    };
    const extension = mimeTypeMap[mimeType] || ".pdf";

    const fileName = `${primaryContactName} - ${opening} - ${formatDate()}${
      fileType === "company-registration" ? "" : ` - ${fileType}`
    }${extension}`;
    const buffer = Buffer.from(base64String, "base64");

    console.log(`Decoded buffer for ${fileType}: ${buffer.length} bytes`);

    // Validate buffer
    if (buffer.length === 0) {
      throw new Error(`Empty buffer for ${fileType} after base64 decoding`);
    }

    // Create Readable stream
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);

    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType,
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
    console.log(`Uploaded ${fileType} with ID: ${driveResponse.data.id}`);
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

export async function deleteFileFromDrive(fileId, auth) {
  try {
    const drive = google.drive({ version: "v3", auth });
    await drive.files.delete({ fileId });
    console.log(`Deleted file with ID: ${fileId}`);
  } catch (error) {
    console.error(`Error deleting file with ID ${fileId}:`, error.message);
  }
}
