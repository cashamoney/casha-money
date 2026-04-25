"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

type AccountType = "Bank" | "Cash" | "Credit Card" | "Wallet" | "Investment";

const TYPE_CONFIG: Record<AccountType, { color: string; bg: string; icon: string }> = {
  Bank: { color: "#3B82F6", bg: "rgba(59,130,246,0.1)", icon: "🏦" },
  Cash: { color: "#22C55E", bg: "rgba(34,197,94,0.1)", icon: "💵" },
  "Credit Card": { color: "#EF4444", bg: "rgba(239,68,68,0.1)", icon: "💳" },
  Wallet: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: "👛" },
  Investment: { color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", icon: "📈" },
};

export default function AccountsPage() {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("Bank");
  const [balance, setBalance] = useState("");
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) {
      router.push("/auth/login");
      return;
    }
    setUser(u.user);
    const { data } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", u.user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    setAccounts(data || []);
    setLoading(false);
  };

  const totalBalance = accounts.reduce(
    (s, a) => s + Number(a.current_balance || 0),
    0
  );

  const handleAdd = async () => {
    if (!name.trim() || !balance) return;
    setSaving(true);
    const { error } = await supabase.from("accounts").insert({
      user_id: user.id,
      account_name: name.trim(),
      account_type: type,
      current_balance: Number(balance),
      is_active: true,
    });
    if (!error) {
      setName("");
      setType("Bank");
      setBalance("");
      setShowForm(false);
      await load();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("accounts")
      .update({ is_active: false })
      .eq("id", id);
    if (!error) {
      setConfirmDelete(null);
      setMenuOpen(null);
      await load();
    }
  };

  if (loading) {
    return (
      <div
        style={{
          height: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
          fontSize: 13,
        }}
      >
        Loading accounts...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Accounts
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0 0" }}>
            Manage your financial accounts
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            border: "none",
            background: "#22C55E",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "0.15s",
            minHeight: 44,
          }}
        >
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
          </svg>
          Add Account
        </button>
      </div>

      {/* Total Balance Bar */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "18px 22px",
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--faint)",
              textTransform: "uppercase",
              letterSpacing: 0.06,
              margin: "0 0 4px",
            }}
          >
            Total Balance
          </p>
          <p
            style={{
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.03em",
            }}
          >
            {fmt(totalBalance)}
          </p>
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
          {accounts.length} active account{accounts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Add Account Form */}
      {showForm && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: 22,
            marginBottom: 24,
            animation: "fadeIn 0.2s ease",
          }}
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              margin: "0 0 16px",
              color: "var(--text)",
            }}
          >
            New Account
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 14,
              marginBottom: 16,
            }}
          >
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Account Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. HDFC Savings"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontSize: 13,
                  outline: "none",
                  minHeight: 44,
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Account Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontSize: 13,
                  outline: "none",
                  minHeight: 44,
                }}
              >
                <option value="Bank">🏦 Bank</option>
                <option value="Cash">💵 Cash</option>
                <option value="Credit Card">💳 Credit Card</option>
                <option value="Wallet">👛 Wallet</option>
                <option value="Investment">📈 Investment</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Initial Balance (₹)
              </label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontSize: 13,
                  outline: "none",
                  minHeight: 44,
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleAdd}
              disabled={saving || !name.trim() || !balance}
              style={{
                padding: "10px 24px",
                borderRadius: 8,
                border: "none",
                background:
                  saving || !name.trim() || !balance
                    ? "var(--faint)"
                    : "#22C55E",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor:
                  saving || !name.trim() || !balance
                    ? "not-allowed"
                    : "pointer",
                minHeight: 44,
              }}
            >
              {saving ? "Saving..." : "Save Account"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: "10px 24px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--muted)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                minHeight: 44,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {accounts.length === 0 && !showForm && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 14,
          }}
        >
          <p style={{ fontSize: 40, margin: "0 0 12px" }}>🏦</p>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              margin: "0 0 8px",
              color: "var(--text)",
            }}
          >
            No accounts yet
          </h3>
          <p
            style={{
              fontSize: 13,
              color: "var(--muted)",
              margin: "0 0 20px",
              maxWidth: 360,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Add your bank accounts, cash, wallets, or investments to start
            tracking your net worth.
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: "12px 28px",
              borderRadius: 10,
              border: "none",
              background: "#22C55E",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              minHeight: 44,
            }}
          >
            Add your first account
          </button>
        </div>
      )}

      {/* Account Cards Grid */}
      {accounts.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {accounts.map((acc) => {
            const cfg =
              TYPE_CONFIG[acc.account_type as AccountType] ||
              TYPE_CONFIG["Bank"];
            const isNegative = Number(acc.current_balance) < 0;

            return (
              <div
                key={acc.id}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: 20,
                  position: "relative",
                  transition: "0.15s",
                  cursor: "default",
                }}
                className="acc-card"
              >
                {/* Top row: icon + menu */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: cfg.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    {cfg.icon}
                  </div>

                  {/* 3-dot menu */}
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() =>
                        setMenuOpen(menuOpen === acc.id ? null : acc.id)
                      }
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        color: "var(--muted)",
                        display: "flex",
                        minHeight: 36,
                        minWidth: 36,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 8,
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="5" cy="12" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="19" cy="12" r="1.5" />
                      </svg>
                    </button>

                    {menuOpen === acc.id && (
                      <div
                        style={{
                          position: "absolute",
                          top: 40,
                          right: 0,
                          width: 140,
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 10,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                          overflow: "hidden",
                          zIndex: 20,
                        }}
                      >
                        <button
                          onClick={() => {
                            setConfirmDelete(acc.id);
                            setMenuOpen(null);
                          }}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "10px 12px",
                            border: "none",
                            background: "transparent",
                            color: "#DC2626",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            fill="none"
                            stroke="#DC2626"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Name */}
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text)",
                    margin: "0 0 4px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {acc.account_name}
                </p>

                {/* Type Badge */}
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 10,
                    fontWeight: 700,
                    color: cfg.color,
                    background: cfg.bg,
                    padding: "2px 8px",
                    borderRadius: 6,
                    marginBottom: 14,
                    textTransform: "uppercase",
                    letterSpacing: 0.04,
                  }}
                >
                  {acc.account_type}
                </span>

                {/* Balance */}
                <p
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: "-0.02em",
                    color: isNegative ? "#DC2626" : "var(--text)",
                  }}
                >
                  {fmt(Number(acc.current_balance || 0))}
                </p>

                {/* Delete Confirmation */}
                {confirmDelete === acc.id && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.75)",
                      borderRadius: 14,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      zIndex: 30,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#fff",
                        margin: 0,
                        textAlign: "center",
                        padding: "0 20px",
                      }}
                    >
                      Delete {acc.account_name}?
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleDelete(acc.id)}
                        style={{
                          padding: "8px 18px",
                          borderRadius: 8,
                          border: "none",
                          background: "#DC2626",
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          minHeight: 40,
                        }}
                      >
                        Yes, delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        style={{
                          padding: "8px 18px",
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.2)",
                          background: "transparent",
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          minHeight: 40,
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .acc-card:hover {
          border-color: var(--faint);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }
        input:focus, select:focus {
          border-color: #22C55E !important;
          box-shadow: 0 0 0 2px rgba(34,197,94,0.15);
        }
      `}</style>
    </div>
  );
}