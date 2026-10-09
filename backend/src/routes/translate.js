import { Router } from "express";
import { generateJson } from "../lib/gemini.js";

const router = Router();

// Same fallback chain as the Android app - if one model is overloaded or
// unavailable, the next one is tried automatically.
const MODELS = [
  "gemini-3.1-flash-lite-preview",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
];

const MAX_CHARS = 3000;

const LANG_NAMES = { en: "English", as: "Assamese", bn: "Bengali", hi: "Hindi" };

// Formality pronouns, straight from the Android app's prompt - these are
// what make the translations grammatically correct for the chosen register,
// not just word-for-word.
const FORMALITY_INSTRUCTIONS = {
  hindi: {
    FORMAL:
      'MANDATORY REGISTER: The user selected FORMAL (आप - Aap). You MUST translate using the honorific pronoun "आप" (Aap) and conjugate verbs accordingly (e.g., आपका, आपको, आप कैसे हैं, आप बैठिए). NEVER use \'तुम\' or \'तू\'.',
    FAMILIAR:
      'MANDATORY REGISTER: The user selected FAMILIAR (तुम - Tum). You MUST translate using the familiar pronoun "तुम" (Tum) and conjugate verbs accordingly (e.g., तुम्हारा, तुम्हें, तुम कैसे हो, तुम बैठो). NEVER use \'आप\' or \'तू\'.',
    INFORMAL:
      'MANDATORY REGISTER: The user selected INFORMAL (तू - Tu). You MUST translate using the intimate pronoun "तू" (Tu) and conjugate verbs accordingly (e.g., तेरा, तुझे, तू कैसा है, तू बैठ). NEVER use \'आप\' or \'तुम\'.',
  },
  assamese: {
    FORMAL:
      'MANDATORY REGISTER: The user selected FORMAL (আপুনি - Apuni). You MUST translate using the honorific pronoun "আপুনি" (Apuni) and conjugate verbs with honorific endings (-ে / -ক / -িব, e.g., আপোনাৰ, আপোনাক, আপুনি কেনে আছে?). Use standard Assamese script with \'ৰ\' and \'ৱ\'. NEVER use \'তুমি\' or \'তই\'.',
    FAMILIAR:
      'MANDATORY REGISTER: The user selected FAMILIAR (তুমি - Tumi). You MUST translate using the familiar pronoun "তুমি" (Tumi) and conjugate verbs with familiar endings (-া / -িলা / -িবা, e.g., তোমাৰ, তোমাক, তুমি কেনে আছা?). Use standard Assamese script with \'ৰ\' and \'ৱ\'. NEVER use \'আপুনি\' or \'তই\'.',
    INFORMAL:
      'MANDATORY REGISTER: The user selected INFORMAL (তই - Toi). You MUST translate using the intimate pronoun "তই" (Toi) and conjugate verbs with intimate endings (- / -িলি / -িবি, e.g., তোৰ, তোক, তই কেনে আছ?). Use standard Assamese script with \'ৰ\' and \'ৱ\'. NEVER use \'আপুনি\' or \'তুমি\'.',
  },
  bengali: {
    FORMAL:
      'MANDATORY REGISTER: The user selected FORMAL (আপনি - Aapni). You MUST translate using the honorific pronoun "আপনি" (Aapni) and conjugate verbs with honorific endings (-েন / -ন, e.g., আপনার, আপনাকে, আপনি কেমন আছেন?). NEVER use \'তুমি\' or \'তুই\'.',
    FAMILIAR:
      'MANDATORY REGISTER: The user selected FAMILIAR (তুমি - Tumi). You MUST translate using the familiar pronoun "তুমি" (Tumi) and conjugate verbs with familiar endings (-ো, e.g., তোমার, তোমাকে, তুমি কেমন আছো?). NEVER use \'আপনি\' or \'তুই\'.',
    INFORMAL:
      'MANDATORY REGISTER: The user selected INFORMAL (তুই - Tui). You MUST translate using the intimate pronoun "তুই" (Tui) and conjugate verbs with intimate endings (-িস / -স, e.g., তোর, তোকে, তুই কেমন আছিস?). NEVER use \'আপনি\' or \'তুমি\'.',
  },
  english: {
    FORMAL: "MANDATORY REGISTER: Formal, polite, and professional English phrasing.",
    FAMILIAR: "MANDATORY REGISTER: Standard, neutral everyday English phrasing.",
    INFORMAL: "MANDATORY REGISTER: Casual, relaxed, and conversational English phrasing.",
  },
};

function buildSystemInstruction(resolvedSource, resolvedTarget) {
  return `You are an expert, context-aware machine translation engine specializing in English, Assamese (অসমীয়া), Bengali (বাংলা), and Hindi (हिन्दी).

PRIMARY ROLE & BEHAVIOR:
1. Translate accurately between ${resolvedSource} and ${resolvedTarget} preserving tone, cultural idioms, and native script.
2. Assamese: strictly standard Assamese script (অসমীয়া আখৰ) with 'ৰ' (\u09F0) and 'ৱ' (\u09F1).
3. Bengali: standard Bengali script (বাংলা লিপি) with 'র' and 'ব'.
4. Hindi: standard Devanagari script (देवनागरी).
5. English: natural, idiomatic English.
6. FORMALITY REGISTERS MUST BE RIGOROUSLY RESPECTED.
7. Return JSON only without markdown or explanations.
8. SPEED & EFFICIENCY: Respond immediately and concisely. Provide at most 1 short alternative translation in alternative_translations. Keep tone_and_context under 4 words.

JSON SCHEMA:
{
  "source_language": "${resolvedSource}",
  "target_language": "${resolvedTarget}",
  "original_text": "original text",
  "translated_text": "native script translation",
  "romanized_pronunciation": "phonetic Latin transliteration for Assamese/Bengali/Hindi (empty for English)",
  "tone_and_context": "brief note on tone (e.g. Formal)",
  "alternative_translations": ["alt 1"]
}`;
}

router.post("/translate", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "Translation isn't configured yet - GEMINI_API_KEY is missing on the server.",
    });
  }

  const { text, sourceLang = "en", targetLang = "as", formality = "AUTO" } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "text is required." });
  }
  if (text.length > MAX_CHARS) {
    return res.status(400).json({ error: `Text is too long (max ${MAX_CHARS} characters).` });
  }

  const resolvedSource = LANG_NAMES[sourceLang] || "English";
  const resolvedTarget = LANG_NAMES[targetLang] || "Assamese";

  const systemInstruction = buildSystemInstruction(resolvedSource, resolvedTarget);
  const formalityInstruction =
    FORMALITY_INSTRUCTIONS[resolvedTarget.toLowerCase()]?.[formality] || "";

  let userPrompt = `Translate from ${resolvedSource} to ${resolvedTarget}:\n${text}`;
  if (formalityInstruction) {
    userPrompt += `\n\n${formalityInstruction}`;
  }

  try {
    const result = await generateJson({
      apiKey,
      models: MODELS,
      systemInstruction,
      prompt: userPrompt,
    });
    res.json(result);
  } catch (err) {
    console.error("Translate error:", err);
    res.status(502).json({ error: "Translation failed. Please try again." });
  }
});

export default router;
