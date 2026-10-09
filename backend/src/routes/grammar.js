import { Router } from "express";
import { generateJson } from "../lib/gemini.js";

const router = Router();

// Same model order as the Android app's grammar client.
const MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.1-flash-lite-preview",
  "gemini-3.5-flash",
  "gemini-flash-latest",
];

const TONES = ["Casual", "Formal", "Concise", "Academic"];
const CATEGORIES = ["Grammar", "Spelling", "Punctuation", "Style", "Clarity"];
const MAX_CHARS = 3000;

function buildPrompt(text, tone) {
  // Triple quotes delimit the user's text in the prompt, so strip any the user typed.
  const safeText = text.replaceAll('"""', '"');
  return `You are an expert English copyeditor and linguist embedded in the Kabya app.
Analyze and correct the following English text for grammar, spelling, punctuation, clarity, and tone according to the target tone: ${tone}.

Target Tone: ${tone}

Input Text:
"""${safeText}"""

Respond strictly with ONLY a valid JSON object matching this schema without markdown fences:
{
  "originalText": "...",
  "correctedText": "...",
  "overallScore": 85,
  "tone": "${tone}",
  "summary": "1-sentence summary of improvements",
  "corrections": [
    {
      "originalSegment": "exact word or phrase in originalText with error",
      "replacement": "suggested correction",
      "category": "Grammar" | "Spelling" | "Punctuation" | "Style" | "Clarity",
      "explanation": "concise explanation under 15 words"
    }
  ]
}`;
}

/** Cleans up whatever the model returned into a predictable shape for the frontend. */
export function normalizeGrammarResult(raw, originalInput, tone) {
  const correctedText =
    typeof raw?.correctedText === "string" && raw.correctedText.trim()
      ? raw.correctedText
      : originalInput;

  const scoreNum = Number.parseInt(raw?.overallScore, 10);
  const overallScore = Number.isFinite(scoreNum) ? Math.min(100, Math.max(0, scoreNum)) : 90;

  const corrections = (Array.isArray(raw?.corrections) ? raw.corrections : [])
    .map((c) => ({
      originalSegment: String(c?.originalSegment ?? "").trim(),
      replacement: String(c?.replacement ?? "").trim(),
      category: CATEGORIES.find((x) => x.toLowerCase() === String(c?.category ?? "").toLowerCase()) || "Grammar",
      explanation: String(c?.explanation ?? "").trim() || "Suggested improvement",
    }))
    .filter((c) => c.originalSegment);

  // If the model rewrote the text but didn't itemize anything, still surface one suggestion.
  if (corrections.length === 0 && correctedText.trim() !== originalInput.trim()) {
    corrections.push({
      originalSegment: originalInput.trim(),
      replacement: correctedText.trim(),
      category: "Style",
      explanation: "Suggested rewrite of the full text",
    });
  }

  return {
    originalText: originalInput,
    correctedText,
    overallScore,
    tone,
    summary: typeof raw?.summary === "string" && raw.summary.trim() ? raw.summary : "Analysis completed.",
    corrections,
  };
}

router.post("/grammar", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "Grammar check isn't configured yet - GEMINI_API_KEY is missing on the server.",
    });
  }

  const { text, tone = "Casual" } = req.body || {};
  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "text is required." });
  }
  if (text.length > MAX_CHARS) {
    return res.status(400).json({ error: `Text is too long (max ${MAX_CHARS} characters).` });
  }
  const safeTone = TONES.includes(tone) ? tone : "Casual";
  const trimmed = text.trim();

  try {
    const raw = await generateJson({
      apiKey,
      models: MODELS,
      prompt: buildPrompt(trimmed, safeTone),
      maxOutputTokens: 1200,
      timeoutMs: 14000,
    });
    res.json(normalizeGrammarResult(raw, trimmed, safeTone));
  } catch (err) {
    console.error("Grammar error:", err);
    res.status(502).json({ error: "Grammar check failed. Please try again." });
  }
});

export default router;
