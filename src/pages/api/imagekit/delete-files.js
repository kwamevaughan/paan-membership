import { createSupabaseServerClient } from "@/lib/supabaseServer";
import ImageKit from "imagekit";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Starting bulk delete process...");

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

    const { fileIds } = req.body;
    console.log("Received fileIds for deletion:", fileIds);

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      console.error("Invalid fileIds:", fileIds);
      return res.status(400).json({ 
        error: "Invalid request", 
        details: "fileIds must be a non-empty array" 
      });
    }

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

    // Initialize ImageKit SDK
    const imagekit = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    });

    console.log("Sending delete request to ImageKit...");
    
    // Delete files one by one using the SDK
    const deletePromises = fileIds.map(fileId => 
      imagekit.deleteFile(fileId)
        .catch(error => {
          console.error(`Error deleting file ${fileId}:`, error);
          return { fileId, error };
        })
    );

    const results = await Promise.all(deletePromises);
    const errors = results.filter(result => result.error);
    const successfulDeletes = results.filter(result => !result.error);

    console.log("Delete results:", {
      successful: successfulDeletes.length,
      failed: errors.length,
      errors
    });

    if (errors.length > 0) {
      return res.status(500).json({
        error: "Some files could not be deleted",
        details: errors,
        successfulDeletes: successfulDeletes.map(r => r.fileId)
      });
    }

    console.log(`Successfully deleted files:`, fileIds);
    res.status(200).json({ 
      message: "Files deleted successfully", 
      deletedFileIds: fileIds 
    });
  } catch (error) {
    console.error("Delete files error:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      name: error.name
    });
  }
}
