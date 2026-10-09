import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Nav from "./Nav.jsx";
import Footer from "./Footer.jsx";
import { api } from "../lib/api.js";

const TABS = [
  { to: "/translate", label: "Translate" },
  { to: "/grammar", label: "Grammar check" },
];

/** Shared page frame for the in-browser tools: nav, title, tab switcher, footer. */
export default function WebAppLayout({ title, subtitle, children }) {
  // Use the real download link when the API is reachable; otherwise fall back to the home page.
  const [downloadUrl, setDownloadUrl] = useState("");
  useEffect(() => {
    api
      .getContent()
      .then((c) => setDownloadUrl(c.downloads?.playStoreUrl || ""))
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-parchment">
      <Nav downloadUrl={downloadUrl} />

      <main className="flex-1 py-14 sm:py-20">
        <div className="container-page max-w-2xl">
          <h1 className="text-center font-display text-3xl font-medium text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-center text-ink/60">{subtitle}</p>

          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-full bg-ink/5 p-1">
              {TABS.map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                      isActive ? "bg-ink text-parchment" : "text-ink/60 hover:text-ink"
                    }`
                  }
                >
                  {tab.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="mt-10">{children}</div>

          <p className="mt-12 text-center text-sm text-ink/55">
            For full features{" "}
            <a
              href={downloadUrl || "/#download"}
              target={downloadUrl ? "_blank" : undefined}
              rel={downloadUrl ? "noreferrer" : undefined}
              className="font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4 hover:text-crimson"
            >
              download our App
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
