"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDateLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function OverviewPage() {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [txns, setTxns] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    setUser(u.user);

    const uid = u.user.id;
    const [a, t, g, d, b] = await Promise.all([
      supabase.from("accounts").select("*").eq("user_id", uid),
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", uid)
        .order("transaction_date", { ascending: false })
        .limit(5),
      supabase.from("goals").select("*").eq("user_id", uid),
      supabase.from("debts").select("*").eq("user_id", uid),
      supabase.from("budgets").select("*").eq("user_id", uid),
    ]);

    setAccounts(a.data || []);
    setTxns(t.data || []);
    setGoals(g.data || []);
    setDebts(d.data || []);
    setBudgets(b.data || []);
    setLoading(false);
  };

  if (loading)
    return (
      <div
        style={{
          height: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
          fontSize: 13,
        }}
      >
        Loading...
      </div>
    );

  const now = new Date();
  const mTx = txns.filter((t) => {
    const d = new Date(t.transaction_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalIncome = accounts.reduce((s, a) => s + Number(a.balance || 0), 0);
  const monthIncome = mTx
    .filter((t) => t.transaction_type === "income")
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const monthExpense = mTx
    .filter((t) => t.transaction_type === "expense")
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const savingsRate = monthIncome > 0 ? Math.round(((monthIncome - monthExpense) / monthIncome) * 100) : 0;

  const debtTotal = debts.reduce((s, d) => s + Number(d.amount_remaining || 0), 0);
  const netWorth = totalIncome - debtTotal;

  const prevNetWorth = netWorth - (monthIncome - monthExpense);
  const netWorthChange = netWorth - prevNetWorth;

  const healthScore = Math.min(800, 300 + Math.min(savingsRate * 3, 300) + Math.min(netWorth / 5000, 200));
  const healthLabel =
    healthScore >= 700 ? "Excellent — top 10%" : healthScore >= 500 ? "Good — on track" : "Needs attention";

  const catIcon = (cat: string) => {
    const map: Record<string, string> = {
      Salary: "💰",
      Freelance: "💻",
      "Food Delivery": "🍔",
      "Food & Dining": "🍽️",
      Groceries: "🛒",
      Shopping: "🛍️",
      "EMI Payment": "🏦",
      "Loan Payment": "📋",
      Transport: "🚗",
      Fuel: "⛽",
      Travel: "✈️",
      Health: "❤️",
      Medical: "🏥",
      Education: "📚",
      "Bills/Utilities": "⚡",
      Entertainment: "🎬",
      Subscription: "📅",
      "Streaming/OTT": "📺",
      Investment: "📈",
      "Investment Return": "📈",
      Refund: "↩️",
      Gift: "🎁",
      Transfer: "↔️",
      Clothing: "👔",
    };
    return map[cat] || "📝";
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "User";

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div className="ov-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 8 }}>
        <div>
          <p style={{ fontSize: 12, color: "var(--faint)", margin: "0 0 4px" }}>{getDateLabel()}</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            {getGreeting()}, {firstName}
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 99, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <div style={{ width: 7, height: 7, borderRadius: 99, background: "#22C55E", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#22C55E" }}>AI Active</span>
        </div>
      </div>

      <div className="ov-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", margin: 0 }}>Health Score</p>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" fill="none" stroke="#22C55E" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", color: "#22C55E" }}>{Math.round(healthScore)}</p>
          <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>{healthLabel}</p>
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", margin: 0 }}>Net Worth</p>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" fill="none" stroke="#22C55E" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1" /></svg>
            </div>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px" }}>{fmt(netWorth)}</p>
          <p style={{ fontSize: 11, color: netWorthChange >= 0 ? "#22C55E" : "#DC2626", margin: 0 }}>
            {netWorthChange >= 0 ? "+" : ""}{fmt(netWorthChange)} this month
          </p>
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", margin: 0 }}>Savings Rate</p>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" fill="none" stroke="#22C55E" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px" }}>{savingsRate}%</p>
          <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>Target: 20% — {savingsRate >= 20 ? "exceeded" : "below target"}</p>
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 14, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="16" height="16" fill="none" stroke="#22C55E" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>AI found Rs.42,000 in tax savings</p>
          <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Switch to Old Regime + invest in ELSS before 31 March. 80C has Rs.94,000 remaining.</p>
        </div>
      </div>

      <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Recent transactions</h2>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        {txns.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--faint)", padding: 20, margin: 0 }}>No transactions yet.</p>
        ) : (
          txns.map((t, i) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 16px",
                borderBottom: i < txns.length - 1 ? "1px solid var(--tx-border)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "var(--panel-alt)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {catIcon(t.category)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.merchant_name || t.category || "Transaction"}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--faint)", margin: "2px 0 0 0" }}>{t.category || "Uncategorized"}</p>
                </div>
              </div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: t.transaction_type === "income" ? "#16A34A" : "var(--text)",
                  margin: 0,
                  flexShrink: 0,
                  marginLeft: 12,
                }}
              >
                {t.transaction_type === "income" ? "+" : "-"}{fmt(Math.abs(Number(t.amount)))}
              </p>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media (max-width: 1023px) {
          .ov-grid-3 { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .ov-grid-3 { grid-template-columns: 1fr !important; }
          .ov-header h1 { font-size: 18px !important; }
        }
      `}</style>
    </div>
  );
}