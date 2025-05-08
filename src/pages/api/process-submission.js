import { supabaseServer } from "@/lib/supabaseServer";
import { uploadFileToDrive } from "../../../utils/driveUtils";
import { sendEmails } from "../../../utils/emailUtils";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
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
    } = req.body;
    console.log("Processing submission for:", {
      agencyName,
      primaryContactName,
      primaryContactEmail,
      opening,
      referenceNumber,
    });

    const { data: existingResponse, error: fetchError } = await supabaseServer
      .from("responses")
      .select(
        "company_registration_file_id, portfolio_work_file_id, agency_profile_file_id, tax_registration_file_id"
      )
      .eq("user_id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Fetch existing response error:", fetchError);
      throw new Error("Failed to fetch existing response");
    }

    const oldCompanyRegistrationFileId =
      existingResponse?.company_registration_file_id;
    const oldPortfolioWorkFileId = existingResponse?.portfolio_work_file_id;
    const oldAgencyProfileFileId = existingResponse?.agency_profile_file_id;
    const oldTaxRegistrationFileId = existingResponse?.tax_registration_file_id;

    // Parallel file uploads
    const uploadPromises = [
      companyRegistration
        ? uploadFileToDrive(
            primaryContactName,
            opening,
            companyRegistration,
            "company-registration",
            oldCompanyRegistrationFileId
          )
        : Promise.resolve({ url: null, fileId: null }),
      portfolioWork
        ? uploadFileToDrive(
            primaryContactName,
            opening,
            portfolioWork,
            "portfolio-work",
            oldPortfolioWorkFileId
          )
        : Promise.resolve({ url: null, fileId: null }),
      agencyProfile
        ? uploadFileToDrive(
            primaryContactName,
            opening,
            agencyProfile,
            "agency-profile",
            oldAgencyProfileFileId
          )
        : Promise.resolve({ url: null, fileId: null }),
      taxRegistration
        ? uploadFileToDrive(
            primaryContactName,
            opening,
            taxRegistration,
            "tax-registration",
            oldTaxRegistrationFileId
          )
        : Promise.resolve({ url: null, fileId: null }),
    ];

    const [
      companyRegistrationResult,
      portfolioWorkResult,
      agencyProfileResult,
      taxRegistrationResult,
    ] = await Promise.all(uploadPromises);

    const { error: updateError } = await supabaseServer
      .from("responses")
      .update({
        company_registration_url: companyRegistrationResult.url,
        portfolio_work_url: portfolioWorkResult.url,
        agency_profile_url: agencyProfileResult.url,
        tax_registration_url: taxRegistrationResult.url,
        company_registration_file_id: companyRegistrationResult.fileId,
        portfolio_work_file_id: portfolioWorkResult.fileId,
        agency_profile_file_id: agencyProfileResult.fileId,
        tax_registration_file_id: taxRegistrationResult.fileId,
        country,
        device,
        submitted_at: submittedAt,
        status: "completed",
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Update response error:", updateError);
      await supabaseServer.from("submission_errors").insert([
        {
          user_id: userId,
          error_message: "Failed to update response with Drive URLs",
          error_details: { message: updateError.message },
        },
      ]);
      throw new Error("Failed to update response with Drive URLs");
    }

    const { data: templates, error: templateError } = await supabaseServer
      .from("email_templates")
      .select("name, subject, body")
      .in("name", ["candidateEmail", "adminEmail"]);

    if (templateError) {
      await supabaseServer.from("submission_errors").insert([
        {
          user_id: userId,
          error_message: "Failed to fetch email templates",
          error_details: { message: templateError.message },
        },
      ]);
      throw templateError;
    }

    const candidateTemplate =
      templates.find((t) => t.name === "candidateEmail")?.body || "";
    const adminTemplate =
      templates.find((t) => t.name === "adminEmail")?.body || "";
    const candidateSubject =
      templates.find((t) => t.name === "candidateEmail")?.subject ||
      "Application Received";
    const adminSubject =
      templates.find((t) => t.name === "adminEmail")?.subject ||
      `New Application Submission from ${primaryContactName} - ${opening} - Agency ${agencyName} - ${new Date(
        submittedAt
      ).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`;

    await sendEmails({
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
      companyRegistrationUrl: companyRegistrationResult.url,
      portfolioWorkUrl: portfolioWorkResult.url,
      agencyProfileUrl: agencyProfileResult.url,
      taxRegistrationUrl: taxRegistrationResult.url,
      answers,
      candidateTemplate,
      adminTemplate,
      candidateSubject,
      adminSubject,
      questions,
      submittedAt,
      referenceNumber,
    });

    return res.status(200).json({ message: "Background processing completed" });
  } catch (error) {
    console.error("Background processing error:", error.message);
    await supabaseServer.from("submission_errors").insert([
      {
        user_id: req.body.userId,
        error_message: "Background processing failed",
        error_details: { message: error.message, stack: error.stack },
      },
    ]);
    await supabaseServer
      .from("responses")
      .update({ status: "failed" })
      .eq("user_id", req.body.userId);
    return res
      .status(500)
      .json({ error: "Background processing failed", details: error.message });
  }
}
