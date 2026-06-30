import Link from "@docusaurus/Link";
import { FaDiscord, FaGithub } from "react-icons/fa";

const NL = {
  surface: "#131820",
  elevated: "#191f2b",
  border: "rgba(255,255,255,0.06)",
  borderMid: "rgba(255,255,255,0.11)",
  text: "#eaecf0",
  secondary: "#8d97aa",
  muted: "#4a5270",
  accent: "#67e404",
};

const footerLinks = [
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/contact", label: "Contact" },
];

const socialLinks = [
  { href: "https://discord.gg/xvaNzE35Rs", label: "Discord", icon: <FaDiscord size={15} />, color: "#7289da" },
  { href: "https://github.com/MCCORG/", label: "GitHub", icon: <FaGithub size={15} />, color: NL.secondary },
];

function SocialBtn({ href, label, icon, color }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 32, height: 32, borderRadius: 8,
        background: NL.elevated, border: `1px solid ${NL.border}`,
        color, textDecoration: "none",
        transition: "border-color 0.18s, color 0.18s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = NL.borderMid;
        e.currentTarget.style.color = NL.text;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = NL.border;
        e.currentTarget.style.color = color;
      }}
    >
      {icon}
    </a>
  );
}

export default function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${NL.border}`,
      background: NL.surface,
      padding: "36px 24px 28px",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        maxWidth: 960, margin: "0 auto",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 20,
      }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/img/icon.png" alt="MCCompanion" style={{ height: 28, width: "auto" }} />
          <span style={{ color: NL.text, fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em" }}>
            MCCompanion
          </span>
          <span style={{ width: 1, height: 12, background: NL.border, margin: "0 2px" }} />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, color: NL.muted, letterSpacing: "0.05em",
          }}>
            Minecraft companion app
          </span>
        </div>

        <nav style={{ display: "flex", flexWrap: "wrap", gap: "2px 2px", justifyContent: "center" }}>
          {footerLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                color: NL.secondary,
                textDecoration: "none",
                fontSize: 12,
                fontWeight: 500,
                padding: "4px 10px",
                borderRadius: 6,
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = NL.text;
                e.currentTarget.style.background = NL.elevated;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = NL.secondary;
                e.currentTarget.style.background = "transparent";
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ display: "flex", gap: 8 }}>
          {socialLinks.map(s => <SocialBtn key={s.label} {...s} />)}
        </div>

        <div style={{
          width: "100%", maxWidth: 280, height: 1,
          background: NL.border,
        }} />

        <p style={{ color: NL.muted, fontSize: 11, textAlign: "center", margin: 0, lineHeight: 1.5 }}>
          © {new Date().getFullYear()} MCCompanion ·{" "}
          Built by <span style={{ color: NL.secondary, fontWeight: 500 }}>Jens-Co</span>
        </p>

        <p style={{ color: NL.muted, fontSize: 10, textAlign: "center", margin: 0, lineHeight: 1.6, maxWidth: 480, opacity: 0.7 }}>
          Not affiliated with Mojang Studios or Microsoft. Minecraft is a trademark of Mojang AB.
        </p>

      </div>
    </footer>
  );
}