import { Link } from "react-router-dom";
import monoBadge from "../assets/kabya-mono-badge.png";

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-parchment py-10">
      <div className="container-page flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-3">
          <img src={monoBadge} alt="" className="h-8 w-8 opacity-70" aria-hidden="true" />
          <p className="text-sm text-ink/55">
            &copy; {new Date().getFullYear()} Kabya. Built by Dipankar Das.
          </p>
        </div>
        <Link to="/admin/login" className="text-xs text-ink/30 transition-colors hover:text-ink/60">
          Admin
        </Link>
      </div>
    </footer>
  );
}
