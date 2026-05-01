export default function CookiesPage() {
  return (
    <div style={{ animation: "fadeIn 300ms ease" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", margin: "0 0 8px", letterSpacing: -0.3 }}>Cookie Policy</h1>
      <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 32px" }}>Last updated: June 2025</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {[
          { t: "1. What Are Cookies", b: "Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and improve your experience. Local storage works similarly but stores data directly on your device." },
          { t: "2. How We Use Cookies", b: "casha. uses a minimal number of cookies and local storage items. We only use what is essential for the service to function. We do not use advertising cookies, tracking pixels, or third-party analytics cookies." },
          { t: "3. Essential Cookies", b: "We use authentication cookies managed by Supabase to keep you signed in securely. These cookies are required for the service to function and cannot be disabled. They do not track your behavior or share data with third parties." },
          { t: "4. Local Storage", b: "We store your theme preference (light/dark mode) in your browser's local storage. This ensures your preferred appearance is maintained across sessions. This data never leaves your device and is not transmitted to our servers." },
          { t: "5. Third-Party Services", b: "We use Vercel for hosting, which may set essential operational cookies for performance and security. Supabase handles authentication and may set session cookies. Neither service uses cookies to track you across other websites." },
          { t: "6. No Advertising Cookies", b: "casha. does not use advertising cookies, retargeting cookies, or any cookies from advertising networks. We do not participate in cross-site tracking or data brokering of any kind." },
          { t: "7. Managing Cookies", b: "You can control cookies through your browser settings. Most browsers allow you to block or delete cookies. Note that blocking essential cookies may prevent you from signing in or using the service properly." },
          { t: "8. Updates to This Policy", b: "We may update this policy if our cookie practices change. Any material changes will be communicated via email or in-app notification at least 14 days before taking effect." },
          { t: "9. Contact", b: "For questions about our cookie practices, contact us at privacy@casha.money." },
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