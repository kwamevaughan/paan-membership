import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { uploadFileToDrive } from "../../../utils/driveUtils";
import { sendEmails } from "../../../utils/emailUtils";
import { upsertCandidate, upsertResponse } from "../../../utils/dbUtils";
import { format } from "date-fns";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};

function replaceTemplateTags(template, data) {
  return template.replace(/{{(\w+)}}/g, (match, key) => {
    if (key === "answersTable") return match;
    return data[key] !== undefined && data[key] !== null ? data[key] : match;
  });
}

function formatAnswer(answer, question) {
  if (!answer || answer === "[]") {
    console.log(
      `No valid answer provided for question ${question.id}: ${question.text}`
    );
    return "None provided";
  }
  try {
    const parsed = typeof answer === "string" ? JSON.parse(answer) : answer;
    if (Array.isArray(parsed) && parsed.length > 0) {
      if (question.is_open_ended && question.structured_answers?.fields) {
        const formatted = parsed
          .map((item) => {
            const details = JSON.parse(item.customText || "{}");
            const formattedFields = question.structured_answers.fields
              .map((field) => {
                const fieldName = field.name.toLowerCase();
                const value = details[fieldName] || "N/A";
                return `${field.name}: ${value}`;
              })
              .join(", ");
            return `- ${formattedFields}`;
          })
          .filter((text) => text !== "- ")
          .join("\n");
        return formatted;
      }
      if (question.is_open_ended && !question.structured_answers) {
        const formatted =
          parsed
            .map((item) => {
              const text = item.text || item.customText || "N/A";
              const link = item.link ? ` (Link: ${item.link})` : "";
              return text + link;
            })
            .filter((text) => text !== "N/A")
            .join("\n") || "None provided";
        return formatted;
      }
      const formatted = parsed
        .map((item) =>
          typeof item === "string"
            ? item
            : item.option || item.customText || "N/A"
        )
        .filter((text) => text !== "N/A")
        .join(", ");
      return formatted;
    }
    const result = parsed.toString();
    return result;
  } catch (e) {
    console.error(
      `Error formatting answer for Q${question.id}:`,
      e.message,
      answer
    );
    return answer.toString();
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Initialize Supabase client
  const supabaseServer = createSupabaseServerClient(req, res);

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
      phoneNumber,
      countryOfResidence,
      languagesSpoken,
      opening,
      opening_id,
      job_type,
      answers,
      companyRegistration,
      portfolioWork,
      agencyProfile,
      portfolioLinks,
      companyRegistrationMimeType,
      portfolioWorkMimeType,
      agencyProfileMimeType,
      country,
      device,
      submittedAt,
      referenceNumber,
    } = req.body;

    // Remove or comment out unnecessary logs
    // console.log("Processing submission for:", {
    //   primaryContactName,
    //   primaryContactEmail,
    //   opening,
    //   job_type,
    //   referenceNumber,
    // });

    if (!job_type || !["agency", "freelancer"].includes(job_type)) {
      throw new Error("Valid job_type ('agency' or 'freelancer') is required");
    }

    // console.log("Received submittedAt:", submittedAt);
    // console.log("File inputs:", {
    //   companyRegistration: companyRegistration
    //     ? `base64 (${companyRegistration.length} chars)`
    //     : "null",
    //   portfolioWork: portfolioWork
    //     ? `base64 (${portfolioWork.length} chars)`
    //     : "null",
    //   agencyProfile: agencyProfile
    //     ? `base64 (${agencyProfile.length} chars)`
    //     : "null",
    //   portfolioLinks: portfolioLinks ? JSON.stringify(portfolioLinks) : "null"
    // });

    let companyRegistrationResult = { url: null, fileId: null };
    let portfolioWorkResult = { url: null, fileId: null };
    let agencyProfileResult = { url: null, fileId: null };

    // File upload logic - COMMENTED OUT since we're no longer uploading documents
    // if (job_type === "agency") {
    //   const { data: existingResponse, error: fetchError } = await supabaseServer
    //     .from("responses")
    //     .select(
    //       "company_registration_file_id, portfolio_work_file_id, agency_profile_file_id"
    //     )
    //     .eq("user_id", userId)
    //     .single();

    //   if (fetchError && fetchError.code !== "PGRST116") {
    //     console.error("Fetch existing response error:", fetchError);
    //     throw new Error("Fetch existing response error");
    //   }

    //   const oldCompanyRegistrationFileId =
    //     existingResponse?.company_registration_file_id;
    //   const oldPortfolioWorkFileId = existingResponse?.portfolio_work_file_id;
    //   const oldAgencyProfileFileId = existingResponse?.agency_profile_file_id;

    //   const uploadPromises = [
    //     companyRegistration && typeof companyRegistration === "string"
    //       ? uploadFileToDrive(
    //           primaryContactName,
    //           opening,
    //           companyRegistration,
    //           "company-registration",
    //           oldCompanyRegistrationFileId,
    //           companyRegistrationMimeType || "application/pdf"
    //         )
    //       : Promise.resolve({ url: null, fileId: null }),
    //     portfolioWork && typeof portfolioWork === "string"
    //       ? uploadFileToDrive(
    //           primaryContactName,
    //           opening,
    //           portfolioWork,
    //           "portfolio-work",
    //           oldPortfolioWorkFileId,
    //           portfolioWorkMimeType || "application/pdf"
    //         )
    //       : Promise.resolve({ url: null, fileId: null }),
    //     agencyProfile && typeof agencyProfile === "string"
    //       ? uploadFileToDrive(
    //           primaryContactName,
    //           opening,
    //           agencyProfile,
    //           "agency-profile",
    //           oldAgencyProfileFileId,
    //           agencyProfileMimeType || "application/pdf"
    //         )
    //       : Promise.resolve({ url: null, fileId: null }),
    //   ];

    //   [
    //     companyRegistrationResult,
    //     portfolioWorkResult,
    //     agencyProfileResult,
    //   ] = await Promise.all(uploadPromises);
    // }

    // Use job_type directly
    const questionJobType = job_type;

    const { data: filteredQuestions, error: questionsError } =
      await supabaseServer
        .from("interview_questions")
        .select("id, text, is_open_ended, structured_answers, order")
        .eq("job_type", questionJobType)
        .order("order", { ascending: true });

    if (questionsError) {
      console.error("Error fetching questions:", questionsError);
      throw new Error("Failed to fetch questions");
    }

    if (!filteredQuestions || filteredQuestions.length === 0) {
      // console.log("No questions found for job_type: ${questionJobType}");
      throw new Error(`No questions found for job_type: ${questionJobType}`);
    }

    let extractedLinkedin = primaryContactLinkedin;
    if (job_type === "freelancer") {
      const linkedinQuestion = filteredQuestions.find(
        (q) =>
          q.text.toLowerCase().includes("linkedin") ||
          q.text.toLowerCase().includes("professional profile")
      );
      if (linkedinQuestion) {
        const linkedinAnswer = answers[linkedinQuestion.id - 1];
        extractedLinkedin =
          linkedinAnswer && linkedinAnswer !== "[]"
            ? formatAnswer(linkedinAnswer, linkedinQuestion)
            : null;
        // console.log(
        //   `Extracted LinkedIn for ${primaryContactName}:",
        //   extractedLinkedin
        // );
      } else {
        console.warn(
          `No LinkedIn/Professional Profile question found for job_type: ${questionJobType}`
        );
      }
    }

    const answersTable = filteredQuestions
      .map((q) => {
        const answer = answers[q.id - 1];
        const formattedAnswer = formatAnswer(answer, q);
        return {
          question: q.text,
          answer: formattedAnswer,
          id: q.id,
          is_open_ended: q.is_open_ended,
          structured_answers: q.structured_answers,
          order: q.order,
        };
      })
      .filter((qa) => qa.answer !== "None provided")
      .sort((a, b) => a.order - b.order);

    const normalizedTier =
      answersTable
        .find((qa) => qa.question.toLowerCase().includes("tier"))
        ?.answer.replace(/ - Requirement:.*$/, "") || null;

    const { error: candidateError } = await upsertCandidate({
      agencyName: job_type === "freelancer" ? primaryContactName : agencyName,
      yearEstablished: job_type === "freelancer" ? null : yearEstablished,
      headquartersLocation:
        job_type === "freelancer" ? countryOfResidence : headquartersLocation,
      registeredOfficeAddress:
        job_type === "freelancer" ? null : registeredOfficeAddress,
      websiteUrl: job_type === "freelancer" ? null : websiteUrl,
      primaryContactName,
      primaryContactRole: job_type === "freelancer" ? null : primaryContactRole,
      primaryContactEmail,
      primaryContactPhone:
        job_type === "freelancer" ? phoneNumber : primaryContactPhone,
      primaryContactLinkedin: extractedLinkedin,
      opening,
      opening_id,
      job_type,
      reference_number: referenceNumber,
      selected_tier: normalizedTier,
      languagesSpoken: job_type === "freelancer" ? languagesSpoken : null,
      phoneNumber,
      countryOfResidence,
      req,
      res,
    });

    if (candidateError) {
      // console.log("Update candidate error:", candidateError);
      await supabaseServer.from("submission_errors").insert([
        {
          user_id: userId,
          error_message: "Failed to update candidate",
          error_details: { message: candidateError.message },
        },
      ]);
      throw new Error("Failed to update candidate");
    }

    const { error: responseError } = await upsertResponse({
      userId,
      answers,
      company_registration_url: companyRegistrationResult.url,
      portfolio_work_url: portfolioWorkResult.url,
      agency_profile_url: agencyProfileResult.url,
      company_registration_file_id: companyRegistrationResult.fileId,
      portfolio_work_file_id: portfolioWorkResult.fileId,
      agency_profile_file_id: agencyProfileResult.fileId,
      portfolio_links: portfolioLinks || [],
      country,
      device,
      submitted_at: submittedAt || new Date().toISOString(),
      status: "pending",
      job_type,
      req,
      res,
    });

    if (responseError) {
      // console.log("Update response error:", responseError);
      await supabaseServer.from("submission_errors").insert([
        {
          user_id: userId,
          error_message: "Failed to update response",
          error_details: { message: responseError.message },
        },
      ]);
      throw new Error("Failed to update response");
    }

    const templateNames =
      job_type === "freelancer"
        ? ["freelancerCandidateEmail", "freelancerAdminEmail"]
        : ["agencyCandidateEmail", "agencyAdminEmail"];
    const { data: templates, error: templateError } = await supabaseServer
      .from("email_templates")
      .select("name, subject, body")
      .in("name", templateNames);

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
      templates.find((t) => t.name === templateNames[0])?.body || "";
    const adminTemplate =
      templates.find((t) => t.name === templateNames[1])?.body || "";
    const candidateSubject =
      templates.find((t) => t.name === templateNames[0])?.subject ||
      "Application Received";
    const adminSubject =
      templates.find((t) => t.name === templateNames[1])?.subject ||
      `New Application Submission from ${primaryContactName} - ${opening} - ${
        job_type === "freelancer" ? "Freelancer" : `Agency ${agencyName}`
      }`;

    const emailData = {
      primaryContactName,
      primaryContactEmail,
      phoneNumber:
        job_type === "freelancer" ? phoneNumber : primaryContactPhone,
      countryOfResidence:
        job_type === "freelancer" ? countryOfResidence : headquartersLocation,
      languagesSpoken: job_type === "freelancer" ? languagesSpoken : null,
      opening,
      opening_id,
      job_type,
      answers,
      questions: filteredQuestions,
      answersTable,
      submittedAt: submittedAt || new Date().toISOString(),
      submissionDate: format(
        new Date(submittedAt || new Date()),
        "d MMMM yyyy"
      ),
      referenceNumber,
      candidateTemplate,
      adminSubject,
      candidateSubject,
      adminTemplate,
    };

    if (job_type === "agency") {
      Object.assign(emailData, {
        agencyName,
        yearEstablished,
        headquartersLocation,
        registeredOfficeAddress,
        websiteUrl,
        primaryContactRole,
        primaryContactPhone,
        primaryContactLinkedin,
        companyRegistrationUrl: companyRegistrationResult.url,
        portfolioWorkUrl: portfolioWorkResult.url,
        agencyProfileUrl: agencyProfileResult.url,
      });
    }

    emailData.candidateTemplate = replaceTemplateTags(
      candidateTemplate,
      emailData
    );
    emailData.adminTemplate = adminTemplate;
    emailData.candidateSubject = replaceTemplateTags(
      candidateSubject,
      emailData
    );
    emailData.adminSubject = replaceTemplateTags(adminSubject, emailData);

    
    await sendEmails(emailData);

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
