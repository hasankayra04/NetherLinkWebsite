import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useHistory } from "@docusaurus/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseClient";
import { fetchIdToken } from "../firebaseAuthHelpers";
import Layout from "@theme/Layout";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const NL = {
  bg: "#111318", surface: "#191c23", elevated: "#1f232c", subtle: "#252931",
  border: "rgba(255,255,255,0.07)", borderMid: "rgba(255,255,255,0.12)",
  text: "#e8e9ec", secondary: "#9299a6", muted: "#5a6070",
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

function TabBar({ active, onChange, tabs }) {
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

function FeedbackItem({ c, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [ghIssue, setGhIssue] = useState(null);
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

  async function loadReplies() {
    setRepliesLoading(true);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/feedback-contacts/${c.issue_number}/replies`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setReplies((await res.json()).replies || []);
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
      const res = await fetch(`${API_BASE}/api/admin/feedback-contacts/${c.issue_number}/reply`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ message: reply.trim(), issueTitle: ghIssue?.title }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `${res.status}`);
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
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: NL.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ghIssue?.title || `Issue #${c.issue_number}`}</span>
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
            <span style={{ fontFamily: mono, fontSize: 12, color: NL.text, background: NL.subtle, padding: "4px 10px", borderRadius: 6, border: `1px solid ${NL.borderMid}` }}>✉ {c.email}</span>
            <a href={`https://github.com/MCCORG/MCCompanion/issues/${c.issue_number}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: NL.accent, textDecoration: "none", padding: "4px 10px", borderRadius: 6, border: `1px solid ${NL.accentBorder}`, background: NL.accentDim }}>GitHub ↗</a>
            <div style={{ flex: 1 }} />
            <button onClick={handleDelete} disabled={deleting} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: `1px solid ${NL.dangerBorder}`, background: NL.dangerDim, color: NL.danger, cursor: "pointer", fontFamily: font, opacity: deleting ? 0.5 : 1 }}>{deleting ? "…" : "Remove contact"}</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: NL.secondary, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: mono }}>Conversation</label>
            {repliesLoading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: NL.muted, fontSize: 12 }}><Spinner size={11} /> Loading…</div>
            ) : replies.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12, color: NL.muted }}>No messages yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {replies.map(r => <FeedbackBubble key={r.id} r={r} email={c.email} />)}
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
                {sending ? <><Spinner size={12} /> Sending…</> : "Send ✉"}
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const token = await fetchIdToken();
      fetch(`${API_BASE}/api/admin/feedback-contacts/sync-inbox`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
      const res = await fetch(`${API_BASE}/api/admin/feedback-contacts`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      setContacts((await res.json()).contacts || []);
    } catch (e) { setError("Failed: " + e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card title="Feedback" subtitle={`${contacts.length} issue${contacts.length !== 1 ? "s" : ""} with contact info`} action={iconBtn(load, "Refresh", <IC.Refresh />)}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: NL.muted, fontSize: 13, padding: "24px 0", justifyContent: "center" }}><Spinner /> Loading…</div>
        ) : error ? (
          <p style={{ fontSize: 12, color: NL.danger, padding: "16px 0", textAlign: "center" }}>{error}</p>
        ) : contacts.length === 0 ? (
          <p style={{ fontSize: 13, color: NL.muted, textAlign: "center", padding: "32px 0" }}>No feedback with contact info yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {contacts.map(c => <FeedbackItem key={c.issue_number} c={c} onDelete={n => setContacts(p => p.filter(x => x.issue_number !== n))} />)}
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
              <option value="">— Select category —</option>
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
                    <option value="">— None —</option>
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
                  <option value="">— No category —</option>
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

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "partners", label: "Partners" },
  { id: "featured-packs", label: "Packs" },
  { id: "moderation", label: "Mod" },
  { id: "feedback", label: "Feedback" },
];

export default function AdminPage() {
  const history = useHistory();
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
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
    });
    return () => unsub();
  }, []);

  if (checking) return (
    <Layout>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: NL.bg }}>
        <Spinner size={24} />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div style={{ minHeight: "100vh", background: NL.bg, fontFamily: font }}>
        <header style={{ borderBottom: `1px solid ${NL.border}`, background: NL.surface }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "16px 16px 0" : "20px 24px 0", display: "flex", flexDirection: "column", gap: 12 }}>
            <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: NL.text, margin: 0 }}>Admin</h1>
            <TabBar active={activeTab} onChange={setActiveTab} tabs={TABS} mobile={isMobile} />
          </div>
        </header>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "20px 16px" : "24px 24px", paddingBottom: 60 }}>
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <RelayStatsCard />
              <PartnersOverviewCard isMobile={isMobile} />
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                <NotificationCard />
                <QuickActionsCard />
              </div>
            </div>
          )}
          {activeTab === "partners" && <PartnersManagementPanel />}
          {activeTab === "featured-packs" && <FeaturedPacksPanel />}
          {activeTab === "moderation" && <ModerationPanel isMobile={isMobile} />}
          {activeTab === "feedback" && <FeedbackPanel />}
        </div>
      </div>
    </Layout>
  );
}
