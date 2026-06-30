import { useState, useEffect } from "react";
import { FaBug, FaLightbulb, FaHammer, FaGithub, FaExternalLinkAlt, FaSpinner } from "react-icons/fa";

const NL = {
  bg: "#0d1117",
  surface: "#131820",
  elevated: "#191f2b",
  text: "#eaecf0",
  secondary: "#8d97aa",
  muted: "#4a5270",
  border: "rgba(255,255,255,0.06)",
  borderMid: "rgba(255,255,255,0.11)",
  accent: "#67e404",
  accentDim: "rgba(103,228,4,0.10)",
  accentBorder: "rgba(103,228,4,0.22)",
  danger: "#f87171",
  dangerDim: "rgba(248,113,113,0.10)",
  dangerBorder: "rgba(248,113,113,0.22)",
  amber: "#f59e0b",
  amberDim: "rgba(245,158,11,0.10)",
  amberBorder: "rgba(245,158,11,0.22)",
};

const TABS = [
  { id: "bug", label: "Bugs", icon: <FaBug size={12} />, color: NL.danger, dim: NL.dangerDim, border: NL.dangerBorder, githubLabel: "bug" },
  { id: "feature", label: "Feature Requests", icon: <FaLightbulb size={12} />, color: NL.accent, dim: NL.accentDim, border: NL.accentBorder, githubLabel: "feature-request" },
  { id: "progress", label: "In Progress", icon: <FaHammer size={12} />, color: NL.amber, dim: NL.amberDim, border: NL.amberBorder, githubLabel: "in-progress" },
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

  return (
    <a
      href={issue.html_url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        textDecoration: "none",
        padding: "13px 16px",
        borderRadius: 10,
        background: hovered ? NL.elevated : NL.surface,
        border: `1px solid ${hovered ? border : NL.border}`,
        transition: "all 0.18s",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7, flexShrink: 0, marginTop: 1,
          background: dim, border: `1px solid ${border}`,
          display: "flex", alignItems: "center", justifyContent: "center", color,
        }}>
          <FaGithub size={11} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 13, fontWeight: 600, color: hovered ? NL.text : NL.text,
            margin: "0 0 4px", lineHeight: 1.4,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {issue.title}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: NL.muted, fontFamily: "'JetBrains Mono', monospace" }}>
              #{issue.number}
            </span>
            <span style={{ fontSize: 11, color: NL.muted }}>·</span>
            <span style={{ fontSize: 11, color: NL.muted }}>{timeAgo(issue.created_at)}</span>
            {issue.comments > 0 && (
              <>
                <span style={{ fontSize: 11, color: NL.muted }}>·</span>
                <span style={{ fontSize: 11, color: NL.muted }}>{issue.comments} comment{issue.comments !== 1 ? "s" : ""}</span>
              </>
            )}
          </div>
        </div>
        <FaExternalLinkAlt size={10} style={{ color: NL.muted, flexShrink: 0, marginTop: 4, opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }} />
      </div>
    </a>
  );
}

export default function CommunitySection() {
  const [activeTab, setActiveTab] = useState("bug");
  const [issues, setIssues] = useState({});
  const [loading, setLoading] = useState({});

  const tab = TABS.find(t => t.id === activeTab);

  async function fetchIssues(tabId) {
    if (issues[tabId] !== undefined) return;
    setLoading(l => ({ ...l, [tabId]: true }));

    try {
      const t = TABS.find(t => t.id === tabId);
      const url = tabId === "progress"
        ? `https://api.github.com/repos/MCCORG/MCCompanion/issues?labels=app-feedback&state=open&per_page=6&sort=updated`
        : `https://api.github.com/repos/MCCORG/MCCompanion/issues?labels=${t.githubLabel},app-feedback&state=open&per_page=6&sort=updated`;

      const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
      const data = await res.json();
      setIssues(prev => ({ ...prev, [tabId]: Array.isArray(data) ? data.filter(i => !i.pull_request) : [] }));
    } catch {
      setIssues(prev => ({ ...prev, [tabId]: [] }));
    } finally {
      setLoading(l => ({ ...l, [tabId]: false }));
    }
  }

  useEffect(() => { fetchIssues("bug"); }, []);

  function handleTab(tabId) {
    setActiveTab(tabId);
    fetchIssues(tabId);
  }

  const currentIssues = issues[activeTab];
  const isLoading = loading[activeTab];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {TABS.map(t => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleTab(t.id)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 8,
                border: `1px solid ${active ? t.border : NL.border}`,
                background: active ? t.dim : NL.elevated,
                color: active ? t.color : NL.secondary,
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              {t.icon} {t.label}
              {issues[t.id] !== undefined && (
                <span style={{
                  fontSize: 10, padding: "1px 5px", borderRadius: 10,
                  background: active ? t.border : NL.border,
                  color: active ? t.color : NL.muted,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {issues[t.id].length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 200 }}>
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160, color: NL.muted, gap: 8, fontSize: 13 }}>
            <FaSpinner size={13} style={{ animation: "nl-spin 0.75s linear infinite" }} />
            Loading...
          </div>
        ) : currentIssues?.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160, flexDirection: "column", gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: tab.dim, border: `1px solid ${tab.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: tab.color }}>
              {tab.icon}
            </div>
            <p style={{ fontSize: 13, color: NL.muted, margin: 0 }}>No open {tab.label.toLowerCase()} right now</p>
          </div>
        ) : (
          currentIssues?.map(issue => (
            <IssueCard key={issue.id} issue={issue} color={tab.color} dim={tab.dim} border={tab.border} />
          ))
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
        <a
          href="/feedback"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 8,
            background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
            color: NL.accent, fontSize: 12, fontWeight: 600, textDecoration: "none",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          <FaBug size={11} /> Report a bug or idea
        </a>
      </div>
    </div>
  );
}
