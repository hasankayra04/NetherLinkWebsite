import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaShieldAlt, FaArrowLeft } from "react-icons/fa";
import Layout from "@theme/Layout";

const NL = {
  bg: "#0d1117",
  surface: "#131820",
  elevated: "#191f2b",
  border: "rgba(255,255,255,0.06)",
  text: "#eaecf0",
  secondary: "#8d97aa",
  muted: "#4a5270",
  accent: "#67e404",
  accentDim: "rgba(103,228,4,0.10)",
  accentBorder: "rgba(103,228,4,0.22)",
};

const sections = [
  {
    title: "1. Who We Are",
    content: "MCCompanion is developed and operated by MCCORG. If you have any questions about this Privacy Policy or your data, you can reach us at privacy@mccompanion.net or via our Discord community.",
  },
  {
    title: "2. Account Information",
    content: "When you create an account, we collect the following information:",
    list: [
      "Email address: used to identify your account and send important notices",
      "Password: stored securely and encrypted by Firebase Authentication; we never have access to your plain-text password",
      "Username: a unique name you choose (3–20 characters)",
      "Display name: an optional name shown to other users",
      "Profile avatar: an optional profile picture URL you provide",
      "Biography: an optional short text you write about yourself",
    ],
  },
  {
    title: "3. Linked Gaming Accounts",
    content: "If you choose to link gaming accounts, we collect the following. Linking is entirely optional and you can unlink accounts at any time.",
    list: [
      "Xbox / Bedrock: Xbox Gamertag and Xbox User ID (XUID)",
      "Java Edition: Minecraft Java username and UUID",
    ],
  },
  {
    title: "4. Social & Activity Data",
    content: "To provide social features, we collect and store:",
    list: [
      "Friends list: the users you have added, accepted, blocked, or been blocked by",
      "Online presence: your last seen timestamp and, when actively playing, the server IP and port you are connected to (only visible to accepted friends, unless you enable Appear Offline)",
      "Direct messages: the full content of messages sent between you and your friends",
    ],
  },
  {
    title: "5. Device & Notification Data",
    content: "When you enable push notifications, we store a Firebase Cloud Messaging (FCM) token linked to your account. This token is a device identifier used solely to deliver push notifications (new messages, friend requests, friends coming online) to your device. It is removed when you delete your account or uninstall the app.",
  },
  {
    title: "6. Connection & Usage Data",
    content: "When you use the relay feature to connect to a Minecraft server, we log the following data for service analytics:",
    list: [
      "Your public IP address: temporarily stored in a Redis cache for up to 15 minutes to route your connection, and in our connection log database for up to 90 days",
      "Destination server IP address and port",
      "Connection timestamp and duration",
      "Total connection counts per server (aggregated)",
    ],
    footer: "Connection log data is automatically and permanently deleted after 90 days. It is used to monitor service reliability, detect abuse, and generate the aggregated public server metrics. Your IP address is not linked to your user account.",
  },
  {
    title: "7. Public Server Metrics",
    content: "MCCompanion publishes a publicly accessible metrics page that shows the top 30 most-connected Minecraft servers. This page displays:",
    list: [
      "Server IP addresses or hostnames",
      "Aggregated total connection counts per server",
    ],
    footer: "This data is derived from relay usage and is visible to anyone without an account. It does not include any personal user information. If you are a server operator and wish to have your server's data removed from the public metrics, please contact us at privacy@mccompanion.net.",
  },
  {
    title: "8. Resource Packs",
    content: "MCCompanion handles resource pack data in several ways depending on the feature used:",
    list: [
      "Relay caching: packs downloaded automatically from servers you connect to are stored in Cloudflare R2. We store the pack file, UUID, version, file size, and a SHA-256 hash for deduplication. These packs are not publicly listed or browsable.",
      "User-uploaded packs: if you upload a resource pack, the file is stored in Cloudflare R2 under a hash-based path and is accessible to anyone with the direct URL. You can delete your uploaded pack at any time from within the App.",
      "Pack editor: the in-app RP editor processes packs locally on your device. No pack content is sent to our servers unless you explicitly upload the result.",
      "Community browser: pack listings include the pack name, author, download URL, and description as submitted. We do not collect personal data in connection with browsing packs.",
    ],
    footer: "Cached relay packs are retained indefinitely. User-uploaded packs are retained until you delete them in-app.",
  },
  {
    title: "9. Cloud Skins",
    content: "When you use the Skin Workshop to upload and publish a skin, we store the following data:",
    list: [
      "The skin texture file (stored in Cloudflare R2 cloud storage)",
      "Skin name as you entered it",
      "Your user ID and username, stored as the creator of the skin",
      "A public URL pointing to the texture file",
      "Like count: the number of users who have liked your skin (individual liker identities are stored to prevent duplicate likes but are not publicly visible)",
      "Upload timestamp",
    ],
    footer: "Published skins are publicly visible on your profile and in the skin gallery. Anyone can view and download the texture via the public URL. You can delete your skins at any time from within the App/Website, which permanently removes the texture file and all associated metadata.",
  },
  {
    title: "9. Feedback & Contact Data",
    content: "If you submit feedback (bug reports or feature requests) through the App and provide your email address:",
    list: [
      "The content of your feedback (title, description, platform, and app version) is posted as a public issue on our GitHub repository (github.com/MCCORG/MCCompanion). This content is publicly visible.",
      "Your email address is stored privately in our database and is never posted to GitHub or shared publicly.",
      "We may use your email address to send you a confirmation and to reply to your feedback.",
    ],
    footer: "If you submitted feedback and wish to have your email address removed from our records, contact us at privacy@mccompanion.net.",
  },
  {
    title: "10. Report Data",
    content: "If you submit a report about another user, we store the reporter's user ID, the reported user's ID, the reason, any optional context you provided, and the date of the report. This information is retained to protect the integrity of our community.",
  },
  {
    title: "11. How We Use Your Information",
    content: "We use your information exclusively to:",
    list: [
      "Provide and operate the App: account management, relay connections, skin workshop, resource packs, wiki, player lookup",
      "Enable social features: friend requests, direct messaging, online presence, push notifications",
      "Ensure security: detecting abuse, rate-limit violations, and enforcing our Terms of Service",
      "Improve the App: aggregated, anonymised analytics on relay usage and popular servers",
      "Respond to reports: moderating content and enforcing community rules",
      "Communicate with you: feedback confirmations, admin replies, and important service notices",
    ],
    footer: "We do not use your data for advertising purposes, and we do not sell your data to third parties.",
  },
  {
    title: "12. Information Visible to Other Users",
    content: "The following information is visible to other users within the App:",
    list: [
      "Your username, display name, and avatar",
      "Your online status and, if applicable, the Minecraft server you are currently connected to: visible only to accepted friends unless Appear Offline is enabled",
      "Your linked Gamertag and Java username (shown on your public profile)",
    ],
  },
  {
    title: "13. Third-Party Service Providers",
    content: "We use the following third-party services that may process your data. These providers act as data processors and are bound by their own privacy policies.",
    list: [
      "Google Firebase: authentication and push notifications (firebase.google.com/support/privacy)",
      "Microsoft / Xbox: Bedrock account linking via device code flow (privacy.microsoft.com)",
      "Mojang / Microsoft: Java account linking and player lookup (privacy.microsoft.com)",
      "RevenueCat: in-app subscription management and receipt validation (revenuecat.com/privacy). Payment card data is managed by RevenueCat and your device's app store; we never receive or store your card details.",
      "Cloudflare: cloud storage (R2) for resource packs and CDN delivery (cloudflare.com/privacypolicy)",
      "Zoho Mail: transactional email delivery for feedback confirmations and support replies (zoho.com/privacy)",
      "GitHub: public issue tracker for user-submitted feedback (docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement)",
    ],
    footer: "We do not share your personal data with any other third parties.",
  },
  {
    title: "14. Data Retention",
    content: "We retain your data for the following periods:",
    list: [
      "Account and profile data: until you delete your account",
      "Direct messages: until you delete your account",
      "Linked gaming accounts: until you unlink them or delete your account",
      "Friends and social data: until you delete your account",
      "FCM device tokens: until the app is uninstalled or you delete your account",
      "IP addresses in route cache (Redis): automatically deleted after 15 minutes",
      "Connection logs: automatically deleted after 90 days",
      "Feedback contact emails: retained until you request removal at privacy@mccompanion.net",
      "Resource pack files in cloud storage: retained indefinitely for relay delivery; user-uploaded packs can be deleted in-app at any time",
      "Cloud skin files and metadata: retained until you delete the skin from within the App/Website",
      "Skin like records: retained until you delete your account",
      "Abuse and report records: retained indefinitely for moderation integrity",
    ],
  },
  {
    title: "15. Account Deletion",
    content: "You can permanently delete your account at any time from within the App (Profile → Settings → Delete Account). Upon deletion, the following data is permanently and irreversibly removed:",
    list: [
      "Your account and profile data",
      "All your direct messages (sent and received)",
      "All your friend connections and requests",
      "All your linked gaming accounts",
      "All your FCM device tokens",
      "All your tracked servers and active sessions",
      "All your uploaded cloud skins and their texture files",
      "All your skin like records",
    ],
    footer: "User-uploaded resource packs are not automatically deleted on account deletion, delete them manually in-app before deleting your account if desired. Abuse and moderation reports may be retained. Connection logs expire after 90 days as normal.",
  },
  {
    title: "16. Your Rights",
    content: "Depending on your location, you may have the following rights regarding your personal data:",
    list: [
      "Access: request a copy of the data we hold about you",
      "Correction: update inaccurate data via in-app profile settings",
      "Deletion: permanently delete your account and all associated data",
      "Portability: request your data in a portable format",
      "Objection: object to certain uses of your data",
      "Erasure of feedback email: contact us to remove your email from our feedback records",
    ],
    footer: "EU/EEA users (GDPR): We process your data based on contractual necessity (to provide the services you signed up for), legitimate interests (security and analytics), and your consent (for optional features such as push notifications). To exercise any of your rights, contact us at privacy@mccompanion.net.",
  },
  {
    title: "17. Push Notifications",
    content: "The App may send you push notifications for new direct messages, incoming friend requests, accepted friend requests, and friends coming online. You can disable push notifications at any time in your device's system settings without affecting your ability to use the App.",
  },
  {
    title: "18. Children's Privacy & Parental Consent",
    content: "MCCompanion can be used by players of all ages. For children under 13 (or under 16 in the EU/EEA), the following rules apply:",
    list: [
      "A parent or legal guardian must create the account on the child's behalf.",
      "By creating an account for a child, the parent or guardian confirms they have read this Privacy Policy and consents to the collection and use of data as described herein.",
      "Parents and guardians are responsible for supervising their child's use of the App and any content shared through it.",
      "Parents can view, update, or delete their child's account at any time from within the App or by contacting us at privacy@mccompanion.net.",
    ],
    footer: "If we become aware that an account belonging to a child under 13 was created without verifiable parental consent, we will suspend the account and promptly delete all associated data. If you believe this has occurred, please contact us at privacy@mccompanion.net.",
  },
  {
    title: "19. Security",
    content: "We take appropriate technical and organisational measures to protect your data, including:",
    list: [
      "Encrypted authentication tokens via Firebase Auth",
      "HTTPS/TLS for all API communication",
      "Token-based authentication for WebSocket connections",
      "Rate limiting and automatic IP-based abuse detection",
      "Encrypted at-rest storage via Cloudflare R2 for resource pack files",
    ],
    footer: "No method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security. In the event of a data breach that affects your personal data, we will notify you as required by applicable law.",
  },
  {
    title: "20. Changes to This Policy",
    content: "We may update this Privacy Policy from time to time. If we make material changes, we will notify you via an in-app notice or push notification. The 'Last updated' date at the top of this document reflects the most recent version. Continued use of the App after changes constitutes acceptance of the updated policy.",
  },
];

function Section({ section, index }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.03, duration: 0.38 }}
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

export default function Privacy() {
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
              <FaShieldAlt size={20} />
            </div>
            <h1 style={{
              fontSize: 28, fontWeight: 700, color: NL.text,
              letterSpacing: "-0.025em", margin: "0 0 10px",
            }}>Privacy Policy</h1>
            <p style={{ fontSize: 14, color: NL.secondary, lineHeight: 1.6, margin: 0, maxWidth: 480, marginInline: "auto" }}>
              At <span style={{ color: NL.text, fontWeight: 500 }}>MCCompanion</span>, we are committed to protecting your privacy.
              This policy explains what data we collect, why we collect it, and how we protect it.
            </p>
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
            {sections.map((section, i) => (
              <Section key={i} section={section} index={i} />
            ))}
          </div>

          <p style={{ fontSize: 11, color: NL.muted, textAlign: "right", marginBottom: 32 }}>
            Last updated: June 29, 2026
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
              onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.borderColor = "rgba(255,255,255,0.11)"; }}
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
