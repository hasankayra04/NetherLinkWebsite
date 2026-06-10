import { useState, useEffect } from "react";
import Layout from "@theme/Layout";

const NL = {
  bg: "#0d0f14",
  surface: "#13161e",
  elevated: "#191c25",
  border: "rgba(255,255,255,0.06)",
  borderMid: "rgba(255,255,255,0.10)",
  text: "#eaebee",
  secondary: "#8892a4",
  muted: "#4e5666",
  accent: "#67e404",
  accentBorder: "rgba(103,228,4,0.20)",
};

const STATUS_COLOR = {
  up:      "#67e404",
  degraded:"#f59e0b",
  down:    "#ef4444",
  unknown: "#4e5666",
};

const STATUS_LABEL = {
  up:      "Operational",
  degraded:"Degraded",
  down:    "Offline",
  unknown: "Unknown",
};

const GROUP_LABEL = {
  infrastructure: "Infrastructure",
  api:            "API",
  bots:           "Bots",
};

const GROUP_ORDER = ["api", "infrastructure", "bots"];

function Dot({ status }) {
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: STATUS_COLOR[status] ?? STATUS_COLOR.unknown, flexShrink: 0,
    }} />
  );
}

function UptimeBar({ history, serviceName }) {
  const relevant = history
    .map(h => h.checks?.find(c => c.name === serviceName))
    .filter(Boolean)
    .slice(-90);

  if (!relevant.length) return null;

  return (
    <div>
      <div style={{ display: "flex", gap: 2, height: 20 }}>
        {relevant.map((check, i) => (
          <div key={i} title={STATUS_LABEL[check.status] ?? check.status} style={{
            flex: 1, height: "100%", borderRadius: 2,
            background: STATUS_COLOR[check.status] ?? STATUS_COLOR.unknown,
            opacity: check.status === "up" ? 0.65 : 1,
          }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
        <span style={{ fontSize: 10, color: NL.muted }}>7.5h ago</span>
        <span style={{ fontSize: 10, color: NL.muted }}>now</span>
      </div>
    </div>
  );
}

function overallStatus(services) {
  if (!services.length) return "unknown";
  if (services.some(s => s.status === "down")) return "down";
  if (services.some(s => s.status === "degraded")) return "degraded";
  if (services.every(s => s.status === "up")) return "up";
  return "unknown";
}

function ServiceRow({ service, history }) {
  return (
    <div style={{
      padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10,
      borderBottom: `1px solid ${NL.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Dot status={service.status} />
        <span style={{ fontSize: 14, fontWeight: 500, color: NL.text, flex: 1 }}>{service.name}</span>
        {service.latency_ms != null && (
          <span style={{ fontSize: 11, color: NL.muted }}>{service.latency_ms}ms</span>
        )}
        <span style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLOR[service.status] ?? NL.muted }}>
          {STATUS_LABEL[service.status] ?? "Unknown"}
        </span>
      </div>
      {history.length > 0 && <UptimeBar history={history} serviceName={service.name} />}
    </div>
  );
}

function GroupCard({ label, services, history }) {
  const overall = overallStatus(services);
  return (
    <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${NL.border}` }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: NL.text, flex: 1 }}>{label}</span>
        <Dot status={overall} />
        <span style={{ fontSize: 12, color: STATUS_COLOR[overall] ?? NL.muted, fontWeight: 600 }}>
          {STATUS_LABEL[overall] ?? "Unknown"}
        </span>
      </div>
      {services.map(s => <ServiceRow key={s.name} service={s} history={history} />)}
    </div>
  );
}

export default function StatusPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/MCCORG/MCCompanionWebsite/main/static/status.json?t=" + Date.now())
      .then(r => r.json())
      .then(setData)
      .catch(() => setError(true));
  }, []);

  const overall = data ? overallStatus(data.services) : "unknown";

  const overallMessages = {
    up:      "All systems operational",
    degraded:"Some systems are experiencing issues",
    down:    "Service disruption detected",
    unknown: "Loading status…",
  };

  const grouped = GROUP_ORDER.map(group => ({
    group,
    label: GROUP_LABEL[group],
    services: (data?.services ?? []).filter(s => s.group === group),
  })).filter(g => g.services.length > 0);

  return (
    <Layout title="Status" description="MCCompanion service status">
      <div style={{ background: NL.bg, minHeight: "100vh", padding: "60px 20px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>

          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 700, color: NL.text }}>System Status</h1>
            {data?.updated_at && (
              <p style={{ margin: 0, fontSize: 13, color: NL.muted }}>
                Last checked {new Date(data.updated_at).toLocaleString("en-GB", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            )}
          </div>

          <div style={{
            background: NL.surface, borderRadius: 14, padding: "16px 20px",
            display: "flex", alignItems: "center", gap: 12,
            border: `1px solid ${(STATUS_COLOR[overall] ?? "#4e5666") + "40"}`,
          }}>
            <Dot status={overall} />
            <span style={{ fontSize: 16, fontWeight: 600, color: NL.text }}>
              {overallMessages[overall]}
            </span>
          </div>

          {error ? (
            <p style={{ color: NL.muted, fontSize: 14, textAlign: "center" }}>Could not load status data.</p>
          ) : !data ? (
            <p style={{ color: NL.muted, fontSize: 14, textAlign: "center" }}>Loading…</p>
          ) : (
            grouped.map(g => (
              <GroupCard key={g.group} label={g.label} services={g.services} history={data.history} />
            ))
          )}

          {data?.history?.length > 0 && (
            <div style={{ display: "flex", gap: 16, fontSize: 11, color: NL.muted }}>
              {[["up", "Operational"], ["degraded", "Degraded"], ["down", "Offline"]].map(([s, l]) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: STATUS_COLOR[s], display: "inline-block" }} />
                  {l}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
