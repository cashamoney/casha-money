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

function fmt(n: number) {
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

function MetricCard({
  label,
  value,
  sub,
  dark = false,
  accentColor = "#22C55E",
}: {
  label: string;
  value: string;
  sub?: string;
  dark?: boolean;
  accentColor?: string;
}) {
  return (
    <div
      style={{
        background: dark ? "#0A0A0A" : "var(--card)",
        border: dark ? "none" : "1px solid var(--border)",
        borderRadius: "16px",
        padding: "20px 22px",
        boxShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: dark ? "rgba(255,255,255,0.36)" : "var(--faint)",
          margin: "0 0 10px 0",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "28px",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: dark ? accentColor : "var(--text)",
          margin: "0 0 4px 0",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          style={{
            fontSize: "12px",
            color: dark ? "rgba(255,255,255,0.32)" : "var(--muted)",
            margin: 0,
            lineHeight: "1.5",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

const CATEGORY_COLORS = [
  "#22C55E",
  "#16A34A",
  "#4ADE80",
  "#86EFAC",
  "#15803D",
  "#14532D",
];

export default function OverviewPage() {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    setUser(authData.user);
    const uid = authData.user.id;

    const [accountsRes, txnRes, goalsRes, debtsRes] = await Promise.all([
      supabase.from("accounts").select("*").eq("user_id", uid).eq("is_active", true),
      supabase.from("transactions").select("*").eq("user_id", uid).order("transaction_date", { ascending: false }).limit(120),
      supabase.from("goals").select("*").eq("user_id", uid).eq("status", "active"),
      supabase.from("debts").select("*").eq("user_id", uid).eq("status", "active"),
    ]);

    setAccounts(accountsRes.data || []);
    setTransactions(txnRes.data || []);
    setGoals(goalsRes.data || []);
    setDebts(debtsRes.data || []);
    setLoading(false);
  };

  const totalBalance = accounts.reduce((s, a) => s + Number(a.current_balance || 0), 0);
  const totalDebt = debts.reduce((s, d) => s + Number(d.current_balance || 0), 0);
  const netWorth = totalBalance - totalDebt;

  const now = new Date();
  const thisMonthTxns = transactions.filter((t) => {
    const d = new Date(t.transaction_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthIncome = thisMonthTxns
    .filter((t) => t.transaction_type === "income")
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  const monthExpense = thisMonthTxns
    .filter((t) => t.transaction_type === "expense")
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  const savingsRate =
    monthIncome > 0 ? Math.round(((monthIncome - monthExpense) / monthIncome) * 100) : 0;

  const totalGoalTarget = goals.reduce((s, g) => s + Number(g.target_amount || 0), 0);
  const totalGoalSaved = goals.reduce((s, g) => s + Number(g.current_amount || 0), 0);

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

  const scoreLabel =
    healthScore >= 800
      ? "Excellent"
      : healthScore >= 600
      ? "Good"
      : healthScore >= 400
      ? "Fair"
      : "Needs work";

  const scoreColor =
    healthScore >= 800
      ? "#22C55E"
      : healthScore >= 600
      ? "#16A34A"
      : healthScore >= 400
      ? "#4ADE80"
      : "#EF4444";

  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonthTxns
      .filter((t) => t.transaction_type === "expense")
      .forEach((t) => {
        const cat = t.category || "Other";
        map[cat] = (map[cat] || 0) + Math.abs(Number(t.amount));
      });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [thisMonthTxns]);

  const monthSeries = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const m = d.getMonth();
      const y = d.getFullYear();
      const label = d.toLocaleDateString("en-IN", { month: "short" });

      const income = transactions
        .filter((t) => {
          const td = new Date(t.transaction_date);
          return td.getMonth() === m && td.getFullYear() === y && t.transaction_type === "income";
        })
        .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

      const expense = transactions
        .filter((t) => {
          const td = new Date(t.transaction_date);
          return td.getMonth() === m && td.getFullYear() === y && t.transaction_type === "expense";
        })
        .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

      return { label, income, expense };
    });
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 8);

  const quickActions = [
    { label: "Add transaction", path: "/dashboard/transactions" },
    { label: "Set a savings goal", path: "/dashboard/goals" },
    { label: "Ask AI advisor", path: "/dashboard/chat" },
    { label: "Parse bank SMS", path: "/dashboard/sms" },
  ];

  const txIcon = (type: string, category: string) => {
    if (type === "income") {
      return (
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "#F0FDF4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" fill="none" stroke="#16A34A" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0-5 5m5-5 5 5" />
          </svg>
        </div>
      );
    }

    if (category === "Food Delivery" || category === "Food & Dining") {
      return (
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "#FFF7ED",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" fill="none" stroke="#F97316" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l.5 2M7 13h10l4-8H5.5M7 13L5.5 6M7 13l-2 3h13" />
          </svg>
        </div>
      );
    }

    return (
      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "10px",
          background: "#F5F5F7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="16" height="16" fill="none" stroke="#6B7280" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        style={{
          height: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "999px",
              border: "3px solid var(--border)",
              borderTopColor: "#22C55E",
              margin: "0 auto 12px",
              animation: "dashspin 0.8s linear infinite",
            }}
          />
          <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <p style={{ fontSize: "13px", color: "var(--faint)", margin: "0 0 4px 0" }}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "var(--text)",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            {getGreeting()},{" "}
            {user?.user_metadata?.full_name?.split(" ")[0] ||
              user?.email?.split("@")[0] ||
              "there"}
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: "999px",
            padding: "6px 14px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#22C55E",
            }}
          />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#166534" }}>
            AI Active
          </span>
        </div>
      </div>

      {/* Top KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <MetricCard
          label="Health Score"
          value={`${healthScore}/1000`}
          sub={scoreLabel}
          dark
          accentColor={scoreColor}
        />
        <MetricCard
          label="Net Worth"
          value={fmt(netWorth)}
          sub={`Assets ${fmt(totalBalance)} · Debt ${fmt(totalDebt)}`}
        />
        <MetricCard
          label="This Month — Income"
          value={fmt(monthIncome)}
          sub={`Savings rate: ${savingsRate}%`}
          subColor={savingsRate >= 20 ? "#16A34A" : "#F59E0B"}
        />
        <MetricCard
          label="This Month — Spent"
          value={fmt(monthExpense)}
          sub={
            monthExpense > monthIncome
              ? "Over budget"
              : `${fmt(monthIncome - monthExpense)} remaining`
          }
          subColor={monthExpense > monthIncome ? "#EF4444" : "#16A34A"}
        />
      </div>

      {/* Charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            background: "var(--card)",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            padding: "20px 22px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--text)",
                margin: "0 0 2px 0",
              }}
            >
              Income vs Expenses
            </h3>
            <p style={{ fontSize: "12px", color: "var(--faint)", margin: 0 }}>
              Last 6 months
            </p>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthSeries}>
              <defs>
                <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#A1A1AA" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#A1A1AA" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
              <Tooltip
                formatter={(v: any) => [fmt(v)]}
                contentStyle={{
                  background: "#0A0A0A",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: "#FFFFFF",
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#22C55E"
                fill="url(#incomeFill)"
                strokeWidth={2.2}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#94A3B8"
                fill="url(#expenseFill)"
                strokeWidth={2.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            background: "var(--card)",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            padding: "20px 22px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--text)",
                margin: "0 0 2px 0",
              }}
            >
              Spending Breakdown
            </h3>
            <p style={{ fontSize: "12px", color: "var(--faint)", margin: 0 }}>
              This month
            </p>
          </div>

          {pieData.length === 0 ? (
            <div
              style={{
                height: "180px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p style={{ color: "var(--faint)", fontSize: "13px", margin: 0 }}>
                No expense data yet
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={34}
                    outerRadius={58}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {pieData.slice(0, 5).map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "2px",
                          background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6B7280",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--text)",
                        flexShrink: 0,
                      }}
                    >
                      {fmt(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom area */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "14px",
        }}
      >
        {/* Recent transactions */}
        <div
          style={{
            background: "var(--card)",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            padding: "20px 22px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", margin: "0 0 2px 0" }}>
                Recent Transactions
              </h3>
              <p style={{ fontSize: "12px", color: "var(--faint)", margin: 0 }}>
                {recentTransactions.length} latest entries
              </p>
            </div>
            <Link href="/dashboard/transactions" style={{ fontSize: "12px", fontWeight: 600, color: "#22C55E", textDecoration: "none" }}>
              View all →
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <p style={{ color: "var(--faint)", fontSize: "13px", margin: "0 0 12px 0" }}>
                No transactions yet
              </p>
              <Link href="/dashboard/transactions" style={{ fontSize: "13px", fontWeight: 600, color: "#22C55E", textDecoration: "none" }}>
                Add your first transaction →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {recentTransactions.map((txn, i) => (
                <div
                  key={txn.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 0",
                    borderBottom:
                      i < recentTransactions.length - 1
                        ? "1px solid #F5F5F7"
                        : "none",
                  }}
                >
                  {txIcon(txn.transaction_type, txn.category)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--text)",
                        margin: "0 0 2px 0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {txn.merchant_name || txn.category || "Transaction"}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--faint)",
                        margin: 0,
                      }}
                    >
                      {new Date(txn.transaction_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                      {txn.category && ` · ${txn.category}`}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color:
                        txn.transaction_type === "income"
                          ? "#16A34A"
                          : "var(--text)",
                      flexShrink: 0,
                    }}
                  >
                    {txn.transaction_type === "income" ? "+" : "-"}
                    {fmt(Math.abs(Number(txn.amount)))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Quick actions */}
          <div
            style={{
              background: "var(--card)",
              borderRadius: "16px",
              border: "1px solid var(--border)",
              padding: "18px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <h3
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text)",
                margin: "0 0 12px 0",
              }}
            >
              Quick Actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {quickActions.map((a, i) => (
                <Link
                  key={i}
                  href={a.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    background: "#F5F5F7",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                    {a.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Goals */}
          {goals.length > 0 && (
            <div
              style={{
                background: "var(--card)",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                padding: "18px 20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <h3
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--text)",
                    margin: 0,
                  }}
                >
                  Active Goals
                </h3>
                <Link
                  href="/dashboard/goals"
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#22C55E",
                    textDecoration: "none",
                  }}
                >
                  View all
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {goals.slice(0, 2).map((g, i) => {
                  const pct = Math.min(
                    100,
                    (Number(g.current_amount) / Number(g.target_amount)) * 100
                  );
                  return (
                    <div key={i}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "5px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#374151",
                          }}
                        >
                          {g.name}
                        </span>
                        <span style={{ fontSize: "11px", color: "#A1A1AA" }}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: "6px",
                          borderRadius: "999px",
                          background: "#F5F5F7",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            borderRadius: "999px",
                            background: pct >= 100 ? "#22C55E" : "#3B82F6",
                            transition: "width 0.8s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Debt */}
          {totalDebt > 0 && (
            <div
              style={{
                background: "#FEF2F2",
                borderRadius: "16px",
                border: "1px solid #FECACA",
                padding: "18px 20px",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#9F1239",
                  margin: "0 0 6px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                Total Debt
              </p>
              <p
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#DC2626",
                  margin: "0 0 4px 0",
                  letterSpacing: "-0.02em",
                }}
              >
                {fmt(totalDebt)}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#F87171",
                  margin: 0,
                }}
              >
                {debts.length} active loan{debts.length > 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dashspin {
          to { transform: rotate(360deg); }
        }

        @media (min-width: 1024px) {
          .dashboard-sidebar {
            transform: translateX(0) !important;
          }
        }

        @media (max-width: 1023px) {
          main {
            margin-left: 0 !important;
          }

          .dashboard-sidebar {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}