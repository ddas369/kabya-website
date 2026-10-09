import { motion } from "framer-motion";
import SectionHeading from "./ui/SectionHeading.jsx";
import Reveal, { staggerContainer, staggerItem, staggerViewport } from "./ui/Reveal.jsx";

export default function HowItWorks({ steps = [] }) {
  return (
    <section className="bg-parchment py-24 sm:py-28">
      <div className="container-page">
        <Reveal variant="fade">
          <SectionHeading align="center" heading="How it works" />
        </Reveal>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={staggerViewport}
          variants={staggerContainer}
          className="relative mt-16 grid gap-12 sm:grid-cols-3 sm:gap-8"
        >
          <div
            className="pointer-events-none absolute left-0 right-0 top-6 hidden border-t border-dashed border-ink/20 sm:block"
            aria-hidden="true"
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.id || step.title}
              variants={staggerItem}
              className="relative text-center sm:text-left"
            >
              <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink font-display text-lg text-parchment sm:mx-0">
                {i + 1}
              </div>
              <h3 className="mt-5 text-xl font-medium text-ink">{step.title}</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-ink/65">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
