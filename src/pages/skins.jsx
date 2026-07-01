import { useState, useRef, useCallback, useEffect } from "react";
import Layout from "@theme/Layout";
import { useAuth } from "../useAuth";
import CommentsSection from "../components/CommentsSection";
import { C, font, API, UNDO_LIMIT, DEBOUNCE_MS, CANVAS_SIZE, DISPLAY_SIZE, SKIN_REGIONS, STEVE_SKIN_URL, Btn, Tag, SkinViewer3D, SkinViewerFrontBack, LiveSkinViewer3D, UVEditor, EditorTab } from "../components/SkinEditor";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function SkinCard({ skin: initialSkin, onEdit, onDelete, isOwn, idToken, initialLiked = false, currentUsername = null }) {
  const [deleting, setDeleting] = useState(false);
  const [likes, setLikes] = useState(initialSkin.like_count ?? 0);
  const [liked, setLiked] = useState(initialLiked);
  const [liking, setLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const lastLike = useRef(0);

  async function download() {
    const res = await fetch(initialSkin.public_url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${initialSkin.name || "skin"}.png`;
    a.click();
  }

  async function toggleLike() {
    if (!idToken || liking || Date.now() - lastLike.current < 2000) return;
    lastLike.current = Date.now();
    setLiking(true);
    try {
      const res = await fetch(`${API}/api/skins/${initialSkin.id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const d = await res.json();
        setLiked(d.liked);
        setLikes(d.like_count);
      }
    } catch (_) { }
    setLiking(false);
  }

  const commentCount = initialSkin.comment_count ?? 0;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", transition: "border-color .2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.accentBorder}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>

      <div style={{ background: C.elevated, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 0", minHeight: 160 }}>
        <SkinViewerFrontBack skinUrl={initialSkin.public_url} scale={4} />
      </div>

      {initialSkin.username && !isOwn && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px 0" }}>
          {initialSkin.avatar_url ? (
            <img src={initialSkin.avatar_url} alt={initialSkin.username} style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} onError={e => e.currentTarget.style.display = "none"} />
          ) : (
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.accentDim, border: `1px solid ${C.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: C.accent, flexShrink: 0 }}>
              {(initialSkin.username || "?")[0].toUpperCase()}
            </div>
          )}
          <a href={`/u?name=${initialSkin.username}`} style={{ fontSize: 11, fontWeight: 600, color: C.accent, textDecoration: "none", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {initialSkin.display_name || initialSkin.username}
          </a>
          <span style={{ fontSize: 10, color: C.muted, flexShrink: 0 }}>{timeAgo(initialSkin.created_at)}</span>
        </div>
      )}

      <div style={{ padding: "8px 12px 10px", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 6 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
          {initialSkin.name || "Unnamed"}
        </p>
        {isOwn && initialSkin.created_at && <span style={{ fontSize: 10, color: C.muted, flexShrink: 0 }}>{timeAgo(initialSkin.created_at)}</span>}
      </div>

      <div onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", borderTop: `1px solid ${C.border}`, marginTop: "auto" }}>
        <button onClick={download} title="Download" style={{ flex: 1, padding: "10px 0", background: "transparent", border: "none", borderRight: `1px solid ${C.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.secondary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        </button>
        {!isOwn && (
          <button onClick={toggleLike} disabled={liking} title={liked ? "Unlike" : "Like"} style={{ padding: "10px 0", flex: 1, background: "transparent", border: "none", borderRight: `1px solid ${C.border}`, cursor: idToken ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? "#f87171" : "none"} stroke={liked ? "#f87171" : C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            {likes > 0 && <span style={{ fontSize: 11, color: liked ? "#f87171" : C.muted, fontFamily: font }}>{likes}</span>}
          </button>
        )}
        <button onClick={() => setShowComments(true)} title="Comments" style={{ padding: "10px 0", flex: 1, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 3, borderRight: `1px solid ${C.border}` }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={commentCount > 0 ? C.secondary : C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          {commentCount > 0 && <span style={{ fontSize: 11, color: C.secondary, fontFamily: font }}>{commentCount}</span>}
        </button>
        <button onClick={() => onEdit(initialSkin)} title={isOwn ? "Edit" : "Edit as template"} style={{ padding: "10px 0", flex: 1, background: "transparent", border: "none", borderRight: isOwn ? `1px solid ${C.border}` : "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
        </button>
        {isOwn && (
          <button disabled={deleting} title="Delete" onClick={async () => { if (!confirm(`Delete "${initialSkin.name}"?`)) return; setDeleting(true); await onDelete(initialSkin.id); setDeleting(false); }}
            style={{ padding: "10px 0", flex: 1, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: deleting ? 0.4 : 1 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
          </button>
        )}
      </div>

      {showComments && (
        <div onClick={e => e.stopPropagation()}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onMouseDown={e => { if (e.target === e.currentTarget) setShowComments(false); }}>
          <div style={{ background: C.surface, border: `1px solid ${C.borderMid}`, borderRadius: 18, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <SkinViewer3D skinUrl={initialSkin.public_url} scale={4} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{initialSkin.name || "Unnamed"}</p>
                {initialSkin.username && <a href={`/u?name=${initialSkin.username}`} style={{ fontSize: 12, color: C.accent, textDecoration: "none" }}>by {initialSkin.display_name || initialSkin.username}</a>}
              </div>
              <button onClick={() => setShowComments(false)} style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", color: C.secondary, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
            </div>
            <CommentsSection
              targetType="skin"
              targetId={initialSkin.id}
              currentUsername={currentUsername}
              getToken={async () => { const { fetchIdToken } = await import("../firebaseAuthHelpers"); return fetchIdToken(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function GalleryTab({ user, idToken, onEditSkin }) {
  const [publicSkins, setPublicSkins] = useState([]);
  const [topSkins, setTopSkins] = useState([]);
  const [mySkins, setMySkins] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [loadingPublic, setLoadingPublic] = useState(true);
  const [loadingMine, setLoadingMine] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoadingPublic(true);
    fetch(`${API}/api/skins/gallery`)
      .then(r => r.json())
      .then(d => {
        setPublicSkins(d.recent || []);
        setTopSkins(d.top || []);
        setLoadingPublic(false);
      })
      .catch(() => { setError("Failed to load skins."); setLoadingPublic(false); });
  }, []);

  useEffect(() => {
    if (!user || !idToken) { setLikedIds(new Set()); return; }
    setLoadingMine(true);
    fetch(`${API}/api/skins/me/dashboard`, { headers: { Authorization: `Bearer ${idToken}` } })
      .then(r => r.json())
      .then(d => {
        setMySkins(d.skins || []);
        setLikedIds(new Set(d.liked || []));
        setLoadingMine(false);
      })
      .catch(() => setLoadingMine(false));
  }, [user, idToken]);

  async function deleteSkin(skinId) {
    await fetch(`${API}/api/skins/me/${skinId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    setMySkins(prev => prev.filter(s => s.id !== skinId));
    setPublicSkins(prev => prev.filter(s => s.id !== skinId));
  }

  const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 14 };

  function SectionHeader({ emoji, title, sub }) {
    return (
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
        <h2 style={{ fontFamily: font, color: C.text, fontSize: 17, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{emoji} {title}</h2>
        {sub && <span style={{ fontSize: 11, color: C.muted }}>{sub}</span>}
      </div>
    );
  }

  const newSkins = [...publicSkins].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8);
  const weekAgo = Date.now() - 7 * 86400_000;
  const hotSkins = topSkins.filter(s => new Date(s.created_at || s.createdAt).getTime() > weekAgo).slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      {error && <div style={{ background: C.dangerDim, border: `1px solid ${C.dangerBorder}`, borderRadius: 10, padding: 12 }}><p style={{ fontFamily: font, color: C.danger, margin: 0 }}>{error}</p></div>}

      {user && mySkins.length > 0 && (
        <section>
          <SectionHeader emoji="🎨" title="My Cloud Skins" sub={`${mySkins.length} skin${mySkins.length !== 1 ? "s" : ""}`} />
          <div style={grid}>
            {mySkins.map(s => <SkinCard key={s.id} skin={s} isOwn onEdit={onEditSkin} onDelete={deleteSkin} currentUsername={user?.username} />)}
          </div>
        </section>
      )}

      {hotSkins.length > 0 && (
        <section>
          <SectionHeader emoji="🔥" title="Hot this week" sub="Most liked in the last 7 days" />
          <div style={{ ...grid, gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
            {hotSkins.map(s => <SkinCard key={s.id} skin={s} isOwn={user && s.uid === user.uid} onEdit={onEditSkin} onDelete={deleteSkin} idToken={idToken} initialLiked={likedIds.has(s.id)} currentUsername={user?.username} />)}
          </div>
        </section>
      )}

      {!loadingPublic && newSkins.length > 0 && (
        <section>
          <SectionHeader emoji="✨" title="Newest uploads" sub="Just added by the community" />
          <div style={grid}>
            {newSkins.map(s => <SkinCard key={s.id} skin={s} isOwn={user && s.uid === user.uid} onEdit={onEditSkin} onDelete={deleteSkin} idToken={idToken} initialLiked={likedIds.has(s.id)} currentUsername={user?.username} />)}
          </div>
        </section>
      )}

      {topSkins.length > 0 && (
        <section>
          <SectionHeader emoji="🏆" title="Most liked" sub="All time top skins" />
          <div style={grid}>
            {topSkins.slice(0, 12).map(s => <SkinCard key={s.id} skin={s} isOwn={user && s.uid === user.uid} onEdit={onEditSkin} onDelete={deleteSkin} idToken={idToken} initialLiked={likedIds.has(s.id)} currentUsername={user?.username} />)}
          </div>
        </section>
      )}

      <section>
        <SectionHeader emoji="🌍" title="All skins" sub={`${publicSkins.length} community skins`} />
        {loadingPublic ? (
          <p style={{ fontFamily: font, color: C.muted }}>Loading…</p>
        ) : publicSkins.length === 0 ? (
          <p style={{ fontFamily: font, color: C.muted }}>No public skins yet.</p>
        ) : (
          <div style={grid}>
            {publicSkins.map(s => <SkinCard key={s.id} skin={s} isOwn={user && s.uid === user.uid} onEdit={onEditSkin} onDelete={deleteSkin} idToken={idToken} initialLiked={likedIds.has(s.id)} currentUsername={user?.username} />)}
          </div>
        )}
      </section>
    </div>
  );
}


function UploadTab({ user, idToken, onSaved }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  function handleFile(f) {
    if (!f) return;
    if (f.type !== "image/png") { setError("Only PNG files are supported."); return; }
    const img = new Image();
    const url = URL.createObjectURL(f);
    img.onload = () => {
      const validSizes = [[64, 64], [64, 32], [128, 128], [128, 64]];
      if (!validSizes.some(([w, h]) => img.width === w && img.height === h)) {
        setError(`Expected 64×64 or 64×32 pixels, got ${img.width}×${img.height}.`);
        URL.revokeObjectURL(url);
        return;
      }
      if (img.width === 128) {
        const c = document.createElement("canvas");
        c.width = 64; c.height = img.height === 128 ? 64 : 32;
        const ctx = c.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, 64, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(blob => handleFile(blob), "image/png");
        return;
      }
      if (img.height === 32) {
        const c = document.createElement("canvas");
        c.width = 64; c.height = 64;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0);
        [[0, 16, 16, 48], [40, 32, 16, 48]].forEach(([sx, dx, w, dy]) => {
          ctx.save();
          ctx.translate(dx + w, dy);
          ctx.scale(-1, 1);
          ctx.drawImage(c, sx, 16, w, 16, 0, 0, w, 16);
          ctx.restore();
        });
        c.toBlob(blob => {
          setFile(blob);
          setPreview(c.toDataURL());
          setError(null);
          if (!name) setName((f.name || "").replace(/\.png$/i, "") || "My Skin");
        }, "image/png");
      } else {
        setFile(f);
        setPreview(url);
        setError(null);
        if (!name) setName((f.name || "").replace(/\.png$/i, "") || "My Skin");
      }
    };
    img.src = url;
  }

  async function doUpload() {
    if (!file || !name.trim()) return;
    setUploading(true);
    setError(null);
    try {
      const { fetchIdToken } = await import("../firebaseAuthHelpers");
      const token = await fetchIdToken(true) || idToken;

      const presignRes = await fetch(`${API}/api/skins/me/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!presignRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, r2Key } = await presignRes.json();

      const putRes = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": "image/png" } });
      if (!putRes.ok) throw new Error("Upload failed");

      const confirmRes = await fetch(`${API}/api/skins/me/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ r2Key, name: name.trim(), isPublic }),
      });
      if (!confirmRes.ok) throw new Error("Failed to confirm upload");

      setSuccess(true);
      setFile(null);
      setPreview(null);
      setName("");
      setTimeout(() => setSuccess(false), 3000);
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  if (!user) return (
    <div style={{ textAlign: "center", padding: 60, color: C.secondary, fontFamily: font }}>
      Sign in to upload skins.
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      <h3 style={{ fontFamily: font, color: C.text, fontWeight: 700, fontSize: 18, margin: 0 }}>Upload Skin PNG</h3>

      <label style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 12, padding: 40, borderRadius: 14, cursor: "pointer",
        border: `2px dashed ${preview ? C.accent : C.border}`,
        background: C.surface, transition: "border-color .2s",
      }}>
        {preview ? (
          <img src={preview} alt="preview" style={{ width: 128, height: 128, imageRendering: "pixelated", borderRadius: 8 }} />
        ) : (
          <>
            <span style={{ fontSize: 40 }}>📂</span>
            <span style={{ fontFamily: font, color: C.secondary, fontSize: 14 }}>Click to select a 64×64 skin PNG</span>
          </>
        )}
        <input type="file" accept="image/png" style={{ display: "none" }}
          onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
      </label>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontFamily: font, fontSize: 13, color: C.secondary }}>Skin name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="My Skin"
          maxLength={64}
          style={{
            fontFamily: font, fontSize: 14, padding: "9px 12px",
            borderRadius: 8, border: `1px solid ${C.border}`,
            background: C.elevated, color: C.text, outline: "none",
          }}
        />
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontFamily: font, color: C.secondary, fontSize: 14 }}>
        <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
        Show in public gallery
      </label>

      {error && <p style={{ fontFamily: font, color: C.danger, fontSize: 13, margin: 0 }}>{error}</p>}
      {success && <p style={{ fontFamily: font, color: C.accent, fontSize: 13, margin: 0 }}>✓ Skin uploaded successfully!</p>}

      <Btn variant="accent" onClick={doUpload} disabled={!file || !name.trim() || uploading}
        style={{ justifyContent: "center" }}>
        {uploading ? "Uploading…" : "☁ Upload to Cloud"}
      </Btn>
    </div>
  );
}

export default function SkinsPage() {
  const { user, idToken } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [galleryKey, setGalleryKey] = useState(0);

  function handleEditSkin(skin) {
    window.location.href = `/skin-editor?skin=${skin.id}`;
  }

  function handleSkinSaved() {
    setGalleryKey(k => k + 1);
    setShowUpload(false);
  }

  return (
    <Layout title="Skins">
      <div style={{ background: C.bg, minHeight: "100vh", fontFamily: font }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, gap: 16, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ color: C.text, fontSize: 28, fontWeight: 800, margin: 0, marginBottom: 6 }}>Skins</h1>
              <p style={{ color: C.secondary, fontSize: 15, margin: 0 }}>Browse community skins or create your own.</p>
            </div>
            {user && (
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => setShowUpload(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: `1px solid ${C.borderMid}`, background: C.elevated, color: C.secondary, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                  Upload PNG
                </button>
                <a href="/skin-editor"
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: "none", background: C.accent, color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, textDecoration: "none" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                  Create skin
                </a>
              </div>
            )}
          </div>

          <GalleryTab key={galleryKey} user={user} idToken={idToken} onEditSkin={handleEditSkin} />
        </div>

        {showUpload && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onMouseDown={e => { if (e.target === e.currentTarget) setShowUpload(false); }}>
            <div style={{ background: C.surface, border: `1px solid ${C.borderMid}`, borderRadius: 18, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>Upload skin</h2>
                <button onClick={() => setShowUpload(false)} style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", color: C.secondary, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✕</button>
              </div>
              <UploadTab user={user} idToken={idToken} onSaved={handleSkinSaved} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
