const crypto = require('crypto');

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
    if (!entry) return {error: "not_found"}
    
    if (entry.expiresAt < Date.now()) {
      resetTokens.delete(token);
      return {error: "not_found"}
    }
    resetTokens.delete(token);
    return {userId: entry.userId}
  };
  
  return {createToken, consumeToken}
};

module.exports = {
  createResetTokenStore
}