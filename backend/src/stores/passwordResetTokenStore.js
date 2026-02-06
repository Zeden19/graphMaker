const crypto = require('crypto');
const {AppError} = require("../errors");

const RESET_TTL_MS = 300 * 60 * 1000;
const resetTokens = new Map();

const createResetTokenStore = () => {
  const createToken = (userId) => {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + RESET_TTL_MS;
    resetTokens.set(token, {userId, expiresAt})
    return {token, expiresAt}
  }
  
  const consumeToken = (token) => {
    const entry = resetTokens.get(token);
    if (!entry) throw new AppError("invalid_token");
    
    if (entry.expiresAt < Date.now()) {
      resetTokens.delete(token);
      throw new AppError("invalid_token");
    }
    resetTokens.delete(token);
    return {userId: entry.userId}
  };
  
  return {createToken, consumeToken}
};

module.exports = {
  createResetTokenStore
}
