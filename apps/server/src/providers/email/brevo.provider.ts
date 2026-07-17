import { AppError } from "../../errors.ts";
import type { EmailProvider } from "./email.provider.ts";

export const createBrevoEmailProvider = ({
  apiKey,
  from,
}: {
  apiKey?: string;
  from: string;
}): EmailProvider => ({
  send: async (message) => {
    if (!apiKey) {
      throw new AppError("EMAIL_PROVIDER_NOT_CONFIGURED", 500, "Missing Brevo API key");
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        htmlContent: message.html,
        replyTo: message.replyTo ? { email: message.replyTo } : undefined,
        sender: { email: from },
        subject: message.subject,
        textContent: message.text,
        to: [{ email: message.to }],
      }),
    });

    if (!response.ok) {
      throw new AppError("EMAIL_SEND_FAILED", 500, "Brevo failed to send email");
    }
  },
});
