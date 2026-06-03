import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaEnvelope, FaMapMarkerAlt, FaDiscord, FaArrowLeft, FaBuilding, FaIdCard } from "react-icons/fa";
import Layout from "@theme/Layout";

const NL = {
  bg: "#111318",
  surface: "#191c23",
  elevated: "#1f232c",
  subtle: "#252931",
  border: "rgba(255,255,255,0.07)",
  borderMid: "rgba(255,255,255,0.12)",
  text: "#e8e9ec",
  secondary: "#9299a6",
  muted: "#5a6070",
  accent: "#67e404",
  accentDim: "rgba(103,228,4,0.10)",
  accentBorder: "rgba(103,228,4,0.22)",
};

const contactDetails = [
  { icon: <FaBuilding />, label: "Company Name", value: "Jens-Co" },
  { icon: <FaMapMarkerAlt />, label: "Address", value: <>Statiestraat 26<br />1570 Tollembeek<br />Belgium</> },
  {
    icon: <FaEnvelope />, label: "Email",
    value: (
      <a href="mailto:jens@mccompanion.net" style={{ color: NL.accent, textDecoration: "none" }}
        onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
        onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
        jens@mccompanion.net
      </a>
    ),
  },
  {
    icon: <FaDiscord />, label: "Discord",
    value: (
      <a href="https://discord.gg/xvaNzE35Rs" target="_blank" rel="noopener noreferrer"
        style={{ color: NL.accent, textDecoration: "none" }}
        onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
        onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
        Join our community
      </a>
    ),
  },
  {
    icon: <FaIdCard />, label: "KBO Number",
    value: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: NL.secondary }}>1025.363.838</span>,
  },
];

const quickContacts = [
  { icon: <FaEnvelope />, label: "Email Support", value: "jens@mccompanion.net", href: "mailto:jens@mccompanion.net" },
  { icon: <FaDiscord />, label: "Community Discord", value: "discord.gg/xvaNzE35Rs", href: "https://discord.gg/xvaNzE35Rs", external: true },
];

export default function Contact() {
  return (
    <Layout>
      <div style={{
        minHeight: "100vh", background: NL.bg,
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "64px 16px",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          <motion.div
            style={{ textAlign: "center", marginBottom: 40 }}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 52, height: 52, borderRadius: 14,
              background: NL.surface, border: `1px solid ${NL.border}`,
              marginBottom: 16, color: NL.accent,
            }}>
              <FaEnvelope size={20} />
            </div>
            <h1 style={{
              fontSize: 28, fontWeight: 700, color: NL.text,
              letterSpacing: "-0.025em", margin: "0 0 8px",
            }}>Contact</h1>
            <p style={{ fontSize: 14, color: NL.secondary, lineHeight: 1.6, margin: 0 }}>
              Need help or want to get in touch with{" "}
              <span style={{ color: NL.text, fontWeight: 500 }}>MCCompanion</span>?
              We're happy to assist with support, business inquiries, or feedback.
            </p>
          </motion.div>

          <motion.div
            style={{
              background: NL.surface, border: `1px solid ${NL.border}`,
              borderRadius: 18, overflow: "hidden", marginBottom: 16,
            }}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <div style={{ height: 2, background: `linear-gradient(90deg, ${NL.accent}55 0%, transparent 100%)` }} />
            <div style={{ padding: "22px 24px" }}>
              <h2 style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase", color: NL.muted,
                fontFamily: "'JetBrains Mono', monospace",
                margin: "0 0 18px", paddingLeft: 0,
              }}>Company details</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {contactDetails.map(({ icon, label, value }) => (
                  <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{
                      width: 36, height: 36, flexShrink: 0,
                      background: NL.elevated, border: `1px solid ${NL.border}`,
                      borderRadius: 8,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: NL.accent, fontSize: 14,
                    }}>
                      {icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: NL.muted, marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 14, color: NL.text, lineHeight: 1.5 }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            style={{
              background: NL.surface, border: `1px solid ${NL.border}`,
              borderRadius: 18, overflow: "hidden", marginBottom: 32,
            }}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14 }}
          >
            <div style={{ padding: "22px 24px" }}>
              <h2 style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase", color: NL.muted,
                fontFamily: "'JetBrains Mono', monospace",
                margin: "0 0 10px",
              }}>Support & quick contact</h2>
              <p style={{ fontSize: 13, color: NL.secondary, lineHeight: 1.6, marginBottom: 16 }}>
                The quickest way to get help is via our Discord community.
                For business or privacy matters, please email us directly.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {quickContacts.map(({ icon, label, value, href, external }) => (
                  <a
                    key={label}
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px",
                      background: NL.elevated, border: `1px solid ${NL.border}`,
                      borderRadius: 10, textDecoration: "none",
                      transition: "border-color 0.2s, background 0.2s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = NL.accentBorder;
                      e.currentTarget.style.background = NL.accentDim;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = NL.border;
                      e.currentTarget.style.background = NL.elevated;
                    }}
                  >
                    <span style={{ color: NL.accent, fontSize: 15 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 11, color: NL.muted, marginBottom: 1 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: NL.text }}>{value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

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
              onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.borderColor = NL.borderMid; }}
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