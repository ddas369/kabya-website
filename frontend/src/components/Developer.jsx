import { motion } from "framer-motion";
import { Mail, Github, Linkedin, Instagram, Smartphone, Globe, Gamepad2 } from "lucide-react";
import SectionHeading from "./ui/SectionHeading.jsx";
import Reveal, { staggerContainer, staggerViewport } from "./ui/Reveal.jsx";
import { assetUrl } from "../lib/api.js";

const LINK_ICONS = {
  email: Mail,
  instagram: Instagram,
  github: Github,
  linkedin: Linkedin,
  playstore: Smartphone,
  website: Globe,
};

function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Developer({ developer }) {
  if (!developer) return null;
  const { name, role, location, bio, photoUrl, links = {}, otherApps = [] } = developer;

  const activeLinks = Object.entries(links).filter(([, url]) => url);

  return (
    <section id="developer" className="bg-ink py-24 text-parchment sm:py-28">
      <div className="container-page">
        <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <Reveal variant="right" className="flex flex-col items-start">
            {photoUrl ? (
              <img
                src={assetUrl(photoUrl)}
                alt={name}
                className="h-28 w-28 rounded-full object-cover ring-2 ring-gold/50"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-parchment/10 font-display text-3xl text-gold ring-2 ring-gold/50">
                {initials(name)}
              </div>
            )}
            <h3 className="mt-6 text-2xl font-medium">{name}</h3>
            <p className="mt-1 text-[15px] text-parchment/60">{role}</p>
            <p className="text-[15px] text-parchment/60">{location}</p>

            {activeLinks.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-3">
                {activeLinks.map(([key, url]) => {
                  const Icon = LINK_ICONS[key] || Globe;
                  const href = key === "email" && !url.startsWith("mailto:") ? `mailto:${url}` : url;
                  return (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={key}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-parchment/20 text-parchment/80 transition-colors hover:border-gold hover:text-gold"
                    >
                      <Icon size={17} />
                    </a>
                  );
                })}
              </div>
            )}
          </Reveal>

          <Reveal variant="left" delay={0.1}>
            <SectionHeading tone="parchment" heading="About the developer" />
            <p className="mt-5 max-w-prose text-[17px] leading-relaxed text-parchment/70">{bio}</p>

            {otherApps.length > 0 && (
              <div className="mt-12">
                <h4 className="text-sm font-semibold uppercase tracking-normal text-parchment/50">
                  Other apps &amp; games
                </h4>
                <motion.div
                  initial="hidden"
                  whileInView="show"
                  viewport={staggerViewport}
                  variants={staggerContainer}
                  className="mt-5 flex gap-5 overflow-x-auto pb-3"
                >
                  {otherApps.map((app, i) => {
                    const tilt = i % 2 === 0 ? -1.2 : 1;
                    const cardVariants = {
                      hidden: { opacity: 0, y: 24, rotate: 0 },
                      show: {
                        opacity: 1,
                        y: 0,
                        rotate: tilt,
                        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                      },
                    };
                    return (
                      <motion.a
                        key={app.id}
                        variants={cardVariants}
                        href={app.url || undefined}
                        target={app.url ? "_blank" : undefined}
                        rel={app.url ? "noreferrer" : undefined}
                        className="w-44 flex-shrink-0 rounded-2xl border border-parchment/15 bg-parchment/5 p-4 transition-colors hover:border-gold/40"
                      >
                        <div className="flex h-24 w-full items-center justify-center rounded-xl bg-parchment/10">
                          {app.imageUrl ? (
                            <img
                              src={assetUrl(app.imageUrl)}
                              alt={app.name}
                              className="h-full w-full rounded-xl object-cover"
                            />
                          ) : (
                            <Gamepad2 size={30} className="text-gold/70" />
                          )}
                        </div>
                        <p className="mt-3 text-[15px] font-medium text-parchment">{app.name}</p>
                        {app.description && (
                          <p className="mt-1 text-[13px] leading-snug text-parchment/55">
                            {app.description}
                          </p>
                        )}
                      </motion.a>
                    );
                  })}
                </motion.div>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
