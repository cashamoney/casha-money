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
    if (savingsRate >= 20) s += 30; else if (savingsRate >= 10) s += 20; else if (savingsRate > 0) s += 10;
    if (budgetTotal > 0) { if (budgetPct <= 60) s += 30; else if (budgetPct <= 80) s += 20; else if (budgetPct <= 100) s += 10; } else { s += 25; }
    if (totalDebts === 0) s += 20; else if (lastTxns.length > 0) { var ld = lastTxns.filter(function (t: any) { return t.type === "expense"; }).reduce(function (s2: number, t: any) { return s2 + Number(t.amount || 0); }, 0); if (thisExpense < ld) s += 15; else s += 5; } else { s += 10; }
    if (totalBalance > 0) { if (lastIncome > 0 && thisIncome > 0 && thisSaved > lastSaved * 0.95) s += 20; else s += 10; } else { s += 5; }
    return Math.min(100, Math.max(0, s));
  }, [savingsRate, budgetPct, budgetTotal, totalDebts, totalBalance, thisExpense, lastTxns, thisIncome, lastIncome, thisSaved, lastSaved]);

  var tempEmoji: string;
  var tempLabel: string;
  var tempColor: string;
  if (tempScore >= 80) { tempEmoji = "🟢"; tempLabel = "Calm"; tempColor = "var(--green)"; }
  else if (tempScore >= 60) { tempEmoji = "🟡"; tempLabel = "Steady"; tempColor = "var(--yellow)"; }
  else if (tempScore >= 40) { tempEmoji = "🟠"; tempLabel = "Tense"; tempColor = "#F97316"; }
  else { tempEmoji = "🔴"; tempLabel = "Stressed"; tempColor = "var(--red)"; }

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

  /* Recent */
  var recentTxns = useMemo(function () { return txns.slice(0, 3); }, [txns]);
  var sortedAccs = useMemo(function () { return [...accounts].sort(function (a: any, b: any) { return Math.abs(Number(b.balance)) - Math.abs(Number(a.balance)); }); }, [accounts]);

  /* Hero sentence */
  var heroSentence = useMemo(function () {
    if (totalBalance === 0 && txCount === 0) return "You're just getting started.";
    if (lastSaved !== 0 && thisSaved !== lastSaved) {
      var diff = thisSaved - lastSaved;
      if (diff > 0) return "You have " + fmt(totalBalance) + ". That's " + fmt(diff) + " more than last month.";
      if (diff < 0) return "You have " + fmt(totalBalance) + ". " + fmt(Math.abs(diff)) + " less saved than last month.";
    }
    return "You have " + fmt(totalBalance) + ".";
  }, [totalBalance, thisSaved, lastSaved, txCount]);

  /* Savings rate */
  var srColor = savingsRate >= 20 ? "var(--green)" : savingsRate >= 10 ? "var(--yellow)" : "var(--red)";
  var srLabel = savingsRate >= 20 ? "Good" : savingsRate >= 10 ? "Fair" : savingsRate > 0 ? "Low" : "Overspending";

  var hasData = accounts.length > 0 || txns.length > 0;

  var prevMonth = function () { if (month === 0) { setMonth(11); setYear(year - 1); } else { setMonth(month - 1); } };
  var nextMonth = function () {
    var nm = month === 11 ? 0 : month + 1;
    var ny = month === 11 ? year + 1 : year;
    if (ny > now.getFullYear()) return;
    if (ny === now.getFullYear() && nm > now.getMonth()) return;
    setMonth(nm); setYear(ny);
  };
  var canNext = !(month === now.getMonth() && year === now.getFullYear());

  if (loading) return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "80px 24px 32px" }}>
      <div style={{ height: 12, width: 120, borderRadius: 4, background: "var(--border)", animation: "shimmer 1.5s infinite", marginBottom: 24 }} />
      <div style={{ height: 32, width: 280, borderRadius: 6, background: "var(--border)", animation: "shimmer 1.5s infinite 0.1s", marginBottom: 12 }} />
      <div style={{ height: 16, width: 200, borderRadius: 4, background: "var(--border)", animation: "shimmer 1.5s infinite 0.2s", marginBottom: 32 }} />
      <div style={{ height: 1, background: "var(--border)", marginBottom: 24 }} />
      <div style={{ height: 14, width: 160, borderRadius: 4, background: "var(--border)", animation: "shimmer 1.5s infinite 0.3s", marginBottom: 16 }} />
      <div style={{ height: 14, width: 140, borderRadius: 4, background: "var(--border)", animation: "shimmer 1.5s infinite 0.4s", marginBottom: 16 }} />
      <div style={{ height: 14, width: 150, borderRadius: 4, background: "var(--border)", animation: "shimmer 1.5s infinite 0.5s" }} />
      <style>{"@keyframes shimmer{0%{opacity:1}50%{opacity:0.3}100%{opacity:1}}"}</style>
    </div>
  );

  if (!hasData) return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "80px 24px 32px" }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.08, margin: "0 0 32px 0" }}>casha.</p>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", margin: "0 0 8px 0", lineHeight: 1.2, letterSpacing: -0.5 }}>Let's get started.</h1>
      <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 40px 0", lineHeight: 1.6 }}>Three steps to clarity. Takes 60 seconds.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { href: "/dashboard/accounts", label: "Add your first account", sub: "See your net worth", num: "1" },
          { href: "/dashboard/transactions", label: "Log a transaction", sub: "Track where it goes", num: "2" },
          { href: "/dashboard/budget", label: "Set a budget", sub: "Plan your month", num: "3" },
        ].map(function (item) {
          return (
            <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", textDecoration: "none", borderBottom: "1px solid var(--border)", transition: "border-color 150ms ease" }}
              onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green)"; }} onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", width: 20, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{item.num}</span>
              <div><p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{item.label}</p><p style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0 0 0" }}>{item.sub}</p></div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "28px 24px 100px" }}>

        {/* ── Month ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <button onClick={prevMonth} style={{ width: 24, height: 24, borderRadius: 5, border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "color 100ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.color = "var(--text)"; }} onMouseLeave={function (e) { e.currentTarget.style.color = "var(--muted)"; }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", fontVariantNumeric: "tabular-nums", letterSpacing: 0.02 }}>{MONTHS[month]} {year}</span>
          {canNext ? (
            <button onClick={nextMonth} style={{ width: 24, height: 24, borderRadius: 5, border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "color 100ms ease" }}
              onMouseEnter={function (e) { e.currentTarget.style.color = "var(--text)"; }} onMouseLeave={function (e) { e.currentTarget.style.color = "var(--muted)"; }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          ) : null}
        </div>

        {/* ── Temperature ── */}
        <div style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 12 }}>{tempEmoji}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: tempColor, marginLeft: 8 }}>Your money is {tempLabel.toLowerCase()}</span>
        </div>

        {/* ── Hero Sentence ── */}
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", margin: "0 0 8px 0", lineHeight: 1.25, letterSpacing: -0.5 }}>{heroSentence}</h1>

        {/* ── The Daily ── */}
        {budgetTotal > 0 && isCurrent && perDay > 0 ? (
          <p style={{ fontSize: 14, color: "var(--green)", fontWeight: 600, margin: "0 0 0 0", fontVariantNumeric: "tabular-nums" }}>You can spend {fmt(perDay)} today<span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 12 }}> · {daysLeft} days left</span></p>
        ) : null}

        {/* ── Assets / Debts ── */}
        {(totalAssets > 0 || totalDebts > 0) ? (
          <div style={{ display: "flex", gap: 16, marginTop: 20, marginBottom: 4 }}>
            {totalAssets > 0 ? <span style={{ fontSize: 11, color: "var(--muted)" }}>Assets <span style={{ color: "var(--green)", fontWeight: 600 }}>{fmt(totalAssets)}</span></span> : null}
            {totalDebts > 0 ? <span style={{ fontSize: 11, color: "var(--muted)" }}>Debts <span style={{ color: "var(--red)", fontWeight: 600 }}>{fmt(totalDebts)}</span></span> : null}
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{accounts.length} account{accounts.length !== 1 ? "s" : ""}</span>
          </div>
        ) : null}

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "var(--border)", margin: "24px 0" }} />

        {/* ── Income / Expense / Saved ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Income</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--green)", fontVariantNumeric: "tabular-nums" }}>{fmt(thisIncome)}</span>
              {lastIncome > 0 ? <span style={{ fontSize: 10, fontWeight: 600, color: incomeTrend >= 0 ? "var(--green)" : "var(--red)", fontVariantNumeric: "tabular-nums" }}>{incomeTrend >= 0 ? "↑" : "↓"}{Math.abs(incomeTrend)}%</span> : null}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Expense</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--red)", fontVariantNumeric: "tabular-nums" }}>{fmt(thisExpense)}</span>
              {lastExpense > 0 ? <span style={{ fontSize: 10, fontWeight: 600, color: expenseTrend <= 0 ? "var(--green)" : "var(--red)", fontVariantNumeric: "tabular-nums" }}>{expenseTrend >= 0 ? "↑" : "↓"}{Math.abs(expenseTrend)}%</span> : null}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Saved</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: thisSaved >= 0 ? "var(--green)" : "var(--red)", fontVariantNumeric: "tabular-nums" }}>{thisSaved >= 0 ? "" : "-"}{fmt(Math.abs(thisSaved))}</span>
              {lastSaved !== 0 ? <span style={{ fontSize: 10, fontWeight: 600, color: savedTrend >= 0 ? "var(--green)" : "var(--red)", fontVariantNumeric: "tabular-nums" }}>{savedTrend >= 0 ? "↑" : "↓"}{Math.abs(savedTrend)}%</span> : null}
            </div>
          </div>
        </div>

        {/* Savings rate */}
        {thisIncome > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: srColor, fontVariantNumeric: "tabular-nums" }}>{savingsRate}% saved</span>
            <span style={{ fontSize: 10, color: "var(--muted)" }}>·</span>
            <span style={{ fontSize: 10, fontWeight: 500, color: srColor }}>{srLabel}</span>
            {txCount > 0 ? <><span style={{ fontSize: 10, color: "var(--muted)" }}>·</span><span style={{ fontSize: 10, color: "var(--faint)" }}>{txCount} txns</span></> : null}
          </div>
        ) : null}

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "var(--border)", margin: "24px 0" }} />

        {/* ── Budget ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Budget</span>
            <Link href="/dashboard/budget" style={{ fontSize: 10, color: "var(--green)", fontWeight: 500, textDecoration: "none" }}>{budgetTotal > 0 ? "details →" : "set up →"}</Link>
          </div>

          {budgetTotal > 0 ? (
            <div>
              {/* Bar */}
              <div style={{ height: 4, background: "var(--border)", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", width: budgetPct + "%", background: barColor(budgetPct), borderRadius: 4, transition: "width 500ms ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>{budgetPct}% used<span style={{ margin: "0 4px" }}>·</span><span style={{ color: healthScore >= 60 ? "var(--green)" : "var(--yellow)", fontWeight: 600 }}>{healthLabel}</span></span>
                <span style={{ fontSize: 11, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{fmt(Math.abs(budgetLeft))} {budgetLeft >= 0 ? "left" : "over"}</span>
              </div>

              {/* Breakdown */}
              {budgetBreakdown.length > 0 ? (
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  {budgetBreakdown.map(function (b) {
                    var cat = getCat(b.cat);
                    return (
                      <div key={b.cat}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <div style={{ width: 5, height: 5, borderRadius: 3, background: cat.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", flex: 1 }}>{b.cat}</span>
                          <span style={{ fontSize: 10, color: b.left >= 0 ? "var(--muted)" : "var(--red)", fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{fmtShort(b.spent)}<span style={{ color: "var(--faint)" }}> / </span>{fmtShort(b.budget)}</span>
                        </div>
                        <div style={{ height: 2, background: "var(--border)", borderRadius: 2, overflow: "hidden", marginLeft: 11 }}>
                          <div style={{ height: "100%", width: b.pct + "%", background: barColor(b.pct), borderRadius: 2, transition: "width 500ms ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : (
            <p style={{ fontSize: 11, color: "var(--faint)", margin: 0 }}>No budget set for this month.</p>
          )}
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "var(--border)", margin: "24px 0" }} />

        {/* ── Spending ── */}
        {topCats.length > 0 ? (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Spending</span>
              <Link href="/dashboard/transactions" style={{ fontSize: 10, color: "var(--green)", fontWeight: 500, textDecoration: "none" }}>details →</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topCats.map(function (c) {
                var cat = getCat(c.name);
                var bp = topMax > 0 ? (c.amount / topMax) * 100 : 0;
                return (
                  <div key={c.name}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <div style={{ width: 5, height: 5, borderRadius: 3, background: cat.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", flex: 1 }}>{c.name}</span>
                      <span style={{ fontSize: 10, color: "var(--muted)", fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{c.pct}%</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{fmt(c.amount)}</span>
                    </div>
                    <div style={{ height: 2, background: "var(--border)", borderRadius: 2, overflow: "hidden", marginLeft: 11 }}>
                      <div style={{ height: "100%", width: bp + "%", background: cat.color, borderRadius: 2, transition: "width 500ms ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* ── Divider ── */}
        {recentTxns.length > 0 || sortedAccs.length > 0 ? <div style={{ height: 1, background: "var(--border)", margin: "24px 0" }} /> : null}

        {/* ── Recent ── */}
        {recentTxns.length > 0 ? (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Recent</span>
              <Link href="/dashboard/transactions" style={{ fontSize: 10, color: "var(--green)", fontWeight: 500, textDecoration: "none" }}>view all →</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {recentTxns.map(function (t: any) {
                var isIncome = t.type === "income";
                var amt = Number(t.amount || 0);
                var cat = getCat(t.category);
                var d = t.date ? new Date(t.date + "T00:00:00") : null;
                var ds = d ? d.getDate() + " " + MONTHS[d.getMonth()].slice(0, 3) : "";
                return (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ width: 5, height: 5, borderRadius: 3, background: cat.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description || (isIncome ? "Income" : cat.name)}</span>
                    <span style={{ fontSize: 10, color: "var(--faint)", flexShrink: 0 }}>{ds}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isIncome ? "var(--green)" : "var(--red)", fontVariantNumeric: "tabular-nums", flexShrink: 0, minWidth: 60, textAlign: "right" }}>{isIncome ? "+" : "-"}{fmt(amt)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* ── Accounts ── */}
        {sortedAccs.length > 0 ? (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Accounts</span>
              <Link href="/dashboard/accounts" style={{ fontSize: 10, color: "var(--green)", fontWeight: 500, textDecoration: "none" }}>view all →</Link>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {sortedAccs.slice(0, 4).map(function (a: any) {
                var at = getAT(a.type);
                var b = Number(a.balance || 0);
                return (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 5, height: 5, borderRadius: 3, background: at.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>{a.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: b < 0 ? "var(--red)" : "var(--green)", fontVariantNumeric: "tabular-nums" }}>{b < 0 ? "-" : ""}{fmtShort(Math.abs(b))}</span>
                  </div>
                );
              })}
              {sortedAccs.length > 4 ? <span style={{ fontSize: 10, color: "var(--faint)" }}>+{sortedAccs.length - 4} more</span> : null}
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}