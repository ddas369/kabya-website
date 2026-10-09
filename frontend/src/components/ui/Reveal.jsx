import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

const VARIANTS = {
  up: { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: 36 }, show: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: -36 }, show: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.94 }, show: { opacity: 1, scale: 1 } },
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
};

/**
 * Fades/slides its children in once, the first time they scroll into view.
 * `variant` picks the entrance style; `delay` offsets it slightly for a
 * cascading feel when a few Reveals sit near each other.
 */
export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  duration = 0.7,
  className,
  viewportAmount = 0.25,
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: viewportAmount }}
      variants={VARIANTS[variant]}
      transition={{ duration, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Parent wrapper for a group of items that should reveal in a staggered cascade. */
export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

/** Child item to pair with staggerContainer - e.g. each card in a row of features. */
export const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export const staggerViewport = { once: true, amount: 0.2 };
