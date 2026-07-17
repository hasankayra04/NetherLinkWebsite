import React, { useState, useEffect, useRef } from "react";
import { API_BASE } from "../lib/api";
import { T } from "../lib/tokens";
import { timeAgo } from "../lib/date-utils";

const NL = {
  ...T,
  elevated: T.raised,
  subtle: "#1f2635",
  secondary: T.sub,
  accent: T.green,
  accentDim: "rgba(103,228,4,0.10)",
  accentBorder: "rgba(103,228,4,0.22)",
  danger: T.red,
  dangerDim: "rgba(248,113,113,0.08)",
  dangerBorder: "rgba(248,113,113,0.22)",
};
const font = "'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'Fira Code', monospace";

export default function CommentsSection({ targetType, targetId, currentUsername: usernameProp, getToken }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [resolvedUsername, setResolvedUsername] = useState(usernameProp ?? null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reportingId, setReportingId] = useState(null);
  const [reportedIds, setReportedIds] = useState(new Set());
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!getToken) return;
    getToken().then(token => {
      if (!token) return;
      fetch(`${API_BASE}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d?.user?.username && !usernameProp) setResolvedUsername(d.user.username);
          if (d?.isAdmin === true) setIsAdmin(true);
        })
        .catch(() => { });
    }).catch(() => { });
  }, []);

  const currentUsername = resolvedUsername;

  useEffect(() => {
    if (!targetId) return;
    setLoading(true);
    fetch(`${API_BASE}/api/comments/${targetType}/${encodeURIComponent(targetId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.comments) setComments(d.comments); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [targetType, targetId]);

  async function post() {
    const text = input.trim();
    if (!text || posting) return;
    setPosting(true); setError(null);
    try {
      const token = await getToken();
      if (!token) { setError("Log in to comment"); setPosting(false); return; }
      const res = await fetch(`${API_BASE}/api/comments/${targetType}/${encodeURIComponent(targetId)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to post"); return; }
      setComments(p => [...p, data.comment]);
      setInput("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch { setError("Something went wrong"); }
    finally { setPosting(false); }
  }

  async function remove(id, asAdmin = false) {
    if (asAdmin && !confirm("Delete this comment as admin?")) return;
    setDeletingId(id);
    try {
      const token = await getToken();
      if (!token) return;
      const path = asAdmin ? `${API_BASE}/api/comments/admin/${id}` : `${API_BASE}/api/comments/${id}`;
      await fetch(path, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setComments(p => p.filter(c => c.id !== id));
    } catch { }
    setDeletingId(null);
  }

  async function report(c, reason) {
    setReportingId(null);
    try {
      const token = await getToken();
      if (!token) { setError("Log in to report"); return; }
      const res = await fetch(`${API_BASE}/api/reports`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedUsername: c.username,
          reason,
          additionalInfo: `Comment on ${targetType} ${targetId}: "${c.content.slice(0, 200)}"`,
        }),
      });
      if (res.ok) setReportedIds(prev => new Set(prev).add(c.id));
      else {
        const d = await res.json().catch(() => ({}));
        setError(d.message || "Report failed");
      }
    } catch { setError("Report failed"); }
  }

  return (
    <div style={{ borderTop: `1px solid ${NL.border}`, paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
        Comments {comments.length > 0 && `(${comments.length})`}
      </p>

      {loading ? (
        <p style={{ fontSize: 12, color: NL.muted, margin: 0 }}>Loading…</p>
      ) : comments.length === 0 ? (
        <p style={{ fontSize: 12, color: NL.muted, margin: 0 }}>No comments yet. Be the first!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto", paddingRight: 4 }}>
          {comments.map(c => (
            <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              {c.avatarUrl ? (
                <img src={c.avatarUrl} alt={c.username} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} onError={e => e.currentTarget.style.display = "none"} />
              ) : (
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: NL.accentDim, border: `1px solid ${NL.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#67e404", flexShrink: 0 }}>
                  {(c.username || "?")[0].toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0, background: NL.elevated, border: `1px solid ${NL.border}`, borderRadius: "4px 12px 12px 12px", padding: "7px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <a href={`/u?name=${c.username}`} style={{ fontSize: 11, fontWeight: 700, color: "#67e404", textDecoration: "none", fontFamily: mono }}>{c.username}</a>
                  <span style={{ fontSize: 10, color: NL.muted }}>{timeAgo(c.createdAt)}</span>
                  <span style={{ marginLeft: "auto", display: "inline-flex", gap: 8 }}>
                    {c.username !== currentUsername && (
                      reportedIds.has(c.id) ? (
                        <span style={{ fontSize: 10, color: NL.muted }}>Reported ✓</span>
                      ) : (
                        <button onClick={() => setReportingId(reportingId === c.id ? null : c.id)}
                          style={{ fontSize: 10, color: NL.muted, background: "none", border: "none", cursor: "pointer", padding: "0 2px", fontFamily: font }}
                          onMouseEnter={e => e.currentTarget.style.color = "#fbbf24"}
                          onMouseLeave={e => e.currentTarget.style.color = NL.muted}>
                          Report
                        </button>
                      )
                    )}
                    {(c.username === currentUsername || isAdmin) && (
                      <button onClick={() => remove(c.id, c.username !== currentUsername)} disabled={deletingId === c.id}
                        style={{ fontSize: 10, color: c.username !== currentUsername ? NL.danger : NL.muted, background: "none", border: "none", cursor: "pointer", padding: "0 2px", fontFamily: font, opacity: deletingId === c.id ? 0.4 : 1 }}
                        onMouseEnter={e => e.currentTarget.style.color = NL.danger}
                        onMouseLeave={e => e.currentTarget.style.color = c.username !== currentUsername ? NL.danger : NL.muted}>
                        {c.username !== currentUsername ? "Delete (admin)" : "Delete"}
                      </button>
                    )}
                  </span>
                </div>
                {reportingId === c.id && (
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", margin: "2px 0 6px" }}>
                    {["spam", "harassment", "inappropriate", "other"].map(r => (
                      <button key={r} onClick={() => report(c, r)}
                        style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 999, border: `1px solid ${NL.borderMid}`, background: NL.subtle, color: NL.secondary, cursor: "pointer", fontFamily: font, textTransform: "capitalize" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#fbbf24"; e.currentTarget.style.color = "#fbbf24"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = NL.borderMid; e.currentTarget.style.color = NL.secondary; }}>
                        {r}
                      </button>
                    ))}
                  </div>
                )}
                <p style={{ margin: 0, fontSize: 13, color: NL.text, lineHeight: 1.5, wordBreak: "break-word" }}>{c.content}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {getToken && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); post(); } }}
              placeholder={currentUsername ? "Write a comment… (Enter to post)" : "Log in to comment"}
              disabled={!currentUsername || posting}
              maxLength={500}
              rows={2}
              style={{ flex: 1, padding: "8px 12px", borderRadius: 9, border: `1px solid ${NL.borderMid}`, background: NL.subtle, color: NL.text, fontSize: 13, fontFamily: font, outline: "none", resize: "none", lineHeight: 1.5, opacity: currentUsername ? 1 : 0.5 }} />
            <button onClick={post} disabled={!input.trim() || !currentUsername || posting}
              style={{ alignSelf: "flex-end", padding: "8px 16px", borderRadius: 8, border: "none", background: input.trim() && currentUsername ? "#67e404" : NL.elevated, color: input.trim() && currentUsername ? "#000" : NL.muted, fontSize: 13, fontWeight: 700, cursor: input.trim() && currentUsername ? "pointer" : "default", fontFamily: font, transition: "all 0.15s", flexShrink: 0 }}>
              {posting ? "…" : "Post"}
            </button>
          </div>
          {error && <p style={{ margin: 0, fontSize: 11, color: NL.danger }}>{error}</p>}
          {input.length > 400 && <p style={{ margin: 0, fontSize: 10, color: NL.muted, textAlign: "right" }}>{input.length}/500</p>}
        </div>
      )}
    </div>
  );
}
