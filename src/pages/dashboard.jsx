import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useHistory } from "@docusaurus/router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebaseClient";
import { fetchIdToken } from "../firebaseAuthHelpers";
import Layout from "@theme/Layout";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

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
  danger: "#f87171",
  dangerDim: "rgba(248,113,113,0.10)",
  dangerBorder: "rgba(248,113,113,0.22)",
  success: "#34d399",
  successDim: "rgba(52,211,153,0.10)",
  warn: "#fbbf24",
  warnDim: "rgba(251,191,36,0.10)",
};
const font = "'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'Fira Code', monospace";

const API_BASE = "https://api.mccompanion.net";
const REGION_BASES = {
  EU: API_BASE,
  US: API_BASE,
};
const REGION_PARAMS = { EU: "eu", US: "us" };
const EVENTS_CAP = 1500;
const TABS = [{ id: "overview", label: "Overview" }, { id: "partners", label: "Partners" }, { id: "moderation", label: "Moderation" }];
const REPORT_STATUSES = ['pending', 'reviewed', 'dismissed', 'actioned'];

async function dbFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function Spinner({ size = 16, color = NL.secondary }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke={color} strokeWidth="3" />
      <path className="opacity-75" fill={color} d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 100 24v-4l-3 3 3 3v4a12 12 0 01-12-12z" />
    </svg>
  );
}

function Badge({ children, color = "default" }) {
  const styles = {
    default: { color: NL.secondary, background: NL.subtle, border: `1px solid ${NL.border}` },
    accent: { color: NL.accent, background: NL.accentDim, border: `1px solid ${NL.accentBorder}` },
    success: { color: NL.success, background: NL.successDim, border: "1px solid rgba(52,211,153,0.22)" },
    danger: { color: NL.danger, background: NL.dangerDim, border: `1px solid ${NL.dangerBorder}` },
    warn: { color: NL.warn, background: NL.warnDim, border: "1px solid rgba(251,191,36,0.22)" },
    blue: { color: "#60a5fa", background: "rgba(96,165,250,0.10)", border: "1px solid rgba(96,165,250,0.22)" },
  };
  const s = styles[color] || styles.default;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, fontFamily: mono, letterSpacing: "0.04em", ...s }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", disabled, title, type = "button", style: extra }) {
  const base = { display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", fontFamily: font, border: "none", transition: "opacity 0.15s", opacity: disabled ? 0.4 : 1 };
  const sizes = { sm: { padding: "6px 10px", fontSize: 12 }, md: { padding: "8px 14px", fontSize: 13 } };
  const variants = {
    primary: { background: NL.accent, color: "#0d1a18" },
    secondary: { background: NL.elevated, color: NL.secondary, border: `1px solid ${NL.borderMid}` },
    danger: { background: NL.dangerDim, color: NL.danger, border: `1px solid ${NL.dangerBorder}` },
    ghost: { background: "transparent", color: NL.secondary, border: `1px solid ${NL.border}` },
    success: { background: NL.successDim, color: NL.success, border: "1px solid rgba(52,211,153,0.22)" },
  };
  return (
    <button type={type} title={title} onClick={onClick} disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...extra }}>
      {children}
    </button>
  );
}

function Card({ title, subtitle, children, style: extra, action }) {
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

function StatusDot({ status }) {
  const cfg = { open: { color: NL.success, glow: "rgba(52,211,153,0.35)" }, connecting: { color: NL.warn, glow: "rgba(251,191,36,0.35)", pulse: true }, error: { color: NL.danger }, closed: { color: NL.muted } }[status] || { color: NL.muted };
  return <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: cfg.color, boxShadow: cfg.glow ? `0 0 0 2px ${cfg.glow}` : "none", flexShrink: 0 }} className={cfg.pulse ? "animate-pulse" : ""} />;
}

function TabBar({ active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 2, background: NL.subtle, borderRadius: 10, padding: 3, border: `1px solid ${NL.border}` }}>
      {TABS.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{ padding: "6px 16px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", fontFamily: font, background: active === t.id ? NL.accent : "transparent", color: active === t.id ? "#0d1a18" : NL.secondary, transition: "background 0.15s, color 0.15s" }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

const IC = {
  Copy: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 9H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><rect x="9" y="3" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Refresh: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M1 4v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M3.51 15a9 9 0 1 0 .49-4.95" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  SignOut: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Ban: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  Trash: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Plus: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  Users: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Eye: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /></svg>,
  EyeOff: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
};

const iconBtn = (onClick, title, children, hoverColor = NL.text) => (
  <button onClick={onClick} title={title} style={{ background: "none", border: "none", cursor: "pointer", color: NL.muted, padding: 5, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.15s, background 0.15s" }}
    onMouseEnter={e => { e.currentTarget.style.color = hoverColor; e.currentTarget.style.background = NL.elevated; }}
    onMouseLeave={e => { e.currentTarget.style.color = NL.muted; e.currentTarget.style.background = "transparent"; }}
  >{children}</button>
);

const EVENT_META = {
  set: { borderColor: "rgba(52,211,153,0.4)", dotColor: NL.success, badge: "success", label: "SET" },
  del: { borderColor: "rgba(248,113,113,0.4)", dotColor: NL.danger, badge: "danger", label: "DEL" },
  clear: { borderColor: "rgba(251,191,36,0.4)", dotColor: NL.warn, badge: "warn", label: "CLEAR" },
  snapshot: { borderColor: "rgba(96,165,250,0.4)", dotColor: "#60a5fa", badge: "blue", label: "SNAP" },
};

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
          {ev.type === "set" && publicIp && !isBanned && iconBtn(() => onBan(publicIp), "Ban IP", <IC.Ban />, NL.danger)}
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
      const res = await fetch(`${API_BASE}/api/admin/members/${encodeURIComponent(uid)}/slots`, {
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
      <input type="number" min="0" max="100" value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
        autoFocus
        style={{ width: 52, padding: "5px 8px", borderRadius: 7, textAlign: "center", border: `1px solid ${NL.accentBorder}`, background: NL.subtle, color: NL.text, fontSize: 12, fontFamily: mono, outline: "none" }} />
      <button onClick={save} disabled={saving} style={{ padding: "5px 8px", borderRadius: 7, border: "none", background: NL.successDim, color: NL.success, fontSize: 12, cursor: "pointer" }}>{saving ? "…" : "✓"}</button>
      <button onClick={() => setEditing(false)} style={{ padding: "5px 8px", borderRadius: 7, border: `1px solid ${NL.border}`, background: NL.elevated, color: NL.secondary, fontSize: 12, cursor: "pointer" }}>✕</button>
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder, style: extra }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        minLength={6}
        style={{ ...extra, paddingRight: 34 }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: NL.muted, display: "flex", alignItems: "center", padding: 2 }}
        title={show ? "Hide password" : "Show password"}
      >
        {show ? <IC.EyeOff /> : <IC.Eye />}
      </button>
    </div>
  );
}

function PartnersPanel() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", serverSlots: 1 });
  const [formError, setFormError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createdInfo, setCreatedInfo] = useState(null);
  const [expandedUid, setExpandedUid] = useState(null);
  const [memberServers, setMemberServers] = useState({});
  const [loadingServers, setLoadingServers] = useState({});

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/members`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      setMembers((await res.json()).members || []);
    } catch (e) { setError("Failed: " + e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setForm({ email: "", password: "", serverSlots: 1 });
    setFormError(null);
    setCreatedInfo(null);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFormError(null);
    setCreatedInfo(null);
    setCreating(true);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/members/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          serverSlots: Number(form.serverSlots) || 1,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || `${res.status}`);

      setCreatedInfo({ email: json.firebase.email, uid: json.firebase.uid });
      setForm({ email: "", password: "", serverSlots: 1 });
      await load();
    } catch (e) { setFormError(e.message); }
    finally { setCreating(false); }
  }

  async function handleDelete(uid, email) {
    if (!confirm(`Remove partner ${email}? This also deletes all their servers.`)) return;
    setDeleting(uid);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/members/${encodeURIComponent(uid)}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setMembers(p => p.filter(m => m.firebase_uid !== uid));
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
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ featured: newVal }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setMemberServers(p => ({
        ...p,
        [server.ownerUid]: (p[server.ownerUid] || []).map(s => s.id === server.id ? { ...s, featured: newVal } : s),
      }));
    } catch (e) { alert("Failed: " + e.message); }
  }

  function toggleExpand(uid) {
    if (expandedUid === uid) { setExpandedUid(null); return; }
    setExpandedUid(uid);
    loadServersForMember(uid);
  }

  const inputStyle = {
    width: "100%", padding: "8px 10px", background: NL.subtle,
    border: `1px solid ${NL.borderMid}`, borderRadius: 8, color: NL.text,
    fontSize: 12, fontFamily: font, outline: "none", boxSizing: "border-box",
  };
  const labelStyle = {
    display: "block", fontSize: 10, fontWeight: 600, color: NL.muted,
    marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase",
  };

  return (
    <Card
      title="Partner accounts"
      subtitle={`${members.length} registered`}
      action={
        <div style={{ display: "flex", gap: 8 }}>
          {iconBtn(load, "Refresh", <IC.Refresh />)}
          <Btn size="sm" onClick={() => { setShowForm(p => !p); resetForm(); }}>
            <IC.Plus /> {showForm ? "Cancel" : "Add partner"}
          </Btn>
        </div>
      }
    >
      {showForm && (
        <div style={{ marginBottom: 16 }}>
          {createdInfo && (
            <div style={{ padding: 14, background: NL.successDim, border: "1px solid rgba(52,211,153,0.30)", borderRadius: 10, marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: NL.success, margin: 0 }}>✓ Partner aangemaakt</p>
              <p style={{ fontSize: 11, color: NL.text, margin: 0 }}>
                <strong>{createdInfo.email}</strong> kan nu inloggen met het ingestelde wachtwoord.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: mono, fontSize: 10, color: NL.muted, background: "rgba(0,0,0,0.2)", padding: "3px 8px", borderRadius: 4 }}>{createdInfo.uid}</span>
                {iconBtn(() => navigator.clipboard?.writeText(createdInfo.uid), "Copy UID", <IC.Copy />, NL.success)}
              </div>
              <button onClick={() => setCreatedInfo(null)} style={{ alignSelf: "flex-start", fontSize: 11, color: NL.muted, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Sluiten</button>
            </div>
          )}

          <form onSubmit={handleCreate} style={{ padding: 14, background: NL.elevated, border: `1px solid ${NL.accentBorder}`, borderRadius: 10, display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: NL.accent, margin: "0 0 4px" }}>Register new partner</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="partner@example.com"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Temp password *</label>
                <PasswordInput
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min. 6 characters"
                  style={{ ...inputStyle, fontFamily: mono }}
                />
              </div>
            </div>

            <div style={{ maxWidth: 160 }}>
              <label style={labelStyle}>Server slots</label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.serverSlots}
                onChange={e => setForm(p => ({ ...p, serverSlots: Number(e.target.value) }))}
                style={{ ...inputStyle, fontFamily: mono }}
              />
              <p style={{ fontSize: 10, color: NL.muted, margin: "4px 0 0" }}>Number of servers this partner can create</p>
            </div>

            {formError && (
              <p style={{ fontSize: 11, color: NL.danger, background: NL.dangerDim, border: `1px solid ${NL.dangerBorder}`, borderRadius: 6, padding: "8px 10px", margin: 0 }}>
                ⚠ {formError}
              </p>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, paddingTop: 4, borderTop: `1px solid ${NL.border}` }}>
              <Btn type="button" variant="ghost" size="sm" onClick={() => { setShowForm(false); resetForm(); }}>
                Cancel
              </Btn>
              <Btn type="submit" variant="success" size="sm" disabled={creating || !form.email.trim() || form.password.length < 6}>
                {creating ? <><Spinner size={12} /> Creating…</> : <><IC.Plus /> Create partner</>}
              </Btn>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: NL.muted, fontSize: 13, padding: "24px 0", justifyContent: "center" }}>
          <Spinner /> Loading…
        </div>
      ) : error ? (
        <p style={{ fontSize: 12, color: NL.danger, padding: "16px 0", textAlign: "center" }}>{error}</p>
      ) : members.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: NL.elevated, border: `1px solid ${NL.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", color: NL.muted }}>
            <IC.Users />
          </div>
          <p style={{ fontSize: 13, color: NL.secondary, margin: "0 0 4px" }}>No partner accounts yet.</p>
          <p style={{ fontSize: 11, color: NL.muted, margin: 0 }}>Click "Add partner" to create one.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {members.map(m => {
            const uid = m.firebase_uid;
            const isExpanded = expandedUid === uid;
            return (
              <div key={uid} style={{ border: `1px solid ${NL.border}`, borderRadius: 10, background: NL.elevated, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", flexWrap: "wrap" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: NL.accentDim, border: `1px solid ${NL.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: NL.accent }}>
                    {(m.email || "?")[0].toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 120 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: NL.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.email}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                      <span style={{ fontFamily: mono, fontSize: 10, color: NL.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                        {uid}
                      </span>
                      {iconBtn(() => navigator.clipboard?.writeText(uid), "Copy UID", <IC.Copy />)}
                    </div>
                  </div>

                  <SlotEditor
                    uid={uid}
                    current={m.server_slots ?? 1}
                    onUpdate={n => setMembers(p => p.map(x => x.firebase_uid === uid ? { ...x, server_slots: n } : x))}
                  />

                  <button
                    onClick={() => toggleExpand(uid)}
                    style={{ fontSize: 11, color: NL.secondary, padding: "5px 8px", borderRadius: 7, border: `1px solid ${NL.border}`, background: "none", cursor: "pointer", flexShrink: 0, fontFamily: font }}
                  >
                    Servers {isExpanded ? "▲" : "▼"}
                  </button>

                  <button
                    onClick={() => handleDelete(uid, m.email)}
                    disabled={deleting === uid}
                    style={{ background: "none", border: "none", cursor: "pointer", color: NL.muted, padding: 5, borderRadius: 6, flexShrink: 0, opacity: deleting === uid ? 0.4 : 1 }}
                    onMouseEnter={e => { e.currentTarget.style.color = NL.danger; e.currentTarget.style.background = NL.dangerDim; }}
                    onMouseLeave={e => { e.currentTarget.style.color = NL.muted; e.currentTarget.style.background = "transparent"; }}
                    title="Remove partner"
                  >
                    {deleting === uid ? <Spinner size={12} /> : <IC.Trash />}
                  </button>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${NL.border}`, background: "rgba(0,0,0,0.15)", padding: "10px 12px" }}>
                    {loadingServers[uid] ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: NL.muted, fontSize: 12 }}>
                        <Spinner size={12} /> Loading…
                      </div>
                    ) : !memberServers[uid] || memberServers[uid].length === 0 ? (
                      <p style={{ fontSize: 12, color: NL.muted, margin: 0 }}>No servers listed by this partner.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {memberServers[uid].map(s => (
                          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: NL.surface, border: `1px solid ${NL.border}` }}>
                            {s.iconUrl && (
                              <img src={s.iconUrl} alt={s.name} style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} onError={e => e.currentTarget.style.display = "none"} />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: NL.text }}>{s.name}</span>
                              <span style={{ display: "block", fontFamily: mono, fontSize: 10, color: NL.muted }}>{s.address}:{s.port}</span>
                            </div>
                            <button
                              onClick={() => toggleFeatured(s)}
                              style={{ fontSize: 11, padding: "4px 10px", borderRadius: 7, cursor: "pointer", fontFamily: font, flexShrink: 0, background: s.featured ? "rgba(251,191,36,0.15)" : NL.elevated, border: s.featured ? "1px solid rgba(251,191,36,0.3)" : `1px solid ${NL.border}`, color: s.featured ? NL.warn : NL.muted, transition: "all 0.15s" }}
                            >
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
      const res = await fetch(`${API_BASE}/api/admin/users/${reportedUid}/chat-restrict`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ hours }),
      });
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
      const res = await fetch(`${API_BASE}/api/admin/users/${reportedUid}/chat-restrict`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      setModStatus(p => ({ ...p, chatRestrictedUntil: null }));
    } catch (e) { alert("Failed: " + e.message); }
    finally { setActing(null); }
  }

  async function banAccount() {
    if (!confirm(`Ban account for ${reportedName}? This disables their Firebase login.`)) return;
    setActing("ban");
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/users/${reportedUid}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: banReason.trim() || `Actioned from report #${report.id}` }),
      });
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
      const res = await fetch(`${API_BASE}/api/admin/users/${reportedUid}/ban`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
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
            <span style={{ fontSize: 11, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Actions · {reportedName}
            </span>
            {modLoading ? <Spinner size={10} /> : (
              isBanned ? <Badge color="danger">Banned</Badge>
              : isRestricted ? <Badge color="warn">Chat restricted</Badge>
              : <Badge color="success">Clean</Badge>
            )}
          </div>

          {isRestricted && (
            <p style={{ fontSize: 10, color: NL.warn, margin: 0 }}>
              Restricted until {new Date(modStatus.chatRestrictedUntil).toLocaleString()}
            </p>
          )}
          {isBanned && modStatus?.banReason && (
            <p style={{ fontSize: 10, color: NL.danger, margin: 0 }}>Reason: {modStatus.banReason}</p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, color: NL.muted, flexShrink: 0 }}>Chat restrict:</span>
              {[{ label: "1h", h: 1 }, { label: "24h", h: 24 }, { label: "7d", h: 168 }, { label: "30d", h: 720 }].map(({ label, h }) => (
                <Btn key={label} size="sm" variant="secondary" disabled={!!acting || isBanned} onClick={() => restrictChat(h)}>{label}</Btn>
              ))}
              {isRestricted && (
                <Btn size="sm" variant="ghost" disabled={!!acting} onClick={liftRestriction}>
                  {acting === "lift" ? <Spinner size={10} /> : "Lift"}
                </Btn>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                placeholder="Ban reason (optional)"
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
                style={{ flex: 1, padding: "5px 8px", borderRadius: 7, border: `1px solid ${NL.border}`, background: NL.subtle, color: NL.text, fontSize: 11, fontFamily: font, outline: "none" }}
              />
              {!isBanned ? (
                <Btn size="sm" variant="danger" disabled={!!acting} onClick={banAccount}>
                  {acting === "ban" ? <Spinner size={10} /> : <><IC.Ban /> Ban account</>}
                </Btn>
              ) : (
                <Btn size="sm" variant="success" disabled={!!acting} onClick={unbanAccount}>
                  {acting === "unban" ? <Spinner size={10} /> : "Unban"}
                </Btn>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Conversation</span>
          {conv === null && !convLoading && (
            <Btn size="sm" variant="secondary" onClick={loadConversation}>Load chat history</Btn>
          )}
          {conv !== null && iconBtn(loadConversation, "Refresh", <IC.Refresh />)}
        </div>
        {convLoading && <div style={{ display: "flex", alignItems: "center", gap: 6, color: NL.muted, fontSize: 12 }}><Spinner size={12} /> Loading…</div>}
        {convError && <p style={{ fontSize: 11, color: NL.danger, margin: 0 }}>{convError}</p>}
        {conv !== null && !convLoading && (
          conv.length === 0 ? (
            <p style={{ fontSize: 12, color: NL.muted, margin: 0 }}>No messages between these users.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 300, overflowY: "auto", padding: "4px 0" }}>
              {conv.map(msg => {
                const isByReported = msg.senderUid === reportedUid;
                return (
                  <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isByReported ? "flex-start" : "flex-end", gap: 2 }}>
                    <div style={{
                      maxWidth: "80%", padding: "6px 10px", borderRadius: 10,
                      background: isByReported ? NL.dangerDim : NL.accentDim,
                      border: `1px solid ${isByReported ? NL.dangerBorder : NL.accentBorder}`,
                      fontSize: 12, color: NL.text, wordBreak: "break-word",
                    }}>
                      {msg.content}
                    </div>
                    <span style={{ fontSize: 9, color: NL.muted, paddingLeft: 4, paddingRight: 4 }}>
                      {isByReported ? reportedName : (report.reporter_username || "reporter")} · {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
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

function ModerationPanel({ bans, bansLoading, banError, loadBans, handleBan, handleUnban }) {
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [updatingReport, setUpdatingReport] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);
  const [banIpInput, setBanIpInput] = useState("");
  const [banReasonInput, setBanReasonInput] = useState("");

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

  useEffect(() => { loadReports(); }, [loadReports]);

  async function setReportStatus(id, status) {
    setUpdatingReport(id);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (e) { alert("Failed: " + e.message); }
    finally { setUpdatingReport(null); }
  }

  const statusColors = { pending: "warn", reviewed: "blue", dismissed: "default", actioned: "danger" };
  const reasonColors = { spam: "warn", harassment: "danger", inappropriate: "danger", other: "default" };

  const inputStyle = { padding: "9px 12px", borderRadius: 9, border: `1px solid ${NL.borderMid}`, background: NL.subtle, color: NL.text, fontSize: 13, fontFamily: font, outline: "none", width: "100%", boxSizing: "border-box", transition: "border-color 0.15s" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card
        title="User reports"
        subtitle={`${reports.length} shown`}
        action={
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {iconBtn(loadReports, "Refresh", <IC.Refresh />)}
            <div style={{ display: "flex", gap: 2, background: NL.subtle, borderRadius: 8, padding: 2, border: `1px solid ${NL.border}` }}>
              {["all", ...REPORT_STATUSES].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, borderRadius: 6, border: "none", cursor: "pointer", fontFamily: font, background: statusFilter === s ? NL.accent : "transparent", color: statusFilter === s ? "#0d1a18" : NL.secondary, transition: "background 0.15s, color 0.15s" }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        }
      >
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
                        <span style={{ color: NL.muted }}>Reporter: </span>
                        <span style={{ fontFamily: mono }}>{r.reporter_username || r.reporter_uid}</span>
                        <span style={{ color: NL.muted }}> → </span>
                        <span style={{ fontFamily: mono }}>{r.reported_username || r.reported_uid}</span>
                      </span>
                      <span style={{ fontSize: 10, color: NL.muted }}>{new Date(r.created_at).toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
                      {r.status === "pending" && (
                        <>
                          <Btn size="sm" variant="success" disabled={updatingReport === r.id} onClick={() => setReportStatus(r.id, "actioned")}>
                            {updatingReport === r.id ? <Spinner size={10} /> : "Action"}
                          </Btn>
                          <Btn size="sm" variant="secondary" disabled={updatingReport === r.id} onClick={() => setReportStatus(r.id, "reviewed")}>
                            Review
                          </Btn>
                          <Btn size="sm" variant="ghost" disabled={updatingReport === r.id} onClick={() => setReportStatus(r.id, "dismissed")}>
                            Dismiss
                          </Btn>
                        </>
                      )}
                      {r.status !== "pending" && (
                        <Btn size="sm" variant="ghost" disabled={updatingReport === r.id} onClick={() => setReportStatus(r.id, "pending")}>
                          Reopen
                        </Btn>
                      )}
                      <button onClick={() => setExpandedReport(isExpanded ? null : r.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: NL.muted, fontSize: 10, padding: "2px 4px", fontFamily: mono }}>
                        {isExpanded ? "▲" : "▼"}
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <ReportExpanded
                      report={r}
                      onStatusChange={(id, status) => setReports(prev => prev.map(x => x.id === id ? { ...x, status } : x))}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card title="Ban IP" subtitle="Manually ban an IP address">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input placeholder="IP address" value={banIpInput} onChange={e => setBanIpInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleBan(banIpInput.trim(), banReasonInput.trim()).then(() => { setBanIpInput(""); setBanReasonInput(""); })} style={{ padding: "9px 12px", borderRadius: 9, border: `1px solid ${NL.borderMid}`, background: NL.subtle, color: NL.text, fontSize: 13, fontFamily: mono, outline: "none", width: "100%", boxSizing: "border-box" }} />
            <input placeholder="Reason (optional)" value={banReasonInput} onChange={e => setBanReasonInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleBan(banIpInput.trim(), banReasonInput.trim()).then(() => { setBanIpInput(""); setBanReasonInput(""); })} style={{ padding: "9px 12px", borderRadius: 9, border: `1px solid ${NL.borderMid}`, background: NL.subtle, color: NL.text, fontSize: 13, fontFamily: font, outline: "none", width: "100%", boxSizing: "border-box" }} />
            <Btn onClick={() => handleBan(banIpInput.trim(), banReasonInput.trim()).then(() => { setBanIpInput(""); setBanReasonInput(""); })} variant="danger" disabled={!banIpInput.trim()} style={{ justifyContent: "center" }}><IC.Ban /> Ban IP</Btn>
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
                    <p style={{ fontSize: 10, color: NL.muted, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.reason || "No reason"}</p>
                  </div>
                  <button onClick={() => handleUnban(b.ip)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, background: NL.elevated, border: `1px solid ${NL.border}`, color: NL.secondary, cursor: "pointer", fontFamily: font, flexShrink: 0, transition: "color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.color = NL.text}
                    onMouseLeave={e => e.currentTarget.style.color = NL.secondary}
                  >Unban</button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const history = useHistory();

  const [region, setRegion] = useState("EU");
  const apiBase = REGION_BASES[region];
  const regionParam = REGION_PARAMS[region];
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(false);

  const [currentNotification, setCurrentNotification] = useState("");
  const [editing, setEditing] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const [currentVersion, setCurrentVersion] = useState("");
  const [versionUpdatedAt, setVersionUpdatedAt] = useState("");
  const [editingVersion, setEditingVersion] = useState("");
  const [isVersionDirty, setIsVersionDirty] = useState(false);
  const [savingVersion, setSavingVersion] = useState(false);
  const [versionError, setVersionError] = useState(null);

  const [eventsFeed, setEventsFeed] = useState([]);
  const [sseStatus, setSseStatus] = useState("closed");
  const esRef = useRef(null);
  const feedContainerRef = useRef(null);
  const [currentMap, setCurrentMap] = useState({});
  const [rawFilter, setRawFilter] = useState("");
  const [filter, setFilter] = useState("");
  const filterTimer = useRef(null);
  const [showOnly, setShowOnly] = useState("all");
  const [autoStart, setAutoStart] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const [bans, setBans] = useState([]);
  const [bansLoading, setBansLoading] = useState(false);
  const [banError, setBanError] = useState(null);

  const [connStats, setConnStats] = useState(null);
  const [connStatsLoading, setConnStatsLoading] = useState(false);

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 1024); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!auth) { setChecking(false); history.replace("/login"); return; }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setChecking(false); history.replace("/login"); return; }
      setUser(u);
      try {
        const token = await u.getIdToken();
        const res = await fetch(`${API_BASE}/api/admin/members`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.status !== 200) { history.replace("/partner"); return; }
      } catch (_) { history.replace("/login"); return; }
      setChecking(false);
    });
    return () => unsub();
  }, []);

  async function loadCurrentNotification() {
    try {
      const token = await fetchIdToken(); if (!token) return;
      const { ok, data: json } = await dbFetch("/notification", { headers: { Authorization: `Bearer ${token}` } });
      if (!ok) return;
      const msg = json?.message || "";
      setCurrentNotification(msg); setEditing(msg); setIsDirty(false);
    } catch (err) { console.warn(err); }
  }

  async function loadCurrentVersion() {
    setVersionError(null);
    try {
      const token = await fetchIdToken(); if (!token) return;
      const { ok, status, data: json } = await dbFetch("/api/version", { headers: { Authorization: `Bearer ${token}` } });
      if (status === 404) { setCurrentVersion(""); setEditingVersion(""); setVersionUpdatedAt(""); return; }
      if (!ok) throw new Error(`Failed: ${status}`);
      setCurrentVersion(json?.version || ""); setEditingVersion(json?.version || "");
      setVersionUpdatedAt(json?.updated_at || ""); setIsVersionDirty(false);
    } catch (err) { console.warn(err); setVersionError(String(err)); }
  }

  async function loadConnStats() {
    setConnStatsLoading(true);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/admin/stats/connections`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      setConnStats(await res.json());
    } catch (e) { console.warn("connStats failed", e); }
    finally { setConnStatsLoading(false); }
  }

  async function loadBans() {
    setBansLoading(true); setBanError(null);
    try {
      const token = await fetchIdToken(); if (!token) throw new Error("Not authenticated");
      const { ok, status, data: json } = await dbFetch("/api/admin/bans", { headers: { Authorization: `Bearer ${token}` } });
      if (!ok) throw new Error(`Failed: ${status}`);
      setBans(Array.isArray(json.bans) ? json.bans : []);
    } catch (err) { setBanError(String(err)); setBans([]); }
    finally { setBansLoading(false); }
  }

  useEffect(() => { if (user) { loadBans(); loadCurrentNotification(); loadCurrentVersion(); loadConnStats(); } }, [user]);

  useEffect(() => {
    if (filterTimer.current) clearTimeout(filterTimer.current);
    filterTimer.current = setTimeout(() => setFilter(rawFilter.trim()), 220);
    return () => clearTimeout(filterTimer.current);
  }, [rawFilter]);

  useEffect(() => {
    if (autoScroll && feedContainerRef.current) feedContainerRef.current.scrollTop = 0;
  }, [eventsFeed, autoScroll]);

  const startStream = useCallback(async () => {
    if (esRef.current) return;
    setSseStatus("connecting");
    try {
      const token = await fetchIdToken(); if (!token) throw new Error("Not authenticated");
      const r = await fetch(`${apiBase}/cache/admin/cache/stream-token?region=${regionParam}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error("stream-token failed");
      const { streamToken } = await r.json();
      const es = new EventSource(`${apiBase}/cache/admin/cache/stream?streamToken=${encodeURIComponent(streamToken)}&region=${regionParam}`);
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
    } catch (err) { setSseStatus("closed"); console.warn(err); }
  }, [regionParam]);

  const stopStream = useCallback(() => {
    if (esRef.current) { try { esRef.current.close(); } catch (_) { } esRef.current = null; }
    setSseStatus("closed");
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);
  useEffect(() => { if (esRef.current) stopStream(); }, [region]);
  useEffect(() => { if (autoStart && sseStatus === "closed" && user) startStream(); }, [autoStart, user]);

  async function handleUpsert() {
    setSaving(true);
    try {
      const token = await fetchIdToken(); if (!token) throw new Error("Not authenticated");
      const { ok } = await dbFetch("/notification", { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ message: editing || "" }) });
      if (ok) { setCurrentNotification(editing); setIsDirty(false); }
    } catch (err) { console.warn(err); }
    finally { setSaving(false); }
  }

  async function handleClearNotification() {
    if (!confirm("Clear notification?")) return;
    setSaving(true);
    try {
      const token = await fetchIdToken(); if (!token) throw new Error("Not authenticated");
      const { ok } = await dbFetch("/notification", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (ok) { setCurrentNotification(""); setEditing(""); setIsDirty(false); }
    } catch (err) { console.warn(err); }
    finally { setSaving(false); }
  }

  async function handleSaveVersion() {
    setVersionError(null); setSavingVersion(true);
    try {
      const token = await fetchIdToken(); if (!token) throw new Error("Not authenticated");
      if (!/^\d+\.\d+\.\d+(\+\d+)?$/.test(editingVersion.trim())) { setVersionError("Format must be 1.0.0 or 1.0.0+1"); return; }
      const { ok, status, data } = await dbFetch("/api/version", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ version: editingVersion.trim() }) });
      if (ok) { setCurrentVersion(data.version || ""); setVersionUpdatedAt(data.updated_at || ""); setIsVersionDirty(false); }
      else setVersionError(`Failed: ${status}`);
    } catch (err) { setVersionError(String(err)); }
    finally { setSavingVersion(false); }
  }

  async function handleBan(ip, reason = "") {
    setBanError(null);
    if (!ip) { setBanError("Invalid IP"); return; }
    if (!confirm(`Ban ${ip}?`)) return;
    try {
      const token = await fetchIdToken(); if (!token) throw new Error("Not authenticated");
      const { ok, status } = await dbFetch("/api/admin/bans", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ ip, reason }) });
      if (!ok) { setBanError(`Failed: ${status}`); return; }
      await loadBans();
      setCurrentMap(prev => { const n = { ...prev }; delete n[ip]; return n; });
    } catch (err) { setBanError(String(err)); }
  }

  async function handleUnban(ip) {
    if (!ip || !confirm(`Unban ${ip}?`)) return;
    setBanError(null);
    try {
      const token = await fetchIdToken(); if (!token) throw new Error("Not authenticated");
      await dbFetch(`/api/admin/bans/${encodeURIComponent(ip)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      await loadBans();
    } catch (err) { setBanError(String(err)); }
  }

  const filtered = useMemo(() => {
    return [...eventsFeed].reverse().filter(ev => {
      if (showOnly !== "all" && ev.type !== showOnly) return false;
      if (!filter) return true;
      const s = filter.toLowerCase();
      const v = ev.value || {};
      return [v.publicIp, v.publicIP, v.public, v.remoteServerIp, v.remoteServerIP, v.remote, String(v.remoteServerPort || v.remotePort || v.port || ""), v.playerName, ev.key].some(x => (x || "").toLowerCase().includes(s));
    });
  }, [eventsFeed, filter, showOnly]);

  function isIpLocallyBanned(ip) { return ip ? bans.some(b => String(b.ip).toLowerCase() === String(ip).toLowerCase()) : false; }
  function fmtTime(t) { return t ? new Date(t).toLocaleString() : ""; }

  const inputStyle = { padding: "9px 12px", borderRadius: 9, border: `1px solid ${NL.borderMid}`, background: NL.subtle, color: NL.text, fontSize: 13, fontFamily: font, outline: "none", width: "100%", boxSizing: "border-box", transition: "border-color 0.15s" };

  if (checking) return (
    <Layout>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: NL.bg }}>
        <Spinner size={24} />
      </div>
    </Layout>
  );

  const rightColumn = (
    <>
      <Card title="Live players" subtitle={`${Object.keys(currentMap).length} in cache`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 260, overflowY: "auto" }}>
          {Object.keys(currentMap).length === 0 ? (
            <p style={{ fontSize: 13, color: NL.muted, textAlign: "center", padding: "16px 0" }}>No players in cache</p>
          ) : Object.entries(currentMap).map(([key, val]) => {
            const player = val?.playerName || "—";
            const remote = val?.remoteServerIp || val?.remote || "—";
            const port = val?.remoteServerPort || val?.remotePort || val?.port || "";
            const banned = isIpLocallyBanned(key);
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: NL.elevated, border: `1px solid ${NL.border}` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: NL.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player}</p>
                  <p style={{ fontFamily: mono, fontSize: 10, color: NL.muted, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{key} → {remote}{port ? `:${port}` : ""}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                  {iconBtn(() => navigator.clipboard?.writeText(key), "Copy IP", <IC.Copy />)}
                  {banned ? <Badge color="danger">Banned</Badge> : iconBtn(() => handleBan(key, `Banned from dashboard by ${user?.email || "admin"}`), "Ban", <IC.Ban />, NL.danger)}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Active bans" subtitle={`${bans.length} total`}>
        {bansLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: NL.muted, fontSize: 13, padding: "16px 0", justifyContent: "center" }}><Spinner /> Loading…</div>
        ) : bans.length === 0 ? (
          <p style={{ fontSize: 13, color: NL.muted, textAlign: "center", padding: "16px 0" }}>No active bans</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 210, overflowY: "auto" }}>
            {bans.map(b => (
              <div key={b.ip} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: NL.dangerDim, border: `1px solid ${NL.dangerBorder}` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: NL.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.ip}</p>
                  <p style={{ fontSize: 10, color: NL.muted, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.reason || "No reason"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Quick actions">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[{ label: "Metrics", action: () => window.open("/metrics", "_blank") }, { label: "Panel", action: () => window.open("https://panel.mccompanion.net", "_blank") }].map(a => (
            <button key={a.label} onClick={a.action} style={{ padding: "10px", borderRadius: 8, background: NL.elevated, border: `1px solid ${NL.border}`, fontSize: 12, fontWeight: 500, color: NL.secondary, cursor: "pointer", fontFamily: font, transition: "color 0.15s, border-color 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.borderColor = NL.borderMid; }}
              onMouseLeave={e => { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.borderColor = NL.border; }}
            >{a.label} ↗</button>
          ))}
        </div>
      </Card>
    </>
  );

  const mainColumn = (
    <>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
        <Card title="Notification" subtitle="Shown in-app to all users">
          <textarea
            value={editing}
            onChange={e => { setEditing(e.target.value); setIsDirty(e.target.value !== currentNotification); }}
            placeholder="Short notification text…"
            style={{ ...inputStyle, resize: "none", minHeight: 72, flex: 1, fontFamily: font }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <Btn onClick={handleUpsert} disabled={!isDirty || saving} size="sm">{saving ? <><Spinner size={12} /> Saving…</> : "Save"}</Btn>
            <Btn onClick={handleClearNotification} variant="danger" size="sm" disabled={saving || !currentNotification}>Clear</Btn>
            <span style={{ marginLeft: "auto", fontSize: 11, padding: "3px 8px", borderRadius: 4, fontFamily: mono, background: currentNotification ? NL.successDim : NL.subtle, color: currentNotification ? NL.success : NL.muted, border: `1px solid ${currentNotification ? "rgba(52,211,153,0.22)" : NL.border}` }}>
              {currentNotification ? "Active" : "Empty"}
            </span>
          </div>
        </Card>

        <Card title="App Version" subtitle="Flutter app update check">
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <input value={editingVersion} onChange={e => { setEditingVersion(e.target.value); setIsVersionDirty(e.target.value !== currentVersion); setVersionError(null); }} placeholder="e.g. 1.0.2" style={{ ...inputStyle, flex: 1, fontFamily: mono }} />
            <Btn onClick={handleSaveVersion} disabled={!isVersionDirty || savingVersion} size="sm">{savingVersion ? <Spinner size={12} /> : "Publish"}</Btn>
            {iconBtn(loadCurrentVersion, "Reload", <IC.Refresh />)}
          </div>
          {versionError && <p style={{ fontSize: 11, color: NL.danger, margin: "0 0 8px" }}>{versionError}</p>}
          <div style={{ marginTop: "auto" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 11, color: NL.muted, margin: "0 0 2px" }}>Current version</p>
                <p style={{ fontFamily: mono, fontSize: 28, fontWeight: 700, color: NL.text, margin: 0, lineHeight: 1 }}>{currentVersion || "—"}</p>
              </div>
              {versionUpdatedAt && (
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 10, color: NL.muted, margin: "0 0 2px" }}>Last published</p>
                  <p style={{ fontSize: 11, color: NL.secondary, margin: 0, fontFamily: mono }}>{fmtTime(versionUpdatedAt)}</p>
                </div>
              )}
            </div>
            <p style={{ fontSize: 11, color: NL.muted, margin: "8px 0 0" }}>Format: <code style={{ fontFamily: mono, color: NL.secondary }}>1.0.0</code> or <code style={{ fontFamily: mono, color: NL.secondary }}>1.0.0+1</code></p>
          </div>
        </Card>
      </div>

      <Card
        title="Live cache feed"
        subtitle={`${filtered.length} events`}
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1px solid ${NL.border}` }}>
              {Object.keys(REGION_BASES).map(r => (
                <button key={r} onClick={() => { if (r !== region) { stopStream(); setRegion(r); } }} style={{ padding: "5px 12px", fontSize: 11, fontWeight: 600, fontFamily: font, cursor: "pointer", border: "none", background: region === r ? NL.accent : "transparent", color: region === r ? "#0d1a18" : NL.muted, transition: "background 0.15s, color 0.15s" }}>{r}</button>
              ))}
            </div>
            <StatusDot status={sseStatus} />
            <span style={{ fontSize: 11, color: NL.muted }}>{sseStatus}</span>
            {sseStatus !== "open" && sseStatus !== "connecting"
              ? <Btn onClick={startStream} size="sm">Start</Btn>
              : <Btn onClick={stopStream} size="sm" variant="secondary">Stop</Btn>
            }
          </div>
        }
      >
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <input placeholder="Filter by IP / player / remote…" value={rawFilter} onChange={e => setRawFilter(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 160 }} />
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {["all", "set", "del", "clear", "snapshot"].map(v => (
              <button key={v} onClick={() => setShowOnly(v)} style={{ padding: "6px 8px", borderRadius: 7, fontSize: 11, fontWeight: 600, fontFamily: font, cursor: "pointer", border: `1px solid ${NL.border}`, background: showOnly === v ? NL.accent : "transparent", color: showOnly === v ? "#0d1a18" : NL.muted, transition: "background 0.15s, color 0.15s" }}>
                {v === "all" ? "All" : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10, flexWrap: "wrap" }}>
          {[{ label: "Auto-start", checked: autoStart, set: setAutoStart }, { label: "Auto-scroll", checked: autoScroll, set: setAutoScroll }].map(({ label, checked, set }) => (
            <label key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: NL.secondary, cursor: "pointer" }}>
              <input type="checkbox" checked={checked} onChange={e => set(e.target.checked)} style={{ accentColor: NL.accent }} />
              {label}
            </label>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <Btn onClick={() => setEventsFeed(p => p.slice(-50))} variant="secondary" size="sm">Trim to 50</Btn>
            <Btn onClick={() => { setEventsFeed([]); setCurrentMap({}); }} variant="ghost" size="sm">Clear</Btn>
          </div>
        </div>
        <div ref={feedContainerRef} style={{ flex: 1, overflowY: "auto", border: `1px solid ${NL.border}`, borderRadius: 10, background: "rgba(0,0,0,0.2)", minHeight: 260, maxHeight: 480, padding: 8, display: "flex", flexDirection: "column", gap: 5 }}>
          {filtered.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8, color: NL.muted, padding: "48px 0" }}>
              <span style={{ fontSize: 28 }}>📡</span>
              <p style={{ fontSize: 13 }}>{sseStatus === "open" ? "Waiting for events…" : "Start the feed to begin streaming."}</p>
            </div>
          ) : filtered.map((ev, i) => (
            <FeedEventRow key={i} ev={ev} isBanned={isIpLocallyBanned(ev.key || ev.value?.publicIp)} onBan={ip => handleBan(ip, `Banned from live feed by ${user?.email || "admin"}`)} />
          ))}
        </div>
      </Card>
    </>
  );

  return (
    <Layout>
      <div style={{ minHeight: "100vh", background: NL.bg, fontFamily: font, paddingBottom: 48 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 16px 0" }}>

          <header style={{ marginBottom: 24, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: NL.accentDim, border: `1px solid ${NL.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: NL.accent, fontSize: 18 }}>⚡</div>
              <div>
                <h1 style={{ fontSize: 16, fontWeight: 700, color: NL.text, margin: 0, letterSpacing: "-0.01em" }}>MCCompanion Admin</h1>
                <p style={{ fontSize: 11, color: NL.muted, margin: 0 }}>{user?.email}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <TabBar active={activeTab} onChange={setActiveTab} />
              <Btn onClick={async () => { try { await signOut(auth); } catch (e) { console.error(e); } }} variant="ghost" size="sm">
                <IC.SignOut /> Sign out
              </Btn>
            </div>
          </header>

          {activeTab === "partners" && <PartnersPanel />}

          {activeTab === "moderation" && (
            <ModerationPanel
              bans={bans}
              bansLoading={bansLoading}
              banError={banError}
              loadBans={loadBans}
              handleBan={handleBan}
              handleUnban={handleUnban}
            />
          )}

          {activeTab === "overview" && (<>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Live players", value: Object.keys(currentMap).length, sub: "In cache" },
                { label: "Active bans", value: bans.length, sub: "Shared DB" },
                { label: "Feed events", value: eventsFeed.length, sub: `Cap ${EVENTS_CAP}` },
              ].map(s => (
                <div key={s.label} style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 12, padding: "14px 16px" }}>
                  <p style={{ fontSize: 11, color: NL.muted, margin: "0 0 4px" }}>{s.label}</p>
                  <p style={{ fontFamily: mono, fontSize: 26, fontWeight: 700, color: NL.text, lineHeight: 1, margin: "0 0 4px" }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: NL.muted, margin: 0 }}>{s.sub}</p>
                </div>
              ))}
            </div>

            <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 16, padding: "16px 18px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: NL.text, margin: 0 }}>Relay connections</h3>
                  <p style={{ fontSize: 11, color: NL.muted, margin: "2px 0 0" }}>All servers combined — last 30 days</p>
                </div>
                {iconBtn(loadConnStats, "Refresh", <IC.Refresh />)}
              </div>

              {connStatsLoading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: NL.muted, fontSize: 13, padding: "24px 0", justifyContent: "center" }}><Spinner /> Loading…</div>
              ) : connStats ? (<>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 18 }}>
                  {[
                    { label: "Today", value: connStats.today },
                    { label: "Last 7 days", value: connStats.thisWeek },
                    { label: "Last 30 days", value: connStats.thisMonth },
                  ].map(s => (
                    <div key={s.label} style={{ background: NL.elevated, border: `1px solid ${NL.border}`, borderRadius: 10, padding: "12px 14px" }}>
                      <p style={{ fontSize: 11, color: NL.muted, margin: "0 0 4px" }}>{s.label}</p>
                      <p style={{ fontFamily: mono, fontSize: 22, fontWeight: 700, color: NL.accent, lineHeight: 1, margin: 0 }}>
                        {s.value.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={connStats.daily} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={NL.border} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: NL.muted, fontFamily: mono }} tickFormatter={d => d.slice(5)} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10, fill: NL.muted, fontFamily: mono }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: NL.elevated, border: `1px solid ${NL.borderMid}`, borderRadius: 8, fontSize: 12, fontFamily: mono }}
                      labelStyle={{ color: NL.secondary }}
                      itemStyle={{ color: NL.accent }}
                      formatter={v => [v.toLocaleString(), "connections"]}
                    />
                    <Line type="monotone" dataKey="count" stroke={NL.accent} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: NL.accent }} />
                  </LineChart>
                </ResponsiveContainer>
              </>) : (
                <p style={{ fontSize: 13, color: NL.muted, textAlign: "center", padding: "24px 0" }}>No data available.</p>
              )}
            </div>

            {isMobile ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {mainColumn}
                {rightColumn}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "1 / 3", display: "flex", flexDirection: "column", gap: 16 }}>
                  {mainColumn}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {rightColumn}
                </div>
              </div>
            )}
          </>)}

        </div>
      </div>
    </Layout>
  );
}