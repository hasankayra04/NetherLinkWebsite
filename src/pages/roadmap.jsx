import { useState, useEffect } from "react";
import Layout from "@theme/Layout";
import { motion } from "framer-motion";
import { FaBug, FaLightbulb, FaHammer, FaCheckCircle, FaGithub, FaExternalLinkAlt } from "react-icons/fa";

const NL = {
  bg: "#111318",
  surface: "#191c23",
  elevated: "#1f232c",
  text: "#e8e9ec",
  secondary: "#9299a6",
  muted: "#5a6070",
  border: "rgba(255,255,255,0.07)",
  borderMid: "rgba(255,255,255,0.12)",
  accent: "#67e404",
  accentDim: "rgba(103,228,4,0.10)",
  accentBorder: "rgba(103,228,4,0.22)",
  danger: "#f87171",
  dangerDim: "rgba(248,113,113,0.10)",
  dangerBorder: "rgba(248,113,113,0.22)",
  amber: "#f59e0b",
  amberDim: "rgba(245,158,11,0.10)",
  amberBorder: "rgba(245,158,11,0.22)",
  blue: "#60a5fa",
  blueDim: "rgba(96,165,250,0.10)",
  blueBorder: "rgba(96,165,250,0.22)",
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.42, ease: "easeOut" },
  }),
};

const COLUMNS = [
  { id: "open-bugs",     label: "Bugs",            icon: <FaBug size={13} />,         color: NL.danger, dim: NL.dangerDim, border: NL.dangerBorder, githubLabel: "bug",            state: "open" },
  { id: "open-features", label: "Feature Requests", icon: <FaLightbulb size={13} />,  color: NL.accent, dim: NL.accentDim, border: NL.accentBorder, githubLabel: "feature-request", state: "open" },
  { id: "in-progress",  label: "In Progress",      icon: <FaHammer size={13} />,      color: NL.amber,  dim: NL.amberDim,  border: NL.amberBorder,  githubLabel: "in-progress",    state: "open" },
  { id: "done",         label: "Recently Fixed",   icon: <FaCheckCircle size={13} />, color: NL.blue,   dim: NL.blueDim,   border: NL.blueBorder,   githubLabel: "app-feedback",   state: "closed" },
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d}d ago`;
  const m = Math.floor(d / 30);
  if (m < 12) return `${m}mo ago`;
  return `${Math.floor(m / 12)}y ago`;
}

function IssueCard({ issue, color, dim, border }) {
  const [hovered, setHovered] = useState(false);

  const labels = issue.labels?.filter(l => !["bug", "feature-request", "app-feedback", "in-progress"].includes(l.name)) || [];

  return (
    <a
      href={issue.html_url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block", textDecoration: "none",
        padding: "14px 16px", borderRadius: 12,
        background: hovered ? NL.elevated : NL.surface,
        border: `1px solid ${hovered ? border : NL.border}`,
        transition: "all 0.18s",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: dim, border: `1px solid ${border}`,
            display: "flex", alignItems: "center", justifyContent: "center", color,
          }}>
            <FaGithub size={12} />
          </div>
          <p style={{
            fontSize: 13, fontWeight: 600, color: NL.text,
            margin: 0, lineHeight: 1.4, flex: 1,
          }}>
            {issue.title}
          </p>
          <FaExternalLinkAlt size={10} style={{ color: NL.muted, flexShrink: 0, opacity: hovered ? 1 : 0, transition: "opacity 0.15s", marginTop: 3 }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", paddingLeft: 38 }}>
          <span style={{ fontSize: 10, color: NL.muted, fontFamily: "'JetBrains Mono', monospace" }}>#{issue.number}</span>
          <span style={{ fontSize: 10, color: NL.muted }}>·</span>
          <span style={{ fontSize: 10, color: NL.muted }}>{timeAgo(issue.updated_at)}</span>
          {issue.comments > 0 && (
            <>
              <span style={{ fontSize: 10, color: NL.muted }}>·</span>
              <span style={{ fontSize: 10, color: NL.muted }}>{issue.comments} 💬</span>
            </>
          )}
          {labels.map(l => (
            <span key={l.name} style={{
              fontSize: 9, padding: "1px 6px", borderRadius: 10,
              background: `#${l.color}22`, border: `1px solid #${l.color}44`,
              color: `#${l.color}`, fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>{l.name}</span>
          ))}
        </div>
      </div>
    </a>
  );
}

function Column({ col, isMobile }) {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        const url = `https://api.github.com/repos/MCCORG/MCCompanion/issues?labels=${col.githubLabel}&state=${col.state}&per_page=8&sort=updated`;
        const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
        const data = await res.json();
        setItems(Array.isArray(data) ? data.filter(i => !i.pull_request) : []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetch_();
  }, []);

  return (
    <div style={{
      background: NL.elevated,
      border: `1px solid ${NL.border}`,
      borderRadius: 14,
      padding: "18px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: col.dim, border: `1px solid ${col.border}`,
            display: "flex", alignItems: "center", justifyContent: "center", color: col.color,
          }}>
            {col.icon}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: NL.text }}>{col.label}</span>
        </div>
        {items !== null && (
          <span style={{
            fontSize: 10, padding: "2px 7px", borderRadius: 10,
            background: col.dim, border: `1px solid ${col.border}`,
            color: col.color, fontFamily: "'JetBrains Mono', monospace",
          }}>
            {items.length}
          </span>
        )}
      </div>

      <div style={{ height: 1, background: NL.border }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: 68, borderRadius: 10, background: NL.surface, border: `1px solid ${NL.border}`, opacity: 0.5 }} />
          ))
        ) : items?.length === 0 ? (
          <div style={{ padding: "24px 0", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: NL.muted, margin: 0 }}>Nothing here yet</p>
          </div>
        ) : (
          items.map(issue => (
            <IssueCard key={issue.id} issue={issue} color={col.color} dim={col.dim} border={col.border} />
          ))
        )}
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <Layout
      title="Roadmap — MCCompanion"
      description="See what bugs are being fixed and what features are coming to MCCompanion."
    >
      <div style={{
        background: NL.bg,
        minHeight: "100vh",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: isMobile ? "80px 16px 64px" : "96px 24px 80px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible" style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 10, padding: "4px 10px", borderRadius: 20,
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase",
              color: NL.accent, background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
              marginBottom: 16,
            }}>
              <FaGithub size={10} /> Live from GitHub
            </div>
            <h1 style={{
              fontSize: isMobile ? 28 : 38, fontWeight: 700, color: NL.text,
              margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.2,
            }}>
              MCCompanion Roadmap
            </h1>
            <p style={{ fontSize: 15, color: NL.secondary, margin: "0 auto 20px", lineHeight: 1.6, maxWidth: 500 }}>
              See what's being worked on, what's planned, and what's recently shipped. Spotted something? Let us know.
            </p>
            <a
              href="/feedback"
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "9px 18px", borderRadius: 10,
                background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
                color: NL.accent, fontSize: 13, fontWeight: 600, textDecoration: "none",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <FaBug size={12} /> Report a bug or suggest a feature
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp} custom={1} initial="hidden" animate="visible"
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
              gap: 12,
              alignItems: "start",
            }}
          >
            {COLUMNS.map(col => (
              <Column key={col.id} col={col} isMobile={isMobile} />
            ))}
          </motion.div>

          <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible" style={{ textAlign: "center", marginTop: 32 }}>
            <a
              href="https://github.com/MCCORG/MCCompanion/issues"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 13, color: NL.secondary, textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = NL.text}
              onMouseLeave={e => e.currentTarget.style.color = NL.secondary}
            >
              <FaGithub size={13} /> View all issues on GitHub <FaExternalLinkAlt size={10} />
            </a>
          </motion.div>

        </div>
      </div>
    </Layout>
  );
}
