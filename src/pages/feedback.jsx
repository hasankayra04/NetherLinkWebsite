import { useState, useEffect } from "react";
import Layout from "@theme/Layout";
import { motion } from "framer-motion";
import { FaBug, FaLightbulb, FaCheckCircle, FaExclamationCircle, FaGithub, FaChevronDown, FaUser } from "react-icons/fa";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseClient";
import { fetchIdToken } from "../firebaseAuthHelpers";

const NL = {
  bg: "#0d1117",
  surface: "#131820",
  elevated: "#191f2b",
  subtle: "#1f2635",
  text: "#eaecf0",
  secondary: "#8d97aa",
  muted: "#4a5270",
  border: "rgba(255,255,255,0.06)",
  borderMid: "rgba(255,255,255,0.11)",
  accent: "#67e404",
  accentDim: "rgba(103,228,4,0.10)",
  accentBorder: "rgba(103,228,4,0.22)",
  danger: "#f87171",
  dangerDim: "rgba(248,113,113,0.10)",
  dangerBorder: "rgba(248,113,113,0.22)",
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.42, ease: "easeOut" },
  }),
};

const PLATFORMS = ["Android", "iOS", "Windows", "macOS", "Other"];

function TypeToggle({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {[
        { id: "bug", label: "Bug Report", icon: <FaBug size={13} />, color: NL.danger, dim: NL.dangerDim, border: NL.dangerBorder },
        { id: "feature", label: "Feature Request", icon: <FaLightbulb size={13} />, color: NL.accent, dim: NL.accentDim, border: NL.accentBorder },
      ].map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              padding: "11px 16px",
              borderRadius: 12,
              border: `1px solid ${active ? t.border : NL.border}`,
              background: active ? t.dim : NL.elevated,
              color: active ? t.color : NL.secondary,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.18s",
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            {t.icon}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function InputField({ label, placeholder, value, onChange, maxLength, multiline, required, hint }) {
  const [focused, setFocused] = useState(false);
  const Tag = multiline ? "textarea" : "input";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: NL.secondary, letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
          {label}{required && <span style={{ color: NL.accent, marginLeft: 3 }}>*</span>}
        </label>
        {maxLength && (
          <span style={{ fontSize: 11, color: NL.muted, fontFamily: "'JetBrains Mono', monospace" }}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <Tag
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={multiline ? 5 : undefined}
        style={{
          width: "100%",
          padding: multiline ? "12px 16px" : "10px 16px",
          background: NL.elevated,
          border: `1px solid ${focused ? NL.accentBorder : NL.borderMid}`,
          borderRadius: 10,
          color: NL.text,
          fontSize: 14,
          fontFamily: "'Inter', system-ui, sans-serif",
          outline: "none",
          resize: multiline ? "vertical" : undefined,
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: focused ? "0 0 0 3px rgba(103,228,4,0.06)" : "none",
          boxSizing: "border-box",
          minHeight: multiline ? 120 : undefined,
        }}
      />
      {hint && <p style={{ fontSize: 12, color: NL.muted, margin: 0 }}>{hint}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: NL.secondary, letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: "10px 36px 10px 16px",
            background: NL.elevated,
            border: `1px solid ${focused ? NL.accentBorder : NL.borderMid}`,
            borderRadius: 10,
            color: value ? NL.text : NL.muted,
            fontSize: 14,
            fontFamily: "'Inter', system-ui, sans-serif",
            outline: "none",
            appearance: "none",
            cursor: "pointer",
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: focused ? "0 0 0 3px rgba(103,228,4,0.06)" : "none",
            boxSizing: "border-box",
          }}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o.toLowerCase()} style={{ background: NL.surface, color: NL.text }}>{o}</option>
          ))}
        </select>
        <FaChevronDown size={11} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: NL.muted, pointerEvents: "none" }} />
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  const [type, setType] = useState("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [issueUrl, setIssueUrl] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [authState, setAuthState] = useState("checking");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!auth) { setAuthState("out"); return; }
    const unsub = onAuthStateChanged(auth, (u) => setAuthState(u ? "in" : "out"));
    return () => unsub();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const token = await fetchIdToken();
      if (!token) {
        setErrorMsg("Please log in to send feedback.");
        setStatus("error");
        return;
      }
      const res = await fetch("https://api.mccompanion.net/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type,
          title: title.trim(),
          description: description.trim(),
          platform: platform || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setIssueUrl(data.issueUrl);
      setStatus("success");
    } catch {
      setErrorMsg("Could not reach the server. Please try again later.");
      setStatus("error");
    }
  }

  function handleReset() {
    setType("bug");
    setTitle("");
    setDescription("");
    setPlatform("");
    setStatus("idle");
    setErrorMsg("");
    setIssueUrl("");
  }

  const isBug = type === "bug";
  const typeColor = isBug ? NL.danger : NL.accent;
  const typeDim = isBug ? NL.dangerDim : NL.accentDim;
  const typeBorder = isBug ? NL.dangerBorder : NL.accentBorder;

  return (
    <Layout
      title="Feedback: MCCompanion"
      description="Report a bug or suggest a new feature for MCCompanion. Your feedback goes directly to our team."
    >
      <div
        style={{
          background: NL.bg,
          minHeight: "100vh",
          fontFamily: "'Inter', system-ui, sans-serif",
          padding: isMobile ? "80px 16px 64px" : "96px 20px 80px",
        }}
      >
        <div
          style={{
            position: "fixed",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(600px, 100vw)",
            height: 400,
            background: `radial-gradient(ellipse at 50% 0%, ${isBug ? "rgba(248,113,113,0.06)" : "rgba(103,228,4,0.06)"} 0%, transparent 70%)`,
            pointerEvents: "none",
            transition: "background 0.5s",
            zIndex: 0,
          }}
        />

        <main style={{ maxWidth: 620, margin: "0 auto", position: "relative", zIndex: 1 }}>

          <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible" style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 10,
              padding: "4px 10px",
              borderRadius: 20,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: NL.accent,
              background: NL.accentDim,
              border: `1px solid ${NL.accentBorder}`,
              marginBottom: 16,
            }}>
              <FaGithub size={10} />
              Goes straight to GitHub
            </div>
            <h1 style={{
              fontSize: isMobile ? 28 : 36,
              fontWeight: 700,
              color: NL.text,
              margin: "0 0 10px",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}>
              Share your feedback
            </h1>
            <p style={{ fontSize: 15, color: NL.secondary, margin: 0, lineHeight: 1.6 }}>
              Something broken? Missing a feature? Tell us. We read everything, and honestly most fixes in the changelog started as a report on this page.
            </p>
          </motion.div>

          {authState !== "in" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{
                background: NL.surface,
                border: `1px solid ${NL.border}`,
                borderRadius: 18,
                padding: isMobile ? "36px 24px" : "48px 40px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              {authState === "checking" ? (
                <p style={{ fontSize: 14, color: NL.secondary, margin: 0 }}>Checking your account…</p>
              ) : (
                <>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
                    display: "flex", alignItems: "center", justifyContent: "center", color: NL.accent,
                  }}>
                    <FaUser size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: NL.text, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
                      Log in to send feedback
                    </h2>
                    <p style={{ fontSize: 14, color: NL.secondary, margin: 0, lineHeight: 1.6 }}>
                      Quick login first, that way we can message you in the app if we have a question, or when your bug is fixed.
                    </p>
                  </div>
                  <a href="/login" style={{
                    display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 22px",
                    borderRadius: 10, background: NL.accent, color: "#000",
                    fontSize: 13, fontWeight: 700, textDecoration: "none",
                  }}>
                    Log in →
                  </a>
                </>
              )}
            </motion.div>
          ) : status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{
                background: NL.surface,
                border: `1px solid ${NL.accentBorder}`,
                borderRadius: 18,
                padding: isMobile ? "36px 24px" : "48px 40px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: NL.accentDim,
                border: `1px solid ${NL.accentBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: NL.accent,
              }}>
                <FaCheckCircle size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: NL.text, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
                  Thanks for the feedback!
                </h2>
                <p style={{ fontSize: 14, color: NL.secondary, margin: 0, lineHeight: 1.6 }}>
                  Your report has been submitted and a GitHub issue has been created. We'll look into it as soon as possible.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                {issueUrl && (
                  <a
                    href={issueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "9px 18px",
                      borderRadius: 10,
                      background: NL.accentDim,
                      border: `1px solid ${NL.accentBorder}`,
                      color: NL.accent,
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "none",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    <FaGithub size={13} />
                    View on GitHub
                  </a>
                )}
                <button
                  onClick={handleReset}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 18px",
                    borderRadius: 10,
                    background: NL.elevated,
                    border: `1px solid ${NL.border}`,
                    color: NL.secondary,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "color 0.15s, border-color 0.15s",
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.borderColor = NL.borderMid; }}
                  onMouseLeave={e => { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.borderColor = NL.border; }}
                >
                  Submit another
                </button>
              </div>
            </motion.div>
          ) : (
            /* Form */
            <motion.form
              variants={fadeUp}
              custom={1}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              style={{
                background: NL.surface,
                border: `1px solid ${NL.border}`,
                borderRadius: 18,
                padding: isMobile ? "24px 20px" : "32px 36px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: NL.secondary, letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
                  Type <span style={{ color: NL.accent }}>*</span>
                </label>
                <TypeToggle value={type} onChange={setType} />
              </div>

              <div style={{ height: 1, background: NL.border, margin: "0 -4px" }} />

              <InputField
                label="Title"
                placeholder={isBug ? "e.g. App crashes when opening skin editor" : "e.g. Show player ping in the server list"}
                value={title}
                onChange={setTitle}
                maxLength={200}
                required
              />

              <InputField
                label={isBug ? "What happened?" : "Describe your idea"}
                placeholder={
                  isBug
                    ? "Describe the bug: what did you do, what did you expect, and what happened instead?"
                    : "Explain what you'd like and why it would be useful."
                }
                value={description}
                onChange={setDescription}
                maxLength={3000}
                multiline
                required
              />

              <SelectField
                label="Platform"
                value={platform}
                onChange={setPlatform}
                options={PLATFORMS}
                placeholder="Select platform..."
              />

              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: NL.dangerDim,
                    border: `1px solid ${NL.dangerBorder}`,
                    color: NL.danger,
                    fontSize: 13,
                  }}
                >
                  <FaExclamationCircle size={13} style={{ flexShrink: 0 }} />
                  {errorMsg}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={status === "loading" || !title.trim() || !description.trim()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px 24px",
                  borderRadius: 12,
                  background: status === "loading" || !title.trim() || !description.trim() ? NL.elevated : typeColor,
                  border: `1px solid ${status === "loading" || !title.trim() || !description.trim() ? NL.border : typeColor}`,
                  color: status === "loading" || !title.trim() || !description.trim() ? NL.muted : "#000",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: status === "loading" || !title.trim() || !description.trim() ? "not-allowed" : "pointer",
                  transition: "all 0.18s",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  opacity: status === "loading" ? 0.7 : 1,
                }}
              >
                {status === "loading" ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: "nl-spin 0.75s linear infinite" }}>
                      <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="26" strokeDashoffset="10" strokeLinecap="round" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaGithub size={14} />
                    {isBug ? "Submit Bug Report" : "Submit Feature Request"}
                  </>
                )}
              </button>

              <p style={{ fontSize: 12, color: NL.muted, margin: 0, textAlign: "center", lineHeight: 1.5 }}>
                Your report creates a public GitHub issue in{" "}
                <a href="https://github.com/MCCORG/MCCompanion/issues" target="_blank" rel="noopener noreferrer" style={{ color: NL.secondary, textDecoration: "none" }}>
                  MCCORG/MCCompanion
                </a>
                . Don't include passwords or private information.
              </p>
            </motion.form>
          )}

          <motion.div
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="visible"
            style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginTop: 16 }}
          >
            {[
              {
                icon: <FaBug size={14} />,
                color: NL.danger,
                dim: NL.dangerDim,
                border: NL.dangerBorder,
                title: "Bug reports",
                desc: "Describe what broke and how to reproduce it. Screenshots help a lot.",
              },
              {
                icon: <FaLightbulb size={14} />,
                color: NL.accent,
                dim: NL.accentDim,
                border: NL.accentBorder,
                title: "Feature requests",
                desc: "Got an idea? Tell us what you'd like and why it would be useful.",
              },
            ].map((card) => (
              <div
                key={card.title}
                style={{
                  padding: "16px 18px",
                  borderRadius: 12,
                  background: NL.surface,
                  border: `1px solid ${NL.border}`,
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: card.dim,
                  border: `1px solid ${card.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: card.color,
                  flexShrink: 0,
                }}>
                  {card.icon}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: NL.text, margin: "0 0 3px" }}>{card.title}</p>
                  <p style={{ fontSize: 12, color: NL.secondary, margin: 0, lineHeight: 1.5 }}>{card.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </main>
      </div>
    </Layout>
  );
}
