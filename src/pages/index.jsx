import { useState, useEffect, useRef } from "react";
import {
  FaWindows, FaApple, FaAndroid, FaSearch, FaRobot,
  FaDiscord, FaArrowRight, FaChevronDown,
  FaDownload, FaBox, FaBolt, FaCheck, FaServer, FaComments,
  FaLink, FaPalette, FaLayerGroup, FaGamepad, FaCode,
} from "react-icons/fa";
import { motion, useInView } from "framer-motion";
import FeaturedServersCarousel from "../components/FeaturedServersCarousel";
import AppShowcase from "../components/AppShowcase";
import BotStatus from "../components/BotStatus";
import DiscordBotSection from "../components/DiscordBotSection";
import Layout from "@theme/Layout";

const C = {
  bg: "#0d0f14", surface: "#13161e", elevated: "#191c25", subtle: "#1e2129",
  border: "rgba(255,255,255,0.06)", borderMid: "rgba(255,255,255,0.10)",
  text: "#eaebee", secondary: "#8892a4", muted: "#4e5666",
  accent: "#67e404", accentDim: "rgba(103,228,4,0.08)", accentBorder: "rgba(103,228,4,0.22)",
};

const PLATFORMS = [
  { icon: <FaWindows size={13} />, label: "Windows", url: "https://apps.microsoft.com/detail/9NSFPT6D8PTR", color: "#60a5fa" },
  { icon: <FaApple size={13} />, label: "macOS", url: "https://apps.apple.com/us/app/mccompanion/id6747323142?platform=mac", color: "#c0c7d4" },
  { icon: <FaAndroid size={13} />, label: "Android", url: "https://play.google.com/store/apps/details?id=net.netherdev.netherLink", color: "#34d399" },
  { icon: <FaApple size={13} />, label: "iOS", url: "https://apps.apple.com/be/app/netherlink/id6747323142?l=en", color: "#c0c7d4" },
];

const up = (i = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
});

function Pill({ children, color = C.accent, dim = C.accentDim, border = C.accentBorder }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", padding: "4px 12px", borderRadius: 20, background: dim, border: `1px solid ${border}`, color }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
      {children}
    </span>
  );
}

function PlatformBtn({ icon, label, url, color, small }) {
  const [hov, setHov] = useState(false);
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: small ? "7px 13px" : "10px 20px", borderRadius: 10, background: hov ? C.elevated : C.surface, border: `1px solid ${hov ? color + "44" : C.border}`, boxShadow: hov ? `0 0 16px ${color}18` : "none", textDecoration: "none", color: C.text, fontSize: small ? 12 : 13, fontWeight: 500, transition: "all 0.18s" }}>
      <span style={{ color }}>{icon}</span>{label}
    </a>
  );
}

function Counter({ target, suffix = "" }) {
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
    }, 24);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span ref={ref}>{n > 0 ? n.toLocaleString() : "0"}{suffix}</span>;
}

function Hero({ stats }) {
  return (
    <section style={{ position: "relative", minHeight: "96vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "110px 24px 80px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${C.border} 1px,transparent 1px),linear-gradient(90deg,${C.border} 1px,transparent 1px)`, backgroundSize: "64px 64px", maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 1000, height: 700, background: "radial-gradient(ellipse at center, rgba(103,228,4,0.09) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 860, textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ marginBottom: 24 }}>
          <Pill>Free · 16 languages · All platforms</Pill>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontSize: "clamp(40px, 9vw, 88px)", fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.047em", margin: "0 0 22px", color: C.text }}>
          Join any server<br />
          <span style={{ background: "linear-gradient(135deg,#67e404 10%,#34d399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            from your console.
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.5 }}
          style={{ fontSize: "clamp(15px, 2vw, 18px)", color: C.secondary, lineHeight: 1.8, maxWidth: 580, margin: "0 auto 42px" }}>
          PS4, PS5, Xbox and Switch, connect to any Minecraft Java or Bedrock server without port forwarding. Resource packs, player lookup, skin editor and more. All free.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.5 }}
          style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 56 }}>
          {PLATFORMS.map(p => <PlatformBtn key={p.label} {...p} />)}
          <a href="/beta" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, background: C.accentDim, border: `1px solid ${C.accentBorder}`, textDecoration: "none", color: C.accent, fontSize: 13, fontWeight: 600 }}>
            <FaDownload size={12} /> Beta builds
          </a>
        </motion.div>

        {stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }} style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ display: "inline-flex", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, overflow: "hidden" }}>
              {[{ l: "servers tracked", v: stats.servers }, { l: "connections made", v: stats.joins }].map((s, i) => (
                <div key={s.l} style={{ padding: "20px 44px", textAlign: "center", borderLeft: i > 0 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 32, fontWeight: 700, color: C.accent, lineHeight: 1, marginBottom: 8 }}>
                    <Counter target={s.v} />
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.07em", textTransform: "uppercase" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 0.6 }} style={{ position: "absolute", bottom: 26, color: C.muted }}>
        <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2.4 }}><FaChevronDown size={12} /></motion.div>
      </motion.div>
    </section>
  );
}

const MODES = [
  { icon: "🎮", label: "Broadcast Mode", platforms: "PS4 · PS5 · Xbox", color: "#60a5fa", dim: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.22)", href: "/docs/howto/playstation-xbox-howto" },
  { icon: "🕹️", label: "DNS Mode", platforms: "Nintendo Switch", color: "#f472b6", dim: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.22)", href: "/docs/howto/nintendo-howto" },
  { icon: "👥", label: "Friends Mode", platforms: "All consoles", color: "#34d399", dim: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.22)", href: "/docs/howto/friend-howto" },
  { icon: "☕", label: "Java Mode", platforms: "Bedrock → Java", color: "#f59e0b", dim: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.22)", href: "/docs/howto/java-howto" },
];

function ConnectModes() {
  return (
    <section style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "72px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Pill>Console connect</Pill>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 38px)", fontWeight: 800, color: C.text, margin: "16px 0 10px", letterSpacing: "-0.03em" }}>Four ways to connect</h2>
          <p style={{ fontSize: 15, color: C.secondary, margin: 0 }}>Pick the mode that fits your setup. No mods, no port forwarding.</p>
        </div>
        <div className="modes-grid">
          {MODES.map((m, i) => (
            <motion.a key={m.label} href={m.href} {...up(i)}
              style={{ display: "block", textDecoration: "none", padding: "22px", borderRadius: 16, background: C.bg, border: `1px solid ${C.border}`, transition: "border-color 0.18s, background 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = m.border; e.currentTarget.style.background = m.dim; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg; }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{m.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: m.color, marginBottom: 16, fontWeight: 500 }}>{m.platforms}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.muted, fontWeight: 500 }}>Setup guide <FaArrowRight size={9} /></div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

const APP_FEATS = [
  { icon: <FaSearch size={13} />, color: "#f472b6", label: "Player Lookup", desc: "Search by Java username, Bedrock gamertag or UUID. 3D skin preview." },
  { icon: <FaServer size={13} />, color: "#60a5fa", label: "Server Tracker", desc: "Real-time status, push notifications. Free: 1 slot, up to 10 on paid plans." },
  { icon: <FaPalette size={13} />, color: "#a78bfa", label: "Skin Workshop", desc: "Browse community skins, upload your own, and edit pixel by pixel." },
  { icon: <FaBox size={13} />, color: C.accent, label: "Resource Packs", desc: "Apply and manage server resource packs directly from the app.", beta: true },
  { icon: <FaComments size={13} />, color: "#fb923c", label: "Friends & Chat", desc: "Add friends, see online status and send direct messages inside the app." },
  { icon: <FaLink size={13} />, color: "#34d399", label: "Account Linking", desc: "Link Xbox/Bedrock and Java accounts via Microsoft device-code flow." },
];

function AppSection() {
  return (
    <section style={{ padding: "88px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="app-grid">
          <div style={{ display: "flex", justifyContent: "center" }}><AppShowcase /></div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Pill>The app</Pill>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 38px)", fontWeight: 800, color: C.text, margin: "16px 0 8px", letterSpacing: "-0.03em" }}>More than just a relay</h2>
            <p style={{ fontSize: 14, color: C.secondary, margin: "0 0 28px", lineHeight: 1.75 }}>A full Minecraft companion, available on Windows, macOS, Android and iOS in 16 languages.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
              {APP_FEATS.map(f => (
                <div key={f.label} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "11px 14px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}` }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: f.color + "18", border: `1px solid ${f.color}28`, display: "flex", alignItems: "center", justifyContent: "center", color: f.color }}>{f.icon}</div>
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

const WEB_TOOLS = [
  {
    icon: "🎨",
    label: "Skin Workshop",
    desc: "Browse community skins, upload your own PNG, or edit pixel by pixel with the built-in UV editor.",
    color: "#a78bfa",
    dim: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.22)",
    href: "/skins",
    tags: ["Gallery", "Editor", "Upload"],
  },
  {
    icon: "📦",
    label: "Resource Packs",
    desc: "Browse curated Minecraft Bedrock resource packs. Apply them directly from the app or download.",
    color: C.accent,
    dim: C.accentDim,
    border: C.accentBorder,
    href: "/packs",
    tags: ["Bedrock", "Browse", "Free"],
  },
  {
    icon: "🧩",
    label: "RP Editor",
    desc: "Merge multiple resource packs into one .mcpack. Conflict resolver, file browser and manifest editor.",
    color: "#a78bfa",
    dim: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.22)",
    href: "/rpeditor",
    tags: ["Merge", "Conflicts", "No install"],
  },
  {
    icon: "🔍",
    label: "Player Lookup",
    desc: "Search any Java username, Bedrock gamertag or UUID. See skin, name history and server activity.",
    color: "#f472b6",
    dim: "rgba(244,114,182,0.08)",
    border: "rgba(244,114,182,0.22)",
    href: "/lookup",
    tags: ["Java", "Bedrock", "Skins"],
  },
  {
    icon: "📊",
    label: "Server Metrics",
    desc: "See how many players have joined your server through MCCompanion over time.",
    color: "#60a5fa",
    dim: "rgba(96,165,250,0.08)",
    border: "rgba(96,165,250,0.22)",
    href: "/metrics",
    tags: ["Stats", "Join count"],
  },
  {
    icon: "🟢",
    label: "Status",
    desc: "Live status of all MCCompanion services, including relay bots, API and Discord bot.",
    color: "#34d399",
    dim: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.22)",
    href: "/status",
    tags: ["Uptime", "Live"],
  },
  {
    icon: "⚡",
    label: "API",
    desc: "Public REST API for server data, player info and metrics. Free to use with rate limiting.",
    color: "#fbbf24",
    dim: "rgba(251,191,36,0.06)",
    border: "rgba(251,191,36,0.20)",
    href: "/api-docs",
    tags: ["REST", "Free", "Docs"],
  },
];

function WebToolsSection() {
  return (
    <section style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <Pill color="#a78bfa" dim="rgba(167,139,250,0.08)" border="rgba(167,139,250,0.22)">Web tools</Pill>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 38px)", fontWeight: 800, color: C.text, margin: "16px 0 10px", letterSpacing: "-0.03em" }}>
            Powerful tools,<br />right in your browser
          </h2>
          <p style={{ fontSize: 15, color: C.secondary, margin: 0 }}>No download required. Works on any device.</p>
        </div>

        <div className="tools-grid">
          {WEB_TOOLS.map((t, i) => (
            <motion.a key={t.label} href={t.href} {...up(i)}
              style={{ display: "flex", flexDirection: "column", textDecoration: "none", padding: "28px 26px", borderRadius: 18, background: C.bg, border: `1px solid ${C.border}`, transition: "all 0.2s", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = t.dim; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, background: `radial-gradient(circle, ${t.color}12 0%, transparent 70%)`, pointerEvents: "none" }} />

              <div style={{ fontSize: 36, marginBottom: 18 }}>{t.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 8, letterSpacing: "-0.02em" }}>{t.label}</div>
              <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.7, margin: "0 0 20px", flex: 1 }}>{t.desc}</p>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
                {t.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: t.color + "14", border: `1px solid ${t.color}28`, color: t.color, letterSpacing: "0.04em" }}>{tag}</span>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: t.color }}>
                Open tool <FaArrowRight size={10} />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveSection() {
  return (
    <section style={{ padding: "88px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 72 }}>
        <div>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <Pill color="#7289da" dim="rgba(114,137,218,0.08)" border="rgba(114,137,218,0.25)">Discord bot</Pill>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 38px)", fontWeight: 800, color: C.text, margin: "16px 0 8px", letterSpacing: "-0.03em" }}>
              Server status, <span style={{ color: "#7289da" }}>always live</span>
            </h2>
            <p style={{ fontSize: 15, color: C.secondary, margin: "0 0 8px" }}>Auto-updating embeds in any Discord channel. Java &amp; Bedrock.</p>
            <a href="/docs/discord-bot/discord-bot-setup" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#7289da", textDecoration: "none" }}>
              Setup guide <FaArrowRight size={10} />
            </a>
          </div>
          <DiscordBotSection />
        </div>

        <div>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <Pill color="#34d399" dim="rgba(52,211,153,0.08)" border="rgba(52,211,153,0.25)">Xbox relay network</Pill>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 38px)", fontWeight: 800, color: C.text, margin: "16px 0 8px", letterSpacing: "-0.03em" }}>
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
    <section style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Pill>Featured servers</Pill>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 38px)", fontWeight: 800, color: C.text, margin: "16px 0 8px", letterSpacing: "-0.03em" }}>Discover new worlds</h2>
        </div>
        <FeaturedServersCarousel />
      </div>
    </section>
  );
}

function BottomCTAs() {
  return (
    <section style={{ padding: "80px 24px 96px" }}>
      <div className="cta-grid" style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ padding: "36px", borderRadius: 20, background: `linear-gradient(135deg, ${C.elevated} 0%, #0e1a0b 100%)`, border: `1px solid ${C.accentBorder}`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, background: "radial-gradient(circle, rgba(103,228,4,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
          <Pill>Partner program</Pill>
          <h3 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: "16px 0 10px", letterSpacing: "-0.02em" }}>Feature your server</h3>
          <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.75, margin: "0 0 20px" }}>
            Reach thousands of players through in-app featured placement, website listings and Discord. Standard $15/mo · Premium $50/mo.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 26 }}>
            {["Rotating featured spot in app & website", "Stats dashboard with real-time visit graphs", "Premium: hero placement on the connector page"].map(b => (
              <div key={b} style={{ display: "flex", gap: 8, fontSize: 12, color: C.secondary, alignItems: "flex-start" }}>
                <FaCheck size={10} color={C.accent} style={{ flexShrink: 0, marginTop: 2 }} />{b}
              </div>
            ))}
          </div>
          <a href="/partner" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 22px", borderRadius: 10, background: C.accent, color: "#000", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
            View plans <FaArrowRight size={11} />
          </a>
        </div>

        <div style={{ padding: "36px", borderRadius: 20, background: C.elevated, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: C.accentDim, border: `1px solid ${C.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
            <img src="/img/icon.png" alt="MCCompanion" style={{ width: 36, height: 36, borderRadius: 9 }} />
          </div>
          <h3 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: "0 0 10px", letterSpacing: "-0.02em" }}>Download MCCompanion</h3>
          <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.75, margin: "0 0 24px" }}>Free on every platform. No account required to start. Available in 16 languages.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {PLATFORMS.map(p => <PlatformBtn key={p.label} {...p} small />)}
          </div>
          <a href="/beta" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted, textDecoration: "none", padding: "6px 12px", borderRadius: 7, border: `1px solid ${C.border}`, background: C.surface }}>
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
        .modes-grid  { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
        .app-grid    { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
        .tools-grid  { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .cta-grid    { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 960px) {
          .modes-grid  { grid-template-columns: repeat(2,1fr); }
          .tools-grid  { grid-template-columns: repeat(2,1fr); }
          .app-grid    { grid-template-columns: 1fr; }
          .app-grid > div:first-child { display: none; }
          .cta-grid    { grid-template-columns: 1fr; }
        }
        @media (max-width: 540px) {
          .modes-grid  { grid-template-columns: 1fr 1fr; }
          .tools-grid  { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", overflowX: "hidden" }}>
        <Hero stats={stats} />
        <ConnectModes />
        <AppSection />
        <WebToolsSection />
        <LiveSection />
        <ServersSection />
        <BottomCTAs />
      </div>
    </Layout>
  );
}
