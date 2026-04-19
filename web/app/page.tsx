"use client";
import { useState, useEffect, useRef } from "react";

// ─── Types ───
type WaitlistState = "idle" | "loading" | "success" | "error";

// ─── Waitlist Form ───
function WaitlistForm({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<WaitlistState>("idle");
  const [position, setPosition] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || state !== "idle") return;
    setState("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setPosition(data.position || 1);
      setState("success");
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  };

  if (state === "success") {
    return (
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "14px",
        background: variant === "dark" ? "rgba(34,197,94,0.1)" : "#F0FDF4",
        border: "1px solid rgba(34,197,94,0.3)",
        borderRadius: "14px", padding: "16px 22px",
      }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "50%",
          background: "#22C55E", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "16px", flexShrink: 0
        }}>✓</div>
        <div style={{ textAlign: "left" }}>
          <p style={{ fontSize: "14px", fontWeight: "700", color: "#166534", margin: "0 0 2px 0" }}>
            You're #{position} on the waitlist
          </p>
          <p style={{ fontSize: "12px", color: "#16A34A", margin: 0 }}>
            We'll email you when Casha launches.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", width: "100%", maxWidth: "460px" }}>
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        disabled={state === "loading"}
        style={{
          flex: 1, height: "50px", borderRadius: "12px", padding: "0 16px",
          fontSize: "15px", outline: "none", fontFamily: "inherit",
          background: variant === "dark" ? "rgba(255,255,255,0.07)" : "#fff",
          border: variant === "dark" ? "1px solid rgba(255,255,255,0.12)" : "1px solid #E2E8F0",
          color: variant === "dark" ? "#fff" : "#0F172A",
        }}
      />
      <button
        type="submit"
        disabled={state === "loading"}
        style={{
          height: "50px", padding: "0 22px", borderRadius: "12px", border: "none",
          background: "#22C55E", color: "#fff", fontSize: "14px", fontWeight: "700",
          cursor: state === "loading" ? "wait" : "pointer",
          whiteSpace: "nowrap", fontFamily: "inherit",
          opacity: state === "loading" ? 0.8 : 1,
          transition: "opacity 0.2s",
        }}
      >
        {state === "loading" ? "Joining..." : "Get early access"}
      </button>
    </form>
  );
}

// ─── Section Label ───
function Label({ children }: { children: string }) {
  return (
    <p style={{
      fontSize: "12px", fontWeight: "700", letterSpacing: "0.08em",
      textTransform: "uppercase", color: "#22C55E",
      margin: "0 0 14px 0"
    }}>
      {children}
    </p>
  );
}

// ─── Main Page ───
export default function Home() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [waitlistCount] = useState(618);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── Data ───
  const problems = [
    { stat: "78%", desc: "of salaried Indians have no monthly budget", source: "RBI Household Finance Survey 2024" },
    { stat: "₹1.2L", desc: "average annual tax overpayment by salaried employees", source: "Income Tax Dept. 2024" },
    { stat: "₹2,400", desc: "wasted monthly on forgotten subscriptions", source: "Casha user research" },
    { stat: "68%", desc: "not on track for retirement by 60", source: "PFRDA Annual Report 2024" },
  ];

  const features = [
    {
      tag: "AI ADVISOR",
      title: "Your personal CFO. Always available.",
      desc: "Ask anything about your finances and get specific, data-backed answers — not generic tips. Casha reads your actual transactions before answering.",
      proof: "Based on your ₹75,000 income and ₹26,000 expenses, your savings rate is 65% — well above the 20% recommended.",
      icon: "🧠"
    },
    {
      tag: "TAX OPTIMIZER",
      title: "Stop overpaying taxes. Legally.",
      desc: "Casha compares Old vs New regime in real-time and finds every deduction you qualify for — 80C, 80D, HRA, NPS, and more.",
      proof: "Switch to Old Regime + invest ₹1.5L in ELSS = save ₹42,000 in taxes this year.",
      icon: "🧾"
    },
    {
      tag: "DEBT DESTROYER",
      title: "See your debt-free date. Today.",
      desc: "Add your loans and credit cards. Casha calculates the mathematically optimal payoff order and shows your exact debt-free date.",
      proof: "Pay ₹5,000 extra toward HDFC Credit Card first. You'll be debt-free by March 2027 — 14 months early.",
      icon: "💸"
    },
    {
      tag: "SMS PARSER",
      title: "Paste SMS. Transaction created.",
      desc: "Works with every Indian bank — SBI, HDFC, ICICI, Axis, Kotak, and more. Paste any bank message and Casha extracts amount, merchant, and category in one second.",
      proof: "Rs.2500 debited from A/c XX1234 → ₹2,500 · Food Delivery · Swiggy · 19 Apr",
      icon: "📱"
    },
    {
      tag: "BUDGET SYSTEM",
      title: "AI builds your budget. You approve it.",
      desc: "Based on your income and the 50/30/20 framework adapted for India, Casha generates a complete monthly budget with one click.",
      proof: "Income ₹75,000 → Needs ₹37,500 · Wants ₹22,500 · Savings ₹15,000",
      icon: "📋"
    },
    {
      tag: "SUBSCRIPTION KILLER",
      title: "Find money you forgot you were spending.",
      desc: "Casha scans your transactions and automatically detects all active subscriptions — even the ones you forgot about.",
      proof: "Netflix ₹499 + Hotstar ₹299 + Spotify ₹119 + unused Gym ₹1,999 = ₹2,916/month wasted.",
      icon: "🔄"
    },
  ];

  const rule5030 = [
    {
      percent: "50%",
      label: "Needs",
      color: "#3B82F6",
      amount: "₹37,500",
      caption: "on ₹75,000 income",
      items: ["Housing & Rent", "Groceries", "EMI Payments", "Insurance", "Utilities", "Transport"],
    },
    {
      percent: "30%",
      label: "Wants",
      color: "#F59E0B",
      amount: "₹22,500",
      caption: "on ₹75,000 income",
      items: ["Dining & Delivery", "Shopping", "Entertainment", "Subscriptions", "Travel", "Personal care"],
    },
    {
      percent: "20%",
      label: "Savings",
      color: "#22C55E",
      amount: "₹15,000",
      caption: "on ₹75,000 income",
      items: ["Emergency Fund", "SIP / Mutual Funds", "PPF or NPS", "ELSS (tax saving)", "FD or RD", "Gold"],
    },
  ];

  const competitors = [
    ["Feature", "Casha", "CRED", "Jupiter", "YNAB"],
    ["Works with existing bank", "✅", "✅", "❌", "✅"],
    ["India Tax Optimizer (80C, 80D)", "✅", "❌", "❌", "❌"],
    ["Old vs New regime comparison", "✅", "❌", "❌", "❌"],
    ["SMS Parser — all Indian banks", "✅", "❌", "❌", "❌"],
    ["AI CFO with your real data", "✅", "❌", "❌", "❌"],
    ["Subscription auto-detection", "✅", "❌", "❌", "❌"],
    ["Debt payoff optimizer", "✅", "❌", "❌", "✅"],
    ["50/30/20 budget AI", "✅", "❌", "❌", "❌"],
    ["Free forever plan", "✅", "✅", "❌", "❌"],
  ];

  const pricing = [
    {
      name: "Free",
      price: "₹0",
      caption: "forever",
      highlight: false,
      items: [
        "Financial health score",
        "Transaction tracking",
        "SMS Parser (all banks)",
        "Budget with 50/30/20 AI",
        "Debt payoff planner",
        "Savings goals",
        "Tax optimizer (India)",
        "AI Advisor — 10 questions/day",
        "Subscription detector",
      ],
      cta: "Start for free",
      href: "/auth/signup",
    },
    {
      name: "Plus",
      price: "₹149",
      caption: "per month",
      highlight: true,
      badge: "Most popular",
      items: [
        "Everything in Free",
        "Unlimited AI Advisor",
        "Investment portfolio tracker",
        "Retirement planner",
        "Insurance analyzer",
        "WhatsApp transaction alerts",
        "Advanced tax reports",
        "Priority email support",
      ],
      cta: "Start free trial",
      href: "/auth/signup",
    },
    {
      name: "Business",
      price: "₹499",
      caption: "per month",
      highlight: false,
      items: [
        "Everything in Plus",
        "GST invoice generator",
        "Cash flow forecasting",
        "P&L statements",
        "Client management",
        "Team access — 5 users",
        "Tally / QuickBooks sync",
        "Dedicated support",
      ],
      cta: "Talk to us",
      href: "mailto:casha.moneyofficial@gmail.com",
    },
  ];

  const faqs = [
    {
      q: "Is the free plan actually free — forever?",
      a: "Yes. No credit card required, no trial that expires, no hidden charges. The free plan includes everything you need to manage personal finances — transaction tracking, tax optimizer, debt planner, budget AI, and 10 AI questions per day. We earn from Plus subscribers who want advanced features.",
    },
    {
      q: "How does Casha access my bank data?",
      a: "It doesn't — and that's the point. You add transactions by pasting bank SMS messages (one click, all banks) or entering them manually. We never ask for your internet banking password, OTP, or any credentials. Your banking login stays with you.",
    },
    {
      q: "Is my financial data safe?",
      a: "We use AES-256 encryption (the same standard used by SBI and HDFC). Each user's data is completely isolated — no one else can see your transactions, not even us. We never sell your data to anyone, ever.",
    },
    {
      q: "Which banks does the SMS Parser support?",
      a: "All major Indian banks — SBI, HDFC, ICICI, Axis, Kotak, PNB, Bank of Baroda, Canara Bank, IndusInd, Yes Bank — and UPI apps including Google Pay, PhonePe, Paytm, and BHIM.",
    },
    {
      q: "What is the 50/30/20 rule and how does Casha use it?",
      a: "The 50/30/20 rule is a proven budgeting framework: 50% of income goes to needs (rent, EMI, groceries), 30% to wants (dining, entertainment, shopping), and 20% to savings and investments. Casha adapts this for Indian income levels and automatically generates your budget based on your actual monthly income.",
    },
    {
      q: "How is Casha different from CRED or Jupiter?",
      a: "CRED only works with credit cards and focuses on rewards — it doesn't help you budget, save, or plan taxes. Jupiter requires you to open a new bank account with them. Casha works with all your existing accounts, covers your complete financial life, and gives you an AI advisor — all free.",
    },
    {
      q: "Can I use Casha for my small business?",
      a: "Yes. The Business plan includes GST invoice generation, cash flow forecasting, P&L statements, and client management. It's built for freelancers, consultants, and small business owners who need financial clarity without a full-time accountant.",
    },
  ];

  const steps = [
    { n: "01", title: "Create your account", desc: "Sign up with just your email. Takes 30 seconds. No credit card." },
    { n: "02", title: "Add your transactions", desc: "Paste bank SMS messages — all Indian banks work. Or add manually. Takes 2 minutes." },
    { n: "03", title: "AI analyzes everything", desc: "Health score calculated. Budget generated. Tax savings found. Insights ready." },
    { n: "04", title: "Your wealth grows", desc: "Follow the plan. Watch your score go up every month. Build real wealth." },
  ];

  // ─── Styles ───
  const S = {
    section: { padding: "96px 24px", maxWidth: "1100px", margin: "0 auto" } as React.CSSProperties,
    h2: { fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: "800", color: "#0F172A", letterSpacing: "-0.03em", lineHeight: "1.1", margin: "0 0 20px 0" } as React.CSSProperties,
    body: { fontSize: "17px", color: "#64748B", lineHeight: "1.7", margin: "0 0 40px 0" } as React.CSSProperties,
    card: { background: "#fff", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "28px" } as React.CSSProperties,
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: "#fff", color: "#0F172A", overflowX: "hidden" }}>

      {/* ─── NAV ─── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: "60px", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 32px",
        background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid #F1F5F9" : "none",
        transition: "all 0.25s ease",
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "9px",
            background: "#0F172A",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", fontWeight: "800", color: "#22C55E"
          }}>c</div>
          <span style={{ fontSize: "17px", fontWeight: "800", color: "#0F172A", letterSpacing: "-0.02em" }}>
            casha<span style={{ color: "#22C55E" }}>.money</span>
          </span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          {[["Features", "#features"], ["50/30/20", "#rule"], ["Pricing", "#pricing"], ["FAQ", "#faq"]].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: "14px", color: "#64748B", textDecoration: "none", fontWeight: "500" }}>{l}</a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <a href="/auth/login" style={{ fontSize: "14px", color: "#64748B", textDecoration: "none", fontWeight: "500" }}>
            Sign in
          </a>
          <a href="/auth/signup" style={{
            fontSize: "14px", fontWeight: "700", padding: "8px 18px",
            borderRadius: "10px", textDecoration: "none",
            background: "#0F172A", color: "#fff",
          }}>
            Get started free
          </a>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{ paddingTop: "120px", paddingBottom: "80px", paddingLeft: "24px", paddingRight: "24px", maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>

        {/* Live badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "999px", padding: "5px 14px", marginBottom: "32px" }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22C55E", display: "inline-block", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#166534" }}>
            {waitlistCount}+ people on the waitlist
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(44px, 7vw, 88px)", fontWeight: "800",
          color: "#0F172A", letterSpacing: "-0.04em", lineHeight: "1.02",
          margin: "0 0 24px 0"
        }}>
          Your money,
          <br />
          <span style={{ color: "#22C55E" }}>finally</span> making sense.
        </h1>

        {/* Subheading */}
        <p style={{
          fontSize: "20px", color: "#64748B", lineHeight: "1.6",
          maxWidth: "560px", margin: "0 auto 40px", fontWeight: "400"
        }}>
          Casha tracks every rupee, destroys your debt, saves you{" "}
          <strong style={{ color: "#0F172A" }}>₹20,000–₹50,000 in taxes</strong>, and
          gives you an AI CFO available 24/7. Free forever.
        </p>

        {/* CTA */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
          <WaitlistForm />
        </div>
        <p style={{ fontSize: "13px", color: "#94A3B8", margin: 0 }}>
          Free forever · No credit card · Works with all Indian banks
        </p>

        {/* Trust logos */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", marginTop: "48px", flexWrap: "wrap" }}>
          <p style={{ fontSize: "12px", color: "#CBD5E1", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>Works with</p>
          {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "UPI", "GPay"].map(bank => (
            <span key={bank} style={{ fontSize: "13px", color: "#94A3B8", fontWeight: "600" }}>{bank}</span>
          ))}
        </div>
      </section>

      {/* ─── APP PREVIEW ─── */}
      <section style={{ padding: "0 24px 96px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{
          background: "#F8FAFC", border: "1px solid #E2E8F0",
          borderRadius: "20px", overflow: "hidden",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 40px 80px -20px rgba(0,0,0,0.1)"
        }}>
          {/* Browser bar */}
          <div style={{ background: "#F1F5F9", padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#FCA5A5" }} />
              <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#FCD34D" }} />
              <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#86EFAC" }} />
            </div>
            <div style={{ flex: 1, background: "#fff", borderRadius: "7px", padding: "5px 12px", display: "flex", alignItems: "center", gap: "6px", maxWidth: "220px", margin: "0 auto" }}>
              <span style={{ fontSize: "11px", color: "#22C55E" }}>🔒</span>
              <span style={{ fontSize: "11px", color: "#94A3B8" }}>app.casha.money</span>
            </div>
          </div>

          {/* Dashboard UI */}
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: "380px" }}>

            {/* Sidebar */}
            <div style={{ background: "#fff", borderRight: "1px solid #F1F5F9", padding: "20px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", padding: "0 8px" }}>
                <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", color: "#22C55E" }}>c</div>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#0F172A" }}>casha.money</span>
              </div>
              {[
                { icon: "📊", name: "Overview", active: true },
                { icon: "💳", name: "Transactions", active: false },
                { icon: "📋", name: "Budget", active: false },
                { icon: "💸", name: "Debts", active: false },
                { icon: "🧾", name: "Tax Genius", active: false },
                { icon: "🧠", name: "AI Advisor", active: false },
              ].map(item => (
                <div key={item.name} style={{
                  display: "flex", alignItems: "center", gap: "9px",
                  padding: "9px 10px", borderRadius: "9px", marginBottom: "2px",
                  background: item.active ? "#F8FAFC" : "transparent",
                  cursor: "pointer",
                }}>
                  <span style={{ fontSize: "14px" }}>{item.icon}</span>
                  <span style={{ fontSize: "13px", color: item.active ? "#0F172A" : "#94A3B8", fontWeight: item.active ? "600" : "400" }}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Main */}
            <div style={{ padding: "24px", background: "#FAFAFA" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "#94A3B8", margin: "0 0 2px 0" }}>Sunday, 20 April 2026</p>
                  <p style={{ fontSize: "18px", fontWeight: "700", color: "#0F172A", margin: 0 }}>Good afternoon, Rahul 👋</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "999px", padding: "5px 12px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#166534" }}>AI Active</span>
                </div>
              </div>

              {/* Metric cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "12px" }}>
                <div style={{ background: "#0F172A", borderRadius: "12px", padding: "14px" }}>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", margin: "0 0 4px 0", fontWeight: "600", textTransform: "uppercase" }}>Health Score</p>
                  <p style={{ fontSize: "26px", fontWeight: "800", color: "#22C55E", margin: "0 0 2px 0" }}>800</p>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", margin: 0 }}>Excellent — top 10%</p>
                </div>
                <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "14px" }}>
                  <p style={{ fontSize: "10px", color: "#94A3B8", margin: "0 0 4px 0", fontWeight: "600", textTransform: "uppercase" }}>Net Worth</p>
                  <p style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A", margin: "0 0 2px 0" }}>₹1,40,000</p>
                  <p style={{ fontSize: "10px", color: "#22C55E", margin: 0, fontWeight: "600" }}>↑ ₹15,000 this month</p>
                </div>
                <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "14px" }}>
                  <p style={{ fontSize: "10px", color: "#94A3B8", margin: "0 0 4px 0", fontWeight: "600", textTransform: "uppercase" }}>Savings Rate</p>
                  <p style={{ fontSize: "26px", fontWeight: "800", color: "#0F172A", margin: "0 0 2px 0" }}>65%</p>
                  <p style={{ fontSize: "10px", color: "#3B82F6", margin: 0, fontWeight: "600" }}>Target is 20% ✓</p>
                </div>
              </div>

              {/* AI Insight */}
              <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "14px", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0 }}>🧠</div>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: "700", color: "#0F172A", margin: "0 0 3px 0" }}>AI found ₹42,000 in potential tax savings</p>
                    <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>Switch to Old Regime + invest ₹1.5L in ELSS before 31 March. You're currently on track to overpay by ₹42,000.</p>
                  </div>
                </div>
              </div>

              {/* Transactions */}
              <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "12px 14px" }}>
                <p style={{ fontSize: "10px", fontWeight: "700", color: "#94A3B8", margin: "0 0 8px 0", textTransform: "uppercase" }}>Recent</p>
                {[
                  { name: "Company Salary", cat: "Salary", amount: "+₹75,000", color: "#22C55E" },
                  { name: "HDFC Home Loan EMI", cat: "EMI Payment", amount: "-₹15,000", color: "#64748B" },
                  { name: "Swiggy", cat: "Food Delivery", amount: "-₹2,500", color: "#64748B" },
                ].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 2 ? "1px solid #F8FAFC" : "none" }}>
                    <div>
                      <p style={{ fontSize: "12px", fontWeight: "600", color: "#0F172A", margin: 0 }}>{t.name}</p>
                      <p style={{ fontSize: "10px", color: "#94A3B8", margin: 0 }}>{t.cat}</p>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: t.color }}>{t.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROBLEM ─── */}
      <section style={{ background: "#F8FAFC", borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ ...S.section, textAlign: "center" }}>
          <Label>The problem</Label>
          <h2 style={{ ...S.h2, maxWidth: "600px", margin: "0 auto 16px" }}>
            Most people lose money every month without knowing it.
          </h2>
          <p style={{ ...S.body, maxWidth: "480px", margin: "0 auto 56px" }}>
            Not from reckless spending. From lack of visibility, missed deductions, and forgotten subscriptions.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            {problems.map((p, i) => (
              <div key={i} style={{ ...S.card, textAlign: "left" }}>
                <p style={{ fontSize: "38px", fontWeight: "800", color: "#0F172A", margin: "0 0 10px 0", letterSpacing: "-0.02em" }}>
                  {p.stat}
                </p>
                <p style={{ fontSize: "14px", color: "#374151", margin: "0 0 10px 0", lineHeight: "1.5" }}>
                  {p.desc}
                </p>
                <p style={{ fontSize: "11px", color: "#94A3B8", margin: 0, fontWeight: "500" }}>{p.source}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 50/30/20 RULE ─── */}
      <section id="rule" style={{ background: "#0F172A" }}>
        <div style={{ ...S.section, textAlign: "center" }}>
          <Label>Built-in framework</Label>
          <h2 style={{ ...S.h2, color: "#fff", maxWidth: "600px", margin: "0 auto 16px" }}>
            The 50/30/20 rule — adapted for India.
          </h2>
          <p style={{ ...S.body, color: "rgba(255,255,255,0.5)", maxWidth: "500px", margin: "0 auto 56px" }}>
            The most proven budgeting framework in the world, tuned for Indian salaries,
            tax laws, and spending habits. Casha applies it automatically.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "48px" }}>
            {rule5030.map((r, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "38px", fontWeight: "800", color: r.color }}>{r.percent}</span>
                  <span style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>{r.label}</span>
                </div>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "0 0 20px 0" }}>{r.caption}</p>
                <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "16px" }} />
                {r.items.map((item, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: r.color, flexShrink: 0, display: "block" }} />
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Example */}
          <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "16px", padding: "28px", maxWidth: "700px", margin: "0 auto" }}>
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#22C55E", margin: "0 0 20px 0", textAlign: "center", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Example — ₹75,000/month salary
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              {rule5030.map((r, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "26px", fontWeight: "800", color: r.color, margin: "0 0 4px 0" }}>{r.amount}</p>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", margin: 0 }}>{r.label}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: "20px", marginBottom: 0 }}>
              Casha generates this budget automatically from your income — one click.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" style={{ background: "#fff" }}>
        <div style={S.section}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <Label>Features</Label>
            <h2 style={{ ...S.h2, maxWidth: "560px", margin: "0 auto 16px" }}>
              Everything your finances need. Nothing they don't.
            </h2>
            <p style={{ ...S.body, maxWidth: "460px", margin: "0 auto 0" }}>
              What a ₹30 lakh/year CFO does — automated, AI-powered, and free.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {features.map((f, i) => (
              <div key={i} style={{
                ...S.card,
                display: "grid",
                gridTemplateColumns: i % 2 === 0 ? "1fr 1fr" : "1fr 1fr",
                gap: "40px", alignItems: "center",
                padding: "40px 48px",
                direction: i % 2 !== 0 ? "rtl" : "ltr"
              }}>
                <div style={{ direction: "ltr" }}>
                  <p style={{ fontSize: "11px", fontWeight: "700", color: "#22C55E", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px 0" }}>
                    {f.tag}
                  </p>
                  <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#0F172A", margin: "0 0 14px 0", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: "16px", color: "#64748B", margin: 0, lineHeight: "1.7" }}>
                    {f.desc}
                  </p>
                </div>
                <div style={{ direction: "ltr" }}>
                  <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                        {f.icon}
                      </div>
                      <p style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", margin: 0 }}>Casha AI</p>
                    </div>
                    <p style={{ fontSize: "14px", color: "#374151", margin: 0, lineHeight: "1.6", fontFamily: "monospace" }}>
                      {f.proof}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPETITOR TABLE ─── */}
      <section style={{ background: "#F8FAFC", borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ ...S.section, textAlign: "center" }}>
          <Label>Comparison</Label>
          <h2 style={{ ...S.h2, maxWidth: "500px", margin: "0 auto 16px" }}>
            Built for India. Built better.
          </h2>
          <p style={{ ...S.body, maxWidth: "400px", margin: "0 auto 48px" }}>
            No other app covers your complete financial life — especially for India.
          </p>

          <div style={{ maxWidth: "800px", margin: "0 auto", borderRadius: "16px", overflow: "hidden", border: "1px solid #E2E8F0", textAlign: "left" }}>
            {competitors.map((row, i) => (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "1fr repeat(4, 100px)",
                padding: "13px 20px",
                background: i === 0 ? "#0F172A" : i % 2 === 0 ? "#fff" : "#F8FAFC",
                borderBottom: i < competitors.length - 1 ? "1px solid #E2E8F0" : "none",
                alignItems: "center",
                gap: "8px"
              }}>
                {row.map((cell, j) => (
                  <div key={j} style={{ textAlign: j === 0 ? "left" : "center" }}>
                    {i === 0 ? (
                      <span style={{ fontSize: "13px", fontWeight: "700", color: j === 1 ? "#22C55E" : "rgba(255,255,255,0.5)" }}>
                        {cell}{j === 1 ? " ✦" : ""}
                      </span>
                    ) : (
                      <span style={{ fontSize: j === 0 ? "13px" : "16px", color: j === 0 ? "#374151" : "inherit", fontWeight: j === 0 ? "500" : "400" }}>
                        {cell}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ background: "#fff" }}>
        <div style={{ ...S.section, textAlign: "center" }}>
          <Label>How it works</Label>
          <h2 style={{ ...S.h2, maxWidth: "500px", margin: "0 auto 56px" }}>
            Up and running in 2 minutes.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            {steps.map((s, i) => (
              <div key={i} style={{ ...S.card, textAlign: "left", position: "relative" }}>
                <p style={{ fontSize: "42px", fontWeight: "800", color: "#F1F5F9", margin: "0 0 16px 0", letterSpacing: "-0.03em" }}>{s.n}</p>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", margin: "0 0 8px 0" }}>{s.title}</h3>
                <p style={{ fontSize: "14px", color: "#64748B", margin: 0, lineHeight: "1.6" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" style={{ background: "#F8FAFC", borderTop: "1px solid #E2E8F0" }}>
        <div style={{ ...S.section, textAlign: "center" }}>
          <Label>Pricing</Label>
          <h2 style={{ ...S.h2, maxWidth: "440px", margin: "0 auto 16px" }}>
            Simple, transparent pricing.
          </h2>
          <p style={{ ...S.body, maxWidth: "380px", margin: "0 auto 48px" }}>
            Start free. Upgrade when you're ready. No surprise charges.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", maxWidth: "860px", margin: "0 auto", textAlign: "left" }}>
            {pricing.map((plan, i) => (
              <div key={i} style={{
                background: plan.highlight ? "#0F172A" : "#fff",
                border: plan.highlight ? "2px solid #22C55E" : "1px solid #E2E8F0",
                borderRadius: "18px", padding: "32px",
                display: "flex", flexDirection: "column",
                position: "relative"
              }}>
                {plan.badge && (
                  <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "#22C55E", color: "#fff", fontSize: "11px", fontWeight: "700", padding: "4px 14px", borderRadius: "999px", whiteSpace: "nowrap" }}>
                    {plan.badge}
                  </div>
                )}
                <p style={{ fontSize: "14px", fontWeight: "600", color: plan.highlight ? "rgba(255,255,255,0.4)" : "#94A3B8", margin: "0 0 8px 0" }}>
                  {plan.name}
                </p>
                <div style={{ marginBottom: "6px" }}>
                  <span style={{ fontSize: "40px", fontWeight: "800", color: plan.highlight ? "#fff" : "#0F172A", letterSpacing: "-0.02em" }}>
                    {plan.price}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: plan.highlight ? "rgba(255,255,255,0.3)" : "#94A3B8", margin: "0 0 24px 0" }}>
                  {plan.caption}
                </p>
                <div style={{ flex: 1, marginBottom: "24px" }}>
                  {plan.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: "9px", marginBottom: "11px" }}>
                      <span style={{ color: "#22C55E", fontSize: "13px", flexShrink: 0, marginTop: "1px" }}>✓</span>
                      <span style={{ fontSize: "13px", color: plan.highlight ? "rgba(255,255,255,0.65)" : "#374151", lineHeight: "1.4" }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
                <a href={plan.href} style={{
                  display: "block", textAlign: "center", padding: "14px 20px",
                  borderRadius: "12px", textDecoration: "none",
                  fontSize: "14px", fontWeight: "700",
                  background: plan.highlight ? "#22C55E" : "#0F172A",
                  color: "#fff",
                  transition: "opacity 0.2s"
                }}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ background: "#fff", borderTop: "1px solid #E2E8F0" }}>
        <div style={{ ...S.section, textAlign: "center" }}>
          <Label>Real results</Label>
          <h2 style={{ ...S.h2, maxWidth: "440px", margin: "0 auto 48px" }}>
            People are already saving more.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {[
              { q: "Found ₹2,916/month in subscriptions I completely forgot about. Cancelled 4 apps in 10 minutes. The tax optimizer then found another ₹38,000 in deductions.", name: "Rahul M.", role: "Software Engineer · Bangalore" },
              { q: "The SMS parser is unbelievable. I forward bank messages and transactions appear instantly. My bank balance and Casha always match to the rupee. No more manual entry.", name: "Priya S.", role: "Marketing Manager · Mumbai" },
              { q: "Switched from New to Old tax regime after Casha's analysis. Invested ₹1.5L in ELSS. Saved ₹42,000 in taxes. My CA confirmed everything was right.", name: "Arun K.", role: "Startup Founder · Hyderabad" },
            ].map((t, i) => (
              <div key={i} style={{ ...S.card, textAlign: "left" }}>
                <div style={{ display: "flex", gap: "2px", marginBottom: "16px" }}>
                  {[...Array(5)].map((_, j) => <span key={j} style={{ color: "#F59E0B" }}>★</span>)}
                </div>
                <p style={{ fontSize: "15px", color: "#374151", lineHeight: "1.7", margin: "0 0 24px 0" }}>"{t.q}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#64748B" }}>
                    {t.name.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#0F172A", margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" style={{ background: "#F8FAFC", borderTop: "1px solid #E2E8F0" }}>
        <div style={{ ...S.section, maxWidth: "700px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <Label>FAQ</Label>
            <h2 style={{ ...S.h2 }}>Common questions.</h2>
          </div>
          <div style={{ border: "1px solid #E2E8F0", borderRadius: "16px", overflow: "hidden", background: "#fff" }}>
            {faqs.map((item, i) => (
              <div key={i} style={{ borderBottom: i < faqs.length - 1 ? "1px solid #E2E8F0" : "none" }}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{
                    width: "100%", padding: "20px 24px", background: "none", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    cursor: "pointer", textAlign: "left", gap: "16px", fontFamily: "inherit"
                  }}
                >
                  <span style={{ fontSize: "15px", fontWeight: "600", color: "#0F172A", lineHeight: "1.4" }}>
                    {item.q}
                  </span>
                  <span style={{
                    fontSize: "22px", color: "#94A3B8", flexShrink: 0,
                    transform: faqOpen === i ? "rotate(45deg)" : "none",
                    transition: "transform 0.2s ease",
                    display: "inline-block"
                  }}>+</span>
                </button>
                {faqOpen === i && (
                  <div style={{ padding: "0 24px 20px" }}>
                    <p style={{ fontSize: "15px", color: "#64748B", margin: 0, lineHeight: "1.75" }}>
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section style={{ background: "#0F172A" }}>
        <div style={{ ...S.section, textAlign: "center", maxWidth: "640px" }}>
          <h2 style={{ ...S.h2, color: "#fff", margin: "0 0 16px 0" }}>
            Start managing your money properly.{" "}
            <span style={{ color: "#22C55E" }}>Today.</span>
          </h2>
          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.45)", lineHeight: "1.6", margin: "0 0 40px 0" }}>
            Free forever. Works with all Indian banks. Your data stays yours.
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <WaitlistForm variant="dark" />
          </div>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.2)", margin: 0 }}>
            No credit card · Unsubscribe anytime · GDPR & DPDPA compliant
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: "#0F172A", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", color: "#0F172A" }}>c</div>
              <span style={{ fontSize: "16px", fontWeight: "800", color: "#fff", letterSpacing: "-0.02em" }}>casha.money</span>
            </div>
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              {[["Features", "#features"], ["Pricing", "#pricing"], ["FAQ", "#faq"], ["Sign in", "/auth/login"], ["Sign up", "/auth/signup"]].map(([l, h]) => (
                <a key={l} href={h} style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>{l}</a>
              ))}
            </div>
          </div>
          <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", marginBottom: "24px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", margin: 0 }}>
              © 2026 Casha Money Technologies. All rights reserved.
            </p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)", margin: 0, maxWidth: "480px", textAlign: "right", lineHeight: "1.5" }}>
              Casha is a financial education and management platform. Not a licensed investment advisor.
              Consult qualified professionals for investment, tax, and legal decisions.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        a:hover { opacity: 0.8; }
      `}</style>
    </div>
  );
}