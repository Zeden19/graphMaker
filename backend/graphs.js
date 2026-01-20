const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const DEFAULT_DATA_FILE = path.join(__dirname, "graphs.json");
const ROUND_PRECISION = 3;

const roundNumber = (value) => Number.isFinite(value)
  ? Number(value.toFixed(ROUND_PRECISION))
  : value;

const roundDeep = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => roundDeep(item));
  }
  if (value && typeof value === "object") {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = roundDeep(value[key]);
      return acc;
    }, {});
  }
  if (typeof value === "number") {
    return roundNumber(value);
  }
  return value;
};

const stableStringify = (value) => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  const entries = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
  return `{${entries.join(",")}}`;
};

const normalizeGraphData = (rawGraph) => {
  // TODO: add schema versioning here when graph data evolves.
  const rounded = roundDeep(rawGraph);
  if (!rounded || !Array.isArray(rounded.shapes)) {
    return null;
  }
  const shapesWithKeys = rounded.shapes.map((shape) => ({
    shape,
    key: stableStringify(shape)
  }));
  shapesWithKeys.sort((a, b) => a.key.localeCompare(b.key));
  return {
    ...rounded,
    shapes: shapesWithKeys.map(({shape}) => shape)
  };
};

const hashGraph = (graphData) => {
  const normalized = normalizeGraphData(graphData);
  if (!normalized) return null;
  const payload = stableStringify(normalized);
  return crypto.createHash("sha256").update(payload).digest("hex");
};

const loadGraphs = (graphStore, dataFile) => {
  try {
    const raw = fs.readFileSync(dataFile, "utf8");
    const parsed = JSON.parse(raw);
    Object.entries(parsed).forEach(([id, graph]) => {
      graphStore.set(id, graph);
    });
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to load graphs", error);
    }
  }
};

const saveGraphs = (graphStore, dataFile) => {
  const data = Object.fromEntries(graphStore.entries());
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
};

const createGraphStore = (dataFile = DEFAULT_DATA_FILE) => {
  const graphStore = new Map();
  loadGraphs(graphStore, dataFile);

  const createGraph = (graphData) => {
    const normalized = normalizeGraphData(graphData);
    if (!normalized) {
      return {error: "invalid_graph"};
    }
    const id = hashGraph(normalized);
    if (!id) {
      return {error: "invalid_graph"};
    }
    if (!graphStore.has(id)) {
      graphStore.set(id, normalized);
      saveGraphs(graphStore, dataFile);
    }
    return {id, graph: normalized};
  };

  const getGraph = (graphId) => graphStore.get(graphId);

  return {
    createGraph,
    getGraph
  };
};

module.exports = {
  createGraphStore
};
