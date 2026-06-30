import React, { useEffect, useState, useCallback, useRef } from "react";
import { useHistory } from "@docusaurus/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseClient";
import { fetchIdToken } from "../firebaseAuthHelpers";
import Layout from "@theme/Layout";
import { marked } from "marked";
import DOMPurify from "dompurify";

marked.use({ breaks: true });

function SkinBody({ url, scale = 5 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !url) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;
      const s = scale;
      ctx.drawImage(img, 8, 8, 8, 8, 4 * s, 0, 8 * s, 8 * s);
      ctx.drawImage(img, 40, 8, 8, 8, 4 * s, 0, 8 * s, 8 * s);
      ctx.drawImage(img, 20, 20, 8, 12, 4 * s, 8 * s, 8 * s, 12 * s);
      ctx.drawImage(img, 44, 20, 4, 12, 0, 8 * s, 4 * s, 12 * s);
      ctx.drawImage(img, 36, 52, 4, 12, 12 * s, 8 * s, 4 * s, 12 * s);
      ctx.drawImage(img, 4, 20, 4, 12, 4 * s, 20 * s, 4 * s, 12 * s);
      ctx.drawImage(img, 20, 52, 4, 12, 8 * s, 20 * s, 4 * s, 12 * s);
    };
    img.onerror = () => {
      const fb = new Image();
      fb.onload = () => { ctx.imageSmoothingEnabled = false; ctx.drawImage(fb, 0, 0, canvas.width, canvas.height); };
      fb.src = url;
    };
    img.src = url;
  }, [url, scale]);
  return <canvas ref={ref} width={16 * scale} height={32 * scale} style={{ display: "block", imageRendering: "pixelated" }} />;
}

const NL = {
  bg: "#0d1117",
  surface: "#131820",
  elevated: "#191f2b",
  subtle: "#1f2635",
  border: "rgba(255,255,255,0.06)",
  borderMid: "rgba(255,255,255,0.11)",
  text: "#eaecf0",
  secondary: "#8d97aa",
  muted: "#4a5270",
  accent: "#67e404",
  accentDim: "rgba(103,228,4,0.10)",
  accentBorder: "rgba(103,228,4,0.22)",
  danger: "#f87171",
  dangerDim: "rgba(248,113,113,0.10)",
  dangerBorder: "rgba(248,113,113,0.22)",
  success: "#34d399",
};
const font = "'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'Fira Code', monospace";
const API_BASE = "https://api.mccompanion.net";

function Spinner({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40 20" />
    </svg>
  );
}

function Card({ title, subtitle, action, children }) {
  return (
    <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 14, padding: "18px 20px", fontFamily: font }}>
      {(title || action) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: NL.text, margin: 0 }}>{title}</p>
            {subtitle && <p style={{ fontSize: 11, color: NL.muted, margin: "2px 0 0" }}>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function Badge({ color = "default", children }) {
  const colors = {
    default: { bg: NL.elevated, border: NL.border, text: NL.secondary },
    accent: { bg: NL.accentDim, border: NL.accentBorder, text: NL.accent },
    danger: { bg: NL.dangerDim, border: NL.dangerBorder, text: NL.danger },
  };
  const c = colors[color] || colors.default;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 5, background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontFamily: font }}>
      {children}
    </span>
  );
}

function Btn({ onClick, disabled, children, size = "md" }) {
  const pad = size === "sm" ? "6px 14px" : "9px 18px";
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: pad, borderRadius: 8, border: "none", cursor: disabled ? "not-allowed" : "pointer",
      background: disabled ? NL.elevated : NL.accent, color: disabled ? NL.muted : "#000",
      fontSize: 13, fontWeight: 600, fontFamily: font, transition: "opacity 0.15s",
      opacity: disabled ? 0.5 : 1,
    }}>
      {children}
    </button>
  );
}

function MySkinsSection({ username, idToken }) {
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!username) return;
    fetchIdToken().then(token => {
      if (!token) return;
      fetch(`${API_BASE}/api/skins/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => setSkins(d.skins ?? []))
        .catch(() => { })
        .finally(() => setLoading(false));
    });
  }, [username]);

  async function deleteSkin(id) {
    if (!confirm("Delete this skin?")) return;
    setDeleting(id);
    try {
      const token = await fetchIdToken();
      await fetch(`${API_BASE}/api/skins/me/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setSkins(s => s.filter(x => x.id !== id));
    } catch (_) { }
    setDeleting(null);
  }

  return (
    <Card title="My Cloud Skins" subtitle={skins.length ? `${skins.length} skin${skins.length !== 1 ? "s" : ""}` : undefined}>
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: NL.muted, fontSize: 13, padding: "16px 0", justifyContent: "center" }}><Spinner /> Loading…</div>
      ) : skins.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <p style={{ fontSize: 13, color: NL.muted, margin: "0 0 8px" }}>No cloud skins yet.</p>
          <a href="/skins" style={{ fontSize: 12, color: NL.accent, textDecoration: "none" }}>Open Skin Workshop →</a>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 10 }}>
          {skins.map(skin => (
            <div key={skin.id} style={{ background: NL.elevated, border: `1px solid ${NL.border}`, borderRadius: 10, padding: "12px 8px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = NL.borderMid}
              onMouseLeave={e => e.currentTarget.style.borderColor = NL.border}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <SkinBody url={skin.public_url} scale={3} />
              </div>
              <span style={{ fontSize: 11, color: NL.text, fontWeight: 600, textAlign: "center", wordBreak: "break-word", lineHeight: 1.3, width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{skin.name}</span>
              {skin.like_count > 0 && <span style={{ fontSize: 10, color: NL.muted }}>♥ {skin.like_count}</span>}
              <button onClick={() => deleteSkin(skin.id)} disabled={deleting === skin.id}
                style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, border: `1px solid ${NL.dangerBorder}`, background: NL.dangerDim, color: NL.danger, cursor: "pointer", fontFamily: font, opacity: deleting === skin.id ? 0.5 : 1, width: "100%" }}>
                {deleting === skin.id ? "…" : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

const PACK_CATEGORIES = ["realism", "faithful", "pvp", "cartoon", "dark", "medieval", "nature", "themed", "other"];
const STATUS_COLOR = { pending: "#f59e0b", approved: "#67e404", rejected: "#f87171" };
const STATUS_BG = { pending: "rgba(251,191,36,0.08)", approved: "rgba(103,228,4,0.08)", rejected: "rgba(248,113,113,0.08)" };
const STATUS_BORDER = { pending: "rgba(251,191,36,0.22)", approved: "rgba(103,228,4,0.22)", rejected: "rgba(248,113,113,0.22)" };

function Label({ children, required }) {
  return (
    <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: NL.muted, marginBottom: 5, letterSpacing: "0.07em", textTransform: "uppercase" }}>
      {children}{required && <span style={{ color: NL.danger, marginLeft: 3 }}>*</span>}
    </label>
  );
}

function MySubmissionsSection({ submissions, loadingSubs, loadSubmissions }) {
  const inputStyle = { padding: "9px 12px", borderRadius: 9, border: `1px solid ${NL.borderMid}`, background: NL.subtle, color: NL.text, fontSize: 13, fontFamily: font, outline: "none", width: "100%", boxSizing: "border-box" };
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editTagInput, setEditTagInput] = useState("");
  const [editTags, setEditTags] = useState([]);
  const [editThumbPreview, setEditThumbPreview] = useState(null);
  const [editThumbUrl, setEditThumbUrl] = useState("");
  const [editThumbUploading, setEditThumbUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const editThumbRef = useRef(null);

  function startEdit(s) {
    setEditingId(s.id);
    setEditForm({ name: s.name, description: s.description ?? "", category: s.category ?? "", longDescription: s.longDescription ?? "", creatorWebsite: s.creatorWebsite ?? "", creatorDiscord: s.creatorDiscord ?? "" });
    setEditTags(s.tags ?? []);
    setEditTagInput("");
    setEditThumbPreview(s.thumbnailUrl ?? null);
    setEditThumbUrl(s.thumbnailUrl ?? "");
  }

  function cancelEdit() { setEditingId(null); }

  function addEditTag(raw) {
    const t = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (t && !editTags.includes(t) && editTags.length < 8) setEditTags(prev => [...prev, t]);
    setEditTagInput("");
  }

  async function uploadEditThumb(file) {
    if (!file) return;
    setEditThumbUploading(true);
    setEditThumbPreview(URL.createObjectURL(file));
    try {
      const token = await fetchIdToken();
      const pr = await fetch(`${API_BASE}/api/featured-packs/thumbnail-presign`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ mime: file.type }),
      });
      const { uploadUrl, publicUrl } = await pr.json();
      if (!pr.ok) throw new Error("Presign failed");
      await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      setEditThumbUrl(publicUrl);
    } catch { setEditThumbPreview(null); }
    finally { setEditThumbUploading(false); }
  }

  async function saveEdit(id) {
    setSaving(true);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/featured-packs/my-submissions/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim() || undefined,
          description: editForm.description.trim() || undefined,
          thumbnailUrl: editThumbUrl || undefined,
          tags: editTags,
          category: editForm.category || undefined,
          longDescription: editForm.longDescription.trim() || undefined,
          creatorWebsite: editForm.creatorWebsite.trim() || undefined,
          creatorDiscord: editForm.creatorDiscord.trim() || undefined,
        }),
      });
      if (res.ok) { setEditingId(null); await loadSubmissions(); }
    } catch (_) { }
    setSaving(false);
  }

  async function deleteSubmission(id) {
    if (!window.confirm("Withdraw this submission? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/featured-packs/my-submissions/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) await loadSubmissions();
    } catch (_) { }
    setDeletingId(null);
  }

  if (!loadingSubs && submissions.length === 0) return null;

  return (
    <Card title="My Submissions" subtitle={submissions.length ? `${submissions.length} submission${submissions.length !== 1 ? "s" : ""}` : undefined}>
      {loadingSubs ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: NL.muted, fontSize: 13, padding: "12px 0", justifyContent: "center" }}><Spinner /> Loading…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {submissions.map(s => (
            <div key={s.id} style={{ borderRadius: 12, border: `1px solid ${editingId === s.id ? NL.accentBorder : NL.border}`, background: NL.elevated, overflow: "hidden", transition: "border-color 0.2s" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {s.thumbnailUrl
                    ? <img src={s.thumbnailUrl} alt={s.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "contain", imageRendering: "pixelated", background: NL.subtle, display: "block" }} />
                    : <div style={{ width: 44, height: 44, borderRadius: 8, background: NL.subtle, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📦</div>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: NL.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</p>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 3, flexWrap: "wrap" }}>
                    {s.category && <span style={{ fontSize: 10, color: "#60a5fa", fontWeight: 600, textTransform: "capitalize" }}>{s.category}</span>}
                    {s.tags?.slice(0, 3).map(t => (
                      <span key={t} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: NL.subtle, color: NL.muted, border: `1px solid ${NL.border}` }}>#{t}</span>
                    ))}
                    {(s.tags?.length ?? 0) > 3 && <span style={{ fontSize: 10, color: NL.muted }}>+{s.tags.length - 3}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                  <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: STATUS_BG[s.status] ?? NL.elevated, border: `1px solid ${STATUS_BORDER[s.status] ?? NL.border}`, color: STATUS_COLOR[s.status] ?? NL.muted, textTransform: "capitalize" }}>{s.status ?? "pending"}</span>
                  {s.status === "pending" && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => editingId === s.id ? cancelEdit() : startEdit(s)}
                        style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, border: `1px solid ${NL.borderMid}`, background: "transparent", color: NL.secondary, cursor: "pointer", fontFamily: font }}>
                        {editingId === s.id ? "Cancel" : "Edit"}
                      </button>
                      <button onClick={() => deleteSubmission(s.id)} disabled={deletingId === s.id}
                        style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, border: `1px solid ${NL.dangerBorder}`, background: NL.dangerDim, color: NL.danger, cursor: "pointer", fontFamily: font, opacity: deletingId === s.id ? 0.5 : 1 }}>
                        {deletingId === s.id ? "…" : "Withdraw"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {s.reviewNote && (
                <div style={{ padding: "8px 14px 10px", borderTop: `1px solid ${NL.border}`, background: s.status === "rejected" ? "rgba(248,113,113,0.05)" : "rgba(103,228,4,0.04)" }}>
                  <p style={{ margin: 0, fontSize: 11, color: NL.secondary, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 700, color: STATUS_COLOR[s.status] }}>Review note: </span>{s.reviewNote}
                  </p>
                </div>
              )}

              {editingId === s.id && (
                <div style={{ borderTop: `1px solid ${NL.accentBorder}`, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ flexShrink: 0 }}>
                      <Label>Thumbnail</Label>
                      <input ref={editThumbRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }}
                        onChange={e => { const f = e.target.files[0]; if (f) uploadEditThumb(f); }} />
                      <button type="button" onClick={() => editThumbRef.current?.click()} disabled={editThumbUploading}
                        style={{ width: 72, height: 72, borderRadius: 10, border: `2px dashed ${editThumbPreview ? NL.accentBorder : NL.borderMid}`, background: NL.subtle, cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, position: "relative" }}>
                        {editThumbPreview
                          ? <img src={editThumbPreview} style={{ width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }} />
                          : <span style={{ fontSize: 24 }}>📦</span>}
                        {editThumbUploading && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner size={16} /></div>}
                      </button>
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                      <div>
                        <Label required>Pack name</Label>
                        <input style={inputStyle} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} maxLength={80} />
                      </div>
                      <div>
                        <Label>Short description</Label>
                        <input style={inputStyle} value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} maxLength={200} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <Label>Category</Label>
                      <select style={{ ...inputStyle, appearance: "none" }} value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                        <option value="">Select category…</option>
                        {PACK_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label>Tags</Label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "6px 10px", borderRadius: 9, border: `1px solid ${NL.borderMid}`, background: NL.subtle, minHeight: 38 }}>
                        {editTags.map(t => (
                          <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, padding: "2px 7px", borderRadius: 5, background: NL.accentDim, border: `1px solid ${NL.accentBorder}`, color: NL.accent }}>
                            #{t}<button type="button" onClick={() => setEditTags(prev => prev.filter(x => x !== t))} style={{ background: "none", border: "none", cursor: "pointer", color: NL.muted, padding: 0, fontSize: 11, lineHeight: 1 }}>×</button>
                          </span>
                        ))}
                        {editTags.length < 8 && (
                          <input value={editTagInput} onChange={e => setEditTagInput(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addEditTag(editTagInput); } }}
                            onBlur={() => { if (editTagInput.trim()) addEditTag(editTagInput); }}
                            style={{ border: "none", background: "transparent", color: NL.text, fontSize: 12, outline: "none", fontFamily: font, minWidth: 80, flex: 1 }}
                            placeholder="Add tag…" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <Label>Website</Label>
                      <input style={inputStyle} value={editForm.creatorWebsite} onChange={e => setEditForm(f => ({ ...f, creatorWebsite: e.target.value }))} placeholder="https://…" maxLength={200} />
                    </div>
                    <div>
                      <Label>Discord invite</Label>
                      <input style={inputStyle} value={editForm.creatorDiscord} onChange={e => setEditForm(f => ({ ...f, creatorDiscord: e.target.value }))} placeholder="discord.gg/…" maxLength={100} />
                    </div>
                  </div>
                  <div>
                    <Label>Long description (Markdown)</Label>
                    <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={editForm.longDescription} onChange={e => setEditForm(f => ({ ...f, longDescription: e.target.value }))} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button type="button" onClick={cancelEdit}
                      style={{ fontSize: 12, padding: "8px 16px", borderRadius: 8, border: `1px solid ${NL.borderMid}`, background: "transparent", color: NL.secondary, cursor: "pointer", fontFamily: font }}>
                      Cancel
                    </button>
                    <button type="button" onClick={() => saveEdit(s.id)} disabled={saving || !editForm.name.trim()}
                      style={{ fontSize: 12, padding: "8px 16px", borderRadius: 8, border: "none", background: NL.accent, color: "#000", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: font, opacity: saving ? 0.6 : 1 }}>
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function SubmitPackSection() {
  const inputStyle = { padding: "9px 12px", borderRadius: 9, border: `1px solid ${NL.borderMid}`, background: NL.subtle, color: NL.text, fontSize: 13, fontFamily: font, outline: "none", width: "100%", boxSizing: "border-box" };

  const EMPTY = { name: "", description: "", category: "", tags: "", longDescription: "", creatorWebsite: "", creatorDiscord: "" };
  const [form, setForm] = useState(EMPTY);
  const [packFile, setPackFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);       // File object
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");   // after R2 upload
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [mdPreview, setMdPreview] = useState(false);
  const [ownershipConfirmed, setOwnershipConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const packFileRef = React.useRef();
  const thumbFileRef = React.useRef();

  function f(key, val) { setForm(p => ({ ...p, [key]: val })); }

  function addTag(e) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (t && !tags.includes(t) && tags.length < 8) setTags(prev => [...prev, t]);
      setTagInput("");
    }
  }

  function removeTag(t) { setTags(prev => prev.filter(x => x !== t)); }

  async function uploadThumbnail(file) {
    if (!file) return;
    setThumbnailUploading(true);
    setThumbnailPreview(URL.createObjectURL(file));
    try {
      const token = await fetchIdToken();
      const presignRes = await fetch(`${API_BASE}/api/featured-packs/thumbnail-presign`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ mime: file.type }),
      });
      const { uploadUrl, publicUrl } = await presignRes.json();
      if (!presignRes.ok) throw new Error("Presign failed");
      await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      setThumbnailUrl(publicUrl);
    } catch (e) {
      setThumbnailPreview(null);
      setResult({ ok: false, msg: "Thumbnail upload failed: " + e.message });
    } finally { setThumbnailUploading(false); }
  }

  const loadSubmissions = React.useCallback(async () => {
    setLoadingSubs(true);
    try {
      const token = await fetchIdToken();
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/featured-packs/my-submissions`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setSubmissions(d.submissions ?? []); }
    } catch (_) { }
    finally { setLoadingSubs(false); }
  }, []);

  useEffect(() => { loadSubmissions(); }, [loadSubmissions]);

  async function submit(e) {
    e.preventDefault();
    if (!packFile || !form.name.trim()) return;
    setSubmitting(true); setResult(null);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/featured-packs/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/octet-stream",
          "x-pack-name": form.name.trim(),
          "x-pack-description": form.description.trim(),
          "x-pack-thumbnail": thumbnailUrl,
          "x-pack-tags": tags.join(","),
          "x-pack-category": form.category,
          "x-pack-long-description": form.longDescription.trim(),
          "x-pack-creator-website": form.creatorWebsite.trim(),
          "x-pack-creator-discord": form.creatorDiscord.trim(),
        },
        body: packFile,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.status);
      setResult({ ok: true, msg: "Pack submitted successfully. An admin will review it within 48 hours." });
      setForm(EMPTY); setTags([]); setTagInput(""); setPackFile(null); setThumbnail(null); setThumbnailPreview(null); setThumbnailUrl(""); setOwnershipConfirmed(false);
      if (packFileRef.current) packFileRef.current.value = "";
      await loadSubmissions();
    } catch (err) {
      setResult({ ok: false, msg: err.message });
    } finally { setSubmitting(false); }
  }

  const canSubmit = !submitting && !thumbnailUploading && form.name.trim() && packFile && ownershipConfirmed;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      <MySubmissionsSection submissions={submissions} loadingSubs={loadingSubs} loadSubmissions={loadSubmissions} />

      <Card title="Submit a Resource Pack" subtitle="Featured packs are reviewed by an admin before going live">
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0 }}>
              <Label>Thumbnail</Label>
              <input ref={thumbFileRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }}
                onChange={e => { const f = e.target.files[0]; if (f) { setThumbnail(f); uploadThumbnail(f); } }} />
              <button type="button" onClick={() => thumbFileRef.current?.click()} disabled={thumbnailUploading}
                style={{ width: 88, height: 88, borderRadius: 12, border: `2px dashed ${thumbnailPreview ? NL.accentBorder : NL.borderMid}`, background: NL.subtle, cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, position: "relative" }}>
                {thumbnailPreview
                  ? <img src={thumbnailPreview} style={{ width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }} />
                  : <span style={{ fontSize: 28 }}>📦</span>
                }
                {thumbnailUploading && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner size={20} /></div>
                )}
              </button>
              <p style={{ fontSize: 10, color: NL.muted, margin: "4px 0 0", textAlign: "center", width: 88 }}>PNG · JPG</p>
              {thumbnailUrl && <p style={{ fontSize: 10, color: NL.success, margin: "2px 0 0", textAlign: "center", width: 88 }}>✓ Uploaded</p>}
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <Label required>Pack name</Label>
                <input value={form.name} onChange={e => f("name", e.target.value)} placeholder="e.g. Faithful 32x" maxLength={64} required style={inputStyle} />
              </div>
              <div>
                <Label>Short description</Label>
                <input value={form.description} onChange={e => f("description", e.target.value)} placeholder="One-liner shown on the pack card" maxLength={160} style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <Label>Category</Label>
              <select value={form.category} onChange={e => f("category", e.target.value)}
                style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
                <option value="">Select category…</option>
                {PACK_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <Label>Tags</Label>
              <div style={{ border: `1px solid ${NL.borderMid}`, borderRadius: 9, background: NL.subtle, padding: "6px 10px", display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center", minHeight: 40 }}>
                {tags.map(t => (
                  <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, padding: "2px 7px", borderRadius: 5, background: NL.accentDim, color: NL.accent, border: `1px solid ${NL.accentBorder}` }}>
                    {t}
                    <button type="button" onClick={() => removeTag(t)} style={{ background: "none", border: "none", cursor: "pointer", color: NL.accent, fontSize: 12, lineHeight: 1, padding: 0 }}>×</button>
                  </span>
                ))}
                {tags.length < 8 && (
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
                    placeholder={tags.length === 0 ? "Type tag, press Enter" : ""}
                    style={{ background: "none", border: "none", outline: "none", color: NL.text, fontSize: 12, fontFamily: font, minWidth: 80, flex: 1 }} />
                )}
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
              <Label>Long description (Markdown)</Label>
              <button type="button" onClick={() => setMdPreview(v => !v)}
                style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, border: `1px solid ${NL.border}`, background: NL.elevated, color: NL.secondary, cursor: "pointer", fontFamily: font }}>
                {mdPreview ? "Edit" : "Preview"}
              </button>
            </div>
            {mdPreview ? (
              <div style={{ minHeight: 120, padding: "10px 14px", borderRadius: 9, border: `1px solid ${NL.borderMid}`, background: NL.subtle, color: NL.text, fontSize: 13, lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: form.longDescription ? DOMPurify.sanitize(marked.parse(form.longDescription)) : "<em style='color:#4a5270'>Nothing to preview</em>" }} />
            ) : (
              <textarea value={form.longDescription} onChange={e => f("longDescription", e.target.value)}
                placeholder={"## About this pack\n\nDescribe your resource pack in detail. Markdown is supported.\n\n- Feature 1\n- Feature 2"}
                rows={7} style={{ ...inputStyle, resize: "vertical", minHeight: 120, fontFamily: mono, fontSize: 12 }} />
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <Label>Creator website</Label>
              <input value={form.creatorWebsite} onChange={e => f("creatorWebsite", e.target.value)}
                type="url" placeholder="https://yoursite.com" style={inputStyle} />
            </div>
            <div>
              <Label>Discord invite</Label>
              <input value={form.creatorDiscord} onChange={e => f("creatorDiscord", e.target.value)}
                placeholder="https://discord.gg/..." style={inputStyle} />
            </div>
          </div>

          <div style={{ padding: "14px 16px", borderRadius: 10, border: `1px dashed ${packFile ? NL.accentBorder : NL.borderMid}`, background: packFile ? NL.accentDim : NL.subtle }}>
            <Label required>Pack file (.mcpack or .zip)</Label>
            <input ref={packFileRef} type="file" accept=".mcpack,.zip" required style={{ display: "none" }} onChange={e => setPackFile(e.target.files[0] || null)} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button type="button" onClick={() => packFileRef.current?.click()}
                style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${NL.borderMid}`, background: NL.elevated, color: NL.secondary, fontSize: 12, fontFamily: font, cursor: "pointer", flexShrink: 0 }}>
                Choose file
              </button>
              <span style={{ fontSize: 13, color: packFile ? NL.text : NL.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {packFile ? `${packFile.name} (${(packFile.size / 1024 / 1024).toFixed(1)} MB)` : "No file chosen"}
              </span>
            </div>
          </div>

          <div
            onClick={() => setOwnershipConfirmed(v => !v)}
            style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", borderRadius: 10, border: `1px solid ${ownershipConfirmed ? NL.accentBorder : NL.borderMid}`, background: ownershipConfirmed ? NL.accentDim : NL.subtle, cursor: "pointer", userSelect: "none", transition: "border-color 0.15s, background 0.15s" }}
          >
            <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${ownershipConfirmed ? NL.accent : NL.borderMid}`, background: ownershipConfirmed ? NL.accent : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
              {ownershipConfirmed && <span style={{ color: "#000", fontSize: 11, fontWeight: 900, lineHeight: 1 }}>✓</span>}
            </div>
            <p style={{ margin: 0, fontSize: 12, color: NL.secondary, lineHeight: 1.6 }}>
              I confirm that I am the creator or rights holder of this resource pack, or that I have explicit permission from the creator to submit it. I understand that MCCompanion is not responsible for any copyright infringement and that submitting content I do not own may result in removal and account suspension.
            </p>
          </div>

          {result && (
            <div style={{ fontSize: 13, color: result.ok ? NL.success : NL.danger, background: result.ok ? "rgba(52,211,153,0.08)" : NL.dangerDim, border: `1px solid ${result.ok ? "rgba(52,211,153,0.22)" : NL.dangerBorder}`, borderRadius: 8, padding: "10px 14px" }}>
              {result.ok ? "✓ " : "⚠ "}{result.msg}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="submit" disabled={!canSubmit} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 9, border: "none", background: canSubmit ? NL.accent : NL.elevated, color: canSubmit ? "#000" : NL.muted, fontSize: 13, fontWeight: 700, fontFamily: font, cursor: canSubmit ? "pointer" : "not-allowed", transition: "opacity 0.15s" }}>
              {submitting ? <><Spinner size={13} /> Submitting…</> : "Submit for review"}
            </button>
            <span style={{ fontSize: 12, color: NL.muted }}>Reviewed within 48 hours · You'll be notified when approved or rejected</span>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function AccountPage() {
  const history = useHistory();
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [checking, setChecking] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileEdit, setProfileEdit] = useState({ displayName: "", bio: "" });
  const [profileDirty, setProfileDirty] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [inviteCopied, setInviteCopied] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarInputRef = React.useRef();

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
      setFirebaseUser(u);
      try {
        const token = await u.getIdToken();
        const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { history.replace("/login"); return; }
        const { roles: r } = await res.json();
        setRoles(r || []);
      } catch (_) { history.replace("/login"); return; }
      setChecking(false);
    });
    return () => unsub();
  }, []);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true); setProfileError(null);
    try {
      const token = await fetchIdToken(); if (!token) return;
      const res = await fetch(`${API_BASE}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { if (res.status === 403) { setProfile(null); return; } throw new Error(`${res.status}`); }
      const { user: u } = await res.json();
      setProfile(u);
      setProfileEdit({ displayName: u.displayName || "", bio: u.bio || "" });
      setProfileDirty(false);
    } catch (e) { setProfileError("Failed to load profile: " + e.message); }
    finally { setProfileLoading(false); }
  }, []);

  useEffect(() => { if (!checking) loadProfile(); }, [checking, loadProfile]);

  async function saveProfile() {
    setProfileSaving(true); setProfileError(null); setProfileSuccess(false);
    try {
      const token = await fetchIdToken(); if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ displayName: profileEdit.displayName.trim() || null, bio: profileEdit.bio.trim() || null }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const { user: u } = await res.json();
      setProfile(u);
      setProfileEdit({ displayName: u.displayName || "", bio: u.bio || "" });
      setProfileDirty(false); setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (e) { setProfileError("Failed to save: " + e.message); }
    finally { setProfileSaving(false); }
  }

  async function uploadAvatar(file) {
    if (!file) return;
    setAvatarError(null);
    setAvatarUploading(true);
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    try {
      const token = await fetchIdToken();

      const presignRes = await fetch(`${API_BASE}/api/users/me/avatar/presign`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ mime: file.type }),
      });
      const presignData = await presignRes.json();
      if (!presignRes.ok) throw new Error(presignData.message || `presign ${presignRes.status}`);

      const putRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error(`upload ${putRes.status}`);

      const confirmRes = await fetch(`${API_BASE}/api/users/me/avatar/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ r2Key: presignData.r2Key }),
      });
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) throw new Error(confirmData.message || `confirm ${confirmRes.status}`);
      setProfile(p => ({ ...p, avatarUrl: confirmData.avatarUrl }));
    } catch (e) {
      setAvatarError("Upload failed: " + e.message);
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
    }
  }

  async function removeAvatar() {
    if (!confirm("Remove your avatar?")) return;
    setAvatarError(null);
    setAvatarUploading(true);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/users/me/avatar`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      setProfile(p => ({ ...p, avatarUrl: null }));
      setAvatarPreview(null);
    } catch (e) {
      setAvatarError("Failed: " + e.message);
    } finally {
      setAvatarUploading(false);
    }
  }

  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    if (checking) return;
    Promise.all([
      fetchIdToken().then(t => t && fetch(`${API_BASE}/api/users/me/stats`, { headers: { Authorization: `Bearer ${t}` } }).then(r => r.ok ? r.json() : null)),
      fetchIdToken().then(t => t && fetch(`${API_BASE}/api/users/me/activity`, { headers: { Authorization: `Bearer ${t}` } }).then(r => r.ok ? r.json() : null)),
    ]).then(([s, a]) => {
      if (s?.stats) setStats(s.stats);
      if (a?.activity) setActivity(a.activity);
      setActivityLoading(false);
    }).catch(() => setActivityLoading(false));
  }, [checking]);

  const inputStyle = {
    padding: "9px 12px", borderRadius: 9, border: `1px solid ${NL.borderMid}`,
    background: NL.subtle, color: NL.text, fontSize: 13, fontFamily: font,
    outline: "none", width: "100%", boxSizing: "border-box", transition: "border-color 0.15s",
  };

  const TABS = [
    { id: "profile", label: "Profile" },
    { id: "account", label: "Account" },
    { id: "skins", label: "Cloud Skins" },
    { id: "packs", label: "Resource Packs" },
  ];
  const [activeTab, setActiveTab] = useState("profile");

  if (checking) return (
    <Layout>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: NL.bg }}>
        <Spinner size={24} />
      </div>
    </Layout>
  );

  const ACTIVITY_LABELS = {
    skin_upload: { icon: "🎨", label: "Uploaded skin", color: "#60a5fa" },
    pack_submitted: { icon: "📦", label: "Submitted pack", color: NL.secondary },
    pack_approved: { icon: "✅", label: "Pack approved", color: NL.success },
    pack_rejected: { icon: "❌", label: "Pack rejected", color: NL.danger },
    skin_liked: { icon: "❤️", label: "Skin got a like", color: "#f87171" },
  };

  function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  return (
    <Layout>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: "none" }} onChange={e => uploadAvatar(e.target.files[0])} />

      <div style={{ minHeight: "100vh", background: NL.bg, fontFamily: font }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: isMobile ? "24px 16px 60px" : "44px 24px 80px" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "260px 1fr", gap: 20, alignItems: "start" }}>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ background: NL.elevated, padding: "24px 20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, borderBottom: `1px solid ${NL.border}` }}>
                  <div style={{ position: "relative" }}>
                    {(avatarPreview || profile?.avatarUrl) ? (
                      <img src={avatarPreview || profile.avatarUrl} alt="avatar"
                        style={{ width: 88, height: 88, borderRadius: 22, objectFit: "cover", border: `2px solid ${NL.borderMid}`, display: "block" }}
                        onError={e => e.currentTarget.style.display = "none"} />
                    ) : (
                      <div style={{ width: 88, height: 88, borderRadius: 22, background: NL.accentDim, border: `2px solid ${NL.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700, color: NL.accent }}>
                        {(profile?.username || firebaseUser?.email || "?")[0].toUpperCase()}
                      </div>
                    )}
                    <button onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading}
                      style={{ position: "absolute", inset: 0, borderRadius: 22, background: "rgba(0,0,0,0.55)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s", fontSize: 11, color: "#fff", fontFamily: font, fontWeight: 700 }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                      {avatarUploading ? <Spinner size={16} /> : "Edit"}
                    </button>
                  </div>
                  {profile ? (
                    <>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: 18, fontWeight: 800, color: NL.text, margin: 0, fontFamily: mono, letterSpacing: "-0.02em" }}>{profile.username}</p>
                        {profile.displayName && <p style={{ fontSize: 13, color: NL.secondary, margin: "3px 0 0" }}>{profile.displayName}</p>}
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center" }}>
                        <Badge color="default">user</Badge>
                        {roles.map(r => <Badge key={r} color={r === "admin" ? "danger" : "accent"}>{r}</Badge>)}
                      </div>
                    </>
                  ) : profileLoading ? (
                    <div style={{ color: NL.muted }}><Spinner size={14} /></div>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 13, color: NL.secondary, margin: 0 }}>No app profile</p>
                      <a href="/register" style={{ fontSize: 12, color: NL.accent }}>Create one →</a>
                    </div>
                  )}
                </div>

                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {profile?.bio && (
                    <p style={{ fontSize: 12, color: NL.secondary, margin: 0, lineHeight: 1.6 }}>{profile.bio}</p>
                  )}
                  {profile?.createdAt && (
                    <p style={{ fontSize: 11, color: NL.muted, margin: 0 }}>
                      🗓 Member since {new Date(profile.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                  {profile && (
                    <button onClick={() => {
                      const url = `https://mccompanion.net/u?name=${profile.username}`;
                      if (navigator.share) navigator.share({ title: "My MCCompanion profile", url }).catch(() => { });
                      else navigator.clipboard.writeText(url).then(() => { setInviteCopied(true); setTimeout(() => setInviteCopied(false), 2000); });
                    }}
                      style={{ width: "100%", padding: "7px 0", borderRadius: 8, border: `1px solid ${inviteCopied ? NL.accentBorder : NL.borderMid}`, background: inviteCopied ? NL.accentDim : NL.elevated, color: inviteCopied ? NL.accent : NL.secondary, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}>
                      {inviteCopied ? "✓ Link copied!" : "Share profile"}
                    </button>
                  )}
                  {avatarError && <p style={{ fontSize: 11, color: NL.danger, margin: 0 }}>{avatarError}</p>}
                </div>
              </div>

              {stats && (
                <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 14 }}>
                  <div style={{ padding: "10px 14px", borderBottom: `1px solid ${NL.border}`, fontSize: 11, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Stats</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                    {[
                      { label: "Skins", value: stats.skinCount },
                      { label: "Skin likes", value: stats.skinLikes },
                      { label: "Packs submitted", value: stats.packSubmissionCount },
                      { label: "Packs approved", value: stats.packApprovedCount },
                    ].map(({ label, value }, i) => (
                      <div key={label} style={{ padding: "12px 14px", borderRight: i % 2 === 0 ? `1px solid ${NL.border}` : "none", borderBottom: i < 2 ? `1px solid ${NL.border}` : "none" }}>
                        <p style={{ fontSize: 20, fontWeight: 800, color: NL.accent, margin: 0, fontFamily: mono }}>{value}</p>
                        <p style={{ fontSize: 10, color: NL.muted, margin: "2px 0 0", lineHeight: 1.3 }}>{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${NL.border}`, fontSize: 11, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Recent activity</div>
                {activityLoading ? (
                  <div style={{ padding: "16px", display: "flex", justifyContent: "center", color: NL.muted }}><Spinner size={14} /></div>
                ) : activity.length === 0 ? (
                  <p style={{ padding: "14px 16px", fontSize: 12, color: NL.muted, margin: 0 }}>No activity yet.</p>
                ) : (
                  <div style={{ padding: "4px 0" }}>
                    {activity.map((ev, i) => {
                      const meta = ACTIVITY_LABELS[ev.type] ?? { icon: "•", label: ev.type, color: NL.muted };
                      return (
                        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 14px", borderBottom: i < activity.length - 1 ? `1px solid ${NL.border}` : "none" }}>
                          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{meta.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 11, color: meta.color, fontWeight: 600, margin: 0 }}>{meta.label}</p>
                            <p style={{ fontSize: 11, color: NL.secondary, margin: "1px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.name}</p>
                          </div>
                          <span style={{ fontSize: 10, color: NL.muted, flexShrink: 0, marginTop: 2 }}>{timeAgo(ev.createdAt)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div style={{ display: "flex", background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 18 }}>
                {TABS.filter(t => (t.id !== "skins" && t.id !== "packs") || profile).map(tab => {
                  const active = activeTab === tab.id;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      style={{ flex: 1, padding: "11px 8px", background: active ? NL.accent : "transparent", border: "none", borderRight: `1px solid ${NL.border}`, color: active ? "#000" : NL.muted, fontSize: isMobile ? 11 : 12, fontWeight: active ? 700 : 500, cursor: "pointer", fontFamily: font, transition: "background 0.15s, color 0.15s", whiteSpace: "nowrap" }}>
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {activeTab === "profile" && (
                  !profile ? (
                    <Card>
                      <div style={{ textAlign: "center", padding: "24px 0" }}>
                        <p style={{ fontSize: 13, color: NL.secondary, margin: "0 0 6px" }}>No app account found.</p>
                        <p style={{ fontSize: 12, color: NL.muted, margin: 0 }}>Download the MCCompanion app or <a href="/register" style={{ color: NL.accent }}>register via the website</a> to create a profile.</p>
                      </div>
                    </Card>
                  ) : (
                    <Card title="Edit profile">
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div>
                          <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: NL.muted, marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Display name</label>
                          <input value={profileEdit.displayName} onChange={e => { setProfileEdit(p => ({ ...p, displayName: e.target.value })); setProfileDirty(true); }} placeholder="Optional display name…" maxLength={32} style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: NL.muted, marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Bio</label>
                          <textarea value={profileEdit.bio} onChange={e => { setProfileEdit(p => ({ ...p, bio: e.target.value })); setProfileDirty(true); }} placeholder="Tell something about yourself…" maxLength={200} rows={3} style={{ ...inputStyle, resize: "vertical", minHeight: 72 }} />
                          <p style={{ fontSize: 10, color: NL.muted, margin: "4px 0 0", textAlign: "right" }}>{(profileEdit.bio || "").length}/200</p>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: NL.muted, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>Avatar</label>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading}
                              style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, border: `1px solid ${NL.border}`, background: NL.elevated, color: NL.secondary, cursor: "pointer", fontFamily: font }}>
                              {avatarUploading ? <><Spinner size={12} /> Uploading…</> : "Upload photo"}
                            </button>
                            {(profile.avatarUrl || avatarPreview) && (
                              <button onClick={removeAvatar} disabled={avatarUploading}
                                style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, border: `1px solid ${NL.dangerBorder}`, background: NL.dangerDim, color: NL.danger, cursor: "pointer", fontFamily: font }}>
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                        {profileError && <p style={{ fontSize: 11, color: NL.danger, background: NL.dangerDim, border: `1px solid ${NL.dangerBorder}`, borderRadius: 6, padding: "8px 10px", margin: 0 }}>⚠ {profileError}</p>}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Btn onClick={saveProfile} disabled={!profileDirty || profileSaving} size="sm">
                            {profileSaving ? <><Spinner size={12} /> Saving…</> : "Save changes"}
                          </Btn>
                          {profileSuccess && <span style={{ fontSize: 12, color: NL.success }}>✓ Saved</span>}
                        </div>
                      </div>
                    </Card>
                  )
                )}

                {activeTab === "account" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Card title="Account details">
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {[
                          { label: "Email", value: firebaseUser?.email, mono: true },
                          { label: "UID", value: firebaseUser?.uid, mono: true, small: true },
                          { label: "Roles", value: null },
                        ].map(({ label, value, mono: isMono, small }, i, arr) => (
                          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${NL.border}` : "none" }}>
                            <span style={{ fontSize: 12, color: NL.muted }}>{label}</span>
                            {value !== null && value !== undefined
                              ? <span style={{ fontSize: small ? 11 : 13, color: NL.text, fontFamily: isMono ? mono : font, wordBreak: "break-all", textAlign: "right", marginLeft: 16 }}>{value}</span>
                              : <div style={{ display: "flex", gap: 4 }}>
                                <Badge color="default">user</Badge>
                                {roles.map(r => <Badge key={r} color={r === "admin" ? "danger" : "accent"}>{r}</Badge>)}
                              </div>
                            }
                          </div>
                        ))}
                      </div>
                    </Card>
                    {profile && (
                      <Card title="Minecraft accounts" subtitle="Linked via the MCCompanion app">
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                          {[{
                            label: "Java Edition", accounts: profile.javaAccounts, renderItem: a => (
                              <div key={a.javaUuid} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: NL.elevated, border: `1px solid ${NL.border}` }}>
                                <img src={`https://crafatar.com/avatars/${a.javaUuid}?size=32&overlay`} alt={a.javaUsername} style={{ width: 36, height: 36, borderRadius: 8, imageRendering: "pixelated", flexShrink: 0 }} onError={e => e.currentTarget.style.display = "none"} />
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontSize: 13, fontWeight: 600, color: NL.text, margin: 0 }}>{a.javaUsername}</p>
                                  <p style={{ fontFamily: mono, fontSize: 10, color: NL.muted, margin: 0 }}>{a.javaUuid}</p>
                                </div>
                              </div>
                            )
                          }, {
                            label: "Bedrock Edition", accounts: profile.bedrockAccounts, renderItem: a => (
                              <div key={a.xboxXuid} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: NL.elevated, border: `1px solid ${NL.border}` }}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: NL.elevated, border: `1px solid ${NL.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎮</div>
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontSize: 13, fontWeight: 600, color: NL.text, margin: 0 }}>{a.xboxGamertag}</p>
                                  <p style={{ fontFamily: mono, fontSize: 10, color: NL.muted, margin: 0 }}>XUID: {a.xboxXuid}</p>
                                </div>
                              </div>
                            )
                          }].map(({ label, accounts, renderItem }) => (
                            <div key={label}>
                              <p style={{ fontSize: 11, fontWeight: 700, color: NL.muted, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
                              {(accounts || []).length === 0
                                ? <p style={{ fontSize: 13, color: NL.muted, margin: 0 }}>No {label.split(" ")[0]} account linked.</p>
                                : <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{(accounts || []).map(renderItem)}</div>
                              }
                            </div>
                          ))}
                          <p style={{ fontSize: 11, color: NL.muted, margin: 0 }}>Link accounts via the MCCompanion app.</p>
                        </div>
                      </Card>
                    )}
                  </div>
                )}

                {activeTab === "skins" && profile && <MySkinsSection username={profile.username} />}
                {activeTab === "packs" && profile && <SubmitPackSection />}
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
