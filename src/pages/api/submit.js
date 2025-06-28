import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { upsertCandidate, upsertResponse } from "../../../utils/dbUtils";
import fetch from "node-fetch";
import formidable from "formidable";

const UAParser = require("ua-parser-js");

export const config = {
  api: {
    bodyParser: false, // Disable bodyParser to handle FormData
  },
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

// Utility to convert buffer to base64
function bufferToBase64(buffer) {
  return buffer.toString("base64");
}

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

  // Initialize Supabase client
  const supabaseServer = createSupabaseServerClient(req, res);

  try {
    // Parse FormData with formidable
    const form = formidable({ multiples: true });
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    // Extract fields
    const data = JSON.parse(fields.data?.[0] || "{}");
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
      phoneNumber,
      countryOfResidence,
      languagesSpoken,
      opening,
      opening_id,
      job_type: rawJobType,
      answers,
    } = data;

    // Normalize job_type
    const job_type =
      rawJobType === "agencies"
        ? "agency"
        : rawJobType === "freelancers"
        ? "freelancer"
        : rawJobType;

    // Validate job_type
    console.log("Received job_type:", job_type);
    if (!job_type || !["agency", "freelancer"].includes(job_type)) {
      return res.status(400).json({
        error: "Valid job_type ('agency' or 'freelancer') is required",
      });
    }

    // Extract files
    const companyRegistration = files.companyRegistration?.[0];
    const portfolioWork = files.portfolioWork?.[0];
    const agencyProfile = files.agencyProfile?.[0];
    const taxRegistration = files.taxRegistration?.[0];

    let country = req.headers["cf-ipcountry"] || "Unknown";
    const userAgent = req.headers["user-agent"] || "Unknown";
    let device = "Unknown";

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

    let selectedTier = "Not specified";
    if (job_type === "agency") {
      try {
        let tierQuestion = questions.find((q) =>
          q?.text?.toLowerCase().includes("tier")
        );
        if (!tierQuestion) {
          tierQuestion = questions.find((q) =>
            q?.options?.some((opt) => opt?.toLowerCase().includes("tier"))
          );
        }
        if (tierQuestion && tierQuestion.id) {
          const answer = answers[tierQuestion.id - 1];
          if (Array.isArray(answer) && answer.length > 0) {
            selectedTier = answer[0].replace(/ - Requirement:.*$/, "").trim();
          } else if (typeof answer === "string" && answer.trim()) {
            selectedTier = answer.replace(/ - Requirement:.*$/, "").trim();
          }
          console.log(
            `Tier question found: QID=${tierQuestion.id}, Text="${tierQuestion.text}", Normalized Answer=`,
            selectedTier
          );
        } else {
          console.log("No tier question found in questions array");
        }
      } catch (error) {
        console.error("Failed to extract selected tier:", error.message);
      }
    }

    // Convert files to base64 for agency uploads
    let companyRegistrationBase64 = null;
    let portfolioWorkBase64 = null;
    let agencyProfileBase64 = null;
    let taxRegistrationBase64 = null;
    let companyRegistrationMimeType = null;
    let portfolioWorkMimeType = null;
    let agencyProfileMimeType = null;
    let taxRegistrationMimeType = null;

    if (job_type === "agency") {
      const validMimeTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/octet-stream",
      ];

      // Validate and convert companyRegistration
      if (companyRegistration) {
        const buffer = require("fs").readFileSync(companyRegistration.filepath);
        console.log("companyRegistration:", {
          type: companyRegistration.mimetype,
          name: companyRegistration.originalFilename,
          size: companyRegistration.size,
          rawDataLength: buffer.length,
        });
        if (
          !companyRegistration.originalFilename ||
          !validMimeTypes.includes(companyRegistration.mimetype)
        ) {
          return res.status(400).json({
            error:
              "Invalid companyRegistration file format. Must be PDF or DOCX",
          });
        }
        companyRegistrationBase64 = bufferToBase64(buffer);
        if (!isValidBase64(companyRegistrationBase64)) {
          console.error("Invalid base64 for companyRegistration");
          return res.status(400).json({
            error: "Invalid base64 encoding for companyRegistration",
          });
        }
        companyRegistrationMimeType = companyRegistration.mimetype;
      }

      // Validate and convert portfolioWork
      if (portfolioWork) {
        const buffer = require("fs").readFileSync(portfolioWork.filepath);
        console.log("portfolioWork:", {
          type: portfolioWork.mimetype,
          name: portfolioWork.originalFilename,
          size: portfolioWork.size,
          rawDataLength: buffer.length,
        });
        if (
          !portfolioWork.originalFilename ||
          !validMimeTypes.includes(portfolioWork.mimetype)
        ) {
          return res.status(400).json({
            error: "Invalid portfolioWork file format. Must be PDF or DOCX",
          });
        }
        portfolioWorkBase64 = bufferToBase64(buffer);
        if (!isValidBase64(portfolioWorkBase64)) {
          console.error("Invalid base64 for portfolioWork");
          return res.status(400).json({
            error: "Invalid base64 encoding for portfolioWork",
          });
        }
        portfolioWorkMimeType = portfolioWork.mimetype;
      }

      // Validate and convert agencyProfile
      if (agencyProfile) {
        const buffer = require("fs").readFileSync(agencyProfile.filepath);
        console.log("agencyProfile:", {
          type: agencyProfile.mimetype,
          name: agencyProfile.originalFilename,
          size: agencyProfile.size,
          rawDataLength: buffer.length,
        });
        if (
          !agencyProfile.originalFilename ||
          !validMimeTypes.includes(agencyProfile.mimetype)
        ) {
          return res.status(400).json({
            error: "Invalid agencyProfile file format. Must be PDF or DOCX",
          });
        }
        agencyProfileBase64 = bufferToBase64(buffer);
        if (!isValidBase64(agencyProfileBase64)) {
          console.error("Invalid base64 for agencyProfile");
          return res.status(400).json({
            error: "Invalid base64 encoding for agencyProfile",
          });
        }
        agencyProfileMimeType = agencyProfile.mimetype;
      }

      // Validate and convert taxRegistration
      if (taxRegistration) {
        const buffer = require("fs").readFileSync(taxRegistration.filepath);
        console.log("taxRegistration:", {
          type: taxRegistration.mimetype,
          name: taxRegistration.originalFilename,
          size: taxRegistration.size,
          rawDataLength: buffer.length,
        });
        if (
          !taxRegistration.originalFilename ||
          !validMimeTypes.includes(taxRegistration.mimetype)
        ) {
          return res.status(400).json({
            error: "Invalid taxRegistration file format. Must be PDF or DOCX",
          });
        }
        taxRegistrationBase64 = bufferToBase64(buffer);
        if (!isValidBase64(taxRegistrationBase64)) {
          console.error("Invalid base64 for taxRegistration");
          return res.status(400).json({
            error: "Invalid base64 encoding for taxRegistration",
          });
        }
        taxRegistrationMimeType = taxRegistration.mimetype;
      }
    }

    console.log("Received data:", {
      agencyName: agencyName || "N/A",
      yearEstablished: yearEstablished || "N/A",
      headquartersLocation: headquartersLocation || countryOfResidence || "N/A",
      registeredOfficeAddress: registeredOfficeAddress || "N/A",
      websiteUrl: websiteUrl || "N/A",
      primaryContactName: primaryContactName || "N/A",
      primaryContactRole: primaryContactRole || "N/A",
      primaryContactEmail: primaryContactEmail || "N/A",
      primaryContactPhone: primaryContactPhone || phoneNumber || "N/A",
      primaryContactLinkedin: primaryContactLinkedin || "N/A",
      opening: opening || "N/A",
      job_type,
      opening_id,
      answers: answers || "N/A",
      selectedTier: job_type === "agency" ? selectedTier : "N/A",
      companyRegistration: companyRegistrationBase64
        ? `base64 (${companyRegistrationBase64.length} chars)`
        : "none",
      portfolioWork: portfolioWorkBase64
        ? `base64 (${portfolioWorkBase64.length} chars)`
        : "none",
      agencyProfile: agencyProfileBase64
        ? `base64 (${agencyProfileBase64.length} chars)`
        : "none",
      taxRegistration: taxRegistrationBase64
        ? `base64 (${taxRegistrationBase64.length} chars)`
        : "none",
      countryOfResidence: countryOfResidence || "N/A",
      phoneNumber: phoneNumber || "N/A",
      languagesSpoken: languagesSpoken || "N/A",
      country,
      device,
      submittedAt,
      referenceNumber,
    });

    if (job_type === "agency") {
      if (!opening_id || opening_id.trim() === "") {
        return res.status(400).json({
          error: "A valid opening_id is required for agency submissions",
        });
      }
      // Document validation checks - COMMENTED OUT since we're no longer uploading documents
      // if (
      //   !agencyName ||
      //   !yearEstablished ||
      //   !headquartersLocation ||
      //   !websiteUrl ||
      //   !opening ||
      //   !primaryContactName ||
      //   !primaryContactEmail ||
      //   !companyRegistrationBase64 ||
      //   !agencyProfileBase64 ||
      //   (!portfolioWorkBase64 && (!data.portfolioLinks || data.portfolioLinks.length === 0))
      // ) {
      //   return res.status(400).json({
      //     error:
      //       "All fields (agencyName, yearEstablished, headquartersLocation, websiteUrl, opening, primaryContactName, primaryContactEmail, companyRegistration, agencyProfile, and either portfolioWork file or portfolioLinks) are required for agency submissions",
      //   });
      // }
      
      // Only validate non-document fields
      if (
        !agencyName ||
        !yearEstablished ||
        !headquartersLocation ||
        !websiteUrl ||
        !opening ||
        !primaryContactName ||
        !primaryContactEmail
      ) {
        return res.status(400).json({
          error:
            "All fields (agencyName, yearEstablished, headquartersLocation, websiteUrl, opening, primaryContactName, primaryContactEmail) are required for agency submissions",
        });
      }
    } else if (job_type === "freelancer") {
      if (!opening_id || opening_id.trim() === "") {
        return res.status(400).json({
          error: "A valid opening_id is required for freelancer submissions",
        });
      }
      if (
        !primaryContactName ||
        !primaryContactEmail ||
        !countryOfResidence ||
        !phoneNumber ||
        !languagesSpoken ||
        !opening ||
        !answers
      ) {
        return res.status(400).json({
          error:
            "All fields (primaryContactName, primaryContactEmail, countryOfResidence, phoneNumber, languagesSpoken, opening, answers) are required for freelancer submissions",
        });
      }
    }

    const candidateData = {
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
      phoneNumber,
      job_type,
      reference_number: referenceNumber,
      opening_id,
      selected_tier: selectedTier,
      languagesSpoken,
      phoneNumber,
      countryOfResidence,
      req,
      res,
    };

    const candidateLog = { ...candidateData };
    delete candidateLog.req;
    delete candidateLog.res;
    console.log("Sending to upsertCandidate:", candidateLog);

    const { userId, error: candidateError } = await upsertCandidate(
      candidateData
    );

    if (candidateError) {
      console.error("upsertCandidate error:", candidateError);
      return res.status(candidateError.status || 500).json({
        error: candidateError.message,
        details: candidateError.details,
      });
    }

    const responseData = {
      userId,
      answers,
      country,
      device,
      submittedAt,
      status: "Pending",
      job_type,
      req,
      res,
    };

    if (job_type === "agency") {
      Object.assign(responseData, {
        company_registration_url: null,
        portfolio_work_url: null,
        agency_profile_url: null,
        company_registration_file_id: null,
        portfolio_work_file_id: null,
        agency_profile_file_id: null,
        portfolio_links: data.portfolioLinks || []
      });
    }

    const { error: responseError } = await upsertResponse(responseData);

    if (responseError) {
      console.error("upsertResponse error:", responseError);
      return res
        .status(responseError.status || 500)
        .json({ error: responseError.message, details: responseError.details });
    }

    const isLocal = process.env.NODE_ENV === "development";
    const baseUrl = isLocal
      ? process.env.BASE_URL || "http://localhost:3000"
      : process.env.PRODUCTION_URL || "https://membership.paan.africa";
    const processUrl = `${baseUrl}/api/process-submission`;
    console.log("Triggering background process at URL:", processUrl);

    const backgroundPayload = {
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
      phoneNumber,
      countryOfResidence,
      languagesSpoken,
      opening: candidateData.opening,
      opening_id: candidateData.opening_id,
      job_type,
      answers,
      companyRegistration: companyRegistrationBase64,
      portfolioWork: portfolioWorkBase64,
      agencyProfile: agencyProfileBase64,
      portfolioLinks: data.portfolioLinks || [],
      companyRegistrationMimeType,
      portfolioWorkMimeType,
      agencyProfileMimeType,
      country,
      device,
      submittedAt,
      referenceNumber,
    };

    fetch(processUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backgroundPayload),
      keepalive: true,
    }).catch(async (error) => {
      console.error("Background process failed:", error.message);
      await supabaseServer.from("submission_errors").insert([
        {
          user_id: userId,
          error_message: "Background process failed",
          error_details: { message: error.message, stack: error.stack },
        },
      ]);
    });

    return res.status(200).json({
      status: "success",
      message: "Submission received, processing in background",
      agencyName: job_type === "freelancer" ? primaryContactName : agencyName,
      referenceNumber,
      reference_number: referenceNumber,
    });
  } catch (error) {
    console.error("Submission error:", error.message);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
