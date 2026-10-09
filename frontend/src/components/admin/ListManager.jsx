import { useState } from "react";
import { Plus, Trash2, GripVertical, Upload } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api, assetUrl } from "../../lib/api.js";
import { Field, TextInput, TextArea, PrimaryButton, GhostButton } from "./AdminUI.jsx";

/**
 * fields: [{ key, label, type: "text" | "textarea" | "select" | "image", options? }]
 */
export default function ListManager({ listName, items, fields, emptyItem, onChange }) {
  const { token } = useAuth();
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  async function handleAdd() {
    setError(null);
    try {
      const created = await api.addListItem(token, listName, emptyItem);
      onChange([...items, created]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleFieldSave(item, key, value) {
    const patch = { [key]: value };
    setBusyId(item.id);
    setError(null);
    try {
      const updated = await api.updateListItem(token, listName, item.id, patch);
      onChange(items.map((it) => (it.id === item.id ? updated : it)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this item? This can't be undone.")) return;
    setBusyId(id);
    setError(null);
    try {
      await api.deleteListItem(token, listName, id);
      onChange(items.filter((it) => it.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-crimson">{error}</p>}

      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border border-ink/10 bg-white/60 p-5">
          <div className="flex items-start gap-3">
            <GripVertical size={16} className="mt-2.5 flex-shrink-0 text-ink/25" />
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                  <ItemField
                    field={field}
                    value={item[field.key] || ""}
                    disabled={busyId === item.id}
                    onCommit={(value) => handleFieldSave(item, field.key, value)}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              disabled={busyId === item.id}
              className="mt-1 h-9 w-9 flex-shrink-0 rounded-lg text-ink/40 transition-colors hover:bg-crimson/10 hover:text-crimson"
              aria-label="Delete item"
            >
              <Trash2 size={16} className="mx-auto" />
            </button>
          </div>
        </div>
      ))}

      <GhostButton type="button" onClick={handleAdd}>
        <span className="inline-flex items-center gap-1.5">
          <Plus size={14} /> Add
        </span>
      </GhostButton>
    </div>
  );
}

function ItemField({ field, value, disabled, onCommit }) {
  const [local, setLocal] = useState(value);
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);

  if (field.type === "select") {
    return (
      <Field label={field.label}>
        <select
          value={local}
          disabled={disabled}
          onChange={(e) => {
            setLocal(e.target.value);
            onCommit(e.target.value);
          }}
          className="mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-[15px] text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </Field>
    );
  }

  if (field.type === "image") {
    return (
      <Field label={field.label}>
        <div className="mt-1.5 flex items-center gap-3">
          {local && (
            <img src={assetUrl(local)} alt="" className="h-12 w-12 rounded-lg object-cover" />
          )}
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-ink/15 px-3 py-2 text-[13px] font-medium text-ink/70 hover:border-ink/35">
            <Upload size={14} />
            {uploading ? "Uploading..." : "Upload image"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              disabled={disabled || uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  const { url } = await api.uploadImage(token, file);
                  setLocal(url);
                  onCommit(url);
                } finally {
                  setUploading(false);
                }
              }}
            />
          </label>
        </div>
      </Field>
    );
  }

  const InputComponent = field.type === "textarea" ? TextArea : TextInput;

  return (
    <Field label={field.label}>
      <InputComponent
        rows={field.type === "textarea" ? 2 : undefined}
        value={local}
        disabled={disabled}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          if (local !== value) onCommit(local);
        }}
      />
    </Field>
  );
}
