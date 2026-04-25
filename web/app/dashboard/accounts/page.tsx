"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const TYPES = [
  { value: "Bank", label: "Bank Account", color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE", icon: "🏦", desc: "Savings, Current, Salary" },
  { value: "Cash", label: "Cash", color: "#22C55E", bg: "#F0FDF4", border: "#BBF7D0", icon: "💵", desc: "Wallet, Petty cash" },
  { value: "Credit Card", label: "Credit Card", color: "#EC4899", bg: "#FDF2F8", border: "#FBCFE8", icon: "💳", desc: "All bank credit cards" },
  { value: "UPI", label: "UPI / Digital", color: "#8B5CF6", bg: "#F5F3FF", border: "#DDD6FE", icon: "📱", desc: "Paytm, PhonePe, GPay" },
  { value: "Investment", label: "Investment", color: "#06B6D4", bg: "#ECFEFF", border: "#A5F3FC", icon: "📈", desc: "MF, Stocks, FD, PPF" },
  { value: "Other", label: "Other", color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0", icon: "📦", desc: "Loan, Deposit, Other" },
];

function getTypeMeta(type: string) {
  return TYPES.find(t => t.value === type) || TYPES[TYPES.length - 1];
}

const TIPS = [
  { icon: "💡", text: "Add all accounts to see your true net worth" },
  { icon: "🎯", text: "Track credit cards to monitor utilization" },
  { icon: "⚡", text: "Include investments for accurate tax planning" },
];

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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, border: "3px solid #E5E7EB", borderTopColor: "#22C55E", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: 13, color: "#71717A" }}>Loading accounts...</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      <div className="acc-container" style={{ maxWidth: 980, margin: "0 auto", padding: "32px 24px 48px" }}>

        {/* Header */}
        <div className="acc-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 12, color: "#A1A1AA", margin: "0 0 4px", fontWeight: 500 }}>Dashboard</p>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0A0A0A", margin: 0, letterSpacing: "-0.03em" }}>Accounts</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 10, border: "none",
              background: "#0A0A0A", color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            }}
          >
            <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Account
          </button>
        </div>

        {/* Net Worth Hero */}
        <div style={{
          background: "linear-gradient(135deg, #0A0A0A 0%, #1a1a2e 100%)",
          borderRadius: 18, padding: "32px 36px", marginBottom: 20,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(34,197,94,0.08)", filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(59,130,246,0.06)", filter: "blur(50px)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 0.1, margin: "0 0 8px" }}>Net Worth</p>
            <p style={{ fontSize: 40, fontWeight: 800, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.04em", lineHeight: 1 }}>{fmt(totalBalance)}</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0 }}>{accounts.length} account{accounts.length !== 1 ? "s" : ""} tracked</p>
          </div>
          <div className="acc-nw-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 24, position: "relative", zIndex: 2 }}>
            {[
              { label: "Assets", value: fmt(assets), color: "#22C55E" },
              { label: "Debts", value: fmt(debts), color: "#EF4444" },
              { label: "Net", value: fmt(assets - debts), color: "#3B82F6" },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 6, background: s.color }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{s.label}</span>
                </div>
                <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Account Types Quick View */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0A0A0A", margin: "0 0 14px", letterSpacing: "-0.02em" }}>Account Types</h2>
          <div className="acc-types-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {TYPES.map((t) => {
              const count = accounts.filter(a => a.account_type === t.value).length;
              const total = accounts.filter(a => a.account_type === t.value).reduce((s, a) => s + Number(a.current_balance || 0), 0);
              return (
                <div
                  key={t.value}
                  onClick={() => { setType(t.value); setShowForm(true); }}
                  style={{
                    background: t.bg, border: `1px solid ${t.border}`, borderRadius: 14,
                    padding: "20px 20px 18px", cursor: "pointer",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 24 }}>{t.icon}</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#0A0A0A", margin: 0 }}>{t.label}</p>
                      <p style={{ fontSize: 10, color: t.color, margin: "1px 0 0 0", fontWeight: 500 }}>{t.desc}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${t.border}` }}>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 800, color: "#0A0A0A", margin: 0 }}>{count > 0 ? fmt(total) : "—"}</p>
                      <p style={{ fontSize: 10, color: "#71717A", margin: "2px 0 0 0" }}>{count} account{count !== 1 ? "s" : ""}</p>
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: 7, background: t.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: "#0A0A0A", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: 0.06 }}>Quick Tips</h3>
          <div className="acc-tips" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {TIPS.map((tip, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{tip.icon}</span>
                <p style={{ fontSize: 12, color: "#71717A", margin: 0, lineHeight: 1.5 }}>{tip.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Account Cards by Group */}
        {grouped.length > 0 && grouped.map((g) => (
          <div key={g.value} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: g.bg, border: `1px solid ${g.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{g.icon}</div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0A0A0A", margin: 0 }}>{g.label}</h2>
              <span style={{ fontSize: 12, color: "#71717A", fontWeight: 500 }}>({g.items.length})</span>
              <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 700, color: g.color }}>{fmt(g.total)}</span>
            </div>
            <div className="acc-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {g.items.map((a) => {
                const meta = getTypeMeta(a.account_type);
                return (
                  <div
                    key={a.id}
                    className="acc-card"
                    style={{
                      background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: 20,
                      transition: "border-color 0.15s ease, box-shadow 0.15s ease", position: "relative",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = meta.border; e.currentTarget.style.boxShadow = `0 4px 16px ${meta.color}18`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: meta.bg, border: `1px solid ${meta.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{meta.icon}</div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0A0A0A", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.account_name}</p>
                        <p style={{ fontSize: 11, color: "#A1A1AA", margin: "2px 0 0 0" }}>{meta.label}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(a.id)}
                        style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #FEE2E2", background: "#FEF2F2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: 0.6, transition: "opacity 0.15s" }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = "0.6"}
                      >
                        <svg width="12" height="12" fill="none" stroke="#EF4444" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 4px" }}>Balance</p>
                        <p style={{ fontSize: 22, fontWeight: 800, color: Number(a.current_balance) >= 0 ? "#0A0A0A" : "#DC2626", margin: 0, letterSpacing: "-0.02em" }}>{fmt(Number(a.current_balance || 0))}</p>
                      </div>
                      <div style={{ padding: "4px 10px", borderRadius: 6, background: meta.bg, border: `1px solid ${meta.border}`, fontSize: 10, fontWeight: 700, color: meta.color }}>{meta.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {accounts.length === 0 && (
          <div style={{ background: "#fff", border: "1px dashed #D4D4D8", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "#F0FDF4", border: "1px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="28" height="28" fill="none" stroke="#22C55E" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0A0A0A", margin: "0 0 6px" }}>No accounts yet</h3>
            <p style={{ fontSize: 13, color: "#71717A", margin: "0 0 20px", maxWidth: 340, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
              Add your bank accounts, credit cards, investments, and loans to see your complete financial picture.
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(34,197,94,0.25)" }}
            >
              Add your first account
            </button>
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showForm && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999, padding: 20,
          }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="acc-modal"
            style={{
              background: "#fff", borderRadius: 18, width: "100%", maxWidth: 520,
              boxShadow: "0 24px 64px rgba(0,0,0,0.2)", overflow: "hidden",
              maxHeight: "90vh", overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "24px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0A0A0A", margin: 0, letterSpacing: "-0.02em" }}>Add Account</h2>
              <button onClick={() => setShowForm(false)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" fill="none" stroke="#71717A" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div style={{ padding: "20px 28px 28px" }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: 11, fontWeight: 600, color: "#374151" }}>Account Type</label>
              <div className="acc-modal-types" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
                {TYPES.map((t) => {
                  const selected = type === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      style={{
                        background: selected ? t.bg : "#FAFAFA",
                        border: selected ? `2px solid ${t.color}` : "2px solid #E5E7EB",
                        borderRadius: 12, padding: "14px 10px", cursor: "pointer",
                        textAlign: "center", transition: "0.15s",
                      }}
                    >
                      <span style={{ fontSize: 20, display: "block", marginBottom: 4 }}>{t.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: selected ? 700 : 500, color: selected ? t.color : "#71717A", display: "block" }}>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 4, fontSize: 11, fontWeight: 600, color: "#374151" }}>Account Name</label>
                  <input
                    type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. HDFC Savings"
                    style={{ width: "100%", height: 42, borderRadius: 10, padding: "0 14px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "#FAFAFA", border: "1.5px solid #E5E7EB", color: "#0A0A0A", boxSizing: "border-box" }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#22C55E"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#E5E7EB"}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 4, fontSize: 11, fontWeight: 600, color: "#374151" }}>Opening Balance (₹)</label>
                  <input
                    type="number" required value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0"
                    style={{ width: "100%", height: 42, borderRadius: 10, padding: "0 14px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "#FAFAFA", border: "1.5px solid #E5E7EB", color: "#0A0A0A", boxSizing: "border-box" }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#22C55E"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#E5E7EB"}
                  />
                </div>
              </div>

              <button
                onClick={handleAdd} disabled={saving}
                style={{
                  width: "100%", height: 44, borderRadius: 10, border: "none",
                  background: "#22C55E", color: "#fff", fontSize: 14, fontWeight: 700,
                  cursor: saving ? "wait" : "pointer", fontFamily: "inherit",
                  opacity: saving ? 0.8 : 1, marginTop: 20,
                  boxShadow: "0 4px 12px rgba(34,197,94,0.25)",
                }}
              >
                {saving ? "Adding..." : "Add Account \u2192"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .acc-card:hover { border-color: var(--faint); }

        @media (max-width: 900px) {
          .acc-types-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .acc-container { padding: 20px 16px 0 !important; }
          .acc-types-grid { grid-template-columns: 1fr !important; }
          .acc-nw-grid { grid-template-columns: 1fr !important; }
          .acc-tips { grid-template-columns: 1fr !important; }
          .acc-header { flex-direction: column !important; align-items: flex-start !important; }
          .acc-header > div:first-child h1 { font-size: 22px !important; }
          .acc-card-grid { grid-template-columns: 1fr !important; }
          .acc-modal { max-width: 100% !important; }
          .acc-modal-types { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .acc-container { padding: 16px 12px 0 !important; }
          .acc-header > div:first-child h1 { font-size: 20px !important; }
        }
      `}</style>
    </div>
  );
}