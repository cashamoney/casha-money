"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const TYPES = [
  { value: "Bank", label: "Bank Account", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></svg> },
  { value: "Cash", label: "Cash", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { value: "Credit Card", label: "Credit Card", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
  { value: "UPI", label: "UPI / Digital", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
  { value: "Investment", label: "Investment", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
  { value: "Other", label: "Other", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
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
  const [error, setError] = useState("");

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
    setError("");
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) { setSaving(false); return; }
    const { error: insertError } = await supabase.from("accounts").insert({
      user_id: u.user.id,
      name: name.trim(),
      account_type: type,
      current_balance: Number(balance),
      currency: "INR",
      color: "#22C55E",
      is_active: true,
    });
    if (insertError) { setError(insertError.message); setSaving(false); return; }
    setName(""); setType("Bank"); setBalance(""); setShowForm(false); setSaving(false); load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("accounts").update({ is_active: false }).eq("id", id);
    load();
  };

  if (loading) return (
    <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 24, height: 24, border: "2px solid #E5E7EB", borderTopColor: "#22C55E", borderRadius: "50%", animation: "xsp 0.6s linear infinite" }} />
      <style>{`@keyframes xsp { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const assetPct = (assets + debts) > 0 ? (assets / (assets + debts)) * 100 : 100;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8" }}>
      <div className="xw" style={{ maxWidth: 880, margin: "0 auto", padding: "28px 24px 64px" }}>

        {/* Header */}
        <div className="xh" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.04em" }}>Accounts</h1>
          <button
            onClick={() => { setShowForm(true); setError(""); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 22px", borderRadius: 10, border: "none",
              background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 4px 14px rgba(34,197,94,0.30)",
              transition: "transform 0.1s, box-shadow 0.1s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(34,197,94,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(34,197,94,0.30)"; }}>
            <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Account
          </button>
        </div>

        {/* Net Worth */}
        <div style={{ background: "#fff", borderRadius: 16, marginBottom: 14, display: "flex", overflow: "hidden", border: "1px solid #EBEBEB" }}>
          <div style={{ width: 4, background: "linear-gradient(180deg, #22C55E, #16A34A)", flexShrink: 0 }} />
          <div style={{ flex: 1, padding: "24px 28px 20px" }}>
            <div className="xnw" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.1 }}>Net Worth</p>
                <p style={{ fontSize: 34, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.04em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{fmt(totalBalance)}</p>
                <p style={{ fontSize: 12, color: "#9CA3AF", margin: "8px 0 0 0" }}>{accounts.length} account{accounts.length !== 1 ? "s" : ""}</p>
              </div>
              <div style={{ display: "flex", gap: 24, alignItems: "center", paddingTop: 2 }}>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 10, color: "#9CA3AF", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.05 }}>Assets</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: "#22C55E", margin: 0, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{fmt(assets)}</p>
                </div>
                <div style={{ width: 1, height: 28, background: "#F0F0F0" }} />
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 10, color: "#9CA3AF", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.05 }}>Debts</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: debts > 0 ? "#EF4444" : "#9CA3AF", margin: 0, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{debts > 0 ? fmt(debts) : "\u2014"}</p>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <div style={{ height: 5, borderRadius: 5, background: "#F3F4F6", overflow: "hidden" }}>
                <div style={{ width: `${assetPct}%`, height: "100%", borderRadius: 5, background: "linear-gradient(90deg, #22C55E, #16A34A)", transition: "width 0.5s ease" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="xq" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 28 }}>
          {[
            { label: "Banks", count: accounts.filter(a => a.account_type === "Bank").length },
            { label: "Cards", count: accounts.filter(a => a.account_type === "Credit Card").length },
            { label: "Invested", count: accounts.filter(a => a.account_type === "Investment").length },
            { label: "Other", count: accounts.filter(a => !["Bank", "Credit Card", "Investment"].includes(a.account_type)).length },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: 7, background: "#22C55E", flexShrink: 0, opacity: 0.6 }} />
              <div>
                <p style={{ fontSize: 17, fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{s.count}</p>
                <p style={{ fontSize: 10, color: "#9CA3AF", margin: "2px 0 0 0", fontWeight: 500 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Grouped Accounts */}
        {grouped.length > 0 && grouped.map(g => (
          <div key={g.value} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "0 2px" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#F0FDF4", border: "1px solid #DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", color: "#22C55E", flexShrink: 0 }}>{g.icon}</div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{g.label}</span>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{g.items.length}</span>
              <div style={{ flex: 1, height: 1, background: "#F0F0F0" }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: "#111827", letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>{fmt(g.total)}</span>
            </div>
            <div className="xcg" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(255px, 1fr))", gap: 10 }}>
              {g.items.map(a => {
                const meta = getTypeMeta(a.account_type);
                const bal = Number(a.current_balance || 0);
                const accountName = a.name || a.account_name || "Untitled";
                return (
                  <div key={a.id}
                    style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 14, display: "flex", overflow: "hidden", transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#BBF7D0"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(34,197,94,0.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#EBEBEB"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
                    <div style={{ width: 4, background: "linear-gradient(180deg, #22C55E, #16A34A)", flexShrink: 0 }} />
                    <div style={{ flex: 1, padding: "16px 18px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: "#F0FDF4", border: "1px solid #DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", color: "#22C55E", flexShrink: 0 }}>{meta.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{accountName}</p>
                          <p style={{ fontSize: 10, color: "#9CA3AF", margin: "2px 0 0 0" }}>{meta.label}</p>
                        </div>
                        <button onClick={() => handleDelete(a.id)}
                          style={{ width: 26, height: 26, borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#E5E7EB", transition: "color 0.12s, background 0.12s" }}
                          onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "#FEF2F2"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "#E5E7EB"; e.currentTarget.style.background = "transparent"; }}>
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                      <p style={{ fontSize: 9, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.08, margin: "0 0 3px" }}>Balance</p>
                      <p style={{ fontSize: 20, fontWeight: 800, color: bal >= 0 ? "#111827" : "#DC2626", margin: 0, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{fmt(bal)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {accounts.length === 0 && (
          <div style={{ textAlign: "center", padding: "72px 24px 40px" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "#F0FDF4", border: "1px solid #DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              <svg width="28" height="28" fill="none" stroke="#22C55E" strokeWidth="1.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 6px", letterSpacing: "-0.02em" }}>No accounts yet</h2>
            <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 24px", maxWidth: 320, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>Add your bank, card, or investment account to get started.</p>
            <button onClick={() => { setShowForm(true); setError(""); }}
              style={{ padding: "11px 26px", borderRadius: 10, border: "none", background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(34,197,94,0.30)" }}>
              Add your first account
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.45)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}
          onClick={() => setShowForm(false)}>
          <div className="xm" style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 440, boxShadow: "0 32px 64px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", overflow: "hidden", borderRadius: "18px 18px 0 0" }}>
              <div style={{ width: 4, background: "linear-gradient(180deg, #22C55E, #16A34A)" }} />
              <div style={{ flex: 1, padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: 0 }}>New Account</h2>
                <button onClick={() => setShowForm(false)} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #EBEBEB", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div style={{ padding: "16px 26px 26px" }}>
              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#DC2626", fontWeight: 500 }}>{error}</p>
                </div>
              )}

              <label style={{ display: "block", marginBottom: 8, fontSize: 10, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.06 }}>Type</label>
              <div className="xmt" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 18 }}>
                {TYPES.map(t => {
                  const sel = type === t.value;
                  return (
                    <button key={t.value} onClick={() => setType(t.value)}
                      style={{ background: sel ? "#F0FDF4" : "#FAFAFA", border: sel ? "1.5px solid #22C55E" : "1.5px solid #EBEBEB", borderRadius: 10, padding: "12px 6px", cursor: "pointer", textAlign: "center", transition: "0.12s", fontFamily: "inherit" }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: sel ? "#DCFCE7" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", color: sel ? "#22C55E" : "#9CA3AF", margin: "0 auto 4px" }}>{t.icon}</div>
                      <span style={{ fontSize: 10, fontWeight: sel ? 700 : 500, color: sel ? "#22C55E" : "#6B7280" }}>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 5, fontSize: 10, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.06 }}>Account Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. HDFC Savings"
                  style={{ width: "100%", height: 42, borderRadius: 10, padding: "0 14px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "#FAFAFA", border: "1.5px solid #EBEBEB", color: "#111827", boxSizing: "border-box", transition: "border-color 0.15s" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#22C55E"}
                  onBlur={e => e.currentTarget.style.borderColor = "#EBEBEB"} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 5, fontSize: 10, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.06 }}>Opening Balance</label>
                <input type="number" required value={balance} onChange={e => setBalance(e.target.value)} placeholder="0"
                  style={{ width: "100%", height: 42, borderRadius: 10, padding: "0 14px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "#FAFAFA", border: "1.5px solid #EBEBEB", color: "#111827", boxSizing: "border-box", transition: "border-color 0.15s" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#22C55E"}
                  onBlur={e => e.currentTarget.style.borderColor = "#EBEBEB"} />
              </div>

              <button onClick={handleAdd} disabled={saving}
                style={{ width: "100%", height: 44, borderRadius: 10, border: "none", background: "#22C55E", color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "wait" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1, boxShadow: "0 4px 14px rgba(34,197,94,0.30)" }}>
                {saving ? "Saving..." : "Add Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        @keyframes xsp { to { transform: rotate(360deg); } }
        @media (max-width: 900px) { .xq { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) {
          .xw { padding: 20px 16px 0 !important; }
          .xq { grid-template-columns: repeat(2, 1fr) !important; }
          .xcg { grid-template-columns: 1fr !important; }
          .xnw { flex-direction: column !important; }
          .xh { flex-direction: column !important; align-items: flex-start !important; }
          .xh h1 { font-size: 22px !important; }
          .xm { max-width: 100% !important; border-radius: 14px !important; }
          .xmt { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) { .xw { padding: 16px 12px 0 !important; } }
      `}</style>
    </div>
  );
}