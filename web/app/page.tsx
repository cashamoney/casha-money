"use client";
import { useState, useEffect, useRef } from "react";

// ── Animation Hook ──
function useFadeIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeIn({ children, delay = 0, style = {} }: {
  children: React.ReactNode; delay?: number; style?: React.CSSProperties;
}) {
  const { ref, visible } = useFadeIn();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
      ...style
    }}>
      {children}
    </div>
  );
}

// ── Waitlist Form ──
function WaitlistForm({ dark = false, large = false }: { dark?: boolean; large?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [pos, setPos] = useState(0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || state !== "idle") return;
    setState("loading");
    try {
      const r = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await r.json();
      setPos(d.position || 1);
      setState("done");
    } catch { setState("idle"); }
  };

  if (state === "done") return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "14px",
      background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
      borderRadius: "14px", padding: "16px 22px",
    }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "50%",
        background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0
      }}>
        <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <p style={{ fontSize: "15px", fontWeight: "700", color: "#166534", margin: "0 0 2px 0" }}>
          You are #{pos} on the waitlist
        </p>
        <p style={{ fontSize: "13px", color: "#16A34A", margin: 0 }}>
          We will email you the moment Casha launches.
        </p>
      </div>
    </div>
  );

  const h = large ? "54px" : "48px";
  return (
    <form onSubmit={submit} style={{ display: "flex", gap: "8px", width: "100%", maxWidth: large ? "500px" : "440px" }}>
      <input
        type="email" required value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email address"
        disabled={state === "loading"}
        style={{
          flex: 1, height: h, borderRadius: "11px", padding: "0 18px",
          fontSize: large ? "15px" : "14px", outline: "none", fontFamily: "inherit",
          background: dark ? "rgba(255,255,255,0.07)" : "#fff",
          border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #D1D5DB",
          color: dark ? "#fff" : "#111827",
          boxShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.06)",
        }}
      />
      <button type="submit" disabled={state === "loading"} style={{
        height: h, padding: "0 22px", borderRadius: "11px", border: "none",
        background: "#22C55E", color: "#fff",
        fontSize: large ? "15px" : "14px", fontWeight: "700",
        cursor: state === "loading" ? "wait" : "pointer",
        whiteSpace: "nowrap", fontFamily: "inherit",
        boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
        opacity: state === "loading" ? 0.8 : 1,
        transition: "opacity 0.2s, transform 0.1s",
      }}>
        {state === "loading" ? "Joining..." : "Get early access"}
      </button>
    </form>
  );
}

// ── SVG Icons ──
const Ic = {
  check: (c = "#22C55E", s = 16) => (
    <svg width={s} height={s} fill="none" stroke={c} strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  cross: (s = 16) => (
    <svg width={s} height={s} fill="none" stroke="#EF4444" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  chevron: (open: boolean) => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
      style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  lock: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  star: () => (
    <svg width="14" height="14" fill="#F59E0B" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  twitter: () => (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  linkedin: () => (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
};

// ── Feature icon wrappers ──
const FeatureIcons = {
  ai: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  tax: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  debt: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  sms: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  budget: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  sub: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
};

export default function Home() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [nav, setNav] = useState(false);
  const [count] = useState(618);

  useEffect(() => {
    const fn = () => setNav(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // ── COLOR TOKENS ──
  const T = {
    black: "#0A0A0A",
    white: "#FFFFFF",
    green: "#16A34A",
    greenLight: "#22C55E",
    blue: "#2563EB",
    amber: "#D97706",
    text: "#18181B",
    muted: "#71717A",
    faint: "#A1A1AA",
    border: "#E4E4E7",
    surface: "#FAFAFA",
    card: "#FFFFFF",
  };

  const features = [
    {
      icon: FeatureIcons.ai,
      tag: "AI Advisor",
      h: "Your personal CFO. Always available.",
      p: "Ask anything about your money and get specific answers based on your actual transactions — not generic advice written for the average person.",
      code: `Casha AI — 20 Apr 2026

Your savings rate is 65% this month.
Minimum target: 20% — you have exceeded it.

Recommendation: Redirect the extra 45%
(Rs.33,750) toward your HDFC loan.
This makes you debt-free 14 months early
and saves Rs.28,400 in interest.`,
    },
    {
      icon: FeatureIcons.tax,
      tag: "Tax Genius",
      h: "Stop overpaying taxes. Every year.",
      p: "Casha compares Old vs New regime, tracks Section 80C, 80D, HRA, and NPS deductions, and shows exactly how much you will save — before you file.",
      code: `Tax analysis — FY 2025-26

Regime: Old Regime saves Rs.42,000
vs New Regime for your income.

80C remaining: Rs.94,000 of Rs.1,50,000
Invest in ELSS before 31 March 2026.
Estimated total tax saving: Rs.42,000`,
    },
    {
      icon: FeatureIcons.debt,
      tag: "Debt Destroyer",
      h: "See your debt-free date. Today.",
      p: "Add all your loans and credit cards. Casha calculates the optimal payoff order using the avalanche method and shows your exact debt-free date.",
      code: `Payoff strategy — Avalanche method

1. HDFC Credit Card — 43% APR
   Pay Rs.8,000/month (minimum: Rs.2,500)

2. SBI Personal Loan — 14% APR
   Pay minimum until Card is cleared

Debt-free date: March 2027
Interest saved: Rs.28,400`,
    },
    {
      icon: FeatureIcons.sms,
      tag: "SMS Parser",
      h: "Paste bank SMS. Transaction created.",
      p: "Works with every Indian bank. Paste any message — amount, merchant, and category are extracted in under one second. No manual entry ever.",
      code: `Input — HDFC Bank SMS:

Rs.2,500.00 debited from A/c XX1234
on 19-04-26. Info: Swiggy.

Parsed result:
Amount   Rs.2,500
Merchant Swiggy
Category Food Delivery
Date     19 Apr 2026`,
    },
    {
      icon: FeatureIcons.budget,
      tag: "Budget AI",
      h: "AI builds your budget. One click.",
      p: "Based on your income and the India-adapted 50/30/20 rule, Casha generates a complete monthly budget and tracks every category automatically.",
      code: `Budget — April 2026
Income: Rs.75,000/month

Needs    50%  Rs.37,500
  Housing + EMI + Groceries

Wants    30%  Rs.22,500
  Dining + Shopping + Entertainment

Savings  20%  Rs.15,000
  SIP + PPF + Emergency Fund`,
    },
    {
      icon: FeatureIcons.sub,
      tag: "Subscription Tracker",
      h: "Find money you forgot you were spending.",
      p: "Casha scans your transactions and automatically detects every active subscription — even ones you completely forgot about months ago.",
      code: `Subscriptions detected — April 2026

Netflix          Rs.499/month
Hotstar          Rs.299/month
Spotify          Rs.119/month
Gym (3mo unused) Rs.1,999/month

Total waste: Rs.2,916/month
Annual:      Rs.34,992/year`,
    },
  ];

  const rule = [
    {
      pct: "50", label: "Needs", color: T.blue,
      amount: "Rs.37,500", note: "on Rs.75,000 salary",
      items: ["Housing and Rent", "Groceries", "EMI Payments", "Insurance Premiums", "Utilities", "Transport"],
    },
    {
      pct: "30", label: "Wants", color: T.amber,
      amount: "Rs.22,500", note: "on Rs.75,000 salary",
      items: ["Dining and Delivery", "Shopping", "Entertainment", "Subscriptions", "Travel", "Personal Care"],
    },
    {
      pct: "20", label: "Savings", color: T.greenLight,
      amount: "Rs.15,000", note: "on Rs.75,000 salary",
      items: ["Emergency Fund", "SIP and Mutual Funds", "PPF and NPS", "ELSS for Tax Saving", "Fixed Deposit", "Gold"],
    },
  ];

  const compare = {
    cols: ["Feature", "Casha", "CRED", "Jupiter", "YNAB"],
    rows: [
      { f: "Works with your existing bank", v: [true, true, false, true] },
      { f: "India Tax Optimizer (80C, 80D, HRA)", v: [true, false, false, false] },
      { f: "Old vs New regime comparison", v: [true, false, false, false] },
      { f: "SMS Parser — all Indian banks", v: [true, false, false, false] },
      { f: "AI CFO with your real data", v: [true, false, false, false] },
      { f: "Subscription auto-detection", v: [true, false, false, false] },
      { f: "Debt payoff optimizer", v: [true, false, false, true] },
      { f: "50/30/20 budget with AI", v: [true, false, false, false] },
      { f: "Free plan — no credit card ever", v: [true, true, false, false] },
    ],
  };

  const plans = [
    {
      name: "Free",
      price: "Rs.0",
      sub: "Forever. No credit card.",
      highlight: false,
      badge: null,
      color: T.black,
      features: [
        "Financial health score (0–1000)",
        "Transaction tracking — unlimited",
        "SMS Parser for all Indian banks",
        "Budget with AI (50/30/20)",
        "Debt payoff planner",
        "Savings goals tracker",
        "Tax optimizer — India",
        "AI Advisor — 10 questions per day",
        "Subscription detector",
      ],
      cta: "Create free account",
      href: "/auth/signup",
    },
    {
      name: "Plus",
      price: "Rs.149",
      sub: "Per month. Cancel anytime.",
      highlight: true,
      badge: "Most popular",
      color: T.white,
      features: [
        "Everything in Free",
        "Unlimited AI Advisor",
        "Investment portfolio tracker",
        "Retirement corpus planner",
        "Insurance policy tracker",
        "WhatsApp transaction alerts",
        "Advanced tax reports (PDF)",
        "Priority email support",
      ],
      cta: "Start free trial",
      href: "/auth/signup",
    },
    {
      name: "Business",
      price: "Rs.499",
      sub: "Per month. For teams.",
      highlight: false,
      badge: null,
      color: T.black,
      features: [
        "Everything in Plus",
        "GST invoice generator",
        "Cash flow forecasting",
        "Profit and Loss statements",
        "Client management",
        "Team access — up to 5 users",
        "Tally and QuickBooks sync",
        "Dedicated account manager",
      ],
      cta: "Contact us",
      href: "mailto:casha.moneyofficial@gmail.com",
    },
  ];

  const testimonials = [
    {
      text: "Found Rs.2,916 per month in subscriptions I completely forgot about. Then the tax optimizer found Rs.38,000 in deductions my CA had missed for two years straight.",
      name: "Rahul Mehta",
      role: "Software Engineer",
      city: "Bangalore",
      twitter: "@rahulmehta_dev",
    },
    {
      text: "The SMS parser is genuinely the best feature I have seen in any Indian finance app. I paste my bank messages and transactions appear instantly with the right category. Every time.",
      name: "Priya Sharma",
      role: "Marketing Manager",
      city: "Mumbai",
      twitter: "@priyasharma",
    },
    {
      text: "Switched to Old Regime after Casha's analysis. Invested in ELSS. Saved Rs.42,000 in taxes. My CA reviewed the entire plan and confirmed every single recommendation was correct.",
      name: "Arun Kumar",
      role: "Startup Founder",
      city: "Hyderabad",
      twitter: "@arunkumar",
    },
  ];

  const faqs = [
    {
      q: "Is the free plan actually free — forever?",
      a: "Yes. No credit card, no trial period, no hidden charges. The free plan includes transaction tracking, tax optimizer, debt planner, budget AI, and 10 AI questions per day — permanently free. We earn from Plus subscribers who need advanced features like unlimited AI and investment tracking.",
    },
    {
      q: "How does Casha access my bank transactions?",
      a: "It does not access your bank directly. You add transactions by pasting bank SMS messages — which works with all Indian banks including SBI, HDFC, ICICI, Axis, and Kotak — or by adding them manually. We never ask for your internet banking password, OTP, or any credentials. Your banking login stays entirely with you.",
    },
    {
      q: "Is my financial data safe and private?",
      a: "We use AES-256 encryption, the same standard used by SBI and HDFC Bank. Each user's data is completely isolated using Row Level Security — no one else can read your transactions, not even Casha employees. We never sell your data to any third party, and we never will. You can delete your account and all associated data at any time.",
    },
    {
      q: "Which Indian banks does the SMS Parser support?",
      a: "All major Indian banks — SBI, HDFC, ICICI, Axis, Kotak, Punjab National Bank, Bank of Baroda, Canara Bank, IndusInd, Yes Bank — and UPI payment apps including Google Pay, PhonePe, Paytm, and BHIM. If your specific bank message is not parsed correctly, you can always add the transaction manually in a few seconds.",
    },
    {
      q: "What is the 50/30/20 rule and how does Casha use it?",
      a: "The 50/30/20 rule divides your income into three categories: 50% for needs such as rent, EMI, and groceries; 30% for wants such as dining, shopping, and entertainment; and 20% for savings and investments. Casha adapts this framework for Indian income levels — accounting for higher EMI burdens and India-specific investments like PPF and ELSS — and automatically generates your monthly budget from your actual income with a single click.",
    },
    {
      q: "How is Casha different from CRED or Jupiter?",
      a: "CRED works only with credit cards and is primarily a rewards platform — it does not help you budget, track expenses, or plan taxes. Jupiter requires you to open a new bank account with them. Casha works with all your existing accounts across every Indian bank, covers your complete financial life from daily budgeting to tax optimization, and provides an AI financial advisor — all at no cost.",
    },
    {
      q: "Is Casha a registered financial advisor?",
      a: "No. Casha is a financial education and management platform, not a registered investment advisor, broker, or tax professional. All information and AI recommendations are for educational purposes only. Please consult a qualified Chartered Accountant or SEBI-registered investment advisor before making significant financial, tax, or investment decisions.",
    },
  ];

  const securityBadges = [
    { label: "AES-256 Encrypted", desc: "All data encrypted at rest and in transit" },
    { label: "Read-only access", desc: "We cannot move or touch your money" },
    { label: "No data selling", desc: "Your data is never sold to any third party" },
    { label: "DPDPA Compliant", desc: "India Digital Personal Data Protection Act" },
    { label: "Delete anytime", desc: "Full account and data deletion on request" },
  ];

  // Shared styles
  const section: React.CSSProperties = { maxWidth: "1080px", margin: "0 auto", padding: "96px 24px" };
  const h2: React.CSSProperties = { fontSize: "clamp(28px, 4vw, 46px)", fontWeight: "800", color: T.text, letterSpacing: "-0.03em", lineHeight: "1.1", margin: 0 };
  const label: React.CSSProperties = { fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: T.greenLight, margin: "0 0 14px 0", display: "block" };
  const bodyText: React.CSSProperties = { fontSize: "17px", color: T.muted, lineHeight: "1.7", margin: 0 };

  return (
    <div style={{ fontFamily: "'Inter', 'Helvetica Neue', system-ui, sans-serif", background: T.white, color: T.text, overflowX: "hidden" }}>

      {/* ── NAV ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
        height: "62px", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 40px",
        background: nav ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: nav ? "blur(16px)" : "none",
        borderBottom: nav ? `1px solid ${T.border}` : "none",
        transition: "all 0.3s ease",
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: T.black, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "16px", fontWeight: "900", color: T.greenLight, letterSpacing: "-0.04em" }}>c</span>
          </div>
          <span style={{ fontSize: "17px", fontWeight: "800", color: T.black, letterSpacing: "-0.03em" }}>
            casha<span style={{ color: T.greenLight }}>.money</span>
          </span>
        </a>

        <nav style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          {[["Features", "#features"], ["50/30/20", "#rule"], ["Pricing", "#pricing"], ["FAQ", "#faq"]].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: "14px", color: T.muted, textDecoration: "none", fontWeight: "500", transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = T.text}
              onMouseLeave={e => e.currentTarget.style.color = T.muted}
            >{l}</a>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/auth/login" style={{ fontSize: "14px", color: T.muted, textDecoration: "none", fontWeight: "500" }}>Sign in</a>
          <a href="/auth/signup" style={{
            fontSize: "14px", fontWeight: "700", padding: "9px 20px",
            borderRadius: "10px", textDecoration: "none",
            background: T.black, color: T.white, transition: "opacity 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Get started free
          </a>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ paddingTop: "140px", paddingBottom: "80px", paddingLeft: "24px", paddingRight: "24px", maxWidth: "860px", margin: "0 auto" }}>

        {/* Live badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "#F0FDF4", border: "1px solid #BBF7D0",
          borderRadius: "999px", padding: "6px 14px", marginBottom: "32px",
          animation: "fadeSlideUp 0.5s ease forwards",
        }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: T.greenLight, display: "inline-block", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#166534" }}>
            {count}+ people on the early access list
          </span>
        </div>

        {/* H1 */}
        <h1 style={{
          fontSize: "clamp(44px, 7vw, 84px)", fontWeight: "800",
          color: T.black, letterSpacing: "-0.04em", lineHeight: "1.02",
          margin: "0 0 22px 0",
          animation: "fadeSlideUp 0.55s ease 0.05s both",
        }}>
          Your money,
          <br />
          <span style={{ color: T.greenLight }}>finally</span> making sense.
        </h1>

        {/* Subheading */}
        <p style={{
          fontSize: "20px", color: T.muted, lineHeight: "1.65",
          maxWidth: "540px", margin: "0 0 36px 0",
          animation: "fadeSlideUp 0.55s ease 0.1s both",
        }}>
          Casha tracks every rupee, destroys your debt, saves you{" "}
          <strong style={{ color: T.text, fontWeight: "700" }}>
            Rs.20,000 to Rs.50,000 in taxes
          </strong>{" "}
          annually, and gives you an AI financial advisor — free, forever.
        </p>

        {/* CTA */}
        <div style={{ animation: "fadeSlideUp 0.55s ease 0.15s both", marginBottom: "12px" }}>
          <WaitlistForm large />
        </div>
        <p style={{ fontSize: "13px", color: T.faint, margin: "0 0 56px 0", display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ color: T.faint }}>{Ic.lock()}</span>
          Free forever — no credit card — works with all Indian banks
        </p>

        {/* Bank trust bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "0", flexWrap: "wrap", rowGap: "8px" }}>
          <span style={{ fontSize: "11px", color: "#CBD5E1", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", marginRight: "20px" }}>
            Supported banks
          </span>
          {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB", "UPI", "GPay", "PhonePe"].map((b, i) => (
            <span key={b} style={{ fontSize: "13px", color: "#94A3B8", fontWeight: "600", marginRight: i < 8 ? "20px" : "0" }}>{b}</span>
          ))}
        </div>
      </section>

      {/* ── APP PREVIEW ── */}
      <section style={{ padding: "0 24px 96px", maxWidth: "1020px", margin: "0 auto" }}>
        <FadeIn>
          <div style={{
            border: `1px solid ${T.border}`, borderRadius: "18px", overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06), 0 32px 80px rgba(0,0,0,0.08)",
          }}>
            {/* Browser chrome */}
            <div style={{ background: "#F4F4F5", borderBottom: `1px solid ${T.border}`, padding: "11px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ display: "flex", gap: "6px" }}>
                {["#FC5D57", "#FDBC40", "#33C948"].map(c => (
                  <div key={c} style={{ width: "11px", height: "11px", borderRadius: "50%", background: c }} />
                ))}
              </div>
              <div style={{ flex: 1, background: T.white, borderRadius: "7px", padding: "5px 12px", maxWidth: "210px", margin: "0 auto", display: "flex", alignItems: "center", gap: "5px", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
                <svg width="9" height="9" fill="none" stroke={T.greenLight} strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "500" }}>app.casha.money</span>
              </div>
            </div>

            {/* Dashboard layout */}
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: "420px" }}>

              {/* Sidebar */}
              <div style={{ background: T.white, borderRight: `1px solid ${T.border}`, padding: "20px 10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 8px", marginBottom: "28px" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: T.black, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "12px", fontWeight: "900", color: T.greenLight }}>c</span>
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: T.black, letterSpacing: "-0.02em" }}>casha.money</span>
                </div>
                {[
                  { name: "Overview", active: true },
                  { name: "Transactions", active: false },
                  { name: "Budget", active: false },
                  { name: "Debts", active: false },
                  { name: "Tax Genius", active: false },
                  { name: "AI Advisor", active: false },
                  { name: "Settings", active: false },
                ].map(item => (
                  <div key={item.name} style={{
                    padding: "9px 10px", borderRadius: "8px", marginBottom: "2px",
                    background: item.active ? "#F4F4F5" : "transparent",
                    fontSize: "13px", color: item.active ? T.black : T.faint,
                    fontWeight: item.active ? "600" : "400", cursor: "default",
                  }}>
                    {item.name}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div style={{ background: "#FAFAFA", padding: "28px" }}>
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: T.faint, margin: "0 0 4px 0", fontWeight: "500" }}>Sunday, 20 April 2026</p>
                    <p style={{ fontSize: "20px", fontWeight: "700", color: T.black, margin: 0, letterSpacing: "-0.02em" }}>Good afternoon, Rahul</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "999px", padding: "5px 12px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: T.greenLight }} />
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#166534" }}>AI Active</span>
                  </div>
                </div>

                {/* Metric cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "12px" }}>
                  {[
                    { label: "Health Score", value: "800", sub: "Excellent — top 10%", dark: true, valueColor: T.greenLight },
                    { label: "Net Worth", value: "Rs.1,40,000", sub: "+Rs.15,000 this month", dark: false, valueColor: T.text },
                    { label: "Savings Rate", value: "65%", sub: "Target: 20% — exceeded", dark: false, valueColor: T.text },
                  ].map((m, i) => (
                    <div key={i} style={{
                      background: m.dark ? T.black : T.white,
                      border: m.dark ? "none" : `1px solid ${T.border}`,
                      borderRadius: "12px", padding: "16px",
                    }}>
                      <p style={{ fontSize: "10px", fontWeight: "700", color: m.dark ? "rgba(255,255,255,0.35)" : T.faint, margin: "0 0 8px 0", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                        {m.label}
                      </p>
                      <p style={{ fontSize: "26px", fontWeight: "800", color: m.dark ? m.valueColor : T.text, margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
                        {m.value}
                      </p>
                      <p style={{ fontSize: "11px", color: m.dark ? "rgba(255,255,255,0.3)" : T.muted, margin: 0 }}>
                        {m.sub}
                      </p>
                    </div>
                  ))}
                </div>

                {/* AI insight */}
                <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: "12px", padding: "14px 16px", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: T.black, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: T.greenLight }}>
                      <FeatureIcons.ai />
                    </div>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: "700", color: T.black, margin: "0 0 4px 0" }}>
                        AI found Rs.42,000 in potential tax savings
                      </p>
                      <p style={{ fontSize: "12px", color: T.muted, margin: 0, lineHeight: "1.5" }}>
                        Switch to Old Regime and invest Rs.1,50,000 in ELSS before 31 March. Your 80C limit has Rs.94,000 remaining.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent transactions */}
                <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: "12px", overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}` }}>
                    <p style={{ fontSize: "11px", fontWeight: "700", color: T.faint, margin: 0, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                      Recent transactions
                    </p>
                  </div>
                  {[
                    { name: "Company Salary", cat: "Salary", amount: "+Rs.75,000", positive: true },
                    { name: "HDFC Home Loan EMI", cat: "EMI Payment", amount: "-Rs.15,000", positive: false },
                    { name: "Swiggy", cat: "Food Delivery", amount: "-Rs.2,500", positive: false },
                  ].map((t, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 16px",
                      borderBottom: i < 2 ? `1px solid ${T.border}` : "none",
                    }}>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: T.black, margin: "0 0 2px 0" }}>{t.name}</p>
                        <p style={{ fontSize: "11px", color: T.faint, margin: 0 }}>{t.cat}</p>
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: t.positive ? T.green : T.text }}>
                        {t.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── SOCIAL PROOF NUMBERS ── */}
      <section style={{ background: T.surface, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ ...section, padding: "48px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0", textAlign: "center" }}>
            {[
              { n: "618+", l: "Early access members" },
              { n: "Rs.2,400", l: "Avg. monthly waste found" },
              { n: "Rs.42,000", l: "Avg. annual tax savings" },
              { n: "18+", l: "Countries supported" },
              { n: "24/7", l: "AI advisor availability" },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div style={{ padding: "24px 16px", borderRight: i < 4 ? `1px solid ${T.border}` : "none" }}>
                  <p style={{ fontSize: "32px", fontWeight: "800", color: T.black, margin: "0 0 6px 0", letterSpacing: "-0.03em" }}>{s.n}</p>
                  <p style={{ fontSize: "13px", color: T.muted, margin: 0, fontWeight: "500" }}>{s.l}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section style={{ background: T.white }}>
        <div style={section}>
          <FadeIn>
            <span style={label}>The problem</span>
            <h2 style={{ ...h2, maxWidth: "520px", marginBottom: "16px" }}>
              Most people lose money every month without realising it.
            </h2>
            <p style={{ ...bodyText, maxWidth: "480px", marginBottom: "52px" }}>
              Not from reckless spending — from missing tax deductions, forgotten subscriptions, and zero visibility into where money actually goes.
            </p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "14px" }}>
            {[
              { n: "78%", t: "of salaried Indians have no monthly budget", s: "RBI Household Finance Survey 2024" },
              { n: "Rs.1.2L", t: "average annual tax overpayment by salaried employees", s: "Income Tax Department 2024" },
              { n: "Rs.2,400", t: "wasted monthly on forgotten or unused subscriptions", s: "Casha internal research" },
              { n: "68%", t: "of working Indians are not on track for retirement at 60", s: "PFRDA Annual Report 2024" },
            ].map((p, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "14px", padding: "26px" }}>
                  <p style={{ fontSize: "36px", fontWeight: "800", color: T.black, margin: "0 0 10px 0", letterSpacing: "-0.02em" }}>{p.n}</p>
                  <p style={{ fontSize: "14px", color: "#374151", margin: "0 0 12px 0", lineHeight: "1.5", fontWeight: "500" }}>{p.t}</p>
                  <p style={{ fontSize: "11px", color: T.faint, margin: 0 }}>{p.s}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 50/30/20 RULE ── */}
      <section id="rule" style={{ background: T.black }}>
        <div style={section}>
          <FadeIn>
            <span style={{ ...label, color: T.greenLight }}>Built-in framework</span>
            <h2 style={{ ...h2, color: T.white, maxWidth: "520px", marginBottom: "16px" }}>
              The 50/30/20 rule — adapted for India.
            </h2>
            <p style={{ ...bodyText, color: "rgba(255,255,255,0.45)", maxWidth: "500px", marginBottom: "48px" }}>
              The most proven budgeting framework in the world, tuned specifically for Indian salaries, tax laws, and investment instruments. Applied automatically.
            </p>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "40px" }}>
            {rule.map((r, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "28px", height: "100%" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <span style={{ fontSize: "52px", fontWeight: "800", color: r.color, letterSpacing: "-0.04em", lineHeight: 1 }}>{r.pct}</span>
                    <span style={{ fontSize: "24px", fontWeight: "800", color: r.color }}>%</span>
                  </div>
                  <p style={{ fontSize: "18px", fontWeight: "700", color: T.white, margin: "0 0 4px 0" }}>{r.label}</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: "0 0 20px 0" }}>{r.note}: <strong style={{ color: r.color }}>{r.amount}</strong></p>
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "16px" }} />
                  {r.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "8px" }}>
                      <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3}>
            <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.14)", borderRadius: "14px", padding: "28px 32px" }}>
              <p style={{ fontSize: "11px", fontWeight: "700", color: T.greenLight, letterSpacing: "0.09em", textTransform: "uppercase", margin: "0 0 20px 0" }}>
                Example — Rs.75,000 per month salary
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" }}>
                {rule.map((r, i) => (
                  <div key={i}>
                    <p style={{ fontSize: "28px", fontWeight: "800", color: r.color, margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>{r.amount}</p>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", margin: 0 }}>{r.label} ({r.pct}%)</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.2)", margin: "20px 0 0 0" }}>
                Casha generates this budget automatically from your actual income — one click, zero effort.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ background: T.white }}>
        <div style={section}>
          <FadeIn>
            <span style={label}>Features</span>
            <h2 style={{ ...h2, maxWidth: "500px", marginBottom: "16px" }}>
              Everything your finances need. Nothing they do not.
            </h2>
            <p style={{ ...bodyText, maxWidth: "460px", marginBottom: "56px" }}>
              What a Rs.30 lakh per year CFO does — automated, AI-powered, free.
            </p>
          </FadeIn>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {features.map((f, i) => {
              const flip = i % 2 !== 0;
              return (
                <FadeIn key={i} delay={0.05}>
                  <div style={{
                    background: T.white, border: `1px solid ${T.border}`, borderRadius: "16px",
                    padding: "44px 48px", display: "grid",
                    gridTemplateColumns: "1fr 1fr", gap: "52px", alignItems: "center",
                  }}>
                    <div style={{ order: flip ? 2 : 1 }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                        <div style={{ color: T.greenLight }}><f.icon /></div>
                        <span style={{ ...label, margin: 0 }}>{f.tag}</span>
                      </div>
                      <h3 style={{ fontSize: "22px", fontWeight: "800", color: T.black, margin: "0 0 14px 0", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
                        {f.h}
                      </h3>
                      <p style={{ fontSize: "16px", color: T.muted, margin: 0, lineHeight: "1.7" }}>{f.p}</p>
                    </div>
                    <div style={{ order: flip ? 1 : 2 }}>
                      <div style={{ background: "#18181B", borderRadius: "12px", overflow: "hidden" }}>
                        <div style={{ display: "flex", gap: "5px", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                          {["#FC5D57", "#FDBC40", "#33C948"].map(c => (
                            <div key={c} style={{ width: "9px", height: "9px", borderRadius: "50%", background: c }} />
                          ))}
                        </div>
                        <pre style={{
                          fontSize: "12px", lineHeight: "1.75",
                          color: "rgba(255,255,255,0.65)",
                          margin: 0, padding: "18px 20px",
                          fontFamily: "'Courier New', 'Menlo', monospace",
                          whiteSpace: "pre-wrap", wordBreak: "break-word",
                        }}>
                          {f.code}
                        </pre>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section style={{ background: T.surface, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <div style={section}>
          <FadeIn>
            <span style={label}>Security</span>
            <h2 style={{ ...h2, maxWidth: "460px", marginBottom: "16px" }}>
              Bank-level security. Zero compromises.
            </h2>
            <p style={{ ...bodyText, maxWidth: "480px", marginBottom: "48px" }}>
              Your financial data is more sensitive than your password. We treat it that way.
            </p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
            {securityBadges.map((b, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: "12px", padding: "22px" }}>
                  <div style={{ color: T.greenLight, marginBottom: "12px" }}>{Ic.check(T.greenLight, 20)}</div>
                  <p style={{ fontSize: "14px", fontWeight: "700", color: T.black, margin: "0 0 6px 0" }}>{b.label}</p>
                  <p style={{ fontSize: "13px", color: T.muted, margin: 0, lineHeight: "1.5" }}>{b.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPETITOR TABLE ── */}
      <section style={{ background: T.white }}>
        <div style={section}>
          <FadeIn>
            <span style={label}>Why Casha</span>
            <h2 style={{ ...h2, maxWidth: "440px", marginBottom: "16px" }}>Built for India. Built better.</h2>
            <p style={{ ...bodyText, maxWidth: "440px", marginBottom: "48px" }}>
              No other app covers your complete financial life — especially for Indian users.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ border: `1px solid ${T.border}`, borderRadius: "14px", overflow: "hidden", maxWidth: "800px" }}>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(4, 100px)", background: T.black, padding: "14px 22px", gap: "8px" }}>
                {compare.cols.map((col, i) => (
                  <div key={i} style={{ textAlign: i === 0 ? "left" : "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: i === 1 ? T.greenLight : i === 0 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.3)" }}>
                      {col}{i === 1 ? " ✦" : ""}
                    </span>
                  </div>
                ))}
              </div>
              {/* Rows */}
              {compare.rows.map((row, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr repeat(4, 100px)",
                  padding: "13px 22px", gap: "8px",
                  background: i % 2 === 0 ? T.white : T.surface,
                  borderBottom: i < compare.rows.length - 1 ? `1px solid ${T.border}` : "none",
                  alignItems: "center",
                }}>
                  <span style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>{row.f}</span>
                  {row.v.map((val, j) => (
                    <div key={j} style={{ display: "flex", justifyContent: "center" }}>
                      {val ? Ic.check(j === 0 ? T.greenLight : "#9CA3AF", 16) : Ic.cross(16)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: T.surface, borderTop: `1px solid ${T.border}` }}>
        <div style={section}>
          <FadeIn>
            <span style={label}>How it works</span>
            <h2 style={{ ...h2, maxWidth: "400px", marginBottom: "16px" }}>Up and running in 2 minutes.</h2>
            <p style={{ ...bodyText, maxWidth: "440px", marginBottom: "48px" }}>
              No bank account switch required. No complicated setup. Just sign up and start.
            </p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            {[
              { n: "01", h: "Create your account", p: "Sign up with just your email. 30 seconds. No credit card required." },
              { n: "02", h: "Add your transactions", p: "Paste bank SMS messages — all Indian banks work — or add manually." },
              { n: "03", h: "AI analyzes everything", p: "Health score calculated. Budget generated. Tax deductions identified." },
              { n: "04", h: "Your wealth grows", p: "Follow the AI plan. Watch your score rise every month. Build real wealth." },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: "14px", padding: "28px" }}>
                  <p style={{ fontSize: "40px", fontWeight: "800", color: T.border, margin: "0 0 18px 0", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.n}</p>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: T.black, margin: "0 0 10px 0" }}>{s.h}</h3>
                  <p style={{ fontSize: "14px", color: T.muted, margin: 0, lineHeight: "1.6" }}>{s.p}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ background: T.white, borderTop: `1px solid ${T.border}` }}>
        <div style={section}>
          <FadeIn>
            <span style={label}>Pricing</span>
            <h2 style={{ ...h2, maxWidth: "400px", marginBottom: "12px" }}>Simple, honest pricing.</h2>
            <p style={{ ...bodyText, maxWidth: "420px", marginBottom: "52px" }}>
              Start completely free. Upgrade when you need more. No contracts, no surprises.
            </p>
          </FadeIn>

          {/* Pricing cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", maxWidth: "860px", alignItems: "start" }}>
            {plans.map((plan, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div style={{
                  background: plan.highlight ? T.black : T.white,
                  border: plan.highlight ? `2px solid ${T.greenLight}` : `1px solid ${T.border}`,
                  borderRadius: "18px",
                  padding: "32px",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}>
                  {/* Popular badge */}
                  {plan.badge && (
                    <div style={{
                      position: "absolute", top: "-13px", left: "50%",
                      transform: "translateX(-50%)",
                      background: T.greenLight, color: T.white,
                      fontSize: "11px", fontWeight: "700",
                      padding: "4px 16px", borderRadius: "999px",
                      whiteSpace: "nowrap", letterSpacing: "0.02em"
                    }}>
                      {plan.badge}
                    </div>
                  )}

                  {/* Plan name */}
                  <p style={{
                    fontSize: "13px", fontWeight: "600",
                    color: plan.highlight ? "rgba(255,255,255,0.35)" : T.muted,
                    margin: "0 0 12px 0", letterSpacing: "0.02em"
                  }}>
                    {plan.name}
                  </p>

                  {/* Price */}
                  <div style={{ marginBottom: "6px" }}>
                    <span style={{
                      fontSize: "44px", fontWeight: "800", letterSpacing: "-0.03em",
                      color: plan.highlight ? T.white : T.black,
                    }}>
                      {plan.price}
                    </span>
                  </div>

                  {/* Billing period */}
                  <p style={{
                    fontSize: "13px",
                    color: plan.highlight ? "rgba(255,255,255,0.3)" : T.faint,
                    margin: "0 0 28px 0"
                  }}>
                    {plan.sub}
                  </p>

                  {/* Divider */}
                  <div style={{ height: "1px", background: plan.highlight ? "rgba(255,255,255,0.08)" : T.border, marginBottom: "24px" }} />

                  {/* Features list */}
                  <div style={{ flex: 1, marginBottom: "28px" }}>
                    {plan.features.map((item, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                        <div style={{ marginTop: "1px", flexShrink: 0 }}>
                          {Ic.check(T.greenLight, 15)}
                        </div>
                        <span style={{
                          fontSize: "13px", lineHeight: "1.45",
                          color: plan.highlight ? "rgba(255,255,255,0.65)" : "#374151"
                        }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <a
                    href={plan.href}
                    style={{
                      display: "block", textAlign: "center",
                      padding: "14px 20px", borderRadius: "11px",
                      textDecoration: "none", fontWeight: "700",
                      fontSize: "14px", fontFamily: "inherit",
                      background: plan.highlight ? T.greenLight : T.black,
                      color: T.white,
                      boxShadow: plan.highlight ? "0 4px 14px rgba(34,197,94,0.35)" : "none",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    {plan.cta}
                  </a>

                  {/* Money back note for Plus */}
                  {plan.highlight && (
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", textAlign: "center", margin: "12px 0 0 0" }}>
                      14-day free trial — cancel anytime
                    </p>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>

          {/* All plans include */}
          <FadeIn delay={0.3}>
            <div style={{ marginTop: "32px", padding: "22px 28px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "12px", maxWidth: "860px" }}>
              <p style={{ fontSize: "12px", fontWeight: "700", color: T.faint, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px 0" }}>
                All plans include
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                {["SSL encryption", "No data selling — ever", "Full data export", "Delete account anytime", "DPDPA compliant", "Works with all Indian banks"].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    {Ic.check(T.greenLight, 14)}
                    <span style={{ fontSize: "13px", color: T.muted }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: T.surface, borderTop: `1px solid ${T.border}` }}>
        <div style={section}>
          <FadeIn>
            <span style={label}>Real results</span>
            <h2 style={{ ...h2, maxWidth: "400px", marginBottom: "16px" }}>People are already saving more.</h2>
            <p style={{ ...bodyText, maxWidth: "440px", marginBottom: "48px" }}>
              Early access members from our waitlist have been using Casha for the past month.
            </p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "14px" }}>
            {testimonials.map((t, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: "14px", padding: "28px", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: "2px", marginBottom: "16px" }}>
                    {[...Array(5)].map((_, j) => <span key={j}>{Ic.star()}</span>)}
                  </div>
                  <p style={{ fontSize: "15px", color: "#374151", lineHeight: "1.75", margin: "0 0 24px 0", flex: 1 }}>
                    "{t.text}"
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: T.muted }}>
                        {t.name.split(" ").map(w => w[0]).join("")}
                      </div>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: "700", color: T.black, margin: 0 }}>{t.name}</p>
                        <p style={{ fontSize: "12px", color: T.faint, margin: 0 }}>{t.role} — {t.city}</p>
                      </div>
                    </div>
                    <a href={`https://twitter.com/${t.twitter.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                      style={{ color: T.faint, textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#1DA1F2"}
                      onMouseLeave={e => e.currentTarget.style.color = T.faint}
                    >
                      {Ic.twitter()}
                    </a>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ background: T.white, borderTop: `1px solid ${T.border}` }}>
        <div style={{ ...section, maxWidth: "700px" }}>
          <FadeIn>
            <span style={label}>FAQ</span>
            <h2 style={{ ...h2, maxWidth: "380px", marginBottom: "40px" }}>Common questions.</h2>
          </FadeIn>
          <div style={{ border: `1px solid ${T.border}`, borderRadius: "14px", overflow: "hidden" }}>
            {faqs.map((item, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <div style={{ borderBottom: i < faqs.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    style={{
                      width: "100%", padding: "20px 24px", background: T.white, border: "none",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      cursor: "pointer", textAlign: "left", gap: "16px", fontFamily: "inherit",
                    }}
                  >
                    <span style={{ fontSize: "15px", fontWeight: "600", color: T.black, lineHeight: "1.4" }}>
                      {item.q}
                    </span>
                    <span style={{ color: T.faint, flexShrink: 0 }}>{Ic.chevron(faqOpen === i)}</span>
                  </button>
                  {faqOpen === i && (
                    <div style={{ padding: "0 24px 20px", background: T.white }}>
                      <p style={{ fontSize: "15px", color: T.muted, margin: 0, lineHeight: "1.75" }}>
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: T.black }}>
        <div style={{ ...section, maxWidth: "640px" }}>
          <FadeIn>
            <h2 style={{ ...h2, color: T.white, margin: "0 0 16px 0" }}>
              Start managing your money properly.{" "}
              <span style={{ color: T.greenLight }}>Today.</span>
            </h2>
            <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.4)", lineHeight: "1.65", margin: "0 0 36px 0" }}>
              Free forever. Works with all Indian banks. Your data stays yours — always.
            </p>
            <WaitlistForm dark large />
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.2)", margin: "14px 0 0 0", display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>{Ic.lock()}</span>
              No credit card — unsubscribe anytime — DPDPA compliant
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: T.black, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "36px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: T.greenLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: "900", color: T.black }}>c</span>
              </div>
              <span style={{ fontSize: "16px", fontWeight: "800", color: T.white, letterSpacing: "-0.02em" }}>casha.money</span>
            </div>

            <div style={{ display: "flex", gap: "28px", flexWrap: "wrap" }}>
              {[["Features", "#features"], ["50/30/20", "#rule"], ["Pricing", "#pricing"], ["FAQ", "#faq"], ["Sign in", "/auth/login"], ["Sign up free", "/auth/signup"]].map(([l, h]) => (
                <a key={l} href={h} style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
                >{l}</a>
              ))}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              {[
                { href: "https://twitter.com/cashamoneyai", icon: Ic.twitter(), label: "Twitter" },
                { href: "https://linkedin.com/company/cashamoney", icon: Ic.linkedin(), label: "LinkedIn" },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", marginBottom: "24px" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.18)", margin: 0 }}>
              2026 Casha Money Technologies Private Limited. All rights reserved.
            </p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.1)", margin: 0, maxWidth: "460px", textAlign: "right", lineHeight: "1.6" }}>
              Casha is a financial education and management platform. Not a SEBI-registered investment advisor, IRDAI-registered insurance agent, or licensed tax professional. All AI recommendations are for educational purposes only. Please consult a qualified Chartered Accountant or SEBI-registered advisor before making financial decisions.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        input::placeholder { color: #9CA3AF; }

        @media (max-width: 768px) {
          nav > div:nth-child(2) { display: none; }
        }

        @media (max-width: 640px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
          .feature-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}