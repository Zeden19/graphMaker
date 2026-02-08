const {test, expect, afterAll} = require("@jest/globals");
const {createResetTokenStore} = require("../stores/passwordResetTokenStore");

const tokenStore = createResetTokenStore();

afterAll(() => {
  jest.useRealTimers();
});

test("Create and consume token", () => {
  const {token} = tokenStore.createToken("user-1");
  const result = tokenStore.consumeToken(token);
  expect(result.userId).toBe("user-1");
});

test("Consume token only once", () => {
  const {token} = tokenStore.createToken("user-2");
  tokenStore.consumeToken(token);
  expect(() => tokenStore.consumeToken(token)).toThrow();
});

test("Expired token is rejected", () => {
  jest.useFakeTimers();
  const {token, expiresAt} = tokenStore.createToken("user-3");
  jest.setSystemTime(expiresAt + 1);
  expect(() => tokenStore.consumeToken(token)).toThrow();
});
