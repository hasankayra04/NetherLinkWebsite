import { useState, useRef, useCallback, useEffect } from "react";
import Layout from "@theme/Layout";
import { useAuth } from "../useAuth";
import CommentsSection from "../components/CommentsSection";

const C = {
  bg: "#0d1117", surface: "#131820", elevated: "#191f2b", subtle: "#1f2635",
  border: "rgba(255,255,255,0.06)", borderMid: "rgba(255,255,255,0.11)",
  text: "#eaecf0", secondary: "#8d97aa", muted: "#4a5270",
  accent: "#67e404", accentDim: "rgba(103,228,4,0.08)", accentBorder: "rgba(103,228,4,0.22)",
  danger: "#f87171", dangerDim: "rgba(248,113,113,0.08)", dangerBorder: "rgba(248,113,113,0.25)",
  info: "#60a5fa", infoDim: "rgba(96,165,250,0.08)", infoBorder: "rgba(96,165,250,0.22)",
};
const font = "Inter,system-ui,sans-serif";
const API = "https://api.mccompanion.net";
const UNDO_LIMIT = 20;
const DEBOUNCE_MS = 200;

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

function Tag({ children, color }) {
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

async function fetchSkinAsBlob(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("fetch failed");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

function SkinViewer3D({ skinUrl, scale = 5 }) {
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

const CANVAS_SIZE = 64;
const DISPLAY_SIZE = 512;

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

      <div style={{ background: C.elevated, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0", minHeight: 180 }}>
        <SkinViewer3D skinUrl={initialSkin.public_url} scale={5} />
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
    Promise.all([
      fetch(`${API}/api/skins`).then(r => r.json()),
      fetch(`${API}/api/skins/top?limit=30`).then(r => r.json()),
    ])
      .then(([all, top]) => {
        setPublicSkins(all.skins || []);
        setTopSkins(top.skins || []);
        setLoadingPublic(false);
      })
      .catch(() => { setError("Failed to load skins."); setLoadingPublic(false); });
  }, []);

  useEffect(() => {
    if (!idToken) { setLikedIds(new Set()); return; }
    fetch(`${API}/api/skins/me/likes`, { headers: { Authorization: `Bearer ${idToken}` } })
      .then(r => r.json())
      .then(d => setLikedIds(new Set(d.liked || [])))
      .catch(() => { });
  }, [idToken]);

  useEffect(() => {
    if (!user || !idToken) return;
    setLoadingMine(true);
    fetch(`${API}/api/skins/me`, { headers: { Authorization: `Bearer ${idToken}` }, cache: 'no-store' })
      .then(r => r.json())
      .then(d => { setMySkins(d.skins || []); setLoadingMine(false); })
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

const STEVE_SKIN_URL = "https://textures.minecraft.net/texture/31f477eb1a7beee631c2ca64d06f8f68fa93a3386d04452ab27f43acdf1b60cb";

function EditorTab({ user, idToken, initialSkin, onSaved }) {
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
        setSavedSkinId(initialSkin.id || null);
        setSkinName(initialSkin.name || "");
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

  async function doSave(name, isPublic = false) {
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
    <Layout title="Skin Workshop">
      <div style={{ background: C.bg, minHeight: "100vh", fontFamily: font }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, gap: 16, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ color: C.text, fontSize: 28, fontWeight: 800, margin: 0, marginBottom: 6 }}>Skin Workshop</h1>
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
