"use server";

import { Resend } from "resend";

interface IEmailProps {
  to: string;
  subject: string;
  text: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, text }: IEmailProps) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM environment variable is not set");
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
    });

    if (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        message: "Failed to send email.",
        error,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (err) {
    console.error("Unexpected error sending email:", err);
    return {
      success: false,
      message: "Unexpected error occurred.",
    };
  }
}

export default sendEmail;
