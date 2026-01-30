const {pool: db} = require("./db");

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const createSessionStore = () => {
  const createSession = async (userId) => {
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    try {
      const result = await db.query(
        "INSERT INTO sessions (user_id, expires_at) VALUES ($1, $2) RETURNING id, expires_at",
        [userId, expiresAt]
      );
      return {session: result.rows[0]};
    } catch {
      return {error: "db_error"};
    }
  };
  
  const getSession = async (sessionId) => {
    try {
      const result = await db.query(
        "SELECT id, user_id, expires_at FROM sessions WHERE id = $1",
        [sessionId]
      );
      if (result.rows.length === 0) {
        return {error: "no_session"};
      }
      const session = result.rows[0];
      if (new Date(session.expires_at).getTime() <= Date.now()) {
        await db.query("DELETE FROM sessions WHERE id = $1", [sessionId]);
        return {error: "session_expired"};
      }
      return {session};
    } catch {
      return {error: "db_error"};
    }
  };
  
  const deleteSession = async (sessionId) => {
    try {
      const result = await db.query(
        "DELETE FROM sessions WHERE id = $1",
        [sessionId]
      );
      if (result.rowCount === 0) return {error: "not_found"};
      return {success: true};
    } catch {
      return {error: "db_error"};
    }
  };
  
  const getSessionUser = async (req, cookieStore) => {
    const cookies = cookieStore.parseCookies(req);
    const sessionId = cookies.session_id;
    if (!sessionId) return {error: "unauthorized"};
    const sessionResult = await getSession(sessionId);
    if (sessionResult.error) {
      return {error: sessionResult.error === "db_error" ? "db_error" : "unauthorized"};
    }
    return {userId: sessionResult.session.user_id};
  };
  
  return {
    createSession,
    getSession,
    deleteSession,
    getSessionUser
  };
};

module.exports = {
  createSessionStore
};
