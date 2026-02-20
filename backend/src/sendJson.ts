import http = require("node:http");

require('dotenv').config({quiet: true});

const origin = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

export const sendJson = (res: http.ServerResponse, statusCode: number, payload: Object) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Vary": "Origin"
  });
  res.end(JSON.stringify(payload));
};
