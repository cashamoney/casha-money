"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LEFT_POINTS = [
  "Review your financial health score",
  "Track spending and subscriptions",
  "Continue your debt payoff plan",
  "Ask your AI advisor anything",
];

function LoginLogo({ light = false }: { light?: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "2px",
          lineHeight: 1,
        }}
      >
        <img
          src="/logo.png"
          alt="Casha"
          style={{
            width: "50px",
            height: "50px",
            objectFit: "contain",
            display: "block",
            flexShrink: 0,
            marginRight: "-8px",
          }}
        />
        <span
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: light ? "#FFFFFF" : "#0A0A0A",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          casha<span style={{ color: "#22C55E" }}>.money</span>
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      router.push("/dashboard/overview");
    }

    setLoading(false);
  };

  const inputStyle = (name: string): React.CSSProperties => ({
    width: "100%",
    height: "44px",
    borderRadius: "10px",
    padding: "0 14px",
    fontSize: "14px",
    lineHeight: "44px",
    outline: "none",
    fontFamily: "inherit",
    background: "#FAFAFA",
    border: `1.5px solid ${focused === name ? "#22C55E" : "#E5E7EB"}`,
    color: "#0A0A0A",
    boxSizing: "border-box",
    transition: "border-color 0.15s ease",
  });

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "43% 57%",
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: "hidden",
        background: "#F8FAFC",
      }}
    >
      {/* LEFT PANEL */}
      <div
        style={{
          background: "#0A0A0A",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "34px 40px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            width: "100%",
            maxWidth: "340px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* CLICKABLE LOGO */}
          <a href="/" style={{ display: "block", textDecoration: "none", marginBottom: "24px" }}>
            <LoginLogo light />
          </a>

          <p style={{ margin: "0 0 10px 0", fontSize: "11px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(34,197,94,0.8)" }}>
            Welcome back
          </p>

          <h1 style={{ margin: "0 0 14px 0", fontSize: "clamp(23px, 2.7vw, 32px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: "1.14", color: "#FFFFFF" }}>
            Pick up exactly
            <br />
            where you left
            <br />
            <span style={{ color: "#22C55E" }}>your finances.</span>
          </h1>

          <p style={{ margin: "0 auto 20px auto", fontSize: "13px", lineHeight: "1.58", color: "rgba(255,255,255,0.42)", maxWidth: "300px" }}>
            Your dashboard, goals, debts, budgets, and AI advisor are waiting.
          </p>

          {/* BULLETS — perfectly centered using grid */}
          <div
            style={{
              width: "100%",
              maxWidth: "280px",
              margin: "0 auto 22px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {LEFT_POINTS.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "18px 1fr",
                  alignItems: "center",
                  columnGap: "10px",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "999px",
                    background: "rgba(34,197,94,0.14)",
                    border: "1px solid rgba(34,197,94,0.28)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="9" height="9" fill="none" stroke="#22C55E" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    lineHeight: "1.4",
                    color: "rgba(255,255,255,0.55)",
                    fontWeight: 500,
                    textAlign: "left",
                  }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>

          {/* STATS — perfectly centered */}
          <div
            style={{
              width: "100%",
              maxWidth: "300px",
              margin: "0 auto 16px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            {[
              { n: "618+", l: "early members" },
              { n: "Rs.42K", l: "avg. tax saved" },
              { n: "Free", l: "forever plan" },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  width: "90px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <p style={{ margin: "0 0 3px 0", fontSize: "16px", fontWeight: 800, letterSpacing: "-0.02em", color: "#FFFFFF" }}>
                  {s.n}
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.28)", lineHeight: "1.3" }}>
                  {s.l}
                </p>
              </div>
            ))}
          </div>

          {/* LEGAL INFO — only in black panel */}
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              color: "rgba(255,255,255,0.16)",
              lineHeight: "1.5",
              maxWidth: "300px",
              alignSelf: "center",
            }}
          >
            Casha is an educational financial management platform. Not investment, legal, or tax advice.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          background: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "28px 40px",
          overflow: "hidden",
        }}
      >
        <div style={{ width: "100%", maxWidth: "340px" }}>

          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ margin: "0 0 6px 0", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.03em", color: "#0A0A0A" }}>
              Sign in
            </h2>
            <p style={{ margin: 0, fontSize: "13px", color: "#71717A" }}>
              Continue where you left off
            </p>
          </div>

          {error && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "8px",
                padding: "10px 12px",
                marginBottom: "12px",
              }}
            >
              <p style={{ margin: 0, fontSize: "12px", color: "#DC2626" }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "11px", fontWeight: 600, color: "#374151" }}>
                Email address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                style={inputStyle("email")}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#374151" }}>
                  Password
                </label>
                <a href="#" style={{ fontSize: "11px", color: "#22C55E", textDecoration: "none", fontWeight: 600 }}>
                  Forgot?
                </a>
              </div>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                style={inputStyle("password")}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "10px",
                border: "none",
                background: "#22C55E",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 700,
                cursor: loading ? "wait" : "pointer",
                fontFamily: "inherit",
                opacity: loading ? 0.8 : 1,
                marginTop: "4px",
                boxShadow: "0 4px 12px rgba(34,197,94,0.26)",
              }}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <p style={{ margin: "12px 0 0 0", textAlign: "center", fontSize: "12px", color: "#71717A" }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" style={{ color: "#22C55E", fontWeight: 700, textDecoration: "none" }}>
              Create one free
            </Link>
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "12px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#F0F0F0" }} />
            <span style={{ fontSize: "10px", color: "#C4C4C4" }}>secure login</span>
            <div style={{ flex: 1, height: "1px", background: "#F0F0F0" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
            {["AES-256", "DPDPA", "Private"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#22C55E" }} />
                <span style={{ fontSize: "10px", color: "#A1A1AA" }}>{item}</span>
              </div>
            ))}
          </div>

          {/* T&C FOR LOGIN PAGE */}
          <p
            style={{
              margin: "10px 0 0 0",
              textAlign: "center",
              fontSize: "10px",
              color: "#C4C4C4",
              lineHeight: "1.5",
            }}
          >
            By signing in you agree to our{" "}
            <a href="/terms" style={{ color: "#A1A1AA", textDecoration: "underline" }}>
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" style={{ color: "#A1A1AA", textDecoration: "underline" }}>
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        input::placeholder { color: #C4C4C4; }
        ::selection { background: rgba(34,197,94,0.22); color: #0A0A0A; }
        ::-moz-selection { background: rgba(34,197,94,0.22); color: #0A0A0A; }
      `}</style>
    </div>
  );
}