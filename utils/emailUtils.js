import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import fetch from "node-fetch";

export async function sendStatusEmail({
  primaryContactName,
  primaryContactEmail,
  opening,
  status,
  subject,
  template,
}) {
  console.log('Starting sendStatusEmail with:', {
    primaryContactName,
    primaryContactEmail,
    opening,
    status,
    subject,
    templateLength: template?.length
  });

  if (!primaryContactEmail) {
    throw new Error("Primary contact email is required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(primaryContactEmail)) {
    throw new Error("Invalid email address");
  }
  
  

  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Missing email configuration. Please check environment variables.");
  }
  
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

  try {
    const info = await transporter.sendMail({
      from: `"Pan-African Agency Network (PAAN)" <${process.env.EMAIL_USER}>`,
      to: primaryContactEmail,
      subject: emailSubject,
      html,
    });

    console.log(
      `Status email (${status}) sent to ${primaryContactEmail} with subject: ${emailSubject}`,
      'Message ID:', info.messageId
    );
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
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
  job_type,
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
  answersTable,
  submittedAt,
  referenceNumber,
  phoneNumber,
  countryOfResidence,
  languagesSpoken,
}) {
  console.log(`[sendEmails] Starting email sending process for ${primaryContactName} (${primaryContactEmail}), job_type: ${job_type}`);
  // Validate environment variables
  if (!process.env.AGENCY_EMAIL) {
    throw new Error("AGENCY_EMAIL is not defined in environment variables");
  }
  if (!process.env.FREELANCER_EMAIL) {
    throw new Error("FREELANCER_EMAIL is not defined in environment variables");
  }
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Missing email configuration. Please check EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS environment variables.");
  }
  
  console.log(`[sendEmails] Email config validated. Host: ${process.env.EMAIL_HOST}, Port: ${process.env.EMAIL_PORT}, User: ${process.env.EMAIL_USER}`);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const formatDate = (date) => {
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

  let parsedAnswers;
  try {
    parsedAnswers = typeof answers === "string" ? JSON.parse(answers) : answers;
  } catch (error) {
    console.error("Failed to parse answers:", error.message);
    parsedAnswers = [];
  }

  const formattedAnswers = answersTable.map((qa) => ({
    question: qa.question,
    answer: qa.answer || "None provided",
    id: qa.id,
  }));

  let selectedTier = "Not specified";
  try {
    const tierQa = answersTable.find((qa) =>
      qa.question.toLowerCase().includes("tier")
    );
    if (tierQa) {
      selectedTier =
        tierQa.answer.replace(/ - Requirement:.*$/, "").trim() ||
        "Not specified";
    }
  } catch (error) {
    console.error("Failed to extract selected tier:", error.message);
  }

  let logoBuffer;
  try {
    const logoResponse = await fetch(
      "https://paan.africa/assets/images/logo.png"
    );
    const arrayBuffer = await logoResponse.arrayBuffer();
    logoBuffer = Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Failed to fetch PAAN logo:", error.message);
    logoBuffer = null;
  }

  const pdfBuffer = await new Promise((resolve) => {
    const doc = new PDFDocument({
      margin: 50,
      autoFirstPage: false,
    });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    doc.registerFont("Helvetica", "Helvetica");
    doc.registerFont("Helvetica-Bold", "Helvetica-Bold");

    doc.addPage();
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = doc.page.margins.top;

    doc.rect(0, 0, pageWidth, 80).fill("#e2e1e1");
    doc.fillColor("#000000");
    doc.font("Helvetica-Bold").fontSize(14);
    if (logoBuffer) {
      doc.image(logoBuffer, margin, 10, { width: 100 });
      doc.text("PAAN Application Responses", margin + 120, 20);
    } else {
      doc.text("PAAN Application Responses", margin, 20);
    }
    doc.font("Helvetica").fontSize(10);
    doc.text(`Opening: ${opening || "N/A"}`, margin + 120, 40);
    doc.text(`Job Type: ${job_type || "N/A"}`, margin + 120, 55);
    doc.text(`Candidate: ${primaryContactName || "N/A"}`, margin + 120, 70);
    doc.text(`Agency: ${agencyName || "N/A"}`, margin + 120, 85);

    doc.fillColor("#000000");
    doc.fontSize(12);
    doc.y = 120;

    formattedAnswers.forEach((qa, index) => {
      const questionText = `Q${index + 1}: ${qa.question}`;
      const answerText = qa.answer || "None provided";

      const questionHeight = doc.heightOfString(questionText, {
        width: pageWidth - 2 * margin,
      });
      const answerHeight = doc.heightOfString(answerText, {
        width: pageWidth - 2 * margin,
      });
      const totalHeight = questionHeight + answerHeight + 15;

      if (doc.y + totalHeight > pageHeight - margin - 50) {
        doc.addPage();
        doc.rect(0, 0, pageWidth, 80).fill("#e2e1e1");
        doc.fillColor("#000000");
        doc.font("Helvetica-Bold").fontSize(14);
        if (logoBuffer) {
          doc.image(logoBuffer, margin, 10, { width: 100 });
          doc.text("PAAN Application Responses", margin + 120, 20);
        } else {
          doc.text("PAAN Application Responses", margin, 20);
        }
        doc.font("Helvetica").fontSize(10);
        doc.text(`Opening: ${opening || "N/A"}`, margin + 120, 40);
        doc.text(`Job Type: ${job_type || "N/A"}`, margin + 120, 55);
        doc.text(`Candidate: ${primaryContactName || "N/A"}`, margin + 120, 70);
        doc.text(`Agency: ${agencyName || "N/A"}`, margin + 120, 85);
        doc.fillColor("#000000");
        doc.fontSize(12);
        doc.y = 120;
      }

      doc.font("Helvetica-Bold").text(questionText, margin, doc.y);
      doc.font("Helvetica").text(answerText, margin, doc.y + 5);
      doc.y += totalHeight;
    });

    const footerHeight = 50;
    doc.on("pageAdded", () => {
      doc
        .rect(0, pageHeight - footerHeight, pageWidth, footerHeight)
        .fill("#231812");
      doc.fillColor("#ffffff");
      doc.font("Helvetica").fontSize(10);
      doc.text(
        "Pan-African Agency Network | https://paan.africa",
        margin,
        pageHeight - footerHeight + 10
      );
      doc.text(
        "© 2025 Pan-African Agency Network. All rights reserved.",
        margin,
        pageHeight - footerHeight + 25
      );
    });

    doc.end();
  });

  const processedCandidateSubject = candidateSubject
    .replace(/{{fullName}}/g, primaryContactName || "Applicant")
    .replace(/{{agencyName}}/g, agencyName || "Agency")
    .replace(/{{job_type}}/g, job_type || "N/A");

  const candidateHtml = candidateTemplate
    .replace(/{{fullName}}/g, primaryContactName || "Applicant")
    .replace(/{{agencyName}}/g, agencyName || "Agency")
    .replace(/{{job_type}}/g, job_type || "N/A")
    .replace(/\[Reference Number\]/g, referenceNumber || "PAAN-UNKNOWN")
    .replace(/\[Submission Date\]/g, formatDate(new Date(submittedAt)))
    .replace(/\[Selected Tier\]/g, selectedTier);

  

  try {
    const candidateEmailResult = await transporter.sendMail({
      from: `"Pan-African Agency Network (PAAN)" <${process.env.EMAIL_USER}>`,
      to: primaryContactEmail,
      subject: processedCandidateSubject,
      html: candidateHtml,
    });
    console.log(`[sendEmails] Candidate email sent successfully to ${primaryContactEmail}. Message ID: ${candidateEmailResult.messageId}`);
  } catch (err) {
    console.error("[sendEmails] Error sending candidate email:", err);
    throw new Error(`Failed to send candidate email: ${err.message}`);
  }

  const processedAdminSubject = (
    adminSubject ||
    `New Application Submission from ${primaryContactName} - ${opening} - ${
      job_type || "N/A"
    } - Agency ${agencyName} - ${formatDate(new Date(submittedAt))}`
  )
    .replace(/{{primaryContactName}}/g, primaryContactName || "Applicant")
    .replace(/{{agencyName}}/g, agencyName || "Agency")
    .replace(/{{opening}}/g, opening || "N/A")
    .replace(/{{job_type}}/g, job_type || "N/A");

  const adminHtml = adminTemplate
    .replace(/{{primaryContactName}}/g, primaryContactName || "N/A")
    .replace(/{{agencyName}}/g, agencyName || "N/A")
    .replace(/{{primaryContactEmail}}/g, primaryContactEmail || "N/A")
    .replace(/{{primaryContactPhone}}/g, primaryContactPhone || "N/A")
    .replace(/{{phoneNumber}}/g, phoneNumber || "N/A")
    .replace(/{{countryOfResidence}}/g, countryOfResidence || "N/A")
    .replace(
      /{{languagesSpoken}}/g,
      Array.isArray(languagesSpoken)
        ? languagesSpoken.join(", ")
        : languagesSpoken || "N/A"
    )
    .replace(/{{job_type}}/g, job_type || "N/A")
    .replace(
      /{{primaryContactLinkedin}}/g,
      primaryContactLinkedin
        ? `<a href="${primaryContactLinkedin}" style="color: #f05d23;">${primaryContactLinkedin}</a>`
        : "N/A"
    )
    .replace(
      /{{websiteUrl}}/g,
      websiteUrl
        ? `<a href="${websiteUrl}" style="color: #f05d23;">${websiteUrl}</a>`
        : "N/A"
    )
    .replace(/{{yearEstablished}}/g, yearEstablished || "N/A")
    .replace(/{{headquartersLocation}}/g, headquartersLocation || "N/A")
    .replace(/{{opening}}/g, opening || "N/A")
    .replace(/\[Reference Number\]/g, referenceNumber || "PAAN-UNKNOWN")
    .replace(/\[Submission Date\]/g, formatDate(new Date(submittedAt)))
    .replace(/\[Selected Tier\]/g, selectedTier)
    .replace(
      /{{companyRegistrationUrl}}/g,
      companyRegistrationUrl
        ? `<a href="${companyRegistrationUrl}" style="color: #f05d23;">Download</a>`
        : "Not provided"
    )
    .replace(
      /{{portfolioWorkUrl}}/g,
      portfolioWorkUrl
        ? `<a href="${portfolioWorkUrl}" style="color: #f05d23;">Download</a>`
        : "Not provided"
    )
    .replace(
      /{{agencyProfileUrl}}/g,
      agencyProfileUrl
        ? `<a href="${agencyProfileUrl}" style="color: #f05d23;">Download</a>`
        : "Not provided"
    )
    .replace(
      /{{taxRegistrationUrl}}/g,
      taxRegistrationUrl
        ? `<a href="${taxRegistrationUrl}" style="color: #f05d23;">Download</a>`
        : "Not provided"
    )
    .replace(
      /{{answersTable}}/g,
      answersTable
        .map(
          (qa, index) => `
            <tr style="background-color: ${
              index % 2 === 0 ? "#f9f9f9" : "#fff"
            };">
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #ddd; vertical-align: top;">${
                qa.question
              }</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; white-space: pre-wrap;">${
                qa.answer
              }</td>
            </tr>
          `
        )
        .join("")
    );

  // Select admin email based on job_type
  const adminEmailRecipient =
    job_type === "freelancer"
      ? process.env.FREELANCER_EMAIL
      : process.env.AGENCY_EMAIL;
  
  console.log(`[sendEmails] Admin email recipient for ${job_type}: ${adminEmailRecipient}`);

  try {
    const adminEmailResult = await transporter.sendMail({
      from: `"Pan-African Agency Network (PAAN)" <${process.env.EMAIL_USER}>`,
      to: adminEmailRecipient,
      subject: processedAdminSubject,
      html: adminHtml,
      attachments: [
        {
          filename: `PAAN_Responses_${referenceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
    console.log(`[sendEmails] Admin email sent successfully to ${adminEmailRecipient}. Message ID: ${adminEmailResult.messageId}`);
  } catch (err) {
    console.error("[sendEmails] Error sending admin email:", err);
    throw new Error(`Failed to send admin email: ${err.message}`);
  }
}
