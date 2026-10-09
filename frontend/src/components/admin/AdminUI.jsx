import { Check, Loader2 } from "lucide-react";

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink/80">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink/45">{hint}</span>}
    </label>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink/35 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

export function TextInput(props) {
  return <input {...props} className={inputClass} />;
}

export function TextArea(props) {
  return <textarea {...props} className={`${inputClass} resize-y`} />;
}

export function PrimaryButton({ children, loading, className = "", ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[14px] font-semibold text-parchment transition-colors hover:bg-crimson disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

export function GhostButton({ className = "", ...props }) {
  return (
    <button
      {...props}
      className={`rounded-full border border-ink/15 px-4 py-2 text-[14px] font-medium text-ink/70 transition-colors hover:border-ink/35 hover:text-ink ${className}`}
    />
  );
}

export function SavedBadge({ show }) {
  if (!show) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-moss">
      <Check size={15} /> Saved
    </span>
  );
}

export function Card({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/60 p-6">
      {title && <h3 className="text-lg font-semibold text-ink">{title}</h3>}
      {description && <p className="mt-1 text-sm text-ink/55">{description}</p>}
      <div className={title ? "mt-5" : ""}>{children}</div>
    </div>
  );
}
