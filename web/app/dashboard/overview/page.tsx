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
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ── UTILS ── */
function formatMoney(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const CHART_COLORS = ["#22C55E", "#3B82F6", "#A855F7", "#EC4899", "#F59E0B", "#06B6D4"];

/* ── COMPONENTS ── */

function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
      <div>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", margin: 0 }}>{title}</h3>
        {sub && <p style={{ fontSize: "12px", color: "var(--faint)", margin: "4px 0 0 0" }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function MetricItem({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ padding: "12px 0" }}>
      <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 6px 0" }}>{label}</p>
      <p style={{ fontSize: "22px", fontWeight: 700, color: color || "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>{value}</p>
      {sub && <p style={{ fontSize: "12px", color: "var(--muted)", margin: "4px 0 0 0" }}>{sub}</p>}
    </div>
  );
}

/* ── MAIN PAGE ── */

export default function OverviewPage() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState({ accounts: [], transactions: [], goals: [], debts: [] });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    setGreeting(getGreeting());
    loadData();
  }, []);

  const loadData = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;
    setUser(authData.user);

    const uid = authData.user.id;
    const [acc, txn, gls, dbt] = await Promise.all([
      supabase.from("accounts").select("*").eq("user_id", uid).eq("is_active", true),
      supabase.from("transactions").select("*").eq("user_id", uid).order("transaction_date", { ascending: false }).limit(100),
      supabase.from("goals").select("*").eq("user_id", uid).eq("status", "active"),
      supabase.from("debts").select("*").eq("user_id", uid).eq("status", "active"),
    ]);

    setData({
      accounts: acc.data || [],
      transactions: txn.data || [],
      goals: gls.data || [],
      debts: dbt.data || []
    });
    setLoading(false);
  };

  /* ── LOGIC ── */
  const totals = useMemo(() => {
    const balance = data.accounts.reduce((s, a) => s + Number(a.current_balance || 0), 0);
    const debt = data.debts.reduce((s, d) => s + Number(d.current_balance || 0), 0);
    
    const now = new Date();
    const thisMonth = data.transactions.filter(t => {
      const d = new Date(t.transaction_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const income = thisMonth.filter(t => t.transaction_type === 'income').reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const expense = thisMonth.filter(t => t.transaction_type === 'expense').reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

    return { balance, debt, netWorth: balance - debt, income, expense, savingsRate };
  }, [data]);

  const healthScore = useMemo(() => {
    let score = 400;
    if (totals.netWorth > 0) score += 200;
    if (totals.savingsRate > 20) score += 200;
    if (data.debts.length === 0) score += 200;
    return Math.min(1000, score);
  }, [totals, data]);

  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    data.transactions.filter(t => t.transaction_type === 'expense').slice(0, 20).forEach(t => {
      const c = t.category || "Other";
      map[c] = (map[c] || 0) + Math.abs(Number(t.amount));
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [data.transactions]);

  if (loading) return <div style={{ padding: "40px", color: "var(--muted)" }}>Analyzing your finances...</div>;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* ── TOP HERO SECTION ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px", marginBottom: "32px" }}>
        
        {/* Health Score Premium Card */}
        <div style={{ 
          background: "linear-gradient(135deg, #09090b 0%, #17171a 100%)", 
          borderRadius: "24px", padding: "32px", color: "#fff",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden"
        }}>
          <div style={{ position: "relative", zIndex: 2 }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
              Financial Health
            </p>
            <h2 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 32px 0", letterSpacing: "-0.02em" }}>
              {greeting}, {user?.user_metadata?.full_name?.split(" ")[0]}
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontSize: "56px", fontWeight: 800, color: "#22C55E", letterSpacing: "-0.04em" }}>{healthScore}</span>
                  <span style={{ fontSize: "18px", color: "rgba(255,255,255,0.3)" }}>/ 1000</span>
                </div>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", marginTop: "12px", lineHeight: "1.6" }}>
                  Your score is <span style={{ color: "#22C55E", fontWeight: 600 }}>Strong</span>. You are saving more than 60% of your peers in your region.
                </p>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", justifyContent: "center" }}>
                <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "10px" }}>
                   <div style={{ width: `${(healthScore/1000)*100}%`, height: "100%", background: "#22C55E", borderRadius: "10px" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.3)" }}>
                  <span>POOR</span>
                  <span>EXCELLENT</span>
                </div>
              </div>
            </div>
          </div>
          {/* Subtle Background Glow */}
          <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", background: "rgba(34, 197, 94, 0.1)", filter: "blur(60px)", borderRadius: "50%" }} />
        </div>

        {/* Support Stats Bento */}
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: "16px" }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px", boxShadow: "var(--shadow)" }}>
             <MetricItem label="Total Net Worth" value={formatMoney(totals.netWorth)} sub={`Assets: ${formatCompact(totals.balance)}`} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
             <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px", boxShadow: "var(--shadow)" }}>
                <MetricItem label="Monthly In" value={formatMoney(totals.income)} color="#22C55E" />
             </div>
             <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px", boxShadow: "var(--shadow)" }}>
                <MetricItem label="Monthly Out" value={formatMoney(totals.expense)} color="#EF4444" />
             </div>
          </div>
        </div>
      </div>

      {/* ── MIDDLE CHARTS SECTION ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px", marginBottom: "32px" }}>
        
        {/* Main Spending Trend */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "28px", boxShadow: "var(--shadow)" }}>
          <SectionHeader title="Spending Trend" sub="Your cash flow over the last 30 days" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.transactions.slice(0, 15).reverse()}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="transaction_date" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ background: "#000", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                itemStyle={{ color: "#22C55E" }}
                formatter={(val: number) => formatMoney(val)}
              />
              <Area type="monotone" dataKey="amount" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "28px", boxShadow: "var(--shadow)" }}>
          <SectionHeader title="Top Categories" sub="Where your money goes" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {pieData.slice(0, 3).map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: CHART_COLORS[i] }} />
                <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 500 }}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM FEED SECTION ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" }}>
        
        {/* Recent Activity */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "28px", boxShadow: "var(--shadow)" }}>
          <SectionHeader title="Recent Activity" action={<Link href="/dashboard/transactions" style={{ fontSize: "12px", color: "#22C55E", textDecoration: "none", fontWeight: 600 }}>View All</Link>} />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {data.transactions.slice(0, 6).map((t, i) => (
              <div key={i} style={{ 
                display: "flex", justifyContent: "space-between", alignItems: "center", 
                padding: "12px", borderRadius: "12px", transition: "background 0.2s" 
              }} className="tx-row">
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "var(--panel-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                    {t.transaction_type === 'income' ? "💸" : "💳"}
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", margin: 0 }}>{t.merchant_name || t.category}</p>
                    <p style={{ fontSize: "12px", color: "var(--faint)", margin: "2px 0 0 0" }}>{t.category} · {new Date(t.transaction_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
                <p style={{ fontSize: "15px", fontWeight: 700, color: t.transaction_type === 'income' ? "#16A34A" : "var(--text)" }}>
                  {t.transaction_type === 'income' ? "+" : "-"}{formatMoney(Math.abs(t.amount))}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Actions & Goals */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px", boxShadow: "var(--shadow)" }}>
             <SectionHeader title="Quick Actions" />
             <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Link href="/dashboard/transactions" className="action-btn">Add Transaction</Link>
                <Link href="/dashboard/chat" className="action-btn">Analyze with AI</Link>
             </div>
          </div>

          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "20px", padding: "24px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#991B1B", textTransform: "uppercase", marginBottom: "8px" }}>Immediate Attention</p>
            <p style={{ fontSize: "20px", fontWeight: 800, color: "#DC2626", margin: 0 }}>{formatMoney(totals.debt)}</p>
            <p style={{ fontSize: "12px", color: "#B91C1C", marginTop: "4px" }}>Across {data.debts.length} active liabilities</p>
          </div>

        </div>
      </div>

      <style>{`
        .action-btn {
          padding: 12px;
          border-radius: 12px;
          background: var(--panel-alt);
          color: var(--text);
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          transition: transform 0.1s;
        }
        .action-btn:active { transform: scale(0.98); }
        .tx-row:hover { background: var(--panel-alt); }
      `}</style>
    </div>
  );
}