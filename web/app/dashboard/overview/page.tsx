"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend
} from "recharts";

const COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#ec4899",
  "#22c55e", "#6366f1"
];

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

    const [accRes, txnRes, goalRes, debtRes] = await Promise.all([
      supabase.from("accounts").select("*").eq("user_id", uid).eq("is_active", true),
      supabase.from("transactions").select("*").eq("user_id", uid).order("transaction_date", { ascending: false }).limit(100),
      supabase.from("goals").select("*").eq("user_id", uid).eq("status", "active"),
      supabase.from("debts").select("*").eq("user_id", uid).eq("status", "active"),
    ]);

    setAccounts(accRes.data || []);
    setTransactions(txnRes.data || []);
    setGoals(goalRes.data || []);
    setDebts(debtRes.data || []);
    setLoading(false);
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0
  }).format(n);

  const totalBalance = accounts.reduce((s, a) => s + Number(a.current_balance), 0);
  const totalDebt = debts.reduce((s, d) => s + Number(d.current_balance), 0);

  const thisMonth = transactions.filter(t => {
    const d = new Date(t.transaction_date);
    const n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  });

  const monthIncome = thisMonth.filter(t => t.transaction_type === "income").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const monthExpense = thisMonth.filter(t => t.transaction_type === "expense").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const savingsRate = monthIncome > 0 ? ((monthIncome - monthExpense) / monthIncome) * 100 : 0;

  // Spending by category for pie chart
  const categoryMap: Record<string, number> = {};
  transactions.filter(t => t.transaction_type === "expense").forEach(t => {
    const cat = t.category || "Other";
    categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(Number(t.amount));
  });
  const pieData = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value: Math.round(value) }));

  // Last 6 months bar chart
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = d.toLocaleDateString("en-IN", { month: "short" });
    const year = d.getFullYear();
    const m = d.getMonth();
    const y = d.getFullYear();
    const income = transactions.filter(t => {
      const td = new Date(t.transaction_date);
      return td.getMonth() === m && td.getFullYear() === y && t.transaction_type === "income";
    }).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const expense = transactions.filter(t => {
      const td = new Date(t.transaction_date);
      return td.getMonth() === m && td.getFullYear() === y && t.transaction_type === "expense";
    }).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    return { month, income: Math.round(income), expense: Math.round(expense) };
  });

  const healthScore = (() => {
    let s = 500;
    if (totalBalance > 0) s += Math.min(100, totalBalance / 1000);
    if (totalDebt === 0) s += 100;
    else if (totalDebt < monthIncome * 6) s += 50;
    else s -= 50;
    if (savingsRate >= 30) s += 150;
    else if (savingsRate >= 20) s += 100;
    else if (savingsRate >= 10) s += 50;
    else if (savingsRate < 0) s -= 100;
    return Math.max(0, Math.min(1000, Math.round(s)));
  })();

  const scoreColor = healthScore >= 800 ? "#22c55e" : healthScore >= 600 ? "#3b82f6" : healthScore >= 400 ? "#f59e0b" : "#ef4444";
  const scoreLabel = healthScore >= 800 ? "Excellent 🎉" : healthScore >= 600 ? "Good 💪" : healthScore >= 400 ? "Fair 📈" : "Needs Work 🤝";

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
        <p style={{ color: "#9CA3AF", fontSize: "14px" }}>Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <p style={{ fontSize: "13px", color: "#9CA3AF", margin: "0 0 4px 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#0C0D10", margin: 0 }}>
            {greeting()}, {user?.user_metadata?.full_name?.split(" ")[0] || "there"} 👋
          </h1>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "600",
          background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0"
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
          AI Active
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>

        {/* Health Score */}
        <div style={{ background: "#0C0D10", borderRadius: "16px", padding: "24px" }}>
          <p style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", margin: "0 0 12px 0" }}>Health Score</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "42px", fontWeight: "700", color: "#fff", lineHeight: 1 }}>{healthScore}</span>
            <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>/1000</span>
          </div>
          <p style={{ fontSize: "13px", margin: 0, color: scoreColor, fontWeight: "600" }}>{scoreLabel}</p>
          {/* Mini progress bar */}
          <div style={{ marginTop: "12px", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px" }}>
            <div style={{ height: "100%", width: `${healthScore / 10}%`, background: scoreColor, borderRadius: "2px", transition: "width 1s ease" }} />
          </div>
        </div>

        {/* Net Worth */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "24px" }}>
          <p style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em", color: "#9CA3AF", margin: "0 0 12px 0" }}>Net Worth</p>
          <p style={{ fontSize: "28px", fontWeight: "700", color: "#0C0D10", margin: "0 0 4px 0" }}>{fmt(totalBalance - totalDebt)}</p>
          <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>
            Assets {fmt(totalBalance)} · Debt {fmt(totalDebt)}
          </p>
        </div>

        {/* This Month */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "24px" }}>
          <p style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em", color: "#9CA3AF", margin: "0 0 12px 0" }}>This Month</p>
          <div style={{ display: "flex", gap: "16px", marginBottom: "8px" }}>
            <div>
              <p style={{ fontSize: "11px", color: "#22C55E", margin: "0 0 2px 0" }}>Income</p>
              <p style={{ fontSize: "18px", fontWeight: "700", color: "#0C0D10", margin: 0 }}>{fmt(monthIncome)}</p>
            </div>
            <div style={{ width: "1px", background: "#E5E7EB" }} />
            <div>
              <p style={{ fontSize: "11px", color: "#EF4444", margin: "0 0 2px 0" }}>Spent</p>
              <p style={{ fontSize: "18px", fontWeight: "700", color: "#0C0D10", margin: 0 }}>{fmt(monthExpense)}</p>
            </div>
          </div>
          <p style={{ fontSize: "12px", color: savingsRate >= 20 ? "#22C55E" : "#F59E0B", margin: 0, fontWeight: "600" }}>
            Savings rate: {savingsRate.toFixed(0)}%
          </p>
        </div>

        {/* Goals Progress */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "24px" }}>
          <p style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em", color: "#9CA3AF", margin: "0 0 12px 0" }}>Goals</p>
          <p style={{ fontSize: "28px", fontWeight: "700", color: "#0C0D10", margin: "0 0 4px 0" }}>{goals.length}</p>
          <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "0 0 12px 0" }}>Active goals</p>
          {goals.slice(0, 2).map((g, i) => {
            const pct = Math.min(100, (Number(g.current_amount) / Number(g.target_amount)) * 100);
            return (
              <div key={i} style={{ marginBottom: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                  <span style={{ fontSize: "11px", color: "#6B7280" }}>{g.emoji} {g.name}</span>
                  <span style={{ fontSize: "11px", color: "#6B7280" }}>{pct.toFixed(0)}%</span>
                </div>
                <div style={{ height: "4px", background: "#F3F4F6", borderRadius: "2px" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "#22C55E", borderRadius: "2px" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>

        {/* Spending by Category - Pie Chart */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "24px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#0C0D10", margin: "0 0 20px 0" }}>
            💰 Spending by Category
          </h2>
          {pieData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9CA3AF", fontSize: "13px" }}>
              <p style={{ fontSize: "32px", margin: "0 0 8px 0" }}>📊</p>
              Add transactions to see your spending chart
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                {pieData.slice(0, 5).map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: "11px", color: "#6B7280" }}>{item.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Income vs Expense - Bar Chart */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "24px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#0C0D10", margin: "0 0 20px 0" }}>
            📈 Income vs Expenses
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last6Months} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `₹${(v/1000).toFixed(0)}k` : "0"} />
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="income" name="Income" fill="#22C55E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions + Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "16px", marginBottom: "24px" }}>

        {/* Recent Transactions */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#0C0D10", margin: 0 }}>💳 Recent Transactions</h2>
            <Link href="/dashboard/transactions" style={{ fontSize: "12px", fontWeight: "600", color: "#3B82F6" }}>View all →</Link>
          </div>
          {transactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <p style={{ fontSize: "28px", margin: "0 0 8px 0" }}>💳</p>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 12px 0" }}>No transactions yet</p>
              <Link href="/dashboard/transactions" style={{ fontSize: "12px", fontWeight: "600", padding: "8px 16px", borderRadius: "8px", background: "#0C0D10", color: "#fff" }}>
                Add first transaction
              </Link>
            </div>
          ) : (
            <div>
              {transactions.slice(0, 8).map((txn, i) => (
                <div key={txn.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: i < Math.min(transactions.length, 8) - 1 ? "1px solid #F9FAFB" : "none"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: txn.transaction_type === "income" ? "#F0FDF4" : "#F9FAFB",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0
                    }}>
                      {txn.transaction_type === "income" ? "💵" : txn.category === "Food & Dining" ? "🍽️" : txn.category === "Transportation" ? "🚗" : txn.category === "Shopping" ? "🛍️" : "💳"}
                    </div>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: "500", color: "#0C0D10", margin: "0 0 2px 0" }}>
                        {txn.merchant_name || txn.description || txn.category || "Transaction"}
                      </p>
                      <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
                        {new Date(txn.transaction_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        {txn.category && ` · ${txn.category}`}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: "14px", fontWeight: "700", margin: 0, color: txn.transaction_type === "income" ? "#22C55E" : "#0C0D10" }}>
                    {txn.transaction_type === "income" ? "+" : "-"}{fmt(Math.abs(Number(txn.amount)))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#0C0D10", margin: "0 0 4px 0" }}>⚡ Quick Actions</h2>
          {[
            { href: "/dashboard/transactions", icon: "💳", label: "Add Transaction", color: "#EFF6FF" },
            { href: "/dashboard/goals", icon: "🎯", label: "Add to Goal", color: "#F0FDF4" },
            { href: "/dashboard/debts", icon: "💸", label: "Track Debt", color: "#FEF2F2" },
            { href: "/dashboard/chat", icon: "🧠", label: "Ask AI Advisor", color: "#F5F3FF" },
          ].map((action, i) => (
            <Link key={i} href={action.href} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "14px 16px", borderRadius: "12px",
              background: "#fff", border: "1px solid #E5E7EB",
              textDecoration: "none", transition: "all 0.15s"
            }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: action.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                {action.icon}
              </div>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#0C0D10" }}>{action.label}</span>
            </Link>
          ))}

          {/* Debt Summary */}
          {debts.length > 0 && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px", padding: "16px", marginTop: "4px" }}>
              <p style={{ fontSize: "11px", fontWeight: "600", color: "#991B1B", margin: "0 0 4px 0" }}>💸 Total Debt</p>
              <p style={{ fontSize: "20px", fontWeight: "700", color: "#DC2626", margin: "0 0 4px 0" }}>{fmt(totalDebt)}</p>
              <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>{debts.length} active loan{debts.length > 1 ? "s" : ""}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}