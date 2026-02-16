// https://pgtyped.dev/docs/

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export type UserCreate = Pick<User, "id" | "email" | "created_at">;
export type LoginUser = Pick<User, "id" | "email" | "password_hash">;
export type GetUser = Pick<User, "id" | "email" | "created_at" | "updated_at">;
export type ChangeUserPassword = Pick<User, "id" | "email" | "password_hash">;