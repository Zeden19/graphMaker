import crypto from "crypto";
import {db} from "./db";
import {AppError} from "../errors";
import type {GetGraph, GraphPayload, ShapeData} from "../types/graph";
import {QueryResult} from "pg";

const ROUND_PRECISION = 3;

const roundNumber = (value: number) => Number.isFinite(value)
  ? Number(value.toFixed(ROUND_PRECISION))
  : value;

const roundDeep = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => roundDeep(item));
  }
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).reduce((acc, key) => {
      const record = value as Record<string, unknown>;
      acc[key] = roundDeep(record[key]);
      return acc;
    }, {} as Record<string, unknown>);
  }
  if (typeof value === "number") {
    return roundNumber(value);
  }
  return value;
};

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const entries = keys.map((key) => {
    const record = value as Record<string, unknown>;
    return `${JSON.stringify(key)}:${stableStringify(record[key])}`;
  });
  return `{${entries.join(",")}}`;
};

const isGraphPayload = (value: unknown): value is GraphPayload => {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return Array.isArray(record.shapes);
};

const normalizeGraphData = (rawGraph: GraphPayload): GraphPayload | null => {
  // TODO: add schema versioning here when graph data evolves.
  const rounded = roundDeep(rawGraph);
  if (!isGraphPayload(rounded)) {
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

const hashGraph = (shapes: ShapeData[]) => {
  const payload = stableStringify(shapes);
  return crypto.createHash("sha256").update(payload).digest("hex");
};

const createGraphStore = () => {
  const createGraph = async (graphData: GraphPayload, ownerId: string | null = null) => {
    const normalized = normalizeGraphData(graphData);
    if (!normalized) throw new AppError("invalid_graph");
    
    const id = hashGraph(normalized.shapes);
    if (!id) throw new AppError("invalid_graph");
    
    try {
      await db.query(
        `INSERT INTO graphs (id, owner_id, payload)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [id, ownerId, normalized]
      );
      return {id};
    } catch (e) {
      throw new AppError("db_error", "Create Graph Database error", e);
    }
  };
  
  const getGraph = async (graphId: string) => {
    let result: QueryResult<GetGraph>;
    try {
      result = await db.query(
        `SELECT payload
         FROM graphs
         WHERE id = $1
           AND owner_id IS NULL`,
        [graphId]
      );
    } catch (e) {
      throw new AppError("db_error", "Get Graph Database error", e);
    }
    if (result.rows.length === 0) {
      throw new AppError("not_found");
    }
    
    return {payload: result.rows[0]?.payload ?? null};
  };
  
  const getUserGraph = async (graphId: string, userId: string) => {
    let result: QueryResult<GetGraph>;
    try {
      result = await db.query(
        `SELECT payload
         FROM graphs
         WHERE id = $1
           AND owner_id = $2`,
        [graphId, userId]
      );
    } catch (e) {
      throw new AppError("db_error", "Get User Graph Database error", e);
    }
    if (result.rows.length === 0) {
      throw new AppError("not_found");
    }
    return {payload: result.rows[0]?.payload ?? null};
  };
  
  const getUserGraphs = async (userId: string) => {
    try {
      const result = await db.query<GetGraph>(
        `SELECT id,
                payload ->> 'name' AS name,
                updated_at
         FROM graphs
         WHERE owner_id = $1
         ORDER BY updated_at DESC`,
        [userId]
      );
      return {graphs: result.rows};
    } catch (e) {
      throw new AppError("db_error", "Get User Graphs Database error", e);
    }
  };
  
  const deleteUserGraph = async (graphId: string, userId: string) => {
    let result: QueryResult<never>;
    try {
      result = await db.query(
        `DELETE
         FROM graphs
         WHERE id = $1
           AND owner_id = $2`,
        [graphId, userId]
      );
    } catch (e) {
      throw new AppError("db_error", "Delete User Graphs Database error", e );
    }
    if (result.rowCount === 0) throw new AppError("not_found");
    
    return {graphs: result.rows};
  };
  
  const updateGraphName = async (graphId: string, userId: string, name: string) => {
    let result: QueryResult<never>;
    try {
      result = await db.query(
        `UPDATE graphs
         SET payload    = jsonb_set(payload, '{name}', to_jsonb($1::text), true),
             updated_at = NOW()
         WHERE id = $2
           AND owner_id = $3`,
        [name, graphId, userId]
      );
    } catch (e) {
      throw new AppError("db_error", "Update Graph Name Database error", e);
    }
    if (result.rowCount === 0) throw new AppError("not_found");
    return {success: true};
  };
  
  const updateGraph = async (graphId: string, userId: string, graphData: GraphPayload) => {
    const normalized = normalizeGraphData(graphData);
    if (!normalized) throw new AppError("invalid_graph");
    let result: QueryResult<never>;
    try {
      result = await db.query(
        `UPDATE graphs
         SET payload    = $1,
             updated_at = NOW()
         WHERE id = $2
           AND owner_id = $3`,
        [normalized, graphId, userId]
      );
    } catch (e) {
      throw new AppError("db_error", "Update Graph Database error", e);
    }
    if (result.rowCount === 0) throw new AppError("not_found");
    return {success: true};
  };
  
  return {
    createGraph,
    getGraph,
    getUserGraph,
    getUserGraphs,
    updateGraphName,
    updateGraph,
    deleteUserGraph
  };
};

export {createGraphStore};

module.exports = {
  createGraphStore
};
