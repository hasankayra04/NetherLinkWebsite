import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaDiscord, FaPlus, FaList, FaEdit, FaTrash } from "react-icons/fa";
import { T } from "../lib/tokens";

const INVITE = "https://discord.com/oauth2/authorize?client_id=1405139934771282061&permissions=274877934592&integration_type=0&scope=bot";

const COMMANDS = [
  { icon: <FaPlus size={12} />,   name: "/server-add",    desc: "Add a server to monitor and post a live status embed.",   color: "#67e404" },
  { icon: <FaTrash size={12} />,  name: "/server-delete", desc: "Remove a server and delete its embed from the channel.",  color: "#f87171" },
  { icon: <FaEdit size={12} />,   name: "/server-edit",   desc: "Update IP, port, channel or favicon without re-adding.", color: "#60a5fa" },
  { icon: <FaList size={12} />,   name: "/server-list",   desc: "View all monitored servers for this Discord server.",     color: "#a78bfa" },
];

const EMBEDS = [
  { server: "play.hypixel.net:25565",     online: true,  players: "47,291 / 200,000", version: "1.21.x", platform: "Java",    motd: "Hypixel Network · The Largest Server",   color: "#67e404", ping: "12ms" },
  { server: "mc.nether.pro:19132",        online: true,  players: "312 / 500",        version: "1.21.x", platform: "Bedrock", motd: "NetherPro Network · Bedrock & Java",      color: "#34d399", ping: "28ms" },
  { server: "offline.example.net:25565",  online: false, players: "—",               version: "—",      platform: "Java",    motd: "Server is currently offline",              color: "#f87171", ping: "—" },
];

function EmbedMockup() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(x => (x + 1) % EMBEDS.length), 3500); return () => clearInterval(t); }, []);
  const e = EMBEDS[i];

  return (
    <div style={{ background: "#1e1f22", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", width: "100%", maxWidth: 360 }}>
      {/* discord top bar */}
      <div style={{ background: "#2b2d31", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#67e404,#34d399)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FaDiscord size={16} color="#fff" />
        </div>
        <div>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>MCCompanion</span>
          <span style={{ marginLeft: 6, fontSize: 9, background: T.discord, color: "#fff", padding: "1px 5px", borderRadius: 3, fontWeight: 700 }}>APP</span>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#72767d" }}>Today 12:34</span>
      </div>

      {/* embed */}
      <div style={{ padding: "10px 14px 14px" }}>
        <AnimatePresence mode="wait">
          <motion.div key={i}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            style={{ borderLeft: `3px solid ${e.color}`, background: "#2b2d31", borderRadius: "0 8px 8px 0", padding: "12px 14px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 10, fontFamily: "monospace" }}>{e.server}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 10px", marginBottom: 10 }}>
              {[
                ["Status",   e.online ? "🟢 Online" : "🔴 Offline", e.color],
                ["Players",  e.players,  "#e3e5e8"],
                ["Version",  e.version,  "#e3e5e8"],
                ["Platform", e.platform, "#e3e5e8"],
                ["Ping",     e.ping,     "#e3e5e8"],
              ].map(([label, val, col]) => (
                <div key={label}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#b5bac1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 12, color: col, fontWeight: label === "Status" ? 700 : 400 }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#b5bac1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>MOTD</div>
              <div style={{ fontSize: 12, color: "#e3e5e8" }}>{e.motd}</div>
            </div>
            <div style={{ fontSize: 10, color: "#72767d", marginTop: 8 }}>MCCompanion · auto-updated</div>
          </motion.div>
        </AnimatePresence>

        <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 12 }}>
          {EMBEDS.map((_, j) => (
            <button key={j} onClick={() => setI(j)}
              style={{ width: j === i ? 18 : 6, height: 6, borderRadius: 3, background: j === i ? T.green : "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.25s" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DiscordBotSection() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 40, alignItems: "start" }}>
      {/* commands */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {COMMANDS.map(c => (
          <div key={c.name} style={{ display: "flex", gap: 14, padding: "14px 16px", borderRadius: 12, background: T.surface, border: `1px solid ${T.border}`, transition: "border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: c.color + "18", border: `1px solid ${c.color}28`, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, flexShrink: 0, marginTop: 1 }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.color, fontFamily: "monospace", marginBottom: 3 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.6 }}>{c.desc}</div>
            </div>
          </div>
        ))}

        <a href={INVITE} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "12px 20px", borderRadius: 12, background: T.discord, textDecoration: "none", color: "#fff", fontSize: 14, fontWeight: 700, marginTop: 4, transition: "opacity 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
          <FaDiscord size={15} /> Add to your server — it's free
        </a>
      </div>

      {/* mockup */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <EmbedMockup />
      </div>
    </div>
  );
}
