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
];

export default function SignupPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", country: "IN" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true); setError("");
    const { data, error: err } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.fullName, country: form.country, currency: COUNTRIES.find(c => c.code === form.country)?.currency || "INR" } },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    if (data.user) router.push("/dashboard/overview");
    setLoading(false);
  };

  const inp: React.CSSProperties = {
    width: "100%", height: "44px", borderRadius: "10px", padding: "0 14px",
    fontSize: "14px", outline: "none", border: "1px solid #E4E4E7",
    background: "#FAFAFA", color: "#0A0A0A", fontFamily: "inherit",
    boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Left — dark panel */}
      <div style={{
        width: "44%", background: "#0A0A0A", padding: "36px 40px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "15px", fontWeight: "900", color: "#0A0A0A" }}>c</span>
          </div>
          <span style={{ fontSize: "16px", fontWeight: "800", color: "#fff", letterSpacing: "-0.02em" }}>
            casha<span style={{ color: "#22C55E" }}>.money</span>
          </span>
        </div>

        {/* Center content */}
        <div>
          <p style={{ fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: "800", color: "#fff", letterSpacing: "-0.03em", lineHeight: "1.2", margin: "0 0 20px 0" }}>
            Your complete<br />
            <span style={{ color: "#22C55E" }}>financial picture</span><br />
            in one place.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { t: "Free forever", d: "No credit card required. No hidden charges." },
              { t: "All Indian banks", d: "SMS Parser works with SBI, HDFC, ICICI and more." },
              { t: "AI advisor 24/7", d: "Answers based on your real data, not generic tips." },
              { t: "Tax optimizer", d: "Old vs New regime. Find every deduction." },
            ].map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                  <svg width="9" height="9" fill="none" stroke="#22C55E" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "700", color: "#fff", margin: "0 0 1px 0" }}>{b.t}</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0 }}>{b.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legal */}
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)", margin: 0, lineHeight: "1.5" }}>
          Financial education platform only. Not investment advice. Consult a qualified CA for tax decisions.
        </p>
      </div>

      {/* Right — form panel */}
      <div style={{ flex: 1, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 40px" }}>
        <div style={{ width: "100%", maxWidth: "360px" }}>

          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0A0A0A", letterSpacing: "-0.02em", margin: "0 0 4px 0" }}>
            Create your account
          </h1>
          <p style={{ fontSize: "14px", color: "#71717A", margin: "0 0 24px 0" }}>
            Free forever — no credit card required
          </p>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "9px", padding: "10px 14px", marginBottom: "16px" }}>
              <p style={{ fontSize: "13px", color: "#DC2626", margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Full name</label>
              <input type="text" required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Rahul Mehta" style={inp}
                onFocus={e => e.target.style.borderColor = "#22C55E"} onBlur={e => e.target.style.borderColor = "#E4E4E7"} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Email address</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" style={inp}
                onFocus={e => e.target.style.borderColor = "#22C55E"} onBlur={e => e.target.style.borderColor = "#E4E4E7"} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Password</label>
              <input type="password" required minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Minimum 8 characters" style={inp}
                onFocus={e => e.target.style.borderColor = "#22C55E"} onBlur={e => e.target.style.borderColor = "#E4E4E7"} />
              {/* Password strength */}
              {form.password.length > 0 && (
                <div style={{ display: "flex", gap: "3px", marginTop: "6px" }}>
                  {[2, 5, 8, 12].map((threshold, i) => (
                    <div key={i} style={{ flex: 1, height: "3px", borderRadius: "999px", background: form.password.length >= threshold ? (i < 1 ? "#EF4444" : i < 2 ? "#F59E0B" : "#22C55E") : "#E4E4E7", transition: "background 0.2s" }} />
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Country</label>
              <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
                style={{ ...inp, cursor: "pointer" }}>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>

            <button type="submit" disabled={loading} style={{
              height: "46px", borderRadius: "10px", border: "none",
              background: "#22C55E", color: "#fff", fontSize: "14px", fontWeight: "700",
              cursor: loading ? "wait" : "pointer", fontFamily: "inherit",
              opacity: loading ? 0.8 : 1, marginTop: "4px",
              boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
            }}>
              {loading ? "Creating account..." : "Create free account"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#71717A", margin: "16px 0 0 0" }}>
            Already have an account?{" "}
            <Link href="/auth/login" style={{ color: "#22C55E", fontWeight: "700", textDecoration: "none" }}>Sign in</Link>
          </p>

          <p style={{ textAlign: "center", fontSize: "11px", color: "#9CA3AF", margin: "12px 0 0 0", lineHeight: "1.5" }}>
            By signing up you agree to our{" "}
            <a href="/terms" style={{ color: "#71717A", textDecoration: "underline" }}>Terms</a>
            {" "}and{" "}
            <a href="/privacy" style={{ color: "#71717A", textDecoration: "underline" }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}