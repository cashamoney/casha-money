"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const TYPES = [
  { value: "Bank", label: "Bank Account", color: "#3B82F6", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></svg> },
  { value: "Cash", label: "Cash", color: "#22C55E", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { value: "Credit Card", label: "Credit Card", color: "#EC4899", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
  { value: "UPI", label: "UPI / Digital", color: "#8B5CF6", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
  { value: "Investment", label: "Investment", color: "#06B6D4", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
  { value: "Other", label: "Other", color: "#64748B", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
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
  const assets = accounts.filter(a => Number(a.current_balance || 0) >= 0).reduce((s, a) => s + Number(a.current_balance || 0), 0);
  const debts = accounts.filter(a => Number(a.current_balance || 0) < 0).reduce((s, a) => s + Math.abs(Number(a.current_balance || 0)), 0);

  const grouped = TYPES.map(t => ({
    ...t,
    items: accounts.filter(a => a.account_type === t.value),
    total: accounts.filter(a => a.account_type === t.value).reduce((s, a) => s + Number(a.current_balance || 0), 0),
  })).filter(g => g.items.length > 0);

  const handleAdd = async () => {
    if (!name.trim() || !balance) return;
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    await supabase.from("accounts").insert({ user_id: u.user.id, account_name: name.trim(), account_type: type, current_balance: Number(balance), is_active: true });
    setName(""); setType("Bank"); setBalance(""); setShowForm(false); setSaving(false); load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("accounts").update({ is_active: false }).eq("id", id);
    load();
  };

  if (loading) return (
    <div style={{ height: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 28, height: 28, border: "2.5px solid #E5E7EB", borderTopColor: "#0A0A0A", borderRadius: "50%", animation: "accspin 0.7s linear infinite" }} />
      <style>{`@keyframes accspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      <div className="acc-wrap" style={{ maxWidth: 920, margin: "0 auto", padding: "32px 24px 48px" }}>

        {/* Header */}
        <div className="acc-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 12, color: "#A1A1AA", margin: "0 0 2px", fontWeight: 500 }}>Dashboard</p>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0A0A0A", margin: 0, letterSpacing: "-0.03em" }}>Accounts</h1>
          </div>
          <button onClick={() => setShowForm(true)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 8, border: "1px solid #0A0A0A", background: "#0A0A0A", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Account
          </button>
        </div>

        {/* Summary Row */}
        <div className="acc-summary" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 22px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#A1A1AA", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.05 }}>Net Worth</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: "#0A0A0A", margin: 0, letterSpacing: "-0.03em" }}>{fmt(totalBalance)}</p>
            <p style={{ fontSize: 11, color: "#A1A1AA", margin: "6px 0 0 0" }}>{accounts.length} account{accounts.length !== 1 ? "s" : ""}</p>
          </div>
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 22px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#A1A1AA", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.05 }}>Assets</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: "#0A0A0A", margin: 0, letterSpacing: "-0.03em" }}>{fmt(assets)}</p>
            <p style={{ fontSize: 11, color: "#22C55E", margin: "6px 0 0 0", fontWeight: 500 }}>Positive balances</p>
          </div>
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 22px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#A1A1AA", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.05 }}>Debts</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: debts > 0 ? "#DC2626" : "#0A0A0A", margin: 0, letterSpacing: "-0.03em" }}>{fmt(debts)}</p>
            <p style={{ fontSize: 11, color: debts > 0 ? "#DC2626" : "#A1A1AA", margin: "6px 0 0 0", fontWeight: 500 }}>{debts > 0 ? "Outstanding" : "No debt"}</p>
          </div>
        </div>

        {/* Account Types Overview */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0A0A0A", margin: "0 0 14px", letterSpacing: "-0.01em" }}>By Type</h2>
          <div className="acc-types" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {TYPES.map((t) => {
              const count = accounts.filter(a => a.account_type === t.value).length;
              const total = accounts.filter(a => a.account_type === t.value).reduce((s, a) => s + Number(a.current_balance || 0), 0);
              return (
                <button
                  key={t.value}
                  onClick={() => { setType(t.value); setShowForm(true); }}
                  style={{
                    background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10,
                    padding: "16px 18px", cursor: "pointer", textAlign: "left",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.boxShadow = `0 2px 8px ${t.color}14`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: `${t.color}0D`, display: "flex", alignItems: "center", justifyContent: "center", color: t.color, flexShrink: 0 }}>{t.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#0A0A0A", margin: 0 }}>{t.label}</p>
                      <p style={{ fontSize: 10, color: "#A1A1AA", margin: "1px 0 0 0" }}>{count} account{count !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#0A0A0A", margin: 0, letterSpacing: "-0.02em" }}>{count > 0 ? fmt(total) : "\u2014"}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grouped Account Cards */}
        {grouped.length > 0 && grouped.map((g) => (
          <div key={g.value} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: `${g.color}0D`, display: "flex", alignItems: "center", justifyContent: "center", color: g.color, flexShrink: 0 }}>
                {g.icon}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0A0A0A" }}>{g.label}</span>
              <span style={{ fontSize: 11, color: "#A1A1AA", fontWeight: 500 }}>({g.items.length})</span>
              <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.01em" }}>{fmt(g.total)}</span>
            </div>
            <div className="acc-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 10 }}>
              {g.items.map((a) => {
                const meta = getTypeMeta(a.account_type);
                const bal = Number(a.current_balance || 0);
                return (
                  <div
                    key={a.id}
                    className="acc-card"
                    style={{
                      background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10,
                      padding: "18px 20px", transition: "border-color 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#C4C4C4"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#E5E7EB"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 9, background: `${meta.color}0D`, display: "flex", alignItems: "center", justifyContent: "center", color: meta.color, flexShrink: 0 }}>{meta.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#0A0A0A", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.account_name}</p>
                        <p style={{ fontSize: 10, color: "#A1A1AA", margin: "2px 0 0 0" }}>{meta.label}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(a.id)}
                        style={{ width: 26, height: 26, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#C4C4C4", transition: "color 0.15s" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#DC2626"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "#C4C4C4"}
                      >
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                      <div>
                        <p style={{ fontSize: 9, fontWeight: 600, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 3px" }}>Balance</p>
                        <p style={{ fontSize: 20, fontWeight: 800, color: bal >= 0 ? "#0A0A0A" : "#DC2626", margin: 0, letterSpacing: "-0.02em" }}>{fmt(bal)}</p>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: meta.color, padding: "3px 8px", borderRadius: 5, background: `${meta.color}0D` }}>{meta.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {accounts.length === 0 && (
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "56px 24px", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: "#F4F4F5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#A1A1AA" }}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0A0A0A", margin: "0 0 4px" }}>No accounts added</h3>
            <p style={{ fontSize: 13, color: "#71717A", margin: "0 0 20px", maxWidth: 300, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
              Connect your bank accounts, cards, and investments to get started.
            </p>
            <button onClick={() => setShowForm(true)} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #0A0A0A", background: "#0A0A0A", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Add Account
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="acc-modal"
            style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 460, boxShadow: "0 20px 50px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "22px 26px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0A0A0A", margin: 0 }}>New Account</h2>
              <button onClick={() => setShowForm(false)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#71717A" }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div style={{ padding: "20px 26px 26px" }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: 11, fontWeight: 600, color: "#374151" }}>Type</label>
              <div className="acc-mtypes" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
                {TYPES.map((t) => {
                  const sel = type === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      style={{
                        background: sel ? `${t.color}08` : "#FAFAFA",
                        border: sel ? `1.5px solid ${t.color}` : "1.5px solid #E5E7EB",
                        borderRadius: 8, padding: "12px 8px", cursor: "pointer",
                        textAlign: "center", transition: "0.12s", fontFamily: "inherit",
                      }}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: sel ? `${t.color}0D` : "#F4F4F5", display: "flex", alignItems: "center", justifyContent: "center", color: sel ? t.color : "#71717A", margin: "0 auto 6px" }}>{t.icon}</div>
                      <span style={{ fontSize: 10, fontWeight: sel ? 700 : 500, color: sel ? t.color : "#71717A" }}>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", marginBottom: 5, fontSize: 11, fontWeight: 600, color: "#374151" }}>Account Name</label>
                <input
                  type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. HDFC Savings"
                  style={{ width: "100%", height: 40, borderRadius: 8, padding: "0 14px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "#FAFAFA", border: "1.5px solid #E5E7EB", color: "#0A0A0A", boxSizing: "border-box" }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#0A0A0A"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#E5E7EB"}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 5, fontSize: 11, fontWeight: 600, color: "#374151" }}>Opening Balance</label>
                <input
                  type="number" required value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0"
                  style={{ width: "100%", height: 40, borderRadius: 8, padding: "0 14px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "#FAFAFA", border: "1.5px solid #E5E7EB", color: "#0A0A0A", boxSizing: "border-box" }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#0A0A0A"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#E5E7EB"}
                />
              </div>

              <button
                onClick={handleAdd} disabled={saving}
                style={{
                  width: "100%", height: 42, borderRadius: 8, border: "none",
                  background: "#0A0A0A", color: "#fff", fontSize: 13, fontWeight: 700,
                  cursor: saving ? "wait" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Saving..." : "Add Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        @keyframes accspin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .acc-types { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .acc-wrap { padding: 20px 16px 0 !important; }
          .acc-summary { grid-template-columns: 1fr !important; }
          .acc-types { grid-template-columns: 1fr !important; }
          .acc-cards { grid-template-columns: 1fr !important; }
          .acc-head { flex-direction: column !important; align-items: flex-start !important; }
          .acc-head h1 { font-size: 20px !important; }
          .acc-modal { max-width: 100% !important; }
          .acc-mtypes { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .acc-wrap { padding: 16px 12px 0 !important; }
        }
      `}</style>
    </div>
  );
}