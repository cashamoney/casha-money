"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabase";

const CATS = [
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

function getCat(n: string) { return CATS.find(c => c.name === n) || CATS[CATS.length - 1]; }

function Av({ name, color, s }: { name: string; color: string; s?: number }) {
  const sz = s || 36;
  const letter = name === "Housing/Rent" ? "H" : name === "Food Delivery" ? "FD" : name === "EMI Payment" ? "EM" : name === "Streaming/OTT" ? "ST" : name === "Other Expense" ? "OT" : name.charAt(0);
  return (
    <div style={{ width: sz, height: sz, borderRadius: sz >= 36 ? 10 : 8, background: color + "16", color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: sz >= 36 ? 13 : 11, fontWeight: 700, flexShrink: 0, letterSpacing: -0.3, border: `1px solid ${color}22` }}>
      {letter}
    </div>
  );
}

function sColor(p: number) {
  if (p >= 100) return "#EF4444";
  if (p >= 85) return "#F97316";
  if (p >= 60) return "#EAB308";
  return "#22C55E";
}

function hInfo(s: number) {
  if (s >= 80) return { l: "Excellent", c: "#22C55E" };
  if (s >= 60) return { l: "Good", c: "#84CC16" };
  if (s >= 40) return { l: "Fair", c: "#F59E0B" };
  return { l: "At Risk", c: "#EF4444" };
}

function Donut({ pct, color, sz }: { pct: number; color: string; sz: number }) {
  const sw = 8;
  const r = (sz - sw) / 2;
  const c = 2 * Math.PI * r;
  const f = (Math.min(pct, 100) / 100) * c;
  return (
    <svg width={sz} height={sz} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={sz / 2} cy={sz / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={sw} />
      <circle cx={sz / 2} cy={sz / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={`${f} ${c - f}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.8s ease-out" }} />
    </svg>
  );
}

export default function BudgetPage() {
  const [income, setIncome] = useState(0);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [spent, setSpent] = useState<Record<string, number>>({});
  const [lastSpent, setLastSpent] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"overview" | "edit">("overview");
  const [warn, setWarn] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const uid = u.user.id;

    const { data: iT } = await supabase.from("transactions").select("amount, transaction_date").eq("user_id", uid).eq("transaction_type", "income");
    const tot = (iT || []).reduce((s: number, t: any) => s + Math.abs(Number(t.amount)), 0);
    const ms = new Set((iT || []).map((t: any) => t.transaction_date?.slice(0, 7)));
    const mi = Math.round(tot / Math.max(1, ms.size));
    setIncome(mi);

    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const ls = `${lm.getFullYear()}-${String(lm.getMonth() + 1).padStart(2, "0")}-01`;
    const ago = new Date(now.getTime() - 65 * 86400000).toISOString().split("T")[0];

    const { data: eT } = await supabase.from("transactions").select("amount, category, transaction_date").eq("user_id", uid).eq("transaction_type", "expense").gte("transaction_date", ago);
    const tS: Record<string, number> = {};
    const lS: Record<string, number> = {};
    (eT || []).forEach((t: any) => {
      const c = t.category || "Other Expense";
      const a = Math.abs(Number(t.amount));
      const d = t.transaction_date;
      if (d >= ts) tS[c] = (tS[c] || 0) + a;
      else if (d >= ls) lS[c] = (lS[c] || 0) + a;
    });
    setSpent(tS);
    setLastSpent(lS);

    const { data: sb } = await supabase.from("budgets").select("categories").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).single();
    if (sb?.categories && Object.keys(sb.categories).length > 0) {
      setBudgets(sb.categories);
    } else if (mi > 0) {
      const ab: Record<string, number> = {};
      CATS.forEach(c => { ab[c.name] = Math.round(mi * c.rec / 100); });
      setBudgets(ab);
    }
    setLoading(false);
  };

  const aiFill = () => {
    if (income === 0) {
      setWarn("Add income transactions first so we can calculate your budget.");
      setTimeout(() => { setWarn(""); }, 4000);
      return;
    }
    const ab: Record<string, number> = {};
    CATS.forEach(c => { ab[c.name] = Math.round(income * c.rec / 100); });
    setBudgets(ab);
    setTab("edit");
  };

  const rebalance = () => {
    const nb = { ...budgets };
    let pool = 0;
    CATS.forEach(c => {
      const b = nb[c.name] || 0;
      const s = spent[c.name] || 0;
      if (b > 0 && s / b < 0.35 && c.rec > 0) {
        const ex = Math.round(b * 0.2);
        nb[c.name] = b - ex;
        pool += ex;
      }
    });
    const overs = CATS.filter(c => { const b = nb[c.name] || 0; const s = spent[c.name] || 0; return b > 0 && s / b > 0.85; });
    if (overs.length > 0 && pool > 0) {
      const each = Math.round(pool / overs.length);
      overs.forEach(c => { nb[c.name] = (nb[c.name] || 0) + each; });
    }
    setBudgets(nb);
  };

  const save = async () => {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setSaving(false); return; }
    const now = new Date();
    const sd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const ed = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;
    await supabase.from("budgets").delete().eq("user_id", u.user.id);
    const { error } = await supabase.from("budgets").insert({
      user_id: u.user.id,
      name: `Budget ${now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`,
      period_type: "monthly", start_date: sd, end_date: ed,
      total_budget: Object.values(budgets).reduce((s, v) => s + v, 0),
      currency: "INR", categories: budgets, status: "active",
    });
    setSaving(false);
    if (!error) { setSaved(true); setTimeout(() => { setSaved(false); }, 3000); }
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

  const now = new Date();
  const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dp = now.getDate();
  const dl = dim - dp;
  const timePct = Math.round((dp / dim) * 100);

  const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0);
  const totalSpent = Object.values(spent).reduce((s, v) => s + v, 0);
  const rem = totalBudget - totalSpent;
  const usedPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const perDay = dl > 0 ? rem / dl : 0;
  const proj = dp > 0 ? (totalSpent / dp) * dim : 0;

  const hScore = useMemo(() => {
    const ac = CATS.filter(c => (budgets[c.name] || 0) > 0);
    if (!ac.length) return 0;
    const sc = ac.map(c => { const b = budgets[c.name] || 0; const s = spent[c.name] || 0; const p = (s / b) * 100; if (p <= 50) return 100; if (p <= 80) return 100 - ((p - 50) / 30) * 30; if (p <= 100) return 70 - ((p - 80) / 20) * 40; return Math.max(0, 30 - (p - 100) * 1.5); });
    return Math.round(sc.reduce((a, b) => a + b, 0) / sc.length);
  }, [budgets, spent]);
  const hi = hInfo(hScore);

  const trends = useMemo(() => {
    const m = new Map<string, number>();
    CATS.forEach(c => { const cu = spent[c.name] || 0; const pv = lastSpent[c.name] || 0; m.set(c.name, pv > 0 ? Math.round(((cu - pv) / pv) * 100) : 0); });
    return m;
  }, [spent, lastSpent]);

  const mLbl = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const activeCats = CATS.filter(c => (budgets[c.name] || 0) > 0 || (spent[c.name] || 0) > 0);

  if (loading) return (
    <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 20, height: 20, border: "2px solid var(--border)", borderTopColor: "#22C55E", borderRadius: "50%", animation: "sp 0.6s linear infinite" }} />
      <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="bw" style={{ maxWidth: 860, margin: "0 auto", padding: "28px 24px 64px" }}>

        {/* Header */}
        <div className="bh" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Budget</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "2px 0 0 0" }}>{mLbl}{activeCats.length > 0 ? ` · ${activeCats.length} categories` : ""}</p>
          </div>
          <button onClick={aiFill}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#16A34A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#22C55E"; }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
            Set Budget
          </button>
        </div>

        {/* Warning */}
        {warn && (
          <div style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
            <p style={{ fontSize: 12, color: "#EAB308", margin: 0, fontWeight: 500 }}>{warn}</p>
          </div>
        )}

        {activeCats.length === 0 ? (
          /* Empty */
          <div style={{ textAlign: "center", padding: "60px 24px 40px" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></svg>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>Take control of your spending</h2>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 20px", maxWidth: 300, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>Set budgets for each category. See how much you have left and build better habits.</p>
            <button onClick={aiFill}
              style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#16A34A"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#22C55E"; }}>
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
            {/* Summary */}
            <div className="bs" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px" }}>
                <p style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)", margin: "0 0 8px" }}>Budget</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(totalBudget)}</p>
                <p style={{ fontSize: 10, color: "var(--muted)", margin: "4px 0 0 0", fontVariantNumeric: "tabular-nums" }}>{fmt(totalSpent)} spent</p>
              </div>
              <div style={{ background: rem >= 0 ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)", border: `1px solid ${rem >= 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}`, borderRadius: 10, padding: "16px" }}>
                <p style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)", margin: "0 0 8px" }}>Remaining</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: rem >= 0 ? "#22C55E" : "#EF4444", margin: 0, fontVariantNumeric: "tabular-nums" }}>{rem >= 0 ? "" : "-"}{fmt(Math.abs(rem))}</p>
                <p style={{ fontSize: 10, color: rem >= 0 ? "#22C55E" : "#EF4444", margin: "4px 0 0 0" }}>{dl > 0 && rem > 0 ? `${fmt(perDay)}/day` : dl > 0 ? `${dl} days left` : ""}</p>
              </div>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)", margin: 0 }}>Health</p>
                  <div style={{ position: "relative", width: 36, height: 36 }}>
                    <Donut pct={hScore} color={hi.c} sz={36} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: hi.c, fontVariantNumeric: "tabular-nums" }}>{hScore}</span>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: hi.c, margin: 0 }}>{hi.l}</p>
                <p style={{ fontSize: 10, color: "var(--muted)", margin: "3px 0 0 0" }}>{proj > 0 ? `Projected: ${fmt(proj)}` : ""}</p>
              </div>
            </div>

            {/* Pace */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)" }}>Spend pace</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: usedPct > timePct + 15 ? "#EF4444" : usedPct > timePct ? "#EAB308" : "#22C55E" }}>
                  {usedPct > timePct + 15 ? "Spending too fast" : usedPct > timePct ? "Slightly ahead" : "Good pace"}
                </span>
              </div>
              <div style={{ position: "relative", height: 6, background: "var(--border)", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, usedPct)}%`, background: sColor(usedPct), borderRadius: 6, transition: "width 0.7s" }} />
                <div style={{ position: "absolute", top: -3, left: `${Math.min(98, timePct)}%`, width: 2, height: 12, background: "var(--text)", borderRadius: 1, opacity: 0.25 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 9, color: "var(--muted)" }}>0%</span>
                <span style={{ fontSize: 9, color: "var(--muted)" }}>| today {timePct}%</span>
                <span style={{ fontSize: 9, color: "var(--muted)" }}>100%</span>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {([["overview", "Overview"], ["edit", "Edit"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => { setTab(k as "overview" | "edit"); }}
                  style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid " + (tab === k ? "#22C55E" : "var(--border)"), background: tab === k ? "rgba(34,197,94,0.08)" : "var(--card)", color: tab === k ? "#22C55E" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "0.15s" }}>
                  {l}
                </button>
              ))}
            </div>

            {/* Overview */}
            {tab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {CATS.map(cat => {
                  const b = budgets[cat.name] || 0;
                  const s = spent[cat.name] || 0;
                  if (b === 0 && s === 0) return null;
                  const pct = b > 0 ? (s / b) * 100 : 0;
                  const sc = sColor(pct);
                  const tr = trends.get(cat.name) || 0;
                  return (
                    <div key={cat.name} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", transition: "border-color 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = cat.color + "33"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Av name={cat.name} color={cat.color} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{cat.name}</span>
                            {tr !== 0 && b > 0 && (
                              <span style={{ fontSize: 9, fontWeight: 600, color: tr > 0 ? "#EF4444" : "#22C55E", background: (tr > 0 ? "#EF4444" : "#22C55E") + "12", padding: "1px 5px", borderRadius: 4 }}>
                                {tr > 0 ? "+" : ""}{tr}%
                              </span>
                            )}
                            {b > 0 && (
                              <span style={{ fontSize: 9, fontWeight: 500, color: sc, marginLeft: "auto" }}>
                                {pct >= 100 ? "Over" : pct >= 85 ? "Almost full" : pct >= 60 ? "Caution" : "On track"}
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: sc, borderRadius: 4, transition: "width 0.5s" }} />
                            </div>
                            <span style={{ fontSize: 10, color: "var(--muted)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{fmt(s)}{b > 0 ? ` / ${fmt(b)}` : ""}</span>
                          </div>
                        </div>
                        {b > 0 && (
                          <div style={{ textAlign: "right", minWidth: 56, flexShrink: 0, marginLeft: 4 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: s >= b ? "#EF4444" : "#22C55E", margin: 0, fontVariantNumeric: "tabular-nums" }}>
                              {s >= b ? fmt(s - b) : fmt(b - s)}
                            </p>
                            <p style={{ fontSize: 9, color: "var(--muted)", margin: "1px 0 0 0" }}>{s >= b ? "over" : "left"}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Unbudgeted */}
                {(() => {
                  const bn = new Set(Object.keys(budgets));
                  const ub = Object.entries(spent).filter(([k, v]) => !bn.has(k) && v > 0).map(([k, v]) => ({ name: k, amount: v, color: getCat(k).color })).sort((a, b) => b.amount - a.amount);
                  if (ub.length === 0) return null;
                  const ubt = ub.reduce((s, u) => s + u.amount, 0);
                  return (
                    <div style={{ background: "rgba(234,179,8,0.05)", border: "1px solid rgba(234,179,8,0.15)", borderRadius: 10, padding: "12px 14px", marginTop: 4 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: "0 0 4px" }}>Unbudgeted</p>
                      <p style={{ fontSize: 10, color: "var(--muted)", margin: "0 0 8px" }}>{fmt(ubt)} spent without a budget</p>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {ub.map(u => (
                          <span key={u.name} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 5, background: u.color + "12", color: u.color, fontWeight: 500 }}>
                            {u.name} · {fmt(u.amount)}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Edit */}
            {tab === "edit" && (
              <>
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  <button onClick={aiFill} style={{ flex: 1, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "border-color 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#22C55E44"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}>
                    Reset to Suggested
                  </button>
                  <button onClick={rebalance} style={{ flex: 1, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "border-color 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#22C55E44"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}>
                    Rebalance
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
                  {CATS.map(cat => {
                    const b = budgets[cat.name] || 0;
                    const s = spent[cat.name] || 0;
                    return (
                      <div key={cat.name} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, transition: "border-color 0.15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = cat.color + "33"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}>
                        <Av name={cat.name} color={cat.color} s={30} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0 }}>{cat.name}</p>
                          <p style={{ fontSize: 9, color: "var(--muted)", margin: "1px 0 0 0" }}>
                            {cat.rec > 0 ? `${cat.rec}% = ${fmt(Math.round(income * cat.rec / 100))}` : "Custom"}
                            {s > 0 ? <span style={{ color: sColor(b > 0 ? (s / b) * 100 : 0) }}> · Spent {fmt(s)}</span> : ""}
                          </p>
                        </div>
                        <input type="number" min="0" value={b || ""} onChange={(e) => { setBudgets({ ...budgets, [cat.name]: Number(e.target.value) }); }} placeholder="0"
                          style={{ width: 88, height: 30, borderRadius: 6, padding: "0 8px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: `1px solid ${b > 0 ? cat.color + "55" : "var(--border)"}`, color: "var(--text)", boxSizing: "border-box", textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums", transition: "border-color 0.15s" }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = cat.color; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = b > 0 ? cat.color + "55" : "var(--border)"; }} />
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div style={{ background: totalBudget > income && income > 0 ? "rgba(239,68,68,0.05)" : "var(--card)", border: `1px solid ${totalBudget > income && income > 0 ? "rgba(239,68,68,0.15)" : "var(--border)"}`, borderRadius: 8, padding: "12px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Total</span>
                    {income > 0 && <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: 6 }}>of {fmt(income)}</span>}
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: totalBudget > income && income > 0 ? "#EF4444" : "var(--text)", fontVariantNumeric: "tabular-nums" }}>{fmt(totalBudget)}</span>
                </div>
                {totalBudget > income && income > 0 && (
                  <p style={{ fontSize: 11, color: "#EF4444", margin: "0 0 10px", fontWeight: 500 }}>Exceeds income by {fmt(totalBudget - income)}</p>
                )}
                {totalBudget <= income && income > 0 && totalBudget > 0 && (
                  <p style={{ fontSize: 11, color: "#22C55E", margin: "0 0 10px", fontWeight: 500 }}>{fmt(income - totalBudget)} unallocated</p>
                )}

                <button onClick={save} disabled={saving}
                  style={{ width: "100%", height: 42, borderRadius: 8, border: "none", background: saved ? "#16A34A" : "#22C55E", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "wait" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1, transition: "background 0.15s" }}
                  onMouseEnter={(e) => { if (!saving && !saved) e.currentTarget.style.background = "#16A34A"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = saved ? "#16A34A" : "#22C55E"; }}>
                  {saving ? "Saving..." : saved ? "Saved" : "Save Budget"}
                </button>
              </>
            )}
          </>
        )}
      </div>

      <style>{`
        *{box-sizing:border-box}
        @keyframes sp{to{transform:rotate(360deg)}}
        @media(max-width:640px){
          .bs{grid-template-columns:1fr!important}
          .bh{flex-direction:column!important;align-items:flex-start!important}
        }
      `}</style>
    </div>
  );
}