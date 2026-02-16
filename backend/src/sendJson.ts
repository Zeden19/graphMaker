import http = require("node:http");

export const sendJson = (res: http.ServerResponse, statusCode: number, payload: Object) =>  {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  });
  res.end(JSON.stringify(payload));
};
