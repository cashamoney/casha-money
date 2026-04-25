"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const TYPES = [
  { value: "Bank", label: "Bank Account", color: "#3B82F6", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18" /></svg> },
  { value: "Cash", label: "Cash", color: "#22C55E", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { value: "Credit Card", label: "Credit Card", color: "#EC4899", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
  { value: "UPI", label: "UPI", color: "#8B5CF6", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
  { value: "Investment", label: "Investment", color: "#06B6D4", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
  { value: "Other", label: "Other", color: "#64748B", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
];

function getTypeMeta(type: string) {
  return TYPES.find(t => t.value === type) || TYPES[TYPES.length - 1];
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("Bank");
  const [balance, setBalance] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    const { data } = await supabase.from("accounts").select("*").eq("user_id", u.user.id).eq("is_active", true).order("created_at", { ascending: false });
    setAccounts(data || []);
    setLoading(false);
  };

  const totalBalance = accounts.reduce((s, a) => s + Number(a.current_balance || 0), 0);

  const handleAdd = async () => {
    if (!name.trim() || !balance) return;
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    await supabase.from("accounts").insert({
      user_id: u.user.id,
      account_name: name.trim(),
      account_type: type,
      current_balance: Number(balance),
      is_active: true,
    });
    setName(""); setType("Bank"); setBalance(""); setShowForm(false); setSaving(false);
    load();
  };

  if (loading) return <div style={{ height: "50vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 13 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 12, color: "var(--faint)", margin: "0 0 4px" }}>Dashboard</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>Accounts</h1>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, background: "#22C55E", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Account
        </button>
      </div>

      {/* Total Balance */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 6px" }}>Total Balance</p>
        <p style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{fmt(totalBalance)}</p>
        <p style={{ fontSize: 11, color: "var(--muted)", margin: "4px 0 0 0" }}>{accounts.length} account{accounts.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 18px" }}>New Account</h3>

          {/* Account Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>Account Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. HDFC Savings" style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13, outline: "none", transition: "0.15s" }} onFocus={e => e.currentTarget.style.borderColor = "#22C55E"} onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
          </div>

          {/* Account Type - Premium Grid */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 8 }}>Account Type</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {TYPES.map(t => {
                const selected = type === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: selected ? `2px solid ${t.color}` : "2px solid var(--border)",
                      background: selected ? `${t.color}0D` : "var(--bg)",
                      cursor: "pointer",
                      transition: "0.15s",
                      textAlign: "left",
                    }}
                  >
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: selected ? `${t.color}1A` : "var(--panel-alt)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: selected ? t.color : "var(--muted)",
                      flexShrink: 0,
                      transition: "0.15s",
                    }}>
                      {t.icon}
                    </div>
                    <span style={{
                      fontSize: 12,
                      fontWeight: selected ? 700 : 500,
                      color: selected ? t.color : "var(--text)",
                      transition: "0.15s",
                    }}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Balance + Submit */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>Opening Balance</label>
              <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="0" style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 13, outline: "none", transition: "0.15s" }} onFocus={e => e.currentTarget.style.borderColor = "#22C55E"} onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
            </div>
            <button onClick={handleAdd} disabled={saving} style={{ padding: "10px 24px", borderRadius: 10, background: "#22C55E", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", height: 42 }}>{saving ? "Saving..." : "Add Account"}</button>
          </div>
        </div>
      )}

      {/* Account Cards */}
      {accounts.length === 0 ? (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "48px 20px", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--panel-alt)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <svg width="22" height="22" fill="none" stroke="var(--muted)" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18" /></svg>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 4px" }}>No accounts yet</p>
          <p style={{ fontSize: 12, color: "var(--faint)", margin: 0 }}>Add your first account to start tracking.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {accounts.map(a => {
            const meta = getTypeMeta(a.account_type);
            return (
              <div key={a.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, transition: "0.15s", cursor: "default" }} className="acc-card">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: `${meta.color}14`, display: "flex", alignItems: "center", justifyContent: "center", color: meta.color, flexShrink: 0 }}>
                    {meta.icon}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.account_name}</p>
                    <p style={{ fontSize: 11, color: "var(--faint)", margin: "2px 0 0 0" }}>{meta.label}</p>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 4px" }}>Balance</p>
                    <p style={{ fontSize: 20, fontWeight: 800, color: Number(a.current_balance) >= 0 ? "var(--text)" : "#DC2626", margin: 0 }}>{fmt(Number(a.current_balance || 0))}</p>
                  </div>
                  <div style={{ padding: "4px 10px", borderRadius: 6, background: `${meta.color}14`, fontSize: 10, fontWeight: 700, color: meta.color }}>{meta.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .acc-card:hover { border-color: var(--faint); }
      `}</style>
    </div>
  );
}