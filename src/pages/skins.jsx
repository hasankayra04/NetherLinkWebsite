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

function SkinDetailModal({ skin, onClose, onEdit, onDelete, isOwn, idToken, currentUsername }) {
  const [deleting, setDeleting] = useState(false);
  const [likes, setLikes] = useState(skin.like_count ?? 0);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const lastLike = useRef(0);

  async function download(e) {
    e && e.stopPropagation();
    const res = await fetch(skin.public_url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${skin.name || "skin"}.png`;
    a.click();
  }

  async function toggleLike(e) {
    e && e.stopPropagation();
    if (!idToken || liking || Date.now() - lastLike.current < 2000) return;
    lastLike.current = Date.now();
    setLiking(true);
    try {
      const res = await fetch(`${API}/api/skins/${skin.id}/like`, { method: "POST", headers: { Authorization: `Bearer ${idToken}` } });
      if (res.ok) { const d = await res.json(); setLiked(d.liked); setLikes(d.like_count); }
    } catch (_) { }
    setLiking(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: C.surface, border: `1px solid ${C.borderMid}`, borderRadius: 20, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>

        <div style={{ position: "relative", background: "linear-gradient(135deg, #0a1a08 0%, #0d1117 60%, #0a1a10 100%)", borderRadius: "20px 20px 0 0", padding: "32px 24px 24px", display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 30% 50%, rgba(103,228,4,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(52,211,153,0.05) 0%, transparent 50%)", pointerEvents: "none" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, cursor: "pointer", color: "rgba(255,255,255,0.5)", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✕</button>
          <div style={{ position: "relative", zIndex: 1, background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 16px" }}>
            <SkinViewer3D skinUrl={skin.public_url} scale={5} />
          </div>
          <div style={{ position: "relative", zIndex: 1, textAlign: "center", marginTop: 16 }}>
            <p style={{ margin: "0 0 6px", fontWeight: 900, fontSize: 22, color: "#fff", letterSpacing: "-0.02em" }}>{skin.name || "Unnamed"}</p>
            {skin.username && (
              <a href={`/u?name=${skin.username}`} style={{ fontSize: 12, color: "rgba(103,228,4,0.9)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(103,228,4,0.2)", border: "1px solid rgba(103,228,4,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#67e404" }}>
                  {(skin.username || "?")[0].toUpperCase()}
                </div>
                {skin.display_name || skin.username}
              </a>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, padding: "14px 20px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
          {!isOwn && (
            <button onClick={toggleLike} disabled={liking} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: `1px solid ${liked ? "rgba(248,113,113,0.5)" : C.border}`, background: liked ? "rgba(248,113,113,0.12)" : C.elevated, cursor: idToken ? "pointer" : "default", color: liked ? "#f87171" : C.secondary, fontSize: 13, fontWeight: 700, transition: "all 0.15s" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? "#f87171" : "none"} stroke={liked ? "#f87171" : "currentColor"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
              {likes > 0 ? likes : "Like"}
            </button>
          )}
          <button onClick={download} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.elevated, cursor: "pointer", color: C.secondary, fontSize: 13, fontWeight: 700 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Download
          </button>
          {onEdit && (
            <button onClick={e => { e.stopPropagation(); onEdit(skin); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: `1px solid rgba(103,228,4,0.3)`, background: "rgba(103,228,4,0.08)", cursor: "pointer", color: "#67e404", fontSize: 13, fontWeight: 700 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              {isOwn ? "Edit" : "Edit as template"}
            </button>
          )}
          {isOwn && onDelete && (
            <button disabled={deleting} onClick={async e => { e.stopPropagation(); if (!confirm(`Delete "${skin.name}"?`)) return; setDeleting(true); await onDelete(skin.id); setDeleting(false); onClose(); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: `1px solid rgba(239,68,68,0.3)`, background: "rgba(239,68,68,0.08)", cursor: "pointer", color: C.danger, fontSize: 13, fontWeight: 700, opacity: deleting ? 0.4 : 1 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
              Delete
            </button>
          )}
        </div>

        <div style={{ padding: "16px 20px 20px" }}>
          <CommentsSection
            targetType="skin"
            targetId={skin.id}
            currentUsername={currentUsername}
            getToken={async () => { const { fetchIdToken } = await import("../firebaseAuthHelpers"); return fetchIdToken(); }}
          />
        </div>
      </div>
    </div>
  );
}

function SkinCard({ skin: initialSkin, onEdit, onDelete, isOwn, idToken, initialLiked = false, currentUsername = null, compact = false }) {
  const [showDetail, setShowDetail] = useState(false);
  const commentCount = initialSkin.comment_count ?? 0;
  const likeCount = initialSkin.like_count ?? 0;

  return (
    <>
      <div onClick={() => setShowDetail(true)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer", transition: "border-color .2s, transform .15s, box-shadow .15s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = C.accentBorder; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>

        <div style={{ background: "linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, height: 160, position: "relative" }}>
          <SkinViewerFrontBack skinUrl={initialSkin.public_url} scale={4} />
          {(likeCount > 0 || commentCount > 0) && (
            <div style={{ position: "absolute", bottom: 6, right: 8, display: "flex", gap: 6 }}>
              {likeCount > 0 && <span style={{ fontSize: 10, color: C.muted, display: "inline-flex", alignItems: "center", gap: 3, background: "rgba(0,0,0,0.5)", padding: "2px 6px", borderRadius: 20 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                {likeCount}
              </span>}
              {commentCount > 0 && <span style={{ fontSize: 10, color: C.muted, display: "inline-flex", alignItems: "center", gap: 3, background: "rgba(0,0,0,0.5)", padding: "2px 6px", borderRadius: 20 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                {commentCount}
              </span>}
            </div>
          )}
        </div>

        <div style={{ padding: "10px 12px 12px" }}>
          <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 13, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {initialSkin.name || "Unnamed"}
          </p>
          {initialSkin.username && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: C.accentDim, border: `1px solid ${C.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: C.accent, flexShrink: 0 }}>
                {(initialSkin.username || "?")[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 11, color: C.accent, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{initialSkin.display_name || initialSkin.username}</span>
              {initialSkin.created_at && <span style={{ fontSize: 10, color: C.muted, marginLeft: "auto", flexShrink: 0 }}>{timeAgo(initialSkin.created_at)}</span>}
            </div>
          )}
        </div>
      </div>

      {showDetail && (
        <SkinDetailModal
          skin={initialSkin}
          onClose={() => setShowDetail(false)}
          onEdit={onEdit}
          onDelete={onDelete}
          isOwn={isOwn}
          idToken={idToken}
          currentUsername={currentUsername}
        />
      )}
    </>
  );
}

const ALL_SKINS_PER_PAGE = 24;
const CARD_W = 160;

function SectionHeader({ emoji, title, sub, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <h2 style={{ fontFamily: font, color: C.text, fontSize: 15, fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>{emoji} {title}</h2>
        {sub && <span style={{ fontSize: 11, color: C.muted }}>{sub}</span>}
      </div>
      {action}
    </div>
  );
}

function Carousel({ children }) {
  const ref = useRef(null);
  function scroll(dir) {
    if (ref.current) ref.current.scrollBy({ left: dir * (CARD_W + 12) * 3, behavior: "smooth" });
  }
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => scroll(-1)} style={{ position: "absolute", left: 4, top: "50%", transform: "translateY(-50%)", zIndex: 2, width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.borderMid}`, background: C.elevated, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>‹</button>
      <div ref={ref} style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 36px 4px", scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {children}
      </div>
      <button onClick={() => scroll(1)} style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", zIndex: 2, width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.borderMid}`, background: C.elevated, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>›</button>
    </div>
  );
}

function GalleryTab({ user, idToken, onEditSkin }) {
  const [recentSkins, setRecentSkins] = useState([]);
  const [topSkins, setTopSkins] = useState([]);
  const [mySkins, setMySkins] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [loadingPublic, setLoadingPublic] = useState(true);
  const [loadingMine, setLoadingMine] = useState(false);
  const [error, setError] = useState(null);
  const [allSkins, setAllSkins] = useState([]);
  const [allPage, setAllPage] = useState(0);
  const [allTotal, setAllTotal] = useState(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [deepLinkedSkin, setDeepLinkedSkin] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const skinId = params.get("skin");
    if (skinId) {
      fetch(`${API}/api/skins/${skinId}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setDeepLinkedSkin(d); })
        .catch(() => { });
    }
  }, []);

  useEffect(() => {
    setLoadingPublic(true);
    fetch(`${API}/api/skins/gallery`)
      .then(r => r.json())
      .then(d => {
        setRecentSkins(d.recent || []);
        setTopSkins(d.top || []);
        setLoadingPublic(false);
      })
      .catch(() => { setError("Failed to load skins."); setLoadingPublic(false); });
  }, []);

  useEffect(() => {
    setLoadingAll(true);
    const offset = allPage * ALL_SKINS_PER_PAGE;
    fetch(`${API}/api/skins/gallery/all?limit=${ALL_SKINS_PER_PAGE}&offset=${offset}`)
      .then(r => r.json())
      .then(d => {
        setAllSkins(d.skins || []);
        if (d.total != null) setAllTotal(d.total);
        setLoadingAll(false);
      })
      .catch(() => setLoadingAll(false));
  }, [allPage]);

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
    await fetch(`${API}/api/skins/me/${skinId}`, { method: "DELETE", headers: { Authorization: `Bearer ${idToken}` } });
    setMySkins(prev => prev.filter(s => s.id !== skinId));
    setRecentSkins(prev => prev.filter(s => s.id !== skinId));
    setAllSkins(prev => prev.filter(s => s.id !== skinId));
  }

  const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 12 };
  const carouselCard = { flexShrink: 0, width: CARD_W };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {deepLinkedSkin && (
        <SkinDetailModal
          skin={deepLinkedSkin}
          onClose={() => setDeepLinkedSkin(null)}
          onEdit={onEditSkin}
          onDelete={deleteSkin}
          isOwn={user && deepLinkedSkin.uid === user.uid}
          idToken={idToken}
          currentUsername={user?.username}
        />
      )}
      {error && <div style={{ background: C.dangerDim, border: `1px solid ${C.dangerBorder}`, borderRadius: 10, padding: 12 }}><p style={{ fontFamily: font, color: C.danger, margin: 0 }}>{error}</p></div>}

      {user && mySkins.length > 0 && (
        <section>
          <SectionHeader emoji="🎨" title="My Cloud Skins" sub={`${mySkins.length} skin${mySkins.length !== 1 ? "s" : ""}`} />
          <Carousel>
            {mySkins.map(s => (
              <div key={s.id} style={carouselCard}>
                <SkinCard skin={s} isOwn onEdit={onEditSkin} onDelete={deleteSkin} currentUsername={user?.username} />
              </div>
            ))}
          </Carousel>
        </section>
      )}

      {topSkins.length > 0 && (
        <section>
          <SectionHeader emoji="🏆" title="Most liked" sub={`Top ${Math.min(topSkins.length, 20)}`} />
          <Carousel>
            {topSkins.slice(0, 20).map(s => (
              <div key={s.id} style={carouselCard}>
                <SkinCard skin={s} isOwn={user && s.uid === user.uid} onEdit={onEditSkin} onDelete={deleteSkin} idToken={idToken} initialLiked={likedIds.has(s.id)} currentUsername={user?.username} />
              </div>
            ))}
          </Carousel>
        </section>
      )}

      {!loadingPublic && recentSkins.length > 0 && (
        <section>
          <SectionHeader emoji="✨" title="Newest uploads" sub="Just added by the community" />
          <div style={grid}>
            {recentSkins.slice(0, 6).map(s => (
              <SkinCard key={s.id} skin={s} isOwn={user && s.uid === user.uid} onEdit={onEditSkin} onDelete={deleteSkin} idToken={idToken} initialLiked={likedIds.has(s.id)} currentUsername={user?.username} />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader emoji="🌍" title="Browse all" sub={allTotal != null ? `${allTotal} unique skins` : undefined} />
        {loadingAll ? (
          <p style={{ fontFamily: font, color: C.muted, fontSize: 13 }}>Loading…</p>
        ) : allSkins.length === 0 ? (
          <p style={{ fontFamily: font, color: C.muted, fontSize: 13 }}>No public skins yet.</p>
        ) : (
          <div style={grid}>
            {allSkins.map(s => (
              <SkinCard key={s.id} skin={s} isOwn={user && s.uid === user.uid} onEdit={onEditSkin} onDelete={deleteSkin} idToken={idToken} initialLiked={likedIds.has(s.id)} currentUsername={user?.username} />
            ))}
          </div>
        )}
        {(allPage > 0 || allSkins.length >= ALL_SKINS_PER_PAGE) && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 20 }}>
            <button onClick={() => setAllPage(p => Math.max(0, p - 1))} disabled={allPage === 0}
              style={{ padding: "8px 20px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.elevated, color: allPage === 0 ? C.muted : C.text, cursor: allPage === 0 ? "default" : "pointer", fontFamily: font, fontSize: 13, fontWeight: 700 }}>←</button>
            <span style={{ fontFamily: font, fontSize: 13, color: C.muted, minWidth: 70, textAlign: "center" }}>
              {allPage + 1}{allTotal != null ? ` / ${Math.ceil(allTotal / ALL_SKINS_PER_PAGE)}` : ""}
            </span>
            <button onClick={() => setAllPage(p => p + 1)} disabled={allSkins.length < ALL_SKINS_PER_PAGE}
              style={{ padding: "8px 20px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.elevated, color: allSkins.length < ALL_SKINS_PER_PAGE ? C.muted : C.text, cursor: allSkins.length < ALL_SKINS_PER_PAGE ? "default" : "pointer", fontFamily: font, fontSize: 13, fontWeight: 700 }}>→</button>
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
