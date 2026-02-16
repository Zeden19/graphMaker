import {test, expect, beforeEach, afterEach, afterAll} from "@jest/globals";
import {createGraphStore} from "../stores/graphs";
import {createUserStore} from "../stores/users";
import {db} from "../stores/db";
import {GraphPayload} from "../types/graph";

const graphStore = createGraphStore();
const userStore = createUserStore();

const makeEmail = () => `test+${Date.now()}-${Math.random().toString(16).slice(2)}@email.com`;

const makeGraph = (name = "Test graph") : GraphPayload => ({
  name,
  shapes: [
    {toString: "Square", x: 1, y: 2, width: 3, height: 4},
    {toString: "Circle", x: 5, y: 6, radius: 2}
  ]
});

let userId : string;
let sharedGraphIds : String[] = [];

beforeEach(async () => {
  const user = await userStore.createUser(makeEmail(), "123");
  userId = user.id;
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
  sharedGraphIds = [];
});

afterAll(async () => {
  await db.end();
});

test("Create and fetch shared graph", async () => {
  const graph = makeGraph("Shared");
  const {id} = await graphStore.createGraph(graph);
  sharedGraphIds.push(id);

  const {payload} = await graphStore.getGraph(id);
  expect(payload.name).toBe("Shared");
  expect(payload.shapes.length).toBe(2);
});

test("Create shared graph with invalid payload", async () => {
  // @ts-ignore
  await expect(graphStore.createGraph({})).rejects.toMatchObject({code: "invalid_graph"});
});

test("Same shapes yield same hash id", async () => {
  const base = makeGraph("First");
  const {id: firstId} = await graphStore.createGraph(base);
  sharedGraphIds.push(firstId);

  const second = makeGraph("Second name");
  const {id: secondId} = await graphStore.createGraph(second);
  expect(secondId).toBe(firstId);
});

test("Create and fetch user graph", async () => {
  const graph = makeGraph("Owned");
  const {id} = await graphStore.createGraph(graph, userId);

  const {payload} = await graphStore.getUserGraph(id, userId);
  expect(payload.name).toBe("Owned");
});

test("Get user graphs list", async () => {
  const {id} = await graphStore.createGraph(makeGraph("List graph"), userId);

  const result = await graphStore.getUserGraphs(userId);
  expect(result.graphs.length).toBe(1);
  expect(result.graphs[0].id).toBe(id);
});

test("Update graph name", async () => {
  const {id} = await graphStore.createGraph(makeGraph("Old"), userId);
  await graphStore.updateGraphName(id, userId, "New name");

  const {payload} = await graphStore.getUserGraph(id, userId);
  expect(payload.name).toBe("New name");
});

test("Update graph payload", async () => {
  const {id} = await graphStore.createGraph(makeGraph("Initial"), userId);
  const updated = makeGraph("Updated");
  updated.shapes.push({toString: "Triangle", x: 10, y: 11, size: 4});

  await graphStore.updateGraph(id, userId, updated);
  const {payload} = await graphStore.getUserGraph(id, userId);
  expect(payload.shapes.length).toBe(3);
});

test("Delete user graph", async () => {
  const {id} = await graphStore.createGraph(makeGraph("To delete"), userId);
  await graphStore.deleteUserGraph(id, userId);

  await expect(graphStore.getUserGraph(id, userId)).rejects.toMatchObject({code: "not_found"});
});
