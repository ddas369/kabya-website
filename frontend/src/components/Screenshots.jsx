import { motion } from "framer-motion";
import { staggerContainer, staggerItem, staggerViewport } from "./ui/Reveal.jsx";

const SHOTS = [
  { src: "/seed-images/screenshot-translate-home.jpg", caption: "Translate" },
  { src: "/seed-images/screenshot-grammar.jpg", caption: "AI grammar check" },
  { src: "/seed-images/screenshot-camera.jpg", caption: "Camera translate" },
  { src: "/seed-images/screenshot-translate-result.jpg", caption: "Natural results" },
  { src: "/seed-images/screenshot-history.jpg", caption: "History" },
];

export default function Screenshots() {
  return (
    <section className="bg-parchment-dark py-20">
      <div className="container-page">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={staggerViewport}
          variants={staggerContainer}
          className="flex gap-5 overflow-x-auto pb-3"
        >
          {SHOTS.map((shot) => (
            <motion.figure key={shot.src} variants={staggerItem} className="w-48 flex-shrink-0 sm:w-56">
              <div className="overflow-hidden rounded-[1.75rem] border-[6px] border-ink bg-ink shadow-[0_25px_45px_-20px_rgba(31,26,18,0.4)]">
                <img src={shot.src} alt={`Kabya app - ${shot.caption} screen`} className="w-full" />
              </div>
              <figcaption className="mt-3 text-center text-sm font-medium text-ink/60">
                {shot.caption}
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
