import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useHistory } from "@docusaurus/router";
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
  danger: "#f87171",
};
const font = "'Inter', system-ui, sans-serif";
const API_BASE = "https://api.mccompanion.net";

function Spinner() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="9" stroke={NL.accent} strokeWidth="2.5" strokeDasharray="40 20" />
    </svg>
  );
}

function Avatar({ url, name, size = 72 }) {
  const [err, setErr] = useState(false);
  const initials = (name || "?")[0].toUpperCase();
  if (url && !err) {
    return (
      <img
        src={url}
        alt={name}
        onError={() => setErr(true)}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: `2px solid ${NL.border}` }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: NL.accentDim, border: `2px solid ${NL.accentBorder}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 700, color: NL.accent, fontFamily: font,
    }}>
      {initials}
    </div>
  );
}

function MinecraftHead({ uuid, name, size = 24 }) {
  return (
    <img
      src={`https://crafatar.com/avatars/${uuid}?size=24&overlay`}
      alt={name}
      title={name}
      style={{ width: size, height: size, imageRendering: "pixelated", borderRadius: 3 }}
      onError={(e) => { e.target.style.display = "none"; }}
    />
  );
}

function Tag({ children }) {
  return (
    <span style={{
      background: NL.subtle, border: `1px solid ${NL.border}`,
      borderRadius: 6, padding: "3px 10px", fontSize: 12,
      color: NL.secondary, fontFamily: font, display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      {children}
    </span>
  );
}

export default function UserPage() {
  const location = useLocation();
  const history = useHistory();
  const username = new URLSearchParams(location.search).get("name") || "";

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareProfile = useCallback(() => {
    const url = `https://mccompanion.net/u?name=${username}`;
    if (navigator.share) {
      navigator.share({ title: `${displayName} · MCCompanion`, url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [username, displayName]);

  useEffect(() => {
    if (!username) { setLoading(false); setNotFound(true); return; }
    setLoading(true);
    setNotFound(false);
    fetch(`${API_BASE}/api/users/${encodeURIComponent(username)}`)
      .then(r => { if (r.status === 404) throw new Error("not_found"); return r.json(); })
      .then(data => { setUser(data.user); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [username]);

  const displayName = user?.displayName || user?.username || username;
  const pageTitle = loading ? "Profile · MCCompanion" : notFound ? "User not found · MCCompanion" : `${displayName} · MCCompanion`;

  return (
    <Layout title={pageTitle} description={user?.bio || `${displayName}'s MCCompanion profile`}>
      <style>{`
        body { background: ${NL.bg} !important; }
        * { box-sizing: border-box; }
        .profile-card { transition: box-shadow 0.2s; }
        .tag-pill { transition: background 0.15s; }
        @media (max-width: 640px) { .profile-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ minHeight: "100vh", background: NL.bg, fontFamily: font, paddingBottom: 80 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 16px 0" }}>

          {loading && (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
              <Spinner />
            </div>
          )}

          {!loading && notFound && (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
              <h2 style={{ color: NL.text, margin: "0 0 8px", fontSize: 22 }}>User not found</h2>
              <p style={{ color: NL.secondary, margin: "0 0 24px" }}>
                {username ? `@${username} doesn't exist on MCCompanion.` : "No username provided."}
              </p>
              <a
                href="/"
                style={{
                  display: "inline-block", background: NL.accent, color: "#000",
                  borderRadius: 8, padding: "10px 22px", fontWeight: 700,
                  textDecoration: "none", fontSize: 14,
                }}
              >
                Go to MCCompanion
              </a>
            </div>
          )}

          {!loading && user && (
            <>
              {/* Profile header */}
              <div style={{
                background: NL.surface, border: `1px solid ${NL.border}`,
                borderRadius: 16, padding: 28, marginBottom: 16,
                display: "flex", gap: 20, alignItems: "flex-start",
              }}>
                <Avatar url={user.avatarUrl} name={displayName} size={72} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 2 }}>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: NL.text, lineHeight: 1.2 }}>
                      {displayName}
                    </h1>
                    <button
                      onClick={shareProfile}
                      title={copied ? "Copied!" : "Share profile"}
                      style={{
                        background: copied ? NL.accentDim : NL.elevated,
                        border: `1px solid ${copied ? NL.accentBorder : NL.border}`,
                        borderRadius: 8, padding: "5px 10px", cursor: "pointer",
                        color: copied ? NL.accent : NL.secondary,
                        fontSize: 12, fontFamily: font, fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 5,
                        transition: "all 0.15s",
                      }}
                    >
                      {copied ? "✓ Copied" : "⬆ Share"}
                    </button>
                  </div>
                  <div style={{ color: NL.muted, fontSize: 13, marginBottom: user.bio ? 10 : 0 }}>
                    @{user.username}
                  </div>
                  {user.bio && (
                    <p style={{ margin: 0, color: NL.secondary, fontSize: 14, lineHeight: 1.5 }}>
                      {user.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Minecraft accounts */}
              {(user.javaAccounts?.length > 0 || user.bedrockAccounts?.length > 0) && (
                <div style={{
                  background: NL.surface, border: `1px solid ${NL.border}`,
                  borderRadius: 16, padding: 24, marginBottom: 16,
                }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 600, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Minecraft Accounts
                  </h3>

                  {user.javaAccounts?.length > 0 && (
                    <div style={{ marginBottom: user.bedrockAccounts?.length > 0 ? 16 : 0 }}>
                      <div style={{ fontSize: 12, color: NL.muted, marginBottom: 8, fontWeight: 600 }}>Java Edition</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {user.javaAccounts.map(acc => (
                          <div key={acc.javaUuid} style={{
                            display: "flex", alignItems: "center", gap: 8,
                            background: NL.elevated, border: `1px solid ${NL.border}`,
                            borderRadius: 8, padding: "6px 12px",
                          }}>
                            <MinecraftHead uuid={acc.javaUuid} name={acc.javaUsername} />
                            <span style={{ fontSize: 13, color: NL.text, fontWeight: 500 }}>{acc.javaUsername}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.bedrockAccounts?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, color: NL.muted, marginBottom: 8, fontWeight: 600 }}>Bedrock Edition</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {user.bedrockAccounts.map(acc => (
                          <div key={acc.xboxXuid} style={{
                            display: "flex", alignItems: "center", gap: 8,
                            background: NL.elevated, border: `1px solid ${NL.border}`,
                            borderRadius: 8, padding: "6px 12px",
                          }}>
                            <span style={{ fontSize: 16 }}>🎮</span>
                            <span style={{ fontSize: 13, color: NL.text, fontWeight: 500 }}>{acc.xboxGamertag || "Unknown"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CTA */}
              <div style={{
                background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
                borderRadius: 16, padding: 24, textAlign: "center",
              }}>
                <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: NL.text }}>
                  Play Minecraft with {displayName}?
                </p>
                <p style={{ margin: "0 0 18px", fontSize: 13, color: NL.secondary }}>
                  Add them as a friend on MCCompanion and see what server they're on.
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <a
                    href="https://apps.apple.com/app/mccompanion/id6742801057"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block", background: NL.accent, color: "#000",
                      borderRadius: 8, padding: "10px 20px", fontWeight: 700,
                      textDecoration: "none", fontSize: 14,
                    }}
                  >
                    Download for iOS
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=net.mccompanion.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block", background: NL.elevated, color: NL.text,
                      border: `1px solid ${NL.border}`, borderRadius: 8, padding: "10px 20px",
                      fontWeight: 600, textDecoration: "none", fontSize: 14,
                    }}
                  >
                    Download for Android
                  </a>
                </div>
              </div>

              {/* Member since */}
              {user.createdAt && (
                <div style={{ textAlign: "center", marginTop: 20, color: NL.muted, fontSize: 12 }}>
                  MCCompanion member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
