"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

const C = {
  bg: "#FAFAFA",
  white: "#FFFFFF",
  dark: "#0C0D10",
  text: "#0C0D10",
  sub: "#6B7280",
  muted: "#9CA3AF",
  faint: "#D1D5DB",
  border: "#E5E7EB",
  blue: "#3B82F6",
  green: "#22C55E",
  amber: "#F59E0B",
  surface: "#F3F4F6",
};

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: light ? C.white : C.dark }}
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 3C6.134 3 3 6.134 3 10s3.134 7 7 7c1.742 0 3.337-.634 4.573-1.678"
            stroke={light ? C.dark : C.white}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M10 6.5v4l2.5 1.5"
            stroke={light ? C.dark : C.white}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span
        className="text-[17px] font-semibold tracking-[-0.02em]"
        style={{ color: light ? C.white : C.text }}
      >
        casha<span style={{ opacity: 0.35 }}>.money</span>
      </span>
    </div>
  );
}

const Ic = {
  chart: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M3 3v18h18" /><path d="m7 16 4-4 4 4 4-6" />
    </svg>
  ),
  brain: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
      <path d="M9.09 9a3 3 0 0 0 5.83 1" />
      <path d="M3 20a9 9 0 0 1 18 0" />
    </svg>
  ),
  trend: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="m22 7-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" />
    </svg>
  ),
  receipt: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="18" rx="2" /><path d="M8 10h8M8 14h5" />
    </svg>
  ),
  dollar: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
  ),
  badge: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
    </svg>
  ),
  lock: (
    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  eye: (
    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  shield: (
    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
    </svg>
  ),
  globe: (
    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  chevron: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  arrow: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  star: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  x: (
    <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  ig: (
    <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
};

/* ── Dashboard — clean, not congested ── */
function Dashboard() {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl"
      style={{ background: C.white, border: `1px solid ${C.border}` }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <span className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        <div
          className="px-4 py-1 rounded-md text-[11px] flex items-center gap-1.5"
          style={{ background: C.white, border: `1px solid ${C.border}`, color: C.muted }}
        >
          <svg width="9" height="9" fill="none" stroke={C.green} strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          app.casha.money
        </div>
        <div className="w-12" />
      </div>

      <div className="flex" style={{ minHeight: 460 }}>
        {/* Sidebar */}
        <div
          className="w-[180px] flex-shrink-0 p-4 hidden lg:flex flex-col"
          style={{ background: C.bg, borderRight: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2 mb-7">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: C.dark }}
            >
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 3C6.134 3 3 6.134 3 10s3.134 7 7 7c1.742 0 3.337-.634 4.573-1.678"
                  stroke={C.white}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M10 6.5v4l2.5 1.5"
                  stroke={C.white}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-[13px] font-semibold" style={{ color: C.text }}>
              Casha
            </span>
          </div>
          <div className="space-y-0.5 flex-1">
            {[
              { label: "Overview", active: true },
              { label: "Transactions", active: false },
              { label: "Budget", active: false },
              { label: "Debt Planner", active: false },
              { label: "Investments", active: false },
              { label: "Tax Center", active: false },
              { label: "AI Advisor", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center px-3 py-2.5 rounded-lg text-[12px] font-medium"
                style={{
                  background: item.active ? C.white : "transparent",
                  color: item.active ? C.text : C.muted,
                  boxShadow: item.active ? "0 1px 3px rgba(0,0,0,0.07)" : "none",
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 p-6">
          {/* Header — no emoji */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[12px]" style={{ color: C.muted }}>
                Thursday, March 12, 2026
              </p>
              <p
                className="text-[18px] font-semibold tracking-[-0.02em] mt-0.5"
                style={{ color: C.text }}
              >
                Good morning, Sarah
              </p>
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
              style={{
                background: "#F0FDF4",
                color: "#166534",
                border: "1px solid #BBF7D0",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              AI Active
            </div>
          </div>

          {/* Net worth */}
          <div className="rounded-xl p-5 mb-4" style={{ background: C.dark }}>
            <p
              className="text-[11px] font-medium uppercase tracking-wider mb-2"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Total Net Worth
            </p>
            <p className="text-[36px] font-semibold tracking-[-0.03em] leading-none text-white mb-2">
              $124,293
            </p>
            <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
              <span style={{ color: C.green, fontWeight: 600 }}>↑ $3,200</span>{" "}
              this month · up 14.9% from last year
            </p>
          </div>

          {/* 3 metric cards */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Health Score", value: "742", sub: "out of 1,000", green: false },
              { label: "Saved Monthly", value: "$2,840", sub: "22% of income", green: true },
              { label: "Debt Left", value: "$18,400", sub: "Free Mar 2027", green: false },
            ].map((m, i) => (
              <div
                key={i}
                className="rounded-xl p-4"
                style={{ background: C.bg, border: `1px solid ${C.border}` }}
              >
                <p
                  className="text-[10px] font-medium uppercase tracking-wider mb-2"
                  style={{ color: C.muted }}
                >
                  {m.label}
                </p>
                <p
                  className="text-[20px] font-semibold tracking-[-0.02em] leading-none mb-1"
                  style={{ color: C.text }}
                >
                  {m.value}
                </p>
                <p
                  className="text-[11px] font-medium"
                  style={{ color: m.green ? C.green : C.muted }}
                >
                  {m.sub}
                </p>
              </div>
            ))}
          </div>

          {/* AI Insight */}
          <div
            className="rounded-xl p-4 mb-4"
            style={{ background: C.white, border: `1px solid ${C.border}` }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: C.dark }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                </svg>
              </div>
              <div>
                <p
                  className="text-[11px] font-semibold uppercase tracking-wider mb-1"
                  style={{ color: C.text }}
                >
                  AI spotted something
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: C.sub }}>
                  Duolingo Plus, Adobe CC, and Calm — unused for 90+ days.{" "}
                  <strong style={{ color: C.text }}>$127/mo</strong> wasted. Cancel to save{" "}
                  <strong style={{ color: C.green }}>$1,524/yr</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Spending */}
          <div
            className="rounded-xl p-4"
            style={{ background: C.bg, border: `1px solid ${C.border}` }}
          >
            <p
              className="text-[10px] font-medium uppercase tracking-wider mb-3"
              style={{ color: C.muted }}
            >
              Spending — March
            </p>
            <div className="space-y-3">
              {[
                { name: "Housing", value: "$2,800", pct: 66 },
                { name: "Food & Dining", value: "$1,290", pct: 30 },
                { name: "Shopping", value: "$860", pct: 20 },
                { name: "Transport", value: "$517", pct: 12 },
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[12px]" style={{ color: C.sub }}>
                      {s.name}
                    </span>
                    <span className="text-[12px] font-medium" style={{ color: C.text }}>
                      {s.value}
                    </span>
                  </div>
                  <div
                    className="h-[4px] rounded-full overflow-hidden"
                    style={{ background: C.border }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${s.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.08 }}
                      className="h-full rounded-full"
                      style={{ background: C.dark }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Chat Visual ── */
function ChatVisual() {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-xl"
      style={{ background: C.dark, border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="w-2 h-2 rounded-full" style={{ background: C.green }} />
        <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
          Casha AI Advisor
        </span>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex justify-end">
          <div
            className="rounded-2xl rounded-tr-sm px-4 py-3 text-[13px] max-w-[80%]"
            style={{ background: C.blue, color: C.white }}
          >
            Can I afford a $4,000 vacation in April?
          </div>
        </div>
        <div className="flex justify-start">
          <div
            className="rounded-2xl rounded-tl-sm px-4 py-3.5 text-[13px] max-w-[88%] leading-relaxed"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)" }}
          >
            Yes — but timing matters. Your savings are at{" "}
            <span className="text-white font-semibold">$9,200</span> and you&apos;re adding{" "}
            <span className="text-white font-semibold">$1,400/month</span>. One thing: your car insurance
            renews March 15 for <span className="text-white font-semibold">$840</span>. Book after that
            and your emergency fund stays fully intact.
          </div>
        </div>
        <div className="flex justify-end">
          <div
            className="rounded-2xl rounded-tr-sm px-4 py-3 text-[13px]"
            style={{ background: C.blue, color: C.white }}
          >
            What if I book in late April?
          </div>
        </div>
        <div className="flex justify-start">
          <div
            className="rounded-2xl rounded-tl-sm px-4 py-3.5 text-[13px] max-w-[88%] leading-relaxed"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)" }}
          >
            <span className="text-white font-semibold">That&apos;s the move.</span> By April 25
            you&apos;ll have{" "}
            <span style={{ color: C.green, fontWeight: 600 }}>$11,480 saved</span>. Vacation covered,
            emergency fund at 6 months, and you still hit your house deposit goal by December.
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <div
            className="flex-1 rounded-xl px-3.5 py-2.5 text-[12px]"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.2)",
            }}
          >
            Ask anything about your money...
          </div>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: C.blue }}
          >
            <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Debt Visual ── */
function DebtVisual() {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-xl"
      style={{ background: C.white, border: `1px solid ${C.border}` }}
    >
      <div className="p-6" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[13px] font-semibold" style={{ color: C.text }}>
            Debt-Free Date
          </p>
          <span
            className="text-[12px] font-semibold px-3 py-1 rounded-full"
            style={{ background: "#F0FDF4", color: "#166534" }}
          >
            On track
          </span>
        </div>
        <p
          className="text-[32px] font-semibold tracking-[-0.025em]"
          style={{ color: C.text }}
        >
          September 2027
        </p>
        <p className="text-[13px] mt-1" style={{ color: C.sub }}>
          18 months faster with Casha&apos;s plan
        </p>
      </div>
      <div className="p-6 space-y-5">
        {[
          { name: "Credit Card", balance: "$4,200", rate: "24%", color: "#EF4444", pct: 35 },
          { name: "Personal Loan", balance: "$8,500", rate: "11%", color: C.amber, pct: 55 },
          { name: "Student Loan", balance: "$12,000", rate: "6%", color: C.blue, pct: 75 },
        ].map((d, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: d.color }}
                />
                <span className="text-[13px] font-medium" style={{ color: C.text }}>
                  {d.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-semibold" style={{ color: C.text }}>
                  {d.balance}
                </span>
                <span
                  className="text-[11px] px-2 py-0.5 rounded"
                  style={{ background: C.surface, color: C.muted }}
                >
                  {d.rate} APR
                </span>
              </div>
            </div>
            <div
              className="h-[6px] rounded-full overflow-hidden"
              style={{ background: C.surface }}
            >
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${d.pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: i * 0.15 }}
                className="h-full rounded-full"
                style={{ background: d.color }}
              />
            </div>
          </div>
        ))}
        <div className="pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between">
            <span className="text-[13px]" style={{ color: C.sub }}>
              Monthly payment freed after payoff
            </span>
            <span className="text-[15px] font-semibold" style={{ color: C.green }}>
              +$890/mo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Tax Visual ── */
function TaxVisual() {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-xl"
      style={{ background: C.white, border: `1px solid ${C.border}` }}
    >
      <div className="p-6" style={{ borderBottom: `1px solid ${C.border}` }}>
        <p className="text-[13px] font-medium mb-1" style={{ color: C.muted }}>
          Deductions found this year
        </p>
        <p
          className="text-[36px] font-semibold tracking-[-0.025em]"
          style={{ color: C.text }}
        >
          $3,840
        </p>
        <p className="text-[13px] mt-1" style={{ color: C.sub }}>
          You were leaving this on the table
        </p>
      </div>
      <div>
        {[
          { label: "Home office deduction", amount: "$1,200", status: "Found", sBg: "#F0FDF4", sColor: "#166534" },
          { label: "Health insurance premium", amount: "$960", status: "Found", sBg: "#F0FDF4", sColor: "#166534" },
          { label: "Professional development", amount: "$840", status: "Found", sBg: "#F0FDF4", sColor: "#166534" },
          { label: "Charitable contributions", amount: "$480", status: "Partial", sBg: "#FFFBEB", sColor: "#92400E" },
          { label: "Student loan interest", amount: "$360", status: "Found", sBg: "#F0FDF4", sColor: "#166534" },
        ].map((item, i, arr) => (
          <div
            key={i}
            className="flex items-center justify-between px-6 py-3.5"
            style={{ borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}
          >
            <span className="text-[13px]" style={{ color: C.text }}>
              {item.label}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-semibold" style={{ color: C.green }}>
                {item.amount}
              </span>
              <span
                className="text-[10px] font-semibold px-2 py-1 rounded-full"
                style={{ background: item.sBg, color: item.sColor }}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Score Visual ── */
function ScoreVisual() {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-xl"
      style={{ background: C.white, border: `1px solid ${C.border}` }}
    >
      <div className="p-6" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-medium mb-1" style={{ color: C.muted }}>
              Financial Health Score
            </p>
            <p
              className="font-semibold tracking-[-0.04em] leading-none"
              style={{ fontSize: 48, color: C.text }}
            >
              742
            </p>
            <p className="text-[13px] mt-2" style={{ color: C.sub }}>
              out of 1,000 ·{" "}
              <span style={{ color: C.green, fontWeight: 600 }}>↑ 34 pts this month</span>
            </p>
          </div>
          <span
            className="text-[13px] font-semibold px-3 py-1.5 rounded-full"
            style={{ background: "#EFF6FF", color: "#1D4ED8" }}
          >
            Good
          </span>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {[
          { label: "Emergency Fund", score: 90, color: C.green },
          { label: "Debt Health", score: 65, color: C.amber },
          { label: "Savings Rate", score: 78, color: C.green },
          { label: "Investment Mix", score: 55, color: C.amber },
          { label: "Tax Efficiency", score: 82, color: C.green },
        ].map((item, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1.5">
              <span className="text-[13px]" style={{ color: C.text }}>
                {item.label}
              </span>
              <span className="text-[13px] font-semibold" style={{ color: C.text }}>
                {item.score}/100
              </span>
            </div>
            <div
              className="h-[6px] rounded-full overflow-hidden"
              style={{ background: C.surface }}
            >
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${item.score}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: i * 0.1 }}
                className="h-full rounded-full"
                style={{ background: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
export default function Home() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [pos, setPos] = useState(0);
  const [faq, setFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || state !== "idle") return;
    setState("loading");
    await new Promise((r) => setTimeout(r, 800));
    setPos(Math.floor(Math.random() * 600) + 300);
    setState("done");
    toast.success("You're on the waitlist.");
  };

  return (
    <div
      className="min-h-screen antialiased"
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: C.dark,
            color: C.white,
            borderRadius: "10px",
            fontSize: "13px",
          },
        }}
      />

      {/* ═══ NAV ═══ */}
      <header
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? `${C.bg}F2` : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? `1px solid ${C.border}` : "none",
          boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div className="max-w-[1280px] mx-auto px-8 h-[66px] flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {[
              ["Product", "#product"],
              ["How It Works", "#howitworks"],
              ["Security", "#security"],
              ["Pricing", "/pricing"],
              ["FAQ", "#faq"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="px-3.5 py-2 text-[14px] rounded-lg transition-all"
                style={{ color: C.sub }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = C.text;
                  e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = C.sub;
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="hidden sm:block text-[14px] font-medium transition-colors"
              style={{ color: C.sub }}
            >
              Sign in
            </a>
            <a
              href="#cta"
              className="text-[14px] font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
              style={{ background: C.dark, color: C.white }}
            >
              Get Started Free
            </a>
          </div>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="pt-[150px] pb-0 px-8 overflow-hidden" style={{ background: C.bg }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="max-w-[800px] mx-auto text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex justify-center mb-8"
            >
              <div
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[13px] font-medium"
                style={{ border: `1px solid ${C.border}`, color: C.sub, background: C.white }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: C.green }}
                />
                Early access now open — Join the waitlist
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="font-semibold leading-[1.04] tracking-[-0.04em] mb-7"
              style={{ fontSize: "clamp(52px, 7.5vw, 88px)", color: C.text }}
            >
              The financial advisor
              <br />
              <span style={{ color: C.muted }}>everyone deserves.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.18 }}
              className="leading-[1.65] mx-auto mb-10"
              style={{ fontSize: 19, color: C.sub, maxWidth: 500 }}
            >
              AI that tracks your money, finds what you&apos;re losing, and builds a personalized plan to
              grow your wealth. Free for everyone.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.28 }}
              id="cta"
              className="flex justify-center mb-5"
            >
              <AnimatePresence mode="wait">
                {state === "done" ? (
                  <motion.div
                    key="d"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 px-6 py-4 rounded-2xl"
                    style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: C.green, color: C.white }}
                    >
                      {Ic.check}
                    </div>
                    <div className="text-left">
                      <p className="text-[14px] font-semibold" style={{ color: C.text }}>
                        You&apos;re #{pos} on the list
                      </p>
                      <p className="text-[12px]" style={{ color: C.sub }}>
                        We&apos;ll notify you when access opens.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="f"
                    onSubmit={submit}
                    className="flex flex-col sm:flex-row gap-2.5"
                  >
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      disabled={state === "loading"}
                      className="h-[52px] rounded-xl px-5 text-[15px] outline-none transition-all disabled:opacity-50 shadow-sm"
                      style={{
                        width: 310,
                        background: C.white,
                        border: `1px solid ${C.border}`,
                        color: C.text,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = C.blue;
                        e.target.style.boxShadow = `0 0 0 3px ${C.blue}18`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = C.border;
                        e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.06)";
                      }}
                    />
                    <button
                      type="submit"
                      disabled={state === "loading"}
                      className="h-[52px] rounded-xl px-8 text-[15px] font-semibold transition-all disabled:opacity-50 shadow-sm whitespace-nowrap"
                      style={{ background: C.dark, color: C.white }}
                    >
                      {state === "loading" ? "Joining..." : "Get Early Access — Free"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[13px] mb-20"
              style={{ color: C.muted }}
            >
              Free plan available forever · No credit card required · 40+ countries supported
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="max-w-[1100px] mx-auto relative"
          >
            <Dashboard />
            <div
              className="absolute bottom-0 inset-x-0 h-[100px] pointer-events-none"
              style={{ background: `linear-gradient(to top, ${C.bg}, transparent)` }}
            />
          </motion.div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section
        className="py-16 px-8"
        style={{
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          background: C.white,
        }}
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { n: "4,200+", l: "People on the waitlist" },
              { n: "$12M+", l: "In savings identified" },
              { n: "$47K avg", l: "In tax savings found" },
              { n: "40+", l: "Countries supported" },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.06} className="text-center">
                <p
                  className="text-[28px] sm:text-[34px] font-semibold tracking-[-0.025em]"
                  style={{ color: C.text }}
                >
                  {s.n}
                </p>
                <p className="text-[14px] mt-1.5" style={{ color: C.muted }}>
                  {s.l}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM ═══ */}
      <section className="py-[120px] px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <Reveal>
              <p
                className="text-[12px] font-semibold uppercase tracking-[0.15em] mb-5"
                style={{ color: C.blue }}
              >
                The problem
              </p>
              <h2
                className="font-semibold leading-[1.1] tracking-[-0.03em] mb-7"
                style={{ fontSize: "clamp(36px, 4.5vw, 52px)", color: C.text }}
              >
                Most people lose
                <br />
                thousands every year.
                <br />
                <span style={{ color: C.muted }}>Without knowing it.</span>
              </h2>
              <p
                className="text-[17px] leading-[1.75] mb-8"
                style={{ color: C.sub, maxWidth: 480 }}
              >
                Not because they&apos;re careless. Because good financial guidance has always required money
                you don&apos;t yet have. We&apos;re here to change that.
              </p>
              <a
                href="#product"
                className="inline-flex items-center gap-2 text-[15px] font-semibold group"
                style={{ color: C.text }}
              >
                See how Casha helps
                <span className="group-hover:translate-x-1 transition-transform">{Ic.arrow}</span>
              </a>
            </Reveal>
            <div className="grid grid-cols-2 gap-4">
              {[
                { n: "78%", d: "of adults live paycheck to paycheck", s: "Federal Reserve, 2024" },
                { n: "$1,200", d: "average annual tax overpayment", s: "IRS Data" },
                { n: "56%", d: "cannot cover a $1,000 emergency", s: "Bankrate, 2024" },
                { n: "64%", d: "not on track for retirement", s: "NIRS Report" },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div
                    className="rounded-2xl p-7 h-full"
                    style={{
                      background: C.white,
                      border: `1px solid ${C.border}`,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}
                  >
                    <p
                      className="text-[34px] font-semibold tracking-[-0.025em] mb-3"
                      style={{ color: C.text }}
                    >
                      {s.n}
                    </p>
                    <p className="text-[13px] leading-snug mb-3" style={{ color: C.sub }}>
                      {s.d}
                    </p>
                    <p
                      className="text-[10px] uppercase tracking-wider font-medium"
                      style={{ color: C.faint }}
                    >
                      {s.s}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURE 1: AI ADVISOR ═══ */}
      <section
        id="product"
        className="py-[120px] px-8"
        style={{ background: C.white, borderTop: `1px solid ${C.border}` }}
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <Reveal>
              <p
                className="text-[12px] font-semibold uppercase tracking-[0.15em] mb-5"
                style={{ color: C.blue }}
              >
                AI Advisor
              </p>
              <h2
                className="font-semibold leading-[1.1] tracking-[-0.03em] mb-6"
                style={{ fontSize: "clamp(34px, 4vw, 48px)", color: C.text }}
              >
                Ask anything.
                <br />
                Get answers that
                <br />
                actually apply to you.
              </h2>
              <p className="text-[17px] leading-[1.75] mb-8" style={{ color: C.sub }}>
                Most financial advice is generic. Casha reads your actual bank data, spending history, and
                goals before answering. When you ask &ldquo;Can I afford this?&rdquo; — we check your real
                numbers, not national averages.
              </p>
              <ul className="space-y-4">
                {[
                  "Available 24/7 in multiple languages",
                  "Based on your real income and spending",
                  "Gives specific next steps, not vague tips",
                  "Understands your full financial picture",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-[15px]"
                    style={{ color: C.sub }}
                  >
                    <span className="flex-shrink-0" style={{ color: C.green }}>
                      {Ic.check}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.15}>
              <ChatVisual />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ FEATURE 2: SPENDING ═══ */}
      <section
        className="py-[120px] px-8"
        style={{ background: C.bg, borderTop: `1px solid ${C.border}` }}
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <Reveal delay={0.1} className="order-2 lg:order-1">
              <Dashboard />
            </Reveal>
            <Reveal className="order-1 lg:order-2">
              <p
                className="text-[12px] font-semibold uppercase tracking-[0.15em] mb-5"
                style={{ color: C.blue }}
              >
                Spending Intelligence
              </p>
              <h2
                className="font-semibold leading-[1.1] tracking-[-0.03em] mb-6"
                style={{ fontSize: "clamp(34px, 4vw, 48px)", color: C.text }}
              >
                Know exactly where
                <br />
                every dollar goes.
              </h2>
              <p className="text-[17px] leading-[1.75] mb-8" style={{ color: C.sub }}>
                Every transaction categorized automatically across all your accounts. Forgotten subscriptions
                surfaced. Spending patterns you never noticed — revealed clearly.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { stat: "98%", desc: "categorization accuracy" },
                  { stat: "$200", desc: "average monthly waste found" },
                  { stat: "12", desc: "avg subscriptions detected" },
                  { stat: "2 min", desc: "to connect your accounts" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-4"
                    style={{ background: C.white, border: `1px solid ${C.border}` }}
                  >
                    <p
                      className="text-[24px] font-semibold tracking-[-0.02em]"
                      style={{ color: C.text }}
                    >
                      {s.stat}
                    </p>
                    <p className="text-[12px] mt-1" style={{ color: C.muted }}>
                      {s.desc}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ FEATURE 3: DEBT ═══ */}
      <section
        className="py-[120px] px-8"
        style={{ background: C.white, borderTop: `1px solid ${C.border}` }}
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <Reveal>
              <p
                className="text-[12px] font-semibold uppercase tracking-[0.15em] mb-5"
                style={{ color: C.blue }}
              >
                Debt Optimizer
              </p>
              <h2
                className="font-semibold leading-[1.1] tracking-[-0.03em] mb-6"
                style={{ fontSize: "clamp(34px, 4vw, 48px)", color: C.text }}
              >
                Your fastest path
                <br />
                to being debt-free.
              </h2>
              <p className="text-[17px] leading-[1.75] mb-8" style={{ color: C.sub }}>
                We calculate the mathematically optimal payoff order. You see your exact debt-free date.
                Every extra dollar you apply is automatically routed to save you the most interest.
              </p>
              <ul className="space-y-4">
                {[
                  "Optimal payoff sequence calculated automatically",
                  "See your debt-free date update in real time",
                  "Refinancing opportunities identified",
                  "Celebrate every milestone along the way",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-[15px]"
                    style={{ color: C.sub }}
                  >
                    <span className="flex-shrink-0" style={{ color: C.green }}>
                      {Ic.check}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.15}>
              <DebtVisual />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ FEATURE 4: TAX ═══ */}
      <section
        className="py-[120px] px-8"
        style={{ background: C.bg, borderTop: `1px solid ${C.border}` }}
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <Reveal delay={0.1} className="order-2 lg:order-1">
              <TaxVisual />
            </Reveal>
            <Reveal className="order-1 lg:order-2">
              <p
                className="text-[12px] font-semibold uppercase tracking-[0.15em] mb-5"
                style={{ color: C.blue }}
              >
                Tax Optimizer
              </p>
              <h2
                className="font-semibold leading-[1.1] tracking-[-0.03em] mb-6"
                style={{ fontSize: "clamp(34px, 4vw, 48px)", color: C.text }}
              >
                Stop overpaying
                <br />
                your taxes.
              </h2>
              <p className="text-[17px] leading-[1.75] mb-8" style={{ color: C.sub }}>
                The average person overpays $1,200 in taxes every year by missing deductions they qualify
                for. Casha scans your spending and automatically surfaces every deduction before the
                deadline.
              </p>
              <div
                className="rounded-2xl p-6"
                style={{ background: C.white, border: `1px solid ${C.border}` }}
              >
                <p className="text-[13px] font-medium mb-4" style={{ color: C.muted }}>
                  Works across 40+ countries including
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "United States",
                    "United Kingdom",
                    "India",
                    "Canada",
                    "Australia",
                    "Germany",
                    "France",
                    "Singapore",
                  ].map((country) => (
                    <span
                      key={country}
                      className="text-[12px] font-medium px-3 py-1.5 rounded-lg"
                      style={{ background: C.surface, color: C.sub }}
                    >
                      {country}
                    </span>
                  ))}
                  <span
                    className="text-[12px] font-medium px-3 py-1.5 rounded-lg"
                    style={{ background: C.surface, color: C.blue }}
                  >
                    +32 more
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ FEATURE 5: HEALTH SCORE ═══ */}
      <section
        className="py-[120px] px-8"
        style={{ background: C.white, borderTop: `1px solid ${C.border}` }}
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <Reveal>
              <p
                className="text-[12px] font-semibold uppercase tracking-[0.15em] mb-5"
                style={{ color: C.blue }}
              >
                Financial Health Score
              </p>
              <h2
                className="font-semibold leading-[1.1] tracking-[-0.03em] mb-6"
                style={{ fontSize: "clamp(34px, 4vw, 48px)", color: C.text }}
              >
                One number that
                <br />
                tells you everything.
              </h2>
              <p className="text-[17px] leading-[1.75] mb-8" style={{ color: C.sub }}>
                Your Financial Health Score measures 9 factors across your complete financial life — from
                emergency fund coverage to investment diversification. It updates monthly and always tells
                you exactly what to improve next.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  "Emergency Fund",
                  "Debt Health",
                  "Savings Rate",
                  "Tax Efficiency",
                  "Investment Mix",
                  "Insurance",
                  "Credit Score",
                  "Net Worth",
                  "Cash Flow",
                ].map((factor) => (
                  <div
                    key={factor}
                    className="rounded-lg px-3 py-2.5 text-center"
                    style={{ background: C.surface, border: `1px solid ${C.border}` }}
                  >
                    <p className="text-[11px] font-medium" style={{ color: C.sub }}>
                      {factor}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <ScoreVisual />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section
        id="howitworks"
        className="py-[120px] px-8"
        style={{ background: C.dark }}
      >
        <div className="max-w-[1280px] mx-auto">
          <Reveal className="text-center max-w-[600px] mx-auto mb-20">
            <p
              className="text-[12px] font-semibold uppercase tracking-[0.15em] mb-5"
              style={{ color: C.green }}
            >
              How it works
            </p>
            <h2
              className="font-semibold leading-[1.08] tracking-[-0.03em] text-white"
              style={{ fontSize: "clamp(36px, 4.5vw, 52px)" }}
            >
              Up and running
              <br />
              in two minutes.
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                n: "1",
                title: "Create your account",
                desc: "Sign up with just your email. Free plan ready immediately. No credit card required.",
              },
              {
                n: "2",
                title: "Connect your accounts",
                desc: "Link banks securely through certified APIs, or upload a CSV statement. Your choice.",
              },
              {
                n: "3",
                title: "AI analyzes everything",
                desc: "Transactions categorized. Patterns found. Health score calculated. Opportunities surfaced.",
              },
              {
                n: "4",
                title: "Get your plan",
                desc: "Specific recommendations based on your real data. Follow the plan. Watch your score rise.",
              },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div
                  className="rounded-2xl p-8 h-full"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      Step {s.n}
                    </span>
                    <div
                      className="flex-1 h-px"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    />
                  </div>
                  <h3 className="text-[17px] font-semibold text-white mb-3">{s.title}</h3>
                  <p
                    className="text-[14px] leading-[1.7]"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section
        className="py-[120px] px-8"
        style={{ background: C.bg, borderTop: `1px solid ${C.border}` }}
      >
        <div className="max-w-[1280px] mx-auto">
          <Reveal className="text-center mb-16">
            <p
              className="text-[12px] font-semibold uppercase tracking-[0.15em] mb-4"
              style={{ color: C.blue }}
            >
              Real people. Real results.
            </p>
            <h2
              className="font-semibold tracking-[-0.03em]"
              style={{ fontSize: "clamp(34px, 4vw, 48px)", color: C.text }}
            >
              What our early users say
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                q: "Found $847 in subscriptions I completely forgot about. Cancelled everything in 10 minutes. The app paid for itself on day one.",
                n: "Sarah K.",
                r: "Product Manager · San Francisco",
                c: "#EEF2FF",
                ct: "#3730A3",
              },
              {
                q: "Tax optimizer found $3,200 in deductions my accountant missed for two straight years. One feature paid for a decade of subscription.",
                n: "James T.",
                r: "Software Engineer · London",
                c: "#F0FDF4",
                ct: "#166534",
              },
              {
                q: "First financial app that gives advice based on my actual situation — not generic tips I've already read a hundred times.",
                n: "Priya M.",
                r: "Startup Founder · Singapore",
                c: "#FFF1F2",
                ct: "#9F1239",
              },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div
                  className="rounded-2xl p-8 h-full"
                  style={{ background: C.white, border: `1px solid ${C.border}` }}
                >
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <span key={j}>{Ic.star}</span>
                    ))}
                  </div>
                  <p className="text-[15px] leading-[1.75] mb-8" style={{ color: C.text }}>
                    &ldquo;{t.q}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
                      style={{ background: t.c, color: t.ct }}
                    >
                      {t.n
                        .split(" ")
                        .map((w: string) => w[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold" style={{ color: C.text }}>
                        {t.n}
                      </p>
                      <p className="text-[12px]" style={{ color: C.muted }}>
                        {t.r}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECURITY ═══ */}
      <section
        id="security"
        className="py-[120px] px-8"
        style={{ background: C.dark }}
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-20 items-start">
            <Reveal>
              <p
                className="text-[12px] font-semibold uppercase tracking-[0.15em] mb-5"
                style={{ color: C.green }}
              >
                Security
              </p>
              <h2
                className="font-semibold leading-[1.08] tracking-[-0.03em] text-white mb-6"
                style={{ fontSize: "clamp(36px, 4vw, 52px)" }}
              >
                Your bank trusts
                <br />
                this standard.
                <br />
                <span style={{ color: "rgba(255,255,255,0.28)" }}>So can you.</span>
              </h2>
              <p
                className="text-[17px] leading-[1.75] mb-10"
                style={{ color: "rgba(255,255,255,0.4)", maxWidth: 440 }}
              >
                AES-256 encryption — the same standard used by JPMorgan, Wells Fargo, and HSBC. Read-only
                access. We see your data. We cannot touch your money.
              </p>
              <div
                className="pt-10"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p
                  className="text-[13px] leading-[1.85]"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  <strong style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                    Disclosure —
                  </strong>{" "}
                  Casha is a financial management platform, not a licensed financial advisor. All information
                  is educational only. Please consult a qualified professional before making investment, tax,
                  or legal decisions.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                {[
                  {
                    icon: Ic.lock,
                    title: "AES-256 Encryption",
                    desc: "Every piece of your data encrypted at rest and in transit — the same standard used by the world's largest banks.",
                  },
                  {
                    icon: Ic.eye,
                    title: "Read-only bank access",
                    desc: "We connect to read your transactions. That's it. We cannot initiate payments, transfers, or any action on your accounts.",
                  },
                  {
                    icon: Ic.shield,
                    title: "SOC 2 Type II certified",
                    desc: "Our security controls tested and verified by an independent auditor every year — not self-declared.",
                  },
                  {
                    icon: Ic.globe,
                    title: "Your data, your rights",
                    desc: "Your data is never sold. Delete your account anytime. All data permanently removed within 30 days.",
                  },
                ].map((s, i, arr) => (
                  <div
                    key={i}
                    className="flex items-start gap-5 p-7"
                    style={{
                      borderBottom:
                        i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: "rgba(255,255,255,0.25)" }}
                    >
                      {s.icon}
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-white mb-1.5">{s.title}</p>
                      <p
                        className="text-[13px] leading-[1.7]"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section
        id="faq"
        className="py-[120px] px-8"
        style={{ background: C.bg, borderTop: `1px solid ${C.border}` }}
      >
        <div className="max-w-[760px] mx-auto">
          <Reveal className="text-center mb-14">
            <p
              className="text-[12px] font-semibold uppercase tracking-[0.15em] mb-4"
              style={{ color: C.blue }}
            >
              FAQ
            </p>
            <h2
              className="font-semibold tracking-[-0.03em]"
              style={{ fontSize: "clamp(34px, 4vw, 48px)", color: C.text }}
            >
              Frequently asked questions
            </h2>
          </Reveal>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: C.white, border: `1px solid ${C.border}` }}
          >
            {[
              {
                q: "Is the free plan genuinely free, with no hidden limits?",
                a: "Yes. No credit card, no trial, no bait-and-switch. Our free plan includes spending tracking, your Financial Health Score, subscription detection, and 5 AI advisor questions daily — forever. We earn from Plus subscribers who need advanced features.",
              },
              {
                q: "How do you access my bank accounts?",
                a: "Through certified, read-only banking APIs trusted by thousands of financial applications globally. Read-only means we see your transactions to analyze them — we have zero ability to initiate payments, transfers, or any changes. Your login credentials are never stored on our servers.",
              },
              {
                q: "Which countries and banks are supported?",
                a: "40+ countries including the US, UK, EU, India, Canada, Australia, Singapore, UAE, and more. For banks not yet integrated, you can upload a CSV statement from your bank's website — this works everywhere with no integration needed.",
              },
              {
                q: "How is the advice personalized to my situation?",
                a: "Our AI reads your actual account balances, transaction history, income patterns, and goals before responding. When you ask 'Can I afford this?', we look at your real savings and spending — not national averages or generic guidelines.",
              },
              {
                q: "Is Casha a licensed financial advisor?",
                a: "No. Casha is a financial education and management platform, not a licensed financial advisor. Our AI provides informational guidance only. For investment decisions, tax filings, or complex planning, please consult a qualified licensed professional in your jurisdiction.",
              },
              {
                q: "What happens to my data if I delete my account?",
                a: "All your personal data — account connections, transaction history, conversations, and profile information — is permanently deleted from our systems within 30 days of deletion. We do not sell, transfer, or retain your data after you leave.",
              },
            ].map((f, i, arr) => (
              <div
                key={i}
                style={{
                  borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
                }}
              >
                <button
                  onClick={() => setFaq(faq === i ? null : i)}
                  className="w-full flex items-center justify-between px-8 py-6 text-left group"
                >
                  <span
                    className="text-[15px] font-semibold pr-6 transition-colors"
                    style={{ color: faq === i ? C.blue : C.text }}
                  >
                    {f.q}
                  </span>
                  <motion.span
                    animate={{ rotate: faq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                    style={{ color: C.muted }}
                  >
                    {Ic.chevron}
                  </motion.span>
                </button>
                <AnimatePresence>
                  {faq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p
                        className="px-8 pb-7 text-[15px] leading-[1.75]"
                        style={{ color: C.sub }}
                      >
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-[140px] px-8" style={{ background: C.dark }}>
        <Reveal className="max-w-[700px] mx-auto text-center">
          <h2
            className="font-semibold leading-[1.05] tracking-[-0.04em] text-white mb-6"
            style={{ fontSize: "clamp(44px, 6vw, 72px)" }}
          >
            Take control of your
            <br />
            financial life today.
          </h2>
          <p
            className="text-[18px] leading-relaxed mb-12"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Join 4,200+ people who stopped guessing with their money.
          </p>
          {state === "done" ? (
            <p className="text-[16px] font-semibold" style={{ color: C.green }}>
              You&apos;re #{pos} on the waitlist. We&apos;ll be in touch.
            </p>
          ) : (
            <>
              <form
                onSubmit={submit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 h-[52px] rounded-xl px-5 text-[15px] outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: C.white,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.35)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.12)";
                  }}
                />
                <button
                  type="submit"
                  className="h-[52px] rounded-xl px-8 text-[15px] font-semibold whitespace-nowrap transition-all"
                  style={{ background: C.white, color: C.dark }}
                >
                  {state === "loading" ? "Joining..." : "Get Started Free"}
                </button>
              </form>
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                Free plan available · No credit card required
              </p>
            </>
          )}
        </Reveal>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer
        className="px-8 pt-16 pb-10"
        style={{ background: C.dark, borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-12 pb-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p
              className="text-[12px] leading-[1.85] max-w-4xl"
              style={{ color: "rgba(255,255,255,0.18)" }}
            >
              <strong style={{ color: "rgba(255,255,255,0.35)" }}>Legal Disclaimer:</strong>{" "}
              Casha Money, Inc. is not a registered investment advisor, broker-dealer, financial planner,
              or tax advisor. Nothing on this platform constitutes financial, investment, or tax advice.
              All content is provided for educational and informational purposes only. Past performance
              does not indicate future results. Always consult a qualified licensed professional before
              making financial decisions.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
            <div className="col-span-2">
              <Logo light />
              <p
                className="text-[14px] leading-relaxed mt-4 max-w-xs"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                AI-powered financial intelligence for everyone. World-class financial guidance
                shouldn&apos;t be a privilege.
              </p>
            </div>
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Security", "Integrations", "Changelog"],
              },
              { title: "Company", links: ["About", "Blog", "Careers", "Press", "Contact"] },
              {
                title: "Legal",
                links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Disclosures"],
              },
            ].map((col) => (
              <div key={col.title}>
                <p
                  className="text-[11px] font-bold uppercase tracking-widest mb-5"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {col.title}
                </p>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a
                        href={l === "Pricing" ? "/pricing" : "#"}
                        className="text-[13px] transition-colors"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "rgba(255,255,255,0.25)";
                        }}
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24 }}
          >
            <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.2)" }}>
              © {new Date().getFullYear()} Casha Money, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              {[
                { href: "https://x.com/cashamoneyai", icon: Ic.x },
                { href: "https://instagram.com/cashamoneyai", icon: Ic.ig },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.35)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}