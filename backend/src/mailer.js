const nodemailer = require("nodemailer");

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMPT_PORT || 587;
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASSWORD = process.env.SMTP_PASSWORD
const SMTP_SECURE = SMTP_PORT === 465

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  }
})

const sendPasswordReset = async ({to, resetURL}) => {
  const from = SMTP_USER
    return await transporter.sendMail({
      from,
      to,
      subject: "Reset GraphMaker Password",
      text: `Reset Password using this link: ${resetURL}`,
      html: `<p>Reset your password using this link:</p>
           <p><a href="${resetURL}">${resetURL}</a></p>`
    });
}

module.exports = {
  sendPasswordReset
}