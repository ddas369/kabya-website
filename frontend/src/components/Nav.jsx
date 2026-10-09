import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoWide from "../assets/kabya-logo-wide.png";

const LINKS = [
  { href: "/#overview", label: "Overview" },
  { href: "/#features", label: "Features" },
  { href: "/#developer", label: "Developer" },
];

export default function Nav({ downloadUrl }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-parchment/90 backdrop-blur">
      <div className="container-page flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoWide} alt="Kabya" className="h-10 w-auto sm:h-12" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-ink/75 transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/translate"
            className="rounded-full border border-gold px-5 py-2.5 text-[15px] font-medium text-ink transition-colors hover:bg-gold/15"
          >
            Try it online
          </Link>
          <a
            href={downloadUrl || "/#download"}
            className="rounded-full bg-ink px-5 py-2.5 text-[15px] font-medium text-parchment transition-colors hover:bg-crimson"
          >
            Get the app
          </a>
        </nav>

        <button
          type="button"
          className="p-2 text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink/10 bg-parchment md:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-ink/80 hover:bg-ink/5"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/translate"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full border border-gold px-4 py-3 text-center text-base font-medium text-ink"
            >
              Try it online
            </Link>
            <a
              href={downloadUrl || "/#download"}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-ink px-4 py-3 text-center text-base font-medium text-parchment"
            >
              Get the app
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
