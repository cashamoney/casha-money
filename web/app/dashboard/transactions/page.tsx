"use client";

import { useState, useEffect, useRef } from "react";

type AccountType = "bank" | "upi" | "cash" | "card";
type Account = { id: string; type: AccountType; name: string; balance: number; color: string; details: Record<string, string> };
type Transaction = { id: string; amount: number; type: "income" | "expense"; merchant: string; category: string; date: string; note: string; source: "manual" | "sms" | "csv" | "auto"; accountId?: string; toAccountId?: string };
type TransferRecord = { id: string; from: string; to: string; amount: number; date: string };
type Profile = { name: string; email: string };
type SortOption = "newest" | "oldest" | "highest" | "lowest" | "merchant";
type DatePreset = "all" | "today" | "yesterday" | "week" | "month" | "30days" | "custom";
type PE = { date: string; merchant: string; amount: number; isIncome: boolean; category: string; selected: boolean; accountId: string };

var CM: Record<string, { color: string; bg: string; label: string }> = {
  Food: { color: "#F97316", bg: "#FFF7ED", label: "FD" }, Transport: { color: "#3B82F6", bg: "#EFF6FF", label: "TR" },
  Shopping: { color: "#A855F7", bg: "#FAF5FF", label: "SH" }, Entertainment: { color: "#EC4899", bg: "#FDF2F8", label: "EN" },
  Bills: { color: "#EAB308", bg: "#FEFCE8", label: "BL" }, Rent: { color: "#EF4444", bg: "#FEF2F2", label: "RN" },
  Health: { color: "#14B8A6", bg: "#F0FDFA", label: "HT" }, Education: { color: "#6366F1", bg: "#EEF2FF", label: "ED" },
  Investment: { color: "#06B6D4", bg: "#ECFEFF", label: "IV" }, Salary: { color: "#22C55E", bg: "#F0FDF4", label: "SA" },
  Freelance: { color: "#10B981", bg: "#ECFDF5", label: "FL" }, Refund: { color: "#8B5CF6", bg: "#FAF5FF", label: "RF" },
  Gift: { color: "#F472B6", bg: "#FDF2F8", label: "GF" }, Bonus: { color: "#34D399", bg: "#ECFDF5", label: "BN" },
  Rental: { color: "#FB923C", bg: "#FFF7ED", label: "RL" }, Interest: { color: "#60A5FA", bg: "#EFF6FF", label: "IN" },
  Dividend: { color: "#A78BFA", bg: "#FAF5FF", label: "DV" }, Transfer: { color: "#8B5CF6", bg: "#FAF5FF", label: "TF" },
  Other: { color: "#6B7280", bg: "#F9FAFB", label: "OT" },
};
var EXP_CATS = ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Rent", "Health", "Education", "Investment", "Transfer", "Other"];
var INC_CATS = ["Salary", "Freelance", "Investment", "Refund", "Gift", "Bonus", "Rental", "Interest", "Dividend", "Transfer", "Other"];
var ALL_CATS = Array.from(new Set([...EXP_CATS, ...INC_CATS]));
var MOS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var SL: Record<SortOption, string> = { newest: "Newest", oldest: "Oldest", highest: "Highest $", lowest: "Lowest $", merchant: "A→Z" };
var DL: Record<DatePreset, string> = { all: "All Time", today: "Today", yesterday: "Yesterday", week: "This Week", month: "This Month", "30days": "30 Days", custom: "Custom" };

function ci(n: string) { return CM[n] || CM.Other; }
function fm(n: number) { var a = Math.abs(n); return (n < 0 ? "-" : "") + "$" + a.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function ai(t: string) { return t === "bank" ? "BK" : t === "upi" ? "UP" : t === "cash" ? "CA" : t === "card" ? "CD" : "AC"; }
function ag(t: string): [string, string] { return t === "bank" ? ["#1E3A5F", "#3B82F6"] : t === "upi" ? ["#4C1D95", "#8B5CF6"] : t === "cash" ? ["#064E3B", "#22C55E"] : t === "card" ? ["#7C2D12", "#F97316"] : ["#1A1A2E", "#4A4A6A"]; }
function uid() { return Date.now().toString(36) + Math.random().toString(36).substring(2, 8); }
function ds(d: Date) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function dim(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function fday(y: number, m: number) { return new Date(y, m, 1).getDay(); }
function isTf(t: Transaction) { return t.merchant.startsWith("Transfer to ") || t.merchant.startsWith("Transfer from "); }

function dcat(ml: string): string {
  if (/swiggy|zomato|food|grocery|coffee|restaurant|blinkit/.test(ml)) return "Food";
  if (/uber|ola|lyft|fuel|petrol|metro|cab|flight/.test(ml)) return "Transport";
  if (/amazon|flipkart|myntra|walmart|shop/.test(ml)) return "Shopping";
  if (/netflix|spotify|movie|gaming|steam/.test(ml)) return "Entertainment";
  if (/bill|electricity|water|internet|phone/.test(ml)) return "Bills";
  if (/rent/.test(ml)) return "Rent";
  if (/hospital|doctor|medicine|health|gym/.test(ml)) return "Health";
  if (/course|school|book|udemy/.test(ml)) return "Education";
  if (/stock|invest|mutual|sip|groww/.test(ml)) return "Investment";
  if (/salary/.test(ml)) return "Salary";
  if (/freelance/.test(ml)) return "Freelance";
  if (/refund/.test(ml)) return "Refund";
  if (/bonus/.test(ml)) return "Bonus";
  if (/gift/.test(ml)) return "Gift";
  if (/rental/.test(ml)) return "Rental";
  if (/interest/.test(ml)) return "Interest";
  if (/dividend/.test(ml)) return "Dividend";
  if (/transfer/.test(ml)) return "Transfer";
  return "Other";
}

function autoDetect(accounts: Account[]): Transaction[] {
  var r: Transaction[] = []; var now = new Date();
  var ms = [
    { n: "Swiggy", c: "Food", lo: 80, hi: 450 }, { n: "Zomato", c: "Food", lo: 100, hi: 600 },
    { n: "Uber", c: "Transport", lo: 50, hi: 350 }, { n: "Ola", c: "Transport", lo: 40, hi: 280 },
    { n: "Amazon", c: "Shopping", lo: 200, hi: 3000 }, { n: "Flipkart", c: "Shopping", lo: 150, hi: 2500 },
    { n: "Netflix", c: "Entertainment", lo: 149, hi: 649 }, { n: "Spotify", c: "Entertainment", lo: 119, hi: 119 },
    { n: "Electricity Bill", c: "Bills", lo: 800, hi: 2500 }, { n: "Internet Bill", c: "Bills", lo: 500, hi: 1200 },
    { n: "MedPlus", c: "Health", lo: 50, hi: 800 }, { n: "Apollo Pharmacy", c: "Health", lo: 100, hi: 1200 },
    { n: "Udemy", c: "Education", lo: 499, hi: 1999 }, { n: "Groww", c: "Investment", lo: 1000, hi: 10000 },
    { n: "Salary Credit", c: "Salary", lo: 25000, hi: 80000 }, { n: "Freelance Payment", c: "Freelance", lo: 5000, hi: 30000 },
    { n: "Refund", c: "Refund", lo: 100, hi: 1500 }, { n: "Annual Bonus", c: "Bonus", lo: 10000, hi: 50000 },
  ];
  if (accounts.length === 0) return r;
  for (var i = 0; i < 8 + Math.floor(Math.random() * 12); i++) {
    var m = ms[Math.floor(Math.random() * ms.length)];
    var inc = ["Salary", "Freelance", "Investment", "Refund", "Bonus", "Gift", "Rental", "Interest", "Dividend"].includes(m.c);
    var amt = m.lo + Math.round((Math.random() * (m.hi - m.lo)) * 100) / 100;
    var ago = Math.floor(Math.random() * 30);
    var d = new Date(now.getTime() - ago * 86400000);
    var acc = accounts[Math.floor(Math.random() * accounts.length)];
    r.push({ id: uid(), amount: inc ? amt : -amt, type: inc ? "income" : "expense", merchant: m.n, category: m.c, date: ds(d), note: "", source: "auto" as "manual" | "sms" | "csv" | "auto", accountId: acc.id });
  }
  r.sort(function (a, b) { return b.date.localeCompare(a.date); }); return r;
}

function pLine(l: string, defId: string): PE | null {
  l = l.trim(); if (!l) return null;
  var am = l.match(/Rs\.?\s*([\d,]+\.?\d*)/i) || l.match(/INR\s*([\d,]+\.?\d*)/i) || l.match(/\$\s*([\d,]+\.?\d*)/i) || l.match(/([\d,]+\.\d{2})/) || l.match(/([\d,]+)/);
  if (!am) return null; var amount = parseFloat(am[1].replace(/,/g, "")); if (isNaN(amount) || amount === 0) return null;
  var isIncome = /credit|credited|received|deposited|refund|salary|CR/i.test(l) && !/debit|debited|spent|payment of/i.test(l);
  var dm = l.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/) || l.match(/(\d{4}-\d{2}-\d{2})/);
  var date = dm ? dm[1] : ds(new Date());
  if (date.match(/^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/)) { var p = date.split(/[-\/]/); if (p[2].length === 2) p[2] = "20" + p[2]; date = p[2] + "-" + p[1].padStart(2, "0") + "-" + p[0].padStart(2, "0"); }
  var toM = l.match(/(?:to|at|towards|for)\s+([A-Za-z][\w\s&.'-]{1,20})/i);
  var fromM = l.match(/(?:from|by)\s+([A-Za-z][\w\s&.'-]{1,20})/i);
  var dashM = l.match(/[-–]\s*([A-Za-z][\w\s&.'-]{1,20})/);
  var merchant = "";
  if (isIncome && fromM) merchant = fromM[1]; else if (!isIncome && toM) merchant = toM[1]; else if (fromM) merchant = fromM[1]; else if (toM) merchant = toM[1]; else if (dashM) merchant = dashM[1];
  merchant = merchant.replace(/\b(A\/C|acct|account|UPI|card|ending|no|ref|txn|on|was|has|been|is)\b/gi, "").replace(/\bXX\d+\b/g, "").replace(/\d{4,}/g, "").replace(/[^\w\s&.'-]/g, "").trim().substring(0, 24) || "Transaction";
  return { date: date, merchant: merchant, amount: amount, isIncome: isIncome, category: dcat(merchant.toLowerCase()), selected: true, accountId: defId };
}
function pText(text: string, accounts: Account[]): PE[] { var d = accounts.length > 0 ? accounts[0].id : ""; return text.trim().split("\n").map(function (l) { return pLine(l, d); }).filter(function (e) { return e !== null; }) as PE[]; }

function DetailContent(props: { tx: Transaction; accounts: Account[]; onClose: () => void; onDelete: (id: string) => void; onEdit: (t: Transaction) => void }) {
  var [ed, setEd] = useState(false);
  var [em, setEm] = useState(props.tx.merchant);
  var [ea, setEa] = useState(String(Math.abs(props.tx.amount)));
  var [et, setEt] = useState(props.tx.type);
  var [ec, setEc] = useState(props.tx.category);
  var [edt, setEdt] = useState(props.tx.date);
  var [en, setEn] = useState(props.tx.note);
  var [eai, setEai] = useState(props.tx.accountId || "");
  var tx = props.tx; var c = ci(tx.category);
  var acc = props.accounts.find(function (a) { return a.id === tx.accountId; }) || null;
  var tf = isTf(tx); var tfP: Account | null = null; var tfD: "out" | "in" = "out";
  if (tx.merchant.startsWith("Transfer to ")) { tfP = props.accounts.find(function (a) { return a.name === tx.merchant.replace("Transfer to ", ""); }) || null; tfD = "out"; }
  else if (tx.merchant.startsWith("Transfer from ")) { tfP = props.accounts.find(function (a) { return a.name === tx.merchant.replace("Transfer from ", ""); }) || null; tfD = "in"; }

  var startEd = function () { setEm(tx.merchant); setEa(String(Math.abs(tx.amount))); setEt(tx.type); setEc(tx.category); setEdt(tx.date); setEn(tx.note); setEai(tx.accountId || ""); setEd(true); };
  var saveEd = function () { var amt = parseFloat(ea); if (!amt || amt <= 0) return; props.onEdit({ ...tx, merchant: em.trim() || tx.merchant, amount: et === "expense" ? -amt : amt, type: et, category: ec, date: edt, note: en, accountId: eai || undefined }); setEd(false); };
  var cats = et === "income" ? INC_CATS : EXP_CATS;

  if (ed) return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 12px 0" }}>Edit Transaction</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 8 }}>
        <button onClick={function () { setEt("expense"); if (!EXP_CATS.includes(ec)) setEc("Other"); }} style={{ height: 32, borderRadius: 7, border: "1px solid " + (et === "expense" ? "var(--red-border)" : "var(--border)"), background: et === "expense" ? "var(--red-dim)" : "transparent", color: et === "expense" ? "var(--red)" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 200ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(239,68,68,0.15)"; }} onMouseLeave={function (e) { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}>Expense</button>
        <button onClick={function () { setEt("income"); if (!INC_CATS.includes(ec)) setEc("Other"); }} style={{ height: 32, borderRadius: 7, border: "1px solid " + (et === "income" ? "var(--green-border)" : "var(--border)"), background: et === "income" ? "var(--green-dim)" : "transparent", color: et === "income" ? "var(--green)" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 200ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(34,197,94,0.15)"; }} onMouseLeave={function (e) { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}>Income</button>
      </div>
      <input type="text" value={em} onChange={function (e) { setEm(e.target.value); }} placeholder="Merchant" style={{ width: "100%", height: 36, padding: "0 10px", borderRadius: 7, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit", marginBottom: 6 }} />
      <input type="text" inputMode="decimal" value={ea} onChange={function (e) { setEa(e.target.value.replace(/[^0-9.]/g, "")); }} placeholder="Amount" style={{ width: "100%", height: 42, padding: "0 10px", borderRadius: 7, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 18, fontWeight: 700, outline: "none", fontFamily: "inherit", marginBottom: 6, fontVariantNumeric: "tabular-nums" }} />
      <select value={ec} onChange={function (e) { setEc(e.target.value); }} style={{ width: "100%", height: 32, padding: "0 8px", borderRadius: 7, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit", marginBottom: 6, cursor: "pointer" }}>{cats.map(function (c) { return <option key={c} value={c}>{c}</option>; })}</select>
      <input type="date" value={edt} onChange={function (e) { setEdt(e.target.value); }} style={{ width: "100%", height: 32, padding: "0 8px", borderRadius: 7, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit", marginBottom: 6 }} />
      {props.accounts.length > 0 && <select value={eai} onChange={function (e) { setEai(e.target.value); }} style={{ width: "100%", height: 32, padding: "0 8px", borderRadius: 7, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit", marginBottom: 6, cursor: "pointer" }}><option value="">No account</option>{props.accounts.map(function (a) { return <option key={a.id} value={a.id}>{a.name}</option>; })}</select>}
      <input type="text" value={en} onChange={function (e) { setEn(e.target.value); }} placeholder="Note" style={{ width: "100%", height: 32, padding: "0 10px", borderRadius: 7, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit", marginBottom: 10 }} />
      <div style={{ display: "flex", gap: 6 }}><button onClick={function () { setEd(false); }} style={{ flex: 1, height: 36, borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button><button onClick={saveEd} disabled={!em.trim() || !ea} style={{ flex: 1, height: 36, borderRadius: 8, background: em.trim() && ea ? "var(--green)" : "var(--card)", border: "none", color: em.trim() && ea ? "#fff" : "var(--faint)", fontSize: 12, fontWeight: 600, cursor: em.trim() && ea ? "pointer" : "not-allowed", fontFamily: "inherit" }}>Save</button></div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: c.bg, border: "1px solid " + c.color + "25", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 14, fontWeight: 800, color: c.color }}>{c.label}</span></div>
        <div style={{ flex: 1, minWidth: 0 }}><p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: 0 }}>{tx.merchant}</p><p style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0 0 0" }}>{tx.date} {tf ? "\u00B7 Transfer" : "\u00B7 " + tx.category}</p></div>
      </div>
      <div style={{ textAlign: "center", marginBottom: 14, padding: "14px 0", borderRadius: 10, background: tx.type === "income" ? "var(--green-dim)" : "var(--red-dim)", border: "1px solid " + (tx.type === "income" ? "var(--green-border)" : "var(--red-border)") }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: tx.type === "income" ? "var(--green)" : "var(--red)", margin: "0 0 2px 0", textTransform: "uppercase" }}>{tx.type === "income" ? "Money In" : "Money Out"}</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: tx.type === "income" ? "var(--green)" : "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{tx.type === "income" ? "+" : "-"}{fm(Math.abs(tx.amount))}</p>
      </div>
      {acc && <div style={{ padding: "10px 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", marginBottom: 8 }}><p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 6px 0" }}>Account</p><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, " + ag(acc.type)[0] + ", " + ag(acc.type)[1] + ")", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{ai(acc.type)}</span></div><div><p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{acc.name}</p><p style={{ fontSize: 10, color: "var(--muted)", margin: "1px 0 0 0" }}>{acc.type}{acc.details.bankName ? " \u00B7 " + acc.details.bankName : ""}{acc.details.upiId ? " \u00B7 " + acc.details.upiId : ""}</p></div></div></div>}
      {tf && tfP && <div style={{ padding: "10px 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", marginBottom: 8 }}><p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 6px 0" }}>{tfD === "out" ? "To" : "From"}</p><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, " + ag(tfP.type)[0] + ", " + ag(tfP.type)[1] + ")", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{ai(tfP.type)}</span></div><div><p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>{tfP.name}</p></div></div></div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 12 }}>
        <div style={{ padding: "8px 10px", borderRadius: 6, background: "var(--surface)" }}><span style={{ fontSize: 8, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>Category</span><p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: "2px 0 0 0" }}>{tx.category}</p></div>
        <div style={{ padding: "8px 10px", borderRadius: 6, background: "var(--surface)" }}><span style={{ fontSize: 8, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>Source</span><p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", margin: "2px 0 0 0" }}>{tx.source === "auto" ? "Auto" : tx.source === "csv" ? "CSV" : tx.source === "sms" ? "SMS" : "Manual"}</p></div>
      </div>
      {tx.note && <div style={{ padding: "8px 10px", borderRadius: 6, background: "var(--surface)", marginBottom: 12 }}><span style={{ fontSize: 8, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>Note</span><p style={{ fontSize: 12, color: "var(--text)", margin: "2px 0 0 0" }}>{tx.note}</p></div>}
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={props.onClose} style={{ flex: 1, height: 36, borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Close</button>
        <button onClick={startEd} style={{ height: 36, padding: "0 14px", borderRadius: 8, background: "transparent", border: "1px solid var(--green-border)", color: "var(--green)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 200ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "scale(1.04)"; }} onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--green)"; e.currentTarget.style.transform = "scale(1)"; }}>Edit</button>
        <button onClick={function () { props.onDelete(tx.id); }} style={{ height: 36, padding: "0 14px", borderRadius: 8, background: "transparent", border: "1px solid var(--red-border)", color: "var(--red)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 200ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.background = "var(--red)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "scale(1.04)"; }} onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--red)"; e.currentTarget.style.transform = "scale(1)"; }}>Delete</button>
      </div>
    </div>
  );
}

var Arrow = function (props: { open: boolean }) { return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transition: "transform 250ms cubic-bezier(0.34,1.56,0.64,1)", transform: props.open ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}><polyline points="6 9 12 15 18 9" /></svg>; };

export default function TransactionsPage() {
  var [transactions, setTransactions] = useState<Transaction[]>([]);
  var [accounts, setAccounts] = useState<Account[]>([]);
  var [transfers, setTransfers] = useState<TransferRecord[]>([]);
  var [profile, setProfile] = useState<Profile>({ name: "John Doe", email: "john@example.com" });
  var [filter, setFilter] = useState<"all" | "income" | "expense" | "transfer">("all");
  var [filterAcc, setFilterAcc] = useState("all");
  var [filterCat, setFilterCat] = useState("all");
  var [sort, setSort] = useState<SortOption>("newest");
  var [datePreset, setDatePreset] = useState<DatePreset>("all");
  var [customFrom, setCustomFrom] = useState(ds(new Date()));
  var [customTo, setCustomTo] = useState(ds(new Date()));
  var [q, setQ] = useState("");
  var [showAdd, setShowAdd] = useState(false);
  var [showDetect, setShowDetect] = useState(false);
  var [showImport, setShowImport] = useState(false);
  var [importMode, setImportMode] = useState<"sms" | "csv">("sms");
  var [showDetail, setShowDetail] = useState(false);
  var [detailTx, setDetailTx] = useState<Transaction | null>(null);
  var [detecting, setDetecting] = useState(false);
  var [stmtText, setStmtText] = useState("");
  var [parsed, setParsed] = useState<PE[]>([]);
  var [addForm, setAddForm] = useState({ merchant: "", amount: "", type: "expense" as "income" | "expense", category: "Other", date: ds(new Date()), note: "", accountId: "" });
  var [toast, setToast] = useState("");
  var [vCount, setVCount] = useState(30);
  var [oSort, setOSort] = useState(false);
  var [oCat, setOCat] = useState(false);
  var [oDate, setODate] = useState(false);
  var [oAcc, setOAcc] = useState(false);
  var [calM, setCalM] = useState(new Date().getMonth());
  var [calY, setCalY] = useState(new Date().getFullYear());
  var [calFrom, setCalFrom] = useState("");
  var [calTo, setCalTo] = useState("");
  var loaderRef = useRef<HTMLDivElement>(null);

  useEffect(function () {
    var t = localStorage.getItem("casha-transactions"); if (t) try { setTransactions(JSON.parse(t)); } catch (e) {}
    var a = localStorage.getItem("casha-accounts"); if (a) try { setAccounts(JSON.parse(a)); } catch (e) {}
    var tr = localStorage.getItem("casha-transfers"); if (tr) try { setTransfers(JSON.parse(tr)); } catch (e) {}
    var p = localStorage.getItem("casha-profile"); if (p) try { setProfile(JSON.parse(p)); } catch (e) {}
  }, []);
  useEffect(function () { localStorage.setItem("casha-transactions", JSON.stringify(transactions)); }, [transactions]);
  useEffect(function () { localStorage.setItem("casha-accounts", JSON.stringify(accounts)); }, [accounts]);
  useEffect(function () { localStorage.setItem("casha-transfers", JSON.stringify(transfers)); }, [transfers]);

  useEffect(function () {
    if (!loaderRef.current) return;
    var obs = new IntersectionObserver(function (es) { if (es[0].isIntersecting) setVCount(function (c) { return c + 30; }); }, { threshold: 0.1 });
    obs.observe(loaderRef.current); return function () { obs.disconnect(); };
  }, [transactions, filter, filterAcc, filterCat, sort, datePreset, customFrom, customTo, q]);

  var closeAll = function () { setOSort(false); setOCat(false); setODate(false); setOAcc(false); };
  var sp = function (e: React.MouseEvent) { e.stopPropagation(); };
  var toast_ = function (m: string) { setToast(m); setTimeout(function () { setToast(""); }, 2500); };
  var getAcc = function (id: string | undefined) { if (!id) return null; return accounts.find(function (a) { return a.id === id; }) || null; };
  var tfP = function (t: Transaction) {
    if (t.merchant.startsWith("Transfer to ")) return { p: accounts.find(function (a) { return a.name === t.merchant.replace("Transfer to ", ""); }) || null, d: "out" as "out" | "in" };
    if (t.merchant.startsWith("Transfer from ")) return { p: accounts.find(function (a) { return a.name === t.merchant.replace("Transfer from ", ""); }) || null, d: "in" as "out" | "in" };
    return { p: null, d: t.type === "expense" ? "out" : "in" };
  };

  var now = new Date(); var ms = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  var mIn = transactions.filter(function (t) { return t.type === "income" && t.date.startsWith(ms) && !isTf(t); }).reduce(function (s, t) { return s + t.amount; }, 0);
  var mOut = transactions.filter(function (t) { return t.type === "expense" && t.date.startsWith(ms) && !isTf(t); }).reduce(function (s, t) { return s + Math.abs(t.amount); }, 0);
  var mTf = transactions.filter(function (t) { return t.date.startsWith(ms) && isTf(t) && t.type === "expense"; }).reduce(function (s, t) { return s + Math.abs(t.amount); }, 0);

  var gDR = function () {
    var from = ""; var to = ds(now);
    if (datePreset === "today") { from = to; } else if (datePreset === "yesterday") { var y = new Date(now.getTime() - 86400000); from = ds(y); to = ds(y); }
    else if (datePreset === "week") { from = ds(new Date(now.getTime() - now.getDay() * 86400000)); } else if (datePreset === "month") { from = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-01"; }
    else if (datePreset === "30days") { from = ds(new Date(now.getTime() - 29 * 86400000)); } else if (datePreset === "custom") { from = customFrom; to = customTo; }
    return { from: from, to: to };
  };
  var dr = gDR();
  var filtered = transactions.filter(function (t) {
    if (filter === "income" && t.type !== "income") return false; if (filter === "expense" && t.type !== "expense") return false; if (filter === "transfer" && !isTf(t)) return false;
    if (filterAcc !== "all" && t.accountId !== filterAcc) return false; if (filterCat !== "all" && t.category !== filterCat) return false;
    if (dr.from && t.date < dr.from) return false; if (dr.to && t.date > dr.to) return false;
    if (q) { var lq = q.toLowerCase(); if (t.merchant.toLowerCase().indexOf(lq) === -1 && t.category.toLowerCase().indexOf(lq) === -1 && t.note.toLowerCase().indexOf(lq) === -1) return false; }
    return true;
  });
  filtered.sort(function (a, b) { if (sort === "newest") return b.date.localeCompare(a.date); if (sort === "oldest") return a.date.localeCompare(b.date); if (sort === "highest") return Math.abs(b.amount) - Math.abs(a.amount); if (sort === "lowest") return Math.abs(a.amount) - Math.abs(b.amount); if (sort === "merchant") return a.merchant.localeCompare(b.merchant); return 0; });
  var vis = filtered.slice(0, vCount); var more = filtered.length > vCount;
  var groups: { label: string; date: string; items: Transaction[] }[] = []; var gm: Record<string, Transaction[]> = {};
  vis.forEach(function (t) { if (!gm[t.date]) gm[t.date] = []; gm[t.date].push(t); });
  Object.keys(gm).forEach(function (date) { var d = new Date(date + "T00:00:00"); var td = new Date(); td.setHours(0, 0, 0, 0); var yd = new Date(td.getTime() - 86400000); var label = d.getTime() === td.getTime() ? "Today" : d.getTime() === yd.getTime() ? "Yesterday" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); groups.push({ label: label, date: date, items: gm[date] }); });

  var doDetect = function () { setDetecting(true); setTimeout(function () { var d = autoDetect(accounts); setTransactions(function (p) { return d.concat(p); }); setDetecting(false); setShowDetect(false); toast_(d.length + " detected"); }, 2000); };
  var doParse = function () { if (!stmtText.trim()) return; setParsed(pText(stmtText, accounts)); };
  var togP = function (i: number) { setParsed(function (ps) { return ps.map(function (e, j) { return j === i ? { ...e, selected: !e.selected } : e; }); }); };
  var doImport = function () { var sel = parsed.filter(function (e) { return e.selected; }); var nw: Transaction[] = sel.map(function (e) { return { id: uid(), amount: e.isIncome ? e.amount : -e.amount, type: (e.isIncome ? "income" : "expense") as "income" | "expense", merchant: e.merchant, category: e.category, date: e.date, note: "", source: importMode as "manual" | "sms" | "csv" | "auto", accountId: e.accountId || undefined }; }); setTransactions(function (p) { return nw.concat(p); }); setParsed([]); setStmtText(""); setShowImport(false); toast_(nw.length + " imported"); };
  var doAdd = function () { var amt = parseFloat(addForm.amount); if (!amt || amt <= 0 || !addForm.merchant.trim()) return; var tx: Transaction = { id: uid(), amount: addForm.type === "expense" ? -amt : amt, type: addForm.type, merchant: addForm.merchant.trim(), category: addForm.category, date: addForm.date || ds(new Date()), note: addForm.note, source: "manual" as "manual" | "sms" | "csv" | "auto", accountId: addForm.accountId || undefined }; setTransactions(function (p) { return [tx, ...p]; }); setAddForm({ merchant: "", amount: "", type: "expense", category: "Other", date: ds(new Date()), note: "", accountId: "" }); setShowAdd(false); toast_(tx.merchant + " added"); };
  var doDelete = function (id: string) { setTransactions(function (p) { return p.filter(function (t) { return t.id !== id; }); }); toast_("Deleted"); setShowDetail(false); setDetailTx(null); };
  var doEdit = function (u: Transaction) { setTransactions(function (p) { return p.map(function (t) { return t.id === u.id ? u : t; }); }); toast_("Updated"); setShowDetail(false); setDetailTx(null); };

  var onCalDay = function (dateStr: string) { if (!calFrom || (calFrom && calTo)) { setCalFrom(dateStr); setCalTo(""); } else { if (dateStr < calFrom) { setCalTo(calFrom); setCalFrom(dateStr); } else { setCalTo(dateStr); } } };
  var applyCal = function () { setCustomFrom(calFrom); setCustomTo(calTo || calFrom); setDatePreset("custom"); closeAll(); };

  var today = ds(new Date());
  var dms = dim(calY, calM); var fds = fday(calY, calM);
  var calCells: (number | null)[] = []; for (var i = 0; i < fds; i++) calCells.push(null); for (var d = 1; d <= dms; d++) calCells.push(d);
  var calWeeks: (number | null)[][] = []; for (var w = 0; w < 6; w++) { calWeeks.push(calCells.slice(w * 7, (w + 1) * 7)); if (w * 7 >= calCells.length) break; }

  var addCats = addForm.type === "income" ? INC_CATS : EXP_CATS;

  var dropStyle = (open: boolean) => ({ position: "absolute" as const, top: 32, left: 0, zIndex: 40, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 6, boxShadow: "0 12px 32px rgba(0,0,0,0.15)", animation: "fadeIn 150ms ease" });
  var btnStyle = (open: boolean) => ({ height: 28, padding: "0 10px", borderRadius: 6, border: "1px solid " + (open ? "var(--green-border)" : "var(--border)"), background: open ? "var(--green-dim)" : "var(--surface)", color: open ? "var(--green)" : "var(--text)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex" as const, alignItems: "center" as const, gap: 4, transition: "all 200ms ease", whiteSpace: "nowrap" as const });

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 0 40px" }} onClick={closeAll}>
      {toast && <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 100, background: "var(--green)", color: "#fff", padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: "inherit", boxShadow: "0 4px 20px rgba(26,143,78,0.3)", animation: "fadeIn 200ms ease" }}>{toast}</div>}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", letterSpacing: -0.5, margin: "0 0 2px 0" }}>Transactions</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Every money movement — which account sent or received it.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
        <div style={{ background: "var(--surface)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}><p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 2px 0" }}>Money in</p><p style={{ fontSize: 18, fontWeight: 700, color: "var(--green)", margin: 0, fontVariantNumeric: "tabular-nums" }}>+{fm(mIn)}</p></div>
        <div style={{ background: "var(--surface)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}><p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 2px 0" }}>Money out</p><p style={{ fontSize: 18, fontWeight: 700, color: "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums" }}>-{fm(mOut)}</p></div>
        <div style={{ background: "var(--surface)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}><p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", margin: "0 0 2px 0" }}>Transferred</p><p style={{ fontSize: 18, fontWeight: 700, color: "#8B5CF6", margin: 0, fontVariantNumeric: "tabular-nums" }}>{fm(mTf)}</p></div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={function (e) { e.stopPropagation(); setShowAdd(true); setAddForm({ merchant: "", amount: "", type: "expense", category: "Other", date: ds(new Date()), note: "", accountId: accounts.length > 0 ? accounts[0].id : "" }); }} style={{ height: 36, padding: "0 14px", borderRadius: 8, background: "var(--green)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4, boxShadow: "0 2px 8px rgba(26,143,78,0.15)", transition: "all 200ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(26,143,78,0.3)"; }} onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(26,143,78,0.15)"; }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Add</button>
        <button onClick={function (e) { e.stopPropagation(); setShowDetect(true); }} style={{ height: 36, padding: "0 14px", borderRadius: 8, background: "linear-gradient(135deg, #1A8F4E, #2DD4BF)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4, boxShadow: "0 2px 8px rgba(26,143,78,0.2)", transition: "all 200ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(26,143,78,0.35)"; }} onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(26,143,78,0.2)"; }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>Auto-Detect</button>
        <button onClick={function (e) { e.stopPropagation(); setShowImport(true); setParsed([]); setStmtText(""); setImportMode("sms"); }} style={{ height: 36, padding: "0 14px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4, transition: "all 200ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.color = "var(--green)"; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.transform = "translateY(0)"; }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>SMS / CSV</button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
        {[{ key: "all", label: "All" }, { key: "income", label: "Income" }, { key: "expense", label: "Expense" }, { key: "transfer", label: "Transfers" }].map(function (f) {
          var on = filter === f.key;
          return <button key={f.key} onClick={function (e) { e.stopPropagation(); setFilter(f.key as "all" | "income" | "expense" | "transfer"); setVCount(30); closeAll(); }} style={{ height: 28, padding: "0 10px", borderRadius: 6, border: "1px solid " + (on ? "var(--green-border)" : "var(--border)"), background: on ? "var(--green-dim)" : "transparent", color: on ? "var(--green)" : "var(--muted)", fontSize: 11, fontWeight: on ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all 200ms ease" }} onMouseEnter={function (e) { if (!on) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.color = "var(--green)"; e.currentTarget.style.transform = "translateY(-1px)"; } } } onMouseLeave={function (e) { if (!on) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.transform = "translateY(0)"; } } }}>{f.label}</button>;
        })}
        <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 2px" }} />

        <div style={{ position: "relative" }} onClick={sp}>
          <button onClick={function () { setOSort(!oSort); setOCat(false); setODate(false); setOAcc(false); }} style={btnStyle(oSort)}>Sort: {SL[sort]} <Arrow open={oSort} /></button>
          {oSort && <div style={dropStyle(oSort)}>
            {(["newest", "oldest", "highest", "lowest", "merchant"] as SortOption[]).map(function (s) { return <button key={s} onClick={function (e) { e.stopPropagation(); setSort(s); setOSort(false); }} style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", textAlign: "left", padding: "7px 10px", borderRadius: 6, border: "none", background: sort === s ? "var(--green-dim)" : "transparent", color: sort === s ? "var(--green)" : "var(--text)", fontSize: 11, fontWeight: sort === s ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all 100ms ease" }}>{sort === s && <span style={{ width: 5, height: 5, borderRadius: 3, background: "var(--green)", flexShrink: 0 }} />}{SL[s]}</button>; })}
          </div>}
        </div>

        <div style={{ position: "relative" }} onClick={sp}>
          <button onClick={function () { setOCat(!oCat); setOSort(false); setODate(false); setOAcc(false); }} style={btnStyle(oCat)}>Category: {filterCat === "all" ? "All" : filterCat} <Arrow open={oCat} /></button>
          {oCat && <div style={{ ...dropStyle(oCat), minWidth: 240, padding: 8 }}>
            <button onClick={function (e) { e.stopPropagation(); setFilterCat("all"); setOCat(false); }} style={{ width: "100%", textAlign: "left", padding: "6px 8px", borderRadius: 6, border: "none", background: filterCat === "all" ? "var(--green-dim)" : "transparent", color: filterCat === "all" ? "var(--green)" : "var(--text)", fontSize: 11, fontWeight: filterCat === "all" ? 700 : 500, cursor: "pointer", fontFamily: "inherit", marginBottom: 4 }}>All Categories</button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
              {ALL_CATS.map(function (c) { var info = ci(c); var on = filterCat === c; return <button key={c} onClick={function (e) { e.stopPropagation(); setFilterCat(c); setOCat(false); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 7px", borderRadius: 6, border: "1px solid " + (on ? info.color + "50" : "transparent"), background: on ? info.bg : "transparent", color: on ? info.color : "var(--text)", fontSize: 9, fontWeight: on ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease", whiteSpace: "nowrap" }} onMouseEnter={function (e) { if (!on) { e.currentTarget.style.background = info.bg; e.currentTarget.style.borderColor = info.color + "30"; } }} onMouseLeave={function (e) { if (!on) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}><span style={{ width: 18, height: 18, borderRadius: 5, background: "linear-gradient(135deg, " + info.color + "20, " + info.color + "40)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 6, fontWeight: 800, color: info.color, flexShrink: 0 }}>{info.label}</span>{c}</button>; })}
            </div>
          </div>}
        </div>

        <div style={{ position: "relative" }} onClick={sp}>
          <button onClick={function () { setODate(!oDate); setOSort(false); setOCat(false); setOAcc(false); setCalM(new Date().getMonth()); setCalY(new Date().getFullYear()); setCalFrom(""); setCalTo(""); }} style={btnStyle(oDate)}>Date: {DL[datePreset]}{datePreset === "custom" ? " (" + customFrom + " → " + customTo + ")" : ""} <Arrow open={oDate} /></button>
          {oDate && <div style={{ ...dropStyle(oDate), right: 0, left: "auto", width: 280, padding: 10 }}>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
              {(["today", "yesterday", "week", "month", "30days"] as DatePreset[]).map(function (p) { return <button key={p} onClick={function (e) { e.stopPropagation(); setDatePreset(p); setODate(false); }} style={{ padding: "4px 8px", borderRadius: 5, border: "1px solid " + (datePreset === p ? "var(--green-border)" : "var(--border)"), background: datePreset === p ? "var(--green-dim)" : "transparent", color: datePreset === p ? "var(--green)" : "var(--muted)", fontSize: 9, fontWeight: datePreset === p ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green-dim)"; e.currentTarget.style.color = "var(--green)"; }} onMouseLeave={function (e) { if (datePreset !== p) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; } }}>{DL[p]}</button>; })}
              <button onClick={function (e) { e.stopPropagation(); setDatePreset("all"); setODate(false); }} style={{ padding: "4px 8px", borderRadius: 5, border: "1px solid " + (datePreset === "all" ? "var(--green-border)" : "var(--border)"), background: datePreset === "all" ? "var(--green-dim)" : "transparent", color: datePreset === "all" ? "var(--green)" : "var(--muted)", fontSize: 9, fontWeight: datePreset === "all" ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }}>All Time</button>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <button onClick={function (e) { e.stopPropagation(); if (calM === 0) { setCalM(11); setCalY(calY - 1); } else { setCalM(calM - 1); } }} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontFamily: "inherit", transition: "all 150ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green-dim)"; e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.color = "var(--green)"; }} onMouseLeave={function (e) { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }}>‹</button>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", letterSpacing: 0.3 }}>{MOS[calM]} {calY}</span>
                <button onClick={function (e) { e.stopPropagation(); if (calM === 11) { setCalM(0); setCalY(calY + 1); } else { setCalM(calM + 1); } }} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontFamily: "inherit", transition: "all 150ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green-dim)"; e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.color = "var(--green)"; }} onMouseLeave={function (e) { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }}>›</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 2 }}>{["S", "M", "T", "W", "T", "F", "S"].map(function (d, i) { return <div key={i} style={{ textAlign: "center", fontSize: 8, fontWeight: 700, color: "var(--muted)", padding: "2px 0", textTransform: "uppercase" }}>{d}</div>; })}</div>
              {calWeeks.map(function (week, wi) { return <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>{week.map(function (day, di) {
                if (day === null) return <div key={di} style={{ height: 30 }} />;
                var dateStr = calY + "-" + String(calM + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
                var isT = dateStr === today; var isF = dateStr === calFrom; var isTo = dateStr === calTo;
                var inR = calFrom && calTo && dateStr > calFrom && dateStr < calTo;
                var bg = isF || isTo ? "var(--green)" : inR ? "var(--green-dim)" : isT ? "var(--green-dim)" : "transparent";
                var col = isF || isTo ? "#fff" : inR || isT ? "var(--green)" : "var(--text)";
                return <button key={di} onClick={function (e) { e.stopPropagation(); onCalDay(dateStr); }} style={{ height: 30, borderRadius: 6, border: isT && !isF && !isTo ? "1.5px solid var(--green)" : "none", background: bg, color: col, fontSize: 10, fontWeight: isF || isTo || isT ? 700 : 400, cursor: "pointer", fontFamily: "inherit", transition: "all 100ms ease" }} onMouseEnter={function (e) { if (!isF && !isTo) e.currentTarget.style.background = "var(--green-dim)"; }} onMouseLeave={function (e) { if (!isF && !isTo) e.currentTarget.style.background = inR || isT ? "var(--green-dim)" : "transparent"; }}>{day}</button>;
              })}</div>; })}
              {calFrom && <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                  <div style={{ flex: 1 }}><p style={{ fontSize: 8, fontWeight: 600, color: "var(--muted)", margin: "0 0 2px 0", textTransform: "uppercase" }}>From</p><input type="date" value={calFrom} onClick={sp} onChange={function (e) { e.stopPropagation(); setCalFrom(e.target.value); }} style={{ width: "100%", height: 26, padding: "0 4px", borderRadius: 5, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 9, outline: "none", fontFamily: "inherit" }} /></div>
                  <div style={{ flex: 1 }}><p style={{ fontSize: 8, fontWeight: 600, color: "var(--muted)", margin: "0 0 2px 0", textTransform: "uppercase" }}>To</p><input type="date" value={calTo || calFrom} onClick={sp} onChange={function (e) { e.stopPropagation(); setCalTo(e.target.value); }} style={{ width: "100%", height: 26, padding: "0 4px", borderRadius: 5, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 9, outline: "none", fontFamily: "inherit" }} /></div>
                </div>
                <button onClick={function (e) { e.stopPropagation(); applyCal(); }} style={{ width: "100%", height: 28, borderRadius: 6, background: "var(--green)", border: "none", color: "#fff", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.background = "#15803d"; e.currentTarget.style.transform = "scale(1.02)"; }} onMouseLeave={function (e) { e.currentTarget.style.background = "var(--green)"; e.currentTarget.style.transform = "scale(1)"; }}>Apply Custom Range</button>
              </div>}
            </div>
          </div>}
        </div>

        {accounts.length > 0 && <div style={{ position: "relative" }} onClick={sp}>
          <button onClick={function () { setOAcc(!oAcc); setOSort(false); setOCat(false); setODate(false); }} style={btnStyle(oAcc)}>Account: {filterAcc === "all" ? "All" : (accounts.find(function (a) { return a.id === filterAcc; })?.name || "All")} <Arrow open={oAcc} /></button>
          {oAcc && <div style={{ ...dropStyle(oAcc), minWidth: 180 }}>
            <button onClick={function (e) { e.stopPropagation(); setFilterAcc("all"); setOAcc(false); }} style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", textAlign: "left", padding: "7px 10px", borderRadius: 6, border: "none", background: filterAcc === "all" ? "var(--green-dim)" : "transparent", color: filterAcc === "all" ? "var(--green)" : "var(--text)", fontSize: 11, fontWeight: filterAcc === "all" ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>All Accounts</button>
            {accounts.map(function (a) { var on = filterAcc === a.id; return <button key={a.id} onClick={function (e) { e.stopPropagation(); setFilterAcc(a.id); setOAcc(false); }} style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", textAlign: "left", padding: "7px 10px", borderRadius: 6, border: "none", background: on ? "var(--green-dim)" : "transparent", color: on ? "var(--green)" : "var(--text)", fontSize: 11, fontWeight: on ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all 100ms ease" }} onMouseEnter={function (e) { if (!on) e.currentTarget.style.background = "var(--green-dim)"; }} onMouseLeave={function (e) { if (!on) e.currentTarget.style.background = "transparent"; }}><div style={{ width: 20, height: 20, borderRadius: 5, background: "linear-gradient(135deg, " + ag(a.type)[0] + ", " + ag(a.type)[1] + ")", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 7, fontWeight: 800, color: "#fff" }}>{ai(a.type)}</span></div>{a.name}</button>; })}
          </div>}
        </div>}
      </div>

      <div style={{ marginBottom: 12 }}><input type="text" placeholder="Search merchant, category, or note..." value={q} onChange={function (e) { setQ(e.target.value); setVCount(30); }} style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit", transition: "all 200ms ease" }} onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 2px var(--green-dim)"; }} onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} /></div>

      {(filterCat !== "all" || datePreset !== "all" || sort !== "newest" || filterAcc !== "all") && (
        <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 9, color: "var(--muted)", fontWeight: 600, marginRight: 2 }}>Active:</span>
          {filterCat !== "all" && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 4, background: ci(filterCat).bg, border: "1px solid " + ci(filterCat).color + "30", fontSize: 9, fontWeight: 600, color: ci(filterCat).color }}>{filterCat}<button onClick={function (e) { e.stopPropagation(); setFilterCat("all"); }} style={{ background: "none", border: "none", color: ci(filterCat).color, cursor: "pointer", fontSize: 10, padding: 0, lineHeight: 1, fontFamily: "inherit" }}>\u00D7</button></span>}
          {datePreset !== "all" && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 4, background: "var(--green-dim)", border: "1px solid var(--green-border)", fontSize: 9, fontWeight: 600, color: "var(--green)" }}>{DL[datePreset]}{datePreset === "custom" ? " " + customFrom + "→" + customTo : ""}<button onClick={function (e) { e.stopPropagation(); setDatePreset("all"); }} style={{ background: "none", border: "none", color: "var(--green)", cursor: "pointer", fontSize: 10, padding: 0, lineHeight: 1, fontFamily: "inherit" }}>\u00D7</button></span>}
          {sort !== "newest" && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 4, background: "var(--surface)", border: "1px solid var(--border)", fontSize: 9, fontWeight: 600, color: "var(--text)" }}>Sort: {SL[sort]}<button onClick={function (e) { e.stopPropagation(); setSort("newest"); }} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 10, padding: 0, lineHeight: 1, fontFamily: "inherit" }}>\u00D7</button></span>}
          {filterAcc !== "all" && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 4, background: "var(--surface)", border: "1px solid var(--border)", fontSize: 9, fontWeight: 600, color: "var(--text)" }}>{accounts.find(function (a) { return a.id === filterAcc; })?.name || "Account"}<button onClick={function (e) { e.stopPropagation(); setFilterAcc("all"); }} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 10, padding: 0, lineHeight: 1, fontFamily: "inherit" }}>\u00D7</button></span>}
          <button onClick={function (e) { e.stopPropagation(); setFilterCat("all"); setDatePreset("all"); setSort("newest"); setFilterAcc("all"); }} style={{ padding: "2px 7px", borderRadius: 4, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 9, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Clear all</button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ background: "var(--surface)", borderRadius: 12, padding: "36px 20px", border: "1px solid var(--border)", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg></div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 4px 0" }}>No transactions found</p>
          <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 14px 0", lineHeight: 1.5 }}>Add one, import SMS/CSV, or auto-detect.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {groups.map(function (g) { return <div key={g.date}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, padding: "0 2px" }}><p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", margin: 0, textTransform: "uppercase", letterSpacing: 0.03 }}>{g.label}</p><p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{g.items.length} txns</p></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{g.items.map(function (tx) { var c = ci(tx.category); var acc = getAcc(tx.accountId); var tf = isTf(tx); var tfi = tf ? tfP(tx) : null; return (
              <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer", transition: "all 150ms ease" }} onClick={function (e) { e.stopPropagation(); setDetailTx(tx); setShowDetail(true); }} onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.background = "var(--green-dim)"; }} onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: c.bg, border: "1px solid " + c.color + "25", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 10, fontWeight: 800, color: c.color }}>{c.label}</span></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.merchant}</p>
                    {tf && <span style={{ fontSize: 7, fontWeight: 700, color: "#8B5CF6", background: "#FAF5FF", padding: "1px 4px", borderRadius: 2, textTransform: "uppercase", flexShrink: 0 }}>TRANSFER</span>}
                    {tx.source === "auto" && <span style={{ fontSize: 7, fontWeight: 700, color: "var(--green)", background: "var(--green-dim)", padding: "1px 4px", borderRadius: 2, textTransform: "uppercase", flexShrink: 0 }}>AUTO</span>}
                    {tx.source === "csv" && <span style={{ fontSize: 7, fontWeight: 700, color: "#3B82F6", background: "#EFF6FF", padding: "1px 4px", borderRadius: 2, textTransform: "uppercase", flexShrink: 0 }}>CSV</span>}
                    {tx.source === "sms" && <span style={{ fontSize: 7, fontWeight: 700, color: "#F97316", background: "#FFF7ED", padding: "1px 4px", borderRadius: 2, textTransform: "uppercase", flexShrink: 0 }}>SMS</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    {acc && <div style={{ display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 16, height: 16, borderRadius: 4, background: "linear-gradient(135deg, " + ag(acc.type)[0] + ", " + ag(acc.type)[1] + ")", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 6, fontWeight: 800, color: "#fff" }}>{ai(acc.type)}</span></div><span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500 }}>{acc.name}</span></div>}
                    {tf && tfi && tfi.p && <div style={{ display: "flex", alignItems: "center", gap: 3 }}><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg><div style={{ width: 16, height: 16, borderRadius: 4, background: "linear-gradient(135deg, " + ag(tfi.p.type)[0] + ", " + ag(tfi.p.type)[1] + ")", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 6, fontWeight: 800, color: "#fff" }}>{ai(tfi.p.type)}</span></div><span style={{ fontSize: 10, color: tfi.d === "out" ? "var(--red)" : "var(--green)", fontWeight: 500 }}>{tfi.d === "out" ? "to" : "from"} {tfi.p.name}</span></div>}
                    {!acc && !tf && <span style={{ fontSize: 10, color: "var(--muted)" }}>{tx.category}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: tx.type === "income" ? "var(--green)" : "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{tx.type === "income" ? "+" : "-"}{fm(Math.abs(tx.amount))}</p>
                  <span style={{ fontSize: 9, color: "var(--muted)", marginTop: 1 }}>{tx.date}</span>
                </div>
              </div>
            ); })}</div></div>; })}
          {more && <div ref={loaderRef} style={{ textAlign: "center", padding: "12px 0" }}><p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>Loading more...</p></div>}
        </div>
      )}

      {showDetail && detailTx && <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", animation: "fadeIn 200ms ease" }} onClick={function () { setShowDetail(false); setDetailTx(null); }}><div style={{ background: "var(--bg)", borderRadius: 16, padding: 22, width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)" }} onClick={function (e) { e.stopPropagation(); }}><DetailContent tx={detailTx} accounts={accounts} onClose={function () { setShowDetail(false); setDetailTx(null); }} onDelete={doDelete} onEdit={doEdit} /></div></div>}

      {showAdd && <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", animation: "fadeIn 200ms ease" }} onClick={function () { setShowAdd(false); }}><div style={{ background: "var(--bg)", borderRadius: 16, padding: 22, width: "100%", maxWidth: 380, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)" }} onClick={function (e) { e.stopPropagation(); }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 12px 0" }}>Add Transaction</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 10 }}>
          <button onClick={function () { setAddForm(function (f) { return { ...f, type: "expense", category: EXP_CATS.includes(f.category) ? f.category : "Other" }; }); }} style={{ height: 36, borderRadius: 8, border: "1px solid " + (addForm.type === "expense" ? "var(--red-border)" : "var(--border)"), background: addForm.type === "expense" ? "var(--red-dim)" : "transparent", color: addForm.type === "expense" ? "var(--red)" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 200ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 3px 12px rgba(239,68,68,0.2)"; }} onMouseLeave={function (e) { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}>Expense</button>
          <button onClick={function () { setAddForm(function (f) { return { ...f, type: "income", category: INC_CATS.includes(f.category) ? f.category : "Other" }; }); }} style={{ height: 36, borderRadius: 8, border: "1px solid " + (addForm.type === "income" ? "var(--green-border)" : "var(--border)"), background: addForm.type === "income" ? "var(--green-dim)" : "transparent", color: addForm.type === "income" ? "var(--green)" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 200ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 3px 12px rgba(34,197,94,0.2)"; }} onMouseLeave={function (e) { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}>Income</button>
        </div>
        <input type="text" placeholder="Merchant" value={addForm.merchant} onChange={function (e) { setAddForm(function (f) { return { ...f, merchant: e.target.value }; }); }} style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit", marginBottom: 6, transition: "border-color 200ms ease" }} onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; }} onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }} />
        <input type="text" inputMode="decimal" placeholder="Amount" value={addForm.amount} onChange={function (e) { setAddForm(function (f) { return { ...f, amount: e.target.value.replace(/[^0-9.]/g, "") }; }); }} style={{ width: "100%", height: 44, padding: "0 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 18, fontWeight: 700, outline: "none", fontFamily: "inherit", marginBottom: 6, fontVariantNumeric: "tabular-nums", transition: "border-color 200ms ease" }} onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; }} onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }} />
        <select value={addForm.category} onChange={function (e) { setAddForm(function (f) { return { ...f, category: e.target.value }; }); }} style={{ width: "100%", height: 36, padding: "0 10px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit", marginBottom: 6, cursor: "pointer" }}>{addCats.map(function (c) { return <option key={c} value={c}>{c}</option>; })}</select>
        <input type="date" value={addForm.date} onChange={function (e) { setAddForm(function (f) { return { ...f, date: e.target.value }; }); }} style={{ width: "100%", height: 36, padding: "0 10px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit", marginBottom: 6 }} />
        {accounts.length > 0 && <select value={addForm.accountId} onChange={function (e) { setAddForm(function (f) { return { ...f, accountId: e.target.value }; }); }} style={{ width: "100%", height: 36, padding: "0 10px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit", marginBottom: 6, cursor: "pointer" }}><option value="">No account</option>{accounts.map(function (a) { return <option key={a.id} value={a.id}>{a.name} ({a.type})</option>; })}</select>}
        <input type="text" placeholder="Note (optional)" value={addForm.note} onChange={function (e) { setAddForm(function (f) { return { ...f, note: e.target.value }; }); }} style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit", marginBottom: 10, transition: "border-color 200ms ease" }} onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; }} onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }} />
        <div style={{ display: "flex", gap: 6 }}><button onClick={function () { setShowAdd(false); }} style={{ flex: 1, height: 38, borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button><button onClick={doAdd} disabled={!addForm.merchant.trim() || !addForm.amount} style={{ flex: 1, height: 38, borderRadius: 8, background: addForm.merchant.trim() && addForm.amount ? "var(--green)" : "var(--card)", border: "none", color: addForm.merchant.trim() && addForm.amount ? "#fff" : "var(--faint)", fontSize: 12, fontWeight: 600, cursor: addForm.merchant.trim() && addForm.amount ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 200ms ease" }} onMouseEnter={function (e) { if (addForm.merchant.trim() && addForm.amount) e.currentTarget.style.transform = "scale(1.03)"; }} onMouseLeave={function (e) { e.currentTarget.style.transform = "scale(1)"; }}>Add</button></div>
      </div></div>}

      {showDetect && <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", animation: "fadeIn 200ms ease" }} onClick={function () { if (!detecting) setShowDetect(false); }}><div style={{ background: "var(--bg)", borderRadius: 16, padding: 22, width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)", textAlign: "center" }} onClick={function (e) { e.stopPropagation(); }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: detecting ? "var(--green-dim)" : "linear-gradient(135deg, #1A8F4E, #2DD4BF)", border: detecting ? "1px solid var(--green-border)" : "none", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>{detecting ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}</div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 6px 0" }}>{detecting ? "Detecting..." : "Auto-Detect"}</h3>
        <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 6px 0", lineHeight: 1.5 }}>{detecting ? "Scanning your accounts..." : "Scan connected accounts for recent transactions."}</p>
        {!detecting && accounts.length === 0 && <p style={{ fontSize: 11, color: "var(--red)", margin: "0 0 12px 0" }}>Add at least one account first.</p>}
        {!detecting && accounts.length > 0 && <p style={{ fontSize: 10, color: "var(--muted)", margin: "0 0 16px 0" }}>{accounts.length} account{accounts.length > 1 ? "s" : ""}: {accounts.map(function (a) { return a.name; }).join(", ")}</p>}
        {detecting && <div style={{ width: "100%", height: 4, borderRadius: 2, background: "var(--green-dim)", overflow: "hidden", margin: "8px 0 16px" }}><div style={{ width: "60%", height: "100%", borderRadius: 2, background: "var(--green)", animation: "pulse 1.5s ease-in-out infinite" }} /></div>}
        <div style={{ display: "flex", gap: 8 }}><button onClick={function (e) { e.stopPropagation(); if (!detecting) setShowDetect(false); }} disabled={detecting} style={{ flex: 1, height: 40, borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: detecting ? "var(--faint)" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: detecting ? "not-allowed" : "pointer", fontFamily: "inherit" }}>Cancel</button><button onClick={function (e) { e.stopPropagation(); doDetect(); }} disabled={detecting || accounts.length === 0} style={{ flex: 1, height: 40, borderRadius: 8, background: detecting || accounts.length === 0 ? "var(--card)" : "linear-gradient(135deg, #1A8F4E, #2DD4BF)", border: "none", color: detecting || accounts.length === 0 ? "var(--faint)" : "#fff", fontSize: 12, fontWeight: 600, cursor: detecting || accounts.length === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 200ms ease" }} onMouseEnter={function (e) { if (!detecting && accounts.length > 0) e.currentTarget.style.transform = "scale(1.03)"; }} onMouseLeave={function (e) { e.currentTarget.style.transform = "scale(1)"; }}>{detecting ? "Scanning..." : "Detect Now"}</button></div>
      </div></div>}

      {showImport && <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", animation: "fadeIn 200ms ease" }} onClick={function () { setShowImport(false); }}><div style={{ background: "var(--bg)", borderRadius: 16, padding: 22, width: "100%", maxWidth: 400, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)" }} onClick={function (e) { e.stopPropagation(); }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 4px 0" }}>Import Transactions</h2>
        <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 12px 0" }}>Paste SMS or CSV. We auto-detect amounts, dates &amp; merchants.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 10 }}>
          <button onClick={function () { setImportMode("sms"); setParsed([]); }} style={{ height: 36, borderRadius: 8, border: "1px solid " + (importMode === "sms" ? "#F97316" : "var(--border)"), background: importMode === "sms" ? "#FFF7ED" : "transparent", color: importMode === "sms" ? "#F97316" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "all 200ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 3px 12px rgba(249,115,22,0.15)"; }} onMouseLeave={function (e) { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>SMS</button>
          <button onClick={function () { setImportMode("csv"); setParsed([]); }} style={{ height: 36, borderRadius: 8, border: "1px solid " + (importMode === "csv" ? "#3B82F6" : "var(--border)"), background: importMode === "csv" ? "#EFF6FF" : "transparent", color: importMode === "csv" ? "#3B82F6" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "all 200ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 3px 12px rgba(59,130,246,0.15)"; }} onMouseLeave={function (e) { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>CSV</button>
        </div>
        <textarea value={stmtText} onChange={function (e) { setStmtText(e.target.value); setParsed([]); }} placeholder={importMode === "sms" ? "Your Rs.250.00 txn from A/C XX1234 to Swiggy on 15/01/25 was debited.\nRs.50000.00 credited to A/C XX5678 on 16/01/25 - SALARY\nYour UPI payment of Rs.185.50 to Uber on 17/01/25" : "15/01/2025,Swiggy,250.00,expense\n16/01/2025,Salary,50000.00,income\n17/01/2025,Netflix,15.99,expense"} style={{ width: "100%", height: 90, borderRadius: 8, padding: "10px", fontSize: 11, fontFamily: "monospace", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", outline: "none", resize: "none", lineHeight: 1.5, marginBottom: 8, transition: "border-color 200ms ease" }} onFocus={function (e) { e.currentTarget.style.borderColor = importMode === "sms" ? "#F97316" : "#3B82F6"; }} onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }} />
        <button onClick={doParse} disabled={!stmtText.trim()} style={{ height: 34, padding: "0 14px", borderRadius: 8, background: stmtText.trim() ? (importMode === "sms" ? "#F97316" : "#3B82F6") : "var(--card)", border: "none", color: stmtText.trim() ? "#fff" : "var(--faint)", fontSize: 11, fontWeight: 600, cursor: stmtText.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", marginBottom: 8, transition: "all 200ms ease", width: "100%" }} onMouseEnter={function (e) { if (stmtText.trim()) e.currentTarget.style.transform = "scale(1.01)"; }} onMouseLeave={function (e) { e.currentTarget.style.transform = "scale(1)"; }}>{importMode === "sms" ? "Parse SMS" : "Parse CSV"}</button>
        {parsed.length > 0 && <div style={{ marginTop: 8, animation: "fadeIn 200ms ease" }}><p style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", margin: "0 0 6px 0" }}>Found {parsed.length} — toggle to select</p><div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 8, maxHeight: 200, overflowY: "auto" }}>{parsed.map(function (en, idx) { var c = ci(en.category); return <div key={idx} onClick={function (e) { e.stopPropagation(); togP(idx); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderRadius: 5, background: en.selected ? "var(--green-dim)" : "var(--bg)", border: "1px solid " + (en.selected ? "var(--green-border)" : "var(--border)"), cursor: "pointer", transition: "all 120ms ease", opacity: en.selected ? 1 : 0.4 }}><div style={{ width: 14, height: 14, borderRadius: 3, border: en.selected ? "none" : "2px solid var(--border)", background: en.selected ? "var(--green)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{en.selected && <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}</div><span style={{ width: 16, height: 11, borderRadius: 2, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 5, fontWeight: 800, color: c.color, flexShrink: 0 }}>{c.label}</span><span style={{ flex: 1, fontSize: 10, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{en.merchant}</span><span style={{ fontSize: 10, fontWeight: 700, color: en.isIncome ? "var(--green)" : "var(--red)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{en.isIncome ? "+" : "-"}{fm(en.amount)}</span></div>; })}</div><button onClick={function (e) { e.stopPropagation(); doImport(); }} style={{ height: 34, padding: "0 14px", borderRadius: 8, background: "var(--green)", border: "none", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", width: "100%", transition: "all 200ms ease" }} onMouseEnter={function (e) { e.currentTarget.style.background = "#15803d"; e.currentTarget.style.transform = "scale(1.01)"; }} onMouseLeave={function (e) { e.currentTarget.style.background = "var(--green)"; e.currentTarget.style.transform = "scale(1)"; }}>Add {parsed.filter(function (e) { return e.selected; }).length} Transactions</button></div>}
        <div style={{ marginTop: 8 }}><button onClick={function () { setShowImport(false); }} style={{ width: "100%", height: 34, borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Close</button></div>
      </div></div>}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }`}</style>
    </div>
  );
}