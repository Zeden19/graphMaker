const {pool: db} = require("./db");
const bcrypt = require("bcrypt");

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
        return {error: "email_taken"};
      }
      return {error: "db_error"};
    }
  };

  const logInUser = async (email, password) => {
    try {
      const result = await db.query(
        "SELECT id, email, password_hash FROM users WHERE email = $1",
        [email]
      );
      if (result.rows.length === 0) {
        return {error: "invalid_credentials"};
      }

      const user = result.rows[0];
      const verified = await verifyPassword(password, user.password_hash);
      if (!verified) return {error: "invalid_credentials"};

      return {id: user.id, email: user.email};
    } catch {
      return {error: "db_error"};
    }
  };

  const getUser = async (id) => {
    try {
      const result = await db.query(
        "SELECT id, email, created_at, updated_at FROM users WHERE id = $1",
        [id]
      );
      if (result.rows.length === 0) return {error: "not_found"};
      return result.rows[0];
    } catch {
      return {error: "db_error"};
    }
  };

  const deleteUser = async (id) => {
    try {
      const result = await db.query("DELETE FROM users WHERE id = $1", [id]);
      if (result.rowCount === 0) return {error: "not_found"};
      return {success: true};
    } catch {
      return {error: "db_error"};
    }
  };

  const getUserGraphs = async (id) => {
    try {
      const result = await db.query(
        "SELECT * FROM graphs WHERE owner_id = $1",
        [id]
      );
      return result.rows;
    } catch {
      return {error: "db_error"};
    }
  };
  return {
    createUser,
    logInUser,
    getUser,
    deleteUser,
    getUserGraphs,
  }
}

module.exports = {
  createUserStore
}
