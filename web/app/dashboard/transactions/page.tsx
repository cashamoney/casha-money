"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabase";

const CATS = [
  { name: "Housing/Rent", color: "#6366F1" },
  { name: "Groceries", color: "#22C55E" },
  { name: "Food Delivery", color: "#F97316" },
  { name: "Transportation", color: "#3B82F6" },
  { name: "EMI Payment", color: "#EF4444" },
  { name: "Entertainment", color: "#EC4899" },
  { name: "Shopping", color: "#A855F7" },
  { name: "Healthcare", color: "#14B8A6" },
  { name: "Education", color: "#8B5CF6" },
  { name: "Subscription", color: "#F43F5E" },
  { name: "Streaming/OTT", color: "#E11D48" },
  { name: "Insurance", color: "#0EA5E9" },
  { name: "Savings", color: "#10B981" },
  { name: "Salary", color: "#22C55E" },
  { name: "Freelance", color: "#3B82F6" },
  { name: "Investment", color: "#8B5CF6" },
  { name: "Refund", color: "#F97316" },
  { name: "Other Income", color: "#64748B" },
  { name: "Other Expense", color: "#64748B" },
];

function getCat(n: string) { return CATS.find(c => c.name === n) || CATS[CATS.length - 1]; }

function Av({ name, color, small }: { name: string; color: string; small?: boolean }) {
  const sz = small ? 26 : 30;
  let l: string;
  if (name === "Housing/Rent") l = "H";
  else if (name === "Food Delivery") l = "FD";
  else if (name === "EMI Payment") l = "EM";
  else if (name === "Streaming/OTT") l = "ST";
  else if (name === "Other Expense") l = "OT";
  else if (name === "Other Income") l = "OI";
  else l = name.charAt(0);
  return (
    <div style={{
      width: sz, height: sz, borderRadius: 7,
      background: color + "12", color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: small ? 9 : 11, fontWeight: 700, flexShrink: 0,
      border: `1px solid ${color}18`
    }}>{l}</div>
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
}

function fmtDate(d: string) {
  const dt = new Date(d + "T00:00:00");
  const t = new Date();
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (dt.toDateString() === t.toDateString()) return "Today";
  if (dt.toDateString() === y.toDateString()) return "Yesterday";
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

type Txn = {
  id: string;
  description: string;
  amount: number;
  category: string;
  transaction_type: string;
  transaction_date: string;
  account_id: string;
  accounts?: { name: string } | null;
};

export default function TransactionsPage() {
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "income" | "expense">("all");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [sort, setSort] = useState<"date" | "amount">("date");
  const [showAdd, setShowAdd] = useState(false);
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "Groceries",
    type: "expense" as "income" | "expense",
    date: new Date().toISOString().split("T")[0],
    account_id: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [added, setAdded] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    const uid = u.user.id;

    const { data: aData } = await supabase.from("accounts").select("id, name").eq("user_id", uid);
    setAccounts((aData || []) as { id: string; name: string }[]);
    if (aData && aData.length > 0 && !form.account_id) {
      setForm(f => ({ ...f, account_id: aData[0].id }));
    }

    const { data: tData } = await supabase
      .from("transactions")
      .select("id, description, amount, category, transaction_type, transaction_date, account_id, accounts(name)")
      .eq("user_id", uid)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    setTxns((tData || []) as Txn[]);
    setLoading(false);
  };

  const submit = async () => {
    setErr("");
    if (!form.description.trim()) { setErr("Enter a description."); return; }
    if (!form.amount || Number(form.amount) <= 0) { setErr("Enter a valid amount."); return; }
    if (!form.account_id) { setErr("Select an account."); return; }
    setSubmitting(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) { setSubmitting(false); return; }

    const amt = form.type === "expense" ? -Math.abs(Number(form.amount)) : Math.abs(Number(form.amount));
    const { error } = await supabase.from("transactions").insert({
      user_id: u.user.id,
      description: form.description.trim(),
      amount: amt,
      category: form.category,
      transaction_type: form.type,
      transaction_date: form.date,
      account_id: form.account_id,
    });

    setSubmitting(false);
    if (error) { setErr("Failed to add. Try again."); return; }
    setAdded(true);
    setTimeout(() => { setAdded(false); setShowAdd(false); }, 1500);
    setForm({ description: "", amount: "", category: "Groceries", type: "expense", date: new Date().toISOString().split("T")[0], account_id: form.account_id });
    load();
  };

  const filtered = useMemo(() => {
    let f = [...txns];
    if (tab === "income") f = f.filter(t => t.transaction_type === "income");
    if (tab === "expense") f = f.filter(t => t.transaction_type === "expense");
    if (search.trim()) {
      const s = search.toLowerCase();
      f = f.filter(t => t.description?.toLowerCase().includes(s) || t.category?.toLowerCase().includes(s));
    }
    if (catFilter) f = f.filter(t => t.category === catFilter);
    if (sort === "date") f.sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));
    else f.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    return f;
  }, [txns, tab, search, catFilter, sort]);

  const totalIn = txns.filter(t => t.transaction_type === "income").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const totalOut = txns.filter(t => t.transaction_type === "expense").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const net = totalIn - totalOut;

  const grouped = useMemo(() => {
    const g: { label: string; items: Txn[] }[] = [];
    let cur = "";
    filtered.forEach(t => {
      const l = fmtDate(t.transaction_date);
      if (l !== cur) { cur = l; g.push({ label: l, items: [] }); }
      g[g.length - 1].items.push(t);
    });
    return g;
  }, [filtered]);

  const activeCats = useMemo(() => {
    const s = new Set<string>();
    txns.forEach(t => { if (t.category) s.add(t.category); });
    return Array.from(s).sort();
  }, [txns]);

  if (loading) return (
    <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 20, height: 20, border: "2px solid var(--border)", borderTopColor: "#22C55E", borderRadius: "50%", animation: "sp 0.6s linear infinite" }} />
      <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="bw" style={{ maxWidth: 780, margin: "0 auto", padding: "28px 24px 64px" }}>

        {/* Header */}
        <div className="bh" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Transactions</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "2px 0 0 0" }}>Track every rupee in and out</p>
          </div>
          <button onClick={() => { setShowAdd(!showAdd); setErr(""); }}
            style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s", display: "flex", alignItems: "center", gap: 5 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#16A34A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#22C55E"; }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Add
          </button>
        </div>

        {/* Add Form */}
        {showAdd && (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px", marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 12px" }}>New Transaction</p>

            {/* Type toggle */}
            <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
              {(["expense", "income"] as const).map(t => (
                <button key={t} onClick={() => { setForm({ ...form, type: t, category: t === "income" ? "Salary" : "Groceries" }); }}
                  style={{ flex: 1, padding: "7px 0", borderRadius: 6, border: "1px solid " + (form.type === t ? (t === "income" ? "#22C55E" : "#EF4444") + "44" : "var(--border)"), background: form.type === t ? (t === "income" ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)") : "transparent", color: form.type === t ? (t === "income" ? "#22C55E" : "#EF4444") : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "0.15s" }}>
                  {t === "income" ? "Income" : "Expense"}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <input placeholder="Description" value={form.description} onChange={(e) => { setForm({ ...form, description: e.target.value }); }}
                style={{ height: 34, borderRadius: 6, padding: "0 10px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: "100%" }} />
              <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => { setForm({ ...form, amount: e.target.value }); }}
                style={{ height: 34, borderRadius: 6, padding: "0 10px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: "100%", fontVariantNumeric: "tabular-nums" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
              <select value={form.category} onChange={(e) => { setForm({ ...form, category: e.target.value }); }}
                style={{ height: 34, borderRadius: 6, padding: "0 8px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: "100%" }}>
                {(form.type === "income" ? ["Salary", "Freelance", "Investment", "Refund", "Other Income"] : ["Housing/Rent", "Groceries", "Food Delivery", "Transportation", "EMI Payment", "Entertainment", "Shopping", "Healthcare", "Education", "Subscription", "Streaming/OTT", "Insurance", "Savings", "Other Expense"]).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input type="date" value={form.date} onChange={(e) => { setForm({ ...form, date: e.target.value }); }}
                style={{ height: 34, borderRadius: 6, padding: "0 8px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: "100%" }} />
              <select value={form.account_id} onChange={(e) => { setForm({ ...form, account_id: e.target.value }); }}
                style={{ height: 34, borderRadius: 6, padding: "0 8px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: "100%" }}>
                {accounts.map(a => (<option key={a.id} value={a.id}>{a.name}</option>))}
              </select>
            </div>

            {err && <p style={{ fontSize: 11, color: "#EF4444", margin: "0 0 8px", fontWeight: 500 }}>{err}</p>}

            <button onClick={submit} disabled={submitting}
              style={{ width: "100%", height: 36, borderRadius: 6, border: "none", background: added ? "#16A34A" : "#22C55E", color: "#fff", fontSize: 12, fontWeight: 600, cursor: submitting ? "wait" : "pointer", fontFamily: "inherit", opacity: submitting ? 0.7 : 1, transition: "background 0.15s" }}
              onMouseEnter={(e) => { if (!submitting && !added) e.currentTarget.style.background = "#16A34A"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = added ? "#16A34A" : "#22C55E"; }}>
              {submitting ? "Adding..." : added ? "Added" : "Add Transaction"}
            </button>
          </div>
        )}

        {txns.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px 40px" }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>No transactions yet</h2>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 20px", maxWidth: 280, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>Add your first transaction to start tracking your money.</p>
            <button onClick={() => { setShowAdd(true); }}
              style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#16A34A"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#22C55E"; }}>
              Add Transaction
            </button>
          </div>
        ) : (
          <>
            {/* Hero */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 32, fontWeight: 700, color: net >= 0 ? "#22C55E" : "#EF4444", margin: 0, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
                {net >= 0 ? "" : "-"}{fmt(Math.abs(net))}
              </p>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0 0" }}>net cash flow</p>
              <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                <div>
                  <span style={{ width: 7, height: 7, borderRadius: 4, background: "#22C55E", display: "inline-block", marginRight: 4 }} />
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Income </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#22C55E", fontVariantNumeric: "tabular-nums" }}>{fmt(totalIn)}</span>
                </div>
                <div>
                  <span style={{ width: 7, height: 7, borderRadius: 4, background: "#EF4444", display: "inline-block", marginRight: 4 }} />
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Expense </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#EF4444", fontVariantNumeric: "tabular-nums" }}>{fmt(totalOut)}</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              <input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); }}
                style={{ height: 30, borderRadius: 6, padding: "0 10px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: 160, transition: "border-color 0.15s" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#22C55E44"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }} />
              {activeCats.length > 1 && (
                <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); }}
                  style={{ height: 30, borderRadius: 6, padding: "0 8px", fontSize: 11, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box" }}>
                  <option value="">All categories</option>
                  {activeCats.map(c => (<option key={c} value={c}>{c}</option>))}
                </select>
              )}
              <select value={sort} onChange={(e) => { setSort(e.target.value as "date" | "amount"); }}
                style={{ height: 30, borderRadius: 6, padding: "0 8px", fontSize: 11, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", marginLeft: "auto" }}>
                <option value="date">By date</option>
                <option value="amount">By amount</option>
              </select>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 8, borderBottom: "1px solid var(--border)" }}>
              {([["all", "All"], ["income", "Income"], ["expense", "Expense"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => { setTab(k as "all" | "income" | "expense"); }}
                  style={{ padding: "8px 14px", borderRadius: "6px 6px 0 0", border: "none", background: tab === k ? "var(--card)" : "transparent", color: tab === k ? "var(--text)" : "var(--muted)", fontSize: 12, fontWeight: tab === k ? 600 : 500, cursor: "pointer", fontFamily: "inherit", transition: "0.15s", borderBottom: tab === k ? "2px solid #22C55E" : "2px solid transparent", marginBottom: -1 }}>
                  {l}
                </button>
              ))}
            </div>

            {/* List */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>No transactions found</p>
              </div>
            ) : (
              <div style={{ paddingTop: 6 }}>
                {grouped.map(g => (
                  <div key={g.label}>
                    <div style={{ padding: "8px 12px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.03 }}>{g.label}</span>
                      <span style={{ fontSize: 10, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                        {fmt(g.items.reduce((s, t) => s + (t.transaction_type === "income" ? Math.abs(Number(t.amount)) : -Math.abs(Number(t.amount))), 0))}
                      </span>
                    </div>
                    {g.items.map(t => {
                      const cat = getCat(t.category);
                      const isInc = t.transaction_type === "income";
                      const amt = Math.abs(Number(t.amount));
                      const acct = (t.accounts as any)?.name || "";
                      return (
                        <div key={t.id} style={{ padding: "9px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 10, transition: "background 0.1s", cursor: "default" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--card)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                          <Av name={t.category || "Other Expense"} color={cat.color} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.description || t.category}</p>
                            <p style={{ fontSize: 10, color: "var(--muted)", margin: "1px 0 0 0" }}>
                              {t.category}{acct ? ` · ${acct}` : ""}
                            </p>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: isInc ? "#22C55E" : "#EF4444", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                            {isInc ? "+" : "-"}{fmt(amt)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Count */}
            <div style={{ padding: "12px 12px 0", borderTop: "1px solid var(--border)", marginTop: 8 }}>
              <p style={{ fontSize: 10, color: "var(--muted)", margin: 0, fontVariantNumeric: "tabular-nums" }}>
                {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}{catFilter ? ` in ${catFilter}` : ""}{tab !== "all" ? ` · ${tab}` : ""}
              </p>
            </div>
          </>
        )}
      </div>

      <style>{`
        *{box-sizing:border-box}
        @keyframes sp{to{transform:rotate(360deg)}}
        @media(max-width:640px){
          .bh{flex-direction:column!important;align-items:flex-start!important}
        }
      `}</style>
    </div>
  );
}