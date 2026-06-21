import { useState, useEffect } from "react";
import { FaWindows, FaApple, FaAndroid, FaDownload, FaGithub, FaCodeBranch, FaExclamationTriangle, FaCheckCircle, FaClock } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
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
  yellow: "#f59e0b",
  yellowDim: "rgba(245,158,11,0.08)",
  yellowBorder: "rgba(245,158,11,0.20)",
  red: "#ef4444",
};

const REPO = "MCCORG/MCCompanion";
const API = `https://api.github.com/repos/${REPO}`;

const PLATFORM_META = {
  "MCCompanion-android.apk": {
    icon: <FaAndroid size={16} />,
    label: "Android",
    sublabel: "APK",
    color: "#34d399",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.20)",
  },
  "MCCompanion-windows.zip": {
    icon: <FaWindows size={16} />,
    label: "Windows",
    sublabel: "ZIP",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.08)",
    border: "rgba(96,165,250,0.20)",
  },
  "MCCompanion-macos.dmg": {
    icon: <FaApple size={16} />,
    label: "macOS",
    sublabel: "DMG",
    color: "#c0c7d4",
    bg: "rgba(192,199,212,0.08)",
    border: "rgba(192,199,212,0.20)",
  },
};

function formatBytes(n) {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function extractCommitSha(body) {
  const match = body?.match(/commit ([a-f0-9]{40})/i);
  return match ? match[1] : null;
}

function PlatformButton({ asset }) {
  const meta = PLATFORM_META[asset.name];
  const [hover, setHover] = useState(false);
  if (!meta) return null;
  return (
    <a
      href={asset.browser_download_url}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        borderRadius: 10,
        border: `1px solid ${hover ? meta.border : NL.border}`,
        background: hover ? meta.bg : NL.elevated,
        color: hover ? meta.color : NL.text,
        textDecoration: "none",
        transition: "all 0.18s ease",
        cursor: "pointer",
        minWidth: 140,
      }}
    >
      <span style={{ color: meta.color }}>{meta.icon}</span>
      <div style={{ lineHeight: 1.2 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{meta.label}</div>
        <div style={{ fontSize: 11, color: NL.secondary }}>{meta.sublabel} · {formatBytes(asset.size)}</div>
      </div>
      <FaDownload size={12} style={{ marginLeft: "auto", color: NL.muted, opacity: hover ? 1 : 0.5, transition: "opacity 0.18s" }} />
    </a>
  );
}

function ReleaseCard({ release, tag, index }) {
  const sha = extractCommitSha(release.body);
  const shaShort = sha?.slice(0, 7);
  const commitUrl = sha ? `https://github.com/${REPO}/commit/${sha}` : null;
  const releaseUrl = `https://github.com/${REPO}/releases/tag/${tag}`;
  const isBeta = tag === "beta";

  const assets = release.assets.filter(a => PLATFORM_META[a.name]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: NL.surface,
        border: `1px solid ${isBeta ? NL.accentBorder : NL.border}`,
        borderRadius: 16,
        padding: "24px 28px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isBeta && (
        <div style={{
          position: "absolute", top: 0, right: 0,
          background: NL.accent, color: "#000",
          fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
          padding: "3px 12px", borderRadius: "0 16px 0 8px",
        }}>
          BETA
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 16, fontWeight: 700, color: NL.text,
            }}>
              {release.name || (isBeta ? "Beta Build" : "Dev Build")}
            </span>
            <span style={{
              fontSize: 11, padding: "2px 8px", borderRadius: 20,
              background: isBeta ? NL.accentDim : NL.subtle,
              border: `1px solid ${isBeta ? NL.accentBorder : NL.border}`,
              color: isBeta ? NL.accent : NL.secondary,
              fontWeight: 600,
            }}>
              {tag}
            </span>
          </div>

          {/* Commit info */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            {shaShort && (
              <a
                href={commitUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 12, color: NL.secondary,
                  textDecoration: "none", fontFamily: "monospace",
                  background: NL.elevated, padding: "3px 8px",
                  borderRadius: 6, border: `1px solid ${NL.border}`,
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = NL.accent}
                onMouseLeave={e => e.currentTarget.style.color = NL.secondary}
              >
                <FaCodeBranch size={10} />
                {shaShort}
              </a>
            )}
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: NL.muted }}>
              <FaClock size={10} />
              {timeAgo(release.published_at)}
            </span>
            <span style={{ fontSize: 12, color: NL.muted }}>
              by {release.author?.login ?? "unknown"}
            </span>
          </div>
        </div>

        <a
          href={releaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, color: NL.secondary, textDecoration: "none",
            padding: "6px 12px", borderRadius: 8,
            border: `1px solid ${NL.border}`, background: NL.elevated,
            whiteSpace: "nowrap", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.borderColor = NL.borderMid; }}
          onMouseLeave={e => { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.borderColor = NL.border; }}
        >
          <FaGithub size={13} />
          View on GitHub
        </a>
      </div>

      {/* Commit message / body excerpt */}
      {release.body && (
        <div style={{
          fontSize: 13, color: NL.secondary,
          background: NL.elevated, borderRadius: 8,
          padding: "10px 14px", marginBottom: 20,
          border: `1px solid ${NL.border}`,
          whiteSpace: "pre-wrap",
          lineHeight: 1.6,
        }}>
          {release.body.split("\n").slice(0, 3).join("\n")}
        </div>
      )}

      {/* Warning */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 8,
        background: NL.yellowDim, border: `1px solid ${NL.yellowBorder}`,
        borderRadius: 8, padding: "8px 12px", marginBottom: 20,
        fontSize: 12, color: NL.yellow, lineHeight: 1.5,
      }}>
        <FaExclamationTriangle size={12} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>
          <strong>Beta build:</strong> Google &amp; Apple sign-in won't work. May contain bugs.
          {" "}Side-load at your own risk.
        </span>
      </div>

      {/* Download buttons */}
      {assets.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {assets.map(asset => (
            <PlatformButton key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <div style={{ color: NL.muted, fontSize: 13 }}>No download assets found for this release.</div>
      )}
    </motion.div>
  );
}

function RunRow({ run, index }) {
  const shaShort = run.head_sha?.slice(0, 7);
  const statusColor = run.conclusion === "success" ? NL.accent
    : run.conclusion === "failure" ? NL.red
      : NL.yellow;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.04, duration: 0.35 }}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px",
        borderBottom: `1px solid ${NL.border}`,
        flexWrap: "wrap",
      }}
    >
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: statusColor, flexShrink: 0,
        boxShadow: `0 0 6px ${statusColor}`,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: NL.text, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {run.display_title || run.head_commit?.message?.split("\n")[0] || "—"}
        </div>
        <div style={{ fontSize: 11, color: NL.muted, marginTop: 2 }}>
          #{run.run_number} · {shaShort && (
            <a
              href={`https://github.com/${REPO}/commit/${run.head_sha}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: NL.secondary, textDecoration: "none", fontFamily: "monospace" }}
            >
              {shaShort}
            </a>
          )} · {timeAgo(run.created_at)}
        </div>
      </div>
      <a
        href={run.html_url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: 11, color: NL.secondary, textDecoration: "none",
          padding: "4px 10px", borderRadius: 6,
          border: `1px solid ${NL.border}`, background: NL.elevated,
          whiteSpace: "nowrap", transition: "all 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = NL.text}
        onMouseLeave={e => e.currentTarget.style.color = NL.secondary}
      >
        View run
      </a>
    </motion.div>
  );
}

export default function BetaPage() {
  const [releases, setReleases] = useState({ beta: null, dev: null });
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [betaRes, devRes, runsRes] = await Promise.allSettled([
          fetch(`${API}/releases/tags/beta`).then(r => r.ok ? r.json() : null),
          fetch(`${API}/releases/tags/dev`).then(r => r.ok ? r.json() : null),
          fetch(`${API}/actions/workflows/build.yml/runs?per_page=20&branch=main`).then(r => r.ok ? r.json() : null),
        ]);
        setReleases({
          beta: betaRes.status === "fulfilled" ? betaRes.value : null,
          dev: devRes.status === "fulfilled" ? devRes.value : null,
        });
        setRuns(runsRes.status === "fulfilled" ? (runsRes.value?.workflow_runs ?? []) : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = [
    releases.beta && { release: releases.beta, tag: "beta" },
    releases.dev && { release: releases.dev, tag: "dev" },
  ].filter(Boolean);

  return (
    <Layout title="Beta Downloads" description="Download the latest MCCompanion beta and dev builds">
      <div style={{
        minHeight: "100vh",
        background: NL.bg,
        color: NL.text,
        fontFamily: "'Inter', system-ui, sans-serif",
        paddingBottom: 80,
      }}>
        {/* Hero */}
        <div style={{
          maxWidth: 820,
          margin: "0 auto",
          padding: "64px 24px 40px",
          textAlign: "center",
        }}>
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              fontSize: 11, fontWeight: 700, letterSpacing: 1.4,
              color: NL.accent, textTransform: "uppercase",
              padding: "5px 14px", borderRadius: 20,
              border: `1px solid ${NL.accentBorder}`,
              background: NL.accentDim,
              marginBottom: 20,
            }}>
              <FaDownload size={10} />
              Early Access
            </div>
            <h1 style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 800,
              color: NL.text,
              margin: "0 0 16px",
              lineHeight: 1.15,
            }}>
              Beta Downloads
            </h1>
            <p style={{ fontSize: 16, color: NL.secondary, maxWidth: 540, margin: "0 auto 0", lineHeight: 1.7 }}>
              Test the latest features before they go live. Builds are generated automatically on every commit.
            </p>
          </motion.div>
        </div>

        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px" }}>

          {/* Releases */}
          {loading && (
            <div style={{ textAlign: "center", padding: 48, color: NL.muted }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                border: `3px solid ${NL.border}`,
                borderTop: `3px solid ${NL.accent}`,
                animation: "spin 0.9s linear infinite",
                margin: "0 auto 16px",
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              Loading releases…
            </div>
          )}

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 12, padding: "16px 20px",
              color: NL.red, fontSize: 14, marginBottom: 24,
            }}>
              Failed to load releases: {error}
            </div>
          )}

          {!loading && cards.length === 0 && !error && (
            <div style={{ textAlign: "center", padding: 48, color: NL.muted }}>
              No releases found yet.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 48 }}>
            {cards.map(({ release, tag }, i) => (
              <ReleaseCard key={tag} release={release} tag={tag} index={i} />
            ))}
          </div>

          {/* Recent builds */}
          {runs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
              style={{
                background: NL.surface,
                border: `1px solid ${NL.border}`,
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: `1px solid ${NL.border}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FaGithub size={15} color={NL.secondary} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: NL.text }}>Recent builds</span>
                </div>
                <a
                  href={`https://github.com/${REPO}/actions`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12, color: NL.secondary, textDecoration: "none",
                    display: "flex", alignItems: "center", gap: 5,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = NL.accent}
                  onMouseLeave={e => e.currentTarget.style.color = NL.secondary}
                >
                  View all on GitHub →
                </a>
              </div>
              <div>
                {runs.slice(0, 15).map((run, i) => (
                  <RunRow key={run.id} run={run} index={i} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Install guide */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              marginTop: 32,
              background: NL.surface,
              border: `1px solid ${NL.border}`,
              borderRadius: 16,
              padding: "24px 28px",
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NL.text, margin: "0 0 16px" }}>
              How to install
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {[
                { icon: <FaAndroid size={14} color="#34d399" />, label: "Android", steps: ["Enable \"Install from unknown sources\" in Settings", "Download the APK", "Open the file to install"] },
                { icon: <FaWindows size={14} color="#60a5fa" />, label: "Windows", steps: ["Download the ZIP", "Extract to a folder", "Run MCCompanion.exe"] },
                { icon: <FaApple size={14} color="#c0c7d4" />, label: "macOS", steps: ["Download the DMG", "Open it and drag MCCompanion to Applications", "Right-click → Open to bypass Gatekeeper"] },
              ].map(({ icon, label, steps }) => (
                <div key={label} style={{
                  background: NL.elevated, borderRadius: 10,
                  border: `1px solid ${NL.border}`, padding: "14px 16px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                    {icon}
                    <span style={{ fontSize: 13, fontWeight: 600, color: NL.text }}>{label}</span>
                  </div>
                  <ol style={{ margin: 0, paddingLeft: 18 }}>
                    {steps.map((s, i) => (
                      <li key={i} style={{ fontSize: 12, color: NL.secondary, lineHeight: 1.7 }}>{s}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
