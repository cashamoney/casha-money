"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Transaction = {
  id: string;
  amount: number;
  type: "income" | "expense";
  merchant: string;
  category: string;
  date: string;
  note: string;
  source: "manual" | "sms" | "csv";
};

var EXPENSE_CATS = [
  { name: "Food", color: "#F97316", bg: "#FFF7ED", letters: "FD" },
  { name: "Transport", color: "#3B82F6", bg: "#EFF6FF", letters: "TR" },
  { name: "Shopping", color: "#A855F7", bg: "#FAF5FF", letters: "SH" },
  { name: "Entertainment", color: "#EC4899", bg: "#FDF2F8", letters: "EN" },
  { name: "Bills", color: "#EAB308", bg: "#FEFCE8", letters: "BL" },
  { name: "Rent", color: "#EF4444", bg: "#FEF2F2", letters: "RN" },
  { name: "Health", color: "#14B8A6", bg: "#F0FDFA", letters: "HT" },
  { name: "Education", color: "#6366F1", bg: "#EEF2FF", letters: "ED" },
  { name: "Investment", color: "#06B6D4", bg: "#ECFEFF", letters: "IV" },
  { name: "Other", color: "#6B7280", bg: "#F9FAFB", letters: "OT" },
];

var INCOME_CATS = [
  { name: "Salary", color: "#22C55E", bg: "#F0FDF4", letters: "SA" },
  { name: "Freelance", color: "#10B981", bg: "#ECFDF5", letters: "FR" },
  { name: "Investment Returns", color: "#06B6D4", bg: "#ECFEFF", letters: "IR" },
  { name: "Dividend", color: "#0EA5E9", bg: "#F0F9FF", letters: "DV" },
  { name: "Interest", color: "#8B5CF6", bg: "#F5F3FF", letters: "NT" },
  { name: "Cashback", color: "#F59E0B", bg: "#FFFBEB", letters: "CB" },
  { name: "Refund", color: "#6366F1", bg: "#EEF2FF", letters: "RF" },
  { name: "Gift", color: "#EC4899", bg: "#FDF2F8", letters: "GF" },
  { name: "Rental Income", color: "#14B8A6", bg: "#F0FDFA", letters: "RI" },
  { name: "Bonus", color: "#F97316", bg: "#FFF7ED", letters: "BN" },
  { name: "Other Income", color: "#6B7280", bg: "#F9FAFB", letters: "OI" },
];

var ALL_CATS = EXPENSE_CATS.concat(INCOME_CATS);

function getCat(name: string) {
  return ALL_CATS.find(function (c) { return c.name === name; }) || { name: name, color: "#6B7280", bg: "#F9FAFB", letters: "OT" };
}

function getCatsForType(type: "income" | "expense") {
  return type === "income" ? INCOME_CATS : EXPENSE_CATS;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function formatCurrency(n: number) {
  var abs = Math.abs(n);
  var str = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (n < 0 ? "-" : "") + "$" + str;
}

function detectCategory(text: string): { category: string; isIncome: boolean } {
  var l = text.toLowerCase();
  var isIncome = l.includes("credited") || l.includes("received") || l.includes("deposited") || l.includes("salary") || l.includes("income") || l.includes("refund") || l.includes("dividend") || l.includes("interest") || l.includes("cashback") || l.includes("freelance") || l.includes("bonus") || l.includes("gift") || l.includes("rental");
  if (isIncome) {
    var cat = "Salary";
    if (l.includes("freelance")) cat = "Freelance";
    else if (l.includes("dividend")) cat = "Dividend";
    else if (l.includes("interest")) cat = "Interest";
    else if (l.includes("cashback")) cat = "Cashback";
    else if (l.includes("refund")) cat = "Refund";
    else if (l.includes("gift")) cat = "Gift";
    else if (l.includes("bonus")) cat = "Bonus";
    else if (l.includes("rental")) cat = "Rental Income";
    else if (l.includes("invest")) cat = "Investment Returns";
    else if (!l.includes("salary")) cat = "Other Income";
    return { category: cat, isIncome: true };
  }
  var cat = "Other";
  if (l.includes("swiggy") || l.includes("zomato") || l.includes("food") || l.includes("doordash") || l.includes("restaurant") || l.includes("pizza") || l.includes("burger") || l.includes("coffee") || l.includes("starbucks") || l.includes("dominos") || l.includes("mcdonald") || l.includes("kfc") || l.includes("subway") || l.includes("bakery") || l.includes("cafe") || l.includes("tea") || l.includes("lunch") || l.includes("dinner") || l.includes("breakfast") || l.includes("grocery") || l.includes("grofers") || l.includes("bigbasket") || l.includes("blinkit")) cat = "Food";
  else if (l.includes("uber") || l.includes("ola") || l.includes("fuel") || l.includes("petrol") || l.includes("lyft") || l.includes("gas") || l.includes("metro") || l.includes("train") || l.includes("cab") || l.includes("taxi") || l.includes("airline") || l.includes("flight") || l.includes("airport") || l.includes("diesel") || l.includes("rapido")) cat = "Transport";
  else if (l.includes("netflix") || l.includes("hotstar") || l.includes("spotify") || l.includes("hulu") || l.includes("movie") || l.includes("gaming") || l.includes("steam") || l.includes("playstation") || l.includes("xbox") || l.includes("disney") || l.includes("youtube") || l.includes("prime video") || l.includes("twitch")) cat = "Entertainment";
  else if (l.includes("amazon") || l.includes("flipkart") || l.includes("myntra") || l.includes("target") || l.includes("walmart") || l.includes("shop") || l.includes("store") || l.includes("mall") || l.includes("ebay") || l.includes("etsy") || l.includes("ajio") || l.includes("nykaa") || l.includes("meesho")) cat = "Shopping";
  else if (l.includes("rent") || l.includes("housing") || l.includes("lease")) cat = "Rent";
  else if (l.includes("electricity") || l.includes("bill") || l.includes("water") || l.includes("utility") || l.includes("internet") || l.includes("phone") || l.includes("recharge") || l.includes("jio") || l.includes("airtel") || l.includes("vodafone") || l.includes("broadband") || l.includes("wifi") || l.includes("gas bill")) cat = "Bills";
  else if (l.includes("hospital") || l.includes("doctor") || l.includes("medicine") || l.includes("pharmacy") || l.includes("health") || l.includes("gym") || l.includes("fitness") || l.includes("dental") || l.includes("eye") || l.includes("clinic") || l.includes("medplus") || l.includes("apollo") || l.includes("1mg")) cat = "Health";
  else if (l.includes("course") || l.includes("school") || l.includes("college") || l.includes("tuition") || l.includes("book") || l.includes("udemy") || l.includes("coursera") || l.includes("skillshare") || l.includes("university") || l.includes("academy") || l.includes("byju") || l.includes("unacademy")) cat = "Education";
  else if (l.includes("stock") || l.includes("mutual fund") || l.includes("sip") || l.includes("invest") || l.includes("zerodha") || l.includes("groww") || l.includes("upstox") || l.includes("coinbase") || l.includes("crypto") || l.includes("bitcoin")) cat = "Investment";
  return { category: cat, isIncome: false };
}

function smartParse(text: string): { amount: number; merchant: string; category: string; date: string; isIncome: boolean } | null {
  if (!text.trim()) return null;
  var am = text.match(/Rs\.?([\d,]+\.?\d*)/i) || text.match(/INR\s*([\d,]+\.?\d*)/i) || text.match(/\$([\d,]+\.?\d*)/i) || text.match(/([\d,]+\.?\d*)\s*(?:debited|credited|spent|paid|received|withdrawn|deposited)/i) || text.match(/([\d,]+\.?\d*)/);
  if (!am) return null;
  var amount = parseFloat(am[1].replace(/,/g, ""));
  if (isNaN(amount) || amount === 0) return null;
  var mm = text.match(/(?:to|at|info[:\s]*|to\s+|from\s+|by\s+)([A-Za-z\s]+)/i);
  var merchant = mm ? mm[1].trim().substring(0, 24) : "Transaction";
  var det = detectCategory(text);
  var dm = text.match(/(\d{1,2}[\-\/]\d{1,2}[\-\/]\d{2,4})/) || text.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*)/i);
  var date = dm ? dm[1] : new Date().toISOString().split("T")[0];
  return { amount: amount, merchant: merchant, category: det.category, date: date, isIncome: det.isIncome };
}

function CategoryIcon(props: { name: string; size?: number }) {
  var cat = getCat(props.name);
  var s = props.size || 42;
  return (
    <div style={{ width: s, height: s, borderRadius: Math.round(s * 0.28), background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: Math.round(s * 0.28), fontWeight: 800, color: cat.color, letterSpacing: -0.5 }}>{cat.letters}</span>
    </div>
  );
}

function CalendarDropdown(props: { value: string; onChange: (val: string) => void }) {
  var [open, setOpen] = useState(false);
  var ref = useRef<HTMLDivElement>(null);
  var d = new Date(props.value);
  var [viewYear, setViewYear] = useState(d.getFullYear());
  var [viewMonth, setViewMonth] = useState(d.getMonth());
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  useEffect(function () {
    if (!open) return;
    var handler = function (e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); }
    };
    document.addEventListener("mousedown", handler);
    return function () { document.removeEventListener("mousedown", handler); };
  }, [open]);

  useEffect(function () {
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [props.value, open]);

  var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  var firstDay = new Date(viewYear, viewMonth, 1).getDay();
  var days: (number | null)[] = [];
  for (var i = 0; i < firstDay; i++) days.push(null);
  for (var j = 1; j <= daysInMonth; j++) days.push(j);

  var selectDay = function (day: number) {
    var m = String(viewMonth + 1).padStart(2, "0");
    var dd = String(day).padStart(2, "0");
    props.onChange(viewYear + "-" + m + "-" + dd);
    setOpen(false);
  };

  var prevMonth = function () {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else { setViewMonth(viewMonth - 1); }
  };
  var nextMonth = function () {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else { setViewMonth(viewMonth + 1); }
  };

  var selected = props.value;
  var today = new Date().toISOString().split("T")[0];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={function () { setOpen(function (p) { return !p; }); }}
        style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid " + (open ? "var(--green-border)" : "var(--border)"), color: "var(--text)", fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 200ms ease", boxShadow: open ? "0 0 0 3px var(--green-dim)" : "none" }}>
        <span>{selected}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
      </button>
      {open && (
        <div style={{ position: "absolute", top: 50, left: 0, right: 0, zIndex: 40, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, padding: 14, boxShadow: "var(--shadow-lg)", animation: "fadeIn 150ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <button onClick={prevMonth} style={{ width: 26, height: 26, borderRadius: 6, background: "transparent", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)", transition: "all 150ms ease" }}
              onMouseEnter={function (e) { e.currentTarget.style.background = "var(--surface)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{months[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} style={{ width: 26, height: 26, borderRadius: 6, background: "transparent", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)", transition: "all 150ms ease" }}
              onMouseEnter={function (e) { e.currentTarget.style.background = "var(--surface)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, marginBottom: 1 }}>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(function (d) {
              return <span key={d} style={{ fontSize: 9, fontWeight: 700, color: "var(--muted)", textAlign: "center", padding: "3px 0" }}>{d}</span>;
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
            {days.map(function (day, idx) {
              if (day === null) return <div key={"e" + idx} style={{ height: 28 }} />;
              var m = String(viewMonth + 1).padStart(2, "0");
              var dd = String(day).padStart(2, "0");
              var dateStr = viewYear + "-" + m + "-" + dd;
              var isSel = dateStr === selected;
              var isToday = dateStr === today;
              return (
                <button key={day} onClick={function () { selectDay(day); }}
                  style={{ height: 28, borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: isSel ? 700 : 500, color: isSel ? "#fff" : "var(--text)", background: isSel ? "var(--green)" : isToday ? "var(--green-dim)" : "transparent", transition: "all 120ms ease", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={function (e) { if (!isSel) { e.currentTarget.style.background = "var(--surface)"; } }}
                  onMouseLeave={function (e) { if (!isSel) { e.currentTarget.style.background = isToday ? "var(--green-dim)" : "transparent"; } }}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Dropdown(props: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string; letters?: string; color?: string }[];
  width?: number;
}) {
  var [open, setOpen] = useState(false);
  var ref = useRef<HTMLDivElement>(null);
  var selected = props.options.find(function (o) { return o.value === props.value; });

  useEffect(function () {
    if (!open) return;
    var handler = function (e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); }
    };
    document.addEventListener("mousedown", handler);
    return function () { document.removeEventListener("mousedown", handler); };
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", width: props.width || 150 }}>
      <button onClick={function () { setOpen(function (p) { return !p; }); }}
        style={{ width: "100%", height: 40, padding: "0 14px", borderRadius: 10, background: open ? "var(--surface)" : "var(--bg)", border: "1px solid " + (open ? "var(--green-border)" : "var(--border)"), color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 200ms cubic-bezier(0.16, 1, 0.3, 1)", boxShadow: open ? "0 0 0 3px var(--green-dim)" : "none", transform: open ? "scale(1.02)" : "scale(1)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {selected && selected.letters && <span style={{ width: 18, height: 18, borderRadius: 4, background: selected.color ? selected.color + "15" : "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: selected.color || "var(--text)" }}>{selected.letters}</span>}
          <span>{selected ? selected.label : props.value}</span>
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 200ms cubic-bezier(0.16, 1, 0.3, 1)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && (
        <div style={{ position: "absolute", top: 48, left: 0, right: 0, zIndex: 30, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 4, boxShadow: "var(--shadow-lg)", animation: "fadeIn 150ms cubic-bezier(0.16, 1, 0.3, 1)", maxHeight: 240, overflowY: "auto" }}>
          {props.options.map(function (opt) {
            var isActive = opt.value === props.value;
            return (
              <button key={opt.value} onClick={function () { props.onChange(opt.value); setOpen(false); }} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: isActive ? "var(--green-dim)" : "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8, transition: "all 120ms ease", color: isActive ? "var(--green)" : "var(--text)" }}
                onMouseEnter={function (e) { if (!isActive) { e.currentTarget.style.background = "var(--surface)"; } }}
                onMouseLeave={function (e) { if (!isActive) { e.currentTarget.style.background = "transparent"; } }}>
                {opt.letters && <span style={{ width: 20, height: 20, borderRadius: 5, background: opt.color ? opt.color + "15" : "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: opt.color || "var(--muted)" }}>{opt.letters}</span>}
                <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 500 }}>{opt.label}</span>
                {isActive && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "auto" }}><polyline points="20 6 9 17 4 12" /></svg>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  var [transactions, setTransactions] = useState<Transaction[]>([]);
  var [showAdd, setShowAdd] = useState(false);
  var [showSms, setShowSms] = useState(false);
  var [showCsv, setShowCsv] = useState(false);
  var [editId, setEditId] = useState<string | null>(null);
  var [search, setSearch] = useState("");
  var [filterCat, setFilterCat] = useState("All");
  var [filterType, setFilterType] = useState("all");
  var [addForm, setAddForm] = useState({ amount: "", merchant: "", category: "Food", type: "expense" as "income" | "expense", date: new Date().toISOString().split("T")[0], note: "" });
  var [smsText, setSmsText] = useState("");
  var [csvText, setCsvText] = useState("");
  var [smsError, setSmsError] = useState("");

  useEffect(function () {
    var saved = localStorage.getItem("casha-transactions");
    if (saved) { try { setTransactions(JSON.parse(saved)); } catch (e) {} }
  }, []);

  useEffect(function () {
    localStorage.setItem("casha-transactions", JSON.stringify(transactions));
  }, [transactions]);

  var resetForm = function () {
    setAddForm({ amount: "", merchant: "", category: "Food", type: "expense", date: new Date().toISOString().split("T")[0], note: "" });
    setEditId(null);
  };

  var openAdd = function () { resetForm(); setShowAdd(true); };

  var openEdit = function (t: Transaction) {
    setEditId(t.id);
    setAddForm({ amount: String(Math.abs(t.amount)), merchant: t.merchant, category: t.category, type: t.type, date: t.date, note: t.note });
    setShowAdd(true);
  };

  var saveForm = function () {
    var amt = parseFloat(addForm.amount);
    if (!amt || !addForm.merchant.trim()) return;
    if (editId) {
      setTransactions(function (prev) {
        return prev.map(function (t) {
          if (t.id !== editId) return t;
          return { ...t, amount: addForm.type === "expense" ? -amt : amt, type: addForm.type, merchant: addForm.merchant.trim(), category: addForm.category, date: addForm.date, note: addForm.note };
        });
      });
    } else {
      var t: Transaction = { id: generateId(), amount: addForm.type === "expense" ? -amt : amt, type: addForm.type, merchant: addForm.merchant.trim(), category: addForm.category, date: addForm.date, note: addForm.note, source: "manual" };
      setTransactions(function (prev) { return [t, ...prev]; });
    }
    resetForm();
    setShowAdd(false);
  };

  var addSms = function () {
    var parsed = smartParse(smsText);
    if (!parsed) { setSmsError("Could not detect an amount. Try pasting: Rs.2,500 debited from A/c XX1234. Info: Swiggy"); return; }
    setSmsError("");
    var t: Transaction = { id: generateId(), amount: parsed.isIncome ? parsed.amount : -parsed.amount, type: parsed.isIncome ? "income" : "expense", merchant: parsed.merchant, category: parsed.category, date: parsed.date, note: "", source: "sms" };
    setTransactions(function (prev) { return [t, ...prev]; });
    setSmsText("");
    setShowSms(false);
  };

  var addCsv = function () {
    var lines = csvText.trim().split("\n");
    var newT: Transaction[] = [];
    lines.forEach(function (line) {
      var parts = line.split(",");
      if (parts.length >= 2) {
        var amtStr = parts.length >= 3 ? parts[2].trim() : parts[1].trim();
        var amt = parseFloat(amtStr.replace(/[^0-9.\-]/g, ""));
        if (!isNaN(amt) && amt !== 0) {
          var merchant = parts.length >= 3 ? parts[1].trim().substring(0, 24) : parts[0].trim().substring(0, 24);
          var dateStr = parts.length >= 3 ? parts[0].trim() : new Date().toISOString().split("T")[0];
          var fullText = merchant + " " + amtStr;
          var det = detectCategory(fullText);
          var isIncome = amt > 0 || det.isIncome;
          newT.push({ id: generateId(), amount: amt, type: isIncome ? "income" : "expense", merchant: merchant, category: det.category, date: dateStr, note: "", source: "csv" });
        }
      }
    });
    if (newT.length > 0) { setTransactions(function (prev) { return [...newT, ...prev]; }); setCsvText(""); setShowCsv(false); }
  };

  var deleteTx = function (id: string) { setTransactions(function (prev) { return prev.filter(function (t) { return t.id !== id; }); }); };

  var filtered = transactions.filter(function (t) {
    if (search && !t.merchant.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat !== "All" && t.category !== filterCat) return false;
    if (filterType === "income" && t.type !== "income") return false;
    if (filterType === "expense" && t.type !== "expense") return false;
    return true;
  });

  var totalIncome = filtered.filter(function (t) { return t.type === "income"; }).reduce(function (s, t) { return s + t.amount; }, 0);
  var totalExpense = filtered.filter(function (t) { return t.type === "expense"; }).reduce(function (s, t) { return s + Math.abs(t.amount); }, 0);

  var typeOptions = [
    { value: "all", label: "All types", letters: "AT", color: "#6B7280" },
    { value: "income", label: "Income", letters: "IN", color: "#22C55E" },
    { value: "expense", label: "Expense", letters: "EX", color: "#EF4444" },
  ];

  var allCatNames = Array.from(new Set(transactions.map(function (t) { return t.category; })));
  var catOptions = [{ value: "All", label: "All categories", letters: "AC", color: "#6B7280" }].concat(
    allCatNames.map(function (name) { var c = getCat(name); return { value: name, label: name, letters: c.letters, color: c.color }; })
  );

  var currentCats = getCatsForType(addForm.type);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 0" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: -0.5, margin: "0 0 4px 0" }}>Transactions</h1>
          <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>Track your money</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={function () { setShowSms(true); setSmsError(""); }} style={{ height: 40, padding: "0 16px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, transition: "all 200ms cubic-bezier(0.16, 1, 0.3, 1)" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "var(--card)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
            SMS
          </button>
          <button onClick={function () { setShowCsv(true); }} style={{ height: 40, padding: "0 16px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, transition: "all 200ms cubic-bezier(0.16, 1, 0.3, 1)" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "var(--card)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
            CSV
          </button>
          <button onClick={openAdd} style={{ height: 40, padding: "0 18px", borderRadius: 10, background: "var(--green)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, transition: "all 200ms cubic-bezier(0.16, 1, 0.3, 1)", boxShadow: "0 2px 8px rgba(26, 143, 78, 0.2)" }}
            onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green-soft)"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(26, 143, 78, 0.3)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.background = "var(--green)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(26, 143, 78, 0.2)"; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div style={{ background: "var(--surface)", borderRadius: 12, padding: "16px 18px", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 4px 0" }}>Income</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: "var(--green)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(totalIncome)}</p>
        </div>
        <div style={{ background: "var(--surface)", borderRadius: 12, padding: "16px 18px", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 4px 0" }}>Expense</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(totalExpense)}</p>
        </div>
        <div style={{ background: "var(--surface)", borderRadius: 12, padding: "16px 18px", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 4px 0" }}>Net</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: totalIncome - totalExpense >= 0 ? "var(--green)" : "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(totalIncome - totalExpense)}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 12, top: 13 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Search transactions..." value={search} onChange={function (e) { setSearch(e.target.value); }}
            style={{ width: "100%", height: 40, padding: "0 12px 0 36px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "inherit", transition: "all 200ms ease" }}
            onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; }}
            onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
        </div>
        <Dropdown value={filterType} onChange={setFilterType} options={typeOptions} width={140} />
        <Dropdown value={filterCat} onChange={setFilterCat} options={catOptions} width={160} />
      </div>

      {/* Transaction List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--green-dim)", border: "1px solid var(--green-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--text)", margin: "0 0 6px 0" }}>Where did your money go?</h3>
          <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 20px 0" }}>Log your first transaction to find out.</p>
          <button onClick={openAdd} style={{ padding: "10px 24px", borderRadius: 10, background: "var(--green)", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 200ms ease", boxShadow: "0 2px 8px rgba(26, 143, 78, 0.2)" }}
            onMouseEnter={function (e) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(26, 143, 78, 0.3)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(26, 143, 78, 0.2)"; }}>Add Transaction</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filtered.map(function (t, idx) {
            var cat = getCat(t.category);
            return (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--border)", transition: "all 200ms cubic-bezier(0.16, 1, 0.3, 1)", cursor: "default", animation: "fadeIn 300ms ease " + (idx * 30) + "ms both" }}
                onMouseEnter={function (e) { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.transform = "translateX(4px)"; }}
                onMouseLeave={function (e) { e.currentTarget.style.background = "var(--bg)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateX(0)"; }}>
                <CategoryIcon name={t.category} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.merchant}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: cat.color, background: cat.bg, padding: "2px 7px", borderRadius: 5 }}>{t.category}</span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{t.date}</span>
                    {t.source !== "manual" && <span style={{ fontSize: 9, fontWeight: 700, color: "var(--muted)", background: "var(--surface)", padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" }}>{t.source}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {t.type === "income" ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>
                    )}
                    <span style={{ fontSize: 15, fontWeight: 700, color: t.type === "income" ? "var(--green)" : "var(--red)", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(Math.abs(t.amount))}</span>
                  </div>
                  <button onClick={function () { openEdit(t); }} style={{ width: 30, height: 30, borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--faint)", transition: "all 150ms ease" }}
                    onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green-dim)"; e.currentTarget.style.color = "var(--green)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                    onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--faint)"; e.currentTarget.style.transform = "scale(1)"; }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                  <button onClick={function () { deleteTx(t.id); }} style={{ width: 30, height: 30, borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--faint)", transition: "all 150ms ease" }}
                    onMouseEnter={function (e) { e.currentTarget.style.background = "var(--red-dim)"; e.currentTarget.style.color = "var(--red)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                    onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--faint)"; e.currentTarget.style.transform = "scale(1)"; }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }} onClick={function () { resetForm(); setShowAdd(false); }}>
          <div style={{ background: "var(--bg)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 420, boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16, 1, 0.3, 1)" }} onClick={function (e) { e.stopPropagation(); }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: "0 0 18px 0" }}>{editId ? "Edit Transaction" : "Add Transaction"}</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, marginBottom: 14, background: "var(--surface)", borderRadius: 10, padding: 3, border: "1px solid var(--border)" }}>
              {(["expense", "income"] as const).map(function (tp) {
                var isActive = addForm.type === tp;
                return (
                  <button key={tp} onClick={function () {
                    var newCats = getCatsForType(tp);
                    var valid = newCats.some(function (c) { return c.name === addForm.category; });
                    setAddForm(function (f) { return { ...f, type: tp, category: valid ? f.category : newCats[0].name }; });
                  }} style={{ padding: "9px 0", borderRadius: 8, border: "none", background: isActive ? "var(--bg)" : "transparent", color: isActive ? "var(--text)" : "var(--muted)", fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all 200ms ease", boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>
                    {tp === "income" ? "Income" : "Expense"}
                  </button>
                );
              })}
            </div>

            <input type="text" placeholder="Amount" value={addForm.amount} onChange={function (e) { setAddForm(function (f) { return { ...f, amount: e.target.value }; }); }}
              style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 16, fontWeight: 600, outline: "none", fontFamily: "inherit", marginBottom: 8, fontVariantNumeric: "tabular-nums", transition: "all 200ms ease" }}
              onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; }}
              onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />

            <input type="text" placeholder="Merchant / Description" value={addForm.merchant} onChange={function (e) { setAddForm(function (f) { return { ...f, merchant: e.target.value }; }); }}
              style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "inherit", marginBottom: 12, transition: "all 200ms ease" }}
              onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; }}
              onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />

            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.06 }}>Category</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
              {currentCats.map(function (c) {
                var isActive = addForm.category === c.name;
                return (
                  <button key={c.name} onClick={function () { setAddForm(function (f) { return { ...f, category: c.name }; }); }}
                    style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid " + (isActive ? c.color + "40" : "var(--border)"), background: isActive ? c.bg : "transparent", cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease", display: "flex", alignItems: "center", gap: 4, transform: isActive ? "scale(1.04)" : "scale(1)" }}>
                    <span style={{ width: 16, height: 16, borderRadius: 4, background: isActive ? c.color + "20" : "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 800, color: c.color }}>{c.letters}</span>
                    <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? c.color : "var(--muted)" }}>{c.name}</span>
                  </button>
                );
              })}
            </div>

            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.06 }}>Date</p>
            <div style={{ marginBottom: 10 }}>
              <CalendarDropdown value={addForm.date} onChange={function (val) { setAddForm(function (f) { return { ...f, date: val }; }); }} />
            </div>

            <input type="text" placeholder="Note (optional)" value={addForm.note} onChange={function (e) { setAddForm(function (f) { return { ...f, note: e.target.value }; }); }}
              style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "inherit", marginBottom: 18, transition: "all 200ms ease" }}
              onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; }}
              onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function () { resetForm(); setShowAdd(false); }} style={{ flex: 1, height: 44, borderRadius: 10, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }}
                onMouseEnter={function (e) { e.currentTarget.style.background = "var(--surface)"; }}
                onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}>Cancel</button>
              <button onClick={saveForm} style={{ flex: 1, height: 44, borderRadius: 10, background: "var(--green)", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 200ms ease", boxShadow: "0 2px 8px rgba(26, 143, 78, 0.2)" }}
                onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green-soft)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={function (e) { e.currentTarget.style.background = "var(--green)"; e.currentTarget.style.transform = "translateY(0)"; }}>{editId ? "Save" : "Add"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SMS MODAL ── */}
      {showSms && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }} onClick={function () { setShowSms(false); }}>
          <div style={{ background: "var(--bg)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 480, boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16, 1, 0.3, 1)" }} onClick={function (e) { e.stopPropagation(); }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: "0 0 6px 0" }}>Paste Bank SMS</h2>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 16px 0" }}>Works with any bank, any country. Just paste any message with an amount.</p>
            <textarea value={smsText} onChange={function (e) { setSmsText(e.target.value); setSmsError(""); }} placeholder={"Rs.2,500 debited from A/c XX1234. Info: Swiggy\n\n$45.00 spent at Starbucks\n\nINR 50000 credited - Salary"}
              style={{ width: "100%", height: 120, borderRadius: 12, padding: "14px", fontSize: 13, fontFamily: "inherit", background: "var(--surface)", border: "1px solid " + (smsError ? "var(--red-border)" : "var(--border)"), color: "var(--text)", outline: "none", resize: "none", lineHeight: 1.6, marginBottom: smsError ? 10 : 12, transition: "all 200ms ease" }}
              onFocus={function (e) { if (!smsError) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; } }}
              onBlur={function (e) { e.currentTarget.style.borderColor = smsError ? "var(--red-border)" : "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
            {smsError && (
              <div style={{ background: "var(--red-dim)", border: "1px solid var(--red-border)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, animation: "fadeIn 200ms ease" }}>
                <p style={{ fontSize: 12, color: "var(--red)", margin: 0, lineHeight: 1.5 }}>{smsError}</p>
              </div>
            )}
            {smsText.trim() && smartParse(smsText) && !smsError && (
              <div style={{ background: "var(--green-dim)", border: "1px solid var(--green-border)", borderRadius: 12, padding: "14px 16px", marginBottom: 16, animation: "fadeIn 200ms ease" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--green)", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: 0.06 }}>Detected</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {[
                    { label: "Amount", value: formatCurrency(smartParse(smsText)!.amount), color: "var(--text)" },
                    { label: "Merchant", value: smartParse(smsText)!.merchant, color: "var(--text)" },
                    { label: "Category", value: smartParse(smsText)!.category, color: "var(--green)" },
                    { label: "Date", value: smartParse(smsText)!.date, color: "var(--text-secondary)" },
                    { label: "Type", value: smartParse(smsText)!.isIncome ? "Income" : "Expense", color: smartParse(smsText)!.isIncome ? "var(--green)" : "var(--red)" },
                  ].map(function (r) {
                    return (<div key={r.label} style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 11, color: "var(--muted)" }}>{r.label}</span><span style={{ fontSize: 12, fontWeight: 600, color: r.color, fontVariantNumeric: "tabular-nums" }}>{r.value}</span></div>);
                  })}
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function () { setShowSms(false); }} style={{ flex: 1, height: 44, borderRadius: 10, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }}
                onMouseEnter={function (e) { e.currentTarget.style.background = "var(--surface)"; }}
                onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}>Cancel</button>
              <button onClick={addSms} style={{ flex: 1, height: 44, borderRadius: 10, background: "var(--green)", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 200ms ease", boxShadow: "0 2px 8px rgba(26, 143, 78, 0.2)" }}
                onMouseEnter={function (e) { e.currentTarget.style.background = "var(--green-soft)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={function (e) { e.currentTarget.style.background = "var(--green)"; e.currentTarget.style.transform = "translateY(0)"; }}>Add Transaction</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CSV MODAL ── */}
      {showCsv && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }} onClick={function () { setShowCsv(false); }}>
          <div style={{ background: "var(--bg)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 480, boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16, 1, 0.3, 1)" }} onClick={function (e) { e.stopPropagation(); }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: "0 0 6px 0" }}>Import CSV</h2>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 16px 0" }}>Format: date, merchant, amount (one per line). Categories auto-detected.</p>
            <textarea value={csvText} onChange={function (e) { setCsvText(e.target.value); }} placeholder={"2026-01-15, Swiggy, -250\n2026-01-14, Salary, 5000\n2026-01-13, Netflix, -15.99\n2026-01-12, Uber, -120"}
              style={{ width: "100%", height: 140, borderRadius: 12, padding: "14px", fontSize: 13, fontFamily: "monospace", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", outline: "none", resize: "none", lineHeight: 1.6, marginBottom: 16, transition: "all 200ms ease" }}
              onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; }}
              onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function () { setShowCsv(false); }} style={{ flex: 1, height: 44, borderRadius: 10, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }}
                onMouseEnter={function (e) { e.currentTarget.style.background = "var(--surface)"; }}
                onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}>Cancel</button>
              <button onClick={addCsv} disabled={!csvText.trim()} style={{ flex: 1, height: 44, borderRadius: 10, background: csvText.trim() ? "var(--green)" : "var(--card)", border: "none", color: csvText.trim() ? "#fff" : "var(--faint)", fontSize: 14, fontWeight: 600, cursor: csvText.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 200ms ease", boxShadow: csvText.trim() ? "0 2px 8px rgba(26, 143, 78, 0.2)" : "none" }}
                onMouseEnter={function (e) { if (csvText.trim()) { e.currentTarget.style.transform = "translateY(-1px)"; } }}
                onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; }}>Import</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}