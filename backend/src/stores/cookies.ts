import http = require("node:http");
import {Session} from "../types/session"
import {AppError} from "../errors";

const isProd = process.env.NODE_ENV === "production";

const sameSite = isProd ? "None" : "Lax";
const secure = isProd ? "Secure; " : "";


export const createCookieStore = () => {
  const parseCookies = (req: http.IncomingMessage): { session_id: string } => {
    const cookieHeader = req.headers?.cookie;
    // fix throwing error
    if (!cookieHeader) throw new AppError("unauthorized");
    return cookieHeader.split(";").reduce((acc, pair) => {
      const [key, ...rest] = pair.trim().split("=");
      acc[key] = decodeURIComponent(rest.join("="));
      return acc;
    }, {} as Record<string, any>) as { session_id: string };
  };
  
  const setSessionCookie = (res: http.ServerResponse, session: Session) => {
    const expires = new Date(session.expires_at).toUTCString();
    res.setHeader(
      "Set-Cookie",
      `session_id=${session.id}; HttpOnly; SameSite=${sameSite}; Path=/; ${secure} Expires=${expires}`
    );
  };
  
  const clearSessionCookie = (res: http.ServerResponse) => {
    res.setHeader(
      "Set-Cookie",
      `session_id=; HttpOnly; SameSite=${sameSite}; Path=/; ${secure} Expires=Thu, 01 Jan 1970 00:00:00 GMT`
    );
  };
  
  return {
    parseCookies,
    setSessionCookie,
    clearSessionCookie,
  };
};
