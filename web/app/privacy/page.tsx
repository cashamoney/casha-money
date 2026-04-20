import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#0A0A0A",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #E5E7EB",
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", lineHeight: 1 }}>
            <img
              src="/logo.png"
              alt="Casha"
              style={{
                width: "40px",
                height: "40px",
                objectFit: "contain",
                display: "block",
                marginRight: "-6px",
              }}
            />
            <span
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "#0A0A0A",
                letterSpacing: "-0.03em",
              }}
            >
              casha<span style={{ color: "#22C55E" }}>.money</span>
            </span>
          </div>
        </Link>

        <Link
          href="/auth/signup"
          style={{
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 700,
            color: "#22C55E",
          }}
        >
          Create account
        </Link>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "48px 24px 80px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: "#22C55E",
            margin: "0 0 12px 0",
          }}
        >
          Legal
        </p>

        <h1
          style={{
            fontSize: "clamp(30px, 4vw, 46px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: "1.08",
            margin: "0 0 12px 0",
            color: "#0A0A0A",
          }}
        >
          Privacy Policy
        </h1>

        <p
          style={{
            fontSize: "14px",
            color: "#71717A",
            margin: "0 0 36px 0",
          }}
        >
          Last updated: 20 April 2026
        </p>

        <div style={{ display: "grid", gap: "28px" }}>
          {[
            {
              title: "1. What We Collect",
              body: "We collect the information you provide directly, such as your name, email address, account settings, financial entries, goals, debt details, budgets, and messages sent to the AI advisor.",
            },
            {
              title: "2. Why We Collect It",
              body: "We use your information to operate the platform, generate financial insights, improve your dashboard, provide AI responses, detect subscriptions, calculate budgets, and deliver relevant educational content.",
            },
            {
              title: "3. Bank and Financial Data",
              body: "Casha.money does not require your internet banking password or OTP. Financial data is entered manually by you or through pasted bank SMS messages. You remain in control of what data is provided.",
            },
            {
              title: "4. Data Protection",
              body: "We use industry-standard safeguards including encryption, access controls, and row-level protection to keep your data secure. However, no system is absolutely risk-free, and you use the service at your own discretion.",
            },
            {
              title: "5. Data Sharing",
              body: "We do not sell your personal financial data. We may use anonymized, aggregated insights to improve product performance and user experience, but these cannot identify you personally.",
            },
            {
              title: "6. AI Processing",
              body: "When you use the AI advisor, selected account and financial context may be processed to generate useful responses. AI outputs may be incomplete or inaccurate and should not be treated as professional advice.",
            },
            {
              title: "7. Cookies and Analytics",
              body: "We may use essential cookies and basic analytics tools to improve reliability, measure performance, and understand usage patterns. We aim to keep tracking minimal and privacy-conscious.",
            },
            {
              title: "8. Your Rights",
              body: "You may request access, correction, export, or deletion of your account data. You may also stop using the service at any time. Where required by law, we will honor your privacy rights in accordance with applicable regulations.",
            },
            {
              title: "9. Data Retention",
              body: "We retain your data only as long as necessary to provide the service or comply with legal obligations. If you delete your account, we will delete or anonymize your data within a reasonable period unless retention is legally required.",
            },
            {
              title: "10. Children’s Privacy",
              body: "Casha.money is not intended for children under the age required by local law to consent to digital services. If we learn that personal data of a child was submitted without appropriate consent, we will remove it.",
            },
            {
              title: "11. Contact",
              body: "For privacy-related questions, requests, or concerns, contact us at casha.moneyofficial@gmail.com.",
            },
          ].map((section, i) => (
            <section key={i}>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#0A0A0A",
                  margin: "0 0 10px 0",
                  letterSpacing: "-0.02em",
                }}
              >
                {section.title}
              </h2>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: "1.75",
                  color: "#4B5563",
                  margin: 0,
                }}
              >
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}