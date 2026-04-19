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

const LEFT_POINTS = [
  "Works with all Indian banks",
  "Tax optimizer built for India",
  "AI budget using 50/30/20",
  "No credit card required",
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const colors = ["#E5E7EB", "#EF4444", "#F59E0B", "#22C55E", "#16A34A"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return (
    <div style={{ marginTop: "8px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: "3px", borderRadius: "999px", background: i <= score ? colors[score] : "#E5E7EB", transition: "background 0.2s ease" }} />
        ))}
      </div>
      <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: colors[score] }}>{labels[score]}</p>
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
      options: { data: { full_name: form.fullName, country: form.country, currency: COUNTRIES.find(c => c.code === form.country)?.currency || "INR" } },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    if (data.user) router.push("/dashboard/overview");
    setLoading(false);
  };

  const inp = (name: string): React.CSSProperties => ({
    width: "100%", height: "46px", borderRadius: "10px", padding: "0 14px",
    fontSize: "14px", lineHeight: "46px", outline: "none", fontFamily: "inherit",
    background: "#FAFAFA", border: `1.5px solid ${focused === name ? "#22C55E" : "#E5E7EB"}`,
    color: "#0A0A0A", boxSizing: "border-box", transition: "border-color 0.15s ease",
  });

  return (
    <div style={{ minHeight: "100vh", width: "100%", display: "grid", gridTemplateColumns: "43% 57%", fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden" }}>

      {/* LEFT PANEL — everything centered */}
      <div style={{ background: "#0A0A0A", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 42px" }}>

        {/* Glow */}
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{
          width: "100%",
          maxWidth: "340px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center", // ← centers everything horizontally
          textAlign: "center",  // ← centers all text
        }}>

          {/* Logo — centered, clickable */}
          <a href="/" style={{ textDecoration: "none", marginBottom: "28px", display: "inline-flex", alignItems: "center", lineHeight: 1 }}>
            <img src="/logo.png" alt="Casha" style={{ width: "50px", height: "50px", objectFit: "contain", display: "block", flexShrink: 0, marginRight: "-8px" }} />
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1 }}>
              casha<span style={{ color: "#22C55E" }}>.money</span>
            </span>
          </a>

          <p style={{ margin: "0 0 12px 0", fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(34,197,94,0.8)" }}>
            Financial OS for India
          </p>

          <h1 style={{ margin: "0 0 16px 0", fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: "1.14", color: "#FFFFFF" }}>
            Your complete<br />
            <span style={{ color: "#22C55E" }}>financial picture</span><br />
            in one place.
          </h1>

          <p style={{ margin: "0 0 24px 0", fontSize: "14px", lineHeight: "1.65", color: "rgba(255,255,255,0.42)", maxWidth: "300px" }}>
            Track spending, save taxes, destroy debt, and get an AI advisor that actually knows your numbers.
          </p>

          {/* BULLET POINTS — centered block, icons + text perfectly aligned */}
          <div style={{ width: "100%", maxWidth: "290px", display: "flex", flexDirection: "column", gap: "11px", marginBottom: "26px" }}>
            {LEFT_POINTS.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Icon — fixed size, never grows */}
                <div style={{ width: "18px", height: "18px", borderRadius: "999px", background: "rgba(34,197,94,0.14)", border: "1px solid rgba(34,197,94,0.28)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="9" height="9" fill="none" stroke="#22C55E" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {/* Text — left aligned, same line as icon */}
                <span style={{ fontSize: "13px", lineHeight: "1.4", color: "rgba(255,255,255,0.55)", fontWeight: 500, textAlign: "left" }}>
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* STATS */}
          <div style={{ width: "100%", maxWidth: "290px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", paddingTop: "18px", borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "left" }}>
            {[
              { n: "618+", l: "early members" },
              { n: "Rs.42K", l: "avg. tax saved" },
              { n: "Free", l: "forever plan" },
            ].map((s, i) => (
              <div key={i}>
                <p style={{ margin: "0 0 3px 0", fontSize: "16px", fontWeight: 800, letterSpacing: "-0.02em", color: "#FFFFFF" }}>{s.n}</p>
                <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.28)", lineHeight: "1.3" }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 40px", overflow: "hidden" }}>
        <div style={{ width: "100%", maxWidth: "360px" }}>

          <div style={{ marginBottom: "22px" }}>
            <h2 style={{ margin: "0 0 6px 0", fontSize: "24px", fontWeight: 800, letterSpacing: "-0.03em", color: "#0A0A0A" }}>
              Create your account
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#71717A" }}>
              Free forever — no credit card required
            </p>
          </div>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "9px", padding: "10px 12px", marginBottom: "14px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "#DC2626" }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", fontWeight: 600, color: "#374151" }}>Full name</label>
              <input type="text" required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Rahul Mehta"
                style={inp("fullName")} onFocus={() => setFocused("fullName")} onBlur={() => setFocused("")} />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", fontWeight: 600, color: "#374151" }}>Email address</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com"
                style={inp("email")} onFocus={() => setFocused("email")} onBlur={() => setFocused("")} />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", fontWeight: 600, color: "#374151" }}>Password</label>
              <input type="password" required minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Minimum 8 characters"
                style={inp("password")} onFocus={() => setFocused("password")} onBlur={() => setFocused("")} />
              <PasswordStrength password={form.password} />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", fontWeight: 600, color: "#374151" }}>Country</label>
              <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
                style={{ ...inp("country"), appearance: "none", cursor: "pointer" }}
                onFocus={() => setFocused("country")} onBlur={() => setFocused("")}>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", height: "46px", borderRadius: "11px", border: "none",
              background: "#22C55E", color: "#FFFFFF", fontSize: "15px", fontWeight: 700,
              cursor: loading ? "wait" : "pointer", fontFamily: "inherit", opacity: loading ? 0.8 : 1,
              marginTop: "4px", boxShadow: "0 4px 14px rgba(34,197,94,0.28)",
            }}>
              {loading ? "Creating account..." : "Create free account →"}
            </button>
          </form>

          <p style={{ margin: "16px 0 0 0", textAlign: "center", fontSize: "13px", color: "#71717A" }}>
            Already have an account?{" "}
            <Link href="/auth/login" style={{ color: "#22C55E", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "16px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#F0F0F0" }} />
            <span style={{ fontSize: "11px", color: "#A1A1AA" }}>secure signup</span>
            <div style={{ flex: 1, height: "1px", background: "#F0F0F0" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "18px" }}>
            {["AES-256", "DPDPA", "No spam"].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#22C55E" }} />
                <span style={{ fontSize: "11px", color: "#A1A1AA" }}>{item}</span>
              </div>
            ))}
          </div>

          <p style={{ margin: "12px 0 0 0", textAlign: "center", fontSize: "11px", color: "#A1A1AA", lineHeight: "1.5" }}>
            By signing up you agree to our{" "}
            <a href="/terms" style={{ color: "#71717A", textDecoration: "underline" }}>Terms</a>
            {" "}and{" "}
            <a href="/privacy" style={{ color: "#71717A", textDecoration: "underline" }}>Privacy Policy</a>
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