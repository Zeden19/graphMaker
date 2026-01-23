const http = require("node:http");

const parseBody = (req) => new Promise((resolve, reject) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    if (!body) return resolve(null);
    try {
      resolve(JSON.parse(body));
    } catch (error) {
      reject(error);
    }
  });
  req.on("error", reject);
});

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  res.end(JSON.stringify(payload));
};

const sendNoContent = (res) => {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  res.end();
};

const notFound = (res) => {
  sendJson(res, 404, {error: "not_found"});
};

// Inspired from bun: https://bun.com/docs/runtime/http/server#/
const createServer = ({port, hostname, routes}) => {
  const server = http.createServer(async (req, res) => {
    const {method: methodRequest} = req;
    const requestUrl = new URL(req.url, `http://${hostname}`);
    let url = requestUrl.pathname;

    let body;
    try {
      body = await parseBody(req);
    } catch (e) {
      sendJson(res, 400, {error: "invalid_json"});
      return;
    }

    const foundRoute = Object.entries(routes).find(([endpoint]) => {

      const dynamic = endpoint.indexOf(":");
      if (dynamic >= 0) {
        endpoint = endpoint.slice(0, dynamic);
        return endpoint === url.replace(url.slice(dynamic), "");
      }
      return endpoint === url;
    });

    if (!foundRoute) {
      notFound(res);
      return;
    }

    const [_, caller] = foundRoute;

    if (methodRequest === "OPTIONS") {
      sendNoContent(res);
      return;
    }

    if (typeof caller === "function") {
      caller({req, res, body, url});
      return;
    }

    const handler = caller[methodRequest];
    if (!handler) return notFound(res);
    handler({req, res, body, url});
  });

  server.listen(port, hostname, () => {
    console.log(`GraphMaker backend listening on port http://${hostname}:${port}`);
  });
}

module.exports = {createServer};
