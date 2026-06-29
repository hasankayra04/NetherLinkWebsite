import { useState, useEffect } from "react";
import Layout from "@theme/Layout";
import BotStatus from "../components/BotStatus";
import { T } from "../lib/tokens";

const STATUS_COLOR = {
  up: "#67e404",
  degraded: "#f59e0b",
  down: "#ef4444",
  unknown: "#4e5666",
};

const STATUS_LABEL = {
  up: "Operational",
  degraded: "Degraded",
  down: "Offline",
  unknown: "Unknown",
};

const GROUP_LABEL = {
  infrastructure: "Infrastructure",
  api: "API",
  bots: "Relay Bots",
};

const GROUP_ORDER = ["api", "infrastructure", "bots"];

function overallStatus(services) {
  if (!services.length) return "unknown";
  if (services.some(s => s.status === "down")) return "down";
  if (services.some(s => s.status === "degraded")) return "degraded";
  if (services.every(s => s.status === "up")) return "up";
  return "unknown";
}

function Dot({ status, size = 8 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: STATUS_COLOR[status] ?? STATUS_COLOR.unknown,
      boxShadow: status === "up" ? `0 0 6px ${STATUS_COLOR.up}80` : "none",
    }} />
  );
}

function UptimeBar({ history, serviceName }) {
  const relevant = history
    .map(h => h.checks?.find(c => c.name === serviceName))
    .filter(Boolean)
    .slice(-90);
  if (!relevant.length) return null;
  const upCount = relevant.filter(c => c.status === "up").length;
  const upPct = Math.round((upCount / relevant.length) * 100);
  return (
    <div>
      <div style={{ display: "flex", gap: 2, height: 20, borderRadius: 4, overflow: "hidden" }}>
        {relevant.map((check, i) => (
          <div key={i} title={STATUS_LABEL[check.status] ?? check.status} style={{
            flex: 1, height: "100%",
            background: STATUS_COLOR[check.status] ?? STATUS_COLOR.unknown,
            opacity: check.status === "up" ? 0.45 : 1,
          }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
        <span style={{ fontSize: 10, color: T.muted }}>7.5h ago</span>
        <span style={{ fontSize: 10, color: T.muted }}>{upPct}% uptime</span>
        <span style={{ fontSize: 10, color: T.muted }}>now</span>
      </div>
    </div>
  );
}

function ServiceRow({ service, history, last }) {
  return (
    <div style={{
      padding: "12px 18px",
      borderBottom: last ? "none" : `1px solid ${T.border}`,
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Dot status={service.status} />
        <span style={{ fontSize: 13, fontWeight: 500, color: T.text, flex: 1 }}>{service.name}</span>
        {service.latency_ms != null && (
          <span style={{ fontSize: 11, color: T.muted, fontFamily: "monospace" }}>{service.latency_ms}ms</span>
        )}
        <span style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLOR[service.status] ?? T.muted }}>
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
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "11px 18px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${T.border}`, background: T.raised }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.sub, flex: 1, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        <Dot status={overall} />
        <span style={{ fontSize: 12, color: STATUS_COLOR[overall] ?? T.muted, fontWeight: 600 }}>
          {STATUS_LABEL[overall] ?? "Unknown"}
        </span>
      </div>
      {services.map((s, i) => (
        <ServiceRow key={s.name} service={s} history={history} last={i === services.length - 1} />
      ))}
    </div>
  );
}

const OVERALL_STYLE = {
  up: { bg: "rgba(103,228,4,0.07)", border: "rgba(103,228,4,0.22)", color: "#67e404", text: "All systems operational" },
  degraded: { bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.22)", color: "#f59e0b", text: "Some systems degraded" },
  down: { bg: "rgba(239,68,68,0.07)", border: "rgba(239,68,68,0.22)", color: "#ef4444", text: "Service disruption detected" },
  unknown: { bg: "rgba(78,86,102,0.08)", border: "rgba(78,86,102,0.18)", color: "#4e5666", text: "Loading status..." },
};

export default function StatusPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    fetch("https://gist.githubusercontent.com/Jens-Co/4f2407ce7ce66c71675bf477b9eebe3c/raw/status.json?t=" + Date.now())
      .then(r => r.json())
      .then(setData)
      .catch(() => setError(true));
  }, []);

  const overall = data ? overallStatus(data.services) : "unknown";
  const os = OVERALL_STYLE[overall];

  const grouped = GROUP_ORDER.map(group => ({
    group,
    label: GROUP_LABEL[group],
    services: (data?.services ?? []).filter(s => s.group === group),
  })).filter(g => g.services.length > 0);

  return (
    <Layout title="Status" description="MCCompanion service status and relay bot capacity">
      <div style={{ background: T.bg, minHeight: "100vh", padding: "64px 20px 96px", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.green, margin: "0 0 8px" }}>Live status</p>
              <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: T.text, margin: 0, letterSpacing: "-0.03em" }}>Service Health</h1>
            </div>
            {data?.updated_at && (
              <span style={{ fontSize: 12, color: T.muted }}>
                Updated {new Date(data.updated_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>

          <div style={{ borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, background: os.bg, border: `1px solid ${os.border}` }}>
            <Dot status={overall} size={10} />
            <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{os.text}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 340px", gap: 20, alignItems: "start" }}>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>Xbox Relay Bots</h2>
                <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>EU & US · auto-refreshes every 30s</span>
              </div>
              <BotStatus />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>Services</h2>
              {error ? (
                <div style={{ fontSize: 13, color: T.muted, padding: "20px 0" }}>Could not load status data.</div>
              ) : !data ? (
                <div style={{ fontSize: 13, color: T.muted, padding: "20px 0" }}>Loading...</div>
              ) : (
                grouped.map(g => (
                  <GroupCard key={g.group} label={g.label} services={g.services} history={data.history} />
                ))
              )}

              {data?.history?.length > 0 && (
                <div style={{ display: "flex", gap: 14, fontSize: 11, color: T.muted, paddingTop: 4 }}>
                  {[["up", "Operational"], ["degraded", "Degraded"], ["down", "Offline"]].map(([s, l]) => (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 2, background: STATUS_COLOR[s], display: "inline-block" }} />
                      {l}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
