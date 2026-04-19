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

export default function SignupPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", country: "IN" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");
  const [strength, setStrength] = useState(0);
  const router = useRouter();

  const calcStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

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

  const input = (focused: boolean): React.CSSProperties => ({
    width: "100%",
    height: "48px",
    borderRadius: "11px",
    padding: "0 16px",
    fontSize: "15px",
    outline: "none",
    fontFamily: "inherit",
    background: "#FAFAFA",
    border: `1.5px solid ${focused ? "#22C55E" : "#E4E4E7"}`,
    color: "#0A0A0A",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  });

  const strengthColors = ["#E4E4E7", "#EF4444", "#F59E0B", "#22C55E", "#16A34A"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', system-ui, sans-serif", background: "#FAFAFA" }}>

      {/* LEFT — dark branding panel */}
      <div style={{ width: "44%", background: "#0A0A0A", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px", position: "relative", overflow: "hidden" }}>

        {/* Background glow */}
        <div style={{ position: "absolute", top: "-120px", right: "-120px", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", lineHeight: 1, position: "relative" }}>
          <img src="/logo.png" alt="Casha" style={{ width: "52px", height: "52px", objectFit: "contain", display: "block", flexShrink: 0, marginRight: "-10px" }} />
          <span style={{ fontSize: "20px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1 }}>
            casha<span style={{ color: "#22C55E" }}>.money</span>
          </span>
        </div>

        {/* Main quote */}
        <div style={{ position: "relative" }}>
          <p style={{ fontSize: "clamp(24px, 2.8vw, 36px)", fontWeight: "800", color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: "1.15", margin: "0 0 24px 0" }}>
            Your complete<br />
            <span style={{ color: "#22C55E" }}>financial picture</span><br />
            in one place.
          </p>

          {/* Benefits */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "36px" }}>
            {[
              { title: "Free forever", desc: "No credit card. No hidden charges." },
              { title: "All Indian banks", desc: "SMS Parser works with SBI, HDFC, ICICI and more." },
              { title: "AI advisor 24/7", desc: "Answers based on your real data, not generic tips." },
              { title: "Tax optimizer", desc: "Old vs New regime. Find every deduction." },
            ].map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                  <svg width="10" height="10" fill="none" stroke="#22C55E" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: "700", color: "#FFFFFF", margin: "0 0 2px 0" }}>{b.title}</p>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.38)", margin: 0 }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "28px" }}>
            {[{ n: "Rs.42K", l: "avg. tax saved" }, { n: "Rs.2,400", l: "monthly waste found" }, { n: "Free", l: "forever" }].map((s, i) => (
              <div key={i}>
                <p style={{ fontSize: "18px", fontWeight: "800", color: "#22C55E", margin: "0 0 2px 0", letterSpacing: "-0.02em" }}>{s.n}</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: 0 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Legal */}
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)", margin: 0, lineHeight: "1.5", position: "relative" }}>
          Financial education platform only. Not investment advice.<br />
          Consult a qualified CA for tax and investment decisions.
        </p>
      </div>

      {/* RIGHT — form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px", background: "#FFFFFF", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>

          {/* Progress bar */}
          <div style={{ display: "flex", gap: "5px", marginBottom: "36px" }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ height: "3px", flex: 1, borderRadius: "999px", background: s === 1 ? "#22C55E" : "#E4E4E7", transition: "background 0.3s" }} />
            ))}
          </div>

          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0A0A0A", letterSpacing: "-0.03em", margin: "0 0 6px 0" }}>
            Create your account
          </h1>
          <p style={{ fontSize: "15px", color: "#71717A", margin: "0 0 28px 0" }}>
            Free forever — no credit card required
          </p>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "11px 14px", marginBottom: "18px" }}>
              <p style={{ fontSize: "13px", color: "#DC2626", margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup}>

            {/* Full name */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Full name</label>
              <input
                type="text" required value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                placeholder="Rahul Mehta"
                style={input(focused === "name")}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused("")}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Email address</label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                style={input(focused === "email")}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Password</label>
              <input
                type="password" required value={form.password} minLength={8}
                onChange={e => { setForm({ ...form, password: e.target.value }); setStrength(calcStrength(e.target.value)); }}
                placeholder="Minimum 8 characters"
                style={input(focused === "password")}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
              />
              {form.password.length > 0 && (
                <div style={{ marginTop: "8px" }}>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{ flex: 1, height: "3px", borderRadius: "999px", background: i <= strength ? strengthColors[strength] : "#E4E4E7", transition: "background 0.2s" }} />
                    ))}
                  </div>
                  <p style={{ fontSize: "11px", color: strengthColors[strength], margin: 0, fontWeight: "600" }}>{strengthLabels[strength]}</p>
                </div>
              )}
            </div>

            {/* Country */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Country</label>
              <select
                value={form.country}
                onChange={e => setForm({ ...form, country: e.target.value })}
                style={{ ...input(focused === "country"), appearance: "none", cursor: "pointer" }}
                onFocus={() => setFocused("country")}
                onBlur={() => setFocused("")}
              >
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", height: "50px", borderRadius: "12px", border: "none",
                background: "#22C55E", color: "#FFFFFF", fontSize: "15px", fontWeight: "700",
                cursor: loading ? "wait" : "pointer", fontFamily: "inherit",
                opacity: loading ? 0.8 : 1, transition: "opacity 0.15s",
                boxShadow: "0 4px 14px rgba(34,197,94,0.32)",
              }}
            >
              {loading ? "Creating account..." : "Create free account"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "14px", color: "#71717A", margin: "20px 0 0 0" }}>
            Already have an account?{" "}
            <Link href="/auth/login" style={{ color: "#22C55E", fontWeight: "700", textDecoration: "none" }}>Sign in</Link>
          </p>

          <p style={{ textAlign: "center", fontSize: "12px", color: "#A1A1AA", margin: "16px 0 0 0", lineHeight: "1.5" }}>
            By creating an account you agree to our{" "}
            <a href="/terms" style={{ color: "#71717A", textDecoration: "underline" }}>Terms</a>
            {" "}and{" "}
            <a href="/privacy" style={{ color: "#71717A", textDecoration: "underline" }}>Privacy Policy</a>
          </p>

          {/* Security note */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "24px" }}>
            <svg width="12" height="12" fill="none" stroke="#A1A1AA" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span style={{ fontSize: "12px", color: "#A1A1AA" }}>AES-256 encrypted — your data is safe</span>
          </div>
        </div>
      </div>

      <style>{`
        ::selection { background: rgba(34,197,94,0.22); color: #0A0A0A; }
        ::-moz-selection { background: rgba(34,197,94,0.22); color: #0A0A0A; }
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}