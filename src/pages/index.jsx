import { useState, useEffect, useRef } from "react";
import {
  FaWindows, FaApple, FaAndroid, FaSearch, FaUser, FaRobot,
  FaDiscord, FaCode, FaGamepad, FaArrowRight, FaChevronDown,
  FaDownload, FaBox, FaBolt, FaCheck, FaServer, FaComments,
  FaLink, FaPalette, FaLayerGroup,
} from "react-icons/fa";
import { motion, useInView } from "framer-motion";
import FeaturedServersCarousel from "../components/FeaturedServersCarousel";
import AppShowcase from "../components/AppShowcase";
import BotStatus from "../components/BotStatus";
import DiscordBotSection from "../components/DiscordBotSection";
import Layout from "@theme/Layout";

const C = {
  bg: "#0d0f14",
  surface: "#13161e",
  elevated: "#191c25",
  border: "rgba(255,255,255,0.06)",
  borderMid: "rgba(255,255,255,0.10)",
  text: "#eaebee",
  secondary: "#8892a4",
  muted: "#4e5666",
  accent: "#67e404",
  accentDim: "rgba(103,228,4,0.08)",
  accentBorder: "rgba(103,228,4,0.22)",
};

const PLATFORMS = [
  { icon: <FaWindows size={14} />, label: "Windows", url: "https://apps.microsoft.com/detail/9NSFPT6D8PTR", color: "#60a5fa" },
  { icon: <FaApple size={14} />, label: "macOS", url: "https://apps.apple.com/us/app/mccompanion/id6747323142?platform=mac", color: "#c0c7d4" },
  { icon: <FaAndroid size={14} />, label: "Android", url: "https://play.google.com/store/apps/details?id=net.netherdev.netherLink", color: "#34d399" },
  { icon: <FaApple size={14} />, label: "iOS", url: "https://apps.apple.com/be/app/netherlink/id6747323142?l=en", color: "#c0c7d4" },
];


function Pill({ children, color = C.accent, dim = C.accentDim, border = C.accentBorder }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 10, fontWeight: 700, letterSpacing: 1.3, textTransform: "uppercase",
      padding: "4px 12px", borderRadius: 20,
      background: dim, border: `1px solid ${border}`, color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, boxShadow: `0 0 5px ${color}` }} />
      {children}
    </span>
  );
}

function PlatformBtn({ icon, label, url, color, small }) {
  const [hov, setHov] = useState(false);
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: small ? "8px 14px" : "10px 20px", borderRadius: 10,
        background: hov ? C.elevated : C.surface,
        border: `1px solid ${hov ? color + "44" : C.border}`,
        boxShadow: hov ? `0 0 16px ${color}18` : "none",
        textDecoration: "none", color: C.text,
        fontSize: small ? 12 : 13, fontWeight: 500,
        transition: "all 0.18s",
      }}
    >
      <span style={{ color }}>{icon}</span>{label}
    </a>
  );
}

function Counter({ target }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !target) return;
    let cur = 0; const step = target / 60;
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setN(target); clearInterval(t); }
      else setN(Math.floor(cur));
    }, 30);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span ref={ref}>{n > 0 ? n.toLocaleString() : "0"}</span>;
}

const up = (i = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.07, duration: 0.46, ease: [0.22, 1, 0.36, 1] },
});

function Hero({ stats }) {
  return (
    <section style={{
      position: "relative", minHeight: "94vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "100px 24px 72px", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px),linear-gradient(90deg,${C.border} 1px,transparent 1px)`,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 100%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "36%", left: "50%",
        transform: "translate(-50%,-50%)", width: 900, height: 600,
        background: "radial-gradient(ellipse at center, rgba(103,228,4,0.10) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 820, textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} style={{ marginBottom: 22 }}>
          <Pill>Free · 16 languages · All platforms · Resource packs</Pill>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: "clamp(38px, 8vw, 82px)", fontWeight: 800,
            lineHeight: 1.03, letterSpacing: "-0.045em", margin: "0 0 20px", color: C.text,
          }}>
          Join any server<br />
          <span style={{ background: "linear-gradient(135deg,#67e404 10%,#34d399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            from your console.
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{ fontSize: "clamp(15px, 2vw, 17px)", color: C.secondary, lineHeight: 1.8, maxWidth: 560, margin: "0 auto 40px" }}>
          PS4, PS5, Xbox and Switch can connect to any Minecraft Java or Bedrock server
          without port forwarding. Custom resource packs, player lookup, skin editor, server tracker and more. All free.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.5 }}
          style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 52 }}>
          {PLATFORMS.map(p => <PlatformBtn key={p.label} {...p} />)}
          <a href="/beta" style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "10px 18px", borderRadius: 10,
            background: C.accentDim, border: `1px solid ${C.accentBorder}`,
            textDecoration: "none", color: C.accent, fontSize: 13, fontWeight: 600,
          }}>
            <FaDownload size={12} /> Beta builds
          </a>
        </motion.div>

        {stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.5 }}
            style={{ display: "flex", justifyContent: "center" }}>
            <div style={{
              display: "inline-flex", background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden",
            }}>
              {[{ l: "servers tracked", v: stats.servers }, { l: "connections made", v: stats.joins }].map((s, i) => (
                <div key={s.l} style={{
                  padding: "18px 40px", textAlign: "center",
                  borderLeft: i > 0 ? `1px solid ${C.border}` : "none",
                }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 30, fontWeight: 700, color: C.accent, lineHeight: 1, marginBottom: 7 }}>
                    <Counter target={s.v} />
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.06em" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 0.6 }}
        style={{ position: "absolute", bottom: 24, color: C.muted }}>
        <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2.2 }}>
          <FaChevronDown size={12} />
        </motion.div>
      </motion.div>
    </section>
  );
}

const MODES = [
  { icon: "🎮", label: "Broadcast Mode", platforms: "PS4 · PS5 · Xbox", color: "#60a5fa", dim: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.22)", href: "/docs/howto/playstation-xbox-howto" },
  { icon: "🕹️", label: "DNS Mode", platforms: "Nintendo Switch", color: "#f472b6", dim: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.22)", href: "/docs/howto/nintendo-howto" },
  { icon: "👥", label: "Friends Mode", platforms: "All consoles", color: "#34d399", dim: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.22)", href: "/docs/howto/friend-howto" },
  { icon: "☕", label: "Java Mode", platforms: "Bedrock → Java Edition", color: "#f59e0b", dim: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.22)", href: "/docs/howto/java-howto" },
];

function RelayModes() {
  return (
    <section style={{
      background: C.surface,
      borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
      padding: "64px 24px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Pill>Console connect</Pill>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 800, color: C.text, margin: "16px 0 10px", letterSpacing: "-0.03em" }}>
            Four ways to connect
          </h2>
          <p style={{ fontSize: 15, color: C.secondary, margin: 0 }}>Pick the mode that fits your setup. No mods, no port forwarding.</p>
        </div>

        <div className="modes-grid">
          {MODES.map((m, i) => (
            <motion.a key={m.label} href={m.href} {...up(i)}
              style={{
                display: "block", textDecoration: "none",
                padding: "22px 22px 20px",
                borderRadius: 14, background: C.bg,
                border: `1px solid ${C.border}`,
                transition: "border-color 0.18s, background 0.18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = m.border; e.currentTarget.style.background = m.dim; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg; }}
            >
              <div style={{ fontSize: 26, marginBottom: 12 }}>{m.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: m.color, marginBottom: 14, fontWeight: 500 }}>{m.platforms}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.muted, fontWeight: 500 }}>
                Setup guide <FaArrowRight size={9} />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

const APP_FEATS = [
  { icon: <FaSearch size={14} />, color: "#f472b6", label: "Player Lookup", desc: "Search by Java username, Bedrock gamertag or UUID. 3D skin preview." },
  { icon: <FaServer size={14} />, color: "#60a5fa", label: "Server Tracker", desc: "Real-time status, push notifications. Free: 1 slot, up to 10 on paid plans." },
  { icon: <FaPalette size={14} />, color: "#a78bfa", label: "Skin Editor", desc: "Browse community skins, upload your own, edit pixel by pixel, apply to your account." },
  { icon: <FaBox size={14} />, color: C.accent, label: "Resource Packs", desc: "Apply and manage server resource packs directly from the app. Pack merger also available on the website.", beta: true },
  { icon: <FaComments size={14} />, color: "#fb923c", label: "Friends & Chat", desc: "Add friends, see their online status and send direct messages inside the app." },
  { icon: <FaLink size={14} />, color: "#34d399", label: "Account Linking", desc: "Link your Xbox/Bedrock and Java accounts via Microsoft device-code flow." },
];

function AppSection() {
  return (
    <section style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="app-grid">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <AppShowcase />
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Pill>The app</Pill>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800, color: C.text, margin: "16px 0 6px", letterSpacing: "-0.03em" }}>
              More than just a relay
            </h2>
            <p style={{ fontSize: 14, color: C.secondary, margin: "0 0 28px", lineHeight: 1.7 }}>
              A full Minecraft companion, available on Windows, macOS, Android and iOS in 16 languages.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
              {APP_FEATS.map(f => (
                <div key={f.label} style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  padding: "12px 14px", borderRadius: 10,
                  background: C.surface, border: `1px solid ${C.border}`,
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: f.color + "18", border: `1px solid ${f.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center", color: f.color,
                  }}>{f.icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{f.label}</span>
                      {f.beta && <span style={{ fontSize: 9, fontWeight: 700, color: C.accent, background: C.accentDim, border: `1px solid ${C.accentBorder}`, padding: "1px 5px", borderRadius: 4 }}>BETA</span>}
                    </div>
                    <span style={{ fontSize: 12, color: C.secondary, lineHeight: 1.6 }}>{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PLATFORMS.map(p => <PlatformBtn key={p.label} {...p} small />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LiveSection() {
  return (
    <section style={{
      background: C.surface,
      borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
      padding: "80px 24px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 64 }}>

        <div>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Pill color="#7289da" dim="rgba(114,137,218,0.08)" border="rgba(114,137,218,0.25)">Discord bot</Pill>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 800, color: C.text, margin: "16px 0 8px", letterSpacing: "-0.03em" }}>
              Server status, <span style={{ color: "#7289da" }}>always live</span>
            </h2>
            <p style={{ fontSize: 15, color: C.secondary, margin: "0 0 8px" }}>
              Auto-updating embeds in any Discord channel. Java &amp; Bedrock. Direct TCP/UDP pings.
            </p>
            <a href="/docs/discord-bot/discord-bot-setup" style={{
              display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600,
              color: "#7289da", textDecoration: "none",
            }}>
              Setup guide <FaArrowRight size={10} />
            </a>
          </div>
          <DiscordBotSection />
        </div>

        <div>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Pill color="#34d399" dim="rgba(52,211,153,0.08)" border="rgba(52,211,153,0.25)">Xbox relay network</Pill>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 800, color: C.text, margin: "16px 0 8px", letterSpacing: "-0.03em" }}>
              Always online, <span style={{ color: "#34d399" }}>EU &amp; US</span>
            </h2>
            <p style={{ fontSize: 15, color: C.secondary, margin: 0 }}>
              Dedicated Xbox bots in Europe and the United States, used by DNS Mode and Friends Mode 24/7.
            </p>
          </div>
          <BotStatus />
        </div>

      </div>
    </section>
  );
}

function ServersSection() {
  return (
    <section style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Pill>Featured servers</Pill>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 800, color: C.text, margin: "16px 0 8px", letterSpacing: "-0.03em" }}>
            Discover new worlds
          </h2>

        </div>
        <FeaturedServersCarousel />
      </div>
    </section>
  );
}

function BottomCTAs() {
  return (
    <section style={{
      background: C.surface,
      borderTop: `1px solid ${C.border}`,
      padding: "72px 24px 80px",
    }}>
      <div className="cta-grid" style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{
          padding: "36px 36px 32px",
          borderRadius: 18,
          background: `linear-gradient(135deg, ${C.elevated} 0%, #0e1a0b 100%)`,
          border: `1px solid ${C.accentBorder}`,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -50, right: -50, width: 220, height: 220,
            background: "radial-gradient(circle, rgba(103,228,4,0.09) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <Pill>Partner program</Pill>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "14px 0 10px", letterSpacing: "-0.02em" }}>
            Feature your server
          </h3>
          <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.7, margin: "0 0 20px" }}>
            Reach thousands of players through in-app featured placement, website listings and Discord.
            Standard $15/mo · Premium $50/mo.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 24 }}>
            {["Rotating featured spot in app & website", "Stats dashboard with real-time visit graphs", "Premium: hero placement on the connector page"].map(b => (
              <div key={b} style={{ display: "flex", gap: 8, fontSize: 12, color: C.secondary, alignItems: "flex-start" }}>
                <FaCheck size={10} color={C.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                {b}
              </div>
            ))}
          </div>
          <a href="/partner" style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "10px 20px", borderRadius: 10,
            background: C.accent, color: "#000",
            textDecoration: "none", fontSize: 13, fontWeight: 700,
          }}>
            View plans <FaArrowRight size={11} />
          </a>
        </div>

        <div style={{
          padding: "36px 36px 32px",
          borderRadius: 18,
          background: C.elevated,
          border: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column", alignItems: "flex-start",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: C.accentDim, border: `1px solid ${C.accentBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 18,
          }}>
            <img src="/img/icon.png" alt="MCCompanion" style={{ width: 36, height: 36, borderRadius: 9 }} />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
            Download MCCompanion
          </h3>
          <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.7, margin: "0 0 24px" }}>
            Free on every platform. No account required to start. Available in 16 languages.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {PLATFORMS.map(p => <PlatformBtn key={p.label} {...p} small />)}
          </div>
          <a href="/beta" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, color: C.muted, textDecoration: "none",
            padding: "6px 12px", borderRadius: 7,
            border: `1px solid ${C.border}`, background: C.surface,
          }}>
            <FaDownload size={10} /> Beta builds
          </a>
        </div>

      </div>
    </section>
  );
}

export default function Home() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("https://api.mccompanion.net/api/metrics")
      .then(r => r.json())
      .then(d => setStats({ servers: d.totalServers, joins: d.totalCount }))
      .catch(() => { });
  }, []);

  return (
    <Layout
      title="MCCompanion: Join any Minecraft server from your console"
      description="Connect PS4, PS5, Xbox and Switch to any Minecraft server. No mods, no port forwarding. Plus player lookup, skin editor, server tracker, Discord bot and more."
    >
      <style>{`
        .modes-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
        .app-grid   { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: start; }
        .cta-grid   { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 900px) {
          .modes-grid { grid-template-columns: repeat(2,1fr); }
          .app-grid   { grid-template-columns: 1fr; }
          .app-grid > div:first-child { display: none; }
          .cta-grid   { grid-template-columns: 1fr; }
        }
        @media (max-width: 500px) {
          .modes-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div style={{ background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", overflowX: "hidden" }}>
        <Hero stats={stats} />
        <RelayModes />
        <AppSection />
        <LiveSection />
        <ServersSection />
        <BottomCTAs />
      </div>
    </Layout>
  );
}
