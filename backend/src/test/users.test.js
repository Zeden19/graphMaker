const {test, expect, beforeEach, afterEach, afterAll} = require("@jest/globals")
const {createUserStore} = require("../stores/users");
const db = require("../stores/db");

const userStore = createUserStore();
const TEST_EMAIL = "test@email.com";

let id;
beforeEach(async () => {
  if (expect.getState().currentTestName === "Creating user") return
  
  const data = await userStore.createUser(TEST_EMAIL, "123");
  id = data.id;
});

afterEach(async () => {
  await db.query("DELETE FROM users where email = 'test@email.com'");
  id = undefined;
});

afterAll(async () => {
  db.pool.end?.();
});

test("Creating user", async () => {
  const data = await userStore.createUser(TEST_EMAIL, "123");
  expect(data.email).toBe(TEST_EMAIL);
});

test("Deleting user", async () => {
  await userStore.deleteUser(id);
  await expect(userStore.getUserByEmail(TEST_EMAIL)).rejects.toMatchObject({code: "not_found"})
});

test("Creating user with existing email", async () => {
  await expect(userStore.createUser(TEST_EMAIL, "123")).rejects.toMatchObject({code: "email_taken"});
});

test("Log in user with email and password", async () => {
  const data = await userStore.logInUser(TEST_EMAIL, "123");
  expect(data.email).toBe(TEST_EMAIL)
});

test("Get user by id and email", async () => {
  let data = await userStore.getUser(id);
  expect(data.email).toBe(TEST_EMAIL);
  
  data = await userStore.getUserByEmail(TEST_EMAIL);
  expect(data.email).toBe(TEST_EMAIL);
});

test("Resetting Password", async () => {
  await userStore.resetPassword(id, "1234");
  const data = await userStore.logInUser(TEST_EMAIL, "1234");
  expect(data.email).toBe(TEST_EMAIL);
});

test("Change Password", async () => {
  await userStore.changePassword(id, "1234", "123");
  const data = await userStore.logInUser(TEST_EMAIL, "1234");
  expect(data.email).toBe(TEST_EMAIL);
});

test("Change password invalid old password", async () => {
  await expect(userStore.changePassword(id, "1234", "12")).rejects.toMatchObject({code: "invalid_credentials"});
})
