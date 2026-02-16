import {db} from "./db";
import {AppError} from "../errors";
import {GetSession, Session} from "../types/session";
import {QueryResult} from "pg";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const createSessionStore = () => {
  const createSession = async (userId: string) => {
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    try {
      const result = await db.query<Session>(
        "INSERT INTO sessions (user_id, expires_at) VALUES ($1, $2) RETURNING id, expires_at",
        [userId, expiresAt]
      );
      return {session: result.rows[0]};
    } catch {
      throw new AppError("db_error");
    }
  };
  
  const getSession = async (sessionId: string) => {
    let result: QueryResult<GetSession>;
    try {
      result = await db.query<GetSession>(
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
  
  const deleteSession = async (sessionId: string) => {
    let result: QueryResult<never>;
    try {
      result = await db.query<never>(
        "DELETE FROM sessions WHERE id = $1",
        [sessionId]
      );
    } catch {
      throw new AppError("db_error");
    }
    if (result.rowCount === 0) throw new AppError("not_found");
    return {success: true};
  };
  
  return {
    createSession,
    getSession,
    deleteSession,
  };
};

