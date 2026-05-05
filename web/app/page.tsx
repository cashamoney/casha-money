"use client";

import { useState, useEffect } from "react";
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
    <button onClick={toggle} style={{ width: 32, height: 32, borderRadius: 8, background: "transparent", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 200ms ease" }}
      onMouseEnter={function (e) { e.currentTarget.style.background = "var(--surface)"; }}
      onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}>
      {theme === "dark" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
      )}
    </button>
  );
}

export default function Home() {
  var [email, setEmail] = useState("");
  var [hoveredFeat, setHoveredFeat] = useState(-1);
  var [hoveredStep, setHoveredStep] = useState(-1);

  var features = [
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20" /></svg>, title: "Track everything", desc: "Every rupee. Every account. One view." },
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>, title: "Budget in seconds", desc: "AI builds your 50/30/20 budget. One click." },
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>, title: "Health score", desc: "0–1000. Know exactly where you stand." },
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>, title: "SMS parser", desc: "Paste bank SMS. Transaction done." },
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>, title: "Tax genius", desc: "Old vs New regime. Real savings." },
    { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>, title: "AI advisor", desc: "Your personal CFO. Always on." },
  ];

  var steps = [
    { n: "01", title: "Sign up", desc: "Your email. 30 seconds. Done." },
    { n: "02", title: "Add transactions", desc: "Paste SMS or type. All Indian banks." },
    { n: "03", title: "See everything", desc: "Score, budget, tax — calculated." },
  ];

  var stats = [
    { value: "618+", label: "Early members" },
    { value: "₹2,400", label: "Avg. monthly waste found" },
    { value: "₹42,000", label: "Avg. tax saved/year" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
        background: "var(--bg)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", height: 56,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Link href="/" style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", textDecoration: "none", letterSpacing: -0.5 }}>
            casha<span style={{ color: "var(--green)" }}>.</span>
          </Link>
          <div style={{ display: "flex", gap: 24 }} className="lp-nav-links">
            <a href="#features" style={{ fontSize: 13, fontWeight: 500, color: "var(--muted)", textDecoration: "none", transition: "color 150ms ease" }}
              onMouseEnter={function (e) { e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.color = "var(--muted)"; }}>Features</a>
            <a href="#how" style={{ fontSize: 13, fontWeight: 500, color: "var(--muted)", textDecoration: "none", transition: "color 150ms ease" }}
              onMouseEnter={function (e) { e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.color = "var(--muted)"; }}>How it works</a>
            <a href="#pricing" style={{ fontSize: 13, fontWeight: 500, color: "var(--muted)", textDecoration: "none", transition: "color 150ms ease" }}
              onMouseEnter={function (e) { e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.color = "var(--muted)"; }}>Pricing</a>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle />
          <Link href="/auth" style={{ fontSize: 13, fontWeight: 500, color: "var(--muted)", textDecoration: "none", transition: "color 150ms ease", padding: "6px 12px", borderRadius: 8 }}
            onMouseEnter={function (e) { e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.color = "var(--muted)"; }}>Sign in</Link>
          <Link href="/auth" style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", background: "var(--green)", textDecoration: "none", padding: "8px 18px", borderRadius: 10, transition: "background 150ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green-soft)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "var(--green)"; }}>Get started</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 140, paddingBottom: 100, padding: "140px 40px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ maxWidth: 720 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--green)", marginBottom: 20, letterSpacing: 0.04 }}>Your money, clear.</p>
          <h1 style={{ fontSize: 56, fontWeight: 700, color: "var(--text)", lineHeight: 1.08, letterSpacing: -1.5, margin: "0 0 24px 0" }}>
            Know where<br />every rupee<br />goes.
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 36px 0", maxWidth: 480 }}>
            Track, budget, and understand your finances. Built for India. Free forever.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
              <input type="email" placeholder="Enter your email" value={email} onChange={function (e) { setEmail(e.target.value); }}
                style={{ height: 48, padding: "0 16px", fontSize: 14, fontWeight: 500, background: "transparent", border: "none", color: "var(--text)", outline: "none", fontFamily: "inherit", width: 260 }}
                onFocus={function (e) { e.currentTarget.parentElement.style.borderColor = "var(--green-border)"; }}
                onBlur={function (e) { e.currentTarget.parentElement.style.borderColor = "var(--border)"; }} />
              <button style={{ height: 48, padding: "0 20px", background: "var(--green)", color: "#FFFFFF", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", transition: "background 150ms ease", whiteSpace: "nowrap" }}
                onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green-soft)"; }}
                onMouseLeave={function (e) { e.currentTarget.style.background = "var(--green)"; }}>Get started</button>
            </div>
            <span style={{ fontSize: 12, color: "var(--faint)" }}>Free forever · No credit card</span>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: "0 40px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--border)", borderRadius: 16, overflow: "hidden" }} className="lp-stats3">
          {stats.map(function (s) {
            return (
              <div key={s.label} style={{ background: "var(--surface)", padding: "32px 28px", textAlign: "center" }}>
                <p style={{ fontSize: 32, fontWeight: 700, color: "var(--text)", margin: "0 0 4px 0", letterSpacing: -0.5, fontVariantNumeric: "tabular-nums" }}>{s.value}</p>
                <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--green)", marginBottom: 12, letterSpacing: 0.04 }}>Features</p>
        <h2 style={{ fontSize: 36, fontWeight: 700, color: "var(--text)", letterSpacing: -0.8, margin: "0 0 48px 0" }}>Everything your money needs.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }} className="lp-feat3">
          {features.map(function (f, i) {
            var isHov = hoveredFeat === i;
            return (
              <div key={f.title}
                onMouseEnter={function () { setHoveredFeat(i); }}
                onMouseLeave={function () { setHoveredFeat(-1); }}
                style={{
                  padding: "28px 24px", borderRadius: 14,
                  background: isHov ? "var(--surface)" : "transparent",
                  border: "1px solid " + (isHov ? "var(--border-light)" : "var(--border)"),
                  transition: "all 250ms ease",
                  cursor: "default",
                }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)", marginBottom: 16 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: "0 0 6px 0" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--green)", marginBottom: 12, letterSpacing: 0.04 }}>How it works</p>
        <h2 style={{ fontSize: 36, fontWeight: 700, color: "var(--text)", letterSpacing: -0.8, margin: "0 0 48px 0" }}>Two minutes. That's it.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32 }} className="lp-steps3">
          {steps.map(function (s, i) {
            var isHov = hoveredStep === i;
            return (
              <div key={s.n}
                onMouseEnter={function () { setHoveredStep(i); }}
                onMouseLeave={function () { setHoveredStep(-1); }}
                style={{ transition: "all 250ms ease", transform: isHov ? "translateY(-2px)" : "translateY(0)" }}>
                <span style={{ fontSize: 48, fontWeight: 800, color: isHov ? "var(--green)" : "var(--border-light)", letterSpacing: -1, transition: "color 250ms ease", fontVariantNumeric: "tabular-nums" }}>{s.n}</span>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--text)", margin: "12px 0 6px" }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 50/30/20 ── */}
      <section style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "48px 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="lp-rule2">
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--green)", marginBottom: 12, letterSpacing: 0.04 }}>Built-in framework</p>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: "var(--text)", letterSpacing: -0.8, margin: "0 0 12px 0" }}>The 50/30/20 rule.</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 24px 0" }}>A proven system adapted for India. Your income splits into needs, wants, and savings — automatically.</p>
            <Link href="/auth" style={{ fontSize: 14, fontWeight: 600, color: "var(--green)", textDecoration: "none" }}>Try it free →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { pct: "50%", label: "Needs", desc: "Rent, groceries, EMI, utilities", color: "var(--blue)" },
              { pct: "30%", label: "Wants", desc: "Dining, shopping, entertainment", color: "var(--purple)" },
              { pct: "20%", label: "Savings", desc: "Emergency fund, SIP, PPF", color: "var(--green)" },
            ].map(function (r) {
              return (
                <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderRadius: 12, background: "var(--card)", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: r.color, fontVariantNumeric: "tabular-nums", width: 56, letterSpacing: -0.5 }}>{r.pct}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>{r.label}</p>
                    <p style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 0 0" }}>{r.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--green)", marginBottom: 12, letterSpacing: 0.04 }}>Pricing</p>
        <h2 style={{ fontSize: 36, fontWeight: 700, color: "var(--text)", letterSpacing: -0.8, margin: "0 0 48px 0" }}>Simple. Honest.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, maxWidth: 860 }} className="lp-price3">
          {[
            { name: "Free", price: "₹0", period: "forever", cta: "Get started", highlight: false, features: ["Health score", "Unlimited transactions", "SMS parser", "Budget AI", "Tax optimizer", "AI advisor — 10/day"] },
            { name: "Plus", price: "₹149", period: "/month", cta: "Start free trial", highlight: true, features: ["Everything in Free", "Unlimited AI advisor", "Investment tracker", "Retirement planner", "WhatsApp alerts", "Tax reports PDF"] },
            { name: "Business", price: "₹499", period: "/month", cta: "Contact us", highlight: false, features: ["Everything in Plus", "GST invoices", "Cash flow forecasting", "P&L statements", "Team access (5)", "Tally sync"] },
          ].map(function (p) {
            return (
              <div key={p.name} style={{
                padding: "28px 24px", borderRadius: 16,
                background: p.highlight ? "var(--surface)" : "transparent",
                border: "1px solid " + (p.highlight ? "var(--green-border)" : "var(--border)"),
                display: "flex", flexDirection: "column",
                boxShadow: p.highlight ? "var(--shadow-md)" : "none",
              }}>
                {p.highlight ? <span style={{ fontSize: 10, fontWeight: 700, color: "var(--green)", textTransform: "uppercase", letterSpacing: 0.08, marginBottom: 12 }}>Most popular</span> : <div style={{ marginBottom: 12, height: 14 }} />}
                <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--text)", margin: "0 0 4px" }}>{p.name}</h3>
                <p style={{ margin: "0 0 20px" }}><span style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5 }}>{p.price}</span><span style={{ fontSize: 13, color: "var(--muted)", marginLeft: 4 }}>{p.period}</span></p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, marginBottom: 20 }}>
                  {p.features.map(function (f) {
                    return (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{f}</span>
                      </div>
                    );
                  })}
                </div>
                <Link href="/auth" style={{
                  display: "block", textAlign: "center", padding: "10px 0", borderRadius: 10,
                  background: p.highlight ? "var(--green)" : "transparent",
                  color: p.highlight ? "#FFFFFF" : "var(--text)",
                  border: p.highlight ? "none" : "1px solid var(--border)",
                  fontSize: 13, fontWeight: 600, textDecoration: "none",
                  transition: "all 150ms ease",
                }}
                  onMouseEnter={function (e) { if (p.highlight) { e.currentTarget.style.background = "var(--green-soft)"; } else { e.currentTarget.style.background = "var(--surface)"; } }}
                  onMouseLeave={function (e) { if (p.highlight) { e.currentTarget.style.background = "var(--green)"; } else { e.currentTarget.style.background = "transparent"; } }}>{p.cta}</Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 500, margin: "0 auto" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--green)", marginBottom: 12, letterSpacing: 0.04 }}>Security</p>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "var(--text)", letterSpacing: -0.8, margin: "0 0 12px 0" }}>Bank-level. Zero compromises.</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 32px 0" }}>AES-256 encrypted. Read-only. No data selling. DPDPA compliant. Delete anytime.</p>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
          {["AES-256 Encrypted", "Read-only access", "No data selling", "DPDPA Compliant", "Delete anytime"].map(function (s) {
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 20, background: "var(--surface)", border: "1px solid var(--border)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{s}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 40px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, color: "var(--text)", letterSpacing: -0.8, margin: "0 0 12px 0" }}>Start today.</h2>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", margin: "0 0 32px 0" }}>Free forever. Works with all Indian banks. Your data stays yours.</p>
          <Link href="/auth" style={{ display: "inline-block", padding: "14px 36px", borderRadius: 12, background: "var(--green)", color: "#FFFFFF", fontSize: 15, fontWeight: 700, textDecoration: "none", transition: "all 200ms ease", boxShadow: "var(--shadow-md)" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green-soft)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "var(--green)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            Get started free
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "28px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 24 }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: "0 0 6px 0", letterSpacing: -0.5 }}>
              casha<span style={{ color: "var(--green)" }}>.</span>
            </p>
            <p style={{ fontSize: 11, color: "var(--faint)", margin: 0, maxWidth: 260, lineHeight: 1.5 }}>Financial education platform only. Not a SEBI-registered advisor. All AI recommendations are educational. Consult a qualified CA before financial decisions.</p>
          </div>
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.08 }}>Product</span>
              <a href="#features" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>Features</a>
              <a href="#pricing" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>Pricing</a>
              <a href="#how" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>How it works</a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.08 }}>Legal</span>
              <Link href="/legal/privacy" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>Privacy Policy</Link>
              <Link href="/legal/terms" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>Terms of Service</Link>
              <Link href="/legal/cookies" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>Cookie Policy</Link>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--faint)" }}>© 2025 Casha Money Technologies Private Limited. All rights reserved.</span>
          <span style={{ fontSize: 11, color: "var(--faint)" }}>Made in India</span>
        </div>
      </footer>

      {/* ── RESPONSIVE ── */}
      <style>{`
        @media (max-width: 768px) {
          .lp-nav-links { display: none !important; }
          section { padding-left: 20px !important; padding-right: 20px !important; }
          .lp-stats3 { grid-template-columns: 1fr !important; }
          .lp-feat3 { grid-template-columns: 1fr !important; }
          .lp-steps3 { grid-template-columns: 1fr !important; }
          .lp-rule2 { grid-template-columns: 1fr !important; padding: 28px 20px !important; }
          .lp-price3 { grid-template-columns: 1fr !important; }
          h1 { font-size: 36px !important; }
          h2 { font-size: 28px !important; }
          nav { padding: 0 20px !important; }
          footer { padding: 28px 20px !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .lp-feat3 { grid-template-columns: 1fr 1fr !important; }
          .lp-price3 { grid-template-columns: 1fr 1fr !important; }
          h1 { font-size: 44px !important; }
        }
      `}</style>
    </div>
  );
}