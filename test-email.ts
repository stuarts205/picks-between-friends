import { sendEmail } from "./src/lib/sendEmail";

sendEmail({
  to: "stuarts205@gmail.com",
  subject: "Test Gmail Email",
  html: "<p>Hello! This is a test email from Gmail.</p>",
})
  .then(() => console.log("Email sent"))
  .catch((err) => console.error("Email error", err));