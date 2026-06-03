import { useState, useRef, useEffect, useCallback } from "react";
import Layout from "@theme/Layout";

const NL = {
  bg:           "#111318",
  surface:      "#191c23",
  elevated:     "#1f232c",
  subtle:       "#252931",
  border:       "rgba(255,255,255,0.07)",
  borderMid:    "rgba(255,255,255,0.12)",
  text:         "#e8e9ec",
  secondary:    "#9299a6",
  muted:        "#5a6070",
  accent:       "#67e404",
  accentDim:    "rgba(103,228,4,0.08)",
  accentBorder: "rgba(103,228,4,0.20)",
  java:         "#f59e0b",
  javaDim:      "rgba(245,158,11,0.08)",
  javaBorder:   "rgba(245,158,11,0.20)",
  javaBg:       "#0d0a04",
  javaGlow:     "rgba(245,158,11,0.20)",
  bedrock:      "#60a5fa",
  bedrockDim:   "rgba(96,165,250,0.08)",
  bedrockBorder:"rgba(96,165,250,0.20)",
  bedrockBg:    "#04080f",
  bedrockGlow:  "rgba(96,165,250,0.20)",
  geyser:       "#34d399",
  geyserDim:    "rgba(52,211,153,0.08)",
  geyserBorder: "rgba(52,211,153,0.20)",
  danger:       "#f87171",
};

const API_BASE = "https://api.mccompanion.net";

async function lookupPlayer(identifier) {
  const res = await fetch(`${API_BASE}/api/lookup/bedrock-java/${encodeURIComponent(identifier)}`);
  if (res.status === 404) return { java: null, bedrock: null, linked: false };
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function useBedrockSkin(xuid) {
  const [skinUrl, setSkinUrl] = useState(null);
  useEffect(() => {
    if (!xuid) return;
    let cancelled = false;
    fetch(`https://api.geysermc.org/v2/skin/${xuid}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled || !data?.value) return;
        try {
          const url = JSON.parse(atob(data.value))?.textures?.SKIN?.url;
          if (url) setSkinUrl(url);
        } catch (_) {}
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [xuid]);
  return skinUrl;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Spinner({ size = 20, color = "currentColor" }) {
  return (
    <svg style={{ animation: "nl-spin 0.75s linear infinite", display: "block", color }}
      width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.18" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <style>{`@keyframes nl-spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function CopyBtn({ value }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); })
      .catch(() => {});
  }
  return (
    <button onClick={copy} title="Copy" style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 22, height: 22, borderRadius: 5, flexShrink: 0, padding: 0,
      background: "none", border: `1px solid ${copied ? NL.accentBorder : NL.border}`,
      color: copied ? NL.accent : NL.muted,
      cursor: "pointer", transition: "color 0.15s, border-color 0.15s",
    }}>
      {copied
        ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
      }
    </button>
  );
}

function FieldRow({ label, value, mono = true, accent }) {
  if (!value && value !== 0) return null;
  const str = String(value);
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12, padding: "10px 0",
      borderBottom: `1px solid ${NL.border}`,
    }}>
      <span style={{ fontSize: 11, color: NL.muted, flexShrink: 0, minWidth: 80 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, flex: 1, justifyContent: "flex-end" }}>
        <span style={{
          fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit",
          fontSize: 12,
          color: accent ?? NL.secondary,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{str}</span>
        <CopyBtn value={str} />
      </div>
    </div>
  );
}

function Badge({ color, dimColor, borderColor, children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 10, padding: "3px 9px", borderRadius: 20,
      fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: "0.08em", textTransform: "uppercase",
      color, background: dimColor, border: `1px solid ${borderColor}`,
    }}>
      {children}
    </span>
  );
}

// ─── 3D Viewer ────────────────────────────────────────────────────────────────

const VIEWER_W = 180;
const VIEWER_H = 300;

function SkinViewer3D({ skinUrl }) {
  const canvasRef  = useRef(null);
  const viewerRef  = useRef(null);
  const modRef     = useRef(null);
  const [playing,  setPlaying]  = useState(true);
  const [rotating, setRotating] = useState(true);
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !skinUrl) return;
    let disposed = false;

    import("skinview3d").then((mod) => {
      if (disposed || !canvasRef.current) return;
      modRef.current = mod;

      const viewer = new mod.SkinViewer({
        canvas: canvasRef.current,
        width:  VIEWER_W,
        height: VIEWER_H,
        skin:   skinUrl,
        background: null,   // transparent — lets the panel bg show through
      });

      viewer.animation             = new mod.WalkingAnimation();
      viewer.animation.speed       = 0.5;
      viewer.autoRotate            = true;
      viewer.autoRotateSpeed       = 0.4;
      viewer.controls.enableZoom   = false;
      viewer.fov                   = 50;

      viewerRef.current = viewer;
      setReady(true);
    }).catch(() => {});

    return () => {
      disposed = true;
      if (viewerRef.current) { try { viewerRef.current.dispose(); } catch (_) {} viewerRef.current = null; }
      setReady(false);
    };
  }, [skinUrl]);

  function togglePlay() {
    const v = viewerRef.current, m = modRef.current;
    if (!v || !m) return;
    if (playing) { v.animation = null; }
    else { v.animation = new m.WalkingAnimation(); v.animation.speed = 0.5; }
    setPlaying(p => !p);
  }

  function toggleRotate() {
    const v = viewerRef.current;
    if (!v) return;
    v.autoRotate = !rotating;
    setRotating(r => !r);
  }

  const ctrlBtn = (active) => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 30, height: 30, borderRadius: 8, padding: 0, cursor: "pointer",
    background: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.07)"}`,
    color: active ? NL.text : NL.muted,
    transition: "background 0.15s, color 0.15s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative", width: VIEWER_W, height: VIEWER_H, flexShrink: 0 }}>
        <canvas ref={canvasRef} style={{ display: "block" }} />
        {!ready && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: NL.muted }}>
            <Spinner size={24} />
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button onClick={togglePlay} title={playing ? "Pause" : "Play"} style={ctrlBtn(playing)}>
          {playing
            ? <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
            : <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
          }
        </button>
        <button onClick={toggleRotate} title="Auto-rotate" style={ctrlBtn(rotating)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12a10 10 0 1 0 10-10" /><polyline points="2 6 2 12 8 12" />
          </svg>
        </button>
        <span style={{ fontSize: 9, color: NL.muted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em" }}>
          drag · scroll
        </span>
      </div>
    </div>
  );
}

// ─── Card shell ───────────────────────────────────────────────────────────────

function PlayerCard({ panelBg, glowColor, accentBorder, skinUrl, skinLoading, children }) {
  return (
    <div style={{
      background: NL.surface,
      border: `1px solid ${accentBorder}`,
      borderRadius: 20, overflow: "hidden",
      display: "flex",
      flexWrap: "wrap",
    }}>
      {/* Left: viewer panel */}
      <div style={{
        width: VIEWER_W + 40,
        flexShrink: 0,
        background: panelBg,
        borderRight: `1px solid ${NL.border}`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "28px 20px 20px",
        position: "relative",
        minHeight: 360,
      }}>
        {/* Floor glow */}
        <div style={{
          position: "absolute", bottom: "12%", left: "50%",
          transform: "translateX(-50%)",
          width: 140, height: 60, borderRadius: "50%",
          background: glowColor, filter: "blur(22px)", pointerEvents: "none",
        }} />
        {/* Top vignette */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 80,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)",
          pointerEvents: "none",
        }} />

        {skinUrl
          ? <SkinViewer3D skinUrl={skinUrl} />
          : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: NL.muted }}>
              {skinLoading
                ? <><Spinner size={22} /><span style={{ fontSize: 11 }}>loading skin…</span></>
                : <span style={{ fontSize: 11 }}>no skin data</span>
              }
            </div>
          )
        }
      </div>

      {/* Right: info */}
      <div style={{ flex: 1, minWidth: 220, padding: "28px 24px 24px", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Java Card ────────────────────────────────────────────────────────────────

function JavaCard({ data }) {
  return (
    <PlayerCard
      panelBg={`radial-gradient(ellipse at 50% 90%, rgba(245,158,11,0.10) 0%, ${NL.javaBg} 70%)`}
      glowColor={NL.javaGlow}
      accentBorder={NL.javaBorder}
      skinUrl={data.skinUrl}
      skinLoading={false}
    >
      {/* Avatar + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <img
          src={data.headUrl} alt={data.username}
          width={56} height={56}
          style={{ borderRadius: 12, imageRendering: "pixelated", flexShrink: 0, border: `2px solid ${NL.javaBorder}` }}
          onError={e => { e.currentTarget.style.display = "none"; }}
        />
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: NL.text, margin: "0 0 6px", lineHeight: 1.1 }}>
            {data.username}
          </h2>
          <Badge color={NL.java} dimColor={NL.javaDim} borderColor={NL.javaBorder}>
            ☕ Java Edition
          </Badge>
        </div>
      </div>

      {/* Fields */}
      <div style={{ flex: 1 }}>
        <FieldRow label="Username" value={data.username} mono={false} />
        <FieldRow label="UUID"     value={data.uuid} />
      </div>

      {/* Footer tag */}
      <p style={{ fontSize: 10, color: NL.muted, margin: "16px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>
        via Mojang API
      </p>
    </PlayerCard>
  );
}

// ─── Bedrock Card ─────────────────────────────────────────────────────────────

function BedrockCard({ data }) {
  const skinUrl  = useBedrockSkin(data.xuid);
  const tierColor = data.tier === "Gold" ? "#f59e0b" : NL.secondary;

  return (
    <PlayerCard
      panelBg={`radial-gradient(ellipse at 50% 90%, rgba(96,165,250,0.10) 0%, ${NL.bedrockBg} 70%)`}
      glowColor={NL.bedrockGlow}
      accentBorder={NL.bedrockBorder}
      skinUrl={skinUrl}
      skinLoading={!skinUrl}
    >
      {/* Gamerpic + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        {data.gamerpicUrl ? (
          <img
            src={data.gamerpicUrl} alt={data.gamertag}
            width={56} height={56}
            style={{ borderRadius: 12, flexShrink: 0, border: `2px solid ${NL.bedrockBorder}` }}
            onError={e => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <div style={{
            width: 56, height: 56, borderRadius: 12, flexShrink: 0,
            background: NL.subtle, border: `2px solid ${NL.bedrockBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
          }}>🎮</div>
        )}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: NL.text, margin: "0 0 6px", lineHeight: 1.1 }}>
            {data.gamertag}
          </h2>
          <Badge color={NL.bedrock} dimColor={NL.bedrockDim} borderColor={NL.bedrockBorder}>
            🪨 Bedrock Edition
          </Badge>
        </div>
      </div>

      {/* Fields */}
      <div style={{ flex: 1 }}>
        <FieldRow label="Gamertag"  value={data.gamertag} mono={false} />
        <FieldRow label="XUID"      value={data.xuid} />
        {data.gamerscore != null && (
          <FieldRow label="Gamerscore" value={data.gamerscore.toLocaleString()} />
        )}
        {data.tier && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${NL.border}` }}>
            <span style={{ fontSize: 11, color: NL.muted, minWidth: 80 }}>Account tier</span>
            <span style={{ fontSize: 12, color: tierColor, fontWeight: 600 }}>{data.tier}</span>
          </div>
        )}
      </div>

      {/* Footer tag */}
      <p style={{ fontSize: 10, color: NL.muted, margin: "16px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>
        via Xbox Live · skin via GeyserMC
      </p>
    </PlayerCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "56px 16px" }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>🔍</div>
      <p style={{ fontSize: 15, color: NL.secondary, marginBottom: 6, fontWeight: 500 }}>
        Search for any Minecraft player
      </p>
      <p style={{ fontSize: 12, color: NL.muted }}>
        Java username · UUID · Bedrock gamertag · XUID
      </p>
    </div>
  );
}

export default function LookupPage() {
  const [query,   setQuery]   = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);
  const inputRef = useRef();

  const search = useCallback(async (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await lookupPlayer(trimmed);
      setResult(!data.java && !data.bedrock ? false : data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    search(query);
  }

  const hasResult = result && (result.java || result.bedrock);

  return (
    <Layout
      title="Player Lookup"
      description="Look up any Minecraft Java or Bedrock player — 3D skin viewer, UUID, XUID and more."
    >
      <div style={{
        minHeight: "100vh", background: NL.bg,
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "64px 16px 80px",
      }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>

          {/* Page header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 11, padding: "4px 12px", borderRadius: 20, marginBottom: 16,
              background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
              color: NL.accent, fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: NL.accent }} />
              Player Lookup
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: NL.text, letterSpacing: "-0.03em", margin: "0 0 8px" }}>
              Search any Minecraft player
            </h1>
            <p style={{ fontSize: 13, color: NL.muted, margin: 0 }}>
              Java username · UUID · Bedrock gamertag · XUID
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
            <div style={{
              display: "flex", gap: 8, alignItems: "center",
              background: NL.surface, border: `1px solid ${NL.borderMid}`,
              borderRadius: 16, padding: "8px 8px 8px 18px",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
              onFocusCapture={e => {
                e.currentTarget.style.borderColor = NL.accentBorder;
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(103,228,4,0.06)";
              }}
              onBlurCapture={e => {
                e.currentTarget.style.borderColor = NL.borderMid;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span style={{ color: NL.muted, display: "flex", flexShrink: 0 }}><IconSearch /></span>
              <input
                ref={inputRef}
                type="text" value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Notch  ·  KobeNetwork  ·  069a79f4-...  ·  2535461503960946"
                autoComplete="off" spellCheck={false}
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  fontFamily: "inherit", fontSize: 14, color: NL.text, padding: "6px 0", minWidth: 0,
                }}
              />
              <button type="submit" disabled={!query.trim() || loading} style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "10px 22px", borderRadius: 10,
                background: NL.accent, border: "none",
                color: "#0a1000", fontWeight: 700, fontSize: 13,
                cursor: !query.trim() || loading ? "not-allowed" : "pointer",
                opacity: !query.trim() || loading ? 0.4 : 1,
                fontFamily: "inherit", transition: "opacity 0.15s", flexShrink: 0,
              }}>
                {loading ? <Spinner size={14} color="#0a1000" /> : <IconSearch />}
                Search
              </button>
            </div>
          </form>

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "60px 0", color: NL.muted }}>
              <Spinner size={30} />
              <span style={{ fontSize: 13 }}>Looking up player…</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ background: NL.surface, border: "1px solid rgba(248,113,113,0.22)", borderRadius: 16, padding: "28px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 30, marginBottom: 10 }}>⚠️</div>
              <p style={{ fontSize: 14, color: NL.danger, margin: "0 0 4px", fontWeight: 500 }}>Lookup failed</p>
              <p style={{ fontSize: 12, color: NL.muted, margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Not found */}
          {!loading && result === false && (
            <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 16, padding: "40px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 34, marginBottom: 12 }}>🕵️</div>
              <p style={{ fontSize: 14, color: NL.secondary, margin: "0 0 4px", fontWeight: 500 }}>Player not found</p>
              <p style={{ fontSize: 12, color: NL.muted, margin: 0 }}>
                No Java or Bedrock account found for{" "}
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: NL.text }}>"{query}"</span>
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && hasResult && (
            <>
              {result.linked && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexWrap: "wrap", gap: 8, marginBottom: 18,
                  padding: "9px 18px",
                  background: NL.geyserDim, border: `1px solid ${NL.geyserBorder}`, borderRadius: 12,
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: NL.geyser, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: NL.geyser, fontWeight: 600 }}>Linked via GeyserMC</span>
                  <span style={{ fontSize: 11, color: NL.muted }}>— same person on Java &amp; Bedrock</span>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {result.java    && <JavaCard    data={result.java}    />}
                {result.bedrock && <BedrockCard data={result.bedrock} />}
              </div>

              <p style={{ fontSize: 10, color: NL.muted, marginTop: 16, textAlign: "center" }}>
                Java via Mojang · Bedrock via Xbox Live · Skin via GeyserMC · Cross-linking via GeyserMC Global API
              </p>
            </>
          )}

          {!loading && result === null && !error && <EmptyState />}

        </div>
      </div>
    </Layout>
  );
}
