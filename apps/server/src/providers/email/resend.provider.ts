import { AppError } from "../../errors.ts";
import type { EmailProvider } from "./email.provider.ts";

export const createResendEmailProvider = ({
  apiKey,
  from,
}: {
  apiKey?: string;
  from: string;
}): EmailProvider => ({
  send: async (message) => {
    if (!apiKey) {
      throw new AppError("EMAIL_PROVIDER_NOT_CONFIGURED", 500, "Missing Resend API key");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        html: message.html,
        reply_to: message.replyTo,
        subject: message.subject,
        text: message.text,
        to: [message.to],
      }),
    });

    if (!response.ok) {
      throw new AppError("EMAIL_SEND_FAILED", 500, "Resend failed to send email");
    }
  },
});
