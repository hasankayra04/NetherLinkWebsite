import React, { useState, useCallback } from "react";
import { fetchIdToken } from "../firebaseAuthHelpers";
import { API_BASE } from "../lib/api";
import { T, FONTS } from "../lib/tokens";
import Spinner from "./Spinner";

export { Spinner };
export const font = FONTS.sans;
export const mono = FONTS.mono;

export const NL = {
  ...T,
  elevated: T.raised,
  subtle: "#1f2635",
  secondary: T.sub,
  accent: T.green,
  accentDim: "rgba(103,228,4,0.10)",
  accentBorder: "rgba(103,228,4,0.22)",
  danger: T.red,
  dangerDim: "rgba(248,113,113,0.10)",
  dangerBorder: "rgba(248,113,113,0.22)",
  success: T.teal,
  successDim: "rgba(52,211,153,0.10)",
  successBorder: "rgba(52,211,153,0.22)",
  warn: "#fbbf24",
  warnDim: "rgba(251,191,36,0.10)",
  warnBorder: "rgba(251,191,36,0.22)",
};

export const inputStyle = {
  padding: "9px 12px", borderRadius: 9, border: `1px solid ${NL.borderMid}`,
  background: NL.subtle, color: NL.text, fontSize: 13, fontFamily: font,
  outline: "none", width: "100%", boxSizing: "border-box", transition: "border-color 0.15s",
};

export const labelStyle = {
  display: "block", fontSize: 10, fontWeight: 700, color: NL.muted,
  marginBottom: 5, letterSpacing: "0.07em", textTransform: "uppercase",
};

export async function apiFetch(path, options = {}) {
  const token = await fetchIdToken();
  const headers = {
    ...(options.body && !(options.body instanceof FormData) && typeof options.body === "string"
      ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (res.ok) return data;
  throw Object.assign(new Error(data.message || data.error || res.statusText), { data, status: res.status });
}

export function Card({ title, subtitle, action, children, style }) {
  return (
    <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 14, padding: "18px 20px", fontFamily: font, ...style }}>
      {(title || action) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: NL.text, margin: 0 }}>{title}</p>
            {subtitle && <p style={{ fontSize: 11, color: NL.muted, margin: "2px 0 0" }}>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Badge({ color = "default", children }) {
  const colors = {
    default: { bg: NL.elevated, border: NL.border, text: NL.secondary },
    accent: { bg: NL.accentDim, border: NL.accentBorder, text: NL.accent },
    danger: { bg: NL.dangerDim, border: NL.dangerBorder, text: NL.danger },
    warn: { bg: NL.warnDim, border: NL.warnBorder, text: NL.warn },
    success: { bg: NL.successDim, border: NL.successBorder, text: NL.success },
  };
  const c = colors[color] || colors.default;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 5, background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontFamily: font }}>
      {children}
    </span>
  );
}

export function Tag({ children, color = "accent" }) {
  const styles = {
    accent: { color: NL.accent, background: NL.accentDim, border: `1px solid ${NL.accentBorder}` },
    warn: { color: NL.warn, background: NL.warnDim, border: `1px solid ${NL.warnBorder}` },
    danger: { color: NL.danger, background: NL.dangerDim, border: `1px solid ${NL.dangerBorder}` },
  };
  const s = styles[color] || styles.accent;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
      fontFamily: mono, letterSpacing: "0.06em", textTransform: "uppercase", ...s,
    }}>{children}</span>
  );
}

export function Btn({ children, onClick, variant = "primary", size = "md", disabled, type = "button", style: extraStyle }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontWeight: 600, borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: font, border: "none",
    opacity: disabled ? 0.4 : 1,
    transition: "opacity 0.15s, background 0.15s",
  };
  const sizes = {
    xs: { padding: "4px 10px", fontSize: 11 },
    sm: { padding: "7px 12px", fontSize: 12 },
    md: { padding: "10px 18px", fontSize: 14 },
  };
  const variants = {
    primary: { background: NL.accent, color: "#000" },
    gradient: { background: `linear-gradient(135deg, ${NL.accent}, #38bdb0)`, color: "#0d1a18" },
    secondary: { background: NL.elevated, color: NL.secondary, border: `1px solid ${NL.borderMid}` },
    danger: { background: NL.dangerDim, color: NL.danger, border: `1px solid ${NL.dangerBorder}` },
    ghost: { background: "transparent", color: NL.secondary, border: `1px solid ${NL.border}` },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...extraStyle }}>
      {children}
    </button>
  );
}

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  const remove = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, add, remove };
}

export function ToastContainer({ toasts, remove }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
          borderRadius: 14, border: `1px solid ${t.type === "error" ? NL.dangerBorder : NL.successBorder}`,
          background: NL.surface, minWidth: 240, maxWidth: 340,
          pointerEvents: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: t.type === "error" ? NL.danger : NL.success }} />
          <span style={{ fontSize: 13, color: NL.text, flex: 1, fontFamily: font }}>{t.message}</span>
          <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", color: NL.muted, cursor: "pointer", fontSize: 14, padding: 2 }}>✕</button>
        </div>
      ))}
    </div>
  );
}

export function CountBadge({ count }) {
  if (!count) return null;
  return (
    <span style={{
      minWidth: 18, height: 18, borderRadius: 9, padding: "0 5px",
      background: NL.accent, color: "#000", fontSize: 10, fontWeight: 800,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontFamily: mono, flexShrink: 0,
    }}>{count > 99 ? "99+" : count}</span>
  );
}
