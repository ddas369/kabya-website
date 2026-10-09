import { useState } from "react";
import { Upload } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../lib/api.js";
import { Field, TextInput, TextArea, PrimaryButton, SavedBadge, Card } from "./AdminUI.jsx";

export default function SettingsEditor({ meta, downloads, onMetaSaved, onDownloadsSaved }) {
  const { token } = useAuth();
  const [metaForm, setMetaForm] = useState(meta);
  const [downloadsForm, setDownloadsForm] = useState(downloads);
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingDownloads, setSavingDownloads] = useState(false);
  const [uploadingApk, setUploadingApk] = useState(false);
  const [savedMeta, setSavedMeta] = useState(false);
  const [savedDownloads, setSavedDownloads] = useState(false);
  const [error, setError] = useState(null);

  async function saveMeta(e) {
    e.preventDefault();
    setSavingMeta(true);
    setError(null);
    try {
      const updated = await api.updateSection(token, "meta", metaForm);
      onMetaSaved(updated);
      setSavedMeta(true);
      setTimeout(() => setSavedMeta(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingMeta(false);
    }
  }

  async function saveDownloads(e) {
    e.preventDefault();
    setSavingDownloads(true);
    setError(null);
    try {
      const updated = await api.updateSection(token, "downloads", {
        playStoreUrl: downloadsForm.playStoreUrl,
        apkUrl: downloadsForm.apkUrl,
        apkFileName: downloadsForm.apkFileName,
      });
      onDownloadsSaved(updated);
      setDownloadsForm(updated);
      setSavedDownloads(true);
      setTimeout(() => setSavedDownloads(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingDownloads(false);
    }
  }

  async function uploadApk(file) {
    setUploadingApk(true);
    setError(null);
    try {
      const updated = await api.uploadApk(token, file);
      setDownloadsForm(updated);
      onDownloadsSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingApk(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={saveMeta}>
        <Card title="Site details" description="Used for the browser tab title and search engines.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="App name">
              <TextInput
                value={metaForm.appName}
                onChange={(e) => setMetaForm((p) => ({ ...p, appName: e.target.value }))}
              />
            </Field>
            <Field label="Full name">
              <TextInput
                value={metaForm.fullName}
                onChange={(e) => setMetaForm((p) => ({ ...p, fullName: e.target.value }))}
              />
            </Field>
          </div>
          <div className="mt-5">
            <Field label="Tagline">
              <TextInput
                value={metaForm.tagline}
                onChange={(e) => setMetaForm((p) => ({ ...p, tagline: e.target.value }))}
              />
            </Field>
          </div>
          <div className="mt-5">
            <Field label="Search engine description" hint="Shown in Google search results, ideally under 160 characters.">
              <TextArea
                rows={2}
                value={metaForm.seoDescription}
                onChange={(e) => setMetaForm((p) => ({ ...p, seoDescription: e.target.value }))}
              />
            </Field>
          </div>
        </Card>
        <div className="mt-4 flex items-center gap-4">
          <PrimaryButton type="submit" loading={savingMeta}>
            Save changes
          </PrimaryButton>
          <SavedBadge show={savedMeta} />
        </div>
      </form>

      <form onSubmit={saveDownloads}>
        <Card
          title="Download links"
          description="Both the header button and the download section use these."
        >
          <div className="space-y-5">
            <Field label="Google Play URL">
              <TextInput
                placeholder="https://play.google.com/store/apps/details?id=..."
                value={downloadsForm.playStoreUrl || ""}
                onChange={(e) => setDownloadsForm((p) => ({ ...p, playStoreUrl: e.target.value }))}
              />
            </Field>

            <div>
              <span className="text-sm font-medium text-ink/80">APK file</span>
              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                {downloadsForm.apkFileName && (
                  <span className="rounded-lg bg-ink/5 px-3 py-2 text-[13px] text-ink/70">
                    {downloadsForm.apkFileName}
                  </span>
                )}
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-ink/15 px-3 py-2 text-[13px] font-medium text-ink/70 hover:border-ink/35">
                  <Upload size={14} />
                  {uploadingApk ? "Uploading..." : "Upload new APK"}
                  <input
                    type="file"
                    accept=".apk"
                    className="hidden"
                    disabled={uploadingApk}
                    onChange={(e) => e.target.files?.[0] && uploadApk(e.target.files[0])}
                  />
                </label>
              </div>
              <p className="mt-1.5 text-xs text-ink/45">
                Uploading a new file replaces the current download link automatically.
              </p>
            </div>
          </div>
        </Card>
        {error && <p className="mt-4 text-sm text-crimson">{error}</p>}
        <div className="mt-4 flex items-center gap-4">
          <PrimaryButton type="submit" loading={savingDownloads}>
            Save changes
          </PrimaryButton>
          <SavedBadge show={savedDownloads} />
        </div>
      </form>
    </div>
  );
}
