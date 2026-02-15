const {createGraphStore} = require("./stores/graphs");
const {createUserStore} = require("./stores/users");
const {createSessionStore} = require("./stores/sessions");
const {createResetTokenStore} = require("./stores/passwordResetTokenStore");
const {createCookieStore} = require("./stores/cookies");
const {sendPasswordReset} = require("./stores/mailer")
const {AppError} = require("./errors")

const graphStore = createGraphStore();
const userStore = createUserStore();
const sessionStore = createSessionStore();
const resetTokenStore = createResetTokenStore();
const cookieStore = createCookieStore();

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  });
  res.end(JSON.stringify(payload));
};

const routes = {
  "/health": {GET: ({res}) => sendJson(res, 200, {status: "ok", service: "graphmaker-backend"})},
  
  "/accounts/register": {
    POST: async ({res, body}) => {
      if (!body?.email || !body?.password) {
        throw new AppError("missing_fields");
      }
      const result = await userStore.createUser(body.email, body.password);
      
      const sessionResult = await sessionStore.createSession(result.id);
      cookieStore.setSessionCookie(res, sessionResult.session);
      return sendJson(res, 201, {user: result});
    }
  },
  
  "/accounts/login": {
    POST: async ({res, body}) => {
      if (!body?.email || !body?.password) {
        throw new AppError("missing_fields");
      }
      const result = await userStore.logInUser(body.email, body.password);
      
      const sessionResult = await sessionStore.createSession(result.id);
      cookieStore.setSessionCookie(res, sessionResult.session);
      return sendJson(res, 200, {user: result});
    }
  },
  
  "/accounts/logout": {
    POST: async ({req, res}) => {
      const cookies = cookieStore.parseCookies(req);
      const sessionId = cookies.session_id;
      if (!sessionId) {
        cookieStore.clearSessionCookie(res);
        return sendJson(res, 204, {success: true});
      }
      try {
        await sessionStore.deleteSession(sessionId);
      } catch (error) {
        if (error?.code !== "not_found") {
          throw error;
        }
      }
      cookieStore.clearSessionCookie(res);
      return sendJson(res, 204, {success: true});
    }
  },
  
  "/accounts/me": {
    GET: async ({req, res}) => {
      const session = await sessionStore.getSessionUser(req, cookieStore);
      const userResult = await userStore.getUser(session.userId);
      return sendJson(res, 200, {user: userResult});
    }
  },
  
  "/accounts/graphs": {
    GET: async ({req, res}) => {
      const session = await sessionStore.getSessionUser(req, cookieStore);
      const result = await graphStore.getUserGraphs(session.userId);
      return sendJson(res, 200, {graphs: result.graphs});
    },
    POST: async ({req, res, body}) => {
      const session = await sessionStore.getSessionUser(req, cookieStore);
      if (!body?.graph) {
        throw new AppError("missing_fields");
      }
      const name = body?.name ?? body.graph?.name ?? "Untitled graph";
      const graphData = {...body.graph, name};
      const result = await graphStore.createGraph(graphData, session.userId);
      return sendJson(res, 200, {id: result.id});
    }
  },
  
  "/accounts/graphs/:id": {
    GET: async ({req, res, url}) => {
      const session = await sessionStore.getSessionUser(req, cookieStore);
      
      const graphId = url.split("/")[3];
      const result = await graphStore.getUserGraph(graphId, session.userId);
      return sendJson(res, 200, result.payload);
    },
    
    PUT: async ({req, res, body, url}) => {
      const session = await sessionStore.getSessionUser(req, cookieStore);
      
      if (!body?.graph) {
        throw new AppError("missing_fields");
      }
      
      const graphId = url.split("/")[3];
      const graphData = {...body.graph, name: body.graph?.name ?? body.name};
      await graphStore.updateGraph(graphId, session.userId, graphData);
      
      return sendJson(res, 200, {success: true});
    },
    
    PATCH: async ({req, res, body, url}) => {
      const session = await sessionStore.getSessionUser(req, cookieStore);
      
      if (!body?.name) {
        throw new AppError("missing_fields");
      }
      
      const graphId = url.split("/")[3];
      await graphStore.updateGraphName(graphId, session.userId, body.name);
      return sendJson(res, 200, {success: true});
    },
    
    DELETE: async ({req, res, url}) => {
      const session = await sessionStore.getSessionUser(req, cookieStore);
      
      const graphId = url.split("/")[3];
      await graphStore.deleteUserGraph(graphId, session.userId);
      
      return sendJson(res, 200, {success: true});
    }
  },
  
  "/accounts/forgot-password": {
    POST: async ({res, body}) => {
      if (!body?.email) {
        throw new AppError("missing_fields");
      }
      
      let userResult;
      try {
        userResult = await userStore.getUserByEmail(body.email);
      } catch (error) {
        if (error?.code === "not_found") {
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
      if (!body?.token || !body?.password) {
        throw new AppError("missing_fields");
      }
      
      const user = resetTokenStore.consumeToken(body.token);
      await userStore.resetPassword(user.userId, body.password);
      return sendJson(res, 200, {success: true});
    }
  },
  
  "/accounts/change-password": {
    POST: async ({res, req, body}) => {
      if (!body?.password || !body?.oldPassword) {
        throw new AppError("missing_fields");
      }
      const session = await sessionStore.getSessionUser(req, cookieStore);
      
      await userStore.changePassword(session.userId, body.password, body.oldPassword);
      
      cookieStore.clearSessionCookie(res);
      try {
        await sessionStore.deleteSession(session.id);
      } catch (error) {
        if (error?.code !== "not_found") {
          throw error;
        }
      }
      return sendJson(res, 200, {success: true});
    }
  },
  
  "/accounts/delete": {
    DELETE: async ({res, req}) => {
      const session = await sessionStore.getSessionUser(req, cookieStore);
      
      // could probably do a toDelete param in the DB and send an email before deleting
      await userStore.deleteUser(session.userId);
      
      return sendJson(res, 200, {success: true});
    }
  },
  
  "/graphs": {
    POST: async ({res, body}) => {
      const result = await graphStore.createGraph(body);
      return sendJson(res, 200, {id: result.id});
    },
  },
  
  "/graphs/:id": {
    GET: async ({res, url}) => {
      const graphId = url.split("/")[2];
      const graph = await graphStore.getGraph(graphId);
      return sendJson(res, 200, graph.payload);
    },
  }
}

module.exports = {
  routes,
  resetTokenStore
}