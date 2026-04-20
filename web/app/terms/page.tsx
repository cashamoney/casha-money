import Link from "next/link";

export default function TermsPage() {
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
          Terms & Conditions
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
              title: "1. Acceptance of Terms",
              body: "By accessing or using Casha.money, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the platform.",
            },
            {
              title: "2. Nature of Service",
              body: "Casha.money is a financial education and money-management platform. We provide tools, insights, calculators, and AI-generated educational guidance. We are not a SEBI-registered investment adviser, broker, lender, insurer, Chartered Accountant, or law firm.",
            },
            {
              title: "3. No Financial, Tax, or Legal Advice",
              body: "All content, reports, projections, AI outputs, and insights are for informational and educational purposes only. They should not be considered financial, investment, legal, or tax advice. You should consult qualified professionals before making important decisions.",
            },
            {
              title: "4. User Responsibility",
              body: "You are responsible for the accuracy of information you enter into the platform, including transactions, debts, goals, account balances, and tax-related data. Incorrect input may lead to inaccurate outputs.",
            },
            {
              title: "5. Account Security",
              body: "You are responsible for maintaining the confidentiality of your login credentials. You agree to notify us immediately of any unauthorized access or suspicious activity on your account.",
            },
            {
              title: "6. Data Usage",
              body: "We process your data in accordance with our Privacy Policy. We do not sell your personal financial data to third parties. Some anonymized and aggregated usage insights may be used to improve the product.",
            },
            {
              title: "7. AI Limitations",
              body: "Our AI features may sometimes be incomplete, outdated, or incorrect. AI-generated outputs should always be reviewed carefully before relying on them for any financial action.",
            },
            {
              title: "8. Availability",
              body: "We strive to keep Casha.money available at all times, but we do not guarantee uninterrupted access. Features may be added, changed, removed, or temporarily unavailable without prior notice.",
            },
            {
              title: "9. Payments and Subscriptions",
              body: "Some features may be offered under paid plans. If you subscribe to a paid plan, billing terms, cancellation policies, and refund rules will be shown clearly before payment.",
            },
            {
              title: "10. Limitation of Liability",
              body: "To the maximum extent allowed by law, Casha.money and its operators shall not be liable for any direct, indirect, incidental, or consequential losses arising from your use of the platform or reliance on any insight, recommendation, or AI response.",
            },
            {
              title: "11. Termination",
              body: "We may suspend or terminate access to the platform if we detect abuse, fraud, unlawful use, or security threats. You may stop using the service at any time.",
            },
            {
              title: "12. Contact",
              body: "If you have questions about these Terms, contact us at casha.moneyofficial@gmail.com.",
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