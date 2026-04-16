"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

export default function OverviewPage() {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    setUser(authData.user);
    const uid = authData.user.id;

    const [accountsRes, txnRes, goalsRes, debtsRes, insightsRes] =
      await Promise.all([
        supabase.from("accounts").select("*").eq("user_id", uid).eq("is_active", true),
        supabase.from("transactions").select("*").eq("user_id", uid).order("transaction_date", { ascending: false }).limit(10),
        supabase.from("goals").select("*").eq("user_id", uid).eq("status", "active"),
        supabase.from("debts").select("*").eq("user_id", uid).eq("status", "active"),
        supabase.from("insights").select("*").eq("user_id", uid).eq("is_read", false).order("created_at", { ascending: false }).limit(5),
      ]);

    setAccounts(accountsRes.data || []);
    setTransactions(txnRes.data || []);
    setGoals(goalsRes.data || []);
    setDebts(debtsRes.data || []);
    setInsights(insightsRes.data || []);
    setLoading(false);
  };

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.current_balance), 0);
  const totalDebt = debts.reduce((sum, d) => sum + Number(d.current_balance), 0);
  const totalGoalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);
  const totalGoalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);

  const thisMonthTxns = transactions.filter((t) => {
    const d = new Date(t.transaction_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthIncome = thisMonthTxns
    .filter((t) => t.transaction_type === "income")
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  const monthExpense = thisMonthTxns
    .filter((t) => t.transaction_type === "expense")
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  const savingsRate = monthIncome > 0 ? ((monthIncome - monthExpense) / monthIncome) * 100 : 0;

  const healthScore = calculateHealthScore(totalBalance, totalDebt, savingsRate, monthIncome, monthExpense);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: "#9CA3AF" }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="text-2xl font-bold mt-1" style={{ color: "#0C0D10" }}>
            Good {getGreeting()},{" "}
            {user?.user_metadata?.full_name?.split(" ")[0] || "there"}
          </h1>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          AI Active
        </div>
      </div>

      {/* Health Score + Net Worth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Health Score */}
        <div className="rounded-2xl p-6" style={{ background: "#0C0D10" }}>
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            Financial Health Score
          </p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-bold text-white">{healthScore}</span>
            <span className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>/ 1000</span>
          </div>
          <p className="text-xs mt-2" style={{ color: getScoreColor(healthScore) }}>
            {getScoreLabel(healthScore)}
          </p>
        </div>

        {/* Net Worth */}
        <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#9CA3AF" }}>
            Net Worth
          </p>
          <p className="text-3xl font-bold" style={{ color: "#0C0D10" }}>
            {formatMoney(totalBalance - totalDebt)}
          </p>
          <p className="text-xs mt-2" style={{ color: "#6B7280" }}>
            Assets: {formatMoney(totalBalance)} · Debt: {formatMoney(totalDebt)}
          </p>
        </div>

        {/* This Month */}
        <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#9CA3AF" }}>
            This Month
          </p>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs" style={{ color: "#22C55E" }}>Income</p>
              <p className="text-lg font-bold" style={{ color: "#0C0D10" }}>{formatMoney(monthIncome)}</p>
            </div>
            <div className="w-px h-8" style={{ background: "#E5E7EB" }} />
            <div>
              <p className="text-xs" style={{ color: "#EF4444" }}>Spent</p>
              <p className="text-lg font-bold" style={{ color: "#0C0D10" }}>{formatMoney(monthExpense)}</p>
            </div>
          </div>
          <p className="text-xs mt-2" style={{ color: savingsRate >= 20 ? "#22C55E" : "#F59E0B" }}>
            Savings rate: {savingsRate.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Accounts" value={accounts.length.toString()} sub="Connected" icon="🏦" />
        <StatCard title="Transactions" value={transactions.length.toString()} sub="Recent" icon="💳" />
        <StatCard
          title="Goals"
          value={goals.length.toString()}
          sub={totalGoalTarget > 0 ? `${((totalGoalSaved / totalGoalTarget) * 100).toFixed(0)}% saved` : "Set your first goal"}
          icon="🎯"
        />
        <StatCard
          title="Debts"
          value={debts.length > 0 ? formatMoney(totalDebt) : "None"}
          sub={debts.length > 0 ? `${debts.length} active` : "Debt free! 🎉"}
          icon="💸"
        />
      </div>

      {/* Insights + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* AI Insights */}
        <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ color: "#0C0D10" }}>🧠 AI Insights</h2>
            <span className="text-xs" style={{ color: "#9CA3AF" }}>{insights.length} new</span>
          </div>
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-3">🧠</p>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                Add transactions and I'll find savings opportunities for you!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="rounded-xl p-4"
                  style={{
                    background: insight.severity === "critical" ? "#FEF2F2" : insight.severity === "celebration" ? "#F0FDF4" : "#F9FAFB",
                    border: `1px solid ${insight.severity === "critical" ? "#FECACA" : insight.severity === "celebration" ? "#BBF7D0" : "#E5E7EB"}`,
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: "#0C0D10" }}>{insight.title}</p>
                  <p className="text-xs mt-1" style={{ color: "#6B7280" }}>{insight.description}</p>
                  {insight.impact_amount && (
                    <p className="text-xs font-semibold mt-2" style={{ color: "#22C55E" }}>
                      Potential savings: {formatMoney(insight.impact_amount)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold" style={{ color: "#0C0D10" }}>💳 Recent Transactions</h2>
            <Link href="/dashboard/transactions" className="text-xs font-semibold" style={{ color: "#3B82F6" }}>
              View all →
            </Link>
          </div>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-3">💳</p>
              <p className="text-sm mb-3" style={{ color: "#6B7280" }}>
                No transactions yet
              </p>
              <Link
                href="/dashboard/transactions"
                className="inline-block text-xs font-semibold px-4 py-2 rounded-lg"
                style={{ background: "#0C0D10", color: "#FFFFFF" }}
              >
                Add your first transaction
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 7).map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                  style={{ background: "#F9FAFB" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#0C0D10" }}>
                      {txn.merchant_name || txn.description || txn.category || "Transaction"}
                    </p>
                    <p className="text-xs" style={{ color: "#9CA3AF" }}>
                      {new Date(txn.transaction_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      {txn.category && ` · ${txn.category}`}
                    </p>
                  </div>
                  <p
                    className="text-sm font-semibold ml-3"
                    style={{
                      color: txn.transaction_type === "income" ? "#22C55E" : "#0C0D10",
                    }}
                  >
                    {txn.transaction_type === "income" ? "+" : "-"}
                    {formatMoney(Math.abs(Number(txn.amount)))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
        <h2 className="text-sm font-bold mb-4" style={{ color: "#0C0D10" }}>⚡ Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction href="/dashboard/transactions" icon="💳" label="Add Transaction" />
          <QuickAction href="/dashboard/goals" icon="🎯" label="Set a Goal" />
          <QuickAction href="/dashboard/debts" icon="💸" label="Track Debt" />
          <QuickAction href="/dashboard/chat" icon="🧠" label="Ask AI Advisor" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, icon }: { title: string; value: string; sub: string; icon: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#9CA3AF" }}>{title}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-xl font-bold" style={{ color: "#0C0D10" }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: "#6B7280" }}>{sub}</p>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:shadow-sm"
      style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium" style={{ color: "#0C0D10" }}>{label}</span>
    </Link>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function calculateHealthScore(balance: number, debt: number, savingsRate: number, income: number, expense: number): number {
  let score = 500;

  if (balance > 0) score += Math.min(100, balance / 1000);
  if (debt === 0) score += 100;
  else if (debt < income * 6) score += 50;
  else score -= 50;

  if (savingsRate >= 30) score += 150;
  else if (savingsRate >= 20) score += 100;
  else if (savingsRate >= 10) score += 50;
  else if (savingsRate < 0) score -= 100;

  if (income > expense) score += 50;

  return Math.max(0, Math.min(1000, Math.round(score)));
}

function getScoreColor(score: number): string {
  if (score >= 800) return "#22C55E";
  if (score >= 600) return "#3B82F6";
  if (score >= 400) return "#F59E0B";
  return "#EF4444";
}

function getScoreLabel(score: number): string {
  if (score >= 800) return "Excellent — You're doing amazing! 🎉";
  if (score >= 600) return "Good — Keep building momentum 💪";
  if (score >= 400) return "Fair — Room for improvement 📈";
  return "Needs attention — Let's fix this together 🤝";
}