const {createGraphStore} = require("./graphs");
const {createUserStore} = require("./users");
const {createServer} = require("./createServer");

const PORT = process.env.PORT || 3000;
const graphStore = createGraphStore();
const userStore = createUserStore();

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

createServer({
  port: PORT, hostname: "localhost",
  routes: {
    "/health": {GET: ({res}) => sendJson(res, 200, {status: "ok", service: "graphmaker-backend"})},

    "/accounts/register": {POST: ({res}) => notImplemented(res)},

    "/accounts/login": {POST: ({res}) => notImplemented(res)},

    "/accounts/logout": {POST: ({res}) => notImplemented(res)},

    "/accounts/me": {POST: ({res}) => notImplemented(res)},

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
