const {pool: db} = require("./db");
const bcrypt = require("bcrypt");
const {AppError} = require("../errors");

const hashPassword = async (plainPassword) => {
  const saltRounds = 12;
  return bcrypt.hash(plainPassword, saltRounds);
};

const verifyPassword = async (plainPassword, hash) => {
  return bcrypt.compare(plainPassword, hash);
};

const createUserStore = () => {
  const createUser = async (email, password) => {
    try {
      const hashedPassword = await hashPassword(password);
      
      const result = await db.query(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
        [email, hashedPassword]
      );
      return result.rows[0];
    } catch (error) {
      if (error?.code === "23505") {
        throw new AppError("email_taken");
      }
      throw new AppError("db_error");
    }
  };
  
  const logInUser = async (email, password) => {
    let result;
    try {
      result = await db.query(
        "SELECT id, email, password_hash FROM users WHERE email = $1",
        [email]
      );
    } catch {
      throw new AppError("db_error");
    }
    if (result.rows.length === 0) {
      throw new AppError("invalid_credentials");
    }
    
    const user = result.rows[0];
    const verified = await verifyPassword(password, user.password_hash);
    if (!verified) throw new AppError("invalid_credentials");
    
    return {id: user.id, email: user.email};
  };
  
  const getUser = async (id) => {
    let result;
    try {
      result = await db.query(
        "SELECT id, email, created_at, updated_at FROM users WHERE id = $1",
        [id]
      );
    } catch {
      throw new AppError("db_error");
    }
    if (result.rows.length === 0) throw new AppError("not_found");
    return result.rows[0];
  };
  
  const deleteUser = async (id) => {
    let result;
    try {
      result = await db.query("DELETE FROM users WHERE id = $1", [id]);
    } catch {
      throw new AppError("db_error");
    }
    if (result.rowCount === 0) throw new AppError("not_found");
    return {success: true};
  };
  
  const getUserByEmail = async (email) => {
    let result;
    try {
      result = await db.query(`SELECT id, email
                               FROM users
                               WHERE email = $1`, [email])
    } catch {
      throw new AppError("db_error");
    }
    if (result.rows.length === 0) throw new AppError("not_found");
    return result.rows[0];
  };
  
  const changePassword = async (userId, newPassword, oldPassword) => {
    let result;
    try {
      result = await db.query(
        "SELECT id, email, password_hash FROM users WHERE id = $1",
        [userId]
      );
    } catch {
      throw new AppError("db_error");
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
  
  
  const resetPassword = async (userId, newPassword) => {
    let result;
    try {
      result = await db.query(
        "SELECT id, email, password_hash FROM users WHERE id = $1",
        [userId]
      );
    } catch {
      throw new AppError("db_error");
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

module.exports = {
  createUserStore
}
