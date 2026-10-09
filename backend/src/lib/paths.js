import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync, copyFileSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = join(__dirname, "..", ".."); // backend/

/**
 * By default, everything lives inside the backend folder - fine for local
 * development and for hosts with persistent storage.
 *
 * On a host with an EPHEMERAL filesystem (e.g. Render's free tier, which
 * wipes local files on every redeploy AND every time the service spins
 * down from inactivity - see Render's own docs on this), set DATA_DIR to a
 * mounted persistent disk's path (e.g. "/data" on Render) and all content,
 * the admin account, and uploaded files will live there instead, surviving
 * restarts and redeploys.
 */
const DATA_DIR = process.env.DATA_DIR || null;

export const CONTENT_PATH = DATA_DIR
  ? join(DATA_DIR, "content.json")
  : join(BACKEND_ROOT, "src", "data", "content.json");

export const ADMIN_PATH = DATA_DIR
  ? join(DATA_DIR, "admin.json")
  : join(BACKEND_ROOT, "src", "data", "admin.json");

export const UPLOADS_DIR = DATA_DIR
  ? join(DATA_DIR, "uploads")
  : join(BACKEND_ROOT, "uploads");

export const DOWNLOADS_DIR = DATA_DIR
  ? join(DATA_DIR, "downloads")
  : join(BACKEND_ROOT, "public", "downloads");

// The seed content that ships in the repo - used to initialize a fresh
// persistent disk the first time the server runs against it.
const SEED_CONTENT_PATH = join(BACKEND_ROOT, "src", "data", "content.json");

/** Call once at startup. Creates folders and seeds content.json if needed. */
export function ensureDataDirsReady() {
  for (const dir of [dirname(CONTENT_PATH), UPLOADS_DIR, DOWNLOADS_DIR]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
  if (DATA_DIR && !existsSync(CONTENT_PATH)) {
    copyFileSync(SEED_CONTENT_PATH, CONTENT_PATH);
    console.log(`Seeded initial content.json into ${DATA_DIR}`);
  }
}
