import nodemailer from "nodemailer";

export async function sendStatusEmail({
  primaryContactName,
  primaryContactEmail,
  opening,
  status,
  subject,
  template,
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const emailSubject = subject || "Application Status Update";
  const html = template;

  await transporter.sendMail({
    from: `"PAAN" <${process.env.EMAIL_USER}>`,
    to: primaryContactEmail,
    subject: emailSubject,
    html,
  });

  console.log(
    `Status email (${status}) sent to ${primaryContactEmail} with subject: ${emailSubject}`
  );
}

export async function sendEmails({
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
  companyRegistrationUrl,
  portfolioWorkUrl,
  agencyProfileUrl,
  taxRegistrationUrl,
  answers,
  candidateTemplate,
  adminTemplate,
  candidateSubject,
  adminSubject,
  questions,
  submittedAt,
  referenceNumber,
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const formatDate = (isoString) => {
    const date = new Date(isoString);
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

  // Parse answers
  let parsedAnswers;
  try {
    parsedAnswers = typeof answers === "string" ? JSON.parse(answers) : answers;
  } catch (error) {
    console.error("Failed to parse answers:", error.message);
    parsedAnswers = [];
  }

  // Find the membership tier question
  let selectedTier = "Not specified";
  try {
    // Primary: Look for question with "tier" in text
    let tierQuestion = questions.find((q) =>
      q?.text?.toLowerCase().includes("tier")
    );

    // Fallback: Look for question with tier-related options
    if (!tierQuestion) {
      tierQuestion = questions.find((q) =>
        q?.options?.some((opt) => opt?.toLowerCase().includes("tier"))
      );
    }

    if (tierQuestion && tierQuestion.id) {
      const answer = parsedAnswers[tierQuestion.id - 1];
      if (Array.isArray(answer) && answer.length > 0) {
        // Extract the first answer and clean it
        selectedTier =
          answer[0].replace(/ - Requirement:.*$/, "").trim() || "Not specified";
      } else if (typeof answer === "string" && answer.trim()) {
        selectedTier =
          answer.replace(/ - Requirement:.*$/, "").trim() || "Not specified";
      } else {
        console.log(
          `No answer provided for tier question (QID=${tierQuestion.id})`
        );
      }
      // Temporary debug log
      console.log(
        `Tier question found: QID=${tierQuestion.id}, Text="${tierQuestion.text}", Answer=`,
        answer
      );
    } else {
      console.log("No tier question found in questions array");
    }
  } catch (error) {
    console.error("Failed to extract selected tier:", error.message);
  }

  const formattedAnswers = parsedAnswers.map((answer, idx) => {
    const question = questions[idx]?.text || `Question ${idx + 1}`;
    const answerText = Array.isArray(answer) ? answer.join(", ") : answer;
    return { question, answer: answerText };
  });

  // Replace placeholders in candidate subject
  const processedCandidateSubject = candidateSubject
    .replace(/{{fullName}}/g, primaryContactName || "Applicant")
    .replace(/{{agencyName}}/g, agencyName || "Agency");

  // Replace placeholders in candidate HTML
  const candidateHtml = candidateTemplate
    .replace(/{{fullName}}/g, primaryContactName || "Applicant")
    .replace(/{{agencyName}}/g, agencyName || "Agency")
    .replace(/\[Reference Number\]/g, referenceNumber || "PAAN-UNKNOWN")
    .replace(/\[Submission Date\]/g, formatDate(submittedAt))
    .replace(/\[Selected Tier\]/g, selectedTier);

  await transporter.sendMail({
    from: `"Pan-African Agency Network (PAAN)" <${process.env.EMAIL_USER}>`,
    to: primaryContactEmail,
    subject: processedCandidateSubject,
    html: candidateHtml,
  });

  const adminHtml = adminTemplate
    .replace("{{fullName}}", primaryContactName)
    .replace("{{email}}", primaryContactEmail)
    .replace("{{phone}}", primaryContactPhone || "N/A")
    .replace(
      "{{linkedin}}",
      primaryContactLinkedin
        ? `<a href="${primaryContactLinkedin}" style="color: #f05d23;">${primaryContactLinkedin}</a>`
        : "N/A"
    )
    .replace("{{opening}}", opening)
    .replace(
      "{{companyRegistrationUrl}}",
      companyRegistrationUrl
        ? `<a href="${companyRegistrationUrl}" style="color: #f05d23;">Download</a>`
        : "Not provided"
    )
    .replace(
      "{{portfolioWorkUrl}}",
      portfolioWorkUrl
        ? `<a href="${portfolioWorkUrl}" style="color: #f05d23;">Download</a>`
        : "Not provided"
    )
    .replace(
      "{{agencyProfileUrl}}",
      agencyProfileUrl
        ? `<a href="${agencyProfileUrl}" style="color: #f05d23;">Download</a>`
        : "Not provided"
    )
    .replace(
      "{{taxRegistrationUrl}}",
      taxRegistrationUrl
        ? `<a href="${taxRegistrationUrl}" style="color: #f05d23;">Download</a>`
        : "Not provided"
    )
    .replace(
      "{{answersTable}}",
      formattedAnswers
        .map(
          (qa, index) => `
            <tr style="background-color: ${
              index % 2 === 0 ? "#f9f9f9" : "#fff"
            };">
                <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #ddd;">${
                  qa.question
                }</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${
                  qa.answer
                }</td>
            </tr>
          `
        )
        .join("")
    );

  await transporter.sendMail({
    from: `"PAAN" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject:
      adminSubject ||
      `New Application Submission from ${primaryContactName} - ${opening} - Agency ${agencyName} - ${formatDate(
        submittedAt
      )}`,
    html: adminHtml,
  });

  console.log("Emails sent successfully");
}
