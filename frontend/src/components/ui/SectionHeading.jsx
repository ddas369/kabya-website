export default function SectionHeading({ heading, lede, align = "left", tone = "ink" }) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  const toneClass = tone === "parchment" ? "text-parchment" : "text-ink";
  const ledeTone = tone === "parchment" ? "text-parchment/70" : "text-ink/65";

  return (
    <div className={`max-w-2xl ${alignClass}`}>
      <h2 className={`text-3xl sm:text-4xl font-medium leading-tight ${toneClass}`}>
        {heading}
      </h2>
      {lede && <p className={`mt-4 text-lg leading-relaxed ${ledeTone}`}>{lede}</p>}
    </div>
  );
}
