import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "@docusaurus/router";
import Layout from "@theme/Layout";

const NL = {
  bg: "#0d1117", surface: "#131820", elevated: "#191f2b", subtle: "#1f2635",
  border: "rgba(255,255,255,0.06)", borderMid: "rgba(255,255,255,0.11)",
  text: "#eaecf0", secondary: "#8d97aa", muted: "#4a5270",
  accent: "#67e404", accentDim: "rgba(103,228,4,0.10)", accentBorder: "rgba(103,228,4,0.22)",
  danger: "#f87171", success: "#34d399",
};
const font = "'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'Fira Code', monospace";
const API_BASE = "https://api.mccompanion.net";

function Spinner({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="9" stroke={NL.accent} strokeWidth="2.5" strokeDasharray="40 20" />
    </svg>
  );
}

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
    img.src = url;
  }, [url, scale]);
  return <canvas ref={ref} width={16 * scale} height={32 * scale} style={{ display: "block", imageRendering: "pixelated" }} />;
}

const ACTIVITY_META = {
  skin_upload: { icon: "🎨", label: "Uploaded skin", color: "#60a5fa" },
  pack_approved: { icon: "✅", label: "Pack featured", color: "#34d399" },
  pack_submitted: { icon: "📦", label: "Submitted pack", color: "#8d97aa" },
  skin_liked: { icon: "❤️", label: "Skin got a like", color: "#f87171" },
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function SideCard({ title, children }) {
  return (
    <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
      {title && <div style={{ padding: "10px 14px", borderBottom: `1px solid ${NL.border}`, fontSize: 11, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{title}</div>}
      {children}
    </div>
  );
}

export default function UserPage() {
  const location = useLocation();
  const username = new URLSearchParams(location.search).get("name") || "";

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [skins, setSkins] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!username) { setLoading(false); setNotFound(true); return; }
    setLoading(true);
    fetch(`${API_BASE}/api/users/${encodeURIComponent(username)}`)
      .then(r => { if (r.status === 404) throw new Error("not_found"); return r.json(); })
      .then(data => { setUser(data.user); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [username]);

  useEffect(() => {
    if (!username) return;
    Promise.all([
      fetch(`${API_BASE}/api/users/${encodeURIComponent(username)}/stats`).then(r => r.ok ? r.json() : null),
      fetch(`${API_BASE}/api/users/${encodeURIComponent(username)}/activity`).then(r => r.ok ? r.json() : null),
      fetch(`${API_BASE}/api/skins/user/${encodeURIComponent(username)}`).then(r => r.ok ? r.json() : null),
    ]).then(([s, a, sk]) => {
      if (s?.stats) setStats(s.stats);
      if (a?.activity) setActivity(a.activity);
      if (sk?.skins) setSkins(sk.skins);
    });
  }, [username]);

  const displayName = user?.displayName || user?.username || username;

  function share() {
    const url = `https://mccompanion.net/u?name=${username}`;
    if (navigator.share) navigator.share({ title: `${displayName} · MCCompanion`, url }).catch(() => { });
    else navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const pageTitle = loading ? "Profile · MCCompanion"
    : notFound ? "User not found · MCCompanion"
      : `${displayName} · MCCompanion`;

  return (
    <Layout title={pageTitle} description={user?.bio || `${displayName}'s MCCompanion profile`}>
      <div style={{ minHeight: "100vh", background: NL.bg, fontFamily: font, paddingBottom: 80 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "28px 16px" : "44px 24px" }}>

          {loading && <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}><Spinner size={28} /></div>}

          {!loading && notFound && (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>👤</div>
              <h2 style={{ color: NL.text, margin: "0 0 8px", fontSize: 22 }}>User not found</h2>
              <p style={{ color: NL.secondary, margin: "0 0 24px" }}>{username ? `@${username} doesn't exist on MCCompanion.` : "No username provided."}</p>
              <a href="/" style={{ display: "inline-block", background: NL.accent, color: "#000", borderRadius: 8, padding: "10px 22px", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>Go to MCCompanion</a>
            </div>
          )}

          {!loading && user && (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "260px 1fr", gap: 20, alignItems: "start" }}>

              <div>
                <SideCard>
                  <div style={{ background: NL.elevated, padding: "28px 20px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, borderBottom: `1px solid ${NL.border}` }}>
                    {(user.avatarUrl) ? (
                      <img src={user.avatarUrl} alt={displayName} style={{ width: 88, height: 88, borderRadius: 22, objectFit: "cover", border: `2px solid ${NL.borderMid}`, display: "block" }} onError={e => e.currentTarget.style.display = "none"} />
                    ) : (
                      <div style={{ width: 88, height: 88, borderRadius: 22, background: NL.accentDim, border: `2px solid ${NL.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700, color: NL.accent }}>
                        {(displayName || "?")[0].toUpperCase()}
                      </div>
                    )}
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 18, fontWeight: 800, color: NL.text, margin: 0, fontFamily: mono, letterSpacing: "-0.02em" }}>{user.username}</p>
                      {user.displayName && <p style={{ fontSize: 13, color: NL.secondary, margin: "3px 0 0" }}>{user.displayName}</p>}
                    </div>
                  </div>
                  <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {user.bio && <p style={{ fontSize: 12, color: NL.secondary, margin: 0, lineHeight: 1.6 }}>{user.bio}</p>}
                    {user.createdAt && <p style={{ fontSize: 11, color: NL.muted, margin: 0 }}>🗓 Member since {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>}
                    <button onClick={share} style={{ width: "100%", padding: "7px 0", borderRadius: 8, border: `1px solid ${copied ? NL.accentBorder : NL.borderMid}`, background: copied ? NL.accentDim : NL.elevated, color: copied ? NL.accent : NL.secondary, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}>
                      {copied ? "✓ Link copied!" : "Share profile"}
                    </button>
                  </div>
                </SideCard>

                {stats && (
                  <SideCard title="Stats">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                      {[
                        { label: "Skins", value: stats.skinCount },
                        { label: "Skin likes", value: stats.skinLikes },
                        { label: "Packs submitted", value: stats.packSubmissionCount },
                        { label: "Packs featured", value: stats.packApprovedCount },
                      ].map(({ label, value }, i) => (
                        <div key={label} style={{ padding: "12px 14px", borderRight: i % 2 === 0 ? `1px solid ${NL.border}` : "none", borderBottom: i < 2 ? `1px solid ${NL.border}` : "none" }}>
                          <p style={{ fontSize: 20, fontWeight: 800, color: NL.accent, margin: 0, fontFamily: mono }}>{value}</p>
                          <p style={{ fontSize: 10, color: NL.muted, margin: "2px 0 0", lineHeight: 1.3 }}>{label}</p>
                        </div>
                      ))}
                    </div>
                  </SideCard>
                )}

                {(user.javaAccounts?.length > 0 || user.bedrockAccounts?.length > 0) && (
                  <SideCard title="Minecraft">
                    <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                      {user.javaAccounts?.map(acc => (
                        <div key={acc.javaUuid} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, background: NL.elevated, border: `1px solid ${NL.border}` }}>
                          <img src={`https://crafatar.com/avatars/${acc.javaUuid}?size=24&overlay`} alt={acc.javaUsername} style={{ width: 24, height: 24, imageRendering: "pixelated", borderRadius: 4, flexShrink: 0 }} onError={e => e.currentTarget.style.display = "none"} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: NL.text, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{acc.javaUsername}</p>
                            <p style={{ fontSize: 9, color: NL.muted, margin: 0 }}>Java Edition</p>
                          </div>
                        </div>
                      ))}
                      {user.bedrockAccounts?.map(acc => (
                        <div key={acc.xboxXuid} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, background: NL.elevated, border: `1px solid ${NL.border}` }}>
                          <span style={{ fontSize: 18, flexShrink: 0 }}>🎮</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: NL.text, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{acc.xboxGamertag || "Unknown"}</p>
                            <p style={{ fontSize: 9, color: NL.muted, margin: 0 }}>Bedrock Edition</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SideCard>
                )}

                {activity.length > 0 && (
                  <SideCard title="Recent activity">
                    <div style={{ padding: "4px 0" }}>
                      {activity.map((ev, i) => {
                        const meta = ACTIVITY_META[ev.type] ?? { icon: "•", label: ev.type, color: NL.muted };
                        return (
                          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 14px", borderBottom: i < activity.length - 1 ? `1px solid ${NL.border}` : "none" }}>
                            <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{meta.icon}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 11, color: meta.color, fontWeight: 600, margin: 0 }}>{meta.label}</p>
                              <p style={{ fontSize: 11, color: NL.secondary, margin: "1px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.name}</p>
                            </div>
                            <span style={{ fontSize: 10, color: NL.muted, flexShrink: 0, marginTop: 2 }}>{timeAgo(ev.createdAt)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </SideCard>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {skins.length > 0 && (
                  <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 14, overflow: "hidden" }}>
                    <div style={{ padding: "12px 18px", borderBottom: `1px solid ${NL.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: NL.text }}>Cloud Skins</span>
                      <span style={{ fontSize: 11, color: NL.muted }}>{skins.length} skin{skins.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 10 }}>
                      {skins.map(skin => (
                        <a key={skin.id} href="/skins" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 6px 8px", borderRadius: 10, border: `1px solid ${NL.border}`, background: NL.elevated, transition: "border-color 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = NL.accentBorder}
                          onMouseLeave={e => e.currentTarget.style.borderColor = NL.border}>
                          <SkinBody url={skin.public_url} scale={3} />
                          <span style={{ fontSize: 10, color: NL.muted, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>{skin.name}</span>
                          {skin.like_count > 0 && <span style={{ fontSize: 9, color: "#f87171" }}>♥ {skin.like_count}</span>}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ background: NL.accentDim, border: `1px solid ${NL.accentBorder}`, borderRadius: 14, padding: "22px 24px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: NL.text }}>Play Minecraft with {displayName}?</p>
                  <p style={{ margin: "0 0 18px", fontSize: 13, color: NL.secondary, lineHeight: 1.6 }}>Add them as a friend on MCCompanion and see what server they're on in real time.</p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a href="https://apps.apple.com/app/mccompanion/id6742801057" target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, background: NL.elevated, color: NL.text, border: `1px solid ${NL.border}`, borderRadius: 9, padding: "10px 18px", fontWeight: 600, textDecoration: "none", fontSize: 13 }}>
                      Download for iOS
                    </a>
                    <a href="https://play.google.com/store/apps/details?id=net.mccompanion.app" target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, background: NL.elevated, color: NL.text, border: `1px solid ${NL.border}`, borderRadius: 9, padding: "10px 18px", fontWeight: 600, textDecoration: "none", fontSize: 13 }}>
                      Download for Android
                    </a>
                  </div>
                </div>

                {user.createdAt && (
                  <p style={{ textAlign: "center", color: NL.muted, fontSize: 12, margin: 0 }}>
                    MCCompanion member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
