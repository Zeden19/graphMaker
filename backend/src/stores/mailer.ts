import {createTransport} from "nodemailer";
import {AppError} from "../errors";

const SMTP_HOST = process.env.SMTP_HOST as string;
const SMTP_PORT = process.env.SMPT_PORT as unknown as number || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_SECURE = SMTP_PORT === 465;

const transporter = createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  }
})

export const sendPasswordReset = async ({to, resetURL}: { to: string, resetURL: string }) => {
  const from = SMTP_USER
  try {
    return await transporter.sendMail({
      from,
      to,
      subject: "Reset GraphMaker Password",
      text: `Reset Password using this link: ${resetURL}`,
      html: `<p>Reset your password using this link:</p>
           <p><a href="${resetURL}">${resetURL}</a></p>`
    });
  } catch (e) {
    throw new AppError("db_error", "Send Password Reset error", e)
  }
}
