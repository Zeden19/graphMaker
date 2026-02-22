import {db} from "./db";
import bcrypt from "bcrypt"
import {AppError} from "../errors";
import {DatabaseError} from "pg"
import {ChangeUserPassword, GetUser, LoginUser, UserCreate} from "../types/user";
import {QueryResult} from "pg";
import {sendJson} from "../sendJson";

const hashPassword = async (plainPassword: string) => {
  const saltRounds = 12;
  return bcrypt.hash(plainPassword, saltRounds);
};

const verifyPassword = async (plainPassword: string, hash: string) => {
  return bcrypt.compare(plainPassword, hash);
};

export const createUserStore = () => {
  const createUser = async (email: string, password: string) => {
    try {
      const hashedPassword = await hashPassword(password);
      
      const result = await db.query<UserCreate>(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
        [email, hashedPassword]
      );
      return result.rows[0];
    } catch (error) {
      if (error instanceof DatabaseError && error?.code === "23505") {
        throw new AppError("email_taken");
      }
      throw new AppError("db_error", "Create User Database Error", error);
    }
  };
  
  const logInUser = async (email: string, password: string) => {
    let result: QueryResult<LoginUser>;
    try {
      result = await db.query<LoginUser>(
        "SELECT id, email, password_hash FROM users WHERE email = $1",
        [email]
      );
    } catch (e) {
      throw new AppError("db_error", "Login User Error", e);
    }
    if (result.rows.length === 0) {
      throw new AppError("invalid_credentials");
    }
    
    const user = result.rows[0];
    const verified = await verifyPassword(password, user.password_hash);
    if (!verified) throw new AppError("invalid_credentials");
    
    return {id: user.id, email: user.email};
  };
  
  const getUser = async (id: string) => {
    let result: QueryResult<GetUser>;
    try {
      result = await db.query<GetUser>(
        "SELECT id, email, created_at, updated_at FROM users WHERE id = $1",
        [id]
      );
    } catch (e) {
      throw new AppError("db_error", "GetUser Error", e);
    }
    if (result.rows.length === 0) throw new AppError("not_found");
    return result.rows[0];
  };
  
  const deleteUser = async (id: string) => {
    let result: QueryResult<never>;
    try {
      result = await db.query("DELETE FROM users WHERE id = $1", [id]);
    } catch (e) {
      throw new AppError("db_error", "Delete User Error", e);
    }
    if (result.rowCount === 0) throw new AppError("not_found");
    return {success: true};
  };
  
  const getUserByEmail = async (email: string) => {
    let result: QueryResult<GetUser>;
    try {
      result = await db.query<GetUser>(`SELECT id, email, created_at, updated_at
                                        FROM users
                                        WHERE email = $1`, [email])
    } catch (error) {
      if (error instanceof AppError && error?.code === "not_found") {
        return null
      }
      throw new AppError("db_error", "Get User By Email error", error);
    }
    if (result.rows.length === 0) throw new AppError("not_found");
    return result.rows[0];
  };
  
  const changePassword = async (userId: string, newPassword: string, oldPassword: string) => {
    let result: QueryResult<ChangeUserPassword>;
    try {
      result = await db.query<ChangeUserPassword>(
        "SELECT id, email, password_hash FROM users WHERE id = $1",
        [userId]
      );
    } catch (e){
      throw new AppError("db_error", "Change Password error", e);
    }
    if (result.rows.length === 0) {
      throw new AppError("not_found");
    }
    
    const user = result.rows[0];
    const verified = await verifyPassword(oldPassword, user.password_hash);
    if (!verified) throw new AppError("invalid_credentials");
    
    const hashedPassword = await hashPassword(newPassword);
    await db.query(`UPDATE users
                    SET password_hash = $1
                    WHERE id = $2`, [hashedPassword, userId]);
    return {success: true};
    
  }
  
  const resetPassword = async (userId: string, newPassword: string) => {
    let result: QueryResult<ChangeUserPassword>;
    try {
      result = await db.query<ChangeUserPassword>(
        "SELECT id, email, password_hash FROM users WHERE id = $1",
        [userId]
      );
    } catch (e) {
      throw new AppError("db_error", "Rest password database error", e);
    }
    if (result.rows.length === 0) {
      throw new AppError("not_found");
    }
    
    const hashedPassword = await hashPassword(newPassword);
    await db.query(`UPDATE users
                    SET password_hash = $1
                    WHERE id = $2`, [hashedPassword, userId]);
    return {success: true};
    
  }
  return {
    createUser,
    logInUser,
    getUser,
    deleteUser,
    getUserByEmail,
    changePassword,
    resetPassword
  }
}
