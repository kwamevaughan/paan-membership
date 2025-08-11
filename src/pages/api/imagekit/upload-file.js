import { createSupabaseServerClient } from "@/lib/supabaseServer";
import ImageKit from "imagekit";
import formidable from "formidable";
import fs from "fs/promises";

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let tempFilePath = null;

  try {
    console.log("Starting file upload process...");

    // Validate ImageKit configuration
    const requiredEnvVars = {
      NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
      IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
      NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      console.error("Missing required ImageKit environment variables:", missingVars);
      return res.status(500).json({
        error: "Server configuration error",
        details: `Missing required environment variables: ${missingVars.join(", ")}`,
      });
    }

    // Authenticate user via Supabase
    const supabaseServer = createSupabaseServerClient(req, res);
    const {
      data: { user },
      error: userError,
    } = await supabaseServer.auth.getUser();
    if (userError || !user) {
      console.error(
        "Supabase auth error:",
        userError?.message || "No user found"
      );
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("User authenticated successfully");

    // Initialize ImageKit SDK
    const imagekit = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    });

    console.log("ImageKit SDK initialized with configuration:", {
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ? "Set" : "Missing",
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY ? "Set" : "Missing",
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ? "Set" : "Missing",
    });

    // Parse form data with formidable
    const form = formidable({ 
      multiples: false,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    console.log("Starting form parsing...");
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Form parsing error:", err);
          reject(err);
        }
        console.log("Form parsed successfully:", { fields, files });
        resolve([fields, files]);
      });
    });

    const file = files.file?.[0];
    if (!file) {
      console.error("No file provided in request");
      return res.status(400).json({ error: "No file provided" });
    }

    console.log("File received:", {
      name: file.originalFilename,
      type: file.mimetype,
      size: file.size,
      path: file.filepath
    });

    tempFilePath = file.filepath;
    const fileName = file.originalFilename || "blog-image.jpg";
    
    console.log("Reading file content...");
    const fileContent = await fs.readFile(tempFilePath);
    console.log("File content read successfully, size:", fileContent.length);

    // Get folder from form fields, default to "/Blog"
    const folder = fields.folder?.[0] || "/Blog";
    console.log("Upload folder:", folder);

    console.log("Uploading to ImageKit...");
    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: fileContent,
      fileName,
      folder: folder,
      useUniqueFileName: true,
      isPrivateFile: false,
    });

    console.log("ImageKit upload successful:", {
      fileId: uploadResponse.fileId,
      name: uploadResponse.name,
      url: uploadResponse.url,
      filePath: uploadResponse.filePath,
    });

    // Clean up temporary file
    if (tempFilePath) {
      try {
        console.log("Cleaning up temporary file:", tempFilePath);
        await fs.unlink(tempFilePath);
        console.log("Temporary file cleaned up successfully");
      } catch (cleanupError) {
        console.error("Error cleaning up temporary file:", cleanupError);
      }
    }

    return res.status(200).json({
      fileId: uploadResponse.fileId,
      name: uploadResponse.name,
      url: uploadResponse.url,
      filePath: uploadResponse.filePath,
    });
  } catch (error) {
    console.error("ImageKit upload error:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });

    // Clean up temporary file in case of error
    if (tempFilePath) {
      try {
        console.log("Cleaning up temporary file after error:", tempFilePath);
        await fs.unlink(tempFilePath);
        console.log("Temporary file cleaned up successfully after error");
      } catch (cleanupError) {
        console.error("Error cleaning up temporary file after error:", cleanupError);
      }
    }

    return res.status(500).json({ 
      error: "Internal server error", 
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      name: error.name
    });
  }
}
