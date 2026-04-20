"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid
} from "recharts";

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function MetricCard({
  label, value, sub, subColor = "#71717A", accent = false,
}: {
  label: string; value: string; sub?: string; subColor?: string; accent?: boolean;
}) {
  return (
    <div style={{
      background: accent ? "#0A0A0A" : "#FFFFFF",
      borderRadius: "14px",
      padding: "20px 22px",
      border: accent ? "none" : "1px solid #E5E7EB",
      boxShadow: accent ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <p style={{ fontSize: "11px", fontWeight: 600, color: accent ? "rgba(255,255,255,0.38)" : "#A1A1AA", margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
      <p style={{ fontSize: "26px", fontWeight: 800, color: accent ? "#FFFFFF" : "#0A0A0A", margin: "0 0 4px 0", letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: "12px", color: accent ? "rgba(255,255,255,0.35)" : subColor, margin: 0, fontWeight: 500 }}>{sub}</p>}
    </div>
  );
}

const COLORS = ["#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

export default function OverviewPage() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;
    setUser(authData.user);
    const uid = authData.user.id;

    const [txRes, accRes, debtRes, goalRes] = await Promise.all([
      supabase.from("transactions").select("*").eq("user_id", uid).order("transaction_date", { ascending: false }).limit(100),
      supabase.from("accounts").select("*").eq("user_id", uid).eq("is_active", true),
      supabase.from("debts").select("*").eq("user_id", uid).eq("status", "active"),
      supabase.from("goals").select("*").eq("user_id", uid).eq("status", "active"),
    ]);

    setTransactions(txRes.data || []);
    setAccounts(accRes.data || []);
    setDebts(debtRes.data || []);
    setGoals(goalRes.data || []);
    setLoading(false);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const totalBalance = accounts.reduce((s, a) => s + Number(a.current_balance || 0), 0);
  const totalDebt = debts.reduce((s, d) => s + Number(d.current_balance || 0), 0);
  const netWorth = totalBalance - totalDebt;

  const now = new Date();
  const thisMonthTxns = transactions.filter(t => {
    const d = new Date(t.transaction_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthIncome = thisMonthTxns.filter(t => t.transaction_type === "income").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const monthExpense = thisMonthTxns.filter(t => t.transaction_type === "expense").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const savingsRate = monthIncome > 0 ? Math.round(((monthIncome - monthExpense) / monthIncome) * 100) : 0;

  const healthScore = (() => {
    let s = 500;
    if (totalBalance > 0) s += Math.min(100, totalBalance / 1000);
    if (totalDebt === 0) s += 100; else if (totalDebt < monthIncome * 6) s += 50; else s -= 50;
    if (savingsRate >= 30) s += 150; else if (savingsRate >= 20) s += 100; else if (savingsRate >= 10) s += 50; else if (savingsRate < 0) s -= 100;
    return Math.max(0, Math.min(1000, Math.round(s)));
  })();

  const scoreLabel = healthScore >= 800 ? "Excellent" : healthScore >= 600 ? "Good" : healthScore >= 400 ? "Fair" : "Needs work";
  const scoreColor = healthScore >= 800 ? "#22C55E" : healthScore >= 600 ? "#3B82F6" : healthScore >= 400 ? "#F59E0B" : "#EF4444";

  const categoryMap: Record<string, number> = {};
  thisMonthTxns.filter(t => t.transaction_type === "expense").forEach(t => {
    const c = t.category || "Other";
    categoryMap[c] = (categoryMap[c] || 0) + Math.abs(Number(t.amount));
  });
  const pieData = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth();
    const y = d.getFullYear();
    const label = d.toLocaleDateString("en-IN", { month: "short" });
    const income = transactions.filter(t => { const td = new Date(t.transaction_date); return td.getMonth() === m && td.getFullYear() === y && t.transaction_type === "income"; }).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const expense = transactions.filter(t => { const td = new Date(t.transaction_date); return td.getMonth() === m && td.getFullYear() === y && t.transaction_type === "expense"; }).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    return { label, income, expense };
  });

  const recent = transactions.slice(0, 8);

  const txIcon = (type: string, cat: string) => {
    if (type === "income") return (
      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="16" height="16" fill="none" stroke="#16A34A" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
      </div>
    );
    if (cat === "Food Delivery" || cat === "Food & Dining") return (
      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="16" height="16" fill="none" stroke="#F97316" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
      </div>
    );
    return (
      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#F5F5F7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="16" height="16" fill="none" stroke="#6B7280" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
      </div>
    );
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid #E5E7EB", borderTopColor: "#22C55E", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#A1A1AA", fontSize: "13px", margin: 0 }}>Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <p style={{ fontSize: "13px", color: "#A1A1AA", margin: "0 0 4px 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0A0A0A", margin: 0, letterSpacing: "-0.02em" }}>
            {greeting}, {firstName}
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "999px", padding: "6px 14px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E" }} />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#166534" }}>AI Active</span>
        </div>
      </div>

      {/* TOP METRICS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "20px" }}>

        {/* Health Score — dark card */}
        <div style={{ background: "#0A0A0A", borderRadius: "14px", padding: "20px 22px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.38)", margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: "0.07em" }}>Health Score</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "6px" }}>
            <span style={{ fontSize: "32px", fontWeight: 800, color: scoreColor, letterSpacing: "-0.02em", lineHeight: 1 }}>{healthScore}</span>
            <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>/1000</span>
          </div>
          <div style={{ height: "4px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", marginBottom: "6px" }}>
            <div style={{ height: "100%", width: `${healthScore / 10}%`, borderRadius: "999px", background: scoreColor, transition: "width 1s ease" }} />
          </div>
          <p style={{ fontSize: "12px", color: scoreColor, margin: 0, fontWeight: 600 }}>{scoreLabel}</p>
        </div>

        <MetricCard
          label="Net Worth"
          value={fmt(netWorth)}
          sub={`Assets ${fmt(totalBalance)} · Debt ${fmt(totalDebt)}`}
        />

        <MetricCard
          label="Monthly Income"
          value={fmt(monthIncome)}
          sub={`Savings rate: ${savingsRate}%`}
          subColor={savingsRate >= 20 ? "#16A34A" : "#F59E0B"}
        />

        <MetricCard
          label="Monthly Spent"
          value={fmt(monthExpense)}
          sub={monthExpense > monthIncome ? "Over budget" : `${fmt(monthIncome - monthExpense)} remaining`}
          subColor={monthExpense > monthIncome ? "#EF4444" : "#16A34A"}
        />
      </div>

      {/* CHARTS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>

        {/* Income vs Expenses */}
        <div style={{ background: "#FFFFFF", borderRadius: "14px", padding: "20px 22px", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#0A0A0A", margin: "0 0 2px 0" }}>Income vs Expenses</h3>
            <p style={{ fontSize: "12px", color: "#A1A1AA", margin: 0 }}>Last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={last6Months} barSize={10} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#A1A1AA" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#A1A1AA" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: any) => [fmt(v)]}
                contentStyle={{ background: "#0A0A0A", border: "none", borderRadius: "10px", fontSize: "12px", color: "#fff" }}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Bar dataKey="income" name="Income" fill="#22C55E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Spending by Category */}
        <div style={{ background: "#FFFFFF", borderRadius: "14px", padding: "20px 22px", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#0A0A0A", margin: "0 0 2px 0" }}>Spending Breakdown</h3>
            <p style={{ fontSize: "12px", color: "#A1A1AA", margin: 0 }}>This month</p>
          </div>
          {pieData.length === 0 ? (
            <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "#A1A1AA", fontSize: "13px" }}>No expense data yet</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "16px", alignItems: "center" }}>
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={32} outerRadius={56} dataKey="value" paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {pieData.slice(0, 5).map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "7px", height: "7px", borderRadius: "2px", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: "11px", color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "90px" }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#0A0A0A", flexShrink: 0 }}>{fmt(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "14px" }}>

        {/* Recent Transactions */}
        <div style={{ background: "#FFFFFF", borderRadius: "14px", padding: "20px 22px", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#0A0A0A", margin: "0 0 2px 0" }}>Recent Transactions</h3>
              <p style={{ fontSize: "12px", color: "#A1A1AA", margin: 0 }}>{recent.length} latest entries</p>
            </div>
            <Link href="/dashboard/transactions" style={{ fontSize: "12px", fontWeight: 600, color: "#22C55E", textDecoration: "none" }}>
              View all →
            </Link>
          </div>

          {recent.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <p style={{ color: "#A1A1AA", fontSize: "13px", margin: "0 0 12px 0" }}>No transactions yet</p>
              <Link href="/dashboard/transactions" style={{ fontSize: "13px", fontWeight: 600, color: "#22C55E", textDecoration: "none" }}>Add your first transaction →</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {recent.map((txn, i) => (
                <div key={txn.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: i < recent.length - 1 ? "1px solid #F5F5F7" : "none" }}>
                  {txIcon(txn.transaction_type, txn.category)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#0A0A0A", margin: "0 0 2px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {txn.merchant_name || txn.category || "Transaction"}
                    </p>
                    <p style={{ fontSize: "11px", color: "#A1A1AA", margin: 0 }}>
                      {new Date(txn.transaction_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      {txn.category && ` · ${txn.category}`}
                    </p>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: txn.transaction_type === "income" ? "#16A34A" : "#0A0A0A", flexShrink: 0 }}>
                    {txn.transaction_type === "income" ? "+" : "-"}{fmt(Math.abs(Number(txn.amount)))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Quick Actions */}
          <div style={{ background: "#FFFFFF", borderRadius: "14px", padding: "18px 20px", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#0A0A0A", margin: "0 0 12px 0" }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { label: "Add transaction", path: "/dashboard/transactions", icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> },
                { label: "Set a savings goal", path: "/dashboard/goals", icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                { label: "Ask AI advisor", path: "/dashboard/chat", icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> },
                { label: "Parse bank SMS", path: "/dashboard/sms", icon: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
              ].map((a, i) => (
                <Link key={i} href={a.path} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", background: "#F5F5F7", textDecoration: "none", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#EBEBED"}
                  onMouseLeave={e => e.currentTarget.style.background = "#F5F5F7"}>
                  <span style={{ color: "#22C55E", display: "flex" }}>{a.icon}</span>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Goals */}
          {goals.length > 0 && (
            <div style={{ background: "#FFFFFF", borderRadius: "14px", padding: "18px 20px", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#0A0A0A", margin: 0 }}>Active Goals</h3>
                <Link href="/dashboard/goals" style={{ fontSize: "11px", fontWeight: 600, color: "#22C55E", textDecoration: "none" }}>View all</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {goals.slice(0, 2).map((g, i) => {
                  const pct = Math.min(100, (Number(g.current_amount) / Number(g.target_amount)) * 100);
                  return (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>{g.name}</span>
                        <span style={{ fontSize: "11px", color: "#A1A1AA" }}>{pct.toFixed(0)}%</span>
                      </div>
                      <div style={{ height: "6px", borderRadius: "999px", background: "#F5F5F7", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, borderRadius: "999px", background: pct >= 100 ? "#22C55E" : "#3B82F6", transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Total Debt */}
          {totalDebt > 0 && (
            <div style={{ background: "#FEF2F2", borderRadius: "14px", padding: "18px 20px", border: "1px solid #FECACA" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#9F1239", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.07em" }}>Total Debt</p>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "#DC2626", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>{fmt(totalDebt)}</p>
              <p style={{ fontSize: "12px", color: "#F87171", margin: 0 }}>{debts.length} active loan{debts.length > 1 ? "s" : ""}</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}