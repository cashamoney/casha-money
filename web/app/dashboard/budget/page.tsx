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
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease-out" }} />
    </svg>
  );
}

export default function BudgetPage() {
  const [income, setIncome] = useState(0);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [spent, setSpent] = useState<Record<string, number>>({});
  const [lastSpent, setLastSpent] = useState<Record<string, number>>({});
  const [dailyMap, setDailyMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "setup">("overview");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;
    const uid = authData.user.id;

    const { data: incomeTxns } = await supabase.from("transactions").select("amount, transaction_date").eq("user_id", uid).eq("transaction_type", "income");
    const totalIncome = (incomeTxns || []).reduce((s: number, t: any) => s + Math.abs(Number(t.amount)), 0);
    const mSet = new Set((incomeTxns || []).map((t: any) => t.transaction_date?.slice(0, 7)));
    const mCount = Math.max(1, mSet.size);
    setIncome(Math.round(totalIncome / mCount));

    const now = new Date();
    const thisStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastStart = `${lm.getFullYear()}-${String(lm.getMonth() + 1).padStart(2, "0")}-01`;
    const sixtyAgo = new Date(now.getTime() - 60 * 86400000).toISOString().split("T")[0];

    const { data: expTxns } = await supabase.from("transactions").select("amount, category, transaction_date").eq("user_id", uid).eq("transaction_type", "expense").gte("transaction_date", sixtyAgo);

    const thisS: Record<string, number> = {};
    const lastS: Record<string, number> = {};
    const dMap: Record<string, number> = {};
    (expTxns || []).forEach((t: any) => {
      const cat = t.category || "Other Expense";
      const amt = Math.abs(Number(t.amount));
      const d = t.transaction_date;
      if (d >= thisStart) { thisS[cat] = (thisS[cat] || 0) + amt; }
      else if (d >= lastStart) { lastS[cat] = (lastS[cat] || 0) + amt; }
      const dk = d?.slice(0, 10);
      if (dk) { dMap[dk] = (dMap[dk] || 0) + amt; }
    });
    setSpent(thisS);
    setLastSpent(lastS);
    setDailyMap(dMap);

    const { data: savedBudget } = await supabase.from("budgets").select("categories").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).single();
    if (savedBudget?.categories && Object.keys(savedBudget.categories).length > 0) {
      setBudgets(savedBudget.categories);
    } else if (totalIncome / mCount > 0) {
      const ab: Record<string, number> = {};
      BUDGET_CATEGORIES.forEach(c => { ab[c.name] = Math.round((totalIncome / mCount) * c.recommended / 100); });
      setBudgets(ab);
    }
    setLoading(false);
  };

  const generateAIBudget = () => {
    if (income === 0) return;
    const ab: Record<string, number> = {};
    BUDGET_CATEGORIES.forEach(c => { ab[c.name] = Math.round(income * c.recommended / 100); });
    setBudgets(ab);
    setAiGenerated(true);
    setActiveTab("setup");
    setTimeout(() => { setAiGenerated(false); }, 5000);
  };

  const optimizeBudget = () => {
    const nb = { ...budgets };
    let pool = 0;
    BUDGET_CATEGORIES.forEach(c => {
      const b = nb[c.name] || 0;
      const s = spent[c.name] || 0;
      if (b > 0 && s / b < 0.4 && c.recommended > 0) {
        const ex = Math.round(b * 0.25);
        nb[c.name] = b - ex;
        pool += ex;
      }
    });
    const overs = BUDGET_CATEGORIES.filter(c => { const b = nb[c.name] || 0; const s = spent[c.name] || 0; return b > 0 && s / b > 0.8; });
    if (overs.length > 0 && pool > 0) {
      const each = Math.round(pool / overs.length);
      overs.forEach(c => { nb[c.name] = (nb[c.name] || 0) + each; });
    }
    setBudgets(nb);
    setOptimized(true);
    setTimeout(() => { setOptimized(false); }, 3000);
  };

  const saveBudgets = async () => {
    setSaving(true);
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) { setSaving(false); return; }
    const now = new Date();
    const sd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const ed = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;
    await supabase.from("budgets").delete().eq("user_id", authData.user.id);
    const { error } = await supabase.from("budgets").insert({ user_id: authData.user.id, name: `Budget ${now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`, period_type: "monthly", start_date: sd, end_date: ed, total_budget: Object.values(budgets).reduce((s, v) => s + v, 0), currency: "INR", categories: budgets, status: "active" });
    setSaving(false);
    if (!error) { setSaved(true); setTimeout(() => { setSaved(false); }, 4000); }
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();
  const daysLeft = daysInMonth - daysPassed;
  const timePct = Math.round((daysPassed / daysInMonth) * 100);

  const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0);
  const totalSpent = Object.values(spent).reduce((s, v) => s + v, 0);
  const totalRemaining = totalBudget - totalSpent;
  const budgetPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const perDay = daysLeft > 0 ? totalRemaining / daysLeft : 0;
  const projected = daysPassed > 0 ? (totalSpent / daysPassed) * daysInMonth : 0;
  const projDiff = totalBudget - projected;
  const savingsRate = income > 0 ? Math.round(((income - totalSpent) / income) * 100) : 0;
  const utilized = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const healthScore = useMemo(() => {
    const ac = BUDGET_CATEGORIES.filter(c => (budgets[c.name] || 0) > 0);
    if (ac.length === 0) return 0;
    const sc = ac.map(c => { const b = budgets[c.name] || 0; const s = spent[c.name] || 0; const p = (s / b) * 100; if (p <= 50) return 100; if (p <= 80) return 100 - ((p - 50) / 30) * 30; if (p <= 100) return 70 - ((p - 80) / 20) * 40; return Math.max(0, 30 - (p - 100) * 1.5); });
    return Math.round(sc.reduce((a, b) => a + b, 0) / sc.length);
  }, [budgets, spent]);
  const health = healthInfo(healthScore);

  const onTrackCount = BUDGET_CATEGORIES.filter(c => { const b = budgets[c.name] || 0; return b > 0 && (spent[c.name] || 0) < b * 0.6; }).length;
  const overCount = BUDGET_CATEGORIES.filter(c => { const b = budgets[c.name] || 0; return b > 0 && (spent[c.name] || 0) >= b; }).length;

  const insights = useMemo(() => {
    const r: { icon: React.ReactElement; color: string; title: string; desc: string }[] = [];
    if (timePct > 0 && budgetPct > 0) {
      if (budgetPct > timePct + 15) {
        r.push({ icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>, color: "#EF4444", title: "Spending Ahead", desc: `${budgetPct}% budget used but only ${timePct}% of month passed.` });
      } else if (budgetPct < timePct - 15) {
        r.push({ icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>, color: "#22C55E", title: "Great Pace", desc: `Spending slower than month pace. ${fmt(totalRemaining)} available.` });
      }
    }
    const topCat = BUDGET_CATEGORIES.reduce((mx, c) => (spent[c.name] || 0) > (spent[mx.name] || 0) ? c : mx, BUDGET_CATEGORIES[0]);
    if (spent[topCat.name] > 0) {
      const p = totalSpent > 0 ? Math.round((spent[topCat.name] / totalSpent) * 100) : 0;
      r.push({ icon: <CatIcon name={topCat.name} color={topCat.color} />, color: topCat.color, title: `Top: ${topCat.name}`, desc: `${fmt(spent[topCat.name])} — ${p}% of all spending` });
    }
    let maxInc = { cat: "", pct: 0 };
    BUDGET_CATEGORIES.forEach(c => { const cu = spent[c.name] || 0; const pv = lastSpent[c.name] || 0; if (pv > 0 && cu > pv) { const ch = Math.round(((cu - pv) / pv) * 100); if (ch > maxInc.pct) maxInc = { cat: c.name, pct: ch }; } });
    if (maxInc.cat && maxInc.pct > 20) {
      const mc = BUDGET_CATEGORIES.find(c => c.name === maxInc.cat);
      r.push({ icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>, color: "#F97316", title: `${maxInc.cat} Up ${maxInc.pct}%`, desc: `vs last month. ${fmt(lastSpent[maxInc.cat] || 0)} → ${fmt(spent[maxInc.cat] || 0)}` });
    }
    if (income > 0 && totalSpent > 0) {
      r.push({ icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={savingsRate >= 20 ? "#10B981" : "#EAB308"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>, color: savingsRate >= 20 ? "#10B981" : "#EAB308", title: `${Math.max(0, savingsRate)}% Savings Rate`, desc: savingsRate >= 20 ? "Above the recommended 20%. Great job!" : "Below 20%. Try to save more this month." });
    }
    return r.slice(0, 4);
  }, [spent, lastSpent, budgets, income, totalSpent, totalRemaining, timePct, budgetPct]);

  const velocity7 = useMemo(() => {
    const dn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const res: { day: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = d.toISOString().split("T")[0]; res.push({ day: dn[d.getDay()], amount: dailyMap[k] || 0 }); }
    return res;
  }, [dailyMap]);

  const trends = useMemo(() => {
    const m = new Map<string, "up" | "down" | "flat">();
    BUDGET_CATEGORIES.forEach(c => { const cu = spent[c.name] || 0; const pv = lastSpent[c.name] || 0; if (pv > 0 && cu > pv * 1.05) m.set(c.name, "up"); else if (pv > 0 && cu < pv * 0.95) m.set(c.name, "down"); else m.set(c.name, "flat"); });
    return m;
  }, [spent, lastSpent]);

  const trendPct = useMemo(() => {
    const m = new Map<string, number>();
    BUDGET_CATEGORIES.forEach(c => { const cu = spent[c.name] || 0; const pv = lastSpent[c.name] || 0; m.set(c.name, pv > 0 ? Math.round(((cu - pv) / pv) * 100) : 0); });
    return m;
  }, [spent, lastSpent]);

  const monthTimeline = useMemo(() => {
    const arr: { day: number; amount: number; isToday: boolean; isFuture: boolean }[] = [];
    const dailyAvg = totalBudget > 0 ? totalBudget / daysInMonth : 0;
    for (let i = 1; i <= daysInMonth; i++) {
      const ds = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      arr.push({ day: i, amount: dailyMap[ds] || 0, isToday: i === daysPassed, isFuture: i > daysPassed });
    }
    return { days: arr, dailyAvg };
  }, [dailyMap, daysInMonth, daysPassed, totalBudget]);

  const unbudgetedSpent = useMemo(() => {
    const bn = new Set(Object.keys(budgets));
    return Object.entries(spent).filter(([k, v]) => !bn.has(k) && v > 0).map(([k, v]) => ({ name: k, amount: v, color: BUDGET_CATEGORIES.find(c => c.name === k)?.color || "#6B7280" })).sort((a, b) => b.amount - a.amount);
  }, [spent, budgets]);
  const unbudgetedTotal = unbudgetedSpent.reduce((s, u) => s + u.amount, 0);

  const monthLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

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
        <div className="bh" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Smart Budget</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "3px 0 0 0" }}>{monthLabel} · AI-powered</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={generateAIBudget} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, border: `1px solid ${aiGenerated ? "rgba(34,197,94,0.3)" : "var(--border)"}`, background: aiGenerated ? "rgba(34,197,94,0.08)" : "var(--card)", color: aiGenerated ? "#22C55E" : "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "0.2s" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 014 4c0 1.95-1.4 3.58-3.25 3.93M8 6a4 4 0 014-4M12 18v4M8 22h8M12 2v4" /><circle cx="12" cy="14" r="4" /></svg>
              {aiGenerated ? "Generated!" : "AI Generate"}
            </button>
            <button onClick={saveBudgets} disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, border: "none", background: saved ? "#22C55E" : "#0C0D10", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "wait" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1, transition: "0.2s" }}>
              {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Budget"}
            </button>
          </div>
        </div>

        {/* AI Banner */}
        {aiGenerated && (
          <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 014 4c0 1.95-1.4 3.58-3.25 3.93M8 6a4 4 0 014-4M12 18v4M8 22h8M12 2v4" /><circle cx="12" cy="14" r="4" /></svg>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#22C55E", margin: "0 0 2px" }}>AI Budget Generated</p>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Based on {fmt(income)}/month using 50/30/20 rule. Edit and save.</p>
            </div>
          </div>
        )}

        {/* Month Timeline */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05 }}>Spending Pattern · {monthLabel}</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: "var(--muted)" }}><span style={{ width: 6, height: 6, borderRadius: 3, background: "#22C55E" }} />Low</span>
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: "var(--muted)" }}><span style={{ width: 6, height: 6, borderRadius: 3, background: "#EAB308" }} />Med</span>
              <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: "var(--muted)" }}><span style={{ width: 6, height: 6, borderRadius: 3, background: "#EF4444" }} />High</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {monthTimeline.days.map(d => {
              let bg = "var(--border)";
              if (!d.isFuture && d.amount > 0) {
                const avg = monthTimeline.dailyAvg || 1;
                if (d.amount < avg * 0.8) bg = "#22C55E";
                else if (d.amount < avg * 1.5) bg = "#EAB308";
                else bg = "#EF4444";
              }
              if (d.isFuture) bg = "var(--border)";
              return <div key={d.day} title={`Day ${d.day}: ${fmt(d.amount)}`} style={{ width: 8, height: 8, borderRadius: 4, background: bg, opacity: d.isFuture ? 0.3 : 1, border: d.isToday ? "2px solid var(--text)" : "none", boxSizing: "border-box", transition: "0.2s" }} />;
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 9, color: "var(--muted)" }}>1</span>
            <span style={{ fontSize: 9, color: "var(--muted)" }}>{Math.round(daysInMonth / 2)}</span>
            <span style={{ fontSize: 9, color: "var(--muted)" }}>{daysInMonth}</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="bs" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.05 }}>Income</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{income > 0 ? fmt(income) : "—"}</p>
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.05 }}>Budgeted</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(totalBudget)}</p>
          </div>
          <div style={{ background: totalRemaining >= 0 ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)", border: `1px solid ${totalRemaining >= 0 ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 10, padding: "14px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.05 }}>{totalRemaining >= 0 ? "Remaining" : "Over"}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: totalRemaining >= 0 ? "#22C55E" : "#EF4444", margin: 0, fontVariantNumeric: "tabular-nums" }}>{totalRemaining >= 0 ? "" : "-"}{fmt(Math.abs(totalRemaining))}</p>
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.05 }}>Daily Target</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: perDay >= 0 ? "#22C55E" : "#EF4444", margin: 0, fontVariantNumeric: "tabular-nums" }}>{perDay >= 0 ? fmt(perDay) : "—"}</p>
          </div>
        </div>

        {/* Health + Spend Pace */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "22px", marginBottom: 16, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <DonutChart pct={healthScore} color={health.color} size={96} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: health.color, fontVariantNumeric: "tabular-nums" }}>{healthScore}</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 8px" }}>Budget Health — <span style={{ color: health.color }}>{health.label}</span></p>
            {/* Spend Pace */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500 }}>Time Passed</span>
                <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{timePct}%</span>
              </div>
              <div style={{ height: 6, background: "var(--border)", borderRadius: 6, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", width: `${timePct}%`, background: "#3B82F6", borderRadius: 6, transition: "width 0.6s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500 }}>Budget Used</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: budgetPct > timePct + 15 ? "#EF4444" : "#22C55E", fontVariantNumeric: "tabular-nums" }}>{budgetPct}%</span>
              </div>
              <div style={{ height: 6, background: "var(--border)", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, budgetPct)}%`, background: budgetPct > timePct + 15 ? "#EF4444" : budgetPct > timePct ? "#EAB308" : "#22C55E", borderRadius: 6, transition: "width 0.6s" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div><p style={{ fontSize: 9, color: "var(--muted)", margin: 0, textTransform: "uppercase" }}>Projected</p><p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "1px 0 0 0", fontVariantNumeric: "tabular-nums" }}>{fmt(projected)}</p></div>
              <div><p style={{ fontSize: 9, color: "#22C55E", margin: 0, textTransform: "uppercase" }}>On Track</p><p style={{ fontSize: 14, fontWeight: 700, color: "#22C55E", margin: "1px 0 0 0" }}>{onTrackCount}</p></div>
              {overCount > 0 && <div><p style={{ fontSize: 9, color: "#EF4444", margin: 0, textTransform: "uppercase" }}>Over</p><p style={{ fontSize: 14, fontWeight: 700, color: "#EF4444", margin: "1px 0 0 0" }}>{overCount}</p></div>}
              <div><p style={{ fontSize: 9, color: "var(--muted)", margin: 0, textTransform: "uppercase" }}>Days Left</p><p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "1px 0 0 0" }}>{daysLeft}</p></div>
            </div>
          </div>
        </div>

        {/* Smart Insights */}
        {insights.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.05 }}>Smart Insights</p>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(insights.length, 4)}, 1fr)`, gap: 8 }} className="bi">
              {insights.map((ins, i) => (
                <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: ins.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ins.icon}</div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: ins.color }}>{ins.title}</span>
                  </div>
                  <p style={{ fontSize: 10, color: "var(--muted)", margin: 0, lineHeight: 1.4 }}>{ins.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7-Day Velocity */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 0.05 }}>Last 7 Days</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 44 }}>
            {velocity7.map((v, i) => {
              const mx = Math.max(...velocity7.map(x => x.amount), 1);
              const h = Math.max(4, (v.amount / mx) * 40);
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{ width: "100%", height: h, borderRadius: 3, background: v.amount > 0 ? (v.amount > mx * 0.7 ? "#F97316" : "#22C55E") : "var(--border)", transition: "height 0.5s", minWidth: 8 }} />
                  <span style={{ fontSize: 9, color: "var(--muted)", fontWeight: 500 }}>{v.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overall Progress */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Overall Budget Used</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{utilized}%</span>
          </div>
          <div style={{ height: 8, background: "var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, utilized)}%`, background: utilized >= 100 ? "#EF4444" : utilized >= 80 ? "#F97316" : utilized >= 60 ? "#EAB308" : "#22C55E", borderRadius: 8, transition: "width 0.8s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            <span style={{ fontSize: 10, color: "var(--muted)" }}>Spent {fmt(totalSpent)}</span>
            <span style={{ fontSize: 10, color: "var(--muted)" }}>Budget {fmt(totalBudget)}</span>
          </div>
          {projDiff !== 0 && (
            <p style={{ fontSize: 11, margin: "6px 0 0 0", fontWeight: 500, color: projDiff > 0 ? "#22C55E" : "#EF4444" }}>
              {projDiff > 0 ? `On track to save ${fmt(projDiff)} by month end` : `At this pace, exceed by ${fmt(Math.abs(projDiff))}`}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {([["overview", "Overview"], ["setup", "Edit Budget"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => { setActiveTab(key as "overview" | "setup"); }} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid " + (activeTab === key ? "var(--text)" : "var(--border)"), background: activeTab === key ? "var(--text)" : "var(--card)", color: activeTab === key ? "var(--bg)" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "0.15s" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {BUDGET_CATEGORIES.map(cat => {
                const budgeted = budgets[cat.name] || 0;
                const spentAmt = spent[cat.name] || 0;
                const status = getStatus(budgeted, spentAmt);
                const trend = trends.get(cat.name);
                const tp = trendPct.get(cat.name) || 0;
                if (budgeted === 0 && spentAmt === 0) return null;
                return (
                  <div key={cat.name} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", borderLeft: `4px solid ${cat.color}`, transition: "background 0.1s, border-color 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg)"; e.currentTarget.style.borderColor = cat.color + "44"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--card)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.borderLeftColor = cat.color; }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: budgeted > 0 ? 10 : 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <CatIcon name={cat.name} color={cat.color} />
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{cat.name}</p>
                            {trend && trend !== "flat" && tp > 0 && (
                              <span style={{ fontSize: 9, fontWeight: 700, color: trend === "up" ? "#EF4444" : "#22C55E", background: (trend === "up" ? "#EF4444" : "#22C55E") + "14", padding: "1px 5px", borderRadius: 4 }}>
                                {trend === "up" ? "↑" : "↓"}{tp}%
                              </span>
                            )}
                          </div>
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
                    {budgeted > 0 && (
                      <div style={{ height: 5, background: "var(--border)", borderRadius: 5, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(100, status.pct)}%`, background: status.color, borderRadius: 5, transition: "width 0.6s" }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {unbudgetedSpent.length > 0 && (
              <div style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 10, padding: "16px 18px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>Unbudgeted Spending</p>
                </div>
                <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 10px" }}>{fmt(unbudgetedTotal)} spent without a budget</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {unbudgetedSpent.map(u => (
                    <span key={u.name} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, background: u.color + "14", border: `1px solid ${u.color}33`, fontSize: 11, color: u.color, fontWeight: 500 }}>
                      <span style={{ width: 5, height: 5, borderRadius: 5, background: u.color }} />{u.name} · {fmt(u.amount)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Edit Tab */}
        {activeTab === "setup" && (
          <>
            <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "14px 18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" /></svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#3B82F6", margin: "0 0 2px" }}>AI Budget Engine</p>
                <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Based on <strong>{fmt(income)}/month</strong> using 50/30/20 rule. Edit any amount and save.</p>
              </div>
            </div>

            {/* Optimizer */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <button onClick={optimizeBudget} style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: `1px solid ${optimized ? "rgba(34,197,94,0.3)" : "var(--border)"}`, background: optimized ? "rgba(34,197,94,0.08)" : "var(--card)", color: optimized ? "#22C55E" : "var(--text)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "0.2s" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 014 4c0 1.95-1.4 3.58-3.25 3.93M8 6a4 4 0 014-4M12 18v4M8 22h8M12 2v4" /><circle cx="12" cy="14" r="4" /></svg>
                {optimized ? "Optimized!" : "Auto-Optimize Budget"}
              </button>
              <button onClick={generateAIBudget} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "0.2s" }}>Reset to AI</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
              {BUDGET_CATEGORIES.map(cat => {
                const budgeted = budgets[cat.name] || 0;
                const spentAmt = spent[cat.name] || 0;
                const trend = trends.get(cat.name);
                const tp = trendPct.get(cat.name) || 0;
                return (
                  <div key={cat.name} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, transition: "border-color 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = cat.color + "44"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}>
                    <CatIcon name={cat.name} color={cat.color} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{cat.name}</p>
                        {trend && trend !== "flat" && tp > 0 && (
                          <span style={{ fontSize: 9, fontWeight: 700, color: trend === "up" ? "#EF4444" : "#22C55E" }}>{trend === "up" ? "↑" : "↓"}{tp}%</span>
                        )}
                      </div>
                      <p style={{ fontSize: 10, color: "var(--muted)", margin: "2px 0 0 0" }}>
                        {cat.recommended > 0 ? `AI: ${cat.recommended}% = ${fmt(Math.round(income * cat.recommended / 100))}` : "Set your own"}
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
                    <div style={{ width: 38, textAlign: "right", flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{income > 0 && budgeted ? `${Math.round((budgeted / income) * 100)}%` : "0%"}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Budget vs Income */}
            <div style={{ background: totalBudget > income ? "rgba(239,68,68,0.06)" : "rgba(34,197,94,0.06)", border: `1px solid ${totalBudget > income ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`, borderRadius: 10, padding: "16px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Total Budgeted</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: totalBudget > income ? "#EF4444" : "#22C55E", fontVariantNumeric: "tabular-nums" }}>{fmt(totalBudget)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Monthly Income</span>
                <span style={{ fontSize: 12, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{fmt(income)}</span>
              </div>
              <div style={{ height: 1, background: totalBudget > income ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)", marginBottom: 6 }} />
              {totalBudget > income ? (
                <p style={{ fontSize: 12, color: "#EF4444", margin: 0, fontWeight: 500 }}>Exceeds income by {fmt(totalBudget - income)}. Reduce some categories.</p>
              ) : totalBudget > 0 ? (
                <p style={{ fontSize: 12, color: "#22C55E", margin: 0, fontWeight: 500 }}>{fmt(income - totalBudget)} unallocated — add to Savings!</p>
              ) : (
                <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Click "AI Generate" to auto-fill.</p>
              )}
            </div>

            <button onClick={saveBudgets} disabled={saving} style={{ width: "100%", height: 44, borderRadius: 10, border: "none", background: saved ? "#22C55E" : "#0C0D10", color: "#fff", fontSize: 14, fontWeight: 600, cursor: saving ? "wait" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1, transition: "0.2s" }}>
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
          .bi { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .bw { padding: 20px 16px 0 !important; }
          .bh { flex-direction: column !important; align-items: flex-start !important; }
          .bi { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}