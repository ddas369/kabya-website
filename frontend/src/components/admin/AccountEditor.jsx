import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../lib/api.js";
import { Field, TextInput, PrimaryButton, SavedBadge, Card } from "./AdminUI.jsx";

export default function AccountEditor() {
  const { token, username, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }

    setSaving(true);
    try {
      await api.changePassword(token, currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Signed in as" description={username}>
        <button
          type="button"
          onClick={logout}
          className="text-sm font-medium text-crimson hover:underline"
        >
          Log out
        </button>
      </Card>

      <form onSubmit={submit}>
        <Card title="Change password">
          <div className="space-y-5">
            <Field label="Current password">
              <TextInput
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </Field>
            <Field label="New password" hint="At least 8 characters.">
              <TextInput
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Field>
            <Field label="Confirm new password">
              <TextInput
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Field>
          </div>
        </Card>
        {error && <p className="mt-4 text-sm text-crimson">{error}</p>}
        <div className="mt-4 flex items-center gap-4">
          <PrimaryButton type="submit" loading={saving}>
            Update password
          </PrimaryButton>
          <SavedBadge show={saved} />
        </div>
      </form>
    </div>
  );
}
