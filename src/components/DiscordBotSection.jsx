import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaDiscord, FaPlus, FaList, FaEdit, FaTrash } from "react-icons/fa";

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

const DISCORD_INVITE = "https://discord.com/oauth2/authorize?client_id=1405139934771282061&permissions=274877934592&integration_type=0&scope=bot";

const COMMANDS = [
  {
    icon: <FaPlus size={13} />,
    name: "/server-add",
    desc: "Add a Minecraft server to monitor. Provide a name, IP, and channel, the bot posts a live status embed instantly.",
    color: "#67e404",
    colorDim: "rgba(103,228,4,0.10)",
    colorBorder: "rgba(103,228,4,0.20)",
  },
  {
    icon: <FaTrash size={13} />,
    name: "/server-delete",
    desc: "Remove a server from monitoring. The status embed is automatically deleted from the channel.",
    color: "#f87171",
    colorDim: "rgba(248,113,113,0.10)",
    colorBorder: "rgba(248,113,113,0.20)",
  },
  {
    icon: <FaEdit size={13} />,
    name: "/server-edit",
    desc: "Update a server's IP, port, platform, channel, or custom favicon without re-adding it.",
    color: "#60a5fa",
    colorDim: "rgba(96,165,250,0.10)",
    colorBorder: "rgba(96,165,250,0.20)",
  },
  {
    icon: <FaList size={13} />,
    name: "/server-list",
    desc: "View all monitored servers for this Discord server, see status, channel, and tracking state at a glance.",
    color: "#a78bfa",
    colorDim: "rgba(167,139,250,0.10)",
    colorBorder: "rgba(167,139,250,0.20)",
  },
];

const EMBED_STATES = [
  {
    server: "play.hypixel.net:25565",
    status: "Online",
    statusColor: "#67e404",
    players: "47,291 / 200,000",
    version: "1.21.x",
    platform: "Java Edition",
    motd: "Hypixel Network · The Largest Server",
    embedColor: "#67e404",
    ping: "12ms",
  },
  {
    server: "mc.nether.pro:19132",
    status: "Online",
    statusColor: "#67e404",
    players: "312 / 500",
    version: "1.21.x",
    platform: "Bedrock Edition",
    motd: "NetherPro Network · Bedrock & Java",
    embedColor: "#34d399",
    ping: "28ms",
  },
  {
    server: "offline.example.net:25565",
    status: "Offline",
    statusColor: "#f87171",
    players: "N/A",
    version: "Unknown",
    platform: "Java Edition",
    motd: null,
    embedColor: "#f87171",
    ping: null,
  },
];

function DiscordEmbedMockup() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % EMBED_STATES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const embed = EMBED_STATES[idx];

  return (
    <div style={{
      background: "#313338",
      borderRadius: 12,
      padding: "16px",
      fontFamily: "'Inter', sans-serif",
      maxWidth: 400,
      width: "100%",
      boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #67e404, #34d399)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <FaDiscord size={18} color="#fff" />
        </div>
        <div>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>MCCompanion</span>
          <span style={{
            marginLeft: 6, fontSize: 10, background: "#5865f2",
            color: "#fff", padding: "1px 5px", borderRadius: 4, fontWeight: 600,
          }}>APP</span>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#72767d" }}>Today at 12:34</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          style={{
            borderLeft: `4px solid ${embed.embedColor}`,
            background: "#2b2d31",
            borderRadius: "0 8px 8px 0",
            padding: "12px 14px",
          }}
        >
          <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: "0 0 10px" }}>
            {embed.server}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 12px", marginBottom: 10 }}>
            <div>
              <p style={{ color: "#b5bac1", fontSize: 11, fontWeight: 600, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Status</p>
              <p style={{ color: embed.statusColor, fontSize: 13, fontWeight: 600, margin: 0 }}>
                {embed.status === "Online" ? "🟢" : "🔴"} {embed.status}
              </p>
            </div>
            <div>
              <p style={{ color: "#b5bac1", fontSize: 11, fontWeight: 600, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Players</p>
              <p style={{ color: "#e3e5e8", fontSize: 13, margin: 0 }}>{embed.players}</p>
            </div>
            <div>
              <p style={{ color: "#b5bac1", fontSize: 11, fontWeight: 600, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Version</p>
              <p style={{ color: "#e3e5e8", fontSize: 13, margin: 0 }}>{embed.version}</p>
            </div>
            <div>
              <p style={{ color: "#b5bac1", fontSize: 11, fontWeight: 600, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Platform</p>
              <p style={{ color: "#e3e5e8", fontSize: 13, margin: 0 }}>{embed.platform}</p>
            </div>
            {embed.ping && (
              <div>
                <p style={{ color: "#b5bac1", fontSize: 11, fontWeight: 600, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Ping</p>
                <p style={{ color: "#e3e5e8", fontSize: 13, margin: 0 }}>{embed.ping}</p>
              </div>
            )}
          </div>

          {embed.motd && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 8 }}>
              <p style={{ color: "#b5bac1", fontSize: 11, fontWeight: 600, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Message of the Day</p>
              <p style={{ color: "#e3e5e8", fontSize: 12, margin: 0 }}>{embed.motd}</p>
            </div>
          )}

          <p style={{ color: "#72767d", fontSize: 11, margin: "10px 0 0" }}>
            MCCompanion • Instant updates for Minecraft servers
          </p>
        </motion.div>
      </AnimatePresence>

      <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 12 }}>
        {EMBED_STATES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            style={{
              width: i === idx ? 18 : 6,
              height: 6, borderRadius: 3,
              background: i === idx ? NL.accent : "rgba(255,255,255,0.15)",
              border: "none", cursor: "pointer", padding: 0,
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function DiscordBotSection() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: 48,
      alignItems: "center",
    }}>
      <div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          fontSize: 11, padding: "4px 12px", borderRadius: 20,
          background: "rgba(88,101,242,0.12)", border: "1px solid rgba(88,101,242,0.25)",
          color: "#7289da", fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16,
        }}>
          <FaDiscord size={11} />
          Discord Bot
        </div>

        <h2 style={{
          fontSize: "clamp(22px, 3vw, 32px)",
          fontWeight: 700, color: NL.text,
          letterSpacing: "-0.02em", lineHeight: 1.2, margin: "0 0 14px",
        }}>
          Live Minecraft status,<br />
          right in your{" "}
          <span style={{ color: "#7289da" }}>Discord</span>
        </h2>

        <p style={{ fontSize: 14, color: NL.secondary, lineHeight: 1.7, margin: "0 0 24px", maxWidth: 440 }}>
          The MCCompanion Discord bot monitors your Minecraft servers and posts auto-updating status embeds in any channel. Java &amp; Bedrock both supported, direct TCP/UDP pings, no third-party API.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
          {COMMANDS.map(cmd => (
            <div key={cmd.name} style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: NL.surface,
              border: `1px solid ${NL.border}`,
              transition: "border-color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = cmd.colorBorder}
              onMouseLeave={e => e.currentTarget.style.borderColor = NL.border}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                  background: cmd.colorDim, border: `1px solid ${cmd.colorBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: cmd.color,
                }}>
                  {cmd.icon}
                </div>
                <code style={{
                  fontSize: 11, color: cmd.color,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                }}>{cmd.name}</code>
              </div>
              <p style={{ fontSize: 11, color: NL.muted, margin: 0, lineHeight: 1.6 }}>{cmd.desc}</p>
            </div>
          ))}
        </div>

        <a
          href={DISCORD_INVITE}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "11px 22px", borderRadius: 10,
            background: "#5865f2",
            color: "#fff", fontWeight: 600, fontSize: 14,
            textDecoration: "none",
            transition: "background 0.2s, transform 0.15s",
            border: "1px solid rgba(88,101,242,0.5)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#4752c4";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#5865f2";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <FaDiscord size={16} />
          Add to your server it&apos;s free
        </a>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <DiscordEmbedMockup />
      </div>
    </div>
  );
}
