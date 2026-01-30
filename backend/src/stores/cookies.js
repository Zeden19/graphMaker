const createCookieStore = () => {
  const parseCookies = (req) => {
    const cookieHeader = req.headers?.cookie;
    if (!cookieHeader) return {};
    return cookieHeader.split(";").reduce((acc, pair) => {
      const [key, ...rest] = pair.trim().split("=");
      acc[key] = decodeURIComponent(rest.join("="));
      return acc;
    }, {});
  };
  
  const setSessionCookie = (res, session) => {
    const expires = new Date(session.expires_at).toUTCString();
    res.setHeader(
      "Set-Cookie",
      `session_id=${session.id}; HttpOnly; SameSite=Lax; Path=/; ${process.env.NODE_ENV === "prod" ? "Secure;" : ''} Expires=${expires}`
    );
  };
  
  const clearSessionCookie = (res) => {
    res.setHeader(
      "Set-Cookie",
      `session_id=; HttpOnly; SameSite=Lax; Path=/; ${process.env.NODE_ENV === "prod" ? "Secure;" : ''} Expires=Thu, 01 Jan 1970 00:00:00 GMT`
    );
  };
  
  return {
    parseCookies,
    setSessionCookie,
    clearSessionCookie,
  };
};

module.exports = {
  createCookieStore
};