import { useState, useEffect, useRef } from "react";
import { FaWindows, FaApple, FaAndroid, FaDownload, FaHeart, FaArrowRight, FaPlaystation, FaXbox, FaGamepad, FaYoutube } from "react-icons/fa";
import FeaturedServersCarousel from "../components/FeaturedServersCarousel";
import Layout from "@theme/Layout";
import { T } from "../lib/tokens";
import { API_BASE as API } from "../lib/api";

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
      ctx.drawImage(img, 8, 8, 8, 8, 4 * s, 0, 8 * s, 8 * s);
      ctx.drawImage(img, 40, 8, 8, 8, 4 * s, 0, 8 * s, 8 * s);
      ctx.drawImage(img, 20, 20, 8, 12, 4 * s, 8 * s, 8 * s, 12 * s);
      ctx.drawImage(img, 44, 20, 4, 12, 0, 8 * s, 4 * s, 12 * s);
      ctx.drawImage(img, 36, 52, 4, 12, 12 * s, 8 * s, 4 * s, 12 * s);
      ctx.drawImage(img, 4, 20, 4, 12, 4 * s, 20 * s, 4 * s, 12 * s);
      ctx.drawImage(img, 20, 52, 4, 12, 8 * s, 20 * s, 4 * s, 12 * s);
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

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

const ACTIVITY_META = {
  skin_upload: { color: "#67e404", tag: "new skin" },
  pack_approved: { color: "#60a5fa", tag: "pack" },
  joined: { color: "#34d399", tag: "joined" },
};

const PLATFORMS = [
  { icon: <FaWindows size={13} />, label: "Windows", url: "https://apps.microsoft.com/detail/9NSFPT6D8PTR" },
  { icon: <FaApple size={13} />, label: "macOS", url: "https://apps.apple.com/us/app/mccompanion/id6747323142?platform=mac" },
  { icon: <FaAndroid size={13} />, label: "Android", url: "https://play.google.com/store/apps/details?id=net.netherdev.netherLink" },
  { icon: <FaApple size={13} />, label: "iOS", url: "https://apps.apple.com/be/app/netherlink/id6747323142?l=en" },
];

const CONSOLES = [
  { icon: <FaPlaystation size={14} />, label: "PlayStation 4 & 5", href: "/docs/howto/playstation-xbox-howto", color: "#60a5fa" },
  { icon: <FaXbox size={14} />, label: "Xbox Series & One", href: "/docs/howto/playstation-xbox-howto", color: "#34d399" },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="2" width="8" height="20" rx="3" />
        <rect x="14" y="2" width="8" height="20" rx="3" />
        <circle cx="6" cy="7" r="1.5" fill="white" />
        <circle cx="6" cy="16" r="2.4" fill="white" opacity="0.95" />
        <circle cx="18" cy="9" r="2.4" fill="white" opacity="0.95" />
        <circle cx="18" cy="17" r="1.5" fill="white" />
      </svg>
    ),
    label: "Nintendo Switch", href: "/docs/howto/nintendo-howto", color: "#f472b6",
  },
  { icon: <FaGamepad size={14} />, label: "All consoles", href: "/docs/howto/friend-howto", color: "#fb923c" },
];

const WEB_TOOLS = [
  { e: "🔍", label: "Player Lookup", href: "/lookup" },
  { e: "🎨", label: "Skin Workshop", href: "/skins" },
  { e: "🧩", label: "RP Editor", href: "/rpeditor" },
  { e: "📊", label: "Server Metrics", href: "/metrics" },
  { e: "⚡", label: "API Docs", href: "/api-docs" },
];

function RightSidebar({ activity }) {
  const uniqueActivity = [];
  const seenAct = new Set();
  for (const e of activity) {
    const key = `${e.username}:${e.type}`;
    if (!seenAct.has(key)) { seenAct.add(key); uniqueActivity.push(e); }
    if (uniqueActivity.length >= 15) break;
  }

  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      <div style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid " + T.border }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#67e404" }}>Web tools</p>
        </div>
        <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {WEB_TOOLS.map(w => (
            <a key={w.label} href={w.href}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 7, textDecoration: "none", color: T.text, fontSize: 12, fontWeight: 600, transition: "background 0.12s" }}
              onMouseEnter={e => e.currentTarget.style.background = T.raised}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ fontSize: 13 }}>{w.e}</span>{w.label}
            </a>
          ))}
        </div>
      </div>

      {uniqueActivity.length >= 3 && (
        <div style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid " + T.border, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#34d399" }}>Recent activity</p>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: T.muted }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399", display: "inline-block", animation: "pulse 2s infinite" }} />
              live
            </span>
          </div>
          <div>
            {uniqueActivity.map((e, i) => {
              const meta = ACTIVITY_META[e.type] ?? { color: T.sub, tag: e.type };
              return (
                <a key={i} href={`/u?name=${e.username}`}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", textDecoration: "none", borderBottom: i < uniqueActivity.length - 1 ? "1px solid " + T.border : "none", transition: "background 0.1s" }}
                  onMouseEnter={el => el.currentTarget.style.background = meta.color + "08"}
                  onMouseLeave={el => el.currentTarget.style.background = "transparent"}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: meta.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.text, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.displayName || e.username}
                  </span>
                  <span style={{ fontSize: 10, color: meta.color, fontWeight: 600, flexShrink: 0 }}>{meta.tag}</span>
                  <span style={{ fontSize: 10, color: T.muted, flexShrink: 0, minWidth: 22, textAlign: "right" }}>{timeAgo(e.createdAt)}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      <a href="/partner"
        style={{ display: "block", background: T.surface, border: "1px solid " + T.border, borderRadius: 12, padding: "14px", textDecoration: "none", transition: "border-color 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#f59e0b50"}
        onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
        <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#f59e0b" }}>Feature your server</p>
        <p style={{ margin: 0, fontSize: 12, color: T.sub, lineHeight: 1.5 }}>Get featured on the homepage and inside the app. Reach thousands of players.</p>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>Learn more <FaArrowRight size={9} /></span>
      </a>
    </aside>
  );
}

function DownloadCard({ stats }) {
  return (
    <div style={{
      position: "relative", overflow: "hidden", marginBottom: 12,
      background: `linear-gradient(135deg, #0f2027 0%, #1a2f1a 50%, #0f2027 100%)`,
      border: "1px solid " + T.border, borderRadius: 12,
    }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(52,211,153,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(52,211,153,0.04) 1px,transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", padding: "24px 20px 16px", textAlign: "center" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 20, background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)", marginBottom: 10 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.green, display: "inline-block" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: T.green, letterSpacing: "0.06em" }}>100% FREE</span>
          </div>
          <h2 style={{ margin: "0 0 6px", fontSize: "clamp(20px,2.5vw,28px)", fontWeight: 900, color: "#fff", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            Your Minecraft companion.<br />
            <span style={{ color: T.green }}>On every platform.</span>
          </h2>
          <p style={{ margin: "0 auto", fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, maxWidth: 460 }}>
            Console connector · Skin workshop · Player lookup · Resource packs · 16 languages
          </p>
          {stats && (
            <div style={{ display: "inline-flex", gap: 24, marginTop: 12 }}>
              {[{ n: stats.servers, l: "servers" }, { n: stats.joins, l: "connections" }].map(s => (
                <div key={s.l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{s.n?.toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 6 }}>
          {PLATFORMS.map(p => (
            <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", borderRadius: 8, textDecoration: "none", color: "#fff", fontSize: 12, fontWeight: 700, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", transition: "background 0.15s, border-color 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(52,211,153,0.15)"; e.currentTarget.style.borderColor = "rgba(52,211,153,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}>
              <span style={{ opacity: 0.7 }}>{p.icon}</span>{p.label}
            </a>
          ))}
        </div>

        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", flexWrap: "wrap", gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", textTransform: "uppercase", alignSelf: "center", marginRight: 4 }}>Console setup:</span>
          {CONSOLES.map(c => (
            <a key={c.label} href={c.href}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, textDecoration: "none", fontSize: 11, fontWeight: 600, color: c.color, background: c.color + "12", border: "1px solid " + c.color + "30", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = c.color + "22"}
              onMouseLeave={e => e.currentTarget.style.background = c.color + "12"}>
              {c.icon} {c.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: T.surface, border: "1px solid " + T.border, borderRadius: 12, overflow: "hidden", marginBottom: 12, ...style }}>
      {children}
    </div>
  );
}

function CardHeader({ label, labelColor, title, action }) {
  return (
    <div style={{ padding: "12px 16px", borderBottom: "1px solid " + T.border, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        {label && <p style={{ margin: "0 0 1px", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: labelColor || T.muted }}>{label}</p>}
        {title && <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: T.text }}>{title}</p>}
      </div>
      {action}
    </div>
  );
}

function TrendingCard({ skins, packs, packCreators }) {
  const [filter, setFilter] = useState("all");

  const skinItems = skins.slice(0, 8).map(s => ({ type: "skin", ...s }));
  const packItems = [...(packs || [])].sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0)).slice(0, 6).map(p => ({ type: "pack", ...p }));

  const all = [];
  let si = 0, pi = 0;
  while (si < skinItems.length || pi < packItems.length) {
    if (si < skinItems.length) all.push(skinItems[si++]);
    if (si < skinItems.length) all.push(skinItems[si++]);
    if (pi < packItems.length) all.push(packItems[pi++]);
  }

  const items = filter === "skins" ? skinItems : filter === "packs" ? packItems : all;

  const creators = [];
  const seen = new Set();
  for (const s of skins) {
    if (s.username && !seen.has(s.username)) { seen.add(s.username); creators.push(s); }
    if (creators.length >= 6) break;
  }
  for (const p of (packCreators || [])) {
    if (p.username && !seen.has(p.username)) { seen.add(p.username); creators.push({ ...p, _isPack: true }); }
    if (creators.length >= 8) break;
  }

  if (!skinItems.length && !packItems.length) return null;

  return (
    <Card>
      <CardHeader
        label="Community"
        labelColor="#67e404"
        title="Trending content"
        action={
          <div style={{ display: "flex", gap: 3, background: T.bg, border: "1px solid " + T.border, borderRadius: 7, padding: 2 }}>
            {[["all", "All"], ["skins", "🎨 Skins"], ["packs", "📦 Packs"]].map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)}
                style={{ padding: "3px 9px", borderRadius: 5, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: filter === v ? "#67e404" : "transparent", color: filter === v ? "#fff" : T.sub, transition: "all 0.15s" }}>
                {l}
              </button>
            ))}
          </div>
        }
      />

      <div style={{ padding: "12px 14px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
        {items.map((item, i) =>
          item.type === "skin" ? (
            <a key={"s" + i} href={`/skins?skin=${item.id}`}
              style={{ display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: T.bg, border: "1px solid " + T.border, textDecoration: "none", transition: "border-color 0.15s, transform 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#67e40450"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ background: "linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)", display: "flex", justifyContent: "center", alignItems: "flex-end", padding: "16px 12px 0", minHeight: 120, position: "relative" }}>
                <span style={{ position: "absolute", top: 6, left: 8, fontSize: 9, fontWeight: 800, color: "#67e404", background: "rgba(103,228,4,0.15)", border: "1px solid rgba(103,228,4,0.3)", padding: "1px 6px", borderRadius: 20, letterSpacing: "0.05em" }}>🎨 SKIN</span>
                <SkinBody url={item.public_url} scale={4} />
              </div>
              <div style={{ padding: "8px 10px" }}>
                <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {item.username && <span style={{ fontSize: 10, color: T.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.display_name || item.username}</span>}
                  {item.like_count > 0 && <span style={{ fontSize: 10, color: "#f87171", display: "inline-flex", alignItems: "center", gap: 2, flexShrink: 0 }}><FaHeart size={7} />{item.like_count}</span>}
                </div>
              </div>
            </a>
          ) : (
            <a key={"p" + i} href={`/packs?slug=${item.slug || item.id}`}
              style={{ display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", background: T.bg, border: "1px solid " + T.border, textDecoration: "none", transition: "border-color 0.15s, transform 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#60a5fa50"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ position: "relative" }}>
                {item.thumbnailUrl
                  ? <img src={item.thumbnailUrl} alt={item.name} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }} />
                  : <div style={{ width: "100%", aspectRatio: "16/9", background: "rgba(96,165,250,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>📦</div>
                }
                <span style={{ position: "absolute", top: 6, left: 8, fontSize: 9, fontWeight: 800, color: "#60a5fa", background: "rgba(96,165,250,0.2)", border: "1px solid rgba(96,165,250,0.35)", padding: "1px 6px", borderRadius: 20, letterSpacing: "0.05em" }}>📦 PACK</span>
              </div>
              <div style={{ padding: "8px 10px" }}>
                <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {item.category && <span style={{ fontSize: 10, color: "#60a5fa", fontWeight: 600 }}>{item.category}</span>}
                  {item.downloadCount > 0 && <span style={{ fontSize: 10, color: T.muted }}>↓ {item.downloadCount.toLocaleString()}</span>}
                </div>
              </div>
            </a>
          )
        )}
      </div>

      {creators.length > 0 && (
        <div style={{ padding: "10px 14px 14px", borderTop: "1px solid " + T.border }}>
          <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: T.muted }}>Meet the creators</p>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 2 }}>
            {creators.map((c, i) => (
              <a key={i} href={`/u?name=${c.username}`}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textDecoration: "none", flexShrink: 0, minWidth: 52 }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", overflow: "hidden", background: c._isPack ? "rgba(96,165,250,0.12)" : "rgba(103,228,4,0.12)", border: "2px solid " + (c._isPack ? "rgba(96,165,250,0.3)" : "rgba(103,228,4,0.3)"), display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 4 }}>
                  {c._isPack && c.avatar_url
                    ? <img src={c.avatar_url} alt={c.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.currentTarget.style.display = "none"} />
                    : c._isPack
                      ? <span style={{ fontSize: 14, fontWeight: 700, color: "#60a5fa" }}>{(c.username || "?")[0].toUpperCase()}</span>
                      : <SkinBody url={c.public_url} scale={2} />
                  }
                </div>
                <span style={{ fontSize: 9, fontWeight: 600, color: T.sub, textAlign: "center", maxWidth: 52, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.display_name || c.username}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

const TUTORIAL_VIDEO_ID = "sZUB2084P6E";

function TutorialVideoCard() {
  return (
    <Card>
      <CardHeader
        label="Tutorial"
        labelColor="#f87171"
        title="See MCCompanion in action"
        action={
          <a href={`https://www.youtube.com/watch?v=${TUTORIAL_VIDEO_ID}`} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#f87171", textDecoration: "none" }}>
            <FaYoutube size={14} /> Watch on YouTube
          </a>
        }
      />
      <div style={{ padding: "12px 14px" }}>
        <div style={{ position: "relative", aspectRatio: "16/9", borderRadius: 10, overflow: "hidden", background: "#000", border: "1px solid " + T.border }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${TUTORIAL_VIDEO_ID}`}
            title="MCCompanion tutorial"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          />
        </div>
      </div>
    </Card>
  );
}

function ServersCard() {
  return (
    <Card>
      <CardHeader
        label="Featured servers"
        labelColor="#f59e0b"
        title="Community servers"
        action={<a href="/partner" style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", textDecoration: "none" }}>Feature yours →</a>}
      />
      <div style={{ padding: "12px 14px" }}>
        <FeaturedServersCarousel />
      </div>
    </Card>
  );
}

export default function Home() {
  const [stats, setStats] = useState(null);
  const [skins, setSkins] = useState([]);
  const [packCreators, setPackCreators] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [featuredPacks, setFeaturedPacks] = useState([]);

  useEffect(() => {
    fetch(API + "/api/home")
      .then(r => r.json())
      .then(d => {
        setStats({ servers: d.stats?.totalServers, joins: d.stats?.totalCount });
        setSkins(d.skins || []);
        setPackCreators(d.packCreators || []);
        setRecentActivity(d.recentActivity || []);
        setFeaturedPacks(d.featuredPacks || []);
      })
      .catch(() => { });
  }, []);

  return (
    <Layout
      title="MCCompanion — Minecraft community hub"
      description="Free Minecraft companion app. Console relay, skin workshop, player lookup, server tracker, Discord bot and more."
    >
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .cl { display:grid; grid-template-columns:1fr 260px; gap:16px; max-width:1060px; margin:0 auto; padding:16px; align-items:start; }
        .cl-right { position:sticky; top:16px; }
        @media(max-width:720px){ .cl{ grid-template-columns:1fr; } .cl-right{ position:static; } }
      `}</style>

      <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "'Inter',system-ui,sans-serif", borderTop: "1px solid " + T.border }}>
        <div className="cl">

          <main style={{ minWidth: 0 }}>

            <DownloadCard stats={stats} />
            <TutorialVideoCard />
            <TrendingCard skins={skins} packs={featuredPacks} packCreators={packCreators} />
            <ServersCard />
          </main>

          <div className="cl-right">
            <RightSidebar activity={recentActivity} />
          </div>

        </div>
      </div>
    </Layout>
  );
}
