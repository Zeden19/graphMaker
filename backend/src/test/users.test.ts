import {test, expect, beforeEach, afterEach, afterAll} from "@jest/globals";
import {createUserStore} from "../stores/users";
import {db} from "../stores/db";

const userStore = createUserStore();

const makeEmail = () => `test+${Date.now()}-${Math.random().toString(16).slice(2)}@email.com`;

let id : string;
let email : string;
beforeEach(async () => {
  if (expect.getState().currentTestName === "Creating user") return
  
  const data = await userStore.createUser(makeEmail(), "123");
  id = data.id;
  email = data.email;
});

afterEach(async () => {
  await db.query("DELETE FROM users where id = $1", [id]);
});

afterAll(async () => {
  await db.end();
});

test("Creating user", async () => {
  const email = makeEmail();
  const data = await userStore.createUser(email, "123");
  expect(data.email).toBe(email);
});

test("Deleting user", async () => {
  await userStore.deleteUser(id);
  await expect(userStore.getUserByEmail(email)).rejects.toMatchObject({code: "not_found"})
});

test("Creating user with existing email", async () => {
  await expect(userStore.createUser(email, "123")).rejects.toMatchObject({code: "email_taken"});
});

test("Log in user with email and password", async () => {
  const data = await userStore.logInUser(email, "123");
  expect(data.email).toBe(email)
});

test("Get user by id and email", async () => {
  let data = await userStore.getUser(id);
  expect(data.email).toBe(email);
  
  data = await userStore.getUserByEmail(email);
  expect(data.email).toBe(email);
});

test("Resetting Password", async () => {
  await userStore.resetPassword(id, "1234");
  const data = await userStore.logInUser(email, "1234");
  expect(data.email).toBe(email);
});

test("Change Password", async () => {
  await userStore.changePassword(id, "1234", "123");
  const data = await userStore.logInUser(email, "1234");
  expect(data.email).toBe(email);
});

test("Change password invalid old password", async () => {
  await expect(userStore.changePassword(id, "1234", "12")).rejects.toMatchObject({code: "invalid_credentials"});
})
