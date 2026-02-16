export interface Session {
  id: string;
  user_id: string;
  created_at: string;
  expires_at: string;
}

export type GetSession = Pick<Session, "id" | "expires_at" | "user_id">
