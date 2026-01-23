const {pool: db} = require("./db");
const bcrypt = require("bcrypt");

const hashPassword = async (plainPassword) => {
  const saltRounds = 12;
  return bcrypt.hash(plainPassword, saltRounds)
}

const verifyPassword = async (plainPassword, hash) => {
  return bcrypt.compare(plainPassword, hash);
}

const createUserStore = () => {
  const createUser = async (email, password) => {
    const hashedPassword = await hashPassword(password);

    const result = await db.query(`INSERT INTO users (email, password_hash) VALUES ($1, $2)
                RETURNING id, email, created_at`, [email, hashedPassword]);
    if (result.err.code === "23505") {
      return {error: `User with email ${email} already exists`};
    } else if (!result) {
      return {error: "Could not create user"}
    }

    return result.rows[0];
  }

  const verifyUser = async (email, password) => {
    const result = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (!result) return {error: `Could not find user with email ${email}}`};

    const verify = await verifyPassword(password);
    if (!verify) return {error: `Password incorrect`};

    return {id: result.rows[0].id, email: result.rows[0].email};
  }

  const getUser = async (id) => {
    const result = await db.query(`SELECT * FROM users where id = $1`, [id]);
    if (result.rows.length === 0) return {error: `Could not find user`};
  }

  const deleteUser = async (id) => {
    const result = db.query(`DELETE FROM users WHERE id = $1`, [id]);
    if (result.rows.length === 0) return {error: `Could not find user`};
    if (!result) return {error: "Could not delete user"}
  }

  const getUserGraphs = async (id) => {
    const result = await db.query(`SELECT * FROM graphs WHERE owner_id = $1`, [id]);
    if (!result) return {error: `Could not find graphs`};
    return result.rows;
  }
  return {
    createUser,
    verifyUser,
    getUser,
    deleteUser,
    getUserGraphs,
  }
}

module.exports = {
  createUserStore
}