import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../lib/api.js";
import { Field, TextInput, TextArea, PrimaryButton, GhostButton, SavedBadge, Card } from "./AdminUI.jsx";

export default function OverviewEditor({ overview, onSaved }) {
  const { token } = useAuth();
  const [heading, setHeading] = useState(overview.heading);
  const [paragraphs, setParagraphs] = useState(overview.paragraphs || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  function updateParagraph(i, value) {
    setParagraphs((prev) => prev.map((p, idx) => (idx === i ? value : p)));
  }
  function addParagraph() {
    setParagraphs((prev) => [...prev, ""]);
  }
  function removeParagraph(i) {
    setParagraphs((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateSection(token, "overview", {
        heading,
        paragraphs: paragraphs.filter((p) => p.trim() !== ""),
      });
      onSaved(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <Card title="Overview" description="A short description of what the app is and who it's for.">
        <div className="space-y-5">
          <Field label="Heading">
            <TextInput value={heading} onChange={(e) => setHeading(e.target.value)} />
          </Field>

          <div>
            <span className="text-sm font-medium text-ink/80">Paragraphs</span>
            <div className="mt-2 space-y-3">
              {paragraphs.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <TextArea rows={3} value={p} onChange={(e) => updateParagraph(i, e.target.value)} />
                  <button
                    type="button"
                    onClick={() => removeParagraph(i)}
                    className="mt-1.5 h-9 w-9 flex-shrink-0 rounded-lg text-ink/40 transition-colors hover:bg-crimson/10 hover:text-crimson"
                    aria-label="Remove paragraph"
                  >
                    <Trash2 size={16} className="mx-auto" />
                  </button>
                </div>
              ))}
            </div>
            <GhostButton type="button" onClick={addParagraph} className="mt-3">
              <span className="inline-flex items-center gap-1.5">
                <Plus size={14} /> Add paragraph
              </span>
            </GhostButton>
          </div>
        </div>
      </Card>

      {error && <p className="text-sm text-crimson">{error}</p>}
      <div className="flex items-center gap-4">
        <PrimaryButton type="submit" loading={saving}>
          Save changes
        </PrimaryButton>
        <SavedBadge show={saved} />
      </div>
    </form>
  );
}
