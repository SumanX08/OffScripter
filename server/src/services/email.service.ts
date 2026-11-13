
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM =
  process.env.EMAIL_FROM || "OffScripter <reminders@offscripter.in>";



export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  
  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error(error.message);
  }

  console.log("Email sent successfully:", data?.id);

  return data;
};

export const sendWelcomeEmail = async ({
  to,
  username,
}: {
  to: string;
  username: string;
}) => {
  await sendEmail({
    to,
    subject: "Welcome to OffScripter! 🎯",
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 560px;
        margin: 30px auto;
        padding: 32px;
        color: #283618;
        background: #F8F1DC;
        border-radius: 12px;
      ">
        <h1>Welcome to OffScripter, ${username}! 👋</h1>

        <p>
          We're glad to have you here.
        </p>

        <p>
          OffScripter helps you become a more confident technical
          communicator through regular speaking practice.
        </p>

        <h3>Here's how to get started:</h3>

        <ol>
          <li>Spin a random technical topic.</li>
          <li>Research the topic with a focused timer.</li>
          <li>Record your explanation for two minutes.</li>
          <li>Get AI-powered feedback on your performance.</li>
        </ol>

        <a
          href="https://offscripter.in/dashboard"
          style="
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background: #283618;
            color: white;
            text-decoration: none;
            border-radius: 8px;
          "
        >
          Start your first practice
        </a>

        <p style="
          margin-top: 30px;
          font-size: 12px;
          color: #777;
        ">
          Keep practising. Keep improving.
          <br />
          Team OffScripter
        </p>
      </div>
    `,
  });
};
