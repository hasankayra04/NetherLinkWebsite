import React, { useEffect, useState, useCallback } from "react";
import { useHistory } from "@docusaurus/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseClient";
import { fetchIdToken } from "../firebaseAuthHelpers";
import Layout from "@theme/Layout";

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
  success: "#34d399",
};
const font = "'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'Fira Code', monospace";
const API_BASE = "https://api.mccompanion.net";

function Spinner({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40 20" />
    </svg>
  );
}

function Card({ title, subtitle, action, children }) {
  return (
    <div style={{ background: NL.surface, border: `1px solid ${NL.border}`, borderRadius: 14, padding: "18px 20px", fontFamily: font }}>
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

function Badge({ color = "default", children }) {
  const colors = {
    default: { bg: NL.elevated, border: NL.border, text: NL.secondary },
    accent: { bg: NL.accentDim, border: NL.accentBorder, text: NL.accent },
    danger: { bg: NL.dangerDim, border: NL.dangerBorder, text: NL.danger },
  };
  const c = colors[color] || colors.default;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 5, background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontFamily: font }}>
      {children}
    </span>
  );
}

function Btn({ onClick, disabled, children, size = "md" }) {
  const pad = size === "sm" ? "6px 14px" : "9px 18px";
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: pad, borderRadius: 8, border: "none", cursor: disabled ? "not-allowed" : "pointer",
      background: disabled ? NL.elevated : NL.accent, color: disabled ? NL.muted : "#000",
      fontSize: 13, fontWeight: 600, fontFamily: font, transition: "opacity 0.15s",
      opacity: disabled ? 0.5 : 1,
    }}>
      {children}
    </button>
  );
}

export default function AccountPage() {
  const history = useHistory();
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [checking, setChecking] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileEdit, setProfileEdit] = useState({ displayName: "", bio: "" });
  const [profileDirty, setProfileDirty] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [inviteCopied, setInviteCopied] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarInputRef = React.useRef();

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!auth) { setChecking(false); history.replace("/login"); return; }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setChecking(false); history.replace("/login"); return; }
      setFirebaseUser(u);
      try {
        const token = await u.getIdToken();
        const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { history.replace("/login"); return; }
        const { roles: r } = await res.json();
        setRoles(r || []);
      } catch (_) { history.replace("/login"); return; }
      setChecking(false);
    });
    return () => unsub();
  }, []);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true); setProfileError(null);
    try {
      const token = await fetchIdToken(); if (!token) return;
      const res = await fetch(`${API_BASE}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { if (res.status === 403) { setProfile(null); return; } throw new Error(`${res.status}`); }
      const { user: u } = await res.json();
      setProfile(u);
      setProfileEdit({ displayName: u.displayName || "", bio: u.bio || "" });
      setProfileDirty(false);
    } catch (e) { setProfileError("Failed to load profile: " + e.message); }
    finally { setProfileLoading(false); }
  }, []);

  useEffect(() => { if (!checking) loadProfile(); }, [checking, loadProfile]);

  async function saveProfile() {
    setProfileSaving(true); setProfileError(null); setProfileSuccess(false);
    try {
      const token = await fetchIdToken(); if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ displayName: profileEdit.displayName.trim() || null, bio: profileEdit.bio.trim() || null }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const { user: u } = await res.json();
      setProfile(u);
      setProfileEdit({ displayName: u.displayName || "", bio: u.bio || "" });
      setProfileDirty(false); setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (e) { setProfileError("Failed to save: " + e.message); }
    finally { setProfileSaving(false); }
  }

  async function uploadAvatar(file) {
    if (!file) return;
    setAvatarError(null);
    setAvatarUploading(true);
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    try {
      const token = await fetchIdToken();
      const form = new FormData();
      form.append("avatar", file);
      const res = await fetch(`${API_BASE}/api/users/me/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `${res.status}`);
      setProfile(p => ({ ...p, avatarUrl: data.avatarUrl }));
    } catch (e) {
      setAvatarError("Upload failed: " + e.message);
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
    }
  }

  async function removeAvatar() {
    if (!confirm("Remove your avatar?")) return;
    setAvatarError(null);
    setAvatarUploading(true);
    try {
      const token = await fetchIdToken();
      const res = await fetch(`${API_BASE}/api/users/me/avatar`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`${res.status}`);
      setProfile(p => ({ ...p, avatarUrl: null }));
      setAvatarPreview(null);
    } catch (e) {
      setAvatarError("Failed: " + e.message);
    } finally {
      setAvatarUploading(false);
    }
  }

  const inputStyle = {
    padding: "9px 12px", borderRadius: 9, border: `1px solid ${NL.borderMid}`,
    background: NL.subtle, color: NL.text, fontSize: 13, fontFamily: font,
    outline: "none", width: "100%", boxSizing: "border-box", transition: "border-color 0.15s",
  };

  if (checking) return (
    <Layout>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: NL.bg }}>
        <Spinner size={24} />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div style={{ minHeight: "100vh", background: NL.bg, fontFamily: font, paddingBottom: 60 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "24px 16px 0" : "40px 24px 0" }}>
          <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, color: NL.text, margin: "0 0 24px" }}>My Account</h1>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, alignItems: "start" }}>

            {/* Left: Profile */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {profileLoading ? (
                <Card title="Profile">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: NL.muted, fontSize: 13, padding: "24px 0", justifyContent: "center" }}><Spinner /> Loading…</div>
                </Card>
              ) : !profile ? (
                <Card title="Profile">
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <p style={{ fontSize: 13, color: NL.secondary, margin: "0 0 6px" }}>No app account found.</p>
                    <p style={{ fontSize: 12, color: NL.muted, margin: 0 }}>Download the MCCompanion app or <a href="/register" style={{ color: NL.accent }}>register via the website</a> to create a profile.</p>
                  </div>
                </Card>
              ) : (
                <Card title="Profile">
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
                    {/* Avatar with upload overlay */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                        style={{ display: "none" }} onChange={e => uploadAvatar(e.target.files[0])} />
                      {(avatarPreview || profile.avatarUrl) ? (
                        <img src={avatarPreview || profile.avatarUrl} alt="avatar"
                          style={{ width: 64, height: 64, borderRadius: 14, objectFit: "cover", border: `1px solid ${NL.borderMid}`, display: "block" }}
                          onError={e => e.currentTarget.style.display = "none"} />
                      ) : (
                        <div style={{ width: 64, height: 64, borderRadius: 14, background: NL.accentDim, border: `1px solid ${NL.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: NL.accent }}>
                          {(profile.username || "?")[0].toUpperCase()}
                        </div>
                      )}
                      {/* Hover overlay */}
                      <button onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading}
                        style={{ position: "absolute", inset: 0, borderRadius: 14, background: "rgba(0,0,0,0.55)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s", fontSize: 11, color: "#fff", fontFamily: font, fontWeight: 600 }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0}
                        title="Upload photo">
                        {avatarUploading ? <Spinner size={16} /> : "Change"}
                      </button>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 17, fontWeight: 700, color: NL.text, margin: "0 0 2px", fontFamily: mono }}>{profile.username}</p>
                      {profile.displayName && <p style={{ fontSize: 12, color: NL.secondary, margin: "0 0 4px" }}>{profile.displayName}</p>}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                        {profile.createdAt && <span style={{ fontSize: 11, color: NL.muted }}>Member since {new Date(profile.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>}
                        {profile.lastSeenAt && <span style={{ fontSize: 11, color: NL.muted }}>· Active {new Date(profile.lastSeenAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        <button onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading}
                          style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, border: `1px solid ${NL.border}`, background: NL.elevated, color: NL.secondary, cursor: "pointer", fontFamily: font }}>
                          {avatarUploading ? "Uploading…" : "Upload photo"}
                        </button>
                        {(profile.avatarUrl || avatarPreview) && (
                          <button onClick={removeAvatar} disabled={avatarUploading}
                            style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, border: `1px solid ${NL.dangerBorder}`, background: NL.dangerDim, color: NL.danger, cursor: "pointer", fontFamily: font }}>
                            Remove
                          </button>
                        )}
                      </div>
                      {avatarError && <p style={{ fontSize: 11, color: NL.danger, margin: "4px 0 0" }}>{avatarError}</p>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: NL.muted, marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Display name</label>
                      <input value={profileEdit.displayName} onChange={e => { setProfileEdit(p => ({ ...p, displayName: e.target.value })); setProfileDirty(true); }} placeholder="Optional display name…" maxLength={32} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: NL.muted, marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Bio</label>
                      <textarea value={profileEdit.bio} onChange={e => { setProfileEdit(p => ({ ...p, bio: e.target.value })); setProfileDirty(true); }} placeholder="Tell something about yourself…" maxLength={200} rows={3} style={{ ...inputStyle, resize: "vertical", minHeight: 72, fontFamily: font }} />
                      <p style={{ fontSize: 10, color: NL.muted, margin: "4px 0 0", textAlign: "right" }}>{(profileEdit.bio || "").length}/200</p>
                    </div>
                    {profileError && <p style={{ fontSize: 11, color: NL.danger, background: NL.dangerDim, border: `1px solid ${NL.dangerBorder}`, borderRadius: 6, padding: "8px 10px", margin: 0 }}>⚠ {profileError}</p>}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Btn onClick={saveProfile} disabled={!profileDirty || profileSaving} size="sm">
                        {profileSaving ? <><Spinner size={12} /> Saving…</> : "Save"}
                      </Btn>
                      {profileSuccess && <span style={{ fontSize: 12, color: NL.success }}>✓ Saved</span>}
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Right: Account info + Minecraft accounts */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Card title="Account" action={
                <button onClick={loadProfile} title="Refresh" style={{ background: "none", border: "none", cursor: "pointer", color: NL.muted, display: "flex", alignItems: "center", padding: 4, borderRadius: 6 }}
                  onMouseEnter={e => e.currentTarget.style.color = NL.text}
                  onMouseLeave={e => e.currentTarget.style.color = NL.muted}
                >↻</button>
              }>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {[
                    { label: "Email", value: firebaseUser?.email, mono: true },
                    { label: "UID", value: firebaseUser?.uid, mono: true, small: true },
                    { label: "Roles", value: null },
                  ].map(({ label, value, mono: isMono, small }, i, arr) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < arr.length - 1 ? `1px solid ${NL.border}` : "none" }}>
                      <span style={{ fontSize: 12, color: NL.muted }}>{label}</span>
                      {value !== null && value !== undefined
                        ? <span style={{ fontSize: small ? 11 : 13, color: NL.text, fontFamily: isMono ? mono : font }}>{value}</span>
                        : <div style={{ display: "flex", gap: 4 }}>
                          <Badge color="default">user</Badge>
                          {roles.map(r => <Badge key={r} color={r === "admin" ? "danger" : "accent"}>{r}</Badge>)}
                        </div>
                      }
                    </div>
                  ))}
                </div>
              </Card>

              {profile && (
                <Card title="Minecraft accounts" subtitle="Linked via the app">
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: NL.muted, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Java Edition</p>
                      {(profile.javaAccounts || []).length === 0 ? (
                        <p style={{ fontSize: 12, color: NL.muted, margin: 0 }}>No Java account linked.</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {(profile.javaAccounts || []).map(a => (
                            <div key={a.javaUuid} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: NL.elevated, border: `1px solid ${NL.border}` }}>
                              <img src={`https://crafatar.com/avatars/${a.javaUuid}?size=32&overlay`} alt={a.javaUsername} style={{ width: 32, height: 32, borderRadius: 6, imageRendering: "pixelated", flexShrink: 0 }} onError={e => e.currentTarget.style.display = "none"} />
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: NL.text, margin: 0 }}>{a.javaUsername}</p>
                                <p style={{ fontFamily: mono, fontSize: 10, color: NL.muted, margin: 0 }}>{a.javaUuid}</p>
                              </div>
                              {a.linkedAt && <span style={{ fontSize: 10, color: NL.muted }}>{new Date(a.linkedAt).toLocaleDateString("en-GB")}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: NL.muted, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Bedrock Edition</p>
                      {(profile.bedrockAccounts || []).length === 0 ? (
                        <p style={{ fontSize: 12, color: NL.muted, margin: 0 }}>No Bedrock account linked.</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {(profile.bedrockAccounts || []).map(a => (
                            <div key={a.xboxXuid} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: NL.elevated, border: `1px solid ${NL.border}` }}>
                              <div style={{ width: 32, height: 32, borderRadius: 6, background: NL.elevated, border: `1px solid ${NL.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🎮</div>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: NL.text, margin: 0 }}>{a.xboxGamertag}</p>
                                <p style={{ fontFamily: mono, fontSize: 10, color: NL.muted, margin: 0 }}>XUID: {a.xboxXuid}</p>
                              </div>
                              {a.linkedAt && <span style={{ fontSize: 10, color: NL.muted }}>{new Date(a.linkedAt).toLocaleDateString("en-GB")}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: NL.muted, margin: 0 }}>Link your accounts via the MCCompanion app.</p>
                  </div>
                </Card>
              )}
            </div>

            {profile && (
              <div style={{ marginTop: 16 }}>
                <div style={{
                  background: NL.surface, border: `1px solid ${NL.accentBorder}`,
                  borderRadius: 14, padding: "16px 20px",
                  display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: NL.accentDim, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 20 }}>👋</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: NL.text }}>Invite a friend</p>
                    <p style={{ margin: 0, fontSize: 11, color: NL.muted }}>Share your profile link so friends can find you on MCCompanion</p>
                  </div>
                  <button
                    onClick={() => {
                      const url = `https://mccompanion.net/u?name=${profile.username}`;
                      if (navigator.share) {
                        navigator.share({ title: "Check out my MCCompanion profile!", url }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(url).then(() => {
                          setInviteCopied(true);
                          setTimeout(() => setInviteCopied(false), 2000);
                        });
                      }
                    }}
                    style={{
                      background: inviteCopied ? NL.accentDim : NL.accent,
                      color: inviteCopied ? NL.accent : "#000",
                      border: inviteCopied ? `1px solid ${NL.accentBorder}` : "none",
                      borderRadius: 8, padding: "8px 18px", fontWeight: 700,
                      fontSize: 13, cursor: "pointer", fontFamily: font, flexShrink: 0,
                      transition: "all 0.15s",
                    }}
                  >
                    {inviteCopied ? "✓ Copied!" : "Share link"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
