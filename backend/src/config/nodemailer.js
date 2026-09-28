import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "173.194.42.108",
  port: 465,
  secure: true,

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,

  tls: {
    servername: "smtp.gmail.com",
  },

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default transporter;