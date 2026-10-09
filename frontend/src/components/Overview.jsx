import SectionHeading from "./ui/SectionHeading.jsx";
import Reveal from "./ui/Reveal.jsx";

export default function Overview({ heading, paragraphs = [] }) {
  return (
    <section id="overview" className="bg-parchment py-24 sm:py-28">
      <div className="container-page grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal variant="scale" className="mx-auto w-full max-w-[280px]">
          <div className="overflow-hidden rounded-[2.5rem] border-[10px] border-ink bg-ink shadow-[0_40px_70px_-25px_rgba(31,26,18,0.45)]">
            <img
              src="/seed-images/screenshot-translate-result.jpg"
              alt="Kabya app showing an English to Assamese translation"
              className="w-full"
            />
          </div>
        </Reveal>

        <Reveal variant="left" delay={0.1}>
          <SectionHeading heading={heading} />
          <div className="mt-6 max-w-prose space-y-5">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-[17px] leading-relaxed text-ink/75">
                {p}
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
