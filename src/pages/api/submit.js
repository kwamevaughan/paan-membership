import { supabaseServer } from "@/lib/supabaseServer";
import { upsertCandidate, upsertResponse } from "../../../utils/dbUtils";
import fetch from "node-fetch";

// Static CommonJS require for ua-parser-js
const UAParser = require("ua-parser-js");

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};

// Generate a unique reference number (e.g., PAAN-X7B9P2)
function generateReferenceNumber() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `PAAN-${code}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      agencyName,
      yearEstablished,
      headquartersLocation,
      registeredOfficeAddress,
      websiteUrl,
      primaryContactName,
      primaryContactRole,
      primaryContactEmail,
      primaryContactPhone,
      primaryContactLinkedin,
      opening,
      answers,
      companyRegistration,
      portfolioWork,
      agencyProfile,
      taxRegistration,
    } = req.body;

    let country = req.headers["cf-ipcountry"] || "Unknown";
    const userAgent = req.headers["user-agent"] || "Unknown";
    let device = "Unknown";

    console.log("Raw User-Agent Header:", userAgent);

    try {
      const parser = new UAParser(userAgent);
      const result = parser.getResult();
      const deviceType = result.device.type;
      const deviceModel = result.device.model || result.os.name || "Unknown";
      if (deviceType) {
        device = `${
          deviceType.charAt(0).toUpperCase() + deviceType.slice(1)
        } (${deviceModel})`;
      } else {
        device = deviceModel;
      }
      console.log("Parsed Device Result:", result, "Device:", device);
    } catch (uaError) {
      console.error("Error parsing user agent:", uaError.message);
      device = "Unknown";
    }

    if (userAgent === "Unknown") {
      console.warn("No User-Agent header provided by client");
    }

    if (country === "Unknown") {
      try {
        const ip =
          req.headers["x-forwarded-for"] ||
          req.socket.remoteAddress ||
          "Unknown";
        console.log("Fetching country for IP:", ip);
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
        const geoData = await geoResponse.json();
        if (geoData.status === "success") {
          country = geoData.country || "Unknown";
        } else {
          console.warn("IP geolocation failed:", geoData.message);
        }
      } catch (geoError) {
        console.error("Error fetching country from IP:", geoError.message);
        country = "Unknown";
      }
    }

    const submittedAt = new Date().toISOString();
    const referenceNumber = generateReferenceNumber();

    // Match opening to job_openings.title to get opening_id
    let opening_id = null;
    if (opening) {
      const { data: jobOpening, error: jobError } = await supabaseServer
        .from("job_openings")
        .select("id")
        .eq("title", opening)
        .single();
      if (jobError && jobError.code !== "PGRST116") {
        console.error("Error fetching job opening:", jobError);
      } else if (jobOpening) {
        opening_id = jobOpening.id;
      } else {
        console.warn(`No job opening found for title: ${opening}`);
      }
    }

    console.log("Received data:", {
      agencyName,
      yearEstablished,
      headquartersLocation,
      registeredOfficeAddress,
      websiteUrl,
      primaryContactName,
      primaryContactRole,
      primaryContactEmail,
      primaryContactPhone,
      primaryContactLinkedin,
      opening,
      opening_id,
      answers,
      companyRegistration: companyRegistration ? "present" : "none",
      portfolioWork: portfolioWork ? "present" : "none",
      agencyProfile: agencyProfile ? "present" : "none",
      taxRegistration: taxRegistration ? "present" : "none",
      country,
      device,
      submittedAt,
      referenceNumber,
    });

    if (
      !agencyName ||
      !yearEstablished ||
      !headquartersLocation ||
      !websiteUrl ||
      !opening
    ) {
      return res.status(400).json({
        error:
          "All fields (agencyName, yearEstablished, headquartersLocation, websiteUrl, and opening) are required",
      });
    }

    const { data: questions, error: questionsError } = await supabaseServer
      .from("interview_questions")
      .select("*")
      .order("order", { ascending: true });
    if (questionsError) {
      console.error("Error fetching questions:", questionsError);
      return res.status(500).json({
        error: "Error fetching questions",
        details: questionsError.message,
      });
    }

    const { userId, error: candidateError } = await upsertCandidate({
      agencyName,
      yearEstablished,
      headquartersLocation,
      registeredOfficeAddress,
      websiteUrl,
      primaryContactName,
      primaryContactRole,
      primaryContactEmail,
      primaryContactPhone,
      primaryContactLinkedin,
      opening,
      reference_number: referenceNumber,
      opening_id,
    });

    if (candidateError) {
      return res.status(candidateError.status).json({
        error: candidateError.message,
        details: candidateError.details,
      });
    }

    const { error: responseError } = await upsertResponse({
      userId,
      answers,
      companyRegistrationUrl: null,
      portfolioWorkUrl: null,
      agencyProfileUrl: null,
      taxRegistrationUrl: null,
      companyRegistrationFileId: null,
      portfolioWorkFileId: null,
      agencyProfileFileId: null,
      taxRegistrationFileId: null,
      country,
      device,
      submittedAt,
    });

    if (responseError) {
      return res
        .status(responseError.status)
        .json({ error: responseError.message, details: responseError.details });
    }

    const isLocal = process.env.NODE_ENV === "development";
    const baseUrl = isLocal
      ? process.env.BASE_URL || "http://localhost:3001"
      : process.env.PRODUCTION_URL || "https://membership.paan.africa";
    const processUrl = `${baseUrl}/api/process-submission`;
    console.log("Triggering background process at URL:", processUrl, {
      headers: { "Content-Type": "application/json" },
    });

    let backgroundError = null;
    try {
      const response = await fetch(processUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          agencyName,
          yearEstablished,
          headquartersLocation,
          registeredOfficeAddress,
          websiteUrl,
          primaryContactName,
          primaryContactRole,
          primaryContactEmail,
          primaryContactPhone,
          primaryContactLinkedin,
          opening,
          opening_id,
          answers,
          companyRegistration,
          portfolioWork,
          agencyProfile,
          taxRegistration,
          questions,
          country,
          device,
          submittedAt,
          referenceNumber,
        }),
        keepalive: true,
      });

      console.log("Background process response status:", response.status);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Background process failed with status ${response.status}: ${text}`
        );
      }
    } catch (error) {
      console.error("Background processing request failed:", error.message);
      backgroundError = error.message;
    }

    return res.status(200).json({
      message: "Submission successful, processing in background",
      agencyName,
      backgroundProcessing:
        backgroundError || "Background process triggered successfully",
    });
  } catch (error) {
    console.error("Submission error:", error.message);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
