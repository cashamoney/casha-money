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
  }).format(n || 0);
}

function formatCompact(n: number) {
  if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (Math.abs(n) >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${Math.round(n)}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num));
}

function getHealthMeta(score: number) {
  if (score >= 850) return { label: "Elite", color: "#22C55E" };
  if (score >= 700) return { label: "Strong", color: "#3B82F6" };
  if (score >= 500) return { label: "Stable", color: "#06B6D4" };
  if (score >= 300) return { label: "Fragile", color: "#F59E0B" };
  return { label: "Critical", color: "#EF4444" };
}

function scoreBarColor(score: number) {
  if (score >= 850) return "#22C55E";
  if (score >= 700) return "#3B82F6";
  if (score >= 500) return "#06B6D4";
  if (score >= 300) return "#F59E0B";
  return "#EF4444";
}

function StatCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "positive" | "warning";
}) {
  const subColor =
    tone === "positive"
      ? "#16A34A"
      : tone === "warning"
      ? "#D97706"
      : "var(--muted)";

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "18px",
        padding: "20px 22px",
        boxShadow: "var(--shadow)",
      }}
    >
      <p
        style={{
          margin: "0 0 10px 0",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--faint)",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "0 0 4px 0",
          fontSize: "28px",
          fontWeight: 800,
          color: "var(--text)",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: subColor,
            lineHeight: "1.5",
            fontWeight: tone === "default" ? 500 : 600,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "18px",
        padding: "20px 22px",
        boxShadow: "var(--shadow)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div>
          <h3
            style={{
              margin: "0 0 4px 0",
              fontSize: "15px",
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                color: "var(--faint)",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function ProgressMini({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "6px",
        }}
      >
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.72)" }}>
          {label}
        </span>
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>
          {Math.round(value)}%
        </span>
      </div>
      <div
        style={{
          height: "6px",
          borderRadius: "999px",
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${clamp(value, 0, 100)}%`,
            height: "100%",
            borderRadius: "999px",
            background: color,
          }}
        />
      </div>
    </div>
  );
}

function txIcon(type: string, category: string) {
  if (type === "income") {
    return (
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: "rgba(34,197,94,0.10)",
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
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: "rgba(249,115,22,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="16" height="16" fill="none" stroke="#F97316" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l.5 2M7 13h10l4-8H5.5M7 13l-1.5 3h13" />
        </svg>
      </div>
    );
  }

  if (category === "EMI Payment") {
    return (
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: "rgba(239,68,68,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="16" height="16" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-3-3h6" />
        </svg>
      </div>
    );
  }

  if (category === "Shopping") {
    return (
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: "rgba(236,72,153,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="16" height="16" fill="none" stroke="#EC4899" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7l1.5 11h9L18 7H6zm2-3h8l1 3H7l1-3z" />
        </svg>
      </div>
    );
  }

  if (category === "Streaming/OTT" || category === "Subscription") {
    return (
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: "rgba(139,92,246,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="16" height="16" fill="none" stroke="#8B5CF6" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 9.5l5 2.5-5 2.5v-5z" />
        </svg>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "12px",
        background: "var(--panel-alt)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="16" height="16" fill="none" stroke="var(--muted)" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    </div>
  );
}

const CHART_COLORS = ["#22C55E", "#16A34A", "#4ADE80", "#86EFAC", "#15803D", "#A7F3D0"];

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
      supabase.from("transactions").select("*").eq("user_id", uid).order("transaction_date", { ascending: false }).limit(180),
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
    .reduce((s, t) => s + Math.abs(Number(t.amount || 0)), 0);

  const monthExpense = thisMonthTxns
    .filter((t) => t.transaction_type === "expense")
    .reduce((s, t) => s + Math.abs(Number(t.amount || 0)), 0);

  const savingsRate =
    monthIncome > 0 ? ((monthIncome - monthExpense) / monthIncome) * 100 : 0;

  const goalTarget = goals.reduce((s, g) => s + Number(g.target_amount || 0), 0);
  const goalSaved = goals.reduce((s, g) => s + Number(g.current_amount || 0), 0);
  const goalProgress = goalTarget > 0 ? (goalSaved / goalTarget) * 100 : 0;

  const cashBufferMonths =
    monthExpense > 0 ? totalBalance / monthExpense : totalBalance > 0 ? 12 : 0;
  const debtLoadMonths =
    monthIncome > 0 ? totalDebt / monthIncome : totalDebt > 0 ? 24 : 0;

  const cashScore = clamp((cashBufferMonths / 6) * 100, 0, 100);
  const debtScore = totalDebt === 0 ? 100 : clamp(100 - (debtLoadMonths / 12) * 100, 0, 100);
  const savingsScore = savingsRate >= 0 ? clamp((savingsRate / 30) * 100, 0, 100) : 0;
  const goalsScore = clamp(goalProgress, 0, 100);

  const healthScore = Math.round(
    clamp(
      cashScore * 0.28 +
        debtScore * 0.28 +
        savingsScore * 0.32 +
        goalsScore * 0.12,
      0,
      100
    ) * 10
  );

  const meta = getHealthMeta(healthScore);

  const recentTransactions = transactions.slice(0, 8);

  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonthTxns
      .filter((t) => t.transaction_type === "expense")
      .forEach((t) => {
        const key = t.category || "Other";
        map[key] = (map[key] || 0) + Math.abs(Number(t.amount || 0));
      });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [thisMonthTxns]);

  const monthlySeries = useMemo(() => {
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
        .reduce((s, t) => s + Math.abs(Number(t.amount || 0)), 0);

      const expense = transactions
        .filter((t) => {
          const td = new Date(t.transaction_date);
          return td.getMonth() === m && td.getFullYear() === y && t.transaction_type === "expense";
        })
        .reduce((s, t) => s + Math.abs(Number(t.amount || 0)), 0);

      return {
        label,
        income,
        expense,
        net: income - expense,
      };
    });
  }, [transactions]);

  const quickActions = [
    { label: "Add transaction", path: "/dashboard/transactions" },
    { label: "Set a savings goal", path: "/dashboard/goals" },
    { label: "Ask AI advisor", path: "/dashboard/chat" },
    { label: "Parse bank SMS", path: "/dashboard/sms" },
  ];

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
          <p style={{ color: "var(--muted)", fontSize: "13px", margin: 0 }}>
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
          gap: "14px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "var(--faint)" }}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.03em",
            }}
          >
            {getGreeting()}, {user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there"}
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "var(--green-soft)",
            border: "1px solid var(--green-border)",
            borderRadius: "999px",
            padding: "7px 14px",
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
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--green-text)" }}>
            AI Active
          </span>
        </div>
      </div>

      {/* Top layout */}
      <div
        className="overview-top-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.35fr 1fr 1fr",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* Premium Health Score */}
        <div
          style={{
            background: "#0A0A0A",
            borderRadius: "22px",
            padding: "24px",
            color: "#FFFFFF",
            boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 10px 0",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.38)",
              }}
            >
              Financial Health Score
            </p>

            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "10px" }}>
              <span
                style={{
                  fontSize: "44px",
                  fontWeight: 800,
                  color: meta.color,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                }}
              >
                {healthScore}
              </span>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.28)" }}>/1000</span>
            </div>

            <p
              style={{
                margin: "0 0 18px 0",
                fontSize: "13px",
                color: "rgba(255,255,255,0.62)",
                lineHeight: "1.6",
              }}
            >
              A blended score of your cash buffer, debt load, savings consistency, and goal progress.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <ProgressMini label="Cash buffer" value={cashScore} color="#22C55E" />
              <ProgressMini label="Debt load" value={debtScore} color="#3B82F6" />
              <ProgressMini label="Savings" value={savingsScore} color="#06B6D4" />
              <ProgressMini label="Goals" value={goalsScore} color="#8B5CF6" />
            </div>
          </div>

          {/* Ring */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                background: `conic-gradient(${scoreBarColor(healthScore)} 0deg ${(healthScore / 1000) * 360}deg, rgba(255,255,255,0.08) ${(healthScore / 1000) * 360}deg 360deg)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "112px",
                  height: "112px",
                  borderRadius: "50%",
                  background: "#0A0A0A",
                  border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <p style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                  {meta.label}
                </p>
                <p style={{ margin: "6px 0 0 0", fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
                  score status
                </p>
              </div>
            </div>
          </div>
        </div>

        <StatCard
          label="Net Worth"
          value={formatMoney(netWorth)}
          sub={`Assets ${formatMoney(totalBalance)} · Debt ${formatMoney(totalDebt)}`}
        />

        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: "16px" }}>
          <StatCard
            label="Monthly Income"
            value={formatMoney(monthIncome)}
            sub={`${Math.round(savingsRate)}% savings rate`}
            tone="positive"
          />
          <StatCard
            label="Monthly Spent"
            value={formatMoney(monthExpense)}
            sub={monthExpense > monthIncome ? "Over budget" : `${formatMoney(monthIncome - monthExpense)} remaining`}
            tone={monthExpense > monthIncome ? "warning" : "default"}
          />
        </div>
      </div>

      {/* Charts */}
      <div
        className="overview-chart-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <SectionCard title="Income vs Expenses" subtitle="Last 6 months">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlySeries}>
              <defs>
                <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCompact(v).replace("₹", "")} />
              <Tooltip
                formatter={(v: any) => [formatMoney(v)]}
                contentStyle={{
                  background: "#0A0A0A",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="income" stroke="#22C55E" strokeWidth={2.2} fill="url(#incomeFill)" />
              <Area type="monotone" dataKey="expense" stroke="#94A3B8" strokeWidth={2.2} fill="url(#expenseFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Spending Breakdown" subtitle="This month">
          {pieData.length === 0 ? (
            <div style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--faint)" }}>
                No expense data yet
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "10px", alignItems: "center" }}>
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={42} outerRadius={72} paddingAngle={3}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any) => [formatMoney(v)]}
                    contentStyle={{
                      background: "#0A0A0A",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {pieData.slice(0, 5).map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "2px",
                          background: CHART_COLORS[i % CHART_COLORS.length],
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--muted)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name}
                      </span>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", flexShrink: 0 }}>
                      {formatMoney(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Bottom section */}
      <div
        className="overview-bottom-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.45fr 0.95fr",
          gap: "16px",
        }}
      >
        {/* Transactions */}
        <SectionCard
          title="Recent Transactions"
          subtitle={`${recentTransactions.length} latest entries`}
          action={
            <Link href="/dashboard/transactions" style={{ fontSize: "12px", fontWeight: 600, color: "#22C55E", textDecoration: "none" }}>
              View all →
            </Link>
          }
        >
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
                    padding: "12px 0",
                    borderBottom: i < recentTransactions.length - 1 ? "1px solid var(--tx-border)" : "none",
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
                    <p style={{ fontSize: "11px", color: "var(--faint)", margin: 0 }}>
                      {new Date(txn.transaction_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                      {txn.category ? ` · ${txn.category}` : ""}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: txn.transaction_type === "income" ? "#16A34A" : "var(--text)",
                      flexShrink: 0,
                    }}
                  >
                    {txn.transaction_type === "income" ? "+" : "-"}
                    {formatMoney(Math.abs(Number(txn.amount || 0)))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Right rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <SectionCard title="Quick Actions">
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {quickActions.map((a, i) => (
                <Link
                  key={i}
                  href={a.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "11px 12px",
                    borderRadius: "10px",
                    background: "var(--panel-alt)",
                    textDecoration: "none",
                    color: "var(--text)",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  <span>{a.label}</span>
                  <span style={{ color: "var(--faint)" }}>→</span>
                </Link>
              ))}
            </div>
          </SectionCard>

          {goals.length > 0 && (
            <SectionCard
              title="Active Goals"
              action={
                <Link href="/dashboard/goals" style={{ fontSize: "11px", fontWeight: 600, color: "#22C55E", textDecoration: "none" }}>
                  View all
                </Link>
              }
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {goals.slice(0, 2).map((g, i) => {
                  const pct = Number(g.target_amount) > 0
                    ? (Number(g.current_amount || 0) / Number(g.target_amount || 1)) * 100
                    : 0;

                  return (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)" }}>{g.name}</span>
                        <span style={{ fontSize: "11px", color: "var(--faint)" }}>{pct.toFixed(0)}%</span>
                      </div>
                      <div
                        style={{
                          height: "7px",
                          borderRadius: "999px",
                          background: "var(--panel-alt)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${clamp(pct, 0, 100)}%`,
                            height: "100%",
                            borderRadius: "999px",
                            background: pct >= 100 ? "#22C55E" : "#3B82F6",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {totalDebt > 0 && (
            <div
              style={{
                background: "var(--red-soft)",
                border: "1px solid var(--red-border)",
                borderRadius: "18px",
                padding: "20px",
                boxShadow: "var(--shadow)",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--red-text)",
                  margin: "0 0 6px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Total Debt
              </p>
              <p
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#DC2626",
                  margin: "0 0 4px 0",
                  letterSpacing: "-0.03em",
                }}
              >
                {formatMoney(totalDebt)}
              </p>
              <p style={{ fontSize: "12px", color: "var(--red-text)", margin: 0 }}>
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

        @media (max-width: 1100px) {
          .overview-top-grid {
            grid-template-columns: 1fr !important;
          }
          .overview-chart-grid {
            grid-template-columns: 1fr !important;
          }
          .overview-bottom-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 720px) {
          .overview-top-grid > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}