import { config } from "../config/env.ts";
import type { EmailMessage, EmailProvider } from "../providers/email/email.provider.ts";
import { createBrevoEmailProvider } from "../providers/email/brevo.provider.ts";
import { createNoopEmailProvider } from "../providers/email/noop.provider.ts";
import { createResendEmailProvider } from "../providers/email/resend.provider.ts";

const createEmailProvider = (): EmailProvider => {
  if (config.EMAIL_PROVIDER === "resend") {
    return createResendEmailProvider({
      apiKey: config.RESEND_API_KEY,
      from: config.EMAIL_FROM,
    });
  }

  if (config.EMAIL_PROVIDER === "brevo") {
    return createBrevoEmailProvider({
      apiKey: config.BREVO_API_KEY,
      from: config.EMAIL_FROM,
    });
  }

  return createNoopEmailProvider();
};

export const createEmailService = (emailProvider = createEmailProvider()) => ({
  send: (message: EmailMessage) =>
    emailProvider.send({
      ...message,
      replyTo: message.replyTo ?? config.EMAIL_REPLY_TO,
    }),
});
