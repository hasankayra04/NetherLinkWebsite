import Layout from "@theme/Layout";
import { FaDiscord, FaPlus, FaEdit, FaTrash, FaList, FaCheckCircle } from "react-icons/fa";
import { T, LABEL_STYLE, H2_STYLE, SUB_STYLE, SECTION_STYLE, INNER_STYLE } from "../lib/tokens";
import DiscordBotSection from "../components/DiscordBotSection";

const INVITE = "https://discord.com/oauth2/authorize?client_id=1405139934771282061&permissions=274877934592&integration_type=0&scope=bot";

const FEATURES = [
  { icon: "🟢", title: "Live status embeds", desc: "Auto-updating embeds in any channel - players online, version, ping, MOTD and more." },
  { icon: "📡", title: "Java & Bedrock", desc: "Works with both Java and Bedrock servers. Just enter the IP and port." },
  { icon: "🔔", title: "Always up to date", desc: "The bot refreshes status automatically so you never have to run a command again." },
  { icon: "🆓", title: "Completely free", desc: "No premium tier, no limits. Add as many servers as you want." },
];

const STEPS = [
  { n: "1", title: "Add the bot", desc: "Click the invite button and select your Discord server." },
  { n: "2", title: "Run /server-add", desc: "Provide your server IP and port. The bot creates a live embed in the current channel." },
  { n: "3", title: "Done", desc: "The embed updates automatically. No further setup needed." },
];

export default function DiscordBotPage() {
  return (
    <Layout
      title="Discord Bot"
      description="Add the MCCompanion Discord bot to monitor any Minecraft server - live status embeds, Java & Bedrock support, completely free."
    >
      <section style={{ ...SECTION_STYLE(), borderTop: "none" }}>
        <div style={{ ...INNER_STYLE, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: 20, background: T.discord + "18", border: `1px solid ${T.discord}40`, marginBottom: 24 }}>
            <FaDiscord size={32} color={T.discord} />
          </div>
          <p style={{ ...LABEL_STYLE, textAlign: "center" }}>Discord Bot</p>
          <h1 style={{ ...H2_STYLE, textAlign: "center" }}>
            Live Minecraft server<br />status in your Discord
          </h1>
          <p style={{ ...SUB_STYLE, textAlign: "center", margin: "0 auto 40px" }}>
            Monitor any Java or Bedrock server directly from Discord. Auto-updating embeds with player count, ping, version and MOTD - all for free.
          </p>
          <a href={INVITE} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 28px", borderRadius: 12, background: T.discord, textDecoration: "none", color: "#fff", fontSize: 15, fontWeight: 700, transition: "opacity 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <FaDiscord size={17} /> Add to Discord, it's free
          </a>
        </div>
      </section>

      <section style={{ ...SECTION_STYLE(true) }}>
        <div style={INNER_STYLE}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 0 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ padding: "20px 22px", borderRadius: 14, background: T.surface, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...SECTION_STYLE() }}>
        <div style={INNER_STYLE}>
          <p style={LABEL_STYLE}>Commands & preview</p>
          <h2 style={{ ...H2_STYLE, fontSize: "clamp(24px,4vw,40px)", marginBottom: 40 }}>Everything you need</h2>
          <DiscordBotSection />
        </div>
      </section>

      <section style={{ ...SECTION_STYLE(true) }}>
        <div style={{ ...INNER_STYLE, maxWidth: 640 }}>
          <p style={LABEL_STYLE}>Getting started</p>
          <h2 style={{ ...H2_STYLE, fontSize: "clamp(24px,4vw,40px)", marginBottom: 40 }}>Up and running in 60 seconds</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {STEPS.map(s => (
              <div key={s.n} style={{ display: "flex", gap: 16, padding: "18px 20px", borderRadius: 14, background: T.surface, border: `1px solid ${T.border}`, alignItems: "flex-start" }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: T.green + "18", border: `1px solid ${T.green}30`, display: "flex", alignItems: "center", justifyContent: "center", color: T.green, fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{s.n}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <a href={INVITE} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "13px 26px", borderRadius: 12, background: T.discord, textDecoration: "none", color: "#fff", fontSize: 14, fontWeight: 700, marginTop: 32, transition: "opacity 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <FaDiscord size={15} /> Add to Discord
          </a>
        </div>
      </section>
    </Layout>
  );
}
