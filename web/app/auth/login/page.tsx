"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    if (data.user) router.push("/dashboard/overview");
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      fontFamily: "'Inter', system-ui, sans-serif",
      background: "#FAFAFA",
    }}>
      {/* Left panel — branding */}
      <div style={{
        width: "50%", background: "#0A0A0A",
        display: "flex", flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px", position: "relative", overflow: "hidden",
      }}>
        {/* Background decoration */}
        <div style={{
          position: "absolute", top: "-100px", right: "-100px",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-80px", left: "-80px",
          width: "300px", height: "300px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "9px",
            background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "17px", fontWeight: "900", color: "#0A0A0A" }}>c</span>
          </div>
          <span style={{ fontSize: "18px", fontWeight: "800", color: "#fff", letterSpacing: "-0.03em" }}>
            casha<span style={{ color: "#22C55E" }}>.money</span>
          </span>
        </div>

        {/* Center quote */}
        <div style={{ position: "relative" }}>
          <p style={{
            fontSize: "clamp(28px, 3vw, 40px)", fontWeight: "800",
            color: "#fff", letterSpacing: "-0.03em", lineHeight: "1.15",
            margin: "0 0 20px 0",
          }}>
            "Your money,
            <br />
            <span style={{ color: "#22C55E" }}>finally</span> making
            <br />
            sense."
          </p>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)", margin: "0 0 32px 0", lineHeight: "1.6" }}>
            Join 618+ people who stopped guessing with their finances.
          </p>
          {/* Mini stats */}
          <div style={{ display: "flex", gap: "32px" }}>
            {[
              { n: "Rs.42K", l: "avg. tax saved" },
              { n: "Rs.2,400", l: "monthly waste found" },
              { n: "Free", l: "forever" },
            ].map((s, i) => (
              <div key={i}>
                <p style={{ fontSize: "20px", fontWeight: "800", color: "#22C55E", margin: "0 0 2px 0", letterSpacing: "-0.02em" }}>{s.n}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: 0 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Legal */}
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)", margin: 0, lineHeight: "1.5", position: "relative" }}>
          Financial education platform only. Not investment advice.
        </p>
      </div>

      {/* Right panel — form */}
      <div style={{
        width: "50%", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "48px",
        background: "#fff",
      }}>
        <div style={{ width: "100%", maxWidth: "380px" }}>

          <h1 style={{
            fontSize: "26px", fontWeight: "800", color: "#0A0A0A",
            letterSpacing: "-0.03em", margin: "0 0 8px 0",
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize: "15px", color: "#71717A", margin: "0 0 32px 0" }}>
            Sign in to your Casha dashboard
          </p>

          {error && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: "10px", padding: "12px 16px",
              marginBottom: "20px",
            }}>
              <p style={{ fontSize: "13px", color: "#DC2626", margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "7px" }}>
                Email address
              </label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%", height: "48px", borderRadius: "11px",
                  padding: "0 16px", fontSize: "15px", outline: "none",
                  border: "1px solid #E4E4E7", background: "#FAFAFA",
                  color: "#0A0A0A", fontFamily: "inherit",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => e.target.style.borderColor = "#22C55E"}
                onBlur={e => e.target.style.borderColor = "#E4E4E7"}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                  Password
                </label>
                <a href="#" style={{ fontSize: "13px", color: "#22C55E", textDecoration: "none", fontWeight: "500" }}>
                  Forgot password?
                </a>
              </div>
              <input
                type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: "100%", height: "48px", borderRadius: "11px",
                  padding: "0 16px", fontSize: "15px", outline: "none",
                  border: "1px solid #E4E4E7", background: "#FAFAFA",
                  color: "#0A0A0A", fontFamily: "inherit",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => e.target.style.borderColor = "#22C55E"}
                onBlur={e => e.target.style.borderColor = "#E4E4E7"}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", height: "50px", borderRadius: "11px",
                border: "none", background: "#0A0A0A", color: "#fff",
                fontSize: "15px", fontWeight: "700", cursor: loading ? "wait" : "pointer",
                fontFamily: "inherit", opacity: loading ? 0.8 : 1,
                transition: "opacity 0.15s",
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "14px", color: "#71717A", margin: "24px 0 0 0" }}>
            Don't have an account?{" "}
            <Link href="/auth/signup" style={{ color: "#22C55E", fontWeight: "700", textDecoration: "none" }}>
              Create one free
            </Link>
          </p>

          {/* Security note */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "32px" }}>
            <svg width="12" height="12" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>AES-256 encrypted — your data is safe</span>
          </div>
        </div>
      </div>
    </div>
  );
}