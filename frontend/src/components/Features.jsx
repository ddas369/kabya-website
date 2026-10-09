import { Link } from "react-router-dom";
import { Type, Mic, Camera, SpellCheck2, Languages, Sparkles } from "lucide-react";
import SectionHeading from "./ui/SectionHeading.jsx";
import Reveal from "./ui/Reveal.jsx";

const ICONS = { type: Type, mic: Mic, camera: Camera, grammar: SpellCheck2 };
const ACCENTS = {
  type: { bg: "bg-gold/15", ring: "ring-gold/30", icon: "text-gold" },
  mic: { bg: "bg-crimson/10", ring: "ring-crimson/25", icon: "text-crimson" },
  camera: { bg: "bg-moss/10", ring: "ring-moss/25", icon: "text-moss" },
  grammar: { bg: "bg-plum-light/10", ring: "ring-plum-light/25", icon: "text-plum-light" },
};
const DEFAULT_ACCENT = { bg: "bg-ink/5", ring: "ring-ink/15", icon: "text-ink" };

export default function Features({ features = [] }) {
  return (
    <section id="features" className="bg-ink py-24 text-parchment sm:py-28">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            tone="parchment"
            heading="Three ways in, one clear translation out"
            lede="However the moment calls for it - typed, spoken, or read off a page - Kabya meets you there."
          />
        </Reveal>

        <div className="mt-16 space-y-16">
          {features.map((feature, i) => {
            const Icon = ICONS[feature.icon] || Languages;
            const accent = ACCENTS[feature.icon] || DEFAULT_ACCENT;
            const reversed = i % 2 === 1;

            return (
              <div
                key={feature.id || feature.title}
                className={`flex flex-col items-center gap-10 md:gap-16 lg:flex-row ${
                  reversed ? "lg:flex-row-reverse" : ""
                }`}
              >
                <Reveal variant={reversed ? "left" : "right"} className="flex-1">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accent.bg} ring-1 ${accent.ring}`}
                  >
                    <Icon size={26} className={accent.icon} />
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <h3 className="text-2xl font-medium text-parchment">{feature.title}</h3>
                    {feature.highlight && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-plum-light/15 px-2.5 py-1 text-xs font-semibold text-plum-light ring-1 ring-plum-light/30">
                        <Sparkles size={12} /> Powered by AI
                      </span>
                    )}
                  </div>
                  <p className="mt-3 max-w-md text-[17px] leading-relaxed text-parchment/65">
                    {feature.description}
                  </p>
                  {feature.highlight && (
                    <Link
                      to="/grammar"
                      className="mt-4 inline-block text-sm font-semibold text-plum-light underline underline-offset-4 hover:text-parchment"
                    >
                      Try it online
                    </Link>
                  )}
                </Reveal>

                <Reveal variant="scale" delay={0.15} className="flex-1">
                  <div
                    className={`mx-auto flex aspect-[4/3] w-full max-w-md items-center justify-center rounded-3xl ${accent.bg} ring-1 ${accent.ring}`}
                  >
                    <Icon size={72} strokeWidth={1.25} className={`${accent.icon} opacity-80`} />
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
