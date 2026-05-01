"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabase";

var CATS = [
  { name: "Food", color: "#F97316", letter: "F" },
  { name: "Transport", color: "#3B82F6", letter: "T" },
  { name: "Shopping", color: "#EC4899", letter: "S" },
  { name: "Entertainment", color: "#8B5CF6", letter: "E" },
  { name: "Bills", color: "#EF4444", letter: "B" },
  { name: "Health", color: "#14B8A6", letter: "H" },
  { name: "Education", color: "#6366F1", letter: "Ed" },
  { name: "Rent", color: "#F59E0B", letter: "R" },
  { name: "Savings", color: "#22C55E", letter: "Sa" },
  { name: "Other", color: "#64748B", letter: "O" },
];

var INCOME_CATS = [
  { name: "Salary", color: "#22C55E", letter: "Sa" },
  { name: "Freelance", color: "#3B82F6", letter: "Fr" },
  { name: "Interest", color: "#F59E0B", letter: "In" },
  { name: "Gift", color: "#EC4899", letter: "Gi" },
  { name: "Refund", color: "#8B5CF6", letter: "Re" },
  { name: "Rental", color: "#14B8A6", letter: "Rn" },
  { name: "Other", color: "#64748B", letter: "O" },
];

function getCat(n: string, isIncome: boolean) {
  if (isIncome) return INCOME_CATS.find(function (c) { return c.name === n; }) || INCOME_CATS[6];
  return CATS.find(function (c) { return c.name === n; }) || CATS[9];
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
}

var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function CatIcon(props: { name: string; isIncome?: boolean; size?: number }) {
  var c = getCat(props.name, !!props.isIncome);
  var sz = props.size || 26;
  var fs = sz <= 22 ? 8 : 10;
  return (
    <div style={{ width: sz, height: sz, borderRadius: 6, background: c.color + "1F", color: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: fs, fontWeight: 700, flexShrink: 0, border: "1px solid " + c.color + "2E" }}>{c.letter}</div>
  );
}

function formatDate(dateStr: string) {
  var d = new Date(dateStr + "T00:00:00");
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  var diff = Math.floor((today.getTime() - target.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.getDate() + " " + MONTHS[d.getMonth()].slice(0, 3);
}

export default function TransactionsPage() {
  var [loading, setLoading] = useState(true);
  var [txns, setTxns] = useState<any[]>([]);
  var [month, setMonth] = useState(new Date().getMonth());
  var [year, setYear] = useState(new Date().getFullYear());
  var [showForm, setShowForm] = useState(false);
  var [editId, setEditId] = useState("");
  var [txType, setTxType] = useState("expense");
  var [amount, setAmount] = useState("");
  var [category, setCategory] = useState("");
  var [description, setDescription] = useState("");
  var [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  var [submitting, setSubmitting] = useState(false);
  var [saved, setSaved] = useState(false);
  var [err, setErr] = useState("");
  var [hoveredId, setHoveredId] = useState("");
  var [deleteId, setDeleteId] = useState("");

  useEffect(function () { load(); }, [month, year]);

  var load = async function () {
    setLoading(true);
    var { data: u } = await supabase.auth.getUser();
    if (!u?.user) { setLoading(false); return; }
    var ms = new Date(year, month, 1).toISOString().split("T")[0];
    var me = new Date(year, month + 1, 0).toISOString().split("T")[0];
    var { data } = await supabase.from("transactions").select("id, amount, type, category, description, date").eq("user_id", u.user.id).gte("date", ms).lte("date", me).order("date", { ascending: false });
    setTxns(data || []);
    setLoading(false);
  };

  var thisIncome = useMemo(function () { return txns.filter(function (t: any) { return t.type === "income"; }).reduce(function (s: number, t: any) { return s + Number(t.amount || 0); }, 0); }, [txns]);
  var thisExpense = useMemo(function () { return txns.filter(function (t: any) { return t.type === "expense"; }).reduce(function (s: number, t: any) { return s + Number(t.amount || 0); }, 0); }, [txns]);

  var grouped = useMemo(function () {
    var groups: { label: string; txns: any[] }[] = [];
    var currentLabel = "";
    var currentTxns: any[] = [];
    txns.forEach(function (t: any) {
      var label = formatDate(t.date);
      if (label !== currentLabel) {
        if (currentTxns.length > 0) groups.push({ label: currentLabel, txns: currentTxns });
        currentLabel = label;
        currentTxns = [];
      }
      currentTxns.push(t);
    });
    if (currentTxns.length > 0) groups.push({ label: currentLabel, txns: currentTxns });
    return groups;
  }, [txns]);

  var cats = txType === "income" ? INCOME_CATS : CATS;
  var phMap: Record<string, string> = { Food: "Morning coffee", Transport: "Uber to office", Shopping: "Amazon order", Entertainment: "Netflix", Bills: "Electricity bill", Health: "Medicine", Education: "Course fee", Rent: "Monthly rent", Savings: "FD deposit", Other: "Something", Salary: "Monthly salary", Freelance: "Project payment", Interest: "FD interest", Gift: "Birthday gift", Refund: "Amazon refund", Rental: "Rent received" };

  var openAdd = function () {
    setEditId(""); setTxType("expense"); setAmount(""); setCategory(""); setDescription(""); setDate(new Date().toISOString().split("T")[0]); setErr(""); setDeleteId(""); setShowForm(true);
  };

  var openEdit = function (t: any) {
    setEditId(t.id); setTxType(t.type || "expense"); setAmount(String(Number(t.amount || 0))); setCategory(t.category || ""); setDescription(t.description || ""); setDate(t.date || new Date().toISOString().split("T")[0]); setErr(""); setDeleteId(""); setShowForm(true);
  };

  var closeForm = function () {
    setShowForm(false); setEditId(""); setAmount(""); setCategory(""); setDescription(""); setErr(""); setDeleteId(""); setSaved(false);
  };

  var submit = async function () {
    setErr("");
    if (!amount || Number(amount) <= 0) { setErr("Enter an amount."); return; }
    if (!category) { setErr("Pick a category."); return; }
    setSubmitting(true);
    var { data: u } = await supabase.auth.getUser();
    if (!u?.user) { setSubmitting(false); return; }
    var payload: any = { amount: Number(amount), type: txType, category: category, description: description.trim(), date: date };
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
    if (error) { setErr(error.message); return; }
    setSaved(true);
    setTimeout(function () { setSaved(false); closeForm(); }, 800);
    load();
  };

  var deleteTx = async function (id: string) {
    await supabase.from("transactions").delete().eq("id", id);
    setDeleteId(""); closeForm(); load();
  };

  var now = new Date();
  var prevMonth = function () { if (month === 0) { setMonth(11); setYear(year - 1); } else { setMonth(month - 1); } };
  var nextMonth = function () {
    var nm = month === 11 ? 0 : month + 1;
    var ny = month === 11 ? year + 1 : year;
    if (ny > now.getFullYear()) return;
    if (ny === now.getFullYear() && nm > now.getMonth()) return;
    setMonth(nm); setYear(ny);
  };
  var canNext = !(month === now.getMonth() && year === now.getFullYear());

  if (loading) return (
    <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ height: 14, borderRadius: 4, background: "var(--card)", animation: "shimmer 1.5s infinite" }} />
        <div style={{ display: "flex", gap: 8 }}><div style={{ flex: 1, height: 48, borderRadius: 8, background: "var(--card)", animation: "shimmer 1.5s infinite 0.1s" }} /><div style={{ flex: 1, height: 48, borderRadius: 8, background: "var(--card)", animation: "shimmer 1.5s infinite 0.2s" }} /></div>
        <div style={{ height: 40, borderRadius: 6, background: "var(--card)", animation: "shimmer 1.5s infinite 0.3s" }} />
        <div style={{ height: 40, borderRadius: 6, background: "var(--card)", animation: "shimmer 1.5s infinite 0.4s" }} />
      </div>
      <style>{"@keyframes shimmer{0%{opacity:1}50%{opacity:0.4}100%{opacity:1}}"}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 24px 80px" }}>

        {/* Month Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <button onClick={prevMonth} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 100ms ease, color 100ms ease" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "var(--card-hover)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{MONTHS[month]} {year}</span>
          {canNext ? (
            <button onClick={nextMonth} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 100ms ease, color 100ms ease" }}
              onMouseEnter={function (e) { e.currentTarget.style.background = "var(--card-hover)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          ) : <div style={{ width: 26 }} />}
        </div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>Transactions</h1>
            <p style={{ fontSize: 10, color: "var(--muted)", margin: "2px 0 0 0" }}>Track your money</p>
          </div>
          <button onClick={showForm ? closeForm : openAdd}
            style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: showForm ? "var(--card)" : "var(--green)", color: showForm ? "var(--muted)" : "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "background 100ms ease", display: "flex", alignItems: "center", gap: 5 }}
            onMouseEnter={function (e) { if (!showForm) e.currentTarget.style.background = "#16A34A"; }}
            onMouseLeave={function (e) { if (!showForm) e.currentTarget.style.background = "var(--green)"; }}>
            {showForm ? "Cancel" : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>Add</>}
          </button>
        </div>

        {/* Summary */}
        {(thisIncome > 0 || thisExpense > 0) ? (
          <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: "var(--green)" }} />
              <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500 }}>Income</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", fontVariantNumeric: "tabular-nums" }}>{fmt(thisIncome)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: "var(--red)" }} />
              <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500 }}>Expense</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--red)", fontVariantNumeric: "tabular-nums" }}>{fmt(thisExpense)}</span>
            </div>
            <span style={{ fontSize: 10, color: "var(--faint)" }}>{txns.length} transaction{txns.length !== 1 ? "s" : ""}</span>
          </div>
        ) : null}

        {/* Add/Edit Form */}
        {showForm ? (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px", marginBottom: 20 }}>

            {/* Type Toggle */}
            <div style={{ display: "flex", gap: 0, marginBottom: 14, borderBottom: "1px solid var(--border)" }}>
              <button onClick={function () { setTxType("expense"); setCategory(""); }}
                style={{ flex: 1, padding: "8px 0", border: "none", background: "transparent", color: txType === "expense" ? "var(--text)" : "var(--muted)", fontSize: 12, fontWeight: txType === "expense" ? 600 : 500, cursor: "pointer", borderBottom: txType === "expense" ? "2px solid var(--green)" : "2px solid transparent", transition: "color 100ms ease, border-color 100ms ease" }}>
                Expense
              </button>
              <button onClick={function () { setTxType("income"); setCategory(""); }}
                style={{ flex: 1, padding: "8px 0", border: "none", background: "transparent", color: txType === "income" ? "var(--text)" : "var(--muted)", fontSize: 12, fontWeight: txType === "income" ? 600 : 500, cursor: "pointer", borderBottom: txType === "income" ? "2px solid var(--green)" : "2px solid transparent", transition: "color 100ms ease, border-color 100ms ease" }}>
                Income
              </button>
            </div>

            {/* Amount */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05, display: "block", marginBottom: 4 }}>AMOUNT</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--muted)", fontWeight: 600, pointerEvents: "none" }}>₹</span>
                <input type="number" placeholder="0" value={amount} onChange={function (e) { setAmount(e.target.value); }} autoFocus
                  style={{ height: 44, borderRadius: 6, padding: "0 12px 0 28px", fontSize: 18, fontWeight: 700, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: "100%", fontVariantNumeric: "tabular-nums", transition: "border-color 150ms ease" }}
                  onFocus={function (e) { e.currentTarget.style.borderColor = "rgba(34,197,94,0.3)"; }}
                  onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }} />
              </div>
            </div>

            {/* Category Grid */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05, display: "block", marginBottom: 6 }}>CATEGORY</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
                {cats.map(function (c) {
                  var isSel = category === c.name;
                  return (
                    <button key={c.name} type="button" onClick={function () { setCategory(c.name); }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 4px", borderRadius: 6, border: "1px solid " + (isSel ? c.color + "2E" : "var(--border)"), background: isSel ? c.color + "1F" : "transparent", cursor: "pointer", transition: "background 100ms ease, border-color 100ms ease" }}>
                      <div style={{ width: 22, height: 22, borderRadius: 5, background: c.color + "1F", color: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, border: "1px solid " + c.color + "2E" }}>{c.letter}</div>
                      <span style={{ fontSize: 8, fontWeight: isSel ? 600 : 500, color: isSel ? "var(--text)" : "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05, display: "block", marginBottom: 4 }}>DESCRIPTION</label>
              <input placeholder={phMap[category] || "What was this for"} value={description} onChange={function (e) { setDescription(e.target.value); }}
                style={{ height: 38, borderRadius: 6, padding: "0 12px", fontSize: 13, fontWeight: 500, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: "100%", transition: "border-color 150ms ease" }}
                onFocus={function (e) { e.currentTarget.style.borderColor = "rgba(34,197,94,0.3)"; }}
                onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }} />
            </div>

            {/* Date */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.05, display: "block", marginBottom: 4 }}>DATE</label>
              <input type="date" value={date} onChange={function (e) { setDate(e.target.value); }}
                style={{ height: 38, borderRadius: 6, padding: "0 12px", fontSize: 13, fontWeight: 500, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: "100%", transition: "border-color 150ms ease", colorScheme: "dark" }}
                onFocus={function (e) { e.currentTarget.style.borderColor = "rgba(34,197,94,0.3)"; }}
                onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }} />
            </div>

            {err ? <p style={{ fontSize: 11, color: "var(--red)", margin: "0 0 8px", fontWeight: 500 }}>{err}</p> : null}

            {/* Actions */}
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={submit} disabled={submitting}
                style={{ flex: 1, height: 38, borderRadius: 8, border: "none", background: saved ? "#16A34A" : "var(--green)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: submitting ? "wait" : "pointer", opacity: submitting ? 0.7 : 1, transition: "background 100ms ease" }}
                onMouseEnter={function (e) { if (!submitting && !saved) e.currentTarget.style.background = "#16A34A"; }}
                onMouseLeave={function (e) { e.currentTarget.style.background = saved ? "#16A34A" : "var(--green)"; }}>
                {submitting ? "Saving..." : saved ? "Saved" : editId ? "Update" : "Add Transaction"}
              </button>
              {editId ? (
                <button onClick={function () { if (deleteId === editId) { deleteTx(editId); } else { setDeleteId(editId); setTimeout(function () { setDeleteId(""); }, 3000); } }}
                  style={{ height: 38, padding: "0 14px", borderRadius: 8, border: deleteId === editId ? "1px solid var(--red)" : "1px solid var(--border)", background: deleteId === editId ? "var(--red-dim)" : "transparent", color: deleteId === editId ? "var(--red)" : "var(--muted)", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 100ms ease" }}>
                  {deleteId === editId ? "Delete?" : "Delete"}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Transaction List */}
        {grouped.length > 0 ? (
          <div>
            {grouped.map(function (g) {
              return (
                <div key={g.label} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, padding: "0 2px" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.04 }}>{g.label}</span>
                    <span style={{ fontSize: 9, color: "var(--faint)", fontWeight: 500 }}>{g.txns.length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {g.txns.map(function (t: any) {
                      var isIncome = t.type === "income";
                      var amt = Number(t.amount || 0);
                      var isHov = hoveredId === t.id;
                      var isDel = deleteId === t.id && !showForm;
                      return (
                        <div key={t.id} style={{ padding: "10px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 8, transition: "background 100ms ease" }}
                          onMouseEnter={function () { setHoveredId(t.id); }}
                          onMouseLeave={function () { setHoveredId(""); if (isDel) setDeleteId(""); }}>
                          <CatIcon name={t.category} isIncome={isIncome} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.description || (isIncome ? "Income" : getCat(t.category, isIncome).name)}</p>
                            <p style={{ fontSize: 10, color: "var(--faint)", margin: "1px 0 0 0" }}>{getCat(t.category, isIncome).name}</p>
                          </div>
                          {isHov && !showForm ? (
                            <div style={{ display: "flex", gap: 2, marginRight: 2, flexShrink: 0 }}>
                              {isDel ? (
                                <button onClick={function () { deleteTx(t.id); }} style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid var(--red)", background: "var(--red-dim)", color: "var(--red)", fontSize: 9, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Delete?</button>
                              ) : (<>
                                <button onClick={function () { openEdit(t); }} title="Edit" style={{ width: 26, height: 26, borderRadius: 5, border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 100ms ease, color 100ms ease" }}
                                  onMouseEnter={function (e) { e.currentTarget.style.background = "var(--card-hover)"; e.currentTarget.style.color = "var(--text)"; }}
                                  onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                </button>
                                <button onClick={function () { setDeleteId(t.id); setTimeout(function () { setDeleteId(""); }, 3000); }} title="Delete" style={{ width: 26, height: 26, borderRadius: 5, border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 100ms ease, color 100ms ease" }}
                                  onMouseEnter={function (e) { e.currentTarget.style.background = "var(--red-dim)"; e.currentTarget.style.color = "var(--red)"; }}
                                  onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                </button>
                              </>)}
                            </div>
                          ) : null}
                          <span style={{ fontSize: 13, fontWeight: 700, color: isIncome ? "var(--green)" : "var(--red)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{isIncome ? "+" : "-"}{fmt(amt)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : !showForm ? (
          <div style={{ textAlign: "center", padding: "48px 24px 32px" }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </div>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 4px" }}>Where did your money go?</h2>
            <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 16px" }}>Log your first transaction to find out.</p>
            <button onClick={openAdd} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "var(--green)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "background 100ms ease" }}
              onMouseEnter={function (e) { e.currentTarget.style.background = "#16A34A"; }}
              onMouseLeave={function (e) { e.currentTarget.style.background = "var(--green)"; }}>
              Add Transaction
            </button>
          </div>
        ) : null}

      </div>

      <style>{"@keyframes shimmer{0%{opacity:1}50%{opacity:0.4}100%{opacity:1}}"}</style>
      <style>{"@media(max-width:400px){.catgrid{grid-template-columns:repeat(4,1fr)!important}}"}</style>
    </div>
  );
}