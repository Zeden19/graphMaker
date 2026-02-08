const {test, expect, beforeEach, afterEach, afterAll} = require("@jest/globals");
const {createSessionStore} = require("../stores/sessions");
const {createUserStore} = require("../stores/users");
const db = require("../stores/db");

const sessionStore = createSessionStore();
const userStore = createUserStore();

const makeEmail = () => `test+${Date.now()}-${Math.random().toString(16).slice(2)}@email.com`;

let userId;

beforeEach(async () => {
  const user = await userStore.createUser(makeEmail(), "123");
  userId = user.id;
});

afterEach(async () => {
  if (userId) {
    await db.query("DELETE FROM sessions WHERE user_id = $1", [userId]);
    await db.query("DELETE FROM users WHERE id = $1", [userId]);
  }
  userId = undefined;
});

afterAll(async () => {
  await db.pool.end();
});

test("Create and fetch session", async () => {
  const {session} = await sessionStore.createSession(userId);
  const result = await sessionStore.getSession(session.id);
  expect(result.session.user_id).toBe(userId);
});

test("Delete session", async () => {
  const {session} = await sessionStore.createSession(userId);
  const result = await sessionStore.deleteSession(session.id);
  expect(result.success).toBe(true);
});

test("Expired session is rejected", async () => {
  const {session} = await sessionStore.createSession(userId);
  await db.query("UPDATE sessions SET expires_at = NOW() - INTERVAL '1 hour' WHERE id = $1", [session.id]);
  await expect(sessionStore.getSession(session.id)).rejects.toMatchObject({code: "unauthorized"});
});

test("Get session user from cookies", async () => {
  const {session} = await sessionStore.createSession(userId);
  const cookieStore = {
    parseCookies: () => ({session_id: session.id})
  };
  const result = await sessionStore.getSessionUser({}, cookieStore);
  expect(result.userId).toBe(userId);
});

test("Get session user without cookie", async () => {
  const cookieStore = {
    parseCookies: () => ({})
  };
  await expect(sessionStore.getSessionUser({}, cookieStore)).rejects.toMatchObject({code: "unauthorized"});
});
