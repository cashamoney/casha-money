"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export default function TaxPage() {
  const [income, setIncome] = useState(0);
  const [deductions, setDeductions] = useState({
    section80C: 0,
    section80D_self: 0,
    section80D_parents: 0,
    nps_80CCD: 0,
    hra: 0,
    home_loan_interest: 0,
    education_loan: 0,
    other: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadIncome(); }, []);

  const loadIncome = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;
    const { data } = await supabase
      .from("transactions")
      .select("amount, transaction_date")
      .eq("user_id", authData.user.id)
      .eq("transaction_type", "income");

    const total = (data || []).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const months = new Set((data || []).map((t: any) => t.transaction_date?.slice(0, 7)));
    const monthCount = Math.max(1, months.size);
    const annual = Math.round((total / monthCount) * 12);
    setIncome(annual || 0);
    setLoading(false);
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0
  }).format(n);

  const calculateOldRegime = () => {
    const grossIncome = income;
    const standardDeduction = 50000;
    const cap80C = Math.min(deductions.section80C, 150000);
    const cap80D = Math.min(deductions.section80D_self, 25000) + Math.min(deductions.section80D_parents, 50000);
    const cap80CCD = Math.min(deductions.nps_80CCD, 50000);
    const capHomeLoan = Math.min(deductions.home_loan_interest, 200000);
    const totalDeductions = standardDeduction + cap80C + cap80D + cap80CCD + deductions.hra + capHomeLoan + deductions.education_loan + deductions.other;
    const taxableIncome = Math.max(0, grossIncome - totalDeductions);

    let tax = 0;
    if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30;
    if (taxableIncome > 500000) tax += (Math.min(taxableIncome, 1000000) - 500000) * 0.20;
    if (taxableIncome > 250000) tax += (Math.min(taxableIncome, 500000) - 250000) * 0.05;
    if (taxableIncome <= 500000) tax = 0;

    const cess = tax * 0.04;
    return { grossIncome, totalDeductions, taxableIncome, tax, cess, totalTax: tax + cess };
  };

  const calculateNewRegime = () => {
    const grossIncome = income;
    const standardDeduction = 75000;
    const taxableIncome = Math.max(0, grossIncome - standardDeduction);

    let tax = 0;
    if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30;
    if (taxableIncome > 1200000) tax += (Math.min(taxableIncome, 1500000) - 1200000) * 0.20;
    if (taxableIncome > 1000000) tax += (Math.min(taxableIncome, 1200000) - 1000000) * 0.15;
    if (taxableIncome > 700000) tax += (Math.min(taxableIncome, 1000000) - 700000) * 0.10;
    if (taxableIncome > 300000) tax += (Math.min(taxableIncome, 700000) - 300000) * 0.05;
    if (taxableIncome <= 700000) tax = 0;

    const cess = tax * 0.04;
    return { grossIncome, totalDeductions: standardDeduction, taxableIncome, tax, cess, totalTax: tax + cess };
  };

  const oldRegime = calculateOldRegime();
  const newRegime = calculateNewRegime();
  const savings = oldRegime.totalTax - newRegime.totalTax;
  const betterRegime = savings > 0 ? "new" : "old";
  const maxSavings = Math.abs(savings);

  const remaining80C = Math.max(0, 150000 - deductions.section80C);
  const remaining80D = Math.max(0, 25000 - deductions.section80D_self);
  const remainingNPS = Math.max(0, 50000 - deductions.nps_80CCD);

  const inputStyle: React.CSSProperties = {
    width: "100%", height: "44px", borderRadius: "10px",
    padding: "0 14px", fontSize: "14px", border: "1px solid #E5E7EB",
    background: "#F9FAFB", color: "#0C0D10", outline: "none",
    boxSizing: "border-box",
  };

  const smallInput: React.CSSProperties = { ...inputStyle, height: "38px" };

  const DEDUCTION_FIELDS = [
    { key: "section80C", label: "Section 80C", sublabel: "PPF, ELSS, LIC, Home Loan Principal", max: 150000 },
    { key: "section80D_self", label: "Section 80D — Self & Family", sublabel: "Health insurance for self & family", max: 25000 },
    { key: "section80D_parents", label: "Section 80D — Parents", sublabel: "Health insurance for parents (₹50K if senior)", max: 50000 },
    { key: "nps_80CCD", label: "Section 80CCD(1B) — NPS", sublabel: "NPS contribution over & above 80C limit", max: 50000 },
    { key: "hra", label: "HRA Exemption", sublabel: "House Rent Allowance (salaried only)", max: null },
    { key: "home_loan_interest", label: "Home Loan Interest — Sec 24(b)", sublabel: "Interest paid on home loan", max: 200000 },
    { key: "education_loan", label: "Education Loan — Sec 80E", sublabel: "Interest on education loan (no limit)", max: null },
    { key: "other", label: "Other Deductions", sublabel: "80G donations, 80TTA savings interest etc.", max: null },
  ];

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <p style={{ color: "#9CA3AF", fontSize: "14px" }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: "980px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#0C0D10", margin: "0 0 4px 0" }}>
          🧾 Tax Genius™ — India
        </h1>
        <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
          Old Regime vs New Regime optimizer · FY 2025-26 (AY 2026-27)
        </p>
      </div>

      {/* AI Recommendation Banner */}
      <div style={{
        background: betterRegime === "new" ? "#F0FDF4" : "#EFF6FF",
        border: `1px solid ${betterRegime === "new" ? "#BBF7D0" : "#BFDBFE"}`,
        borderRadius: "16px", padding: "20px 24px", marginBottom: "24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "16px"
      }}>
        <div>
          <p style={{ fontSize: "12px", fontWeight: "600", color: betterRegime === "new" ? "#166534" : "#1E40AF", margin: "0 0 4px 0", textTransform: "uppercase" }}>
            🤖 AI Recommendation
          </p>
          <p style={{ fontSize: "18px", fontWeight: "700", color: "#0C0D10", margin: "0 0 4px 0" }}>
            {betterRegime === "new" ? "New Regime is better for you" : "Old Regime is better for you"}
          </p>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
            You save {fmt(maxSavings)} by choosing the {betterRegime} regime
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "36px", fontWeight: "700", margin: 0, color: betterRegime === "new" ? "#16A34A" : "#1D4ED8" }}>
            {fmt(maxSavings)}
          </p>
          <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>potential savings</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

        {/* ── LEFT: INPUTS ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Income */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "24px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#0C0D10", margin: "0 0 16px 0" }}>
              💵 Annual Income
            </h2>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              Gross Annual Income (₹)
            </label>
            <input
              type="number"
              value={income || ""}
              onChange={e => setIncome(Number(e.target.value))}
              placeholder="e.g. 1200000"
              style={inputStyle}
            />
            <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "6px", marginBottom: 0 }}>
              Auto-detected from transactions: {fmt(income)} · Edit if needed
            </p>
          </div>

          {/* Deductions */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "24px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#0C0D10", margin: "0 0 4px 0" }}>
              📋 Deductions (Old Regime Only)
            </h2>
            <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "0 0 20px 0" }}>
              These deductions only apply when comparing with Old Regime
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {DEDUCTION_FIELDS.map(item => (
                <div key={item.key}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <div style={{ flex: 1, marginRight: "8px" }}>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block" }}>
                        {item.label}
                      </label>
                      <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "2px 0 0 0" }}>
                        {item.sublabel}
                      </p>
                    </div>
                    {item.max && (
                      <span style={{ fontSize: "10px", color: "#9CA3AF", whiteSpace: "nowrap", marginTop: "2px" }}>
                        Limit: {fmt(item.max)}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={(deductions as any)[item.key] || ""}
                    onChange={e => setDeductions({ ...deductions, [item.key]: Number(e.target.value) })}
                    placeholder="0"
                    style={smallInput}
                  />
                  {item.max && (deductions as any)[item.key] > item.max && (
                    <p style={{ fontSize: "11px", color: "#DC2626", margin: "4px 0 0 0" }}>
                      ⚠️ Exceeds limit. Only {fmt(item.max)} will be considered.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: RESULTS ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Regime Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

            {/* New Regime */}
            <div style={{
              background: betterRegime === "new" ? "#F0FDF4" : "#fff",
              border: `2px solid ${betterRegime === "new" ? "#22C55E" : "#E5E7EB"}`,
              borderRadius: "16px", padding: "18px"
            }}>
              {betterRegime === "new" && (
                <span style={{ fontSize: "9px", fontWeight: "700", background: "#22C55E", color: "#fff", padding: "2px 8px", borderRadius: "999px", display: "inline-block", marginBottom: "8px" }}>
                  ✓ BETTER FOR YOU
                </span>
              )}
              <p style={{ fontSize: "13px", fontWeight: "700", color: "#0C0D10", margin: "0 0 12px 0" }}>New Regime</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                <Row label="Gross Income" value={fmt(newRegime.grossIncome)} />
                <Row label="Std. Deduction" value={`-${fmt(75000)}`} green />
                <Row label="Taxable Income" value={fmt(newRegime.taxableIncome)} />
                <Divider />
                <Row label="Base Tax" value={fmt(newRegime.tax)} />
                <Row label="Cess (4%)" value={fmt(newRegime.cess)} />
                <Divider />
                <Row label="Total Tax" value={fmt(newRegime.totalTax)} bold red />
              </div>
            </div>

            {/* Old Regime */}
            <div style={{
              background: betterRegime === "old" ? "#EFF6FF" : "#fff",
              border: `2px solid ${betterRegime === "old" ? "#3B82F6" : "#E5E7EB"}`,
              borderRadius: "16px", padding: "18px"
            }}>
              {betterRegime === "old" && (
                <span style={{ fontSize: "9px", fontWeight: "700", background: "#3B82F6", color: "#fff", padding: "2px 8px", borderRadius: "999px", display: "inline-block", marginBottom: "8px" }}>
                  ✓ BETTER FOR YOU
                </span>
              )}
              <p style={{ fontSize: "13px", fontWeight: "700", color: "#0C0D10", margin: "0 0 12px 0" }}>Old Regime</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                <Row label="Gross Income" value={fmt(oldRegime.grossIncome)} />
                <Row label="All Deductions" value={`-${fmt(oldRegime.totalDeductions)}`} green />
                <Row label="Taxable Income" value={fmt(oldRegime.taxableIncome)} />
                <Divider />
                <Row label="Base Tax" value={fmt(oldRegime.tax)} />
                <Row label="Cess (4%)" value={fmt(oldRegime.cess)} />
                <Divider />
                <Row label="Total Tax" value={fmt(oldRegime.totalTax)} bold red />
              </div>
            </div>
          </div>

          {/* Saving Opportunities */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "24px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#0C0D10", margin: "0 0 16px 0" }}>
              💡 Tax Saving Opportunities
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {remaining80C > 0 && (
                <Opportunity
                  color="#FFFBEB" border="#FDE68A" textColor="#92400E" subColor="#78350F"
                  title={`💰 Section 80C — ${fmt(remaining80C)} unused`}
                  desc={`Invest in ELSS mutual funds, PPF, or increase LIC premium. Save up to ${fmt(remaining80C * 0.30)} in tax.`}
                />
              )}
              {remaining80D > 0 && (
                <Opportunity
                  color="#F0FDF4" border="#BBF7D0" textColor="#166534" subColor="#14532D"
                  title={`🏥 Section 80D — ${fmt(remaining80D)} unused`}
                  desc={`Buy health insurance for self & family. Save up to ${fmt(remaining80D * 0.30)} in tax.`}
                />
              )}
              {remainingNPS > 0 && (
                <Opportunity
                  color="#EFF6FF" border="#BFDBFE" textColor="#1E40AF" subColor="#1E3A8A"
                  title={`🏛️ NPS 80CCD(1B) — ${fmt(remainingNPS)} unused`}
                  desc={`Contribute to NPS Tier-1 account. This is ADDITIONAL to 80C — save up to ${fmt(remainingNPS * 0.30)} more in tax.`}
                />
              )}
              {remaining80C === 0 && remaining80D === 0 && remainingNPS === 0 && (
                <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: "#166534", margin: 0 }}>
                    🎉 All major deductions maximized!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tax Calendar 2026 */}
          <div style={{ background: "#0C0D10", borderRadius: "16px", padding: "24px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#fff", margin: "0 0 16px 0" }}>
              📅 Tax Calendar — FY 2025-26
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { date: "15 Jun 2025", task: "Q1 Advance Tax — 15% of annual liability", done: true },
                { date: "15 Sep 2025", task: "Q2 Advance Tax — 45% of annual liability", done: true },
                { date: "15 Dec 2025", task: "Q3 Advance Tax — 75% of annual liability", done: true },
                { date: "15 Mar 2026", task: "Q4 Advance Tax — 100% of annual liability", done: false },
                { date: "31 Mar 2026", task: "Last date for tax-saving investments (80C, 80D, NPS)", done: false },
                { date: "31 Jul 2026", task: "ITR Filing deadline (salaried, no audit)", done: false },
                { date: "31 Oct 2026", task: "ITR Filing deadline (audit cases)", done: false },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{ fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>
                    {item.done ? "✅" : "⏳"}
                  </span>
                  <div>
                    <p style={{
                      fontSize: "12px", fontWeight: "600", margin: 0,
                      color: item.done ? "rgba(255,255,255,0.3)" : "#fff",
                      textDecoration: item.done ? "line-through" : "none"
                    }}>
                      {item.task}
                    </p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: "2px 0 0 0" }}>
                      {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p style={{ fontSize: "11px", color: "#9CA3AF", textAlign: "center", marginTop: "24px", marginBottom: 0 }}>
        Educational estimate only. Tax slabs: FY 2025-26 (AY 2026-27). Consult a qualified CA before filing.
      </p>
    </div>
  );
}

// ── Helper Components ──
function Row({ label, value, green, bold, red }: { label: string; value: string; green?: boolean; bold?: boolean; red?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "11px", color: "#6B7280" }}>{label}</span>
      <span style={{
        fontSize: bold ? "14px" : "11px",
        fontWeight: bold ? "700" : "600",
        color: green ? "#16A34A" : red ? "#DC2626" : "#0C0D10"
      }}>
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: "#E5E7EB", margin: "2px 0" }} />;
}

function Opportunity({ color, border, textColor, subColor, title, desc }: {
  color: string; border: string; textColor: string; subColor: string; title: string; desc: string;
}) {
  return (
    <div style={{ background: color, border: `1px solid ${border}`, borderRadius: "12px", padding: "14px" }}>
      <p style={{ fontSize: "13px", fontWeight: "600", color: textColor, margin: "0 0 4px 0" }}>{title}</p>
      <p style={{ fontSize: "12px", color: subColor, margin: 0 }}>{desc}</p>
    </div>
  );
}