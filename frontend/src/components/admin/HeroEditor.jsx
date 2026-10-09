import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../lib/api.js";
import { Field, TextInput, TextArea, PrimaryButton, SavedBadge, Card } from "./AdminUI.jsx";

export default function HeroEditor({ hero, onSaved }) {
  const { token } = useAuth();
  const [form, setForm] = useState(hero);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  function set(path, value) {
    setForm((prev) => {
      const next = { ...prev };
      if (path.includes(".")) {
        const [parent, child] = path.split(".");
        next[parent] = { ...next[parent], [child]: value };
      } else {
        next[path] = value;
      }
      return next;
    });
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateSection(token, "hero", form);
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
      <Card title="Headline" description="The first thing visitors read at the top of the page.">
        <div className="space-y-5">
          <Field label="Title">
            <TextArea rows={2} value={form.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Subtitle">
            <TextArea
              rows={3}
              value={form.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card title="Buttons" description={'A blank primary URL sends visitors to the download section. A blank secondary URL hides that button. The "Try it online" button is always shown.'}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Primary button label">
            <TextInput
              value={form.primaryCta?.label || ""}
              onChange={(e) => set("primaryCta.label", e.target.value)}
            />
          </Field>
          <Field label="Primary button URL">
            <TextInput
              placeholder="https://play.google.com/..."
              value={form.primaryCta?.url || ""}
              onChange={(e) => set("primaryCta.url", e.target.value)}
            />
          </Field>
          <Field label="Secondary button label">
            <TextInput
              value={form.secondaryCta?.label || ""}
              onChange={(e) => set("secondaryCta.label", e.target.value)}
            />
          </Field>
          <Field label="Secondary button URL">
            <TextInput
              placeholder="https://..."
              value={form.secondaryCta?.url || ""}
              onChange={(e) => set("secondaryCta.url", e.target.value)}
            />
          </Field>
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
