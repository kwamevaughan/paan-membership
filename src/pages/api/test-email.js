import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("[test-email] Starting email test...");
    
    // Validate environment variables
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Missing email configuration");
    }

    console.log(`[test-email] Email config - Host: ${process.env.EMAIL_HOST}, Port: ${process.env.EMAIL_PORT}, User: ${process.env.EMAIL_USER}`);

    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Test connection
    console.log("[test-email] Testing SMTP connection...");
    await transporter.verify();
    console.log("[test-email] SMTP connection successful");

    // Send test email
    const testEmail = req.body.email || "emmanuel.eshun@growthpad.net";
    console.log(`[test-email] Sending test email to ${testEmail}`);
    
    const result = await transporter.sendMail({
      from: `"Pan-African Agency Network (PAAN)" <${process.env.EMAIL_USER}>`,
      to: testEmail,
      subject: "PAAN Email Test",
      html: `
        <h2>Email Test Successful</h2>
        <p>This is a test email from PAAN membership system.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>Environment: Production</p>
      `,
    });

    console.log(`[test-email] Test email sent successfully. Message ID: ${result.messageId}`);

    return res.status(200).json({ 
      success: true, 
      messageId: result.messageId,
      recipient: testEmail 
    });

  } catch (error) {
    console.error("[test-email] Error:", error);
    return res.status(500).json({ 
      error: "Email test failed", 
      details: error.message 
    });
  }
}