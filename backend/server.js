import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import publicRoutes from "./src/routes/public.js";
import translateRoutes from "./src/routes/translate.js";
import grammarRoutes from "./src/routes/grammar.js";
import authRoutes from "./src/routes/auth.js";
import adminRoutes from "./src/routes/admin.js";
import { isAdminConfigured, setAdminPassword } from "./src/lib/adminStore.js";
import { UPLOADS_DIR, DOWNLOADS_DIR, ensureDataDirsReady } from "./src/lib/paths.js";

ensureDataDirsReady();

const app = express();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "change-this-to-a-long-random-string") {
  console.warn(
    "\n⚠️  JWT_SECRET is missing or still set to the example value.\n" +
      "   Set a real random string in backend/.env before deploying.\n"
  );
}

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: allowedOrigins }));
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));

// Uploaded images and the APK are served as plain static files.
app.use("/uploads", express.static(UPLOADS_DIR));
app.use("/downloads", express.static(DOWNLOADS_DIR));

app.use("/api", publicRoutes);
app.use("/api", translateRoutes);
app.use("/api", grammarRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ name: "Kabya website API", status: "running" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found." });
});

// Centralized error handler - every route above calls next(err) on failure.
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || (err.message?.includes("allowed") ? 400 : 500);
  res.status(status).json({ error: err.message || "Something went wrong." });
});

// Many free hosts don't give you a terminal to run `npm run set-admin-password`,
// and some (like Render's free tier) wipe the disk on every redeploy anyway.
// So on startup, if there's no admin account yet, create one from
// ADMIN_USERNAME / ADMIN_PASSWORD env vars when both are set. This makes the
// account "self-heal" after every redeploy on hosts with ephemeral storage.
async function bootstrapAdminFromEnv() {
  if (isAdminConfigured()) return;
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
  if (ADMIN_USERNAME && ADMIN_PASSWORD) {
    if (ADMIN_PASSWORD.length < 8) {
      console.warn("⚠️  ADMIN_PASSWORD is set but shorter than 8 characters - ignoring it.");
      return;
    }
    await setAdminPassword(ADMIN_USERNAME, ADMIN_PASSWORD);
    console.log(`Admin account created from environment variables (username: "${ADMIN_USERNAME}").`);
  }
}

const PORT = process.env.PORT || 4000;

bootstrapAdminFromEnv().then(() => {
  app.listen(PORT, () => {
    console.log(`Kabya API listening on http://localhost:${PORT}`);
    if (!isAdminConfigured()) {
      console.log(
        "No admin account found yet - run `npm run set-admin-password`, or set " +
          "ADMIN_USERNAME and ADMIN_PASSWORD in .env and restart."
      );
    }
  });
});
