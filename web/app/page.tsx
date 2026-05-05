"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

function useReveal() {
  var ref = useRef<HTMLDivElement>(null);
  useEffect(function () {
    if (!ref.current) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    var els = ref.current.querySelectorAll(".reveal");
    els.forEach(function (el) { obs.observe(el); });
    return function () { obs.disconnect(); };
  }, []);
  return ref;
}

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

function SmsDemo() {
  var [sms, setSms] = useState("");
  var [parsed, setParsed] = useState<{ amount: string; merchant: string; category: string; date: string } | null>(null);

  useEffect(function () {
    if (!sms.trim()) { setParsed(null); return; }
    var amountMatch = sms.match(/Rs\.?([\d,]+\.?\d*)/i) || sms.match(/INR\s*([\d,]+\.?\d*)/i) || sms.match(/\$([\d,]+\.?\d*)/i) || sms.match(/([\d,]+\.?\d*)\s*(?:debited|credited|spent|paid)/i);
    var amount = amountMatch ? (amountMatch[0].includes("$") ? "$" : "₹") + amountMatch[1].replace(/,/g, "") : "—";
    var merchantMatch = sms.match(/(?:to|at|info[:\s]*|to\s+)([A-Za-z\s]+)/i);
    var merchant = merchantMatch ? merchantMatch[1].trim().substring(0, 20) : "—";
    var cat = "Other";
    var lower = sms.toLowerCase();
    if (lower.includes("swiggy") || lower.includes("zomato") || lower.includes("food") || lower.includes("restaurant") || lower.includes("uber eats") || lower.includes("doordash")) cat = "Food";
    else if (lower.includes("uber") || lower.includes("ola") || lower.includes("fuel") || lower.includes("petrol") || lower.includes("gas") || lower.includes("lyft")) cat = "Transport";
    else if (lower.includes("netflix") || lower.includes("hotstar") || lower.includes("spotify") || lower.includes("hulu") || lower.includes("disney")) cat = "Entertainment";
    else if (lower.includes("amazon") || lower.includes("flipkart") || lower.includes("myntra") || lower.includes("target") || lower.includes("walmart")) cat = "Shopping";
    else if (lower.includes("rent") || lower.includes("housing")) cat = "Rent";
    else if (lower.includes("electricity") || lower.includes("bill") || lower.includes("water") || lower.includes("utility")) cat = "Bills";
    var dateMatch = sms.match(/(\d{1,2}[\-\/]\d{1,2}[\-\/]\d{2,4})/) || sms.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*)/i);
    var date = dateMatch ? dateMatch[1] : "Today";
    setParsed({ amount: amount, merchant: merchant, category: cat, date: date });
  }, [sms]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }} className="lp-sms-grid">
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.08 }}>Paste any bank SMS</p>
        <textarea value={sms} onChange={function (e) { setSms(e.target.value); }} placeholder="Rs.2,500.00 debited from A/c XX1234 on 19-04-26. Info: Swiggy."
          style={{ width: "100%", height: 130, borderRadius: 14, padding: "16px", fontSize: 13, fontFamily: "inherit", background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", outline: "none", resize: "none", lineHeight: 1.6, transition: "border-color 200ms ease, box-shadow 200ms ease", boxShadow: "var(--shadow-sm)" }}
          onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim), var(--shadow-sm)"; }}
          onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }} />
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.08 }}>Instantly parsed</p>
        <div style={{ background: "var(--card)", borderRadius: 14, padding: "20px", boxShadow: "var(--shadow-sm)", minHeight: 130, border: "1px solid var(--border)" }}>
          {parsed ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn 250ms ease" }}>
              {[
                { label: "Amount", value: parsed.amount, color: "var(--text)", big: true },
                { label: "Merchant", value: parsed.merchant, color: "var(--text)", big: false },
                { label: "Category", value: parsed.category, color: "var(--green)", big: false },
                { label: "Date", value: parsed.date, color: "var(--text-secondary)", big: false },
              ].map(function (r) {
                return (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.04 }}>{r.label}</span>
                    <span style={{ fontSize: r.big ? 18 : 14, fontWeight: r.big ? 800 : 600, color: r.color, fontVariantNumeric: "tabular-nums" }}>{r.value}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 90 }}>
              <p style={{ fontSize: 13, color: "var(--faint)", fontStyle: "italic" }}>Paste a message to see it parsed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BudgetDemo() {
  var [income, setIncome] = useState("");
  var num = parseFloat(income.replace(/[^0-9.]/g, "")) || 0;
  var needs = Math.round(num * 0.5);
  var wants = Math.round(num * 0.3);
  var savings = Math.round(num * 0.2);

  return (
    <div>
      <div style={{ maxWidth: 340, marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.08 }}>Your monthly income</p>
        <div style={{ display: "flex", alignItems: "center", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
          <span style={{ padding: "0 0 0 16px", fontSize: 18, fontWeight: 600, color: "var(--muted)" }}>$</span>
          <input type="text" value={income} onChange={function (e) { setIncome(e.target.value); }} placeholder="5,000"
            style={{ height: 52, padding: "0 16px 0 8px", fontSize: 20, fontWeight: 700, background: "transparent", border: "none", color: "var(--text)", outline: "none", fontFamily: "inherit", width: "100%" }} />
        </div>
      </div>
      {num > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn 300ms ease" }}>
          {[
            { label: "Needs", pct: "50%", amount: needs, color: "var(--blue)", items: "Rent, groceries, insurance, utilities" },
            { label: "Wants", pct: "30%", amount: wants, color: "var(--purple)", items: "Dining, shopping, entertainment" },
            { label: "Savings", pct: "20%", amount: savings, color: "var(--green)", items: "Emergency fund, investments, retirement" },
          ].map(function (r) {
            return (
              <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderRadius: 12, background: "var(--card)", border: "1px solid var(--border)", transition: "all 200ms ease" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: r.color + "0D", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: r.color, fontVariantNumeric: "tabular-nums" }}>{r.pct}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{r.label}</span>
                    <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>${r.amount.toLocaleString()}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{r.items}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: "var(--faint)", fontStyle: "italic" }}>Enter an amount to see your budget</p>
      )}
    </div>
  );
}

export default function Home() {
  var [email, setEmail] = useState("");
  var heroRef = useReveal();
  var previewRef = useReveal();
  var whyRef = useReveal();
  var smsRef = useReveal();
  var budgetRef = useReveal();
  var pricingRef = useReveal();
  var ctaRef = useReveal();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
        background: "var(--bg)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 56, transition: "background 300ms ease, border-color 300ms ease",
        backdropFilter: "blur(12px)",
      }} className="lp-nav">
        <Link href="/" style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", textDecoration: "none", letterSpacing: -0.5 }}>
          casha<span style={{ color: "var(--green)" }}>.</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ThemeToggle />
          <Link href="/auth" style={{ fontSize: 13, fontWeight: 500, color: "var(--muted)", textDecoration: "none", padding: "6px 12px", borderRadius: 8, transition: "color 150ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.color = "var(--muted)"; }}>Sign in</Link>
          <Link href="/auth" style={{ fontSize: 13, fontWeight: 600, color: "#FFF", background: "var(--green)", textDecoration: "none", padding: "8px 20px", borderRadius: 10, transition: "all 150ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green-soft)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "var(--green)"; }}>Get started</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ paddingTop: 160, paddingBottom: 80, padding: "160px 48px 80px", maxWidth: 1200, margin: "0 auto" }} className="lp-hero">
        <div className="reveal" style={{ marginBottom: 16 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px 5px 8px", borderRadius: 20, background: "var(--green-dim)", border: "1px solid var(--green-border)", fontSize: 12, fontWeight: 600, color: "var(--green)" }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--green)" }} />
            Now in early access
          </span>
        </div>
        <h1 className="reveal reveal-delay-1" style={{ fontSize: 72, fontWeight: 700, color: "var(--text)", lineHeight: 1.02, letterSpacing: -2.5, margin: "0 0 28px 0", maxWidth: 720, fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Your money,<br />finally clear.
        </h1>
        <p className="reveal reveal-delay-2" style={{ fontSize: 19, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 40px 0", maxWidth: 440 }}>
          Track every dollar. Understand where it goes. Build wealth effortlessly.
        </p>
        <div className="reveal reveal-delay-3" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            <input type="email" placeholder="Enter your email" value={email} onChange={function (e) { setEmail(e.target.value); }}
              style={{ height: 50, padding: "0 18px", fontSize: 14, fontWeight: 500, background: "transparent", border: "none", color: "var(--text)", outline: "none", fontFamily: "inherit", width: 260 }} />
            <button style={{ height: 50, padding: "0 24px", background: "var(--green)", color: "#FFF", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit", transition: "background 150ms ease", whiteSpace: "nowrap" }}
              onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green-soft)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.background = "var(--green)"; }}>Get started</button>
          </div>
          <span style={{ fontSize: 12, color: "var(--faint)" }}>Free forever · No credit card</span>
        </div>
      </section>

      {/* ── PRODUCT PREVIEW ── */}
      <section ref={previewRef} style={{ padding: "20px 48px 120px", maxWidth: 1200, margin: "0 auto" }} className="lp-preview">
        <div className="reveal" style={{
          background: "var(--surface)", borderRadius: 24, padding: "44px 40px 40px",
          boxShadow: "var(--shadow-xl)", maxWidth: 580,
          border: "1px solid var(--border)",
          position: "relative", overflow: "hidden",
        }}>
          {/* Gradient orb */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, var(--green-glow) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, position: "relative" }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "var(--green)", boxShadow: "0 0 10px var(--green-glow)" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>Calm</span>
            <span style={{ fontSize: 11, color: "var(--faint)", marginLeft: 8 }}>Money Temperature</span>
          </div>
          <p style={{ fontSize: 44, fontWeight: 800, color: "var(--text)", letterSpacing: -2, lineHeight: 1, marginBottom: 8, fontVariantNumeric: "tabular-nums", position: "relative" }}>$12,840</p>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 28, position: "relative" }}>Net worth · 4 accounts</p>
          <div style={{ display: "flex", gap: 24, marginBottom: 28, position: "relative" }}>
            {[
              { label: "Income", value: "$5,000", color: "var(--green)" },
              { label: "Expense", value: "$2,840", color: "var(--red)" },
              { label: "Saved", value: "$2,160", color: "var(--green)" },
            ].map(function (s) {
              return (
                <div key={s.label}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06, marginBottom: 3 }}>{s.label}</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: s.color, fontVariantNumeric: "tabular-nums", letterSpacing: -0.5 }}>{s.value}</p>
                </div>
              );
            })}
          </div>
          <div style={{ height: 6, background: "var(--card)", borderRadius: 6, overflow: "hidden", position: "relative" }}>
            <div style={{ height: "100%", width: "57%", background: "linear-gradient(90deg, var(--green), var(--green-soft))", borderRadius: 6 }} />
          </div>
          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 8, position: "relative" }}>57% budget used · $2,160 left this month</p>
        </div>
      </section>

      {/* ── WHY ── */}
      <section ref={whyRef} style={{ padding: "120px 48px", maxWidth: 1200, margin: "0 auto" }} className="lp-why">
        <p className="reveal" style={{ fontSize: 12, fontWeight: 600, color: "var(--green)", marginBottom: 56, textTransform: "uppercase", letterSpacing: 0.1 }}>Why casha.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>
          {[
            { n: "01", title: "Every dollar, tracked.", desc: "Paste a bank SMS. Transaction created. Works with any bank — Chase, SBI, HDFC, Monzo, Revolut. No manual entry needed." },
            { n: "02", title: "AI that knows your money.", desc: "Not generic advice. Your personal CFO that sees your actual transactions and tells you exactly what to do. Save more. Spend smarter." },
            { n: "03", title: "Built for the world.", desc: "Tax optimization for every country. Old vs New regime in India. Standard vs Itemized in the US. Category-wise deductions everywhere." },
          ].map(function (s, i) {
            return (
              <div key={s.n} className={"reveal reveal-delay-" + (i + 1)} style={{ display: "flex", gap: 36, alignItems: "start" }} className="lp-why-item reveal">
                <span style={{ fontSize: 44, fontWeight: 800, color: "var(--border-light)", letterSpacing: -1, lineHeight: 1, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{s.n}</span>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "0 0 10px 0", letterSpacing: -0.3, fontFamily: "Georgia, 'Times New Roman', serif" }}>{s.title}</h3>
                  <p style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0, maxWidth: 520 }}>{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SMS DEMO ── */}
      <section ref={smsRef} style={{ padding: "120px 48px", maxWidth: 1200, margin: "0 auto" }} className="lp-sms">
        <div className="reveal">
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--green)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.1 }}>Try it live</p>
          <h3 style={{ fontSize: 32, fontWeight: 700, color: "var(--text)", marginBottom: 8, letterSpacing: -0.5, fontFamily: "Georgia, 'Times New Roman', serif" }}>Paste a bank SMS.</h3>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", marginBottom: 36, lineHeight: 1.6 }}>Watch the magic. Works with any bank, any country.</p>
        </div>
        <div className="reveal reveal-delay-1">
          <SmsDemo />
        </div>
      </section>

      {/* ── BUDGET DEMO ── */}
      <section ref={budgetRef} style={{ padding: "120px 48px", maxWidth: 1200, margin: "0 auto" }} className="lp-budget">
        <div className="reveal">
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--green)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.1 }}>50/30/20 rule</p>
          <h3 style={{ fontSize: 32, fontWeight: 700, color: "var(--text)", marginBottom: 8, letterSpacing: -0.5, fontFamily: "Georgia, 'Times New Roman', serif" }}>Your budget, in one number.</h3>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", marginBottom: 36, lineHeight: 1.6 }}>Enter your income. See the proven framework, instantly.</p>
        </div>
        <div className="reveal reveal-delay-1">
          <BudgetDemo />
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: "100px 48px", maxWidth: 1200, margin: "0 auto" }} className="lp-stats">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--border)", borderRadius: 20, overflow: "hidden" }} className="lp-stats3">
          {[
            { value: "618+", label: "Early members worldwide" },
            { value: "$68", label: "Avg. monthly waste found" },
            { value: "$580", label: "Avg. tax saved/year" },
          ].map(function (s) {
            return (
              <div key={s.label} style={{ background: "var(--surface)", padding: "36px 28px", textAlign: "center" }}>
                <p style={{ fontSize: 36, fontWeight: 800, color: "var(--text)", margin: "0 0 4px 0", letterSpacing: -1, fontVariantNumeric: "tabular-nums" }}>{s.value}</p>
                <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section ref={pricingRef} id="pricing" style={{ padding: "120px 48px", maxWidth: 1200, margin: "0 auto" }} className="lp-pricing">
        <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--green)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.1 }}>Pricing</p>
          <h2 style={{ fontSize: 40, fontWeight: 700, color: "var(--text)", letterSpacing: -1, fontFamily: "Georgia, 'Times New Roman', serif" }}>Simple. Honest. Global.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, maxWidth: 900, margin: "0 auto" }} className="lp-price3">
          {[
            {
              name: "Free", price: "$0", period: "forever", cta: "Get started", highlight: false,
              features: ["Health score", "Unlimited transactions", "SMS parser — all banks", "Budget AI (50/30/20)", "Tax optimizer", "AI advisor — 10/day", "Subscription detector"],
            },
            {
              name: "Plus", price: "$4", period: "/month", cta: "Start free trial", highlight: true,
              features: ["Everything in Free", "Unlimited AI advisor", "Investment tracker", "Retirement planner", "WhatsApp alerts", "Tax reports PDF", "Priority support"],
            },
            {
              name: "Business", price: "$12", period: "/month", cta: "Contact us", highlight: false,
              features: ["Everything in Plus", "GST invoice generator", "Cash flow forecasting", "P&L statements", "Team access (5 users)", "QuickBooks sync", "Dedicated support"],
            },
          ].map(function (p) {
            return (
              <div key={p.name} className="reveal" style={{
                padding: "32px 28px", borderRadius: 20,
                background: p.highlight ? "var(--surface)" : "transparent",
                border: "1px solid " + (p.highlight ? "var(--green-border)" : "var(--border)"),
                boxShadow: p.highlight ? "var(--shadow-lg)" : "none",
                display: "flex", flexDirection: "column",
                position: "relative", overflow: "hidden",
              }}>
                {p.highlight && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, var(--green), var(--green-soft))" }} />}
                {p.highlight && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--green)", textTransform: "uppercase", letterSpacing: 0.08, marginBottom: 14, display: "block" }}>Most popular</span>}
                {!p.highlight && <div style={{ marginBottom: 14, height: 14 }} />}
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>{p.name}</h3>
                <p style={{ margin: "0 0 24px" }}><span style={{ fontSize: 34, fontWeight: 800, color: "var(--text)", letterSpacing: -1, fontVariantNumeric: "tabular-nums" }}>{p.price}</span><span style={{ fontSize: 13, color: "var(--muted)", marginLeft: 4 }}>{p.period}</span></p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, marginBottom: 24 }}>
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
                  display: "block", textAlign: "center", padding: "12px 0", borderRadius: 12,
                  background: p.highlight ? "var(--green)" : "transparent",
                  color: p.highlight ? "#FFF" : "var(--text)",
                  border: p.highlight ? "none" : "1px solid var(--border)",
                  fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "all 150ms ease",
                }}
                  onMouseEnter={function (e) { if (p.highlight) { e.currentTarget.style.background = "var(--green-soft)"; } else { e.currentTarget.style.background = "var(--surface)"; } }}
                  onMouseLeave={function (e) { if (p.highlight) { e.currentTarget.style.background = "var(--green)"; } else { e.currentTarget.style.background = "transparent"; } }}>{p.cta}</Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section style={{ padding: "100px 48px", maxWidth: 1200, margin: "0 auto" }} className="lp-sec">
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          {["AES-256 Encrypted", "Read-only access", "No data selling", "GDPR & DPDPA", "Delete anytime", "SOC 2 infrastructure"].map(function (s) {
            return (
              <span key={s} style={{ padding: "8px 18px", borderRadius: 20, background: "var(--surface)", border: "1px solid var(--border)", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{s}</span>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section ref={ctaRef} style={{ padding: "120px 48px", maxWidth: 1200, margin: "0 auto", textAlign: "center" }} className="lp-cta">
        <h2 className="reveal" style={{ fontSize: 48, fontWeight: 700, color: "var(--text)", letterSpacing: -1.5, margin: "0 0 14px 0", fontFamily: "Georgia, 'Times New Roman', serif" }}>Start today.</h2>
        <p className="reveal reveal-delay-1" style={{ fontSize: 17, color: "var(--text-secondary)", margin: "0 0 36px 0" }}>Free forever. Your data stays yours. Works worldwide.</p>
        <Link href="/auth" className="reveal reveal-delay-2" style={{ display: "inline-block", padding: "16px 48px", borderRadius: 14, background: "var(--green)", color: "#FFF", fontSize: 16, fontWeight: 700, textDecoration: "none", transition: "all 200ms ease", boxShadow: "var(--shadow-lg)" }}
          onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green-soft)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-xl)"; }}
          onMouseLeave={function (e) { e.currentTarget.style.background = "var(--green)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}>
          Get started free
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 48px", maxWidth: 1200, margin: "0 auto" }} className="lp-footer">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 32 }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: "0 0 8px 0", letterSpacing: -0.5 }}>casha<span style={{ color: "var(--green)" }}>.</span></p>
            <p style={{ fontSize: 11, color: "var(--faint)", margin: 0, maxWidth: 280, lineHeight: 1.5 }}>Financial education platform. Not a registered financial advisor. Consult a qualified professional before financial decisions.</p>
          </div>
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.08 }}>Product</span>
              <a href="#features" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>Features</a>
              <a href="#pricing" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>Pricing</a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.08 }}>Legal</span>
              <Link href="/legal/privacy" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>Privacy Policy</Link>
              <Link href="/legal/terms" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>Terms of Service</Link>
              <Link href="/legal/cookies" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>Cookie Policy</Link>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--faint)" }}>© 2025 Casha Money Technologies Pvt. Ltd. All rights reserved.</span>
          <span style={{ fontSize: 11, color: "var(--faint)" }}>Made with care, for the world</span>
        </div>
      </footer>

      {/* ── RESPONSIVE ── */}
      <style>{`
        @media (max-width: 768px) {
          .lp-nav { padding: 0 20px !important; }
          .lp-hero { padding: 130px 20px 60px !important; }
          .lp-hero h1 { font-size: 42px !important; letter-spacing: -1.5 !important; }
          .lp-preview { padding: 10px 20px 80px !important; }
          .lp-preview > div { padding: 28px 24px !important; }
          .lp-preview > div > p:first-of-type { font-size: 32px !important; }
          .lp-why, .lp-sms, .lp-budget, .lp-stats, .lp-pricing, .lp-sec, .lp-cta { padding: 80px 20px !important; }
          .lp-why-item { flex-direction: column !important; gap: 12px !important; }
          .lp-why-item span { font-size: 28px !important; }
          .lp-sms-grid { grid-template-columns: 1fr !important; }
          .lp-stats3 { grid-template-columns: 1fr !important; }
          .lp-price3 { grid-template-columns: 1fr !important; }
          .lp-cta h2 { font-size: 36px !important; }
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