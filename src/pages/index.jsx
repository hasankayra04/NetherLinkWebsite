import { useState, useEffect, useRef } from "react";
import { FaWindows, FaApple, FaAndroid, FaDownload, FaHeart, FaArrowRight, FaPlaystation, FaXbox, FaGamepad } from "react-icons/fa";
import FeaturedServersCarousel from "../components/FeaturedServersCarousel";
import BotStatus from "../components/BotStatus";
import DiscordBotSection from "../components/DiscordBotSection";
import Layout from "@theme/Layout";
import { T } from "../lib/tokens";

const API = "https://api.mccompanion.net";

function SkinBody({ url, scale = 3 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !url) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;
      const s = scale;
      ctx.drawImage(img,  8,  8, 8,  8,  4*s,  0,   8*s, 8*s);
      ctx.drawImage(img, 40,  8, 8,  8,  4*s,  0,   8*s, 8*s);
      ctx.drawImage(img, 20, 20, 8, 12,  4*s,  8*s, 8*s, 12*s);
      ctx.drawImage(img, 44, 20, 4, 12,  0,    8*s, 4*s, 12*s);
      ctx.drawImage(img, 36, 52, 4, 12,  12*s, 8*s, 4*s, 12*s);
      ctx.drawImage(img,  4, 20, 4, 12,  4*s,  20*s, 4*s, 12*s);
      ctx.drawImage(img, 20, 52, 4, 12,  8*s,  20*s, 4*s, 12*s);
    };
    img.onerror = () => {
      const fb = new Image();
      fb.onload = () => { ctx.imageSmoothingEnabled = false; ctx.drawImage(fb, 0, 0, canvas.width, canvas.height); };
      fb.src = url;
    };
    img.src = url;
  }, [url, scale]);
  return <canvas ref={ref} width={16 * scale} height={32 * scale} style={{ display: "block", imageRendering: "pixelated" }} />;
}

const PLATFORMS = [
  { icon: <FaWindows size={14} />, label: "Windows", url: "https://apps.microsoft.com/detail/9NSFPT6D8PTR" },
  { icon: <FaApple size={14} />, label: "macOS", url: "https://apps.apple.com/us/app/mccompanion/id6747323142?platform=mac" },
  { icon: <FaAndroid size={14} />, label: "Android", url: "https://play.google.com/store/apps/details?id=net.netherdev.netherLink" },
  { icon: <FaApple size={14} />, label: "iOS", url: "https://apps.apple.com/be/app/netherlink/id6747323142?l=en" },
];

function Hero({ stats }) {
  return (
    <section style={{ background: T.bg, padding: "64px 24px 56px", textAlign: "center" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: T.green + "15", border: "1px solid " + T.green + "30", marginBottom: 24 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, display: "inline-block" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: T.green }}>100% free on all platforms</span>
        </span>

        <h1 style={{ fontSize: "clamp(32px,6vw,60px)", fontWeight: 900, color: T.text, margin: "0 0 16px", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
          Your complete<br />
          <span style={{ color: T.green }}>Minecraft companion.</span>
        </h1>

        <p style={{ fontSize: "clamp(15px,2vw,18px)", color: T.sub, margin: "0 0 32px", lineHeight: 1.7, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          Console relay, skin editor, player lookup, resource packs, server tracker, Discord bot and more. All free, in 16 languages.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 32 }}>
          {PLATFORMS.map(p => (
            <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, background: T.surface, border: "1px solid " + T.borderMid, textDecoration: "none", color: T.text, fontSize: 14, fontWeight: 600, transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = T.raised}
              onMouseLeave={e => e.currentTarget.style.background = T.surface}>
              {p.icon} {p.label}
            </a>
          ))}
        </div>

        {stats && (
          <div style={{ display: "inline-flex", gap: 32, marginTop: 8 }}>
            {[{ n: stats.servers, l: "servers tracked" }, { n: stats.joins, l: "connections made" }].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, color: T.text, lineHeight: 1, letterSpacing: "-0.03em" }}>
                  {s.n?.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const CONSOLES = [
  { icon: <FaPlaystation size={36} />, name: "PlayStation 4 & 5", how: "Step-by-step setup guide", href: "/docs/howto/playstation-xbox-howto", color: "#60a5fa" },
  { icon: <FaXbox size={36} />, name: "Xbox Series & One", how: "Step-by-step setup guide", href: "/docs/howto/playstation-xbox-howto", color: T.green },
  {
    icon: (
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="2"
          y="2"
          width="8"
          height="20"
          rx="3"
          fill="currentColor"
        />

        <rect
          x="14"
          y="2"
          width="8"
          height="20"
          rx="3"
          fill="currentColor"
        />

        <rect
          x="11"
          y="2"
          width="2"
          height="20"
          rx="1"
          fill="currentColor"
          opacity="0.15"
        />

        <circle cx="6" cy="7" r="1.5" fill="white" />

        <circle cx="6" cy="16" r="2.4" fill="white" opacity="0.95" />

        <circle cx="18" cy="9" r="2.4" fill="white" opacity="0.95" />

        <circle cx="18" cy="17" r="1.5" fill="white" />
      </svg>
    ),
    name: "Nintendo Switch",
    how: "Step-by-step setup guide",
    href: "/docs/howto/nintendo-howto",
    color: "#f472b6",
  },
  { icon: <FaGamepad size={36} />, name: "All consoles", how: "Join via friend invite", href: "/docs/howto/friend-howto", color: "#fb923c" },
];

function ConsolesSection() {
  return (
    <section style={{ background: T.bgAlt, borderTop: "1px solid " + T.border, padding: "56px 24px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.green, textAlign: "center", marginBottom: 8 }}>Console connect</p>
        <h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, color: T.text, textAlign: "center", margin: "0 0 10px", letterSpacing: "-0.02em" }}>Which console do you play on?</h2>
        <p style={{ fontSize: 15, color: T.sub, textAlign: "center", margin: "0 auto 40px", maxWidth: 460, lineHeight: 1.65 }}>Tap your console to open the setup guide. Takes about 5 minutes.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {CONSOLES.map(c => (
            <a key={c.name} href={c.href}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "28px 16px", borderRadius: 16, background: T.surface, border: "1px solid " + T.border, textDecoration: "none", color: "inherit", transition: "border-color 0.15s, transform 0.15s", textAlign: "center" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = c.color + "60"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}>
              <span style={{ color: c.color }}>{c.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: c.color, fontWeight: 600 }}>{c.how} →</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { e: "🔍", title: "Player Lookup", desc: "Search any Minecraft player by name or ID. See their skin, name history and linked accounts.", href: "/lookup", color: "#f472b6" },
  { e: "🎨", title: "Skin Workshop", desc: "Browse thousands of community skins or upload and edit your own. Works in the app and in your browser.", href: "/skins", color: "#a78bfa" },
  { e: "📡", title: "Server Tracker", desc: "Follow your favourite servers. Get notified the moment they come back online.", href: null, color: "#60a5fa" },
  { e: "📦", title: "Resource Packs", desc: "Browse and apply Bedrock resource packs directly from the app.", href: "/packs", color: T.teal, badge: "Beta" },
  { e: "💬", title: "Friends & Chat", desc: "Add friends, see who's online and send messages inside MCCompanion.", href: null, color: "#fb923c" },
  { e: "🌍", title: "16 Languages", desc: "Available in Dutch, English, French, German, Spanish, Portuguese and 10 more.", href: null, color: T.muted },
];

function FeaturesSection() {
  return (
    <section style={{ background: T.bg, borderTop: "1px solid " + T.border, padding: "56px 24px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#60a5fa", textAlign: "center", marginBottom: 8 }}>App features</p>
        <h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, color: T.text, textAlign: "center", margin: "0 0 10px", letterSpacing: "-0.02em" }}>More than just a relay.</h2>
        <p style={{ fontSize: 15, color: T.sub, textAlign: "center", margin: "0 auto 40px", maxWidth: 460, lineHeight: 1.65 }}>Everything you need, all in one free app.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          {FEATURES.map(f => (
            <div key={f.title}
              style={{ padding: "22px", borderRadius: 14, background: T.surface, border: "1px solid " + T.border, position: "relative" }}>
              <span style={{ fontSize: 28, display: "block", marginBottom: 12 }}>{f.e}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{f.title}</span>
                {f.badge && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: f.color + "20", color: f.color }}>{f.badge}</span>}
              </div>
              <p style={{ fontSize: 13, color: T.sub, margin: "0 0 12px", lineHeight: 1.65 }}>{f.desc}</p>
              {f.href && (
                <a href={f.href} style={{ fontSize: 13, fontWeight: 600, color: f.color, textDecoration: "none" }}>Open →</a>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 32 }}>
          {PLATFORMS.map(p => (
            <a key={p.label} href="#start" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 8, background: T.surface, border: "1px solid " + T.border, textDecoration: "none", color: T.text, fontSize: 13, fontWeight: 500 }}>
              {p.icon} {p.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

const WEB = [
  { e: "🔍", title: "Player Lookup", href: "/lookup", color: "#f472b6" },
  { e: "🎨", title: "Skin Workshop", href: "/skins", color: "#a78bfa" },
  { e: "🧩", title: "RP Editor", href: "/rpeditor", color: "#a78bfa" },
  { e: "📊", title: "Server Metrics", href: "/metrics", color: "#60a5fa" },
  { e: "🟢", title: "Status", href: "/status", color: T.green },
  { e: "⚡", title: "API", href: "/api-docs", color: "#f59e0b" },
];

function WebToolsSection() {
  return (
    <section style={{ background: T.bgAlt, borderTop: "1px solid " + T.border, padding: "56px 24px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a78bfa", textAlign: "center", marginBottom: 8 }}>Browser tools</p>
        <h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, color: T.text, textAlign: "center", margin: "0 0 10px", letterSpacing: "-0.02em" }}>Works without the app.</h2>
        <p style={{ fontSize: 15, color: T.sub, textAlign: "center", margin: "0 auto 40px", maxWidth: 460, lineHeight: 1.65 }}>These tools run right in your browser. No download needed.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
          {WEB.map(w => (
            <a key={w.title} href={w.href}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "22px 12px", borderRadius: 14, background: T.surface, border: "1px solid " + T.border, textDecoration: "none", color: "inherit", textAlign: "center", transition: "border-color 0.15s, transform 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = w.color + "60"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}>
              <span style={{ fontSize: 30 }}>{w.e}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{w.title}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkinsSection({ skins }) {
  const row = [...skins, ...skins, ...skins];
  if (!skins.length) return null;
  return (
    <section style={{ background: T.bg, borderTop: "1px solid " + T.border, padding: "56px 0" }}>
      <div style={{ maxWidth: 860, margin: "0 auto 28px", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a78bfa", margin: "0 0 4px" }}>Skin Workshop</p>
          <h2 style={{ fontSize: "clamp(20px,3vw,32px)", fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>Community skins.</h2>
        </div>
        <a href="/skins" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 10, background: "#a78bfa", textDecoration: "none", color: "#fff", fontSize: 13, fontWeight: 700 }}>
          Browse & upload <FaArrowRight size={10} />
        </a>
      </div>
      <style>{`@keyframes sk{from{transform:translateX(0)}to{transform:translateX(-33.33%)}}.sk-row{display:flex;gap:10px;width:max-content;animation:sk 70s linear infinite}.sk-row:hover{animation-play-state:paused}`}</style>
      <div style={{ paddingLeft: 24, overflow: "hidden" }}>
        <div className="sk-row">
          {row.map((s, i) => (
            <a key={i} href="/skins"
              style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "12px 10px", borderRadius: 12, background: T.surface, border: "1px solid " + T.border, width: 72, textDecoration: "none", transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#a78bfa50"}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
              <SkinBody url={s.public_url} scale={3} />
              <div style={{ width: "100%", textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                {s.username && (
                  <a href={`/u?name=${s.username}`}
                    onClick={e => e.stopPropagation()}
                    style={{ fontSize: 9, color: T.green, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1, display: "block", textDecoration: "none" }}>
                    {s.display_name || s.username}
                  </a>
                )}
                {s.like_count > 0 && (
                  <span style={{ fontSize: 9, color: "#f87171", display: "inline-flex", alignItems: "center", gap: 2, marginTop: 2 }}>
                    <FaHeart size={7} />{s.like_count}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function DiscordSection() {
  return (
    <section style={{ background: T.bgAlt, borderTop: "1px solid " + T.border, padding: "56px 24px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5865f2", textAlign: "center", marginBottom: 8 }}>Discord bot</p>
        <h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, color: T.text, textAlign: "center", margin: "0 0 10px", letterSpacing: "-0.02em" }}>Live server status in Discord.</h2>
        <p style={{ fontSize: 15, color: T.sub, textAlign: "center", margin: "0 auto 36px", maxWidth: 440, lineHeight: 1.65 }}>
          Auto-updating embeds for Java and Bedrock servers. Free to add to any Discord server.
        </p>
        <DiscordBotSection />
      </div>
    </section>
  );
}

function RelaySection() {
  return (
    <section style={{ background: T.bg, borderTop: "1px solid " + T.border, padding: "56px 24px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.teal, textAlign: "center", marginBottom: 8 }}>Xbox relay</p>
        <h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 800, color: T.text, textAlign: "center", margin: "0 0 10px", letterSpacing: "-0.02em" }}>Always online. EU and US.</h2>
        <p style={{ fontSize: 15, color: T.sub, textAlign: "center", margin: "0 auto 36px", maxWidth: 440, lineHeight: 1.65 }}>
          Dedicated relay bots running 24/7 so you can always connect from your console.
        </p>
        <BotStatus />
      </div>
    </section>
  );
}

function ServersSection() {
  return (
    <section style={{ background: T.bg, borderTop: "1px solid " + T.border, padding: "56px 24px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#f59e0b", margin: "0 0 4px" }}>Community</p>
            <h2 style={{ fontSize: "clamp(20px,3vw,32px)", fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>Featured servers.</h2>
          </div>
          <a href="/partner" style={{ fontSize: 13, fontWeight: 600, color: T.green, textDecoration: "none" }}>Feature your server →</a>
        </div>
        <FeaturedServersCarousel />
      </div>
    </section>
  );
}

function DownloadCTA() {
  return (
    <section style={{ background: T.bgAlt, borderTop: "1px solid " + T.border, padding: "64px 24px", textAlign: "center" }}>
      <div style={{ maxWidth: 540, margin: "0 auto" }}>
        <h2 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, color: T.text, margin: "0 0 12px", letterSpacing: "-0.03em" }}>
          Ready? <span style={{ color: T.green }}>It's free.</span>
        </h2>
        <p style={{ fontSize: 15, color: T.sub, margin: "0 0 28px", lineHeight: 1.65 }}>Download and play in minutes.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {PLATFORMS.map(p => (
            <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, background: T.surface, border: "1px solid " + T.borderMid, textDecoration: "none", color: T.text, fontSize: 14, fontWeight: 600 }}>
              {p.icon} {p.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [stats, setStats] = useState(null);
  const [skins, setSkins] = useState([]);

  useEffect(() => {
    fetch(API + "/api/metrics").then(r => r.json()).then(d => setStats({ servers: d.totalServers, joins: d.totalCount })).catch(() => { });
    Promise.all([
      fetch(API + "/api/skins/top?limit=30").then(r => r.json()).catch(() => ({ skins: [] })),
      fetch(API + "/api/skins?limit=30").then(r => r.json()).catch(() => ({ skins: [] })),
    ]).then(([a, b]) => {
      const map = new Map();
      [...(a.skins || []), ...(b.skins || [])].forEach(s => { if (!map.has(s.id)) map.set(s.id, s); });
      setSkins([...map.values()].slice(0, 30));
    });
  }, []);

  return (
    <Layout
      title="MCCompanion: Connect any console to any Minecraft server"
      description="Free Minecraft companion app. Console relay, skin workshop, player lookup, server tracker, Discord bot and more."
    >
      <div style={{ background: T.bg, fontFamily: "'Inter',system-ui,sans-serif" }}>
        <Hero stats={stats} />
        <ConsolesSection />
        <FeaturesSection />
        <WebToolsSection />
        <SkinsSection skins={skins} />
        <DiscordSection />
        <RelaySection />
        <ServersSection />
        <DownloadCTA />
      </div>
    </Layout>
  );
}
