import { useState } from "react";
import { Upload } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api, assetUrl } from "../../lib/api.js";
import { Field, TextInput, TextArea, PrimaryButton, SavedBadge, Card } from "./AdminUI.jsx";
import ListManager from "./ListManager.jsx";

const LINK_FIELDS = [
  { key: "email", label: "Email", placeholder: "you@example.com" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "github", label: "GitHub", placeholder: "https://github.com/..." },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
  { key: "playstore", label: "Play Store developer page", placeholder: "https://play.google.com/store/apps/dev?id=..." },
  { key: "website", label: "Website", placeholder: "https://..." },
];

const APP_FIELDS = [
  { key: "name", label: "Name", type: "text" },
  { key: "description", label: "Short description", type: "text" },
  { key: "url", label: "Link (Play Store, itch.io, etc.)", type: "text" },
  { key: "imageUrl", label: "Cover image", type: "image" },
];

export default function DeveloperEditor({ developer, onSaved }) {
  const { token } = useAuth();
  const [form, setForm] = useState(developer);
  const [links, setLinks] = useState(developer.links || {});
  // otherApps lives in the dashboard's state (via `developer`) so edits
  // survive switching tabs; only the profile form and link inputs are local.
  const otherApps = developer.otherApps || [];
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateSection(token, "developer", {
        name: form.name,
        role: form.role,
        location: form.location,
        bio: form.bio,
        photoUrl: form.photoUrl,
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

  async function saveLinks(newLinks) {
    setLinks(newLinks);
    try {
      const updated = await api.updateDeveloperLinks(token, newLinks);
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  async function uploadPhoto(file) {
    setUploading(true);
    try {
      const { url } = await api.uploadImage(token, file);
      set("photoUrl", url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={saveProfile}>
        <Card title="Profile" description="Shown at the bottom of the site, in your own words.">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              {form.photoUrl && (
                <img
                  src={assetUrl(form.photoUrl)}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover"
                />
              )}
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-ink/15 px-3 py-2 text-[13px] font-medium text-ink/70 hover:border-ink/35">
                <Upload size={14} />
                {uploading ? "Uploading..." : "Upload photo"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
                />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name">
                <TextInput value={form.name} onChange={(e) => set("name", e.target.value)} />
              </Field>
              <Field label="Role">
                <TextInput value={form.role} onChange={(e) => set("role", e.target.value)} />
              </Field>
              <Field label="Location" hint="Shown under your name.">
                <TextInput value={form.location} onChange={(e) => set("location", e.target.value)} />
              </Field>
            </div>
            <Field label="Bio">
              <TextArea rows={4} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
            </Field>
          </div>
        </Card>

        {error && <p className="mt-4 text-sm text-crimson">{error}</p>}
        <div className="mt-4 flex items-center gap-4">
          <PrimaryButton type="submit" loading={saving}>
            Save changes
          </PrimaryButton>
          <SavedBadge show={saved} />
        </div>
      </form>

      <Card title="Links" description="Any field left blank won't be shown on the site.">
        <div className="grid gap-5 sm:grid-cols-2">
          {LINK_FIELDS.map((f) => (
            <Field key={f.key} label={f.label}>
              <TextInput
                placeholder={f.placeholder}
                value={links[f.key] || ""}
                onChange={(e) => setLinks((prev) => ({ ...prev, [f.key]: e.target.value }))}
                onBlur={() => saveLinks(links)}
              />
            </Field>
          ))}
        </div>
      </Card>

      <Card
        title="Other apps & games"
        description="A showcase of your other work. Leave this empty to hide the section."
      >
        <ListManager
          listName="otherApps"
          items={otherApps}
          fields={APP_FIELDS}
          emptyItem={{ name: "New project", description: "", url: "", imageUrl: "" }}
          onChange={(list) => onSaved({ ...developer, otherApps: list })}
        />
      </Card>
    </div>
  );
}
