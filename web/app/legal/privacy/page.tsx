export default function PrivacyPage() {
  return (
    <div style={{ animation: "fadeIn 300ms ease" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", margin: "0 0 8px", letterSpacing: -0.3 }}>Privacy Policy</h1>
      <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 32px" }}>Last updated: June 2025</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {[
          { t: "1. Information We Collect", b: "We collect information you provide directly: your email address, financial accounts you add, transactions you log, and budgets you set. We also collect usage data such as pages visited, features used, and device information (browser type, screen size, operating system)." },
          { t: "2. How We Use Your Information", b: "Your data is used solely to provide and improve the casha. service. This includes displaying your financial overview, generating insights, calculating your Money Temperature, and improving the app experience. We never sell your personal data to third parties." },
          { t: "3. Data Storage & Security", b: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use Supabase (hosted on AWS) for data storage, which maintains SOC 2 Type II compliance. We implement industry-standard security measures to protect your information." },
          { t: "4. Data Sharing", b: "We do not share your personal data with third parties except: (a) with your explicit consent, (b) to comply with legal obligations, (c) to protect our rights or safety. Anonymized, aggregated data may be used for benchmarking features only with your opt-in consent." },
          { t: "5. Your Rights", b: "You have the right to access, correct, export, or delete your personal data at any time. You can do this directly within the app or by contacting us. Account deletion permanently removes all associated data within 30 days." },
          { t: "6. Cookies & Local Storage", b: "We use essential cookies for authentication and session management. We store your theme preference in local storage. We do not use tracking cookies, advertising cookies, or third-party analytics that identify you personally." },
          { t: "7. Data Retention", b: "We retain your data for as long as your account is active. Upon account deletion, all personal data is permanently removed within 30 days. Anonymized, aggregate statistics may be retained for service improvement." },
          { t: "8. Children's Privacy", b: "casha. is not intended for individuals under 18 years of age. We do not knowingly collect data from minors. If we discover such data has been collected, it will be deleted immediately." },
          { t: "9. Changes to This Policy", b: "We may update this policy periodically. Material changes will be notified via email or in-app notification at least 14 days before taking effect. Continued use of the service constitutes acceptance of the updated policy." },
          { t: "10. Contact Us", b: "For privacy-related questions or data requests, contact us at privacy@casha.money. We aim to respond to all requests within 7 business days." },
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