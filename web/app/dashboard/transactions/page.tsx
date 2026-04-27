"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../lib/supabase";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const CATS = [
  { value: "Food", label: "Food", color: "#F97316" },
  { value: "Shopping", label: "Shopping", color: "#8B5CF6" },
  { value: "Transport", label: "Transport", color: "#3B82F6" },
  { value: "Bills", label: "Bills", color: "#EAB308" },
  { value: "Entertainment", label: "Fun", color: "#EC4899" },
  { value: "Health", label: "Health", color: "#EF4444" },
  { value: "Education", label: "Education", color: "#6366F1" },
  { value: "Salary", label: "Salary", color: "#22C55E" },
  { value: "Freelance", label: "Freelance", color: "#06B6D4" },
  { value: "Investment", label: "Invest", color: "#10B981" },
  { value: "Rent", label: "Rent", color: "#F59E0B" },
  { value: "Other", label: "Other", color: "#6B7280" },
];

function getCat(v: string) {
  return CATS.find(c => c.value === v) || CATS[CATS.length - 1];
}

function groupByDate(txns: any[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const groups: { label: string; items: any[] }[] = [];
  const map = new Map<string, any[]>();
  txns.forEach(t => {
    const d = new Date(t.transaction_date);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    let label: string;
    if (day.getTime() === today.getTime()) label = "Today";
    else if (day.getTime() === yesterday.getTime()) label = "Yesterday";
    else label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (!map.has(label)) { map.set(label, []); groups.push({ label, items: map.get(label)! }); }
    map.get(label)!.push(t);
  });
  return groups;
}

export default function TransactionsPage() {
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [search, setSearch] = useState("");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [txType, setTxType] = useState<"income" | "expense">("expense");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    const { data } = await supabase.from("transactions").select("*").eq("user_id", u.user.id).order("transaction_date", { ascending: false });
    setTxns(data || []);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return txns.filter(t => {
      if (filter !== "all" && t.transaction_type !== filter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!(t.merchant_name || "").toLowerCase().includes(s) && !(t.category || "").toLowerCase().includes(s) && !(t.note || "").toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [txns, filter, search]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const mTx = txns.filter(t => { const d = new Date(t.transaction_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const mInc = mTx.filter(t => t.transaction_type === "income").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const mExp = mTx.filter(t => t.transaction_type === "expense").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const mNet = mInc - mExp;

  const handleAdd = async () => {
    if (!merchant.trim() || !amount) return;
    setSaving(true); setError("");
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) { setSaving(false); return; }
    const { error: err } = await supabase.from("transactions").insert({
      user_id: u.user.id,
      merchant_name: merchant.trim(),
      amount: txType === "expense" ? -Math.abs(Number(amount)) : Math.abs(Number(amount)),
      transaction_type: txType,
      category,
      transaction_date: txDate,
      note: note.trim(),
    });
    if (err) { setError(err.message); setSaving(false); return; }
    setMerchant(""); setAmount(""); setCategory("Food"); setTxType("expense"); setTxDate(new Date().toISOString().split("T")[0]); setNote(""); setShowForm(false); setSaving(false); load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("transactions").delete().eq("id", id);
    load();
  };

  if (loading) return (
    <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 22, height: 22, border: "2px solid var(--border)", borderTopColor: "#22C55E", borderRadius: "50%", animation: "xsp 0.6s linear infinite" }} />
      <style>{`@keyframes xsp { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="xw" style={{ maxWidth: 860, margin: "0 auto", padding: "28px 24px 64px" }}>

        {/* Header */}
        <div className="xh" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Transactions</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "3px 0 0 0" }}>{txns.length} total</p>
          </div>
          <button onClick={() => { setShowForm(true); setError(""); }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#16A34A"}
            onMouseLeave={e => e.currentTarget.style.background = "#22C55E"}>
            <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Transaction
          </button>
        </div>

        {/* Summary */}
        <div className="xsum" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.05 }}>Income · {monthLabel}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#22C55E", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(mInc)}</p>
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.05 }}>Expense · {monthLabel}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(mExp)}</p>
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.05 }}>Net · {monthLabel}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: mNet >= 0 ? "#22C55E" : "#EF4444", margin: 0, fontVariantNumeric: "tabular-nums" }}>{mNet >= 0 ? "+" : ""}{fmt(mNet)}</p>
          </div>
        </div>

        {/* Search + Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <svg width="14" height="14" fill="none" stroke="var(--muted)" strokeWidth="1.5" viewBox="0 0 24 24" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" /></svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..."
              style={{ width: "100%", height: 38, borderRadius: 8, padding: "0 12px 0 36px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", transition: "border-color 0.15s" }}
              onFocus={e => e.currentTarget.style.borderColor = "#22C55E"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
          </div>
          {(["all", "income", "expense"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid " + (filter === f ? "#22C55E" : "var(--border)"), background: filter === f ? "rgba(34,197,94,0.08)" : "var(--card)", color: filter === f ? "#22C55E" : "var(--muted)", fontSize: 12, fontWeight: filter === f ? 600 : 500, cursor: "pointer", fontFamily: "inherit", transition: "0.1s", textTransform: "capitalize" }}>
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        {groups.length === 0 && txns.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px 40px" }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: "var(--card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#22C55E" }}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3" /></svg>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>No transactions yet</h2>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 18px", maxWidth: 280, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>Start tracking your money by adding your first transaction.</p>
            <button onClick={() => { setShowForm(true); setError(""); }} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Add transaction</button>
          </div>
        ) : groups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 24px" }}>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>No transactions match your search.</p>
          </div>
        ) : (
          groups.map(g => (
            <div key={g.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, padding: "0 2px" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>{g.label}</span>
                <span style={{ fontSize: 11, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{fmt(g.items.reduce((s, t) => s + (t.transaction_type === "income" ? Math.abs(Number(t.amount)) : -Math.abs(Number(t.amount))), 0))}</span>
              </div>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                {g.items.map((t, i) => {
                  const cat = getCat(t.category);
                  const amt = Math.abs(Number(t.amount));
                  const isInc = t.transaction_type === "income";
                  return (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderBottom: i < g.items.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ width: 8, height: 8, borderRadius: 8, background: cat.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.merchant_name || t.category}</p>
                          <span style={{ fontSize: 10, fontWeight: 500, color: "var(--muted)", background: "var(--bg)", padding: "1px 6px", borderRadius: 4, flexShrink: 0 }}>{cat.label}</span>
                        </div>
                        {t.note && <p style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.note}</p>}
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: isInc ? "#22C55E" : "var(--text)", margin: 0, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{isInc ? "+" : "-"}{fmt(amt)}</p>
                      <button onClick={() => handleDelete(t.id)}
                        style={{ width: 24, height: 24, borderRadius: 5, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "transparent", transition: "color 0.12s", flexShrink: 0 }}
                        onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
                        onMouseLeave={e => e.currentTarget.style.color = "transparent"}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}
          onClick={() => setShowForm(false)}>
          <div className="xm" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, width: "100%", maxWidth: 400, maxHeight: "90vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: "18px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0 }}>New Transaction</h2>
              <button onClick={() => setShowForm(false)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div style={{ padding: "14px 22px 22px" }}>
              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 6, padding: "8px 10px", marginBottom: 10 }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#DC2626", fontWeight: 500 }}>{error}</p>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 14 }}>
                {(["expense", "income"] as const).map(t => (
                  <button key={t} onClick={() => setTxType(t)}
                    style={{ padding: "8px", borderRadius: 6, border: "1px solid " + (txType === t ? "#22C55E" : "var(--border)"), background: txType === t ? "rgba(34,197,94,0.08)" : "var(--bg)", color: txType === t ? "#22C55E" : "var(--muted)", fontSize: 12, fontWeight: txType === t ? 600 : 400, cursor: "pointer", fontFamily: "inherit", transition: "0.1s", textTransform: "capitalize" }}>
                    {t === "income" ? "+ " : "\u2212 "}{t}
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05 }}>Merchant / Description</label>
                <input type="text" required value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="e.g. Swiggy, Salary"
                  style={{ width: "100%", height: 38, borderRadius: 6, padding: "0 12px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", transition: "border-color 0.15s" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#22C55E"}
                  onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05 }}>Amount</label>
                <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
                  style={{ width: "100%", height: 38, borderRadius: 6, padding: "0 12px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", transition: "border-color 0.15s" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#22C55E"}
                  onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05 }}>Category</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {CATS.map(c => (
                    <button key={c.value} onClick={() => setCategory(c.value)}
                      style={{ padding: "5px 10px", borderRadius: 5, border: "1px solid " + (category === c.value ? c.color : "var(--border)"), background: category === c.value ? c.color + "14" : "var(--bg)", color: category === c.value ? c.color : "var(--muted)", fontSize: 11, fontWeight: category === c.value ? 600 : 400, cursor: "pointer", fontFamily: "inherit", transition: "0.1s", display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 5, height: 5, borderRadius: 5, background: c.color, flexShrink: 0 }} />{c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05 }}>Date</label>
                <input type="date" value={txDate} onChange={e => setTxDate(e.target.value)}
                  style={{ width: "100%", height: 38, borderRadius: 6, padding: "0 12px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", transition: "border-color 0.15s" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#22C55E"}
                  onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05 }}>Note (optional)</label>
                <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..."
                  style={{ width: "100%", height: 38, borderRadius: 6, padding: "0 12px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", transition: "border-color 0.15s" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#22C55E"}
                  onBlur={e => e.currentTarget.style.borderColor = "var(--border)"} />
              </div>
              <button onClick={handleAdd} disabled={saving}
                style={{ width: "100%", height: 40, borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "wait" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1, transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#16A34A"}
                onMouseLeave={e => e.currentTarget.style.background = "#22C55E"}>
                {saving ? "Saving..." : "Add Transaction"}
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
          .xh { flex-direction: column !important; align-items: flex-start !important; }
          .xsum { grid-template-columns: 1fr !important; }
          .xm { max-width: 100% !important; }
        }
        @media (max-width: 480px) {
          .xw { padding: 16px 12px 0 !important; }
        }
      `}</style>
    </div>
  );
}