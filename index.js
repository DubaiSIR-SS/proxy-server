import http from "http";
import httpProxy from "http-proxy";
import isValidUrl from "./helpers/isValidUrl.mjs";
import { allowedDomains } from "./helpers/constants.mjs";
import dotenv from "dotenv";
dotenv.config();

const proxy = httpProxy.createProxyServer();
const server = http.createServer((req, res) => {
  const origin = req.headers.origin;

  if (allowedDomains.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Api-Key");
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const apiKey = req.headers["x-api-key"] || req.headers["X-Api-Key"];
  if (apiKey !== process.env.API_KEY) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return;
  }

  if (
    req.method === "POST" &&
    req.headers["content-type"] === "application/json"
  ) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const targetUrl = data.url;

        if (!isValidUrl(targetUrl)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: 'Missing "url" in request body' }));
          return;
        }

        const targetHost = new URL(targetUrl).hostname;
        delete req.headers["host"];
        req.headers["host"] = targetHost;

        console.log(`Proxying request to: ${targetUrl}`);
        proxy.web(req, res, { target: targetUrl }, (err) => {
          console.error(`Error proxying request: ${err.message}`);
          res.writeHead(502, { "Content-Type": "text/plain" });
          res.end("Bad Gateway");
        });
      } catch (err) {
        console.error("Error parsing request body:", err.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON body" }));
      }
    });
  } else {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: "Only POST requests with JSON body are allowed" })
    );
  }
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Dynamic proxy server running at http://localhost:${PORT}`);
});
