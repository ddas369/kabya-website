import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../lib/api.js";
import logoWide from "../../assets/kabya-logo-wide.png";

import HeroEditor from "../../components/admin/HeroEditor.jsx";
import OverviewEditor from "../../components/admin/OverviewEditor.jsx";
import FeaturesEditor from "../../components/admin/FeaturesEditor.jsx";
import HowItWorksEditor from "../../components/admin/HowItWorksEditor.jsx";
import DeveloperEditor from "../../components/admin/DeveloperEditor.jsx";
import SettingsEditor from "../../components/admin/SettingsEditor.jsx";
import AccountEditor from "../../components/admin/AccountEditor.jsx";

const TABS = [
  { key: "hero", label: "Hero" },
  { key: "overview", label: "Overview" },
  { key: "features", label: "Features" },
  { key: "howItWorks", label: "How it works" },
  { key: "developer", label: "Developer" },
  { key: "settings", label: "Settings" },
  { key: "account", label: "Account" },
];

export default function Dashboard() {
  const { token, logout } = useAuth();
  const [content, setContent] = useState(null);
  const [tab, setTab] = useState("hero");
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    api.adminGetContent(token).then(setContent).catch((err) => setLoadError(err.message));
  }, [token]);

  if (loadError) {
    return <p className="p-8 text-crimson">{loadError}</p>;
  }
  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-parchment">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/15 border-t-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment">
      <header className="sticky top-0 z-10 border-b border-ink/10 bg-parchment/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <img src={logoWide} alt="Kabya" className="h-8 w-auto" />
          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink"
            >
              View site <ExternalLink size={14} />
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-crimson"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <nav className="mb-8 flex flex-wrap gap-2 border-b border-ink/10 pb-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.key ? "bg-ink text-parchment" : "text-ink/60 hover:bg-ink/5"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="max-w-2xl">
          {tab === "hero" && (
            <HeroEditor
              hero={content.hero}
              onSaved={(hero) => setContent((c) => ({ ...c, hero }))}
            />
          )}
          {tab === "overview" && (
            <OverviewEditor
              overview={content.overview}
              onSaved={(overview) => setContent((c) => ({ ...c, overview }))}
            />
          )}
          {tab === "features" && (
            <FeaturesEditor
              features={content.features}
              onChange={(features) => setContent((c) => ({ ...c, features }))}
            />
          )}
          {tab === "howItWorks" && (
            <HowItWorksEditor
              steps={content.howItWorks}
              onChange={(howItWorks) => setContent((c) => ({ ...c, howItWorks }))}
            />
          )}
          {tab === "developer" && (
            <DeveloperEditor
              developer={content.developer}
              onSaved={(developer) => setContent((c) => ({ ...c, developer }))}
            />
          )}
          {tab === "settings" && (
            <SettingsEditor
              meta={content.meta}
              downloads={content.downloads}
              onMetaSaved={(meta) => setContent((c) => ({ ...c, meta }))}
              onDownloadsSaved={(downloads) => setContent((c) => ({ ...c, downloads }))}
            />
          )}
          {tab === "account" && <AccountEditor />}
        </div>
      </div>
    </div>
  );
}
