"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabase";

const BUDGET_CATEGORIES = [
  { name: "Housing/Rent", emoji: "🏠", color: "#6366F1", recommended: 25 },
  { name: "Groceries", emoji: "🛒", color: "#22C55E", recommended: 10 },
  { name: "Food Delivery", emoji: "🍔", color: "#F97316", recommended: 5 },
  { name: "Transportation", emoji: "🚗", color: "#3B82F6", recommended: 8 },
  { name: "EMI Payment", emoji: "📅", color: "#EF4444", recommended: 15 },
  { name: "Entertainment", emoji: "🎬", color: "#F43F5E", recommended: 3 },
  { name: "Shopping", emoji: "🛍️", color: "#EC4899", recommended: 4 },
  { name: "Healthcare", emoji: "🏥", color: "#14B8A6", recommended: 3 },
  { name: "Education", emoji: "📚", color: "#8B5CF6", recommended: 3 },
  { name: "Subscription", emoji: "🔄", color: "#A855F7", recommended: 2 },
  { name: "Streaming/OTT", emoji: "📺", color: "#F43F5E", recommended: 1 },
  { name: "Insurance", emoji: "🛡️", color: "#6366F1", recommended: 1 },
  { name: "Savings", emoji: "💰", color: "#10B981", recommended: 20 },
  { name: "Other Expense", emoji: "📦", color: "#94A3B8", recommended: 0 },
];

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
    setTimeout(() => setAiGenerated(false), 5000);
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
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 4000); }
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
    const arr: { name: string; amount: number; color: string; emoji: string }[] = [];
    Object.entries(spent).forEach(([k, v]) => {
      if (!budgetedNames.has(k) && v > 0) {
        const cat = BUDGET_CATEGORIES.find(c => c.name === k);
        arr.push({ name: k, amount: v, color: cat?.color || "#6B7280", emoji: cat?.emoji || "📦" });
      }
    });
    return arr.sort((a, b) => b.amount - a.amount);
  }, [spent, budgets]);
  const unbudgetedTotal = unbudgetedSpent.reduce((s, u) => s + u.amount, 0);

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
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, border: `1px solid ${aiGenerated ? "#BBF7D0" : "var(--border)"}`, background: aiGenerated ? "rgba(34,197,94,0.08)" : "var(--card)", color: aiGenerated ? "#22C55E" : "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "0.2s" }}>
              {aiGenerated ? "✓ Generated!" : "🤖 AI Generate"}
            </button>
            <button onClick={saveBudgets} disabled={saving}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, border: "none", background: saved ? "#22C55E" : "#0C0D10", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1, transition: "0.2s" }}>
              {saving ? "Saving..." : saved ? "✓ Saved!" : "💾 Save Budget"}
            </button>
          </div>
        </div>

        {/* AI Banner */}
        {aiGenerated && (
          <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 22 }}>🤖</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#22C55E", margin: "0 0 2px" }}>AI Budget Generated!</p>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Based on {fmt(income)}/month using the 50/30/20 rule. Edit below and save.</p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="bs" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.05 }}>Monthly Income</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{income > 0 ? fmt(income) : "—"}</p>
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.05 }}>Total Budgeted</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(totalBudget)}</p>
          </div>
          <div style={{ background: totalRemaining >= 0 ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)", border: `1px solid ${totalRemaining >= 0 ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 10, padding: "16px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.05 }}>{totalRemaining >= 0 ? "Remaining" : "Over Budget"}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: totalRemaining >= 0 ? "#22C55E" : "#EF4444", margin: 0, fontVariantNumeric: "tabular-nums" }}>{totalRemaining >= 0 ? "" : "-"}{fmt(Math.abs(totalRemaining))}</p>
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.05 }}>Per Day</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: perDay >= 0 ? "#22C55E" : "#EF4444", margin: 0, fontVariantNumeric: "tabular-nums" }}>
              {perDay >= 0 ? fmt(perDay) : "—"}{perDay >= 0 ? <span style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)" }}> /day</span> : null}
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
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 2px" }}>Budget Health — <span style={{ color: health.color }}>{health.label}</span></p>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 8px", lineHeight: 1.5 }}>
              {daysLeft > 0 ? <>{daysLeft} day{daysLeft !== 1 ? "s" : ""} left. </> : null}
              {projDiff > 0
                ? <span style={{ color: "#22C55E" }}>On track to save {fmt(projDiff)} by month end.</span>
                : projDiff < 0
                  ? <span style={{ color: "#EF4444" }}>At this pace, you'll exceed by {fmt(Math.abs(projDiff))}.</span>
                  : <span>Right on target.</span>
              }
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: 10, color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: 0.05 }}>Utilized</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "1px 0 0 0", fontVariantNumeric: "tabular-nums" }}>{utilized}%</p>
              </div>
              <div>
                <p style={{ fontSize: 10, color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: 0.05 }}>Projected</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "1px 0 0 0", fontVariantNumeric: "tabular-nums" }}>{fmt(projected)}</p>
              </div>
              <div>
                <p style={{ fontSize: 10, color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: 0.05 }}>Days Left</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "1px 0 0 0" }}>{daysLeft}</p>
              </div>
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
          {([["overview", "📊 Overview"], ["setup", "⚙️ Edit Budget"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key as "overview" | "setup")}
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
                  <div key={cat.name} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", borderLeft: `4px solid ${cat.color}`, transition: "background 0.1s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--card)"; }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: budgeted > 0 ? 8 : 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{cat.emoji}</div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{cat.name}</p>
                          <p style={{ fontSize: 10, color: "var(--muted)", margin: "1px 0 0 0" }}>{fmt(spentAmt)} spent{budgeted > 0 ? ` · ${fmt(budgeted)} budget` : ""}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: status.color + "18", color: status.color, textTransform: "uppercase", letterSpacing: 0.04 }}>
                          {budgeted === 0 ? "No budget" : status.label}
                        </span>
                        {budgeted > 0 && (
                          <p style={{ fontSize: 11, fontWeight: 600, color: spentAmt >= budgeted ? "#EF4444" : "#22C55E", margin: "3px 0 0 0", fontVariantNumeric: "tabular-nums" }}>
                            {spentAmt >= budgeted ? `${fmt(spentAmt - budgeted)} over` : `${fmt(budgeted - spentAmt)} left`}
                          </p>
                        )}
                      </div>
                    </div>
                    {budgeted > 0 && (
                      <div style={{ height: 6, background: "var(--border)", borderRadius: 6, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(100, status.pct)}%`, background: status.color, borderRadius: 6, transition: "width 0.6s ease-out" }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Unbudgeted Spending */}
            {unbudgetedSpent.length > 0 && (
              <div style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 4px" }}>⚠️ Unbudgeted Spending</p>
                <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 10px" }}>{fmt(unbudgetedTotal)} spent without a budget this month</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {unbudgetedSpent.map(u => (
                    <span key={u.name} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, background: u.color + "14", border: `1px solid ${u.color}33`, fontSize: 11, color: u.color, fontWeight: 500 }}>
                      {u.emoji} {u.name} · {fmt(u.amount)}
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
            <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "14px 18px", marginBottom: 18 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#3B82F6", margin: "0 0 2px" }}>💡 How AI Budget Works</p>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
                Based on your income of <strong>{fmt(income)}/month</strong>, AI uses the 50/30/20 rule adapted for India. Edit any amount and save.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {BUDGET_CATEGORIES.map(cat => (
                <div key={cat.name} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, transition: "border-color 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = cat.color + "44"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{cat.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{cat.name}</p>
                    <p style={{ fontSize: 10, color: "var(--muted)", margin: "1px 0 0 0" }}>
                      {cat.recommended > 0 ? `AI: ${cat.recommended}% = ${fmt(Math.round(income * cat.recommended / 100))}` : "Set your own amount"}
                      {spent[cat.name] ? ` · Spent: ${fmt(spent[cat.name])}` : ""}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>₹</span>
                    <input type="number" min="0" value={budgets[cat.name] || ""} onChange={e => setBudgets({ ...budgets, [cat.name]: Number(e.target.value) })} placeholder="0"
                      style={{ width: 100, height: 36, borderRadius: 8, padding: "0 10px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: `1px solid ${(budgets[cat.name] || 0) > 0 ? cat.color : "var(--border)"}`, color: "var(--text)", boxSizing: "border-box", textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums", transition: "border-color 0.15s" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = cat.color; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = (budgets[cat.name] || 0) > 0 ? cat.color : "var(--border)"; }} />
                  </div>
                  <div style={{ width: 40, textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                      {income > 0 && budgets[cat.name] ? `${Math.round((budgets[cat.name] / income) * 100)}%` : "0%"}
                    </span>
                  </div>
                </div>
              ))}
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
                <p style={{ fontSize: 12, color: "#EF4444", margin: 0, fontWeight: 500 }}>⚠️ Budget exceeds income by {fmt(totalBudget - income)}. Reduce some categories.</p>
              ) : totalBudget > 0 ? (
                <p style={{ fontSize: 12, color: "#22C55E", margin: 0, fontWeight: 500 }}>✓ {fmt(income - totalBudget)} unallocated — consider adding to Savings!</p>
              ) : (
                <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Click "🤖 AI Generate" to auto-fill budgets.</p>
              )}
            </div>

            <button onClick={saveBudgets} disabled={saving}
              style={{ width: "100%", height: 44, borderRadius: 10, border: "none", background: saved ? "#22C55E" : "#0C0D10", color: "#fff", fontSize: 14, fontWeight: 600, cursor: saving ? "wait" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1, transition: "0.2s" }}>
              {saving ? "Saving..." : saved ? "✓ Budget Saved!" : "💾 Save Budget"}
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