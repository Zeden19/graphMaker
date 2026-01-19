const http = require("http");

const PORT = process.env.PORT || 3000;

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
};

const notFound = (res) => {
  sendJson(res, 404, { error: "not_found" });
};

const notImplemented = (res) => {
  sendJson(res, 501, { error: "not_implemented" });
};

const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (method === "GET" && url === "/health") {
    return sendJson(res, 200, { status: "ok", service: "graphmaker-backend" });
  }

  // Account endpoints (stubs)
  if (method === "POST" && url === "/accounts/register") {
    return notImplemented(res);
  }

  if (method === "POST" && url === "/accounts/login") {
    return notImplemented(res);
  }

  if (method === "POST" && url === "/accounts/logout") {
    return notImplemented(res);
  }

  if (method === "GET" && url === "/accounts/me") {
    return notImplemented(res);
  }

  // Graph endpoints (stubs)
  if (method === "GET" && url === "/graphs") {
    return notImplemented(res);
  }

  if (method === "POST" && url === "/graphs") {
    return notImplemented(res);
  }

  if (method === "GET" && url.startsWith("/graphs/")) {
    return notImplemented(res);
  }

  if (method === "PUT" && url.startsWith("/graphs/")) {
    return notImplemented(res);
  }

  if (method === "DELETE" && url.startsWith("/graphs/")) {
    return notImplemented(res);
  }

  return notFound(res);
});

server.listen(PORT, () => {
  console.log(`GraphMaker backend listening on port ${PORT}`);
});
