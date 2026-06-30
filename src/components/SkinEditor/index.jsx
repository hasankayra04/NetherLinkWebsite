import { useState, useRef, useCallback, useEffect } from "react";

export const C = {
  bg: "#0d1117", surface: "#131820", elevated: "#191f2b", subtle: "#1f2635",
  border: "rgba(255,255,255,0.06)", borderMid: "rgba(255,255,255,0.11)",
  text: "#eaecf0", secondary: "#8d97aa", muted: "#4a5270",
  accent: "#67e404", accentDim: "rgba(103,228,4,0.08)", accentBorder: "rgba(103,228,4,0.22)",
  danger: "#f87171", dangerDim: "rgba(248,113,113,0.08)", dangerBorder: "rgba(248,113,113,0.25)",
  info: "#60a5fa", infoDim: "rgba(96,165,250,0.08)", infoBorder: "rgba(96,165,250,0.22)",
};
export const font = "Inter,system-ui,sans-serif";
export const API = "https://api.mccompanion.net";
export const UNDO_LIMIT = 20;
export const DEBOUNCE_MS = 200;
export const CANVAS_SIZE = 64;
export const DISPLAY_SIZE = 512;
export const STEVE_SKIN_URL = "https://textures.minecraft.net/texture/31f477eb1a7beee631c2ca64d06f8f68fa93a3386d04452ab27f43acdf1b60cb";

export const SKIN_REGIONS = [
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

export function Btn({ children, onClick, disabled, variant = "default", small, style }) {
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

export function Tag({ children, color }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, fontFamily: font, padding: "2px 7px",
      borderRadius: 5, background: color + "22", color, border: `1px solid ${color}44`,
      letterSpacing: "0.03em", textTransform: "uppercase",
    }}>
      {children}
    </span>
  );
}

export function SkinViewer3D({ skinUrl, scale = 5 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || !skinUrl) return;
    const canvas = canvasRef.current;
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
    img.src = skinUrl;
  }, [skinUrl, scale]);
  return <canvas ref={canvasRef} width={16 * scale} height={32 * scale} style={{ display: "block", imageRendering: "pixelated" }} />;
}

export function LiveSkinViewer3D({ getDataUrl, triggerRef, width = 220, height = 320 }) {
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
      if (url) viewer.loadSkin(url).catch(() => { });

      if (triggerRef) {
        triggerRef.current = (dataUrl) => {
          if (viewerRef.current) viewerRef.current.loadSkin(dataUrl).catch(() => { });
        };
      }
    });

    return () => {
      cancelled = true;
      if (viewerRef.current) {
        viewerRef.current.dispose();
        viewerRef.current = null;
      }
      if (triggerRef) triggerRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: "block", borderRadius: 10 }}
    />
  );
}

export function UVEditor({ bufferRef, onUpdate, renderRef }) {
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
  const [recentColors, setRecentColors] = useState([]);
  const undoStack = useRef([]);
  const isDrawing = useRef(false);

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
  useEffect(() => { if (renderRef) renderRef.current = renderDisplay; }, [renderDisplay, renderRef]);

  function pushUndo() {
    const buf = bufferRef.current;
    const ctx = buf.getContext("2d");
    const snap = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    undoStack.current.push(snap);
    if (undoStack.current.length > UNDO_LIMIT) undoStack.current.shift();
  }

  function undo() {
    if (!undoStack.current.length) return;
    const snap = undoStack.current.pop();
    const buf = bufferRef.current;
    const ctx = buf.getContext("2d");
    ctx.putImageData(snap, 0, 0);
    renderDisplay();
    onUpdate();
  }

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); return; }
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === "d") setTool("draw");
        if (e.key === "e") setTool("erase");
        if (e.key === "f") setTool("fill");
        if (e.key === "l") setTool("line");
        if (e.key === "p") setTool("pick");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo]);

  function getPixel(e) {
    const rect = displayRef.current.getBoundingClientRect();
    const scaleX = (CANVAS_SIZE) / rect.width;
    const scaleY = (CANVAS_SIZE) / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    return { x, y };
  }

  function hexToRgba(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b, 255];
  }

  function floodFill(startX, startY) {
    const buf = bufferRef.current;
    const ctx = buf.getContext("2d");
    const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const data = imageData.data;
    const idx = (x, y) => (y * CANVAS_SIZE + x) * 4;
    const target = data.slice(idx(startX, startY), idx(startX, startY) + 4);
    const fill = hexToRgba(color);
    if (target.every((v, i) => v === fill[i])) return;
    const stack = [[startX, startY]];
    const visited = new Uint8Array(CANVAS_SIZE * CANVAS_SIZE);
    while (stack.length) {
      const [x, y] = stack.pop();
      if (x < 0 || x >= CANVAS_SIZE || y < 0 || y >= CANVAS_SIZE) continue;
      if (visited[y * CANVAS_SIZE + x]) continue;
      const i = idx(x, y);
      if (!target.every((v, k) => data[i + k] === v)) continue;
      visited[y * CANVAS_SIZE + x] = 1;
      fill.forEach((v, k) => { data[i + k] = v; });
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    ctx.putImageData(imageData, 0, 0);
    renderDisplay();
    onUpdate();
  }

  function drawLine(x0, y0, x1, y1, erase = false) {
    const buf = bufferRef.current;
    const ctx = buf.getContext("2d");
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      if (erase) ctx.clearRect(x0, y0, brushSize, brushSize);
      else { ctx.fillStyle = color; ctx.fillRect(x0, y0, brushSize, brushSize); }
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  }

  function pickColor(e) {
    const { x, y } = getPixel(e);
    if (x < 0 || y < 0 || x >= CANVAS_SIZE || y >= CANVAS_SIZE) return;
    const buf = bufferRef.current;
    const ctx = buf.getContext("2d");
    const [r, g, b, a] = ctx.getImageData(x, y, 1, 1).data;
    if (a === 0) return;
    const hex = "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
    handleColorChange(hex);
    setTool("draw");
  }

  function paint(e) {
    const { x, y } = getPixel(e);
    if (x < 0 || y < 0 || x >= CANVAS_SIZE || y >= CANVAS_SIZE) return;
    const buf = bufferRef.current;
    const ctx = buf.getContext("2d");
    if (tool === "erase") {
      ctx.clearRect(x, y, brushSize, brushSize);
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, brushSize, brushSize);
    }
    renderDisplay();
    onUpdate();
  }

  function onMouseDown(e) {
    if (e.button !== 0) return;
    if (tool === "pick") { pickColor(e); return; }
    if (tool === "fill") {
      pushUndo();
      const { x, y } = getPixel(e);
      floodFill(x, y);
      return;
    }
    pushUndo();
    if (tool === "line") {
      const pos = getPixel(e);
      lineStart.current = pos;
      const buf = bufferRef.current;
      const ctx = buf.getContext("2d");
      lineSnapshot.current = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      return;
    }
    isDrawing.current = true;
    paint(e);
  }
  function onMouseMove(e) {
    if (tool === "line" && lineStart.current) {
      const buf = bufferRef.current;
      const ctx = buf.getContext("2d");
      ctx.putImageData(lineSnapshot.current, 0, 0);
      const { x, y } = getPixel(e);
      drawLine(lineStart.current.x, lineStart.current.y, x, y);
      renderDisplay();
      return;
    }
    if (isDrawing.current) paint(e);
  }
  function onMouseUp(e) {
    if (tool === "line" && lineStart.current) {
      const { x, y } = getPixel(e);
      drawLine(lineStart.current.x, lineStart.current.y, x, y);
      renderDisplay();
      onUpdate();
      lineStart.current = null;
      lineSnapshot.current = null;
      return;
    }
    isDrawing.current = false;
  }

  useEffect(() => {
    const canvas = displayRef.current;
    if (!canvas) return;
    function onTouchStart(e) {
      e.preventDefault();
      pushUndo();
      isDrawing.current = true;
      paint(e.touches[0]);
    }
    function onTouchMove(e) {
      e.preventDefault();
      if (isDrawing.current) paint(e.touches[0]);
    }
    function onTouchEnd() { isDrawing.current = false; }
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [tool, color, brushSize]);

  function handleColorChange(val) {
    setColor(val);
    setRecentColors(prev => {
      const next = [val, ...prev.filter(c => c !== val)].slice(0, 8);
      return next;
    });
  }

  function clearCanvas() {
    pushUndo();
    const buf = bufferRef.current;
    const ctx = buf.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    renderDisplay();
    onUpdate();
  }

  function uploadPNG(file) {
    const img = new Image();
    img.onload = () => {
      const validSizes = [[64, 64], [64, 32], [128, 128], [128, 64]];
      if (!validSizes.some(([w, h]) => img.width === w && img.height === h)) {
        alert(`Expected 64×64 or 64×32 skin PNG, got ${img.width}×${img.height}.`);
        return;
      }
      pushUndo();
      const buf = bufferRef.current;
      const ctx = buf.getContext("2d");
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      renderDisplay();
      onUpdate();
    };
    img.src = URL.createObjectURL(file);
  }

  const displayPx = DISPLAY_SIZE * zoom;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        <Btn small variant={tool === "draw" ? "accent" : "default"} onClick={() => setTool("draw")} title="Draw (D)">✏️</Btn>
        <Btn small variant={tool === "erase" ? "accent" : "default"} onClick={() => setTool("erase")} title="Erase (E)">🧹</Btn>
        <Btn small variant={tool === "fill" ? "accent" : "default"} onClick={() => setTool("fill")} title="Fill (F)">🪣</Btn>
        <Btn small variant={tool === "line" ? "accent" : "default"} onClick={() => setTool("line")} title="Line (L)">📏</Btn>
        <Btn small variant={tool === "pick" ? "accent" : "default"} onClick={() => setTool("pick")} title="Pick color (P)">🩸</Btn>
        <input type="color" value={color} onChange={e => handleColorChange(e.target.value)} title="Color"
          style={{ width: 30, height: 30, border: `2px solid ${C.border}`, borderRadius: 6, cursor: "pointer", background: "none", padding: 0 }} />
        <div style={{ width: 1, height: 24, background: C.border, margin: "0 2px" }} />
        {[1, 2, 4].map(s => (
          <button key={s} type="button" onClick={() => setBrushSize(s)} title={`Brush ${s}px`}
            style={{
              fontFamily: font, fontSize: 11, fontWeight: 700,
              width: 28, height: 28, borderRadius: 6, border: `1px solid ${brushSize === s ? C.accent : C.border}`,
              background: brushSize === s ? C.accent + "33" : C.elevated,
              color: brushSize === s ? C.accent : C.secondary, cursor: "pointer",
            }}>{s}px</button>
        ))}
        <div style={{ width: 1, height: 24, background: C.border, margin: "0 2px" }} />
        <Btn small variant={showGuide ? "accent" : "default"} onClick={() => setShowGuide(g => !g)} title="Toggle UV guide">Guide</Btn>
        <div style={{ width: 1, height: 24, background: C.border, margin: "0 2px" }} />
        <Btn small onClick={undo} title="Undo (Ctrl+Z)">↩</Btn>
        <Btn small variant="danger" onClick={clearCanvas}>Clear</Btn>
        <div style={{ width: 1, height: 24, background: C.border, margin: "0 2px" }} />
        <button type="button" onClick={() => setZoomOffset(o => +(o - 0.25).toFixed(2))} title="Zoom out"
          style={{ fontFamily: font, fontSize: 14, fontWeight: 700, width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.secondary, cursor: "pointer" }}>−</button>
        <span style={{ fontSize: 11, color: C.muted, fontFamily: font, minWidth: 36, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => setZoomOffset(o => +(o + 0.25).toFixed(2))} title="Zoom in"
          style={{ fontFamily: font, fontSize: 14, fontWeight: 700, width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`, background: C.elevated, color: C.secondary, cursor: "pointer" }}>+</button>
        {zoomOffset !== 0 && (
          <button type="button" onClick={() => setZoomOffset(0)} title="Fit to screen"
            style={{ fontFamily: font, fontSize: 10, fontWeight: 600, padding: "0 8px", height: 28, borderRadius: 6, border: `1px solid ${C.accentBorder}`, background: C.accentDim, color: C.accent, cursor: "pointer" }}>Fit</button>
        )}
        <label style={{
          fontFamily: font, fontWeight: 500, fontSize: 12, padding: "5px 10px",
          borderRadius: 8, border: `1px solid ${C.border}`, background: C.elevated,
          color: C.text, cursor: "pointer",
        }}>
          📂 PNG
          <input type="file" accept="image/png" style={{ display: "none" }}
            onChange={e => { if (e.target.files[0]) uploadPNG(e.target.files[0]); }} />
        </label>
      </div>

      {recentColors.length > 0 && (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.muted, fontFamily: font }}>Recent:</span>
          {recentColors.map(c => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 20, height: 20, borderRadius: 4, border: c === color ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
                background: c, cursor: "pointer", padding: 0,
              }}
            />
          ))}
        </div>
      )}

      <div ref={containerRef} style={{ overflow: "auto", height: "calc(100vh - 340px)", minHeight: 300, width: "fit-content", maxWidth: "100%", borderRadius: 10, border: `1px solid ${C.border}`, touchAction: "none" }}>
        <canvas
          ref={displayRef}
          width={displayPx}
          height={displayPx}
          style={{ display: "block", cursor: "crosshair", imageRendering: "pixelated", touchAction: "none" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />
      </div>
    </div>
  );
}

export function EditorTab({ user, idToken, initialSkin, onSaved }) {
  const bufferRef = useRef(null);
  const steveLoadedRef = useRef(false);
  const renderRef = useRef(null);
  const update3DRef = useRef(null);
  const debounceTimer = useRef(null);
  const [ready, setReady] = useState(false);
  const [skinName, setSkinName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [savedSkinId, setSavedSkinId] = useState(null);
  const [skinIsPublic, setSkinIsPublic] = useState(true);
  const [showNameInput, setShowNameInput] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Create canvas only on client
  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = CANVAS_SIZE;
    c.height = CANVAS_SIZE;
    bufferRef.current = c;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
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
  }, [initialSkin, ready]);

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

  async function doSave(name, isPublic = false) {
    setSaving(true);
    setSaveError(null);
    try {
      const dataUrl = getDataUrl();
      const blob = await (await fetch(dataUrl)).blob();

      const { fetchIdToken } = await import("../../firebaseAuthHelpers");
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
      if (onSaved) onSaved();
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

  if (!ready) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start" }}>
        <div data-uvcol style={{ minWidth: 0, position: "relative" }}>
          <h3 style={{ fontFamily: font, color: C.text, fontWeight: 700, fontSize: 16, marginTop: 0, marginBottom: 12 }}>
            2D UV Editor
          </h3>
          <UVEditor bufferRef={bufferRef} onUpdate={scheduleUpdate3D} renderRef={renderRef} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, flexShrink: 0, position: "sticky", top: 20 }}>
          <h3 style={{ fontFamily: font, color: C.text, fontWeight: 700, fontSize: 16, marginTop: 0, marginBottom: 0 }}>
            3D Preview
          </h3>
          <div style={{ background: C.elevated, borderRadius: 14, padding: 16, border: `1px solid ${C.border}` }}>
            <LiveSkinViewer3D
              getDataUrl={getDataUrl}
              triggerRef={update3DRef}
              width={220}
              height={320}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            <Btn onClick={downloadPNG} style={{ width: "100%", justifyContent: "center" }}>
              ⬇ Download PNG
            </Btn>
            {user && (
              <>
                {!showNameInput ? (
                  <Btn variant="accent" onClick={handleSaveClick} disabled={saving} style={{ width: "100%", justifyContent: "center" }}>
                    {saving ? "Saving…" : savedSkinId ? "☁ Update Cloud Skin" : "☁ Save to Cloud"}
                  </Btn>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Skin name…"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") doSave(nameInput || "My Skin"); }}
                      style={{
                        fontFamily: font, fontSize: 14, padding: "8px 12px",
                        borderRadius: 8, border: `1px solid ${C.borderMid}`,
                        background: C.elevated, color: C.text, outline: "none", width: "100%", boxSizing: "border-box",
                      }}
                      autoFocus
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn variant="accent" onClick={() => doSave(nameInput || "My Skin")} disabled={saving} small style={{ flex: 1, justifyContent: "center" }}>
                        {saving ? "…" : "Save"}
                      </Btn>
                      <Btn small onClick={() => setShowNameInput(false)} style={{ flex: 1, justifyContent: "center" }}>
                        Cancel
                      </Btn>
                    </div>
                  </div>
                )}
              </>
            )}
            {!user && (
              <p style={{ fontFamily: font, fontSize: 13, color: C.muted, textAlign: "center", margin: 0 }}>
                Sign in to save to the cloud
              </p>
            )}
            {saveSuccess && (
              <p style={{ fontFamily: font, fontSize: 13, color: C.accent, textAlign: "center", margin: 0 }}>
                Saved successfully!
              </p>
            )}
            {saveError && (
              <p style={{ fontFamily: font, fontSize: 13, color: C.danger, textAlign: "center", margin: 0 }}>
                {saveError}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
