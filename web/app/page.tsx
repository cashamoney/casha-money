"use client";
import { useState, useEffect, useRef } from "react";

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: 0.08 });
    o.observe(el); return () => o.disconnect();
  }, []);
  return { ref, v };
}

function Fade({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, v } = useFadeIn();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(20px)", transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

function WaitlistForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [pos, setPos] = useState(0);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || state !== "idle") return;
    setState("loading");
    try {
      const r = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const d = await r.json(); setPos(d.position || 1); setState("done");
    } catch { setState("idle"); }
  };
  if (state === "done") return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", background: dark ? "rgba(34,197,94,0.1)" : "#F0FDF4", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "12px", padding: "14px 20px" }}>
      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      </div>
      <div>
        <p style={{ fontSize: "14px", fontWeight: "700", color: dark ? "#4ADE80" : "#166534", margin: "0 0 2px 0" }}>You are #{pos} on the waitlist</p>
        <p style={{ fontSize: "12px", color: dark ? "rgba(74,222,128,0.7)" : "#16A34A", margin: 0 }}>We will email you when Casha launches.</p>
      </div>
    </div>
  );
  return (
    <form onSubmit={submit} style={{ display: "flex", gap: "8px", width: "100%", maxWidth: "440px" }}>
      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" disabled={state === "loading"}
        style={{ flex: 1, height: "50px", borderRadius: "11px", padding: "0 18px", fontSize: "15px", outline: "none", fontFamily: "inherit", background: dark ? "rgba(255,255,255,0.07)" : "#fff", border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #D1D5DB", color: dark ? "#fff" : "#0A0A0A" }} />
      <button type="submit" disabled={state === "loading"} style={{ height: "50px", padding: "0 22px", borderRadius: "11px", border: "none", background: "#22C55E", color: "#fff", fontSize: "15px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(34,197,94,0.3)", opacity: state === "loading" ? 0.8 : 1 }}>
        {state === "loading" ? "Joining..." : "Get early access"}
      </button>
    </form>
  );
}

const Chk = ({ c = "#22C55E", s = 15 }: { c?: string; s?: number }) => (
  <svg width={s} height={s} fill="none" stroke={c} strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
);
const Xmk = ({ s = 15 }: { s?: number }) => (
  <svg width={s} height={s} fill="none" stroke="#EF4444" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
);

const G = "#22C55E";

export default function Home() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const T = { black: "#0A0A0A", white: "#FFFFFF", green: G, text: "#18181B", muted: "#71717A", faint: "#A1A1AA", border: "#E4E4E7", surface: "#F9FAFB", card: "#FFFFFF" };
  const W: React.CSSProperties = { maxWidth: "1080px", margin: "0 auto", padding: "88px 24px" };
  const H2: React.CSSProperties = { fontSize: "clamp(26px, 3.8vw, 44px)", fontWeight: "800", color: T.text, letterSpacing: "-0.03em", lineHeight: "1.1", margin: "0 0 14px 0" };
  const LBL = (light = false): React.CSSProperties => ({ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: light ? "rgba(34,197,94,0.75)" : T.green, margin: "0 0 12px 0", display: "block" });
  const BODY: React.CSSProperties = { fontSize: "17px", color: T.muted, lineHeight: "1.7", margin: "0 0 36px 0" };
  const CARD: React.CSSProperties = { background: T.card, border: `1px solid ${T.border}`, borderRadius: "14px", padding: "26px" };

  const features = [
    { tag: "AI Advisor", h: "Your personal CFO. Always available.", p: "Ask anything about your money. Get specific answers based on your actual transactions — not generic advice.", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>, code: `Casha AI  —  20 Apr 2026\n\nSavings rate: 65% (target: 20% exceeded)\n\nAction: Redirect Rs.33,750/month\nto HDFC loan. Debt-free 14 months\nearly. Interest saved: Rs.28,400` },
    { tag: "Tax Genius", h: "Stop overpaying taxes. Every year.", p: "Compares Old vs New regime in real time. Tracks 80C, 80D, HRA, NPS deductions. Shows your exact savings before filing.", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>, code: `FY 2025-26  —  Tax Analysis\n\nOld Regime saves Rs.42,000 vs New.\n80C remaining: Rs.94,000 of Rs.1.5L\n\nAction: Invest in ELSS before 31 Mar\nEstimated saving: Rs.42,000` },
    { tag: "Debt Destroyer", h: "See your debt-free date. Today.", p: "Add your loans and credit cards. Casha calculates the optimal payoff order and shows your exact debt-free date.", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, code: `Avalanche strategy\n\n1. HDFC Credit Card  43% APR\n   Pay Rs.8,000/month\n2. SBI Personal Loan  14% APR\n   Continue minimum\n\nDebt-free: March 2027\nSaved: Rs.28,400 in interest` },
    { tag: "SMS Parser", h: "Paste bank SMS. Transaction created.", p: "Works with every Indian bank. Paste any message — amount, merchant, and category extracted in one second.", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>, code: `HDFC SMS input:\nRs.2,500.00 debited from A/c XX1234\non 19-04-26. Info: Swiggy.\n\nParsed:\nAmount    Rs.2,500\nMerchant  Swiggy\nCategory  Food Delivery\nDate      19 Apr 2026` },
    { tag: "Budget AI", h: "AI builds your budget. One click.", p: "Based on your income and the India-adapted 50/30/20 rule, Casha generates a complete monthly budget automatically.", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>, code: `Budget  —  April 2026\nIncome: Rs.75,000/month\n\nNeeds   50%  Rs.37,500\n  Housing + EMI + Groceries\nWants   30%  Rs.22,500\n  Dining + Shopping + Travel\nSavings 20%  Rs.15,000\n  SIP + PPF + Emergency Fund` },
    { tag: "Subscriptions", h: "Find money you forgot you were spending.", p: "Automatically detects every active subscription from your transactions — even ones completely forgotten.", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>, code: `Detected  —  April 2026\n\nNetflix       Rs.499/month\nHotstar       Rs.299/month\nSpotify       Rs.119/month\nGym (unused)  Rs.1,999/month\n\nMonthly waste:  Rs.2,916\nAnnually:       Rs.34,992` },
  ];

  const rule = [
    { pct: "50", label: "Needs", color: "#16A34A", bg: "rgba(22,163,74,0.08)", border: "rgba(22,163,74,0.15)", amount: "Rs.37,500", items: ["Housing & Rent", "Groceries", "EMI Payments", "Insurance", "Utilities", "Transport"] },
    { pct: "30", label: "Wants", color: "#22C55E", bg: "rgba(34,197,94,0.07)", border: "rgba(34,197,94,0.14)", amount: "Rs.22,500", items: ["Dining & Delivery", "Shopping", "Entertainment", "Subscriptions", "Travel", "Personal Care"] },
    { pct: "20", label: "Savings", color: "#4ADE80", bg: "rgba(74,222,128,0.06)", border: "rgba(74,222,128,0.12)", amount: "Rs.15,000", items: ["Emergency Fund", "SIP & Mutual Funds", "PPF & NPS", "ELSS (Tax Saving)", "Fixed Deposit", "Gold"] },
  ];

  const compare = [
    { f: "Works with existing bank account", v: [true, true, false, true] },
    { f: "India Tax Optimizer (80C, 80D, HRA)", v: [true, false, false, false] },
    { f: "Old vs New regime comparison", v: [true, false, false, false] },
    { f: "SMS Parser — all Indian banks", v: [true, false, false, false] },
    { f: "AI CFO with your real data", v: [true, false, false, false] },
    { f: "Subscription auto-detection", v: [true, false, false, false] },
    { f: "Debt payoff optimizer", v: [true, false, false, true] },
    { f: "50/30/20 budget AI", v: [true, false, false, false] },
    { f: "Free plan, no credit card", v: [true, true, false, false] },
  ];

  const plans = [
    { name: "Free", price: "Rs.0", sub: "Forever, no credit card", highlight: false, badge: null, features: ["Financial health score", "Unlimited transactions", "SMS Parser — all banks", "Budget AI (50/30/20)", "Debt payoff planner", "Savings goals", "India tax optimizer", "AI Advisor — 10/day", "Subscription detector"], cta: "Create free account", href: "/auth/signup" },
    { name: "Plus", price: "Rs.149", sub: "Per month, cancel anytime", highlight: true, badge: "Most popular", features: ["Everything in Free", "Unlimited AI Advisor", "Investment tracker", "Retirement planner", "Insurance tracker", "WhatsApp alerts", "Tax reports PDF", "Priority support"], cta: "Start free trial", href: "/auth/signup" },
    { name: "Business", price: "Rs.499", sub: "Per month, for teams", highlight: false, badge: null, features: ["Everything in Plus", "GST invoice generator", "Cash flow forecasting", "P&L statements", "Client management", "Team access (5 users)", "Tally / QuickBooks sync", "Dedicated support"], cta: "Contact us", href: "mailto:casha.moneyofficial@gmail.com" },
  ];

  const testimonials = [
    { text: "Found Rs.2,916/month in forgotten subscriptions. Tax optimizer found Rs.38,000 in deductions my CA had missed for two years.", name: "Rahul Mehta", role: "Software Engineer, Bangalore" },
    { text: "SMS parser is the best feature in any Indian finance app. Transactions appear with the right category every single time.", name: "Priya Sharma", role: "Marketing Manager, Mumbai" },
    { text: "Switched to Old Regime after Casha's analysis. Invested in ELSS. Saved Rs.42,000 in taxes. My CA confirmed everything.", name: "Arun Kumar", role: "Startup Founder, Hyderabad" },
  ];

  const faqs = [
    { q: "Is the free plan actually free — forever?", a: "Yes. No credit card, no trial expiry, no hidden charges. The free plan includes transaction tracking, tax optimizer, debt planner, budget AI, and 10 AI questions per day — permanently." },
    { q: "How does Casha access my bank transactions?", a: "It does not access your bank directly. You add transactions by pasting bank SMS messages — works with all Indian banks — or by entering manually. We never ask for your internet banking password or OTP." },
    { q: "Is my financial data safe?", a: "We use AES-256 encryption, the same standard used by SBI and HDFC. Each user's data is completely isolated. We never sell your data to any third party." },
    { q: "Which banks does the SMS Parser support?", a: "All major Indian banks — SBI, HDFC, ICICI, Axis, Kotak, PNB, Bank of Baroda, Canara, IndusInd, Yes Bank — and UPI apps including Google Pay, PhonePe, Paytm, and BHIM." },
    { q: "What is the 50/30/20 rule and how does Casha use it?", a: "50% of income goes to needs (rent, EMI, groceries), 30% to wants (dining, shopping, entertainment), and 20% to savings and investments. Casha generates your budget automatically from your actual income with one click." },
    { q: "How is Casha different from CRED or Jupiter?", a: "CRED works only with credit cards. Jupiter requires a new bank account. Casha works with all your existing accounts across every Indian bank, covers your complete financial life, and provides an AI advisor — all free." },
    { q: "Is Casha a registered financial advisor?", a: "No. Casha is a financial education platform, not a SEBI-registered advisor or licensed tax professional. All AI recommendations are educational only. Please consult a qualified CA before making significant financial decisions." },
  ];

  // ── Logo component used everywhere ──
  const CashaLogo = ({ size = 32, textSize = 17, light = false }: { size?: number; textSize?: number; light?: boolean }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
      <img
        src="/logo.png"
        alt="Casha"
        style={{ width: `${size}px`, height: `${size}px`, objectFit: "contain", flexShrink: 0 }}
      />
      <span style={{ fontSize: `${textSize}px`, fontWeight: "800", color: light ? "#fff" : T.black, letterSpacing: "-0.03em" }}>
        casha<span style={{ color: T.green }}>.money</span>
      </span>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', 'Helvetica Neue', system-ui, sans-serif", background: T.white, color: T.text, overflowX: "hidden" }}>

      {/* NAV */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 999, height: "62px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", background: scrolled ? "rgba(255,255,255,0.96)" : "transparent", backdropFilter: scrolled ? "blur(16px)" : "none", borderBottom: scrolled ? `1px solid ${T.border}` : "none", transition: "all 0.25s" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <CashaLogo size={32} textSize={17} />
        </a>
        <nav style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          {[["Features", "#features"], ["50/30/20", "#rule"], ["Pricing", "#pricing"], ["FAQ", "#faq"]].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: "14px", color: T.muted, textDecoration: "none", fontWeight: "500" }}
              onMouseEnter={e => e.currentTarget.style.color = T.text}
              onMouseLeave={e => e.currentTarget.style.color = T.muted}>{l}</a>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/auth/login" style={{ fontSize: "14px", color: T.muted, textDecoration: "none", fontWeight: "500" }}>Sign in</a>
          <a href="/auth/signup" style={{ fontSize: "14px", fontWeight: "700", padding: "9px 20px", borderRadius: "10px", textDecoration: "none", background: T.black, color: T.white }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            Get started free
          </a>
        </div>
      </header>

      {/* HERO */}
      <section style={{ paddingTop: "140px", paddingBottom: "80px", paddingLeft: "24px", paddingRight: "24px", textAlign: "center" }}>
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "999px", padding: "6px 16px", marginBottom: "28px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: T.green, display: "inline-block", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#166534" }}>618+ people on the early access list</span>
          </div>

          <h1 style={{ fontSize: "clamp(44px, 7vw, 82px)", fontWeight: "800", color: T.black, letterSpacing: "-0.04em", lineHeight: "1.03", margin: "0 0 20px 0" }}>
            Your money,<br />
            <span style={{ display: "inline-block", color: T.green, fontStyle: "italic" }}>finally</span>
            {" "}<span style={{ color: T.black }}>making sense.</span>
          </h1>

          <p style={{ fontSize: "19px", color: T.muted, lineHeight: "1.65", maxWidth: "500px", margin: "0 auto 36px" }}>
            Track every rupee, destroy debt, save{" "}
            <strong style={{ color: T.text }}>Rs.20,000–50,000 in taxes</strong>
            {" "}annually, and get an AI financial advisor — free, forever.
          </p>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
            <WaitlistForm />
          </div>
          <p style={{ fontSize: "13px", color: T.faint, margin: "0 0 52px" }}>
            Free forever — no credit card — works with all Indian banks
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "18px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", color: "#CBD5E1", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase" }}>Works with</span>
            {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "UPI", "GPay", "PhonePe"].map(b => (
              <span key={b} style={{ fontSize: "13px", color: "#94A3B8", fontWeight: "600" }}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* APP PREVIEW */}
      <section style={{ padding: "0 24px 88px", maxWidth: "960px", margin: "0 auto" }}>
        <Fade>
          <div style={{ border: `1px solid ${T.border}`, borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.08)" }}>
            <div style={{ background: "#F4F4F5", borderBottom: `1px solid ${T.border}`, padding: "10px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ display: "flex", gap: "5px" }}>
                {["#FC5D57", "#FDBC40", "#33C948"].map(c => <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />)}
              </div>
              <div style={{ flex: 1, background: T.white, borderRadius: "6px", padding: "4px 12px", maxWidth: "190px", margin: "0 auto", display: "flex", alignItems: "center", gap: "5px" }}>
                <svg width="9" height="9" fill="none" stroke={T.green} strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <span style={{ fontSize: "11px", color: "#94A3B8" }}>app.casha.money</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "188px 1fr" }}>
              <div style={{ background: T.white, borderRight: `1px solid ${T.border}`, padding: "16px 10px" }}>
                {/* Sidebar logo — uses real logo */}
                <div style={{ padding: "0 6px", marginBottom: "20px" }}>
                  <CashaLogo size={22} textSize={13} />
                </div>
                {["Overview", "Transactions", "Budget", "Debts", "Tax Genius", "AI Advisor", "Settings"].map((n, i) => (
                  <div key={n} style={{ padding: "8px 10px", borderRadius: "7px", marginBottom: "1px", background: i === 0 ? "#F4F4F5" : "transparent", fontSize: "13px", color: i === 0 ? T.black : T.faint, fontWeight: i === 0 ? "600" : "400" }}>{n}</div>
                ))}
              </div>
              <div style={{ background: T.surface, padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                  <div>
                    <p style={{ fontSize: "11px", color: T.faint, margin: "0 0 3px 0" }}>Sunday, 20 April 2026</p>
                    <p style={{ fontSize: "17px", fontWeight: "700", color: T.black, margin: 0, letterSpacing: "-0.02em" }}>Good afternoon, Rahul</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "999px", padding: "4px 10px" }}>
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: T.green }} />
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#166534" }}>AI Active</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "9px", marginBottom: "10px" }}>
                  {[
                    { l: "Health Score", v: "800", s: "Excellent — top 10%", dark: true, vc: T.green },
                    { l: "Net Worth", v: "Rs.1,40,000", s: "+Rs.15,000 this month", dark: false },
                    { l: "Savings Rate", v: "65%", s: "Target: 20% — exceeded", dark: false },
                  ].map((m, i) => (
                    <div key={i} style={{ background: m.dark ? T.black : T.white, border: m.dark ? "none" : `1px solid ${T.border}`, borderRadius: "11px", padding: "12px" }}>
                      <p style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", color: m.dark ? "rgba(255,255,255,0.3)" : T.faint, margin: "0 0 5px 0" }}>{m.l}</p>
                      <p style={{ fontSize: m.dark ? "22px" : "17px", fontWeight: "800", color: m.dark ? m.vc : T.text, margin: "0 0 2px 0", letterSpacing: "-0.02em" }}>{m.v}</p>
                      <p style={{ fontSize: "10px", color: m.dark ? "rgba(255,255,255,0.28)" : T.muted, margin: 0 }}>{m.s}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "12px 14px", marginBottom: "9px" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: T.black, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="13" height="13" fill="none" stroke={T.green} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: "12px", fontWeight: "700", color: T.black, margin: "0 0 3px 0" }}>AI found Rs.42,000 in tax savings</p>
                      <p style={{ fontSize: "11px", color: T.muted, margin: 0, lineHeight: "1.5" }}>Switch to Old Regime + invest in ELSS before 31 March. 80C has Rs.94,000 remaining.</p>
                    </div>
                  </div>
                </div>
                <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ padding: "9px 13px", borderBottom: `1px solid ${T.border}` }}>
                    <p style={{ fontSize: "10px", fontWeight: "700", color: T.faint, margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>Recent transactions</p>
                  </div>
                  {[{ n: "Company Salary", c: "Salary", a: "+Rs.75,000", pos: true }, { n: "HDFC Home Loan EMI", c: "EMI Payment", a: "-Rs.15,000", pos: false }, { n: "Swiggy", c: "Food Delivery", a: "-Rs.2,500", pos: false }].map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 13px", borderBottom: i < 2 ? `1px solid ${T.border}` : "none" }}>
                      <div>
                        <p style={{ fontSize: "12px", fontWeight: "600", color: T.black, margin: "0 0 1px 0" }}>{t.n}</p>
                        <p style={{ fontSize: "11px", color: T.faint, margin: 0 }}>{t.c}</p>
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: t.pos ? "#16A34A" : T.text }}>{t.a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Fade>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ background: T.surface, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "44px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", textAlign: "center" }}>
            {[
              { n: "618+", l: "Early members" },
              { n: "Rs.2,400", l: "Avg. monthly waste" },
              { n: "Rs.42,000", l: "Avg. tax saved/year" },
              { n: "18+", l: "Countries" },
              { n: "Free", l: "Core plan, forever" },
            ].map((s, i) => (
              <Fade key={i} delay={i * 0.06}>
                <div style={{ padding: "14px 10px", borderRight: i < 4 ? `1px solid ${T.border}` : "none" }}>
                  <p style={{ fontSize: "clamp(18px, 2.2vw, 26px)", fontWeight: "800", color: T.black, margin: "0 0 5px 0", letterSpacing: "-0.02em" }}>{s.n}</p>
                  <p style={{ fontSize: "12px", color: T.muted, margin: 0, lineHeight: "1.3" }}>{s.l}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ background: T.white }}>
        <div style={W}>
          <Fade>
            <div style={{ textAlign: "center", maxWidth: "540px", margin: "0 auto 48px" }}>
              <span style={LBL()}>The problem</span>
              <h2 style={H2}>Most people lose money every month without realising it.</h2>
              <p style={{ fontSize: "17px", color: T.muted, lineHeight: "1.7", margin: 0 }}>Not from reckless spending — from missing deductions, forgotten subscriptions, and zero visibility.</p>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            {[
              { n: "78%", t: "of salaried Indians have no monthly budget", s: "RBI Survey 2024" },
              { n: "Rs.1.2L", t: "average annual tax overpayment", s: "Income Tax Dept. 2024" },
              { n: "Rs.2,400", t: "wasted monthly on forgotten subscriptions", s: "Casha research" },
              { n: "68%", t: "not on track for retirement at 60", s: "PFRDA Report 2024" },
            ].map((p, i) => (
              <Fade key={i} delay={i * 0.07}>
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "14px", padding: "24px" }}>
                  <p style={{ fontSize: "32px", fontWeight: "800", color: T.black, margin: "0 0 10px 0", letterSpacing: "-0.02em", lineHeight: 1 }}>{p.n}</p>
                  <p style={{ fontSize: "14px", color: "#374151", margin: "0 0 8px 0", lineHeight: "1.45", fontWeight: "500" }}>{p.t}</p>
                  <p style={{ fontSize: "11px", color: T.faint, margin: 0 }}>{p.s}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* 50/30/20 */}
      <section id="rule" style={{ background: T.black }}>
        <div style={W}>
          <Fade>
            <div style={{ textAlign: "center", maxWidth: "540px", margin: "0 auto 48px" }}>
              <span style={LBL(true)}>Built-in framework</span>
              <h2 style={{ ...H2, color: T.white }}>The 50/30/20 rule —<br />adapted for India.</h2>
              <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", lineHeight: "1.7", margin: 0 }}>
                The most proven budgeting framework, tuned for Indian salaries and tax laws. Applied automatically.
              </p>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "28px" }}>
            {rule.map((r, i) => (
              <Fade key={i} delay={i * 0.09}>
                <div style={{ background: r.bg, border: `1px solid ${r.border}`, borderRadius: "14px", padding: "26px" }}>
                  <div style={{ marginBottom: "10px" }}>
                    <span style={{ fontSize: "48px", fontWeight: "800", color: r.color, letterSpacing: "-0.04em", lineHeight: 1 }}>{r.pct}</span>
                    <span style={{ fontSize: "20px", fontWeight: "800", color: r.color }}>%</span>
                  </div>
                  <p style={{ fontSize: "16px", fontWeight: "700", color: T.white, margin: "0 0 4px 0" }}>{r.label}</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: "0 0 16px 0" }}>
                    On Rs.75K: <strong style={{ color: r.color }}>{r.amount}</strong>
                  </p>
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "14px" }} />
                  {r.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
                      <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </Fade>
            ))}
          </div>
          <Fade delay={0.25}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "26px 30px" }}>
              <p style={{ fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.28)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 18px 0" }}>Income: Rs.75,000/month</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0" }}>
                {rule.map((r, i) => (
                  <div key={i} style={{ paddingRight: i < 2 ? "24px" : "0", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none", paddingLeft: i > 0 ? "24px" : "0" }}>
                    <p style={{ fontSize: "11px", fontWeight: "700", color: r.color, letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 6px 0" }}>{r.label} — {r.pct}%</p>
                    <p style={{ fontSize: "24px", fontWeight: "800", color: T.white, margin: "0 0 3px 0", letterSpacing: "-0.02em" }}>{r.amount}</p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", margin: 0 }}>per month</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.18)", margin: "18px 0 0 0", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px" }}>
                Casha generates this budget automatically from your actual income — one click, no manual work.
              </p>
            </div>
          </Fade>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ background: T.white }}>
        <div style={W}>
          <Fade>
            <span style={LBL()}>Features</span>
            <h2 style={{ ...H2, maxWidth: "480px" }}>Everything your finances need. Nothing they do not.</h2>
            <p style={{ ...BODY, maxWidth: "440px" }}>What a Rs.30 lakh/year CFO does — automated, AI-powered, free.</p>
          </Fade>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {features.map((f, i) => {
              const flip = i % 2 !== 0;
              return (
                <Fade key={i} delay={0.04}>
                  <div style={{ ...CARD, padding: "40px 44px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }}>
                    <div style={{ order: flip ? 2 : 1 }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", marginBottom: "14px" }}>
                        <div style={{ color: T.green }}>{f.icon}</div>
                        <span style={LBL()}>{f.tag}</span>
                      </div>
                      <h3 style={{ fontSize: "21px", fontWeight: "800", color: T.black, margin: "0 0 12px 0", letterSpacing: "-0.02em", lineHeight: "1.2" }}>{f.h}</h3>
                      <p style={{ fontSize: "15px", color: T.muted, margin: 0, lineHeight: "1.7" }}>{f.p}</p>
                    </div>
                    <div style={{ order: flip ? 1 : 2 }}>
                      <div style={{ background: "#18181B", borderRadius: "11px", overflow: "hidden" }}>
                        <div style={{ display: "flex", gap: "5px", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                          {["#FC5D57", "#FDBC40", "#33C948"].map(c => <div key={c} style={{ width: "9px", height: "9px", borderRadius: "50%", background: c }} />)}
                        </div>
                        <pre style={{ fontSize: "12.5px", lineHeight: "1.85", color: "rgba(255,255,255,0.6)", margin: 0, padding: "16px 18px", fontFamily: "'Courier New', Menlo, monospace", whiteSpace: "pre-wrap" }}>{f.code}</pre>
                      </div>
                    </div>
                  </div>
                </Fade>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section style={{ background: T.surface, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div style={W}>
          <Fade>
            <div style={{ textAlign: "center", maxWidth: "460px", margin: "0 auto 48px" }}>
              <span style={LBL()}>Security</span>
              <h2 style={H2}>Bank-level security. Zero compromises.</h2>
              <p style={{ fontSize: "17px", color: T.muted, lineHeight: "1.7", margin: 0 }}>Your financial data is more sensitive than your password. We treat it that way.</p>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            {[
              { l: "AES-256 Encrypted", d: "All data encrypted at rest and in transit" },
              { l: "Read-only access", d: "We cannot move or touch your money" },
              { l: "No data selling", d: "Your data is never sold — ever" },
              { l: "DPDPA Compliant", d: "India's data protection law" },
              { l: "Delete anytime", d: "Full account deletion on request" },
            ].map((b, i) => (
              <Fade key={i} delay={i * 0.06}>
                <div style={CARD}>
                  <div style={{ color: T.green, marginBottom: "10px" }}><Chk c={T.green} s={18} /></div>
                  <p style={{ fontSize: "14px", fontWeight: "700", color: T.black, margin: "0 0 5px 0" }}>{b.l}</p>
                  <p style={{ fontSize: "13px", color: T.muted, margin: 0, lineHeight: "1.5" }}>{b.d}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* COMPETITOR TABLE */}
      <section style={{ background: T.white }}>
        <div style={W}>
          <Fade>
            <div style={{ textAlign: "center", maxWidth: "480px", margin: "0 auto 48px" }}>
              <span style={LBL()}>Why Casha</span>
              <h2 style={H2}>
                Built for India.<br />
                <span style={{ color: T.green }}>Built better.</span>
              </h2>
              <p style={{ fontSize: "17px", color: T.muted, lineHeight: "1.7", margin: 0 }}>No other app covers your complete financial life for Indian users.</p>
            </div>
          </Fade>
          <Fade delay={0.1}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ border: `1px solid ${T.border}`, borderRadius: "14px", overflow: "hidden", width: "100%", maxWidth: "760px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(4, 90px)", background: T.black, padding: "13px 20px", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.28)", fontWeight: "600" }}>Feature</span>
                  {["Casha", "CRED", "Jupiter", "YNAB"].map((n, i) => (
                    <span key={n} style={{ fontSize: "13px", fontWeight: "700", color: i === 0 ? T.green : "rgba(255,255,255,0.28)", textAlign: "center" }}>{n}</span>
                  ))}
                </div>
                {compare.map((row, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr repeat(4, 90px)", padding: "12px 20px", gap: "8px", background: i % 2 === 0 ? T.white : T.surface, borderBottom: i < compare.length - 1 ? `1px solid ${T.border}` : "none", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>{row.f}</span>
                    {row.v.map((val, j) => (
                      <div key={j} style={{ display: "flex", justifyContent: "center" }}>
                        {val ? <Chk c={j === 0 ? T.green : "#9CA3AF"} s={15} /> : <Xmk s={15} />}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Fade>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: T.surface, borderTop: `1px solid ${T.border}` }}>
        <div style={W}>
          <Fade>
            <div style={{ textAlign: "center", maxWidth: "420px", margin: "0 auto 48px" }}>
              <span style={LBL()}>How it works</span>
              <h2 style={H2}>Up and running in 2 minutes.</h2>
              <p style={{ fontSize: "17px", color: T.muted, lineHeight: "1.7", margin: 0 }}>No bank account switch. No complicated setup.</p>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            {[
              { n: "01", h: "Create your account", p: "Sign up with just your email. 30 seconds. No credit card." },
              { n: "02", h: "Add your transactions", p: "Paste bank SMS — all Indian banks — or add manually." },
              { n: "03", h: "AI analyzes everything", p: "Health score, budget, tax savings — calculated instantly." },
              { n: "04", h: "Your wealth grows", p: "Follow the plan. Watch your score rise every month." },
            ].map((s, i) => (
              <Fade key={i} delay={i * 0.07}>
                <div style={CARD}>
                  <p style={{ fontSize: "32px", fontWeight: "800", color: T.border, margin: "0 0 16px 0", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.n}</p>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: T.black, margin: "0 0 8px 0" }}>{s.h}</h3>
                  <p style={{ fontSize: "13px", color: T.muted, margin: 0, lineHeight: "1.6" }}>{s.p}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ background: T.white, borderTop: `1px solid ${T.border}` }}>
        <div style={W}>
          <Fade>
            <div style={{ textAlign: "center", maxWidth: "420px", margin: "0 auto 48px" }}>
              <span style={LBL()}>Pricing</span>
              <h2 style={H2}>Simple, honest pricing.</h2>
              <p style={{ fontSize: "17px", color: T.muted, lineHeight: "1.7", margin: 0 }}>Start free. Upgrade when ready. No contracts, no surprises.</p>
            </div>
          </Fade>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", width: "100%", maxWidth: "840px" }}>
              {plans.map((plan, i) => (
                <Fade key={i} delay={i * 0.07}>
                  <div style={{ background: plan.highlight ? T.black : T.white, border: plan.highlight ? `2px solid ${T.green}` : `1px solid ${T.border}`, borderRadius: "16px", padding: "28px", display: "flex", flexDirection: "column", position: "relative" }}>
                    {plan.badge && (
                      <div style={{ position: "absolute", top: "-11px", left: "50%", transform: "translateX(-50%)", background: T.green, color: T.white, fontSize: "11px", fontWeight: "700", padding: "3px 14px", borderRadius: "999px", whiteSpace: "nowrap" }}>
                        {plan.badge}
                      </div>
                    )}
                    <p style={{ fontSize: "13px", fontWeight: "600", color: plan.highlight ? "rgba(255,255,255,0.35)" : T.muted, margin: "0 0 8px 0" }}>{plan.name}</p>
                    <p style={{ fontSize: "38px", fontWeight: "800", letterSpacing: "-0.03em", color: plan.highlight ? T.white : T.black, margin: "0 0 4px 0" }}>{plan.price}</p>
                    <p style={{ fontSize: "13px", color: plan.highlight ? "rgba(255,255,255,0.28)" : T.faint, margin: "0 0 20px 0" }}>{plan.sub}</p>
                    <div style={{ height: "1px", background: plan.highlight ? "rgba(255,255,255,0.08)" : T.border, marginBottom: "20px" }} />
                    <div style={{ flex: 1, marginBottom: "22px" }}>
                      {plan.features.map((item, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: "9px", marginBottom: "10px" }}>
                          <div style={{ marginTop: "1px", flexShrink: 0 }}><Chk c={T.green} s={14} /></div>
                          <span style={{ fontSize: "13px", color: plan.highlight ? "rgba(255,255,255,0.58)" : "#374151", lineHeight: "1.4" }}>{item}</span>
                        </div>
                      ))}
                    </div>
                    <a href={plan.href} style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: "10px", textDecoration: "none", fontWeight: "700", fontSize: "14px", fontFamily: "inherit", background: plan.highlight ? T.green : T.black, color: T.white, boxShadow: plan.highlight ? "0 4px 12px rgba(34,197,94,0.3)" : "none" }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}>{plan.cta}</a>
                    {plan.highlight && <p style={{ textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.2)", margin: "10px 0 0 0" }}>14-day free trial — cancel anytime</p>}
                  </div>
                </Fade>
              ))}
            </div>
          </div>
          <Fade delay={0.3}>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <div style={{ padding: "16px 22px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "12px", maxWidth: "840px", width: "100%" }}>
                <p style={{ fontSize: "11px", fontWeight: "700", color: T.faint, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px 0" }}>All plans include</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                  {["SSL encryption", "No data selling", "Full data export", "Delete anytime", "DPDPA compliant", "All Indian banks"].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Chk c={T.green} s={13} />
                      <span style={{ fontSize: "13px", color: T.muted }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Fade>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background: T.surface, borderTop: `1px solid ${T.border}` }}>
        <div style={W}>
          <Fade>
            <div style={{ textAlign: "center", maxWidth: "420px", margin: "0 auto 48px" }}>
              <span style={LBL()}>Real results</span>
              <h2 style={H2}>People are already saving more.</h2>
              <p style={{ fontSize: "17px", color: T.muted, lineHeight: "1.7", margin: 0 }}>Early access members from our waitlist, tested for the past month.</p>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
            {testimonials.map((t, i) => (
              <Fade key={i} delay={i * 0.07}>
                <div style={{ ...CARD, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: "2px", marginBottom: "14px" }}>
                    {[...Array(5)].map((_, j) => <svg key={j} width="13" height="13" fill="#F59E0B" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}
                  </div>
                  <p style={{ fontSize: "15px", color: "#374151", lineHeight: "1.72", margin: "0 0 22px 0", flex: 1 }}>"{t.text}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: T.muted, flexShrink: 0 }}>
                      {t.name.split(" ").map(w => w[0]).join("")}
                    </div>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: "700", color: T.black, margin: 0 }}>{t.name}</p>
                      <p style={{ fontSize: "12px", color: T.faint, margin: 0 }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ background: T.white, borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: "660px", margin: "0 auto", padding: "88px 24px" }}>
          <Fade>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <span style={LBL()}>FAQ</span>
              <h2 style={H2}>Common questions.</h2>
            </div>
          </Fade>
          <div style={{ border: `1px solid ${T.border}`, borderRadius: "14px", overflow: "hidden" }}>
            {faqs.map((item, i) => (
              <div key={i} style={{ borderBottom: i < faqs.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{ width: "100%", padding: "18px 22px", background: T.white, border: "none", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", gap: "14px", fontFamily: "inherit" }}>
                  <span style={{ fontSize: "15px", fontWeight: "600", color: T.black, lineHeight: "1.4" }}>{item.q}</span>
                  <span style={{ color: T.faint, flexShrink: 0, transform: faqOpen === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "flex" }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </button>
                {faqOpen === i && (
                  <div style={{ padding: "0 22px 18px" }}>
                    <p style={{ fontSize: "15px", color: T.muted, margin: 0, lineHeight: "1.75" }}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: T.black }}>
        <div style={{ maxWidth: "580px", margin: "0 auto", padding: "88px 24px", textAlign: "center" }}>
          <Fade>
            <h2 style={{ fontSize: "clamp(28px, 5vw, 50px)", fontWeight: "800", color: T.white, letterSpacing: "-0.03em", lineHeight: "1.1", margin: "0 0 14px 0" }}>
              Start managing your money properly.{" "}
              <span style={{ color: T.green }}>Today.</span>
            </h2>
            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.4)", lineHeight: "1.65", margin: "0 0 32px 0" }}>
              Free forever. Works with all Indian banks. Your data stays yours.
            </p>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <WaitlistForm dark />
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.18)", margin: 0 }}>
              No credit card — unsubscribe anytime — DPDPA compliant
            </p>
          </Fade>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: T.black, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "22px" }}>
            {/* Footer logo — uses real logo */}
            <CashaLogo size={28} textSize={15} light />
            <div style={{ display: "flex", gap: "22px", flexWrap: "wrap" }}>
              {[["Features", "#features"], ["50/30/20", "#rule"], ["Pricing", "#pricing"], ["FAQ", "#faq"], ["Sign in", "/auth/login"], ["Sign up", "/auth/signup"]].map(([l, h]) => (
                <a key={l} href={h} style={{ fontSize: "13px", color: "rgba(255,255,255,0.28)", textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.28)"}>{l}</a>
              ))}
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              {[
                { href: "https://twitter.com/cashamoneyai", svg: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
                { href: "https://instagram.com/cashamoneyai", svg: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg> },
                { href: "https://linkedin.com/company/cashamoney", svg: <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
              ].map((s, idx) => (
                <a key={idx} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ color: "rgba(255,255,255,0.28)", textDecoration: "none", display: "flex", alignItems: "center" }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.28)"}>{s.svg}</a>
              ))}
            </div>
          </div>
          <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", marginBottom: "20px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.18)", margin: 0 }}>2026 Casha Money Technologies Private Limited. All rights reserved.</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.1)", margin: 0, maxWidth: "480px", textAlign: "right", lineHeight: "1.55" }}>
              Financial education platform only. Not a SEBI-registered advisor or licensed tax professional. All AI recommendations are educational. Consult a qualified CA before financial decisions.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        input::placeholder { color: #9CA3AF; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @media (max-width: 900px) { nav { display: none; } }
      `}</style>
    </div>
  );
}