import { Router } from "express";
import jwt from "jsonwebtoken";
import { verifyAdminPassword, isAdminConfigured } from "../lib/adminStore.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/login", async (req, res) => {
  if (!isAdminConfigured()) {
    return res.status(503).json({
      error:
        "No admin account has been set up yet. Run `npm run set-admin-password` in the backend folder first.",
    });
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const valid = await verifyAdminPassword(username, password);
  if (!valid) {
    return res.status(401).json({ error: "Incorrect username or password." });
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "12h",
  });

  res.json({ token, username });
});

// Lets the frontend confirm a stored token is still valid on page load.
router.get("/me", requireAdmin, (req, res) => {
  res.json({ username: req.admin.username });
});

export default router;
