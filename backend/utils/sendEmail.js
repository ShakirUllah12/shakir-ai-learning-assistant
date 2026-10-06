/**
 * Email sender utility with fallback simulation for local development.
 * This is resilient to environments without SMTP settings or where nodemailer is not installed.
 */
export const sendEmail = async (options) => {
  const { email, subject, message, resetUrl } = options;

  let nodemailer;
  try {
    nodemailer = (await import("nodemailer")).default;
  } catch (err) {
    // Nodemailer is not installed
  }

  const hasSmtpConfig =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (nodemailer && hasSmtpConfig) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"${process.env.FROM_NAME || "AI Learning Assistant"}" <${process.env.FROM_EMAIL || "noreply@ailearning.com"}>`,
        to: email,
        subject: subject,
        html: message,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${email}`);
      return { success: true, simulated: false };
    } catch (error) {
      console.error("Error sending real email via nodemailer:", error.message);
      // Fallback to simulation if email transport fails
    }
  }

  // Debug simulation banner for development
  const divider = "=".repeat(60);
  console.log(`\n${divider}`);
  console.log("  [DEVELOPMENT MODE] SIMULATED EMAIL NOTIFICATION");
  console.log(`  To:      ${email}`);
  console.log(`  Subject: ${subject}`);
  console.log(`  URL:     ${resetUrl}`);
  console.log(`${divider}\n`);

  return {
    success: true,
    simulated: true,
    resetUrl,
  };
};
