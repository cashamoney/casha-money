"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const COUNTRIES = [
  { code: "IN", name: "India", currency: "INR" },
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "AE", name: "UAE", currency: "AED" },
  { code: "SG", name: "Singapore", currency: "SGD" },
  { code: "AU", name: "Australia", currency: "AUD" },
  { code: "CA", name: "Canada", currency: "CAD" },
  { code: "DE", name: "Germany", currency: "EUR" },
  { code: "NG", name: "Nigeria", currency: "NGN" },
  { code: "KE", name: "Kenya", currency: "KES" },
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ["#E4E4E7", "#EF4444", "#F59E0B", "#22C55E", "#16A34A"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div style={{ marginTop: "6px" }}>
      <div style={{ display: "flex", gap: "3px", marginBottom: "4px" }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: "2px", borderRadius: "999px", background: i <= score ? colors[score] : "#E4E4E7", transition: "background 0.2s" }} />
        ))}
      </div>
      <p style={{ fontSize: "11px", color: colors[score], margin: 0, fontWeight: "600" }}>{labels[score]}</p>
    </div>
  );
}

export default function SignupPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", country: "IN" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    setError("");
    const { data, error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          country: form.country,
          currency: COUNTRIES.find(c => c.code === form.country)?.currency || "INR",
        },
      },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    if (data.user) router.push("/dashboard/overview");
    setLoading(false);
  };

  const fieldStyle = (name: string): React.CSSProperties => ({
    width: "100%",
    height: "44px",
    borderRadius: "10px",
    padding: "0 14px",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    background: focused === name ? "#FFFFFF" : "#F9FAFB",
    border: `1.5px solid ${focused === name ? "#22C55E" : "#E4E4E7"}`,
    color: "#0A0A0A",
    boxSizing: "border-box",
    transition: "all 0.15s",
  });

  return (
    <div style={{ height: "100vh", display: "flex", fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden" }}>

      {/* ── LEFT PANEL ── */}
      <div style={{ width: "45%", background: "#0A0A0A", display: "flex", flexDirection: "column", padding: "40px 48px", position: "relative", overflow: "hidden", flexShrink: 0 }}>

        {/* Subtle gradient orbs */}
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "-60px", width: "260px", height: "260px", borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", lineHeight: 1, position: "relative", marginBottom: "auto" }}>
          <img src="/logo.png" alt="Casha" style={{ width: "48px", height: "48px", objectFit: "contain", display: "block", flexShrink: 0, marginRight: "-10px" }} />
          <span style={{ fontSize: "19px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em" }}>
            casha<span style={{ color: "#22C55E" }}>.money</span>
          </span>
        </div>

        {/* Main message — center of panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(34,197,94,0.75)", margin: "0 0 14px 0" }}>
            Financial OS for India
          </p>
          <h2 style={{ fontSize: "clamp(22px, 2.6vw, 34px)", fontWeight: "800", color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: "1.15", margin: "0 0 20px 0" }}>
            The only app that<br />
            covers your{" "}
            <span style={{ color: "#22C55E" }}>complete</span><br />
            financial life.
          </h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: "1.65", margin: "0 0 32px 0", maxWidth: "320px" }}>
            Track every rupee, destroy debt, save taxes, and build wealth — powered by AI. Free forever.
          </p>

          {/* 4 trust points — clean and minimal */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              "AI advisor based on your real transactions",
              "Tax optimizer — Old vs New regime",
              "SMS Parser for all Indian banks",
              "50/30/20 budget AI — one click",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#22C55E", flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "28px 0" }} />

          {/* Stats row */}
          <div style={{ display: "flex", gap: "0" }}>
            {[
              { n: "618+", l: "Early members" },
              { n: "Rs.42K", l: "Avg. tax saved" },
              { n: "Free", l: "Core plan" },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, paddingRight: i < 2 ? "20px" : "0", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none", paddingLeft: i > 0 ? "20px" : "0" }}>
                <p style={{ fontSize: "18px", fontWeight: "800", color: "#FFFFFF", margin: "0 0 2px 0", letterSpacing: "-0.02em" }}>{s.n}</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)", margin: 0 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Legal — bottom */}
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.14)", margin: "0", lineHeight: "1.5", position: "relative" }}>
          Not a SEBI-registered advisor. Educational purposes only.
        </p>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px", background: "#FFFFFF", overflow: "hidden" }}>
        <div style={{ width: "100%", maxWidth: "360px" }}>

          {/* Header */}
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0A0A0A", letterSpacing: "-0.03em", margin: "0 0 6px 0" }}>
              Create your account
            </h1>
            <p style={{ fontSize: "14px", color: "#71717A", margin: 0 }}>
              Free forever — no credit card required
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "9px", padding: "10px 13px", marginBottom: "16px" }}>
              <p style={{ fontSize: "13px", color: "#DC2626", margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Full name */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px", letterSpacing: "0.01em" }}>
                Full name
              </label>
              <input
                type="text" required value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                placeholder="Rahul Mehta"
                style={fieldStyle("name")}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused("")}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px", letterSpacing: "0.01em" }}>
                Email address
              </label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                style={fieldStyle("email")}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px", letterSpacing: "0.01em" }}>
                Password
              </label>
              <input
                type="password" required value={form.password} minLength={8}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 8 characters"
                style={fieldStyle("password")}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
              />
              <PasswordStrength password={form.password} />
            </div>

            {/* Country */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px", letterSpacing: "0.01em" }}>
                Country
              </label>
              <select
                value={form.country}
                onChange={e => setForm({ ...form, country: e.target.value })}
                style={{ ...fieldStyle("country"), appearance: "none", cursor: "pointer" }}
                onFocus={() => setFocused("country")}
                onBlur={() => setFocused("")}
              >
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "46px",
                borderRadius: "11px",
                border: "none",
                background: "#22C55E",
                color: "#FFFFFF",
                fontSize: "15px",
                fontWeight: "700",
                cursor: loading ? "wait" : "pointer",
                fontFamily: "inherit",
                opacity: loading ? 0.8 : 1,
                transition: "opacity 0.15s, transform 0.1s",
                boxShadow: "0 4px 14px rgba(34,197,94,0.28)",
                marginTop: "4px",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            >
              {loading ? "Creating account..." : "Create free account →"}
            </button>
          </form>

          {/* Sign in link */}
          <p style={{ textAlign: "center", fontSize: "13px", color: "#71717A", margin: "18px 0 0 0" }}>
            Already have an account?{" "}
            <Link href="/auth/login" style={{ color: "#22C55E", fontWeight: "700", textDecoration: "none" }}>
              Sign in
            </Link>
          </p>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "18px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#F0F0F0" }} />
            <span style={{ fontSize: "11px", color: "#C4C4C4", whiteSpace: "nowrap" }}>secured by</span>
            <div style={{ flex: 1, height: "1px", background: "#F0F0F0" }} />
          </div>

          {/* Trust badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
            {[
              { icon: "🔒", label: "AES-256" },
              { icon: "🛡️", label: "DPDPA" },
              { icon: "🔕", label: "No spam" },
            ].map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ fontSize: "12px" }}>{b.icon}</span>
                <span style={{ fontSize: "11px", color: "#A1A1AA", fontWeight: "500" }}>{b.label}</span>
              </div>
            ))}
          </div>

          {/* Terms */}
          <p style={{ textAlign: "center", fontSize: "11px", color: "#C4C4C4", margin: "14px 0 0 0", lineHeight: "1.5" }}>
            By signing up you agree to our{" "}
            <a href="/terms" style={{ color: "#A1A1AA", textDecoration: "underline" }}>Terms</a>
            {" "}and{" "}
            <a href="/privacy" style={{ color: "#A1A1AA", textDecoration: "underline" }}>Privacy Policy</a>
          </p>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        input::placeholder, textarea::placeholder { color: #C4C4C4; }
        ::selection { background: rgba(34,197,94,0.22); color: #0A0A0A; }
        ::-moz-selection { background: rgba(34,197,94,0.22); color: #0A0A0A; }
      `}</style>
    </div>
  );
}