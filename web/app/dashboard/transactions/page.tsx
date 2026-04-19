"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

const CATEGORIES = [
  // Income
  { value: "Salary", type: "income", emoji: "💵" },
  { value: "Freelance Income", type: "income", emoji: "💻" },
  { value: "Business Income", type: "income", emoji: "💼" },
  { value: "Bonus", type: "income", emoji: "🎁" },
  { value: "Other Income", type: "income", emoji: "📥" },
  // Expenses
  { value: "Food & Dining", type: "expense", emoji: "🍽️" },
  { value: "Groceries", type: "expense", emoji: "🛒" },
  { value: "Food Delivery", type: "expense", emoji: "🛵" },
  { value: "Housing/Rent", type: "expense", emoji: "🏠" },
  { value: "EMI Payment", type: "expense", emoji: "📅" },
  { value: "Electricity", type: "expense", emoji: "💡" },
  { value: "Internet/WiFi", type: "expense", emoji: "📶" },
  { value: "Phone/Mobile", type: "expense", emoji: "📱" },
  { value: "Fuel/Petrol", type: "expense", emoji: "⛽" },
  { value: "Uber/Ola/Auto", type: "expense", emoji: "🚖" },
  { value: "Shopping", type: "expense", emoji: "🛍️" },
  { value: "Clothing", type: "expense", emoji: "👕" },
  { value: "Electronics", type: "expense", emoji: "📱" },
  { value: "Healthcare", type: "expense", emoji: "🏥" },
  { value: "Medicine", type: "expense", emoji: "💊" },
  { value: "Education", type: "expense", emoji: "📚" },
  { value: "Entertainment", type: "expense", emoji: "🎬" },
  { value: "Streaming/OTT", type: "expense", emoji: "📺" },
  { value: "Travel", type: "expense", emoji: "✈️" },
  { value: "Insurance", type: "expense", emoji: "🛡️" },
  { value: "Subscription", type: "expense", emoji: "🔄" },
  { value: "Taxes", type: "expense", emoji: "🧾" },
  { value: "Charity/Donation", type: "expense", emoji: "🤲" },
  { value: "Other Expense", type: "expense", emoji: "📦" },
  // Investment
  { value: "Mutual Funds/SIP", type: "investment", emoji: "📊" },
  { value: "Stocks", type: "investment", emoji: "📈" },
  { value: "Fixed Deposit", type: "investment", emoji: "🏦" },
  { value: "PPF", type: "investment", emoji: "🏛️" },
  { value: "Gold", type: "investment", emoji: "🥇" },
  // Transfer
  { value: "UPI Transfer", type: "transfer", emoji: "📲" },
  { value: "Bank Transfer", type: "transfer", emoji: "🏦" },
];

const getCategoryEmoji = (category: string) => {
  const found = CATEGORIES.find(c => c.value === category);
  return found?.emoji || "💳";
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    transaction_date: new Date().toISOString().split("T")[0],
    amount: "",
    transaction_type: "expense",
    merchant_name: "",
    category: "Food & Dining",
    notes: "",
  });

  useEffect(() => { loadTransactions(); }, []);

  const loadTransactions = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", authData.user.id)
      .order("transaction_date", { ascending: false })
      .limit(100);
    setTransactions(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) return;
    setSaving(true);
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) { setSaving(false); return; }

    const { error } = await supabase.from("transactions").insert({
      user_id: authData.user.id,
      transaction_date: form.transaction_date,
      amount: parseFloat(form.amount),
      transaction_type: form.transaction_type,
      merchant_name: form.merchant_name || null,
      category: form.category,
      description: form.notes || null,
      source: "manual",
      currency: "INR",
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      setForm({
        transaction_date: new Date().toISOString().split("T")[0],
        amount: "",
        transaction_type: "expense",
        merchant_name: "",
        category: "Food & Dining",
        notes: "",
      });
      setShowForm(false);
      loadTransactions();
    }
    setSaving(false);
  };

  const deleteTransaction = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    await supabase.from("transactions").delete().eq("id", id);
    loadTransactions();
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0
  }).format(n);

  // Auto-set category based on type change
  const handleTypeChange = (type: string) => {
    const defaultCat = type === "income" ? "Salary" 
      : type === "investment" ? "Mutual Funds/SIP"
      : type === "transfer" ? "UPI Transfer"
      : "Food & Dining";
    setForm({ ...form, transaction_type: type, category: defaultCat });
  };

  const filtered = filter === "all" 
    ? transactions 
    : transactions.filter(t => t.transaction_type === filter);

  const totalIncome = transactions
    .filter(t => t.transaction_type === "income")
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  const totalExpense = transactions
    .filter(t => t.transaction_type === "expense")
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  const filteredCategories = CATEGORIES.filter(c => 
    c.type === form.transaction_type
  );

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <p style={{ color: "#9CA3AF", fontSize: "14px" }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#0C0D10", margin: "0 0 4px 0" }}>
            Transactions
          </h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
            Track every rupee that comes in and goes out
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "10px 20px", borderRadius: "12px", border: "none",
            background: "#0C0D10", color: "#fff", fontSize: "13px",
            fontWeight: "600", cursor: "pointer"
          }}
        >
          {showForm ? "✕ Close" : "+ Add Transaction"}
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "16px", padding: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: "600", color: "#166534", margin: "0 0 6px 0", textTransform: "uppercase" }}>Total Income</p>
          <p style={{ fontSize: "22px", fontWeight: "700", color: "#166534", margin: 0 }}>{fmt(totalIncome)}</p>
        </div>
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "16px", padding: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: "600", color: "#991B1B", margin: "0 0 6px 0", textTransform: "uppercase" }}>Total Expenses</p>
          <p style={{ fontSize: "22px", fontWeight: "700", color: "#DC2626", margin: 0 }}>{fmt(totalExpense)}</p>
        </div>
        <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "16px", padding: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: "600", color: "#1E40AF", margin: "0 0 6px 0", textTransform: "uppercase" }}>Net Savings</p>
          <p style={{ fontSize: "22px", fontWeight: "700", color: "#1D4ED8", margin: 0 }}>{fmt(totalIncome - totalExpense)}</p>
        </div>
      </div>

      {/* Add Transaction Form */}
      {showForm && (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#0C0D10", margin: "0 0 20px 0" }}>Add Transaction</h2>
          
          <form onSubmit={handleSubmit}>
            {/* Type Selector */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                Transaction Type
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {["expense", "income", "investment", "transfer"].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    style={{
                      padding: "8px 16px", borderRadius: "8px", border: "1px solid",
                      fontSize: "12px", fontWeight: "600", cursor: "pointer",
                      textTransform: "capitalize",
                      background: form.transaction_type === type ? "#0C0D10" : "#F9FAFB",
                      color: form.transaction_type === type ? "#fff" : "#6B7280",
                      borderColor: form.transaction_type === type ? "#0C0D10" : "#E5E7EB",
                    }}
                  >
                    {type === "expense" ? "💸 Expense" 
                      : type === "income" ? "💵 Income"
                      : type === "investment" ? "📈 Investment"
                      : "↔️ Transfer"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  style={{
                    width: "100%", height: "44px", borderRadius: "10px",
                    padding: "0 14px", fontSize: "14px", border: "1px solid #E5E7EB",
                    background: "#F9FAFB", color: "#0C0D10", outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={form.transaction_date}
                  onChange={e => setForm({ ...form, transaction_date: e.target.value })}
                  style={{
                    width: "100%", height: "44px", borderRadius: "10px",
                    padding: "0 14px", fontSize: "14px", border: "1px solid #E5E7EB",
                    background: "#F9FAFB", color: "#0C0D10", outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  Merchant / Payee
                </label>
                <input
                  type="text"
                  value={form.merchant_name}
                  onChange={e => setForm({ ...form, merchant_name: e.target.value })}
                  placeholder="Swiggy, Amazon, Salary..."
                  style={{
                    width: "100%", height: "44px", borderRadius: "10px",
                    padding: "0 14px", fontSize: "14px", border: "1px solid #E5E7EB",
                    background: "#F9FAFB", color: "#0C0D10", outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  style={{
                    width: "100%", height: "44px", borderRadius: "10px",
                    padding: "0 14px", fontSize: "14px", border: "1px solid #E5E7EB",
                    background: "#F9FAFB", color: "#0C0D10", outline: "none",
                    boxSizing: "border-box"
                  }}
                >
                  {filteredCategories.map(c => (
                    <option key={c.value} value={c.value}>
                      {c.emoji} {c.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Note (optional)
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Add a note..."
                style={{
                  width: "100%", height: "44px", borderRadius: "10px",
                  padding: "0 14px", fontSize: "14px", border: "1px solid #E5E7EB",
                  background: "#F9FAFB", color: "#0C0D10", outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%", height: "46px", borderRadius: "12px", border: "none",
                background: "#0C0D10", color: "#fff", fontSize: "14px",
                fontWeight: "600", cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.5 : 1
              }}
            >
              {saving ? "Saving..." : "Save Transaction"}
            </button>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {["all", "income", "expense", "investment", "transfer"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px", borderRadius: "8px", border: "none",
              fontSize: "12px", fontWeight: "600", cursor: "pointer",
              textTransform: "capitalize",
              background: filter === f ? "#0C0D10" : "#F3F4F6",
              color: filter === f ? "#fff" : "#6B7280",
            }}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px" }}>
            <p style={{ fontSize: "32px", margin: "0 0 12px 0" }}>💳</p>
            <p style={{ fontSize: "15px", fontWeight: "600", color: "#0C0D10", margin: "0 0 8px 0" }}>
              No transactions yet
            </p>
            <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 20px 0" }}>
              Add your first transaction to start tracking
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: "10px 24px", borderRadius: "10px", border: "none",
                background: "#0C0D10", color: "#fff", fontSize: "13px",
                fontWeight: "600", cursor: "pointer"
              }}
            >
              Add Transaction
            </button>
          </div>
        ) : (
          filtered.map((txn, i) => (
            <div
              key={txn.id}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: i < filtered.length - 1 ? "1px solid #F9FAFB" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "12px",
                  background: txn.transaction_type === "income" ? "#F0FDF4" 
                    : txn.transaction_type === "investment" ? "#EFF6FF" : "#F9FAFB",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", flexShrink: 0
                }}>
                  {getCategoryEmoji(txn.category)}
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: "#0C0D10", margin: "0 0 2px 0" }}>
                    {txn.merchant_name || txn.category || "Transaction"}
                  </p>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
                    {new Date(txn.transaction_date).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                    {txn.category && ` · ${txn.category}`}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <p style={{
                  fontSize: "15px", fontWeight: "700", margin: 0,
                  color: txn.transaction_type === "income" ? "#16A34A" : "#0C0D10"
                }}>
                  {txn.transaction_type === "income" ? "+" : "-"}
                  {fmt(Math.abs(Number(txn.amount)))}
                </p>
                <button
                  onClick={() => deleteTransaction(txn.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#D1D5DB", padding: "4px" }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}