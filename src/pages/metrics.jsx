import React, { useCallback, useEffect, useState } from "react";
import Layout from "@theme/Layout";

const NL = {
  bg: "#0d0f14",
  surface: "#13161e",
  elevated: "#191c25",
  subtle: "#1f2330",
  border: "rgba(255,255,255,0.06)",
  borderMid: "rgba(255,255,255,0.11)",
  text: "#e8e9ec",
  secondary: "#9299a6",
  muted: "#5a6070",
  accent: "#67e404",
  accentDim: "rgba(103,228,4,0.08)",
  accentBorder: "rgba(103,228,4,0.20)",
};

const GOLD = { color: "#f5c542", dim: "rgba(245,197,66,0.12)", border: "rgba(245,197,66,0.28)" };
const SILVER = { color: "#b0b8c8", dim: "rgba(176,184,200,0.10)", border: "rgba(176,184,200,0.22)" };
const BRONZE = { color: "#cd7c3b", dim: "rgba(205,124,59,0.10)", border: "rgba(205,124,59,0.22)" };
const MEDALS = [GOLD, SILVER, BRONZE];
const LABELS = ["1st", "2nd", "3rd"];

const API_BASE = "https://api.mccompanion.net";

async function dbFetch(path) {
  const res = await fetch(`${API_BASE}${path}`);
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

function IconRefresh({ spinning }) {
  return (
    <svg style={{ animation: spinning ? "spin 1s linear infinite" : "none" }} width="13" height="13" viewBox="0 0 24 24" fill="none">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M1 4v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.51 15a9 9 0 1 0 .49-4.95" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function fmt(n) { return Number(n).toLocaleString("en-US"); }

function PodiumCard({ row, rank, total }) {
  const m = MEDALS[rank];
  const isFirst = rank === 0;
  const pct = isFirst ? 100 : Math.round((Math.log1p(row.count) / Math.log1p(total)) * 100);

  return (
    <div style={{
      flex: 1,
      background: NL.surface,
      border: `1px solid ${isFirst ? m.border : NL.border}`,
      borderRadius: 16,
      padding: "20px 18px",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      boxShadow: isFirst ? `0 0 32px ${m.dim}` : "none",
      marginTop: isFirst ? 0 : 16,
    }}>
      {isFirst && (
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 0%, ${m.dim} 0%, transparent 65%)`,
          pointerEvents: "none",
        }} />
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
          color: m.color, textTransform: "uppercase",
          background: m.dim, border: `1px solid ${m.border}`,
          borderRadius: 6, padding: "2px 8px",
        }}>{LABELS[rank]}</span>
        <span style={{ fontSize: isFirst ? 22 : 18 }}>
          {["🥇", "🥈", "🥉"][rank]}
        </span>
      </div>

      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: isFirst ? 14 : 13,
        fontWeight: 600,
        color: NL.text,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{row.ip}</div>

      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: isFirst ? 26 : 20,
        fontWeight: 700,
        color: m.color,
        lineHeight: 1,
      }}>{fmt(row.count)}</div>

      <div style={{ marginTop: 4 }}>
        <div style={{ height: 3, borderRadius: 2, background: NL.subtle }}>
          <div style={{
            height: "100%", borderRadius: 2,
            background: m.color,
            width: `${pct}%`,
            opacity: 0.7,
          }} />
        </div>
      </div>
    </div>
  );
}

export default function MetricsPage() {
  const [top, setTop] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalServers, setTotalServers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { ok, data } = await dbFetch("/api/metrics");
      if (!ok) throw new Error("Server error");
      setTop(Array.isArray(data.top) ? data.top : []);
      setTotalCount(data.totalCount ?? 0);
      setTotalServers(data.totalServers ?? 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  const logMax = Math.log1p(top[0]?.count || 1);
  const podium = top.slice(0, 3);
  const rest = top.slice(3);

  return (
    <Layout title="Server Metrics" description="Top Minecraft servers by connections through MCCompanion">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        .metric-row:hover { background: ${NL.elevated} !important; }
      `}</style>
      <div style={{
        minHeight: "100vh", background: NL.bg,
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "72px 16px 80px",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              fontSize: 11, padding: "4px 14px", borderRadius: 20, marginBottom: 18,
              background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
              color: NL.accent, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 6px #34d399" }} />
              Live data
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: NL.text, margin: "0 0 10px", letterSpacing: "-0.03em" }}>
              Server Metrics
            </h1>
            <p style={{ fontSize: 14, color: NL.secondary, margin: 0 }}>
              Most joined Minecraft servers via MCCompanion
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
            {[
              { label: "Servers tracked", value: fmt(totalServers), icon: "🌐" },
              { label: "Total connections", value: fmt(totalCount), icon: "🔗" },
            ].map(s => (
              <div key={s.label} style={{
                background: NL.surface, border: `1px solid ${NL.border}`,
                borderRadius: 14, padding: "18px 20px",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <span style={{ fontSize: 24 }}>{s.icon}</span>
                <div>
                  <p style={{ fontSize: 11, color: NL.muted, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: NL.text, margin: 0, lineHeight: 1 }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: NL.muted, fontSize: 14 }}>Loading…</div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ color: "#f87171", marginBottom: 12 }}>Failed to load: {error}</p>
              <button onClick={fetchMetrics} style={{ background: "none", border: "none", color: NL.secondary, cursor: "pointer", textDecoration: "underline", fontFamily: "inherit" }}>Try again</button>
            </div>
          ) : (
            <>
              {podium.length > 0 && (
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  {podium.map((row, i) => (
                    <PodiumCard key={row.ip} row={row} rank={i} total={top[0]?.count || 1} />
                  ))}
                </div>
              )}

              {rest.length > 0 && (
                <div style={{
                  background: NL.surface, border: `1px solid ${NL.border}`,
                  borderRadius: 16, overflow: "hidden",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 18px", borderBottom: `1px solid ${NL.border}`,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: NL.secondary, textTransform: "uppercase", letterSpacing: "0.07em" }}>Rankings</span>
                    <button
                      onClick={fetchMetrics}
                      disabled={loading}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        fontSize: 12, padding: "5px 11px",
                        background: NL.elevated, border: `1px solid ${NL.border}`,
                        borderRadius: 7, color: NL.secondary, fontFamily: "inherit",
                        cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1,
                      }}
                      onMouseEnter={e => !loading && (e.currentTarget.style.color = NL.text)}
                      onMouseLeave={e => (e.currentTarget.style.color = NL.secondary)}
                    >
                      <IconRefresh spinning={loading} /> Refresh
                    </button>
                  </div>

                  <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
                    {rest.map((row, i) => {
                      const rank = i + 4;
                      const pct = Math.max(4, Math.round((Math.log1p(row.count) / logMax) * 100));
                      return (
                        <div
                          key={row.ip}
                          className="metric-row"
                          style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "10px 12px", borderRadius: 10,
                            background: "transparent", transition: "background 0.15s",
                          }}
                        >
                          <span style={{
                            width: 24, flexShrink: 0, textAlign: "right",
                            fontSize: 12, fontWeight: 700, color: NL.muted,
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>{rank}</span>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                              <span style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 13, color: NL.secondary,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              }}>{row.ip}</span>
                              <span style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 12, fontWeight: 700, color: NL.muted, flexShrink: 0, marginLeft: 8,
                              }}>{fmt(row.count)}</span>
                            </div>
                            <div style={{ height: 2, borderRadius: 1, background: NL.subtle }}>
                              <div style={{
                                height: "100%", borderRadius: 1,
                                background: NL.muted,
                                width: `${pct}%`,
                                opacity: 0.5,
                              }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
