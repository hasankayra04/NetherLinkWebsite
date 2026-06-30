import React, { useEffect, useState, useRef } from "react";
import Layout from "@theme/Layout";

const NL = {
  bg: "#0d1117", surface: "#131820", elevated: "#191f2b", subtle: "#1f2635",
  border: "rgba(255,255,255,0.06)", borderMid: "rgba(255,255,255,0.11)",
  text: "#eaecf0", secondary: "#8d97aa", muted: "#4a5270",
  accent: "#67e404", accentDim: "rgba(103,228,4,0.10)", accentBorder: "rgba(103,228,4,0.22)",
};
const font = "'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'Fira Code', monospace";
const API_BASE = "https://api.mccompanion.net";

function formatBytes(n) {
  if (!n) return "";
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function SkinBody({ url, scale = 4 }) {
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
    img.src = url;
  }, [url, scale]);
  return <canvas ref={ref} width={16 * scale} height={32 * scale} style={{ display: "block", imageRendering: "pixelated" }} />;
}

const RANK_COLORS = ["#ffd700", "#c0c0c0", "#cd7f32"];

function RankBadge({ rank }) {
  const color = RANK_COLORS[rank - 1] ?? NL.muted;
  return (
    <div style={{ width: 28, height: 28, borderRadius: "50%", background: rank <= 3 ? `${color}18` : NL.elevated, border: `1px solid ${rank <= 3 ? color + "44" : NL.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 800, color: rank <= 3 ? color : NL.muted, fontFamily: mono }}>
      {rank}
    </div>
  );
}

function SkinLeaderboard() {
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/skins/top?limit=20`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.skins) setSkins(d.skins); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${NL.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>🎨</span>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NL.text }}>Top Skins</p>
          <p style={{ margin: 0, fontSize: 11, color: NL.muted }}>Most liked cloud skins</p>
        </div>
      </div>
      {loading ? (
        <div style={{ padding: 32, textAlign: "center", color: NL.muted, fontSize: 13 }}>Loading…</div>
      ) : skins.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: NL.muted, fontSize: 13 }}>No skins yet.</div>
      ) : (
        <div>
          {skins.map((skin, i) => (
            <div key={skin.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: i < skins.length - 1 ? `1px solid ${NL.border}` : "none", transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = NL.elevated}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <RankBadge rank={i + 1} />
              <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 40 }}>
                <SkinBody url={skin.public_url} scale={3} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: NL.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{skin.name || "Unnamed"}</p>
                {skin.username && (
                  <a href={`/u?name=${skin.username}`} style={{ fontSize: 11, color: NL.accent, textDecoration: "none" }}>
                    {skin.display_name || skin.username}
                  </a>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 14, color: "#f87171" }}>♥</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: NL.text, fontFamily: mono }}>{skin.like_count ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PackLeaderboard() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/featured-packs`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.packs) {
          const sorted = [...d.packs].sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0)).slice(0, 20);
          setPacks(sorted);
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${NL.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>📦</span>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NL.text }}>Top Resource Packs</p>
          <p style={{ margin: 0, fontSize: 11, color: NL.muted }}>Most downloaded packs</p>
        </div>
      </div>
      {loading ? (
        <div style={{ padding: 32, textAlign: "center", color: NL.muted, fontSize: 13 }}>Loading…</div>
      ) : packs.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: NL.muted, fontSize: 13 }}>No packs yet.</div>
      ) : (
        <div>
          {packs.map((pack, i) => (
            <div key={pack.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: i < packs.length - 1 ? `1px solid ${NL.border}` : "none", transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = NL.elevated}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <RankBadge rank={i + 1} />
              {pack.thumbnailUrl ? (
                <img src={pack.thumbnailUrl} alt={pack.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", imageRendering: "pixelated", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: 8, background: NL.elevated, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📦</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: NL.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pack.name}</p>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
                  {pack.category && <span style={{ fontSize: 10, color: "#60a5fa", fontWeight: 600 }}>{pack.category}</span>}
                  {pack.sizeBytes > 0 && <span style={{ fontSize: 10, color: NL.muted }}>{formatBytes(pack.sizeBytes)}</span>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={NL.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                <span style={{ fontSize: 13, fontWeight: 700, color: NL.text, fontFamily: mono }}>{(pack.downloadCount ?? 0).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LeaderboardsPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <Layout title="Leaderboards · MCCompanion" description="Top skins and resource packs on MCCompanion">
      <div style={{ minHeight: "100vh", background: NL.bg, fontFamily: font, paddingBottom: 80 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "32px 16px" : "48px 24px" }}>

          <div style={{ marginBottom: 36 }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: NL.accent }}>Community</p>
            <h1 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 900, color: NL.text, margin: "0 0 8px", letterSpacing: "-0.03em" }}>Leaderboards</h1>
            <p style={{ margin: 0, color: NL.secondary, fontSize: 14 }}>The most loved skins and downloaded packs in the MCCompanion community.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, alignItems: "start" }}>
            <SkinLeaderboard />
            <PackLeaderboard />
          </div>

        </div>
      </div>
    </Layout>
  );
}
