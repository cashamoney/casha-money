"use client";

import { useState, useEffect, useRef } from "react";

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

type Card = {
  id: string;
  last4: string;
  masked: string;
  expiry: string;
  holderName: string;
  cardType: "visa" | "mastercard" | "rupay" | "amex" | "other";
  bank: string;
};

type Profile = {
  name: string;
  email: string;
};

type ParsedEntry = {
  date: string;
  merchant: string;
  amount: number;
  isIncome: boolean;
  category: string;
  selected: boolean;
};

function detectCardType(n: string): "visa" | "mastercard" | "rupay" | "amex" | "other" {
  var c = n.replace(/\D/g, "");
  if (c.startsWith("4")) return "visa";
  if (c.startsWith("5") || c.startsWith("2")) return "mastercard";
  if (c.startsWith("6")) return "rupay";
  if (c.startsWith("3")) return "amex";
  return "other";
}

function detectBank(n: string): string {
  var c = n.replace(/\D/g, "");
  if (c.length < 4) return "Unknown";
  var b4 = c.substring(0, 4);
  var b6 = c.substring(0, 6);
  var map: Record<string, string> = {
    "4213": "SBI", "4216": "SBI", "4217": "SBI", "4317": "SBI", "6037": "SBI", "6070": "SBI",
    "4026": "HDFC", "4374": "HDFC", "4390": "HDFC", "4917": "HDFC", "5241": "HDFC", "5293": "HDFC",
    "4477": "ICICI", "4679": "ICICI", "4913": "ICICI", "5193": "ICICI", "5234": "ICICI", "5400": "ICICI",
    "4371": "Axis", "4379": "Axis", "4902": "Axis", "5211": "Axis", "5240": "Axis",
    "4329": "Kotak", "4567": "Kotak", "5262": "Kotak", "5342": "Kotak",
    "4386": "PNB", "4532": "PNB", "5312": "PNB",
    "4236": "Bank of Baroda", "4345": "Bank of Baroda",
    "4210": "Union Bank", "4905": "Union Bank",
    "4381": "Canara Bank", "5303": "Canara Bank",
    "4909": "IndusInd", "4311": "IndusInd",
    "4242": "Yes Bank", "5267": "Yes Bank",
    "4292": "HSBC", "4293": "HSBC",
    "4120": "Citibank", "4550": "Citibank",
    "4333": "Standard Chartered", "4334": "Standard Chartered",
    "4222": "RBL Bank", "5314": "RBL Bank",
    "4150": "Federal Bank", "5253": "Federal Bank",
    "4001": "AU Small Finance", "4298": "AU Small Finance",
  };
  if (map[b6]) return map[b6];
  if (map[b4]) return map[b4];
  var t = detectCardType(n);
  if (t === "visa") return "Visa Card";
  if (t === "mastercard") return "Mastercard";
  if (t === "rupay") return "RuPay Card";
  if (t === "amex") return "Amex";
  return "Bank Card";
}

function getCardGradient(t: string): [string, string] {
  switch (t) {
    case "visa": return ["#1A1F71", "#2D5BFF"];
    case "mastercard": return ["#1A1A2E", "#EB001B"];
    case "rupay": return ["#0A3D2E", "#00A86B"];
    case "amex": return ["#2E1A47", "#7B2D8E"];
    default: return ["#1A1A2E", "#4A4A6A"];
  }
}

function getCardLabel(t: string): string {
  switch (t) {
    case "visa": return "VISA";
    case "mastercard": return "MASTERCARD";
    case "rupay": return "RuPay";
    case "amex": return "AMEX";
    default: return "CARD";
  }
}

function maskCardNumber(n: string): string {
  var c = n.replace(/\D/g, "");
  if (c.length < 8) return c;
  return c.substring(0, 4) + " \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 " + c.substring(c.length - 4);
}

function formatCardInput(n: string): string {
  var c = n.replace(/\D/g, "").substring(0, 16);
  var parts: string[] = [];
  for (var i = 0; i < c.length; i += 4) parts.push(c.substring(i, i + 4));
  return parts.join(" ");
}

function formatExpiry(v: string): string {
  var c = v.replace(/\D/g, "").substring(0, 4);
  if (c.length >= 2) return c.substring(0, 2) + "/" + c.substring(2);
  return c;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function formatCurrency(n: number) {
  var abs = Math.abs(n);
  var str = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (n < 0 ? "-" : "") + "$" + str;
}

function getCategoryIcon(name: string): { letters: string; color: string; bg: string } {
  var cats: Record<string, { letters: string; color: string; bg: string }> = {
    "Food": { letters: "FD", color: "#F97316", bg: "#FFF7ED" },
    "Transport": { letters: "TR", color: "#3B82F6", bg: "#EFF6FF" },
    "Shopping": { letters: "SH", color: "#A855F7", bg: "#FAF5FF" },
    "Entertainment": { letters: "EN", color: "#EC4899", bg: "#FDF2F8" },
    "Bills": { letters: "BL", color: "#EAB308", bg: "#FEFCE8" },
    "Rent": { letters: "RN", color: "#EF4444", bg: "#FEF2F2" },
    "Health": { letters: "HT", color: "#14B8A6", bg: "#F0FDFA" },
    "Education": { letters: "ED", color: "#6366F1", bg: "#EEF2FF" },
    "Investment": { letters: "IV", color: "#06B6D4", bg: "#ECFEFF" },
    "Salary": { letters: "SA", color: "#22C55E", bg: "#F0FDF4" },
    "Freelance": { letters: "FR", color: "#10B981", bg: "#ECFDF5" },
    "Returns": { letters: "RT", color: "#06B6D4", bg: "#ECFEFF" },
    "Dividend": { letters: "DV", color: "#0EA5E9", bg: "#F0F9FF" },
    "Cashback": { letters: "CB", color: "#F59E0B", bg: "#FFFBEB" },
    "Refund": { letters: "RF", color: "#6366F1", bg: "#EEF2FF" },
    "Bonus": { letters: "BN", color: "#F97316", bg: "#FFF7ED" },
  };
  return cats[name] || { letters: "OT", color: "#6B7280", bg: "#F9FAFB" };
}

function parseStatement(text: string): ParsedEntry[] {
  var lines = text.trim().split("\n");
  var results: ParsedEntry[] = [];
  lines.forEach(function (line) {
    if (!line.trim()) return;
    var l = line.trim();
    var amountMatch = l.match(/Rs\.?\s*([\d,]+\.?\d*)/i) || l.match(/INR\s*([\d,]+\.?\d*)/i) || l.match(/\$\s*([\d,]+\.?\d*)/i) || l.match(/([\d,]+\.\d{2})/) || l.match(/([\d,]+)\s*(?:DR|CR|Debit|Credit|debited|credited)/i) || l.match(/([\d,]+)/);
    if (!amountMatch) return;
    var amount = parseFloat(amountMatch[1].replace(/,/g, ""));
    if (isNaN(amount) || amount === 0) return;
    var isIncome = /CR|Credit|credited|received|deposited|refund|salary|income/i.test(l);
    if (amountMatch[1].startsWith("-")) { isIncome = false; amount = Math.abs(amount); }
    var dateMatch = l.match(/(\d{4}-\d{2}-\d{2})/) || l.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/) || l.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*(?:\s+\d{2,4})?)/i);
    var date = dateMatch ? dateMatch[1] : new Date().toISOString().split("T")[0];
    if (date.match(/^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/)) {
      var p = date.split(/[-\/]/);
      if (p[2].length === 2) p[2] = "20" + p[2];
      date = p[2] + "-" + p[1].padStart(2, "0") + "-" + p[0].padStart(2, "0");
    }
    var merchant = l.replace(dateMatch ? dateMatch[0] : "", "").replace(amountMatch[0], "").replace(/Rs\.?|INR|\$|DR|CR|Debit|Credit|debited|credited|spent|paid|received|deposited/gi, "").replace(/[\d\-\/]+/g, "").replace(/[^\w\s]/g, "").trim().substring(0, 24) || "Transaction";
    var ml = merchant.toLowerCase() + " " + amountMatch[1];
    var cat = "Other";
    if (ml.includes("swiggy") || ml.includes("zomato") || ml.includes("food") || ml.includes("grocery") || ml.includes("restaurant") || ml.includes("coffee") || ml.includes("starbucks") || ml.includes("domino") || ml.includes("pizza") || ml.includes("burger") || ml.includes("bakery") || ml.includes("cafe") || ml.includes("doordash") || ml.includes("blinkit") || ml.includes("bigbasket")) cat = "Food";
    else if (ml.includes("uber") || ml.includes("ola") || ml.includes("lyft") || ml.includes("fuel") || ml.includes("petrol") || ml.includes("metro") || ml.includes("cab") || ml.includes("taxi") || ml.includes("flight") || ml.includes("airline") || ml.includes("rapido")) cat = "Transport";
    else if (ml.includes("amazon") || ml.includes("flipkart") || ml.includes("myntra") || ml.includes("walmart") || ml.includes("target") || ml.includes("shop") || ml.includes("store") || ml.includes("ebay") || ml.includes("nykaa") || ml.includes("ajio") || ml.includes("meesho")) cat = "Shopping";
    else if (ml.includes("netflix") || ml.includes("spotify") || ml.includes("hotstar") || ml.includes("hulu") || ml.includes("movie") || ml.includes("gaming") || ml.includes("steam") || ml.includes("disney") || ml.includes("youtube") || ml.includes("twitch")) cat = "Entertainment";
    else if (ml.includes("electricity") || ml.includes("bill") || ml.includes("water") || ml.includes("internet") || ml.includes("phone") || ml.includes("recharge") || ml.includes("jio") || ml.includes("airtel") || ml.includes("broadband")) cat = "Bills";
    else if (ml.includes("rent") || ml.includes("housing") || ml.includes("lease")) cat = "Rent";
    else if (ml.includes("hospital") || ml.includes("doctor") || ml.includes("medicine") || ml.includes("pharmacy") || ml.includes("health") || ml.includes("gym") || ml.includes("fitness") || ml.includes("clinic")) cat = "Health";
    else if (ml.includes("course") || ml.includes("school") || ml.includes("college") || ml.includes("udemy") || ml.includes("coursera") || ml.includes("book") || ml.includes("university")) cat = "Education";
    else if (ml.includes("stock") || ml.includes("invest") || ml.includes("mutual") || ml.includes("sip") || ml.includes("zerodha") || ml.includes("groww") || ml.includes("crypto")) cat = "Investment";
    else if (ml.includes("salary") || ml.includes("freelance") || ml.includes("dividend") || ml.includes("interest") || ml.includes("cashback") || ml.includes("refund") || ml.includes("bonus") || ml.includes("gift")) cat = isIncome ? "Salary" : "Other";
    results.push({ date: date, merchant: merchant, amount: amount, isIncome: isIncome, category: cat, selected: true });
  });
  return results;
}

function getMonthlyData(transactions: Transaction[]): { month: string; expense: number; income: number }[] {
  var now = new Date();
  var names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var data: { month: string; expense: number; income: number }[] = [];
  for (var i = 5; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    var ms = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    var exp = transactions.filter(function (t) { return t.type === "expense" && t.date.startsWith(ms); }).reduce(function (s, t) { return s + Math.abs(t.amount); }, 0);
    var inc = transactions.filter(function (t) { return t.type === "income" && t.date.startsWith(ms); }).reduce(function (s, t) { return s + t.amount; }, 0);
    data.push({ month: names[d.getMonth()], expense: exp, income: inc });
  }
  return data;
}

export default function AccountPage() {
  var [transactions, setTransactions] = useState<Transaction[]>([]);
  var [cards, setCards] = useState<Card[]>([]);
  var [profile, setProfile] = useState<Profile>({ name: "John Doe", email: "john@example.com" });
  var [showAddCard, setShowAddCard] = useState(false);
  var [cardForm, setCardForm] = useState({ number: "", expiry: "", holderName: "" });
  var [statementText, setStatementText] = useState("");
  var [parsedEntries, setParsedEntries] = useState<ParsedEntry[]>([]);
  var [editingName, setEditingName] = useState(false);
  var [editingEmail, setEditingEmail] = useState(false);
  var [nameInput, setNameInput] = useState("");
  var [emailInput, setEmailInput] = useState("");
  var [showClearConfirm, setShowClearConfirm] = useState(false);
  var [toast, setToast] = useState("");
  var nameRef = useRef<HTMLInputElement>(null);
  var emailRef = useRef<HTMLInputElement>(null);

  useEffect(function () {
    var s = localStorage.getItem("casha-transactions");
    if (s) { try { setTransactions(JSON.parse(s)); } catch (e) {} }
    var c = localStorage.getItem("casha-cards");
    if (c) { try { setCards(JSON.parse(c)); } catch (e) {} }
    var p = localStorage.getItem("casha-profile");
    if (p) { try { setProfile(JSON.parse(p)); } catch (e) {} }
  }, []);

  useEffect(function () { localStorage.setItem("casha-transactions", JSON.stringify(transactions)); }, [transactions]);
  useEffect(function () { localStorage.setItem("casha-cards", JSON.stringify(cards)); }, [cards]);
  useEffect(function () { localStorage.setItem("casha-profile", JSON.stringify(profile)); }, [profile]);

  useEffect(function () {
    if (editingName && nameRef.current) nameRef.current.focus();
  }, [editingName]);
  useEffect(function () {
    if (editingEmail && emailRef.current) emailRef.current.focus();
  }, [editingEmail]);

  var showToast = function (msg: string) {
    setToast(msg);
    setTimeout(function () { setToast(""); }, 2500);
  };

  var addCard = function () {
    var c = cardForm.number.replace(/\D/g, "");
    if (c.length < 13 || !cardForm.expiry || !cardForm.holderName.trim()) return;
    var ct = detectCardType(c);
    var newCard: Card = {
      id: generateId(),
      last4: c.substring(c.length - 4),
      masked: maskCardNumber(c),
      expiry: cardForm.expiry,
      holderName: cardForm.holderName.trim(),
      cardType: ct,
      bank: detectBank(c),
    };
    setCards(function (prev) { return [...prev, newCard]; });
    setCardForm({ number: "", expiry: "", holderName: "" });
    setShowAddCard(false);
    showToast("Card added successfully");
  };

  var removeCard = function (id: string) {
    setCards(function (prev) { return prev.filter(function (c) { return c.id !== id; }); });
    showToast("Card removed");
  };

  var handleParse = function () {
    if (!statementText.trim()) return;
    var entries = parseStatement(statementText);
    setParsedEntries(entries);
  };

  var toggleEntry = function (idx: number) {
    setParsedEntries(function (prev) {
      return prev.map(function (e, i) { return i === idx ? { ...e, selected: !e.selected } : e; });
    });
  };

  var addParsedToTransactions = function () {
    var selected = parsedEntries.filter(function (e) { return e.selected; });
    var newT = selected.map(function (e) {
      return {
        id: generateId(),
        amount: e.isIncome ? e.amount : -e.amount,
        type: e.isIncome ? "income" as const : "expense" as const,
        merchant: e.merchant,
        category: e.category,
        date: e.date,
        note: "",
        source: "csv" as const,
      };
    });
    setTransactions(function (prev) { return [...newT, ...prev]; });
    setParsedEntries([]);
    setStatementText("");
    showToast(newT.length + " transactions added");
  };

  var saveName = function () {
    if (nameInput.trim()) setProfile(function (p) { return { ...p, name: nameInput.trim() }; });
    setEditingName(false);
  };
  var saveEmail = function () {
    if (emailInput.trim()) setProfile(function (p) { return { ...p, email: emailInput.trim() }; });
    setEditingEmail(false);
  };

  var exportData = function () {
    var data = { profile: profile, cards: cards, transactions: transactions, exportedAt: new Date().toISOString() };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "casha-export-" + new Date().toISOString().split("T")[0] + ".json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported");
  };

  var clearAll = function () {
    setTransactions([]);
    setCards([]);
    setShowClearConfirm(false);
    showToast("All data cleared");
  };

  var monthlyData = getMonthlyData(transactions);
  var maxMonth = Math.max.apply(null, monthlyData.map(function (m) { return Math.max(m.expense, m.income); }).concat([1]));
  var totalBalance = transactions.reduce(function (s, t) { return s + (t.type === "income" ? t.amount : -Math.abs(t.amount)); }, 0);
  var now = new Date();
  var thisMonthStr = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  var thisMonthExpense = transactions.filter(function (t) { return t.type === "expense" && t.date.startsWith(thisMonthStr); }).reduce(function (s, t) { return s + Math.abs(t.amount); }, 0);
  var avgPerTx = transactions.length > 0 ? transactions.reduce(function (s, t) { return s + Math.abs(t.amount); }, 0) / transactions.length : 0;
  var initials = profile.name.split(" ").map(function (w) { return w[0] || ""; }).join("").toUpperCase().substring(0, 2);

  var currentCardType = detectCardType(cardForm.number);
  var currentBank = detectBank(cardForm.number);
  var currentGradient = getCardGradient(currentCardType);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 0" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 100, background: "var(--green)", color: "#fff", padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: "inherit", boxShadow: "0 4px 20px rgba(26,143,78,0.3)", animation: "fadeIn 200ms ease" }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: -0.5, margin: "0 0 4px 0" }}>Account</h1>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>Your profile, cards & data</p>
      </div>

      {/* Profile Card */}
      <div style={{ background: "var(--surface)", borderRadius: 16, padding: 24, border: "1px solid var(--border)", marginBottom: 20, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, #1A8F4E, #2DD4BF)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(26,143,78,0.2)" }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>{initials}</span>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          {editingName ? (
            <input ref={nameRef} value={nameInput} onChange={function (e) { setNameInput(e.target.value); }} onBlur={saveName} onKeyDown={function (e) { if (e.key === "Enter") saveName(); }}
              style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", background: "transparent", border: "none", borderBottom: "2px solid var(--green)", outline: "none", fontFamily: "inherit", width: "100%", padding: "0 0 2px 0", marginBottom: 4 }} />
          ) : (
            <p onClick={function () { setNameInput(profile.name); setEditingName(true); }} style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "0 0 4px 0", cursor: "pointer", transition: "color 150ms ease" }}
              onMouseEnter={function (e) { e.currentTarget.style.color = "var(--green)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.color = "var(--text)"; }}>{profile.name} <span style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)", verticalAlign: "middle" }}>edit</span></p>
          )}
          {editingEmail ? (
            <input ref={emailRef} value={emailInput} onChange={function (e) { setEmailInput(e.target.value); }} onBlur={saveEmail} onKeyDown={function (e) { if (e.key === "Enter") saveEmail(); }}
              style={{ fontSize: 13, color: "var(--muted)", background: "transparent", border: "none", borderBottom: "2px solid var(--green)", outline: "none", fontFamily: "inherit", width: "100%", padding: "0 0 2px 0" }} />
          ) : (
            <p onClick={function () { setEmailInput(profile.email); setEditingEmail(true); }} style={{ fontSize: 13, color: "var(--muted)", margin: 0, cursor: "pointer", transition: "color 150ms ease" }}
              onMouseEnter={function (e) { e.currentTarget.style.color = "var(--green)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.color = "var(--muted)"; }}>{profile.email}</p>
          )}
          <p style={{ fontSize: 11, color: "var(--muted)", margin: "4px 0 0 0" }}>Member since Jan 2025</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 4px 0" }}>Balance</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: totalBalance >= 0 ? "var(--green)" : "var(--red)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(totalBalance)}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Transactions", value: String(transactions.length), color: "var(--text)" },
          { label: "This month", value: formatCurrency(thisMonthExpense), color: "var(--red)" },
          { label: "Avg / tx", value: formatCurrency(avgPerTx), color: "var(--text)" },
          { label: "Cards", value: String(cards.length), color: "var(--text)" },
        ].map(function (s) {
          return (
            <div key={s.label} style={{ background: "var(--surface)", borderRadius: 12, padding: "14px 16px", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: 9, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.06, margin: "0 0 4px 0" }}>{s.label}</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: s.color, margin: 0, fontVariantNumeric: "tabular-nums" }}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Monthly Chart */}
      <div style={{ background: "var(--surface)", borderRadius: 14, padding: "20px 22px 16px", border: "1px solid var(--border)", marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "0 0 16px 0" }}>Last 6 months</p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
          {monthlyData.map(function (m) {
            var expH = maxMonth > 0 ? (m.expense / maxMonth) * 100 : 0;
            var incH = maxMonth > 0 ? (m.income / maxMonth) * 100 : 0;
            return (
              <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ width: "100%", display: "flex", gap: 2, alignItems: "flex-end", height: 80 }}>
                  <div style={{ flex: 1, height: Math.max(expH, 4) + "%", background: "var(--red)", borderRadius: 3, transition: "height 400ms cubic-bezier(0.16,1,0.3,1)", opacity: 0.8 }} />
                  <div style={{ flex: 1, height: Math.max(incH, 4) + "%", background: "var(--green)", borderRadius: 3, transition: "height 400ms cubic-bezier(0.16,1,0.3,1)", opacity: 0.8 }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)" }}>{m.month}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 10, justifyContent: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--muted)" }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--red)" }} />Expense</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--muted)" }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--green)" }} />Income</span>
        </div>
      </div>

      {/* Bank Cards */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0 }}>Bank Cards</p>
          <button onClick={function () { setShowAddCard(true); setCardForm({ number: "", expiry: "", holderName: "" }); }} style={{ height: 34, padding: "0 14px", borderRadius: 8, background: "var(--green)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4, transition: "all 200ms ease", boxShadow: "0 2px 8px rgba(26,143,78,0.2)" }}
            onMouseEnter={function (e) { e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Add Card
          </button>
        </div>
        {cards.length === 0 ? (
          <div style={{ background: "var(--surface)", borderRadius: 14, padding: "40px 20px", border: "1px solid var(--border)", textAlign: "center" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 8px auto", display: "block" }}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", margin: 0 }}>No cards added yet</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {cards.map(function (card) {
              var g = getCardGradient(card.cardType);
              return (
                <div key={card.id} style={{ position: "relative", borderRadius: 14, padding: 20, background: "linear-gradient(135deg, " + g[0] + ", " + g[1] + ")", color: "#fff", minHeight: 160, display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", transition: "transform 200ms ease", cursor: "default" }}
                  onMouseEnter={function (e) { e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ width: 32, height: 24, borderRadius: 4, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                        <div style={{ width: 16, height: 10, borderRadius: 2, background: "rgba(255,200,100,0.8)" }} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.7 }}>{card.bank}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, opacity: 0.9 }}>{getCardLabel(card.cardType)}</span>
                      <button onClick={function () { removeCard(card.id); }} style={{ width: 22, height: 22, borderRadius: 5, background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 150ms ease" }}
                        onMouseEnter={function (e) { e.currentTarget.style.background = "rgba(255,0,0,0.4)"; }}
                        onMouseLeave={function (e) { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2, margin: "0 0 12px 0", fontVariantNumeric: "tabular-nums" }}>{card.masked}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div>
                        <span style={{ fontSize: 8, fontWeight: 600, opacity: 0.5, textTransform: "uppercase" }}>VALID THRU</span>
                        <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{card.expiry}</p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.8 }}>{card.holderName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Statement Parser */}
      <div style={{ background: "var(--surface)", borderRadius: 14, padding: 22, border: "1px solid var(--border)", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0 }}>Card Statement Parser</p>
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 14px 0" }}>Paste your bank statement or card transaction list. Amounts, merchants & categories are auto-detected.</p>
        <textarea value={statementText} onChange={function (e) { setStatementText(e.target.value); setParsedEntries([]); }} placeholder={"15/01/2025 SWIGGY 250.00\n16/01/2025 NETFLIX 15.99\n17/01/2025 SALARY 50000.00 CR\n18/01/2025 AMAZON 1,499.00\n19/01/2025 UBER 185.50\n20/01/2025 CASHBACK 200.00 CR"}
          style={{ width: "100%", height: 120, borderRadius: 10, padding: "12px", fontSize: 12, fontFamily: "monospace", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", outline: "none", resize: "none", lineHeight: 1.6, marginBottom: 12, transition: "all 200ms ease" }}
          onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; }}
          onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
        <button onClick={handleParse} disabled={!statementText.trim()} style={{ height: 38, padding: "0 20px", borderRadius: 8, background: statementText.trim() ? "var(--green)" : "var(--card)", border: "none", color: statementText.trim() ? "#fff" : "var(--faint)", fontSize: 13, fontWeight: 600, cursor: statementText.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 200ms ease", boxShadow: statementText.trim() ? "0 2px 8px rgba(26,143,78,0.2)" : "none" }}
          onMouseEnter={function (e) { if (statementText.trim()) { e.currentTarget.style.transform = "translateY(-1px)"; } }}
          onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; }}>Parse Statement</button>

        {parsedEntries.length > 0 && (
          <div style={{ marginTop: 16, animation: "fadeIn 200ms ease" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", margin: "0 0 10px 0" }}>Detected {parsedEntries.length} transactions</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
              {parsedEntries.map(function (entry, idx) {
                var cat = getCategoryIcon(entry.category);
                return (
                  <div key={idx} onClick={function () { toggleEntry(idx); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: entry.selected ? "var(--green-dim)" : "var(--bg)", border: "1px solid " + (entry.selected ? "var(--green-border)" : "var(--border)"), cursor: "pointer", transition: "all 150ms ease", opacity: entry.selected ? 1 : 0.5 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: entry.selected ? "none" : "2px solid var(--border)", background: entry.selected ? "var(--green)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 150ms ease" }}>
                      {entry.selected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                    <span style={{ width: 24, height: 18, borderRadius: 4, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 800, color: cat.color, flexShrink: 0 }}>{cat.letters}</span>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.merchant}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: entry.isIncome ? "var(--green)" : "var(--red)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{entry.isIncome ? "+" : "-"}{formatCurrency(entry.amount)}</span>
                    <span style={{ fontSize: 10, color: "var(--muted)", flexShrink: 0 }}>{entry.date}</span>
                  </div>
                );
              })}
            </div>
            <button onClick={addParsedToTransactions} disabled={parsedEntries.filter(function (e) { return e.selected; }).length === 0} style={{ height: 38, padding: "0 20px", borderRadius: 8, background: "var(--green)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 200ms ease", boxShadow: "0 2px 8px rgba(26,143,78,0.2)" }}
              onMouseEnter={function (e) { e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; }}>
              Add {parsedEntries.filter(function (e) { return e.selected; }).length} to Transactions
            </button>
          </div>
        )}
      </div>

      {/* Settings */}
      <div style={{ background: "var(--surface)", borderRadius: 14, padding: 22, border: "1px solid var(--border)", marginBottom: 20 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 14px 0" }}>Settings</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>Export Data</p>
              <p style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0 0 0" }}>Download all your data as JSON</p>
            </div>
            <button onClick={exportData} style={{ height: 34, padding: "0 16px", borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }}
              onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.color = "var(--green)"; }}
              onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text)"; }}>Export</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>Clear All Data</p>
              <p style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0 0 0" }}>Remove all transactions and cards</p>
            </div>
            {showClearConfirm ? (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={function () { setShowClearConfirm(false); }} style={{ height: 34, padding: "0 12px", borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                <button onClick={clearAll} style={{ height: 34, padding: "0 12px", borderRadius: 8, background: "var(--red)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
              </div>
            ) : (
              <button onClick={function () { setShowClearConfirm(true); }} style={{ height: 34, padding: "0 16px", borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--red)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }}
                onMouseEnter={function (e) { e.currentTarget.style.borderColor = "var(--red-border)"; }}
                onMouseLeave={function (e) { e.currentTarget.style.borderColor = "var(--border)"; }}>Clear</button>
            )}
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddCard && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", animation: "fadeIn 200ms ease" }} onClick={function () { setShowAddCard(false); }}>
          <div style={{ background: "var(--bg)", borderRadius: 20, padding: 24, width: "100%", maxWidth: 420, boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)", animation: "fadeIn 250ms cubic-bezier(0.16,1,0.3,1)" }} onClick={function (e) { e.stopPropagation(); }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: "0 0 14px 0" }}>Add Card</h2>

            {/* Live Card Preview */}
            <div style={{ borderRadius: 12, padding: 18, background: "linear-gradient(135deg, " + currentGradient[0] + ", " + currentGradient[1] + ")", color: "#fff", minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "space-between", marginBottom: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", transition: "background 300ms ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 20, borderRadius: 3, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 14, height: 8, borderRadius: 2, background: "rgba(255,200,100,0.8)" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, opacity: 0.9 }}>{getCardLabel(currentCardType)}</span>
                  <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.6 }}>{currentBank}</span>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: 2, margin: "0 0 10px 0", fontVariantNumeric: "tabular-nums" }}>{cardForm.number ? maskCardNumber(cardForm.number) : "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022"}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <span style={{ fontSize: 7, fontWeight: 600, opacity: 0.5, textTransform: "uppercase" }}>VALID THRU</span>
                    <p style={{ fontSize: 11, fontWeight: 700, margin: 0 }}>{cardForm.expiry || "MM/YY"}</p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.8 }}>{cardForm.holderName || "YOUR NAME"}</span>
                </div>
              </div>
            </div>

            {/* Card Type Badge */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {(["visa", "mastercard", "rupay", "amex"] as const).map(function (t) {
                var isActive = currentCardType === t;
                return (
                  <div key={t} style={{ padding: "3px 8px", borderRadius: 5, background: isActive ? "var(--green-dim)" : "var(--surface)", border: "1px solid " + (isActive ? "var(--green-border)" : "var(--border)"), transition: "all 150ms ease" }}>
                    <span style={{ fontSize: 9, fontWeight: isActive ? 800 : 600, color: isActive ? "var(--green)" : "var(--muted)" }}>{getCardLabel(t)}</span>
                  </div>
                );
              })}
            </div>
            {cardForm.number.replace(/\D/g, "").length >= 4 && (
              <div style={{ marginBottom: 10, padding: "6px 10px", borderRadius: 6, background: "var(--green-dim)", border: "1px solid var(--green-border)", animation: "fadeIn 150ms ease" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--green)" }}>{currentBank} detected</span>
              </div>
            )}

            <input type="text" placeholder="Card Number" value={cardForm.number} onChange={function (e) { var f = formatCardInput(e.target.value); setCardForm(function (cf) { return { ...cf, number: f }; }); }}
              style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 16, fontWeight: 700, outline: "none", fontFamily: "inherit", marginBottom: 8, fontVariantNumeric: "tabular-nums", letterSpacing: 1, transition: "all 200ms ease" }}
              onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; }}
              onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              <input type="text" placeholder="MM/YY" value={cardForm.expiry} onChange={function (e) { setCardForm(function (cf) { return { ...cf, expiry: formatExpiry(e.target.value) }; }); }}
                style={{ width: "100%", height: 40, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, fontWeight: 600, outline: "none", fontFamily: "inherit", fontVariantNumeric: "tabular-nums", transition: "all 200ms ease" }}
                onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; }}
                onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
              <input type="text" placeholder="Cardholder Name" value={cardForm.holderName} onChange={function (e) { setCardForm(function (cf) { return { ...cf, holderName: e.target.value }; }); }}
                style={{ width: "100%", height: 40, padding: "0 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "inherit", transition: "all 200ms ease" }}
                onFocus={function (e) { e.currentTarget.style.borderColor = "var(--green-border)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-dim)"; }}
                onBlur={function (e) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function () { setShowAddCard(false); }} style={{ flex: 1, height: 42, borderRadius: 10, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 150ms ease" }}
                onMouseEnter={function (e) { e.currentTarget.style.background = "var(--surface)"; }}
                onMouseLeave={function (e) { e.currentTarget.style.background = "transparent"; }}>Cancel</button>
              <button onClick={addCard} disabled={cardForm.number.replace(/\D/g, "").length < 13} style={{ flex: 1, height: 42, borderRadius: 10, background: cardForm.number.replace(/\D/g, "").length >= 13 ? "var(--green)" : "var(--card)", border: "none", color: cardForm.number.replace(/\D/g, "").length >= 13 ? "#fff" : "var(--faint)", fontSize: 13, fontWeight: 600, cursor: cardForm.number.replace(/\D/g, "").length >= 13 ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 200ms ease", boxShadow: cardForm.number.replace(/\D/g, "").length >= 13 ? "0 2px 8px rgba(26,143,78,0.2)" : "none" }}
                onMouseEnter={function (e) { if (cardForm.number.replace(/\D/g, "").length >= 13) { e.currentTarget.style.transform = "translateY(-1px)"; } }}
                onMouseLeave={function (e) { e.currentTarget.style.transform = "translateY(0)"; }}>Add Card</button>
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