"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

const BUDGET_CATEGORIES = [
  { name: "Housing/Rent", emoji: "🏠", color: "#6366F1", recommended: 25 },
  { name: "Groceries", emoji: "🛒", color: "#22C55E", recommended: 10 },
  { name: "Food Delivery", emoji: "🛵", color: "#F97316", recommended: 5 },
  { name: "Transportation", emoji: "🚗", color: "#3B82F6", recommended: 8 },
  { name: "EMI Payment", emoji: "📅", color: "#EF4444", recommended: 15 },
  { name: "Entertainment", emoji: "🎬", color: "#F43F5E", recommended: 3 },
  { name: "Shopping", emoji: "🛍️", color: "#EC4899", recommended: 4 },
  { name: "Healthcare", emoji: "🏥", color: "#14B8A6", recommended: 3 },
  { name: "Education", emoji: "📚", color: "#8B5CF6", recommended: 3 },
  { name: "Subscription", emoji: "🔄", color: "#A855F7", recommended: 2 },
  { name: "Streaming/OTT", emoji: "📺", color: "#F43F5E", recommended: 1 },
  { name: "Insurance", emoji: "🛡️", color: "#6366F1", recommended: 1 },
  { name: "Savings", emoji: "💰", color: "#10B981", recommended: 20 },
  { name: "Other Expense", emoji: "📦", color: "#94A3B8", recommended: 0 },
];

export default function BudgetPage() {
  const [income, setIncome] = useState(0);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [spent, setSpent] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "setup">("overview");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;
    const uid = authData.user.id;

    const { data: incomeTxns } = await supabase
      .from("transactions")
      .select("amount, transaction_date")
      .eq("user_id", uid)
      .eq("transaction_type", "income");

    const totalIncome = (incomeTxns || []).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const months = new Set((incomeTxns || []).map((t: any) => t.transaction_date?.slice(0, 7)));
    const monthCount = Math.max(1, months.size);
    const monthlyIncome = Math.round(totalIncome / monthCount);
    setIncome(monthlyIncome);

    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    const { data: expenseTxns } = await supabase
      .from("transactions")
      .select("amount, category")
      .eq("user_id", uid)
      .eq("transaction_type", "expense")
      .gte("transaction_date", monthStart);

    const spentMap: Record<string, number> = {};
    (expenseTxns || []).forEach((t: any) => {
      const cat = t.category || "Other Expense";
      spentMap[cat] = (spentMap[cat] || 0) + Math.abs(Number(t.amount));
    });
    setSpent(spentMap);

    const { data: savedBudget } = await supabase
      .from("budgets")
      .select("categories")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (savedBudget?.categories && Object.keys(savedBudget.categories).length > 0) {
      setBudgets(savedBudget.categories);
    } else if (monthlyIncome > 0) {
      const autoBudgets: Record<string, number> = {};
      BUDGET_CATEGORIES.forEach(cat => {
        autoBudgets[cat.name] = Math.round(monthlyIncome * cat.recommended / 100);
      });
      setBudgets(autoBudgets);
    }

    setLoading(false);
  };

  const generateAIBudget = () => {
    if (income === 0) {
      alert("Please add income transactions first so AI can calculate your budget!");
      return;
    }
    const autoBudgets: Record<string, number> = {};
    BUDGET_CATEGORIES.forEach(cat => {
      autoBudgets[cat.name] = Math.round(income * cat.recommended / 100);
    });
    setBudgets(autoBudgets);
    setAiGenerated(true);
    setActiveTab("setup");
    setTimeout(() => setAiGenerated(false), 5000);
  };

  const saveBudgets = async () => {
    setSaving(true);
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;

    const { error } = await supabase.from("budgets").insert({
      user_id: authData.user.id,
      name: `Budget ${now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`,
      period_type: "monthly",
      start_date: startDate,
      end_date: endDate,
      total_budget: Object.values(budgets).reduce((s, v) => s + v, 0),
      currency: "INR",
      categories: budgets,
      status: "active",
    });

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0
  }).format(n);

  const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0);
  const totalSpent = Object.values(spent).reduce((s, v) => s + v, 0);
  const totalRemaining = totalBudget - totalSpent;

  const getStatus = (budgeted: number, spentAmt: number) => {
    if (budgeted === 0) return { color: "#9CA3AF", label: "No limit", pct: 0 };
    const pct = (spentAmt / budgeted) * 100;
    if (pct >= 100) return { color: "#EF4444", label: "Over budget!", pct };
    if (pct >= 80) return { color: "#F59E0B", label: "Almost at limit", pct };
    if (pct >= 50) return { color: "#3B82F6", label: "On track", pct };
    return { color: "#22C55E", label: "Good", pct };
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <p style={{ color: "#9CA3AF", fontSize: "14px" }}>Loading your budget...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#0C0D10", margin: "0 0 4px 0" }}>
            📋 Smart Budget
          </h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
            {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })} · AI-powered budget based on your income
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={generateAIBudget}
            style={{
              padding: "10px 16px", borderRadius: "12px",
              border: `1px solid ${aiGenerated ? "#BBF7D0" : "#E5E7EB"}`,
              background: aiGenerated ? "#F0FDF4" : "#fff",
              color: aiGenerated ? "#16A34A" : "#0C0D10",
              fontSize: "13px", fontWeight: "600", cursor: "pointer",
              transition: "all 0.3s"
            }}
          >
            {aiGenerated ? "✅ Budget Generated!" : "🤖 AI Generate"}
          </button>
          <button
            onClick={saveBudgets}
            disabled={saving}
            style={{
              padding: "10px 20px", borderRadius: "12px", border: "none",
              background: saved ? "#22C55E" : "#0C0D10",
              color: "#fff", fontSize: "13px", fontWeight: "600",
              cursor: "pointer", opacity: saving ? 0.7 : 1,
              transition: "all 0.3s"
            }}
          >
            {saving ? "Saving..." : saved ? "✅ Saved!" : "💾 Save Budget"}
          </button>
        </div>
      </div>

      {/* AI Generated Banner */}
      {aiGenerated && (
        <div style={{
          background: "#F0FDF4", border: "1px solid #BBF7D0",
          borderRadius: "12px", padding: "14px 18px", marginBottom: "20px",
          display: "flex", alignItems: "center", gap: "12px"
        }}>
          <span style={{ fontSize: "24px" }}>🤖</span>
          <div>
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#166534", margin: "0 0 2px 0" }}>
              AI Budget Generated Successfully!
            </p>
            <p style={{ fontSize: "12px", color: "#16A34A", margin: 0 }}>
              Based on your income of {fmt(income)}/month using the 50/30/20 rule.
              All percentages add up to 100%. Edit below and click Save Budget.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
        <div style={{ background: "#0C0D10", borderRadius: "16px", padding: "18px" }}>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 6px 0", fontWeight: "600", textTransform: "uppercase" }}>
            Monthly Income
          </p>
          <p style={{ fontSize: "22px", fontWeight: "700", color: "#fff", margin: 0 }}>
            {income > 0 ? fmt(income) : "Add income"}
          </p>
        </div>
        <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "16px", padding: "18px" }}>
          <p style={{ fontSize: "11px", color: "#1E40AF", margin: "0 0 6px 0", fontWeight: "600", textTransform: "uppercase" }}>
            Total Budgeted
          </p>
          <p style={{ fontSize: "22px", fontWeight: "700", color: "#1D4ED8", margin: 0 }}>
            {fmt(totalBudget)}
          </p>
        </div>
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "16px", padding: "18px" }}>
          <p style={{ fontSize: "11px", color: "#991B1B", margin: "0 0 6px 0", fontWeight: "600", textTransform: "uppercase" }}>
            Spent This Month
          </p>
          <p style={{ fontSize: "22px", fontWeight: "700", color: "#DC2626", margin: 0 }}>
            {fmt(totalSpent)}
          </p>
        </div>
        <div style={{
          background: totalRemaining >= 0 ? "#F0FDF4" : "#FEF2F2",
          border: `1px solid ${totalRemaining >= 0 ? "#BBF7D0" : "#FECACA"}`,
          borderRadius: "16px", padding: "18px"
        }}>
          <p style={{ fontSize: "11px", color: totalRemaining >= 0 ? "#166534" : "#991B1B", margin: "0 0 6px 0", fontWeight: "600", textTransform: "uppercase" }}>
            {totalRemaining >= 0 ? "Remaining" : "Over Budget"}
          </p>
          <p style={{ fontSize: "22px", fontWeight: "700", color: totalRemaining >= 0 ? "#16A34A" : "#DC2626", margin: 0 }}>
            {fmt(Math.abs(totalRemaining))}
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#0C0D10" }}>
            Overall Budget Used
          </span>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#0C0D10" }}>
            {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
          </span>
        </div>
        <div style={{ height: "14px", background: "#F3F4F6", borderRadius: "999px", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${Math.min(100, totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0)}%`,
            background: totalSpent > totalBudget ? "#EF4444"
              : totalSpent > totalBudget * 0.8 ? "#F59E0B" : "#22C55E",
            borderRadius: "999px",
            transition: "width 0.8s ease"
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
          <span style={{ fontSize: "11px", color: "#9CA3AF" }}>Spent: {fmt(totalSpent)}</span>
          <span style={{ fontSize: "11px", color: "#9CA3AF" }}>Budget: {fmt(totalBudget)}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {[
          { key: "overview", label: "📊 Overview" },
          { key: "setup", label: "⚙️ Edit Budget" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: "8px 20px", borderRadius: "10px", border: "none",
              fontSize: "13px", fontWeight: "600", cursor: "pointer",
              background: activeTab === tab.key ? "#0C0D10" : "#F3F4F6",
              color: activeTab === tab.key ? "#fff" : "#6B7280",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {BUDGET_CATEGORIES.map(cat => {
            const budgeted = budgets[cat.name] || 0;
            const spentAmt = spent[cat.name] || 0;
            const status = getStatus(budgeted, spentAmt);

            return (
              <div
                key={cat.name}
                style={{
                  background: "#fff",
                  border: `1px solid ${status.pct >= 100 ? "#FECACA" : "#E5E7EB"}`,
                  borderRadius: "14px", padding: "16px",
                  borderLeft: `4px solid ${cat.color}`
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: budgeted > 0 ? "10px" : "0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "20px" }}>{cat.emoji}</span>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: "600", color: "#0C0D10", margin: 0 }}>
                        {cat.name}
                      </p>
                      <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0 0" }}>
                        {fmt(spentAmt)} spent
                        {budgeted > 0 && ` · ${fmt(budgeted)} budget`}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: "600", padding: "3px 10px",
                      borderRadius: "999px",
                      background: status.pct >= 100 ? "#FEF2F2"
                        : status.pct >= 80 ? "#FFFBEB"
                          : status.pct > 0 ? "#EFF6FF" : "#F3F4F6",
                      color: status.color
                    }}>
                      {budgeted === 0 ? "No budget set" : status.label}
                    </span>
                    {budgeted > 0 && spentAmt < budgeted && (
                      <p style={{ fontSize: "11px", color: "#22C55E", margin: "4px 0 0 0", fontWeight: "600" }}>
                        {fmt(budgeted - spentAmt)} remaining
                      </p>
                    )}
                    {budgeted > 0 && spentAmt >= budgeted && (
                      <p style={{ fontSize: "11px", color: "#EF4444", margin: "4px 0 0 0", fontWeight: "600" }}>
                        {fmt(spentAmt - budgeted)} over!
                      </p>
                    )}
                  </div>
                </div>
                {budgeted > 0 && (
                  <div style={{ height: "8px", background: "#F3F4F6", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(100, status.pct)}%`,
                      background: status.color,
                      borderRadius: "999px",
                      transition: "width 0.5s ease"
                    }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Budget Tab */}
      {activeTab === "setup" && (
        <div>
          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px" }}>
            <p style={{ fontSize: "13px", color: "#1E40AF", margin: "0 0 4px 0", fontWeight: "600" }}>
              💡 How AI Budget Works
            </p>
            <p style={{ fontSize: "12px", color: "#1E3A8A", margin: 0 }}>
              Based on your income of <strong>{fmt(income)}/month</strong>, AI uses the 50/30/20 rule
              adapted for India. All percentages add up to exactly 100%.
              Edit any amount below and save.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {BUDGET_CATEGORIES.map(cat => (
              <div
                key={cat.name}
                style={{
                  background: "#fff", border: "1px solid #E5E7EB",
                  borderRadius: "14px", padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: "14px"
                }}
              >
                <div style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: `${cat.color}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", flexShrink: 0
                }}>
                  {cat.emoji}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "#0C0D10", margin: "0 0 2px 0" }}>
                    {cat.name}
                  </p>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
                    {cat.recommended > 0
                      ? `AI recommends: ${cat.recommended}% = ${fmt(Math.round(income * cat.recommended / 100))}`
                      : "Set your own amount"
                    }
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                  <span style={{ fontSize: "13px", color: "#6B7280", fontWeight: "600" }}>₹</span>
                  <input
                    type="number"
                    min="0"
                    value={budgets[cat.name] || ""}
                    onChange={e => setBudgets({ ...budgets, [cat.name]: Number(e.target.value) })}
                    placeholder="0"
                    style={{
                      width: "110px", height: "38px", borderRadius: "10px",
                      padding: "0 12px", fontSize: "13px",
                      border: `1px solid ${budgets[cat.name] > 0 ? cat.color : "#E5E7EB"}`,
                      background: budgets[cat.name] > 0 ? `${cat.color}08` : "#F9FAFB",
                      color: "#0C0D10", outline: "none", textAlign: "right",
                      fontWeight: "600"
                    }}
                  />
                </div>

                <div style={{ width: "45px", textAlign: "right", flexShrink: 0 }}>
                  <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: "500" }}>
                    {income > 0 && budgets[cat.name]
                      ? `${Math.round((budgets[cat.name] / income) * 100)}%`
                      : "0%"
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Budget vs Income checker */}
          <div style={{
            marginTop: "20px", padding: "18px", borderRadius: "14px",
            background: totalBudget > income ? "#FEF2F2" : "#F0FDF4",
            border: `1px solid ${totalBudget > income ? "#FECACA" : "#BBF7D0"}`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#0C0D10" }}>
                Total Budgeted
              </span>
              <span style={{ fontSize: "16px", fontWeight: "700", color: totalBudget > income ? "#DC2626" : "#16A34A" }}>
                {fmt(totalBudget)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "13px", color: "#6B7280" }}>Monthly Income</span>
              <span style={{ fontSize: "13px", color: "#6B7280" }}>{fmt(income)}</span>
            </div>
            <div style={{ height: "1px", background: totalBudget > income ? "#FECACA" : "#BBF7D0", marginBottom: "10px" }} />
            {totalBudget > income ? (
              <p style={{ fontSize: "13px", color: "#DC2626", margin: 0, fontWeight: "500" }}>
                ⚠️ Budget exceeds income by {fmt(totalBudget - income)}. Please reduce some categories.
              </p>
            ) : totalBudget > 0 ? (
              <p style={{ fontSize: "13px", color: "#16A34A", margin: 0, fontWeight: "500" }}>
                ✅ {fmt(income - totalBudget)} unallocated — consider adding to Savings!
              </p>
            ) : (
              <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>
                Click "🤖 AI Generate" above to auto-fill budgets based on your income.
              </p>
            )}
          </div>

          <button
            onClick={saveBudgets}
            disabled={saving}
            style={{
              width: "100%", marginTop: "16px", height: "50px",
              borderRadius: "12px", border: "none",
              background: saved ? "#22C55E" : "#0C0D10",
              color: "#fff", fontSize: "14px", fontWeight: "600",
              cursor: "pointer", opacity: saving ? 0.7 : 1,
              transition: "all 0.3s"
            }}
          >
            {saving ? "Saving..." : saved ? "✅ Budget Saved Successfully!" : "💾 Save Budget"}
          </button>
        </div>
      )}
    </div>
  );
}