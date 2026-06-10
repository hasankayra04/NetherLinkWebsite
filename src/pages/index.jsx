import { useState, useEffect, useRef } from "react";
import { FaWindows, FaApple, FaAndroid, FaServer, FaSearch, FaUser, FaRobot, FaDiscord, FaCode, FaGamepad, FaArrowRight, FaChevronDown } from "react-icons/fa";
import { motion, useInView } from "framer-motion";
import FeaturedServersCarousel from "../components/FeaturedServersCarousel";
import ChangelogSection from "../components/ChangelogSection";
import AppShowcase from "../components/AppShowcase";
import BotStatus from "../components/BotStatus";
import CommunitySection from "../components/CommunitySection";
import DiscordBotSection from "../components/DiscordBotSection";
import Layout from "@theme/Layout";

const NL = {
  bg: "#0d0f14",
  surface: "#13161e",
  elevated: "#191c25",
  subtle: "#1e2230",
  border: "rgba(255,255,255,0.06)",
  borderMid: "rgba(255,255,255,0.10)",
  text: "#eaebee",
  secondary: "#8892a4",
  muted: "#4e5666",
  accent: "#67e404",
  accentDim: "rgba(103,228,4,0.08)",
  accentBorder: "rgba(103,228,4,0.20)",
  accentGlow: "rgba(103,228,4,0.15)",
};

const platforms = [
  { icon: <FaWindows size={16} />, label: "Windows", url: "https://apps.microsoft.com/detail/9NSFPT6D8PTR", color: "#60a5fa" },
  { icon: <FaApple size={16} />, label: "macOS", url: "https://github.com/MCCORG/MCCompanionWebsite/raw/refs/heads/main/downloads/apple/MCCompanion.dmg", color: "#c0c7d4" },
  { icon: <FaAndroid size={16} />, label: "Android", url: "https://play.google.com/store/apps/details?id=net.netherdev.netherLink", color: "#34d399" },
  { icon: <FaApple size={16} />, label: "iOS", url: "https://apps.apple.com/be/app/netherlink/id6747323142?l=en", color: "#c0c7d4" },
];

function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !target) return;
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count > 0 ? count.toLocaleString() : (target ? "—" : "—")}{suffix}
    </span>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

function SectionHeading({ eyebrow, title, subtitle, accent }) {
  return (
    <div style={{ marginBottom: 56, textAlign: "center" }}>
      {eyebrow && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          fontSize: 10, padding: "4px 14px", borderRadius: 20,
          background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
          color: NL.accent, fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: NL.accent }} />
          {eyebrow}
        </div>
      )}
      <h2 style={{
        fontSize: "clamp(26px, 4vw, 42px)",
        fontWeight: 700, color: NL.text,
        letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 16px",
      }}>
        {title}{accent && <span style={{ color: NL.accent }}> {accent}</span>}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 15, color: NL.secondary, maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
          {subtitle}
        </p>
      )}
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
      title="MCCompanion The Complete Minecraft Companion App"
      description="Console relay for PlayStation, Xbox & Switch, player lookup, skin editor, Discord bot, and a global Xbox relay network. Free on all platforms."
    >
      <div style={{ background: NL.bg, fontFamily: "'Inter', system-ui, sans-serif", overflowX: "hidden" }}>

        <section style={{
          position: "relative",
          minHeight: "92vh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "100px 20px 80px",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            top: "30%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700, height: 500,
            background: "radial-gradient(ellipse at center, rgba(103,228,4,0.09) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `linear-gradient(${NL.border} 1px, transparent 1px), linear-gradient(90deg, ${NL.border} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 800, width: "100%", textAlign: "center" }}>

            <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible" style={{ marginBottom: 20 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontSize: 10, padding: "5px 16px", borderRadius: 20,
                background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
                color: NL.accent, fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.12em", textTransform: "uppercase",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: NL.accent, boxShadow: `0 0 8px ${NL.accent}` }} />
                Free on all platforms
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp} custom={1} initial="hidden" animate="visible"
              style={{
                fontSize: "clamp(38px, 7vw, 76px)",
                fontWeight: 800, lineHeight: 1.05,
                letterSpacing: "-0.04em", margin: "0 0 24px",
                color: NL.text,
              }}
            >
              Your Minecraft companion,{" "}
              <br />
              <span style={{
                background: "linear-gradient(135deg, #67e404 0%, #34d399 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                on every device.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp} custom={2} initial="hidden" animate="visible"
              style={{
                fontSize: "clamp(15px, 2vw, 18px)",
                color: NL.secondary, lineHeight: 1.75,
                maxWidth: 560, margin: "0 auto 40px",
              }}
            >
              One free app for every platform console relay, server browser,
              skin editor, player lookup, Discord bot, and a global Xbox relay network.
            </motion.p>

            <motion.div
              variants={fadeUp} custom={3} initial="hidden" animate="visible"
              style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 52 }}
            >
              {platforms.map(p => (
                <motion.a
                  key={p.label}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "10px 20px", borderRadius: 10,
                    background: NL.surface,
                    border: `1px solid ${NL.border}`,
                    textDecoration: "none", color: NL.text,
                    fontSize: 13, fontWeight: 500,
                    transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = p.color + "44";
                    e.currentTarget.style.background = NL.elevated;
                    e.currentTarget.style.boxShadow = `0 0 20px ${p.color}18`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = NL.border;
                    e.currentTarget.style.background = NL.surface;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span style={{ color: p.color }}>{p.icon}</span>
                  {p.label}
                </motion.a>
              ))}
            </motion.div>

            {stats && (
              <motion.div
                variants={fadeUp} custom={4} initial="hidden" animate="visible"
                style={{ display: "flex", justifyContent: "center", gap: 0 }}
              >
                <div style={{
                  display: "inline-flex",
                  background: NL.surface,
                  border: `1px solid ${NL.border}`,
                  borderRadius: 16, overflow: "hidden",
                }}>
                  {[
                    { label: "servers tracked", value: stats.servers },
                    { label: "connections made", value: stats.joins },
                  ].map((s, i) => (
                    <div key={s.label} style={{
                      padding: "18px 36px", textAlign: "center",
                      borderLeft: i > 0 ? `1px solid ${NL.border}` : "none",
                    }}>
                      <div style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 28, fontWeight: 700,
                        color: NL.accent, lineHeight: 1,
                        marginBottom: 6,
                      }}>
                        <AnimatedCounter target={s.value} />
                      </div>
                      <div style={{ fontSize: 11, color: NL.muted, letterSpacing: "0.05em" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            style={{
              position: "absolute", bottom: 32,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              color: NL.muted, fontSize: 11, letterSpacing: "0.06em",
            }}
          >
            <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <FaChevronDown size={12} />
            </motion.div>
          </motion.div>
        </section>

        <section style={{ padding: "0 20px 96px", maxWidth: 1200, margin: "0 auto" }}>
          <SectionHeading
            eyebrow="Everything in one place"
            title="Four tools,"
            accent="one ecosystem"
            subtitle="Built for Minecraft players, server owners, and community managers. Every tool connects to the next."
          />

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gridTemplateRows: "auto auto",
            gap: 12,
          }}>

            <motion.a
              href="#app"
              variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
              style={{
                gridColumn: "span 7",
                textDecoration: "none",
                display: "block",
                position: "relative",
                overflow: "hidden",
                borderRadius: 20,
                background: `linear-gradient(135deg, ${NL.surface} 0%, #161b20 100%)`,
                border: `1px solid ${NL.border}`,
                padding: "36px 36px 32px",
                transition: "border-color 0.2s, box-shadow 0.2s",
                cursor: "pointer",
              }}
              whileHover={{ scale: 1.01 }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(103,228,4,0.25)";
                e.currentTarget.style.boxShadow = "0 0 40px rgba(103,228,4,0.08)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = NL.border;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{
                position: "absolute", top: -60, right: -60,
                width: 240, height: 240,
                background: "radial-gradient(circle, rgba(103,228,4,0.07) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 52, height: 52, borderRadius: 14,
                background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
                color: NL.accent, marginBottom: 20,
              }}>
                <FaGamepad size={22} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: NL.text, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
                Mobile & Desktop App
              </h3>
              <p style={{ fontSize: 14, color: NL.secondary, lineHeight: 1.7, margin: "0 0 28px", maxWidth: 360 }}>
                Console relay for PlayStation, Xbox & Switch. Server browser, skin editor, and player lookup.
                Free on Windows, macOS, Android and iOS.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["Console Relay", "Server Browser", "Skin Editor", "Player Lookup"].map(tag => (
                  <span key={tag} style={{
                    fontSize: 11, padding: "4px 10px", borderRadius: 6,
                    background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
                    color: NL.accent, fontFamily: "'JetBrains Mono', monospace",
                  }}>{tag}</span>
                ))}
              </div>
              <div style={{
                position: "absolute", bottom: 28, right: 28,
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 12, color: NL.accent, fontWeight: 600,
              }}>
                Explore <FaArrowRight size={10} />
              </div>
            </motion.a>

            <motion.a
              href="#discord-bot"
              variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              style={{
                gridColumn: "span 5",
                textDecoration: "none",
                display: "block",
                position: "relative",
                overflow: "hidden",
                borderRadius: 20,
                background: `linear-gradient(135deg, ${NL.surface} 0%, #14172a 100%)`,
                border: `1px solid ${NL.border}`,
                padding: "36px 36px 32px",
                transition: "border-color 0.2s, box-shadow 0.2s",
                cursor: "pointer",
              }}
              whileHover={{ scale: 1.01 }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(114,137,218,0.3)";
                e.currentTarget.style.boxShadow = "0 0 40px rgba(114,137,218,0.08)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = NL.border;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{
                position: "absolute", top: -40, right: -40,
                width: 180, height: 180,
                background: "radial-gradient(circle, rgba(114,137,218,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 52, height: 52, borderRadius: 14,
                background: "rgba(114,137,218,0.10)", border: "1px solid rgba(114,137,218,0.25)",
                color: "#7289da", marginBottom: 20,
              }}>
                <FaDiscord size={22} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: NL.text, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
                Discord Bot
              </h3>
              <p style={{ fontSize: 14, color: NL.secondary, lineHeight: 1.7, margin: "0 0 28px" }}>
                Auto-updating Minecraft server status embeds in any Discord channel.
                Java & Bedrock, direct TCP/UDP pings. No third-party API.
              </p>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 12, color: "#7289da", fontWeight: 600,
              }}>
                Learn more <FaArrowRight size={10} />
              </div>
            </motion.a>

            <motion.a
              href="#relay"
              variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
              style={{
                gridColumn: "span 5",
                textDecoration: "none",
                display: "block",
                position: "relative",
                overflow: "hidden",
                borderRadius: 20,
                background: `linear-gradient(135deg, ${NL.surface} 0%, #0f1a16 100%)`,
                border: `1px solid ${NL.border}`,
                padding: "36px 36px 32px",
                transition: "border-color 0.2s, box-shadow 0.2s",
                cursor: "pointer",
              }}
              whileHover={{ scale: 1.01 }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(52,211,153,0.25)";
                e.currentTarget.style.boxShadow = "0 0 40px rgba(52,211,153,0.07)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = NL.border;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{
                position: "absolute", top: -40, right: -40,
                width: 180, height: 180,
                background: "radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 52, height: 52, borderRadius: 14,
                background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.22)",
                color: "#34d399", marginBottom: 20,
              }}>
                <FaRobot size={22} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: NL.text, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
                Xbox Relay Network
              </h3>
              <p style={{ fontSize: 14, color: NL.secondary, lineHeight: 1.7, margin: "0 0 28px" }}>
                Always-online Xbox bots in EU and US regions for stable Bedrock server connections from any console.
              </p>
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {["EU Region", "US Region", "24/7 Online"].map(tag => (
                  <span key={tag} style={{
                    fontSize: 11, padding: "4px 10px", borderRadius: 6,
                    background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.18)",
                    color: "#34d399", fontFamily: "'JetBrains Mono', monospace",
                  }}>{tag}</span>
                ))}
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 12, color: "#34d399", fontWeight: 600,
              }}>
                View live status <FaArrowRight size={10} />
              </div>
            </motion.a>

            <motion.a
              href="/api-docs"
              variants={fadeUp} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}
              style={{
                gridColumn: "span 7",
                textDecoration: "none",
                display: "block",
                position: "relative",
                overflow: "hidden",
                borderRadius: 20,
                background: `linear-gradient(135deg, ${NL.surface} 0%, #16131f 100%)`,
                border: `1px solid ${NL.border}`,
                padding: "36px 36px 32px",
                transition: "border-color 0.2s, box-shadow 0.2s",
                cursor: "pointer",
              }}
              whileHover={{ scale: 1.01 }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(167,139,250,0.25)";
                e.currentTarget.style.boxShadow = "0 0 40px rgba(167,139,250,0.07)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = NL.border;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{
                position: "absolute", top: -50, right: -50,
                width: 200, height: 200,
                background: "radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 52, height: 52, borderRadius: 14,
                    background: "rgba(167,139,250,0.10)", border: "1px solid rgba(167,139,250,0.22)",
                    color: "#a78bfa", marginBottom: 20,
                  }}>
                    <FaCode size={22} />
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: NL.text, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
                    Public API
                  </h3>
                  <p style={{ fontSize: 14, color: NL.secondary, lineHeight: 1.7, margin: "0 0 20px", maxWidth: 380 }}>
                    Integrate MCCompanion data into your own projects. Server metrics, player lookup, relay status, and more.
                  </p>
                </div>
                <div style={{
                  flexShrink: 0, background: NL.elevated,
                  border: `1px solid ${NL.border}`, borderRadius: 12,
                  padding: "16px 18px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12, color: NL.secondary,
                  lineHeight: 1.8, whiteSpace: "pre",
                  display: "none",
                }}>
                  {`GET /api/server/:ip\nGET /api/player/:name\nGET /api/relay/status`}
                </div>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 12, color: "#a78bfa", fontWeight: 600,
              }}>
                Read the docs <FaArrowRight size={10} />
              </div>
            </motion.a>

          </div>
        </section>

        <section id="app" style={{ padding: "0 20px 96px", maxWidth: 1200, margin: "0 auto" }}>
          <SectionHeading
            eyebrow="The app"
            title="Everything you need,"
            accent="on every device"
            subtitle="Connect, manage, and explore Minecraft from your phone, tablet, or desktop."
          />
          <AppShowcase />

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 10,
            marginTop: 40,
          }}>
            {[
              {
                icon: <FaGamepad size={18} />,
                color: "#67e404",
                colorDim: "rgba(103,228,4,0.08)",
                colorBorder: "rgba(103,228,4,0.20)",
                title: "Console Relay",
                desc: "Connect PlayStation, Xbox, and Switch to any Java or Bedrock server via our relay network.",
              },
              {
                icon: <FaServer size={18} />,
                color: "#60a5fa",
                colorDim: "rgba(96,165,250,0.08)",
                colorBorder: "rgba(96,165,250,0.20)",
                title: "Server Browser",
                desc: "Save, organize and connect to any Bedrock or Java server. Switch between them instantly.",
              },
              {
                icon: <FaSearch size={18} />,
                color: "#f472b6",
                colorDim: "rgba(244,114,182,0.08)",
                colorBorder: "rgba(244,114,182,0.20)",
                title: "Player Lookup",
                desc: "Look up any player by Xbox gamertag, Java username, or XUID. See their skin, UUID, and linked accounts.",
                href: "/lookup",
              },
              {
                icon: <FaUser size={18} />,
                color: "#a78bfa",
                colorDim: "rgba(167,139,250,0.08)",
                colorBorder: "rgba(167,139,250,0.20)",
                title: "Skin Editor",
                desc: "Browse thousands of community skins, customize your own, and apply them to your Minecraft account.",
              },
            ].map((f, i) => {
              const card = (
                <motion.div
                  key={f.title}
                  variants={fadeUp} custom={i}
                  style={{
                    padding: "26px 24px",
                    borderRadius: 16,
                    background: NL.surface,
                    border: `1px solid ${NL.border}`,
                    transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
                    height: "100%", boxSizing: "border-box",
                    cursor: f.href ? "pointer" : "default",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = f.colorBorder;
                    e.currentTarget.style.background = NL.elevated;
                    e.currentTarget.style.boxShadow = `0 0 24px ${f.colorDim}`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = NL.border;
                    e.currentTarget.style.background = NL.surface;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: f.colorDim, border: `1px solid ${f.colorBorder}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: f.color, marginBottom: 16,
                  }}>
                    {f.icon}
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: NL.text, margin: "0 0 8px" }}>
                    {f.title}
                    {f.href && <span style={{ fontSize: 12, color: f.color, marginLeft: 6 }}>→</span>}
                  </p>
                  <p style={{ fontSize: 13, color: NL.secondary, margin: 0, lineHeight: 1.7 }}>{f.desc}</p>
                </motion.div>
              );
              return f.href
                ? <a key={f.title} href={f.href} style={{ textDecoration: "none" }}>{card}</a>
                : <div key={f.title}>{card}</div>;
            })}
          </div>
        </section>

        <section style={{
          position: "relative",
          background: `linear-gradient(180deg, transparent 0%, rgba(88,101,242,0.04) 50%, transparent 100%)`,
          borderTop: `1px solid ${NL.border}`,
          borderBottom: `1px solid ${NL.border}`,
          padding: "96px 20px",
        }}>
          <div id="discord-bot" style={{ maxWidth: 1100, margin: "0 auto" }}>
            <SectionHeading
              eyebrow="Discord bot"
              title="Server status,"
              accent="always live"
              subtitle="Auto-updating embeds in any channel. Java & Bedrock. No setup required."
            />
            <DiscordBotSection />
          </div>
        </section>

        <section style={{ padding: "96px 20px" }}>
          <div id="relay" style={{ maxWidth: 1100, margin: "0 auto" }}>
            <SectionHeading
              eyebrow="Xbox relay network"
              title="Always online,"
              accent="globally distributed"
              subtitle="Dedicated Xbox bots in EU and US regions keep your Bedrock server accessible from any console, 24/7."
            />
            <BotStatus />
          </div>
        </section>

        <section style={{
          background: NL.surface,
          borderTop: `1px solid ${NL.border}`,
          borderBottom: `1px solid ${NL.border}`,
          padding: "96px 20px",
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <SectionHeading
              eyebrow="Community"
              title="Featured"
              accent="servers"
              subtitle="Discover and join the best Minecraft servers, hand-picked by the community."
            />
            <FeaturedServersCarousel />
          </div>
        </section>

        <section style={{ padding: "96px 20px 120px" }}>
          <div style={{
            maxWidth: 1100, margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 40,
            alignItems: "start",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: NL.muted,
                }}>Recent changes</span>
                <div style={{ flex: 1, height: 1, background: NL.border }} />
              </div>
              <ChangelogSection />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: NL.muted,
                }}>Community</span>
                <div style={{ flex: 1, height: 1, background: NL.border }} />
              </div>
              <CommunitySection />
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}
