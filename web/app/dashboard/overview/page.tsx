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

var INCOME_CATS = [
  { name: "Salary", color: "#22C55E", letter: "Sa" },
  { name: "Freelance", color: "#3B82F6", letter: "Fr" },
  { name: "Interest", color: "#F59E0B", letter: "In" },
  { name: "Gift", color: "#EC4899", letter: "Gi" },
  { name: "Refund", color: "#8B5CF6", letter: "Re" },
  { name: "Rental", color: "#14B8A6", letter: "Rn" },
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

function getCat(n: string) { return CATS.find(function (c) { return c.name === n; }) || CATS[9]; }
function getAT(n: string) { return ACC_TYPES.find(function (t) { return t.name === n; }) || ACC_TYPES[16]; }

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
}

function fmtShort(n: number) {
  var a = Math.abs(n);
  if (a >= 10000000) return (n < 0 ? "-" : "") + "₹" + (a / 10000000).toFixed(1) + "Cr";
  if (a >= 100000) return (n < 0 ? "-" : "") + "₹" + (a / 100000).toFixed(1) + "L";
  if (a >= 1000) return (n < 0 ? "-" : "") + "₹" + (a / 1000).toFixed(1) + "K";
  return fmt(n);
}

function barColor(p: number) { return p <= 50 ? "var(--green)" : p <= 75 ? "var(--yellow)" : "var(--red)"; }

var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function CatIcon(props: { name: string; size?: number }) {
  var c = getCat(props.name);
  var sz = props.size || 26;
  var fs = sz <= 22 ? 8 : 10;
  return (
    <div style={{ width: sz, height: sz, borderRadius: 6, background: c.color + "1F", color: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: fs, fontWeight: 700, flexShrink: 0, border: "1px solid " + c.color + "2E" }}>{c.letter}</div>
  );
}

function AccIcon(props: { type: string; size?: number }) {
  var t = getAT(props.type);
  var sz = props.size || 24;
  var fs = sz <= 22 ? 8 : 9;
  return (
    <div style={{ width: sz, height: sz, borderRadius: 5, background: t.color + "1F", color: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: fs, fontWeight: 700, flexShrink: 0, border: "1px solid " + t.color + "2E" }}>{t.letter}</div>
  );
}

function Temperature(props: { score: number }) {
  var s = props.score;
  var label: string;
  var color: string;
  var emoji: string;
  if (s >= 80) { label = "Calm"; color = "var(--green)"; emoji = "🟢"; }
  else if (s >= 60) { label = "Steady"; color = "var(--yellow)"; emoji = "🟡"; }
  else if (s >= 40) { label = "Tense"; color = "#F97316"; emoji = "🟠"; }
  else { label = "Stressed"; color = "var(--red)"; emoji = "🔴"; }
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px 3px 7px", borderRadius: 6, background: color === "var(--green)" ? "var(--green-dim)" : color === "var(--yellow)" ? "var(--yellow-dim)" : color === "var(--red)" ? "var(--red-dim)" : "rgba(249,115,22,0.10)", border: "1px solid " + (color === "var(--green)" ? "var(--green-border)" : color === "var(--yellow)" ? "var(--yellow-border)" : color === "var(--red)" ? "var(--red-border)" : "rgba(249,115,22,0.18)") }}>
      <span style={{ fontSize: 10 }}>{emoji}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: color }}>{label}</span>
    </div>
  );
}

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

    var { data: a } = await supabase.from("accounts").select("id, name, type, balance").eq("user_id", u.user.id);
    setAccounts(a || []);

    var ms = new Date(year, month, 1).toISOString().split("T")[0];
    var me = new Date(year, month + 1, 0).toISOString().split("T")[0];
    var { data: t } = await supabase.from("transactions").select("id, amount, type, category, description, date").eq("user_id", u.user.id).gte("date", ms).lte("date", me).order("date", { ascending: false });
    setTxns(t || []);

    var lms = new Date(year, month - 1, 1).toISOString().split("T")[0];
    var lme = new Date(year, month, 0).toISOString().split("T")[0];
    var { data: lt } = await supabase.from("transactions").select("amount, type").eq("user_id", u.user.id).gte("date", lms).lte("date", lme);
    setLastTxns(lt || []);

    var { data: b } = await supabase.from("budgets").select("categories").eq("user_id", u.user.id).eq("month", month + 1).eq("year", year).maybeSingle();
    setBudget(b || null);

    setLoading(false);
  };

  /* ── Calculations ── */

  var totalBalance = useMemo(function () { return accounts.reduce(function (s: number, a: any) { return s + Number(a.balance || 0); }, 0); }, [accounts]);
  var totalAssets = useMemo(function () { return accounts.filter(function (a: any) { return Number(a.balance || 0) > 0; }).reduce(function (s: number, a: any) { return s + Number(a.balance); }, 0); }, [accounts]);
  var totalDebts = useMemo(function () { return accounts.filter(function (a: any) { return Number(a.balance || 0) < 0; }).reduce(function (s: number, a: any) { return s + Math.abs(Number(a.balance)); }, 0); }, [accounts]);

  var thisIncome = useMemo(function () { return txns.filter(function (t: any) { return t.type === "income"; }).reduce(function (s: number, t: any) { return s + Number(t.amount || 0); }, 0); }, [txns]);
  var thisExpense = useMemo(function () { return txns.filter(function (t: any) { return t.type === "expense"; }).reduce(function (s: number, t: any) { return s + Number(t.amount || 0); }, 0); }, [txns]);
  var thisSaved = thisIncome - thisExpense;
  var savingsRate = thisIncome > 0 ? Math.round((thisSaved / thisIncome) * 100) : 0;
  var txCount = txns.length;

  var lastIncome = useMemo(function () { return lastTxns.filter(function (t: any) { return t.type === "income"; }).reduce(function (s: number, t: any) { return s + Number(t.amount || 0); }, 0); }, [lastTxns]);
  var lastExpense = useMemo(function () { return lastTxns.filter(function (t: any) { return t.type === "expense"; }).reduce(function (s: number, t: any) { return s + Number(t.amount || 0); }, 0); }, [lastTxns]);
  var lastSaved = lastIncome - lastExpense;

  var incomeTrend = lastIncome > 0 ? Math.round(((thisIncome - lastIncome) / lastIncome) * 100) : 0;
  var expenseTrend = lastExpense > 0 ? Math.round(((thisExpense - lastExpense) / lastExpense) * 100) : 0;
  var savedTrend = lastSaved !== 0 ? Math.round(((thisSaved - lastSaved) / Math.abs(lastSaved)) * 100) : 0;

  /* Budget */
  var budgetCats = useMemo(function () {
    if (!budget?.categories) return {} as Record<string, number>;
    try { return JSON.parse(budget.categories); } catch { return {} as Record<string, number>; }
  }, [budget]);

  var budgetTotal = useMemo(function () { return Object.values(budgetCats).reduce(function (s: number, v: any) { return s + Number(v || 0); }, 0); }, [budgetCats]);
  var budgetSpent = useMemo(function () { return txns.filter(function (t: any) { return t.type === "expense" && budgetCats[t.category]; }).reduce(function (s: number, t: any) { return s + Number(t.amount || 0); }, 0); }, [txns, budgetCats]);
  var budgetLeft = budgetTotal - budgetSpent;
  var budgetPct = budgetTotal > 0 ? Math.min(100, Math.round((budgetSpent / budgetTotal) * 100)) : 0;

  var now = new Date();
  var isCurrent = month === now.getMonth() && year === now.getFullYear();
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var dayOfMonth = isCurrent ? now.getDate() : daysInMonth;
  var daysLeft = daysInMonth - dayOfMonth;
  var perDay = daysLeft > 0 && budgetLeft > 0 ? Math.round(budgetLeft / daysLeft) : 0;

  /* Temperature */
  var tempScore = useMemo(function () {
    var s = 0;
    if (savingsRate >= 20) s += 30; else if (savingsRate >= 10) s += 20; else if (savingsRate > 0) s += 10; else s += 0;
    if (budgetTotal > 0) { if (budgetPct <= 60) s += 30; else if (budgetPct <= 80) s += 20; else if (budgetPct <= 100) s += 10; }
    else { s += 25; }
    if (totalDebts === 0) s += 20; else if (lastTxns.length > 0) { var ld = lastTxns.filter(function (t: any) { return t.type === "expense"; }).reduce(function (s2: number, t: any) { return s2 + Number(t.amount || 0); }, 0); if (thisExpense < ld) s += 15; else s += 5; }
    else { s += 10; }
    if (totalBalance > 0) { if (lastIncome > 0 && thisIncome > 0 && thisSaved > lastSaved * 0.95) s += 20; else s += 10; }
    else { s += 5; }
    return Math.min(100, Math.max(0, s));
  }, [savingsRate, budgetPct, budgetTotal, totalDebts, totalBalance, thisExpense, lastTxns, thisIncome, lastIncome, thisSaved, lastSaved]);

  /* Health */
  var healthScore = useMemo(function () {
    var entries = Object.entries(budgetCats).filter(function ([, v]) { return Number(v) > 0; });
    if (entries.length === 0) return 100;
    var total = 0;
    entries.forEach(function ([cat, b]) {
      var spent = txns.filter(function (t: any) { return t.type === "expense" && t.category === cat; }).reduce(function (s: number, t: any) { return s + Number(t.amount || 0); }, 0);
      var pct = (spent / Number(b)) * 100;
      if (pct <= 50) total += 100;
      else if (pct <= 80) total += 100 - (pct - 50);
      else if (pct <= 100) total += 70 - (pct - 80) * 2;
      else total += Math.max(0, 30 - (pct - 100) * 0.3);
    });
    return Math.round(total / entries.length);
  }, [budgetCats, txns]);

  var healthLabel = healthScore >= 80 ? "On track" : healthScore >= 60 ? "Good" : healthScore >= 40 ? "Fair" : "At risk";
  var healthColor = healthScore >= 80 ? "var(--green)" : healthScore >= 60 ? "var(--green)" : healthScore >= 40 ? "var(--yellow)" : "var(--red)";

  /* Budget breakdown */
  var budgetBreakdown = useMemo(function () {
    return Object.entries(budgetCats).filter(function ([, v]) { return Number(v) > 0; }).map(function ([cat, b]) {
      var spent = txns.filter(function (t: any) { return t.type === "expense" && t.category === cat; }).reduce(function (s: number, t: any) { return s + Number(t.amount || 0); }, 0);
      var pct = Math.min(100, Math.round((spent / Number(b)) * 100));
      return { cat: cat, budget: Number(b), spent: spent, left: Number(b) - spent, pct: pct };
    }).sort(function (a, b) { return b.spent - a.spent; });
  }, [budgetCats, txns]);

  /* Top categories */
  var topCats = useMemo(function () {
    var map: Record<string, number> = {};
    txns.filter(function (t: any) { return t.type === "expense"; }).forEach(function (t: any) { map[t.category || "Other"] = (map[t.category || "Other"] || 0) + Number(t.amount || 0); });
    return Object.entries(map).sort(function ([, a], [, b]) { return b - a; }).slice(0, 5).map(function ([name, amount]) { return { name: name, amount: amount, pct: thisExpense > 0 ? Math.round((amount / thisExpense) * 100) : 0 }; });
  }, [txns, thisExpense]);

  var topMax = topCats.length > 0 ? topCats[0].amount : 0;

  /* Donut */
  var donutSegs = useMemo(function () {
    if (topCats.length === 0) return [];
    var total = topCats.reduce(function (s, c) { return s + c.amount; }, 0);
    if (total === 0) return [];
    var C = 2 * Math.PI * 28;
    var offset = 0;
    return topCats.map(function (c) {
      var cat = getCat(c.name);
      var len = (c.amount / total) * C;
      var seg = { color: cat.color, length: len, offset: offset, name: c.name, pct: Math.round((c.amount / total) * 100) };
      offset += len;
      return seg;
    });
  }, [topCats]);

  var budgetCirc = 2 * Math.PI * 28;

  /* Recent */
  var recentTxns = useMemo(function () { return txns.slice(0, 3); }, [txns]);
  var sortedAccs = useMemo(function () { return [...accounts].sort(function (a: any, b: any) { return Math.abs(Number(b.balance)) - Math.abs(Number(a.balance)); }); }, [accounts]);

  /* Insight */
  var insight = useMemo(function () {
    if (thisIncome === 0 && thisExpense === 0) return null;
    if (thisExpense > 0 && lastExpense > 0 && expenseTrend > 20) return "You spent " + Math.abs(expenseTrend) + "% more than last month. Keep an eye on it.";
    if (thisExpense > 0 && lastExpense > 0 && expenseTrend < -10) return "You spent " + Math.abs(expenseTrend) + "% less than last month.";
    if (savingsRate >= 30) return "You're saving " + savingsRate + "% of your income. That's solid.";
    if (budgetPct > 90 && budgetTotal > 0) return "Budget is " + budgetPct + "% used. Be careful with spending.";
    if (budgetLeft > 0 && perDay > 0 && isCurrent) return "You can spend " + fmt(perDay) + " per day for the rest of the month.";
    return null;
  }, [thisIncome, thisExpense, lastExpense, expenseTrend, savingsRate, budgetPct, budgetTotal, budgetLeft, perDay, isCurrent]);

  /* Savings rate color */
  var srColor = savingsRate >= 20 ? "var(--green)" : savingsRate >= 10 ? "var(--yellow)" : "var(--red)";
  var srLabel = savingsRate >= 20 ? "Good" : savingsRate >= 10 ? "Fair" : savingsRate > 0 ? "Low" : "Overspending";

  /* Has data */
  var hasData = accounts.length > 0 || txns.length > 0;

  /* Month nav */
  var prevMonth = function () { if (month === 0) { setMonth(11); setYear(year - 1); } else { setMonth(month - 1); } };
  var nextMonth = function () {
    var nm = month === 11 ? 0 : month + 1;
    var ny = month === 11 ? year + 1 : year;
    if (ny > now.getFullYear()) return;
    if (ny === now.getFullYear() && nm > now.getMonth()) return;
    setMonth(nm); setYear(ny);
  };
  var canNext = !(month === now.getMonth() && year === now.getFullYear());

  /* Loading */
  if (loading) return (
    <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ height: 14, borderRadius: 4, background: "var(--card)", animation: "shimmer 1.5s infinite" }} />
        <div style={{ height: 48, borderRadius: 8, background: "var(--card)", animation: "shimmer 1.5s infinite 0.1s" }} />
        <div style={{ display: "flex", gap: 8 }}><div style={{ flex: 1, height: 72, borderRadius: 8, background: "var(--card)", animation: "shimmer 1.5s infinite 0.2s" }} /><div style={{ flex: 1, height: 72, borderRadius: 8, background: "var(--card)", animation: "shimmer 1.5s infinite 0.3s" }} /><div style={{ flex: 1, height: 72, borderRadius: 8, background: "var(--card)", animation: "shimmer 1.5s infinite 0.4s" }} /></div>
      </div>
      <style>{"@keyframes shimmer{0%{opacity:1}50%{opacity:0.4}100%{opacity:1}}"}</style>
    </div>
  );

  /* Empty State */
  if (!hasData) return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 24px 32px" }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>casha<span style={{ color: "var(--green)" }}>.</span></p>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", margin: "0 0 8px", lineHeight: 1.2 }}>Let's get started.</h1>
      <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 32px", lineHeight: 1.5 }}>Three steps to clarity. Takes 60 seconds.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Link href="/dashboard/accounts" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 8, background: "var(--card)", border: "1px solid var(--border)", textDecoration: "none", transition: "border-color 150ms ease" }}
          onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; }} onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
          </div>
          <div><p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>Add your first account</p><p style={{ fontSize: 10, color: "var(--muted)", margin: "2px 0 0 0" }}>See your net worth</p></div>
        </Link>
        <Link href="/dashboard/transactions" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 8, background: "var(--card)", border: "1px solid var(--border)", textDecoration: "none", transition: "border-color 150ms ease" }}
          onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; }} onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </div>
          <div><p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>Log a transaction</p><p style={{ fontSize: 10, color: "var(--muted)", margin: "2px 0 0 0" }}>Track where it goes</p></div>
        </Link>
        <Link href="/dashboard/budget" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 8, background: "var(--card)", border: "1px solid var(--border)", textDecoration: "none", transition: "border-color 150ms ease" }}
          onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; }} onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
          </div>
          <div><p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>Set a budget</p><p style={{ fontSize: 10, color: "var(--muted)", margin: "2px 0 0 0" }}>Plan your month</p></div>
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 24px 80px" }}>

        {/* Month Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <button onClick={prevMonth} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 100ms ease, color 100ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "var(--card-hover)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{MONTHS[month]} {year}</span>
          {canNext ? (
            <button onClick={nextMonth} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 100ms ease, color 100ms ease" }}
              onMouseEnter={function (e) { e.currentTarget.style.background = "var(--card-hover)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          ) : <div style={{ width: 26 }} />}
        </div>

        {/* Hero: Net Worth + Temperature */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 20px 16px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05, margin: 0 }}>Net Worth</p>
            <Temperature score={tempScore} />
          </div>
          <p style={{ fontSize: 36, fontWeight: 700, color: totalBalance >= 0 ? "var(--green)" : "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>{fmt(totalBalance)}</p>
          <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
            {totalAssets > 0 ? (<div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: 3, background: "var(--green)", flexShrink: 0 }} /><span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500 }}>Assets </span><span style={{ fontSize: 11, fontWeight: 600, color: "var(--green)", fontVariantNumeric: "tabular-nums" }}>{fmt(totalAssets)}</span></div>) : null}
            {totalDebts > 0 ? (<div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: 3, background: "var(--red)", flexShrink: 0 }} /><span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500 }}>Debts </span><span style={{ fontSize: 11, fontWeight: 600, color: "var(--red)", fontVariantNumeric: "tabular-nums" }}>{fmt(totalDebts)}</span></div>) : null}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: 3, background: "var(--blue)", flexShrink: 0 }} /><span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500 }}>Accounts </span><span style={{ fontSize: 11, fontWeight: 600, color: "var(--blue)", fontVariantNumeric: "tabular-nums" }}>{accounts.length}</span></div>
          </div>
        </div>

        {/* The Daily */}
        {budgetTotal > 0 && isCurrent && perDay > 0 ? (
          <div style={{ marginBottom: 24, padding: "12px 16px", borderRadius: 8, background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: "var(--green)", textTransform: "uppercase", letterSpacing: 0.05 }}>Today</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--green)", fontVariantNumeric: "tabular-nums" }}>{fmt(perDay)}</span>
            <span style={{ fontSize: 10, color: "var(--green)", opacity: 0.7 }}>per day · {daysLeft}d left</span>
          </div>
        ) : null}

        {/* Insight */}
        {insight ? (
          <div style={{ marginBottom: 24, padding: "10px 14px", borderRadius: 8, background: "var(--card)", border: "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>{insight}</p>
          </div>
        ) : null}

        {/* 3 Metric Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }} className="mc3">
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderTop: "3px solid var(--green)", borderRadius: 8, padding: "12px 14px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05, margin: "0 0 6px 0" }}>Income</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "var(--green)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(thisIncome)}</p>
            {lastIncome > 0 ? (<p style={{ fontSize: 10, fontWeight: 600, color: incomeTrend >= 0 ? "var(--green)" : "var(--red)", margin: "4px 0 0 0", fontVariantNumeric: "tabular-nums" }}>{incomeTrend >= 0 ? "↑" : "↓"}{Math.abs(incomeTrend)}%</p>) : thisIncome > 0 ? (<p style={{ fontSize: 10, color: "var(--faint)", margin: "4px 0 0 0" }}>first month</p>) : <p style={{ fontSize: 10, color: "var(--faint)", margin: "4px 0 0 0" }}>—</p>}
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderTop: "3px solid var(--red)", borderRadius: 8, padding: "12px 14px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05, margin: "0 0 6px 0" }}>Expense</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(thisExpense)}</p>
            {lastExpense > 0 ? (<p style={{ fontSize: 10, fontWeight: 600, color: expenseTrend <= 0 ? "var(--green)" : "var(--red)", margin: "4px 0 0 0", fontVariantNumeric: "tabular-nums" }}>{expenseTrend >= 0 ? "↑" : "↓"}{Math.abs(expenseTrend)}%</p>) : thisExpense > 0 ? (<p style={{ fontSize: 10, color: "var(--faint)", margin: "4px 0 0 0" }}>first month</p>) : <p style={{ fontSize: 10, color: "var(--faint)", margin: "4px 0 0 0" }}>—</p>}
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderTop: "3px solid " + (thisSaved >= 0 ? "var(--green)" : "var(--red)"), borderRadius: 8, padding: "12px 14px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05, margin: "0 0 6px 0" }}>Saved</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: thisSaved >= 0 ? "var(--green)" : "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{thisSaved >= 0 ? "" : "-"}{fmt(Math.abs(thisSaved))}</p>
            {lastSaved !== 0 ? (<p style={{ fontSize: 10, fontWeight: 600, color: savedTrend >= 0 ? "var(--green)" : "var(--red)", margin: "4px 0 0 0", fontVariantNumeric: "tabular-nums" }}>{savedTrend >= 0 ? "↑" : "↓"}{Math.abs(savedTrend)}%</p>) : thisSaved !== 0 ? (<p style={{ fontSize: 10, color: "var(--faint)", margin: "4px 0 0 0" }}>first month</p>) : <p style={{ fontSize: 10, color: "var(--faint)", margin: "4px 0 0 0" }}>—</p>}
          </div>
        </div>

        {/* Savings Rate */}
        {thisIncome > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 6, background: srColor === "var(--green)" ? "var(--green-dim)" : srColor === "var(--yellow)" ? "var(--yellow-dim)" : "var(--red-dim)", border: "1px solid " + (srColor === "var(--green)" ? "var(--green-border)" : srColor === "var(--yellow)" ? "var(--yellow-border)" : "var(--red-border)") }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: srColor, fontVariantNumeric: "tabular-nums" }}>{savingsRate}%</span>
              <span style={{ fontSize: 9, fontWeight: 500, color: srColor, opacity: 0.8 }}>{srLabel}</span>
            </div>
            {txCount > 0 ? <span style={{ fontSize: 11, color: "var(--faint)" }}>{txCount} transaction{txCount !== 1 ? "s" : ""}</span> : null}
          </div>
        ) : null}

        {/* Budget + Spending */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }} className="bs2">
          {/* Budget */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>Budget</p>
              <Link href="/dashboard/budget" style={{ fontSize: 10, color: "var(--green)", fontWeight: 500, textDecoration: "none" }}>{budgetTotal > 0 ? "details →" : "set up →"}</Link>
            </div>
            {budgetTotal > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ position: "relative", width: 68, height: 68, flexShrink: 0 }}>
                  <svg width="68" height="68" viewBox="0 0 68 68">
                    <circle cx="34" cy="34" r="28" fill="none" stroke="var(--border)" strokeWidth="6" />
                    <circle cx="34" cy="34" r="28" fill="none" stroke={barColor(budgetPct)} strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={(budgetPct / 100) * budgetCirc + " " + budgetCirc}
                      transform="rotate(-90 34 34)" style={{ transition: "stroke-dasharray 500ms ease" }} />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: barColor(budgetPct), fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{budgetPct}</span>
                    <span style={{ fontSize: 7, color: "var(--muted)", fontWeight: 600 }}>%</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                    <div style={{ width: 5, height: 5, borderRadius: 3, background: healthColor }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: healthColor }}>{healthLabel}</span>
                  </div>
                  <p style={{ fontSize: 10, color: "var(--muted)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(Math.abs(budgetLeft))} {budgetLeft >= 0 ? "left" : "over"}</p>
                  {perDay > 0 && isCurrent ? <p style={{ fontSize: 9, color: "var(--faint)", margin: "2px 0 0 0", fontVariantNumeric: "tabular-nums" }}>{fmt(perDay)}/day</p> : null}
                </div>
              </div>
            ) : (
              <div style={{ height: 68, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontSize: 10, color: "var(--faint)", margin: 0 }}>No budget set</p>
              </div>
            )}
          </div>

          {/* Spending */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>Spending</p>
              {topCats.length > 0 ? <Link href="/dashboard/transactions" style={{ fontSize: 10, color: "var(--green)", fontWeight: 500, textDecoration: "none" }}>details →</Link> : null}
            </div>
            {donutSegs.length > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 68, height: 68, flexShrink: 0, position: "relative" }}>
                  <svg width="68" height="68" viewBox="0 0 68 68">
                    {donutSegs.map(function (seg, i) {
                      return <circle key={i} cx="34" cy="34" r="28" fill="none" stroke={seg.color} strokeWidth="6"
                        strokeDasharray={seg.length + " " + (budgetCirc - seg.length)}
                        strokeDashoffset={-seg.offset}
                        transform="rotate(-90 34 34)" style={{ transition: "all 500ms ease" }} />;
                    })}
                    <circle cx="34" cy="34" r="20" fill="var(--card)" />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 8, fontWeight: 600, color: "var(--muted)" }}>{topCats.length}</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                  {topCats.slice(0, 3).map(function (c) {
                    var cat = getCat(c.name);
                    return (
                      <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 5, height: 5, borderRadius: 3, background: cat.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                        <span style={{ fontSize: 9, color: "var(--muted)", fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{c.pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ height: 68, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontSize: 10, color: "var(--faint)", margin: 0 }}>No spending yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Budget Breakdown */}
        {budgetBreakdown.length > 0 ? (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: "0 0 10px 0" }}>Budget Breakdown</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {budgetBreakdown.map(function (b) {
                var cat = getCat(b.cat);
                return (
                  <div key={b.cat} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CatIcon name={b.cat} size={22} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.cat}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: b.left >= 0 ? "var(--muted)" : "var(--red)" }}>{fmtShort(b.spent)} / {fmtShort(b.budget)}</span>
                      </div>
                      <div style={{ height: 3, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: b.pct + "%", background: barColor(b.pct), borderRadius: 3, transition: "width 500ms ease" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Accounts */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>Accounts</p>
            <Link href="/dashboard/accounts" style={{ fontSize: 10, color: "var(--green)", fontWeight: 500, textDecoration: "none" }}>view all →</Link>
          </div>
          {sortedAccs.length > 0 ? (
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
              {sortedAccs.slice(0, 5).map(function (a: any) {
                var b = Number(a.balance || 0);
                return (
                  <div key={a.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 12px 8px", borderRadius: 8, background: "var(--card)", border: "1px solid var(--border)", flexShrink: 0, minWidth: 80 }}>
                    <AccIcon type={a.type} size={24} />
                    <p style={{ fontSize: 9, fontWeight: 600, color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 68, textAlign: "center" }}>{a.name}</p>
                    <p style={{ fontSize: 10, fontWeight: 700, color: b < 0 ? "var(--red)" : "var(--green)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{b < 0 ? "-" : ""}{fmtShort(Math.abs(b))}</p>
                  </div>
                );
              })}
              {sortedAccs.length > 5 ? (
                <div style={{ display: "flex", alignItems: "center", padding: "10px 12px", borderRadius: 8, background: "var(--card)", border: "1px solid var(--border)", flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)" }}>+{sortedAccs.length - 5}</span>
                </div>
              ) : null}
            </div>
          ) : (
            <Link href="/dashboard/accounts" style={{ display: "block", padding: "14px 16px", borderRadius: 8, border: "1px dashed var(--border)", background: "var(--card)", textDecoration: "none", transition: "border-color 150ms ease" }}
              onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; }} onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>Add your first account</p>
              <p style={{ fontSize: 10, color: "var(--muted)", margin: "2px 0 0 0" }}>See all your money in one place</p>
            </Link>
          )}
        </div>

        {/* Recent */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>Recent</p>
            {recentTxns.length > 0 ? <Link href="/dashboard/transactions" style={{ fontSize: 10, color: "var(--green)", fontWeight: 500, textDecoration: "none" }}>view all →</Link> : null}
          </div>
          {recentTxns.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {recentTxns.map(function (t: any) {
                var isIncome = t.type === "income";
                var amt = Number(t.amount || 0);
                var d = t.date ? new Date(t.date + "T00:00:00") : null;
                var ds = d ? d.getDate() + " " + MONTHS[d.getMonth()].slice(0, 3) : "";
                return (
                  <div key={t.id} style={{ padding: "10px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 8, transition: "background 100ms ease" }}
                    onMouseEnter={function (e) { e.currentTarget.style.background = "var(--card-hover)"; }} onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}>
                    <CatIcon name={t.category} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.description || (isIncome ? "Income" : getCat(t.category).name)}</p>
                      <p style={{ fontSize: 10, color: "var(--faint)", margin: "1px 0 0 0" }}>{isIncome ? "Income" : getCat(t.category).name}{ds ? " · " + ds : ""}</p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isIncome ? "var(--green)" : "var(--red)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{isIncome ? "+" : "-"}{fmt(amt)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <Link href="/dashboard/transactions" style={{ display: "block", padding: "14px 16px", borderRadius: 8, border: "1px dashed var(--border)", background: "var(--card)", textDecoration: "none", transition: "border-color 150ms ease" }}
              onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; }} onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>No transactions this month</p>
              <p style={{ fontSize: 10, color: "var(--muted)", margin: "2px 0 0 0" }}>Start tracking your spending</p>
            </Link>
          )}
        </div>

        {/* Top Spending */}
        {topCats.length > 0 ? (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>Top Spending</p>
              <Link href="/dashboard/transactions" style={{ fontSize: 10, color: "var(--green)", fontWeight: 500, textDecoration: "none" }}>view all →</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topCats.map(function (c) {
                var cat = getCat(c.name);
                var bp = topMax > 0 ? (c.amount / topMax) * 100 : 0;
                return (
                  <div key={c.name}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <CatIcon name={c.name} size={22} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", flex: 1 }}>{c.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{fmt(c.amount)}</span>
                      <span style={{ fontSize: 10, fontWeight: 500, color: "var(--muted)", fontVariantNumeric: "tabular-nums", width: 28, textAlign: "right" }}>{c.pct}%</span>
                    </div>
                    <div style={{ height: 3, background: "var(--border)", borderRadius: 3, overflow: "hidden", marginLeft: 30 }}>
                      <div style={{ height: "100%", width: bp + "%", background: cat.color, borderRadius: 3, transition: "width 500ms ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

      </div>

      <style>{"@media(max-width:640px){.mc3{grid-template-columns:1fr!important}.bs2{grid-template-columns:1fr!important}}"}</style>
    </div>
  );
}