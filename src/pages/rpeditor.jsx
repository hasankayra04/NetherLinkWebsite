import { useState, useRef, useCallback, useEffect } from "react";
import Layout from "@theme/Layout";
import { unzipSync, zipSync } from "fflate";

const C = {
  bg: "#111318", surface: "#191c23", elevated: "#1f232c", subtle: "#252931",
  border: "rgba(255,255,255,0.07)", borderMid: "rgba(255,255,255,0.12)",
  text: "#e8e9ec", secondary: "#9299a6", muted: "#5a6070",
  accent: "#67e404", accentDim: "rgba(103,228,4,0.08)", accentBorder: "rgba(103,228,4,0.22)",
  danger: "#f87171", dangerDim: "rgba(248,113,113,0.08)", dangerBorder: "rgba(248,113,113,0.25)",
  warning: "#fbbf24", warningDim: "rgba(251,191,36,0.06)", warningBorder: "rgba(251,191,36,0.20)",
  info: "#60a5fa", infoDim: "rgba(96,165,250,0.08)", infoBorder: "rgba(96,165,250,0.22)",
};
const mono = "ui-monospace,'Cascadia Code','Source Code Pro',monospace";
const font = "Inter,system-ui,sans-serif";

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function readFileAsArrayBuffer(file) {
  return new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej;
    r.readAsArrayBuffer(file);
  });
}

async function sha256Hex(bytes) {
  const buf = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function hexToUuid(hex) {
  const h = hex.padEnd(32, "0").slice(0, 32);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

async function parsePack(file) {
  const buf = await readFileAsArrayBuffer(file);
  const data = unzipSync(new Uint8Array(buf));
  const paths = Object.keys(data);

  let name = file.name.replace(/\.(zip|mcpack)$/i, "");
  let manifest = null;
  for (const key of ["manifest.json", "pack_manifest.json"]) {
    const match = paths.find(p => p === key || p.endsWith("/" + key));
    if (match) {
      try {
        manifest = JSON.parse(new TextDecoder().decode(data[match]));
        const n = manifest?.header?.name || manifest?.name;
        if (n) name = n;
      } catch { }
      break;
    }
  }

  let iconUrl = null;
  const iconKey = paths.find(p => p === "pack_icon.png" || p.endsWith("/pack_icon.png"));
  if (iconKey) iconUrl = URL.createObjectURL(new Blob([data[iconKey]], { type: "image/png" }));

  const warnings = [];
  if (!manifest) warnings.push({ type: "error", msg: "No manifest.json found, pack may not work in Minecraft" });
  else {
    if (!manifest.header?.uuid) warnings.push({ type: "warning", msg: "manifest.json is missing a UUID" });
    if (!manifest.header?.version) warnings.push({ type: "warning", msg: "manifest.json is missing a version" });
  }
  if (!iconKey) warnings.push({ type: "info", msg: "No pack_icon.png found" });

  const fileCount = paths.filter(p => !p.endsWith("/")).length;
  return { id: crypto.randomUUID(), file, name, data, paths, fileCount, size: file.size, iconUrl, manifest, warnings };
}

async function buildMerged(packs, overrides = {}) {
  const merged = {};
  const conflicts = {};

  for (let i = packs.length - 1; i >= 0; i--) {
    const pack = packs[i];
    for (const [path, bytes] of Object.entries(pack.data)) {
      if (path.endsWith("/")) continue;
      if (merged[path] !== undefined && !conflicts[path]) conflicts[path] = [];
      if (conflicts[path]) conflicts[path].push({ packId: pack.id, packName: pack.name, bytes });
      merged[path] = bytes;
    }
  }

  const resolvedConflicts = {};
  for (const [path, losers] of Object.entries(conflicts)) {
    const winner = packs.find(p => p.data[path]);
    const allBytes = [winner, ...packs.filter(p => p !== winner && p.data[path])].map(p => p.data[path]);
    const hashes = await Promise.all(allBytes.map(b => sha256Hex(b)));
    const identical = hashes.every(h => h === hashes[0]);

    const overridePack = overrides[path] ? packs.find(p => p.id === overrides[path]) : null;
    if (overridePack) merged[path] = overridePack.data[path];

    resolvedConflicts[path] = {
      winner: overridePack?.name ?? winner?.name ?? "unknown",
      winnerId: overridePack?.id ?? winner?.id,
      losers: packs.filter(p => p !== (overridePack ?? winner) && p.data[path]).map(p => ({ id: p.id, name: p.name })),
      identical,
    };
  }

  return { merged, conflicts: resolvedConflicts };
}

function DropZone({ onFiles, disabled }) {
  const [over, setOver] = useState(false);
  const input = useRef();
  const handle = useCallback(files => {
    const valid = [...files].filter(f => /\.(zip|mcpack)$/i.test(f.name));
    if (valid.length) onFiles(valid);
  }, [onFiles]);
  return (
    <div onClick={() => !disabled && input.current?.click()}
      onDragOver={e => { e.preventDefault(); if (!disabled) setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); if (!disabled) handle(e.dataTransfer.files); }}
      style={{ border: `2px dashed ${over ? C.accent : C.borderMid}`, borderRadius: 16, padding: "32px 24px", textAlign: "center", cursor: disabled ? "not-allowed" : "pointer", background: over ? C.accentDim : C.surface, transition: "all 0.15s", opacity: disabled ? 0.5 : 1 }}>
      <input ref={input} type="file" accept=".zip,.mcpack" multiple style={{ display: "none" }} onChange={e => handle(e.target.files)} />
      <div style={{ fontSize: 32, marginBottom: 10 }}>📦</div>
      <div style={{ color: C.text, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Drop resource packs here</div>
      <div style={{ color: C.muted, fontSize: 12 }}>.zip or .mcpack · no limit</div>
    </div>
  );
}

function ValidationBadge({ warnings }) {
  if (!warnings?.length) return <span style={{ fontSize: 11, color: C.accent, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 5, padding: "1px 7px" }}>✓ Valid</span>;
  const hasError = warnings.some(w => w.type === "error");
  const color = hasError ? C.danger : C.warning;
  const bg = hasError ? C.dangerDim : C.warningDim;
  const border = hasError ? C.dangerBorder : C.warningBorder;
  return <span style={{ fontSize: 11, color, background: bg, border: `1px solid ${border}`, borderRadius: 5, padding: "1px 7px" }}>{hasError ? "⚠ Error" : `⚠ ${warnings.length}`}</span>;
}

function PackCard({ pack, index, total, onRemove, onMoveUp, onMoveDown }) {
  const [showWarnings, setShowWarnings] = useState(false);
  return (
    <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: C.subtle, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}` }}>
          {pack.iconUrl ? <img src={pack.iconUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 20 }}>🗂️</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{pack.name}</div>
          <div style={{ color: C.muted, fontSize: 11, display: "flex", alignItems: "center", gap: 8 }}>
            <span>{pack.fileCount} files · {humanSize(pack.size)}</span>
            <span onClick={() => setShowWarnings(v => !v)} style={{ cursor: pack.warnings.length ? "pointer" : "default" }}>
              <ValidationBadge warnings={pack.warnings} />
            </span>
          </div>
        </div>
        <div style={{ background: index === 0 ? C.accentDim : C.subtle, border: `1px solid ${index === 0 ? C.accentBorder : C.border}`, borderRadius: 7, padding: "2px 8px", color: index === 0 ? C.accent : C.muted, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
          {index === 0 ? "TOP" : `#${index + 1}`}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <button onClick={onMoveUp} disabled={index === 0} style={btnS(index !== 0)}>▲</button>
          <button onClick={onMoveDown} disabled={index === total - 1} style={btnS(index !== total - 1)}>▼</button>
        </div>
        <button onClick={onRemove} style={{ ...btnS(true), color: C.danger }}>✕</button>
      </div>
      {showWarnings && pack.warnings.length > 0 && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          {pack.warnings.map((w, i) => (
            <div key={i} style={{ fontSize: 12, color: w.type === "error" ? C.danger : w.type === "warning" ? C.warning : C.info }}>
              {w.type === "error" ? "✕" : w.type === "warning" ? "⚠" : "ℹ"} {w.msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function btnS(active) {
  return { background: "none", border: `1px solid ${active ? C.borderMid : C.border}`, borderRadius: 7, color: active ? C.secondary : C.muted, width: 26, height: 26, cursor: active ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, padding: 0, opacity: active ? 1 : 0.3 };
}

function FileBrowser({ packs }) {
  const [selectedPack, setSelectedPack] = useState(packs[0]?.id);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

  const pack = packs.find(p => p.id === selectedPack) || packs[0];
  if (!pack) return null;

  const files = pack.paths.filter(p => !p.endsWith("/") && (!search || p.toLowerCase().includes(search.toLowerCase())));

  const tree = {};
  for (const f of files) {
    const parts = f.split("/");
    let node = tree;
    for (let i = 0; i < parts.length - 1; i++) {
      node[parts[i]] = node[parts[i]] || {};
      node = node[parts[i]];
    }
    node[parts[parts.length - 1]] = null;
  }

  function TreeNode({ name, node, depth = 0, path = "" }) {
    const fullPath = path ? `${path}/${name}` : name;
    const isDir = node !== null && typeof node === "object";
    const isOpen = expanded[fullPath];
    const children = isDir ? Object.entries(node) : [];
    const ext = name.split(".").pop()?.toLowerCase();
    const icon = !isDir ? (["png", "jpg", "jpeg", "tga"].includes(ext) ? "🖼" : ["json", "material"].includes(ext) ? "📄" : ["ogg", "fsb"].includes(ext) ? "🔊" : "📄") : "📁";

    return (
      <div>
        <div onClick={() => isDir && setExpanded(e => ({ ...e, [fullPath]: !isOpen }))}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 8px", paddingLeft: 8 + depth * 16, borderRadius: 6, cursor: isDir ? "pointer" : "default", color: isDir ? C.text : C.secondary, fontSize: 12 }}
          onMouseEnter={e => e.currentTarget.style.background = C.subtle}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <span style={{ fontSize: 11 }}>{icon}</span>
          <span style={{ fontFamily: isDir ? font : mono, fontWeight: isDir ? 600 : 400 }}>{name}</span>
          {!isDir && <span style={{ marginLeft: "auto", color: C.muted, fontSize: 10, fontFamily: mono }}>{humanSize(pack.data[fullPath]?.length || 0)}</span>}
          {isDir && <span style={{ marginLeft: "auto", color: C.muted, fontSize: 10 }}>{isOpen ? "▾" : "▸"}</span>}
        </div>
        {isDir && isOpen && children.map(([k, v]) => <TreeNode key={k} name={k} node={v} depth={depth + 1} path={fullPath} />)}
      </div>
    );
  }

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, overflowX: "auto" }}>
        {packs.map(p => (
          <button key={p.id} onClick={() => { setSelectedPack(p.id); setSearch(""); setExpanded({}); }}
            style={{ padding: "10px 16px", background: p.id === selectedPack ? C.elevated : "transparent", border: "none", borderRight: `1px solid ${C.border}`, color: p.id === selectedPack ? C.text : C.muted, fontSize: 12, fontWeight: p.id === selectedPack ? 600 : 400, cursor: "pointer", whiteSpace: "nowrap", fontFamily: font, flexShrink: 0 }}>
            {p.name}
          </button>
        ))}
      </div>
      <div style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…"
          style={{ width: "100%", background: C.elevated, border: `1px solid ${C.borderMid}`, borderRadius: 8, padding: "6px 10px", color: C.text, fontSize: 12, fontFamily: mono, outline: "none", boxSizing: "border-box" }} />
      </div>
      <div style={{ maxHeight: 360, overflowY: "auto", padding: "8px 4px" }}>
        {Object.entries(tree).map(([k, v]) => <TreeNode key={k} name={k} node={v} />)}
        {files.length === 0 && <div style={{ color: C.muted, fontSize: 12, padding: "16px", textAlign: "center" }}>No files found</div>}
      </div>
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "8px 14px", color: C.muted, fontSize: 11 }}>
        {files.length} file{files.length !== 1 ? "s" : ""} · {humanSize(pack.size)}
      </div>
    </div>
  );
}

function ConflictResolver({ conflicts, packs, overrides, onOverride }) {
  const entries = Object.entries(conflicts);
  const realConflicts = entries.filter(([, c]) => !c.identical);
  const identical = entries.filter(([, c]) => c.identical);
  const [showIdentical, setShowIdentical] = useState(false);

  if (!entries.length) return (
    <div style={{ textAlign: "center", color: C.accent, fontSize: 13, padding: "24px 0" }}>✓ No conflicts, all files are unique across packs</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {realConflicts.length > 0 && (
        <div style={{ background: C.warningDim, border: `1px solid ${C.warningBorder}`, borderRadius: 10, padding: "10px 14px", color: C.warning, fontSize: 12 }}>
          ⚠️ {realConflicts.length} real conflict{realConflicts.length !== 1 ? "s" : ""}, choose which pack wins per file or keep the default (top pack).
        </div>
      )}
      {realConflicts.map(([path, conflict]) => (
        <div key={path} style={{ background: C.elevated, border: `1px solid ${C.borderMid}`, borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ color: C.secondary, fontSize: 11, fontFamily: mono, marginBottom: 10, wordBreak: "break-all" }}>{path}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {packs.filter(p => p.data[path]).map(p => {
              const isSelected = (overrides[path] ?? conflict.winnerId) === p.id;
              return (
                <button key={p.id} onClick={() => onOverride(path, p.id)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: isSelected ? C.accentDim : C.subtle, border: `1px solid ${isSelected ? C.accentBorder : C.border}`, borderRadius: 8, cursor: "pointer", textAlign: "left" }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${isSelected ? C.accent : C.muted}`, background: isSelected ? C.accent : "transparent", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: isSelected ? 700 : 400, color: isSelected ? C.accent : C.secondary, fontFamily: font }}>{p.name}</span>
                  {isSelected && <span style={{ marginLeft: "auto", fontSize: 10, color: C.accent }}>WINS</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {identical.length > 0 && (
        <div>
          <button onClick={() => setShowIdentical(v => !v)} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, cursor: "pointer", padding: 0 }}>
            {showIdentical ? "▾" : "▸"} {identical.length} identical file{identical.length !== 1 ? "s" : ""} (same content, no real conflict)
          </button>
          {showIdentical && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              {identical.map(([path]) => (
                <div key={path} style={{ fontSize: 11, fontFamily: mono, color: C.muted, padding: "2px 0" }}>✓ {path}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ManifestEditor({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: C.infoDim, border: `1px solid ${C.infoBorder}`, borderRadius: 10, padding: "10px 14px", color: C.info, fontSize: 12 }}>
        ℹ️ Edit the merged pack's metadata. These changes are applied on download.
      </div>
      {[
        { key: "name", label: "Pack name", placeholder: "My Merged Pack" },
        { key: "description", label: "Description", placeholder: "Merged resource pack" },
        { key: "version", label: "Version", placeholder: "1.0.0" },
      ].map(({ key, label, placeholder }) => (
        <div key={key}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.secondary, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>
          <input value={value[key] || ""} onChange={e => onChange({ ...value, [key]: e.target.value })} placeholder={placeholder}
            style={{ width: "100%", background: C.elevated, border: `1px solid ${C.borderMid}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box" }} />
        </div>
      ))}
    </div>
  );
}

const TABS = [
  { id: "packs", label: "Packs" },
  { id: "browser", label: "Browse" },
  { id: "conflicts", label: "Conflicts" },
  { id: "manifest", label: "Manifest" },
];

export default function RPEditor() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [manifestEdit, setManifestEdit] = useState({ name: "", description: "", version: "" });
  const [activeTab, setActiveTab] = useState("packs");
  const [merging, setMerging] = useState(false);

  const addFiles = useCallback(async (files) => {
    setError(null); setResult(null); setLoading(true);
    try {
      const parsed = await Promise.all([...files].map(parsePack));
      setPacks(prev => [...prev, ...parsed]);
    } catch (e) { setError("Could not read one of the files. Make sure they are valid resource packs."); }
    setLoading(false);
  }, []);

  const remove = id => { setPacks(prev => prev.filter(p => p.id !== id)); setResult(null); setOverrides({}); };
  const moveUp = i => setPacks(prev => { const a = [...prev]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; });
  const moveDown = i => setPacks(prev => { const a = [...prev]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a; });

  const doMerge = useCallback(async (currentOverrides = overrides) => {
    setMerging(true); setError(null);
    try {
      const { merged, conflicts } = await buildMerged(packs, currentOverrides);

      const manifestKey = Object.keys(merged).find(k => k === "manifest.json" || k.endsWith("/manifest.json"));
      if (manifestKey) {
        try {
          const m = JSON.parse(new TextDecoder().decode(merged[manifestKey]));
          const allBytes = Object.values(merged).reduce((acc, b) => { const c = new Uint8Array(acc.length + b.length); c.set(acc); c.set(b, acc.length); return c; }, new Uint8Array(0));
          const hash = await sha256Hex(allBytes);
          if (m?.header) {
            m.header.uuid = hexToUuid(hash);
            if (manifestEdit.name) m.header.name = manifestEdit.name;
            if (manifestEdit.description) m.header.description = manifestEdit.description;
            if (manifestEdit.version) {
              const parts = manifestEdit.version.split(".").map(Number);
              if (parts.length === 3 && parts.every(n => !isNaN(n))) m.header.version = parts;
            }
          }
          merged[manifestKey] = new TextEncoder().encode(JSON.stringify(m, null, 2));

          if (!manifestEdit.name && m?.header?.name) setManifestEdit(prev => ({ ...prev, name: prev.name || m.header.name, description: prev.description || m.header.description || "", version: prev.version || (m.header.version?.join(".") ?? "1.0.0") }));
        } catch { }
      }

      const zip = zipSync(merged, { level: 6 });
      const blob = new Blob([zip], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const filename = `mccompanionpack_${packs.length}packs_${date}.mcpack`;
      const totalFiles = Object.keys(merged).filter(k => !k.endsWith("/")).length;

      if (result?.url) URL.revokeObjectURL(result.url);
      setResult({ conflicts, url, filename, totalFiles, size: zip.length });
      if (activeTab === "packs") setActiveTab("conflicts");
    } catch (e) { setError("Merge failed: " + e.message); }
    setMerging(false);
  }, [packs, overrides, manifestEdit, result, activeTab]);

  const handleOverride = useCallback((path, packId) => {
    const next = { ...overrides, [path]: packId };
    setOverrides(next);
    doMerge(next);
  }, [overrides, doMerge]);

  const canMerge = packs.length >= 2 && !loading && !merging;
  const hasResult = !!result;
  const conflictCount = result ? Object.values(result.conflicts).filter(c => !c.identical).length : 0;
  const allWarnings = packs.flatMap(p => p.warnings.map(w => ({ ...w, packName: p.name })));

  const visibleTabs = TABS.filter(t => {
    if (t.id === "browser") return packs.length > 0;
    if (t.id === "conflicts" || t.id === "manifest") return hasResult;
    return true;
  });

  return (
    <Layout title="RP Editor" description="Merge multiple Minecraft resource packs into one">
      <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 16px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.accentDim, border: `1px solid ${C.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🧩</div>
            <div>
              <h1 style={{ color: C.text, fontSize: 22, fontWeight: 800, margin: 0 }}>Resource Pack Editor</h1>
              <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>Combine multiple Minecraft resource packs into one .mcpack</p>
            </div>
          </div>

          {visibleTabs.length > 1 && <div style={{ display: "flex", gap: 2, background: C.subtle, borderRadius: 10, padding: 3, border: `1px solid ${C.border}`, marginBottom: 20 }}>
            {visibleTabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ flex: 1, padding: "7px 10px", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer", fontFamily: font, background: activeTab === t.id ? C.accent : "transparent", color: activeTab === t.id ? "#0d1a18" : C.secondary, transition: "all 0.15s", whiteSpace: "nowrap", position: "relative" }}>
                {t.label}
                {t.id === "conflicts" && conflictCount > 0 && (
                  <span style={{ marginLeft: 5, background: C.warning, color: "#000", borderRadius: 10, padding: "0 5px", fontSize: 10, fontWeight: 700 }}>{conflictCount}</span>
                )}
              </button>
            ))}
          </div>}

          {error && (
            <div style={{ background: C.dangerDim, border: `1px solid ${C.dangerBorder}`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: C.danger, fontSize: 13 }}>{error}</div>
          )}

          {activeTab === "packs" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <DropZone onFiles={addFiles} disabled={loading || merging} />

              {loading && <div style={{ textAlign: "center", color: C.muted, fontSize: 13 }}>Loading packs…</div>}

              {allWarnings.length > 0 && (
                <div style={{ background: C.warningDim, border: `1px solid ${C.warningBorder}`, borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ color: C.warning, fontWeight: 700, fontSize: 12, marginBottom: 6 }}>⚠️ Validation warnings</div>
                  {allWarnings.map((w, i) => (
                    <div key={i} style={{ fontSize: 12, color: C.secondary, marginBottom: 2 }}>
                      <span style={{ color: w.type === "error" ? C.danger : C.warning }}>{w.packName}:</span> {w.msg}
                    </div>
                  ))}
                </div>
              )}

              {packs.length > 0 && (
                <>
                  <div style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {packs.length} pack{packs.length !== 1 ? "s" : ""}, top has highest priority
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {packs.map((pack, i) => (
                      <PackCard key={pack.id} pack={pack} index={i} total={packs.length} onRemove={() => remove(pack.id)} onMoveUp={() => moveUp(i)} onMoveDown={() => moveDown(i)} />
                    ))}
                  </div>
                </>
              )}

              {packs.length >= 2 && (
                <button onClick={() => doMerge()} disabled={!canMerge}
                  style={{ width: "100%", background: canMerge ? C.accent : C.subtle, color: canMerge ? "#000" : C.muted, border: "none", borderRadius: 12, padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: canMerge ? "pointer" : "default", transition: "all 0.15s" }}>
                  {merging ? "Merging…" : `Merge ${packs.length} packs →`}
                </button>
              )}

              {packs.length === 0 && !loading && (
                <div style={{ textAlign: "center", color: C.muted, fontSize: 13, padding: "16px 0" }}>Add at least 2 packs to get started</div>
              )}
            </div>
          )}

          {activeTab === "browser" && packs.length > 0 && <FileBrowser packs={packs} />}

          {activeTab === "conflicts" && result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <ConflictResolver conflicts={result.conflicts} packs={packs} overrides={overrides} onOverride={handleOverride} />
              {merging && <div style={{ textAlign: "center", color: C.muted, fontSize: 12 }}>Re-merging…</div>}
            </div>
          )}

          {activeTab === "manifest" && result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <ManifestEditor value={manifestEdit} onChange={v => { setManifestEdit(v); }} />
              <button onClick={() => doMerge()} disabled={merging}
                style={{ background: merging ? C.subtle : C.accent, color: merging ? C.muted : "#000", border: "none", borderRadius: 10, padding: "11px 0", fontSize: 13, fontWeight: 700, cursor: merging ? "default" : "pointer" }}>
                {merging ? "Applying…" : "Apply changes"}
              </button>
            </div>
          )}

          {result && (
            <div style={{ marginTop: 20, background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: C.accent, fontWeight: 700, fontSize: 14 }}>✅ Ready to download</div>
                  <div style={{ color: C.secondary, fontSize: 12, marginTop: 2 }}>
                    {result.totalFiles} files · {humanSize(result.size)}
                    {conflictCount > 0 && ` · ${conflictCount} conflict${conflictCount !== 1 ? "s" : ""}`}
                    {Object.values(result.conflicts).filter(c => c.identical).length > 0 && ` · ${Object.values(result.conflicts).filter(c => c.identical).length} identical`}
                  </div>
                </div>
                <a href={result.url} download={result.filename}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.accent, color: "#000", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, textDecoration: "none", flexShrink: 0 }}>
                  ⬇️ {result.filename}
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
