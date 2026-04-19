"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

const ACCOUNT_TYPES = [
  { value: "savings", label: "Savings Account", emoji: "🏦" },
  { value: "checking", label: "Current Account", emoji: "💳" },
  { value: "credit_card", label: "Credit Card", emoji: "💳" },
  { value: "cash", label: "Cash in Hand", emoji: "💵" },
  { value: "wallet", label: "Digital Wallet", emoji: "📱" },
  { value: "upi", label: "UPI Account", emoji: "📲" },
  { value: "fd", label: "Fixed Deposit", emoji: "🏛️" },
  { value: "ppf", label: "PPF Account", emoji: "📊" },
  { value: "investment", label: "Investment", emoji: "📈" },
  { value: "gold", label: "Gold", emoji: "🥇" },
  { value: "property", label: "Property", emoji: "🏠" },
  { value: "other", label: "Other", emoji: "📦" },
];

const BANKS = [
  "SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Bank",
  "Punjab National Bank", "Bank of Baroda", "Canara Bank",
  "IndusInd Bank", "Yes Bank", "IDFC First Bank", "Federal Bank",
  "PayTm Payments Bank", "Google Pay", "PhonePe", "Amazon Pay",
  "Other"
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    account_type: "savings",
    institution_name: "",
    current_balance: "",
    color: "#10b981",
  });

  useEffect(() => { loadAccounts(); }, []);

  const loadAccounts = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    const { data } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", authData.user.id)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    setAccounts(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    const { error } = await supabase.from("accounts").insert({
      user_id: authData.user.id,
      name: form.name,
      account_type: form.account_type,
      institution_name: form.institution_name || null,
      current_balance: parseFloat(form.current_balance) || 0,
      currency: "INR",
      color: form.color,
      include_in_net_worth: true,
      include_in_budget: true,
      is_active: true,
      display_order: accounts.length,
    });

    if (!error) {
      setForm({ name: "", account_type: "savings", institution_name: "", current_balance: "", color: "#10b981" });
      setShowForm(false);
      loadAccounts();
    }

    setSaving(false);
  };

  const updateBalance = async (accountId: string, currentBalance: number) => {
    const input = prompt(`Update balance (current: ₹${currentBalance.toLocaleString("en-IN")}):`, currentBalance.toString());
    if (!input) return;

    const newBalance = parseFloat(input);
    if (isNaN(newBalance)) return;

    await supabase.from("accounts").update({ current_balance: newBalance }).eq("id", accountId);
    loadAccounts();
  };

  const deleteAccount = async (id: string) => {
    if (!confirm("Delete this account?")) return;
    await supabase.from("accounts").update({ is_active: false }).eq("id", id);
    loadAccounts();
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0
  }).format(n);

  const totalAssets = accounts
    .filter(a => !["credit_card", "loan"].includes(a.account_type))
    .reduce((s, a) => s + Number(a.current_balance), 0);

  const totalLiabilities = accounts
    .filter(a => ["credit_card"].includes(a.account_type))
    .reduce((s, a) => s + Number(a.current_balance), 0);

  const netWorth = totalAssets - totalLiabilities;

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899"];

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <p style={{ color: "#9CA3AF", fontSize: "14px" }}>Loading accounts...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#0C0D10", margin: "0 0 4px 0" }}>🏦 Accounts</h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>Track all your money in one place</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "10px 20px", borderRadius: "12px", border: "none",
            background: "#0C0D10", color: "#fff", fontSize: "13px",
            fontWeight: "600", cursor: "pointer"
          }}
        >
          {showForm ? "✕ Close" : "+ Add Account"}
        </button>
      </div>

      {/* Net Worth Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#0C0D10", borderRadius: "16px", padding: "20px" }}>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 8px 0", fontWeight: "600", textTransform: "uppercase" }}>Net Worth</p>
          <p style={{ fontSize: "26px", fontWeight: "700", color: "#fff", margin: 0 }}>{fmt(netWorth)}</p>
        </div>
        <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "16px", padding: "20px" }}>
          <p style={{ fontSize: "11px", color: "#166534", margin: "0 0 8px 0", fontWeight: "600", textTransform: "uppercase" }}>Total Assets</p>
          <p style={{ fontSize: "26px", fontWeight: "700", color: "#166534", margin: 0 }}>{fmt(totalAssets)}</p>
        </div>
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "16px", padding: "20px" }}>
          <p style={{ fontSize: "11px", color: "#991B1B", margin: "0 0 8px 0", fontWeight: "600", textTransform: "uppercase" }}>Liabilities</p>
          <p style={{ fontSize: "26px", fontWeight: "700", color: "#DC2626", margin: 0 }}>{fmt(totalLiabilities)}</p>
        </div>
      </div>

      {/* Add Account Form */}
      {showForm && (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#0C0D10", margin: "0 0 20px 0" }}>Add Account</h2>
          <form onSubmit={handleSubmit}>

            {/* Account Type */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>Account Type</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {ACCOUNT_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setForm({ ...form, account_type: type.value, name: form.name || type.label })}
                    style={{
                      padding: "10px 8px", borderRadius: "10px", border: "1px solid",
                      fontSize: "11px", fontWeight: "500", cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                      background: form.account_type === type.value ? "#0C0D10" : "#F9FAFB",
                      color: form.account_type === type.value ? "#fff" : "#6B7280",
                      borderColor: form.account_type === type.value ? "#0C0D10" : "#E5E7EB",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>{type.emoji}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Account Name</label>
                <input
                  type="text" required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="My SBI Savings"
                  style={{ width: "100%", height: "44px", borderRadius: "10px", padding: "0 14px", fontSize: "13px", border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#0C0D10", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Bank / Institution</label>
                <select
                  value={form.institution_name}
                  onChange={e => setForm({ ...form, institution_name: e.target.value })}
                  style={{ width: "100%", height: "44px", borderRadius: "10px", padding: "0 14px", fontSize: "13px", border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#0C0D10", outline: "none", boxSizing: "border-box" }}
                >
                  <option value="">Select bank...</option>
                  {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Current Balance (₹)</label>
                <input
                  type="number" step="0.01" required value={form.current_balance}
                  onChange={e => setForm({ ...form, current_balance: e.target.value })}
                  placeholder="50000"
                  style={{ width: "100%", height: "44px", borderRadius: "10px", padding: "0 14px", fontSize: "13px", border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#0C0D10", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Color</label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                  {COLORS.map(c => (
                    <button
                      key={c} type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      style={{
                        width: "28px", height: "28px", borderRadius: "50%", background: c,
                        border: form.color === c ? "3px solid #0C0D10" : "2px solid transparent",
                        cursor: "pointer"
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit" disabled={saving}
              style={{
                width: "100%", height: "46px", borderRadius: "12px", border: "none",
                background: "#0C0D10", color: "#fff", fontSize: "14px",
                fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.5 : 1
              }}
            >
              {saving ? "Adding..." : "Add Account"}
            </button>
          </form>
        </div>
      )}

      {/* Accounts List */}
      {accounts.length === 0 && !showForm ? (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "48px", textAlign: "center" }}>
          <p style={{ fontSize: "40px", margin: "0 0 12px 0" }}>🏦</p>
          <p style={{ fontSize: "16px", fontWeight: "700", color: "#0C0D10", margin: "0 0 8px 0" }}>No accounts yet</p>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 20px 0" }}>Add your bank accounts to track net worth</p>
          <button
            onClick={() => setShowForm(true)}
            style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "#0C0D10", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
          >
            Add your first account
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {accounts.map(account => {
            const typeInfo = ACCOUNT_TYPES.find(t => t.value === account.account_type) || ACCOUNT_TYPES[0];
            return (
              <div key={account.id} style={{
                background: "#fff", border: "1px solid #E5E7EB",
                borderRadius: "16px", overflow: "hidden"
              }}>
                {/* Color bar */}
                <div style={{ height: "4px", background: account.color || "#10b981" }} />

                <div style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "12px",
                        background: `${account.color || "#10b981"}20`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px"
                      }}>
                        {typeInfo.emoji}
                      </div>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: "700", color: "#0C0D10", margin: "0 0 2px 0" }}>{account.name}</p>
                        <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
                          {account.institution_name || typeInfo.label}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAccount(account.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#D1D5DB", padding: "4px" }}
                    >🗑️</button>
                  </div>

                  <p style={{ fontSize: "28px", fontWeight: "700", color: "#0C0D10", margin: "0 0 16px 0" }}>
                    {fmt(Number(account.current_balance))}
                  </p>

                  <button
                    onClick={() => updateBalance(account.id, Number(account.current_balance))}
                    style={{
                      width: "100%", padding: "10px", borderRadius: "10px",
                      border: "1px solid #E5E7EB", background: "#F9FAFB",
                      fontSize: "12px", fontWeight: "600", color: "#374151", cursor: "pointer"
                    }}
                  >
                    Update Balance
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}