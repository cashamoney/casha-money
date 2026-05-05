"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

function useReveal() {
  var ref = useRef<HTMLDivElement>(null);
  useEffect(function () {
    if (!ref.current) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("visible"); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -80px 0px" });
    var els = ref.current.querySelectorAll(".reveal");
    els.forEach(function (el) { obs.observe(el); });
    return function () { obs.disconnect(); };
  }, []);
  return ref;
}

function IllusTrack() {
  return (
    <svg viewBox="0 0 480 320" fill="none" style={{ width: "100%", maxWidth: 480 }}>
      <circle cx="240" cy="160" r="120" stroke="#E5E5E5" strokeWidth="1" />
      <circle cx="240" cy="160" r="80" stroke="#E5E5E5" strokeWidth="1" />
      <circle cx="240" cy="160" r="40" stroke="#E5E5E5" strokeWidth="1" />
      <circle cx="240" cy="160" r="6" fill="#1A8F4E" />
      <line x1="240" y1="40" x2="240" y2="280" stroke="#E5E5E5" strokeWidth="0.5" />
      <line x1="120" y1="160" x2="360" y2="160" stroke="#E5E5E5" strokeWidth="0.5" />
      <circle cx="320" cy="120" r="4" fill="#1A8F4E" opacity="0.4" />
      <circle cx="180" cy="200" r="3" fill="#1A8F4E" opacity="0.3" />
      <circle cx="280" cy="200" r="3" fill="#1A8F4E" opacity="0.3" />
    </svg>
  );
}

function IllusCards() {
  return (
    <svg viewBox="0 0 480 320" fill="none" style={{ width: "100%", maxWidth: 480 }}>
      <rect x="120" y="80" width="200" height="130" rx="12" stroke="#E5E5E5" strokeWidth="1" transform="rotate(-6 220 145)" />
      <rect x="140" y="70" width="200" height="130" rx="12" stroke="#D0D0D0" strokeWidth="1" transform="rotate(2 240 135)" />
      <rect x="160" y="60" width="200" height="130" rx="12" stroke="#1A8F4E" strokeWidth="1.5" transform="rotate(8 260 125)" />
      <rect x="180" y="100" width="40" height="24" rx="4" fill="#1A8F4E" opacity="0.15" />
      <rect x="180" y="140" width="80" height="6" rx="3" fill="#E5E5E5" />
      <rect x="180" y="154" width="60" height="6" rx="3" fill="#E5E5E5" />
    </svg>
  );
}

function IllusGrowth() {
  return (
    <svg viewBox="0 0 480 320" fill="none" style={{ width: "100%", maxWidth: 480 }}>
      <path d="M80 280 L160 220 L240 180 L320 120 L400 60" stroke="#1A8F4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M80 280 L160 220 L240 180 L320 120 L400 60 L400 280 Z" fill="#1A8F4E" opacity="0.04" />
      <circle cx="80" cy="280" r="4" fill="#1A8F4E" />
      <circle cx="160" cy="220" r="4" fill="#1A8F4E" />
      <circle cx="240" cy="180" r="4" fill="#1A8F4E" />
      <circle cx="320" cy="120" r="4" fill="#1A8F4E" />
      <circle cx="400" cy="60" r="6" fill="#1A8F4E" />
      <line x1="80" y1="280" x2="400" y2="280" stroke="#E5E5E5" strokeWidth="0.5" />
    </svg>
  );
}

function IllusShield() {
  return (
    <svg viewBox="0 0 480 320" fill="none" style={{ width: "100%", maxWidth: 480 }}>
      <path d="M240 40 L340 80 L340 180 C340 240 290 280 240 300 C190 280 140 240 140 180 L140 80 Z" stroke="#E5E5E5" strokeWidth="1" />
      <path d="M240 70 L310 100 L310 170 C310 220 275 250 240 268 C205 250 170 220 170 170 L170 100 Z" stroke="#1A8F4E" strokeWidth="1.5" />
      <path d="M220 170 L240 190 L280 140" stroke="#1A8F4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SmsDemo() {
  var [sms, setSms] = useState("");
  var [parsed, setParsed] = useState<{ amount: string; merchant: string; category: string; date: string } | null>(null);
  useEffect(function () {
    if (!sms.trim()) { setParsed(null); return; }
    var am = sms.match(/Rs\.?([\d,]+\.?\d*)/i) || sms.match(/INR\s*([\d,]+\.?\d*)/i) || sms.match(/\$([\d,]+\.?\d*)/i) || sms.match(/([\d,]+\.?\d*)\s*(?:debited|credited|spent|paid)/i);
    var amount = am ? (am[0].includes("$") ? "$" : "₹") + am[1].replace(/,/g, "") : "—";
    var mm = sms.match(/(?:to|at|info[:\s]*|to\s+)([A-Za-z\s]+)/i);
    var merchant = mm ? mm[1].trim().substring(0, 20) : "—";
    var cat = "Other"; var l = sms.toLowerCase();
    if (l.includes("swiggy") || l.includes("zomato") || l.includes("food") || l.includes("doordash")) cat = "Food";
    else if (l.includes("uber") || l.includes("ola") || l.includes("fuel") || l.includes("lyft")) cat = "Transport";
    else if (l.includes("netflix") || l.includes("spotify") || l.includes("hulu")) cat = "Entertainment";
    else if (l.includes("amazon") || l.includes("flipkart") || l.includes("target")) cat = "Shopping";
    else if (l.includes("rent")) cat = "Rent";
    else if (l.includes("electricity") || l.includes("bill") || l.includes("water")) cat = "Bills";
    var dm = sms.match(/(\d{1,2}[\-\/]\d{1,2}[\-\/]\d{2,4})/) || sms.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*)/i);
    var date = dm ? dm[1] : "Today";
    setParsed({ amount: amount, merchant: merchant, category: cat, date: date });
  }, [sms]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, maxWidth: 640, margin: "0 auto" }} className="lp-sms-grid">
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.1 }}>Paste any bank SMS</p>
        <textarea value={sms} onChange={function (e) { setSms(e.target.value); }} placeholder="Rs.2,500.00 debited from A/c XX1234 on 19-04-26. Info: Swiggy."
          style={{ width: "100%", height: 140, borderRadius: 12, padding: "16px", fontSize: 13, fontFamily: "inherit", background: "#F5F5F5", border: "1px solid #E5E5E5", color: "#111", outline: "none", resize: "none", lineHeight: 1.6, transition: "border-color 200ms ease" }}
          onFocus={function (e) { e.currentTarget.style.borderColor = "#1A8F4E"; }}
          onBlur={function (e) { e.currentTarget.style.borderColor = "#E5E5E5"; }} />
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#999", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.1 }}>Instantly parsed</p>
        <div style={{ background: "#F5F5F5", borderRadius: 12, padding: "20px", minHeight: 140, border: "1px solid #E5E5E5" }}>
          {parsed ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn 250ms ease" }}>
              {[
                { label: "Amount", value: parsed.amount, color: "#111", big: true },
                { label: "Merchant", value: parsed.merchant, color: "#555", big: false },
                { label: "Category", value: parsed.category, color: "#1A8F4E", big: false },
                { label: "Date", value: parsed.date, color: "#888", big: false },
              ].map(function (r) {
                return (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.06 }}>{r.label}</span>
                    <span style={{ fontSize: r.big ? 18 : 14, fontWeight: r.big ? 800 : 600, color: r.color, fontVariantNumeric: "tabular-nums" }}>{r.value}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 100 }}>
              <p style={{ fontSize: 13, color: "#CCC", fontStyle: "italic" }}>Paste a message to see it parsed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  var [email, setEmail] = useState("");
  var heroRef = useReveal();
  var featRef = useReveal();
  var smsRef = useReveal();
  var statsRef = useReveal();
  var pricingRef = useReveal();
  var ctaRef = useReveal();

  return (
    <div style={{ background: "#fff", color: "#111" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid #F0F0F0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 56,
      }} className="lp-nav">
        <Link href="/" style={{ fontSize: 18, fontWeight: 800, color: "#111", textDecoration: "none", letterSpacing: -0.5 }}>
          casha<span style={{ color: "#1A8F4E" }}>.</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a href="#features" style={{ fontSize: 13, fontWeight: 500, color: "#888", textDecoration: "none", transition: "color 150ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.color = "#111"; }}
            onMouseLeave={function (e) { e.currentTarget.style.color = "#888"; }}>Features</a>
          <a href="#pricing" style={{ fontSize: 13, fontWeight: 500, color: "#888", textDecoration: "none", transition: "color 150ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.color = "#111"; }}
            onMouseLeave={function (e) { e.currentTarget.style.color = "#888"; }}>Pricing</a>
          <Link href="/auth" style={{ fontSize: 13, fontWeight: 500, color: "#888", textDecoration: "none", transition: "color 150ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.color = "#111"; }}
            onMouseLeave={function (e) { e.currentTarget.style.color = "#888"; }}>Sign in</Link>
          <Link href="/auth" style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "#111", textDecoration: "none", padding: "8px 20px", borderRadius: 10, transition: "all 150ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "#333"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "#111"; }}>Open account</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ background: "#fff", padding: "180px 48px 120px", textAlign: "center" }} className="lp-hero">
        <h1 className="reveal" style={{ fontSize: 68, fontWeight: 600, color: "#111", lineHeight: 1.05, letterSpacing: -2, margin: "0 auto 20px auto", maxWidth: 640 }}>
          Radically simple finance
        </h1>
        <p className="reveal reveal-delay-1" style={{ fontSize: 18, color: "#888", lineHeight: 1.6, margin: "0 auto 40px auto", maxWidth: 400, fontWeight: 400 }}>
          Track, budget, and understand your money — built for everyone, free to start.
        </p>
        <div className="reveal reveal-delay-2" style={{ display: "flex", justifyContent: "center", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: "#F5F5F5", border: "1px solid #E5E5E5", borderRadius: 12, overflow: "hidden" }}>
            <input type="email" placeholder="Enter your email" value={email} onChange={function (e) { setEmail(e.target.value); }}
              style={{ height: 50, padding: "0 20px", fontSize: 14, fontWeight: 400, background: "transparent", border: "none", color: "#111", outline: "none", fontFamily: "inherit", width: 260 }} />
            <button style={{ height: 50, padding: "0 24px", background: "#111", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", transition: "background 150ms ease", whiteSpace: "nowrap" }}
              onMouseEnter={function (e) { e.currentTarget.style.background = "#333"; }}
              onMouseLeave={function (e) { e.currentTarget.style.background = "#111"; }}>Open account</button>
          </div>
        </div>
        <p className="reveal reveal-delay-3" style={{ fontSize: 12, color: "#CCC", marginTop: 14 }}>Free forever · No credit card · Works worldwide</p>
      </section>

      {/* ── TAGLINE ── */}
      <section style={{ background: "#FAFAFA", padding: "100px 48px", textAlign: "center" }}>
        <h2 className="reveal" style={{ fontSize: 48, fontWeight: 600, color: "#111", lineHeight: 1.1, letterSpacing: -1.5, margin: "0 auto", maxWidth: 560 }}>
          Everything you do with money. All in one place.
        </h2>
      </section>

      {/* ── FEATURES ── */}
      <section ref={featRef} id="features" style={{ background: "#fff", padding: "100px 48px" }} className="lp-feat">
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          {[
            { illus: <IllusTrack />, title: "Track every dollar", desc: "All your accounts. One view. See where your money goes in real time. Works with any bank worldwide.", rev: false },
            { illus: <IllusCards />, title: "Budget in seconds", desc: "AI builds your 50/30/20 budget automatically. Proven framework. One click. Edit anytime.", rev: true },
            { illus: <IllusGrowth />, title: "Grow your wealth", desc: "Financial health score 0–1000. AI advisor that sees your real data. Specific actions, not generic advice.", rev: false },
            { illus: <IllusShield />, title: "Bank-level security", desc: "AES-256 encrypted. Read-only access. No data selling. GDPR & DPDPA compliant. Delete anytime.", rev: true },
          ].map(function (f, i) {
            return (
              <div key={f.title} className="reveal" style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center",
                marginBottom: i < 3 ? 100 : 0,
                direction: f.rev ? "rtl" : "ltr",
              }} className="lp-feat-row">
                <div style={{ direction: "ltr" }}>
                  {f.illus}
                </div>
                <div style={{ direction: "ltr" }}>
                  <h3 style={{ fontSize: 28, fontWeight: 600, color: "#111", margin: "0 0 12px 0", letterSpacing: -0.5 }}>{f.title}</h3>
                  <p style={{ fontSize: 16, color: "#888", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SMS DEMO ── */}
      <section ref={smsRef} style={{ background: "#FAFAFA", padding: "100px 48px", textAlign: "center" }} className="lp-sms">
        <h2 className="reveal" style={{ fontSize: 44, fontWeight: 600, color: "#111", letterSpacing: -1.5, margin: "0 auto 12px auto" }}>
          Paste a bank SMS.
        </h2>
        <p className="reveal reveal-delay-1" style={{ fontSize: 17, color: "#888", margin: "0 auto 48px auto", maxWidth: 360 }}>Watch the magic. Any bank. Any country.</p>
        <div className="reveal reveal-delay-2">
          <SmsDemo />
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} style={{ background: "#fff", padding: "100px 48px", textAlign: "center" }} className="lp-stats">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 40, maxWidth: 800, margin: "0 auto" }} className="lp-stats4">
          {[
            { value: "618+", label: "Early members" },
            { value: "$68", label: "Avg. waste found/mo" },
            { value: "$580", label: "Avg. tax saved/yr" },
            { value: "18+", label: "Countries" },
          ].map(function (s) {
            return (
              <div key={s.label} className="reveal">
                <p style={{ fontSize: 36, fontWeight: 700, color: "#111", margin: "0 0 4px 0", letterSpacing: -1, fontVariantNumeric: "tabular-nums" }}>{s.value}</p>
                <p style={{ fontSize: 13, color: "#999", margin: 0 }}>{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section ref={pricingRef} id="pricing" style={{ background: "#FAFAFA", padding: "100px 48px", textAlign: "center" }} className="lp-pricing">
        <h2 className="reveal" style={{ fontSize: 44, fontWeight: 600, color: "#111", letterSpacing: -1.5, margin: "0 auto 12px auto" }}>
          Simple. Honest. Global.
        </h2>
        <p className="reveal reveal-delay-1" style={{ fontSize: 17, color: "#888", margin: "0 auto 56px auto" }}>Start free. Upgrade when ready.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, maxWidth: 860, margin: "0 auto" }} className="lp-price3">
          {[
            { name: "Free", price: "$0", period: "forever", cta: "Open account", hl: false, features: ["Health score", "Unlimited transactions", "SMS parser — all banks", "Budget AI (50/30/20)", "Tax optimizer", "AI advisor — 10/day"] },
            { name: "Plus", price: "$4", period: "/month", cta: "Start free trial", hl: true, features: ["Everything in Free", "Unlimited AI advisor", "Investment tracker", "Retirement planner", "WhatsApp alerts", "Tax reports PDF"] },
            { name: "Business", price: "$12", period: "/month", cta: "Contact sales", hl: false, features: ["Everything in Plus", "GST invoices", "Cash flow forecasting", "P&L statements", "Team access (5)", "QuickBooks sync"] },
          ].map(function (p) {
            return (
              <div key={p.name} className="reveal" style={{
                padding: "36px 28px", borderRadius: 16,
                background: p.hl ? "#111" : "#fff",
                border: "1px solid " + (p.hl ? "#111" : "#E5E5E5"),
                display: "flex", flexDirection: "column", position: "relative", overflow: "hidden",
                boxShadow: p.hl ? "0 20px 60px rgba(0,0,0,0.12)" : "none",
              }}>
                {p.hl && <span style={{ fontSize: 10, fontWeight: 700, color: "#1A8F4E", textTransform: "uppercase", letterSpacing: 0.08, marginBottom: 16, display: "block" }}>Most popular</span>}
                {!p.hl && <div style={{ marginBottom: 16, height: 14 }} />}
                <h3 style={{ fontSize: 18, fontWeight: 600, color: p.hl ? "#fff" : "#111", margin: "0 0 4px" }}>{p.name}</h3>
                <p style={{ margin: "0 0 24px" }}><span style={{ fontSize: 36, fontWeight: 700, color: p.hl ? "#fff" : "#111", letterSpacing: -1, fontVariantNumeric: "tabular-nums" }}>{p.price}</span><span style={{ fontSize: 13, color: p.hl ? "rgba(255,255,255,0.4)" : "#999", marginLeft: 4 }}>{p.period}</span></p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, marginBottom: 24 }}>
                  {p.features.map(function (f) {
                    return (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={p.hl ? "#1A8F4E" : "#1A8F4E"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        <span style={{ fontSize: 13, color: p.hl ? "rgba(255,255,255,0.6)" : "#888" }}>{f}</span>
                      </div>
                    );
                  })}
                </div>
                <Link href="/auth" style={{
                  display: "block", textAlign: "center", padding: "12px 0", borderRadius: 10,
                  background: p.hl ? "#1A8F4E" : "transparent",
                  color: p.hl ? "#fff" : "#111",
                  border: p.hl ? "none" : "1px solid #E5E5E5",
                  fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "all 150ms ease",
                }}
                  onMouseEnter={function (e) { if (p.hl) { e.currentTarget.style.background = "#22A85C"; } else { e.currentTarget.style.background = "#F5F5F5"; } }}
                  onMouseLeave={function (e) { if (p.hl) { e.currentTarget.style.background = "#1A8F4E"; } else { e.currentTarget.style.background = "transparent"; } }}>{p.cta}</Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section ref={ctaRef} style={{ background: "#fff", padding: "120px 48px", textAlign: "center" }} className="lp-cta">
        <h2 className="reveal" style={{ fontSize: 48, fontWeight: 600, color: "#111", letterSpacing: -1.5, margin: "0 auto 14px auto" }}>
          Finance redesigned from the ground up.
        </h2>
        <p className="reveal reveal-delay-1" style={{ fontSize: 17, color: "#888", margin: "0 auto 36px auto" }}>Free forever. Your data stays yours.</p>
        <div className="reveal reveal-delay-2" style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <Link href="/auth" style={{ display: "inline-block", padding: "14px 36px", borderRadius: 10, background: "#111", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", transition: "all 200ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "#333"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "#111"; }}>Open account</Link>
          <a href="#pricing" style={{ display: "inline-block", padding: "14px 36px", borderRadius: 10, background: "transparent", color: "#111", border: "1px solid #E5E5E5", fontSize: 15, fontWeight: 600, textDecoration: "none", transition: "all 200ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "#F5F5F5"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}>Contact sales</a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#FAFAFA", borderTop: "1px solid #E5E5E5", padding: "48px 48px 32px", maxWidth: 1100, margin: "0 auto" }} className="lp-footer">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }} className="lp-foot-grid">
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#111", margin: "0 0 12px 0", letterSpacing: -0.5 }}>casha<span style={{ color: "#1A8F4E" }}>.</span></p>
            <p style={{ fontSize: 12, color: "#999", lineHeight: 1.6, margin: 0, maxWidth: 260 }}>Financial education platform. Not a registered financial advisor. Consult a qualified professional before decisions.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.08, marginBottom: 4 }}>Product</span>
            <a href="#features" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>Features</a>
            <a href="#pricing" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>Pricing</a>
            <a href="#" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>Security</a>
            <a href="#" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>API</a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.08, marginBottom: 4 }}>Resources</span>
            <a href="#" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>Help Center</a>
            <a href="#" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>Blog</a>
            <a href="#" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>50/30/20 Guide</a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.08, marginBottom: 4 }}>Legal</span>
            <Link href="/legal/privacy" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>Privacy Policy</Link>
            <Link href="/legal/terms" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>Terms of Service</Link>
            <Link href="/legal/cookies" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>Cookie Policy</Link>
          </div>
        </div>
        <div style={{ paddingTop: 20, borderTop: "1px solid #E5E5E5", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#CCC" }}>© 2026 Casha Money Technologies Pvt. Ltd. All rights reserved.</span>
          <span style={{ fontSize: 11, color: "#CCC" }}>Made with care, for the world</span>
        </div>
      </footer>

      {/* ── RESPONSIVE ── */}
      <style>{`
        @media (max-width: 768px) {
          .lp-nav { padding: 0 20px !important; }
          .lp-nav a[href="#features"], .lp-nav a[href="#pricing"] { display: none; }
          .lp-hero { padding: 140px 20px 80px !important; }
          .lp-hero h1 { font-size: 40px !important; letter-spacing: -1.2 !important; }
          .lp-feat, .lp-sms, .lp-stats, .lp-pricing, .lp-cta { padding: 80px 20px !important; }
          .lp-feat-row { grid-template-columns: 1fr !important; gap: 32px !important; direction: ltr !important; }
          .lp-sms-grid { grid-template-columns: 1fr !important; }
          .lp-stats4 { grid-template-columns: 1fr 1fr !important; }
          .lp-price3 { grid-template-columns: 1fr !important; }
          .lp-cta h2, .lp-pricing h2, .lp-sms h2 { font-size: 32px !important; }
          .lp-footer { padding: 32px 20px 24px !important; }
          .lp-foot-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .lp-hero h1 { font-size: 52px !important; }
          .lp-feat-row { gap: 40px !important; }
          .lp-sms-grid { grid-template-columns: 1fr !important; }
          .lp-price3 { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}