"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

const CATEGORIES = [
  "Salary", "Freelance Income", "Business Income", "Bonus", "Refund",
  "Housing/Rent", "EMI Payment", "Groceries", "Electricity", "Internet/WiFi",
  "Phone/Mobile", "Insurance", "Food & Dining", "Food Delivery",
  "Fuel/Petrol", "Uber/Ola", "Shopping", "Clothing", "Electronics",
  "Healthcare", "Medicine", "Gym/Fitness", "Education", "Entertainment",
  "Streaming/OTT", "Travel", "Kids", "Charity", "Taxes", "Subscription",
  "Other Income", "Other Expense", "UPI Transfer", "Bank Transfer",
  "Mutual Funds", "Stocks", "Fixed Deposit", "PPF", "Gold", "Crypto",
];

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
    description: "",
    category: "",
    source: "manual",
  });

  useEffect(() => {
    loadTransactions();
  }, []);

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
    setSaving(true);

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    const { error } = await supabase.from("transactions").insert({
      user_id: authData.user.id,
      transaction_date: form.transaction_date,
      amount: parseFloat(form.amount),
      transaction_type: form.transaction_type,
      merchant_name: form.merchant_name || null,
      description: form.description || null,
      category: form.category || null,
      source: "manual",
      currency: "INR",
    });

    if (!error) {
      setForm({
        transaction_date: new Date().toISOString().split("T")[0],
        amount: "",
        transaction_type: "expense",
        merchant_name: "",
        description: "",
        category: "",
        source: "manual",
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

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filtered = filter === "all"
    ? transactions
    : transactions.filter((t) => t.transaction_type === filter);

  const totalIncome = transactions
    .filter((t) => t.transaction_type === "income")
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const totalExpense = transactions
    .filter((t) => t.transaction_type === "expense")
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: "#9CA3AF" }}>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0C0D10" }}>Transactions</h1>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            Track every rupee that comes in and goes out
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "#0C0D10", color: "#FFFFFF" }}
        >
          {showForm ? "✕ Close" : "+ Add Transaction"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
          <p className="text-xs font-medium" style={{ color: "#166534" }}>Total Income</p>
          <p className="text-xl font-bold mt-1" style={{ color: "#166534" }}>{formatMoney(totalIncome)}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
          <p className="text-xs font-medium" style={{ color: "#991B1B" }}>Total Expenses</p>
          <p className="text-xl font-bold mt-1" style={{ color: "#991B1B" }}>{formatMoney(totalExpense)}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <p className="text-xs font-medium" style={{ color: "#1E40AF" }}>Net</p>
          <p className="text-xl font-bold mt-1" style={{ color: "#1E40AF" }}>{formatMoney(totalIncome - totalExpense)}</p>
        </div>
      </div>

      {/* Add Transaction Form */}
      {showForm && (
        <div className="rounded-2xl p-6 mb-6" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: "#0C0D10" }}>Add Transaction</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type selector */}
            <div className="flex gap-2">
              {["expense", "income", "transfer", "investment"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, transaction_type: type })}
                  className="px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
                  style={{
                    background: form.transaction_type === type ? "#0C0D10" : "#F3F4F6",
                    color: form.transaction_type === type ? "#FFFFFF" : "#6B7280",
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Amount (₹)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full h-11 rounded-xl px-4 text-sm outline-none"
                  style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Date</label>
                <input
                  type="date"
                  required
                  value={form.transaction_date}
                  onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
                  className="w-full h-11 rounded-xl px-4 text-sm outline-none"
                  style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Merchant / Payee</label>
                <input
                  type="text"
                  value={form.merchant_name}
                  onChange={(e) => setForm({ ...form, merchant_name: e.target.value })}
                  placeholder="Swiggy, Amazon, Rent..."
                  className="w-full h-11 rounded-xl px-4 text-sm outline-none"
                  style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-11 rounded-xl px-4 text-sm outline-none"
                  style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Note (optional)</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Add a note..."
                className="w-full h-11 rounded-xl px-4 text-sm outline-none"
                style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full h-12 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: "#0C0D10", color: "#FFFFFF" }}
            >
              {saving ? "Saving..." : "Save Transaction"}
            </button>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {["all", "income", "expense", "transfer", "investment"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
            style={{
              background: filter === f ? "#0C0D10" : "#F3F4F6",
              color: filter === f ? "#FFFFFF" : "#6B7280",
            }}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">💳</p>
            <p className="text-sm" style={{ color: "#6B7280" }}>No transactions yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-xs font-semibold px-4 py-2 rounded-lg"
              style={{ background: "#0C0D10", color: "#FFFFFF" }}
            >
              Add your first transaction
            </button>
          </div>
        ) : (
          filtered.map((txn, i) => (
            <div
              key={txn.id}
              className="flex items-center justify-between px-5 py-4 transition-all hover:bg-gray-50"
              style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F3F4F6" : "none" }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "#0C0D10" }}>
                  {txn.merchant_name || txn.description || txn.category || "Transaction"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                  {new Date(txn.transaction_date).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                  {txn.category && ` · ${txn.category}`}
                  {txn.source !== "manual" && ` · via ${txn.source}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p
                  className="text-sm font-bold"
                  style={{ color: txn.transaction_type === "income" ? "#22C55E" : "#0C0D10" }}
                >
                  {txn.transaction_type === "income" ? "+" : "-"}
                  {formatMoney(Math.abs(Number(txn.amount)))}
                </p>
                <button
                  onClick={() => deleteTransaction(txn.id)}
                  className="text-xs p-1.5 rounded-lg transition-all hover:bg-red-50"
                  style={{ color: "#D1D5DB" }}
                  title="Delete"
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