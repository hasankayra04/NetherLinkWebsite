import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "@docusaurus/router";
import { signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseClient";
import Layout from "@theme/Layout";

const API_BASE = "https://api.mccompanion.net";

const NL = {
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
    accentDim: "rgba(103,228,4,0.10)",
    accentBorder: "rgba(103,228,4,0.22)",
    danger: "#f87171",
    dangerDim: "rgba(248,113,113,0.10)",
    dangerBorder: "rgba(248,113,113,0.22)",
};

function Spinner({ size = 16 }) {
    return (
        <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 100 24v-4l-3 3 3 3v4a12 12 0 01-12-12z" />
        </svg>
    );
}

function ForgotPasswordModal({ onClose }) {
    const [resetEmail, setResetEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
        function onKey(e) { if (e.key === "Escape") onClose(); }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!resetEmail) { setError("Please enter your email address."); return; }
        setError(""); setLoading(true);
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setSent(true);
        } catch (err) {
            setError(
                err.code === "auth/user-not-found"
                    ? "No account found with this email address."
                    : err.message
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, zIndex: 1000,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 16px",
                fontFamily: "'Inter', system-ui, sans-serif",
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: "100%", maxWidth: 380,
                    background: NL.surface,
                    border: `1px solid ${NL.borderMid}`,
                    borderRadius: 18,
                    overflow: "hidden",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
                }}
            >
                {/* top accent line */}
                <div style={{ height: 2, background: `linear-gradient(90deg, ${NL.accent}55 0%, transparent 100%)` }} />

                <div style={{ padding: "24px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NL.text, letterSpacing: "-0.02em" }}>
                                Reset password
                            </h2>
                            <p style={{ margin: "4px 0 0", fontSize: 12, color: NL.muted, lineHeight: 1.5 }}>
                                Enter your email and we'll send you a reset link.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: "none", border: "none", padding: "2px 4px",
                                cursor: "pointer", color: NL.muted, fontSize: 18, lineHeight: 1,
                                flexShrink: 0,
                            }}
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>

                    {sent ? (
                        <div style={{
                            fontSize: 13, color: NL.accent,
                            background: NL.accentDim,
                            border: `1px solid ${NL.accentBorder}`,
                            borderRadius: 8, padding: "12px 14px",
                            lineHeight: 1.6,
                        }}>
                            ✓ Reset email sent to <strong>{resetEmail}</strong> — check your inbox (and spam folder).
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div>
                                <label style={{
                                    display: "block",
                                    fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                                    textTransform: "uppercase", color: NL.muted, marginBottom: 6,
                                    fontFamily: "'JetBrains Mono', monospace",
                                }}>
                                    Email address
                                </label>
                                <input
                                    ref={inputRef}
                                    type="email"
                                    value={resetEmail}
                                    onChange={e => setResetEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    style={{
                                        width: "100%", padding: "10px 12px",
                                        background: NL.subtle,
                                        border: `1px solid ${NL.borderMid}`,
                                        borderRadius: 8,
                                        color: NL.text,
                                        fontSize: 14,
                                        fontFamily: "'Inter', system-ui, sans-serif",
                                        outline: "none",
                                        boxSizing: "border-box",
                                    }}
                                    onFocus={e => e.target.style.borderColor = NL.accentBorder}
                                    onBlur={e => e.target.style.borderColor = NL.borderMid}
                                />
                            </div>

                            {error && (
                                <div style={{
                                    fontSize: 12, color: NL.danger,
                                    background: NL.dangerDim,
                                    border: `1px solid ${NL.dangerBorder}`,
                                    borderRadius: 8, padding: "10px 12px",
                                    lineHeight: 1.5,
                                }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    style={{
                                        flex: 1, padding: "10px",
                                        background: NL.subtle,
                                        border: `1px solid ${NL.borderMid}`,
                                        borderRadius: 8,
                                        color: NL.secondary,
                                        fontSize: 13, fontWeight: 600,
                                        fontFamily: "'Inter', system-ui, sans-serif",
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        flex: 2, padding: "10px",
                                        background: NL.accent,
                                        border: "none",
                                        borderRadius: 8,
                                        color: "#0d1a18",
                                        fontSize: 13, fontWeight: 700,
                                        fontFamily: "'Inter', system-ui, sans-serif",
                                        cursor: loading ? "not-allowed" : "pointer",
                                        opacity: loading ? 0.6 : 1,
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    }}
                                >
                                    {loading ? <><Spinner size={13} /> Sending…</> : "Send reset link"}
                                </button>
                            </div>
                        </form>
                    )}

                    {sent && (
                        <button
                            onClick={onClose}
                            style={{
                                width: "100%", padding: "10px",
                                background: NL.subtle,
                                border: `1px solid ${NL.borderMid}`,
                                borderRadius: 8,
                                color: NL.secondary,
                                fontSize: 13, fontWeight: 600,
                                fontFamily: "'Inter', system-ui, sans-serif",
                                cursor: "pointer",
                            }}
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    const history = useHistory();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [error, setError] = useState("");
    const [showReset, setShowReset] = useState(false);

    useEffect(() => {
        if (!auth) { setChecking(false); return; }
        const unsub = onAuthStateChanged(auth, async (u) => {
            if (u) await redirectForUser(u);
            else setChecking(false);
        });
        return () => unsub();
    }, []);

    async function redirectForUser(u) {
        try {
            const token = await u.getIdToken();

            const adminRes = await fetch(`${API_BASE}/api/admin/members`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (adminRes.status === 200) {
                history.replace("/dashboard");
                return;
            }

            const memberRes = await fetch(`${API_BASE}/api/partner/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (memberRes.status === 200) {
                history.replace("/partner");
                return;
            }

            await import("firebase/auth").then(({ signOut }) => signOut(auth));
            setError("This account does not have partner access. Please contact us on Discord if you think this is a mistake.");
            setChecking(false);
        } catch {
            history.replace("/login");
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(""); setLoading(true);
        try {
            if (!auth) throw new Error("Firebase not initialised");
            const cred = await signInWithEmailAndPassword(auth, email, password);
            await redirectForUser(cred.user);
        } catch (err) {
            setError(
                err.code === "auth/invalid-credential" || err.code === "auth/wrong-password"
                    ? "Invalid email or password."
                    : err.message
            );
        } finally {
            setLoading(false);
        }
    }

    if (checking) return (
        <Layout>
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: NL.bg }}>
                <Spinner size={24} />
            </div>
        </Layout>
    );

    const inputStyle = {
        width: "100%", padding: "10px 12px",
        background: NL.subtle,
        border: `1px solid ${NL.borderMid}`,
        borderRadius: 8,
        color: NL.text,
        fontSize: 14,
        fontFamily: "'Inter', system-ui, sans-serif",
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.2s",
    };

    return (
        <Layout>
            {showReset && <ForgotPasswordModal onClose={() => setShowReset(false)} />}

            <div style={{
                minHeight: "100vh",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 16px",
                background: NL.bg,
                fontFamily: "'Inter', system-ui, sans-serif",
            }}>
                <div style={{ width: "100%", maxWidth: 360 }}>

                    <div style={{ textAlign: "center", marginBottom: 32 }}>
                        <div style={{
                            width: 52, height: 52,
                            borderRadius: 14,
                            background: NL.surface,
                            border: `1px solid ${NL.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 14px",
                        }}>
                            <span style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: 700, fontSize: 18, color: NL.accent,
                            }}>NL</span>
                        </div>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: NL.text, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                            MCCompanion
                        </h1>
                        <p style={{ fontSize: 13, color: NL.muted, margin: 0 }}>Sign in to your account</p>
                    </div>

                    <div style={{
                        background: NL.surface,
                        border: `1px solid ${NL.border}`,
                        borderRadius: 18,
                        overflow: "hidden",
                    }}>
                        <div style={{
                            height: 2,
                            background: `linear-gradient(90deg, ${NL.accent}55 0%, transparent 100%)`,
                        }} />

                        <form onSubmit={handleSubmit} style={{ padding: "24px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
                            {[
                                { label: "Email", type: "email", val: email, set: setEmail, ac: "email" },
                                { label: "Password", type: "password", val: password, set: setPassword, ac: "current-password" },
                            ].map(({ label, type, val, set, ac }) => (
                                <div key={label}>
                                    <label style={{
                                        display: "block",
                                        fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                                        textTransform: "uppercase", color: NL.muted, marginBottom: 6,
                                        fontFamily: "'JetBrains Mono', monospace",
                                    }}>
                                        {label}
                                    </label>
                                    <input
                                        type={type} value={val}
                                        onChange={e => set(e.target.value)}
                                        required autoComplete={ac}
                                        style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = NL.accentBorder}
                                        onBlur={e => e.target.style.borderColor = NL.borderMid}
                                    />
                                </div>
                            ))}

                            {error && (
                                <div style={{
                                    fontSize: 12, color: NL.danger,
                                    background: NL.dangerDim,
                                    border: `1px solid ${NL.dangerBorder}`,
                                    borderRadius: 8, padding: "10px 12px",
                                    lineHeight: 1.5,
                                }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ textAlign: "right", marginTop: -8 }}>
                                <button
                                    type="button"
                                    onClick={() => setShowReset(true)}
                                    style={{
                                        background: "none", border: "none", padding: 0,
                                        fontSize: 12, color: NL.secondary,
                                        cursor: "pointer", textDecoration: "underline",
                                    }}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    marginTop: 4,
                                    width: "100%",
                                    padding: "11px",
                                    background: NL.accent,
                                    color: "#0d1a18",
                                    border: "none",
                                    borderRadius: 8,
                                    fontSize: 14,
                                    fontWeight: 700,
                                    fontFamily: "'Inter', system-ui, sans-serif",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    opacity: loading ? 0.6 : 1,
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    transition: "opacity 0.2s",
                                }}
                            >
                                {loading ? <><Spinner size={14} /> Signing in…</> : "Sign in"}
                            </button>
                        </form>
                    </div>

                    <p style={{ fontSize: 12, color: NL.muted, textAlign: "center", marginTop: 16 }}>
                        You'll be redirected to the right dashboard automatically.
                    </p>
                </div>
            </div>
        </Layout>
    );
}
