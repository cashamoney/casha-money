"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabase";

var CATS = [
  { name: "Housing/Rent", color: "#6366F1" },
  { name: "Groceries", color: "#22C55E" },
  { name: "Food Delivery", color: "#F97316" },
  { name: "Dining Out", color: "#FB923C" },
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
  { name: "Personal Care", color: "#F472B6" },
  { name: "Gifts & Donations", color: "#C084FC" },
  { name: "Pet Care", color: "#A3E635" },
  { name: "Home Maintenance", color: "#78716C" },
  { name: "Utilities", color: "#FACC15" },
  { name: "Internet & Phone", color: "#38BDF8" },
  { name: "Travel", color: "#2DD4BF" },
  { name: "Fitness", color: "#FB7185" },
  { name: "Baby & Kids", color: "#818CF8" },
  { name: "Clothing", color: "#E879F9" },
  { name: "Salary", color: "#22C55E" },
  { name: "Freelance", color: "#3B82F6" },
  { name: "Investment Returns", color: "#8B5CF6" },
  { name: "Refund", color: "#F97316" },
  { name: "Bonus", color: "#34D399" },
  { name: "Commission", color: "#60A5FA" },
  { name: "Rental Income", color: "#A78BFA" },
  { name: "Dividend", color: "#4ADE80" },
  { name: "Interest Income", color: "#FBBF24" },
  { name: "Gift Received", color: "#F9A8D4" },
  { name: "Cashback", color: "#86EFAC" },
  { name: "Side Hustle", color: "#FB923C" },
  { name: "Consulting", color: "#93C5FD" },
  { name: "Scholarship", color: "#C4B5FD" },
  { name: "Other Income", color: "#64748B" },
  { name: "Other Expense", color: "#64748B" },
];

var INCOME_CATS = ["Salary", "Freelance", "Investment Returns", "Refund", "Bonus", "Commission", "Rental Income", "Dividend", "Interest Income", "Gift Received", "Cashback", "Side Hustle", "Consulting", "Scholarship", "Other Income"];
var EXPENSE_CATS = ["Housing/Rent", "Groceries", "Food Delivery", "Dining Out", "Transportation", "EMI Payment", "Entertainment", "Shopping", "Healthcare", "Education", "Subscription", "Streaming/OTT", "Insurance", "Savings", "Personal Care", "Gifts & Donations", "Pet Care", "Home Maintenance", "Utilities", "Internet & Phone", "Travel", "Fitness", "Baby & Kids", "Clothing", "Other Expense"];

function getCat(n: string) { return CATS.find(function (c) { return c.name === n; }) || CATS[CATS.length - 1]; }

function Av(props: { name: string; color: string; small?: boolean }) {
  var sz = props.small ? 22 : 30;
  var n = props.name;
  var l = n === "Housing/Rent" ? "H" : n === "Food Delivery" ? "FD" : n === "EMI Payment" ? "EM" : n === "Streaming/OTT" ? "ST" : n === "Other Expense" ? "OT" : n === "Other Income" ? "OI" : n === "Investment Returns" ? "IR" : n === "Interest Income" ? "II" : n === "Gift Received" ? "GR" : n === "Rental Income" ? "RI" : n === "Side Hustle" ? "SH" : n === "Gifts & Donations" ? "GD" : n === "Pet Care" ? "PC" : n === "Home Maintenance" ? "HM" : n === "Internet & Phone" ? "IP" : n === "Baby & Kids" ? "BK" : n === "Dining Out" ? "DO" : n === "Personal Care" ? "PC" : n.charAt(0);
  return (
    <div style={{ width: sz, height: sz, borderRadius: 6, background: props.color + "12", color: props.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: props.small ? 8 : 11, fontWeight: 700, flexShrink: 0, border: "1px solid " + props.color + "18" }}>{l}</div>
  );
}

function Drop(props: { value: string; options: string[]; placeholder: string; onChange: (v: string) => void }) {
  var [open, setOpen] = useState(false);
  var sel = getCat(props.value);
  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={function () { setOpen(!open); }}
        style={{ height: 34, width: "100%", borderRadius: 6, padding: "0 10px", display: "flex", alignItems: "center", gap: 6, background: "var(--bg)", border: open ? "1px solid " + sel.color + "44" : "1px solid var(--border)", color: props.value ? "var(--text)" : "var(--muted)", fontSize: 12, fontFamily: "inherit", cursor: "pointer", transition: "border-color 0.15s", boxSizing: "border-box", outline: "none" }}>
        {props.value ? <Av name={props.value} color={sel.color} small /> : null}
        <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{props.value || props.placeholder}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open ? (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={function () { setOpen(false); }} />
          <div className="droplist" style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, marginTop: 2, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, maxHeight: 200, overflowY: "auto", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
            {props.options.map(function (c) {
              var cat = getCat(c);
              var isSel = c === props.value;
              return (
                <button key={c} type="button" onClick={function () { props.onChange(c); setOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 10px", width: "100%", border: "none", background: isSel ? cat.color + "0F" : "transparent", color: "var(--text)", fontSize: 11, cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "background 0.1s" }}
                  onMouseEnter={function (e) { e.currentTarget.style.background = cat.color + "0F"; }}
                  onMouseLeave={function (e) { e.currentTarget.style.background = isSel ? cat.color + "0F" : "transparent"; }}>
                  <Av name={c} color={cat.color} small />
                  <span style={{ flex: 1 }}>{c}</span>
                  {isSel ? <span style={{ width: 4, height: 4, borderRadius: 2, background: cat.color, flexShrink: 0 }} /> : null}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

function fmt(n: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0); }

function fmtDate(d: string) {
  var dt = new Date(d + "T00:00:00");
  var t = new Date(); var y = new Date(); y.setDate(y.getDate() - 1);
  if (dt.toDateString() === t.toDateString()) return "Today";
  if (dt.toDateString() === y.toDateString()) return "Yesterday";
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function TransactionsPage() {
  var [txns, setTxns] = useState<any[]>([]);
  var [loading, setLoading] = useState(true);
  var [tab, setTab] = useState<"all" | "income" | "expense">("all");
  var [search, setSearch] = useState("");
  var [catFilter, setCatFilter] = useState("");
  var [sort, setSort] = useState<"date" | "amount">("date");
  var [showForm, setShowForm] = useState(false);
  var [editId, setEditId] = useState("");
  var [desc, setDesc] = useState("");
  var [amt, setAmt] = useState("");
  var [cat, setCat] = useState("Groceries");
  var [typ, setTyp] = useState<"income" | "expense">("expense");
  var [dt, setDt] = useState(new Date().toISOString().split("T")[0]);
  var [submitting, setSubmitting] = useState(false);
  var [saved, setSaved] = useState(false);
  var [err, setErr] = useState("");
  var [hoveredId, setHoveredId] = useState("");
  var [deleteId, setDeleteId] = useState("");
  var [firstAccId, setFirstAccId] = useState("");

  useEffect(function () { load(); }, []);

  var load = async function () {
    var { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    var uid = u.user.id;
    var { data: aData } = await supabase.from("accounts").select("id").eq("user_id", uid).limit(1);
    if (aData && aData.length > 0) setFirstAccId(aData[0].id);
    var { data: tData } = await supabase.from("transactions").select("id, description, amount, category, transaction_type, transaction_date, account_id, accounts(name)").eq("user_id", uid).order("transaction_date", { ascending: false }).order("created_at", { ascending: false });
    setTxns(tData || []);
    setLoading(false);
  };

  var openAdd = function () {
    setEditId(""); setDesc(""); setAmt(""); setCat(typ === "income" ? "Salary" : "Groceries"); setTyp("expense"); setDt(new Date().toISOString().split("T")[0]); setErr(""); setDeleteId(""); setShowForm(true);
  };

  var openEdit = function (t: any) {
    setEditId(t.id); setDesc(t.description || ""); setAmt(String(Math.abs(Number(t.amount)))); setCat(t.category || "Other Expense"); setTyp(t.transaction_type === "income" ? "income" : "expense"); setDt(t.transaction_date); setErr(""); setDeleteId(""); setShowForm(true);
  };

  var closeForm = function () {
    setShowForm(false); setEditId(""); setDesc(""); setAmt(""); setCat("Groceries"); setTyp("expense"); setDt(new Date().toISOString().split("T")[0]); setErr(""); setDeleteId("");
  };

  var submit = async function () {
    setErr("");
    if (!amt || Number(amt) <= 0) { setErr("Enter a valid amount."); return; }
    setSubmitting(true);
    var { data: u } = await supabase.auth.getUser();
    if (!u?.user) { setSubmitting(false); return; }
    var a = typ === "expense" ? -Math.abs(Number(amt)) : Math.abs(Number(amt));
    var payload: any = { description: desc.trim() || null, amount: a, category: cat, transaction_type: typ, transaction_date: dt };
    if (firstAccId) payload.account_id = firstAccId;
    var error;
    if (editId) {
      var r = await supabase.from("transactions").update(payload).eq("id", editId);
      error = r.error;
    } else {
      payload.user_id = u.user.id;
      var r = await supabase.from("transactions").insert(payload);
      error = r.error;
    }
    setSubmitting(false);
    if (error) { setErr("Something went wrong. Try again."); return; }
    setSaved(true);
    setTimeout(function () { setSaved(false); closeForm(); }, 1200);
    load();
  };

  var deleteTxn = async function (id: string) {
    await supabase.from("transactions").delete().eq("id", id);
    setDeleteId(""); closeForm(); load();
  };

  var filtered = useMemo(function () {
    var f = [...txns];
    if (tab === "income") f = f.filter(function (t) { return t.transaction_type === "income"; });
    if (tab === "expense") f = f.filter(function (t) { return t.transaction_type === "expense"; });
    if (search.trim()) { var s = search.toLowerCase(); f = f.filter(function (t) { return (t.description || "").toLowerCase().indexOf(s) >= 0 || (t.category || "").toLowerCase().indexOf(s) >= 0; }); }
    if (catFilter) f = f.filter(function (t) { return t.category === catFilter; });
    if (sort === "date") f.sort(function (a, b) { return b.transaction_date.localeCompare(a.transaction_date); });
    else f.sort(function (a, b) { return Math.abs(b.amount) - Math.abs(a.amount); });
    return f;
  }, [txns, tab, search, catFilter, sort]);

  var totalIn = txns.filter(function (t) { return t.transaction_type === "income"; }).reduce(function (s, t) { return s + Math.abs(Number(t.amount)); }, 0);
  var totalOut = txns.filter(function (t) { return t.transaction_type === "expense"; }).reduce(function (s, t) { return s + Math.abs(Number(t.amount)); }, 0);
  var net = totalIn - totalOut;

  var grouped = useMemo(function () {
    var g: Array<{ label: string; items: any[] }> = []; var cur = "";
    filtered.forEach(function (t) { var l = fmtDate(t.transaction_date); if (l !== cur) { cur = l; g.push({ label: l, items: [] }); } g[g.length - 1].items.push(t); });
    return g;
  }, [filtered]);

  var activeCats = useMemo(function () { var s = new Set<string>(); txns.forEach(function (t) { if (t.category) s.add(t.category); }); return Array.from(s).sort(); }, [txns]);
  var catList = typ === "income" ? INCOME_CATS : EXPENSE_CATS;

  if (loading) return (
    <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 20, height: 20, border: "2px solid var(--border)", borderTopColor: "#22C55E", borderRadius: "50%", animation: "sp 0.6s linear infinite" }} />
      <style>{"@keyframes sp{to{transform:rotate(360deg)}}"}</style>
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
          <button onClick={showForm ? closeForm : openAdd}
            style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: showForm ? "var(--border)" : "#22C55E", color: showForm ? "var(--text)" : "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s", display: "flex", alignItems: "center", gap: 5 }}
            onMouseEnter={function (e) { if (!showForm) e.currentTarget.style.background = "#16A34A"; }}
            onMouseLeave={function (e) { if (!showForm) e.currentTarget.style.background = "#22C55E"; }}>
            {showForm ? "Cancel" : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg> Add</>}
          </button>
        </div>

        {/* Form */}
        {showForm ? (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px", marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 12px" }}>{editId ? "Edit Transaction" : "New Transaction"}</p>
            <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
              <button onClick={function () { setTyp("expense"); setCat("Groceries"); }}
                style={{ flex: 1, padding: "7px 0", borderRadius: 6, border: typ === "expense" ? "1px solid rgba(239,68,68,0.25)" : "1px solid var(--border)", background: typ === "expense" ? "rgba(239,68,68,0.06)" : "transparent", color: typ === "expense" ? "#EF4444" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "0.15s" }}>
                Expense
              </button>
              <button onClick={function () { setTyp("income"); setCat("Salary"); }}
                style={{ flex: 1, padding: "7px 0", borderRadius: 6, border: typ === "income" ? "1px solid rgba(34,197,94,0.25)" : "1px solid var(--border)", background: typ === "income" ? "rgba(34,197,94,0.06)" : "transparent", color: typ === "income" ? "#22C55E" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "0.15s" }}>
                Income
              </button>
            </div>
            <input type="number" placeholder="Amount" value={amt} onChange={function (e) { setAmt(e.target.value); }}
              style={{ height: 40, borderRadius: 6, padding: "0 12px", fontSize: 16, fontWeight: 600, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: "100%", marginBottom: 8, fontVariantNumeric: "tabular-nums", transition: "border-color 0.15s" }}
              onFocus={function (e) { e.currentTarget.style.borderColor = typ === "income" ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"; }}
              onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }} />
            <div className="fg2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <Drop key={typ} value={cat} options={catList} placeholder="Category" onChange={function (v) { setCat(v); }} />
              <input type="date" value={dt} onChange={function (e) { setDt(e.target.value); }}
                style={{ height: 34, borderRadius: 6, padding: "0 10px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: "100%", transition: "border-color 0.15s" }}
                onFocus={function (e) { e.currentTarget.style.borderColor = "rgba(34,197,94,0.3)"; }}
                onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }} />
            </div>
            <input placeholder="Add a note..." value={desc} onChange={function (e) { setDesc(e.target.value); }}
              style={{ height: 34, borderRadius: 6, padding: "0 10px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: "100%", marginBottom: 10, transition: "border-color 0.15s" }}
              onFocus={function (e) { e.currentTarget.style.borderColor = "rgba(34,197,94,0.3)"; }}
              onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }} />
            {err ? <p style={{ fontSize: 11, color: "#EF4444", margin: "0 0 8px", fontWeight: 500 }}>{err}</p> : null}
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={submit} disabled={submitting}
                style={{ flex: 1, height: 36, borderRadius: 6, border: "none", background: saved ? "#16A34A" : "#22C55E", color: "#fff", fontSize: 12, fontWeight: 600, cursor: submitting ? "wait" : "pointer", fontFamily: "inherit", opacity: submitting ? 0.7 : 1, transition: "background 0.15s" }}
                onMouseEnter={function (e) { if (!submitting && !saved) e.currentTarget.style.background = "#16A34A"; }}
                onMouseLeave={function (e) { e.currentTarget.style.background = saved ? "#16A34A" : "#22C55E"; }}>
                {submitting ? "Saving..." : saved ? "Saved" : editId ? "Update" : "Add Transaction"}
              </button>
              {editId ? (
                <button onClick={function () { if (deleteId === editId) { deleteTxn(editId); } else { setDeleteId(editId); setTimeout(function () { setDeleteId(""); }, 3000); } }}
                  style={{ height: 36, padding: "0 14px", borderRadius: 6, border: deleteId === editId ? "1px solid #EF4444" : "1px solid var(--border)", background: deleteId === editId ? "rgba(239,68,68,0.06)" : "transparent", color: deleteId === editId ? "#EF4444" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "0.15s" }}>
                  {deleteId === editId ? "Confirm Delete" : "Delete"}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {txns.length === 0 && !showForm ? (
          <div style={{ textAlign: "center", padding: "60px 24px 40px" }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>No transactions yet</h2>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 20px", maxWidth: 280, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>Add your first transaction to start tracking your money.</p>
            <button onClick={openAdd} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={function (e) { e.currentTarget.style.background = "#16A34A"; }}
              onMouseLeave={function (e) { e.currentTarget.style.background = "#22C55E"; }}>
              Add Transaction
            </button>
          </div>
        ) : null}

        {txns.length > 0 ? (
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
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <input placeholder="Search transactions..." value={search} onChange={function (e) { setSearch(e.target.value); }}
                  style={{ height: 30, borderRadius: 6, padding: "0 10px 0 28px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: "100%", transition: "border-color 0.15s", backgroundImage: "none" }}
                  onFocus={function (e) { e.currentTarget.style.borderColor = "rgba(34,197,94,0.25)"; }}
                  onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }} />
              </div>
              {activeCats.length > 1 ? (
                <div style={{ width: 160 }}>
                  <Drop value={catFilter} options={["All categories"].concat(activeCats)} placeholder="All categories" onChange={function (v) { setCatFilter(v === "All categories" ? "" : v); }} />
                </div>
              ) : null}
              <select value={sort} onChange={function (e) { setSort(e.target.value as "date" | "amount"); }}
                style={{ height: 30, borderRadius: 6, padding: "0 8px", fontSize: 11, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box" }}>
                <option value="date">By date</option>
                <option value="amount">By amount</option>
              </select>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 8, borderBottom: "1px solid var(--border)" }}>
              <button onClick={function () { setTab("all"); }} style={{ padding: "8px 14px", borderRadius: "6px 6px 0 0", border: "none", background: tab === "all" ? "var(--card)" : "transparent", color: tab === "all" ? "var(--text)" : "var(--muted)", fontSize: 12, fontWeight: tab === "all" ? 600 : 500, cursor: "pointer", fontFamily: "inherit", transition: "0.15s", borderBottom: tab === "all" ? "2px solid #22C55E" : "2px solid transparent", marginBottom: -1 }}>All</button>
              <button onClick={function () { setTab("income"); }} style={{ padding: "8px 14px", borderRadius: "6px 6px 0 0", border: "none", background: tab === "income" ? "var(--card)" : "transparent", color: tab === "income" ? "var(--text)" : "var(--muted)", fontSize: 12, fontWeight: tab === "income" ? 600 : 500, cursor: "pointer", fontFamily: "inherit", transition: "0.15s", borderBottom: tab === "income" ? "2px solid #22C55E" : "2px solid transparent", marginBottom: -1 }}>Income</button>
              <button onClick={function () { setTab("expense"); }} style={{ padding: "8px 14px", borderRadius: "6px 6px 0 0", border: "none", background: tab === "expense" ? "var(--card)" : "transparent", color: tab === "expense" ? "var(--text)" : "var(--muted)", fontSize: 12, fontWeight: tab === "expense" ? 600 : 500, cursor: "pointer", fontFamily: "inherit", transition: "0.15s", borderBottom: tab === "expense" ? "2px solid #22C55E" : "2px solid transparent", marginBottom: -1 }}>Expense</button>
            </div>

            {/* List */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>No transactions found</p>
              </div>
            ) : (
              <div style={{ paddingTop: 6 }}>
                {grouped.map(function (g) {
                  var dayNet = g.items.reduce(function (s, t) { return s + (t.transaction_type === "income" ? Math.abs(Number(t.amount)) : -Math.abs(Number(t.amount))); }, 0);
                  return (
                    <div key={g.label}>
                      <div style={{ padding: "8px 12px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.03 }}>{g.label}</span>
                        <span style={{ fontSize: 10, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{fmt(dayNet)}</span>
                      </div>
                      {g.items.map(function (t) {
                        var c = getCat(t.category);
                        var isInc = t.transaction_type === "income";
                        var a = Math.abs(Number(t.amount));
                        var isHov = hoveredId === t.id;
                        var isDel = deleteId === t.id;
                        return (
                          <div key={t.id} style={{ padding: "9px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 10, transition: "background 0.1s", cursor: "default", position: "relative" }}
                            onMouseEnter={function () { setHoveredId(t.id); }}
                            onMouseLeave={function () { setHoveredId(""); if (isDel) setDeleteId(""); }}>
                            <Av name={t.category || "Other Expense"} color={c.color} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.description || t.category}</p>
                              <p style={{ fontSize: 10, color: "var(--muted)", margin: "1px 0 0 0" }}>{t.category}</p>
                            </div>
                            {isHov && !showForm ? (
                              <div style={{ display: "flex", gap: 2, marginRight: 4, flexShrink: 0 }}>
                                {isDel ? (
                                  <button onClick={function () { deleteTxn(t.id); }} style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #EF4444", background: "rgba(239,68,68,0.06)", color: "#EF4444", fontSize: 9, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Delete?</button>
                                ) : (
                                  <>
                                    <button onClick={function () { openEdit(t); }} title="Edit" style={{ width: 26, height: 26, borderRadius: 5, border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.1s" }}
                                      onMouseEnter={function (e) { e.currentTarget.style.background = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }}
                                      onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                    </button>
                                    <button onClick={function () { setDeleteId(t.id); setTimeout(function () { setDeleteId(""); }, 3000); }} title="Delete" style={{ width: 26, height: 26, borderRadius: 5, border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.1s" }}
                                      onMouseEnter={function (e) { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#EF4444"; }}
                                      onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                    </button>
                                  </>
                                )}
                              </div>
                            ) : null}
                            <span style={{ fontSize: 13, fontWeight: 700, color: isInc ? "#22C55E" : "#EF4444", fontVariantNumeric: "tabular-nums", flexShrink: 0, minWidth: 60, textAlign: "right" }}>
                              {isInc ? "+" : "-"}{fmt(a)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ padding: "12px 12px 0", borderTop: "1px solid var(--border)", marginTop: 8 }}>
              <p style={{ fontSize: 10, color: "var(--muted)", margin: 0, fontVariantNumeric: "tabular-nums" }}>
                {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}{catFilter ? " in " + catFilter : ""}{tab !== "all" ? " · " + tab : ""}
              </p>
            </div>
          </>
        ) : null}
      </div>

      <style>{"@keyframes sp{to{transform:rotate(360deg)}}"}</style>
      <style>{"@media(max-width:640px){.bh{flex-direction:column!important;align-items:flex-start!important}.fg2{grid-template-columns:1fr!important}}"}</style>
      <style>{".droplist::-webkit-scrollbar{width:4px}.droplist::-webkit-scrollbar-track{background:transparent}.droplist::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}"}</style>
      <style>{"input[type='date']::-webkit-calendar-picker-indicator{opacity:0.4;cursor:pointer}"}</style>
    </div>
  );
}