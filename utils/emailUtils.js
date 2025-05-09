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
    let tierQuestion = questions.find((q) =>
      q?.text?.toLowerCase().includes("tier")
    );
    if (!tierQuestion) {
      tierQuestion = questions.find((q) =>
        q?.options?.some((opt) => opt?.toLowerCase().includes("tier"))
      );
    }
    if (tierQuestion && tierQuestion.id) {
      const answer = parsedAnswers[tierQuestion.id - 1];
      if (Array.isArray(answer) && answer.length > 0) {
        selectedTier =
          answer[0].replace(/ - Requirement:.*$/, "").trim() || "Not specified";
      } else if (typeof answer === "string" && answer.trim()) {
        selectedTier =
          answer.replace(/ - Requirement:.*$/, "").trim() || "Not specified";
      }
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

  // Format answers for email and PDF
  const formattedAnswers = parsedAnswers.map((answer, idx) => {
    const question = questions[idx]?.text || `Question ${idx + 1}`;
    let answerText = "None provided";

    if (answer) {
      if (Array.isArray(answer)) {
        if (answer.length === 0) {
          answerText = "None provided";
        } else {
          answerText = answer
            .map((item) => {
              if (typeof item === "string") {
                try {
                  // Parse JSON strings (e.g., references)
                  const parsed = JSON.parse(item);
                  if (parsed.name && parsed.email) {
                    return `- Name: ${parsed.name}, Role: ${
                      parsed.role || "N/A"
                    }, Email: ${parsed.email}`;
                  }
                  return item;
                } catch {
                  return item;
                }
              } else if (typeof item === "object" && item) {
                if (item.customText) {
                  try {
                    // Parse JSON in customText
                    const parsed = JSON.parse(item.customText);
                    if (parsed.name && parsed.email) {
                      return `- Name: ${parsed.name}, Role: ${
                        parsed.role || "N/A"
                      }, Email: ${parsed.email}`;
                    }
                    return (
                      item.customText +
                      (item.link ? ` (Link: ${item.link})` : "")
                    );
                  } catch {
                    return (
                      item.customText +
                      (item.link ? ` (Link: ${item.link})` : "")
                    );
                  }
                } else if (item.option) {
                  return (
                    item.option + (item.link ? ` (Link: ${item.link})` : "")
                  );
                }
              }
              return JSON.stringify(item);
            })
            .filter((text) => text)
            .join("\n");
        }
      } else {
        answerText = answer.toString();
      }
    }

    return { question, answer: answerText };
  });

  // Fetch PAAN logo
  let logoBuffer;
  try {
    const logoResponse = await fetch(
      "https://www.paan.africa/assets/images/logo.png"
    );
    const arrayBuffer = await logoResponse.arrayBuffer();
    logoBuffer = Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Failed to fetch PAAN logo:", error.message);
    logoBuffer = null;
  }

  // Generate PDF attachment
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

    // Register Helvetica for consistent font
    doc.registerFont("Helvetica", "Helvetica");
    doc.registerFont("Helvetica-Bold", "Helvetica-Bold");

    // Add page with header and footer
    doc.addPage();
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = doc.page.margins.top;

    // Header
    doc.rect(0, 0, pageWidth, 80).fill("#e2e1e1");
    doc.fillColor("#ffffff");
    doc.font("Helvetica-Bold").fontSize(14);
    if (logoBuffer) {
      doc.image(logoBuffer, margin, 10, { width: 100 });
      doc.text("PAAN Application Responses", margin + 120, 20);
    } else {
      doc.text("PAAN Application Responses", margin, 20);
    }
    doc.font("Helvetica").fontSize(10);
    doc.text(`Opening: ${opening || "N/A"}`, margin + 120, 40);
    doc.text(`Candidate: ${primaryContactName || "N/A"}`, margin + 120, 55);
    doc.text(`Agency: ${agencyName || "N/A"}`, margin + 120, 70);
    doc.moveDown(2);

    // Content
    doc.fillColor("#000000");
    doc.fontSize(12);
    formattedAnswers.forEach((qa, index) => {
      const questionText = `Q${index + 1}: ${qa.question}`;
      const answerText = qa.answer || "None provided";

      // Check available space
      const questionHeight = doc.heightOfString(questionText, {
        width: pageWidth - 2 * margin,
      });
      const answerHeight = doc.heightOfString(answerText, {
        width: pageWidth - 2 * margin,
      });
      const totalHeight = questionHeight + answerHeight + 20;

      if (doc.y + totalHeight > pageHeight - margin - 50) {
        doc.addPage();
        doc.rect(0, 0, pageWidth, 80).fill("#e2e1e1");
        doc.fillColor("#ffffff");
        doc.font("Helvetica-Bold").fontSize(14);
        if (logoBuffer) {
          doc.image(logoBuffer, margin, 10, { width: 100 });
          doc.text("PAAN Application Responses", margin + 120, 20);
        } else {
          doc.text("PAAN Application Responses", margin, 20);
        }
        doc.font("Helvetica").fontSize(10);
        doc.text(`Opening: ${opening || "N/A"}`, margin + 120, 40);
        doc.text(`Candidate: ${primaryContactName || "N/A"}`, margin + 120, 55);
        doc.text(`Agency: ${agencyName || "N/A"}`, margin + 120, 70);
        doc.fillColor("#000000");
        doc.moveDown(2);
      }

      doc.font("Helvetica-Bold").text(questionText, margin, doc.y);
      doc.font("Helvetica").text(answerText, margin, doc.y + 5);
      doc.moveDown();
    });

    // Footer on every page
    const footerHeight = 50;
    doc.on("pageAdded", () => {
      doc
        .rect(0, pageHeight - footerHeight, pageWidth, footerHeight)
        .fill("#231812");
      doc.fillColor("#ffffff");
      doc.font("Helvetica").fontSize(10);
      doc.text(
        "Pan-African Agency Network | https://www.paan.africa",
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

  // Replace placeholders in admin subject
  const processedAdminSubject = (
    adminSubject ||
    `New Application Submission from ${primaryContactName} - ${opening} - Agency ${agencyName} - ${formatDate(
      submittedAt
    )}`
  )
    .replace(/{{primaryContactName}}/g, primaryContactName || "Applicant")
    .replace(/{{agencyName}}/g, agencyName || "Agency")
    .replace(/{{opening}}/g, opening || "N/A");

  // Replace placeholders in admin HTML
  const adminHtml = adminTemplate
    .replace(/{{primaryContactName}}/g, primaryContactName || "N/A")
    .replace(/{{agencyName}}/g, agencyName || "N/A")
    .replace(/{{primaryContactEmail}}/g, primaryContactEmail || "N/A")
    .replace(/{{primaryContactPhone}}/g, primaryContactPhone || "N/A")
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
    .replace(/\[Submission Date\]/g, formatDate(submittedAt))
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
      formattedAnswers
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

  await transporter.sendMail({
    from: `"PAAN" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
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

  console.log("Emails sent successfully");
}
