
import "dotenv/config";
import {sendEmail} from '../src/services/email.service'
const test = async () => {
  try {
    await sendEmail({
      to: "sumanpreetsingh998@gmail.com",
      subject: "OffScripter email test 🚀",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px;">
          <h2>Welcome to OffScripter!</h2>
          <p>Your email integration is working.</p>
          <p>Daily practice and streak reminders are coming soon.</p>
        </div>
      `,
    });

    console.log("Test email completed.");
  } catch (error) {
    console.error("Test failed:", error);

  }
};

test();
