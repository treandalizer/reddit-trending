import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  let captured: any;
  const originalJson = res.json;
  res.json = function (body, ...args) {
    captured = body;
    return originalJson.apply(res, [body, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      let line = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;
      if (captured) line += ` :: ${JSON.stringify(captured)}`;
      console.log(line);
    }
  });
  next();
});

// Register API routes
(async () => {
  await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
    console.error("Error:", err.message);
  });

  // Serve built frontend — points to dist/public relative to dist/index.js
  const distPath = path.join(__dirname, "public");
  app.use(express.static(distPath));
  app.use("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));

  const port = 5000;
  const host = "0.0.0.0";
  app.listen(port, host, () => {
    console.log(`Serving on http://${host}:${port}`);
  });
})();