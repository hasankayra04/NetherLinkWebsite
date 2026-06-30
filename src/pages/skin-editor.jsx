import { useState, useRef, useEffect, useCallback } from "react";
import Layout from "@theme/Layout";
import { useLocation } from "@docusaurus/router";
import { useAuth } from "../useAuth";

const C = {
  bg: "#0d1117", surface: "#131820", elevated: "#191f2b", subtle: "#1f2635",
  border: "rgba(255,255,255,0.06)", borderMid: "rgba(255,255,255,0.11)",
  text: "#eaecf0", secondary: "#8d97aa", muted: "#4a5270",
  accent: "#67e404", accentDim: "rgba(103,228,4,0.08)", accentBorder: "rgba(103,228,4,0.22)",
  danger: "#f87171", dangerDim: "rgba(248,113,113,0.08)", dangerBorder: "rgba(248,113,113,0.25)",
};
const font = "Inter,system-ui,sans-serif";
const API = "https://api.mccompanion.net";
const DEBOUNCE_MS = 200;
const CANVAS_SIZE = 64;
const DISPLAY_SIZE = 512;
const STEVE_SKIN_URL = "https://textures.minecraft.net/texture/31f477eb1a7beee631c2ca64d06f8f68fa93a3386d04452ab27f43acdf1b60cb";

function Btn({ children, onClick, disabled, variant = "default", small, style }) {
  const base = {
    fontFamily: font, fontWeight: 500, border: "none", borderRadius: 8,
    cursor: disabled ? "not-allowed" : "pointer", transition: "opacity .15s",
    opacity: disabled ? 0.45 : 1,
    padding: small ? "6px 12px" : "9px 18px",
    fontSize: small ? 13 : 14,
    display: "inline-flex", alignItems: "center", gap: 6,
  };
  const variants = {
    default: { background: C.elevated, color: C.text, border: `1px solid ${C.border}` },
    accent: { background: C.accent, color: "#000" },
    danger: { background: C.dangerDim, color: C.danger, border: `1px solid ${C.dangerBorder}` },
    ghost: { background: "transparent", color: C.secondary, border: `1px solid ${C.border}` },
  };
  return (
    <button type="button" style={{ ...base, ...variants[variant], ...style }} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

const SKIN_REGIONS = [
  { label: "Head", x: 0, y: 0, w: 32, h: 16, color: "#ff6b6b" },
  { label: "Body", x: 16, y: 16, w: 24, h: 16, color: "#4ecdc4" },
  { label: "R.Leg", x: 0, y: 16, w: 16, h: 16, color: "#feca57" },
  { label: "R.Arm", x: 40, y: 16, w: 16, h: 16, color: "#45b7d1" },
  { label: "L.Leg", x: 16, y: 48, w: 16, h: 16, color: "#ff9ff3" },
  { label: "L.Arm", x: 32, y: 48, w: 16, h: 16, color: "#96ceb4" },
  { label: "Hat", x: 32, y: 0, w: 32, h: 16, color: "#ff6b6b" },
  { label: "Jacket", x: 16, y: 32, w: 24, h: 16, color: "#4ecdc4" },
  { label: "R.Leg OL", x: 0, y: 32, w: 16, h: 16, color: "#feca57" },
  { label: "R.Arm OL", x: 40, y: 32, w: 16, h: 16, color: "#45b7d1" },
  { label: "L.Leg OL", x: 0, y: 48, w: 16, h: 16, color: "#ff9ff3" },
  { label: "L.Arm OL", x: 48, y: 48, w: 16, h: 16, color: "#96ceb4" },
];

function UVEditor({ bufferRef, onUpdate, renderRef }) {
  const displayRef = useRef(null);
  const containerRef = useRef(null);
  const [tool, setTool] = useState("draw");
  const [color, setColor] = useState("#ff0000");
  const [brushSize, setBrushSize] = useState(1);
  const [fitZoom, setFitZoom] = useState(1);
  const [zoomOffset, setZoomOffset] = useState(0);
  const zoom = Math.max(0.25, Math.min(6, +(fitZoom + zoomOffset).toFixed(2)));
  const [showGuide, setShowGuide] = useState(true);
  const lineStart = useRef(null);
  const lineSnapshot = useRef(null);
  const [recentColors, setRecentColors] = useState([]);
  const undoStack = useRef([]);
  const isDrawing = useRef(false);

  useEffect(() => {
    function recalc() {
      const col = containerRef.current?.closest('[data-uvcol]');
      const el = col ?? containerRef.current?.parentElement;
      if (!el) return;
      const w = el.clientWidth - 4;
      const h = window.innerHeight - 340;
      const fit = Math.floor(Math.min(w, h) / DISPLAY_SIZE * 8) / 8;
      setFitZoom(Math.max(0.25, Math.min(4, fit)));
    }
    const t = setTimeout(recalc, 50);
    const col = containerRef.current?.closest('[data-uvcol]') ?? containerRef.current?.parentElement;
    const ro = col && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(recalc) : null;
    if (ro && col) ro.observe(col);
    window.addEventListener('resize', recalc);
    return () => { clearTimeout(t); ro?.disconnect(); window.removeEventListener('resize', recalc); };
  }, []);

  const renderDisplay = useCallback(() => {
    const display = displayRef.current;
    const buf = bufferRef.current;
    if (!display || !buf) return;
    const size = DISPLAY_SIZE * zoom;
    display.width = size;
    display.height = size;
    const ctx = display.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const px = size / CANVAS_SIZE;
    for (let y = 0; y < CANVAS_SIZE; y++) {
      for (let x = 0; x < CANVAS_SIZE; x++) {
        ctx.fillStyle = ((x + y) % 2 === 0) ? "#2a2a2a" : "#1a1a1a";
        ctx.fillRect(x * px, y * px, px, px);
      }
    }
    ctx.drawImage(buf, 0, 0, size, size);
    if (showGuide) {
      const fontSize = Math.max(8, Math.min(px * 2.5, 14));
      ctx.font = `bold ${fontSize}px monospace`;
      ctx.textBaseline = "top";
      SKIN_REGIONS.forEach(({ label, x, y, w, h, color: rc }) => {
        const rx = x * px, ry = y * px, rw = w * px, rh = h * px;
        ctx.strokeStyle = rc + "dd";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rx + 0.75, ry + 0.75, rw - 1.5, rh - 1.5);
        ctx.fillStyle = rc + "cc";
        ctx.fillText(label, rx + 3, ry + 3);
      });
    }
    if (zoom >= 0.75) {
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= CANVAS_SIZE; i++) {
        ctx.beginPath(); ctx.moveTo(i * px, 0); ctx.lineTo(i * px, size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * px); ctx.lineTo(size, i * px); ctx.stroke();
      }
    }
  }, [zoom, showGuide, bufferRef]);

  useEffect(() => { renderDisplay(); }, [renderDisplay]);
  if (renderRef) renderRef.current = renderDisplay;

  function getPixel(ctx, x, y) {
    const d = ctx.getImageData(x, y, 1, 1).data;
    return [d[0], d[1], d[2], d[3]];
  }

  function paintAt(cx, cy) {
    const buf = bufferRef.current;
    if (!buf) return;
    const ctx = buf.getContext("2d");
    const px = CANVAS_SIZE / (DISPLAY_SIZE * zoom);
    const tx = Math.floor(cx * px);
    const ty = Math.floor(cy * px);
    if (tx < 0 || tx >= CANVAS_SIZE || ty < 0 || ty >= CANVAS_SIZE) return;
    if (tool === "erase") {
      const half = Math.floor(brushSize / 2);
      ctx.clearRect(tx - half, ty - half, brushSize, brushSize);
    } else if (tool === "draw") {
      ctx.fillStyle = color;
      const half = Math.floor(brushSize / 2);
      ctx.fillRect(tx - half, ty - half, brushSize, brushSize);
    }
    renderDisplay();
    if (onUpdate) onUpdate();
  }

  function floodFill(cx, cy) {
    const buf = bufferRef.current;
    if (!buf) return;
    const ctx = buf.getContext("2d");
    const px = CANVAS_SIZE / (DISPLAY_SIZE * zoom);
    const tx = Math.floor(cx * px);
    const ty = Math.floor(cy * px);
    if (tx < 0 || tx >= CANVAS_SIZE || ty < 0 || ty >= CANVAS_SIZE) return;
    const imgData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const data = imgData.data;
    const idx = (y, x) => (y * CANVAS_SIZE + x) * 4;
    const [tr, tg, tb, ta] = data.slice(idx(ty, tx), idx(ty, tx) + 4);
    const fc = parseInt(color.slice(1), 16);
    const fr = (fc >> 16) & 255, fg = (fc >> 8) & 255, fb = fc & 255, fa = 255;
    if (tr === fr && tg === fg && tb === fb && ta === fa) return;
    const stack = [[tx, ty]];
    while (stack.length) {
      const [x, y] = stack.pop();
      if (x < 0 || x >= CANVAS_SIZE || y < 0 || y >= CANVAS_SIZE) continue;
      const i = idx(y, x);
      if (data[i] !== tr || data[i+1] !== tg || data[i+2] !== tb || data[i+3] !== ta) continue;
      data[i] = fr; data[i+1] = fg; data[i+2] = fb; data[i+3] = fa;
      stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
    }
    ctx.putImageData(imgData, 0, 0);
    renderDisplay();
    if (onUpdate) onUpdate();
  }

  function getPos(e) {
    const rect = displayRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return [clientX - rect.left, clientY - rect.top];
  }

  function onPointerDown(e) {
    e.preventDefault();
    const [cx, cy] = getPos(e);
    if (tool === "fill") { floodFill(cx, cy); return; }
    if (tool === "line") {
      const buf = bufferRef.current;
      if (buf) { const ctx = buf.getContext("2d"); lineSnapshot.current = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE); }
      lineStart.current = [cx, cy];
      return;
    }
    isDrawing.current = true;
    paintAt(cx, cy);
  }

  function onPointerMove(e) {
    e.preventDefault();
    if (!isDrawing.current) return;
    const [cx, cy] = getPos(e);
    paintAt(cx, cy);
  }

  function onPointerUp(e) {
    isDrawing.current = false;
    if (tool === "line" && lineStart.current) {
      const [cx, cy] = getPos(e);
      const buf = bufferRef.current;
      if (buf && lineSnapshot.current) {
        const ctx = buf.getContext("2d");
        ctx.putImageData(lineSnapshot.current, 0, 0);
        const px = CANVAS_SIZE / (DISPLAY_SIZE * zoom);
        const x0 = Math.floor(lineStart.current[0] * px);
        const y0 = Math.floor(lineStart.current[1] * px);
        const x1 = Math.floor(cx * px);
        const y1 = Math.floor(cy * px);
        let dx = Math.abs(x1-x0), dy = Math.abs(y1-y0);
        let sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
        let err = dx - dy, lx = x0, ly = y0;
        ctx.fillStyle = color;
        while (true) {
          ctx.fillRect(lx, ly, brushSize, brushSize);
          if (lx === x1 && ly === y1) break;
          const e2 = 2 * err;
          if (e2 > -dy) { err -= dy; lx += sx; }
          if (e2 < dx) { err += dx; ly += sy; }
        }
        lineStart.current = null;
        lineSnapshot.current = null;
        renderDisplay();
        if (onUpdate) onUpdate();
      }
    }
  }

  function undo() {
    if (!undoStack.current.length) return;
    const buf = bufferRef.current;
    if (!buf) return;
    const ctx = buf.getContext("2d");
    ctx.putImageData(undoStack.current.pop(), 0, 0);
    renderDisplay();
    if (onUpdate) onUpdate();
  }

  function clearCanvas() {
    const buf = bufferRef.current;
    if (!buf) return;
    const ctx = buf.getContext("2d");
    const snap = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    undoStack.current.push(snap);
    if (undoStack.current.length > 20) undoStack.current.shift();
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    renderDisplay();
    if (onUpdate) onUpdate();
  }

  const toolBtn = (t, icon) => (
    <button type="button" onClick={() => setTool(t)} title={t}
      style={{ background: tool === t ? C.accent : C.elevated, color: tool === t ? "#000" : C.secondary, border: `1px solid ${tool === t ? C.accent : C.border}`, borderRadius: 7, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
      {icon}
    </button>
  );

  return (
    <div ref={containerRef}>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {toolBtn("draw", "✏️")}
        {toolBtn("erase", "🧹")}
        {toolBtn("fill", "🪣")}
        {toolBtn("line", "📏")}
        <input type="color" value={color} onChange={e => { setColor(e.target.value); setRecentColors(prev => [e.target.value, ...prev.filter(c => c !== e.target.value)].slice(0, 8)); }}
          style={{ width: 30, height: 30, border: "none", borderRadius: 7, cursor: "pointer", padding: 2, background: C.elevated }} />
        {recentColors.map(rc => (
          <button key={rc} type="button" onClick={() => setColor(rc)}
            style={{ width: 22, height: 22, background: rc, border: color === rc ? `2px solid ${C.accent}` : `1px solid ${C.border}`, borderRadius: 5, cursor: "pointer", padding: 0 }} />
        ))}
        {[1, 2, 4].map(s => (
          <button key={s} type="button" onClick={() => setBrushSize(s)}
            style={{ background: brushSize === s ? C.accent : C.elevated, color: brushSize === s ? "#000" : C.secondary, border: `1px solid ${brushSize === s ? C.accent : C.border}`, borderRadius: 7, minWidth: 30, height: 30, cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: font }}>
            {s}px
          </button>
        ))}
        <button type="button" onClick={() => setShowGuide(v => !v)}
          style={{ background: showGuide ? C.accent : C.elevated, color: showGuide ? "#000" : C.secondary, border: `1px solid ${showGuide ? C.accent : C.border}`, borderRadius: 7, padding: "0 10px", height: 30, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: font }}>
          Guide
        </button>
        <button type="button" onClick={undo} style={{ background: C.elevated, color: C.secondary, border: `1px solid ${C.border}`, borderRadius: 7, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>↩</button>
        <button type="button" onClick={clearCanvas} style={{ background: C.elevated, color: C.secondary, border: `1px solid ${C.border}`, borderRadius: 7, padding: "0 10px", height: 30, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: font }}>Clear</button>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
          <button type="button" onClick={() => setZoomOffset(z => Math.max(-fitZoom + 0.25, z - 0.25))} style={{ background: C.elevated, color: C.secondary, border: `1px solid ${C.border}`, borderRadius: 7, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>−</button>
          <span style={{ fontFamily: font, fontSize: 12, color: C.secondary, minWidth: 36, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoomOffset(z => Math.min(6 - fitZoom, z + 0.25))} style={{ background: C.elevated, color: C.secondary, border: `1px solid ${C.border}`, borderRadius: 7, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>+</button>
        </div>
      </div>
      <div style={{ overflow: "auto", maxHeight: "calc(100vh - 300px)", border: `1px solid ${C.border}`, borderRadius: 10, cursor: tool === "fill" ? "crosshair" : "crosshair" }}>
        <canvas ref={displayRef}
          onMouseDown={onPointerDown} onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={() => { isDrawing.current = false; }}
          onTouchStart={onPointerDown} onTouchMove={onPointerMove} onTouchEnd={onPointerUp}
          style={{ display: "block", imageRendering: "pixelated" }} />
      </div>
    </div>
  );
}

function LiveSkinViewer3D({ getDataUrl, triggerRef, width = 220, height = 320 }) {
  const canvasRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let cancelled = false;
    import("skinview3d").then((skinview3d) => {
      if (cancelled || !canvasRef.current) return;
      const url = getDataUrl();
      const viewer = new skinview3d.SkinViewer({ canvas: canvasRef.current, width, height });
      viewer.autoRotate = true;
      viewer.autoRotateSpeed = 0.4;
      viewerRef.current = viewer;
      if (url) viewer.loadSkin(url).catch(() => {});
      if (triggerRef) {
        triggerRef.current = (dataUrl) => {
          if (viewerRef.current) viewerRef.current.loadSkin(dataUrl).catch(() => {});
        };
      }
    });
    return () => {
      cancelled = true;
      if (viewerRef.current) { viewerRef.current.dispose(); viewerRef.current = null; }
      if (triggerRef) triggerRef.current = null;
    };
  }, []);

  return <canvas ref={canvasRef} width={width} height={height} style={{ display: "block", borderRadius: 10 }} />;
}

export default function SkinEditorPage() {
  const { user, idToken } = useAuth();
  const location = useLocation();

  const [initialSkin, setInitialSkin] = useState(null);
  const [loadingSkin, setLoadingSkin] = useState(false);

  const bufferRef = useRef(null);
  const steveLoadedRef = useRef(false);
  if (!bufferRef.current) {
    const c = document.createElement("canvas");
    c.width = CANVAS_SIZE;
    c.height = CANVAS_SIZE;
    bufferRef.current = c;
  }
  const renderRef = useRef(null);
  const update3DRef = useRef(null);
  const debounceTimer = useRef(null);
  const [skinName, setSkinName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [savedSkinId, setSavedSkinId] = useState(null);
  const [skinIsPublic, setSkinIsPublic] = useState(true);
  const [showNameInput, setShowNameInput] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const skinId = new URLSearchParams(location.search).get("skin");
    if (!skinId) return;
    setLoadingSkin(true);
    fetch(`${API}/api/skins/${skinId}`)
      .then(r => r.ok ? r.json() : null)
      .then(skin => { if (skin) setInitialSkin(skin); })
      .catch(() => {})
      .finally(() => setLoadingSkin(false));
  }, [location.search]);

  useEffect(() => {
    const url = initialSkin?.public_url || STEVE_SKIN_URL;
    const isSteve = !initialSkin?.public_url;
    if (isSteve && steveLoadedRef.current) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!bufferRef.current) return;
      const ctx = bufferRef.current.getContext("2d");
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.drawImage(img, 0, 0);
      if (!isSteve) {
        const isOwn = user && initialSkin.uid === user.uid;
        setSavedSkinId(isOwn ? (initialSkin.id || null) : null);
        setSkinName(isOwn ? (initialSkin.name || "") : "");
        setSkinIsPublic(initialSkin.is_public !== false);
      } else {
        steveLoadedRef.current = true;
      }
      const tryRender = (attempts = 0) => {
        if (renderRef.current) { renderRef.current(); return; }
        if (attempts < 10) setTimeout(() => tryRender(attempts + 1), 30);
      };
      tryRender();
      scheduleUpdate3D();
    };
    img.src = url;
  }, [initialSkin]);

  function getDataUrl() {
    if (!bufferRef.current) return null;
    return bufferRef.current.toDataURL("image/png");
  }

  function scheduleUpdate3D() {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const url = getDataUrl();
      if (url && update3DRef.current) update3DRef.current(url);
    }, DEBOUNCE_MS);
  }

  function downloadPNG() {
    const url = getDataUrl();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${skinName || "skin"}.png`;
    a.click();
  }

  async function doSave(name, isPublic = skinIsPublic) {
    setSaving(true);
    setSaveError(null);
    try {
      const dataUrl = getDataUrl();
      const blob = await (await fetch(dataUrl)).blob();
      const { fetchIdToken } = await import("../firebaseAuthHelpers");
      const freshToken = await fetchIdToken(true) || idToken;
      const presignRes = await fetch(`${API}/api/skins/me/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${freshToken}` },
        body: JSON.stringify({ skinId: savedSkinId || undefined, name }),
      });
      if (!presignRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, r2Key, skinId } = await presignRes.json();
      const putRes = await fetch(uploadUrl, { method: "PUT", body: blob, headers: { "Content-Type": "image/png" } });
      if (!putRes.ok) throw new Error("Upload failed");
      const confirmRes = await fetch(`${API}/api/skins/me/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${freshToken}` },
        body: JSON.stringify({ r2Key, name, isPublic }),
      });
      if (!confirmRes.ok) throw new Error("Failed to confirm upload");
      setSavedSkinId(skinId);
      setSkinName(name);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setShowNameInput(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleSaveClick() {
    if (savedSkinId) {
      doSave(skinName || "My Skin", skinIsPublic);
    } else {
      setShowNameInput(true);
    }
  }

  const title = initialSkin ? `Editing: ${initialSkin.name}` : "Create skin";

  return (
    <Layout title={`${title} | Skin Workshop`}>
      <div style={{ background: C.bg, minHeight: "100vh", fontFamily: font }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <a href="/skins"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, border: `1px solid ${C.borderMid}`, background: C.elevated, color: C.secondary, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              Back to gallery
            </a>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text }}>
              {loadingSkin ? "Loading…" : title}
            </h1>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start" }}>
              <div data-uvcol style={{ minWidth: 0 }}>
                <h3 style={{ fontFamily: font, color: C.text, fontWeight: 700, fontSize: 16, marginTop: 0, marginBottom: 12 }}>2D UV Editor</h3>
                <UVEditor bufferRef={bufferRef} onUpdate={scheduleUpdate3D} renderRef={renderRef} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, flexShrink: 0, position: "sticky", top: 20 }}>
                <h3 style={{ fontFamily: font, color: C.text, fontWeight: 700, fontSize: 16, marginTop: 0, marginBottom: 0 }}>3D Preview</h3>
                <div style={{ background: C.elevated, borderRadius: 14, padding: 16, border: `1px solid ${C.border}` }}>
                  <LiveSkinViewer3D getDataUrl={getDataUrl} triggerRef={update3DRef} width={220} height={320} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                  <Btn onClick={downloadPNG} style={{ width: "100%", justifyContent: "center" }}>⬇ Download PNG</Btn>
                  {user && (
                    <>
                      {!showNameInput ? (
                        <Btn variant="accent" onClick={handleSaveClick} disabled={saving} style={{ width: "100%", justifyContent: "center" }}>
                          {saving ? "Saving…" : savedSkinId ? "☁ Update Cloud Skin" : "☁ Save to Cloud"}
                        </Btn>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <input type="text" placeholder="Skin name…" value={nameInput} onChange={e => setNameInput(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") doSave(nameInput || "My Skin"); }}
                            style={{ fontFamily: font, fontSize: 14, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.borderMid}`, background: C.elevated, color: C.text, outline: "none", width: "100%", boxSizing: "border-box" }}
                            autoFocus />
                          <div style={{ display: "flex", gap: 6 }}>
                            <Btn variant="accent" onClick={() => doSave(nameInput || "My Skin")} disabled={saving} small style={{ flex: 1, justifyContent: "center" }}>
                              {saving ? "…" : "Save"}
                            </Btn>
                            <Btn small onClick={() => setShowNameInput(false)} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {!user && <p style={{ fontFamily: font, fontSize: 13, color: C.muted, textAlign: "center", margin: 0 }}>Sign in to save to the cloud</p>}
                  {saveSuccess && <p style={{ fontFamily: font, fontSize: 13, color: C.accent, textAlign: "center", margin: 0 }}>Saved successfully!</p>}
                  {saveError && <p style={{ fontFamily: font, fontSize: 13, color: C.danger, textAlign: "center", margin: 0 }}>{saveError}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
