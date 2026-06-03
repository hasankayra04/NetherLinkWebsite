import React, { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseClient";
import { fetchIdToken } from "../firebaseAuthHelpers";
import Layout from "@theme/Layout";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { FaFileInvoiceDollar } from "react-icons/fa";

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
};
const font = "'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'Fira Code', monospace";

const API_BASE = "https://api.mccompanion.net";

async function apiFetch(path, options = {}) {
  const token = await fetchIdToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (res.ok) return data;
  throw Object.assign(new Error(data.message || res.statusText), { data, status: res.status });
}


function Spinner({ size = 16 }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 100 24v-4l-3 3 3 3v4a12 12 0 01-12-12z" />
    </svg>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", disabled, className = "", type = "button", style: extraStyle }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontWeight: 600, borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: font, border: "none",
    opacity: disabled ? 0.4 : 1,
    transition: "opacity 0.15s, background 0.15s",
  };
  const sizes = { sm: { padding: "7px 12px", fontSize: 12 }, md: { padding: "10px 18px", fontSize: 14 } };
  const variants = {
    primary: { background: `linear-gradient(135deg, ${NL.accent}, #38bdb0)`, color: "#0d1a18" },
    secondary: { background: NL.elevated, color: NL.secondary, border: `1px solid ${NL.borderMid}` },
    danger: { background: NL.dangerDim, color: NL.danger, border: `1px solid ${NL.dangerBorder}` },
    ghost: { background: "transparent", color: NL.secondary, border: `1px solid ${NL.border}` },
    success: { background: NL.successDim, color: NL.success, border: `1px solid rgba(52,211,153,0.22)` },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={className}
      style={{ ...base, ...sizes[size], ...variants[variant], ...extraStyle }}>
      {children}
    </button>
  );
}

function Tag({ children, color = "accent" }) {
  const styles = {
    accent: { color: NL.accent, background: NL.accentDim, border: `1px solid ${NL.accentBorder}` },
    warn: { color: NL.warn, background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.22)" },
  };
  const s = styles[color] || styles.accent;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
      fontFamily: mono, letterSpacing: "0.06em", textTransform: "uppercase", ...s,
    }}>{children}</span>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  const remove = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, add, remove };
}

function ToastContainer({ toasts, remove }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
          borderRadius: 14, border: `1px solid ${t.type === "error" ? NL.dangerBorder : "rgba(52,211,153,0.25)"}`,
          background: NL.surface, minWidth: 240, maxWidth: 340,
          pointerEvents: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: t.type === "error" ? NL.danger : NL.success }} />
          <span style={{ fontSize: 13, color: NL.text, flex: 1 }}>{t.message}</span>
          <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", color: NL.muted, cursor: "pointer", fontSize: 14, padding: 2 }}>✕</button>
        </div>
      ))}
    </div>
  );
}

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch("/api/partner/invoices")
      .then(data => { if (cancelled) return; setInvoices(data.invoices || []); setErr(null); setLoading(false); })
      .catch(() => { if (cancelled) return; setErr("Failed to load invoices."); setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function formatAmount(amt, currency = "usd") {
    if (amt == null) return "–";
    const curr = (currency || "usd").toUpperCase();
    if (curr === "USD") return "$" + (amt / 100).toFixed(2);
    if (curr === "EUR") return "€" + (amt / 100).toFixed(2);
    return (amt / 100).toFixed(2) + " " + curr;
  }

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ color: NL.accent, fontSize: 16 }}><FaFileInvoiceDollar /></span>
        <span style={{ fontWeight: 700, color: NL.text, fontSize: 16 }}>Invoices</span>
        <span style={{ fontSize: 12, color: NL.muted }}>Your MCCompanion purchases</span>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: NL.muted, fontSize: 13, padding: "24px 0" }}>
          <Spinner /> Loading invoices…
        </div>
      ) : err ? (
        <p style={{ textAlign: "center", color: NL.danger, fontSize: 13, padding: "24px 0" }}>{err}</p>
      ) : invoices.length === 0 ? (
        <p style={{ textAlign: "center", color: NL.muted, fontSize: 13, padding: "24px 0" }}>No invoices found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {invoices.map(inv => (
            <div key={inv.id} style={{
              background: NL.surface, border: `1px solid ${NL.border}`,
              borderRadius: 14, padding: "14px 16px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 700, color: NL.text }}>
                    {formatAmount(inv.amount_paid, inv.currency)}
                  </div>
                  <div style={{ fontSize: 11, color: NL.muted, marginTop: 2 }}>
                    {new Date(inv.created * 1000).toLocaleDateString("en-GB")}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
                  fontFamily: mono, letterSpacing: "0.06em", textTransform: "uppercase",
                  background: inv.status === "paid" ? NL.successDim : inv.status === "open" ? "rgba(251,191,36,0.10)" : NL.dangerDim,
                  color: inv.status === "paid" ? NL.success : inv.status === "open" ? NL.warn : NL.danger,
                  border: `1px solid ${inv.status === "paid" ? "rgba(52,211,153,0.22)" : inv.status === "open" ? "rgba(251,191,36,0.22)" : NL.dangerBorder}`,
                }}>
                  {inv.status}
                </span>
              </div>
              <div style={{ fontSize: 12, color: NL.secondary, margin: "8px 0", lineHeight: 1.5 }}>
                {inv.lines?.data?.length ? inv.lines.data.map(l => <span key={l.id} style={{ display: "block" }}>{l.description}</span>) : (inv.description || "–")}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: mono, fontSize: 10, color: NL.muted }}>{inv.number || inv.id}</span>
                {inv.hosted_invoice_url && (
                  <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer"
                    style={{
                      fontSize: 12, fontWeight: 600, color: NL.accent,
                      textDecoration: "none", padding: "4px 10px",
                      border: `1px solid ${NL.accentBorder}`, borderRadius: 6,
                      background: NL.accentDim, transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(103,228,4,0.18)"}
                    onMouseLeave={e => e.currentTarget.style.background = NL.accentDim}
                  >
                    Download PDF
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


const EMPTY = { name: "", address: "", port: "19132", description: "", iconUrl: "", websiteUrl: "" };

function ServerForm({ initial = EMPTY, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(initial);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  useEffect(() => { setForm(initial); }, [initial]);

  const inputStyle = {
    width: "100%", padding: "9px 12px",
    background: NL.subtle, border: `1px solid ${NL.borderMid}`,
    borderRadius: 9, color: NL.text, fontSize: 13, fontFamily: font,
    outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
  };
  const labelStyle = {
    display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
    textTransform: "uppercase", color: NL.muted, marginBottom: 5,
    fontFamily: mono,
  };

  const fields = [
    { key: "name", label: "Server Name", placeholder: "My Awesome Server", type: "text", required: true, span: 2 },
    { key: "address", label: "Address", placeholder: "play.myserver.net", type: "text", required: true, span: 1 },
    { key: "port", label: "Port", placeholder: "19132", type: "number", required: false, span: 1 },
    { key: "iconUrl", label: "Icon URL", placeholder: "https://example.com/icon.png", type: "url", required: false, span: 1 },
    { key: "websiteUrl", label: "Website URL", placeholder: "https://myserver.net", type: "url", required: false, span: 1 },
  ];

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ ...form, port: Number(form.port) || 19132 }); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {fields.map(({ key, label, placeholder, type, required, span }) => (
          <div key={key} style={{ gridColumn: span === 2 ? "1 / 3" : undefined }}>
            <label style={labelStyle}>{label}</label>
            <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder} required={required}
              style={{ ...inputStyle, fontFamily: key === "address" || key === "port" ? mono : font }}
              onFocus={e => e.target.style.borderColor = NL.accentBorder}
              onBlur={e => e.target.style.borderColor = NL.borderMid}
            />
          </div>
        ))}
      </div>

      <div>
        <label style={labelStyle}>Description</label>
        <textarea value={form.description} onChange={set("description")} rows={3} placeholder="Describe your server…"
          style={{ ...inputStyle, resize: "none" }}
          onFocus={e => e.target.style.borderColor = NL.accentBorder}
          onBlur={e => e.target.style.borderColor = NL.borderMid}
        />
      </div>

      {form.iconUrl && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, border: `1px solid ${NL.border}`, background: NL.elevated }}>
          <img src={form.iconUrl} alt="preview" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} onError={e => e.currentTarget.style.display = "none"} />
          <span style={{ fontSize: 12, color: NL.muted }}>Icon preview</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
        <Btn type="button" onClick={onCancel} variant="ghost" style={{ flex: 1 }}>Cancel</Btn>
        <Btn type="submit" disabled={submitting} style={{ flex: 2 }}>
          {submitting ? <><Spinner size={14} /> Saving…</> : initial.name ? "Save changes" : "Add server"}
        </Btn>
      </div>
    </form>
  );
}


function StatsBar({ stats }) {
  const items = [
    { label: "Total", value: stats.total },
    { label: "This week", value: stats.thisWeek },
    { label: "This month", value: stats.thisMonth },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, margin: "8px 0" }}>
      {items.map(i => (
        <div key={i.label} style={{ background: NL.surface, borderRadius: 8, padding: "8px 6px", textAlign: "center", border: `1px solid ${NL.border}` }}>
          <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: NL.accent }}>{(i.value ?? 0).toLocaleString()}</div>
          <div style={{ fontSize: 10, color: NL.muted, marginTop: 2 }}>{i.label}</div>
        </div>
      ))}
    </div>
  );
}

function ServerLineChart({ data }) {
  let graphData = [{ name: "", count: 0 }, { name: "", count: 0 }];
  if (data && data.length > 0) {
    graphData = data.slice(-14).map(d => ({ name: d.day?.slice(5) ?? "", count: d.count }));
    if (graphData.length === 1) graphData.push({ ...graphData[0] });
  }
  return (
    <div style={{ height: 72, width: "100%", position: "relative", marginTop: 4 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={graphData}>
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: NL.muted }} axisLine={false} tickLine={false} />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ background: NL.elevated, border: `1px solid ${NL.border}`, borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: NL.secondary }}
            itemStyle={{ color: NL.accent }}
          />
          <Line type="monotone" dataKey="count" stroke={NL.accent} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
      {(!data || data.length < 2) && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: NL.muted }}>No data yet</div>
      )}
    </div>
  );
}


function ServerCard({ server, onEdit, onDelete, deleting }) {
  return (
    <div style={{
      background: NL.surface, border: `1px solid ${NL.border}`,
      borderRadius: 16, padding: "16px", display: "flex", flexDirection: "column", gap: 10,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${NL.accent}55 0%, transparent 100%)` }} />

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", border: `1px solid ${NL.border}`, background: NL.elevated, flexShrink: 0 }}>
          {server.iconUrl
            ? <img src={server.iconUrl} alt={server.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>🖥</span>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: NL.text }}>{server.name}</span>
            {server.featured && <Tag color="warn">★ Featured</Tag>}
          </div>
          <span style={{ fontFamily: mono, fontSize: 11, color: NL.muted }}>{server.address}:{server.port}</span>
        </div>
      </div>

      {server.description && (
        <p style={{ fontSize: 12, color: NL.secondary, lineHeight: 1.5, margin: 0 }}>
          {server.description.slice(0, 100)}{server.description.length > 100 && "…"}
        </p>
      )}

      <StatsBar stats={server.stats || {}} />
      <ServerLineChart data={server.stats?.daily || []} />

      {server.websiteUrl && (
        <a href={server.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: NL.accent, textDecoration: "none" }}>
          🌐 {server.websiteUrl.replace(/^https?:\/\//, "").split("/")[0]}
        </a>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={() => onEdit(server)} variant="secondary" size="sm" style={{ flex: 1 }}>Edit</Btn>
        <Btn onClick={() => onDelete(server.id)} variant="danger" size="sm" style={{ flex: 1 }} disabled={deleting}>
          {deleting ? <Spinner size={12} /> : "Delete"}
        </Btn>
      </div>
    </div>
  );
}

function Dashboard({ user }) {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("list");
  const [editTarget, setEditTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { toasts, add: toast, remove: removeToast } = useToasts();
  const [slots, setSlots] = useState({ used: 0, total: 1 });

  const loadServers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/partner/servers");
      setServers(data.servers ?? []);
      if (data.slots) setSlots(data.slots);
    } catch (err) { toast("Failed to load servers: " + err.message, "error"); }
    finally { setLoading(false); }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const data = await apiFetch("/api/partner/servers/stats");
      const statsMap = Object.fromEntries((data.stats ?? []).map(s => [s.id, s.stats]));
      setServers(prev => prev.map(s => ({ ...s, stats: statsMap[s.id] ?? s.stats })));
    } catch (_) { }
  }, []);

  useEffect(() => { loadServers(); }, [loadServers]);
  useEffect(() => {
    const interval = setInterval(refreshStats, 60_000);
    return () => clearInterval(interval);
  }, [refreshStats]);

  async function handleAdd(formData) {
    setSubmitting(true);
    try { await apiFetch("/api/partner/servers", { method: "POST", body: JSON.stringify(formData) }); toast("Server added"); await loadServers(); setMode("list"); }
    catch (err) { toast(err.message || "Failed to add", "error"); }
    finally { setSubmitting(false); }
  }

  async function handleEdit(formData) {
    setSubmitting(true);
    try { await apiFetch(`/api/partner/servers/${editTarget.id}`, { method: "PATCH", body: JSON.stringify(formData) }); toast("Server updated"); await loadServers(); setMode("list"); }
    catch (err) { toast(err.message || "Failed to update", "error"); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this server? This cannot be undone.")) return;
    setDeletingId(id);
    try { await apiFetch(`/api/partner/servers/${id}`, { method: "DELETE" }); toast("Server deleted"); setServers(p => p.filter(s => s.id !== id)); }
    catch (err) { toast(err.message || "Failed to delete", "error"); }
    finally { setDeletingId(null); }
  }

  function startEdit(server) { setEditTarget(server); setMode("edit"); }
  function cancelForm() { setMode("list"); setEditTarget(null); }

  const slotPct = Math.min(100, (slots.used / Math.max(slots.total, 1)) * 100);
  const slotFull = slots.used >= slots.total;

  return (
    <div style={{ minHeight: "100vh", background: NL.bg, fontFamily: font }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 16px 64px", display: "flex", flexDirection: "column", gap: 20 }}>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: NL.text, margin: "0 0 4px", letterSpacing: "-0.02em" }}>Your Servers</h1>
            <p style={{ fontSize: 13, color: NL.secondary, margin: 0 }}>
              Servers you add here will be visible in the MCCompanion app for all players.
            </p>
          </div>
          {mode === "list" && !slotFull && (
            <Btn onClick={() => setMode("add")}>+ Add server</Btn>
          )}
        </div>

        {mode === "list" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
            <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 14, padding: "14px 16px", textAlign: "center" }}>
              <p style={{ fontSize: 11, color: NL.muted, margin: "0 0 4px" }}>Featured</p>
              <p style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: NL.text, margin: 0 }}>
                {servers.filter(s => s.featured).length}
              </p>
            </div>
            <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ fontSize: 11, color: NL.muted, margin: 0 }}>Server slots</p>
                <p style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: NL.secondary, margin: 0 }}>{slots.used} / {slots.total}</p>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: NL.subtle, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  background: slotFull ? NL.danger : NL.accent,
                  width: `${slotPct}%`, transition: "width 0.4s",
                }} />
              </div>
              {slotFull && <p style={{ fontSize: 11, color: NL.danger, margin: "6px 0 0" }}>Slot limit reached — contact MCCompanion for more.</p>}
            </div>
          </div>
        )}

        {mode !== "list" && (
          <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 18, overflow: "hidden" }}>
            <div style={{ height: 2, background: `linear-gradient(90deg, ${NL.accent}55 0%, transparent 100%)` }} />
            <div style={{ padding: "20px 20px" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: NL.text, margin: "0 0 16px" }}>
                {mode === "add" ? "Add a new server" : `Edit — ${editTarget?.name}`}
              </h2>
              <ServerForm
                initial={mode === "edit"
                  ? { name: editTarget.name, address: editTarget.address, port: String(editTarget.port), description: editTarget.description ?? "", iconUrl: editTarget.iconUrl ?? "", websiteUrl: editTarget.websiteUrl ?? "" }
                  : EMPTY}
                onSubmit={mode === "add" ? handleAdd : handleEdit}
                onCancel={cancelForm}
                submitting={submitting}
              />
            </div>
          </div>
        )}

        {mode === "list" && (
          loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "80px 0", color: NL.muted }}>
              <Spinner size={20} /><span style={{ fontSize: 14 }}>Loading your servers…</span>
            </div>
          ) : servers.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 14, textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: NL.surface, border: `1px solid ${NL.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🖥</div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: NL.text, margin: "0 0 4px" }}>No servers yet</p>
                <p style={{ fontSize: 13, color: NL.secondary, margin: 0, maxWidth: 300 }}>
                  Add your first server to get listed in the MCCompanion app for PlayStation, Xbox and Nintendo players.
                </p>
              </div>
              <Btn onClick={() => setMode("add")}>+ Add your first server</Btn>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
              {servers.map(s => (
                <ServerCard key={s.id} server={s} onEdit={startEdit} onDelete={handleDelete} deleting={deletingId === s.id} />
              ))}
              {!slotFull && (
                <button onClick={() => setMode("add")} style={{
                  border: `2px dashed ${NL.border}`, borderRadius: 16, background: "transparent", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "48px 0", color: NL.muted, minHeight: 180, fontFamily: font,
                  transition: "border-color 0.2s, color 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = NL.accentBorder; e.currentTarget.style.color = NL.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = NL.border; e.currentTarget.style.color = NL.muted; }}
                >
                  <span style={{ fontSize: 28 }}>+</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Add server</span>
                </button>
              )}
            </div>
          )
        )}

        {mode === "list" && <InvoiceList />}

        <div style={{
          background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
          borderRadius: 16, padding: "16px 18px",
          display: "flex", gap: 14,
        }}>
          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>ℹ️</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: NL.accent, margin: "0 0 6px" }}>How it works</p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                <>Your servers appear in the <strong style={{ color: NL.text }}>Partner Servers</strong> section of the MCCompanion app.</>,
                <><strong style={{ color: NL.text }}>Featured</strong> status is managed by the MCCompanion team — contact us to get featured.</>,
                <>Use a square icon image (min 128×128px) for the best look in the app.</>,
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: NL.secondary }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: NL.accent, flexShrink: 0, marginTop: 5 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
      <ToastContainer toasts={toasts} remove={removeToast} />
    </div>
  );
}

export default function PartnerDashboardPage() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!auth) { window.location.replace("/login"); return; }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { window.location.replace("/login"); return; }
      try {
        const token = await u.getIdToken();

        const adminRes = await fetch(`${API_BASE}/api/admin/members`, { headers: { Authorization: `Bearer ${token}` } });
        if (adminRes.status === 200) { window.location.replace("/dashboard"); return; }

        const memberRes = await fetch(`${API_BASE}/api/partner/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (memberRes.status !== 200) { window.location.replace("/login"); return; }
      } catch (_) {
        window.location.replace("/login"); return;
      }
      setUser(u); setChecking(false);
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
      <Dashboard user={user} />
    </Layout>
  );
}