"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const clr = ["#22C55E", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B"];

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
    if (!u?.user) return;
    setUser(u.user);
    const id = u.user.id;
    const [a, t, g, d] = await Promise.all([
      supabase.from("accounts").select("*").eq("user_id", id).eq("is_active", true),
      supabase.from("transactions").select("*").eq("user_id", id).order("transaction_date", { ascending: false }).limit(100),
      supabase.from("goals").select("*").eq("user_id", id).eq("status", "active"),
      supabase.from("debts").select("*").eq("user_id", id).eq("status", "active"),
    ]);
    setAccounts(a.data || []); setTxns(t.data || []); setGoals(g.data || []); setDebts(d.data || []);
    setLoading(false);
  };

  const bal = accounts.reduce((s, a) => s + Number(a.current_balance || 0), 0);
  const debt = debts.reduce((s, d) => s + Number(d.current_balance || 0), 0);
  const nw = bal - debt;

  const now = new Date();
  const mTx = txns.filter(t => { const d = new Date(t.transaction_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const inc = mTx.filter(t => t.transaction_type === "income").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const exp = mTx.filter(t => t.transaction_type === "expense").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const sr = inc > 0 ? Math.round(((inc - exp) / inc) * 100) : 0;

  let hs = 400;
  if (nw > 0) hs += 150;
  if (sr > 20) hs += 200;
  if (debt === 0) hs += 250;
  hs = Math.min(1000, hs);

  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";

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
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 12, color: "var(--faint)", margin: "0 0 4px" }}>{now.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{greet}, {firstName}</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--green-soft)", border: "1px solid var(--green-border)", borderRadius: 99, padding: "5px 12px" }}>
          <div style={{ width: 6, height: 6, borderRadius: 9, background: "#22C55E" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--green-text)" }}>AI Active</span>
        </div>
      </div>

      {/* Top Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Health Score */}
        <div style={{ background: "linear-gradient(135deg, #111113 0%, #1a1a1e 100%)", borderRadius: 18, padding: 24, color: "#fff", boxShadow: "0 12px 30px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, background: "rgba(34,197,94,0.08)", filter: "blur(50px)", borderRadius: "50%" }} />
          <div style={{ flex: 1, position: "relative", zIndex: 2 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 0.1, margin: "0 0 8px" }}>Financial Health</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: "#22C55E", lineHeight: 1 }}>{hs}</span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.25)" }}>/ 1000</span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>Your finances are {hs >= 700 ? "strong" : hs >= 400 ? "stable" : "under pressure"}. Keep tracking consistently.</p>
          </div>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: `conic-gradient(#22C55E 0deg ${(hs / 1000) * 360}deg, rgba(255,255,255,0.06) ${(hs / 1000) * 360}deg 360deg)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div style={{ width: 66, height: 66, borderRadius: "50%", background: "#111113", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>
              {hs >= 700 ? "Strong" : hs >= 400 ? "Stable" : "Weak"}
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 6px" }}>Net Worth</p>
            <p style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{fmt(nw)}</p>
            <p style={{ fontSize: 11, color: "var(--muted)", margin: "4px 0 0 0" }}>Assets {fmt(bal)} · Debt {fmt(debt)}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 6px" }}>Income</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#22C55E", margin: 0 }}>{fmt(inc)}</p>
              <p style={{ fontSize: 11, color: "var(--muted)", margin: "3px 0 0 0" }}>{sr}% saved</p>
            </div>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 6px" }}>Spent</p>
              <p style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{fmt(exp)}</p>
              <p style={{ fontSize: 11, color: inc > exp ? "var(--green-text)" : "#DC2626", margin: "3px 0 0 0" }}>{inc > exp ? `${fmt(inc - exp)} left` : "Over budget"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 16px" }}>Cash Flow</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={series}>
              <defs><linearGradient id="gI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.15}/><stop offset="95%" stopColor="#22C55E" stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--faint)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#000", border: "none", borderRadius: 8, color: "#fff", fontSize: 11 }} />
              <Area type="monotone" dataKey="income" stroke="#22C55E" strokeWidth={2} fill="url(#gI)" />
              <Area type="monotone" dataKey="expense" stroke="var(--faint)" strokeWidth={1.5} fill="transparent" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 16px" }}>Spending</h3>
          {pie.length === 0 ? <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--faint)", fontSize: 12 }}>No data yet</div> : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart><Pie data={pie} innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">{pie.map((_, i) => <Cell key={i} fill={clr[i % clr.length]} stroke="none" />)}</Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                {pie.map((p, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--muted)" }}><div style={{ width: 6, height: 6, borderRadius: 2, background: clr[i % clr.length] }} />{p.name}</div>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Recent Transactions</h3>
            <Link href="/dashboard/transactions" style={{ fontSize: 11, fontWeight: 600, color: "#22C55E", textDecoration: "none" }}>View all →</Link>
          </div>
          {txns.length === 0 ? <p style={{ color: "var(--faint)", fontSize: 12 }}>No transactions yet</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {txns.slice(0, 5).map((t, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 4 ? "1px solid var(--tx-border)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: t.transaction_type === "income" ? "rgba(34,197,94,0.1)" : "var(--panel-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{t.transaction_type === "income" ? "↑" : "↓"}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{t.merchant_name || t.category}</p>
                      <p style={{ fontSize: 11, color: "var(--faint)", margin: "2px 0 0 0" }}>{t.category} · {new Date(t.transaction_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: t.transaction_type === "income" ? "#16A34A" : "var(--text)", margin: 0 }}>{t.transaction_type === "income" ? "+" : "-"}{fmt(Math.abs(Number(t.amount)))}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[{ l: "Add transaction", p: "/dashboard/transactions" }, { l: "Ask AI advisor", p: "/dashboard/chat" }, { l: "Parse bank SMS", p: "/dashboard/sms" }].map((a, i) => (
                <Link key={i} href={a.p} style={{ padding: "10px 12px", borderRadius: 8, background: "var(--panel-alt)", textDecoration: "none", fontSize: 12, fontWeight: 600, color: "var(--text)", display: "flex", justifyContent: "space-between" }}>{a.l} <span style={{ color: "var(--faint)" }}>→</span></Link>
              ))}
            </div>
          </div>
          {goals.length > 0 && (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>Goals</h3>
              {goals.slice(0, 2).map((g, i) => {
                const p = Number(g.target_amount) > 0 ? (Number(g.current_amount || 0) / Number(g.target_amount)) * 100 : 0;
                return <div key={i} style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{g.name}</span><span style={{ color: "var(--faint)" }}>{p.toFixed(0)}%</span></div><div style={{ height: 5, borderRadius: 9, background: "var(--panel-alt)" }}><div style={{ width: `${Math.min(p, 100)}%`, height: "100%", borderRadius: 9, background: p >= 100 ? "#22C55E" : "#3B82F6" }} /></div></div>;
              })}
            </div>
          )}
          {debt > 0 && (
            <div style={{ background: "var(--red-soft)", border: "1px solid var(--red-border)", borderRadius: 14, padding: 18 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--red-text)", textTransform: "uppercase", margin: "0 0 4px" }}>Total Debt</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#DC2626", margin: 0 }}>{fmt(debt)}</p>
              <p style={{ fontSize: 11, color: "var(--red-text)", margin: "3px 0 0 0" }}>{debts.length} active loan{debts.length > 1 ? "s" : ""}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}