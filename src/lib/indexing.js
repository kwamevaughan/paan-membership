// lib/indexing.js
const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || "{}"),
  scopes: ["https://www.googleapis.com/auth/indexing"],
});
const indexing = google.indexing("v3");

export async function notifyGoogle(url) {
  console.log(
    "Initializing Google Auth with credentials:",
    process.env.GOOGLE_APPLICATION_CREDENTIALS ? "Set" : "Not set"
  );
  const authClient = await auth.getClient();
  console.log("Auth client obtained:", !!authClient);

  try {
    console.log("Publishing URL notification for:", url);
    const response = await indexing.urlNotifications.publish({
      auth: authClient,
      requestBody: {
        url: url,
        type: "URL_UPDATED",
      },
    });
    console.log("Google response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Indexing API error:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      details: error.details,
    });
    throw error;
  }
}
