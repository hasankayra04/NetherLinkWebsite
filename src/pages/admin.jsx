import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useHistory } from "@docusaurus/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseClient";
import { fetchIdToken } from "../firebaseAuthHelpers";
import Layout from "@theme/Layout";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const NL = {
  bg: "#0d1117", surface: "#131820", elevated: "#191f2b", subtle: "#1f2635",
  border: "rgba(255,255,255,0.06)", borderMid: "rgba(255,255,255,0.11)",
  text: "#eaecf0", secondary: "#8d97aa", muted: "#4a5270",
  accent: "#67e404", accentDim: "rgba(103,228,4,0.10)", accentBorder: "rgba(103,228,4,0.22)",
  danger: "#f87171", dangerDim: "rgba(248,113,113,0.10)", dangerBorder: "rgba(248,113,113,0.22)",
  success: "#34d399", successDim: "rgba(52,211,153,0.10)",
  warn: "#fbbf24", warnDim: "rgba(251,191,36,0.10)",
};
const font = "'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'Fira Code', monospace";
const API_BASE = "https://api.mccompanion.net";
const REPORT_STATUSES = ["pending", "reviewed", "dismissed", "actioned"];

function Spinner({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: "spin 0.8s linear infinite", display: "inline-block", verticalAlign: "middle" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40 20" />
    </svg>
  );
}

function Badge({ children, color = "default" }) {
  const s = {
    default: { color: NL.secondary, background: NL.subtle, border: `1px solid ${NL.border}` },
    accent: { color: NL.accent, background: NL.accentDim, border: `1px solid ${NL.accentBorder}` },
    success: { color: NL.success, background: NL.successDim, border: "1px solid rgba(52,211,153,0.22)" },
    danger: { color: NL.danger, background: NL.dangerDim, border: `1px solid ${NL.dangerBorder}` },
    warn: { color: NL.warn, background: NL.warnDim, border: "1px solid rgba(251,191,36,0.22)" },
    blue: { color: "#60a5fa", background: "rgba(96,165,250,0.10)", border: "1px solid rgba(96,165,250,0.22)" },
  }[color] || {};
  return <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, fontFamily: mono, letterSpacing: "0.04em", ...s }}>{children}</span>;
}

function Btn({ children, onClick, variant = "primary", size = "md", disabled, title, style: extra }) {
  const base = { display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", fontFamily: font, border: "none", transition: "opacity 0.15s", opacity: disabled ? 0.4 : 1 };
  const sizes = { sm: { padding: "6px 10px", fontSize: 12 }, md: { padding: "8px 14px", fontSize: 13 } };
  const variants = {
    primary: { background: NL.accent, color: "#0d1a18" },
    secondary: { background: NL.elevated, color: NL.secondary, border: `1px solid ${NL.borderMid}` },
    danger: { background: NL.dangerDim, color: NL.danger, border: `1px solid ${NL.dangerBorder}` },
    ghost: { background: "transparent", color: NL.secondary, border: `1px solid ${NL.border}` },
    success: { background: NL.successDim, color: NL.success, border: "1px solid rgba(52,211,153,0.22)" },
  };
  return <button title={title} onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant], ...extra }}>{children}</button>;
}

function Card({ title, subtitle, children, action, style: extra }) {
  return (
    <section style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", ...extra }}>
      {(title || action) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${NL.border}`, flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: NL.text, margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: 11, color: NL.muted, margin: "2px 0 0" }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>{children}</div>
    </section>
  );
}

function TabBar({ active, onChange, tabs, mobile }) {
  if (mobile) {
    return (
      <select value={active} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${NL.borderMid}`, background: NL.elevated, color: NL.text, fontSize: 14, fontFamily: font, fontWeight: 600, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238d97aa' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
        {tabs.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
      </select>
    );
  }
  return (
    <div style={{ display: "flex", gap: 2, background: NL.subtle, borderRadius: 10, padding: 3, border: `1px solid ${NL.border}` }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{ flex: 1, padding: "6px 10px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", fontFamily: font, background: active === t.id ? NL.accent : "transparent", color: active === t.id ? "#0d1a18" : NL.secondary, transition: "background 0.15s, color 0.15s", whiteSpace: "nowrap" }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

const IC = {
  Copy: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 9H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><rect x="9" y="3" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Refresh: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M1 4v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M3.51 15a9 9 0 1 0 .49-4.95" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Ban: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  Trash: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Users: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

const iconBtn = (onClick, title, children) => (
  <button onClick={onClick} title={title} style={{ background: "none", border: "none", cursor: "pointer", color: NL.muted, padding: 5, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.15s, background 0.15s" }}
    onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.background = NL.elevated; }}
    onMouseLeave={e => { e.currentTarget.style.color = NL.muted; e.currentTarget.style.background = "transparent"; }}
  >{children}</button>
);

function SlotEditor({ uid, current, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(current));
  const [saving, setSaving] = useState(false);

  async function save() {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 0 || n > 100) return;
    setSaving(true);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/partners/${encodeURIComponent(uid)}/slots`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slots: n }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      onUpdate(n); setEditing(false);
    } catch (e) { alert("Failed: " + e.message); }
    finally { setSaving(false); }
  }

  if (!editing) return (
    <button onClick={() => { setValue(String(current)); setEditing(true); }}
      style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 7, border: `1px solid ${NL.border}`, background: NL.elevated, color: NL.secondary, fontSize: 12, fontFamily: mono, cursor: "pointer", flexShrink: 0 }}
      title="Edit slots">
      {current} <span style={{ color: NL.muted, fontFamily: font, fontSize: 11 }}>slot{current !== 1 ? "s" : ""}</span> <span style={{ color: NL.muted, fontSize: 10 }}>✏</span>
    </button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
      <input type="number" min="0" max="100" value={value} onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
        autoFocus style={{ width: 52, padding: "5px 8px", borderRadius: 7, textAlign: "center", border: `1px solid ${NL.accentBorder}`, background: NL.subtle, color: NL.text, fontSize: 12, fontFamily: mono, outline: "none" }} />
      <button onClick={save} disabled={saving} style={{ padding: "5px 8px", borderRadius: 7, border: "none", background: NL.successDim, color: NL.success, fontSize: 12, cursor: "pointer" }}>{saving ? "…" : "✓"}</button>
      <button onClick={() => setEditing(false)} style={{ padding: "5px 8px", borderRadius: 7, border: `1px solid ${NL.border}`, background: NL.elevated, color: NL.secondary, fontSize: 12, cursor: "pointer" }}>✕</button>
    </div>
  );
}

function RelayStatsCard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/stats/connections`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setStats(await res.json());
    } catch (_) { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Card title="Relay connections" subtitle="All servers combined, last 30 days" action={iconBtn(load, "Refresh", <IC.Refresh />)}>
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: NL.muted, fontSize: 13, padding: "24px 0", justifyContent: "center" }}><Spinner /> Loading…</div>
      ) : stats ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
            {[{ label: "Today", value: stats.today }, { label: "Last 7 days", value: stats.thisWeek }, { label: "Last 30 days", value: stats.thisMonth }].map(s => (
              <div key={s.label} style={{ background: NL.elevated, border: `1px solid ${NL.border}`, borderRadius: 10, padding: "12px 14px" }}>
                <p style={{ fontSize: 11, color: NL.muted, margin: "0 0 4px" }}>{s.label}</p>
                <p style={{ fontFamily: mono, fontSize: 22, fontWeight: 700, color: NL.accent, lineHeight: 1, margin: 0 }}>{(s.value || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={stats.daily} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={NL.border} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: NL.muted, fontFamily: mono }} tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: NL.muted, fontFamily: mono }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: NL.elevated, border: `1px solid ${NL.borderMid}`, borderRadius: 8, fontSize: 12, fontFamily: mono }} labelStyle={{ color: NL.secondary }} itemStyle={{ color: NL.accent }} formatter={v => [v.toLocaleString(), "connections"]} />
              <Line type="monotone" dataKey="count" stroke={NL.accent} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: NL.accent }} />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : <p style={{ fontSize: 13, color: NL.muted, textAlign: "center", padding: "24px 0" }}>No data available.</p>}
    </Card>
  );
}

function PartnersOverviewCard({ isMobile }) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/partners`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setPartners((await res.json()).partners || []);
    } catch (_) { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Card title="Partners" subtitle={`${partners.length} active`} action={iconBtn(load, "Refresh", <IC.Refresh />)}>
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: NL.muted, fontSize: 13, padding: "16px 0", justifyContent: "center" }}><Spinner /> Loading…</div>
      ) : partners.length === 0 ? (
        <p style={{ fontSize: 13, color: NL.muted, textAlign: "center", padding: "16px 0" }}>No partners yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
          {partners.map(p => (
            <div key={p.firebaseUid} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: NL.elevated, border: `1px solid ${NL.border}` }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: NL.accentDim, border: `1px solid ${NL.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: NL.accent }}>
                {(p.username || "?")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: NL.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.displayName || p.username}</p>
                <div style={{ display: "flex", gap: 5, marginTop: 3, alignItems: "center" }}>
                  <Badge color={p.partnerPlan === "premium" ? "warn" : "accent"}>{p.partnerPlan || "standard"}</Badge>
                  <span style={{ fontSize: 11, color: NL.muted }}>{p.serverSlots ?? 0} server{p.serverSlots !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function NotificationCard() {
  const [current, setCurrent] = useState("");
  const [editing, setEditing] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/notification`).then(r => r.json()).then(d => {
      setCurrent(d.message || ""); setEditing(d.message || "");
    }).catch(() => { });
  }, []);

  async function save() {
    setSaving(true);
    try {
      const token = await fetchIdToken();
      await fetch(`${API_BASE}/notification`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ message: editing || "" }) });
      setCurrent(editing); setDirty(false);
    } catch (_) { }
    finally { setSaving(false); }
  }

  async function clear() {
    if (!confirm("Clear notification?")) return;
    setSaving(true);
    try {
      const token = await fetchIdToken();
      await fetch(`${API_BASE}/notification`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setCurrent(""); setEditing(""); setDirty(false);
    } catch (_) { }
    finally { setSaving(false); }
  }

  const inputStyle = { padding: "9px 12px", borderRadius: 9, border: `1px solid ${NL.borderMid}`, background: NL.subtle, color: NL.text, fontSize: 13, fontFamily: font, outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <Card title="App Notification" subtitle={current ? `Active: "${current.slice(0, 40)}${current.length > 40 ? "…" : ""}"` : "No active notification"}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input value={editing} onChange={e => { setEditing(e.target.value); setDirty(e.target.value !== current); }}
          placeholder="Notification message…" maxLength={200} style={inputStyle} />
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={save} disabled={!dirty || saving} size="sm">{saving ? <><Spinner size={12} /> Saving…</> : "Save"}</Btn>
          {current && <Btn onClick={clear} variant="danger" size="sm" disabled={saving}>Clear</Btn>}
        </div>
      </div>
    </Card>
  );
}

const EVENT_META = {
  set: { borderColor: "rgba(52,211,153,0.4)", dotColor: NL.success, badge: "success", label: "SET" },
  del: { borderColor: "rgba(248,113,113,0.4)", dotColor: NL.danger, badge: "danger", label: "DEL" },
  clear: { borderColor: "rgba(251,191,36,0.4)", dotColor: NL.warn, badge: "warn", label: "CLEAR" },
  snapshot: { borderColor: "rgba(96,165,250,0.4)", dotColor: "#60a5fa", badge: "blue", label: "SNAP" },
};
const EVENTS_CAP = 1500;

function StatusDot({ status }) {
  const cfg = { open: { color: NL.success }, connecting: { color: NL.warn }, error: { color: NL.danger }, closed: { color: NL.muted } }[status] || { color: NL.muted };
  return <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />;
}

function FeedEventRow({ ev, onBan, isBanned }) {
  const [expanded, setExpanded] = useState(false);
  const meta = EVENT_META[ev.type] || EVENT_META.set;
  const v = ev.value || {};
  const publicIp = v.publicIp || v.publicIP || v.public || ev.key || "";
  const player = v.playerName || "";
  const remoteIp = v.remoteServerIp || v.remoteServerIP || v.remote || "";
  const remotePort = v.remoteServerPort || v.remotePort || v.port || "";
  const time = ev.time ? new Date(ev.time).toLocaleTimeString() : "";

  if (ev.type === "snapshot") return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: NL.elevated, border: `1px solid ${NL.border}` }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.dotColor, flexShrink: 0 }} />
      <Badge color="blue">SNAP</Badge>
      <span style={{ fontSize: 12, color: NL.secondary }}>{ev.count} entries loaded</span>
      <span style={{ marginLeft: "auto", fontSize: 11, color: NL.muted, fontFamily: mono }}>{time}</span>
    </div>
  );
  if (ev.type === "clear") return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: NL.elevated, border: `1px solid ${NL.border}` }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.dotColor, flexShrink: 0 }} />
      <Badge color="warn">CLEAR</Badge>
      <span style={{ fontSize: 12, color: NL.secondary }}>{ev.entries?.length ?? 0} entries cleared</span>
      <span style={{ marginLeft: "auto", fontSize: 11, color: NL.muted, fontFamily: mono }}>{time}</span>
    </div>
  );
  return (
    <div style={{ borderRadius: 8, border: `1px solid ${NL.border}`, borderLeft: `2px solid ${meta.borderColor}`, background: NL.elevated, padding: "8px 10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.dotColor, flexShrink: 0 }} />
        <Badge color={meta.badge}>{meta.label}</Badge>
        <span style={{ fontFamily: mono, fontSize: 12, color: NL.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }} title={publicIp}>{publicIp || "—"}</span>
        {player && <span style={{ fontSize: 11, color: NL.secondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 100 }}>{player}</span>}
        {remoteIp && <span style={{ fontFamily: mono, fontSize: 11, color: NL.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>→ {remoteIp}{remotePort ? `:${remotePort}` : ""}</span>}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <span style={{ fontFamily: mono, fontSize: 10, color: NL.muted }}>{time}</span>
          {ev.type === "set" && publicIp && !isBanned && iconBtn(() => onBan(publicIp), "Ban IP", <IC.Ban />)}
          <button onClick={() => setExpanded(x => !x)} style={{ background: "none", border: "none", cursor: "pointer", color: NL.muted, fontSize: 10, padding: "2px 4px", fontFamily: mono }}>{expanded ? "▲" : "▼"}</button>
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${NL.border}` }}>
          <pre style={{ fontSize: 11, color: NL.secondary, fontFamily: mono, background: "rgba(0,0,0,0.3)", borderRadius: 6, padding: 10, overflow: "auto", maxHeight: 160, margin: 0 }}>
            {JSON.stringify(ev.type === "set" || ev.type === "del" ? v : ev, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function LiveEventsPanel({ isMobile }) {
  const [eventsFeed, setEventsFeed] = useState([]);
  const [sseStatus, setSseStatus] = useState("closed");
  const [currentMap, setCurrentMap] = useState({});
  const [rawFilter, setRawFilter] = useState("");
  const [filter, setFilter] = useState("");
  const [showOnly, setShowOnly] = useState("all");
  const [hideTracker, setHideTracker] = useState(true);
  const [bans, setBans] = useState([]);
  const esRef = useRef(null);
  const filterTimer = useRef(null);

  useEffect(() => {
    if (filterTimer.current) clearTimeout(filterTimer.current);
    filterTimer.current = setTimeout(() => setFilter(rawFilter.trim()), 220);
    return () => clearTimeout(filterTimer.current);
  }, [rawFilter]);

  useEffect(() => {
    (async () => {
      try {
        const token = await fetchIdToken();
        const res = await fetch(`${API_BASE}/api/admin/bans`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setBans((await res.json()).bans || []);
      } catch (_) { }
    })();
  }, []);

  const startStream = useCallback(async () => {
    if (esRef.current) return;
    setSseStatus("connecting");
    try {
      const token = await fetchIdToken(); if (!token) throw new Error("Not authenticated");
      const r = await fetch(`${API_BASE}/cache/admin/cache/stream-token?region=eu`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error("stream-token failed");
      const { streamToken } = await r.json();
      const es = new EventSource(`${API_BASE}/cache/admin/cache/stream?streamToken=${encodeURIComponent(streamToken)}&region=eu`);
      esRef.current = es;
      es.onopen = () => setSseStatus("open");
      es.onerror = () => setSseStatus("error");
      es.addEventListener("snapshot", e => {
        try {
          const d = JSON.parse(e.data || "{}");
          const entries = Array.isArray(d.entries) ? d.entries : [];
          const map = {};
          for (const { key, value } of entries) { if (key && value) map[key] = value; }
          setCurrentMap(map);
          setEventsFeed(prev => [...prev, { type: "snapshot", count: entries.length, time: d.time || Date.now() }].slice(-EVENTS_CAP));
        } catch (_) { }
      });
      es.addEventListener("set", e => {
        try {
          const d = JSON.parse(e.data || "{}");
          setEventsFeed(prev => [...prev, { type: "set", key: d.key, value: d.value, time: d.time || Date.now() }].slice(-EVENTS_CAP));
          if (d.key) setCurrentMap(prev => ({ ...prev, [d.key]: d.value || {} }));
        } catch (_) { }
      });
      es.addEventListener("del", e => {
        try {
          const d = JSON.parse(e.data || "{}");
          setEventsFeed(prev => [...prev, { type: "del", key: d.key, value: d.value, time: d.time || Date.now() }].slice(-EVENTS_CAP));
          if (d.key) setCurrentMap(prev => { const n = { ...prev }; delete n[d.key]; return n; });
        } catch (_) { }
      });
      es.addEventListener("clear", e => {
        try {
          const d = JSON.parse(e.data || "{}");
          setEventsFeed(prev => [...prev, { type: "clear", entries: d.entries || [], time: d.time || Date.now() }].slice(-EVENTS_CAP));
          setCurrentMap({});
        } catch (_) { }
      });
    } catch (err) { setSseStatus("closed"); }
  }, []);

  const stopStream = useCallback(() => {
    if (esRef.current) { try { esRef.current.close(); } catch (_) { } esRef.current = null; }
    setSseStatus("closed");
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  function isIpLocallyBanned(ip) { return ip ? bans.some(b => String(b.ip).toLowerCase() === String(ip).toLowerCase()) : false; }

  async function handleBan(ip) {
    if (!ip || !confirm(`Ban ${ip}?`)) return;
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/bans`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ ip, reason: "Banned from live events" }) });
      if (res.ok) {
        setBans(prev => [...prev, { ip }]);
        setCurrentMap(prev => { const n = { ...prev }; delete n[ip]; return n; });
      }
    } catch (_) { }
  }

  const filtered = useMemo(() => {
    return [...eventsFeed].reverse().filter(ev => {
      if (showOnly !== "all" && ev.type !== showOnly) return false;
      if (hideTracker && ev.key && (ev.key.startsWith("tracker:") || ev.key.startsWith("bots:") || ev.key.startsWith("fcm_"))) return false;
      if (!filter) return true;
      const s = filter.toLowerCase();
      const v = ev.value || {};
      return [v.publicIp, v.publicIP, v.public, v.remoteServerIp, v.remoteServerIP, v.remote, String(v.remoteServerPort || v.remotePort || v.port || ""), v.playerName, ev.key].some(x => (x || "").toLowerCase().includes(s));
    });
  }, [eventsFeed, filter, showOnly, hideTracker]);

  const players = Object.entries(currentMap).filter(([, v]) => v?.playerName);
  const inputStyle = { padding: "9px 12px", borderRadius: 9, border: `1px solid ${NL.borderMid}`, background: NL.subtle, color: NL.text, fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 16, alignItems: "start" }}>
      <Card
        title="Live cache feed"
        subtitle={`${filtered.length} events`}
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StatusDot status={sseStatus} />
            <span style={{ fontSize: 11, color: NL.muted }}>{sseStatus}</span>
            {sseStatus !== "open" && sseStatus !== "connecting"
              ? <Btn onClick={startStream} size="sm">Start</Btn>
              : <Btn onClick={stopStream} size="sm" variant="secondary">Stop</Btn>}
          </div>
        }
      >
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <input placeholder="Filter by IP / player / remote…" value={rawFilter} onChange={e => setRawFilter(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 160 }} />
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {["all", "set", "del", "clear"].map(v => (
              <button key={v} onClick={() => setShowOnly(v)} style={{ padding: "6px 8px", borderRadius: 7, fontSize: 11, fontWeight: 600, fontFamily: font, cursor: "pointer", border: `1px solid ${NL.border}`, background: showOnly === v ? NL.accent : "transparent", color: showOnly === v ? "#0d1a18" : NL.muted }}>
                {v === "all" ? "All" : v.toUpperCase()}
              </button>
            ))}
            <button onClick={() => setHideTracker(h => !h)} title="Hide tracker/bot events" style={{ padding: "6px 8px", borderRadius: 7, fontSize: 11, fontWeight: 600, fontFamily: font, cursor: "pointer", border: `1px solid ${NL.border}`, background: hideTracker ? NL.accent : "transparent", color: hideTracker ? "#0d1a18" : NL.muted }}>
              No noise
            </button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 520, overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <p style={{ fontSize: 13, color: NL.muted, textAlign: "center", padding: "32px 0" }}>
              {sseStatus === "open" ? "Waiting for events…" : "Press Start to connect to the live feed."}
            </p>
          ) : filtered.slice(0, 200).map((ev, i) => (
            <FeedEventRow key={`${ev.time}-${i}`} ev={ev} onBan={handleBan} isBanned={isIpLocallyBanned(ev.key)} />
          ))}
        </div>
      </Card>

      <Card title="Live players" subtitle={`${players.length} in cache`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 520, overflowY: "auto" }}>
          {players.length === 0 ? (
            <p style={{ fontSize: 13, color: NL.muted, textAlign: "center", padding: "16px 0" }}>No players in cache</p>
          ) : players.map(([key, val]) => {
            const banned = isIpLocallyBanned(key);
            const remote = val?.remoteServerIp || val?.remote || "—";
            const port = val?.remoteServerPort || val?.remotePort || val?.port || "";
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: NL.elevated, border: `1px solid ${NL.border}` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: NL.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val?.playerName || "—"}</p>
                  <p style={{ fontFamily: mono, fontSize: 10, color: NL.muted, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{key} → {remote}{port ? `:${port}` : ""}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                  {iconBtn(() => navigator.clipboard?.writeText(key), "Copy IP", <IC.Copy />)}
                  {banned ? <Badge color="danger">Banned</Badge> : iconBtn(() => handleBan(key), "Ban", <IC.Ban />)}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function QuickActionsCard() {
  async function downloadServers() {
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/servers/export`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "servers.json"; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { alert("Failed: " + e.message); }
  }

  return (
    <Card title="Quick actions">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Btn onClick={downloadServers} variant="secondary" size="sm">⬇ Download servers.json</Btn>
      </div>
    </Card>
  );
}

function PartnersManagementPanel() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [expandedUid, setExpandedUid] = useState(null);
  const [memberServers, setMemberServers] = useState({});
  const [loadingServers, setLoadingServers] = useState({});

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/partners`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      setMembers((await res.json()).partners || []);
    } catch (e) { setError("Failed: " + e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(uid, username) {
    if (!confirm(`Remove partner ${username}? This also deletes all their servers.`)) return;
    setDeleting(uid);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/partners/${encodeURIComponent(uid)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      setMembers(p => p.filter(m => m.firebaseUid !== uid));
    } catch (e) { alert("Failed: " + e.message); }
    finally { setDeleting(null); }
  }

  async function loadServersForMember(uid) {
    setLoadingServers(p => ({ ...p, [uid]: true }));
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/featured-servers/admin`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setMemberServers(p => ({ ...p, [uid]: (json.servers || []).filter(s => s.ownerUid === uid) }));
    } catch (_) { setMemberServers(p => ({ ...p, [uid]: [] })); }
    finally { setLoadingServers(p => ({ ...p, [uid]: false })); }
  }

  async function toggleFeatured(server) {
    const newVal = !server.featured;
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/featured-servers/admin/${server.id}/featured`, {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ featured: newVal }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setMemberServers(p => ({ ...p, [server.ownerUid]: (p[server.ownerUid] || []).map(s => s.id === server.id ? { ...s, featured: newVal } : s) }));
    } catch (e) { alert("Failed: " + e.message); }
  }

  function toggleExpand(uid) {
    if (expandedUid === uid) { setExpandedUid(null); return; }
    setExpandedUid(uid);
    loadServersForMember(uid);
  }

  return (
    <Card title="Partner accounts" subtitle={`${members.length} registered`} action={iconBtn(load, "Refresh", <IC.Refresh />)}>
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: NL.muted, fontSize: 13, padding: "24px 0", justifyContent: "center" }}><Spinner /> Loading…</div>
      ) : error ? (
        <p style={{ fontSize: 12, color: NL.danger, padding: "16px 0", textAlign: "center" }}>{error}</p>
      ) : members.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <IC.Users />
          <p style={{ fontSize: 13, color: NL.secondary, margin: "8px 0 0" }}>No partner accounts yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {members.map(m => {
            const uid = m.firebaseUid;
            const isExpanded = expandedUid === uid;
            return (
              <div key={uid} style={{ border: `1px solid ${NL.border}`, borderRadius: 10, background: NL.elevated, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", flexWrap: "wrap" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: NL.accentDim, border: `1px solid ${NL.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: NL.accent }}>
                    {(m.username || "?")[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: NL.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.displayName || m.username}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                      <span style={{ fontFamily: mono, fontSize: 10, color: NL.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{uid}</span>
                      {iconBtn(() => navigator.clipboard?.writeText(uid), "Copy UID", <IC.Copy />)}
                    </div>
                  </div>
                  <SlotEditor uid={uid} current={m.serverSlots ?? 0} onUpdate={n => setMembers(p => p.map(x => x.firebaseUid === uid ? { ...x, serverSlots: n } : x))} />
                  <button onClick={() => toggleExpand(uid)} style={{ fontSize: 11, color: NL.secondary, padding: "5px 8px", borderRadius: 7, border: `1px solid ${NL.border}`, background: "none", cursor: "pointer", flexShrink: 0, fontFamily: font }}>
                    Servers {isExpanded ? "▲" : "▼"}
                  </button>
                  <button onClick={() => handleDelete(uid, m.username)} disabled={deleting === uid}
                    style={{ background: "none", border: "none", cursor: "pointer", color: NL.muted, padding: 5, borderRadius: 6, flexShrink: 0, opacity: deleting === uid ? 0.4 : 1 }}
                    onMouseEnter={e => { e.currentTarget.style.color = NL.danger; e.currentTarget.style.background = NL.dangerDim; }}
                    onMouseLeave={e => { e.currentTarget.style.color = NL.muted; e.currentTarget.style.background = "transparent"; }}
                    title="Remove partner">
                    {deleting === uid ? <Spinner size={12} /> : <IC.Trash />}
                  </button>
                </div>
                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${NL.border}`, background: "rgba(0,0,0,0.15)", padding: "10px 12px" }}>
                    {loadingServers[uid] ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: NL.muted, fontSize: 12 }}><Spinner size={12} /> Loading…</div>
                    ) : !memberServers[uid] || memberServers[uid].length === 0 ? (
                      <p style={{ fontSize: 12, color: NL.muted, margin: 0 }}>No servers listed by this partner.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {memberServers[uid].map(s => (
                          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: NL.surface, border: `1px solid ${NL.border}` }}>
                            {s.iconUrl && <img src={s.iconUrl} alt={s.name} style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} onError={e => e.currentTarget.style.display = "none"} />}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: NL.text }}>{s.name}</span>
                              <span style={{ display: "block", fontFamily: mono, fontSize: 10, color: NL.muted }}>{s.address}:{s.port}</span>
                            </div>
                            <button onClick={() => toggleFeatured(s)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 7, cursor: "pointer", fontFamily: font, flexShrink: 0, background: s.featured ? "rgba(251,191,36,0.15)" : NL.elevated, border: s.featured ? "1px solid rgba(251,191,36,0.3)" : `1px solid ${NL.border}`, color: s.featured ? NL.warn : NL.muted, transition: "all 0.15s" }}>
                              ★ {s.featured ? "Featured" : "Feature"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function ReportExpanded({ report, onStatusChange }) {
  const [conv, setConv] = useState(null);
  const [convLoading, setConvLoading] = useState(false);
  const [convError, setConvError] = useState(null);
  const [modStatus, setModStatus] = useState(null);
  const [modLoading, setModLoading] = useState(true);
  const [banReason, setBanReason] = useState("");
  const [acting, setActing] = useState(null);
  const reportedUid = report.reported_uid;
  const reportedName = report.reported_username || reportedUid;

  useEffect(() => {
    async function loadMod() {
      setModLoading(true);
      try {
        const token = await fetchIdToken();
        const res = await fetch(`${API_BASE}/api/admin/users/${reportedUid}/moderation`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(`${res.status}`);
        setModStatus(await res.json());
      } catch (_) { setModStatus({}); }
      finally { setModLoading(false); }
    }
    loadMod();
  }, [reportedUid]);

  async function loadConversation() {
    setConvLoading(true); setConvError(null);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/users/${report.reporter_uid}/conversation/${reportedUid}?limit=50`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      setConv((await res.json()).messages || []);
    } catch (e) { setConvError("Failed: " + e.message); }
    finally { setConvLoading(false); }
  }

  async function restrictChat(hours) {
    if (!confirm(`Chat restrict ${reportedName} for ${hours}h?`)) return;
    setActing("restrict");
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/users/${reportedUid}/chat-restrict`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ hours }) });
      if (!res.ok) throw new Error(`${res.status}`);
      const { until } = await res.json();
      setModStatus(p => ({ ...p, chatRestrictedUntil: until }));
    } catch (e) { alert("Failed: " + e.message); }
    finally { setActing(null); }
  }

  async function liftRestriction() {
    setActing("lift");
    try {
      const token = await fetchIdToken();
      await fetch(`${API_BASE}/api/admin/users/${reportedUid}/chat-restrict`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setModStatus(p => ({ ...p, chatRestrictedUntil: null }));
    } catch (e) { alert("Failed: " + e.message); }
    finally { setActing(null); }
  }

  async function banAccount() {
    if (!confirm(`Ban account for ${reportedName}?`)) return;
    setActing("ban");
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/users/${reportedUid}/ban`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ reason: banReason.trim() || `Actioned from report #${report.id}` }) });
      if (!res.ok) throw new Error(`${res.status}`);
      setModStatus(p => ({ ...p, bannedAt: new Date().toISOString(), banReason: banReason.trim() }));
      onStatusChange(report.id, "actioned");
    } catch (e) { alert("Failed: " + e.message); }
    finally { setActing(null); }
  }

  async function unbanAccount() {
    if (!confirm(`Unban account for ${reportedName}?`)) return;
    setActing("unban");
    try {
      const token = await fetchIdToken();
      await fetch(`${API_BASE}/api/admin/users/${reportedUid}/ban`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setModStatus(p => ({ ...p, bannedAt: null, banReason: null }));
    } catch (e) { alert("Failed: " + e.message); }
    finally { setActing(null); }
  }

  const isBanned = !!modStatus?.bannedAt;
  const isRestricted = modStatus?.chatRestrictedUntil && new Date(modStatus.chatRestrictedUntil) > new Date();

  return (
    <div style={{ borderTop: `1px solid ${NL.border}`, background: "rgba(0,0,0,0.12)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 5, fontSize: 12 }}>
          <div><span style={{ color: NL.muted }}>Reporter: </span><span style={{ fontFamily: mono, color: NL.secondary }}>{report.reporter_username || report.reporter_uid}</span></div>
          <div><span style={{ color: NL.muted }}>Reported: </span><span style={{ fontFamily: mono, color: NL.secondary }}>{report.reported_username || report.reported_uid}</span></div>
          {report.message_id && <div><span style={{ color: NL.muted }}>Message ID: </span><span style={{ fontFamily: mono, color: NL.secondary }}>#{report.message_id}</span></div>}
          {report.additional_info && <div><span style={{ color: NL.muted }}>Info: </span><span style={{ color: NL.text }}>{report.additional_info}</span></div>}
        </div>
        <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Actions · {reportedName}</span>
            {modLoading ? <Spinner size={10} /> : (isBanned ? <Badge color="danger">Banned</Badge> : isRestricted ? <Badge color="warn">Chat restricted</Badge> : <Badge color="success">Clean</Badge>)}
          </div>
          {isRestricted && <p style={{ fontSize: 10, color: NL.warn, margin: 0 }}>Restricted until {new Date(modStatus.chatRestrictedUntil).toLocaleString()}</p>}
          {isBanned && modStatus?.banReason && <p style={{ fontSize: 10, color: NL.danger, margin: 0 }}>Reason: {modStatus.banReason}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, color: NL.muted, flexShrink: 0 }}>Chat restrict:</span>
              {[{ label: "1h", h: 1 }, { label: "24h", h: 24 }, { label: "7d", h: 168 }, { label: "30d", h: 720 }].map(({ label, h }) => (
                <Btn key={label} size="sm" variant="secondary" disabled={!!acting || isBanned} onClick={() => restrictChat(h)}>{label}</Btn>
              ))}
              {isRestricted && <Btn size="sm" variant="ghost" disabled={!!acting} onClick={liftRestriction}>{acting === "lift" ? <Spinner size={10} /> : "Lift"}</Btn>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input placeholder="Ban reason (optional)" value={banReason} onChange={e => setBanReason(e.target.value)} style={{ flex: 1, padding: "5px 8px", borderRadius: 7, border: `1px solid ${NL.border}`, background: NL.subtle, color: NL.text, fontSize: 11, fontFamily: font, outline: "none" }} />
              {!isBanned ? (
                <Btn size="sm" variant="danger" disabled={!!acting} onClick={banAccount}>{acting === "ban" ? <Spinner size={10} /> : <><IC.Ban /> Ban account</>}</Btn>
              ) : (
                <Btn size="sm" variant="success" disabled={!!acting} onClick={unbanAccount}>{acting === "unban" ? <Spinner size={10} /> : "Unban"}</Btn>
              )}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Conversation</span>
          {conv === null && !convLoading && <Btn size="sm" variant="secondary" onClick={loadConversation}>Load chat history</Btn>}
          {conv !== null && iconBtn(loadConversation, "Refresh", <IC.Refresh />)}
        </div>
        {convLoading && <div style={{ display: "flex", alignItems: "center", gap: 6, color: NL.muted, fontSize: 12 }}><Spinner size={12} /> Loading…</div>}
        {convError && <p style={{ fontSize: 11, color: NL.danger, margin: 0 }}>{convError}</p>}
        {conv !== null && !convLoading && (
          conv.length === 0 ? <p style={{ fontSize: 12, color: NL.muted, margin: 0 }}>No messages between these users.</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 300, overflowY: "auto", padding: "4px 0" }}>
              {conv.map(msg => {
                const isByReported = msg.senderUid === reportedUid;
                return (
                  <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isByReported ? "flex-start" : "flex-end", gap: 2 }}>
                    <div style={{ maxWidth: "80%", padding: "6px 10px", borderRadius: 10, background: isByReported ? NL.dangerDim : NL.accentDim, border: `1px solid ${isByReported ? NL.dangerBorder : NL.accentBorder}`, fontSize: 12, color: NL.text, wordBreak: "break-word" }}>{msg.content}</div>
                    <span style={{ fontSize: 9, color: NL.muted, paddingLeft: 4, paddingRight: 4 }}>{isByReported ? reportedName : (report.reporter_username || "reporter")} · {new Date(msg.createdAt).toLocaleTimeString()}</span>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function ModerationPanel({ isMobile }) {
  const [bans, setBans] = useState([]);
  const [bansLoading, setBansLoading] = useState(true);
  const [banError, setBanError] = useState(null);
  const [banIpInput, setBanIpInput] = useState("");
  const [banReasonInput, setBanReasonInput] = useState("");
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [updatingReport, setUpdatingReport] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);

  const loadBans = useCallback(async () => {
    setBansLoading(true); setBanError(null);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/bans`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      setBans((await res.json()).bans || []);
    } catch (e) { setBanError(String(e)); setBans([]); }
    finally { setBansLoading(false); }
  }, []);

  const loadReports = useCallback(async () => {
    setReportsLoading(true); setReportsError(null);
    try {
      const token = await fetchIdToken();
      const qs = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await fetch(`${API_BASE}/api/admin/reports${qs}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      setReports((await res.json()).reports || []);
    } catch (e) { setReportsError("Failed: " + e.message); }
    finally { setReportsLoading(false); }
  }, [statusFilter]);

  useEffect(() => { loadBans(); }, [loadBans]);
  useEffect(() => { loadReports(); }, [loadReports]);

  async function handleBan(ip, reason = "") {
    if (!ip) return;
    if (!confirm(`Ban ${ip}?`)) return;
    setBanError(null);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/bans`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ ip, reason }) });
      if (!res.ok) throw new Error(`${res.status}`);
      await loadBans(); setBanIpInput(""); setBanReasonInput("");
    } catch (e) { setBanError(String(e)); }
  }

  async function handleUnban(ip) {
    if (!ip || !confirm(`Unban ${ip}?`)) return;
    try {
      const token = await fetchIdToken();
      await fetch(`${API_BASE}/api/admin/bans/${encodeURIComponent(ip)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      await loadBans();
    } catch (e) { setBanError(String(e)); }
  }

  async function setReportStatus(id, status) {
    setUpdatingReport(id);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/reports/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error(`${res.status}`);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (e) { alert("Failed: " + e.message); }
    finally { setUpdatingReport(null); }
  }

  const statusColors = { pending: "warn", reviewed: "blue", dismissed: "default", actioned: "danger" };
  const reasonColors = { spam: "warn", harassment: "danger", inappropriate: "danger", other: "default" };
  const inputStyle = { padding: "9px 12px", borderRadius: 9, border: `1px solid ${NL.borderMid}`, background: NL.subtle, color: NL.text, fontSize: 13, fontFamily: font, outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card title="User reports" subtitle={`${reports.length} shown`} action={
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {iconBtn(loadReports, "Refresh", <IC.Refresh />)}
          <div style={{ display: "flex", gap: 2, background: NL.subtle, borderRadius: 8, padding: 2, border: `1px solid ${NL.border}` }}>
            {["all", ...REPORT_STATUSES].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, borderRadius: 6, border: "none", cursor: "pointer", fontFamily: font, background: statusFilter === s ? NL.accent : "transparent", color: statusFilter === s ? "#0d1a18" : NL.secondary, transition: "background 0.15s, color 0.15s" }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      }>
        {reportsLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: NL.muted, fontSize: 13, padding: "24px 0", justifyContent: "center" }}><Spinner /> Loading…</div>
        ) : reportsError ? (
          <p style={{ fontSize: 12, color: NL.danger, padding: "16px 0", textAlign: "center" }}>{reportsError}</p>
        ) : reports.length === 0 ? (
          <p style={{ fontSize: 13, color: NL.muted, textAlign: "center", padding: "32px 0" }}>No reports found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {reports.map(r => {
              const isExpanded = expandedReport === r.id;
              return (
                <div key={r.id} style={{ border: `1px solid ${NL.border}`, borderRadius: 10, background: NL.elevated, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: mono, fontSize: 11, color: NL.muted, flexShrink: 0 }}>#{r.id}</span>
                    <Badge color={reasonColors[r.reason] || "default"}>{r.reason}</Badge>
                    <Badge color={statusColors[r.status] || "default"}>{r.status}</Badge>
                    <div style={{ flex: 1, minWidth: 120, display: "flex", flexDirection: "column", gap: 1 }}>
                      <span style={{ fontSize: 12, color: NL.text }}>
                        <span style={{ color: NL.muted }}>Reporter: </span><span style={{ fontFamily: mono }}>{r.reporter_username || r.reporter_uid}</span>
                        <span style={{ color: NL.muted }}> → </span><span style={{ fontFamily: mono }}>{r.reported_username || r.reported_uid}</span>
                      </span>
                      <span style={{ fontSize: 10, color: NL.muted }}>{new Date(r.created_at).toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
                      {r.status === "pending" && (
                        <>
                          <Btn size="sm" variant="success" disabled={updatingReport === r.id} onClick={() => setReportStatus(r.id, "actioned")}>{updatingReport === r.id ? <Spinner size={10} /> : "Action"}</Btn>
                          <Btn size="sm" variant="secondary" disabled={updatingReport === r.id} onClick={() => setReportStatus(r.id, "reviewed")}>Review</Btn>
                          <Btn size="sm" variant="ghost" disabled={updatingReport === r.id} onClick={() => setReportStatus(r.id, "dismissed")}>Dismiss</Btn>
                        </>
                      )}
                      {r.status !== "pending" && <Btn size="sm" variant="ghost" disabled={updatingReport === r.id} onClick={() => setReportStatus(r.id, "pending")}>Reopen</Btn>}
                      <button onClick={() => setExpandedReport(isExpanded ? null : r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: NL.muted, fontSize: 10, padding: "2px 4px", fontFamily: mono }}>{isExpanded ? "▲" : "▼"}</button>
                    </div>
                  </div>
                  {isExpanded && <ReportExpanded report={r} onStatusChange={(id, status) => setReports(prev => prev.map(x => x.id === id ? { ...x, status } : x))} />}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
        <Card title="Ban IP" subtitle="Manually ban an IP address">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input placeholder="IP address" value={banIpInput} onChange={e => setBanIpInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleBan(banIpInput.trim(), banReasonInput.trim())} style={inputStyle} />
            <input placeholder="Reason (optional)" value={banReasonInput} onChange={e => setBanReasonInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleBan(banIpInput.trim(), banReasonInput.trim())} style={inputStyle} />
            <Btn onClick={() => handleBan(banIpInput.trim(), banReasonInput.trim())} variant="danger" disabled={!banIpInput.trim()} style={{ justifyContent: "center" }}><IC.Ban /> Ban IP</Btn>
            {banError && <p style={{ fontSize: 11, color: NL.danger, margin: 0 }}>{banError}</p>}
          </div>
        </Card>
        <Card title="Active IP bans" subtitle={`${bans.length} total`} action={iconBtn(loadBans, "Refresh", <IC.Refresh />)}>
          {bansLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: NL.muted, fontSize: 13, padding: "16px 0", justifyContent: "center" }}><Spinner /> Loading…</div>
          ) : bans.length === 0 ? (
            <p style={{ fontSize: 13, color: NL.muted, textAlign: "center", padding: "16px 0" }}>No active bans</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 280, overflowY: "auto" }}>
              {bans.map(b => (
                <div key={b.ip} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: NL.dangerDim, border: `1px solid ${NL.dangerBorder}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: NL.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.ip}</p>
                    <p style={{ fontSize: 10, color: NL.muted, margin: 0 }}>{b.reason || "No reason"}</p>
                  </div>
                  <button onClick={() => handleUnban(b.ip)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, background: NL.elevated, border: `1px solid ${NL.border}`, color: NL.secondary, cursor: "pointer", fontFamily: font, flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.color = NL.text} onMouseLeave={e => e.currentTarget.style.color = NL.secondary}>Unban</button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function FeedbackBubble({ r, email }) {
  const isAdmin = r.direction === "admin_to_user";
  const [translation, setTranslation] = useState(null);
  const [translating, setTranslating] = useState(false);

  async function translate() {
    if (translation || translating) return;
    setTranslating(true);
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(r.message)}&langpair=auto|en`);
      const data = await res.json();
      setTranslation(data?.responseData?.translatedText || null);
    } catch (_) {}
    finally { setTranslating(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isAdmin ? "flex-end" : "flex-start" }}>
      <div style={{ maxWidth: "80%", background: isAdmin ? NL.accentDim : NL.subtle, border: `1px solid ${isAdmin ? NL.accentBorder : NL.border}`, borderRadius: isAdmin ? "12px 12px 4px 12px" : "12px 12px 12px 4px", padding: "8px 12px" }}>
        <p style={{ margin: 0, fontSize: 13, color: NL.text, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{r.message}</p>
        {translation && (
          <p style={{ margin: "6px 0 0", fontSize: 12, color: NL.secondary, lineHeight: 1.5, whiteSpace: "pre-wrap", borderTop: `1px solid ${NL.border}`, paddingTop: 6, fontStyle: "italic" }}>🌐 {translation}</p>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
        <span style={{ fontSize: 10, color: NL.muted, fontFamily: mono }}>
          {isAdmin ? (r.admin_email || "admin") : email} · {new Date(r.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </span>
        {!isAdmin && !translation && (
          <button onClick={translate} disabled={translating} style={{ fontSize: 10, padding: "1px 7px", borderRadius: 4, border: `1px solid ${NL.border}`, background: "transparent", color: NL.muted, cursor: translating ? "default" : "pointer", fontFamily: mono }}>
            {translating ? "…" : "Translate"}
          </button>
        )}
      </div>
    </div>
  );
}

function FeedbackItem({ c, onDelete, initialIssue = null }) {
  const [expanded, setExpanded] = useState(false);
  const [ghIssue, setGhIssue] = useState(initialIssue);
  const [ghLoading, setGhLoading] = useState(false);
  const [replies, setReplies] = useState([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [replyError, setReplyError] = useState(null);

  async function loadIssue() {
    if (ghIssue || ghLoading) return;
    setGhLoading(true);
    try {
      const ghRes = await fetch(`https://api.github.com/repos/MCCORG/MCCompanion/issues/${c.issue_number}`, { headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" } });
      if (ghRes.ok) setGhIssue(await ghRes.json());
    } catch (_) { }
    finally { setGhLoading(false); }
  }

  const isDm = !!c.username;

  async function loadReplies() {
    setRepliesLoading(true);
    try {
      const token = await fetchIdToken();
      if (isDm) {
        const res = await fetch(`${API_BASE}/api/admin/support/messages/${encodeURIComponent(c.username)}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          const msgs = (data.messages || []).map(m => ({
            id: m.id,
            direction: m.senderUid === data.userUid ? "user_to_admin" : "admin_to_user",
            message: m.content,
            admin_email: m.sentByUsername || null,
            created_at: m.createdAt,
          }));
          setReplies(msgs);
        }
      } else {
        const res = await fetch(`${API_BASE}/api/admin/feedback-contacts/${c.issue_number}/replies`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setReplies((await res.json()).replies || []);
      }
    } catch (_) { }
    finally { setRepliesLoading(false); }
  }

  function toggle() {
    setExpanded(v => !v);
    if (!expanded) { loadIssue(); loadReplies(); }
  }

  async function sendReply() {
    if (!reply.trim() || sending) return;
    setSending(true); setReplyError(null);
    try {
      const token = await fetchIdToken();
      if (isDm) {
        const prefix = replies.length === 0 ? `[Feedback #${c.issue_number}] ` : "";
        const res = await fetch(`${API_BASE}/api/admin/support/messages/${encodeURIComponent(c.username)}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ content: prefix + reply.trim() }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || data.error || `${res.status}`);
      } else {
        const res = await fetch(`${API_BASE}/api/admin/feedback-contacts/${c.issue_number}/reply`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ message: reply.trim(), issueTitle: ghIssue?.title }) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || `${res.status}`);
      }
      setReply("");
      await loadReplies();
    } catch (e) { setReplyError(e.message); }
    finally { setSending(false); }
  }

  async function handleDelete() {
    if (!confirm(`Remove contact for issue #${c.issue_number}?`)) return;
    setDeleting(true);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/feedback-contacts/${c.issue_number}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      onDelete(c.issue_number);
    } catch (e) { alert("Failed: " + e.message); setDeleting(false); }
  }

  const isBug = ghIssue?.labels?.some(l => l.name === "bug");
  const stateColor = ghIssue?.state === "closed" ? NL.muted : NL.success;

  return (
    <div style={{ border: `1px solid ${expanded ? NL.borderMid : NL.border}`, borderRadius: 12, background: NL.elevated, overflow: "hidden", transition: "border-color 0.15s" }}>
      <div onClick={toggle} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: NL.muted, flexShrink: 0 }}>#{c.issue_number}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: NL.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ghIssue?.title || `Issue #${c.issue_number}`}</p>
          <p style={{ margin: "1px 0 0", fontSize: 11, color: NL.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            from {c.username ? <span style={{ color: NL.accent, fontFamily: mono }}>@{c.username}</span> : <span style={{ fontFamily: mono }}>{c.email ?? "unknown"}</span>}
          </p>
        </div>
        {replies.length > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: NL.subtle, color: NL.secondary, border: `1px solid ${NL.border}`, fontFamily: mono, flexShrink: 0 }}>{replies.length} msg{replies.length !== 1 ? "s" : ""}</span>}
        {ghIssue && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: isBug ? NL.dangerDim : NL.accentDim, color: isBug ? NL.danger : NL.accent, border: `1px solid ${isBug ? NL.dangerBorder : NL.accentBorder}`, fontFamily: mono, flexShrink: 0 }}>{isBug ? "BUG" : "FEATURE"}</span>}
        {ghIssue && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4, background: "transparent", color: stateColor, border: `1px solid ${stateColor}22`, fontFamily: mono, flexShrink: 0 }}>{ghIssue.state}</span>}
        <span style={{ fontSize: 11, color: NL.muted, flexShrink: 0 }}>{new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
        <span style={{ color: NL.muted, fontSize: 12, flexShrink: 0 }}>{expanded ? "▲" : "▼"}</span>
      </div>
      {expanded && (
        <div style={{ borderTop: `1px solid ${NL.border}`, padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
          {ghLoading ? <div style={{ display: "flex", alignItems: "center", gap: 8, color: NL.muted, fontSize: 13 }}><Spinner size={13} /> Loading issue…</div>
            : ghIssue ? <div style={{ background: NL.subtle, borderRadius: 8, padding: "12px 14px", fontSize: 12, color: NL.secondary, lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 160, overflow: "auto", fontFamily: mono }}>{ghIssue.body || "(no description)"}</div>
              : null}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {c.username
              ? <a href={`/admin?tab=messages&user=${encodeURIComponent(c.username)}`} title="Open DM" style={{ fontFamily: mono, fontSize: 12, color: NL.accent, background: NL.accentDim, padding: "4px 10px", borderRadius: 6, border: `1px solid ${NL.accentBorder}`, textDecoration: "none" }}>👤 @{c.username} · DM →</a>
              : c.email
                ? <span style={{ fontFamily: mono, fontSize: 12, color: NL.text, background: NL.subtle, padding: "4px 10px", borderRadius: 6, border: `1px solid ${NL.borderMid}` }}>✉ {c.email}</span>
                : <span style={{ fontSize: 12, color: NL.muted }}>No contact info</span>}
            <a href={`https://github.com/MCCORG/MCCompanion/issues/${c.issue_number}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: NL.accent, textDecoration: "none", padding: "4px 10px", borderRadius: 6, border: `1px solid ${NL.accentBorder}`, background: NL.accentDim }}>GitHub ↗</a>
            <div style={{ flex: 1 }} />
            <button onClick={handleDelete} disabled={deleting} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: `1px solid ${NL.dangerBorder}`, background: NL.dangerDim, color: NL.danger, cursor: "pointer", fontFamily: font, opacity: deleting ? 0.5 : 1 }}>{deleting ? "…" : "Remove contact"}</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: NL.secondary, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: mono }}>
                {isDm ? "DM conversation" : "Email conversation"}
              </label>
              {iconBtn(loadReplies, "Refresh", <IC.Refresh />)}
            </div>
            {repliesLoading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: NL.muted, fontSize: 12 }}><Spinner size={11} /> Loading…</div>
            ) : replies.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12, color: NL.muted }}>No messages yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {replies.map(r => <FeedbackBubble key={r.id} r={r} email={c.username ? `@${c.username}` : c.email} />)}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Write your reply…" rows={3}
              style={{ width: "100%", padding: "10px 12px", background: NL.surface, border: `1px solid ${NL.borderMid}`, borderRadius: 8, color: NL.text, fontSize: 13, fontFamily: font, resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }} />
            {replyError && <p style={{ margin: 0, fontSize: 12, color: NL.danger }}>{replyError}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={sendReply} disabled={sending || !reply.trim()}
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, padding: "7px 16px", borderRadius: 8, background: reply.trim() && !sending ? NL.accent : NL.elevated, border: `1px solid ${reply.trim() && !sending ? NL.accent : NL.border}`, color: reply.trim() && !sending ? "#000" : NL.muted, cursor: reply.trim() && !sending ? "pointer" : "not-allowed", fontFamily: font, transition: "all 0.15s" }}>
                {sending ? <><Spinner size={12} /> Sending…</> : (c.username ? "Send DM" : "Send email")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackPanel() {
  const [contacts, setContacts] = useState([]);
  const [issues, setIssues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all | bug | feature | open | closed

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const token = await fetchIdToken();
      fetch(`${API_BASE}/api/admin/feedback-contacts/sync-inbox`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
      const res = await fetch(`${API_BASE}/api/admin/feedback-contacts`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      setContacts((await res.json()).contacts || []);

      // Batch-load the GitHub issues so titles/types show without expanding.
      const map = {};
      for (const state of ["open", "closed"]) {
        try {
          const gh = await fetch(`https://api.github.com/repos/MCCORG/MCCompanion/issues?labels=app-feedback&state=${state}&per_page=100`, { headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" } });
          if (gh.ok) for (const issue of await gh.json()) map[issue.number] = issue;
        } catch (_) { }
      }
      setIssues(map);
    } catch (e) { setError("Failed: " + e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = contacts.filter(c => {
    const issue = issues[c.issue_number];
    if (filter === "all") return true;
    if (filter === "open") return issue?.state !== "closed";
    if (filter === "closed") return issue?.state === "closed";
    const isBug = issue?.labels?.some(l => l.name === "bug");
    if (filter === "bug") return isBug === true;
    if (filter === "feature") return issue ? !isBug : false;
    return true;
  });

  const FILTERS = [
    { id: "all", label: "All" },
    { id: "open", label: "Open" },
    { id: "closed", label: "Closed" },
    { id: "bug", label: "🐛 Bugs" },
    { id: "feature", label: "💡 Features" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card
        title="Feedback"
        subtitle="Bug reports & feature requests from the app and website. Reply via DM (or email for older entries)"
        action={iconBtn(load, "Refresh", <IC.Refresh />)}
      >
        <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{ padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, fontFamily: font, cursor: "pointer", border: `1px solid ${filter === f.id ? NL.accentBorder : NL.border}`, background: filter === f.id ? NL.accentDim : "transparent", color: filter === f.id ? NL.accent : NL.muted }}>
              {f.label}
            </button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 11, color: NL.muted, alignSelf: "center" }}>{filtered.length} of {contacts.length}</span>
        </div>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: NL.muted, fontSize: 13, padding: "24px 0", justifyContent: "center" }}><Spinner /> Loading…</div>
        ) : error ? (
          <p style={{ fontSize: 12, color: NL.danger, padding: "16px 0", textAlign: "center" }}>{error}</p>
        ) : filtered.length === 0 ? (
          <p style={{ fontSize: 13, color: NL.muted, textAlign: "center", padding: "32px 0" }}>No feedback here.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(c => <FeedbackItem key={c.issue_number} c={c} initialIssue={issues[c.issue_number] ?? null} onDelete={n => setContacts(p => p.filter(x => x.issue_number !== n))} />)}
          </div>
        )}
      </Card>
    </div>
  );
}

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function FeaturedPacksPanel() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);
  const [form, setForm] = useState({ name: "", description: "", tags: "", thumbnailUrl: "", sortOrder: "0", category: "", longDescription: "", creatorWebsite: "", creatorDiscord: "" });

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768); }
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const [packEditTags, setPackEditTags] = useState({});
  const [packEditCategory, setPackEditCategory] = useState({});
  const [editingPack, setEditingPack] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const CATEGORIES = ["realism","faithful","pvp","cartoon","dark","medieval","nature","themed","other"];
  const fileRef = useRef();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/featured-packs/admin`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setPacks(data.packs || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return setError("Select a .mcpack or .zip file first");
    if (!form.name.trim()) return setError("Pack name is required");
    setUploading(true); setError(null);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/featured-packs/admin`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/octet-stream",
          "x-pack-name": form.name.trim(),
          "x-pack-description": form.description.trim(),
          "x-pack-thumbnail": form.thumbnailUrl.trim(),
          "x-pack-sort": form.sortOrder,
          "x-pack-tags": form.tags.trim(),
          "x-pack-category": form.category,
          "x-pack-creator-website": form.creatorWebsite.trim(),
          "x-pack-creator-discord": form.creatorDiscord.trim(),
        },
        body: file,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.status);

      if (form.longDescription.trim() && data.pack?.id) {
        const patchRes = await fetch(`${API_BASE}/api/featured-packs/admin/${data.pack.id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ longDescription: form.longDescription.trim() }),
        });
        if (!patchRes.ok) throw new Error("Pack uploaded but failed to save description");
      }

      setForm({ name: "", description: "", tags: "", thumbnailUrl: "", sortOrder: "0", category: "", longDescription: "", creatorWebsite: "", creatorDiscord: "" });
      if (fileRef.current) fileRef.current.value = "";
      await load();
    } catch (e) { setError(e.message); }
    finally { setUploading(false); }
  }

  function openEdit(pack) {
    setEditingPack(pack);
    setEditForm({
      name: pack.name || "",
      slug: pack.slug || "",
      description: pack.description || "",
      thumbnailUrl: pack.thumbnailUrl || "",
      sortOrder: String(pack.sortOrder ?? 0),
      tags: (pack.tags || []).join(", "),
      category: pack.category || "",
      longDescription: pack.longDescription || "",
      creatorWebsite: pack.creatorWebsite || "",
      creatorDiscord: pack.creatorDiscord || "",
    });
    setEditError(null);
  }

  async function saveEdit() {
    if (!editingPack) return;
    setEditSaving(true); setEditError(null);
    try {
      const token = await fetchIdToken();
      const body = {
        name: editForm.name.trim() || undefined,
        slug: editForm.slug.trim() || undefined,
        description: editForm.description.trim() || null,
        thumbnailUrl: editForm.thumbnailUrl.trim() || null,
        sortOrder: parseInt(editForm.sortOrder, 10) || 0,
        tags: editForm.tags.split(",").map(t => t.trim()).filter(Boolean),
        category: editForm.category || null,
        longDescription: editForm.longDescription.trim() || null,
        creatorWebsite: editForm.creatorWebsite.trim() || null,
        creatorDiscord: editForm.creatorDiscord.trim() || null,
      };
      const res = await fetch(`${API_BASE}/api/featured-packs/admin/${editingPack.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.status);
      setPacks(p => p.map(x => x.id === editingPack.id ? { ...x, ...body, tags: body.tags } : x));
      setEditingPack(null);
    } catch (e) { setEditError(e.message); }
    finally { setEditSaving(false); }
  }

  async function toggleActive(pack) {
    try {
      const token = await fetchIdToken();
      await fetch(`${API_BASE}/api/featured-packs/admin/${pack.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !pack.isActive }),
      });
      setPacks(p => p.map(x => x.id === pack.id ? { ...x, isActive: !x.isActive } : x));
    } catch (e) { setError(e.message); }
  }

  async function deletePack(pack) {
    if (!confirm(`Delete "${pack.name}"? This removes the file from R2.`)) return;
    try {
      const token = await fetchIdToken();
      await fetch(`${API_BASE}/api/featured-packs/admin/${pack.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setPacks(p => p.filter(x => x.id !== pack.id));
    } catch (e) { setError(e.message); }
  }

  async function savePackTags(pack) {
    const tagArray = (packEditTags[pack.id]?.value ?? "").split(",").map(t => t.trim()).filter(Boolean);
    try {
      const token = await fetchIdToken();
      await fetch(`${API_BASE}/api/featured-packs/admin/${pack.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ tags: tagArray }),
      });
      setPacks(p => p.map(x => x.id === pack.id ? { ...x, tags: tagArray } : x));
      setPackEditTags(m => { const n = { ...m }; delete n[pack.id]; return n; });
    } catch (e) { setError(e.message); }
  }

  async function savePackCategory(pack) {
    const category = packEditCategory[pack.id]?.value || null;
    try {
      const token = await fetchIdToken();
      await fetch(`${API_BASE}/api/featured-packs/admin/${pack.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      setPacks(p => p.map(x => x.id === pack.id ? { ...x, category } : x));
      setPackEditCategory(m => { const n = { ...m }; delete n[pack.id]; return n; });
    } catch (e) { setError(e.message); }
  }

  const inp = (field) => ({
    value: form[field],
    onChange: e => setForm(f => ({ ...f, [field]: e.target.value })),
    style: { width: "100%", background: NL.elevated, border: `1px solid ${NL.border}`, borderRadius: 8, padding: "8px 12px", color: NL.text, fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box" },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <section style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 14, padding: "20px 24px" }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: NL.text, margin: "0 0 16px" }}>Upload Featured Pack</p>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, color: NL.muted, fontWeight: 600 }}>NAME *</label>
            <input placeholder="Cool Texture Pack" {...inp("name")} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, color: NL.muted, fontWeight: 600 }}>SORT ORDER</label>
            <input type="number" placeholder="0" {...inp("sortOrder")} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 11, color: NL.muted, fontWeight: 600 }}>DESCRIPTION</label>
            <input placeholder="A short description…" {...inp("description")} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 11, color: NL.muted, fontWeight: 600 }}>TAGS (comma-separated)</label>
            <input placeholder="pvp, medieval, 32x…" {...inp("tags")} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 11, color: NL.muted, fontWeight: 600 }}>CATEGORY</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              style={{ width: "100%", background: NL.elevated, border: `1px solid ${NL.border}`, borderRadius: 8, padding: "8px 12px", color: form.category ? NL.text : NL.muted, fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box", cursor: "pointer" }}>
              <option value="">Select category…</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 11, color: NL.muted, fontWeight: 600 }}>THUMBNAIL URL</label>
            <input placeholder="https://…/thumb.png" {...inp("thumbnailUrl")} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 11, color: NL.muted, fontWeight: 600 }}>LONG DESCRIPTION (Markdown + images supported)</label>
            <textarea value={form.longDescription} onChange={e => setForm(f => ({ ...f, longDescription: e.target.value }))} rows={6} placeholder={"## About this pack\n\nA detailed description with **markdown** support.\n\n![Screenshot](https://...)"} style={{ width: "100%", background: NL.elevated, border: `1px solid ${NL.border}`, borderRadius: 8, padding: "8px 12px", color: NL.text, fontSize: 13, fontFamily: mono, outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, color: NL.muted, fontWeight: 600 }}>CREATOR WEBSITE</label>
            <input placeholder="https://creator.com" {...inp("creatorWebsite")} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, color: NL.muted, fontWeight: 600 }}>DISCORD INVITE</label>
            <input placeholder="https://discord.gg/..." {...inp("creatorDiscord")} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 11, color: NL.muted, fontWeight: 600 }}>PACK FILE (.mcpack or .zip) *</label>
            <input ref={fileRef} type="file" accept=".mcpack,.zip" style={{ color: NL.secondary, fontSize: 13 }} />
          </div>
        </div>
        {error && <p style={{ color: NL.danger, fontSize: 12, margin: "12px 0 0" }}>{error}</p>}
        <button onClick={upload} disabled={uploading} style={{ marginTop: 16, padding: "9px 20px", background: uploading ? NL.elevated : NL.accent, color: uploading ? NL.muted : "#000", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: uploading ? "not-allowed" : "pointer", fontFamily: font }}>
          {uploading ? "Uploading… (this may take a moment)" : "Upload Pack"}
        </button>
      </section>

      <section style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${NL.border}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: NL.text, margin: 0 }}>Packs ({packs.length})</p>
        </div>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center" }}><Spinner size={20} /></div>
        ) : packs.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: NL.muted, fontSize: 13 }}>No packs yet</div>
        ) : packs.map(pack => (
          <div key={pack.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: isMobile ? "14px 16px" : "14px 24px", borderBottom: `1px solid ${NL.border}`, flexWrap: isMobile ? "wrap" : "nowrap" }}>
            {pack.thumbnailUrl
              ? <img src={pack.thumbnailUrl} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
              : <div style={{ width: 44, height: 44, borderRadius: 8, background: NL.elevated, flexShrink: 0 }} />
            }
            <div style={{ flex: 1, minWidth: isMobile ? "calc(100% - 58px)" : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <p style={{ margin: 0, fontWeight: 600, color: NL.text, fontSize: 13 }}>{pack.name}</p>
                {pack.category && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: NL.warnDim, color: NL.warn, border: `1px solid rgba(251,191,36,0.22)`, fontFamily: mono }}>{pack.category}</span>}
              </div>
              {pack.slug && (
                <span style={{ fontFamily: mono, fontSize: 10, color: NL.muted }}>/packs?slug={pack.slug}</span>
              )}
              {pack.description && <p style={{ margin: "2px 0 0", color: NL.muted, fontSize: 12 }}>{pack.description}</p>}
              <p style={{ margin: "2px 0 0", color: NL.muted, fontSize: 11, fontFamily: mono }}>{pack.sha256 ? pack.sha256.slice(0, 12) + "…" : ""}</p>
              {pack.fileSize > 0 && <p style={{ margin: "2px 0 0", color: NL.muted, fontSize: 11 }}>{formatBytes(pack.fileSize)}</p>}
              {pack.tags?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                  {pack.tags.map(t => (
                    <span key={t} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: NL.accentDim, color: NL.accent, border: `1px solid ${NL.accentBorder}`, fontFamily: mono }}>{t}</span>
                  ))}
                </div>
              )}
              {packEditTags[pack.id] ? (
                <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
                  <input
                    value={packEditTags[pack.id].value}
                    onChange={e => setPackEditTags(m => ({ ...m, [pack.id]: { value: e.target.value } }))}
                    placeholder="tag1, tag2…"
                    style={{ fontSize: 11, padding: "4px 8px", background: NL.elevated, border: `1px solid ${NL.border}`, borderRadius: 6, color: NL.text, fontFamily: mono, outline: "none" }}
                  />
                  <button onClick={() => savePackTags(pack)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontFamily: font, background: NL.accentDim, border: `1px solid ${NL.accentBorder}`, color: NL.accent }}>Save</button>
                  <button onClick={() => setPackEditTags(m => { const n = { ...m }; delete n[pack.id]; return n; })} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontFamily: font, background: NL.elevated, border: `1px solid ${NL.border}`, color: NL.muted }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setPackEditTags(m => ({ ...m, [pack.id]: { value: (pack.tags || []).join(", ") } }))} style={{ marginTop: 4, fontSize: 10, padding: "2px 8px", borderRadius: 4, cursor: "pointer", fontFamily: font, background: "transparent", border: `1px solid ${NL.border}`, color: NL.muted }}>Edit tags</button>
              )}
              {packEditCategory[pack.id] ? (
                <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
                  <select value={packEditCategory[pack.id].value} onChange={e => setPackEditCategory(m => ({ ...m, [pack.id]: { value: e.target.value } }))}
                    style={{ fontSize: 11, padding: "4px 8px", background: NL.elevated, border: `1px solid ${NL.border}`, borderRadius: 6, color: NL.text, fontFamily: mono, outline: "none", cursor: "pointer" }}>
                    <option value="">None</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                  <button onClick={() => savePackCategory(pack)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontFamily: font, background: NL.warnDim, border: `1px solid rgba(251,191,36,0.22)`, color: NL.warn }}>Save</button>
                  <button onClick={() => setPackEditCategory(m => { const n = { ...m }; delete n[pack.id]; return n; })} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontFamily: font, background: NL.elevated, border: `1px solid ${NL.border}`, color: NL.muted }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setPackEditCategory(m => ({ ...m, [pack.id]: { value: pack.category || "" } }))} style={{ marginTop: 4, fontSize: 10, padding: "2px 8px", borderRadius: 4, cursor: "pointer", fontFamily: font, background: "transparent", border: `1px solid ${NL.border}`, color: NL.muted }}>Edit category</button>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "flex-start" : "flex-end", gap: 6, width: isMobile ? "100%" : "auto" }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: NL.muted }}>↓ {pack.downloadCount ?? 0}</span>
                <button onClick={() => openEdit(pack)} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontFamily: font, background: NL.elevated, border: `1px solid ${NL.borderMid}`, color: NL.secondary }}
                  onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.borderColor = NL.border; }}
                  onMouseLeave={e => { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.borderColor = NL.borderMid; }}>
                  Edit
                </button>
                <button onClick={() => toggleActive(pack)} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontFamily: font, background: pack.isActive ? NL.accentDim : NL.elevated, border: `1px solid ${pack.isActive ? NL.accentBorder : NL.border}`, color: pack.isActive ? NL.accent : NL.muted }}>
                  {pack.isActive ? "Active" : "Inactive"}
                </button>
                <button onClick={() => deletePack(pack)} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontFamily: font, background: NL.dangerDim, border: `1px solid ${NL.dangerBorder}`, color: NL.danger }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
      {editingPack && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setEditingPack(null); }}>
          <div style={{ background: NL.surface, border: `1px solid ${NL.borderMid}`, borderRadius: 16, padding: isMobile ? 16 : 24, width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", gap: 16, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: NL.text, margin: 0 }}>Edit pack</p>
              <button onClick={() => setEditingPack(null)} style={{ background: "none", border: "none", cursor: "pointer", color: NL.muted, fontSize: 18, lineHeight: 1 }}>✕</button>
            </div>
            {editForm.thumbnailUrl && (
              <img src={editForm.thumbnailUrl} alt="" style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover", border: `1px solid ${NL.border}` }} onError={e => e.currentTarget.style.display = "none"} />
            )}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              {[
                { label: "NAME *", field: "name", full: false },
                { label: "SORT ORDER", field: "sortOrder", full: false, type: "number" },
                { label: "SLUG", field: "slug", full: true },
                { label: "DESCRIPTION", field: "description", full: true },
                { label: "THUMBNAIL URL", field: "thumbnailUrl", full: true },
                { label: "TAGS (comma-separated)", field: "tags", full: true },
              ].map(({ label, field, full, type }) => (
                <div key={field} style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: full ? "1 / -1" : undefined }}>
                  <label style={{ fontSize: 11, color: NL.muted, fontWeight: 600 }}>{label}</label>
                  <input type={type || "text"} value={editForm[field]}
                    onChange={e => setEditForm(f => ({ ...f, [field]: e.target.value }))}
                    style={{ width: "100%", background: NL.elevated, border: `1px solid ${NL.border}`, borderRadius: 8, padding: "8px 12px", color: NL.text, fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 11, color: NL.muted, fontWeight: 600 }}>CATEGORY</label>
                <select value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: "100%", background: NL.elevated, border: `1px solid ${NL.border}`, borderRadius: 8, padding: "8px 12px", color: editForm.category ? NL.text : NL.muted, fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box", cursor: "pointer" }}>
                  <option value="">No category</option>
                  {["realism","faithful","pvp","cartoon","dark","medieval","nature","themed","other"].map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 11, color: NL.muted, fontWeight: 600 }}>LONG DESCRIPTION (Markdown + images supported)</label>
                <textarea value={editForm.longDescription} onChange={e => setEditForm(f => ({ ...f, longDescription: e.target.value }))} rows={6} placeholder={"## About this pack\n\nA detailed description with **markdown** support.\n\n![Screenshot](https://...)"} style={{ width: "100%", background: NL.elevated, border: `1px solid ${NL.border}`, borderRadius: 8, padding: "8px 12px", color: NL.text, fontSize: 13, fontFamily: mono, outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: isMobile ? "1 / -1" : undefined }}>
                <label style={{ fontSize: 11, color: NL.muted, fontWeight: 600 }}>CREATOR WEBSITE</label>
                <input placeholder="https://creator.com" value={editForm.creatorWebsite} onChange={e => setEditForm(f => ({ ...f, creatorWebsite: e.target.value }))} style={{ width: "100%", background: NL.elevated, border: `1px solid ${NL.border}`, borderRadius: 8, padding: "8px 12px", color: NL.text, fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: isMobile ? "1 / -1" : undefined }}>
                <label style={{ fontSize: 11, color: NL.muted, fontWeight: 600 }}>DISCORD INVITE</label>
                <input placeholder="https://discord.gg/..." value={editForm.creatorDiscord} onChange={e => setEditForm(f => ({ ...f, creatorDiscord: e.target.value }))} style={{ width: "100%", background: NL.elevated, border: `1px solid ${NL.border}`, borderRadius: 8, padding: "8px 12px", color: NL.text, fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            {editError && <p style={{ color: NL.danger, fontSize: 12, margin: 0 }}>{editError}</p>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Btn variant="secondary" onClick={() => setEditingPack(null)}>Cancel</Btn>
              <Btn onClick={saveEdit} disabled={editSaving}>{editSaving ? <><Spinner size={12} /> Saving…</> : "Save changes"}</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PackSubmissionsPanel() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [expandedId, setExpandedId] = useState(null);
  const [acting, setActing] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});
  const [promoteOpts, setPromoteOpts] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await fetchIdToken();
      const qs = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await fetch(`${API_BASE}/api/featured-packs/admin/submissions${qs}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setSubmissions((await res.json()).submissions || []);
    } catch (_) {}
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function decide(id, status) {
    setActing(id + status);
    try {
      const token = await fetchIdToken();
      const opts = promoteOpts[id] ?? {};
      const body = {
        status,
        reviewNote: reviewNotes[id]?.trim() || undefined,
        ...(status === "approved" && opts.promote ? { promote: true, sortOrder: parseInt(opts.sortOrder ?? "0", 10) || 0 } : {}),
      };
      const res = await fetch(`${API_BASE}/api/featured-packs/admin/submissions/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
        if (data.featuredPack) alert(`✓ Added to featured packs as "${data.featuredPack.name}"`);
        setExpandedId(null);
      }
    } catch (_) {}
    setActing(null);
  }

  const STATUS_C = { pending: "warn", approved: "success", rejected: "danger" };

  return (
    <Card title="Pack submissions" subtitle={`${submissions.length} shown`} action={
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {iconBtn(load, "Refresh", <IC.Refresh />)}
        <div style={{ display: "flex", gap: 2, background: NL.subtle, borderRadius: 8, padding: 2, border: `1px solid ${NL.border}` }}>
          {["all", "pending", "approved", "rejected"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, borderRadius: 6, border: "none", cursor: "pointer", fontFamily: font, background: statusFilter === s ? NL.accent : "transparent", color: statusFilter === s ? "#0d1a18" : NL.secondary, transition: "background 0.15s, color 0.15s" }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>
    }>
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: NL.muted, fontSize: 13, padding: "24px 0", justifyContent: "center" }}><Spinner /> Loading…</div>
      ) : submissions.length === 0 ? (
        <p style={{ fontSize: 13, color: NL.muted, textAlign: "center", padding: "32px 0" }}>No submissions found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {submissions.map(s => {
            const isExpanded = expandedId === s.id;
            const note = reviewNotes[s.id] ?? "";
            const opts = promoteOpts[s.id] ?? { promote: false, sortOrder: "0" };
            return (
              <div key={s.id} style={{ border: `1px solid ${isExpanded ? NL.borderMid : NL.border}`, borderRadius: 12, background: NL.elevated, overflow: "hidden", transition: "border-color 0.15s" }}>
                {/* Row */}
                <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", flexWrap: "wrap" }}>
                  {s.thumbnail_url
                    ? <img src={s.thumbnail_url} alt={s.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", imageRendering: "pixelated", flexShrink: 0, background: NL.subtle }} />
                    : <div style={{ width: 44, height: 44, borderRadius: 8, background: NL.subtle, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📦</div>
                  }
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: NL.text }}>{s.name}</p>
                      {s.category && <Badge color="blue">{s.category}</Badge>}
                      <Badge color={STATUS_C[s.status] ?? "default"}>{s.status}</Badge>
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: NL.secondary }}>by <span style={{ fontFamily: mono, color: NL.text }}>{s.username}</span></p>
                    <p style={{ margin: "1px 0 0", fontSize: 11, color: NL.muted }}>{new Date(s.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                    {s.status === "pending" && (
                      <>
                        <Btn size="sm" variant="success" disabled={!!acting} onClick={() => decide(s.id, "approved")}>{acting === s.id + "approved" ? <Spinner size={10} /> : "Approve"}</Btn>
                        <Btn size="sm" variant="danger" disabled={!!acting} onClick={() => decide(s.id, "rejected")}>{acting === s.id + "rejected" ? <Spinner size={10} /> : "Reject"}</Btn>
                      </>
                    )}
                    {s.status !== "pending" && <Btn size="sm" variant="ghost" disabled={!!acting} onClick={() => decide(s.id, "pending")}>Reopen</Btn>}
                    <button onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: NL.muted, fontSize: 10, padding: "2px 4px", fontFamily: mono }}>{isExpanded ? "▲" : "▼"}</button>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${NL.border}`, background: "rgba(0,0,0,0.12)", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {s.description && (
                        <div style={{ gridColumn: "1/-1" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Description</span>
                          <p style={{ margin: "4px 0 0", fontSize: 12, color: NL.secondary, lineHeight: 1.5 }}>{s.description}</p>
                        </div>
                      )}
                      {s.tags?.length > 0 && (
                        <div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tags</span>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                            {s.tags.map(t => <span key={t} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: NL.accentDim, color: NL.accent, border: `1px solid ${NL.accentBorder}`, fontFamily: mono }}>#{t}</span>)}
                          </div>
                        </div>
                      )}
                      {(s.creator_website || s.creator_discord) && (
                        <div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Creator links</span>
                          <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                            {s.creator_website && <a href={s.creator_website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: NL.accent, textDecoration: "none" }}>🌐 Website ↗</a>}
                            {s.creator_discord && <a href={s.creator_discord} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#7289da", textDecoration: "none" }}>Discord ↗</a>}
                          </div>
                        </div>
                      )}
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>File</span>
                        <p style={{ margin: "4px 0 0", fontSize: 11, fontFamily: mono, color: NL.muted }}>{formatBytes(s.size_bytes)} · {s.sha256?.slice(0, 16)}…</p>
                        <a href={s.download_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: NL.accent, textDecoration: "none" }}>Download ↗</a>
                      </div>
                    </div>

                    {s.long_description && (
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Long description</span>
                        <div style={{ marginTop: 6, background: NL.surface, borderRadius: 8, padding: "10px 12px", fontSize: 12, color: NL.secondary, lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 180, overflowY: "auto", fontFamily: mono }}>
                          {s.long_description}
                        </div>
                      </div>
                    )}

                    {s.status === "pending" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4, borderTop: `1px solid ${NL.border}` }}>
                        <div>
                          <label style={{ fontSize: 10, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>Review note (visible to submitter)</label>
                          <input value={note} onChange={e => setReviewNotes(p => ({ ...p, [s.id]: e.target.value }))} placeholder="Optional reason or feedback…"
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${NL.borderMid}`, background: NL.surface, color: NL.text, fontSize: 12, fontFamily: font, outline: "none", boxSizing: "border-box" }} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, color: NL.secondary }}>
                            <input type="checkbox" checked={opts.promote} onChange={e => setPromoteOpts(p => ({ ...p, [s.id]: { ...opts, promote: e.target.checked } }))}
                              style={{ accentColor: NL.accent }} />
                            Also add to featured packs
                          </label>
                          {opts.promote && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <label style={{ fontSize: 11, color: NL.muted }}>Sort order:</label>
                              <input type="number" value={opts.sortOrder} onChange={e => setPromoteOpts(p => ({ ...p, [s.id]: { ...opts, sortOrder: e.target.value } }))}
                                style={{ width: 60, padding: "4px 8px", borderRadius: 6, border: `1px solid ${NL.border}`, background: NL.surface, color: NL.text, fontSize: 12, fontFamily: mono, outline: "none", textAlign: "center" }} />
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Btn variant="success" disabled={!!acting} onClick={() => decide(s.id, "approved")}>{acting === s.id + "approved" ? <><Spinner size={12} /> Approving…</> : opts.promote ? "✓ Approve & Feature" : "✓ Approve"}</Btn>
                          <Btn variant="danger" disabled={!!acting} onClick={() => decide(s.id, "rejected")}>{acting === s.id + "rejected" ? <><Spinner size={12} /> Rejecting…</> : "✕ Reject"}</Btn>
                        </div>
                      </div>
                    )}

                    {s.review_note && (
                      <div style={{ background: "rgba(0,0,0,0.12)", borderRadius: 8, padding: "10px 12px" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Review note</span>
                        <p style={{ margin: "4px 0 0", fontSize: 12, color: NL.secondary, lineHeight: 1.5 }}>{s.review_note}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function SkinsPanel() {
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [cleaning, setCleaning] = useState(false);
  const [cleanResult, setCleanResult] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [activeUsername, setActiveUsername] = useState("");

  async function load(username = "") {
    setLoading(true); setError(null);
    try {
      const token = await fetchIdToken();
      const qs = username ? `?username=${encodeURIComponent(username)}` : "";
      const res = await fetch(`${API_BASE}/api/admin/skins${qs}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      setSkins((await res.json()).skins || []);
      setSearched(true);
      setActiveUsername(username);
    } catch (e) { setError("Failed: " + e.message); }
    finally { setLoading(false); }
  }

  function handleSearch(e) {
    e.preventDefault();
    load(usernameInput.trim());
  }

  async function deleteSkin(skin) {
    if (!confirm(`Delete skin "${skin.name}" by ${skin.username || skin.uid}?`)) return;
    setDeleting(skin.id);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/skins/${skin.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      setSkins(p => p.filter(s => s.id !== skin.id));
    } catch (e) { alert("Failed: " + e.message); }
    finally { setDeleting(null); }
  }

  async function runCleanup() {
    if (!confirm("This will delete all blank/empty skins from R2 and DB, and backfill image hashes. Continue?")) return;
    setCleaning(true); setCleanResult(null);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/skins/cleanup-empty`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCleanResult(data);
    } catch (e) { setCleanResult({ error: e.message }); }
    finally { setCleaning(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card title="Skin tools" subtitle="Maintenance actions">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn variant="danger" onClick={runCleanup} disabled={cleaning}>
            {cleaning ? <><Spinner size={12} /> Running…</> : "🧹 Cleanup empty skins + backfill hashes"}
          </Btn>
          {cleanResult && (
            <div style={{ background: cleanResult.error ? NL.dangerDim : NL.successDim, border: `1px solid ${cleanResult.error ? NL.dangerBorder : "rgba(52,211,153,0.22)"}`, borderRadius: 8, padding: "10px 14px", fontSize: 12, fontFamily: mono, color: cleanResult.error ? NL.danger : NL.success }}>
              {cleanResult.error
                ? `Error: ${cleanResult.error}`
                : `✓ Deleted ${cleanResult.deleted} empty skins · Skipped ${cleanResult.skipped} valid skins${cleanResult.errors?.length ? ` · ${cleanResult.errors.length} errors` : ""}`}
            </div>
          )}
        </div>
      </Card>

      <Card title={searched ? `Skins${activeUsername ? `: ${activeUsername}` : " (recent 50)"} (${skins.length})` : "Search skins by user"}
        action={searched ? iconBtn(() => load(activeUsername), "Refresh", <IC.Refresh />) : null}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: searched ? 12 : 0 }}>
          <input
            placeholder="Username…"
            value={usernameInput}
            onChange={e => setUsernameInput(e.target.value)}
            style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1px solid ${NL.borderMid}`, background: NL.subtle, color: NL.text, fontSize: 13, fontFamily: font, outline: "none" }}
          />
          <Btn type="submit" disabled={loading}>
            {loading ? <Spinner size={12} /> : "Search"}
          </Btn>
          {usernameInput && <Btn variant="secondary" type="button" onClick={() => load("")}>Recent 50</Btn>}
        </form>
        {!searched ? null : loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: NL.muted, fontSize: 13, padding: "24px 0", justifyContent: "center" }}><Spinner /> Loading…</div>
        ) : error ? (
          <p style={{ fontSize: 12, color: NL.danger, textAlign: "center", padding: "16px 0" }}>{error}</p>
        ) : skins.length === 0 ? (
          <p style={{ fontSize: 13, color: NL.muted, textAlign: "center", padding: "32px 0" }}>No skins found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {skins.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: NL.elevated, border: `1px solid ${NL.border}` }}>
                <img src={s.public_url} alt={s.name} style={{ width: 32, height: 32, imageRendering: "pixelated", borderRadius: 4, flexShrink: 0, background: NL.subtle }} onError={e => e.currentTarget.style.opacity = "0.3"} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: NL.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name || "Unnamed"}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                    <a href={`/u?name=${s.username}`} style={{ fontSize: 11, color: NL.accent, textDecoration: "none", fontFamily: mono }}>{s.username || s.uid?.slice(0, 8)}</a>
                    <span style={{ fontSize: 10, color: NL.muted }}>{new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    {s.like_count > 0 && <span style={{ fontSize: 10, color: NL.muted }}>♥ {s.like_count}</span>}
                    {!s.is_public && <Badge color="default">private</Badge>}
                    {s.image_hash && <span style={{ fontSize: 9, fontFamily: mono, color: NL.muted }}>{s.image_hash.slice(0, 8)}</span>}
                  </div>
                </div>
                <a href={s.public_url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: NL.subtle, border: `1px solid ${NL.border}`, color: NL.secondary, textDecoration: "none", flexShrink: 0 }}>
                  View
                </a>
                <button onClick={() => deleteSkin(s)} disabled={deleting === s.id}
                  style={{ padding: "6px 8px", background: "none", border: "none", cursor: "pointer", color: NL.muted, borderRadius: 6, flexShrink: 0, opacity: deleting === s.id ? 0.4 : 1 }}
                  onMouseEnter={e => { e.currentTarget.style.color = NL.danger; e.currentTarget.style.background = NL.dangerDim; }}
                  onMouseLeave={e => { e.currentTarget.style.color = NL.muted; e.currentTarget.style.background = "transparent"; }}
                  title="Delete skin">
                  {deleting === s.id ? <Spinner size={12} /> : <IC.Trash />}
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

const CACHE_NODES = [
  { label: "EU", base: "https://eubackend.mccompanion.net" },
  { label: "US", base: "https://usbackend.mccompanion.net" },
];

const IPV4_RE = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const KNOWN_PREFIXES = ["tracker:live:", "auth:", "skins:", "home:", "user:", "leaderboard", "metrics:", "app:", "bots:", "comments:", "packs:", "stream_token:"];

const KEY_CATEGORIES = [
  { label: "All",        prefix: "",              match: null },
  { label: "Players",    prefix: "__ip__",         match: k => IPV4_RE.test(k) },
  { label: "Tracker",    prefix: "tracker:live:",  match: null },
  { label: "Auth",       prefix: "auth:",          match: null },
  { label: "Skins",      prefix: "skins:",         match: null },
  { label: "Home",       prefix: "home:",          match: null },
  { label: "User",       prefix: "user:",          match: null },
  { label: "Leaderboard",prefix: "leaderboard",    match: null },
  { label: "Metrics",    prefix: "metrics:",       match: null },
  { label: "App",        prefix: "app:",           match: null },
  { label: "Bots",       prefix: "bots:",          match: null },
  { label: "Comments",   prefix: "comments:",      match: null },
  { label: "Packs",      prefix: "packs:",         match: null },
  { label: "Tokens",     prefix: "stream_token:",  match: null },
  { label: "Other",      prefix: "__other__",      match: k => !IPV4_RE.test(k) && !KNOWN_PREFIXES.some(p => k.startsWith(p)) },
];

const EVENT_COLORS = {
  set:     { bg: NL.accentDim,   border: NL.accentBorder,  text: NL.accent,   label: "SET" },
  del:     { bg: NL.dangerDim,   border: NL.dangerBorder,  text: NL.danger,   label: "DEL" },
  clear:   { bg: NL.warnDim,     border: "rgba(251,191,36,0.22)", text: NL.warn, label: "CLEAR" },
};

function formatTTL(ttlSec) {
  if (ttlSec == null) return null;
  if (ttlSec >= 3600) return `${Math.round(ttlSec / 60)}m`;
  if (ttlSec >= 60) return `${Math.round(ttlSec / 60)}m ${ttlSec % 60}s`;
  return `${ttlSec}s`;
}

function JsonViewer({ value }) {
  const str = JSON.stringify(value, null, 2);
  return (
    <pre style={{ margin: 0, fontSize: 11, fontFamily: mono, color: NL.secondary, whiteSpace: "pre-wrap", wordBreak: "break-all", maxHeight: 320, overflowY: "auto", lineHeight: 1.7, padding: "10px 12px", background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
      {str}
    </pre>
  );
}

function fmtTime(ts) {
  if (!ts) return null;
  return new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function CacheNodePanel({ nodeBase, visible }) {
  const [entries, setEntries] = useState({});
  const [timestamps, setTimestamps] = useState({}); // key → client-side ms when last set/seen
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);
  const [selectedKey, setSelectedKey] = useState(null);
  const [activity, setActivity] = useState([]);
  const esRef = useRef(null);
  const PAGE_SIZE = 50;
  const MAX_ACTIVITY = 150;

  function addActivity(type, key, value) {
    setActivity(prev => [{ type, key, value, time: Date.now(), id: `${Date.now()}-${Math.random()}` }, ...prev].slice(0, MAX_ACTIVITY));
  }

  function parseEntries(data) {
    const all = data.entries ?? data;
    const now = Date.now();
    if (Array.isArray(all)) {
      const map = {}; const ts = {};
      for (const e of all) { map[e.key] = e; ts[e.key] = e.time ?? now; }
      return { map, ts };
    }
    if (all && typeof all === "object") {
      const map = {}; const ts = {};
      for (const [k, v] of Object.entries(all)) { map[k] = { key: k, value: v }; ts[k] = now; }
      return { map, ts };
    }
    return { map: {}, ts: {} };
  }

  function disconnect() {
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
    setRunning(false); setStatus("idle");
  }

  async function connect() {
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
    setStatus("connecting"); setError(null); setEntries({}); setTimestamps({}); setActivity([]); setPage(0);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${nodeBase}/cache/admin/cache/stream-token`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      const { streamToken } = await res.json();
      const es = new EventSource(`${nodeBase}/cache/admin/cache/stream?streamToken=${encodeURIComponent(streamToken)}`);
      esRef.current = es;
      setRunning(true); setStatus("connected");

      es.addEventListener("snapshot", e => {
        const data = JSON.parse(e.data);
        const { map, ts } = parseEntries(data);
        setEntries(map);
        setTimestamps(ts);
        setPage(0);
      });
      es.addEventListener("set", e => {
        const p = JSON.parse(e.data);
        const now = Date.now();
        setEntries(prev => ({ ...prev, [p.key]: p }));
        setTimestamps(prev => ({ ...prev, [p.key]: p.time ?? now }));
        addActivity("set", p.key, p.value);
      });
      es.addEventListener("del", e => {
        const p = JSON.parse(e.data);
        setEntries(prev => { const n = { ...prev }; delete n[p.key]; return n; });
        setTimestamps(prev => { const n = { ...prev }; delete n[p.key]; return n; });
        addActivity("del", p.key, p.value ?? null);
      });
      es.addEventListener("clear", () => {
        setEntries({});
        setTimestamps({});
        addActivity("clear", "(all)", null);
      });
      es.onerror = () => { setStatus("error"); setError("Stream disconnected"); setRunning(false); es.close(); esRef.current = null; };
    } catch (e) { setStatus("error"); setError(e.message); setRunning(false); }
  }

  useEffect(() => () => { if (esRef.current) { esRef.current.close(); esRef.current = null; } }, []);

  const allKeys = useMemo(() => Object.keys(entries).sort(), [entries]);
  const filteredKeys = useMemo(() => {
    let keys = allKeys;
    if (category) {
      const cat = KEY_CATEGORIES.find(c => c.prefix === category);
      if (cat?.match) keys = keys.filter(cat.match);
      else if (category) keys = keys.filter(k => k.startsWith(category));
    }
    if (search) {
      const q = search.toLowerCase();
      keys = keys.filter(k => {
        if (k.toLowerCase().includes(q)) return true;
        const v = entries[k]?.value;
        if (!v) return false;
        try { return JSON.stringify(v).toLowerCase().includes(q); } catch { return false; }
      });
    }
    return keys;
  }, [allKeys, category, search, entries]);

  const totalPages = Math.ceil(filteredKeys.length / PAGE_SIZE);
  const pageKeys = filteredKeys.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const statusColor = { connecting: NL.warn, connected: NL.success, error: NL.danger, idle: NL.muted }[status];

  function summarize(v) {
    if (v == null) return <span style={{ color: NL.muted, fontStyle: "italic" }}>null</span>;
    if (typeof v === "string") return <span style={{ color: NL.accent }}>"{v.length > 70 ? v.slice(0, 70) + "…" : v}"</span>;
    if (typeof v === "number" || typeof v === "boolean") return <span style={{ color: "#60a5fa" }}>{String(v)}</span>;
    if (Array.isArray(v)) return <span style={{ color: NL.secondary }}>[{v.length} item{v.length !== 1 ? "s" : ""}]</span>;
    if (typeof v === "object") { const ks = Object.keys(v); return <span style={{ color: NL.secondary }}>{"{" + ks.slice(0, 3).join(", ") + (ks.length > 3 ? ", …" : "") + "}"}</span>; }
    return <span style={{ color: NL.muted }}>{String(v)}</span>;
  }

  if (!visible) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "12px 16px", background: NL.surface, borderRadius: 12, border: `1px solid ${NL.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontFamily: mono, color: statusColor, fontWeight: 700 }}>{status}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {!running ? (
            <Btn onClick={connect} variant="primary" size="sm" disabled={status === "connecting"}>
              {status === "connecting" ? <><Spinner size={11} /> Connecting…</> : "▶ Connect"}
            </Btn>
          ) : (
            <Btn onClick={disconnect} variant="danger" size="sm">■ Disconnect</Btn>
          )}
          {running && <Btn onClick={connect} variant="secondary" size="sm"><IC.Refresh /> Reconnect</Btn>}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 16, fontSize: 11, fontFamily: mono, color: NL.muted }}>
          <span><span style={{ color: NL.text, fontWeight: 700 }}>{filteredKeys.length}</span> / {allKeys.length} keys</span>
          {running && <span style={{ color: NL.success }}>● live</span>}
        </div>
        {error && <p style={{ width: "100%", margin: 0, fontSize: 11, color: NL.danger }}>{error}</p>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 16px", background: NL.surface, borderRadius: 12, border: `1px solid ${NL.border}` }}>
        <input
          placeholder="Search key or value (playerName, server, gamertag…)"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); setSelectedKey(null); }}
          style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${NL.borderMid}`, background: NL.subtle, color: NL.text, fontSize: 12, fontFamily: mono, outline: "none", width: "100%", boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {KEY_CATEGORIES.map(cat => {
            const active = category === cat.prefix;
            const count = cat.prefix === "" ? allKeys.length
              : cat.match ? allKeys.filter(cat.match).length
              : allKeys.filter(k => k.startsWith(cat.prefix)).length;
            if (count === 0 && cat.prefix !== "") return null;
            return (
              <button key={cat.prefix} onClick={() => { setCategory(cat.prefix); setPage(0); setSelectedKey(null); }}
                style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, borderRadius: 20, border: `1px solid ${active ? NL.accentBorder : NL.border}`, background: active ? NL.accentDim : NL.elevated, color: active ? NL.accent : NL.secondary, cursor: "pointer", fontFamily: font, transition: "all 0.12s", display: "flex", alignItems: "center", gap: 5 }}>
                {cat.label}
                <span style={{ fontSize: 10, opacity: 0.7 }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {status === "idle" && (
        <div style={{ textAlign: "center", padding: "48px 0", color: NL.muted, fontSize: 13 }}>Press Connect to start the live stream.</div>
      )}

      {(status !== "idle") && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 12, alignItems: "start" }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {status === "connecting" && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: NL.muted, fontSize: 13, padding: "32px 0", justifyContent: "center" }}><Spinner /> Loading snapshot…</div>
            )}
            {status === "connected" && filteredKeys.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0", color: NL.muted, fontSize: 13 }}>
                {search || category ? "No keys match the current filter." : "Cache is empty."}
              </div>
            )}
            {pageKeys.map(key => {
              const entry = entries[key];
              const ttlSec = entry.expiresAt ? Math.max(0, Math.round((entry.expiresAt - Date.now()) / 1000)) : null;
              const isSelected = selectedKey === key;
              const isIp = IPV4_RE.test(key);
              const v = entry.value;
              const playerLabel = isIp && v ? [v.gamertag, v.xuid ? `xuid:${String(v.xuid).slice(0,8)}` : null].filter(Boolean).join(" · ") : null;
              const serverLabel = isIp && v ? [v.remoteServerIp, v.remoteServerPort ? `:${v.remoteServerPort}` : null].filter(Boolean).join("") : null;
              return (
                <div key={key} style={{ borderRadius: 10, background: NL.surface, border: `1px solid ${isSelected ? NL.accentBorder : NL.border}`, overflow: "hidden", transition: "border-color 0.12s" }}>
                  <div onClick={() => setSelectedKey(isSelected ? null : key)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", cursor: "pointer" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ fontSize: 12, fontFamily: mono, fontWeight: 700, color: isSelected ? NL.accent : NL.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{key}</div>
                        {isIp && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)", color: "#60a5fa", fontFamily: mono, flexShrink: 0 }}>player</span>}
                      </div>
                      <div style={{ fontSize: 11, fontFamily: mono, color: NL.secondary, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {playerLabel || summarize(entry.value)}
                        {serverLabel && <span style={{ color: NL.muted }}> → {serverLabel}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                      {timestamps[key] && (
                        <span style={{ fontSize: 10, fontFamily: mono, color: NL.muted }}>{fmtTime(timestamps[key])}</span>
                      )}
                      {ttlSec !== null && (
                        <span style={{ fontSize: 10, fontFamily: mono, color: ttlSec < 30 ? NL.danger : ttlSec < 120 ? NL.warn : NL.muted, background: NL.elevated, padding: "2px 6px", borderRadius: 4, border: `1px solid ${NL.border}` }}>
                          {formatTTL(ttlSec)}
                        </span>
                      )}
                    </div>
                    <span style={{ color: NL.muted, fontSize: 10, flexShrink: 0 }}>{isSelected ? "▲" : "▼"}</span>
                  </div>
                  {isSelected && (
                    <div style={{ borderTop: `1px solid ${NL.border}`, padding: "10px 12px", background: NL.bg }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: mono }}>Value</span>
                        <button onClick={() => navigator.clipboard?.writeText(JSON.stringify(entry.value, null, 2))}
                          style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, background: NL.elevated, border: `1px solid ${NL.border}`, color: NL.secondary, cursor: "pointer", fontFamily: font }}>
                          Copy JSON
                        </button>
                      </div>
                      <JsonViewer value={entry.value} />
                    </div>
                  )}
                </div>
              );
            })}

            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", paddingTop: 4 }}>
                <Btn variant="secondary" size="sm" disabled={page === 0} onClick={() => { setPage(p => p - 1); setSelectedKey(null); }}>‹ Prev</Btn>
                <span style={{ fontSize: 11, color: NL.secondary, fontFamily: mono }}>{page + 1} / {totalPages}</span>
                <Btn variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); setSelectedKey(null); }}>Next ›</Btn>
              </div>
            )}
          </div>

          {/* Live activity feed */}
          <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 12, overflow: "hidden", position: "sticky", top: 80 }}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${NL.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: NL.text }}>Live activity</span>
              <div style={{ display: "flex", gap: 6 }}>
                {activity.length > 0 && (
                  <button onClick={() => setActivity([])} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, background: NL.elevated, border: `1px solid ${NL.border}`, color: NL.muted, cursor: "pointer", fontFamily: font }}>Clear</button>
                )}
                <span style={{ fontSize: 10, fontFamily: mono, color: NL.muted }}>{activity.length}</span>
              </div>
            </div>
            <div style={{ maxHeight: 520, overflowY: "auto", padding: "6px 8px", display: "flex", flexDirection: "column", gap: 3 }}>
              {activity.length === 0 && (
                <p style={{ fontSize: 11, color: NL.muted, textAlign: "center", padding: "20px 0", margin: 0 }}>
                  {running ? "Waiting for events…" : "Not connected."}
                </p>
              )}
              {activity.map(ev => {
                const c = EVENT_COLORS[ev.type] || EVENT_COLORS.set;
                return (
                  <div key={ev.id} onClick={() => setSelectedKey(ev.key !== "(all)" ? ev.key : null)}
                    style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "5px 7px", borderRadius: 7, background: c.bg, border: `1px solid ${c.border}`, cursor: ev.key !== "(all)" ? "pointer" : "default" }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: c.text, fontFamily: mono, flexShrink: 0, marginTop: 1, padding: "1px 5px", borderRadius: 3, background: `${c.border}` }}>{c.label}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontFamily: mono, color: NL.text, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.key}</div>
                      {ev.value != null && (
                        <div style={{ fontSize: 10, fontFamily: mono, color: NL.secondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{summarize(ev.value)}</div>
                      )}
                    </div>
                    <span style={{ fontSize: 9, color: NL.muted, flexShrink: 0, fontFamily: mono, marginTop: 1 }}>
                      {new Date(ev.time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CachePanel() {
  const [activeNode, setActiveNode] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 3, background: NL.subtle, borderRadius: 10, padding: 3, border: `1px solid ${NL.border}`, width: "fit-content" }}>
        {CACHE_NODES.map((n, i) => (
          <button key={n.label} onClick={() => setActiveNode(i)}
            style={{ padding: "6px 20px", fontSize: 13, fontWeight: 700, borderRadius: 8, border: "none", cursor: "pointer", fontFamily: font, background: activeNode === i ? NL.accent : "transparent", color: activeNode === i ? "#0d1a18" : NL.secondary, transition: "background 0.15s, color 0.15s" }}>
            {n.label}
            <span style={{ fontSize: 10, marginLeft: 6, opacity: 0.7, fontFamily: mono }}>{n.base.replace("https://", "").replace(".mccompanion.net", "")}</span>
          </button>
        ))}
      </div>

      {CACHE_NODES.map((n, i) => (
        <CacheNodePanel key={n.label} nodeBase={n.base} visible={activeNode === i} />
      ))}
    </div>
  );
}

function MessagesPanel({ isMobile }) {
  const [inbox, setInbox] = useState("support");
  const [supportUid, setSupportUid] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [convsLoading, setConvsLoading] = useState(true);
  const [activeUsername, setActiveUsername] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [newUser, setNewUser] = useState("");
  const threadRef = useRef(null);

  const loadConversations = useCallback(async () => {
    setConvsLoading(true);
    try {
      const token = await fetchIdToken();
      const path = inbox === "support" ? "/api/admin/support/conversations" : "/api/messages/conversations";
      const res = await fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setConversations((await res.json()).conversations || []);
    } catch (_) { }
    finally { setConvsLoading(false); }
  }, [inbox]);

  async function loadConversation(u) {
    setActiveUsername(u);
    setLoadingHistory(true);
    setResult(null);
    try {
      const token = await fetchIdToken();
      const path = inbox === "support"
        ? `/api/admin/support/messages/${encodeURIComponent(u)}`
        : `/api/messages/${encodeURIComponent(u)}`;
      const res = await fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        setHistory(data.messages || []);
        if (data.supportUid) setSupportUid(data.supportUid);
      } else setHistory([]);
    } catch { setHistory([]); }
    setLoadingHistory(false);
  }

  useEffect(() => { loadConversations(); setActiveUsername(null); setHistory([]); }, [loadConversations]);

  useEffect(() => {
    try {
      const u = new URLSearchParams(window.location.search).get("user");
      if (u) loadConversation(u);
    } catch (_) { }
  }, []);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [history]);

  async function send() {
    const u = activeUsername;
    const m = message.trim();
    if (!u || !m || sending) return;
    setSending(true);
    setResult(null);
    try {
      const token = await fetchIdToken();
      const sendPath = inbox === "support"
        ? `/api/admin/support/messages/${encodeURIComponent(u)}`
        : `/api/messages/${encodeURIComponent(u)}`;
      const res = await fetch(`${API_BASE}${sendPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: m }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("");
        await loadConversation(u);
        loadConversations();
      } else {
        setResult({ ok: false, text: data.error || "Failed to send" });
      }
    } catch {
      setResult({ ok: false, text: "Network error" });
    } finally {
      setSending(false);
    }
  }

  function startNew() {
    const u = newUser.trim().replace(/^@/, "");
    if (!u) return;
    setNewUser("");
    loadConversation(u);
  }

  const myUid = inbox === "support" ? supportUid : auth.currentUser?.uid;

  const convList = (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1, minHeight: 0 }}>
      <div style={{ display: "flex", gap: 4, padding: "10px 10px 0" }}>
        {[["support", "🛟 Support"], ["me", "👤 My DMs"]].map(([id, label]) => (
          <button key={id} onClick={() => setInbox(id)}
            style={{ flex: 1, padding: "7px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: font, cursor: "pointer", border: `1px solid ${inbox === id ? NL.accentBorder : NL.border}`, background: inbox === id ? NL.accentDim : "transparent", color: inbox === id ? NL.accent : NL.muted, whiteSpace: "nowrap" }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, padding: "10px 10px 8px" }}>
        <input
          value={newUser}
          onChange={e => setNewUser(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") startNew(); }}
          placeholder="New DM: username…"
          style={{ flex: 1, minWidth: 0, background: NL.elevated, border: `1px solid ${NL.border}`, borderRadius: 8, padding: "8px 10px", color: NL.text, fontFamily: mono, fontSize: 12, outline: "none" }}
        />
        <button onClick={startNew} title="Open conversation"
          style={{ padding: "0 12px", borderRadius: 8, border: `1px solid ${NL.accentBorder}`, background: NL.accentDim, color: NL.accent, fontSize: 14, cursor: "pointer", flexShrink: 0 }}>→</button>
      </div>
      <div style={{ overflowY: "auto", flex: 1 }}>
        {convsLoading ? (
          <div style={{ textAlign: "center", padding: 24, color: NL.muted }}><Spinner /></div>
        ) : conversations.length === 0 ? (
          <p style={{ color: NL.muted, fontSize: 12, textAlign: "center", padding: 24 }}>No conversations yet</p>
        ) : conversations.map(c => {
          const isActive = c.username === activeUsername;
          return (
            <button key={c.otherUid} onClick={() => loadConversation(c.username)}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                padding: "10px 12px", border: "none", borderLeft: `2px solid ${isActive ? NL.accent : "transparent"}`,
                background: isActive ? NL.elevated : "transparent", cursor: "pointer", fontFamily: font,
              }}>
              {c.avatarUrl
                ? <img src={c.avatarUrl} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                : <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: NL.accentDim, border: `1px solid ${NL.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: NL.accent }}>{(c.username || "?")[0].toUpperCase()}</div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: NL.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.displayName || c.username}</span>
                  {c.unreadCount > 0 && <CountPill count={c.unreadCount} />}
                </div>
                <p style={{ margin: 0, fontSize: 11, color: NL.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.lastMessageIsMine ? "You: " : ""}{c.lastMessage}
                </p>
              </div>
              <span style={{ fontSize: 10, color: NL.muted, flexShrink: 0 }}>
                {new Date(c.lastMessageAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const thread = (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1, minHeight: 0 }}>
      {!activeUsername ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, color: NL.muted }}>
          <span style={{ fontSize: 28 }}>✉️</span>
          <p style={{ fontSize: 13, margin: 0 }}>Select a conversation or start a new DM</p>
        </div>
      ) : (
        <>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${NL.border}`, display: "flex", alignItems: "center", gap: 10 }}>
            {isMobile && (
              <button onClick={() => setActiveUsername(null)} style={{ background: "none", border: "none", color: NL.secondary, cursor: "pointer", fontSize: 16, padding: 0 }}>←</button>
            )}
            <span style={{ fontSize: 13, fontWeight: 700, color: NL.text }}>@{activeUsername}</span>
            <div style={{ flex: 1 }} />
            {iconBtn(() => loadConversation(activeUsername), "Refresh", <IC.Refresh />)}
            <a href={`/u?name=${encodeURIComponent(activeUsername)}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: NL.secondary, textDecoration: "none", padding: "3px 8px", borderRadius: 6, border: `1px solid ${NL.border}` }}>Profile ↗</a>
          </div>
          <div ref={threadRef} style={{ flex: 1, minHeight: 0, padding: 14, display: "flex", flexDirection: "column", gap: 6, overflowY: "auto" }}>
            {loadingHistory ? (
              <div style={{ textAlign: "center", padding: 24, color: NL.muted }}><Spinner /></div>
            ) : history.length === 0 ? (
              <p style={{ color: NL.muted, fontSize: 12, textAlign: "center", padding: 24 }}>No messages yet. Say hi 👋</p>
            ) : history.map(msg => {
              const isMine = !!myUid && msg.senderUid === myUid;
              const dt = new Date(msg.createdAt);
              return (
                <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                  {isMine && msg.sentByUsername && (
                    <span style={{ fontSize: 9, color: NL.muted, marginBottom: 1 }}>{msg.sentByUsername}</span>
                  )}
                  <div style={{
                    maxWidth: "75%", padding: "8px 12px", borderRadius: 12,
                    background: isMine ? NL.accent : NL.elevated,
                    color: isMine ? "#0d1500" : NL.text,
                    fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word",
                    borderBottomRightRadius: isMine ? 4 : 12,
                    borderBottomLeftRadius: isMine ? 12 : 4,
                  }}>
                    {msg.content}
                  </div>
                  <span style={{ fontSize: 10, color: NL.muted, marginTop: 2 }}>
                    {dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} {dt.getHours().toString().padStart(2, "0")}:{dt.getMinutes().toString().padStart(2, "0")}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ padding: "10px 12px", borderTop: `1px solid ${NL.border}`, display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") send(); }}
              placeholder={`Message @${activeUsername}… (Cmd+Enter)`}
              rows={2}
              style={{ flex: 1, background: NL.elevated, border: `1px solid ${NL.border}`, borderRadius: 10, padding: "9px 12px", color: NL.text, fontFamily: font, fontSize: 13, resize: "none", outline: "none", lineHeight: 1.5 }}
            />
            <Btn onClick={send} disabled={sending || !message.trim()}>
              {sending ? <Spinner size={13} /> : "Send"}
            </Btn>
          </div>
          {result && !result.ok && (
            <p style={{ margin: "0 12px 10px", fontSize: 12, color: NL.danger }}>{result.text}</p>
          )}
        </>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", height: "calc(100dvh - 240px)", minHeight: 360, minWidth: 0 }}>
        {activeUsername ? thread : convList}
      </div>
    );
  }

  return (
    <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 14, overflow: "hidden", display: "grid", gridTemplateColumns: "280px 1fr", height: "72vh" }}>
      <div style={{ borderRight: `1px solid ${NL.border}`, display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0 }}>{convList}</div>
      {thread}
    </div>
  );
}

const NAV_GROUPS = [
  {
    label: null,
    items: [{ id: "overview", label: "Overview", icon: "📊" }],
  },
  {
    label: "Content",
    items: [
      { id: "submissions", label: "Submissions", icon: "📥", badge: "pendingSubmissions" },
      { id: "featured-packs", label: "Featured Packs", icon: "📦" },
      { id: "skins", label: "Skins", icon: "🎨" },
    ],
  },
  {
    label: "Community",
    items: [
      { id: "moderation", label: "Moderation", icon: "🛡", badge: "openReports" },
      { id: "feedback", label: "Feedback", icon: "💬" },
      { id: "messages", label: "Messages", icon: "✉️", badge: "supportUnread" },
    ],
  },
  {
    label: "Partners",
    items: [{ id: "partners", label: "Partners", icon: "🤝" }],
  },
  {
    label: "System",
    items: [
      { id: "events", label: "Live Events", icon: "📡" },
      { id: "cache", label: "Cache", icon: "🗄" },
    ],
  },
];
const ALL_NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items);

function CountPill({ count }) {
  if (!count) return null;
  return (
    <span style={{ minWidth: 18, height: 18, borderRadius: 9, padding: "0 5px", background: NL.accent, color: "#000", fontSize: 10, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: mono, flexShrink: 0 }}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

function AdminSidebar({ active, onChange, badges }) {
  return (
    <nav style={{ width: 210, flexShrink: 0, position: "sticky", top: 80, alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: 4 }}>
      {NAV_GROUPS.map((group, gi) => (
        <div key={gi} style={{ display: "flex", flexDirection: "column", gap: 1, marginBottom: 8 }}>
          {group.label && (
            <p style={{ fontSize: 10, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px", padding: "0 10px" }}>{group.label}</p>
          )}
          {group.items.map(item => {
            const isActive = active === item.id;
            const count = item.badge ? badges?.[item.badge] : 0;
            return (
              <button key={item.id} onClick={() => onChange(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 9,
                  border: isActive ? `1px solid ${NL.accentBorder}` : "1px solid transparent",
                  background: isActive ? NL.accentDim : "transparent",
                  color: isActive ? NL.accent : NL.secondary,
                  fontSize: 13, fontWeight: isActive ? 700 : 500, fontFamily: font, cursor: "pointer",
                  textAlign: "left", transition: "background 0.12s, color 0.12s", width: "100%",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = NL.elevated; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ fontSize: 14, width: 18, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                <CountPill count={count} />
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export default function AdminPage() {
  const history = useHistory();
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTabRaw] = useState(() => {
    if (typeof window === "undefined") return "overview";
    const t = new URLSearchParams(window.location.search).get("tab");
    return ALL_NAV_ITEMS.some(i => i.id === t) ? t : "overview";
  });
  const [isMobile, setIsMobile] = useState(false);
  const [badges, setBadges] = useState({});

  const setActiveTab = useCallback((tab) => {
    setActiveTabRaw(tab);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState(null, "", url.toString());
    } catch (_) { }
  }, []);

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 900); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const loadBadges = useCallback(async () => {
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/badges`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setBadges(await res.json());
    } catch (_) { }
  }, []);

  useEffect(() => {
    if (!auth) { setChecking(false); history.replace("/login"); return; }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setChecking(false); history.replace("/login"); return; }
      try {
        const token = await u.getIdToken();
        const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { history.replace("/login"); return; }
        const { roles } = await res.json();
        if (!roles?.includes("admin")) { history.replace("/"); return; }
      } catch (_) { history.replace("/login"); return; }
      setChecking(false);
      loadBadges();
    });
    return () => unsub();
  }, []);

  useEffect(() => { if (!checking) loadBadges(); }, [activeTab]);

  if (checking) return (
    <Layout>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: NL.bg }}>
        <Spinner size={24} />
      </div>
    </Layout>
  );

  const activeItem = ALL_NAV_ITEMS.find(i => i.id === activeTab);

  const content = (
    <>
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <RelayStatsCard />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
            <NotificationCard />
            <QuickActionsCard />
          </div>
          <PartnersOverviewCard isMobile={isMobile} />
        </div>
      )}
      {activeTab === "partners" && <PartnersManagementPanel />}
      {activeTab === "featured-packs" && <FeaturedPacksPanel />}
      {activeTab === "submissions" && <PackSubmissionsPanel />}
      {activeTab === "moderation" && <ModerationPanel isMobile={isMobile} />}
      {activeTab === "feedback" && <FeedbackPanel />}
      {activeTab === "skins" && <SkinsPanel />}
      {activeTab === "cache" && <CachePanel />}
      {activeTab === "events" && <LiveEventsPanel isMobile={isMobile} />}
      {activeTab === "messages" && <MessagesPanel isMobile={isMobile} />}
    </>
  );

  if (isMobile) {
    return (
      <Layout>
        <style>{`.admin-chipnav::-webkit-scrollbar { display: none; }`}</style>
        <div style={{ minHeight: "100vh", background: NL.bg, fontFamily: font }}>
          <header style={{ position: "sticky", top: 0, zIndex: 20, borderBottom: `1px solid ${NL.border}`, background: NL.bg }}>
            <div style={{ padding: "14px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: NL.text, margin: 0, letterSpacing: "-0.02em" }}>
                {activeItem?.icon} {activeItem?.label ?? "Admin"}
              </h1>
              <a href="/account" style={{ fontSize: 11, color: NL.secondary, textDecoration: "none", padding: "5px 10px", borderRadius: 7, border: `1px solid ${NL.border}`, background: NL.surface, flexShrink: 0 }}>
                Account →
              </a>
            </div>
            <div className="admin-chipnav" style={{ display: "flex", gap: 6, overflowX: "auto", padding: "12px 16px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
              {ALL_NAV_ITEMS.map(item => {
                const isActive = activeTab === item.id;
                const count = item.badge ? badges?.[item.badge] : 0;
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)}
                    ref={el => { if (el && isActive) el.scrollIntoView({ block: "nearest", inline: "nearest" }); }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 999,
                      border: `1px solid ${isActive ? NL.accentBorder : NL.border}`,
                      background: isActive ? NL.accentDim : NL.surface,
                      color: isActive ? NL.accent : NL.secondary,
                      fontSize: 12, fontWeight: isActive ? 700 : 500, fontFamily: font,
                      cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                    }}>
                    <span style={{ fontSize: 13 }}>{item.icon}</span>
                    {item.label}
                    {count > 0 && (
                      <span style={{ minWidth: 16, height: 16, borderRadius: 8, padding: "0 4px", background: NL.accent, color: "#000", fontSize: 9, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: mono }}>
                        {count > 99 ? "99+" : count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </header>
          <div style={{ padding: "16px 16px 60px" }}>{content}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ minHeight: "100vh", background: NL.bg, fontFamily: font }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 60px", display: "flex", gap: 28, alignItems: "flex-start" }}>
          <AdminSidebar active={activeTab} onChange={setActiveTab} badges={badges} />
          <main style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: NL.text, margin: 0, letterSpacing: "-0.02em" }}>
                {activeItem?.icon} {activeItem?.label ?? "Admin"}
              </h1>
              <a href="/account" style={{ fontSize: 12, color: NL.secondary, textDecoration: "none", padding: "6px 12px", borderRadius: 8, border: `1px solid ${NL.border}`, background: NL.surface }}>
                My account →
              </a>
            </div>
            {content}
          </main>
        </div>
      </div>
    </Layout>
  );
}
