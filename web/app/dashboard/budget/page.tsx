"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabase";

const BUDGET_CATEGORIES = [
  { name: "Housing/Rent", color: "#6366F1", recommended: 25 },
  { name: "Groceries", color: "#22C55E", recommended: 10 },
  { name: "Food Delivery", color: "#F97316", recommended: 5 },
  { name: "Transportation", color: "#3B82F6", recommended: 8 },
  { name: "EMI Payment", color: "#EF4444", recommended: 15 },
  { name: "Entertainment", color: "#EC4899", recommended: 3 },
  { name: "Shopping", color: "#A855F7", recommended: 4 },
  { name: "Healthcare", color: "#14B8A6", recommended: 3 },
  { name: "Education", color: "#8B5CF6", recommended: 3 },
  { name: "Subscription", color: "#F43F5E", recommended: 2 },
  { name: "Streaming/OTT", color: "#E11D48", recommended: 1 },
  { name: "Insurance", color: "#0EA5E9", recommended: 1 },
  { name: "Savings", color: "#10B981", recommended: 20 },
  { name: "Other Expense", color: "#6B7280", recommended: 0 },
];

function CatIcon({ name, color }: { name: string; color: string }) {
  const s = 16;
  let svg: React.ReactElement;
  switch (name) {
    case "Housing/Rent":
      svg = <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-9 9 9" /><path d="M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" /></svg>;
      break;
    case "Groceries":
      svg = <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 7v13a2 2 0 002 2h14a2 2 0 002-2V7l-3-5zM3 7h18M16 11a4 4 0 01-8 0" /></svg>;
      break;
    case "Food Delivery":
      svg = <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14h18M5 14c0 4 3 7 7 7s7-3 7-7M12 3v2m-3-1l1 2m5-2l-1 2M9 7h6c0 2-1.5 3-3 3S9 9 9 7z" /></svg>;
      break;
    case "Transportation":
      svg = <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="15" height="10" rx="2" /><path d="M16 10h4l2 4v4h-6v-4zM5 18a2 2 0 104 0 2 2 0 00-4 0zm12 0a2 2 0 104 0 2 2 0 00-4 0z" /></svg>;
      break;
    case "EMI Payment":
      svg = <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></svg>;
      break;
    case "Entertainment":
      svg = <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;
      break;
    case "Shopping":
      svg = <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6h15l-1.5 9h-12zM6 6L5 2H2m4 4l1.5 9m0 0L7 21m10-6l1.5 6M9 20a1 1 0 102 0 1 1 0 00-2 0zm7 0a1 1 0 102 0 1 1 0 00-2 0z" /></svg>;
      break;
    case "Healthcare":
      svg = <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>;
      break;
    case "Education":
      svg = <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>;
      break;
    case "Subscription":
      svg = <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>;
      break;
    case "Streaming/OTT":
      svg = <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="14" rx="2" /><path d="M10 9l5 3-5 3V9z" /></svg>;
      break;
    case "Insurance":
      svg = <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
      break;
    case "Savings":
      svg = <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
      break;
    default:
      svg = <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" /></svg>;
      break;
  }
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {svg}
    </div>
  );
}

function getStatus(budgeted: number, spentAmt: number) {
  if (budgeted === 0) return { color: "#6B7280", label: "No limit", pct: 0 };
  const pct = (spentAmt / budgeted) * 100;
  if (pct >= 100) return { color: "#EF4444", label: "Over budget", pct };
  if (pct >= 85) return { color: "#F97316", label: "Almost full", pct };
  if (pct >= 60) return { color: "#EAB308", label: "Caution", pct };
  return { color: "#22C55E", label: "On track", pct };
}

function healthInfo(score: number) {
  if (score >= 80) return { label: "Excellent", color: "#22C55E" };
  if (score >= 60) return { label: "On Track", color: "#84CC16" };
  if (score >= 40) return { label: "Needs Attention", color: "#F59E0B" };
  return { label: "At Risk", color: "#EF4444" };
}

function DonutChart({ pct, color, size }: { pct: number; color: string; size: number }) {
  const sw = 10;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (Math.min(pct, 100) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={sw} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease-out" }} />
    </svg>
  );
}

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ width: "100%", height: 6, borderRadius: 6, background: "var(--border)", overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", borderRadius: 6, background: color, transition: "width 0.7s ease-out" }} />
    </div>
  );
}

export default function BudgetPage() {
  const [income, setIncome] = useState(0);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [spent, setSpent] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "setup">("overview");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;
    const uid = authData.user.id;

    const { data: incomeTxns } = await supabase
      .from("transactions")
      .select("amount, transaction_date")
      .eq("user_id", uid)
      .eq("transaction_type", "income");

    const totalIncome = (incomeTxns || []).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const months = new Set((incomeTxns || []).map((t: any) => t.transaction_date?.slice(0, 7)));
    const monthCount = Math.max(1, months.size);
    const monthlyIncome = Math.round(totalIncome / monthCount);
    setIncome(monthlyIncome);

    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    const { data: expenseTxns } = await supabase
      .from("transactions")
      .select("amount, category")
      .eq("user_id", uid)
      .eq("transaction_type", "expense")
      .gte("transaction_date", monthStart);

    const spentMap: Record<string, number> = {};
    (expenseTxns || []).forEach((t: any) => {
      const cat = t.category || "Other Expense";
      spentMap[cat] = (spentMap[cat] || 0) + Math.abs(Number(t.amount));
    });
    setSpent(spentMap);

    const { data: savedBudget } = await supabase
      .from("budgets")
      .select("categories")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (savedBudget?.categories && Object.keys(savedBudget.categories).length > 0) {
      setBudgets(savedBudget.categories);
    } else if (monthlyIncome > 0) {
      const autoBudgets: Record<string, number> = {};
      BUDGET_CATEGORIES.forEach(cat => {
        autoBudgets[cat.name] = Math.round(monthlyIncome * cat.recommended / 100);
      });
      setBudgets(autoBudgets);
    }
    setLoading(false);
  };

  const generateAIBudget = () => {
    if (income === 0) return;
    const autoBudgets: Record<string, number> = {};
    BUDGET_CATEGORIES.forEach(cat => {
      autoBudgets[cat.name] = Math.round(income * cat.recommended / 100);
    });
    setBudgets(autoBudgets);
    setAiGenerated(true);
    setActiveTab("setup");
    setTimeout(() => { setAiGenerated(false); }, 5000);
  };

  const saveBudgets = async () => {
    setSaving(true);
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) { setSaving(false); return; }

    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;

    await supabase.from("budgets").delete().eq("user_id", authData.user.id);

    const { error } = await supabase.from("budgets").insert({
      user_id: authData.user.id,
      name: `Budget ${now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`,
      period_type: "monthly",
      start_date: startDate,
      end_date: endDate,
      total_budget: Object.values(budgets).reduce((s, v) => s + v, 0),
      currency: "INR",
      categories: budgets,
      status: "active",
    });

    setSaving(false);
    if (!error) { setSaved(true); setTimeout(() => { setSaved(false); }, 4000); }
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0
  }).format(n);

  const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0);
  const totalSpent = Object.values(spent).reduce((s, v) => s + v, 0);
  const totalRemaining = totalBudget - totalSpent;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();
  const daysLeft = daysInMonth - daysPassed;
  const perDay = daysLeft > 0 ? totalRemaining / daysLeft : 0;
  const projected = daysPassed > 0 ? (totalSpent / daysPassed) * daysInMonth : 0;
  const projDiff = totalBudget - projected;

  const healthScore = useMemo(() => {
    const activeCats = BUDGET_CATEGORIES.filter(c => (budgets[c.name] || 0) > 0);
    if (activeCats.length === 0) return 0;
    const scores = activeCats.map(c => {
      const b = budgets[c.name] || 0;
      const s = spent[c.name] || 0;
      const pct = (s / b) * 100;
      if (pct <= 50) return 100;
      if (pct <= 80) return 100 - ((pct - 50) / 30) * 30;
      if (pct <= 100) return 70 - ((pct - 80) / 20) * 40;
      return Math.max(0, 30 - (pct - 100) * 1.5);
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [budgets, spent]);

  const health = healthInfo(healthScore);
  const monthLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const utilized = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const unbudgetedSpent = useMemo(() => {
    const budgetedNames = new Set(Object.keys(budgets));
    const arr: { name: string; amount: number; color: string }[] = [];
    Object.entries(spent).forEach(([k, v]) => {
      if (!budgetedNames.has(k) && v > 0) {
        const cat = BUDGET_CATEGORIES.find(c => c.name === k);
        arr.push({ name: k, amount: v, color: cat?.color || "#6B7280" });
      }
    });
    return arr.sort((a, b) => b.amount - a.amount);
  }, [spent, budgets]);
  const unbudgetedTotal = unbudgetedSpent.reduce((s, u) => s + u.amount, 0);

  const activeCats = BUDGET_CATEGORIES.filter(c => (budgets[c.name] || 0) > 0 || (spent[c.name] || 0) > 0);
  const overCount = activeCats.filter(c => { const b = budgets[c.name] || 0; return b > 0 && (spent[c.name] || 0) >= b; }).length;
  const onTrackCount = activeCats.filter(c => { const b = budgets[c.name] || 0; return b > 0 && (spent[c.name] || 0) < b * 0.6; }).length;

  if (loading) return (
    <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 22, height: 22, border: "2px solid var(--border)", borderTopColor: "#22C55E", borderRadius: "50%", animation: "bsp 0.6s linear infinite" }} />
      <style>{`@keyframes bsp { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="bw" style={{ maxWidth: 920, margin: "0 auto", padding: "28px 24px 64px" }}>

        {/* Header */}
        <div className="bh" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Smart Budget</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "3px 0 0 0" }}>{monthLabel} · AI-powered based on your income</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={generateAIBudget}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, border: `1px solid ${aiGenerated ? "rgba(34,197,94,0.3)" : "var(--border)"}`, background: aiGenerated ? "rgba(34,197,94,0.08)" : "var(--card)", color: aiGenerated ? "#22C55E" : "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "0.2s" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 014 4c0 1.95-1.4 3.58-3.25 3.93M8 6a4 4 0 014-4M12 18v4M8 22h8M12 2v4" /><circle cx="12" cy="14" r="4" /></svg>
              {aiGenerated ? "Generated!" : "AI Generate"}
            </button>
            <button onClick={saveBudgets} disabled={saving}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, border: "none", background: saved ? "#22C55E" : "#0C0D10", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "wait" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1, transition: "0.2s" }}>
              {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Budget"}
            </button>
          </div>
        </div>

        {/* AI Banner */}
        {aiGenerated && (
          <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 014 4c0 1.95-1.4 3.58-3.25 3.93M8 6a4 4 0 014-4M12 18v4M8 22h8M12 2v4" /><circle cx="12" cy="14" r="4" /></svg>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#22C55E", margin: "0 0 2px" }}>AI Budget Generated</p>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Based on {fmt(income)}/month using the 50/30/20 rule. Edit any amount and save.</p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="bs" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(59,130,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
              </div>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: 0.05 }}>Income</p>
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{income > 0 ? fmt(income) : "—"}</p>
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20" /></svg>
              </div>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: 0.05 }}>Budgeted</p>
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(totalBudget)}</p>
          </div>
          <div style={{ background: totalRemaining >= 0 ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)", border: `1px solid ${totalRemaining >= 0 ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 10, padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: totalRemaining >= 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={totalRemaining >= 0 ? "#22C55E" : "#EF4444"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
              </div>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: 0.05 }}>{totalRemaining >= 0 ? "Remaining" : "Over"}</p>
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: totalRemaining >= 0 ? "#22C55E" : "#EF4444", margin: 0, fontVariantNumeric: "tabular-nums" }}>{totalRemaining >= 0 ? "" : "-"}{fmt(Math.abs(totalRemaining))}</p>
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(234,179,8,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              </div>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: 0.05 }}>Per Day</p>
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: perDay >= 0 ? "#22C55E" : "#EF4444", margin: 0, fontVariantNumeric: "tabular-nums" }}>
              {perDay >= 0 ? fmt(perDay) : "—"}
            </p>
          </div>
        </div>

        {/* Health Score + Insight */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <DonutChart pct={healthScore} color={health.color} size={100} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: health.color, fontVariantNumeric: "tabular-nums" }}>{healthScore}</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 2px" }}>Budget Health — <span style={{ color: health.color }}>{health.label}</span></p>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 12px", lineHeight: 1.5 }}>
              {daysLeft > 0 ? <>{daysLeft} day{daysLeft !== 1 ? "s" : ""} left. </> : null}
              {projDiff > 0
                ? <span style={{ color: "#22C55E" }}>On track to save {fmt(projDiff)} by month end.</span>
                : projDiff < 0
                  ? <span style={{ color: "#EF4444" }}>At this pace, you'll exceed by {fmt(Math.abs(projDiff))}.</span>
                  : <span>Right on target.</span>
              }
            </p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: 10, color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: 0.05 }}>Utilized</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "2px 0 0 0", fontVariantNumeric: "tabular-nums" }}>{utilized}%</p>
              </div>
              <div>
                <p style={{ fontSize: 10, color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: 0.05 }}>Projected</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "2px 0 0 0", fontVariantNumeric: "tabular-nums" }}>{fmt(projected)}</p>
              </div>
              <div>
                <p style={{ fontSize: 10, color: "#22C55E", margin: 0, textTransform: "uppercase", letterSpacing: 0.05 }}>On Track</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#22C55E", margin: "2px 0 0 0" }}>{onTrackCount}</p>
              </div>
              {overCount > 0 && (
                <div>
                  <p style={{ fontSize: 10, color: "#EF4444", margin: 0, textTransform: "uppercase", letterSpacing: 0.05 }}>Over</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#EF4444", margin: "2px 0 0 0" }}>{overCount}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Overall Budget Used</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{utilized}%</span>
          </div>
          <div style={{ height: 10, background: "var(--border)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, utilized)}%`, background: utilized >= 100 ? "#EF4444" : utilized >= 80 ? "#F97316" : utilized >= 60 ? "#EAB308" : "#22C55E", borderRadius: 10, transition: "width 0.8s ease-out" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 10, color: "var(--muted)" }}>Spent: {fmt(totalSpent)}</span>
            <span style={{ fontSize: 10, color: "var(--muted)" }}>Budget: {fmt(totalBudget)}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          {([["overview", "Overview"], ["setup", "Edit Budget"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => { setActiveTab(key as "overview" | "setup"); }}
              style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid " + (activeTab === key ? "var(--text)" : "var(--border)"), background: activeTab === key ? "var(--text)" : "var(--card)", color: activeTab === key ? "var(--bg)" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "0.15s" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {BUDGET_CATEGORIES.map(cat => {
                const budgeted = budgets[cat.name] || 0;
                const spentAmt = spent[cat.name] || 0;
                const status = getStatus(budgeted, spentAmt);
                if (budgeted === 0 && spentAmt === 0) return null;

                return (
                  <div key={cat.name} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", borderLeft: `4px solid ${cat.color}`, transition: "background 0.1s, border-color 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg)"; e.currentTarget.style.borderColor = cat.color + "44"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--card)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.borderLeftColor = cat.color; }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: budgeted > 0 ? 10 : 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <CatIcon name={cat.name} color={cat.color} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{cat.name}</p>
                          <p style={{ fontSize: 10, color: "var(--muted)", margin: "2px 0 0 0", fontVariantNumeric: "tabular-nums" }}>{fmt(spentAmt)} spent{budgeted > 0 ? ` of ${fmt(budgeted)}` : ""}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: status.color + "18", color: status.color, textTransform: "uppercase", letterSpacing: 0.04 }}>
                          {budgeted === 0 ? "No budget" : status.label}
                        </span>
                        {budgeted > 0 && (
                          <p style={{ fontSize: 11, fontWeight: 700, color: spentAmt >= budgeted ? "#EF4444" : "#22C55E", margin: "4px 0 0 0", fontVariantNumeric: "tabular-nums" }}>
                            {spentAmt >= budgeted ? `${fmt(spentAmt - budgeted)} over` : `${fmt(budgeted - spentAmt)} left`}
                          </p>
                        )}
                      </div>
                    </div>
                    {budgeted > 0 && <MiniBar pct={status.pct} color={status.color} />}
                  </div>
                );
              })}
            </div>

            {/* Unbudgeted */}
            {unbudgetedSpent.length > 0 && (
              <div style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(234,179,8,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>Unbudgeted Spending</p>
                </div>
                <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 10px" }}>{fmt(unbudgetedTotal)} spent without a budget this month</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {unbudgetedSpent.map(u => (
                    <span key={u.name} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6, background: u.color + "14", border: `1px solid ${u.color}33`, fontSize: 11, color: u.color, fontWeight: 500 }}>
                      <span style={{ width: 6, height: 6, borderRadius: 6, background: u.color, flexShrink: 0 }} />
                      {u.name} · {fmt(u.amount)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Edit Budget Tab */}
        {activeTab === "setup" && (
          <>
            <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" /></svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#3B82F6", margin: "0 0 2px" }}>How AI Budget Works</p>
                <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Based on <strong>{fmt(income)}/month</strong> using the 50/30/20 rule adapted for India. Edit any amount and save.</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {BUDGET_CATEGORIES.map(cat => {
                const budgeted = budgets[cat.name] || 0;
                const spentAmt = spent[cat.name] || 0;
                return (
                  <div key={cat.name} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, transition: "border-color 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = cat.color + "44"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}>
                    <CatIcon name={cat.name} color={cat.color} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{cat.name}</p>
                      <p style={{ fontSize: 10, color: "var(--muted)", margin: "2px 0 0 0" }}>
                        {cat.recommended > 0 ? `AI: ${cat.recommended}% = ${fmt(Math.round(income * cat.recommended / 100))}` : "Set your own amount"}
                        {spentAmt > 0 ? <span style={{ color: getStatus(budgeted, spentAmt).color }}> · Spent: {fmt(spentAmt)}</span> : ""}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>₹</span>
                      <input type="number" min="0" value={budgeted || ""} onChange={(e) => { setBudgets({ ...budgets, [cat.name]: Number(e.target.value) }); }} placeholder="0"
                        style={{ width: 100, height: 36, borderRadius: 8, padding: "0 10px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: `1px solid ${budgeted > 0 ? cat.color : "var(--border)"}`, color: "var(--text)", boxSizing: "border-box", textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums", transition: "border-color 0.15s" }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = cat.color; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = budgeted > 0 ? cat.color : "var(--border)"; }} />
                    </div>
                    <div style={{ width: 40, textAlign: "right", flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                        {income > 0 && budgeted ? `${Math.round((budgeted / income) * 100)}%` : "0%"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Budget vs Income */}
            <div style={{ background: totalBudget > income ? "rgba(239,68,68,0.06)" : "rgba(34,197,94,0.06)", border: `1px solid ${totalBudget > income ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`, borderRadius: 10, padding: "18px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Total Budgeted</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: totalBudget > income ? "#EF4444" : "#22C55E", fontVariantNumeric: "tabular-nums" }}>{fmt(totalBudget)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Monthly Income</span>
                <span style={{ fontSize: 12, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{fmt(income)}</span>
              </div>
              <div style={{ height: 1, background: totalBudget > income ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)", marginBottom: 8 }} />
              {totalBudget > income ? (
                <p style={{ fontSize: 12, color: "#EF4444", margin: 0, fontWeight: 500 }}>Budget exceeds income by {fmt(totalBudget - income)}. Reduce some categories.</p>
              ) : totalBudget > 0 ? (
                <p style={{ fontSize: 12, color: "#22C55E", margin: 0, fontWeight: 500 }}>{fmt(income - totalBudget)} unallocated — consider adding to Savings!</p>
              ) : (
                <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Click "AI Generate" to auto-fill budgets.</p>
              )}
            </div>

            <button onClick={saveBudgets} disabled={saving}
              style={{ width: "100%", height: 44, borderRadius: 10, border: "none", background: saved ? "#22C55E" : "#0C0D10", color: "#fff", fontSize: 14, fontWeight: 600, cursor: saving ? "wait" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1, transition: "0.2s" }}>
              {saving ? "Saving..." : saved ? "Budget Saved!" : "Save Budget"}
            </button>
          </>
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes bsp { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .bs { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .bw { padding: 20px 16px 0 !important; }
          .bh { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>
    </div>
  );
}