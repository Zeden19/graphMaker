const request = require("supertest");
const db = require("../stores/db");
const {createServer} = require("../createServer");
const {test, expect, afterAll, describe, beforeEach, afterEach} = require("@jest/globals");
const {routes, resetTokenStore} = require("../routes");

const server = createServer({hostname: "localhost", routes});
const makeEmail = () => `test+${Date.now()}-${Math.random().toString(16).slice(2)}@email.com`;
const makeGraph = (name = "Test graph") => ({
  name,
  shapes: [
    {toString: "Square", x: 1, y: 2, width: 3, height: 4},
    {toString: "Circle", x: 5, y: 6, radius: 2}
  ]
});

afterAll(async () => {
  await db.pool.end();
});


describe("User tests", () => {
  let email;
  let agent;
  let userId;
  beforeEach(async () => {
    agent = request.agent(server);
    email = makeEmail();
    const response = await agent.post("/accounts/register").send({
      email,
      password: "123"
    }).expect(201);
    
    userId = response.body.user.id;
  });
  
  afterEach(async () => {
    await db.query("DELETE FROM users WHERE email = $1", [email]);
  });
  
  test("User create and log in cycle", async () => {
    const email = makeEmail();
    await agent.post("/accounts/register").send({
      email,
      password: "123"
    }).expect(201);
    
    await agent.post("/accounts/login").send({
      email,
      password: "123"
    }).expect(200);
    
    const user = await agent.get("/accounts/me").expect(200);
    expect(user.body.user.email).toEqual(email);
    
    await agent.post("/accounts/logout").expect(204);
    
    await agent.get("/accounts/me").expect(401);
  });
  
  test("User register email already taken", async () => {
    await agent.post("/accounts/register").send({
      email,
      password: "123"
    }).expect(409)
  });
  
  test("User invalid login", async () => {
    await agent.post("/accounts/login").send({
      email,
      password: "12"
    }).expect(401)
  });
  
  test("Change password", async () => {
    await request(server).post("/accounts/change-password").send({password: "1234", oldPassword: "123"}).expect(401);
    
    await agent.post("/accounts/change-password").send({password: "1234", oldPassword: "12"}).expect(401);
    
    await agent.post("/accounts/change-password").send({password: "1234", oldPassword: "123"}).expect(200);
    
    await agent.get("/accounts/me").expect(401);
    
    await agent.post("/accounts/change-password").send({password: "12345", oldPassword: "1234"}).expect(401);
    
    await agent.post("/accounts/login").send({password: "1234", email}).expect(200);
  });
  
  // Mailer free trial makes this a problem...
  // test("Forgot Password", async () => {
  //   await agent.post("/accounts/forgot-password").send({email: "doesNotExist@email"}).expect(200);
  //
  //   await agent.post("/accounts/forgot-password").send({email: "graphmaker80@gmail.com"}).expect(200);
  // });
  
  test("Reset Password", async () => {
    const {token} = resetTokenStore.createToken(userId);
    
    await agent.post("/accounts/reset-password").send({token, password: "123"}).expect(200);
    
    await agent.post("/accounts/login").send({password: "123", email}).expect(200);
    
    try {
      jest.useFakeTimers();
      const {token: expiredToken, expiresAt} = resetTokenStore.createToken("user-3");
      jest.setSystemTime(expiresAt + 1);
      
      await agent.post("/accounts/reset-password").send({password: "123", token: expiredToken}).expect(401);
    } finally {
      jest.useRealTimers();
    }
  })
  
  
  test("Delete user", async () => {
    await request(server).delete("/accounts/delete").expect(401);
    
    await agent.delete("/accounts/delete").expect(200);
    
    await agent.post("/accounts/login").send({email, password: "123"}).expect(401);
  });
  
});

describe("Graph Tests", () => {
  let agent;
  let userId;
  let sharedGraphIds = [];
  
  beforeEach(async () => {
    agent = request.agent(server);
    const email = makeEmail();
    const response = await agent.post("/accounts/register").send({
      email,
      password: "123"
    }).expect(201);
    
    userId = response.body.user.id;
    sharedGraphIds = [];
    
  });
  
  afterEach(async () => {
    if (userId) {
      await db.query("DELETE FROM graphs WHERE owner_id = $1", [userId]);
      await db.query("DELETE FROM users WHERE id = $1", [userId]);
    }
    if (sharedGraphIds.length) {
      await db.query("DELETE FROM graphs WHERE id = ANY($1)", [sharedGraphIds]);
    }
    userId = undefined;
    sharedGraphIds = [];
  });
  
  test("Sharing and opening graph", async () => {
    await agent.post("/graphs").send({shapes: {}}).expect(400);
    await agent.post("/graphs/oops").expect(404);
    
    const {shapes} = makeGraph();
    
    const data = await agent.post("/graphs").send({shapes}).expect(200);
    const graphId = data.body.id;
    sharedGraphIds.push(graphId);
    
    const {body} = await agent.get(`/graphs/${graphId}`).expect(200);
    expect(body.shapes).toEqual(shapes);
  });
  
  test("Account graph saving and opening. Gettinga all graphs", async () => {
    const graph = makeGraph();
    
    await request(server).post("/accounts/graphs").send({graph}).expect(401);
    
    const response = await agent.post("/accounts/graphs").send({graph}).expect(200);
    const graphId = response.body.id;
    
    await request(server).get(`/accounts/graphs/${graphId}`).expect(401);
    await request(server).get(`/accounts/graphs/oops`).expect(401);
    
    const {body: savedGraph} = await agent.get(`/accounts/graphs/${graphId}`).expect(200);
    
    expect(savedGraph).toEqual(graph);
    
    await request(server).get("/accounts/graphs").expect(401);
    const {body: {graphs}} = await agent.get("/accounts/graphs").expect(200);
    const {body: savedGraph2} = await agent.get(`/accounts/graphs/${graphs[0].id}`).expect(200);
    
    expect(savedGraph2).toEqual(graph);
  });
  
  test("Updating, renaming and deleting graphs", async () => {
    let graph = makeGraph();
    const response = await agent.post("/accounts/graphs").send({graph}).expect(200);
    const graphId = response.body.id;
    
    graph = {name: "New Graph Name", shapes: [...graph.shapes, {toString: "Triangle", x: 10, y: 11, size: 4}]};
    
    await request(server).patch(`/accounts/graphs/${graphId}`).expect(401);
    await request(server).put(`/accounts/graphs/${graphId}`).expect(401);
    await request(server).delete(`/accounts/graphs/${graphId}`).expect(401);
    
    await request(server).patch(`/accounts/graphs/oops`).send({name: "New Graph Name"}).expect(401);
    await request(server).put(`/accounts/graphs/oops`).send({graph}).expect(401);
    await request(server).delete(`/accounts/graphs/oops`).expect(401);
    
    await agent.put(`/accounts/graphs/${graphId}`).send({graph}).expect(200);
    const {body: newGraph} = await agent.get(`/accounts/graphs/${graphId}`).expect(200);
    expect(newGraph).toEqual(graph);
    
    await agent.patch(`/accounts/graphs/${graphId}`).send({name: graph.name}).expect(200);
    const {body: {name}} = await agent.get(`/accounts/graphs/${graphId}`).expect(200);
    expect(name).toEqual(graph.name);
    
    await agent.delete(`/accounts/graphs/${graphId}`).expect(200);
    await agent.get(`/accounts/graphs/${graphId}`).expect(404);
  });
});
