import React, { useEffect, useState, useCallback, useRef } from "react";
import Layout from "@theme/Layout";
import { marked } from "marked";
import DOMPurify from 'dompurify';
import CommentsSection from "../components/CommentsSection";

marked.use({ breaks: true });

const NL = {
  bg: "#0d1117", surface: "#131820", elevated: "#191f2b", subtle: "#1f2635",
  border: "rgba(255,255,255,0.06)", borderMid: "rgba(255,255,255,0.11)",
  text: "#eaecf0", secondary: "#8d97aa", muted: "#4a5270",
  accent: "#67e404", accentDim: "rgba(103,228,4,0.10)", accentBorder: "rgba(103,228,4,0.22)",
  danger: "#f87171",
};
const font = "'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'Fira Code', monospace";
const API_BASE = "https://api.mccompanion.net";
const PAGE_SIZE = 12;

const CAT_ICONS = {
  realism: "🌿", faithful: "🎨", pvp: "⚔️", cartoon: "🎭",
  dark: "🌑", medieval: "🏰", nature: "🌲", themed: "✨", other: "📦",
};

function Spinner({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: "spin 0.8s linear infinite", display: "inline-block", verticalAlign: "middle" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40 20" />
    </svg>
  );
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function PackCard({ pack, onDetails }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onDetails(pack)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: NL.surface,
        border: `1px solid ${hovered ? NL.borderMid : NL.border}`,
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.15s, transform 0.15s",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ height: 160, background: NL.elevated, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", flexShrink: 0 }}>
        {pack.thumbnailUrl
          ? <img src={pack.thumbnailUrl} alt={pack.name} style={{ width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated", display: "block" }} />
          : <span style={{ fontSize: 56 }}>📦</span>
        }
        {pack.category && (
          <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700, color: "#60a5fa", border: "1px solid rgba(96,165,250,0.25)" }}>
            {CAT_ICONS[pack.category] ?? "📦"} {pack.category.charAt(0).toUpperCase() + pack.category.slice(1)}
          </div>
        )}
      </div>

      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 700, color: NL.text, fontSize: 14, fontFamily: font, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{pack.name}</p>
        {pack.description && (
          <p style={{ margin: 0, color: NL.secondary, fontSize: 12, fontFamily: font, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>{pack.description}</p>
        )}

        {pack.tags?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {pack.tags.slice(0, 3).map(t => (
              <span key={t} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: NL.accentDim, color: NL.accent, border: `1px solid ${NL.accentBorder}`, fontFamily: mono }}>#{t}</span>
            ))}
            {pack.tags.length > 3 && <span style={{ fontSize: 10, color: NL.muted }}>+{pack.tags.length - 3}</span>}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto", paddingTop: 8, borderTop: `1px solid ${NL.border}` }}>
          <span style={{ fontSize: 11, color: NL.muted, display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            {pack.downloadCount ?? 0}
          </span>
          {pack.sizeBytes > 0 && <span style={{ fontSize: 11, color: NL.muted }}>{formatBytes(pack.sizeBytes)}</span>}
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: NL.accent }}>Details →</span>
        </div>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }
  const btnBase = { padding: "6px 12px", borderRadius: 8, border: `1px solid ${NL.border}`, cursor: "pointer", fontFamily: font, fontSize: 13, fontWeight: 500, transition: "background 0.1s, border-color 0.1s" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 32 }}>
      <button disabled={page === 1} onClick={() => onChange(page - 1)}
        style={{ ...btnBase, background: NL.surface, color: page === 1 ? NL.muted : NL.secondary, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "default" : "pointer" }}>
        ← Prev
      </button>
      {pages.map((p, i) =>
        p === "…"
          ? <span key={`e${i}`} style={{ color: NL.muted, fontSize: 13, padding: "0 4px" }}>…</span>
          : <button key={p} onClick={() => onChange(p)}
            style={{ ...btnBase, background: p === page ? NL.accent : NL.surface, color: p === page ? "#000" : NL.secondary, borderColor: p === page ? NL.accent : NL.border, fontWeight: p === page ? 700 : 500 }}>
            {p}
          </button>
      )}
      <button disabled={page === totalPages} onClick={() => onChange(page + 1)}
        style={{ ...btnBase, background: NL.surface, color: page === totalPages ? NL.muted : NL.secondary, opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "default" : "pointer" }}>
        Next →
      </button>
    </div>
  );
}

function DetailModal({ pack, onClose }) {
  const [currentUsername, setCurrentUsername] = useState(null);

  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    import("../firebaseAuthHelpers").then(({ fetchIdToken }) =>
      fetchIdToken().then(token => {
        if (!token) return;
        fetch("https://api.mccompanion.net/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d?.user?.username) setCurrentUsername(d.user.username); })
          .catch(() => { });
      })
    ).catch(() => { });
  }, []);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: NL.surface, border: `1px solid ${NL.borderMid}`, borderRadius: 18, width: "100%", maxWidth: 700, maxHeight: "92vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {pack.thumbnailUrl ? (
          <div style={{ height: 240, flexShrink: 0, overflow: "hidden", borderRadius: "18px 18px 0 0", position: "relative" }}>
            <img src={pack.thumbnailUrl} alt={pack.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(25,28,35,0.8) 0%, transparent 50%)" }} />
          </div>
        ) : null}

        <div style={{ padding: "24px 24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: NL.text, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{pack.name}</h2>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
                {pack.category && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)", color: "#60a5fa" }}>
                    {CAT_ICONS[pack.category]} {pack.category.charAt(0).toUpperCase() + pack.category.slice(1)}
                  </span>
                )}
                {(pack.tags || []).map(t => (
                  <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 5, background: NL.accentDim, border: `1px solid ${NL.accentBorder}`, color: NL.accent, fontFamily: mono }}>#{t}</span>
                ))}
              </div>
            </div>
            <button onClick={onClose} style={{ background: NL.elevated, border: `1px solid ${NL.border}`, borderRadius: 8, cursor: "pointer", color: NL.secondary, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>✕</button>
          </div>

          {(pack.creatorWebsite || pack.creatorDiscord) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {pack.creatorWebsite?.startsWith('https://') && (
                <a href={pack.creatorWebsite} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: NL.secondary, textDecoration: "none", background: NL.elevated, border: `1px solid ${NL.border}` }}>
                  🌐 Website
                </a>
              )}
              {pack.creatorDiscord?.startsWith('https://') && (
                <a href={pack.creatorDiscord} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#7289da", textDecoration: "none", background: "rgba(114,137,218,0.08)", border: "1px solid rgba(114,137,218,0.22)" }}>
                  Discord
                </a>
              )}
            </div>
          )}

          {pack.longDescription ? (
            <div
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(pack.longDescription)) }}
              style={{ color: NL.secondary, fontSize: 14, lineHeight: 1.8 }}
            />
          ) : pack.description ? (
            <p style={{ color: NL.secondary, fontSize: 14, lineHeight: 1.8, margin: 0 }}>{pack.description}</p>
          ) : null}

          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 14, borderTop: `1px solid ${NL.border}`, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 14 }}>
              <span style={{ fontSize: 12, color: NL.muted, display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                {pack.downloadCount ?? 0} downloads
              </span>
              {pack.sizeBytes > 0 && <span style={{ fontSize: 12, color: NL.muted }}>{formatBytes(pack.sizeBytes)}</span>}
            </div>
            <a href={pack.downloadUrl} target="_blank" rel="noopener noreferrer"
              style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 10, fontSize: 14, fontWeight: 700, color: "#0d1a18", textDecoration: "none", background: NL.accent }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Download
            </a>
          </div>

          <CommentsSection
            targetType="pack"
            targetId={String(pack.id)}
            currentUsername={currentUsername}
            getToken={() => import("../firebaseAuthHelpers").then(m => m.fetchIdToken())}
          />
        </div>
      </div>
    </div>
  );
}

export default function PacksPage() {
  const CATEGORIES = ["realism", "faithful", "pvp", "cartoon", "dark", "medieval", "nature", "themed", "other"];
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchInputRef = useRef(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [detailPack, setDetailPack] = useState(null);
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const initialSlugRef = useRef(
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('slug') : null
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  function openDetail(pack) {
    setDetailPack(pack);
    if (typeof window !== 'undefined' && pack.slug) {
      const url = new URL(window.location.href);
      url.searchParams.set('slug', pack.slug);
      window.history.pushState({}, '', url.toString());
    }
  }

  function closeDetail() {
    setDetailPack(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('slug');
      window.history.pushState({}, '', url.toString());
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
      if (selectedCategory) params.set("category", selectedCategory);
      const res = await fetch(`${API_BASE}/api/featured-packs?${params}`);
      const data = await res.json();
      const list = data.packs || [];
      setPacks(list);
      setPage(1);
      if (initialSlugRef.current) {
        const found = list.find(p => p.slug === initialSlugRef.current);
        if (found) { setDetailPack(found); initialSlugRef.current = null; }
      }
    } catch (_) { }
    finally { setLoading(false); }
  }, [debouncedQuery, selectedTags, selectedCategory]);

  useEffect(() => { load(); }, [load]);

  function toggleTag(tag) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  const allTags = Array.from(new Set(packs.flatMap(p => p.tags || [])));
  const totalPages = Math.ceil(packs.length / PAGE_SIZE);
  const pagePacks = packs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const trending = [...packs].sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0)).slice(0, 5);
  const catCounts = CATEGORIES.reduce((acc, c) => {
    acc[c] = packs.filter(p => p.category === c).length;
    return acc;
  }, {});

  const sideCard = (children) => (
    <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
      {children}
    </div>
  );
  const sideTitle = (label) => (
    <div style={{ padding: "10px 14px", borderBottom: `1px solid ${NL.border}`, fontSize: 11, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
  );

  return (
    <Layout title="Resource Packs" description="Curated resource packs for Minecraft Bedrock">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .pack-search:focus { border-color: rgba(255,255,255,0.2) !important; }
        .cat-pill-btn:hover { border-color: rgba(96,165,250,0.4) !important; color: #60a5fa !important; }
      `}</style>
      <div style={{ minHeight: "100vh", background: NL.bg, fontFamily: font }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "32px 16px 60px" : "44px 24px 80px" }}>

          <div style={{ marginBottom: 28 }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: NL.accent }}>Community</p>
            <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: NL.text, margin: "0 0 6px", letterSpacing: "-0.03em" }}>Resource Packs</h1>
            <p style={{ margin: 0, color: NL.secondary, fontSize: 14 }}>Hand-picked packs for Minecraft Bedrock. Download them straight from the app.</p>
          </div>

          <div style={{ position: "relative", marginBottom: 12 }}>
            <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: NL.muted, pointerEvents: "none" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input ref={searchInputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search packs…" className="pack-search"
              style={{ width: "100%", background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 10, padding: "10px 14px 10px 38px", color: NL.text, fontSize: 14, fontFamily: font, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }} />
            {query && <button onClick={() => { setQuery(""); if (searchInputRef.current) searchInputRef.current.value = ""; }}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: NL.muted, fontSize: 15, lineHeight: 1, padding: 4 }}>✕</button>}
          </div>

          <div style={{ display: "flex", overflowX: "auto", gap: 6, marginBottom: 12, paddingBottom: 2 }}>
            {[null, ...CATEGORIES].map(cat => {
              const active = selectedCategory === cat;
              return (
                <button key={cat ?? "all"} onClick={() => { setSelectedCategory(cat); setQuery(""); if (searchInputRef.current) searchInputRef.current.value = ""; }} className="cat-pill-btn"
                  style={{ fontSize: 12, padding: "5px 14px", borderRadius: 20, cursor: "pointer", fontFamily: font, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0, background: active ? "rgba(96,165,250,0.12)" : NL.surface, border: `1px solid ${active ? "rgba(96,165,250,0.40)" : NL.border}`, color: active ? "#60a5fa" : NL.secondary, transition: "all 0.15s" }}>
                  {cat === null ? "All" : `${CAT_ICONS[cat]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
                </button>
              );
            })}
          </div>

          {allTags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 20 }}>
              {allTags.map(tag => {
                const active = selectedTags.includes(tag);
                return (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, cursor: "pointer", fontFamily: mono, background: active ? NL.accentDim : NL.subtle, border: `1px solid ${active ? NL.accentBorder : NL.border}`, color: active ? NL.accent : NL.muted, transition: "all 0.15s" }}>
                    #{tag}
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 240px", gap: 20, alignItems: "start" }}>

            <div>
              {!loading && packs.length > 0 && (
                <p style={{ margin: "0 0 14px", fontSize: 12, color: NL.muted }}>
                  {packs.length} pack{packs.length !== 1 ? "s" : ""}
                  {totalPages > 1 && ` · page ${page} of ${totalPages}`}
                </p>
              )}

              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 80, color: NL.muted }}><Spinner size={28} /></div>
              ) : packs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                  <span style={{ fontSize: 44, display: "block", marginBottom: 12 }}>📦</span>
                  <p style={{ color: NL.secondary, fontSize: 15, margin: "0 0 4px", fontWeight: 600 }}>No packs found</p>
                  <p style={{ color: NL.muted, fontSize: 13 }}>Try a different search or category</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
                    {pagePacks.map(pack => <PackCard key={pack.id} pack={pack} onDetails={openDetail} />)}
                  </div>
                  <Pagination page={page} totalPages={totalPages} onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
                </>
              )}
            </div>

            {!isMobile && (
              <div style={{ position: "sticky", top: 24 }}>
                {trending.length > 0 && sideCard(
                  <>
                    {sideTitle("🔥 Trending")}
                    <div style={{ padding: "6px 0" }}>
                      {trending.map((p, i) => (
                        <div key={p.id} onClick={() => openDetail(p)}
                          style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 14px", cursor: "pointer", transition: "background 0.1s" }}
                          onMouseEnter={e => e.currentTarget.style.background = NL.elevated}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: NL.accent, width: 16, flexShrink: 0 }}>{i + 1}</span>
                          {p.thumbnailUrl
                            ? <img src={p.thumbnailUrl} alt={p.name} style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover", imageRendering: "pixelated", flexShrink: 0 }} />
                            : <div style={{ width: 32, height: 32, borderRadius: 6, background: NL.elevated, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📦</div>
                          }
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: NL.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</p>
                            <span style={{ fontSize: 10, color: NL.muted }}>↓ {p.downloadCount ?? 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {sideCard(
                  <>
                    {sideTitle("Categories")}
                    <div style={{ padding: "8px 14px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
                      {CATEGORIES.filter(c => catCounts[c] > 0).map(c => (
                        <button key={c} onClick={() => { setSelectedCategory(c); setQuery(""); if (searchInputRef.current) searchInputRef.current.value = ""; }}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 8px", borderRadius: 7, border: `1px solid ${selectedCategory === c ? "rgba(96,165,250,0.35)" : "transparent"}`, background: selectedCategory === c ? "rgba(96,165,250,0.10)" : "transparent", cursor: "pointer", fontFamily: font, transition: "all 0.12s", width: "100%" }}>
                          <span style={{ fontSize: 12, color: selectedCategory === c ? "#60a5fa" : NL.secondary }}>{CAT_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</span>
                          <span style={{ fontSize: 10, color: NL.muted, fontFamily: mono }}>{catCounts[c]}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div style={{ background: NL.accentDim, border: `1px solid ${NL.accentBorder}`, borderRadius: 14, padding: "16px 14px" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: NL.accent }}>Submit your pack</p>
                  <p style={{ margin: "0 0 12px", fontSize: 11, color: NL.secondary, lineHeight: 1.5 }}>Have a resource pack? Submit it to get featured in the app.</p>
                  <a href="/account" style={{ display: "block", textAlign: "center", padding: "7px 0", borderRadius: 8, background: NL.accent, color: "#000", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Submit pack →</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {detailPack && <DetailModal pack={detailPack} onClose={closeDetail} />}
    </Layout>
  );
}
