"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const clr = ["#22C55E", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#06B6D4"];

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, background: "var(--panel-alt)", textDecoration: "none", fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer", transition: "0.15s" }} className="arrow-link"><span>{children}</span><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="arrow-icon" style={{ color: "var(--faint)", transition: "0.15s", flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></Link>;
}

function SectionHeader({ title, link, linkText }: { title: string; link: string; linkText: string }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{title}</h3><Link href={link} style={{ fontSize: 11, fontWeight: 600, color: "#22C55E", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>{linkText}<svg width="12" height="12" fill="none" stroke="#22C55E" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></Link></div>;
}

function TxIcon({ type }: { type: string }) {
  return type === "income"
    ? <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg width="16" height="16" fill="none" stroke="#16A34A" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg></div>
    : <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--panel-alt)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg width="16" height="16" fill="none" stroke="var(--muted)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg></div>;
}

export default function OverviewPage() {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [txns, setTxns] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return; setUser(u.user);
    const id = u.user.id;
    const [a, t, g, d] = await Promise.all([
      supabase.from("accounts").select("*").eq("user_id", id).eq("is_active", true),
      supabase.from("transactions").select("*").eq("user_id", id).order("transaction_date", { ascending: false }).limit(100),
      supabase.from("goals").select("*").eq("user_id", id).eq("status", "active"),
      supabase.from("debts").select("*").eq("user_id", id).eq("status", "active"),
    ]);
    setAccounts(a.data || []); setTxns(t.data || []); setGoals(g.data || []); setDebts(d.data || []); setLoading(false);
  };

  const bal = accounts.reduce((s, a) => s + Number(a.current_balance || 0), 0);
  const debtTotal = debts.reduce((s, d) => s + Number(d.current_balance || 0), 0);
  const nw = bal - debtTotal;
  const now = new Date();
  const mTx = txns.filter(t => { const d = new Date(t.transaction_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const inc = mTx.filter(t => t.transaction_type === "income").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const exp = mTx.filter(t => t.transaction_type === "expense").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const sr = inc > 0 ? Math.round(((inc - exp) / inc) * 100) : 0;
  const remaining = inc - exp;

  const cashBufferMonths = exp > 0 ? bal / exp : bal > 0 ? 12 : 0;
  const cashScore = Math.min(100, (cashBufferMonths / 6) * 100);
  const debtScore = debtTotal === 0 ? 100 : Math.max(0, 100 - ((debtTotal / (inc || 1)) / 12) * 100);
  const savingsScore = sr >= 0 ? Math.min(100, (sr / 30) * 100) : 0;
  const goalTarget = goals.reduce((s, g) => s + Number(g.target_amount || 0), 0);
  const goalSaved = goals.reduce((s, g) => s + Number(g.current_amount || 0), 0);
  const goalScore = goalTarget > 0 ? Math.min(100, (goalSaved / goalTarget) * 100) : 50;
  let hs = Math.round((cashScore * 0.28 + debtScore * 0.28 + savingsScore * 0.32 + goalScore * 0.12) * 10);
  hs = Math.max(0, Math.min(1000, hs));

  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  const healthLabel = hs >= 850 ? "Elite" : hs >= 700 ? "Strong" : hs >= 500 ? "Stable" : hs >= 300 ? "Fragile" : "Critical";
  const healthColor = hs >= 850 ? "#22C55E" : hs >= 700 ? "#3B82F6" : hs >= 500 ? "#06B6D4" : hs >= 300 ? "#F59E0B" : "#EF4444";

  const pie = useMemo(() => {
    const m: Record<string, number> = {};
    mTx.filter(t => t.transaction_type === "expense").forEach(t => { const c = t.category || "Other"; m[c] = (m[c] || 0) + Math.abs(Number(t.amount)); });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));
  }, [mTx]);

  const series = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth(), y = d.getFullYear();
    const i2 = txns.filter(t => { const td = new Date(t.transaction_date); return td.getMonth() === m && td.getFullYear() === y && t.transaction_type === "income"; }).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const e2 = txns.filter(t => { const td = new Date(t.transaction_date); return td.getMonth() === m && td.getFullYear() === y && t.transaction_type === "expense"; }).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    return { label: d.toLocaleDateString("en-IN", { month: "short" }), income: i2, expense: e2 };
  }), [txns]);

  if (loading) return <div style={{ height: "50vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 13 }}>Loading...</div>;
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 8 }}>
        <div><p style={{ fontSize: 12, color: "var(--faint)", margin: "0 0 4px" }}>{now.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</p><h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{greet}, {firstName}</h1></div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--green-soft)", border: "1px solid var(--green-border)", borderRadius: 99, padding: "5px 12px" }}><div style={{ width: 6, height: 6, borderRadius: 9, background: "#22C55E" }} /><span style={{ fontSize: 11, fontWeight: 600, color: "var(--green-text)" }}>AI Active</span></div>
      </div>

      {/* Row 1: Health + KPIs */}
      <div className="ov-row1" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "linear-gradient(135deg, #111113 0%, #1a1a1e 100%)", borderRadius: 20, padding: "28px 28px 24px", color: "#fff", boxShadow: "0 12px 30px rgba(0,0,0,0.15)", display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 180, height: 180, background: `${healthColor}12`, filter: "blur(60px)", borderRadius: "50%" }} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 0.1, margin: "0 0 10px" }}>Financial Health Score</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}><span style={{ fontSize: 48, fontWeight: 800, color: healthColor, lineHeight: 1, letterSpacing: "-0.04em" }}>{hs}</span><span style={{ fontSize: 16, color: "rgba(255,255,255,0.25)" }}>/ 1000</span></div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "0 0 20px", lineHeight: 1.5 }}>Your finances are <span style={{ color: healthColor, fontWeight: 700 }}>{healthLabel}</span>. {hs >= 700 ? "Keep building consistently." : "Focus on reducing debt and increasing savings."}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[{ label: "Cash Buffer", value: cashScore, color: "#22C55E" }, { label: "Debt Load", value: debtScore, color: "#3B82F6" }, { label: "Savings Rate", value: savingsScore, color: "#06B6D4" }, { label: "Goal Progress", value: goalScore, color: "#8B5CF6" }].map((b, i) => (
                <div key={i}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{b.label}</span><span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{Math.round(b.value)}%</span></div><div style={{ height: 5, borderRadius: 9, background: "rgba(255,255,255,0.08)" }}><div style={{ width: `${Math.min(b.value, 100)}%`, height: "100%", borderRadius: 9, background: b.color }} /></div></div>
              ))}
            </div>
          </div>
          <div className="ov-ring" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ width: 130, height: 130, borderRadius: "50%", background: `conic-gradient(${healthColor} 0deg ${(hs / 1000) * 360}deg, rgba(255,255,255,0.06) ${(hs / 1000) * 360}deg 360deg)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: 96, height: 96, borderRadius: "50%", background: "#111113", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{healthLabel}</span><span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>score status</span></div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Link href="/dashboard/accounts" style={{ textDecoration: "none" }}><div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, cursor: "pointer" }}><p style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 6px" }}>Net Worth</p><p style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.02em", color: "var(--text)" }}>{fmt(nw)}</p><p style={{ fontSize: 11, color: "var(--muted)", margin: "4px 0 0 0" }}>Assets {fmt(bal)} · Debt {fmt(debtTotal)}</p></div></Link>
          <Link href="/dashboard/transactions" style={{ textDecoration: "none" }}><div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, cursor: "pointer" }}><p style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 6px" }}>Monthly Income</p><p style={{ fontSize: 22, fontWeight: 800, color: "#22C55E", margin: 0 }}>{fmt(inc)}</p><p style={{ fontSize: 11, color: "var(--muted)", margin: "3px 0 0 0" }}>{sr}% savings rate</p></div></Link>
          <Link href="/dashboard/transactions" style={{ textDecoration: "none" }}><div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, cursor: "pointer" }}><p style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 6px" }}>Monthly Spent</p><p style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "var(--text)" }}>{fmt(exp)}</p><p style={{ fontSize: 11, color: remaining >= 0 ? "var(--green-text)" : "#DC2626", margin: "3px 0 0 0" }}>{remaining >= 0 ? `${fmt(remaining)} remaining` : "Over budget"}</p></div></Link>
        </div>
      </div>

      {/* Row 2: Charts */}
      <div className="ov-row2" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <SectionHeader title="Cash Flow" link="/dashboard/budget" linkText="Budget" />
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={series}>
              <defs><linearGradient id="gI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.15} /><stop offset="95%" stopColor="#22C55E" stopOpacity={0} /></linearGradient><linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#94A3B8" stopOpacity={0.1} /><stop offset="95%" stopColor="#94A3B8" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--faint)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#000", border: "none", borderRadius: 8, color: "#fff", fontSize: 11 }} />
              <Area type="monotone" dataKey="income" stroke="#22C55E" strokeWidth={2} fill="url(#gI)" /><Area type="monotone" dataKey="expense" stroke="var(--faint)" strokeWidth={1.5} fill="url(#gE)" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <SectionHeader title="Spending Breakdown" link="/dashboard/transactions" linkText="Details" />
          {pie.length === 0 ? <div style={{ height: 210, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--faint)", fontSize: 12 }}>No expense data yet</div> : (
            <div><ResponsiveContainer width="100%" height={150}><PieChart><Pie data={pie} innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">{pie.map((_, i) => <Cell key={i} fill={clr[i % clr.length]} stroke="none" />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>{pie.map((p, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--muted)" }}><div style={{ width: 6, height: 6, borderRadius: 2, background: clr[i % clr.length] }} />{p.name}</div>)}</div></div>
          )}
        </div>
      </div>

      {/* Row 3: Transactions + Rail */}
      <div className="ov-row3" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <SectionHeader title="Recent Transactions" link="/dashboard/transactions" linkText="View all" />
          {txns.length === 0 ? <p style={{ color: "var(--faint)", fontSize: 12 }}>No transactions yet</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {txns.slice(0, 6).map((t, i) => (
                <Link key={i} href="/dashboard/transactions" style={{ textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 5 ? "1px solid var(--tx-border)" : "none", cursor: "pointer" }} className="tx-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <TxIcon type={t.transaction_type} />
                    <div><p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: "var(--text)" }}>{t.merchant_name || t.category}</p><p style={{ fontSize: 11, color: "var(--faint)", margin: "2px 0 0 0" }}>{t.category} · {new Date(t.transaction_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p></div>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: t.transaction_type === "income" ? "#16A34A" : "var(--text)", margin: 0 }}>{t.transaction_type === "income" ? "+" : "-"}{fmt(Math.abs(Number(t.amount)))}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <ArrowLink href="/dashboard/transactions">Add transaction</ArrowLink>
              <ArrowLink href="/dashboard/goals">Set a savings goal</ArrowLink>
              <ArrowLink href="/dashboard/chat">Ask AI advisor</ArrowLink>
              <ArrowLink href="/dashboard/sms">Parse bank SMS</ArrowLink>
            </div>
          </div>

          <Link href="/dashboard/goals" style={{ textDecoration: "none" }}><div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 18, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><h3 style={{ fontSize: 13, fontWeight: 700, margin: 0, color: "var(--text)" }}>Active Goals</h3><svg width="14" height="14" fill="none" stroke="#22C55E" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></div>
            {goals.length === 0 ? <p style={{ fontSize: 12, color: "var(--faint)", margin: 0 }}>No active goals yet.</p> : goals.slice(0, 3).map((g, i) => { const p = Number(g.target_amount) > 0 ? (Number(g.current_amount || 0) / Number(g.target_amount)) * 100 : 0; return <div key={i} style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600, color: "var(--text)" }}>{g.name}</span><span style={{ color: "var(--faint)" }}>{p.toFixed(0)}%</span></div><div style={{ height: 5, borderRadius: 9, background: "var(--panel-alt)" }}><div style={{ width: `${Math.min(p, 100)}%`, height: "100%", borderRadius: 9, background: p >= 100 ? "#22C55E" : "#3B82F6" }} /></div></div>; })}
          </div></Link>

          <Link href="/dashboard/debts" style={{ textDecoration: "none" }}><div style={{ background: debtTotal > 0 ? "var(--red-soft)" : "var(--card)", border: `1px solid ${debtTotal > 0 ? "var(--red-border)" : "var(--border)"}`, borderRadius: 14, padding: 18, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><p style={{ fontSize: 10, fontWeight: 700, color: debtTotal > 0 ? "var(--red-text)" : "var(--faint)", textTransform: "uppercase", margin: 0 }}>Total Debt</p><svg width="14" height="14" fill="none" stroke={debtTotal > 0 ? "var(--red-text)" : "var(--faint)"} strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></div>
            <p style={{ fontSize: 22, fontWeight: 800, color: debtTotal > 0 ? "#DC2626" : "var(--text)", margin: 0 }}>{fmt(debtTotal)}</p>
            <p style={{ fontSize: 11, color: debtTotal > 0 ? "var(--red-text)" : "var(--muted)", margin: "4px 0 0 0" }}>{debtTotal > 0 ? `${debts.length} active loan${debts.length > 1 ? "s" : ""}` : "You are debt free!"}</p>
          </div></Link>

          <div style={{ background: "var(--green-soft)", border: "1px solid var(--green-border)", borderRadius: 14, padding: 18 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--green-text)", textTransform: "uppercase", margin: "0 0 6px" }}>Savings Rate</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: "var(--green-text)", margin: 0 }}>{sr}%</p>
            <p style={{ fontSize: 11, color: "var(--green-text)", margin: "4px 0 0 0" }}>{sr >= 30 ? "Excellent! You're saving well." : sr >= 10 ? "Good start. Aim for 30%." : "Try to increase your savings."}</p>
          </div>
        </div>
      </div>

      <style>{`
        .arrow-link:hover { background: var(--border) !important; }
        .arrow-link:hover .arrow-icon { color: #22C55E !important; transform: translateX(2px); }
        .tx-row:hover { background: var(--panel-alt); border-radius: 8px; }
        @media (max-width: 768px) {
          .ov-row1 { grid-template-columns: 1fr !important; }
          .ov-row2 { grid-template-columns: 1fr !important; }
          .ov-row3 { grid-template-columns: 1fr !important; }
          .ov-ring { display: none !important; }
        }
      `}</style>
    </div>
  );
}