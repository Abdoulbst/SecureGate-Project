import nodemailer from "nodemailer";

function createTransporter() {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@securegate.com";

export async function sendVerificationEmail(
  to: string,
  token: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}&email=${encodeURIComponent(to)}`;
  const transporter = createTransporter();

  console.log(`[EMAIL_DEBUG] Verification URL: ${verificationUrl}`);

  if (!transporter) {
    console.warn("[EMAIL_WARN] SMTP not configured. Verification email not sent.");
    return;
  }

  const info = await transporter.sendMail({
    from: fromAddress,
    to,
    subject: "Verify your email address - SecureGate",
    html: `
      <p>Thank you for signing up.</p>
      <p>Click the link below to verify your email address:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link expires in 15 minutes.</p>
    `,
  });

  console.log(`[EMAIL_DEBUG] Message sent: ${info.messageId}`);
}

export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  const transporter = createTransporter();

  console.log(`[EMAIL_DEBUG] Password reset URL: ${resetUrl}`);

  if (!transporter) {
    console.warn("[EMAIL_WARN] SMTP not configured. Password reset email not sent.");
    return;
  }

  const info = await transporter.sendMail({
    from: fromAddress,
    to,
    subject: "Reset your password - SecureGate",
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });

  console.log(`[EMAIL_DEBUG] Message sent: ${info.messageId}`);
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn("[EMAIL_WARN] SMTP not configured. Welcome email not sent.");
    return;
  }

  const info = await transporter.sendMail({
    from: fromAddress,
    to,
    subject: "Welcome to SecureGate",
    html: `
      <p>Hi ${name},</p>
      <p>Your email has been verified. Welcome to SecureGate!</p>
      <p>You can now sign in and access your dashboard.</p>
      <p><a href="${process.env.NEXTAUTH_URL}/login">Sign in to your account</a></p>
    `,
  });

  console.log(`[EMAIL_DEBUG] Welcome email sent: ${info.messageId}`);
}
