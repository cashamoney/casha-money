"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const COUNTRIES = [
  { code: "IN", name: "India", currency: "INR" },
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "AE", name: "UAE", currency: "AED" },
  { code: "SG", name: "Singapore", currency: "SGD" },
  { code: "AU", name: "Australia", currency: "AUD" },
  { code: "CA", name: "Canada", currency: "CAD" },
  { code: "DE", name: "Germany", currency: "EUR" },
  { code: "NG", name: "Nigeria", currency: "NGN" },
  { code: "KE", name: "Kenya", currency: "KES" },
];

const LEFT_POINTS = [
  "Works with all Indian banks",
  "Tax optimizer built for India",
  "AI budget using 50/30/20",
  "No credit card required",
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const colors = ["#E5E7EB", "#EF4444", "#F59E0B", "#22C55E", "#16A34A"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <div style={{ marginTop: "6px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "3px",
              borderRadius: "999px",
              background: i <= score ? colors[score] : "#E5E7EB",
              transition: "background 0.2s ease",
            }}
          />
        ))}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: "11px",
          fontWeight: 600,
          color: colors[score],
        }}
      >
        {labels[score]}
      </p>
    </div>
  );
}

function SignupLogo({ light = false }: { light?: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "2px",
          lineHeight: 1,
        }}
      >
        <img
          src="/logo.png"
          alt="Casha"
          style={{
            width: "50px",
            height: "50px",
            objectFit: "contain",
            display: "block",
            flexShrink: 0,
            marginRight: "-8px",
          }}
        />
        <span
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: light ? "#FFFFFF" : "#0A0A0A",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          casha<span style={{ color: "#22C55E" }}>.money</span>
        </span>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    country: "IN",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const router = useRouter();
  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selectedCountry =
    COUNTRIES.find((c) => c.code === form.country) || COUNTRIES[0];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          country: form.country,
          currency:
            COUNTRIES.find((c) => c.code === form.country)?.currency || "INR",
        },
      },
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      router.push("/dashboard/overview");
    }

    setLoading(false);
  };

  const inputStyle = (name: string): React.CSSProperties => ({
    width: "100%",
    height: "44px",
    borderRadius: "10px",
    padding: "0 14px",
    fontSize: "14px",
    lineHeight: "44px",
    outline: "none",
    fontFamily: "inherit",
    background: "#FAFAFA",
    border: `1.5px solid ${focused === name ? "#22C55E" : "#E5E7EB"}`,
    color: "#0A0A0A",
    boxSizing: "border-box",
    transition: "border-color 0.15s ease",
  });

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "43% 57%",
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: "hidden",
        background: "#F8FAFC",
      }}
    >
      {/* LEFT PANEL */}
      <div
        style={{
          background: "#0A0A0A",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "34px 40px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            width: "100%",
            maxWidth: "340px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            position: "relative",
          }}
        >
          <a
            href="/"
            style={{
              display: "block",
              textDecoration: "none",
              marginBottom: "24px",
            }}
          >
            <SignupLogo light />
          </a>

          <p
            style={{
              margin: "0 0 10px 0",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              color: "rgba(34,197,94,0.8)",
            }}
          >
            Financial OS for India
          </p>

          <h1
            style={{
              margin: "0 0 14px 0",
              fontSize: "clamp(23px, 2.7vw, 32px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: "1.14",
              color: "#FFFFFF",
            }}
          >
            Your complete
            <br />
            <span style={{ color: "#22C55E" }}>financial picture</span>
            <br />
            in one place.
          </h1>

          <p
            style={{
              margin: "0 auto 20px auto",
              fontSize: "13px",
              lineHeight: "1.58",
              color: "rgba(255,255,255,0.42)",
              maxWidth: "300px",
            }}
          >
            Track spending, save taxes, destroy debt, and get an AI advisor
            that actually knows your numbers.
          </p>

          {/* CENTERED BULLETS */}
          <div
            style={{
              width: "100%",
              maxWidth: "280px",
              margin: "0 auto 22px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {LEFT_POINTS.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "18px 1fr",
                  alignItems: "center",
                  columnGap: "10px",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "999px",
                    background: "rgba(34,197,94,0.14)",
                    border: "1px solid rgba(34,197,94,0.28)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="9"
                    height="9"
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    lineHeight: "1.4",
                    color: "rgba(255,255,255,0.55)",
                    fontWeight: 500,
                    textAlign: "left",
                  }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>

          {/* PERFECTLY CENTERED STATS */}
          <div
            style={{
              width: "100%",
              maxWidth: "300px",
              margin: "0 auto 16px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              textAlign: "center",
            }}
          >
            {[
              { n: "618+", l: "early members" },
              { n: "Rs.42K", l: "avg. tax saved" },
              { n: "Free", l: "forever plan" },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  width: "90px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    margin: "0 0 3px 0",
                    fontSize: "16px",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "#FFFFFF",
                  }}
                >
                  {s.n}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.28)",
                    lineHeight: "1.3",
                    textAlign: "center",
                  }}
                >
                  {s.l}
                </p>
              </div>
            ))}
          </div>

          <p
            style={{
              margin: 0,
              fontSize: "11px",
              color: "rgba(255,255,255,0.16)",
              lineHeight: "1.5",
              maxWidth: "300px",
              alignSelf: "center",
            }}
          >
            Casha is an educational financial management platform. Not
            investment, legal, or tax advice.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          background: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "28px 40px",
          overflow: "hidden",
        }}
      >
        <div style={{ width: "100%", maxWidth: "340px" }}>
          <div style={{ marginBottom: "20px" }}>
            <h2
              style={{
                margin: "0 0 6px 0",
                fontSize: "22px",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#0A0A0A",
              }}
            >
              Create your account
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#71717A",
              }}
            >
              Free forever — no credit card required
            </p>
          </div>

          {error && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "8px",
                padding: "10px 12px",
                marginBottom: "12px",
              }}
            >
              <p style={{ margin: 0, fontSize: "12px", color: "#DC2626" }}>
                {error}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSignup}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Full name
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) =>
                  setForm({ ...form, fullName: e.target.value })
                }
                placeholder="Rahul Mehta"
                style={inputStyle("fullName")}
                onFocus={() => setFocused("fullName")}
                onBlur={() => setFocused("")}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Email address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                placeholder="you@example.com"
                style={inputStyle("email")}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="Minimum 8 characters"
                style={inputStyle("password")}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
              />
              <PasswordStrength password={form.password} />
            </div>

            {/* CLEAN COUNTRY PICKER */}
            <div ref={countryRef}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Country
              </label>

              <button
                type="button"
                onClick={() => setCountryOpen((v) => !v)}
                style={{
                  ...inputStyle("country"),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  textAlign: "left",
                  lineHeight: 1,
                }}
                onFocus={() => setFocused("country")}
                onBlur={() => setFocused("")}
              >
                <span>{selectedCountry.name}</span>
                <span style={{ fontSize: "11px", color: "#A1A1AA" }}>
                  {countryOpen ? "▲" : "▼"}
                </span>
              </button>

              {countryOpen && (
                <div
                  style={{
                    marginTop: "6px",
                    border: "1px solid #E5E7EB",
                    borderRadius: "10px",
                    background: "#FFFFFF",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                    maxHeight: "180px",
                    overflowY: "auto",
                    position: "relative",
                    zIndex: 20,
                  }}
                >
                  {COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, country: c.code });
                        setCountryOpen(false);
                      }}
                      style={{
                        width: "100%",
                        border: "none",
                        background:
                          c.code === form.country ? "#F0FDF4" : "#FFFFFF",
                        padding: "10px 12px",
                        textAlign: "left",
                        fontSize: "13px",
                        color: "#0A0A0A",
                        cursor: "pointer",
                        borderBottom: "1px solid #F4F4F5",
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "10px",
                border: "none",
                background: "#22C55E",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 700,
                cursor: loading ? "wait" : "pointer",
                fontFamily: "inherit",
                opacity: loading ? 0.8 : 1,
                marginTop: "4px",
                boxShadow: "0 4px 12px rgba(34,197,94,0.26)",
              }}
            >
              {loading ? "Creating account..." : "Create free account →"}
            </button>
          </form>

          <p
            style={{
              margin: "12px 0 0 0",
              textAlign: "center",
              fontSize: "12px",
              color: "#71717A",
            }}
          >
            Already have an account?{" "}
            <Link
              href="/auth/login"
              style={{
                color: "#22C55E",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: "12px 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#F0F0F0" }} />
            <span style={{ fontSize: "10px", color: "#C4C4C4" }}>
              secure signup
            </span>
            <div style={{ flex: 1, height: "1px", background: "#F0F0F0" }} />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
            }}
          >
            {["AES-256", "DPDPA", "No spam"].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "#22C55E",
                  }}
                />
                <span
                  style={{
                    fontSize: "10px",
                    color: "#A1A1AA",
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>

          <p
            style={{
              margin: "8px 0 0 0",
              textAlign: "center",
              fontSize: "10px",
              color: "#C4C4C4",
              lineHeight: "1.5",
            }}
          >
            By signing up you agree to our{" "}
            <a
              href="/terms"
              style={{ color: "#A1A1AA", textDecoration: "underline" }}
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              style={{ color: "#A1A1AA", textDecoration: "underline" }}
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        input::placeholder, textarea::placeholder { color: #C4C4C4; }
        ::selection { background: rgba(34,197,94,0.22); color: #0A0A0A; }
        ::-moz-selection { background: rgba(34,197,94,0.22); color: #0A0A0A; }
      `}</style>
    </div>
  );
}