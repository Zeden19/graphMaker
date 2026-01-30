const {createGraphStore} = require("./stores/graphs");
const {createUserStore} = require("./stores/users");
const {createSessionStore} = require("./stores/sessions");
const {createServer} = require("./createServer");
const {createResetTokenStore} = require("./stores/passwordResetTokenStore");
const {sendPasswordReset} = require("./stores/mailer");
const {createCookieStore} = require("./stores/cookies");

const PORT = process.env.PORT || 3000;
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

createServer({
  port: PORT, hostname: "localhost",
  routes: {
    "/health": {GET: ({res}) => sendJson(res, 200, {status: "ok", service: "graphmaker-backend"})},
    
    "/accounts/register": {
      POST: async ({res, body}) => {
        if (!body?.email || !body?.password) {
          return sendJson(res, 400, {error: "missing_fields"});
        }
        const result = await userStore.createUser(body.email, body.password);
        if (result.error) {
          const status = result.error === "email_taken" ? 409 : 500;
          return sendJson(res, status, {error: result.error});
        }
        
        const sessionResult = await sessionStore.createSession(result.id);
        if (sessionResult.error) {
          return sendJson(res, 500, {error: sessionResult.error});
        }
        cookieStore.setSessionCookie(res, sessionResult.session);
        return sendJson(res, 201, {user: result});
      }
    },
    
    "/accounts/login": {
      POST: async ({res, body}) => {
        if (!body?.email || !body?.password) {
          return sendJson(res, 400, {error: "missing_fields"});
        }
        const result = await userStore.logInUser(body.email, body.password);
        if (result.error) {
          const status = result.error === "invalid_credentials" ? 401 : 500;
          return sendJson(res, status, {error: result.error});
        }
        
        const sessionResult = await sessionStore.createSession(result.id);
        if (sessionResult.error) {
          return sendJson(res, 500, {error: sessionResult.error});
        }
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
        const result = await sessionStore.deleteSession(sessionId);
        if (result.error && result.error !== "not_found") {
          return sendJson(res, 500, {error: result.error});
        }
        cookieStore.clearSessionCookie(res);
        return sendJson(res, 204, {success: true});
      }
    },
    
    "/accounts/me": {
      GET: async ({req, res}) => {
        const session = await sessionStore.getSessionUser(req, cookieStore);
        if (session.error) {
          const status = session.error === "db_error" ? 500 : 401;
          return sendJson(res, status, {error: session.error});
        }
        const userResult = await userStore.getUser(session.userId);
        if (userResult.error) {
          return sendJson(res, 500, {error: userResult.error});
        }
        return sendJson(res, 200, {user: userResult});
      }
    },
    
    "/accounts/graphs": {
      GET: async ({req, res}) => {
        const session = await sessionStore.getSessionUser(req, cookieStore);
        if (session.error) {
          const status = session.error === "db_error" ? 500 : 401;
          return sendJson(res, status, {error: session.error});
        }
        const result = await graphStore.getUserGraphs(session.userId);
        if (result.error) {
          return sendJson(res, 500, {error: result.error});
        }
        return sendJson(res, 200, {graphs: result.graphs});
      },
      POST: async ({req, res, body}) => {
        const session = await sessionStore.getSessionUser(req, cookieStore);
        if (session.error) {
          const status = session.error === "db_error" ? 500 : 401;
          return sendJson(res, status, {error: session.error});
        }
        if (!body?.graph) {
          return sendJson(res, 400, {error: "missing_fields"});
        }
        const name = body?.name ?? body.graph?.name ?? "Untitled graph";
        const graphData = {...body.graph, name};
        const result = await graphStore.createGraph(graphData, session.userId);
        if (result.error) {
          return sendJson(res, 400, {error: result.error});
        }
        return sendJson(res, 200, {id: result.id});
      }
    },
    
    "/accounts/graphs/:id": {
      GET: async ({req, res, url}) => {
        const session = await sessionStore.getSessionUser(req, cookieStore);
        if (session.error) {
          const status = session.error === "db_error" ? 500 : 401;
          return sendJson(res, status, {error: session.error});
        }
        
        const graphId = url.split("/")[3];
        const result = await graphStore.getUserGraph(graphId, session.userId);
        if (result.error) {
          const status = result.error === "not_found" ? 404 : 500;
          return sendJson(res, status, {error: result.error});
        }
        return sendJson(res, 200, result.payload);
      },
      
      PUT: async ({req, res, body, url}) => {
        const session = await sessionStore.getSessionUser(req, cookieStore);
        if (session.error) {
          const status = session.error === "db_error" ? 500 : 401;
          return sendJson(res, status, {error: session.error});
        }
        
        if (!body?.graph) {
          return sendJson(res, 400, {error: "missing_fields"});
        }
        
        const graphId = url.split("/")[3];
        const graphData = {...body.graph, name: body.graph?.name ?? body.name};
        const result = await graphStore.updateGraph(graphId, session.userId, graphData);
        
        if (result.error) {
          const status = result.error === "not_found" ? 404 : 500;
          return sendJson(res, status, {error: result.error});
        }
        return sendJson(res, 200, {success: true});
      },
      
      PATCH: async ({req, res, body, url}) => {
        const session = await sessionStore.getSessionUser(req, cookieStore);
        if (session.error) {
          const status = session.error === "db_error" ? 500 : 401;
          return sendJson(res, status, {error: session.error});
        }
        
        if (!body?.name) {
          return sendJson(res, 400, {error: "missing_fields"});
        }
        
        const graphId = url.split("/")[3];
        const result = await graphStore.updateGraphName(graphId, session.userId, body.name);
        if (result.error) {
          const status = result.error === "not_found" ? 404 : 500;
          return sendJson(res, status, {error: result.error});
        }
        return sendJson(res, 200, {success: true});
      },
      
      DELETE: async ({req, res, url}) => {
        const session = await sessionStore.getSessionUser(req, cookieStore);
        if (session.error) {
          const status = session.error === "db_error" ? 500 : 401;
          return sendJson(res, status, {error: session.error});
        }
        
        const graphId = url.split("/")[3];
        const result = await graphStore.deleteUserGraph(graphId, session.userId);
        if (result.error) {
          const status = result.error === "not_found" ? 404 : 500;
          return sendJson(res, status, {error: result.error});
        }
        
        return sendJson(res, 200, {success: true});
      }
    },
    
    "/accounts/forgot-password": {
      POST: async ({res, body}) => {
        if (!body?.email) {
          return sendJson(res, 400, {error: "missing_fields"});
        }
        
        const userResult = await userStore.getUserByEmail(body.email);
        if (userResult.error === "db_error") {
          return sendJson(res, 500, {error: userResult.error});
        } else if (userResult.error === "not_found") {
          return sendJson(res, 200, {success: true});
        }
        
        const {token} = resetTokenStore.createToken(userResult.id);
        const baseUrl = process.env.FRONTEND_BASE_URL ?? "http://localhost:5173";
        const resetURL = `${baseUrl}/reset-password?token=${token}`;
        try {
          await sendPasswordReset({to: userResult.email, resetURL});
        } catch (e) {
          console.log(e)
          return sendJson(res, 200, {success: true});
        }
        return sendJson(res, 200, {success: true});
      }
    },
    
    "/accounts/reset-password": {
      POST: async ({res, body}) => {
        if (!body?.token || !body?.password) {
          return sendJson(res, 400, {error: "missing_fields"});
        }
        
        const user = resetTokenStore.consumeToken(body.token)
        if (user.error) return sendJson(res, 401, {error: "invalid_token"});
        
        const result = await userStore.resetPassword(user.userId, body.password);
        if (result.error) {
          return sendJson(res, 500, {error: "db_error"});
        }
        return sendJson(res, 200, {success: true});
      }
    },
    
    "/accounts/change-password": {
      POST: async ({res, req, body}) => {
        if (!body?.password || !body?.oldPassword) {
          return sendJson(res, 400, {error: "missing_fields"});
        }
        const session = await sessionStore.getSessionUser(req, cookieStore);
        if (session.error) {
          const status = session.error === "db_error" ? 500 : 401;
          return sendJson(res, status, {error: session.error});
        }
        
        const result = await userStore.changePassword(session.userId, body.password, body.oldPassword);
        if (result.error && result.error === "invalid_credentials") {
          return sendJson(res, 404, {error: "invalid_credentials"});
        } else if (result.error) {
          return sendJson(res, 500, {error: "sever_error"});
        }
        return sendJson(res, 200, {success: true});
      }
    },
    
    "/accounts/delete": {
      DELETE: async ({res, req}) => {
        const session = await sessionStore.getSessionUser(req, cookieStore);
        if (session.error) {
          const status = session.error === "db_error" ? 500 : 401;
          return sendJson(res, status, {error: session.error});
        }
        
        // could probably do a toDelete param in the DB and send an email before deleting
        const result = await userStore.deleteUser(session.userId);
        if (result.error) {
          return sendJson(res, 500, {error: result.error});
        }
        
        return sendJson(res, 200, {success: true});
      }
    },
    
    "/graphs": {
      POST: async ({res, body}) => {
        const result = await graphStore.createGraph(body);
        if (result.error)
          return sendJson(res, 400, {error: result.error});
        return sendJson(res, 200, {id: result.id});
      },
    },
    
    "/graphs/:id": {
      GET: async ({res, url}) => {
        const graphId = url.split("/")[2];
        const graph = await graphStore.getGraph(graphId);
        if (graph.error || !graph.payload) {
          const statusCode = graph.error === "db_error" ? 500 : 404;
          return sendJson(res, statusCode, {error: graph.error ?? "not_found"});
        }
        return sendJson(res, 200, graph.payload);
      },
    }
  }
});
