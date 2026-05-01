"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

function ThemeToggle() {
  var [theme, setTheme] = useState("light");

  useEffect(function () {
    var t = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(t);
  }, []);

  var toggle = function () {
    var next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("casha-theme", next);
  };

  return (
    <button onClick={toggle} style={{
      width: 36, height: 36, borderRadius: 10,
      background: "var(--surface)", border: "1px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", transition: "all 200ms ease",
    }}>
      {theme === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
      )}
    </button>
  );
}

export default function AuthPage() {
  var [isLogin, setIsLogin] = useState(true);
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [loading, setLoading] = useState(false);
  var [err, setErr] = useState("");
  var [sent, setSent] = useState(false);

  var submit = async function (e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!email || !password) { setErr("Fill in all fields."); return; }
    setLoading(true);
    if (isLogin) {
      var { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setErr(error.message); setLoading(false); return; }
      window.location.href = "/dashboard";
    } else {
      var { error } = await supabase.auth.signUp({ email, password });
      if (error) { setErr(error.message); setLoading(false); return; }
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 380, textAlign: "center", padding: 24 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: "0 0 8px" }}>Check your email</h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 24px", lineHeight: 1.6 }}>We sent a confirmation link to <strong style={{ color: "var(--text)" }}>{email}</strong></p>
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          <Link href="/legal/privacy" style={{ fontSize: 11, color: "var(--muted)" }}>Privacy</Link>
          <Link href="/legal/terms" style={{ fontSize: 11, color: "var(--muted)" }}>Terms</Link>
          <Link href="/legal/cookies" style={{ fontSize: 11, color: "var(--muted)" }}>Cookies</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px" }}>
        <Link href="/" style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", textDecoration: "none", letterSpacing: -0.5 }}>
          casha<span style={{ color: "var(--green)" }}>.</span>
        </Link>
        <ThemeToggle />
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px 40px" }}>
        <div style={{ width: "100%", maxWidth: 380 }}>

          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", margin: "0 0 6px", letterSpacing: -0.3 }}>
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 28px" }}>
            {isLogin ? "Sign in to your account" : "Start your financial journey"}
          </p>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Email</label>
              <input type="email" placeholder="you@email.com" value={email} onChange={function (e) { setEmail(e.target.value); }}
                style={{ width: "100%", height: 46, borderRadius: 12, padding: "0 16px", fontSize: 14, fontWeight: 500, fontFamily: "inherit", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", outline: "none", transition: "border-color 200ms ease, box-shadow 200ms ease", boxShadow: "var(--shadow-sm)" }}
                onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; }}
                onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Password</label>
              <input type="password" placeholder="Min 6 characters" value={password} onChange={function (e) { setPassword(e.target.value); }}
                style={{ width: "100%", height: 46, borderRadius: 12, padding: "0 16px", fontSize: 14, fontWeight: 500, fontFamily: "inherit", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", outline: "none", transition: "border-color 200ms ease, box-shadow 200ms ease", boxShadow: "var(--shadow-sm)" }}
                onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; }}
                onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }} />
            </div>

            {err ? <p style={{ fontSize: 12, color: "var(--red)", fontWeight: 500 }}>{err}</p> : null}

            <button type="submit" disabled={loading}
              style={{ width: "100%", height: 46, borderRadius: 12, background: "var(--green)", color: "#FFFFFF", fontSize: 14, fontWeight: 700, fontFamily: "inherit", border: "none", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1, transition: "all 200ms ease", boxShadow: "var(--shadow-md)" }}
              onMouseEnter={function (e) { if (!loading) e.currentTarget.style.background = "var(--green-soft)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.background = "var(--green)"; }}>
              {loading ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
            <button onClick={function () { setIsLogin(!isLogin); setErr(""); }} style={{ background: "none", border: "none", color: "var(--green)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", padding: "16px 24px", display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
        <Link href="/legal/privacy" style={{ fontSize: 11, color: "var(--muted)", transition: "color 150ms ease" }}
          onMouseEnter={function (e) { e.currentTarget.style.color = "var(--text-secondary)"; }}
          onMouseLeave={function (e) { e.currentTarget.style.color = "var(--muted)"; }}>Privacy Policy</Link>
        <Link href="/legal/terms" style={{ fontSize: 11, color: "var(--muted)", transition: "color 150ms ease" }}
          onMouseEnter={function (e) { e.currentTarget.style.color = "var(--text-secondary)"; }}
          onMouseLeave={function (e) { e.currentTarget.style.color = "var(--muted)"; }}>Terms of Service</Link>
        <Link href="/legal/cookies" style={{ fontSize: 11, color: "var(--muted)", transition: "color 150ms ease" }}
          onMouseEnter={function (e) { e.currentTarget.style.color = "var(--text-secondary)"; }}
          onMouseLeave={function (e) { e.currentTarget.style.color = "var(--muted)"; }}>Cookie Policy</Link>
        <span style={{ fontSize: 11, color: "var(--faint)" }}>© 2025 casha.</span>
      </div>
    </div>
  );
}