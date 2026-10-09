/**
 * Shared helper for calling Google's Gemini API and getting JSON back.
 * Used by the translate and grammar routes, so the model-fallback and
 * timeout behaviour lives in exactly one place.
 */

/** Parses JSON from a model reply, tolerating ```json fences or stray text around it. */
export function parseJsonLoose(raw) {
  let cleaned = String(raw).trim();
  cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first !== -1 && last > first) cleaned = cleaned.slice(first, last + 1);
  return JSON.parse(cleaned);
}

/**
 * Tries each model in order until one returns valid JSON.
 * Throws the last error if every model fails.
 */
export async function generateJson({
  apiKey,
  models,
  systemInstruction,
  prompt,
  maxOutputTokens = 1024,
  timeoutMs = 12000,
}) {
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens,
      responseMimeType: "application/json",
    },
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  let lastError = null;

  for (const model of models) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) {
        lastError = new Error(`Gemini ${model} responded ${res.status}`);
        continue;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        lastError = new Error(`Gemini ${model} returned no content`);
        continue;
      }
      return parseJsonLoose(text);
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models failed");
}
