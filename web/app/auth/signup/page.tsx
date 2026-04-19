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
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    country: "IN",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
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

  const inputStyle = (focused = false): React.CSSProperties => ({
    width: "100%", height: "48px", borderRadius: "11px",
    padding: "0 16px", fontSize: "15px", outline: "none",
    border: `1px solid ${focused ? "#22C55E" : "#E4E4E7"}`,
    background: "#FAFAFA", color: "#0A0A0A",
    fontFamily: "inherit", boxSizing: "border-box",
    transition: "border-color 0.15s",
  });

  const [focused, setFocused] = useState("");

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      fontFamily: "'Inter', system-ui, sans-serif",
      background: "#FAFAFA",
    }}>
      {/* Left panel */}
      <div style={{
        width: "50%", background: "#0A0A0A",
        display: "flex", flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-100px", right: "-100px",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "17px", fontWeight: "900", color: "#0A0A0A" }}>c</span>
          </div>
          <span style={{ fontSize: "18px", fontWeight: "800", color: "#fff", letterSpacing: "-0.03em" }}>
            casha<span style={{ color: "#22C55E" }}>.money</span>
          </span>
        </div>

        {/* Benefits */}
        <div style={{ position: "relative" }}>
          <p style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: "800", color: "#fff", letterSpacing: "-0.03em", lineHeight: "1.15", margin: "0 0 28px 0" }}>
            Your complete
            <br />
            <span style={{ color: "#22C55E" }}>financial picture</span>
            <br />
            in one place.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { title: "Free forever", desc: "No credit card required. No hidden charges." },
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
                  <p style={{ fontSize: "14px", fontWeight: "700", color: "#fff", margin: "0 0 2px 0" }}>{b.title}</p>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: 0 }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)", margin: 0, lineHeight: "1.5", position: "relative" }}>
          Financial education platform only. Not investment advice. Consult a qualified CA for tax decisions.
        </p>
      </div>

      {/* Right panel — form */}
      <div style={{ width: "50%", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px", background: "#fff" }}>
        <div style={{ width: "100%", maxWidth: "380px" }}>

          {/* Progress dots */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "32px" }}>
            {[1, 2].map(s => (
              <div key={s} style={{ height: "3px", flex: 1, borderRadius: "999px", background: step >= s ? "#22C55E" : "#E4E4E7", transition: "background 0.3s" }} />
            ))}
          </div>

          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0A0A0A", letterSpacing: "-0.03em", margin: "0 0 8px 0" }}>
            Create your account
          </h1>
          <p style={{ fontSize: "15px", color: "#71717A", margin: "0 0 32px 0" }}>
            Free forever — no credit card required
          </p>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px" }}>
              <p style={{ fontSize: "13px", color: "#DC2626", margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "7px" }}>
                Full name
              </label>
              <input
                type="text" required value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                placeholder="Rahul Mehta"
                style={inputStyle(focused === "name")}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused("")}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "7px" }}>
                Email address
              </label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                style={inputStyle(focused === "email")}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "7px" }}>
                Password
              </label>
              <input
                type="password" required value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 8 characters"
                minLength={8}
                style={inputStyle(focused === "password")}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
              />
              {form.password.length > 0 && (
                <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: "3px", borderRadius: "999px",
                      background: form.password.length >= i * 2 + 2
                        ? i <= 1 ? "#EF4444" : i <= 2 ? "#F59E0B" : "#22C55E"
                        : "#E4E4E7",
                      transition: "background 0.2s"
                    }} />
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "7px" }}>
                Country
              </label>
              <select
                value={form.country}
                onChange={e => setForm({ ...form, country: e.target.value })}
                style={{
                  width: "100%", height: "48px", borderRadius: "11px",
                  padding: "0 16px", fontSize: "15px", outline: "none",
                  border: "1px solid #E4E4E7", background: "#FAFAFA",
                  color: "#0A0A0A", fontFamily: "inherit",
                  boxSizing: "border-box", cursor: "pointer",
                  appearance: "none",
                }}
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", height: "50px", borderRadius: "11px",
                border: "none", background: "#22C55E", color: "#fff",
                fontSize: "15px", fontWeight: "700", cursor: loading ? "wait" : "pointer",
                fontFamily: "inherit", opacity: loading ? 0.8 : 1,
                transition: "opacity 0.15s",
                boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
              }}
            >
              {loading ? "Creating account..." : "Create free account"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "14px", color: "#71717A", margin: "24px 0 0 0" }}>
            Already have an account?{" "}
            <Link href="/auth/login" style={{ color: "#22C55E", fontWeight: "700", textDecoration: "none" }}>
              Sign in
            </Link>
          </p>

          <p style={{ textAlign: "center", fontSize: "12px", color: "#9CA3AF", margin: "20px 0 0 0", lineHeight: "1.5" }}>
            By creating an account you agree to our{" "}
            <a href="/terms" style={{ color: "#71717A", textDecoration: "underline" }}>Terms</a>
            {" "}and{" "}
            <a href="/privacy" style={{ color: "#71717A", textDecoration: "underline" }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}