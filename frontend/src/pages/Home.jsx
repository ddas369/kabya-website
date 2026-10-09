import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api, assetUrl } from "../lib/api.js";
import Nav from "../components/Nav.jsx";
import Hero from "../components/Hero.jsx";
import Overview from "../components/Overview.jsx";
import Screenshots from "../components/Screenshots.jsx";
import Features from "../components/Features.jsx";
import HowItWorks from "../components/HowItWorks.jsx";
import Developer from "../components/Developer.jsx";
import DownloadCTA from "../components/DownloadCTA.jsx";
import Footer from "../components/Footer.jsx";

export default function Home() {
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const { hash } = useLocation();

  useEffect(() => {
    api
      .getContent()
      .then(setContent)
      .catch((err) => setError(err.message));
  }, []);

  // Sections only exist once content has loaded, so scroll to the URL's #section then.
  useEffect(() => {
    if (content && hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    }
  }, [content, hash]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-parchment px-6 text-center">
        <p className="font-display text-2xl text-ink">Couldn't reach the Kabya API</p>
        <p className="max-w-md text-ink/60">
          Make sure the backend server is running (see the project README), then refresh this page.
        </p>
        <p className="mt-2 rounded-lg bg-ink/5 px-3 py-2 font-mono text-xs text-ink/50">{error}</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-parchment">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink/15 border-t-gold" />
      </div>
    );
  }

  return (
    <div>
      <Nav downloadUrl={content.downloads?.playStoreUrl} />
      <Hero
        title={content.hero.title}
        subtitle={content.hero.subtitle}
        primaryCta={content.hero.primaryCta}
        secondaryCta={content.hero.secondaryCta}
      />
      <Overview heading={content.overview.heading} paragraphs={content.overview.paragraphs} />
      <Screenshots />
      <Features features={content.features} />
      <HowItWorks steps={content.howItWorks} />
      <Developer developer={content.developer} />
      <DownloadCTA
        playStoreUrl={content.downloads?.playStoreUrl}
        apkUrl={assetUrl(content.downloads?.apkUrl)}
        apkFileName={content.downloads?.apkFileName}
      />
      <Footer />
    </div>
  );
}
