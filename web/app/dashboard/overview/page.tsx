"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

var CATS = [
  { name: "Food", color: "#F97316", letter: "F" },
  { name: "Transport", color: "#3B82F6", letter: "T" },
  { name: "Shopping", color: "#EC4899", letter: "S" },
  { name: "Entertainment", color: "#8B5CF6", letter: "E" },
  { name: "Bills", color: "#EF4444", letter: "B" },
  { name: "Health", color: "#14B8A6", letter: "H" },
  { name: "Education", color: "#6366F1", letter: "Ed" },
  { name: "Rent", color: "#F59E0B", letter: "R" },
  { name: "Savings", color: "#22C55E", letter: "Sa" },
  { name: "Other", color: "#64748B", letter: "O" },
];

var ACC_TYPES = [
  { name: "Bank Account", color: "#3B82F6", letter: "B" },
  { name: "Savings Account", color: "#22C55E", letter: "SA" },
  { name: "Current Account", color: "#6366F1", letter: "CA" },
  { name: "Credit Card", color: "#EF4444", letter: "CC" },
  { name: "Cash", color: "#F59E0B", letter: "C" },
  { name: "UPI", color: "#8B5CF6", letter: "UP" },
  { name: "Wallet", color: "#EC4899", letter: "W" },
  { name: "Fixed Deposit", color: "#14B8A6", letter: "FD" },
  { name: "Recurring Deposit", color: "#0EA5E9", letter: "RD" },
  { name: "Mutual Fund", color: "#A855F7", letter: "MF" },
  { name: "Stocks", color: "#F97316", letter: "ST" },
  { name: "PPF", color: "#10B981", letter: "PF" },
  { name: "EPF", color: "#34D399", letter: "EP" },
  { name: "Gold", color: "#FBBF24", letter: "GD" },
  { name: "Real Estate", color: "#78716C", letter: "RE" },
  { name: "Loan", color: "#EF4444", letter: "LN" },
  { name: "Other", color: "#64748B", letter: "OT" },
];

function getCat(n: string) { return CATS.find(function (c) { return c.name === n; }) || CATS[CATS.length - 1]; }
function getAT(n: string) { return ACC_TYPES.find(function (t) { return t.name === n; }) || ACC_TYPES[ACC_TYPES.length - 1]; }
function fmt(n: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0); }
function fmtShort(n: number) {
  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(1) + "Cr";
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(1) + "K";
  return fmt(n);
}
function barC(p: number) { return p <= 50 ? "#22C55E" : p <= 75 ? "#EAB308" : "#EF4444"; }

var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function OverviewPage() {
  var [loading, setLoading] = useState(true);
  var [accounts, setAccounts] = useState<any[]>([]);
  var [txns, setTxns] = useState<any[]>([]);
  var [lastTxns, setLastTxns] = useState<any[]>([]);
  var [budget, setBudget] = useState<any>(null);
  var [month, setMonth] = useState(new Date().getMonth());
  var [year, setYear] = useState(new Date().getFullYear());

  useEffect(function () { load(); }, [month, year]);

  var load = async function () {
    setLoading(true);
    var { data: u } = await supabase.auth.getUser();
    if (!u?.user) { setLoading(false); return; }

    var { data: accData } = await supabase.from("accounts").select("id, name, type, balance").eq("user_id", u.user.id);
    setAccounts(accData || []);

    var ms = new Date(year, month, 1).toISOString().split("T")[0];
    var me = new Date(year, month + 1, 0).toISOString().split("T")[0];
    var { data: tData } = await supabase.from("transactions").select("id, amount, type, category, description, date").eq("user_id", u.user.id).gte("date", ms).lte("date", me).order("date", { ascending: false });
    setTxns(tData || []);

    var lms = new Date(year, month - 1, 1).toISOString().split("T")[0];
    var lme = new Date(year, month, 0).toISOString().split("T")[0];
    var { data: ltData } = await supabase.from("transactions").select("amount, type").eq("user_id", u.user.id).gte("date", lms).lte("date", lme);
    setLastTxns(ltData || []);

    var { data: bData } = await supabase.from("budgets").select("categories").eq("user_id", u.user.id).eq("month", month + 1).eq("year", year).maybeSingle();
    setBudget(bData || null);

    setLoading(false);
  };

  /* ── Balance ── */
  var totalBalance = useMemo(function () { return accounts.reduce(function (s, a) { return s + Number(a.balance || 0); }, 0); }, [accounts]);
  var totalAssets = useMemo(function () { return accounts.filter(function (a) { return Number(a.balance || 0) > 0; }).reduce(function (s, a) { return s + Number(a.balance); }, 0); }, [accounts]);
  var totalDebts = useMemo(function () { return accounts.filter(function (a) { return Number(a.balance || 0) < 0; }).reduce(function (s, a) { return s + Math.abs(Number(a.balance)); }, 0); }, [accounts]);

  /* ── This month ── */
  var thisIncome = useMemo(function () { return txns.filter(function (t) { return t.type === "income"; }).reduce(function (s, t) { return s + Number(t.amount || 0); }, 0); }, [txns]);
  var thisExpense = useMemo(function () { return txns.filter(function (t) { return t.type === "expense"; }).reduce(function (s, t) { return s + Number(t.amount || 0); }, 0); }, [txns]);
  var thisSaved = thisIncome - thisExpense;
  var savingsRate = thisIncome > 0 ? Math.round((thisSaved / thisIncome) * 100) : 0;
  var txCount = txns.length;

  /* ── Last month ── */
  var lastIncome = useMemo(function () { return lastTxns.filter(function (t) { return t.type === "income"; }).reduce(function (s, t) { return s + Number(t.amount || 0); }, 0); }, [lastTxns]);
  var lastExpense = useMemo(function () { return lastTxns.filter(function (t) { return t.type === "expense"; }).reduce(function (s, t) { return s + Number(t.amount || 0); }, 0); }, [lastTxns]);
  var lastSaved = lastIncome - lastExpense;

  var incomeTrend = lastIncome > 0 ? Math.round(((thisIncome - lastIncome) / lastIncome) * 100) : 0;
  var expenseTrend = lastExpense > 0 ? Math.round(((thisExpense - lastExpense) / lastExpense) * 100) : 0;
  var savedTrend = lastSaved !== 0 ? Math.round(((thisSaved - lastSaved) / Math.abs(lastSaved)) * 100) : 0;

  /* ── Budget ── */
  var budgetCats = useMemo(function () {
    if (!budget?.categories) return {};
    try { return JSON.parse(budget.categories); } catch (e) { return {}; }
  }, [budget]);

  var budgetTotal = useMemo(function () { return Object.values(budgetCats).reduce(function (s: number, v: any) { return s + Number(v || 0); }, 0); }, [budgetCats]);
  var budgetSpent = useMemo(function () {
    return txns.filter(function (t) { return t.type === "expense" && budgetCats[t.category]; }).reduce(function (s, t) { return s + Number(t.amount || 0); }, 0);
  }, [txns, budgetCats]);
  var budgetLeft = budgetTotal - budgetSpent;
  var budgetPct = budgetTotal > 0 ? Math.min(100, Math.round((budgetSpent / budgetTotal) * 100)) : 0;

  var now = new Date();
  var isCurrentMonth = month === now.getMonth() && year === now.getFullYear();
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var dayOfMonth = isCurrentMonth ? now.getDate() : daysInMonth;
  var daysLeft = daysInMonth - dayOfMonth;
  var perDay = daysLeft > 0 && budgetLeft > 0 ? Math.round(budgetLeft / daysLeft) : 0;

  /* ── Health Score ── */
  var healthScore = useMemo(function () {
    var entries = Object.entries(budgetCats).filter(function ([, v]: [string, any]) { return Number(v) > 0; });
    if (entries.length === 0) return 100;
    var total = 0;
    entries.forEach(function ([cat, b]: [string, any]) {
      var spent = txns.filter(function (t) { return t.type === "expense" && t.category === cat; }).reduce(function (s, t) { return s + Number(t.amount || 0); }, 0);
      var pct = (spent / Number(b)) * 100;
      if (pct <= 50) total += 100;
      else if (pct <= 80) total += 100 - (pct - 50);
      else if (pct <= 100) total += 70 - (pct - 80) * 2;
      else total += Math.max(0, 30 - (pct - 100) * 0.3);
    });
    return Math.round(total / entries.length);
  }, [budgetCats, txns]);

  var hi = healthScore >= 80 ? { l: "On Track", c: "#22C55E" } : healthScore >= 60 ? { l: "Good", c: "#22C55E" } : healthScore >= 40 ? { l: "Fair", c: "#F59E0B" } : { l: "At Risk", c: "#EF4444" };

  /* ── Budget per category ── */
  var budgetBreakdown = useMemo(function () {
    var entries = Object.entries(budgetCats).filter(function ([, v]: [string, any]) { return Number(v) > 0; });
    if (entries.length === 0) return [];
    return entries.map(function ([cat, b]: [string, any]) {
      var spent = txns.filter(function (t) { return t.type === "expense" && t.category === cat; }).reduce(function (s, t) { return s + Number(t.amount || 0); }, 0);
      var pct = Math.min(100, Math.round((spent / Number(b)) * 100));
      return { cat: cat, budget: Number(b), spent: spent, left: Number(b) - spent, pct: pct };
    }).sort(function (a, b) { return b.spent - a.spent; });
  }, [budgetCats, txns]);

  /* ── Savings rate color ── */
  var srColor = savingsRate >= 20 ? "#22C55E" : savingsRate >= 10 ? "#F59E0B" : savingsRate > 0 ? "#EF4444" : "#EF4444";
  var srLabel = savingsRate >= 20 ? "Good" : savingsRate >= 10 ? "Fair" : savingsRate > 0 ? "Low" : "Overspending";

  /* ── Top spending ── */
  var topCategories = useMemo(function () {
    var map: Record<string, number> = {};
    txns.filter(function (t) { return t.type === "expense"; }).forEach(function (t) {
      map[t.category || "Other"] = (map[t.category || "Other"] || 0) + Number(t.amount || 0);
    });
    return Object.entries(map).sort(function ([, a], [, b]) { return b - a; }).slice(0, 5).map(function ([name, amount]) { return { name: name, amount: amount, pct: thisExpense > 0 ? Math.round((amount / thisExpense) * 100) : 0 }; });
  }, [txns]);
  var topCatMax = topCategories.length > 0 ? topCategories[0].amount : 0;

  /* ── Recent ── */
  var recentTxns = useMemo(function () { return txns.slice(0, 5); }, [txns]);
  var sortedAccounts = useMemo(function () { return [...accounts].sort(function (a, b) { return Math.abs(Number(b.balance)) - Math.abs(Number(a.balance)); }); }, [accounts]);

  /* ── Month nav ── */
  var prevMonth = function () { if (month === 0) { setMonth(11); setYear(year - 1); } else { setMonth(month - 1); } };
  var nextMonth = function () {
    var nm = month === 11 ? 0 : month + 1;
    var ny = month === 11 ? year + 1 : year;
    if (nm > now.getMonth() && ny >= now.getFullYear()) return;
    if (ny > now.getFullYear()) return;
    setMonth(nm); setYear(ny);
  };
  var canNext = !(month === now.getMonth() && year === now.getFullYear());

  /* ── Insight ── */
  var insight = useMemo(function () {
    if (thisIncome === 0 && thisExpense === 0) return null;
    if (thisExpense > 0 && lastExpense > 0) {
      if (expenseTrend > 20) return "You spent " + Math.abs(expenseTrend) + "% more than last month. Keep an eye on it.";
      if (expenseTrend < -10) return "Great! You spent " + Math.abs(expenseTrend) + "% less than last month.";
    }
    if (savingsRate >= 30) return "Excellent! You're saving " + savingsRate + "% of your income.";
    if (budgetPct > 90) return "You've used " + budgetPct + "% of your budget. Be careful with spending.";
    if (budgetLeft > 0 && perDay > 0 && isCurrentMonth) return "You can spend " + fmt(perDay) + " per day for the rest of the month.";
    return null;
  }, [thisIncome, thisExpense, lastExpense, expenseTrend, savingsRate, budgetPct, budgetLeft, perDay, isCurrentMonth]);

  if (loading) return (
    <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 20, height: 20, border: "2px solid var(--border)", borderTopColor: "#22C55E", borderRadius: "50%", animation: "sp 0.6s linear infinite" }} />
      <style>{"@keyframes sp{to{transform:rotate(360deg)}}"}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="bw" style={{ maxWidth: 780, margin: "0 auto", padding: "28px 24px 64px" }}>

        {/* ── Month Nav ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <button onClick={prevMonth} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.1s" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "var(--card)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{MONTHS[month]} {year}</span>
          {canNext ? (
            <button onClick={nextMonth} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.1s" }}
              onMouseEnter={function (e) { e.currentTarget.style.background = "var(--card)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          ) : <div style={{ width: 28 }} />}
        </div>

        {/* ── Header ── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Overview</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "2px 0 0 0" }}>Your financial snapshot</p>
        </div>

        {/* ── Net Worth ── */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 32, fontWeight: 700, color: totalBalance >= 0 ? "#22C55E" : "#EF4444", margin: 0, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>{fmt(totalBalance)}</p>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0 0" }}>net worth</p>
          <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
            {totalAssets > 0 ? (<div><span style={{ width: 7, height: 7, borderRadius: 4, background: "#22C55E", display: "inline-block", marginRight: 4, verticalAlign: "middle" }} /><span style={{ fontSize: 11, color: "var(--muted)" }}>Assets </span><span style={{ fontSize: 12, fontWeight: 600, color: "#22C55E", fontVariantNumeric: "tabular-nums" }}>{fmt(totalAssets)}</span></div>) : null}
            {totalDebts > 0 ? (<div><span style={{ width: 7, height: 7, borderRadius: 4, background: "#EF4444", display: "inline-block", marginRight: 4, verticalAlign: "middle" }} /><span style={{ fontSize: 11, color: "var(--muted)" }}>Debts </span><span style={{ fontSize: 12, fontWeight: 600, color: "#EF4444", fontVariantNumeric: "tabular-nums" }}>{fmt(totalDebts)}</span></div>) : null}
            <div><span style={{ width: 7, height: 7, borderRadius: 4, background: "#3B82F6", display: "inline-block", marginRight: 4, verticalAlign: "middle" }} /><span style={{ fontSize: 11, color: "var(--muted)" }}>Accounts </span><span style={{ fontSize: 12, fontWeight: 600, color: "#3B82F6", fontVariantNumeric: "tabular-nums" }}>{accounts.length}</span></div>
          </div>
        </div>

        {/* ── Insight ── */}
        {insight ? (
          <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
            <p style={{ fontSize: 12, color: "var(--text)", margin: 0, lineHeight: 1.5 }}>{insight}</p>
          </div>
        ) : null}

        {/* ── Income | Expense | Saved ── */}
        <div className="mc" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px" }}>
            <p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05, margin: 0 }}>Income</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#22C55E", margin: "4px 0 0 0", fontVariantNumeric: "tabular-nums" }}>{fmt(thisIncome)}</p>
            {lastIncome > 0 ? (<p style={{ fontSize: 10, color: incomeTrend >= 0 ? "#22C55E" : "#EF4444", margin: "2px 0 0 0", fontWeight: 600 }}>{incomeTrend >= 0 ? "↑" : "↓"}{Math.abs(incomeTrend)}% vs last</p>) : thisIncome > 0 ? (<p style={{ fontSize: 10, color: "var(--border)", margin: "2px 0 0 0" }}>first month</p>) : <p style={{ fontSize: 10, color: "var(--border)", margin: "2px 0 0 0" }}>—</p>}
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px" }}>
            <p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05, margin: 0 }}>Expense</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#EF4444", margin: "4px 0 0 0", fontVariantNumeric: "tabular-nums" }}>{fmt(thisExpense)}</p>
            {lastExpense > 0 ? (<p style={{ fontSize: 10, color: expenseTrend <= 0 ? "#22C55E" : "#EF4444", margin: "2px 0 0 0", fontWeight: 600 }}>{expenseTrend >= 0 ? "↑" : "↓"}{Math.abs(expenseTrend)}% vs last</p>) : thisExpense > 0 ? (<p style={{ fontSize: 10, color: "var(--border)", margin: "2px 0 0 0" }}>first month</p>) : <p style={{ fontSize: 10, color: "var(--border)", margin: "2px 0 0 0" }}>—</p>}
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px" }}>
            <p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05, margin: 0 }}>Saved</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: thisSaved >= 0 ? "#22C55E" : "#EF4444", margin: "4px 0 0 0", fontVariantNumeric: "tabular-nums" }}>{thisSaved >= 0 ? "" : "-"}{fmt(Math.abs(thisSaved))}</p>
            {lastSaved !== 0 ? (<p style={{ fontSize: 10, color: savedTrend >= 0 ? "#22C55E" : "#EF4444", margin: "2px 0 0 0", fontWeight: 600 }}>{savedTrend >= 0 ? "↑" : "↓"}{Math.abs(savedTrend)}% vs last</p>) : thisSaved !== 0 ? (<p style={{ fontSize: 10, color: "var(--border)", margin: "2px 0 0 0" }}>first month</p>) : <p style={{ fontSize: 10, color: "var(--border)", margin: "2px 0 0 0" }}>—</p>}
          </div>
        </div>

        {/* ── Savings Rate + Tx Count ── */}
        {thisIncome > 0 || txCount > 0 ? (
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {thisIncome > 0 ? (<><span style={{ width: 7, height: 7, borderRadius: 4, background: srColor, flexShrink: 0 }} /><span style={{ fontSize: 11, color: "var(--muted)" }}>Savings rate </span><span style={{ fontSize: 12, fontWeight: 600, color: srColor, fontVariantNumeric: "tabular-nums" }}>{savingsRate}%</span><span style={{ fontSize: 10, color: srColor, fontWeight: 500 }}>· {srLabel}</span></>) : null}
            {thisIncome > 0 && txCount > 0 ? <span style={{ fontSize: 11, color: "var(--border)" }}>·</span> : null}
            {txCount > 0 ? (<><span style={{ fontSize: 11, color: "var(--muted)" }}>{txCount} transaction{txCount !== 1 ? "s" : ""}</span></>) : null}
          </div>
        ) : null}

        {/* ── Budget ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>Budget</p>
            {budgetTotal > 0 ? (<Link href="/dashboard/budget" style={{ fontSize: 11, color: "#22C55E", fontWeight: 500, textDecoration: "none" }}>View details →</Link>) : null}
          </div>
          {budgetTotal > 0 ? (
            <>
              {/* Overall bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: budgetPct + "%", background: barC(budgetPct), borderRadius: 6, transition: "width 0.5s" }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: barC(budgetPct), fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{budgetPct}%</span>
              </div>
              {/* Health + left + per day */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: budgetBreakdown.length > 0 ? 12 : 0 }}>
                <span style={{ width: 7, height: 7, borderRadius: 4, background: hi.c, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: hi.c }}>{hi.l}</span>
                <span style={{ fontSize: 11, color: "var(--border)" }}>·</span>
                <span style={{ fontSize: 11, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{fmt(Math.abs(budgetLeft))} {budgetLeft >= 0 ? "left" : "over"}</span>
                {perDay > 0 && isCurrentMonth ? (<><span style={{ fontSize: 11, color: "var(--border)" }}>·</span><span style={{ fontSize: 11, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{fmt(perDay)}/day</span></>) : null}
                {isCurrentMonth && daysLeft > 0 ? (<><span style={{ fontSize: 11, color: "var(--border)" }}>·</span><span style={{ fontSize: 11, color: "var(--muted)" }}>{daysLeft} days left</span></>) : null}
              </div>
              {/* Per-category bars */}
              {budgetBreakdown.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {budgetBreakdown.map(function (b) {
                    var cat = getCat(b.cat);
                    return (
                      <div key={b.cat} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 5, background: cat.color + "12", color: cat.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, flexShrink: 0, border: "1px solid " + cat.color + "18" }}>{cat.letter}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.cat}</span>
                            <span style={{ fontSize: 10, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: b.left >= 0 ? "var(--muted)" : "#EF4444" }}>{fmtShort(b.spent)} / {fmtShort(b.budget)}</span>
                          </div>
                          <div style={{ height: 3, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: b.pct + "%", background: barC(b.pct), borderRadius: 3, transition: "width 0.5s" }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </>
          ) : (
            <Link href="/dashboard/budget" style={{ display: "block", padding: "12px 14px", borderRadius: 8, border: "1px dashed var(--border)", background: "var(--card)", textDecoration: "none", transition: "border-color 0.15s" }}
              onMouseEnter={function (e) { e.currentTarget.style.borderColor = "rgba(34,197,94,0.3)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>Set up your budget</p>
              <p style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0 0 0" }}>Plan your monthly spending to stay on track</p>
            </Link>
          )}
        </div>

        {/* ── Accounts ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>Accounts</p>
            <Link href="/dashboard/accounts" style={{ fontSize: 11, color: "#22C55E", fontWeight: 500, textDecoration: "none" }}>View all →</Link>
          </div>
          {sortedAccounts.length > 0 ? (
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
              {sortedAccounts.slice(0, 5).map(function (a) {
                var t = getAT(a.type);
                var b = Number(a.balance || 0);
                return (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 6, background: t.color + "08", border: "1px solid " + t.color + "15", flexShrink: 0 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, background: t.color + "15", color: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, flexShrink: 0 }}>{t.letter}</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 80 }}>{a.name}</p>
                      <p style={{ fontSize: 10, fontWeight: 700, color: b < 0 ? "#EF4444" : "#22C55E", margin: 0, fontVariantNumeric: "tabular-nums" }}>{b < 0 ? "-" : ""}{fmt(Math.abs(b))}</p>
                    </div>
                  </div>
                );
              })}
              {sortedAccounts.length > 5 ? (
                <div style={{ display: "flex", alignItems: "center", padding: "7px 10px", borderRadius: 6, background: "var(--card)", border: "1px solid var(--border)", flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)" }}>+{sortedAccounts.length - 5}</span>
                </div>
              ) : null}
            </div>
          ) : (
            <Link href="/dashboard/accounts" style={{ display: "block", padding: "12px 14px", borderRadius: 8, border: "1px dashed var(--border)", background: "var(--card)", textDecoration: "none", transition: "border-color 0.15s" }}
              onMouseEnter={function (e) { e.currentTarget.style.borderColor = "rgba(34,197,94,0.3)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>Add your first account</p>
              <p style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0 0 0" }}>See all your money in one place</p>
            </Link>
          )}
        </div>

        {/* ── Recent Transactions ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>Recent</p>
            {recentTxns.length > 0 ? (<Link href="/dashboard/transactions" style={{ fontSize: 11, color: "#22C55E", fontWeight: 500, textDecoration: "none" }}>View all →</Link>) : null}
          </div>
          {recentTxns.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {recentTxns.map(function (t) {
                var cat = getCat(t.category);
                var isIncome = t.type === "income";
                var amt = Number(t.amount || 0);
                var d = t.date ? new Date(t.date + "T00:00:00") : null;
                var ds = d ? d.getDate() + " " + MONTHS[d.getMonth()].slice(0, 3) : "";
                return (
                  <div key={t.id} style={{ padding: "8px 10px", borderRadius: 6, display: "flex", alignItems: "center", gap: 8, transition: "background 0.1s" }}
                    onMouseEnter={function (e) { e.currentTarget.style.background = "var(--card)"; }}
                    onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: cat.color + "12", color: cat.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, border: "1px solid " + cat.color + "18" }}>{cat.letter}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.description || (isIncome ? "Income" : cat.name)}</p>
                      <p style={{ fontSize: 10, color: "var(--muted)", margin: "1px 0 0 0" }}>{isIncome ? "Income" : cat.name}{ds ? " · " + ds : ""}</p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isIncome ? "#22C55E" : "#EF4444", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{isIncome ? "+" : "-"}{fmt(amt)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <Link href="/dashboard/transactions" style={{ display: "block", padding: "12px 14px", borderRadius: 8, border: "1px dashed var(--border)", background: "var(--card)", textDecoration: "none", transition: "border-color 0.15s" }}
              onMouseEnter={function (e) { e.currentTarget.style.borderColor = "rgba(34,197,94,0.3)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>No transactions this month</p>
              <p style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0 0 0" }}>Start tracking your spending</p>
            </Link>
          )}
        </div>

        {/* ── Top Spending ── */}
        {topCategories.length > 0 ? (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>Top Spending</p>
              <Link href="/dashboard/transactions" style={{ fontSize: 11, color: "#22C55E", fontWeight: 500, textDecoration: "none" }}>View all →</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {topCategories.map(function (c) {
                var cat = getCat(c.name);
                var barPct = topCatMax > 0 ? (c.amount / topCatMax) * 100 : 0;
                return (
                  <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 5, background: cat.color + "12", color: cat.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, flexShrink: 0, border: "1px solid " + cat.color + "18" }}>{cat.letter}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)" }}>{c.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{fmt(c.amount)} · {c.pct}%</span>
                      </div>
                      <div style={{ height: 3, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: barPct + "%", background: cat.color, borderRadius: 3, transition: "width 0.5s" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

      </div>

      <style>{"@keyframes sp{to{transform:rotate(360deg)}}"}</style>
      <style>{"@media(max-width:640px){.mc{grid-template-columns:1fr!important}}"}</style>
    </div>
  );
}