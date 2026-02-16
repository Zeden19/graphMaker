import {test, expect, beforeEach, afterEach, afterAll} from "@jest/globals";
import {createSessionStore} from "../stores/sessions";
import {createUserStore} from "../stores/users";
import {db} from "../stores/db";

const sessionStore = createSessionStore();
const userStore = createUserStore();

const makeEmail = () => `test+${Date.now()}-${Math.random().toString(16).slice(2)}@email.com`;

let userId : string;

beforeEach(async () => {
  const user = await userStore.createUser(makeEmail(), "123");
  userId = user.id;
});

afterEach(async () => {
  if (userId) {
    await db.query("DELETE FROM sessions WHERE user_id = $1", [userId]);
    await db.query("DELETE FROM users WHERE id = $1", [userId]);
  }
});

afterAll(async () => {
  await db.end();
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
