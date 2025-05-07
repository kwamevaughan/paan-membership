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

  // Use the provided subject, fallback to a default if not supplied
  const emailSubject = subject || "Application Status Update";

  // Use the provided template (body) as-is, assuming it’s fully edited
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
  primaryContactName,
  primaryContactEmail,
  primaryContactPhone,
  primaryContactLinkedin,
  agencyName,
  opening,
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

  // Format submission date (e.g., "7th May 2025")
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

  const formattedAnswers = answers.map((answer, idx) => {
    const question = questions[idx]?.text || `Question ${idx + 1}`;
    const answerText = Array.isArray(answer) ? answer.join(", ") : answer;
    return { question, answer: answerText };
  });

  const candidateHtml = candidateTemplate
    .replace("{{fullName}}", primaryContactName)
    .replace("{{agencyName}}", agencyName)
    .replace("[Reference Number]", referenceNumber || "PAAN-UNKNOWN")
    .replace("[Submission Date]", formatDate(submittedAt))
    .replace("[Selected Tier]", "[Selected Tier]"); // Placeholder for now

  await transporter.sendMail({
    from: `"Pan-African Agency Network (PAAN)" <${process.env.EMAIL_USER}>`,
    to: primaryContactEmail,
    subject: candidateSubject,
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
        ? `<a href="${companyRegistrationUrl}" style="color: #f05d23;">Download</a>`
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
