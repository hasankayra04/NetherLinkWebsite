/* MCCompanion Design System — single source of truth.
   Import T in every page and component. Never define colors locally. */

export const T = {
  // Backgrounds
  bg:      "#0d1117",
  bgAlt:   "#0a0d13",
  surface: "#131820",
  raised:  "#191f2b",

  // Borders
  border:    "rgba(255,255,255,0.06)",
  borderMid: "rgba(255,255,255,0.11)",

  // Text
  text: "#eaecf0",
  sub:  "#8d97aa",
  muted:"#4a5270",

  // Brand accents
  green:   "#67e404",
  teal:    "#34d399",
  discord: "#5865f2",

  // Semantic
  java:    "#f59e0b",
  bedrock: "#60a5fa",
  red:     "#f87171",
  yellow:  "#f59e0b",
  purple:  "#a78bfa",
  yellow:  "#f59e0b",
  red:     "#f87171",
};

/* Shared style objects */
export const LABEL_STYLE = {
  display: "block",
  fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
  textTransform: "uppercase", color: T.green, marginBottom: 16,
};

export const H2_STYLE = {
  fontSize: "clamp(30px,5vw,56px)", fontWeight: 900,
  letterSpacing: "-0.04em", color: T.text,
  margin: "0 0 14px", lineHeight: 1.05,
};

export const SUB_STYLE = {
  fontSize: 17, color: T.sub, lineHeight: 1.75,
  margin: "0 0 48px", maxWidth: 500,
};

export const SECTION_STYLE = (alt = false) => ({
  padding: "96px 32px",
  borderTop: `1px solid ${T.border}`,
  background: alt ? T.bgAlt : T.bg,
});

export const INNER_STYLE = {
  maxWidth: 960, margin: "0 auto",
};
