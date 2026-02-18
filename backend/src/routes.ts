import {createGraphStore} from "./stores/graphs";
import {createUserStore} from "./stores/users";
import {createSessionStore} from "./stores/sessions";
import {createResetTokenStore} from "./stores/passwordResetTokenStore";
import {createCookieStore} from "./stores/cookies";
import {sendPasswordReset} from "./stores/mailer";
import {AppError} from "./errors";
import {Args} from "./types/server";
import {sendJson} from "./sendJson";
import http from "node:http";
import {GraphPayload} from "./types/graph";

const graphStore = createGraphStore();
const userStore = createUserStore();
const sessionStore = createSessionStore();
export const resetTokenStore = createResetTokenStore();
const cookieStoreg = createCookieStore();

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const getSessionUser = async (req: http.IncomingMessage) => {
  const cookies = cookieStoreg.parseCookies(req);
  const sessionId = cookies.session_id;
  if (!sessionId) throw new AppError("unauthorized");
  const sessionResult = await sessionStore.getSession(sessionId);
  return {userId: sessionResult.session.user_id, id: sessionResult.session.id};
};

export const routes: Args["routes"] = {
  "/health": {GET: ({res}) => sendJson(res, 200, {status: "ok", service: "graphmaker-backend"})},
  
  "/accounts/register": {
    POST: async ({res, body}) => {
      if (typeof body?.email !== "string" || typeof body?.password !== "string") {
        throw new AppError("missing_fields");
      }
      
      const result = await userStore.createUser(body.email, body.password);
      
      const sessionResult = await sessionStore.createSession(result.id);
      cookieStoreg.setSessionCookie(res, sessionResult.session);
      return sendJson(res, 201, {user: result});
    }
  },
  
  "/accounts/login": {
    POST: async ({res, body}) => {
      if (typeof body?.email !== "string" || typeof body?.password !== "string") {
        throw new AppError("missing_fields");
      }
      const result = await userStore.logInUser(body.email, body.password);
      
      const sessionResult = await sessionStore.createSession(result.id);
      cookieStoreg.setSessionCookie(res, sessionResult.session);
      return sendJson(res, 200, {user: result});
    }
  },
  
  "/accounts/logout": {
    POST: async ({req, res}) => {
      const cookies = cookieStoreg.parseCookies(req);
      
      const sessionId = cookies.session_id;
      if (!sessionId) {
        cookieStoreg.clearSessionCookie(res);
        return sendJson(res, 204, {success: true});
      }
      try {
        await sessionStore.deleteSession(sessionId);
      } catch (error) {
        throw error;
      }
      cookieStoreg.clearSessionCookie(res);
      return sendJson(res, 204, {success: true});
    }
  },
  
  "/accounts/me": {
    GET: async ({req, res}) => {
      const session = await getSessionUser(req);
      const userResult = await userStore.getUser(session.userId);
      return sendJson(res, 200, {user: userResult});
    }
  },
  
  "/accounts/graphs": {
    GET: async ({req, res}) => {
      const session = await getSessionUser(req);
      const result = await graphStore.getUserGraphs(session.userId);
      return sendJson(res, 200, {graphs: result.graphs});
    },
    POST: async ({req, res, body}) => {
      const session = await getSessionUser(req);
      
      if (!isObject(body?.graph) || !body?.graph.shapes) {
        throw new AppError("missing_fields");
      }
      
      const name = body?.name ?? body.graph?.name ?? "Untitled graph";
      const graphData = {...body.graph, name} as GraphPayload;
      const result = await graphStore.createGraph(graphData, session.userId);
      return sendJson(res, 200, {id: result.id});
    }
  },
  
  "/accounts/graphs/:id": {
    GET: async ({req, res, params: {id}}) => {
      if (typeof id !== "string") throw new AppError("not_found")
      
      const session = await getSessionUser(req);
      
      const result = await graphStore.getUserGraph(id, session.userId);
      return sendJson(res, 200, result.payload);
    },
    
    PUT: async ({req, res, body, params: {id}}) => {
      const session = await getSessionUser(req);
      
      if (!isObject(body?.graph) || !body?.graph.shapes) {
        throw new AppError("missing_fields");
      }
      
      if (typeof id !== "string") throw new AppError("not_found")
      
      const graphData = {...body.graph, name: body.graph?.name ?? body.name} as GraphPayload;
      await graphStore.updateGraph(id, session.userId, graphData);
      
      return sendJson(res, 200, {success: true});
    },
    
    PATCH: async ({req, res, body, params: {id}}) => {
      const session = await getSessionUser(req);
      
      if (typeof body?.name !== "string") {
        throw new AppError("missing_fields");
      }
      
      if (typeof id !== "string") throw new AppError("not_found")
      
      
      await graphStore.updateGraphName(id, session.userId, body.name);
      return sendJson(res, 200, {success: true});
    },
    
    DELETE: async ({req, res, params: {id}}) => {
      if (typeof id !== "string") throw new AppError("not_found");
      const session = await getSessionUser(req);
      
      await graphStore.deleteUserGraph(id, session.userId);
      
      return sendJson(res, 200, {success: true});
    }
  },
  
  "/accounts/forgot-password": {
    POST: async ({res, body}) => {
      if (typeof body?.email !== "string") {
        throw new AppError("missing_fields");
      }
      
      let userResult;
      try {
        userResult = await userStore.getUserByEmail(body.email);
      } catch (error) {
        if (error instanceof AppError && error?.code === "not_found") {
          return sendJson(res, 200, {success: true});
        }
        throw error;
      }
      
      const {token} = resetTokenStore.createToken(userResult.id);
      const baseUrl = process.env.FRONTEND_BASE_URL ?? "http://localhost:5173";
      const resetURL = `${baseUrl}/reset-password?token=${token}`;
      await sendPasswordReset({to: userResult.email, resetURL});
      return sendJson(res, 200, {success: true});
    }
  },
  
  "/accounts/reset-password": {
    POST: async ({res, body}) => {
      if (typeof body?.token !== "string" || typeof body?.password !== "string") {
        throw new AppError("missing_fields");
      }
      
      const user = resetTokenStore.consumeToken(body.token);
      await userStore.resetPassword(user.userId, body.password);
      return sendJson(res, 200, {success: true});
    }
  },
  
  "/accounts/change-password": {
    POST: async ({res, req, body}) => {
      if (typeof body?.password !== "string" || typeof body?.oldPassword !== "string") {
        throw new AppError("missing_fields");
      }
      const session = await getSessionUser(req);
      
      await userStore.changePassword(session.userId, body.password, body.oldPassword);
      
      cookieStoreg.clearSessionCookie(res);
      try {
        await sessionStore.deleteSession(session.id);
      } catch (error) {
        throw error;
      }
      return sendJson(res, 200, {success: true});
    }
  },
  
  "/accounts/delete": {
    DELETE: async ({res, req}) => {
      const session = await getSessionUser(req);
      
      // could probably do a toDelete param in the DB and send an email before deleting
      await userStore.deleteUser(session.userId);
      
      return sendJson(res, 200, {success: true});
    }
  },
  
  "/graphs": {
    POST: async ({res, body}) => {
      if (!body?.shapes) {
        throw new AppError("missing_fields");
      }
      
      const graph = body as unknown as GraphPayload;
      const result = await graphStore.createGraph(graph);
      return sendJson(res, 200, {id: result.id});
    },
  },
  
  "/graphs/:id": {
    GET: async ({res, params: {id}}) => {
      if (typeof id !== "string") throw new AppError("not_found")
      
      const graph = await graphStore.getGraph(id);
      return sendJson(res, 200, graph.payload);
    },
  }
}