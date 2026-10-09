import { Router } from "express";
import { getContent } from "../lib/contentStore.js";

const router = Router();

// Single endpoint: the frontend loads the whole site's content in one call.
// Nothing in content.json is sensitive, so this is safe to expose publicly.
router.get("/content", (req, res) => {
  res.json(getContent());
});

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default router;
