"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

const GOAL_TYPES = [
  { value: "emergency_fund", label: "Emergency Fund", emoji: "🛡️" },
  { value: "home", label: "Home/House", emoji: "🏠" },
  { value: "car", label: "Car/Vehicle", emoji: "🚗" },
  { value: "education", label: "Education", emoji: "🎓" },
  { value: "wedding", label: "Wedding", emoji: "💍" },
  { value: "vacation", label: "Vacation/Travel", emoji: "✈️" },
  { value: "gadget", label: "Gadget/Electronics", emoji: "📱" },
  { value: "investment", label: "Investment", emoji: "📈" },
  { value: "retirement", label: "Retirement", emoji: "🏖️" },
  { value: "business", label: "Business", emoji: "💼" },
  { value: "debt_payoff", label: "Debt Payoff", emoji: "💸" },
  { value: "custom", label: "Custom Goal", emoji: "🎯" },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingMoney, setAddingMoney] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState("");

  const [form, setForm] = useState({
    name: "",
    goal_type: "custom",
    emoji: "🎯",
    target_amount: "",
    target_date: "",
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", authData.user.id)
      .order("priority", { ascending: true });

    setGoals(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    const selectedType = GOAL_TYPES.find((g) => g.value === form.goal_type);

    const { error } = await supabase.from("goals").insert({
      user_id: authData.user.id,
      name: form.name,
      goal_type: form.goal_type,
      emoji: selectedType?.emoji || "🎯",
      target_amount: parseFloat(form.target_amount),
      current_amount: 0,
      currency: "INR",
      target_date: form.target_date || null,
      status: "active",
      priority: goals.length + 1,
    });

    if (!error) {
      setForm({ name: "", goal_type: "custom", emoji: "🎯", target_amount: "", target_date: "" });
      setShowForm(false);
      loadGoals();
    }

    setSaving(false);
  };

  const addMoneyToGoal = async (goalId: string) => {
    if (!addAmount || parseFloat(addAmount) <= 0) return;

    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const newAmount = Number(goal.current_amount) + parseFloat(addAmount);

    await supabase
      .from("goals")
      .update({
        current_amount: newAmount,
        status: newAmount >= Number(goal.target_amount) ? "completed" : "active",
        completed_date: newAmount >= Number(goal.target_amount) ? new Date().toISOString() : null,
      })
      .eq("id", goalId);

    setAddingMoney(null);
    setAddAmount("");
    loadGoals();
  };

  const deleteGoal = async (id: string) => {
    if (!confirm("Delete this goal?")) return;
    await supabase.from("goals").delete().eq("id", id);
    loadGoals();
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalTarget = goals.filter((g) => g.status === "active").reduce((s, g) => s + Number(g.target_amount), 0);
  const totalSaved = goals.filter((g) => g.status === "active").reduce((s, g) => s + Number(g.current_amount), 0);
  const completedGoals = goals.filter((g) => g.status === "completed");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: "#9CA3AF" }}>Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0C0D10" }}>🎯 Savings Goals</h1>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            Set goals, track progress, build your future
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "#0C0D10", color: "#FFFFFF" }}
        >
          {showForm ? "✕ Close" : "+ New Goal"}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          <p className="text-xs font-medium" style={{ color: "#9CA3AF" }}>Total Target</p>
          <p className="text-xl font-bold mt-1" style={{ color: "#0C0D10" }}>{formatMoney(totalTarget)}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
          <p className="text-xs font-medium" style={{ color: "#166534" }}>Total Saved</p>
          <p className="text-xl font-bold mt-1" style={{ color: "#166534" }}>{formatMoney(totalSaved)}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <p className="text-xs font-medium" style={{ color: "#1E40AF" }}>Remaining</p>
          <p className="text-xl font-bold mt-1" style={{ color: "#1E40AF" }}>{formatMoney(totalTarget - totalSaved)}</p>
        </div>
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <div className="rounded-2xl p-6 mb-6" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: "#0C0D10" }}>Create New Goal</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Goal Type Grid */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "#374151" }}>What are you saving for?</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {GOAL_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setForm({ ...form, goal_type: type.value, emoji: type.emoji, name: form.name || type.label })}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl text-xs transition-all"
                    style={{
                      background: form.goal_type === type.value ? "#0C0D10" : "#F9FAFB",
                      color: form.goal_type === type.value ? "#FFFFFF" : "#6B7280",
                      border: `1px solid ${form.goal_type === type.value ? "#0C0D10" : "#E5E7EB"}`,
                    }}
                  >
                    <span className="text-lg">{type.emoji}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Goal Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="My dream goal"
                  className="w-full h-11 rounded-xl px-4 text-sm outline-none"
                  style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Target Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={form.target_amount}
                  onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                  placeholder="100000"
                  className="w-full h-11 rounded-xl px-4 text-sm outline-none"
                  style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#374151" }}>Target Date (optional)</label>
              <input
                type="date"
                value={form.target_date}
                onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                className="w-full h-11 rounded-xl px-4 text-sm outline-none"
                style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full h-12 rounded-xl text-sm font-semibold disabled:opacity-50"
              style={{ background: "#0C0D10", color: "#FFFFFF" }}
            >
              {saving ? "Creating..." : "Create Goal"}
            </button>
          </form>
        </div>
      )}

      {/* Goals List */}
      {goals.filter((g) => g.status === "active").length === 0 && !showForm ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-lg font-bold mb-2" style={{ color: "#0C0D10" }}>No goals yet</p>
          <p className="text-sm mb-4" style={{ color: "#6B7280" }}>Set your first savings goal and watch your progress!</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-semibold px-6 py-2.5 rounded-xl"
            style={{ background: "#0C0D10", color: "#FFFFFF" }}
          >
            Create your first goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.filter((g) => g.status === "active").map((goal) => {
            const progress = Number(goal.target_amount) > 0
              ? (Number(goal.current_amount) / Number(goal.target_amount)) * 100
              : 0;
            const remaining = Number(goal.target_amount) - Number(goal.current_amount);

            return (
              <div key={goal.id} className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.emoji}</span>
                    <div>
                      <p className="text-base font-bold" style={{ color: "#0C0D10" }}>{goal.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                        {goal.target_date
                          ? `Target: ${new Date(goal.target_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`
                          : "No deadline set"}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => deleteGoal(goal.id)} className="text-xs p-1" style={{ color: "#D1D5DB" }}>🗑️</button>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-medium" style={{ color: "#22C55E" }}>
                      {formatMoney(Number(goal.current_amount))} saved
                    </span>
                    <span className="text-xs font-medium" style={{ color: "#6B7280" }}>
                      {formatMoney(Number(goal.target_amount))}
                    </span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, progress)}%`,
                        background: progress >= 100 ? "#22C55E" : "linear-gradient(90deg, #22C55E, #3B82F6)",
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs" style={{ color: "#9CA3AF" }}>{progress.toFixed(0)}% complete</span>
                    <span className="text-xs" style={{ color: "#9CA3AF" }}>{formatMoney(remaining)} remaining</span>
                  </div>
                </div>

                {/* Add Money */}
                {addingMoney === goal.id ? (
                  <div className="flex gap-2 mt-3">
                    <input
                      type="number"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      placeholder="Amount to add"
                      className="flex-1 h-10 rounded-xl px-4 text-sm outline-none"
                      style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", color: "#0C0D10" }}
                      autoFocus
                    />
                    <button
                      onClick={() => addMoneyToGoal(goal.id)}
                      className="px-4 h-10 rounded-xl text-xs font-semibold"
                      style={{ background: "#22C55E", color: "#FFFFFF" }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setAddingMoney(null); setAddAmount(""); }}
                      className="px-3 h-10 rounded-xl text-xs"
                      style={{ background: "#F3F4F6", color: "#6B7280" }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingMoney(goal.id)}
                    className="mt-2 text-xs font-semibold px-4 py-2 rounded-lg"
                    style={{ background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" }}
                  >
                    + Add Money
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-bold mb-4" style={{ color: "#0C0D10" }}>🎉 Completed Goals</h2>
          <div className="space-y-3">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="rounded-xl p-4 flex items-center gap-3" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                <span className="text-xl">{goal.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "#166534" }}>{goal.name}</p>
                  <p className="text-xs" style={{ color: "#16A34A" }}>{formatMoney(Number(goal.target_amount))} — Completed! 🎉</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}