import { useState, useRef, useCallback } from "react";
import Layout from "@theme/Layout";
import { unzipSync, zipSync, strToU8 } from "fflate";

const C = {
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
  accentDim: "rgba(103,228,4,0.08)",
  accentBorder: "rgba(103,228,4,0.22)",
  danger: "#f87171",
  dangerDim: "rgba(248,113,113,0.08)",
  warning: "#fbbf24",
};

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function readFileAsArrayBuffer(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsArrayBuffer(file);
  });
}

async function parsePack(file) {
  const buf = await readFileAsArrayBuffer(file);
  const data = unzipSync(new Uint8Array(buf));
  const paths = Object.keys(data);

  let name = file.name.replace(/\.zip$/i, "");
  for (const key of ["manifest.json", "pack_manifest.json"]) {
    const match = paths.find(p => p === key || p.endsWith("/" + key));
    if (match) {
      try {
        const json = JSON.parse(new TextDecoder().decode(data[match]));
        const n = json?.header?.name || json?.name;
        if (n) name = n;
      } catch { }
      break;
    }
  }

  let iconUrl = null;
  const iconKey = paths.find(p => p === "pack_icon.png" || p.endsWith("/pack_icon.png"));
  if (iconKey) {
    const blob = new Blob([data[iconKey]], { type: "image/png" });
    iconUrl = URL.createObjectURL(blob);
  }

  const fileCount = paths.filter(p => !p.endsWith("/")).length;
  return { id: crypto.randomUUID(), file, name, data, paths, fileCount, size: file.size, iconUrl };
}

async function sha256Hex(bytes) {
  const buf = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function hexToUuid(hex) {
  const h = hex.padEnd(32, "0").slice(0, 32);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

async function mergePacks(packs) {
  const merged = {};
  const conflicts = {};

  for (let i = packs.length - 1; i >= 0; i--) {
    const pack = packs[i];
    for (const [path, bytes] of Object.entries(pack.data)) {
      if (path.endsWith("/")) continue;
      if (merged[path] !== undefined) {
        if (!conflicts[path]) conflicts[path] = [];
        conflicts[path].push(pack.name);
      }
      merged[path] = bytes;
    }
  }

  for (const [path, losers] of Object.entries(conflicts)) {
    const winner = packs.find(p => p.data[path])?.name ?? "unknown";
    conflicts[path] = { winner, losers };
  }

  const manifestKey = Object.keys(merged).find(k => k === "manifest.json" || k.endsWith("/manifest.json"));
  if (manifestKey) {
    try {
      const allBytes = Object.values(merged).reduce((acc, b) => {
        const combined = new Uint8Array(acc.length + b.length);
        combined.set(acc);
        combined.set(b, acc.length);
        return combined;
      }, new Uint8Array(0));
      const hash = await sha256Hex(allBytes);
      const newUuid = hexToUuid(hash);
      const manifest = JSON.parse(new TextDecoder().decode(merged[manifestKey]));
      if (manifest?.header) manifest.header.uuid = newUuid;
      merged[manifestKey] = new TextEncoder().encode(JSON.stringify(manifest));
    } catch { }
  }

  return { merged, conflicts };
}

function DropZone({ onFiles, disabled }) {
  const [over, setOver] = useState(false);
  const input = useRef();

  const handle = useCallback(async (files) => {
    const zips = [...files].filter(f => f.name.endsWith(".zip") || f.name.endsWith(".mcpack"));
    if (zips.length) onFiles(zips);
  }, [onFiles]);

  return (
    <div
      onClick={() => !disabled && input.current?.click()}
      onDragOver={e => { e.preventDefault(); if (!disabled) setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); if (!disabled) handle(e.dataTransfer.files); }}
      style={{
        border: `2px dashed ${over ? C.accent : C.borderMid}`,
        borderRadius: 16,
        padding: "40px 24px",
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        background: over ? C.accentDim : C.surface,
        transition: "all 0.15s",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <input
        ref={input}
        type="file"
        accept=".zip,.mcpack"
        multiple
        style={{ display: "none" }}
        onChange={e => handle(e.target.files)}
      />
      <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
      <div style={{ color: C.text, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
        Drop resource packs here
      </div>
      <div style={{ color: C.muted, fontSize: 13 }}>
        .zip or .mcpack — up to 4 packs
      </div>
    </div>
  );
}

function PackCard({ pack, index, total, onRemove, onMoveUp, onMoveDown }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      background: C.elevated,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: "14px 16px",
    }}>
      {/* icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 10, flexShrink: 0,
        background: C.subtle, overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `1px solid ${C.border}`,
      }}>
        {pack.iconUrl
          ? <img src={pack.iconUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: 22 }}>🗂️</span>}
      </div>

      {/* info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: C.text, fontWeight: 700, fontSize: 14, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {pack.name}
        </div>
        <div style={{ color: C.muted, fontSize: 12 }}>
          {pack.fileCount} files · {humanSize(pack.size)}
        </div>
      </div>

      {/* priority badge */}
      <div style={{
        background: index === 0 ? C.accentDim : C.subtle,
        border: `1px solid ${index === 0 ? C.accentBorder : C.border}`,
        borderRadius: 8, padding: "3px 10px",
        color: index === 0 ? C.accent : C.muted,
        fontSize: 11, fontWeight: 700, flexShrink: 0,
      }}>
        {index === 0 ? "HIGHEST" : `#${index + 1}`}
      </div>

      {/* reorder */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
        <button onClick={onMoveUp} disabled={index === 0} style={btnStyle(index !== 0)}>▲</button>
        <button onClick={onMoveDown} disabled={index === total - 1} style={btnStyle(index !== total - 1)}>▼</button>
      </div>

      {/* remove */}
      <button onClick={onRemove} style={{ ...btnStyle(true), color: C.danger }}>✕</button>
    </div>
  );
}

function btnStyle(active) {
  return {
    background: "none",
    border: `1px solid ${active ? C.borderMid : C.border}`,
    borderRadius: 7,
    color: active ? C.secondary : C.muted,
    width: 28, height: 28,
    cursor: active ? "pointer" : "default",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, padding: 0,
    opacity: active ? 1 : 0.3,
  };
}

function ConflictList({ conflicts }) {
  const entries = Object.entries(conflicts);
  if (!entries.length) return null;
  return (
    <div style={{
      background: "rgba(251,191,36,0.06)",
      border: `1px solid rgba(251,191,36,0.20)`,
      borderRadius: 12, padding: "14px 16px", marginTop: 16,
    }}>
      <div style={{ color: C.warning, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
        ⚠️ {entries.length} conflict{entries.length !== 1 ? "s" : ""} resolved
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
        {entries.map(([path, { winner, losers }]) => (
          <div key={path} style={{ fontSize: 11, color: C.secondary }}>
            <span style={{ color: C.text, fontFamily: "monospace" }}>{path}</span>
            {" — "}
            <span style={{ color: C.accent }}>{winner}</span>
            {" wins over "}
            <span style={{ color: C.muted }}>{losers.join(", ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RPEditor() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const addFiles = useCallback(async (files) => {
    setError(null);
    setResult(null);
    const remaining = 4 - packs.length;
    if (remaining <= 0) { setError("Maximum 4 packs."); return; }
    const toAdd = [...files].slice(0, remaining);
    setLoading(true);
    try {
      const parsed = await Promise.all(toAdd.map(parsePack));
      setPacks(prev => [...prev, ...parsed]);
    } catch (e) {
      setError("Could not read one of the ZIPs. Make sure they are valid resource packs.");
    }
    setLoading(false);
  }, [packs.length]);

  const remove = (id) => {
    setPacks(prev => prev.filter(p => p.id !== id));
    setResult(null);
  };

  const moveUp = (i) => setPacks(prev => {
    const a = [...prev];
    [a[i - 1], a[i]] = [a[i], a[i - 1]];
    return a;
  });

  const moveDown = (i) => setPacks(prev => {
    const a = [...prev];
    [a[i], a[i + 1]] = [a[i + 1], a[i]];
    return a;
  });

  const merge = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { merged, conflicts } = await mergePacks(packs);
      const zip = zipSync(merged, { level: 6 });
      const blob = new Blob([zip], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const names = packs.map(p => p.name.replace(/[^a-z0-9]/gi, "_").slice(0, 12)).join("+");
      setResult({ conflicts, url, filename: `merged_${names}.zip` });
    } catch (e) {
      setError("Merge failed: " + e.message);
    }
    setLoading(false);
  }, [packs]);

  const canMerge = packs.length >= 2 && !loading;

  return (
    <Layout
      title="RP Merger"
      description="Merge multiple Minecraft resource packs into one"
    >
      <div style={{ background: C.bg, minHeight: "100vh", padding: "48px 16px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          {/* header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: C.accentDim, border: `1px solid ${C.accentBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>🧩</div>
              <div>
                <h1 style={{ color: C.text, fontSize: 24, fontWeight: 800, margin: 0 }}>RP Merger</h1>
                <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>Combine 2–4 Minecraft resource packs into one</p>
              </div>
            </div>
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "10px 14px",
              color: C.secondary, fontSize: 12, lineHeight: 1.6,
            }}>
              The pack at the <strong style={{ color: C.text }}>top</strong> has the highest priority — its files win when there's a conflict.
              Drag packs in to reorder priority.
            </div>
          </div>

          {/* drop zone */}
          {packs.length < 4 && (
            <div style={{ marginBottom: 20 }}>
              <DropZone onFiles={addFiles} disabled={loading || packs.length >= 4} />
            </div>
          )}

          {/* error */}
          {error && (
            <div style={{
              background: C.dangerDim, border: `1px solid rgba(248,113,113,0.25)`,
              borderRadius: 10, padding: "10px 14px", marginBottom: 16,
              color: C.danger, fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {/* pack list */}
          {packs.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {packs.map((pack, i) => (
                <PackCard
                  key={pack.id}
                  pack={pack}
                  index={i}
                  total={packs.length}
                  onRemove={() => remove(pack.id)}
                  onMoveUp={() => moveUp(i)}
                  onMoveDown={() => moveDown(i)}
                />
              ))}
            </div>
          )}

          {/* merge button */}
          {packs.length >= 2 && (
            <button
              onClick={merge}
              disabled={!canMerge}
              style={{
                width: "100%",
                background: canMerge ? C.accent : C.subtle,
                color: canMerge ? "#000" : C.muted,
                border: "none", borderRadius: 12,
                padding: "14px 0", fontSize: 15, fontWeight: 700,
                cursor: canMerge ? "pointer" : "default",
                transition: "all 0.15s", marginBottom: 16,
              }}
            >
              {loading ? "Working…" : `Merge ${packs.length} packs`}
            </button>
          )}

          {/* result */}
          {result && (
            <div style={{
              background: C.accentDim, border: `1px solid ${C.accentBorder}`,
              borderRadius: 14, padding: "18px 20px",
            }}>
              <div style={{ color: C.accent, fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
                ✅ Merge complete!
              </div>
              <a
                href={result.url}
                download={result.filename}
                style={{
                  display: "block", textAlign: "center",
                  background: C.accent, color: "#000",
                  borderRadius: 10, padding: "12px 0",
                  fontWeight: 700, fontSize: 14, textDecoration: "none",
                  marginBottom: 4,
                }}
              >
                ⬇️ Download {result.filename}
              </a>
              <ConflictList conflicts={result.conflicts} />
            </div>
          )}

          {/* empty hint */}
          {packs.length === 0 && !loading && (
            <div style={{ textAlign: "center", color: C.muted, fontSize: 13, marginTop: 32 }}>
              Add at least 2 packs to get started
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
