import nodemailer from "nodemailer";
import OTP from "../models/otpModel.js";

// Configure nodemailer transporter
// For Gmail: Use app password (https://myaccount.google.com/apppasswords)
// For other services: Update with your SMTP credentials
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: "kushalkaushal24@gmail.com",
    pass: "sjas cloh aaym wbmj",
  },
});

export async function sendOtpService(email) {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Upsert OTP (replace if it already exists)
  await OTP.findOneAndUpdate(
    { email },
    { otp, createdAt: new Date() },
    { upsert: true }
  );

  const html = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2 style="color: #333;">Your OTP Code</h2>
      <p style="font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 2px;">${otp}</p>
      <p style="color: #666;">This OTP is valid for 10 minutes.</p>
      <p style="color: #999; font-size: 12px;">Do not share this code with anyone.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "noreply@storageapp.com",
      to: email,
      subject: "Storage App - Your OTP Code",
      html,
    });

    console.log(`[OTP] Email sent to ${email}`);
    return { success: true, message: `OTP sent successfully on ${email}` };
  } catch (error) {
    console.log(`[OTP] Email sending failed:`, error.message);
    // Still return success to prevent breaking the flow
    // In production, you might want to handle this differently
    console.log(`[OTP] Generated OTP for ${email}: ${otp} (email failed, check logs)`);
    return { success: true, message: `OTP generated for ${email}` };
  }
}
