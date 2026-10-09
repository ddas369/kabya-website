import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Tiny JSON-file "database".
 *
 * This project stores its content in plain JSON files under src/data/ so the
 * whole site works out of the box with zero external services. It is
 * intentionally isolated behind this one module: every read/write in the app
 * goes through readJson/writeJson, so swapping this for a real database later
 * (Postgres, MongoDB, etc.) means rewriting this one file, not every route.
 */

// A private sentinel, not `undefined`/`null`, so callers can pass those as a
// real, honored fallback value (e.g. "return null if the file is missing").
const NO_FALLBACK = Symbol("no-fallback");

export function readJson(filePath, fallback = NO_FALLBACK) {
  try {
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT" && fallback !== NO_FALLBACK) {
      return fallback;
    }
    throw err;
  }
}

export function writeJson(filePath, data) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  // Write to a temp file then rename, so a crash mid-write can never leave
  // behind a half-written, corrupted JSON file.
  const tmpPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf-8");
  renameSync(tmpPath, filePath);
  return data;
}
