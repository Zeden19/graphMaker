export interface ShapeData {
  toString: string;
  [key: string]: unknown;
}

export interface GraphPayload {
  name?: string;
  shapes: ShapeData[];
}

export interface Graph {
  id: string;
  owner_id?: string;
  payload: GraphPayload;
  created_at: string;
  updated_at: string;
}

export type GetGraph = Pick<Graph, "payload" | "id" | "updated_at">;
