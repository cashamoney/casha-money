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
  if (score >= 800) {
    return { label: "Excellent", color: "#22C55E", ring: "#22C55E" };
  }
  if (score >= 650) {
    return { label: "Strong", color: "#2563EB", ring: "#2563EB" };
  }
  if (score >= 450) {
    return { label: "Stable", color: "#64748B", ring: "#64748B" };
  }
  return { label: "Needs attention", color: "#DC2626", ring: "#DC2626" };
}

function MetricCard({
  label,
  value,
  sub,
  accent = false,
  valueColor,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        background: accent ? "#0A0A0A" : "var(--card)",
        color: accent ? "#FFFFFF" : "var(--text)",
        border: accent ? "none" : "1px solid var(--border)",
        borderRadius: "18px",
        padding: "22px 22px",
        boxShadow: accent ? "none" : "var(--shadow)",
      }}
    >
      <p
        style={{
          margin: "0 0 12px 0",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: accent ? "rgba(255,255,255,0.42)" : "var(--faint)",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "0 0 6px 0",
          fontSize: "30px",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          color: valueColor || (accent ? "#FFFFFF" : "var(--text)"),
        }}
      >
        {value}
      </p>
      {sub ? (
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: accent ? "rgba(255,255,255,0.40)" : "var(--muted)",
            lineHeight: "1.5",
          }}
        >
          {sub}
        </p>
      ) : null}
    </div>
  );
}

function SectionCard({
  title,
  sub,
  action,
  children,
}: {
  title: string;
  sub?: string;
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
          marginBottom: "18px",
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
          {sub ? (
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                color: "var(--faint)",
              }}
            >
              {sub}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function ProgressBar({
  value,
  color = "#22C55E",
  bg = "#E5E7EB",
  height = 8,
}: {
  value: number;
  color?: string;
  bg?: string;
  height?: number;
}) {
  return (
    <div
      style={{
        height,
        borderRadius: 999,
        background: bg,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          height: "100%",
          borderRadius: 999,
          background: color,
          transition: "width 0.6s ease",
        }}
      />
    </div>
  );
}

function HealthRing({
  score,
  color,
}: {
  score: number;
  color: string;
}) {
  const pct = Math.max(0, Math.min(100, score / 10));
  const angle = pct * 3.6;
  const bg = `conic-gradient(${color} 0deg ${angle}deg, rgba(255,255,255,0.08) ${angle}deg 360deg)`;

  return (
    <div
      style={{
        width: "98px",
        height: "98px",
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "78px",
          height: "78px",
          borderRadius: "50%",
          background: "#0A0A0A",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: "24px",
            fontWeight: 800,
            color: "#FFFFFF",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontSize: "10px",
            color: "rgba(255,255,255,0.36)",
            marginTop: "3px",
          }}
        >
          /1000
        </span>
      </div>
    </div>
  );
}

function txIcon(type: string, category: string) {
  if (type === "income") {
    return (
      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "11px",
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
          width: "38px",
          height: "38px",
          borderRadius: "11px",
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
          width: "38px",
          height: "38px",
          borderRadius: "11px",
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
          width: "38px",
          height: "38px",
          borderRadius: "11px",
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

  return (
    <div
      style={{
        width: "38px",
        height: "38px",
        borderRadius: "11px",
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
  const thisMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.transaction_date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthIncome = thisMonthTransactions
    .filter((t) => t.transaction_type === "income")
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  const monthExpense = thisMonthTransactions
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

  const scoreMeta = getScoreMeta(healthScore);

  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonthTransactions
      .filter((t) => t.transaction_type === "expense")
      .forEach((t) => {
        const c = t.category || "Other";
        map[c] = (map[c] || 0) + Math.abs(Number(t.amount));
      });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [thisMonthTransactions]);

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

  const name =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "14px",
          marginBottom: "28px",
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
              fontSize: "24px",
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            {getGreeting()}, {name}
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(34,197,94,0.10)",
            border: "1px solid rgba(34,197,94,0.18)",
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
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#16A34A",
            }}
          >
            AI Active
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            background: "#0A0A0A",
            borderRadius: "18px",
            padding: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "14px",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.36)",
                  margin: "0 0 6px 0",
                }}
              >
                Health Score
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "34px",
                  fontWeight: 800,
                  lineHeight: 1,
                  color: scoreMeta.color,
                  letterSpacing: "-0.03em",
                }}
              >
                {healthScore}
                <span
                  style={{
                    fontSize: "15px",
                    color: "rgba(255,255,255,0.25)",
                    marginLeft: "4px",
                    fontWeight: 500,
                  }}
                >
                  /1000
                </span>
              </p>
            </div>

            <div
              style={{
                width: "62px",
                height: "62px",
                borderRadius: "999px",
                border: `5px solid ${scoreMeta.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: scoreMeta.color,
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              {scoreMeta.label}
            </div>
          </div>

          <div
            style={{
              height: "6px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: `${healthScore / 10}%`,
                height: "100%",
                borderRadius: "999px",
                background: scoreMeta.ring,
                transition: "width 0.7s ease",
              }}
            />
          </div>

          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "rgba(255,255,255,0.34)",
            }}
          >
            {scoreMeta.label}
          </p>
        </div>

        <MetricCard
          label="Net Worth"
          value={formatMoney(netWorth)}
          sub={`Assets ${formatMoney(totalBalance)} · Debt ${formatMoney(totalDebt)}`}
        />
        <MetricCard
          label="Monthly Income"
          value={formatMoney(monthIncome)}
          sub={`Savings rate: ${savingsRate}%`}
          subColor={savingsRate >= 20 ? "#16A34A" : "#F59E0B"}
        />
        <MetricCard
          label="Monthly Spent"
          value={formatMoney(monthExpense)}
          sub={
            monthExpense > monthIncome
              ? "Over budget"
              : `${formatMoney(monthIncome - monthExpense)} remaining`
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
        <SectionCard title="Income vs Expenses" sub="Last 6 months">
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={monthlySeries}>
              <defs>
                <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
              <Tooltip
                formatter={(v: any) => [formatMoney(v)]}
                contentStyle={{
                  background: "#0A0A0A",
                  border: "none",
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

        <SectionCard title="Spending Breakdown" sub="This month">
          {pieData.length === 0 ? (
            <div style={{ height: "190px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--faint)" }}>No expense data yet</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "12px", alignItems: "center" }}>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={34} outerRadius={58} paddingAngle={2}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {pieData.slice(0, 5).map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", flexShrink: 0 }}>{formatMoney(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Bottom area */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "14px",
        }}
      >
        <SectionCard
          title="Recent Transactions"
          sub={`${recentTransactions.length} latest entries`}
          action={
            <Link href="/dashboard/transactions" style={{ fontSize: "12px", fontWeight: 600, color: "#22C55E", textDecoration: "none" }}>
              View all →
            </Link>
          }
        >
          {recentTransactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <p style={{ color: "var(--faint)", fontSize: "13px", margin: "0 0 12px 0" }}>No transactions yet</p>
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
                    borderBottom: i < recentTransactions.length - 1 ? "1px solid #F5F5F7" : "none",
                  }}
                >
                  {txIcon(txn.transaction_type, txn.category)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", margin: "0 0 2px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {txn.merchant_name || txn.category || "Transaction"}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--faint)", margin: 0 }}>
                      {new Date(txn.transaction_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      {txn.category ? ` · ${txn.category}` : ""}
                    </p>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: txn.transaction_type === "income" ? "#16A34A" : "var(--text)", flexShrink: 0 }}>
                    {txn.transaction_type === "income" ? "+" : "-"}
                    {formatMoney(Math.abs(Number(txn.amount)))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <SectionCard title="Quick Actions">
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {quickActions.map((a, i) => (
                <Link
                  key={i}
                  href={a.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    background: "var(--panel-alt)",
                    textDecoration: "none",
                    color: "var(--text)",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {a.label}
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
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {goals.slice(0, 2).map((g, i) => {
                  const pct = Math.min(100, (Number(g.current_amount) / Number(g.target_amount)) * 100);
                  return (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)" }}>{g.name}</span>
                        <span style={{ fontSize: "11px", color: "var(--faint)" }}>{pct.toFixed(0)}%</span>
                      </div>
                      <ProgressBar value={pct} color={pct >= 100 ? "#22C55E" : "#2563EB"} bg="var(--panel-alt)" />
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {totalDebt > 0 && (
            <div
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.20)",
                borderRadius: "16px",
                padding: "18px 20px",
              }}
            >
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#991B1B", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Total Debt
              </p>
              <p style={{ fontSize: "24px", fontWeight: 800, color: "#DC2626", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
                {formatMoney(totalDebt)}
              </p>
              <p style={{ fontSize: "12px", color: "#F87171", margin: 0 }}>
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
      `}</style>
    </div>
  );
}