import type { RequestHandler } from "express";
import { config } from "../config.js";

export const requireApiKey: RequestHandler = (req, res, next) => {
  const expected = config.apiKey.trim();
  if (!expected) return next();
  const got = String(req.header("x-api-key") ?? "").trim();
  if (!got || got !== expected) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  next();
};

export const requireWritesEnabled: RequestHandler = (_req, res, next) => {
  if (!config.writeEnabled) {
    return res.status(503).json({ success: false, error: "Writes disabled (CIRCUIT_WRITE_ENABLED=false)" });
  }
  next();
};

