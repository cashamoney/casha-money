"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

const DEBT_TYPES = [
  { value: "credit_card", label: "Credit Card", emoji: "💳" },
  { value: "personal_loan", label: "Personal Loan", emoji: "🏦" },
  { value: "home_loan", label: "Home Loan", emoji: "🏠" },
  { value: "car_loan", label: "Car Loan", emoji: "🚗" },
  { value: "education_loan", label: "Education Loan", emoji: "🎓" },
  { value: "gold_loan", label: "Gold Loan", emoji: "🥇" },
  { value: "business_loan", label: "Business Loan", emoji: "💼" },
  { value: "bnpl", label: "Buy Now Pay Later", emoji: "🛒" },
  { value: "informal", label: "Borrowed from Friends/Family", emoji: "🤝" },
  { value: "other", label: "Other", emoji: "📦" },
];

export default function DebtsPage() {
  const [debts, setDebts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    debt_type: "credit_card",
    lender: "",
    original_amount: "",
    current_balance: "",
    interest_rate: "",
    minimum_payment: "",
    payment_day: "",
  });

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    const { data } = await supabase
      .from("debts")
      .select("*")
      .eq("user_id", authData.user.id)
      .order("interest_rate", { ascending: false });

    setDebts(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    const { error } = await supabase.from("debts").insert({
      user_id: authData.user.id,
      name: form.name,
      debt_type: form.debt_type,
      lender: form.lender || null,
      original_amount: parseFloat(form.original_amount),
      current_balance: parseFloat(form.current_balance),
      interest_rate: parseFloat(form.interest_rate),
      minimum_payment: parseFloat(form.minimum_payment),
      payment_day: form.payment_day ? parseInt(form.payment_day) : null,
      currency: "INR",
      status: "active",
    });

    if (!error) {
      setForm({ name: "", debt_type: "credit_card", lender: "", original_amount: "", current_balance: "", interest_rate: "", minimum_payment: "", payment_day: "" });
      setShowForm(false);
      loadDebts();
    }

    setSaving(false);
  };

  const makePayment = async (debtId: string, amount: number) => {
    const input = prompt(`Enter payment amount (₹):`, amount.toString());
    if (!input) return;

    const paymentAmount = parseFloat(input);
    if (isNaN(paymentAmount) || paymentAmount <= 0) return;

    const debt = debts.find((d) => d.id === debtId);
    if (!debt) return;

    const newBalance = Math.max(0, Number(debt.current_balance) - paymentAmount);
    const newTotalPaid = Number(debt.total_paid || 0) + paymentAmount;

    await supabase
      .from("debts")
      .update({
        current_balance: newBalance,
        total_paid: newTotalPaid,
        status: newBalance <= 0 ? "paid_off" : "active",
      })
      .eq("id", debtId);

    loadDebts();
  };

  const deleteDebt = async (id: string) => {
    if (!confirm("Delete this debt?")) return;
    await supabase.from("debts").delete().eq("id", id);
    loadDebts();
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  };

  const activeDebts = debts.filter((d) => d.status === "active");
  const paidDebts = debts.filter((d) => d.status === "paid_off");
  const totalDebt = activeDebts.reduce((s, d) => s + Number(d.current_balance), 0);
  const totalMinPayment = activeDebts.reduce((s, d) => s + Number(d.minimum_payment), 0);
  const totalPaid = debts.reduce((s, d) => s + Number(d.total_paid || 0), 0);
  const highestRate = activeDebts.length > 0 ? Math.max(...activeDebts.map((d) => Number(d.interest_rate))) : 0;

  // Debt-free date calculation
  const calculateDebtFreeDate = () => {
    if (totalDebt <= 0 || totalMinPayment <= 0) return "You're debt free! 🎉";
    const months = Math.ceil(totalDebt / totalMinPayment);
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: "#9CA3AF" }}>Loading debts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0C0D10" }}>💸 Debt Destroyer</h1>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            Track, strategize, and eliminate your debt
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "#0C0D10", color: "#FFFFFF" }}
        >
          {showForm ? "✕ Close" : "+ Add Debt"}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ background: "#0C0D10" }}>
          <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Total Debt</p>
          <p className="text-2xl font-bold mt-1 text-white">{formatMoney(totalDebt)}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          <p className="text-xs font-medium" style={{ color: "#9CA3AF" }}>Monthly Payment</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "#0C0D10" }}>{formatMoney(totalMinPayment)}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
          <p className="text-xs font-medium" style={{ color: "#166534" }}>Total Paid Off</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "#166534" }}>{formatMoney(totalPaid)}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <p className="text-xs font-medium" style={{ color: "#1E40AF" }}>Debt-Free By</p>
          <p className="text-lg font-bold mt-1" style={{ color: "#1E40AF" }}>{calculateDebtFreeDate()}</p>
        </div>
      </div>

      {/* AI Strategy Tip */}
      {activeDebts.length >= 2 && (
        <div className="rounded-2xl p-5 mb-6" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          <div className="flex items-start gap-3">
            <span className="text-xl">🧠</span>
            <div>
              <p className="text-sm font-bold" style={{ color: "#0C0D10" }}>AI Strategy: Avalanche Method</p>
              <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                Pay minimums on all debts, then put extra money toward{" "}
                <strong style={{ color: "#0C0D10" }}>
                  {activeDebts[0]?.name}
                </strong>{" "}
                ({activeDebts[0]?.interest_rate}% — highest interest). This saves you the most money in interest.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Debt Form */}
      {showForm && (
        <div className="rounded-2xl p-6 mb-6" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: "#0C0D10" }}>Add Debt</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "#374151" }}>Debt Type</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {DEBT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setForm({ ...form, debt_type: type.value, name: form.name || type.label })}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl text-[10px] transition-all"
                    style={{
                      background: form.debt_type === type.value ? "#0C0D10" : "#F9FAFB",
                      color: form.debt_type === type.value ? "#FFFFFF" : "#6B7280",
                      border: `1px solid ${form.debt_type === type.value ? "#0C0D10" : "#E5E7EB"}`,
                    }}
                  >
                    <span className="text-base">{type.emoji}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="HDFC Credit Card" className="w-full h-11 rounded-xl px-4 text-sm outline-none" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Lender</label>
                <input type="text" value={form.lender} onChange={(e) => setForm({ ...form, lender: e.target.value })} placeholder="HDFC Bank" className="w-full h-11 rounded-xl px-4 text-sm outline-none" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Original Amount (₹)</label>
                <input type="number" required value={form.original_amount} onChange={(e) => setForm({ ...form, original_amount: e.target.value })} placeholder="100000" className="w-full h-11 rounded-xl px-4 text-sm outline-none" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Current Balance (₹)</label>
                <input type="number" required value={form.current_balance} onChange={(e) => setForm({ ...form, current_balance: e.target.value })} placeholder="85000" className="w-full h-11 rounded-xl px-4 text-sm outline-none" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Interest Rate (%)</label>
                <input type="number" required step="0.01" value={form.interest_rate} onChange={(e) => setForm({ ...form, interest_rate: e.target.value })} placeholder="18.5" className="w-full h-11 rounded-xl px-4 text-sm outline-none" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Min Payment (₹/mo)</label>
                <input type="number" required value={form.minimum_payment} onChange={(e) => setForm({ ...form, minimum_payment: e.target.value })} placeholder="5000" className="w-full h-11 rounded-xl px-4 text-sm outline-none" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Payment Day</label>
                <input type="number" min="1" max="31" value={form.payment_day} onChange={(e) => setForm({ ...form, payment_day: e.target.value })} placeholder="15" className="w-full h-11 rounded-xl px-4 text-sm outline-none" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }} />
              </div>
            </div>

            <button type="submit" disabled={saving} className="w-full h-12 rounded-xl text-sm font-semibold disabled:opacity-50" style={{ background: "#0C0D10", color: "#FFFFFF" }}>
              {saving ? "Adding..." : "Add Debt"}
            </button>
          </form>
        </div>
      )}

      {/* Debts List */}
      {activeDebts.length === 0 && !showForm ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-lg font-bold mb-2" style={{ color: "#0C0D10" }}>
            {paidDebts.length > 0 ? "All debts paid off!" : "No debts tracked"}
          </p>
          <p className="text-sm mb-4" style={{ color: "#6B7280" }}>
            {paidDebts.length > 0 ? "Incredible achievement! Keep it up!" : "Add your debts to create a payoff strategy"}
          </p>
          {paidDebts.length === 0 && (
            <button onClick={() => setShowForm(true)} className="text-sm font-semibold px-6 py-2.5 rounded-xl" style={{ background: "#0C0D10", color: "#FFFFFF" }}>
              Add your first debt
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {activeDebts.map((debt, index) => {
            const paidPercent = Number(debt.original_amount) > 0 ? ((Number(debt.original_amount) - Number(debt.current_balance)) / Number(debt.original_amount)) * 100 : 0;
            const isHighestRate = index === 0 && activeDebts.length > 1;

            return (
              <div key={debt.id} className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: isHighestRate ? "2px solid #EF4444" : "1px solid #E5E7EB" }}>
                {isHighestRate && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                      🎯 Pay this first — highest interest
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-base font-bold" style={{ color: "#0C0D10" }}>{debt.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                      {debt.lender && `${debt.lender} · `}{debt.interest_rate}% APR · ₹{Number(debt.minimum_payment).toLocaleString("en-IN")}/mo
                    </p>
                  </div>
                  <button onClick={() => deleteDebt(debt.id)} className="text-xs p-1" style={{ color: "#D1D5DB" }}>🗑️</button>
                </div>

                {/* Balance */}
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-xs" style={{ color: "#9CA3AF" }}>Remaining</p>
                    <p className="text-2xl font-bold" style={{ color: "#0C0D10" }}>{formatMoney(Number(debt.current_balance))}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: "#9CA3AF" }}>Original</p>
                    <p className="text-sm" style={{ color: "#6B7280" }}>{formatMoney(Number(debt.original_amount))}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: "#F3F4F6" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${paidPercent}%`, background: paidPercent >= 75 ? "#22C55E" : paidPercent >= 50 ? "#3B82F6" : "#F59E0B" }} />
                </div>
                <p className="text-xs mb-4" style={{ color: "#9CA3AF" }}>{paidPercent.toFixed(0)}% paid off</p>

                <button
                  onClick={() => makePayment(debt.id, Number(debt.minimum_payment))}
                  className="text-xs font-semibold px-4 py-2 rounded-lg"
                  style={{ background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" }}
                >
                  💰 Record Payment
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Paid Off */}
      {paidDebts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-bold mb-4" style={{ color: "#0C0D10" }}>🎉 Paid Off</h2>
          {paidDebts.map((debt) => (
            <div key={debt.id} className="rounded-xl p-4 mb-2 flex items-center gap-3" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
              <span className="text-xl">🎉</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#166534" }}>{debt.name}</p>
                <p className="text-xs" style={{ color: "#16A34A" }}>{formatMoney(Number(debt.original_amount))} — Paid off!</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}