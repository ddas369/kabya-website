import { useState } from "react";
import { ArrowLeftRight, Copy, Volume2, Loader2, Check } from "lucide-react";
import WebAppLayout from "../components/WebAppLayout.jsx";
import { api } from "../lib/api.js";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "as", label: "Assamese" },
  { value: "bn", label: "Bengali" },
  { value: "hi", label: "Hindi" },
];

// Mirrors the Android app's formality chips exactly - the native pronoun
// plus its script, per target language.
const FORMALITY_OPTIONS = {
  as: [
    { value: "AUTO", label: "Auto / Context" },
    { value: "FORMAL", label: "Apuni (আপুনি)" },
    { value: "FAMILIAR", label: "Tumi (তুমি)" },
    { value: "INFORMAL", label: "Toi (তই)" },
  ],
  bn: [
    { value: "AUTO", label: "Auto / Context" },
    { value: "FORMAL", label: "Aapni (আপনি)" },
    { value: "FAMILIAR", label: "Tumi (তুমি)" },
    { value: "INFORMAL", label: "Tui (তুই)" },
  ],
  hi: [
    { value: "AUTO", label: "Auto / Context" },
    { value: "FORMAL", label: "Aap (आप)" },
    { value: "FAMILIAR", label: "Tum (तुम)" },
    { value: "INFORMAL", label: "Tu (तू)" },
  ],
  en: [
    { value: "AUTO", label: "Auto" },
    { value: "FORMAL", label: "Formal" },
    { value: "FAMILIAR", label: "Familiar" },
    { value: "INFORMAL", label: "Informal" },
  ],
};

const SPEECH_LOCALE = { en: "en-US", as: "as-IN", bn: "bn-IN", hi: "hi-IN" };

function scriptFont(langCode) {
  if (langCode === "as" || langCode === "bn") return "font-assamese";
  if (langCode === "hi") return "font-devanagari";
  return "font-sans";
}

export default function Translate() {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("as");
  const [formality, setFormality] = useState("AUTO");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  function swapLanguages() {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setResult(null);
  }

  function changeTarget(lang) {
    setTargetLang(lang);
    setFormality("AUTO");
  }

  async function handleTranslate(e) {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.translate(text, sourceLang, targetLang, formality);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyResult() {
    if (!result?.translated_text) return;
    navigator.clipboard.writeText(result.translated_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function speakResult() {
    if (!result?.translated_text || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(result.translated_text);
    utterance.lang = SPEECH_LOCALE[targetLang] || "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  const formalityOptions = FORMALITY_OPTIONS[targetLang] || FORMALITY_OPTIONS.en;

  return (
    <WebAppLayout
      title="Translate with Kabya"
      subtitle="English, Assamese, Bengali, and Hindi - right in your browser."
    >
    <form onSubmit={handleTranslate} className="space-y-5">
      {/* Language pair */}
      <div className="flex items-center gap-3">
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="flex-1 rounded-xl border border-ink/15 bg-white px-4 py-3 text-[15px] font-medium text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={swapLanguages}
          aria-label="Swap languages"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-ink/15 bg-white text-ink/60 transition-colors hover:border-gold hover:text-gold"
        >
          <ArrowLeftRight size={16} />
        </button>
        <select
          value={targetLang}
          onChange={(e) => changeTarget(e.target.value)}
          className="flex-1 rounded-xl border border-ink/15 bg-white px-4 py-3 text-[15px] font-medium text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* Formality chips */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
          Formality
        </p>
        <div className="flex flex-wrap gap-2">
          {formalityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFormality(opt.value)}
              className={`rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors ${
                formality === opt.value
                  ? "bg-ink text-parchment"
                  : "border border-ink/15 bg-white text-ink/70 hover:border-ink/35"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Type something to translate..."
        className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 text-[16px] text-ink placeholder:text-ink/35 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
      />

      <button
        type="submit"
        disabled={!text.trim() || loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-[15px] font-semibold text-ink transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Translate
      </button>
    </form>

    {error && (
      <p className="mt-6 rounded-xl bg-crimson/10 px-4 py-3 text-sm text-crimson">{error}</p>
    )}

    {result && (
      <div className="mt-8 rounded-2xl border border-gold/40 bg-gold/10 p-6">
        <div className="flex items-start justify-between gap-4">
          <p className={`text-xl leading-snug text-ink ${scriptFont(targetLang)}`}>
            {result.translated_text}
          </p>
          <div className="flex flex-shrink-0 gap-2">
            <button
              type="button"
              onClick={speakResult}
              aria-label="Listen"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-ink/60 hover:text-ink"
            >
              <Volume2 size={16} />
            </button>
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-ink/60 hover:text-ink"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {result.romanized_pronunciation && (
          <p className="mt-2 text-[15px] italic text-ink/55">
            {result.romanized_pronunciation}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {result.tone_and_context && (
            <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink/60">
              {result.tone_and_context}
            </span>
          )}
        </div>

        {result.alternative_translations?.[0] && (
          <p className="mt-3 border-t border-ink/10 pt-3 text-sm text-ink/55">
            Also: <span className={scriptFont(targetLang)}>{result.alternative_translations[0]}</span>
          </p>
        )}
      </div>
    )}
    </WebAppLayout>
  );
}
