"use client";
import { useState, useEffect } from "react";

type FormState = "idle" | "loading" | "success";

function WaitlistForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [position, setPosition] = useState(0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || state !== "idle") return;
    setState("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setPosition(data.position || 1);
      setState("success");
    } catch {
      setState("idle");
    }
  };

  if (state === "success") {
    return (
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "12px",
        background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
        borderRadius: "12px", padding: "14px 20px",
      }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%", background: "#22C55E",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: "14px", fontWeight: "700", color: "#166534", margin: "0 0 2px 0" }}>
            You are #{position} on the waitlist
          </p>
          <p style={{ fontSize: "12px", color: "#16A34A", margin: 0 }}>
            We will email you when Casha launches.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: "8px", width: "100%", maxWidth: "440px" }}>
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email"
        disabled={state === "loading"}
        style={{
          flex: 1, height: "48px", borderRadius: "10px", padding: "0 16px",
          fontSize: "14px", outline: "none", fontFamily: "inherit",
          background: dark ? "rgba(255,255,255,0.06)" : "#fff",
          border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #D1D5DB",
          color: dark ? "#fff" : "#111827",
        }}
      />
      <button
        type="submit"
        disabled={state === "loading"}
        style={{
          height: "48px", padding: "0 20px", borderRadius: "10px", border: "none",
          background: "#22C55E", color: "#fff", fontSize: "14px", fontWeight: "600",
          cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
          opacity: state === "loading" ? 0.7 : 1,
        }}
      >
        {state === "loading" ? "Joining..." : "Get early access"}
      </button>
    </form>
  );
}

// Icon components - no emojis
const Icons = {
  check: (color = "#22C55E") => (
    <svg width="16" height="16" fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  x: () => (
    <svg width="16" height="16" fill="none" stroke="#EF4444" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  arrow: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  plus: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  brain: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  tax: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  debt: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  sms: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  budget: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  subscription: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  shield: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

export default function Home() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const features = [
    {
      icon: Icons.brain,
      tag: "AI Advisor",
      title: "Your personal CFO. Always available.",
      desc: "Ask anything about your finances and get specific answers based on your real transactions — not generic tips written for the average person.",
      example: {
        label: "Casha AI — based on your data",
        text: "Your savings rate is 65% this month. The 20% minimum is met. Redirecting the extra 45% toward your HDFC loan EMI will make you debt-free by March 2027 — 14 months early.",
      }
    },
    {
      icon: Icons.tax,
      tag: "Tax Optimizer",
      title: "Stop overpaying taxes. Every year.",
      desc: "Casha compares Old vs New regime in real time, tracks every deduction you qualify for — Section 80C, 80D, HRA, NPS — and shows exactly how much you will save.",
      example: {
        label: "Tax analysis — FY 2025-26",
        text: "Old Regime saves you Rs.42,000 vs New Regime. Invest Rs.1,50,000 in ELSS before 31 March. Your 80C limit has Rs.94,000 remaining.",
      }
    },
    {
      icon: Icons.debt,
      tag: "Debt Destroyer",
      title: "See your debt-free date. Today.",
      desc: "Add your loans and credit cards. Casha calculates the mathematically optimal payoff order — avalanche method — and shows your exact debt-free date.",
      example: {
        label: "Payoff strategy — Avalanche method",
        text: "Pay HDFC Credit Card (43% APR) first. Then SBI Personal Loan (14%). Debt-free: March 2027. Interest saved vs minimum payments: Rs.28,400.",
      }
    },
    {
      icon: Icons.sms,
      tag: "SMS Parser",
      title: "Paste bank SMS. Transaction created.",
      desc: "Works with every Indian bank — SBI, HDFC, ICICI, Axis, Kotak, and more. Paste any bank message. Amount, merchant, and category are extracted in one second.",
      example: {
        label: "Parsed from HDFC Bank SMS",
        text: "Rs.2,500.00 debited — Swiggy — Food Delivery — 19 Apr 2026\nRs.15,000.00 debited — HDFC Loan EMI — EMI Payment — 19 Apr 2026",
      }
    },
    {
      icon: Icons.budget,
      tag: "Budget AI",
      title: "AI builds your budget. One click.",
      desc: "Based on your income and the India-adapted 50/30/20 framework, Casha generates a complete monthly budget and tracks every category automatically.",
      example: {
        label: "Budget — April 2026 — Rs.75,000 income",
        text: "Needs (50%) — Rs.37,500 — Housing, EMI, Groceries\nWants (30%) — Rs.22,500 — Dining, Shopping, Entertainment\nSavings (20%) — Rs.15,000 — SIP, PPF, Emergency Fund",
      }
    },
    {
      icon: Icons.subscription,
      tag: "Subscription Tracker",
      title: "Find money you forgot you were spending.",
      desc: "Casha scans your transactions and automatically detects every active subscription — even ones you completely forgot about.",
      example: {
        label: "Subscriptions detected — April 2026",
        text: "Netflix Rs.499 + Hotstar Rs.299 + Spotify Rs.119 + Gym Rs.1,999 (unused 3 months)\nTotal: Rs.2,916/month — Rs.34,992/year",
      }
    },
  ];

  const rule = [
    { percent: "50", label: "Needs", color: "#3B82F6", amount: "Rs.37,500", items: ["Housing and Rent", "Groceries and Food", "EMI Payments", "Insurance Premiums", "Utilities and Bills", "Daily Transport"] },
    { percent: "30", label: "Wants", color: "#F59E0B", amount: "Rs.22,500", items: ["Dining and Delivery", "Shopping and Clothing", "Entertainment", "Subscriptions", "Travel and Holidays", "Personal Care"] },
    { percent: "20", label: "Savings", color: "#22C55E", amount: "Rs.15,000", items: ["Emergency Fund", "SIP and Mutual Funds", "PPF and NPS", "ELSS for Tax Saving", "Fixed Deposit", "Gold Investment"] },
  ];

  const competitors = [
    { feature: "Works with existing bank account", casha: true, cred: true, jupiter: false, ynab: true },
    { feature: "India Tax Optimizer (80C, 80D, HRA)", casha: true, cred: false, jupiter: false, ynab: false },
    { feature: "Old vs New regime comparison", casha: true, cred: false, jupiter: false, ynab: false },
    { feature: "SMS Parser for all Indian banks", casha: true, cred: false, jupiter: false, ynab: false },
    { feature: "AI CFO with your real data", casha: true, cred: false, jupiter: false, ynab: false },
    { feature: "Subscription auto-detection", casha: true, cred: false, jupiter: false, ynab: false },
    { feature: "Debt payoff optimizer", casha: true, cred: false, jupiter: false, ynab: true },
    { feature: "50/30/20 budget with AI", casha: true, cred: false, jupiter: false, ynab: false },
    { feature: "Free plan — no credit card", casha: true, cred: true, jupiter: false, ynab: false },
  ];

  const plans = [
    {
      name: "Free",
      price: "Rs.0",
      caption: "forever",
      highlight: false,
      features: ["Financial health score", "Transaction tracking", "SMS Parser — all banks", "Budget with 50/30/20 AI", "Debt payoff planner", "Savings goals", "Tax optimizer — India", "AI Advisor — 10 questions daily", "Subscription detector"],
      cta: "Create free account",
      href: "/auth/signup",
    },
    {
      name: "Plus",
      price: "Rs.149",
      caption: "per month",
      highlight: true,
      badge: "Most popular",
      features: ["Everything in Free", "Unlimited AI Advisor", "Investment portfolio tracker", "Retirement planner", "Insurance policy tracker", "WhatsApp transaction alerts", "Advanced tax reports with PDF", "Priority support"],
      cta: "Start free trial",
      href: "/auth/signup",
    },
    {
      name: "Business",
      price: "Rs.499",
      caption: "per month",
      highlight: false,
      features: ["Everything in Plus", "GST invoice generator", "Cash flow forecasting", "Profit and Loss statements", "Client management", "Team access — 5 users", "Tally and QuickBooks sync", "Dedicated account support"],
      cta: "Contact us",
      href: "mailto:casha.moneyofficial@gmail.com",
    },
  ];

  const faqs = [
    { q: "Is the free plan actually free — forever?", a: "Yes. No credit card required, no trial that expires, no hidden charges. The free plan includes everything you need to manage personal finances — transaction tracking, tax optimizer, debt planner, budget AI, and 10 AI questions per day. We earn from Plus subscribers who need advanced features." },
    { q: "How does Casha access my bank data?", a: "It does not — and that is the point. You add transactions by pasting bank SMS messages (works with all Indian banks) or entering them manually. We never ask for your internet banking password, OTP, or any credentials. Your banking login stays with you entirely." },
    { q: "Is my financial data safe?", a: "We use AES-256 encryption, the same standard used by SBI and HDFC. Each user's data is completely isolated using Row Level Security — no one else can see your transactions, not even us. We never sell your data to any third party, ever." },
    { q: "Which banks does the SMS Parser support?", a: "All major Indian banks — SBI, HDFC, ICICI, Axis, Kotak, PNB, Bank of Baroda, Canara, IndusInd, Yes Bank — and UPI apps including Google Pay, PhonePe, Paytm, and BHIM. If your bank is not listed, you can add transactions manually in seconds." },
    { q: "What is the 50/30/20 rule and how does Casha use it?", a: "The 50/30/20 rule is a proven budgeting framework: 50% of income goes to needs (rent, EMI, groceries), 30% to wants (dining, entertainment, shopping), and 20% to savings and investments. Casha adapts this for Indian income levels — accounting for higher EMI burdens and India-specific investments like PPF and ELSS — and generates your budget automatically from your income." },
    { q: "How is Casha different from CRED or Jupiter?", a: "CRED only works with credit cards and focuses on rewards — it does not help you budget, save, or plan taxes. Jupiter requires you to open a new bank account with them. Casha works with all your existing accounts across all banks, covers your complete financial life from budgeting to tax planning, and gives you an AI financial advisor — all free." },
    { q: "Can businesses use Casha?", a: "Yes. The Business plan includes GST invoice generation, cash flow forecasting, profit and loss statements, and client management. It is built for freelancers, consultants, and small business owners who need financial clarity without hiring a full-time accountant." },
  ];

  const C = {
    bg: "#fff",
    dark: "#0F172A",
    green: "#22C55E",
    blue: "#3B82F6",
    amber: "#F59E0B",
    body: "#64748B",
    border: "#E2E8F0",
    surface: "#F8FAFC",
    text: "#111827",
  };

  const sectionStyle: React.CSSProperties = {
    padding: "96px 0",
    maxWidth: "1080px",
    margin: "0 auto",
    paddingLeft: "24px",
    paddingRight: "24px",
  };

  const h2Style: React.CSSProperties = {
    fontSize: "clamp(28px, 4vw, 48px)",
    fontWeight: "800",
    color: C.dark,
    letterSpacing: "-0.03em",
    lineHeight: "1.1",
    margin: "0 0 16px 0",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: C.green,
    margin: "0 0 12px 0",
  };

  const cardStyle: React.CSSProperties = {
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: "14px",
    padding: "28px",
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: C.bg, color: C.dark, overflowX: "hidden" }}>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: "60px", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 40px",
        background: scrolled ? "rgba(255,255,255,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        transition: "all 0.2s",
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "15px", fontWeight: "800", color: C.green, fontFamily: "Georgia, serif", fontStyle: "italic" }}>c</span>
          </div>
          <span style={{ fontSize: "17px", fontWeight: "800", color: C.dark, letterSpacing: "-0.02em" }}>
            casha<span style={{ color: C.green }}>.money</span>
          </span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          {[["Features", "#features"], ["50/30/20", "#rule"], ["Pricing", "#pricing"], ["FAQ", "#faq"]].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: "14px", color: C.body, textDecoration: "none", fontWeight: "500" }}>{l}</a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/auth/login" style={{ fontSize: "14px", color: C.body, textDecoration: "none", fontWeight: "500" }}>Sign in</a>
          <a href="/auth/signup" style={{ fontSize: "14px", fontWeight: "600", padding: "9px 18px", borderRadius: "9px", textDecoration: "none", background: C.dark, color: "#fff" }}>
            Get started free
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: "130px", paddingBottom: "80px", paddingLeft: "24px", paddingRight: "24px", maxWidth: "820px", margin: "0 auto" }}>

        <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "999px", padding: "5px 14px", marginBottom: "28px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.green, display: "inline-block" }} />
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#166534" }}>618 people on the waitlist</span>
        </div>

        <h1 style={{ fontSize: "clamp(40px, 6.5vw, 80px)", fontWeight: "800", color: C.dark, letterSpacing: "-0.04em", lineHeight: "1.02", margin: "0 0 20px 0" }}>
          Your money,
          <br />
          <span style={{ color: C.green }}>finally</span> making sense.
        </h1>

        <p style={{ fontSize: "19px", color: C.body, lineHeight: "1.65", maxWidth: "520px", margin: "0 0 36px 0" }}>
          Casha tracks every rupee, destroys your debt, saves you{" "}
          <strong style={{ color: C.dark, fontWeight: "700" }}>Rs.20,000 to Rs.50,000 in taxes</strong>, and gives you an AI financial advisor — free forever.
        </p>

        <div style={{ marginBottom: "14px" }}>
          <WaitlistForm />
        </div>

        <p style={{ fontSize: "13px", color: "#9CA3AF", margin: "0 0 52px 0" }}>
          Free forever — no credit card — works with all Indian banks
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "#CBD5E1", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Works with
          </span>
          {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "UPI", "GPay", "PhonePe"].map(b => (
            <span key={b} style={{ fontSize: "13px", color: "#94A3B8", fontWeight: "600" }}>{b}</span>
          ))}
        </div>
      </section>

      {/* APP PREVIEW */}
      <section style={{ padding: "0 24px 96px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ border: `1px solid ${C.border}`, borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.08)" }}>

          {/* Browser bar */}
          <div style={{ background: "#F1F5F9", borderBottom: `1px solid ${C.border}`, padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", gap: "5px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FCA5A5" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FCD34D" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#86EFAC" }} />
            </div>
            <div style={{ flex: 1, background: C.bg, borderRadius: "6px", padding: "4px 12px", maxWidth: "200px", margin: "0 auto", display: "flex", alignItems: "center", gap: "5px" }}>
              <svg width="9" height="9" fill="none" stroke={C.green} strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span style={{ fontSize: "11px", color: "#94A3B8" }}>app.casha.money</span>
            </div>
          </div>

          {/* Dashboard */}
          <div style={{ display: "grid", gridTemplateColumns: "190px 1fr" }}>

            {/* Sidebar */}
            <div style={{ background: C.bg, borderRight: `1px solid ${C.border}`, padding: "20px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", padding: "0 6px" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: C.green, fontFamily: "Georgia, serif", fontStyle: "italic" }}>c</span>
                </div>
                <span style={{ fontSize: "13px", fontWeight: "700", color: C.dark }}>casha.money</span>
              </div>
              {[
                { name: "Overview", active: true },
                { name: "Transactions", active: false },
                { name: "Budget", active: false },
                { name: "Debts", active: false },
                { name: "Tax Genius", active: false },
                { name: "AI Advisor", active: false },
              ].map(item => (
                <div key={item.name} style={{
                  padding: "8px 10px", borderRadius: "8px", marginBottom: "1px",
                  background: item.active ? C.surface : "transparent",
                  fontSize: "13px",
                  color: item.active ? C.dark : "#9CA3AF",
                  fontWeight: item.active ? "600" : "400",
                }}>
                  {item.name}
                </div>
              ))}
            </div>

            {/* Main area */}
            <div style={{ background: C.surface, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "0 0 3px 0" }}>Sunday, 20 April 2026</p>
                  <p style={{ fontSize: "18px", fontWeight: "700", color: C.dark, margin: 0 }}>Good afternoon, Rahul</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "999px", padding: "4px 11px" }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: C.green }} />
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#166534" }}>AI Active</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "12px" }}>
                <div style={{ background: C.dark, borderRadius: "11px", padding: "14px" }}>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", margin: "0 0 6px 0", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase" }}>Health Score</p>
                  <p style={{ fontSize: "28px", fontWeight: "800", color: C.green, margin: "0 0 3px 0", letterSpacing: "-0.02em" }}>800</p>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", margin: 0 }}>Excellent — top 10%</p>
                </div>
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "11px", padding: "14px" }}>
                  <p style={{ fontSize: "10px", color: "#9CA3AF", margin: "0 0 6px 0", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase" }}>Net Worth</p>
                  <p style={{ fontSize: "20px", fontWeight: "800", color: C.dark, margin: "0 0 3px 0", letterSpacing: "-0.02em" }}>Rs.1,40,000</p>
                  <p style={{ fontSize: "10px", color: C.green, margin: 0, fontWeight: "600" }}>+Rs.15,000 this month</p>
                </div>
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "11px", padding: "14px" }}>
                  <p style={{ fontSize: "10px", color: "#9CA3AF", margin: "0 0 6px 0", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase" }}>Savings Rate</p>
                  <p style={{ fontSize: "28px", fontWeight: "800", color: C.dark, margin: "0 0 3px 0", letterSpacing: "-0.02em" }}>65%</p>
                  <p style={{ fontSize: "10px", color: C.blue, margin: 0, fontWeight: "600" }}>Target: 20% — exceeded</p>
                </div>
              </div>

              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "11px", padding: "14px", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: C.green }}>
                    {Icons.brain()}
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: "700", color: C.dark, margin: "0 0 3px 0" }}>AI found Rs.42,000 in potential tax savings</p>
                    <p style={{ fontSize: "12px", color: C.body, margin: 0, lineHeight: "1.5" }}>Switch to Old Regime and invest Rs.1,50,000 in ELSS before 31 March. Your 80C limit has Rs.94,000 remaining.</p>
                  </div>
                </div>
              </div>

              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "11px", padding: "14px" }}>
                <p style={{ fontSize: "10px", fontWeight: "700", color: "#9CA3AF", margin: "0 0 10px 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>Recent transactions</p>
                {[
                  { name: "Company Salary", cat: "Salary", amount: "+Rs.75,000", green: true },
                  { name: "HDFC Home Loan EMI", cat: "EMI Payment", amount: "-Rs.15,000", green: false },
                  { name: "Swiggy", cat: "Food Delivery", amount: "-Rs.2,500", green: false },
                ].map((t, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < 2 ? `1px solid ${C.surface}` : "none" }}>
                    <div>
                      <p style={{ fontSize: "12px", fontWeight: "600", color: C.dark, margin: "0 0 1px 0" }}>{t.name}</p>
                      <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>{t.cat}</p>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: t.green ? C.green : C.dark }}>{t.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={sectionStyle}>
          <p style={labelStyle}>The problem</p>
          <h2 style={{ ...h2Style, maxWidth: "520px" }}>
            Most people lose money every month without realising it.
          </h2>
          <p style={{ fontSize: "17px", color: C.body, lineHeight: "1.7", maxWidth: "480px", margin: "0 0 48px 0" }}>
            Not from reckless spending. From lack of visibility, missed deductions, and forgotten subscriptions.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            {[
              { stat: "78%", desc: "of salaried Indians have no monthly budget", source: "RBI Household Finance Survey 2024" },
              { stat: "Rs.1.2L", desc: "average annual tax overpayment by salaried employees", source: "Income Tax Department 2024" },
              { stat: "Rs.2,400", desc: "wasted monthly on forgotten subscriptions", source: "Casha user research" },
              { stat: "68%", desc: "of working Indians not on track for retirement at 60", source: "PFRDA Annual Report 2024" },
            ].map((p, i) => (
              <div key={i} style={cardStyle}>
                <p style={{ fontSize: "36px", fontWeight: "800", color: C.dark, margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>{p.stat}</p>
                <p style={{ fontSize: "14px", color: "#374151", margin: "0 0 10px 0", lineHeight: "1.5" }}>{p.desc}</p>
                <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0, fontWeight: "500" }}>{p.source}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 50/30/20 RULE */}
      <section id="rule" style={{ background: C.dark }}>
        <div style={sectionStyle}>
          <p style={{ ...labelStyle, color: C.green }}>Built-in framework</p>
          <h2 style={{ ...h2Style, color: "#fff", maxWidth: "520px" }}>
            The 50/30/20 rule — adapted for India.
          </h2>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", lineHeight: "1.7", maxWidth: "480px", margin: "0 0 48px 0" }}>
            The most proven budgeting framework in the world, tuned for Indian salaries, tax laws, and investment options. Casha applies it automatically from your income.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "40px" }}>
            {rule.map((r, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "28px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <span style={{ fontSize: "44px", fontWeight: "800", color: r.color, letterSpacing: "-0.03em" }}>{r.percent}</span>
                  <span style={{ fontSize: "20px", fontWeight: "800", color: r.color }}>%</span>
                </div>
                <p style={{ fontSize: "16px", fontWeight: "700", color: "#fff", margin: "0 0 4px 0" }}>{r.label}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: "0 0 18px 0" }}>Rs.75,000 income example: {r.amount}</p>
                <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "16px" }} />
                {r.items.map((item, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "8px" }}>
                    <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: "1.4" }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)", borderRadius: "14px", padding: "24px 28px" }}>
            <p style={{ fontSize: "12px", fontWeight: "700", color: C.green, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 16px 0" }}>
              Example — Rs.75,000 per month salary
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
              {rule.map((r, i) => (
                <div key={i}>
                  <p style={{ fontSize: "22px", fontWeight: "800", color: r.color, margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>{r.amount}</p>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0 }}>{r.label}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", margin: "16px 0 0 0" }}>
              Casha generates this budget automatically from your actual income — one click.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ background: C.bg }}>
        <div style={sectionStyle}>
          <p style={labelStyle}>Features</p>
          <h2 style={{ ...h2Style, maxWidth: "500px" }}>
            Everything your finances need. Nothing they do not.
          </h2>
          <p style={{ fontSize: "17px", color: C.body, lineHeight: "1.7", maxWidth: "460px", margin: "0 0 56px 0" }}>
            What a Rs.30 lakh per year CFO does — automated, AI-powered, and free.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {features.map((f, i) => {
              const isReversed = i % 2 !== 0;
              return (
                <div key={i} style={{ ...cardStyle, padding: "40px 44px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }}>
                  <div style={{ order: isReversed ? 2 : 1 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", marginBottom: "14px" }}>
                      <div style={{ color: C.green }}>{f.icon()}</div>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: C.green, letterSpacing: "0.08em", textTransform: "uppercase" }}>{f.tag}</span>
                    </div>
                    <h3 style={{ fontSize: "22px", fontWeight: "800", color: C.dark, margin: "0 0 14px 0", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
                      {f.title}
                    </h3>
                    <p style={{ fontSize: "16px", color: C.body, margin: 0, lineHeight: "1.7" }}>{f.desc}</p>
                  </div>
                  <div style={{ order: isReversed ? 1 : 2 }}>
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
                      <p style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF", margin: "0 0 12px 0", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        {f.example.label}
                      </p>
                      <p style={{ fontSize: "13px", color: "#374151", margin: 0, lineHeight: "1.7", fontFamily: "'Courier New', monospace", whiteSpace: "pre-line" }}>
                        {f.example.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMPETITOR TABLE */}
      <section style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={sectionStyle}>
          <p style={labelStyle}>Comparison</p>
          <h2 style={{ ...h2Style, maxWidth: "440px" }}>Built for India. Built better.</h2>
          <p style={{ fontSize: "17px", color: C.body, lineHeight: "1.7", maxWidth: "440px", margin: "0 0 48px 0" }}>
            No other app covers your complete financial life — especially for Indian users.
          </p>

          <div style={{ border: `1px solid ${C.border}`, borderRadius: "14px", overflow: "hidden", background: C.bg, maxWidth: "780px" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(4, 110px)", background: C.dark, padding: "14px 20px", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontWeight: "600" }}>Feature</span>
              {["Casha", "CRED", "Jupiter", "YNAB"].map((name, i) => (
                <span key={name} style={{ fontSize: "13px", fontWeight: "700", color: i === 0 ? C.green : "rgba(255,255,255,0.35)", textAlign: "center" }}>
                  {name}
                </span>
              ))}
            </div>

            {competitors.map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr repeat(4, 110px)", padding: "13px 20px", gap: "8px", background: i % 2 === 0 ? C.bg : C.surface, borderBottom: i < competitors.length - 1 ? `1px solid ${C.border}` : "none", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>{row.feature}</span>
                {[row.casha, row.cred, row.jupiter, row.ynab].map((val, j) => (
                  <div key={j} style={{ display: "flex", justifyContent: "center" }}>
                    {val ? Icons.check(j === 0 ? C.green : "#9CA3AF") : Icons.x()}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: C.bg }}>
        <div style={sectionStyle}>
          <p style={labelStyle}>How it works</p>
          <h2 style={{ ...h2Style, maxWidth: "400px" }}>Up and running in 2 minutes.</h2>
          <p style={{ fontSize: "17px", color: C.body, lineHeight: "1.7", maxWidth: "440px", margin: "0 0 48px 0" }}>
            No bank account switch. No credit card. No complicated setup.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            {[
              { n: "01", title: "Create your account", desc: "Sign up with just your email address. Takes 30 seconds. No credit card required." },
              { n: "02", title: "Add your transactions", desc: "Paste bank SMS messages — works with all Indian banks — or add transactions manually." },
              { n: "03", title: "AI analyzes everything", desc: "Health score calculated. Budget generated. Tax deductions found. Insights ready immediately." },
              { n: "04", title: "Your wealth grows", desc: "Follow the AI plan. Watch your health score rise every month. Build real wealth over time." },
            ].map((s, i) => (
              <div key={i} style={cardStyle}>
                <p style={{ fontSize: "36px", fontWeight: "800", color: C.surface, margin: "0 0 16px 0", letterSpacing: "-0.02em" }}>{s.n}</p>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: C.dark, margin: "0 0 9px 0" }}>{s.title}</h3>
                <p style={{ fontSize: "14px", color: C.body, margin: 0, lineHeight: "1.6" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}>
        <div style={sectionStyle}>
          <p style={labelStyle}>Pricing</p>
          <h2 style={{ ...h2Style, maxWidth: "380px" }}>Simple, transparent pricing.</h2>
          <p style={{ fontSize: "17px", color: C.body, lineHeight: "1.7", maxWidth: "400px", margin: "0 0 48px 0" }}>
            Start free. Upgrade when you need more. Cancel any time with no questions.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", maxWidth: "820px" }}>
            {plans.map((plan, i) => (
              <div key={i} style={{
                background: plan.highlight ? C.dark : C.bg,
                border: plan.highlight ? `2px solid ${C.green}` : `1px solid ${C.border}`,
                borderRadius: "16px", padding: "30px",
                display: "flex", flexDirection: "column",
                position: "relative"
              }}>
                {plan.badge && (
                  <div style={{ position: "absolute", top: "-11px", left: "50%", transform: "translateX(-50%)", background: C.green, color: "#fff", fontSize: "11px", fontWeight: "700", padding: "3px 14px", borderRadius: "999px", whiteSpace: "nowrap" }}>
                    {plan.badge}
                  </div>
                )}
                <p style={{ fontSize: "14px", fontWeight: "600", color: plan.highlight ? "rgba(255,255,255,0.35)" : "#9CA3AF", margin: "0 0 10px 0" }}>
                  {plan.name}
                </p>
                <p style={{ fontSize: "38px", fontWeight: "800", color: plan.highlight ? "#fff" : C.dark, margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
                  {plan.price}
                </p>
                <p style={{ fontSize: "13px", color: plan.highlight ? "rgba(255,255,255,0.3)" : "#9CA3AF", margin: "0 0 24px 0" }}>
                  {plan.caption}
                </p>
                <div style={{ flex: 1, marginBottom: "24px" }}>
                  {plan.features.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: "9px", marginBottom: "10px" }}>
                      <div style={{ marginTop: "1px", flexShrink: 0, color: C.green }}>
                        {Icons.check()}
                      </div>
                      <span style={{ fontSize: "13px", color: plan.highlight ? "rgba(255,255,255,0.6)" : "#374151", lineHeight: "1.4" }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
                <a href={plan.href} style={{
                  display: "block", textAlign: "center", padding: "13px",
                  borderRadius: "10px", textDecoration: "none", fontWeight: "600", fontSize: "14px",
                  background: plan.highlight ? C.green : C.dark, color: "#fff",
                  fontFamily: "inherit",
                }}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background: C.bg, borderTop: `1px solid ${C.border}` }}>
        <div style={sectionStyle}>
          <p style={labelStyle}>Real results</p>
          <h2 style={{ ...h2Style, maxWidth: "400px" }}>People are already saving more.</h2>
          <p style={{ fontSize: "17px", color: C.body, lineHeight: "1.7", maxWidth: "440px", margin: "0 0 48px 0" }}>
            Early users from our waitlist have been testing Casha for the past month.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
            {[
              { text: "Found Rs.2,916 per month in subscriptions I completely forgot about. Cancelled 4 apps in 10 minutes. The tax optimizer then found another Rs.38,000 in deductions I was missing.", name: "Rahul M.", role: "Software Engineer, Bangalore" },
              { text: "The SMS parser is genuinely impressive. I paste bank messages and transactions appear instantly with the right category. My Casha balance and bank balance match to the rupee every single day.", name: "Priya S.", role: "Marketing Manager, Mumbai" },
              { text: "Switched from New to Old tax regime after Casha showed me the analysis. Invested Rs.1.5 lakh in ELSS. Saved Rs.42,000 in taxes. My CA reviewed it and confirmed everything was correct.", name: "Arun K.", role: "Startup Founder, Hyderabad" },
            ].map((t, i) => (
              <div key={i} style={cardStyle}>
                <div style={{ display: "flex", gap: "2px", marginBottom: "14px" }}>
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} width="14" height="14" fill="#F59E0B" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize: "15px", color: "#374151", lineHeight: "1.75", margin: "0 0 22px 0" }}>
                  "{t.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: C.surface, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#64748B" }}>
                    {t.name.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: C.dark, margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}>
        <div style={{ ...sectionStyle, maxWidth: "680px" }}>
          <p style={labelStyle}>FAQ</p>
          <h2 style={{ ...h2Style, maxWidth: "380px", marginBottom: "40px" }}>Common questions.</h2>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: "14px", overflow: "hidden", background: C.bg }}>
            {faqs.map((item, i) => (
              <div key={i} style={{ borderBottom: i < faqs.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{ width: "100%", padding: "18px 22px", background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", gap: "16px", fontFamily: "inherit" }}
                >
                  <span style={{ fontSize: "15px", fontWeight: "600", color: C.dark, lineHeight: "1.4" }}>
                    {item.q}
                  </span>
                  <div style={{ width: "20px", height: "20px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: faqOpen === i ? "rotate(45deg)" : "none", transition: "transform 0.2s", color: "#9CA3AF" }}>
                    {Icons.plus()}
                  </div>
                </button>
                {faqOpen === i && (
                  <div style={{ padding: "0 22px 18px" }}>
                    <p style={{ fontSize: "15px", color: C.body, margin: 0, lineHeight: "1.75" }}>
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: C.dark }}>
        <div style={{ ...sectionStyle, maxWidth: "620px", textAlign: "left" }}>
          <h2 style={{ ...h2Style, color: "#fff", margin: "0 0 16px 0" }}>
            Start managing your money properly.{" "}
            <span style={{ color: C.green }}>Today.</span>
          </h2>
          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.4)", lineHeight: "1.65", margin: "0 0 36px 0" }}>
            Free forever. Works with all Indian banks. Your data stays yours.
          </p>
          <WaitlistForm dark />
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.2)", margin: "14px 0 0 0" }}>
            No credit card required — unsubscribe anytime — DPDPA compliant
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: C.dark, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: "800", color: C.dark, fontFamily: "Georgia, serif", fontStyle: "italic" }}>c</span>
              </div>
              <span style={{ fontSize: "15px", fontWeight: "800", color: "#fff", letterSpacing: "-0.02em" }}>casha.money</span>
            </div>
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              {[["Features", "#features"], ["Pricing", "#pricing"], ["FAQ", "#faq"], ["Sign in", "/auth/login"], ["Sign up free", "/auth/signup"]].map(([l, h]) => (
                <a key={l} href={h} style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>{l}</a>
              ))}
            </div>
          </div>
          <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", marginBottom: "24px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.18)", margin: 0 }}>
              2026 Casha Money Technologies. All rights reserved.
            </p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.12)", margin: 0, maxWidth: "440px", textAlign: "right", lineHeight: "1.6" }}>
              Casha is a financial education and management platform, not a licensed investment advisor. Consult a qualified professional for investment, tax, and legal decisions.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        a { transition: opacity 0.15s; }
        a:hover { opacity: 0.75; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}