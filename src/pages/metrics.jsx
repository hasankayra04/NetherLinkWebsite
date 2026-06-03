import React, { useCallback, useEffect, useState } from "react";
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
};

const API_BASE = "https://api.mccompanion.net";

async function dbFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function Spinner({ size = 20 }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 100 24v-4l-3 3 3 3v4a12 12 0 01-12-12z" />
    </svg>
  );
}

function IconRefresh({ spinning }) {
  return (
    <svg className={spinning ? "animate-spin" : ""} width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M1 4v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.51 15a9 9 0 1 0 .49-4.95" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const MEDAL = ["🥇", "🥈", "🥉"];

export default function MetricsPage() {
  const [top, setTop] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalServers, setTotalServers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { ok, status, data: json } = await dbFetch("/api/metrics");
      if (!ok) throw new Error(`HTTP ${status}`);
      setTop(Array.isArray(json.top) ? json.top : []);
      setTotalCount(json.totalCount ?? 0);
      setTotalServers(json.totalServers ?? 0);
    } catch (err) {
      setError(`Failed: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  const maxCount = top[0]?.count || 1;

  return (
    <Layout>
      <div style={{
        minHeight: "100vh", background: NL.bg,
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "64px 16px",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 11, padding: "4px 12px",
              borderRadius: 20, marginBottom: 16,
              background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
              color: NL.accent, fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} />
              Live data
            </div>
            <h1 style={{
              fontSize: 28, fontWeight: 700, color: NL.text,
              letterSpacing: "-0.025em", margin: "0 0 8px",
            }}>Server Metrics</h1>
            <p style={{ fontSize: 13, color: NL.secondary, maxWidth: 360, margin: "0 auto" }}>
              Rankings based on connections through the MCCompanion app.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Total servers", value: totalServers.toLocaleString() },
              { label: "Total joins", value: totalCount.toLocaleString() },
            ].map(s => (
              <div key={s.label} style={{
                background: NL.surface, border: `1px solid ${NL.border}`,
                borderRadius: 14, padding: "18px 16px", textAlign: "center",
              }}>
                <p style={{ fontSize: 11, color: NL.muted, marginBottom: 6 }}>{s.label}</p>
                <p style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 28, fontWeight: 700, color: NL.text, lineHeight: 1,
                }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div style={{
            background: NL.surface, border: `1px solid ${NL.border}`,
            borderRadius: 18, overflow: "hidden",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: `1px solid ${NL.border}`,
            }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: NL.text, margin: 0 }}>Top servers</h2>
              <button
                onClick={fetchMetrics}
                disabled={loading}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 12, padding: "6px 12px",
                  background: NL.elevated, border: `1px solid ${NL.border}`,
                  borderRadius: 8, color: NL.secondary,
                  fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                  transition: "color 0.2s, border-color 0.2s",
                }}
                onMouseEnter={e => !loading && (e.currentTarget.style.color = NL.text)}
                onMouseLeave={e => (e.currentTarget.style.color = NL.secondary)}
              >
                <IconRefresh spinning={loading} /> Refresh
              </button>
            </div>

            <div style={{ padding: "10px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", gap: 12, color: NL.muted }}>
                  <Spinner />
                  <span style={{ fontSize: 13 }}>Loading metrics…</span>
                </div>
              ) : error ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", gap: 8 }}>
                  <span style={{ fontSize: 24 }}>⚠️</span>
                  <p style={{ fontSize: 13, color: NL.danger }}>{error}</p>
                  <button onClick={fetchMetrics} style={{
                    fontSize: 12, color: NL.secondary, background: "none",
                    border: "none", cursor: "pointer", textDecoration: "underline",
                    fontFamily: "inherit",
                  }}>Try again</button>
                </div>
              ) : top.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", gap: 8, color: NL.muted }}>
                  <span style={{ fontSize: 24 }}>📭</span>
                  <p style={{ fontSize: 13 }}>No data yet.</p>
                </div>
              ) : top.map((row, idx) => {
                const pct = Math.max(4, Math.round((row.count / maxCount) * 100));
                const isTop3 = idx < 3;
                const barColor = idx === 0 ? NL.accent : idx === 1 ? "#9299a6" : idx === 2 ? "#cd7c3b" : NL.accentDim;

                return (
                  <div
                    key={row.ip}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 10px",
                      borderRadius: 10,
                      background: idx === 0 ? "rgba(103,228,4,0.06)" : "transparent",
                      border: `1px solid ${idx === 0 ? NL.accentBorder : "transparent"}`,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => idx !== 0 && (e.currentTarget.style.background = NL.elevated)}
                    onMouseLeave={e => idx !== 0 && (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ width: 28, textAlign: "center", flexShrink: 0 }}>
                      {idx < 3
                        ? <span style={{ fontSize: 16, lineHeight: 1 }}>{MEDAL[idx]}</span>
                        : <span style={{ fontSize: 12, fontWeight: 700, color: NL.muted }}>{idx + 1}</span>
                      }
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 13, color: isTop3 ? NL.text : NL.secondary,
                          fontWeight: idx === 0 ? 600 : 400,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {row.ip}
                        </span>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 12, fontWeight: 700, flexShrink: 0,
                          color: idx === 0 ? NL.accent : isTop3 ? NL.secondary : NL.muted,
                        }}>
                          {Number(row.count).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ height: 3, borderRadius: 2, background: NL.subtle, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 2,
                          background: barColor,
                          width: `${pct}%`,
                          transition: "width 0.6s ease",
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}