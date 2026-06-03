import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaGavel, FaArrowLeft } from "react-icons/fa";
import Layout from "@theme/Layout";

const NL = {
  bg: "#111318",
  surface: "#191c23",
  elevated: "#1f232c",
  border: "rgba(255,255,255,0.07)",
  text: "#e8e9ec",
  secondary: "#9299a6",
  muted: "#5a6070",
  accent: "#67e404",
  accentDim: "rgba(103,228,4,0.10)",
  accentBorder: "rgba(103,228,4,0.22)",
};

const sections = [
  {
    title: "1. Eligibility & Age Requirements",
    content: "MCCompanion is designed to be enjoyed by players of all ages. The following rules apply based on age:",
    list: [
      "13 and older: you may create your own account and use all features of the App.",
      "Under 13 (or under 16 in the EU/EEA): you may use the App only if a parent or legal guardian creates an account on your behalf, actively supervises your use, and agrees to these Terms.",
      "Parents and guardians: by creating an account for your child, you take full responsibility for their use of the App, their content, and their compliance with these Terms.",
    ],
    footer: "If we become aware that an account was created by a child under 13 without parental consent, we will suspend the account and delete the associated data. Parents can contact us at support@mccompanion.net to manage or remove their child's account.",
  },
  {
    title: "2. Your Account",
    content: "To access certain features, you must create an account. You (or your parent/guardian) are responsible for:",
    list: [
      "Keeping your credentials secure and not sharing them with others",
      "All activity that occurs under your account",
      "Choosing a username that is between 3–20 characters, contains only letters, numbers, and underscores, and does not impersonate another person or brand",
      "Notifying us immediately at support@mccompanion.net if you suspect unauthorised access to your account",
    ],
    footer: "Each person may maintain only one account. Creating multiple accounts to circumvent a ban or other restriction is prohibited.",
  },
  {
    title: "3. Acceptable Use",
    content: "You agree NOT to:",
    list: [
      "Use the App for any unlawful purpose or in violation of any applicable laws",
      "Harass, threaten, intimidate, or abuse other users",
      "Send spam, unsolicited messages, or promotional content to other users",
      "Distribute malware, viruses, or other malicious code through the App",
      "Attempt to gain unauthorised access to our servers, databases, or other users' accounts",
      "Reverse-engineer, decompile, or disassemble any part of the App",
      "Use automated tools, bots, or scripts to interact with the App or its services",
      "Abuse or attempt to circumvent rate limits or other technical safeguards",
      "Impersonate any person, entity, or MCCompanion staff member",
      "Use the App to facilitate cheating, griefing, or other disruptive behaviour in Minecraft or on third-party servers",
    ],
  },
  {
    title: "4. Console Connect (Relay Service)",
    content: "The Console Connect relay feature is provided to help you connect your console to Minecraft servers. You may not use it to:",
    list: [
      "Connect to servers in violation of those servers' own rules or terms",
      "Conduct denial-of-service attacks or other harmful network activity",
      "Circumvent server-side bans or IP restrictions with malicious intent",
    ],
    footer: "We do not endorse, verify, or control the content or rules of third-party Minecraft servers. Server owners are solely responsible for their server's content and compliance with applicable laws.",
  },
  {
    title: "5. User-Generated Content",
    content: "You are solely responsible for any content you submit through the App, including direct messages, profile information, usernames, and linked gaming accounts. Content must not:",
    list: [
      "Be illegal, defamatory, or fraudulent",
      "Contain hate speech or discrimination based on race, ethnicity, religion, gender, sexual orientation, disability, or nationality",
      "Be sexually explicit or contain graphic violence",
      "Violate the intellectual property rights of any third party",
    ],
    footer: "We reserve the right to remove content and suspend or terminate accounts that violate these Terms, at our sole discretion, without prior notice.",
  },
  {
    title: "6. Reporting & Moderation",
    content: "If you encounter content or behaviour that violates these Terms, you can report it using the in-app reporting feature. We review all reports and may take action including warnings, content removal, temporary suspension, or permanent bans. All moderation decisions are final. You may appeal a decision by contacting support@mccompanion.net.",
  },
  {
    title: "7. Account Suspension & Termination",
    content: "We may suspend or terminate your account at any time, with or without notice, if we believe you have violated these Terms or if your account poses a risk to other users or our services. In serious cases (e.g., illegal activity), we may report the matter to relevant authorities. You may delete your account at any time from within the App (Profile → Settings → Delete Account). Deletion is permanent and irreversible.",
  },
  {
    title: "8. Server Listings & Featured Servers",
    content: "The featured servers list is provided as a community resource. We do not endorse, verify, or control the content of third-party Minecraft servers. We reserve the right to remove servers from our featured list at any time without notice.",
  },
  {
    title: "9. Featured Server Slots (Paid Service)",
    content: "MCCompanion offers the option to feature your server in the App for a monthly fee. The following conditions apply:",
    list: [
      "Payment is collected securely via Stripe on a recurring monthly basis.",
      "You may cancel your slot at any time by notifying us on Discord or by email. Your slot will remain active until the end of your paid billing period.",
      "If your payment cannot be processed, the slot will remain active until the end of your current billing month, after which your featured server will be removed.",
      "Refunds: We offer a satisfaction guarantee. If you are not satisfied, you may request a full refund for your current month, no questions asked.",
      "All agreements and custom arrangements are discussed personally via Discord (jens.co) or email (see contact page).",
      "Pricing Changes: MCCompanion reserves the right to change the price for Featured Server Slots. Price changes will be announced in advance, and new pricing will apply from your next billing period.",
    ],
  },
  {
    title: "10. Server Metrics and Monitoring",
    content: "MCCompanion collects aggregate server-level metrics to improve service quality and reliability. These metrics do not contain personal user data.",
    list: [
      "What we collect: server address (IP/hostname), server port, connection timestamps, and aggregated counts.",
      "Purpose: service monitoring, troubleshooting, improving featured server lists, and general usage analytics.",
      "No personal data: metrics are not tied to individual users or devices.",
      "Storage and retention: metrics are stored on our backend and automatically deleted after 90 days.",
      "Contact for concerns: if you own a server and require removal or redaction of metrics, contact us and we will review your request.",
    ],
  },
  {
    title: "11. Intellectual Property",
    content: "All content, design, code, logos, and trademarks in the App are the property of Netherdev unless otherwise stated. You may not reproduce, distribute, or create derivative works from any part of the App without our prior written consent. MCCompanion is an independent project and is not affiliated with, endorsed by, or sponsored by Mojang Studios or Microsoft Corporation. \"Minecraft\" is a trademark of Microsoft Corporation.",
  },
  {
    title: "12. Third-Party Services",
    content: "The App integrates with third-party services including Google Firebase, Microsoft/Xbox, and Mojang. Your use of those services is subject to their own terms and privacy policies. We are not responsible for the content, practices, or policies of any third-party services or Minecraft servers you connect to through the App.",
  },
  {
    title: "13. Disclaimer of Warranties",
    content: "The App is provided \"as is\" and \"as available\" without warranties of any kind. We do not guarantee:",
    list: [
      "Uninterrupted or error-free operation",
      "Compatibility with all network configurations",
      "Connection stability to third-party servers",
      "Availability of featured servers or any specific feature",
    ],
    footer: "Your use of the App is at your sole risk.",
  },
  {
    title: "14. Limitation of Liability",
    content: "To the fullest extent permitted by applicable law, Netherdev shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:",
    list: [
      "Loss of data or messages",
      "Service interruptions or downtime",
      "Unauthorised access to your account or data",
      "Damages arising from interaction with third-party servers or services",
    ],
    footer: "Our total liability to you for any claim arising out of or related to these Terms or the App shall not exceed the amount you have paid us in the past twelve (12) months.",
  },
  {
    title: "15. Governing Law",
    content: "These Terms are governed by and construed in accordance with the laws of Belgium, without regard to conflict of law principles. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Belgium.",
  },
  {
    title: "16. Changes to These Terms",
    content: "We may update these Terms from time to time. If we make material changes, we will notify you via an in-app notice. The 'Last updated' date at the top of this document reflects the most recent version. Continued use of the App after changes constitutes your acceptance of the updated Terms.",
  },
  {
    title: "17. Contact",
    content: "For questions, concerns, or support regarding MCCompanion, please contact us:",
    list: [
      "Email: support@mccompanion.net",
      "Privacy inquiries: privacy@mccompanion.net",
      "Discord: discord.gg/xvaNzE35Rs",
      "Website: mccompanion.net",
    ],
  },
];

function Section({ section, index }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.025, duration: 0.38 }}
    >
      <h2 style={{
        fontSize: 13, fontWeight: 600, color: NL.text,
        margin: "0 0 10px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{
          width: 3, height: 16, borderRadius: 2,
          background: NL.accent, flexShrink: 0,
          display: "inline-block",
        }} />
        {section.title}
      </h2>
      <div style={{
        background: NL.elevated, border: `1px solid ${NL.border}`,
        borderRadius: 12, padding: "16px 18px",
      }}>
        <p style={{ color: NL.secondary, fontSize: 13, lineHeight: 1.7, margin: 0 }}>{section.content}</p>
        {section.list && (
          <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {section.list.map((item, j) => (
              <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, color: NL.secondary, fontSize: 13, lineHeight: 1.6 }}>
                <span style={{
                  marginTop: 5, width: 5, height: 5, borderRadius: "50%",
                  background: NL.accent, opacity: 0.6, flexShrink: 0,
                }} />
                {item}
              </li>
            ))}
          </ul>
        )}
        {section.footer && (
          <p style={{ color: NL.secondary, fontSize: 13, lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>{section.footer}</p>
        )}
      </div>
    </motion.section>
  );
}

export default function Terms() {
  return (
    <Layout>
      <div style={{
        minHeight: "100vh", background: NL.bg,
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "64px 16px",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          <motion.div
            style={{ textAlign: "center", marginBottom: 44 }}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 52, height: 52, borderRadius: 14,
              background: NL.surface, border: `1px solid ${NL.border}`,
              marginBottom: 16, color: NL.accent,
            }}>
              <FaGavel size={20} />
            </div>
            <h1 style={{
              fontSize: 28, fontWeight: 700, color: NL.text,
              letterSpacing: "-0.025em", margin: "0 0 10px",
            }}>Terms of Service</h1>
            <p style={{ fontSize: 14, color: NL.secondary, lineHeight: 1.6, margin: 0, maxWidth: 480, marginInline: "auto" }}>
              By accessing or using <span style={{ color: NL.text, fontWeight: 500 }}>MCCompanion</span>, you agree to these terms.
              Please read them carefully before using the App.
            </p>
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
            {sections.map((section, i) => (
              <Section key={i} section={section} index={i} />
            ))}
          </div>

          <p style={{ fontSize: 11, color: NL.muted, textAlign: "right", marginBottom: 32 }}>
            Last updated: May 24, 2026
          </p>

          <div style={{ textAlign: "center" }}>
            <Link
              to="/"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 20px",
                background: NL.elevated, border: `1px solid ${NL.border}`,
                borderRadius: 10, color: NL.secondary,
                fontSize: 13, fontWeight: 500, textDecoration: "none",
                transition: "color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.borderColor = NL.border; }}
            >
              <FaArrowLeft size={12} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
