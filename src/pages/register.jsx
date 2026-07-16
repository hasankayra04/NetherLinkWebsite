import React, { useState, useEffect } from "react";
import { useHistory } from "@docusaurus/router";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseClient";
import Layout from "@theme/Layout";
import { API_BASE } from "../lib/api";
import { T } from "../lib/tokens";
import Spinner from "../components/Spinner";

const NL = {
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
};
const font = "'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

function validate(username) {
  if (!username) return null;
  if (!/^[a-z0-9_]{3,20}$/.test(username)) return "3–20 characters, only a–z, 0–9 and _";
  return null;
}

export default function RegisterPage() {
  const history = useHistory();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");

  useEffect(() => {
    if (!auth) { setChecking(false); return; }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const token = await u.getIdToken();
        const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { history.replace("/account"); return; }
      }
      setChecking(false);
    });
    return () => unsub();
  }, []);

  function handleUsernameChange(val) {
    const lower = val.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(lower);
    setUsernameError(lower.length > 0 ? validate(lower) || "" : "");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const uErr = validate(username);
    if (uErr) { setUsernameError(uErr); return; }
    setError(""); setLoading(true);

    let firebaseUser;
    try {
      if (!auth) throw new Error("Firebase not initialised");
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      firebaseUser = cred.user;
    } catch (err) {
      setLoading(false);
      if (err.code === "auth/email-already-in-use") return setError("An account with this email already exists.");
      if (err.code === "auth/weak-password") return setError("Password must be at least 6 characters.");
      return setError(err.message);
    }

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${API_BASE}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username }),
      });
      const json = await res.json();
      if (!res.ok) {
        await firebaseUser.delete().catch(() => {});
        if (json.error === "username_taken") return setError("This username is already taken.");
        throw new Error(json.message || `${res.status}`);
      }
      history.replace("/account");
    } catch (err) {
      await firebaseUser.delete().catch(() => {});
      setError(err.message || "Something went wrong. Please try again.");
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
    background: NL.subtle, border: `1px solid ${NL.borderMid}`,
    borderRadius: 8, color: NL.text, fontSize: 14,
    fontFamily: font, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <Layout>
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "0 16px",
        background: NL.bg, fontFamily: font,
      }}>
        <div style={{ width: "100%", maxWidth: 380 }}>

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: NL.surface, border: `1px solid ${NL.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px",
            }}>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 18, color: NL.accent }}>NL</span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: NL.text, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              Create account
            </h1>
            <p style={{ fontSize: 13, color: NL.muted, margin: 0 }}>Join MCCompanion</p>
          </div>

          <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 18, overflow: "hidden" }}>
            <div style={{ height: 2, background: `linear-gradient(90deg, ${NL.accent}55 0%, transparent 100%)` }} />

            <form onSubmit={handleSubmit} style={{ padding: "24px 22px", display: "flex", flexDirection: "column", gap: 16 }}>

              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: NL.muted, marginBottom: 6, fontFamily: mono }}>
                  Email
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  autoComplete="email" placeholder="you@example.com" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = NL.accentBorder}
                  onBlur={e => e.target.style.borderColor = NL.borderMid}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: NL.muted, marginBottom: 6, fontFamily: mono }}>
                  Password
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  autoComplete="new-password" placeholder="Min. 6 characters" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = NL.accentBorder}
                  onBlur={e => e.target.style.borderColor = NL.borderMid}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: NL.muted, marginBottom: 6, fontFamily: mono }}>
                  Username
                </label>
                <input type="text" value={username} onChange={e => handleUsernameChange(e.target.value)} required
                  autoComplete="username" placeholder="your_username" maxLength={20}
                  style={{ ...inputStyle, fontFamily: mono, borderColor: usernameError ? NL.dangerBorder : NL.borderMid }}
                  onFocus={e => e.target.style.borderColor = usernameError ? NL.dangerBorder : NL.accentBorder}
                  onBlur={e => e.target.style.borderColor = usernameError ? NL.dangerBorder : NL.borderMid}
                />
                {usernameError ? (
                  <p style={{ fontSize: 11, color: NL.danger, margin: "4px 0 0" }}>{usernameError}</p>
                ) : (
                  <p style={{ fontSize: 11, color: NL.muted, margin: "4px 0 0" }}>
                    3–20 characters · lowercase letters, numbers and _
                  </p>
                )}
              </div>

              {error && (
                <div style={{ fontSize: 12, color: NL.danger, background: NL.dangerDim, border: `1px solid ${NL.dangerBorder}`, borderRadius: 8, padding: "10px 12px", lineHeight: 1.5 }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !!usernameError}
                style={{
                  marginTop: 4, width: "100%", padding: "11px",
                  background: NL.accent, color: "#0d1a18",
                  border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700,
                  fontFamily: font, cursor: (loading || !!usernameError) ? "not-allowed" : "pointer",
                  opacity: (loading || !!usernameError) ? 0.6 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "opacity 0.2s",
                }}
              >
                {loading ? <><Spinner size={14} /> Creating account…</> : "Create account"}
              </button>
            </form>
          </div>

          <p style={{ fontSize: 12, color: NL.muted, textAlign: "center", marginTop: 16 }}>
            Already have an account?{" "}
            <a href="/login" style={{ color: NL.accent, textDecoration: "none", fontWeight: 600 }}>Sign in</a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
