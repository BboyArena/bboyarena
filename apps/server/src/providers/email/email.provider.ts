export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export type EmailProvider = {
  send(message: EmailMessage): Promise<void>;
};
