import React, { useEffect, useState, useCallback } from "react";
import Layout from "@theme/Layout";
import { marked } from "marked";
import DOMPurify from 'dompurify';

marked.use({ breaks: true });

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
  return (
    <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "row", alignItems: "stretch" }}>
      <div style={{ width: 130, minWidth: 130, background: NL.elevated, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {pack.thumbnailUrl
          ? <img src={pack.thumbnailUrl} alt={pack.name} style={{ width: 100, height: 100, objectFit: "contain", imageRendering: "pixelated" }} />
          : <span style={{ fontSize: 48 }}>📦</span>
        }
      </div>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 700, color: NL.text, fontSize: 16, fontFamily: font }}>{pack.name}</p>
        {pack.description && (
          <p style={{ margin: 0, color: NL.secondary, fontSize: 13, fontFamily: font, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{pack.description}</p>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto", paddingTop: 6, flexWrap: "wrap" }}>
          {pack.category && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(96,165,250,0.10)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.30)", fontFamily: mono }}>{pack.category}</span>}
          {pack.tags?.map(t => (
            <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: NL.accentDim, color: NL.accent, border: `1px solid ${NL.accentBorder}`, fontFamily: mono }}>{t}</span>
          ))}
          <span style={{ fontSize: 12, color: NL.muted, fontFamily: font, marginLeft: 4 }}>↓ {pack.downloadCount ?? 0}</span>
          {pack.sizeBytes > 0 && <span style={{ fontSize: 12, color: NL.muted, fontFamily: font }}>{formatBytes(pack.sizeBytes)}</span>}
          <button onClick={() => onDetails(pack)} style={{ marginLeft: "auto", padding: "6px 16px", background: NL.accent, color: "#0d1a18", borderRadius: 7, fontWeight: 700, fontSize: 13, fontFamily: font, border: "none", cursor: "pointer", flexShrink: 0 }}>Details →</button>
        </div>
      </div>
    </div>
  );
}

export default function PacksPage() {
  const CATEGORIES = ["realism","faithful","pvp","cartoon","dark","medieval","nature","themed","other"];
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const searchInputRef = React.useRef(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [detailPack, setDetailPack] = useState(null);
  const initialSlugRef = React.useRef(
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('slug') : null
  );

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

  const allTags = Array.from(new Set(packs.flatMap(p => p.tags || [])));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
      if (selectedCategory) params.set("category", selectedCategory);
      const res = await fetch(`${API_BASE}/api/featured-packs?${params}`);
      const data = await res.json();
      const list = data.packs || [];
      setPacks(list);
      if (initialSlugRef.current) {
        const found = list.find(p => p.slug === initialSlugRef.current);
        if (found) { setDetailPack(found); initialSlugRef.current = null; }
      }
    } catch (_) {}
    finally { setLoading(false); }
  }, [query, selectedTags, selectedCategory]);

  useEffect(() => { load(); }, [load]);

  function toggleTag(tag) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  const filtered = packs;

  return (
    <Layout title="Resource Packs" description="Curated packs for Minecraft Bedrock">
      <div style={{ minHeight: "100vh", background: NL.bg, fontFamily: font }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: NL.text, margin: "0 0 6px" }}>Resource Packs</h1>
            <p style={{ margin: 0, color: NL.secondary, fontSize: 15 }}>Curated packs for Minecraft Bedrock</p>
          </div>

          <input
            ref={searchInputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search packs…"
            style={{ width: "100%", background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 10, padding: "10px 16px", color: NL.text, fontSize: 14, fontFamily: font, outline: "none", boxSizing: "border-box", marginBottom: 16 }}
          />

          <div style={{ display: "flex", overflowX: "auto", gap: 6, marginBottom: 16, paddingBottom: 2 }}>
            {[null, ...CATEGORIES].map(cat => {
              const active = selectedCategory === cat;
              return (
                <button key={cat ?? "all"} onClick={() => { setSelectedCategory(cat); setQuery(''); if (searchInputRef.current) searchInputRef.current.value = ''; }} style={{ fontSize: 12, padding: "4px 14px", borderRadius: 20, cursor: "pointer", fontFamily: mono, whiteSpace: "nowrap", flexShrink: 0, background: active ? "rgba(96,165,250,0.15)" : NL.surface, border: `1px solid ${active ? "rgba(96,165,250,0.45)" : NL.border}`, color: active ? "#60a5fa" : NL.secondary }}>
                  {cat === null ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              );
            })}
          </div>

          {allTags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
              {allTags.map(tag => {
                const active = selectedTags.includes(tag);
                return (
                  <button key={tag} onClick={() => toggleTag(tag)} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, cursor: "pointer", fontFamily: mono, background: active ? NL.accentDim : NL.surface, border: `1px solid ${active ? NL.accentBorder : NL.border}`, color: active ? NL.accent : NL.secondary }}>
                    {tag}
                  </button>
                );
              })}
            </div>
          )}

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 64, color: NL.muted }}>
              <Spinner size={28} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 64, color: NL.muted, fontSize: 15 }}>
              No packs found
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map(pack => <PackCard key={pack.id} pack={pack} onDetails={openDetail} />)}
            </div>
          )}
        </div>
      </div>
      {detailPack && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}
          onClick={e => { if (e.target === e.currentTarget) closeDetail(); }}>
          <div style={{ background: NL.surface, border: `1px solid ${NL.borderMid}`, borderRadius: 16, width: "100%", maxWidth: 680, maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {detailPack.thumbnailUrl && (
              <img src={detailPack.thumbnailUrl} alt={detailPack.name} style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: "16px 16px 0 0" }} />
            )}
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: NL.text }}>{detailPack.name}</h2>
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {detailPack.category && <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)", color: "#60a5fa" }}>{detailPack.category.charAt(0).toUpperCase() + detailPack.category.slice(1)}</span>}
                    {(detailPack.tags || []).map(t => <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: "rgba(103,228,4,0.08)", border: "1px solid rgba(103,228,4,0.22)", color: "#67e404" }}>{t}</span>)}
                  </div>
                </div>
                <button onClick={() => closeDetail()} style={{ background: "none", border: "none", cursor: "pointer", color: NL.muted, fontSize: 20, lineHeight: 1, flexShrink: 0 }}>✕</button>
              </div>

              {(detailPack.creatorWebsite?.startsWith('https://') || detailPack.creatorDiscord?.startsWith('https://')) && (
                <div style={{ display: "flex", gap: 8 }}>
                  {detailPack.creatorWebsite?.startsWith('https://') && (
                    <a href={detailPack.creatorWebsite} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, color: NL.secondary, textDecoration: "none", background: NL.elevated, border: `1px solid ${NL.border}` }}>🌐 Website</a>
                  )}
                  {detailPack.creatorDiscord?.startsWith('https://') && (
                    <a href={detailPack.creatorDiscord} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#7289da", textDecoration: "none", background: "rgba(114,137,218,0.10)", border: "1px solid rgba(114,137,218,0.25)" }}>Discord</a>
                  )}
                </div>
              )}

              {detailPack.longDescription ? (
                <div
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(detailPack.longDescription)) }}
                  style={{ color: NL.secondary, fontSize: 14, lineHeight: 1.7 }}
                />
              ) : detailPack.description ? (
                <p style={{ color: NL.secondary, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{detailPack.description}</p>
              ) : null}

              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 8, borderTop: `1px solid ${NL.border}` }}>
                <span style={{ fontSize: 12, color: NL.muted }}>↓ {detailPack.downloadCount ?? 0} downloads</span>
                {detailPack.sizeBytes > 0 && <span style={{ fontSize: 12, color: NL.muted }}>{formatBytes(detailPack.sizeBytes)}</span>}
                <div style={{ flex: 1 }} />
                <a href={detailPack.downloadUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#0d1a18", textDecoration: "none", background: "#67e404" }}>⬇ Download</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
