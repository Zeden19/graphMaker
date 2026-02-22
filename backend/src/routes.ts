import {createGraphStore} from "./stores/graphs";
import {createUserStore} from "./stores/users";
import {createSessionStore} from "./stores/sessions";
import {createResetTokenStore} from "./stores/passwordResetTokenStore";
import {createCookieStore} from "./stores/cookies";
import {sendPasswordReset} from "./stores/mailer";
import {AppError} from "./errors";
import {RouteObject, Routes} from "./types/server";
import {sendJson} from "./sendJson";
import http from "node:http";
import {GraphPayload} from "./types/graph";
import * as z from "zod";
import {accountGraphBody, accountGraphNameBody, accountLoginBody, changePasswordBody, forgotPasswordBody, resetPasswordBody, shapes} from "./schemas";

const graphStore = createGraphStore();
const userStore = createUserStore();
const sessionStore = createSessionStore();
export const resetTokenStore = createResetTokenStore();
const cookieStoreg = createCookieStore();

async function getSessionUser(req: http.IncomingMessage, required: true): Promise<{ userId: string, id: string }>
async function getSessionUser(req: http.IncomingMessage, required: false): Promise<{ userId: string, id: string } | null>
async function getSessionUser(req: http.IncomingMessage, required = true) {
  const cookies = cookieStoreg.parseCookies(req);
  const sessionId = cookies.session_id;
  if (!sessionId) {
    if (required) throw new AppError("unauthorized")
    else return null;
  }
  const sessionResult = await sessionStore.getSession(sessionId);
  return {userId: sessionResult.session.user_id, id: sessionResult.session.id};
}

const createRoute = <B extends z.ZodTypeAny, P extends ReadonlyArray<string>>(route: RouteObject<B, P>) => {
  return route
};

export const routes: Routes["routes"] = {
  "/health": {GET: ({res}) => sendJson(res, 200, {status: "ok", service: "graphmaker-backend"})},
  
  "/accounts/register": {
    POST:
      createRoute({
        body: accountLoginBody,
        method: async ({res, body}) => {
          
          const result = await userStore.createUser(body.email, body.password);
          
          const sessionResult = await sessionStore.createSession(result.id);
          cookieStoreg.setSessionCookie(res, sessionResult.session);
          return sendJson(res, 201, {user: result});
        }
      })
  },
  
  "/accounts/login": {
    POST: createRoute({
      body: accountLoginBody,
      method: async ({res, body}) => {
        const result = await userStore.logInUser(body.email, body.password);
        
        const sessionResult = await sessionStore.createSession(result.id);
        cookieStoreg.setSessionCookie(res, sessionResult.session);
        return sendJson(res, 200, {user: result});
      }
    })
  },
  
  "/accounts/logout": {
    POST: async ({req, res}) => {
      const cookies = cookieStoreg.parseCookies(req);
      
      const sessionId = cookies.session_id;
      if (!sessionId) {
        cookieStoreg.clearSessionCookie(res);
        return sendJson(res, 204, {success: true});
      }
      
      await sessionStore.deleteSession(sessionId);
      cookieStoreg.clearSessionCookie(res);
      return sendJson(res, 204, {success: true});
    }
  },
  
  "/accounts/me": {
    GET: async ({req, res}) => {
      const session = await getSessionUser(req, false);
      if (!session) return sendJson(res, 200, {user: null});
      const userResult = await userStore.getUser(session.userId);
      return sendJson(res, 200, {user: userResult});
    }
  },
  
  "/accounts/graphs": {
    GET: async ({req, res}) => {
      const session = await getSessionUser(req, true);
      const result = await graphStore.getUserGraphs(session.userId);
      return sendJson(res, 200, {graphs: result.graphs});
    },
    POST: createRoute({
      body: accountGraphBody,
      method: async ({req, res, body}) => {
        const session = await getSessionUser(req, true);
        
        const name = body?.name ?? body.graph?.name ?? "Untitled graph";
        const graphData = {...body.graph, name} as GraphPayload;
        const result = await graphStore.createGraph(graphData, session.userId);
        return sendJson(res, 200, {id: result.id});
      }
    })
  },
  
  "/accounts/graphs/:id": {
    GET: createRoute({
      params: ["id"],
      method: async ({req, res, params: {id}}) => {
        const session = await getSessionUser(req, true);
        
        const result = await graphStore.getUserGraph(id, session.userId);
        return sendJson(res, 200, result.payload);
      }
    }),
    
    PUT: createRoute({
      params: ["id"],
      body: accountGraphBody,
      method: async ({req, res, body, params: {id}}) => {
        const session = await getSessionUser(req, true);
        
        const graphData = {...body.graph, name: body.graph?.name ?? body.name} as GraphPayload;
        await graphStore.updateGraph(id, session.userId, graphData);
        
        return sendJson(res, 200, {success: true});
      },
    }),
    
    PATCH: createRoute({
      params: ["id"],
      body: accountGraphNameBody,
      method: async ({req, res, body, params: {id}}) => {
        const session = await getSessionUser(req, true);
        
        await graphStore.updateGraphName(id, session.userId, body.name);
        return sendJson(res, 200, {success: true});
      }
    }),
    
    DELETE: createRoute({
      params: ["id"],
      method: async ({req, res, params: {id}}) => {
        const session = await getSessionUser(req, true);
        
        await graphStore.deleteUserGraph(id, session.userId);
        
        return sendJson(res, 200, {success: true});
      }
    })
  },
  
  "/accounts/forgot-password": {
    POST: createRoute({
      body: forgotPasswordBody,
      method: async ({res, body}) => {
        let userResult = await userStore.getUserByEmail(body.email);
        
        if (!userResult) {
          return sendJson(res, 200, {success: true});
        }
        
        const {token} = resetTokenStore.createToken(userResult.id);
        const baseUrl = process.env.FRONTEND_BASE_URL ?? "http://localhost:5173";
        const resetURL = `${baseUrl}/reset-password?token=${token}`;
        await sendPasswordReset({to: userResult.email, resetURL});
        return sendJson(res, 200, {success: true});
      }
    })
  },
  
  "/accounts/reset-password": {
    POST: createRoute({
      body: resetPasswordBody,
      method: async ({res, body}) => {
        const user = resetTokenStore.consumeToken(body.token);
        await userStore.resetPassword(user.userId, body.password);
        return sendJson(res, 200, {success: true});
      }
    })
  },
  
  "/accounts/change-password": {
    POST: createRoute({
      body: changePasswordBody,
      method: async ({res, req, body}) => {
        const session = await getSessionUser(req, true);
        
        await userStore.changePassword(session.userId, body.password, body.oldPassword);
        
        cookieStoreg.clearSessionCookie(res);
        await sessionStore.deleteSession(session.id);
        return sendJson(res, 200, {success: true});
      }
    })
  },
  
  "/accounts/delete": {
    DELETE: async ({res, req}) => {
      const session = await getSessionUser(req, true);
      
      // could probably do a toDelete param in the DB and send an email before deleting
      await userStore.deleteUser(session.userId);
      
      return sendJson(res, 200, {success: true});
    }
  },
  
  "/graphs": {
    POST: createRoute({
      body: shapes,
      method: async ({res, body}) => {
        const graph = body as unknown as GraphPayload;
        const result = await graphStore.createGraph(graph);
        return sendJson(res, 200, {id: result.id});
      }
    }),
  },
  
  "/graphs/:id": {
    GET: createRoute({
      params: ["id"],
      method: async ({res, params: {id}}) => {
        const graph = await graphStore.getGraph(id);
        return sendJson(res, 200, graph.payload);
      }
    }),
  }
}