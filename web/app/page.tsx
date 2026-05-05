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
    }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });
    var els = ref.current.querySelectorAll(".reveal");
    els.forEach(function (el) { obs.observe(el); });
    return function () { obs.disconnect(); };
  }, []);
  return ref;
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
    else if (l.includes("netflix") || l.includes("spotify") || l.includes("hulu") || l.includes("hotstar")) cat = "Entertainment";
    else if (l.includes("amazon") || l.includes("flipkart") || l.includes("target") || l.includes("walmart")) cat = "Shopping";
    else if (l.includes("rent")) cat = "Rent";
    else if (l.includes("electricity") || l.includes("bill") || l.includes("water")) cat = "Bills";
    var dm = sms.match(/(\d{1,2}[\-\/]\d{1,2}[\-\/]\d{2,4})/) || sms.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*)/i);
    var date = dm ? dm[1] : "Today";
    setParsed({ amount: amount, merchant: merchant, category: cat, date: date });
  }, [sms]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, maxWidth: 700, margin: "0 auto" }} className="lp-sms-grid">
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.1 }}>Paste any bank SMS</p>
        <textarea value={sms} onChange={function (e) { setSms(e.target.value); }} placeholder="Rs.2,500.00 debited from A/c XX1234 on 19-04-26. Info: Swiggy."
          style={{ width: "100%", height: 140, borderRadius: 16, padding: "18px", fontSize: 13, fontFamily: "inherit", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", outline: "none", resize: "none", lineHeight: 1.6, transition: "border-color 200ms ease" }}
          onFocus={function (e) { e.currentTarget.style.borderColor = "rgba(52,211,153,0.3)"; }}
          onBlur={function (e) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }} />
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.1 }}>Instantly parsed</p>
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: "22px", minHeight: 140, border: "1px solid rgba(255,255,255,0.08)" }}>
          {parsed ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 250ms ease" }}>
              {[
                { label: "Amount", value: parsed.amount, color: "#fff", big: true },
                { label: "Merchant", value: parsed.merchant, color: "rgba(255,255,255,0.8)", big: false },
                { label: "Category", value: parsed.category, color: "#34D399", big: false },
                { label: "Date", value: parsed.date, color: "rgba(255,255,255,0.6)", big: false },
              ].map(function (r) {
                return (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.06 }}>{r.label}</span>
                    <span style={{ fontSize: r.big ? 20 : 14, fontWeight: r.big ? 800 : 600, color: r.color, fontVariantNumeric: "tabular-nums" }}>{r.value}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 96 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>Paste a message to see it parsed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", borderRadius: 20, padding: "32px 28px 28px",
      border: "1px solid rgba(255,255,255,0.06)", maxWidth: 520, margin: "0 auto",
      boxShadow: "0 40px 80px rgba(0,0,0,0.4), 0 0 120px rgba(52,211,153,0.04)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Green orb */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      {/* Blue orb */}
      <div style={{ position: "absolute", bottom: -60, left: -60, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, position: "relative" }}>
        <div style={{ width: 8, height: 8, borderRadius: 4, background: "#34D399", boxShadow: "0 0 12px rgba(52,211,153,0.4)" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#34D399" }}>Calm</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginLeft: 8 }}>Money Temperature</span>
      </div>

      <p style={{ fontSize: 48, fontWeight: 800, color: "#fff", letterSpacing: -2, lineHeight: 1, marginBottom: 6, fontVariantNumeric: "tabular-nums", position: "relative" }}>$12,840</p>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 28, position: "relative" }}>Net worth · 4 accounts</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28, position: "relative" }}>
        {[
          { label: "Income", value: "$5,000", color: "#34D399" },
          { label: "Expense", value: "$2,840", color: "#F87171" },
          { label: "Saved", value: "$2,160", color: "#34D399" },
        ].map(function (s) {
          return (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.04)" }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 0.06, marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: s.color, fontVariantNumeric: "tabular-nums", letterSpacing: -0.5 }}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Budget bar */}
      <div style={{ position: "relative" }}>
        <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: "57%", background: "linear-gradient(90deg, #34D399, #6EE7B7)", borderRadius: 8 }} />
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 8 }}>57% budget used · $2,160 left</p>
      </div>

      {/* Mini transactions */}
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.04)", position: "relative" }}>
        {[
          { name: "Swiggy", cat: "Food", amount: "-$12.50", color: "#F87171" },
          { name: "Salary", cat: "Income", amount: "+$5,000", color: "#34D399" },
          { name: "Netflix", cat: "Entertainment", amount: "-$15.99", color: "#F87171" },
        ].map(function (t) {
          return (
            <div key={t.name + t.amount} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🏪</div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", margin: 0 }}>{t.name}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", margin: 0 }}>{t.cat}</p>
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: t.color, fontVariantNumeric: "tabular-nums" }}>{t.amount}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  var [email, setEmail] = useState("");
  var heroRef = useReveal();
  var previewRef = useReveal();
  var whyRef = useReveal();
  var smsRef = useReveal();
  var statsRef = useReveal();
  var pricingRef = useReveal();
  var ctaRef = useReveal();

  return (
    <div style={{ background: "#000", color: "#fff" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 56,
      }} className="lp-nav">
        <Link href="/" style={{ fontSize: 18, fontWeight: 800, color: "#fff", textDecoration: "none", letterSpacing: -0.5 }}>
          casha<span style={{ color: "#34D399" }}>.</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/auth" style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)", textDecoration: "none", padding: "6px 12px", borderRadius: 8, transition: "color 150ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={function (e) { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>Sign in</Link>
          <Link href="/auth" style={{ fontSize: 13, fontWeight: 600, color: "#000", background: "#34D399", textDecoration: "none", padding: "8px 20px", borderRadius: 10, transition: "all 150ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "#6EE7B7"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "#34D399"; }}>Get started</Link>
        </div>
      </nav>

      {/* ── HERO — pure black ── */}
      <section ref={heroRef} style={{ background: "#000", padding: "180px 48px 100px", textAlign: "center" }} className="lp-hero">
        <div className="reveal" style={{ marginBottom: 20 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px 6px 10px", borderRadius: 24, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)", fontSize: 12, fontWeight: 600, color: "#34D399" }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: "#34D399" }} />
            Now in early access — 618+ members
          </span>
        </div>
        <h1 className="reveal reveal-delay-1" style={{ fontSize: 76, fontWeight: 700, color: "#fff", lineHeight: 1.0, letterSpacing: -2.5, margin: "0 auto 28px auto", maxWidth: 680, fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Your money,<br />finally clear.
        </h1>
        <p className="reveal reveal-delay-2" style={{ fontSize: 19, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "0 auto 40px auto", maxWidth: 420 }}>
          Track every dollar. Understand where it goes. Build wealth effortlessly.
        </p>
        <div className="reveal reveal-delay-3" style={{ display: "flex", justifyContent: "center", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden" }}>
            <input type="email" placeholder="Enter your email" value={email} onChange={function (e) { setEmail(e.target.value); }}
              style={{ height: 52, padding: "0 20px", fontSize: 14, fontWeight: 500, background: "transparent", border: "none", color: "#fff", outline: "none", fontFamily: "inherit", width: 260 }} />
            <button style={{ height: 52, padding: "0 28px", background: "#34D399", color: "#000", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit", transition: "background 150ms ease", whiteSpace: "nowrap" }}
              onMouseEnter={function (e) { e.currentTarget.style.background = "#6EE7B7"; }}
              onMouseLeave={function (e) { e.currentTarget.style.background = "#34D399"; }}>Get started</button>
          </div>
        </div>
        <p className="reveal reveal-delay-4" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 14 }}>Free forever · No credit card · Works worldwide</p>
      </section>

      {/* ── DASHBOARD PREVIEW — deep dark with green glow ── */}
      <section ref={previewRef} style={{ background: "linear-gradient(180deg, #000 0%, #040A07 50%, #000 100%)", padding: "40px 48px 120px", textAlign: "center" }} className="lp-preview">
        <div className="reveal">
          <DashboardMockup />
        </div>
      </section>

      {/* ── WHY — warm dark ── */}
      <section ref={whyRef} style={{ background: "linear-gradient(180deg, #000 0%, #0A0908 50%, #000 100%)", padding: "120px 48px", textAlign: "center" }} className="lp-why">
        <h2 className="reveal" style={{ fontSize: 44, fontWeight: 700, color: "#fff", letterSpacing: -1.5, margin: "0 auto 16px auto", maxWidth: 600, fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Everything your money needs.
        </h2>
        <p className="reveal reveal-delay-1" style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", margin: "0 auto 64px auto", maxWidth: 440 }}>Nothing it doesn't.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, maxWidth: 800, margin: "0 auto" }} className="lp-feat3">
          {[
            { icon: "📊", title: "Track everything", desc: "Every dollar. Every account. One view. All banks worldwide." },
            { icon: "🤖", title: "AI that knows you", desc: "Your personal CFO. Sees your real data. Gives specific advice." },
            { icon: "💡", title: "Tax genius", desc: "Old vs New regime. Standard vs Itemized. Real savings found." },
            { icon: "📱", title: "SMS parser", desc: "Paste bank SMS. Transaction done. Any bank. Any country." },
            { icon: "🎯", title: "Budget in seconds", desc: "AI builds your 50/30/20 budget. One click. Proven framework." },
            { icon: "🔒", title: "Bank-level security", desc: "AES-256 encrypted. Read-only. No data selling. Ever." },
          ].map(function (f, i) {
            return (
              <div key={f.title} className={"reveal reveal-delay-" + ((i % 3) + 1)} style={{
                background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "28px 24px",
                border: "1px solid rgba(255,255,255,0.05)", textAlign: "left",
                transition: "all 250ms ease",
              }}>
                <span style={{ fontSize: 28, display: "block", marginBottom: 14 }}>{f.icon}</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 6px 0" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SMS DEMO — cool dark ── */}
      <section ref={smsRef} style={{ background: "linear-gradient(180deg, #000 0%, #060809 50%, #000 100%)", padding: "120px 48px", textAlign: "center" }} className="lp-sms">
        <h2 className="reveal" style={{ fontSize: 44, fontWeight: 700, color: "#fff", letterSpacing: -1.5, margin: "0 auto 12px auto", fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Paste a bank SMS.
        </h2>
        <p className="reveal reveal-delay-1" style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", margin: "0 auto 48px auto", maxWidth: 400 }}>Watch the magic. Any bank. Any country.</p>
        <div className="reveal reveal-delay-2">
          <SmsDemo />
        </div>
      </section>

      {/* ── STATS — gradient ── */}
      <section ref={statsRef} style={{ background: "linear-gradient(180deg, #000 0%, #051A0E 50%, #000 100%)", padding: "100px 48px", textAlign: "center" }} className="lp-stats">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, maxWidth: 700, margin: "0 auto", background: "rgba(255,255,255,0.06)", borderRadius: 20, overflow: "hidden" }} className="lp-stats3">
          {[
            { value: "618+", label: "Early members" },
            { value: "$68", label: "Avg. waste found/mo" },
            { value: "$580", label: "Avg. tax saved/yr" },
          ].map(function (s) {
            return (
              <div key={s.label} className="reveal" style={{ background: "rgba(255,255,255,0.02)", padding: "40px 28px" }}>
                <p style={{ fontSize: 40, fontWeight: 800, color: "#34D399", margin: "0 0 4px 0", letterSpacing: -1, fontVariantNumeric: "tabular-nums" }}>{s.value}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0 }}>{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── PRICING — dark surface ── */}
      <section ref={pricingRef} id="pricing" style={{ background: "linear-gradient(180deg, #000 0%, #080808 50%, #000 100%)", padding: "120px 48px", textAlign: "center" }} className="lp-pricing">
        <h2 className="reveal" style={{ fontSize: 44, fontWeight: 700, color: "#fff", letterSpacing: -1.5, margin: "0 auto 12px auto", fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Simple. Honest. Global.
        </h2>
        <p className="reveal reveal-delay-1" style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", margin: "0 auto 56px auto" }}>Start free. Upgrade when ready.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, maxWidth: 860, margin: "0 auto" }} className="lp-price3">
          {[
            { name: "Free", price: "$0", period: "forever", cta: "Get started", hl: false, features: ["Health score", "Unlimited transactions", "SMS parser — all banks", "Budget AI (50/30/20)", "Tax optimizer", "AI advisor — 10/day"] },
            { name: "Plus", price: "$4", period: "/month", cta: "Start free trial", hl: true, features: ["Everything in Free", "Unlimited AI advisor", "Investment tracker", "Retirement planner", "WhatsApp alerts", "Tax reports PDF"] },
            { name: "Business", price: "$12", period: "/month", cta: "Contact us", hl: false, features: ["Everything in Plus", "GST invoices", "Cash flow forecasting", "P&L statements", "Team access (5)", "QuickBooks sync"] },
          ].map(function (p) {
            return (
              <div key={p.name} className="reveal" style={{
                padding: "32px 28px", borderRadius: 20,
                background: p.hl ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.02)",
                border: "1px solid " + (p.hl ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)"),
                display: "flex", flexDirection: "column", position: "relative", overflow: "hidden",
              }}>
                {p.hl && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #34D399, #6EE7B7)" }} />}
                {p.hl && <span style={{ fontSize: 10, fontWeight: 700, color: "#34D399", textTransform: "uppercase", letterSpacing: 0.08, marginBottom: 14, display: "block" }}>Most popular</span>}
                {!p.hl && <div style={{ marginBottom: 14, height: 14 }} />}
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>{p.name}</h3>
                <p style={{ margin: "0 0 24px" }}><span style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: -1, fontVariantNumeric: "tabular-nums" }}>{p.price}</span><span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>{p.period}</span></p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, marginBottom: 24 }}>
                  {p.features.map(function (f) {
                    return (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{f}</span>
                      </div>
                    );
                  })}
                </div>
                <Link href="/auth" style={{
                  display: "block", textAlign: "center", padding: "12px 0", borderRadius: 12,
                  background: p.hl ? "#34D399" : "transparent",
                  color: p.hl ? "#000" : "#fff",
                  border: p.hl ? "none" : "1px solid rgba(255,255,255,0.1)",
                  fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "all 150ms ease",
                }}
                  onMouseEnter={function (e) { if (p.hl) { e.currentTarget.style.background = "#6EE7B7"; } else { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; } }}
                  onMouseLeave={function (e) { if (p.hl) { e.currentTarget.style.background = "#34D399"; } else { e.currentTarget.style.background = "transparent"; } }}>{p.cta}</Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section style={{ background: "#000", padding: "80px 48px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          {["AES-256 Encrypted", "Read-only access", "No data selling", "GDPR & DPDPA", "Delete anytime", "SOC 2"].map(function (s) {
            return (
              <span key={s} style={{ padding: "8px 18px", borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>{s}</span>
            );
          })}
        </div>
      </section>

      {/* ── CTA — pure black ── */}
      <section ref={ctaRef} style={{ background: "#000", padding: "120px 48px", textAlign: "center" }} className="lp-cta">
        <h2 className="reveal" style={{ fontSize: 52, fontWeight: 700, color: "#fff", letterSpacing: -2, margin: "0 auto 14px auto", fontFamily: "Georgia, 'Times New Roman', serif" }}>Start today.</h2>
        <p className="reveal reveal-delay-1" style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", margin: "0 auto 36px auto" }}>Free forever. Your data stays yours.</p>
        <Link href="/auth" className="reveal reveal-delay-2" style={{ display: "inline-block", padding: "16px 52px", borderRadius: 14, background: "#34D399", color: "#000", fontSize: 16, fontWeight: 700, textDecoration: "none", transition: "all 200ms ease", boxShadow: "0 0 40px rgba(52,211,153,0.2)" }}
          onMouseEnter={function (e) { e.currentTarget.style.background = "#6EE7B7"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 60px rgba(52,211,153,0.3)"; }}
          onMouseLeave={function (e) { e.currentTarget.style.background = "#34D399"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(52,211,153,0.2)"; }}>
          Get started free
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 48px", maxWidth: 1100, margin: "0 auto" }} className="lp-footer">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 32 }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: "0 0 8px 0", letterSpacing: -0.5 }}>casha<span style={{ color: "#34D399" }}>.</span></p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", margin: 0, maxWidth: 260, lineHeight: 1.5 }}>Financial education platform. Not a registered financial advisor. Consult a qualified professional before decisions.</p>
          </div>
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: 0.08 }}>Product</span>
              <a href="#features" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Features</a>
              <a href="#pricing" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Pricing</a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: 0.08 }}>Legal</span>
              <Link href="/legal/privacy" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Privacy</Link>
              <Link href="/legal/terms" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Terms</Link>
              <Link href="/legal/cookies" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Cookies</Link>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>© 2025 Casha Money Technologies Pvt. Ltd.</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>Made with care, for the world</span>
        </div>
      </footer>

      {/* ── RESPONSIVE ── */}
      <style>{`
        @media (max-width: 768px) {
          .lp-nav { padding: 0 20px !important; }
          .lp-hero { padding: 140px 20px 60px !important; }
          .lp-hero h1 { font-size: 42px !important; letter-spacing: -1.5 !important; }
          .lp-preview { padding: 20px 20px 80px !important; }
          .lp-why, .lp-sms, .lp-stats, .lp-pricing, .lp-cta { padding: 80px 20px !important; }
          .lp-feat3 { grid-template-columns: 1fr !important; }
          .lp-sms-grid { grid-template-columns: 1fr !important; }
          .lp-stats3 { grid-template-columns: 1fr !important; }
          .lp-price3 { grid-template-columns: 1fr !important; }
          .lp-why h2, .lp-sms h2, .lp-pricing h2, .lp-cta h2 { font-size: 32px !important; }
          .lp-footer { padding: 24px 20px !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .lp-hero h1 { font-size: 56px !important; }
          .lp-sms-grid { grid-template-columns: 1fr !important; }
          .lp-price3 { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}