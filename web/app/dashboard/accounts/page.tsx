"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const TYPES = [
  { value: "Bank", label: "Bank Account", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></svg> },
  { value: "Cash", label: "Cash", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { value: "Credit Card", label: "Credit Card", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
  { value: "UPI", label: "UPI / Digital", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
  { value: "Investment", label: "Investment", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
  { value: "Other", label: "Other", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
];

function getTypeMeta(type: string) {
  return TYPES.find(t => t.value === type) || TYPES[TYPES.length - 1];
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
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

  const resetForm = () => {
    setName(""); setType("Bank"); setBalance(""); setError(""); setEditId(null);
  };

  const openAdd = () => { resetForm(); setShowForm(true); };

  const openEdit = (a: any) => {
    setEditId(a.id);
    setName(a.name || a.account_name || "");
    setType(a.account_type || "Bank");
    setBalance(String(Number(a.current_balance || 0)));
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !balance) return;
    setSaving(true);
    setError("");
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) { setSaving(false); return; }

    if (editId) {
      const { error: err } = await supabase.from("accounts").update({
        name: name.trim(),
        account_type: type,
        current_balance: Number(balance),
      }).eq("id", editId);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from("accounts").insert({
        user_id: u.user.id,
        name: name.trim(),
        account_type: type,
        current_balance: Number(balance),
        currency: "INR",
        color: "#22C55E",
        is_active: true,
      });
      if (err) { setError(err.message); setSaving(false); return; }
    }

    resetForm(); setShowForm(false); setSaving(false); load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("accounts").update({ is_active: false }).eq("id", id);
    load();
  };

  if (loading) return (
    <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 22, height: 22, border: "2px solid var(--border)", borderTopColor: "#22C55E", borderRadius: "50%", animation: "xsp 0.6s linear infinite" }} />
      <style>{`@keyframes xsp { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const assetPct = (assets + debts) > 0 ? (assets / (assets + debts)) * 100 : 100;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="xw" style={{ maxWidth: 860, margin: "0 auto", padding: "28px 24px 64px" }}>

        <div className="xh" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Accounts</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "3px 0 0 0" }}>Manage your financial accounts</p>
          </div>
          <button onClick={openAdd}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "9px 18px", borderRadius: 8, border: "none",
              background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#16A34A"}
            onMouseLeave={e => e.currentTarget.style.background = "#22C55E"}>
            <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Account
          </button>
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderTop: "2px solid #22C55E", borderRadius: 10, padding: "20px 24px 16px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.08 }}>Net Worth</p>
              <p style={{ fontSize: 30, fontWeight: 700, color: "var(--text)", margin: 0, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{fmt(totalBalance)}</p>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: "6px 0 0 0" }}>{accounts.length} account{accounts.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="xnw" style={{ display: "flex", gap: 20 }}>
              <div>
                <p style={{ fontSize: 10, color: "var(--muted)", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase" }}>Assets</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#22C55E", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(assets)}</p>
              </div>
              <div style={{ width: 1, background: "var(--border)" }} />
              <div>
                <p style={{ fontSize: 10, color: "var(--muted)", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase" }}>Debts</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: debts > 0 ? "#EF4444" : "var(--muted)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{debts > 0 ? fmt(debts) : "None"}</p>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ height: 4, borderRadius: 2, background: "var(--border)", overflow: "hidden" }}>
              <div style={{ width: `${assetPct}%`, height: "100%", background: "#22C55E", borderRadius: 2, transition: "width 0.4s ease" }} />
            </div>
          </div>
        </div>

        {grouped.length > 0 && grouped.map(g => (
          <div key={g.value} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "#22C55E", flexShrink: 0 }}>{g.icon}</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{g.label}</span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{g.items.length}</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{fmt(g.total)}</span>
            </div>
            <div className="xcg" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 8 }}>
              {g.items.map(a => {
                const meta = getTypeMeta(a.account_type);
                const bal = Number(a.current_balance || 0);
                const accountName = a.name || a.account_name || "Untitled";
                return (
                  <div key={a.id}
                    style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px", transition: "border-color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#22C55E"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 7, background: "var(--bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "#22C55E", flexShrink: 0 }}>{meta.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{accountName}</p>
                        <p style={{ fontSize: 10, color: "var(--muted)", margin: "1px 0 0 0" }}>{meta.label}</p>
                      </div>
                      <button onClick={() => openEdit(a)}
                        style={{ width: 24, height: 24, borderRadius: 5, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--border)", transition: "color 0.12s", flexShrink: 0 }}
                        onMouseEnter={e => e.currentTarget.style.color = "var(--muted)"}
                        onMouseLeave={e => e.currentTarget.style.color = "var(--border)"}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(a.id)}
                        style={{ width: 24, height: 24, borderRadius: 5, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--border)", transition: "color 0.12s", flexShrink: 0 }}
                        onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
                        onMouseLeave={e => e.currentTarget.style.color = "var(--border)"}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    <p style={{ fontSize: 18, fontWeight: 700, color: bal >= 0 ? "var(--text)" : "#EF4444", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(bal)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {accounts.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px 40px" }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: "var(--card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#22C55E" }}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>No accounts yet</h2>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 18px", maxWidth: 280, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>Add your bank, card, or investment to get started.</p>
            <button onClick={openAdd}
              style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Add your first account
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}
          onClick={() => { setShowForm(false); resetForm(); }}>
          <div className="xm" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, width: "100%", maxWidth: 400, maxHeight: "90vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: "18px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0 }}>{editId ? "Edit Account" : "New Account"}</h2>
              <button onClick={() => { setShowForm(false); resetForm(); }} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div style={{ padding: "14px 22px 22px" }}>
              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 6, padding: "8px 10px", marginBottom: 10 }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#DC2626", fontWeight: 500 }}>{error}</p>
                </div>
              )}
              <label style={{ display: "block", marginBottom: 6, fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05 }}>Type</label>
              <div className="xmt" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, marginBottom: 14 }}>
                {TYPES.map(t => {
                  const sel = type === t.value;
                  return (
                    <button key={t.value} onClick={() => setType(t.value)}
                      style={{ background: sel ? "rgba(34,197,94,0.08)" : "var(--bg)", border: sel ? "1px solid #22C55E" : "1px solid var(--border)", borderRadius: 6, padding: "8px 4px", cursor: "pointer", textAlign: "center", transition: "0.1s", fontFamily: "inherit" }}>
                      <div style={{ width: 22, height: 22, borderRadius: 5, background: sel ? "rgba(34,197,94,0.15)" : "var(--card)", display: "flex", alignItems: "center", justifyContent: "center", color: sel ? "#22C55E" : "var(--muted)", margin: "0 auto 3px" }}>{t.icon}</div>
                      <span style={{ fontSize: 9, fontWeight: sel ? 600 : 400, color: sel ? "#22C55E" : "var(--muted)" }}>{t.label}</span>
                    </button>
                  );
                })}
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05 }}>Account Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. HDFC Savings"
                  style={{ width: "100%", height: 38, borderRadius: 6, padding: "0 12px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", transition: "border-color 0.15s" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#22C55E"}
                  onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05 }}>Balance</label>
                <input type="number" required value={balance} onChange={e => setBalance(e.target.value)} placeholder="0"
                  style={{ width: "100%", height: 38, borderRadius: 6, padding: "0 12px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", transition: "border-color 0.15s" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#22C55E"}
                  onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
              </div>
              <button onClick={handleSave} disabled={saving}
                style={{ width: "100%", height: 40, borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "wait" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1, transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#16A34A"}
                onMouseLeave={e => e.currentTarget.style.background = "#22C55E"}>
                {saving ? "Saving..." : editId ? "Update Account" : "Add Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        @keyframes xsp { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .xw { padding: 20px 16px 0 !important; }
          .xcg { grid-template-columns: 1fr !important; }
          .xnw { flex-direction: column !important; gap: 12px !important; }
          .xh { flex-direction: column !important; align-items: flex-start !important; }
          .xm { max-width: 100% !important; }
          .xmt { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .xw { padding: 16px 12px 0 !important; }
        }
      `}</style>
    </div>
  );
}