import { useState, useEffect } from "react";
import { FaWindows, FaApple, FaAndroid, FaServer, FaSearch, FaUser, FaRobot } from "react-icons/fa";
import { motion } from "framer-motion";
import FeaturedServersCarousel from "../components/FeaturedServersCarousel";
import ChangelogSection from "../components/ChangelogSection";
import AppShowcase from "../components/AppShowcase";
import BotStatus from "../components/BotStatus";
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

const platforms = [
  { icon: <FaWindows size={18} />, label: "Windows", url: "https://apps.microsoft.com/detail/9NSFPT6D8PTR", color: "#60a5fa" },
  { icon: <FaApple size={18} />, label: "macOS", url: "https://github.com/MCCORG/MCCompanionWebsite/raw/refs/heads/main/downloads/apple/MCCompanion.dmg", color: "#9299a6" },
  { icon: <FaAndroid size={18} />, label: "Android", url: "https://play.google.com/store/apps/details?id=net.netherdev.netherLink", color: "#34d399" },
  { icon: <FaApple size={18} />, label: "iOS", url: "https://apps.apple.com/be/app/netherlink/id6747323142?l=en", color: "#9299a6" },
];

const FEATURES = [
  {
    icon: <FaServer size={16} />,
    color: "#60a5fa",
    colorDim: "rgba(96,165,250,0.10)",
    colorBorder: "rgba(96,165,250,0.20)",
    title: "Server Browser",
    desc: "Save and connect to any Bedrock or Java server. Organize your favorites and switch between them instantly.",
  },
  {
    icon: <FaSearch size={16} />,
    color: "#67e404",
    colorDim: "rgba(103,228,4,0.10)",
    colorBorder: "rgba(103,228,4,0.22)",
    title: "Player Lookup",
    desc: "Look up any player by Xbox gamertag, Java username, or XUID — see their skin, UUID, and linked accounts.",
    href: "/lookup",
  },
  {
    icon: <FaUser size={16} />,
    color: "#f472b6",
    colorDim: "rgba(244,114,182,0.10)",
    colorBorder: "rgba(244,114,182,0.20)",
    title: "Skin Editor",
    desc: "Browse thousands of community skins, customize your own, and apply them to your Minecraft account.",
  },
  {
    icon: <FaRobot size={16} />,
    color: "#34d399",
    colorDim: "rgba(52,211,153,0.10)",
    colorBorder: "rgba(52,211,153,0.20)",
    title: "Xbox Relay Network",
    desc: "Always-online Xbox relay bots across EU and US regions ensure a stable and fast Bedrock connection.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.42, ease: "easeOut" },
  }),
};

function SectionLabel({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10, letterSpacing: "0.12em",
        textTransform: "uppercase", color: NL.muted,
        flexShrink: 0,
      }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: NL.border }} />
    </div>
  );
}

export default function Home() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("https://api.mccompanion.net/api/metrics")
      .then(r => r.json())
      .then(d => setStats({ servers: d.totalServers, joins: d.totalCount }))
      .catch(() => {});
  }, []);

  return (
    <Layout
      title="MCCompanion — The Complete Minecraft Companion App"
      description="Console relay for PlayStation, Xbox & Switch, player lookup, skin editor, Minecraft wiki, friends & chat. The all-in-one Minecraft companion app. Free on all platforms."
    >
      <div style={{ background: NL.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>

        <main style={{
          width: "100%",
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "80px 20px 64px",
          boxSizing: "border-box",
        }}>
          <div style={{
            width: "100%", maxWidth: 1100,
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 28, textAlign: "center",
          }}>

            <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible">
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontSize: 11, padding: "4px 14px", borderRadius: 20,
                background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
                color: NL.accent, fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: NL.accent }} />
                Free · Windows · macOS · Android · iOS
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp} custom={1} initial="hidden" animate="visible"
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <h1 style={{
                fontSize: "clamp(30px, 5.5vw, 52px)",
                fontWeight: 700, color: NL.text,
                letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0,
              }}>
                The complete{" "}
                <span style={{ color: NL.accent }}>Minecraft</span>
                {" "}companion
              </h1>
              <p style={{
                fontSize: 16, color: NL.secondary,
                maxWidth: 540, margin: "0 auto", lineHeight: 1.7,
              }}>
                MCCompanion brings your entire Minecraft experience into one free app — manage servers, look up players, edit your skin, and stay connected through our global Xbox relay network.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp} custom={2} initial="hidden" animate="visible"
              style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, width: "100%", maxWidth: 420 }}
            >
              {platforms.map(p => (
                <motion.a
                  key={p.label}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: 7, padding: "16px 8px",
                    borderRadius: 12,
                    background: NL.surface,
                    border: `1px solid ${NL.border}`,
                    textDecoration: "none",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = p.color + "55";
                    e.currentTarget.style.background = NL.elevated;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = NL.border;
                    e.currentTarget.style.background = NL.surface;
                  }}
                >
                  <span style={{ color: p.color }}>{p.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: NL.secondary }}>{p.label}</span>
                </motion.a>
              ))}
            </motion.div>

            {stats && (
              <motion.div
                variants={fadeUp} custom={3} initial="hidden" animate="visible"
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                {[
                  { value: stats.servers.toLocaleString(), label: "servers tracked" },
                  { value: stats.joins.toLocaleString(), label: "total connections" },
                ].map((s, i) => (
                  <>
                    {i > 0 && <div key={`sep-${i}`} style={{ width: 1, height: 28, background: NL.border }} />}
                    <div key={s.label} style={{ textAlign: "center", padding: "0 12px" }}>
                      <p style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 20, fontWeight: 700, color: NL.text, margin: 0,
                      }}>{s.value}</p>
                      <p style={{ fontSize: 11, color: NL.muted, margin: "2px 0 0" }}>{s.label}</p>
                    </div>
                  </>
                ))}
              </motion.div>
            )}

          </div>
        </main>

        <AppShowcase />

        <div style={{
          width: "100%", boxSizing: "border-box",
          padding: "0 20px 80px",
          display: "flex", justifyContent: "center",
        }}>
          <div style={{ width: "100%", maxWidth: 1100, display: "flex", flexDirection: "column", gap: 56 }}>

            <div>
              <SectionLabel>What's included</SectionLabel>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 10,
              }}>
                {FEATURES.map(f => {
                  const card = (
                    <div
                      style={{
                        padding: "22px 20px",
                        borderRadius: 14,
                        background: NL.surface,
                        border: `1px solid ${NL.border}`,
                        transition: "border-color 0.2s, background 0.2s",
                        height: "100%", boxSizing: "border-box",
                        cursor: f.href ? "pointer" : "default",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = f.colorBorder;
                        e.currentTarget.style.background = NL.elevated;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = NL.border;
                        e.currentTarget.style.background = NL.surface;
                      }}
                    >
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: f.colorDim, border: `1px solid ${f.colorBorder}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: f.color, marginBottom: 14,
                      }}>
                        {f.icon}
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: NL.text, margin: "0 0 6px" }}>
                        {f.title}
                        {f.href && (
                          <span style={{ fontSize: 12, color: f.color, marginLeft: 6, fontWeight: 500 }}>→</span>
                        )}
                      </p>
                      <p style={{ fontSize: 13, color: NL.secondary, margin: 0, lineHeight: 1.65 }}>{f.desc}</p>
                    </div>
                  );
                  return f.href
                    ? <a key={f.title} href={f.href} style={{ textDecoration: "none", display: "block" }}>{card}</a>
                    : <div key={f.title}>{card}</div>;
                })}
              </div>
            </div>

            <div>
              <SectionLabel>Featured servers</SectionLabel>
              <FeaturedServersCarousel />
            </div>

            {/* BOT NETWORK */}
            <div>
              <SectionLabel>Relay network</SectionLabel>
              <BotStatus />
            </div>

            <div>
              <SectionLabel>Recent changes</SectionLabel>
              <ChangelogSection />
            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
}
