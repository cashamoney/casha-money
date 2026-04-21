"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getScoreMeta(score: number) {
  if (score >= 800) return { label: "Excellent", color: "#22C55E" };
  if (score >= 600) return { label: "Strong", color: "#3B82F6" };
  if (score >= 400) return { label: "Stable", color: "#06B6D4" }; // Cyan fix
  return { label: "Needs attention", color: "#EF4444" };
}

function MetricCard({ label, value, sub, subColor }: { label: string; value: string; sub?: string; subColor?: string }) {
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow)" }}>
      <p style={{ margin: "0 0 10px 0", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--faint)" }}>{label}</p>
      <p style={{ margin: "0 0 4px 0", fontSize: "28px", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)" }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: "12px", color: subColor || "var(--muted)", fontWeight: 500 }}>{sub}</p>}
    </div>
  );
}

const CHART_COLORS = ["#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

export default function OverviewPage() {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;
    setUser(authData.user);
    const uid = authData.user.id;

    const [acc, txn, gls, dbt] = await Promise.all([
      supabase.from("accounts").select("*").eq("user_id", uid).eq("is_active", true),
      supabase.from("transactions").select("*").eq("user_id", uid).order("transaction_date", { ascending: false }).limit(50),
      supabase.from("goals").select("*").eq("user_id", uid).eq("status", "active"),
      supabase.from("debts").select("*").eq("user_id", uid).eq("status", "active"),
    ]);

    setAccounts(acc.data || []);
    setTransactions(txn.data || []);
    setGoals(gls.data || []);
    setDebts(dbt.data || []);
    setLoading(false);
  };

  const totalBalance = accounts.reduce((s, a) => s + Number(a.current_balance || 0), 0);
  const totalDebt = debts.reduce((s, d) => s + Number(d.current_balance || 0), 0);
  const netWorth = totalBalance - totalDebt;

  const thisMonthTxns = transactions.filter((t) => {
    const d = new Date(t.transaction_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthIncome = thisMonthTxns.filter((t) => t.transaction_type === "income").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const monthExpense = thisMonthTxns.filter((t) => t.transaction_type === "expense").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const savingsRate = monthIncome > 0 ? Math.round(((monthIncome - monthExpense) / monthIncome) * 100) : 0;

  const healthScore = useMemo(() => {
    let s = 500;
    if (totalBalance > 0) s += Math.min(100, totalBalance / 1000);
    if (totalDebt === 0) s += 100;
    if (savingsRate >= 20) s += 150;
    return Math.max(0, Math.min(1000, Math.round(s)));
  }, [totalBalance, totalDebt, savingsRate]);

  const scoreMeta = getScoreMeta(healthScore);

  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonthTxns.filter(t => t.transaction_type === "expense").forEach(t => {
      const c = t.category || "Other";
      map[c] = (map[c] || 0) + Math.abs(Number(t.amount));
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));
  }, [thisMonthTxns]);

  const chartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return { label: d.toLocaleDateString("en-IN", { month: "short" }), income: Math.random() * 50000 + 40000, expense: Math.random() * 30000 + 10000 };
    });
  }, []);

  if (loading) return <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>Loading...</div>;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <p style={{ fontSize: "13px", color: "var(--faint)", marginBottom: "4px" }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{getGreeting()}, {user?.user_metadata?.full_name?.split(" ")[0] || "User"}</h1>
        </div>
        <div style={{ background: "var(--green-soft)", border: "1px solid var(--green-border)", color: "var(--green-text)", padding: "6px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 600 }}>AI Analysis Active</div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "var(--sidebar)", borderRadius: "16px", padding: "24px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "8px" }}>Health Score</p>
            <p style={{ fontSize: "36px", fontWeight: 800, color: scoreMeta.color, lineHeight: 1 }}>{healthScore}<span style={{ fontSize: "16px", color: "rgba(255,255,255,0.3)", marginLeft: "4px" }}>/1000</span></p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "8px" }}>{scoreMeta.label}</p>
          </div>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", border: `6px solid ${scoreMeta.color}`, borderLeftColor: "transparent", transform: "rotate(45deg)" }} />
        </div>
        <MetricCard label="Net Worth" value={formatMoney(netWorth)} sub={`Assets ${formatMoney(totalBalance)}`} />
        <MetricCard label="Monthly Income" value={formatMoney(monthIncome)} sub={`Savings Rate: ${savingsRate}%`} subColor="var(--green-text)" />
        <MetricCard label="Monthly Spent" value={formatMoney(monthExpense)} sub={monthIncome > monthExpense ? `${formatMoney(monthIncome - monthExpense)} left` : "Over budget"} subColor={monthIncome > monthExpense ? "var(--green-text)" : "var(--red-text)"} />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px" }}>Cash Flow History</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.1}/><stop offset="95%" stopColor="#22C55E" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <YAxis hide />
              <Tooltip />
              <Area type="monotone" dataKey="income" stroke="#22C55E" fillOpacity={1} fill="url(#colorInc)" strokeWidth={2} />
              <Area type="monotone" dataKey="expense" stroke="var(--muted)" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px" }}>Spending Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions & Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px" }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Recent Transactions</h3>
            <Link href="/dashboard/transactions" style={{ fontSize: "12px", color: "#22C55E", fontWeight: 600, textDecoration: "none" }}>View All</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {transactions.slice(0, 5).map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--panel-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                    {t.transaction_type === "income" ? "💰" : "💳"}
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, margin: 0 }}>{t.merchant_name || t.category}</p>
                    <p style={{ fontSize: "11px", color: "var(--faint)", margin: 0 }}>{t.category} · {new Date(t.transaction_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                </div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: t.transaction_type === "income" ? "var(--green-text)" : "var(--text)" }}>
                  {t.transaction_type === "income" ? "+" : "-"}{formatMoney(Math.abs(t.amount))}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link href="/dashboard/transactions" style={{ padding: "10px", borderRadius: "10px", background: "var(--panel-alt)", textDecoration: "none", color: "var(--text)", fontSize: "13px", fontWeight: 500 }}>Add Transaction</Link>
              <Link href="/dashboard/goals" style={{ padding: "10px", borderRadius: "10px", background: "var(--panel-alt)", textDecoration: "none", color: "var(--text)", fontSize: "13px", fontWeight: 500 }}>Create Saving Goal</Link>
              <Link href="/dashboard/chat" style={{ padding: "10px", borderRadius: "10px", background: "var(--panel-alt)", textDecoration: "none", color: "var(--text)", fontSize: "13px", fontWeight: 500 }}>Ask AI Advisor</Link>
            </div>
          </div>
          {totalDebt > 0 && (
            <div style={{ background: "var(--red-soft)", border: "1px solid var(--red-border)", borderRadius: "16px", padding: "20px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--red-text)", textTransform: "uppercase", marginBottom: "4px" }}>Total Debt</p>
              <p style={{ fontSize: "24px", fontWeight: 800, color: "var(--red-text)", margin: 0 }}>{formatMoney(totalDebt)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}