"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabase";

var BANKS = [
  "SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra",
  "Punjab National Bank", "Bank of Baroda", "Canara Bank", "Union Bank",
  "IndusInd Bank", "Yes Bank", "Federal Bank", "IDBI Bank",
  "Indian Bank", "Central Bank", "UCO Bank", "Bank of India",
  "South Indian Bank", "Karur Vysya Bank", "Tamilnad Mercantile",
  "Jupiter", "Fi Money", "NiyoX", "RazorpayX", "Open Money",
  "Paytm Payments Bank", "Airtel Payments Bank", "India Post Payments Bank",
  "Amex", "Standard Chartered", "HSBC", "Citibank", "DBS Bank",
  "Deutsche Bank", "Barclays"
];

var TYPES = [
  { name: "Bank Account", color: "#3B82F6", letter: "B" },
  { name: "Savings Account", color: "#22C55E", letter: "SA" },
  { name: "Current Account", color: "#6366F1", letter: "CA" },
  { name: "Credit Card", color: "#EF4444", letter: "CC" },
  { name: "Cash", color: "#F59E0B", letter: "C" },
  { name: "UPI", color: "#8B5CF6", letter: "UP" },
  { name: "Wallet", color: "#EC4899", letter: "W" },
  { name: "Fixed Deposit", color: "#14B8A6", letter: "FD" },
  { name: "Recurring Deposit", color: "#0EA5E9", letter: "RD" },
  { name: "Mutual Fund", color: "#A855F7", letter: "MF" },
  { name: "Stocks", color: "#F97316", letter: "ST" },
  { name: "PPF", color: "#10B981", letter: "PF" },
  { name: "EPF", color: "#34D399", letter: "EP" },
  { name: "Gold", color: "#FBBF24", letter: "GD" },
  { name: "Real Estate", color: "#78716C", letter: "RE" },
  { name: "Loan", color: "#EF4444", letter: "LN" },
  { name: "Other", color: "#64748B", letter: "OT" },
];

function getType(n: string) { return TYPES.find(function (t) { return t.name === n; }) || TYPES[TYPES.length - 1]; }

function Av(props: { typeName: string; small?: boolean }) {
  var t = getType(props.typeName);
  var sz = props.small ? 24 : 30;
  return (
    <div style={{ width: sz, height: sz, borderRadius: 7, background: t.color + "12", color: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: props.small ? 8 : 11, fontWeight: 700, flexShrink: 0, border: "1px solid " + t.color + "18" }}>{t.letter}</div>
  );
}

function fmt(n: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0); }

function Drop(props: { value: string; options: string[]; placeholder: string; onChange: (v: string) => void }) {
  var [open, setOpen] = useState(false);
  var sel = getType(props.value);
  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={function () { setOpen(!open); }}
        style={{ height: 38, width: "100%", borderRadius: 6, padding: "0 12px", display: "flex", alignItems: "center", gap: 8, background: "var(--bg)", border: open ? "1px solid " + sel.color + "44" : "1px solid var(--border)", color: props.value ? "var(--text)" : "var(--muted)", fontSize: 13, fontFamily: "inherit", cursor: "pointer", transition: "border-color 0.15s", boxSizing: "border-box", outline: "none" }}>
        {props.value ? <Av typeName={props.value} small /> : null}
        <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{props.value || props.placeholder}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open ? (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={function () { setOpen(false); }} />
          <div className="droplist" style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, marginTop: 2, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, maxHeight: 220, overflowY: "auto", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
            {props.options.map(function (c) {
              var tp = getType(c);
              var isSel = c === props.value;
              return (
                <button key={c} type="button" onClick={function () { props.onChange(c); setOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", width: "100%", border: "none", background: isSel ? tp.color + "0F" : "transparent", color: "var(--text)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "background 0.1s" }}
                  onMouseEnter={function (e) { e.currentTarget.style.background = tp.color + "0F"; }}
                  onMouseLeave={function (e) { e.currentTarget.style.background = isSel ? tp.color + "0F" : "transparent"; }}>
                  <Av typeName={c} small />
                  <span style={{ flex: 1 }}>{c}</span>
                  {isSel ? <span style={{ width: 5, height: 5, borderRadius: 3, background: tp.color, flexShrink: 0 }} /> : null}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

function BankInput(props: { value: string; onChange: (v: string) => void; type: string }) {
  var [focused, setFocused] = useState(false);
  var filtered = props.value.trim().length > 0
    ? BANKS.filter(function (b) { return b.toLowerCase().indexOf(props.value.toLowerCase()) >= 0; }).slice(0, 6)
    : [];
  var showSuggestions = focused && filtered.length > 0 && filtered[0] !== props.value;
  var ph = props.type === "Bank Account" ? "e.g. HDFC Bank"
    : props.type === "Savings Account" ? "e.g. SBI Savings"
    : props.type === "Credit Card" ? "e.g. ICICI Credit Card"
    : props.type === "Cash" ? "e.g. Wallet Cash"
    : props.type === "UPI" ? "e.g. Google Pay"
    : props.type === "Fixed Deposit" ? "e.g. SBI FD"
    : props.type === "Mutual Fund" ? "e.g. Groww"
    : props.type === "Stocks" ? "e.g. Zerodha"
    : props.type === "Loan" ? "e.g. Home Loan SBI"
    : props.type === "Wallet" ? "e.g. Paytm Wallet"
    : "e.g. My Account";
  return (
    <div style={{ position: "relative" }}>
      <input placeholder={ph} value={props.value} onChange={function (e) { props.onChange(e.target.value); }}
        onFocus={function (e) { setFocused(true); e.currentTarget.style.borderColor = "rgba(34,197,94,0.3)"; }}
        onBlur={function (e) { setTimeout(function () { setFocused(false); }, 150); e.currentTarget.style.borderColor = "var(--border)"; }}
        style={{ height: 38, borderRadius: 6, padding: "0 12px", fontSize: 13, fontWeight: 500, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: "100%", transition: "border-color 0.15s" }} />
      {showSuggestions ? (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, marginTop: 2, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, maxHeight: 180, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          {filtered.map(function (b) {
            return (
              <button key={b} type="button" onClick={function () { props.onChange(b); setFocused(false); }}
                style={{ display: "block", width: "100%", padding: "8px 12px", border: "none", background: "transparent", color: "var(--text)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "background 0.1s" }}
                onMouseEnter={function (e) { e.currentTarget.style.background = "rgba(34,197,94,0.06)"; }}
                onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}>
                {b}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function AccountsPage() {
  var [accounts, setAccounts] = useState<any[]>([]);
  var [loading, setLoading] = useState(true);
  var [showForm, setShowForm] = useState(false);
  var [editId, setEditId] = useState("");
  var [name, setName] = useState("");
  var [accType, setAccType] = useState("Bank Account");
  var [balance, setBalance] = useState("");
  var [submitting, setSubmitting] = useState(false);
  var [saved, setSaved] = useState(false);
  var [err, setErr] = useState("");
  var [hoveredId, setHoveredId] = useState("");
  var [deleteId, setDeleteId] = useState("");

  useEffect(function () { load(); }, []);

  var load = async function () {
    var { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    var { data, error } = await supabase.from("accounts").select("id, name, type, balance, created_at").eq("user_id", u.user.id).order("created_at", { ascending: true });
    if (error) { console.error("Load error:", error.message); }
    setAccounts(data || []);
    setLoading(false);
  };

  var openAdd = function () {
    setEditId(""); setName(""); setAccType("Bank Account"); setBalance(""); setErr(""); setDeleteId(""); setShowForm(true);
  };

  var openEdit = function (a: any) {
    setEditId(a.id); setName(a.name || ""); setAccType(a.type || "Bank Account"); setBalance(String(Math.abs(Number(a.balance) || 0))); setErr(""); setDeleteId(""); setShowForm(true);
  };

  var closeForm = function () {
    setShowForm(false); setEditId(""); setName(""); setAccType("Bank Account"); setBalance(""); setErr(""); setDeleteId("");
  };

  var submit = async function () {
    setErr("");
    if (!name.trim()) { setErr("Give your account a name."); return; }
    var dup = accounts.find(function (a) {
      return a.name.toLowerCase().trim() === name.toLowerCase().trim() && a.id !== editId;
    });
    if (dup) { setErr("You already have an account called \"" + dup.name + "\"."); return; }
    setSubmitting(true);
    var { data: u } = await supabase.auth.getUser();
    if (!u?.user) { setSubmitting(false); return; }
    var isDebt = accType === "Credit Card" || accType === "Loan";
    var b = balance ? (isDebt ? -Math.abs(Number(balance)) : Math.abs(Number(balance))) : 0;
    var payload: any = { name: name.trim(), type: accType, balance: b };
    var error;
    if (editId) {
      var r = await supabase.from("accounts").update(payload).eq("id", editId);
      error = r.error;
    } else {
      payload.user_id = u.user.id;
      var r = await supabase.from("accounts").insert(payload);
      error = r.error;
    }
    setSubmitting(false);
    if (error) {
      console.error("Save error:", error.message, error.details, error.hint);
      if (error.message.indexOf("unique") >= 0 || error.message.indexOf("duplicate") >= 0) {
        setErr("An account with this name already exists.");
      } else if (error.message.indexOf("check") >= 0 || error.message.indexOf("constraint") >= 0) {
        setErr("Database constraint error. Run the SQL fix in Supabase first.");
      } else {
        setErr(error.message);
      }
      return;
    }
    setSaved(true);
    setTimeout(function () { setSaved(false); closeForm(); }, 1200);
    load();
  };

  var deleteAcc = async function (id: string) {
    await supabase.from("accounts").delete().eq("id", id);
    setDeleteId(""); closeForm(); load();
  };

  var totalBalance = useMemo(function () { return accounts.reduce(function (s, a) { return s + Number(a.balance || 0); }, 0); }, [accounts]);
  var totalAssets = useMemo(function () { return accounts.filter(function (a) { return Number(a.balance || 0) > 0; }).reduce(function (s, a) { return s + Number(a.balance); }, 0); }, [accounts]);
  var totalDebts = useMemo(function () { return accounts.filter(function (a) { return Number(a.balance || 0) < 0; }).reduce(function (s, a) { return s + Math.abs(Number(a.balance)); }, 0); }, [accounts]);
  var sortedAccounts = useMemo(function () { return [...accounts].sort(function (a, b) { return Math.abs(Number(b.balance)) - Math.abs(Number(a.balance)); }); }, [accounts]);

  var isDebt = accType === "Credit Card" || accType === "Loan";
  var previewBal = balance ? (isDebt ? -Math.abs(Number(balance)) : Math.abs(Number(balance))) : 0;

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
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Accounts</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "2px 0 0 0" }}>Manage your financial accounts</p>
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
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "18px", marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 14px" }}>{editId ? "Edit Account" : "New Account"}</p>

            {/* Type */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.04, display: "block", marginBottom: 4 }}>Type</label>
              <Drop value={accType} options={TYPES.map(function (t) { return t.name; })} placeholder="Account type" onChange={function (v) { setAccType(v); }} />
            </div>

            {/* Name with bank suggestions */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.04, display: "block", marginBottom: 4 }}>Account Name</label>
              <BankInput value={name} onChange={function (v) { setName(v); }} type={accType} />
            </div>

            {/* Balance */}
            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.04, display: "block", marginBottom: 4 }}>{isDebt ? "Outstanding Amount" : "Current Balance"}</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--muted)", fontWeight: 600, pointerEvents: "none" }}>₹</span>
                <input type="number" placeholder="0" value={balance} onChange={function (e) { setBalance(e.target.value); }}
                  style={{ height: 44, borderRadius: 6, padding: "0 12px 0 28px", fontSize: 18, fontWeight: 700, outline: "none", fontFamily: "inherit", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", boxSizing: "border-box", width: "100%", fontVariantNumeric: "tabular-nums", transition: "border-color 0.15s" }}
                  onFocus={function (e) { e.currentTarget.style.borderColor = isDebt ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)"; }}
                  onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }} />
              </div>
              {isDebt && balance ? (
                <p style={{ fontSize: 10, color: "#EF4444", margin: "4px 0 0 0", fontWeight: 500 }}>Tracked as debt (−₹{Number(balance).toLocaleString("en-IN")})</p>
              ) : null}
            </div>

            {/* Preview */}
            {name.trim() ? (
              <div style={{ marginTop: 8, marginBottom: 10, padding: "10px 12px", borderRadius: 6, background: "var(--bg)", border: "1px dashed var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
                <Av typeName={accType} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name.trim()}</p>
                  <p style={{ fontSize: 10, color: "var(--muted)", margin: "1px 0 0 0" }}>{accType}</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: previewBal < 0 ? "#EF4444" : "#22C55E", fontVariantNumeric: "tabular-nums" }}>
                  {previewBal < 0 ? "-" : ""}{fmt(Math.abs(previewBal))}
                </span>
              </div>
            ) : null}

            {err ? <p style={{ fontSize: 11, color: "#EF4444", margin: "0 0 8px", fontWeight: 500 }}>{err}</p> : null}

            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={submit} disabled={submitting}
                style={{ flex: 1, height: 38, borderRadius: 6, border: "none", background: saved ? "#16A34A" : "#22C55E", color: "#fff", fontSize: 13, fontWeight: 600, cursor: submitting ? "wait" : "pointer", fontFamily: "inherit", opacity: submitting ? 0.7 : 1, transition: "background 0.15s" }}
                onMouseEnter={function (e) { if (!submitting && !saved) e.currentTarget.style.background = "#16A34A"; }}
                onMouseLeave={function (e) { e.currentTarget.style.background = saved ? "#16A34A" : "#22C55E"; }}>
                {submitting ? "Saving..." : saved ? "Saved" : editId ? "Update" : "Add Account"}
              </button>
              {editId ? (
                <button onClick={function () { if (deleteId === editId) { deleteAcc(editId); } else { setDeleteId(editId); setTimeout(function () { setDeleteId(""); }, 3000); } }}
                  style={{ height: 38, padding: "0 14px", borderRadius: 6, border: deleteId === editId ? "1px solid #EF4444" : "1px solid var(--border)", background: deleteId === editId ? "rgba(239,68,68,0.06)" : "transparent", color: deleteId === editId ? "#EF4444" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "0.15s" }}>
                  {deleteId === editId ? "Confirm Delete" : "Delete"}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {accounts.length === 0 && !showForm ? (
          <div style={{ textAlign: "center", padding: "48px 24px 32px" }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20" /></svg>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", margin: "0 0 6px" }}>No accounts yet</h2>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 20px", maxWidth: 280, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>Add your bank accounts, wallets, and investments to see your total balance.</p>
            <button onClick={openAdd} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={function (e) { e.currentTarget.style.background = "#16A34A"; }}
              onMouseLeave={function (e) { e.currentTarget.style.background = "#22C55E"; }}>
              Add Your First Account
            </button>
          </div>
        ) : null}

        {accounts.length > 0 ? (
          <>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 32, fontWeight: 700, color: totalBalance >= 0 ? "#22C55E" : "#EF4444", margin: 0, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>{fmt(totalBalance)}</p>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0 0" }}>total balance</p>
              <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                {totalAssets > 0 ? (<div><span style={{ width: 7, height: 7, borderRadius: 4, background: "#22C55E", display: "inline-block", marginRight: 4 }} /><span style={{ fontSize: 11, color: "var(--muted)" }}>Assets </span><span style={{ fontSize: 12, fontWeight: 600, color: "#22C55E", fontVariantNumeric: "tabular-nums" }}>{fmt(totalAssets)}</span></div>) : null}
                {totalDebts > 0 ? (<div><span style={{ width: 7, height: 7, borderRadius: 4, background: "#EF4444", display: "inline-block", marginRight: 4 }} /><span style={{ fontSize: 11, color: "var(--muted)" }}>Debts </span><span style={{ fontSize: 12, fontWeight: 600, color: "#EF4444", fontVariantNumeric: "tabular-nums" }}>{fmt(totalDebts)}</span></div>) : null}
                <div><span style={{ width: 7, height: 7, borderRadius: 4, background: "#3B82F6", display: "inline-block", marginRight: 4 }} /><span style={{ fontSize: 11, color: "var(--muted)" }}>Accounts </span><span style={{ fontSize: 12, fontWeight: 600, color: "#3B82F6", fontVariantNumeric: "tabular-nums" }}>{accounts.length}</span></div>
              </div>
            </div>

            {totalAssets > 0 ? (<div style={{ marginBottom: 16 }}><div style={{ height: 4, background: "var(--border)", borderRadius: 4, overflow: "hidden", display: "flex" }}>{sortedAccounts.map(function (a) { var pct = totalAssets > 0 ? (Math.abs(Number(a.balance)) / totalAssets) * 100 : 0; if (pct < 1) return null; var t = getType(a.type); return <div key={a.id} style={{ height: "100%", width: pct + "%", background: t.color, transition: "width 0.5s" }} />; })}</div></div>) : null}

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {sortedAccounts.map(function (a) {
                var t = getType(a.type);
                var b = Number(a.balance || 0);
                var isNeg = b < 0;
                var isHov = hoveredId === a.id;
                var isDel = deleteId === a.id;
                var pct = totalAssets > 0 && b > 0 ? Math.round((b / totalAssets) * 100) : 0;
                return (
                  <div key={a.id} style={{ padding: "10px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 10, transition: "background 0.1s", cursor: "default" }}
                    onMouseEnter={function () { setHoveredId(a.id); }}
                    onMouseLeave={function () { setHoveredId(""); if (isDel) setDeleteId(""); }}>
                    <Av typeName={a.type || "Other"} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</p>
                      <p style={{ fontSize: 10, color: "var(--muted)", margin: "1px 0 0 0" }}>{a.type || "Other"}{pct > 0 ? " · " + pct + "% of total" : ""}</p>
                    </div>
                    {isHov && !showForm ? (
                      <div style={{ display: "flex", gap: 2, marginRight: 4, flexShrink: 0 }}>
                        {isDel ? (
                          <button onClick={function () { deleteAcc(a.id); }} style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #EF4444", background: "rgba(239,68,68,0.06)", color: "#EF4444", fontSize: 9, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Delete?</button>
                        ) : (<>
                          <button onClick={function () { openEdit(a); }} title="Edit" style={{ width: 26, height: 26, borderRadius: 5, border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.1s" }} onMouseEnter={function (e) { e.currentTarget.style.background = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }} onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
                          <button onClick={function () { setDeleteId(a.id); setTimeout(function () { setDeleteId(""); }, 3000); }} title="Delete" style={{ width: 26, height: 26, borderRadius: 5, border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.1s" }} onMouseEnter={function (e) { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#EF4444"; }} onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg></button>
                        </>)}
                      </div>
                    ) : null}
                    <span style={{ fontSize: 13, fontWeight: 700, color: isNeg ? "#EF4444" : "#22C55E", fontVariantNumeric: "tabular-nums", flexShrink: 0, minWidth: 60, textAlign: "right" }}>{isNeg ? "-" : ""}{fmt(Math.abs(b))}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: "12px 12px 0", borderTop: "1px solid var(--border)", marginTop: 8 }}>
              <p style={{ fontSize: 10, color: "var(--muted)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{accounts.length} account{accounts.length !== 1 ? "s" : ""}{totalDebts > 0 ? " · Net worth " + fmt(totalBalance) : ""}</p>
            </div>
          </>
        ) : null}
      </div>

      <style>{"@keyframes sp{to{transform:rotate(360deg)}}"}</style>
      <style>{"@media(max-width:640px){.bh{flex-direction:column!important;align-items:flex-start!important}}"}</style>
      <style>{".droplist::-webkit-scrollbar{width:4px}.droplist::-webkit-scrollbar-track{background:transparent}.droplist::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}"}</style>
    </div>
  );
}