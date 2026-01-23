const crypto = require("crypto");
const {pool: db} = require("./db");

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
  const payload = stableStringify(graphData);
  return crypto.createHash("sha256").update(payload).digest("hex");
};

const createGraphStore = () => {
  const createGraph = async (graphData, ownerId = null) => {
    const normalized = normalizeGraphData(graphData);
    if (!normalized) return {error: "invalid_graph"};

    const id = hashGraph(normalized);
    if (!id) return {error: "invalid_graph"};

    try {
      await db.query(
        `INSERT INTO graphs (id, owner_id, payload)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [id, ownerId, normalized]
      );
      return {id};
    } catch {
      return {error: "db_error"};
    }
  };

  const getGraph = async (graphId) => {
    try {
      const result = await db.query(
        `SELECT payload
         FROM graphs
         WHERE id = $1
         AND owner_id IS NULL`,
        [graphId]
      );
      if (result.rows.length === 0) {
        return {error: "not_found"};
      }

      return {payload: result.rows[0]?.payload ?? null};
    } catch {
      return {error: "db_error"};
    }
  };

  return {
    createGraph,
    getGraph
  };
};

module.exports = {
  createGraphStore
};
