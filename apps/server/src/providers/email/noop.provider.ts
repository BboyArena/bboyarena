import type { EmailProvider } from "./email.provider.ts";

export const createNoopEmailProvider = (): EmailProvider => ({
  send: async (message) => {
    console.log("[email noop]", {
      subject: message.subject,
      to: message.to,
    });
  },
});
