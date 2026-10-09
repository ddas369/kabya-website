import { useState } from "react";
import { Check, ClipboardPaste, Copy, Loader2, Sparkles, X } from "lucide-react";
import WebAppLayout from "../components/WebAppLayout.jsx";
import { api } from "../lib/api.js";

const TONES = ["Casual", "Formal", "Concise", "Academic"];

const CATEGORY_STYLES = {
  Grammar: "bg-crimson/10 text-crimson",
  Spelling: "bg-plum/10 text-plum",
  Punctuation: "bg-gold/20 text-ink",
  Style: "bg-moss/10 text-moss",
  Clarity: "bg-ink/10 text-ink/70",
};

function scoreColor(score) {
  if (score >= 85) return "text-moss";
  if (score >= 70) return "text-gold";
  return "text-crimson";
}

export default function Grammar() {
  const [tone, setTone] = useState("Casual");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  // status per correction index: "accepted" | "ignored" (absent = pending)
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  async function pasteFromClipboard() {
    try {
      setText(await navigator.clipboard.readText());
    } catch {
      /* clipboard permission denied - nothing to do */
    }
  }

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.grammar(text, tone);
      setResult(data);
      setStatus({});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Replaces the first occurrence; uses a function so "$" in a replacement isn't treated specially.
  function applyTo(current, correction) {
    return current.includes(correction.originalSegment)
      ? current.replace(correction.originalSegment, () => correction.replacement)
      : current;
  }

  function accept(index) {
    setText((t) => applyTo(t, result.corrections[index]));
    setStatus((s) => ({ ...s, [index]: "accepted" }));
  }

  function ignore(index) {
    setStatus((s) => ({ ...s, [index]: "ignored" }));
  }

  function acceptAll() {
    let next = text;
    const nextStatus = { ...status };
    result.corrections.forEach((c, i) => {
      if (!nextStatus[i]) {
        next = applyTo(next, c);
        nextStatus[i] = "accepted";
      }
    });
    setText(next);
    setStatus(nextStatus);
  }

  function copyPolished() {
    navigator.clipboard.writeText(result.correctedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const pendingCount = result ? result.corrections.filter((_, i) => !status[i]).length : 0;

  return (
    <WebAppLayout
      title="Check English grammar & style"
      subtitle="Spelling, grammar, clarity and tone - polished by AI."
    >
      <form onSubmit={handleAnalyze} className="space-y-5">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
            Tone &amp; style
            <span className="inline-flex items-center gap-1 rounded-full bg-plum/10 px-2 py-0.5 text-[11px] normal-case tracking-normal text-plum">
              <Sparkles size={11} /> Powered by AI
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                  tone === t
                    ? "bg-ink text-parchment"
                    : "border border-ink/15 bg-white text-ink/70 hover:border-ink/35"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-ink/15 bg-white p-4 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">
              Enter English text
            </span>
            <button
              type="button"
              onClick={pasteFromClipboard}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/55 hover:text-ink"
            >
              <ClipboardPaste size={13} /> Paste
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="Type or paste English text to inspect grammar, spelling, clarity, and tone..."
            className="mt-3 w-full resize-y bg-transparent text-[16px] text-ink placeholder:text-ink/35 focus:outline-none"
          />
          <p className="mt-1 text-xs text-ink/40">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </p>
        </div>

        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-[15px] font-semibold text-ink transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Analyzing & polishing..." : "Analyze & Polish Text"}
        </button>
      </form>

      {error && (
        <p className="mt-6 rounded-xl bg-crimson/10 px-4 py-3 text-sm text-crimson">{error}</p>
      )}

      {!result && !loading && (
        <div className="mt-8 rounded-2xl bg-ink/5 p-6 text-[15px] leading-relaxed text-ink/65">
          <p className="font-semibold text-ink">How Kabya Grammar Check works</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Analyzes subject-verb agreement, tenses, and punctuation.</li>
            <li>Identifies misused words, apostrophes, and common typos.</li>
            <li>Adapts phrasing to Casual, Formal, Concise, or Academic tone.</li>
            <li>Lets you accept changes card by card, or all at once.</li>
          </ul>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-ink/10 bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink/55">Writing quality score</p>
                <p className="mt-1">
                  <span className={`font-display text-5xl font-medium ${scoreColor(result.overallScore)}`}>
                    {result.overallScore}
                  </span>
                  <span className="text-lg text-ink/40"> / 100</span>
                </p>
              </div>
              <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink/60">
                Tone: {result.tone}
              </span>
            </div>
            <p className="mt-3 text-[15px] text-ink/65">{result.summary}</p>

            <div className="mt-5 rounded-xl bg-gold/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                  Revised &amp; polished version
                </p>
                <button
                  type="button"
                  onClick={copyPolished}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/60 hover:text-ink"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[16px] leading-relaxed text-ink">
                {result.correctedText}
              </p>
            </div>
          </div>

          {result.corrections.length === 0 ? (
            <div className="rounded-2xl border border-moss/30 bg-moss/10 p-6 text-center">
              <p className="font-semibold text-moss">No grammar or spelling issues found!</p>
              <p className="mt-1 text-sm text-ink/60">
                Your writing follows standard English syntax and mechanics.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="font-display text-lg text-ink">Suggestions</p>
                {pendingCount > 0 && (
                  <button
                    type="button"
                    onClick={acceptAll}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-parchment hover:bg-crimson"
                  >
                    <Check size={14} /> Accept all
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {result.corrections.map((c, i) => {
                  const state = status[i];
                  return (
                    <div
                      key={i}
                      className={`rounded-2xl border border-ink/10 bg-white p-5 transition-opacity ${
                        state ? "opacity-55" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            CATEGORY_STYLES[c.category] || CATEGORY_STYLES.Grammar
                          }`}
                        >
                          {c.category}
                        </span>
                        {state ? (
                          <span className="text-xs font-medium text-ink/50">
                            {state === "accepted" ? "Applied" : "Ignored"}
                          </span>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => ignore(i)}
                              className="inline-flex items-center gap-1 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink/60 hover:border-ink/35"
                            >
                              <X size={12} /> Ignore
                            </button>
                            <button
                              type="button"
                              onClick={() => accept(i)}
                              className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-parchment hover:bg-crimson"
                            >
                              <Check size={12} /> Accept
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-crimson/10 px-3.5 py-2.5">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-crimson/80">
                            Incorrect
                          </p>
                          <p className="mt-1 text-[15px] text-ink line-through decoration-crimson/60">
                            {c.originalSegment}
                          </p>
                        </div>
                        <div className="rounded-xl bg-moss/10 px-3.5 py-2.5">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-moss">
                            Corrected
                          </p>
                          <p className="mt-1 text-[15px] text-ink">{c.replacement}</p>
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-ink/60">
                        <span className="font-semibold text-ink/75">Reason:</span> {c.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </WebAppLayout>
  );
}
