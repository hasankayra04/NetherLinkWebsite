import { useState, useRef, useCallback, useEffect } from "react";
import Layout from "@theme/Layout";
import { useLocation } from "@docusaurus/router";
import { useAuth } from "../useAuth";

const C = {
  bg: "#111318", surface: "#191c23", elevated: "#1f232c", subtle: "#252931",
  border: "rgba(255,255,255,0.07)", borderMid: "rgba(255,255,255,0.12)",
  text: "#e8e9ec", secondary: "#9299a6", muted: "#5a6070",
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
      ctx.drawImage(img,  8,  8, 8,  8,  4*s,  0,    8*s, 8*s);
      ctx.drawImage(img, 40,  8, 8,  8,  4*s,  0,    8*s, 8*s);
      ctx.drawImage(img, 20, 20, 8, 12,  4*s,  8*s,  8*s, 12*s);
      ctx.drawImage(img, 44, 20, 4, 12,  0,    8*s,  4*s, 12*s);
      ctx.drawImage(img, 36, 52, 4, 12,  12*s, 8*s,  4*s, 12*s);
      ctx.drawImage(img,  4, 20, 4, 12,  4*s,  20*s, 4*s, 12*s);
      ctx.drawImage(img, 20, 52, 4, 12,  8*s,  20*s, 4*s, 12*s);
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
      if (url) viewer.loadSkin(url).catch(() => {});

      if (triggerRef) {
        triggerRef.current = (dataUrl) => {
          if (viewerRef.current) viewerRef.current.loadSkin(dataUrl).catch(() => {});
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
  { label: "Head",        x: 0,  y: 0,  w: 32, h: 16, color: "#ff6b6b" },
  { label: "Body",        x: 16, y: 16, w: 24, h: 16, color: "#4ecdc4" },
  { label: "R.Leg",       x: 0,  y: 16, w: 16, h: 16, color: "#feca57" },
  { label: "R.Arm",       x: 40, y: 16, w: 16, h: 16, color: "#45b7d1" },
  { label: "L.Leg",       x: 16, y: 48, w: 16, h: 16, color: "#ff9ff3" },
  { label: "L.Arm",       x: 32, y: 48, w: 16, h: 16, color: "#96ceb4" },
  { label: "Hat",         x: 32, y: 0,  w: 32, h: 16, color: "#ff6b6b" },
  { label: "Jacket",      x: 16, y: 32, w: 24, h: 16, color: "#4ecdc4" },
  { label: "R.Leg OL",    x: 0,  y: 32, w: 16, h: 16, color: "#feca57" },
  { label: "R.Arm OL",    x: 40, y: 32, w: 16, h: 16, color: "#45b7d1" },
  { label: "L.Leg OL",    x: 0,  y: 48, w: 16, h: 16, color: "#ff9ff3" },
  { label: "L.Arm OL",    x: 48, y: 48, w: 16, h: 16, color: "#96ceb4" },
];

function UVEditor({ bufferRef, onUpdate, renderRef }) {
  const displayRef = useRef(null);
  const containerRef = useRef(null);
  const [tool, setTool] = useState("draw");
  const [color, setColor] = useState("#ff0000");
  const [brushSize, setBrushSize] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [showGuide, setShowGuide] = useState(true);
  const lineStart = useRef(null);
  const lineSnapshot = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const col = containerRef.current?.closest('[data-uvcol]');
      const w = col ? col.clientWidth : containerRef.current?.parentElement?.clientWidth;
      if (w > 50) setZoom(Math.max(0.5, Math.min(4, Math.round((w / DISPLAY_SIZE) * 4) / 4)));
    }, 50);
    return () => clearTimeout(t);
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
    if (zoom >= 1) {
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= CANVAS_SIZE; i++) {
        ctx.beginPath(); ctx.moveTo(i * px, 0); ctx.lineTo(i * px, size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * px); ctx.lineTo(size, i * px); ctx.stroke();
      }
    }
    if (showGuide) {
      const fontSize = Math.max(8, Math.min(px * 2.5, 14));
      ctx.font = `bold ${fontSize}px monospace`;
      ctx.textBaseline = "top";
      SKIN_REGIONS.forEach(({ label, x, y, w, h, color: rc }) => {
        const rx = x * px, ry = y * px, rw = w * px, rh = h * px;
        ctx.fillStyle = rc + "22";
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = rc + "cc";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rx + 0.75, ry + 0.75, rw - 1.5, rh - 1.5);
        ctx.fillStyle = rc;
        ctx.fillText(label, rx + 3, ry + 3);
      });
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

      <div ref={containerRef} style={{ overflow: "auto", maxWidth: "100%", maxHeight: "65vh", borderRadius: 10, border: `1px solid ${C.border}`, touchAction: "none" }}>
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

function SkinCard({ skin: initialSkin, onEdit, onDelete, isOwn, idToken, initialLiked = false }) {
  const [deleting, setDeleting] = useState(false);
  const [likes, setLikes] = useState(initialSkin.like_count ?? 0);
  const [liked, setLiked] = useState(initialLiked);
  const [liking, setLiking] = useState(false);
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
    } catch (_) {}
    setLiking(false);
  }

  return (
    <div
      onClick={onEdit ? () => onEdit(initialSkin) : undefined}
      style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
        padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        transition: "border-color .2s, transform .15s",
        cursor: onEdit ? "pointer" : "default",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.accentBorder; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 160 }}>
        <SkinViewer3D skinUrl={initialSkin.public_url} scale={5} />
      </div>
      <div style={{ textAlign: "center", width: "100%" }}>
        <div style={{ fontFamily: font, fontWeight: 600, color: C.text, fontSize: 14, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {initialSkin.name || "Unnamed"}
        </div>
        {initialSkin.username && (
          <div style={{ fontSize: 11, color: C.secondary, marginBottom: 4 }}>
            Created by:{" "}
            <a href={`/u?name=${initialSkin.username}`}
              onClick={e => e.stopPropagation()}
              style={{ color: C.accent, textDecoration: "none" }}>
              {initialSkin.display_name || initialSkin.username}
            </a>
          </div>
        )}
        {isOwn && <Tag color={C.accent}>Yours</Tag>}
      </div>
      <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        <Btn small onClick={download}>⬇ Download</Btn>
        {!isOwn && (idToken ? (
          <button type="button" onClick={toggleLike} disabled={liking} style={{
            display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 10px",
            borderRadius: 8, border: `1px solid ${liked ? "#f8717144" : C.border}`,
            background: liked ? "#f8717112" : "transparent", cursor: "pointer",
            color: liked ? "#f87171" : C.secondary, fontSize: 12, fontFamily: font, fontWeight: 500,
          }}>
            {liked ? "♥" : "♡"} {likes > 0 ? likes : ""}
          </button>
        ) : likes > 0 ? (
          <span style={{ fontSize: 12, color: C.secondary, fontFamily: font }}>♡ {likes}</span>
        ) : null)}
        {isOwn && (
          <>
            <Btn small variant="ghost" onClick={() => onEdit(initialSkin)}>✏️ Edit</Btn>
            <Btn small variant="danger" disabled={deleting} onClick={async () => {
              if (!confirm(`Delete "${initialSkin.name}"?`)) return;
              setDeleting(true);
              await onDelete(initialSkin.id);
              setDeleting(false);
            }}>
              {deleting ? "…" : "🗑"}
            </Btn>
          </>
        )}
      </div>
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
      .catch(() => {});
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

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 16,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {user && (
        <section>
          <h2 style={{ fontFamily: font, color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 0 }}>
            My Cloud Skins
          </h2>
          {loadingMine ? (
            <p style={{ fontFamily: font, color: C.muted }}>Loading…</p>
          ) : mySkins.length === 0 ? (
            <p style={{ fontFamily: font, color: C.muted }}>No cloud skins yet. Upload one in the Editor tab!</p>
          ) : (
            <div style={gridStyle}>
              {mySkins.map(s => (
                <SkinCard key={s.id} skin={s} isOwn onEdit={onEditSkin} onDelete={deleteSkin} />
              ))}
            </div>
          )}
        </section>
      )}

      {error && (
        <div style={{ background: C.dangerDim, border: `1px solid ${C.dangerBorder}`, borderRadius: 10, padding: 12 }}>
          <p style={{ fontFamily: font, color: C.danger, margin: 0 }}>{error}</p>
        </div>
      )}

      {topSkins.length > 0 && (
        <section>
          <h2 style={{ fontFamily: font, color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}>
            🏆 Top 30
          </h2>
          <div style={gridStyle}>
            {topSkins.map(s => (
              <SkinCard key={s.id} skin={s} isOwn={user && s.uid === user.uid} onEdit={onEditSkin} onDelete={deleteSkin} idToken={idToken} initialLiked={likedIds.has(s.id)} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 style={{ fontFamily: font, color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 16, marginTop: 0 }}>
          All Skins
        </h2>
        {loadingPublic ? (
          <p style={{ fontFamily: font, color: C.muted }}>Loading…</p>
        ) : publicSkins.length === 0 ? (
          <p style={{ fontFamily: font, color: C.muted }}>No public skins yet.</p>
        ) : (
          <div style={gridStyle}>
            {publicSkins.map(s => (
              <SkinCard key={s.id} skin={s} isOwn={user && s.uid === user.uid} onEdit={onEditSkin} onDelete={deleteSkin} idToken={idToken} initialLiked={likedIds.has(s.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EditorTab({ user, idToken, initialSkin, onSaved }) {
  const bufferRef = useRef(null);
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
    if (!initialSkin || !initialSkin.public_url) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!bufferRef.current) return;
      const ctx = bufferRef.current.getContext("2d");
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.drawImage(img, 0, 0);
      setSavedSkinId(initialSkin.id || null);
      setSkinName(initialSkin.name || "");
      setSkinIsPublic(initialSkin.is_public !== false);
      const tryRender = (attempts = 0) => {
        if (renderRef.current) { renderRef.current(); return; }
        if (attempts < 10) setTimeout(() => tryRender(attempts + 1), 30);
      };
      tryRender();
      scheduleUpdate3D();
    };
    img.src = initialSkin.public_url;
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
      <div style={{
        display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start",
      }}>
        <div data-uvcol style={{ flex: "1 1 300px", minWidth: 280 }}>
          <h3 style={{ fontFamily: font, color: C.text, fontWeight: 700, fontSize: 16, marginTop: 0, marginBottom: 12 }}>
            2D UV Editor
          </h3>
          <UVEditor bufferRef={bufferRef} onUpdate={scheduleUpdate3D} renderRef={renderRef} />
        </div>

        <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
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
  const { user, idToken, checking } = useAuth();
  const location = useLocation();
  const [tab, setTab] = useState("gallery");
  const [editSkin, setEditSkin] = useState(null);
  const [galleryKey, setGalleryKey] = useState(0);

  useEffect(() => {
    const skinId = new URLSearchParams(location.search).get("skin");
    if (!skinId) return;
    fetch(`https://api.mccompanion.net/api/skins/${skinId}`)
      .then(r => r.ok ? r.json() : null)
      .then(skin => {
        if (!skin) return;
        setEditSkin(skin);
        setTab("editor");
      })
      .catch(() => {});
  }, [location.search]);

  function handleEditSkin(skin) {
    setEditSkin(skin);
    setTab("editor");
  }

  function handleSkinSaved() {
    setGalleryKey(k => k + 1);
  }

  const tabs = [
    { id: "gallery", label: "Gallery" },
    { id: "editor", label: "Editor" },
    { id: "upload", label: "Upload" },
  ];

  return (
    <Layout title="Skins">
      <div style={{ background: C.bg, minHeight: "100vh", fontFamily: font }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ color: C.text, fontSize: 28, fontWeight: 800, margin: 0, marginBottom: 8 }}>
              Skin Workshop
            </h1>
            <p style={{ color: C.secondary, fontSize: 15, margin: 0 }}>
              Browse community skins or create your own with the built-in UV editor.
            </p>
          </div>

          <div style={{
            display: "flex", gap: 4, marginBottom: 28,
            background: C.surface, borderRadius: 12, padding: 4,
            border: `1px solid ${C.border}`, width: "fit-content",
          }}>
            {tabs.map(t => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  fontFamily: font, fontWeight: 600, fontSize: 14,
                  padding: "8px 20px", borderRadius: 9, border: "none", cursor: "pointer",
                  background: tab === t.id ? C.elevated : "transparent",
                  color: tab === t.id ? C.text : C.secondary,
                  boxShadow: tab === t.id ? `inset 0 0 0 1px ${C.border}` : "none",
                  transition: "all .15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "gallery" && (
            <GalleryTab key={galleryKey} user={user} idToken={idToken} onEditSkin={handleEditSkin} />
          )}
          {tab === "editor" && (
            <EditorTab user={user} idToken={idToken} initialSkin={editSkin} onSaved={handleSkinSaved} />
          )}
          {tab === "upload" && (
            <UploadTab user={user} idToken={idToken} onSaved={handleSkinSaved} />
          )}
        </div>
      </div>
    </Layout>
  );
}
