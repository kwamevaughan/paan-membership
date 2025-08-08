// src/pages/api/send-magic-link.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, magicLink } = req.body;

    if (!email || !magicLink) {
        return res.status(400).json({ error: "Email and magic link are required" });
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
      from: `"Pan-African Agency Network Membership Management Dashboard" <${process.env.EMAIL_USER}>`,
      to: email,
      subject:
        "Your Password Recovery Magic Link - Pan-African Agency Network Membership Dashboard",
      text: `Forgot your password? No worries! Click this link to log in: ${magicLink}\n\nThis link will expire in 15 minutes.`,
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #261914;">
                <img src="https://membership.paan.africa/assets/images/logo.png" alt="PAAN Logo" style="display: block; margin: 0 auto 20px; max-width: 150px;">
                
                <h2 style="color: #f05d23; text-align: center;">Password Recovery - GCG Career Management Dashboard</h2>
                
                <p style="font-size: 16px; line-height: 1.5; color: #261914;">
                    Hello,
                </p>
                <p style="font-size: 16px; line-height: 1.5; color: #261914;">
                    Forgot your password? Use the link below to access the GCG Career Management Dashboard. This is a one-time magic link for your convenience.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${magicLink}" style="background-color: #f05d23; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Log In Now</a>
                </div>
                
                <p style="font-size: 14px; color: #261914; text-align: center;">
                    This link will expire in <strong>15 minutes</strong>. If you didn’t request this, please contact the HR team.
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="font-size: 16px; line-height: 1.5; color: #261914;">
                    <strong>Pan-African Agency Network (PAAN)</strong><br/>
                    7th Floor, Mitsumi Business Park,<br/>
                    Westlands – Nairobi, Kenya<br/>
                    P.O. Box 1093-00606<br/>
                    <strong>Phone:</strong> +254 701 850 850
                </p>
                
                <p style="font-size: 14px; text-align: center; color: #777; margin-top: 20px;">
                    Best regards,<br/>
                    The Hiring Team<br/>
                    PAN-African Agency Network
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: "Magic link sent successfully" });
    } catch (error) {
        console.error("Email sending error:", error);
        return res.status(500).json({ error: "Failed to send magic link" });
    }
}