export default function TermsPage() {
  return (
    <div style={{ animation: "fadeIn 300ms ease" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", margin: "0 0 8px", letterSpacing: -0.3 }}>Terms of Service</h1>
      <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 32px" }}>Last updated: June 2025</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {[
          { t: "1. Acceptance of Terms", b: "By creating an account or using casha., you agree to be bound by these Terms of Service. If you do not agree, please do not use the service. These terms apply to all users, including free and premium subscribers." },
          { t: "2. Description of Service", b: "casha. is a personal finance tracking application that helps users monitor their net worth, track income and expenses, set budgets, and gain financial insights. The service does not provide financial advice, investment recommendations, or act as a financial institution." },
          { t: "3. Not Financial Advice", b: "casha. provides informational tools and visualizations only. Nothing on this platform constitutes financial, investment, tax, or legal advice. Users should consult qualified professionals before making financial decisions. All insights, projections, and calculations are for informational purposes only." },
          { t: "4. User Accounts", b: "You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information and are responsible for all activity under your account. You must be at least 18 years old to create an account." },
          { t: "5. User Data", b: "You retain full ownership of all financial data you input. You are responsible for the accuracy of your data. casha. is not liable for decisions made based on inaccurate data you provide. You may export or delete your data at any time." },
          { t: "6. Premium Subscription", b: "Premium features are available through a recurring subscription (₹49/month). Subscriptions auto-renew unless cancelled 24 hours before the renewal date. No partial refunds for unused periods. You may cancel anytime from your account settings." },
          { t: "7. Acceptable Use", b: "You agree not to: (a) reverse-engineer or scrape the service, (b) use the service for illegal purposes, (c) attempt to access other users' data, (d) misrepresent your identity, (e) interfere with the service's operation or infrastructure." },
          { t: "8. Intellectual Property", b: "All content, design, code, and branding of casha. are the intellectual property of casha. and its creators. You may not reproduce, distribute, or create derivative works without explicit written permission." },
          { t: "9. Limitation of Liability", b: "casha. is provided 'as is' without warranties of any kind. We are not liable for: (a) inaccuracies in calculations or projections, (b) loss of data, (c) financial decisions made using the service, (d) any indirect, incidental, or consequential damages." },
          { t: "10. Termination", b: "We may suspend or terminate accounts that violate these terms. You may delete your account at any time. Upon termination, your data will be deleted within 30 days. Provisions that by nature should survive termination shall remain in effect." },
          { t: "11. Governing Law", b: "These terms are governed by the laws of India. Any disputes shall be resolved through binding arbitration in accordance with the Arbitration and Conciliation Act, 1996, with proceedings conducted in English." },
          { t: "12. Changes to Terms", b: "We may update these terms periodically. Material changes will be notified via email at least 14 days before taking effect. Continued use after changes take effect constitutes acceptance of the revised terms." },
          { t: "13. Contact", b: "For questions about these terms, contact us at legal@casha.money." },
        ].map(function (s) {
          return (
            <div key={s.t}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: "0 0 8px" }}>{s.t}</h2>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>{s.b}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}