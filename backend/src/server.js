const {createGraphStore} = require("./stores/graphs");
const {createUserStore} = require("./stores/users");
const {createSessionStore} = require("./stores/sessions");
const {createServer} = require("./createServer");

const PORT = process.env.PORT || 3000;
const graphStore = createGraphStore();
const userStore = createUserStore();
const sessionStore = createSessionStore();

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  res.end(JSON.stringify(payload));
};

const notImplemented = (res) => {
  sendJson(res, 501, {error: "not_implemented"});
};

const parseCookies = (req) => {
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce((acc, pair) => {
    const [key, ...rest] = pair.trim().split("=");
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
};

const setSessionCookie = (res, session) => {
  const expires = new Date(session.expires_at).toUTCString();
  res.setHeader(
    "Set-Cookie",
    `session_id=${session.id}; HttpOnly; SameSite=Lax; Path=/; ${process.env.NODE_ENV === "prod" ? "Secure;" : ''} Expires=${expires}`
  );
};

const clearSessionCookie = (res) => {
  res.setHeader(
    "Set-Cookie",
    `session_id=; HttpOnly; SameSite=Lax; Path=/; ${process.env.NODE_ENV === "prod" ? "Secure;" : ''} Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );
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
        setSessionCookie(res, sessionResult.session);
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
        setSessionCookie(res, sessionResult.session);
        return sendJson(res, 200, {user: result});
      }
    },

    "/accounts/logout": {
      POST: async ({req, res}) => {
        const cookies = parseCookies(req);
        const sessionId = cookies.session_id;
        if (!sessionId) {
          clearSessionCookie(res);
          return sendJson(res, 204, {success: true});
        }
        const result = await sessionStore.deleteSession(sessionId);
        if (result.error && result.error !== "not_found") {
          return sendJson(res, 500, {error: result.error});
        }
        clearSessionCookie(res);
        return sendJson(res, 204, {success: true});
      }
    },

    "/accounts/me": {
      GET: async ({req, res}) => {
        const cookies = parseCookies(req);
        const sessionId = cookies.session_id;
        if (!sessionId) {
          return sendJson(res, 401, {error: "unauthorized"});
        }
        const sessionResult = await sessionStore.getSession(sessionId);
        if (sessionResult.error) {
          const status = sessionResult.error === "db_error" ? 500 : 401;
          return sendJson(res, status, {error: sessionResult.error});
        }
        const userResult = await userStore.getUser(sessionResult.session.user_id);
        if (userResult.error) {
          const status = userResult.error === "db_error" ? 500 : 404;
          return sendJson(res, status, {error: userResult.error});
        }
        return sendJson(res, 200, {user: userResult});
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

      PUT: ({res}) => notImplemented(res),

      DELETE: ({res}) => notImplemented(res)
    }
  }
});
