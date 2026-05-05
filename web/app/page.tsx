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

function SmsDemo() {
  var [sms, setSms] = useState("");
  var [parsed, setParsed] = useState<{ amount: string; merchant: string; category: string; date: string } | null>(null);

  useEffect(function () {
    if (!sms.trim()) { setParsed(null); return; }
    var amountMatch = sms.match(/Rs\.?([\d,]+\.?\d*)/i) || sms.match(/INR\s*([\d,]+\.?\d*)/i) || sms.match(/([\d,]+\.?\d*)\s*(?:debited|credited|spent|paid)/i);
    var amount = amountMatch ? "₹" + amountMatch[1].replace(/,/g, "") : "—";
    var merchantMatch = sms.match(/(?:to|at|info[:\s]*|to\s+)([A-Za-z\s]+)/i);
    var merchant = merchantMatch ? merchantMatch[1].trim().substring(0, 20) : "—";
    var cat = "Other";
    var lower = sms.toLowerCase();
    if (lower.includes("swiggy") || lower.includes("zomato") || lower.includes("food") || lower.includes("restaurant")) cat = "Food";
    else if (lower.includes("uber") || lower.includes("ola") || lower.includes("fuel") || lower.includes("petrol")) cat = "Transport";
    else if (lower.includes("netflix") || lower.includes("hotstar") || lower.includes("spotify")) cat = "Entertainment";
    else if (lower.includes("amazon") || lower.includes("flipkart") || lower.includes("myntra")) cat = "Shopping";
    else if (lower.includes("rent") || lower.includes("housing")) cat = "Rent";
    else if (lower.includes("electricity") || lower.includes("bill") || lower.includes("water")) cat = "Bills";
    var dateMatch = sms.match(/(\d{1,2}[\-\/]\d{1,2}[\-\/]\d{2,4})/) || sms.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*)/i);
    var date = dateMatch ? dateMatch[1] : "Today";
    setParsed({ amount: amount, merchant: merchant, category: cat, date: date });
  }, [sms]);

  var placeholder = "Rs.2,500.00 debited from A/c XX1234 on 19-04-26. Info: Swiggy.";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }} className="lp-sms-grid">
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.06 }}>Paste bank SMS</p>
        <textarea value={sms} onChange={function (e) { setSms(e.target.value); }} placeholder={placeholder}
          style={{ width: "100%", height: 120, borderRadius: 12, padding: "14px 16px", fontSize: 13, fontFamily: "inherit", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", outline: "none", resize: "none", lineHeight: 1.6, transition: "border-color 200ms ease, box-shadow 200ms ease", boxShadow: "var(--shadow-sm)" }}
          onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; }}
          onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }} />
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.06 }}>Parsed</p>
        <div style={{ background: "var(--surface)", borderRadius: 12, padding: "18px 20px", boxShadow: "var(--shadow-sm)", minHeight: 120 }}>
          {parsed ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn 200ms ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Amount</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{parsed.amount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Merchant</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{parsed.merchant}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Category</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--green)" }}>{parsed.category}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Date</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>{parsed.date}</span>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 84 }}>
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
      <div style={{ maxWidth: 320, marginBottom: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.06 }}>Your monthly income</p>
        <div style={{ display: "flex", alignItems: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", boxShadow: "var(--shadow-sm)", transition: "border-color 200ms ease, box-shadow 200ms ease" }}
          onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; }}
          onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}>
          <span style={{ padding: "0 0 0 16px", fontSize: 16, fontWeight: 600, color: "var(--muted)" }}>₹</span>
          <input type="text" value={income} onChange={function (e) { setIncome(e.target.value); }} placeholder="75,000"
            style={{ height: 48, padding: "0 16px 0 8px", fontSize: 18, fontWeight: 600, background: "transparent", border: "none", color: "var(--text)", outline: "none", fontFamily: "inherit", width: "100%" }} />
        </div>
      </div>

      {num > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 300ms ease" }}>
          {[
            { label: "Needs", pct: "50%", amount: needs, color: "var(--blue)", items: "Rent, groceries, EMI, utilities" },
            { label: "Wants", pct: "30%", amount: wants, color: "var(--purple)", items: "Dining, shopping, entertainment" },
            { label: "Savings", pct: "20%", amount: savings, color: "var(--green)", items: "Emergency fund, SIP, PPF" },
          ].map(function (r) {
            return (
              <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: r.color + "0D", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: r.color, fontVariantNumeric: "tabular-nums" }}>{r.pct}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{r.label}</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>₹{r.amount.toLocaleString("en-IN")}</span>
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

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
        background: "var(--bg)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 56, transition: "background 300ms ease",
      }} className="lp-nav">
        <Link href="/" style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", textDecoration: "none", letterSpacing: -0.5 }}>
          casha<span style={{ color: "var(--green)" }}>.</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="lp-nav-right">
          <a href="#features" style={{ fontSize: 13, fontWeight: 500, color: "var(--muted)", textDecoration: "none", padding: "6px 12px", borderRadius: 8, transition: "color 150ms ease", display: "none" }}
            onMouseEnter={function (e) { e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.color = "var(--muted)"; }}>Features</a>
          <ThemeToggle />
          <Link href="/auth" style={{ fontSize: 13, fontWeight: 500, color: "var(--muted)", textDecoration: "none", padding: "6px 12px", borderRadius: 8, transition: "color 150ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.color = "var(--muted)"; }}>Sign in</Link>
          <Link href="/auth" style={{ fontSize: 13, fontWeight: 600, color: "#FFF", background: "var(--green)", textDecoration: "none", padding: "8px 18px", borderRadius: 10, transition: "all 150ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green-soft)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "var(--green)"; }}>Get started</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 160, paddingBottom: 120, padding: "160px 48px 120px", maxWidth: 1100, margin: "0 auto" }} className="lp-hero">
        <h1 style={{ fontSize: 64, fontWeight: 700, color: "var(--text)", lineHeight: 1.05, letterSpacing: -2, margin: "0 0 24px 0", maxWidth: 680, fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Your money<br />has a story.
        </h1>
        <p style={{ fontSize: 18, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 40px 0", maxWidth: 420 }}>
          Let it be a good one. Track, budget, and understand — built for India, free forever.
        </p>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            <input type="email" placeholder="Enter your email" value={email} onChange={function (e) { setEmail(e.target.value); }}
              style={{ height: 48, padding: "0 16px", fontSize: 14, fontWeight: 500, background: "transparent", border: "none", color: "var(--text)", outline: "none", fontFamily: "inherit", width: 240 }}
              onFocus={function (e) { e.currentTarget.parentElement.style.borderColor = "var(--green-border)"; e.currentTarget.parentElement.style.boxShadow = "0 0 0 3px var(--green-dim)"; }}
              onBlur={function (e) { e.currentTarget.parentElement.style.borderColor = "var(--border)"; e.currentTarget.parentElement.style.boxShadow = "var(--shadow-sm)"; }} />
            <button style={{ height: 48, padding: "0 22px", background: "var(--green)", color: "#FFF", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", transition: "background 150ms ease", whiteSpace: "nowrap" }}
              onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green-soft)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.background = "var(--green)"; }}>Get started</button>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "var(--faint)", margin: "12px 0 0 0" }}>Free forever · No credit card · All Indian banks</p>
      </section>

      {/* ── PRODUCT PREVIEW ── */}
      <section style={{ padding: "0 48px 120px", maxWidth: 1100, margin: "0 auto" }} className="lp-preview">
        <div style={{
          background: "var(--surface)", borderRadius: 20, padding: "40px 36px 36px",
          boxShadow: "var(--shadow-lg)", maxWidth: 560,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "var(--green)", boxShadow: "0 0 8px var(--green-glow)" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>Calm</span>
            <span style={{ fontSize: 11, color: "var(--faint)", marginLeft: 8 }}>Money Temperature</span>
          </div>
          <p style={{ fontSize: 40, fontWeight: 800, color: "var(--text)", letterSpacing: -1.5, lineHeight: 1, marginBottom: 16, fontVariantNumeric: "tabular-nums" }}>₹4,82,300</p>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>Net worth · 4 accounts</p>
          <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06, marginBottom: 2 }}>Income</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "var(--green)", fontVariantNumeric: "tabular-nums" }}>₹75,000</p>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06, marginBottom: 2 }}>Expense</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "var(--red)", fontVariantNumeric: "tabular-nums" }}>₹42,300</p>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06, marginBottom: 2 }}>Saved</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "var(--green)", fontVariantNumeric: "tabular-nums" }}>₹32,700</p>
            </div>
          </div>
          <div style={{ height: 6, background: "var(--card)", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "56%", background: "var(--green)", borderRadius: 6 }} />
          </div>
          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>56% budget used · ₹33,200 left</p>
        </div>
      </section>

      {/* ── WHY ── */}
      <section id="features" style={{ padding: "100px 48px", maxWidth: 1100, margin: "0 auto" }} className="lp-why">
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--green)", marginBottom: 48, textTransform: "uppercase", letterSpacing: 0.1 }}>Why casha.</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {[
            { n: "01", title: "Every rupee, tracked.", desc: "Paste a bank SMS. Transaction created. Works with every Indian bank — SBI, HDFC, ICICI, Axis, Kotak, UPI, GPay, PhonePe. No manual entry needed." },
            { n: "02", title: "AI that knows your money.", desc: "Not generic advice. Your personal CFO that sees your actual transactions and tells you exactly what to do. Move ₹33,750 to your loan. Debt-free 14 months early." },
            { n: "03", title: "Built for India.", desc: "Old vs New tax regime compared live. 80C, 80D, HRA, NPS tracked. SMS parser for all Indian banks. ₹42,000 average tax saved per year." },
          ].map(function (s) {
            return (
              <div key={s.n} style={{ display: "flex", gap: 32, alignItems: "start" }} className="lp-why-item">
                <span style={{ fontSize: 40, fontWeight: 800, color: "var(--border-light)", letterSpacing: -1, lineHeight: 1, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{s.n}</span>
                <div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: "0 0 8px 0", letterSpacing: -0.3, fontFamily: "Georgia, 'Times New Roman', serif" }}>{s.title}</h3>
                  <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0, maxWidth: 520 }}>{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SMS DEMO ── */}
      <section style={{ padding: "100px 48px", maxWidth: 1100, margin: "0 auto" }} className="lp-sms">
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--green)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.1 }}>Try it</h2>
        <h3 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 8, letterSpacing: -0.5, fontFamily: "Georgia, 'Times New Roman', serif" }}>Paste a bank SMS.</h3>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 32, lineHeight: 1.6 }}>Watch the magic. Works with every Indian bank.</p>
        <SmsDemo />
      </section>

      {/* ── BUDGET DEMO ── */}
      <section style={{ padding: "100px 48px", maxWidth: 1100, margin: "0 auto" }} className="lp-budget">
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--green)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.1 }}>50/30/20</h2>
        <h3 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 8, letterSpacing: -0.5, fontFamily: "Georgia, 'Times New Roman', serif" }}>Your budget, in one number.</h3>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 32, lineHeight: 1.6 }}>Enter your income. See the proven framework adapted for India.</p>
        <BudgetDemo />
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "100px 48px", maxWidth: 1100, margin: "0 auto" }} className="lp-pricing">
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--green)", marginBottom: 48, textTransform: "uppercase", letterSpacing: 0.1 }}>Pricing</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 680 }} className="lp-price2">
          {[
            {
              name: "Free", price: "₹0", period: "forever", cta: "Get started", highlight: false,
              features: ["Health score", "Unlimited transactions", "SMS parser — all banks", "Budget AI", "Tax optimizer", "AI advisor — 10/day"],
            },
            {
              name: "Plus", price: "₹149", period: "/month", cta: "Start free trial", highlight: true,
              features: ["Everything in Free", "Unlimited AI advisor", "Investment tracker", "Retirement planner", "WhatsApp alerts", "Tax reports PDF"],
            },
          ].map(function (p) {
            return (
              <div key={p.name} style={{
                padding: "32px 28px", borderRadius: 16,
                background: p.highlight ? "var(--surface)" : "transparent",
                border: "1px solid " + (p.highlight ? "var(--green-border)" : "var(--border)"),
                boxShadow: p.highlight ? "var(--shadow-md)" : "none",
              }}>
                {p.highlight && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--green)", textTransform: "uppercase", letterSpacing: 0.08, marginBottom: 12, display: "block" }}>Popular</span>}
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", margin: "0 0 4px" }}>{p.name}</h3>
                <p style={{ margin: "0 0 24px" }}><span style={{ fontSize: 30, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5, fontVariantNumeric: "tabular-nums" }}>{p.price}</span><span style={{ fontSize: 13, color: "var(--muted)", marginLeft: 4 }}>{p.period}</span></p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
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
                  display: "block", textAlign: "center", padding: "11px 0", borderRadius: 10,
                  background: p.highlight ? "var(--green)" : "transparent",
                  color: p.highlight ? "#FFF" : "var(--text)",
                  border: p.highlight ? "none" : "1px solid var(--border)",
                  fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "all 150ms ease",
                }}
                  onMouseEnter={function (e) { if (p.highlight) { e.currentTarget.style.background = "var(--green-soft)"; } else { e.currentTarget.style.background = "var(--surface)"; } }}
                  onMouseLeave={function (e) { if (p.highlight) { e.currentTarget.style.background = "var(--green)"; } else { e.currentTarget.style.background = "transparent"; } }}>{p.cta}</Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "120px 48px", maxWidth: 1100, margin: "0 auto", textAlign: "center" }} className="lp-cta">
        <h2 style={{ fontSize: 44, fontWeight: 700, color: "var(--text)", letterSpacing: -1.5, margin: "0 0 12px 0", fontFamily: "Georgia, 'Times New Roman', serif" }}>Start today.</h2>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", margin: "0 0 32px 0" }}>Free forever. Your data stays yours.</p>
        <Link href="/auth" style={{ display: "inline-block", padding: "14px 40px", borderRadius: 12, background: "var(--green)", color: "#FFF", fontSize: 15, fontWeight: 700, textDecoration: "none", transition: "all 200ms ease", boxShadow: "var(--shadow-md)" }}
          onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green-soft)"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
          onMouseLeave={function (e) { e.currentTarget.style.background = "var(--green)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}>
          Get started free
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "28px 48px", maxWidth: 1100, margin: "0 auto" }} className="lp-footer">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 24 }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: "0 0 6px 0", letterSpacing: -0.5 }}>casha<span style={{ color: "var(--green)" }}>.</span></p>
            <p style={{ fontSize: 11, color: "var(--faint)", margin: 0, maxWidth: 280, lineHeight: 1.5 }}>Financial education platform. Not a SEBI-registered advisor. Consult a qualified CA before financial decisions.</p>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Link href="/legal/privacy" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none", transition: "color 150ms ease" }}
                onMouseEnter={function (e) { e.currentTarget.style.color = "var(--text-secondary)"; }}
                onMouseLeave={function (e) { e.currentTarget.style.color = "var(--muted)"; }}>Privacy</Link>
              <Link href="/legal/terms" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none", transition: "color 150ms ease" }}
                onMouseEnter={function (e) { e.currentTarget.style.color = "var(--text-secondary)"; }}
                onMouseLeave={function (e) { e.currentTarget.style.color = "var(--muted)"; }}>Terms</Link>
              <Link href="/legal/cookies" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none", transition: "color 150ms ease" }}
                onMouseEnter={function (e) { e.currentTarget.style.color = "var(--text-secondary)"; }}
                onMouseLeave={function (e) { e.currentTarget.style.color = "var(--muted)"; }}>Cookies</Link>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--faint)" }}>© 2025 Casha Money Technologies Pvt. Ltd.</span>
          <span style={{ fontSize: 11, color: "var(--faint)" }}>Made in India</span>
        </div>
      </footer>

      {/* ── RESPONSIVE ── */}
      <style>{`
        @media (max-width: 768px) {
          .lp-nav { padding: 0 20px !important; }
          .lp-hero { padding: 130px 20px 80px !important; }
          .lp-hero h1 { font-size: 40px !important; letter-spacing: -1.2 !important; }
          .lp-preview { padding: 0 20px 80px !important; }
          .lp-preview > div { padding: 28px 24px !important; }
          .lp-why, .lp-sms, .lp-budget, .lp-pricing, .lp-cta { padding: 80px 20px !important; }
          .lp-why-item { flex-direction: column !important; gap: 12px !important; }
          .lp-why-item span { font-size: 28px !important; }
          .lp-sms-grid { grid-template-columns: 1fr !important; }
          .lp-price2 { grid-template-columns: 1fr !important; }
          .lp-cta h2 { font-size: 32px !important; }
          .lp-footer { padding: 24px 20px !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .lp-hero h1 { font-size: 52px !important; }
          .lp-sms-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}