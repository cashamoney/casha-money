import Link from "next/link";

export default function CookiesPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        color: "#0A0A0A",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
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
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 24px 80px" }}>
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
          Cookies Policy
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
              title: "1. What Cookies Are",
              body: "Cookies are small text files stored on your device to help websites function properly, remember preferences, and improve the user experience.",
            },
            {
              title: "2. How We Use Cookies",
              body: "Casha.money uses essential cookies for authentication, session handling, and app performance. We may also use limited analytics cookies to understand product usage and improve reliability.",
            },
            {
              title: "3. Types of Cookies",
              body: "We may use session cookies, persistent cookies, and basic analytics or preference cookies. We aim to keep our use of cookies minimal and privacy-conscious.",
            },
            {
              title: "4. Third-Party Cookies",
              body: "Some services integrated into the platform may set their own cookies, such as analytics, authentication, or infrastructure providers. These are subject to their own privacy practices.",
            },
            {
              title: "5. Managing Cookies",
              body: "You can control or disable cookies through your browser settings. Please note that disabling essential cookies may affect login, security, and app functionality.",
            },
            {
              title: "6. Contact",
              body: "If you have any questions about our use of cookies, contact us at casha.moneyofficial@gmail.com.",
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