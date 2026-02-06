const {pool: db} = require("./db");
const {AppError} = require("../errors");

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
      throw new AppError("db_error");
    }
  };
  
  const getSession = async (sessionId) => {
    let result;
    try {
      result = await db.query(
        "SELECT id, user_id, expires_at FROM sessions WHERE id = $1",
        [sessionId]
      );
    } catch {
      throw new AppError("db_error");
    }
    if (result.rows.length === 0) {
      throw new AppError("unauthorized");
    }
    const session = result.rows[0];
    if (new Date(session.expires_at).getTime() <= Date.now()) {
      await db.query("DELETE FROM sessions WHERE id = $1", [sessionId]);
      throw new AppError("unauthorized");
    }
    return {session};
  };
  
  const deleteSession = async (sessionId) => {
    let result;
    try {
      result = await db.query(
        "DELETE FROM sessions WHERE id = $1",
        [sessionId]
      );
    } catch {
      throw new AppError("db_error");
    }
    if (result.rowCount === 0) throw new AppError("not_found");
    return {success: true};
  };
  
  const getSessionUser = async (req, cookieStore) => {
    const cookies = cookieStore.parseCookies(req);
    const sessionId = cookies.session_id;
    if (!sessionId) throw new AppError("unauthorized");
    const sessionResult = await getSession(sessionId);
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
