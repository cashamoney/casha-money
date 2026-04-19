"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

// ── Waitlist Form ──
function WaitlistForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
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
      setState("done");
    } catch {
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        background: dark ? "rgba(34,197,94,0.1)" : "#F0FDF4",
        border: "1px solid #BBF7D0", borderRadius: "16px", padding: "16px 20px"
      }}>
        <span style={{ fontSize: "28px" }}>🎉</span>
        <div>
          <p style={{ fontSize: "15px", fontWeight: "700", color: "#166534", margin: "0 0 2px 0" }}>
            You're #{position} on the list!
          </p>
          <p style={{ fontSize: "12px", color: "#16A34A", margin: 0 }}>
            We'll notify you the moment Casha launches.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: "8px", width: "100%", maxWidth: "480px" }}>
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email address"
        style={{
          flex: 1, height: "52px", borderRadius: "14px", padding: "0 18px",
          fontSize: "14px", outline: "none",
          background: dark ? "rgba(255,255,255,0.08)" : "#fff",
          border: dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid #E5E7EB",
          color: dark ? "#fff" : "#0C0D10",
        }}
      />
      <button
        type="submit"
        disabled={state === "loading"}
        style={{
          height: "52px", padding: "0 24px", borderRadius: "14px", border: "none",
          background: "linear-gradient(135deg, #22C55E, #16A34A)",
          color: "#fff", fontSize: "14px", fontWeight: "700",
          cursor: "pointer", whiteSpace: "nowrap",
          boxShadow: "0 4px 14px rgba(34,197,94,0.4)",
        }}
      >
        {state === "loading" ? "Joining..." : "Get Early Access →"}
      </button>
    </form>
  );
}

// ── Reveal Animation ──
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Stat Card ──
function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: "36px", fontWeight: "800", color: "#0C0D10", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
        {number}
      </p>
      <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>{label}</p>
    </div>
  );
}

// ── Feature Card ──
function FeatureCard({ emoji, title, desc, delay }: { emoji: string; title: string; desc: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      style={{
        background: "#fff", border: "1px solid #E5E7EB", borderRadius: "20px",
        padding: "28px", cursor: "default",
        transition: "all 0.2s",
      }}
      whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}
    >
      <div style={{ fontSize: "32px", marginBottom: "16px" }}>{emoji}</div>
      <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0C0D10", margin: "0 0 8px 0" }}>{title}</h3>
      <p style={{ fontSize: "13px", color: "#6B7280", margin: 0, lineHeight: "1.6" }}>{desc}</p>
    </motion.div>
  );
}

export default function LandingPage() {
  const [faq, setFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const features = [
    { emoji: "🧠", title: "AI CFO — Available 24/7", desc: "Ask anything about your money. Get CFO-level advice based on YOUR real transactions, not generic tips." },
    { emoji: "📊", title: "Smart Dashboard", desc: "See your complete financial picture in one place. Health score, net worth, income vs expenses — live." },
    { emoji: "💸", title: "Debt Destroyer™", desc: "See your exact debt-free date. AI creates the optimal payoff strategy saving you lakhs in interest." },
    { emoji: "🎯", title: "Savings Goals", desc: "Set goals, automate savings, track progress. Round-up every purchase toward your dreams." },
    { emoji: "🧾", title: "Tax Genius™ India", desc: "Old vs New regime optimizer. Finds every deduction — 80C, 80D, HRA, NPS. Save ₹20K-₹50K+ per year." },
    { emoji: "🔄", title: "Subscription Killer", desc: "Auto-detects all subscriptions. Finds wasted money. 'You're paying ₹2,400/month for unused services.'" },
    { emoji: "📱", title: "SMS Parser — India", desc: "Paste any bank SMS — SBI, HDFC, ICICI, all banks. Auto-creates transaction in 1 second." },
    { emoji: "📋", title: "AI Budget System", desc: "AI generates your budget based on income using the India-adapted 50/30/20 rule. One click." },
    { emoji: "🛡️", title: "Bank-Level Security", desc: "AES-256 encryption. Row Level Security. Your data is yours — never sold, never shared." },
  ];

  const competitors = [
    { feature: "AI CFO with real data", casha: true, mint: false, cred: false, ynab: false },
    { feature: "India Tax Optimizer", casha: true, mint: false, cred: false, ynab: false },
    { feature: "SMS Parser (Indian banks)", casha: true, mint: false, cred: false, ynab: false },
    { feature: "Old vs New regime", casha: true, mint: false, cred: false, ynab: false },
    { feature: "Subscription auto-detect", casha: true, mint: true, cred: false, ynab: false },
    { feature: "Debt payoff optimizer", casha: true, mint: true, cred: false, ynab: true },
    { feature: "Free forever plan", casha: true, mint: false, cred: true, ynab: false },
    { feature: "Works without bank switch", casha: true, mint: true, cred: false, ynab: true },
    { feature: "50/30/20 budget AI", casha: true, mint: false, cred: false, ynab: false },
  ];

  const faqs = [
    { q: "Is the free plan really free?", a: "Yes. No credit card, no trial period, no hidden charges. Our free plan includes transaction tracking, health score, AI advisor (10 questions/day), tax optimizer, and more — forever." },
    { q: "How does Casha access my bank data?", a: "You manually add transactions, paste bank SMS messages, or upload bank statements. We never ask for your internet banking password. Your credentials stay with you." },
    { q: "Is my financial data safe?", a: "Absolutely. We use AES-256 encryption (same as banks), Row Level Security so no one can see your data, and we never sell your data to anyone — ever." },
    { q: "Which banks and apps are supported?", a: "All Indian banks via SMS parsing — SBI, HDFC, ICICI, Axis, Kotak, PNB, BOB, and more. Also supports UPI apps like GPay, PhonePe, Paytm." },
    { q: "How is Casha different from CRED or Jupiter?", a: "CRED only works with credit cards. Jupiter requires you to open a new bank account. Casha works with ALL your existing accounts, tracks all transactions, and gives you an AI CFO — completely free." },
    { q: "What is the 50/30/20 rule?", a: "It's a simple budgeting framework: 50% of income for needs (rent, food, bills), 30% for wants (entertainment, shopping), 20% for savings and investments. Casha adapts this for Indian income levels and automatically generates your personalized budget." },
  ];

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#FAFAFA", color: "#0C0D10", overflowX: "hidden" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
        background: scrolled ? "rgba(250,250,250,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid #E5E7EB" : "none",
        transition: "all 0.3s",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "10px",
            background: "linear-gradient(135deg, #22C55E, #3B82F6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: "800", fontSize: "16px"
          }}>C</div>
          <span style={{ fontSize: "18px", fontWeight: "800", color: "#0C0D10", letterSpacing: "-0.02em" }}>
            casha<span style={{ color: "#22C55E" }}>.money</span>
          </span>
        </div>

        {/* Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          {[["Features", "#features"], ["50/30/20", "#rule"], ["Pricing", "#pricing"], ["FAQ", "#faq"]].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: "14px", color: "#6B7280", textDecoration: "none", fontWeight: "500" }}>
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/auth/login" style={{ fontSize: "14px", color: "#6B7280", textDecoration: "none", fontWeight: "500" }}>
            Sign in
          </a>
          <a href="/auth/signup" style={{
            fontSize: "14px", fontWeight: "700", padding: "8px 20px",
            borderRadius: "10px", textDecoration: "none",
            background: "#0C0D10", color: "#fff"
          }}>
            Get Started Free →
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: "140px", paddingBottom: "80px", paddingLeft: "40px", paddingRight: "40px", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}
        >
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "#F0FDF4", border: "1px solid #BBF7D0",
            borderRadius: "999px", padding: "6px 16px",
            fontSize: "13px", fontWeight: "600", color: "#166534"
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
            Now live — Join the waitlist
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: "clamp(40px, 6vw, 80px)", fontWeight: "800",
            letterSpacing: "-0.04em", lineHeight: "1.05",
            margin: "0 0 24px 0", color: "#0C0D10"
          }}
        >
          The financial advisor
          <br />
          <span style={{ background: "linear-gradient(135deg, #22C55E, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            everyone deserves.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: "18px", color: "#6B7280", maxWidth: "560px", margin: "0 auto 40px", lineHeight: "1.7" }}
        >
          AI that tracks your money, destroys debt, saves taxes, and builds a
          personalized plan to grow your wealth. <strong style={{ color: "#0C0D10" }}>Free for everyone.</strong>
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}
        >
          <WaitlistForm />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "60px" }}
        >
          🔒 Free forever · No credit card · Unsubscribe anytime
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px", maxWidth: "600px", margin: "0 auto 80px" }}
        >
          <StatCard number="13+" label="Features built" />
          <StatCard number="18+" label="Countries" />
          <StatCard number="₹0" label="To start" />
          <StatCard number="24/7" label="AI advisor" />
        </motion.div>

        {/* App Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{
            background: "#fff", border: "1px solid #E5E7EB", borderRadius: "24px",
            padding: "24px", boxShadow: "0 24px 80px rgba(0,0,0,0.08)",
            maxWidth: "900px", margin: "0 auto"
          }}
        >
          {/* Browser chrome */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#FF5F57" }} />
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#FEBC2E" }} />
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#28C840" }} />
            <div style={{ flex: 1, background: "#F3F4F6", borderRadius: "6px", padding: "4px 12px", margin: "0 12px", fontSize: "11px", color: "#9CA3AF" }}>
              app.casha.money
            </div>
          </div>

          {/* Dashboard preview */}
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "16px", minHeight: "320px" }}>
            {/* Sidebar */}
            <div style={{ background: "#F9FAFB", borderRadius: "16px", padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "linear-gradient(135deg, #22C55E, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#fff" }}>C</div>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#0C0D10" }}>casha.money</span>
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
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "8px 10px", borderRadius: "8px", marginBottom: "2px",
                  background: item.active ? "#fff" : "transparent",
                  boxShadow: item.active ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  fontSize: "12px", color: item.active ? "#0C0D10" : "#9CA3AF", fontWeight: item.active ? "600" : "400"
                }}>
                  <span>{item.icon}</span>{item.name}
                </div>
              ))}
            </div>

            {/* Main content */}
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "12px" }}>
                <div style={{ background: "#0C0D10", borderRadius: "12px", padding: "14px" }}>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", margin: "0 0 4px 0" }}>HEALTH SCORE</p>
                  <p style={{ fontSize: "24px", fontWeight: "800", color: "#22C55E", margin: 0 }}>800</p>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", margin: "4px 0 0 0" }}>Excellent 🎉</p>
                </div>
                <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "12px", padding: "14px" }}>
                  <p style={{ fontSize: "10px", color: "#166534", margin: "0 0 4px 0" }}>NET WORTH</p>
                  <p style={{ fontSize: "18px", fontWeight: "800", color: "#166534", margin: 0 }}>₹1,40,000</p>
                  <p style={{ fontSize: "10px", color: "#16A34A", margin: "4px 0 0 0" }}>↑ ₹15,000 this month</p>
                </div>
                <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "12px", padding: "14px" }}>
                  <p style={{ fontSize: "10px", color: "#1E40AF", margin: "0 0 4px 0" }}>SAVINGS RATE</p>
                  <p style={{ fontSize: "24px", fontWeight: "800", color: "#1D4ED8", margin: 0 }}>68%</p>
                  <p style={{ fontSize: "10px", color: "#3B82F6", margin: "4px 0 0 0" }}>Above average 👍</p>
                </div>
              </div>

              {/* AI Insight */}
              <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "12px", padding: "12px", marginBottom: "10px" }}>
                <p style={{ fontSize: "11px", fontWeight: "700", color: "#92400E", margin: "0 0 4px 0" }}>🧠 AI spotted something</p>
                <p style={{ fontSize: "11px", color: "#78350F", margin: 0 }}>Netflix + Hotstar + Amazon Prime — ₹1,200/mo. Consider cancelling 1. Save ₹14,400/year.</p>
              </div>

              {/* Mini transactions */}
              <div style={{ background: "#F9FAFB", borderRadius: "12px", padding: "12px" }}>
                <p style={{ fontSize: "10px", fontWeight: "700", color: "#9CA3AF", margin: "0 0 8px 0" }}>RECENT TRANSACTIONS</p>
                {[
                  { name: "Company Salary", amount: "+₹75,000", color: "#16A34A" },
                  { name: "HDFC EMI", amount: "-₹15,000", color: "#0C0D10" },
                  { name: "Swiggy", amount: "-₹2,500", color: "#0C0D10" },
                ].map(t => (
                  <div key={t.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", color: "#6B7280" }}>{t.name}</span>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: t.color }}>{t.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── PROBLEM SECTION ── */}
      <section style={{ background: "#fff", padding: "80px 40px", borderTop: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <Reveal>
            <p style={{ fontSize: "12px", fontWeight: "700", color: "#22C55E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", textAlign: "center" }}>
              The Problem
            </p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "800", color: "#0C0D10", textAlign: "center", margin: "0 0 16px 0", letterSpacing: "-0.03em" }}>
              Most people lose money every month.
              <br />
              <span style={{ color: "#9CA3AF" }}>Without even knowing it.</span>
            </h2>
            <p style={{ fontSize: "16px", color: "#6B7280", textAlign: "center", maxWidth: "500px", margin: "0 auto 48px", lineHeight: "1.7" }}>
              Not because they're careless. Because good financial advice
              has always been reserved for the wealthy.
            </p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            {[
              { stat: "78%", desc: "of Indians live paycheck to paycheck", source: "RBI Data 2024" },
              { stat: "₹1.2L", desc: "average annual tax overpayment", source: "Income Tax Dept." },
              { stat: "₹2,400", desc: "wasted monthly on unused subscriptions", source: "Casha Analysis" },
              { stat: "64%", desc: "not on track for retirement", source: "PFRDA Report" },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "20px", padding: "24px" }}>
                  <p style={{ fontSize: "36px", fontWeight: "800", color: "#0C0D10", margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
                    {item.stat}
                  </p>
                  <p style={{ fontSize: "14px", color: "#374151", margin: "0 0 8px 0", lineHeight: "1.4" }}>
                    {item.desc}
                  </p>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>{item.source}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 50/30/20 RULE ── */}
      <section id="rule" style={{ padding: "80px 40px", background: "#0C0D10" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <Reveal>
            <p style={{ fontSize: "12px", fontWeight: "700", color: "#22C55E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", textAlign: "center" }}>
              Built-in Framework
            </p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "800", color: "#fff", textAlign: "center", margin: "0 0 16px 0", letterSpacing: "-0.03em" }}>
              The 50/30/20 Rule —
              <br />
              <span style={{ color: "#22C55E" }}>India Adapted.</span>
            </h2>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", textAlign: "center", maxWidth: "520px", margin: "0 auto 48px", lineHeight: "1.7" }}>
              The world's most proven budgeting framework, adapted for Indian
              income levels and spending patterns. Casha applies it automatically.
            </p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "48px" }}>
            {[
              {
                percent: "50%", label: "Needs", color: "#3B82F6",
                items: ["Housing / Rent", "Groceries", "Utilities & Bills", "EMI Payments", "Insurance", "Transport"],
                desc: "Essential expenses you cannot avoid"
              },
              {
                percent: "30%", label: "Wants", color: "#F59E0B",
                items: ["Dining & Food Delivery", "Entertainment", "Shopping", "Subscriptions", "Travel", "Hobbies"],
                desc: "Lifestyle expenses that bring joy"
              },
              {
                percent: "20%", label: "Save & Invest", color: "#22C55E",
                items: ["Emergency Fund", "SIP / Mutual Funds", "PPF / NPS", "ELSS (Tax Saving)", "FD / RD", "Gold"],
                desc: "Build wealth and secure your future"
              },
            ].map((section, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "20px", padding: "28px", height: "100%"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "40px", fontWeight: "800", color: section.color }}>
                      {section.percent}
                    </span>
                    <div>
                      <p style={{ fontSize: "18px", fontWeight: "700", color: "#fff", margin: "0 0 2px 0" }}>
                        {section.label}
                      </p>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
                        {section.desc}
                      </p>
                    </div>
                  </div>
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", marginBottom: "16px" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {section.items.map(item => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: section.color, flexShrink: 0 }} />
                        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Example */}
          <Reveal>
            <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "20px", padding: "28px" }}>
              <p style={{ fontSize: "14px", fontWeight: "700", color: "#22C55E", margin: "0 0 16px 0", textAlign: "center" }}>
                📊 Example: ₹75,000/month salary
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {[
                  { label: "50% Needs", amount: "₹37,500", color: "#3B82F6", items: "Rent ₹15K · EMI ₹11.25K · Food ₹7.5K · Bills ₹3.75K" },
                  { label: "30% Wants", amount: "₹22,500", color: "#F59E0B", items: "Shopping ₹7.5K · Dining ₹6K · Entertainment ₹5K · Travel ₹4K" },
                  { label: "20% Savings", amount: "₹15,000", color: "#22C55E", items: "SIP ₹5K · PPF ₹2.5K · Emergency ₹5K · ELSS ₹2.5K" },
                ].map((col, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", margin: "0 0 4px 0" }}>{col.label}</p>
                    <p style={{ fontSize: "24px", fontWeight: "800", color: col.color, margin: "0 0 8px 0" }}>{col.amount}</p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: 0, lineHeight: "1.5" }}>{col.items}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: "16px", marginBottom: 0 }}>
                🤖 Casha auto-generates this budget for you based on your actual income.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "80px 40px", background: "#FAFAFA" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <Reveal>
            <p style={{ fontSize: "12px", fontWeight: "700", color: "#22C55E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", textAlign: "center" }}>
              Everything you need
            </p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "800", color: "#0C0D10", textAlign: "center", margin: "0 0 16px 0", letterSpacing: "-0.03em" }}>
              13 powerful features.
              <br />
              <span style={{ color: "#9CA3AF" }}>One beautiful app.</span>
            </h2>
            <p style={{ fontSize: "16px", color: "#6B7280", textAlign: "center", maxWidth: "480px", margin: "0 auto 48px", lineHeight: "1.7" }}>
              Everything a ₹30 lakh/year CFO would do for you — automated, AI-powered, and free.
            </p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.04} />
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPETITOR COMPARISON ── */}
      <section style={{ padding: "80px 40px", background: "#fff", borderTop: "1px solid #E5E7EB" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <Reveal>
            <p style={{ fontSize: "12px", fontWeight: "700", color: "#22C55E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", textAlign: "center" }}>
              Why Casha
            </p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "800", color: "#0C0D10", textAlign: "center", margin: "0 0 48px 0", letterSpacing: "-0.03em" }}>
              Built different.
            </h2>
          </Reveal>

          <Reveal>
            <div style={{ background: "#F9FAFB", borderRadius: "24px", overflow: "hidden", border: "1px solid #E5E7EB" }}>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(4, 120px)", background: "#0C0D10", padding: "16px 24px", gap: "8px" }}>
                <div />
                {[
                  { name: "Casha", highlight: true },
                  { name: "Mint", highlight: false },
                  { name: "CRED", highlight: false },
                  { name: "YNAB", highlight: false },
                ].map(col => (
                  <div key={col.name} style={{ textAlign: "center" }}>
                    <span style={{
                      fontSize: "13px", fontWeight: "700",
                      color: col.highlight ? "#22C55E" : "rgba(255,255,255,0.5)"
                    }}>
                      {col.name}
                      {col.highlight && " ✦"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Rows */}
              {competitors.map((row, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr repeat(4, 120px)",
                  padding: "14px 24px", gap: "8px",
                  background: i % 2 === 0 ? "#fff" : "#F9FAFB",
                  borderBottom: i < competitors.length - 1 ? "1px solid #E5E7EB" : "none",
                  alignItems: "center"
                }}>
                  <span style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>{row.feature}</span>
                  {[row.casha, row.mint, row.cred, row.ynab].map((val, j) => (
                    <div key={j} style={{ textAlign: "center" }}>
                      <span style={{
                        fontSize: "18px",
                        filter: j === 0 ? "none" : "grayscale(0)"
                      }}>
                        {val ? "✅" : "❌"}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "80px 40px", background: "#FAFAFA", borderTop: "1px solid #E5E7EB" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "800", color: "#0C0D10", textAlign: "center", margin: "0 0 48px 0", letterSpacing: "-0.03em" }}>
              Up and running in 2 minutes.
            </h2>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            {[
              { step: "1", title: "Create account", desc: "Sign up free. No credit card. Takes 30 seconds." },
              { step: "2", title: "Add transactions", desc: "Paste bank SMS or add manually. All Indian banks supported." },
              { step: "3", title: "AI analyzes", desc: "Transactions categorized. Health score calculated. Insights ready." },
              { step: "4", title: "Watch wealth grow", desc: "Follow AI recommendations. See your score rise every month." },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "20px", padding: "28px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: "#0C0D10", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "16px", fontWeight: "800", marginBottom: "16px"
                  }}>
                    {item.step}
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0C0D10", margin: "0 0 8px 0" }}>{item.title}</h3>
                  <p style={{ fontSize: "13px", color: "#6B7280", margin: 0, lineHeight: "1.6" }}>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "80px 40px", background: "#fff", borderTop: "1px solid #E5E7EB" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <Reveal>
            <p style={{ fontSize: "12px", fontWeight: "700", color: "#22C55E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", textAlign: "center" }}>
              Pricing
            </p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "800", color: "#0C0D10", textAlign: "center", margin: "0 0 16px 0", letterSpacing: "-0.03em" }}>
              Simple. Transparent. Fair.
            </h2>
            <p style={{ fontSize: "16px", color: "#6B7280", textAlign: "center", margin: "0 auto 48px", maxWidth: "400px" }}>
              Start free. Upgrade when you're ready. Cancel anytime.
            </p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            {[
              {
                name: "Free", price: "₹0", period: "forever",
                color: "#6B7280", highlight: false,
                features: [
                  "Dashboard + Health Score",
                  "Transaction tracking",
                  "SMS Parser (all banks)",
                  "AI Advisor (10/day)",
                  "Tax Genius (India)",
                  "Budget (50/30/20)",
                  "Goals + Debt tracker",
                  "Subscription detector",
                ],
                cta: "Get Started Free",
                ctaHref: "/auth/signup"
              },
              {
                name: "Plus", price: "₹149", period: "per month",
                color: "#22C55E", highlight: true,
                features: [
                  "Everything in Free",
                  "Unlimited AI Advisor",
                  "Advanced tax optimizer",
                  "Investment tracker",
                  "Insurance analyzer",
                  "Retirement planner",
                  "WhatsApp alerts",
                  "Priority support",
                ],
                cta: "Start Free Trial",
                ctaHref: "/auth/signup"
              },
              {
                name: "Business", price: "₹499", period: "per month",
                color: "#3B82F6", highlight: false,
                features: [
                  "Everything in Plus",
                  "Invoicing system",
                  "Cash flow forecast",
                  "P&L statements",
                  "GST reports",
                  "Client management",
                  "Team access (5 users)",
                  "API access",
                ],
                cta: "Contact Us",
                ctaHref: "mailto:casha.moneyofficial@gmail.com"
              },
            ].map((plan, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={{
                  background: plan.highlight ? "#0C0D10" : "#F9FAFB",
                  border: plan.highlight ? "2px solid #22C55E" : "1px solid #E5E7EB",
                  borderRadius: "24px", padding: "32px",
                  position: "relative", height: "100%",
                  display: "flex", flexDirection: "column"
                }}>
                  {plan.highlight && (
                    <div style={{
                      position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
                      background: "#22C55E", color: "#fff", fontSize: "11px", fontWeight: "700",
                      padding: "4px 16px", borderRadius: "999px"
                    }}>
                      MOST POPULAR
                    </div>
                  )}
                  <p style={{ fontSize: "14px", fontWeight: "600", color: plan.highlight ? "rgba(255,255,255,0.5)" : "#6B7280", margin: "0 0 8px 0" }}>
                    {plan.name}
                  </p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "40px", fontWeight: "800", color: plan.highlight ? "#fff" : "#0C0D10", letterSpacing: "-0.02em" }}>
                      {plan.price}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: plan.highlight ? "rgba(255,255,255,0.4)" : "#9CA3AF", margin: "0 0 24px 0" }}>
                    {plan.period}
                  </p>
                  <div style={{ flex: 1, marginBottom: "24px" }}>
                    {plan.features.map(feature => (
                      <div key={feature} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "14px", color: plan.highlight ? "#22C55E" : "#22C55E", flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: "13px", color: plan.highlight ? "rgba(255,255,255,0.7)" : "#374151" }}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                  <a href={plan.ctaHref} style={{
                    display: "block", textAlign: "center", padding: "14px",
                    borderRadius: "12px", textDecoration: "none", fontWeight: "700",
                    fontSize: "14px",
                    background: plan.highlight ? "#22C55E" : "#0C0D10",
                    color: "#fff",
                  }}>
                    {plan.cta}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "80px 40px", background: "#FAFAFA", borderTop: "1px solid #E5E7EB" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "800", color: "#0C0D10", textAlign: "center", margin: "0 0 48px 0", letterSpacing: "-0.03em" }}>
              Real people. Real results.
            </h2>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            {[
              {
                quote: "Found ₹2,400/month in subscriptions I completely forgot about. Cancelled 3 apps in 10 minutes. The app paid for itself immediately.",
                name: "Rahul M.", role: "Software Engineer · Bangalore", initials: "RM", color: "#EEF2FF"
              },
              {
                quote: "Tax optimizer found ₹35,000 in deductions my CA missed. Switched from new to old regime and saved ₹28,000 more. Incredible.",
                name: "Priya S.", role: "Marketing Manager · Mumbai", initials: "PS", color: "#F0FDF4"
              },
              {
                quote: "The SMS parser is a game changer. I paste my bank messages and transactions appear instantly. No more manual entry ever.",
                name: "Arun K.", role: "Startup Founder · Hyderabad", initials: "AK", color: "#FFF7ED"
              },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "20px", padding: "28px" }}>
                  <div style={{ display: "flex", gap: "2px", marginBottom: "16px" }}>
                    {[...Array(5)].map((_, j) => (
                      <span key={j} style={{ color: "#F59E0B", fontSize: "14px" }}>★</span>
                    ))}
                  </div>
                  <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.7", margin: "0 0 20px 0" }}>
                    "{t.quote}"
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: t.color, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#374151"
                    }}>
                      {t.initials}
                    </div>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: "700", color: "#0C0D10", margin: 0 }}>{t.name}</p>
                      <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: "80px 40px", background: "#fff", borderTop: "1px solid #E5E7EB" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "800", color: "#0C0D10", textAlign: "center", margin: "0 0 48px 0", letterSpacing: "-0.03em" }}>
              Frequently asked questions
            </h2>
          </Reveal>

          <div style={{ border: "1px solid #E5E7EB", borderRadius: "20px", overflow: "hidden" }}>
            {faqs.map((item, i) => (
              <div key={i} style={{ borderBottom: i < faqs.length - 1 ? "1px solid #E5E7EB" : "none" }}>
                <button
                  onClick={() => setFaq(faq === i ? null : i)}
                  style={{
                    width: "100%", padding: "20px 24px", background: "none", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    cursor: "pointer", textAlign: "left", gap: "16px"
                  }}
                >
                  <span style={{ fontSize: "15px", fontWeight: "600", color: "#0C0D10", lineHeight: "1.4" }}>
                    {item.q}
                  </span>
                  <span style={{ fontSize: "20px", color: "#9CA3AF", flexShrink: 0, transform: faq === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>
                    +
                  </span>
                </button>
                {faq === i && (
                  <div style={{ padding: "0 24px 20px" }}>
                    <p style={{ fontSize: "14px", color: "#6B7280", margin: 0, lineHeight: "1.7" }}>
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "80px 40px", background: "#0C0D10" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 60px)", fontWeight: "800", color: "#fff", margin: "0 0 16px 0", letterSpacing: "-0.03em" }}>
              Take control of your
              <br />
              <span style={{ background: "linear-gradient(135deg, #22C55E, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                financial life today.
              </span>
            </h2>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", margin: "0 0 40px 0", lineHeight: "1.7" }}>
              Join thousands of people who stopped guessing with their money.
              Free forever. Start in 30 seconds.
            </p>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <WaitlistForm dark />
            </div>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: 0 }}>
              🔒 Free forever · No credit card · Unsubscribe anytime
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0C0D10", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #22C55E, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "800", color: "#fff" }}>C</div>
              <span style={{ fontSize: "16px", fontWeight: "800", color: "#fff" }}>casha<span style={{ color: "#22C55E" }}>.money</span></span>
            </div>
            <div style={{ display: "flex", gap: "24px" }}>
              {[["Features", "#features"], ["Pricing", "#pricing"], ["FAQ", "#faq"], ["Login", "/auth/login"]].map(([label, href]) => (
                <a key={label} href={href} style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "24px" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", margin: 0 }}>
              © 2026 Casha Money. All rights reserved.
            </p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)", margin: 0, maxWidth: "500px", textAlign: "right" }}>
              Casha is a financial education platform, not a licensed advisor. Consult professionals for investment, tax, and legal decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}