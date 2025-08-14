import { Resend } from "resend";

const resend = new Resend("re_xxxxxxxxx");

await resend.emails.send({
  from: "Acme <onboarding@resend.dev>",
  to: ["delivered@resend.dev"],
  subject: "hello world",
  html: "<p>it works!</p>",
});
