import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { PrimaryButton } from "../../components/admin/AdminUI.jsx";
import logoWide from "../../assets/kabya-logo-wide.png";

const darkInputClass =
  "mt-1.5 w-full rounded-lg border border-parchment/15 bg-parchment/95 px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink/35 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40";

export default function Login() {
  const { login, isAuthenticated, checking } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!checking && isAuthenticated) return <Navigate to="/admin" replace />;

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <img src={logoWide} alt="Kabya" className="h-12 w-auto brightness-0 invert" />
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-parchment/10 bg-parchment/5 p-7"
        >
          <h1 className="text-center font-display text-xl text-parchment">Admin sign in</h1>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-parchment/80">Username</span>
              <input
                autoFocus
                className={darkInputClass}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-parchment/80">Password</span>
              <input
                type="password"
                className={darkInputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </div>

          {error && <p className="mt-4 text-sm text-gold-light">{error}</p>}

          <PrimaryButton type="submit" loading={loading} className="mt-6 w-full justify-center">
            Sign in
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
