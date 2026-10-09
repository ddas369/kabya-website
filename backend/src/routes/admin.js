import { Router } from "express";
import multer from "multer";
import { extname } from "node:path";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "../middleware/auth.js";
import { verifyAdminPassword, setAdminPassword } from "../lib/adminStore.js";
import { UPLOADS_DIR, DOWNLOADS_DIR } from "../lib/paths.js";
import {
  getContent,
  updateSection,
  updateDeveloperLinks,
  addListItem,
  updateListItem,
  deleteListItem,
  reorderList,
} from "../lib/contentStore.js";

const router = Router();

// Every route below requires a valid admin token.
router.use(requireAdmin);

const EDITABLE_SECTIONS = new Set(["meta", "hero", "overview", "developer", "downloads"]);
const EDITABLE_LISTS = new Set(["features", "howItWorks", "otherApps"]);

// --- Section content (hero, overview, meta, downloads, developer's plain fields) ---

router.put("/section/:name", (req, res, next) => {
  try {
    const { name } = req.params;
    if (!EDITABLE_SECTIONS.has(name)) {
      return res.status(400).json({ error: `"${name}" is not an editable section.` });
    }
    // developer.otherApps and developer.links have their own dedicated routes,
    // so strip them out if sent through this generic route by mistake.
    const patch = { ...req.body };
    delete patch.otherApps;
    delete patch.links;
    const updated = updateSection(name, patch);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.put("/developer/links", (req, res, next) => {
  try {
    const updated = updateDeveloperLinks(req.body || {});
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// --- List-shaped content: features, howItWorks, developer.otherApps ---

function checkListName(req, res, next) {
  if (!EDITABLE_LISTS.has(req.params.listName)) {
    return res.status(400).json({ error: `"${req.params.listName}" is not an editable list.` });
  }
  next();
}

router.post("/list/:listName", checkListName, (req, res, next) => {
  try {
    const item = addListItem(req.params.listName, req.body || {});
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.put("/list/:listName/reorder", checkListName, (req, res, next) => {
  try {
    const { orderedIds } = req.body || {};
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: "orderedIds must be an array of ids." });
    }
    const list = reorderList(req.params.listName, orderedIds);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.put("/list/:listName/:id", checkListName, (req, res, next) => {
  try {
    const item = updateListItem(req.params.listName, req.params.id, req.body || {});
    res.json(item);
  } catch (err) {
    next(err);
  }
});

router.delete("/list/:listName/:id", checkListName, (req, res, next) => {
  try {
    const result = deleteListItem(req.params.listName, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// --- File uploads: images (logo, developer photo, app/game covers) ---

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (req, file, cb) => {
      cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    const ok = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.mimetype);
    cb(ok ? null : new Error("Only PNG, JPEG, WEBP or SVG images are allowed."), ok);
  },
});

router.post("/upload/image", imageUpload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image file received." });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

// --- APK upload, served back at /downloads/<filename> ---

const apkUpload = multer({
  storage: multer.diskStorage({
    destination: DOWNLOADS_DIR,
    filename: (req, file, cb) => cb(null, `kabya-${Date.now()}.apk`),
  }),
  limits: { fileSize: 300 * 1024 * 1024 }, // 300MB
  fileFilter: (req, file, cb) => {
    const ok = file.originalname.toLowerCase().endsWith(".apk");
    cb(ok ? null : new Error("Only .apk files are allowed."), ok);
  },
});

router.post("/upload/apk", apkUpload.single("apk"), (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No APK file received." });
    const apkUrl = `/downloads/${req.file.filename}`;
    const updated = updateSection("downloads", {
      apkUrl,
      apkFileName: req.file.originalname,
    });
    res.status(201).json(updated);
  } catch (err) {
    next(err);
  }
});

// --- Admin's own password ---

router.put("/password", async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "currentPassword and newPassword are required." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters." });
    }
    const valid = await verifyAdminPassword(req.admin.username, currentPassword);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }
    await setAdminPassword(req.admin.username, newPassword);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Convenience: full content object, so the admin dashboard can load
// everything (including any private fields added later) in one call.
router.get("/content", (req, res) => {
  res.json(getContent());
});

export default router;
