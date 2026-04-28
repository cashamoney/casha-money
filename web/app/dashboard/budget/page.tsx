"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabase";

var CATS = [
  { name: "Housing/Rent", color: "#6366F1", rec: 25 },
  { name: "Groceries", color: "#22C55E", rec: 10 },
  { name: "Food Delivery", color: "#F97316", rec: 5 },
  { name: "Transportation", color: "#3B82F6", rec: 8 },
  { name: "EMI Payment", color: "#EF4444", rec: 15 },
  { name: "Entertainment", color: "#EC4899", rec: 3 },
  { name: "Shopping", color: "#A855F7", rec: 4 },
  { name: "Healthcare", color: "#14B8A6", rec: 3 },
  { name: "Education", color: "#8B5CF6", rec: 3 },
  { name: "Subscription", color: "#F43F5E", rec: 2 },
  { name: "Streaming/OTT", color: "#E11D48", rec: 1 },
  { name: "Insurance", color: "#0EA5E9", rec: 1 },
  { name: "Savings", color: "#10B981", rec: 20 },
  { name: "Other Expense", color: "#64748B", rec: 0 },
];

function getCat(n: string) { return CATS.find(function (c) { return c.name === n; }) || CATS[CATS.length - 1]; }

function Av(props: { name: string; color: string; small?: boolean }) {
  var sz = props.small ? 26 : 30;
  var n = props.name;
  var l = n === "Housing/Rent" ? "H" : n === "Food Delivery" ? "FD" : n === "EMI Payment" ? "EM" : n === "Streaming/OTT" ? "ST" : n === "Other Expense" ? "OT" : n.charAt(0);
  return (
    <div style={{ width: sz, height: sz, borderRadius: 7, background: props.color + "12", color: props.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: props.small ? 9 : 11, fontWeight: 700, flexShrink: 0, border: "1px solid " + props.color + "18" }}>{l}</div>
  );
}

function sC(p: number) {
  if (p >= 100) return "#EF4444";
  if (p >= 85) return "#F97316";
  if (p >= 60) return "#EAB308";
  return "#22C55E";
}

function hI(s: number) {
  if (s >= 80) return { l: "On Track", c: "#22C55E" };
  if (s >= 60) return { l: "Good", c: "#84CC16" };
  if (s >= 40) return { l: "Fair", c: "#F59E0B" };
  return { l: "At Risk", c: "#EF4444" };
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
}

export default function BudgetPage() {
  var [income, setIncome] = useState(0);
  var [manualIncome, setManualIncome] = useState("");
  var [budgets, setBudgets] = useState<Record<string, number>>({});
  var [spent, setSpent] = useState<Record<string, number>>({});
  var [lastSpent, setLastSpent] = useState<Record<string, number>>({});
  var [loading, setLoading] = useState(true);
  var [saving, setSaving] = useState(false);
  var [saved, setSaved] = useState(false);
  var [tab, setTab] = useState<"overview" | "edit">("overview");
  var [warn, setWarn] = useState("");

  useEffect(function () { load(); }, []);

  var load = async function () {
    var { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    var uid = u.user.id;

    var { data: iT } = await supabase.from("transactions").select("amount, transaction_date").eq("user_id", uid).eq("transaction_type", "income");
    var tot = (iT || []).reduce(function (s: number, t: any) { return s + Math.abs(Number(t.amount)); }, 0);
    var ms = new Set((iT || []).map(function (t: any) { return t.transaction_date ? t.transaction_date.slice(0, 7) : ""; }).filter(function (m: string) { return m !== ""; }));
    var mi = ms.size > 0 ? Math.round(tot / ms.size) : 0;
    setIncome(mi);

    var now = new Date();
    var ts = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-01";
    var lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    var ls = lm.getFullYear() + "-" + String(lm.getMonth() + 1).padStart(2, "0") + "-01";
    var ago = new Date(now.getTime() - 65 * 86400000).toISOString().split("T")[0];

    var { data: eT } = await supabase.from("transactions").select("amount, category, transaction_date").eq("user_id", uid).eq("transaction_type", "expense").gte("transaction_date", ago);
    var tS: Record<string, number> = {};
    var lS: Record<string, number> = {};
    (eT || []).forEach(function (t: any) {
      var c = t.category || "Other Expense";
      var a = Math.abs(Number(t.amount));
      var d = t.transaction_date;
      if (d >= ts) tS[c] = (tS[c] || 0) + a;
      else if (d >= ls) lS[c] = (lS[c] || 0) + a;
    });
    setSpent(tS);
    setLastSpent(lS);

    var { data: sb } = await supabase.from("budgets").select("categories").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).single();
    if (sb && sb.categories && Object.keys(sb.categories).length > 0) {
      setBudgets(sb.categories as Record<string, number>);
    } else if (mi > 0) {
      var ab: Record<string, number> = {};
      CATS.forEach(function (c) { ab[c.name] = Math.round(mi * c.rec / 100); });
      setBudgets(ab);
    }
    setLoading(false);
  };

  var aiFill = function () {
    var inc = income;
    if (inc === 0 && manualIncome && Number(manualIncome) > 0) {
      inc = Number(manualIncome);
      setIncome(inc);
    }
    if (inc === 0) {
      setWarn("Enter your monthly income below so we can suggest a budget.");
      setTimeout(function () { setWarn(""); }, 5000);
      return;
    }
    var ab: Record<string, number> = {};
    CATS.forEach(function (c) { ab[c.name] = Math.round(inc * c.rec / 100); });
    setBudgets(ab);
    setTab("edit");
  };

  var rebalance = function () {
    var nb = Object.assign({}, budgets);
    var pool = 0;
    CATS.forEach(function (c) {
      var b = nb[c.name] || 0;
      var s = spent[c.name] || 0;
      if (b > 0 && s / b < 0.35 && c.rec > 0) {
        var ex = Math.round(b * 0.2);
        nb[c.name] = b - ex;
        pool += ex;
      }
    });
    var overs = CATS.filter(function (c) { var b = nb[c.name] || 0; var s = spent[c.name] || 0; return b > 0 && s / b > 0.85; });
    if (overs.length > 0 && pool > 0) {
      var each = Math.round(pool / overs.length);
      overs.forEach(function (c) { nb[c.name] = (nb[c.name] || 0) + each; });
    }
    setBudgets(nb);
  };

  var save = async function () {
    setSaving(true);
    var { data: u } = await supabase.auth.getUser();
    if (!u?.user) { setSaving(false); return; }
    var now = new Date();
    var sd = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-01";
    var ed = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate());
    await supabase.from("budgets").delete().eq("user_id", u.user.id);
    var { error } = await supabase.from("budgets").insert({
      user_id: u.user.id,
      name: "Budget " + now.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      period_type: "monthly", start_date: sd, end_date: ed,
      total_budget: Object.values(budgets).reduce(function (s, v) { return s + v; }, 0),
      currency: "INR", categories: budgets, status: "active",
    });
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(function () { setSaved(false); setTab("overview"); }, 1500);
    }
  };

  var updateBudget = function (name: string, value: number) {
    var nb = Object.assign({}, budgets);
    nb[name] = value;
    setBudgets(nb);
  };

  var now = new Date();
  var dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  var dp = now.getDate();
  var dl = dim - dp;
  var timePct = Math.round((dp / dim) * 100);

  var totalBudget = useMemo(function () { return Object.values(budgets).reduce(function (s, v) { return s + v; }, 0); }, [budgets]);
  var totalSpent = useMemo(function () { return Object.values(spent).reduce(function (s, v) { return s + v; }, 0); }, [spent]);
  var rem = totalBudget - totalSpent;
  var usedPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  var perDay = dl > 0 && rem > 0 ? rem / dl : 0;
  var proj = dp > 0 ? (totalSpent / dp) * dim : 0;

  var hScore = useMemo(function () {
    var ac = CATS.filter(function (c) { return (budgets[c.name] || 0) > 0; });
    if (ac.length === 0) return 0;
    var sc = ac.map(function (c) {
      var b = budgets[c.name] || 0;
      var s = spent[c.name] || 0;
      var p = b > 0 ? (s / b) * 100 : 0;
      if (p <= 50) return 100;
      if (p <= 80) return 100 - ((p - 50) / 30) * 30;
      if (p <= 100) return 70 - ((p - 80) / 20) * 40;
      return Math.max(0, 30 - (p - 100) * 1.5);
    });
    return Math.round(sc.reduce(function (a, b) { return a + b; }, 0) / sc.length);
  }, [budgets, spent]);
  var hi = hI(hScore);

  var trends = useMemo(function () {
    var m = new Map<string, number>();
    CATS.forEach(function (c) {
      var cu = spent[c.name] || 0;
      var pv = lastSpent[c.name] || 0;
      m.set(c.name, pv > 0 ? Math.round(((cu - pv) / pv) * 100) : 0);
    });
    return m;
  }, [spent, lastSpent]);

  var mLbl = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  var activeCats = CATS.filter(function (c) { return (budgets[c.name] || 0) > 0 || (spent[c.name] || 0) > 0; });
  var overCount = CATS.filter(function (c) { var b = budgets[c.name] || 0; return b > 0 && (spent[c.name] || 0) >= b; }).length;

  var unbudgeted = useMemo(function () {
    var bn = new Set(Object.keys(budgets));
    return Object.entries(spent).filter(function (e) { return !bn.has(e[0]) && e[1] > 0; }).map(function (e) { return { name: e[0], amount: e[1], color: getCat(e[0]).color }; }).sort(function (a, b) { return b.amount - a.amount; });
  }, [budgets, spent]);
  var unbudgetedTotal = unbudgeted.reduce(function (s, u) { return s + u.amount; }, 0);

  if (loading) return (
    <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 20, height: 20, border: "2px solid var(--border)", borderTopColor: "#22C55E", borderRadius: "50%", animation: "sp 0.6s linear infinite" }} />
      <style>{"@keyframes sp{to{transform:rotate(360deg)}}"}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="bw" style={{ maxWidth: 780, margin: "0 auto", padding: "28px 24px 64px" }}>

        {/* Header */}
        <div className="bh" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Budget</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "2px 0 0 0" }}>Plan your monthly spending</p>
          </div>
          <button onClick={aiFill}
            style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "#16A34A"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "#22C55E"; }}>
            Set Budget
          </button>
        </div>

        {/* Warning */}
        {warn ? (
          <div style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
            <p style={{ fontSize: 12, color: "#EAB308", margin: 0, fontWeight: 500 }}>{warn}</p>
          </div>
        ) : null}

        {/* Income input when no income detected */}
        {income === 0 && activeCats.length === 0 ? (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px", marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: "0 0 8px" }}>What is your monthly income?</p>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="number" placeholder="e.g. 50000" value={manualIncome} onChange={function (e) { setManualIncome(e.target.value); }}
                style={{ height: 36, borderRadius: 6, padding: "0 12px", fontSize: 14, fontWeight: 600, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", flex: 1, fontVariantNumeric: "tabular-nums", transition: "border-color 0.15s" }}
                onFocus={function (e) { e.currentTarget.style.borderColor = "rgba(34,197,94,0.3)"; }}
                onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }} />
              {manualIncome && Number(manualIncome) > 0 ? (
                <span style={{ fontSize: 12, color: "#22C55E", fontWeight: 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmt(Number(manualIncome))}/mo</span>
              ) : null}
            </div>
          </div>
        ) : null}

        {activeCats.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px 32px" }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></svg>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>Take control of your spending</h2>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 20px", maxWidth: 280, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>Set budgets for each category and see how much you have left.</p>
            <button onClick={aiFill}
              style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={function (e) { e.currentTarget.style.background = "#16A34A"; }}
              onMouseLeave={function (e) { e.currentTarget.style.background = "#22C55E"; }}>
              Set Your First Budget
            </button>
            <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 28 }}>
              <div style={{ textAlign: "center" }}><p style={{ fontSize: 18, fontWeight: 700, color: "#22C55E", margin: 0 }}>50%</p><p style={{ fontSize: 10, color: "var(--muted)", margin: "2px 0 0 0" }}>Needs</p></div>
              <div style={{ textAlign: "center" }}><p style={{ fontSize: 18, fontWeight: 700, color: "#8B5CF6", margin: 0 }}>30%</p><p style={{ fontSize: 10, color: "var(--muted)", margin: "2px 0 0 0" }}>Wants</p></div>
              <div style={{ textAlign: "center" }}><p style={{ fontSize: 18, fontWeight: 700, color: "#3B82F6", margin: 0 }}>20%</p><p style={{ fontSize: 10, color: "var(--muted)", margin: "2px 0 0 0" }}>Savings</p></div>
            </div>
            <p style={{ fontSize: 10, color: "var(--muted)", margin: "10px 0 0 0" }}>The 50/30/20 rule — a proven framework</p>
          </div>
        ) : (
          <>
            {/* Hero */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 32, fontWeight: 700, color: rem >= 0 ? "#22C55E" : "#EF4444", margin: 0, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
                {rem >= 0 ? "" : "-"}{fmt(Math.abs(rem))}
              </p>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 18px" }}>left to spend in {mLbl}</p>
              <div style={{ position: "relative", marginBottom: 6 }}>
                <div style={{ height: 5, background: "var(--border)", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: Math.min(100, usedPct) + "%", background: sC(usedPct), borderRadius: 5, transition: "width 0.7s" }} />
                </div>
                <div style={{ position: "absolute", top: -3, left: Math.min(98, timePct) + "%", width: 1, height: 11, background: "var(--text)", borderRadius: 1, opacity: 0.12 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{usedPct}% used</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {dl > 0 && perDay > 0 ? <span style={{ fontSize: 11, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{fmt(perDay)}/day</span> : null}
                  {dl > 0 && perDay > 0 ? <span style={{ fontSize: 11, color: "var(--border)" }}>·</span> : null}
                  {dl > 0 ? <span style={{ fontSize: 11, color: "var(--muted)" }}>{dl} days left</span> : null}
                </div>
              </div>
            </div>

            {/* Health */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, padding: "0 1px", flexWrap: "wrap" }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: hi.c, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: hi.c }}>{hScore} {hi.l}</span>
              <span style={{ fontSize: 11, color: "var(--border)" }}>|</span>
              <span style={{ fontSize: 11, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>Projected {fmt(proj)}</span>
              {overCount > 0 ? (
                <>
                  <span style={{ fontSize: 11, color: "var(--border)" }}>|</span>
                  <span style={{ fontSize: 11, color: "#EF4444", fontWeight: 500 }}>{overCount} over budget</span>
                </>
              ) : null}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 12, borderBottom: "1px solid var(--border)" }}>
              <button onClick={function () { setTab("overview"); }}
                style={{ padding: "8px 14px", borderRadius: "6px 6px 0 0", border: "none", background: tab === "overview" ? "var(--card)" : "transparent", color: tab === "overview" ? "var(--text)" : "var(--muted)", fontSize: 12, fontWeight: tab === "overview" ? 600 : 500, cursor: "pointer", fontFamily: "inherit", transition: "0.15s", borderBottom: tab === "overview" ? "2px solid #22C55E" : "2px solid transparent", marginBottom: -1 }}>
                Overview
              </button>
              <button onClick={function () { setTab("edit"); }}
                style={{ padding: "8px 14px", borderRadius: "6px 6px 0 0", border: "none", background: tab === "edit" ? "var(--card)" : "transparent", color: tab === "edit" ? "var(--text)" : "var(--muted)", fontSize: 12, fontWeight: tab === "edit" ? 600 : 500, cursor: "pointer", fontFamily: "inherit", transition: "0.15s", borderBottom: tab === "edit" ? "2px solid #22C55E" : "2px solid transparent", marginBottom: -1 }}>
                Edit
              </button>
            </div>

            {/* Overview */}
            {tab === "overview" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 8 }}>
                {CATS.map(function (cat) {
                  var b = budgets[cat.name] || 0;
                  var s = spent[cat.name] || 0;
                  if (b === 0 && s === 0) return null;
                  var pct = b > 0 ? (s / b) * 100 : 0;
                  var sc = sC(pct);
                  var tr = trends.get(cat.name) || 0;
                  return (
                    <div key={cat.name} style={{ padding: "10px 12px", borderRadius: 6, transition: "background 0.1s", cursor: "default" }}
                      onMouseEnter={function (e) { e.currentTarget.style.background = "var(--card)"; }}
                      onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Av name={cat.name} color={cat.color} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{cat.name}</span>
                            {tr !== 0 && b > 0 ? (
                              <span style={{ fontSize: 9, fontWeight: 600, color: tr > 0 ? "#EF4444" : "#22C55E", background: (tr > 0 ? "#EF4444" : "#22C55E") + "0F", padding: "1px 5px", borderRadius: 3 }}>
                                {tr > 0 ? "+" : ""}{tr}%
                              </span>
                            ) : null}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 3, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: Math.min(100, pct) + "%", background: sc, borderRadius: 3, transition: "width 0.4s" }} />
                            </div>
                            <span style={{ fontSize: 10, color: "var(--muted)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{fmt(s)}{b > 0 ? " / " + fmt(b) : ""}</span>
                          </div>
                        </div>
                        {b > 0 ? (
                          <div style={{ textAlign: "right", minWidth: 52, flexShrink: 0, marginLeft: 4 }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: s >= b ? "#EF4444" : "#22C55E", margin: 0, fontVariantNumeric: "tabular-nums" }}>
                              {s >= b ? fmt(s - b) : fmt(b - s)}
                            </p>
                            <p style={{ fontSize: 9, color: "var(--muted)", margin: "1px 0 0 0" }}>{s >= b ? "over" : "left"}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}

                {/* Unbudgeted */}
                {unbudgeted.length > 0 ? (
                  <div style={{ background: "rgba(234,179,8,0.04)", border: "1px solid rgba(234,179,8,0.12)", borderRadius: 6, padding: "10px 12px", marginTop: 6 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", margin: "0 0 4px" }}>Unbudgeted · {fmt(unbudgetedTotal)}</p>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {unbudgeted.map(function (u) {
                        return <span key={u.name} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: u.color + "0F", color: u.color, fontWeight: 500 }}>{u.name} · {fmt(u.amount)}</span>;
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Edit */}
            {tab === "edit" ? (
              <>
                <div style={{ display: "flex", gap: 6, marginBottom: 10, paddingTop: 8 }}>
                  <button onClick={aiFill} style={{ flex: 1, padding: "7px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "border-color 0.15s" }}
                    onMouseEnter={function (e) { e.currentTarget.style.borderColor = "rgba(34,197,94,0.25)"; }}
                    onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }}>
                    Reset to Suggested
                  </button>
                  <button onClick={rebalance} style={{ flex: 1, padding: "7px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "border-color 0.15s" }}
                    onMouseEnter={function (e) { e.currentTarget.style.borderColor = "rgba(34,197,94,0.25)"; }}
                    onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }}>
                    Rebalance
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {CATS.map(function (cat) {
                    var b = budgets[cat.name] || 0;
                    var s = spent[cat.name] || 0;
                    return (
                      <div key={cat.name} style={{ padding: "8px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 10, transition: "background 0.1s" }}
                        onMouseEnter={function (e) { e.currentTarget.style.background = "var(--card)"; }}
                        onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}>
                        <Av name={cat.name} color={cat.color} small />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>{cat.name}</p>
                          <p style={{ fontSize: 9, color: "var(--muted)", margin: "1px 0 0 0" }}>
                            {cat.rec > 0 ? cat.rec + "% = " + fmt(Math.round(income * cat.rec / 100)) : "Custom"}
                            {s > 0 ? <span style={{ color: sC(b > 0 ? (s / b) * 100 : 0) }}> · Spent {fmt(s)}</span> : ""}
                          </p>
                        </div>
                        <input type="number" min="0" value={b || ""} onChange={function (e) { updateBudget(cat.name, Number(e.target.value)); }} placeholder="0"
                          style={{ width: 84, height: 28, borderRadius: 6, padding: "0 8px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid " + (b > 0 ? cat.color + "44" : "var(--border)"), color: "var(--text)", boxSizing: "border-box", textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums", transition: "border-color 0.15s" }}
                          onFocus={function (e) { e.currentTarget.style.borderColor = cat.color; }}
                          onBlur={function (e) { e.currentTarget.style.borderColor = b > 0 ? cat.color + "44" : "var(--border)"; }} />
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 6, background: totalBudget > income && income > 0 ? "rgba(239,68,68,0.04)" : "var(--card)", border: "1px solid " + (totalBudget > income && income > 0 ? "rgba(239,68,68,0.12)" : "var(--border)"), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Total</span>
                    {income > 0 ? <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: 6 }}>of {fmt(income)}</span> : null}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: totalBudget > income && income > 0 ? "#EF4444" : "var(--text)", fontVariantNumeric: "tabular-nums" }}>{fmt(totalBudget)}</span>
                </div>
                {totalBudget > income && income > 0 ? (
                  <p style={{ fontSize: 11, color: "#EF4444", margin: "6px 0 0 0", fontWeight: 500 }}>Exceeds income by {fmt(totalBudget - income)}</p>
                ) : null}
                {totalBudget <= income && income > 0 && totalBudget > 0 ? (
                  <p style={{ fontSize: 11, color: "#22C55E", margin: "6px 0 0 0", fontWeight: 500 }}>{fmt(income - totalBudget)} unallocated — add to Savings</p>
                ) : null}

                <button onClick={save} disabled={saving}
                  style={{ width: "100%", height: 40, borderRadius: 6, border: "none", background: saved ? "#16A34A" : "#22C55E", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "wait" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1, transition: "background 0.15s", marginTop: 12 }}
                  onMouseEnter={function (e) { if (!saving && !saved) e.currentTarget.style.background = "#16A34A"; }}
                  onMouseLeave={function (e) { e.currentTarget.style.background = saved ? "#16A34A" : "#22C55E"; }}>
                  {saving ? "Saving..." : saved ? "Saved" : "Save Budget"}
                </button>
              </>
            ) : null}
          </>
        )}
      </div>

      <style>{"@keyframes sp{to{transform:rotate(360deg)}}"}</style>
      <style>{"@media(max-width:640px){.bh{flex-direction:column!important;align-items:flex-start!important}}"}</style>
    </div>
  );
}