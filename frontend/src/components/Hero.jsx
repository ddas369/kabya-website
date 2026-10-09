import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";
import badge from "../assets/kabya-badge-gold.jpg";

const headlineVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Hero({ title, subtitle, primaryCta, secondaryCta }) {
  const words = title.split(" ");

  // Scroll-linked motion for the badge: as the hero scrolls away, the badge
  // drifts down more slowly than the page (parallax), shrinks, tilts and fades.
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.6 });
  const badgeY = useTransform(progress, [0, 1], [0, 90]);
  const badgeScale = useTransform(progress, [0, 1], [1, 0.82]);
  const badgeRotate = useTransform(progress, [0, 1], [0, -8]);
  const badgeOpacity = useTransform(progress, [0, 0.9], [1, 0.2]);
  const badgeScrollStyle = reduceMotion
    ? undefined
    : { y: badgeY, scale: badgeScale, rotate: badgeRotate, opacity: badgeOpacity };

  return (
    <section ref={sectionRef} id="top" className="relative overflow-hidden bg-ink text-parchment">
      <div className="container-page grid gap-16 py-20 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-32">
        <div>
          <motion.h1
            variants={headlineVariants}
            initial="hidden"
            animate="show"
            className="max-w-xl text-4xl font-medium leading-[1.12] sm:text-5xl sm:leading-[1.1]"
          >
            <motion.span
              variants={wordVariants}
              className="inline-block font-eagle text-gold"
            >
              Kabya
            </motion.span>
            <motion.span variants={wordVariants} className="inline-block">
              {"\u00A0\u2014\u00A0"}
            </motion.span>
            {words.map((word, i) => (
              <motion.span key={i} variants={wordVariants} className="inline-block">
                {word}
                {i < words.length - 1 ? "\u00A0" : ""}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-md text-lg leading-relaxed text-parchment/70"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a
              href={primaryCta?.url || "#download"}
              target={primaryCta?.url ? "_blank" : undefined}
              rel={primaryCta?.url ? "noreferrer" : undefined}
              className="rounded-full bg-gold px-6 py-3.5 text-[15px] font-semibold text-ink transition-transform hover:scale-[1.03]"
            >
              {primaryCta?.label || "Get it on Google Play"}
            </a>
            <Link
              to="/translate"
              className="rounded-full border border-parchment/25 px-6 py-3.5 text-[15px] font-semibold text-parchment transition-colors hover:border-parchment/60"
            >
              Try it online
            </Link>
            {/* Optional extra button - only shown when a URL is set in the admin panel. */}
            {secondaryCta?.url && (
              <a
                href={secondaryCta.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-parchment/25 px-6 py-3.5 text-[15px] font-semibold text-parchment transition-colors hover:border-parchment/60"
              >
                {secondaryCta.label || "Download APK"}
              </a>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.95 }}
            className="mt-4 text-sm text-parchment/50"
          >
            For full features{" "}
            <a
              href={primaryCta?.url || "#download"}
              target={primaryCta?.url ? "_blank" : undefined}
              rel={primaryCta?.url ? "noreferrer" : undefined}
              className="text-parchment/75 underline decoration-gold/70 underline-offset-4 hover:text-parchment"
            >
              download our App
            </a>
          </motion.p>
        </div>

        <motion.div
          style={badgeScrollStyle}
          className="relative mx-auto flex w-full max-w-sm items-center justify-center"
        >
          <svg
            viewBox="0 0 400 400"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <motion.circle
              cx="200"
              cy="200"
              r="172"
              fill="none"
              stroke="#C89B3C"
              strokeOpacity="0.35"
              strokeWidth="1.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>

          <motion.img
            src={badge}
            alt="Kabya app logo"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-56 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] sm:w-72"
          />
        </motion.div>
      </div>
    </section>
  );
}
