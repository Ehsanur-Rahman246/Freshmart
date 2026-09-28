import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify()
  .then(() => {
    console.log("SMTP connection successful");
  })
  .catch((error) => {
    console.error("SMTP connection failed:", error);
  });

export default transporter;
