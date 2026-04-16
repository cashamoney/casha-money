"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      router.push("/dashboard/overview");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%",
    height: "44px",
    borderRadius: "12px",
    padding: "0 16px",
    fontSize: "14px",
    border: "1px solid #E5E7EB",
    background: "#F9FAFB",
    color: "#0C0D10",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      background: "#FAFAFA",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        background: "#FFFFFF",
        borderRadius: "16px",
        padding: "32px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        {/* Logo */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "24px",
        }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #22C55E, #3B82F6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "14px",
          }}>C</div>
          <span style={{ fontSize: "18px", fontWeight: "bold", color: "#0C0D10" }}>
            Casha<span style={{ color: "#3B82F6" }}>.money</span>
          </span>
        </div>

        <h1 style={{
          fontSize: "20px",
          fontWeight: "bold",
          textAlign: "center",
          color: "#0C0D10",
          margin: "0 0 4px 0",
        }}>Welcome back</h1>

        <p style={{
          fontSize: "13px",
          textAlign: "center",
          color: "#6B7280",
          margin: "0 0 24px 0",
        }}>Sign in to your financial dashboard</p>

        {error && (
          <div style={{
            marginBottom: "16px",
            padding: "12px",
            borderRadius: "12px",
            fontSize: "13px",
            background: "#FEF2F2",
            color: "#DC2626",
            border: "1px solid #FECACA",
          }}>{error}</div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: "46px",
              borderRadius: "12px",
              border: "none",
              background: "#0C0D10",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{
          textAlign: "center",
          fontSize: "13px",
          color: "#6B7280",
          marginTop: "20px",
        }}>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" style={{ color: "#3B82F6", fontWeight: "600", textDecoration: "none" }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}