import React, { useState } from "react";
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
  success: "#34d399",
  successDim: "rgba(52,211,153,0.10)",
  successBorder: "rgba(52,211,153,0.22)",
  warning: "#fbbf24",
  warningDim: "rgba(251,191,36,0.10)",
  warningBorder: "rgba(251,191,36,0.22)",
};
const font = "'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'Fira Code', monospace";

const API_BASE = "https://api.mccompanion.net";

const ENDPOINTS = [
  {
    id: "lookup-java",
    method: "GET",
    path: "/api/lookup/java/:identifier",
    title: "Java Lookup",
    rateLimit: "60 req / min",
    description:
      "Resolve a Minecraft Java player by username or UUID. Returns the Mojang profile including skin and head avatar URL.",
    params: [
      {
        name: "identifier",
        in: "path",
        required: true,
        type: "string",
        description: "Minecraft Java username or UUID (with or without dashes)",
      },
    ],
    example: {
      request: `GET ${API_BASE}/api/lookup/java/Notch`,
      response: `{
  "platform": "java",
  "username": "Notch",
  "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
  "skinUrl": "http://textures.minecraft.net/texture/292009a4...",
  "headUrl": "https://crafatar.com/avatars/069a79f4...?size=64&overlay"
}`,
    },
    responseFields: [
      { name: "platform", desc: 'Always "java"' },
      { name: "username", desc: "In-game Minecraft username" },
      { name: "uuid", desc: "Mojang UUID (dashed format)" },
      { name: "skinUrl", desc: "Full skin texture URL from Mojang" },
      { name: "headUrl", desc: "64×64 head avatar via Crafatar" },
    ],
  },
  {
    id: "lookup-bedrock",
    method: "GET",
    path: "/api/lookup/bedrock/:identifier",
    title: "Bedrock Lookup",
    rateLimit: "60 req / min",
    description:
      "Resolve a Minecraft Bedrock player by Xbox gamertag or numeric XUID. Returns Xbox Live profile data including skin, gamerpic, and gamerscore.",
    params: [
      {
        name: "identifier",
        in: "path",
        required: true,
        type: "string",
        description: "Xbox gamertag or numeric XUID (10–20 digits)",
      },
    ],
    example: {
      request: `GET ${API_BASE}/api/lookup/bedrock/KobeNetwork`,
      response: `{
  "platform": "bedrock",
  "gamertag": "KobeNetwork",
  "xuid": "2535461503960946",
  "floodgateuid": "00000000-0000-0000-0009-02028e3e5df2",
  "skinUrl": "http://textures.minecraft.net/texture/827075cf...",
  "gamerscore": 595,
  "tier": "Silver",
  "gamerpicUrl": "https://images-eds-ssl.xboxlive.com/image?url=..."
}`,
    },
    responseFields: [
      { name: "platform", desc: 'Always "bedrock"' },
      { name: "gamertag", desc: "Xbox Live gamertag" },
      { name: "xuid", desc: "Numeric Xbox Live identifier" },
      { name: "floodgateuid", desc: "Floodgate UUID derived from the XUID (used by GeyserMC)" },
      { name: "skinUrl", desc: "Full skin texture URL via GeyserMC" },
      { name: "gamerscore", desc: "Xbox Gamerscore" },
      { name: "tier", desc: 'Xbox account tier: "Gold", "Silver", etc.' },
      { name: "gamerpicUrl", desc: "Xbox Live profile picture URL" },
    ],
  },
  {
    id: "lookup",
    method: "GET",
    path: "/api/lookup/bedrock-java/:identifier",
    title: "Player Lookup",
    rateLimit: "60 req / min",
    description:
      "Resolve a Minecraft player by Xbox gamertag, Java username, or XUID. Automatically detects the account type and cross-links Bedrock ↔ Java profiles where available.",
    params: [
      {
        name: "identifier",
        in: "path",
        required: true,
        type: "string",
        description: "Xbox gamertag, Minecraft Java username, or numeric XUID",
      },
    ],
    example: {
      request: `GET ${API_BASE}/api/lookup/bedrock-java/Notch`,
      response: `{
  "java": {
    "platform": "java",
    "username": "Notch",
    "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
    "skinUrl": "http://textures.minecraft.net/texture/292009a4...",
    "headUrl": "https://crafatar.com/avatars/069a79f4...?size=64&overlay"
  },
  "bedrock": null,
  "linked": false
}`,
      responseAlt: `// Bedrock player example
{
  "java": null,
  "bedrock": {
    "platform": "bedrock",
    "gamertag": "KobeNetwork",
    "xuid": "2535461503960946",
    "floodgateuid": "00000000-0000-0000-0009-02028e3e5df2",
    "skinUrl": "http://textures.minecraft.net/texture/827075cf...",
    "gamerscore": 595,
    "tier": "Silver",
    "gamerpicUrl": "https://images-eds-ssl.xboxlive.com/image?url=..."
  },
  "linked": false
}`,
    },
    note: "bedrock is null when no linked Bedrock account is found, and vice-versa. linked: true means both profiles were resolved and cross-linked.",
    responseFields: [
      { name: "java.username", desc: "Java in-game username" },
      { name: "java.uuid", desc: "Mojang UUID (dashed)" },
      { name: "java.skinUrl", desc: "Full skin texture URL" },
      { name: "java.headUrl", desc: "64×64 head avatar via Crafatar" },
      { name: "bedrock.gamertag", desc: "Xbox gamertag" },
      { name: "bedrock.xuid", desc: "Numeric Xbox Live identifier" },
      { name: "bedrock.floodgateuid", desc: "Floodgate UUID derived from the XUID (used by GeyserMC)" },
      { name: "bedrock.skinUrl", desc: "Full skin texture URL via GeyserMC" },
      { name: "bedrock.gamerscore", desc: "Xbox Gamerscore" },
      { name: "bedrock.tier", desc: 'Xbox account tier: "Gold", "Silver", etc.' },
      { name: "bedrock.gamerpicUrl", desc: "Xbox Live profile picture URL" },
      { name: "linked", desc: "true when both Java and Bedrock were resolved together" },
    ],
  },
  {
    id: "metrics",
    method: "GET",
    path: "/api/metrics",
    title: "Server Metrics",
    rateLimit: "60 req / min",
    description:
      "Top 30 Minecraft servers ranked by connection count through the MCCompanion app, plus global totals.",
    params: [],
    example: {
      request: `GET ${API_BASE}/api/metrics`,
      response: `{
  "totalCount": 264811,
  "totalServers": 9225,
  "top": [
    { "ip": "donutsmp.net",      "count": 100477 },
    { "ip": "mc.cosmosmc.org",   "count": 7788   },
    { "ip": "zeqa.net",          "count": 3913   },
    { "ip": "nl.lifestealsmp.com","count": 3848  }
  ]
}`,
    },
  },
  {
    id: "bots",
    method: "GET",
    path: "/api/bots",
    title: "Bot Status",
    rateLimit: "60 req / min",
    description:
      "Xbox relay bot accounts with their current friend counts and limits. Both EU and US bots are returned by default.",
    params: [
      {
        name: "region",
        in: "query",
        required: false,
        type: '"eu" | "us"',
        description:
          'Target a specific region. Omit to use automatic geographic routing.',
      },
    ],
    example: {
      request: `GET ${API_BASE}/api/bots?region=eu`,
      response: `{
  "bots": [
    {
      "gamertag": "MCCompanion1",
      "friendCount": 1842,
      "maxFriends": 2000
    },
    {
      "gamertag": "MCCompanion2",
      "friendCount": 970,
      "maxFriends": 2000
    }
  ]
}`,
    },
  },
  {
    id: "featured-packs",
    method: "GET",
    path: "/api/featured-packs",
    title: "Featured Packs",
    rateLimit: "60 req / min",
    description: "List of curated Minecraft Bedrock resource packs shown in the MCCompanion app and website.",
    params: [],
    example: {
      request: `GET ${API_BASE}/api/featured-packs`,
      response: `{
  "packs": [
    {
      "id": 1,
      "name": "Faithful 32x",
      "slug": "faithful-32x",
      "description": "A clean faithful texture pack for Bedrock.",
      "iconUrl": "https://...",
      "downloadUrl": "https://...",
      "downloadCount": 1842,
      "isActive": true,
      "createdAt": "2026-04-01T00:00:00.000Z"
    }
  ]
}`,
    },
    responseFields: [
      { name: "id", desc: "Unique pack ID" },
      { name: "name", desc: "Display name of the resource pack" },
      { name: "slug", desc: "URL-friendly identifier" },
      { name: "description", desc: "Short description of the pack" },
      { name: "iconUrl", desc: "Pack icon image URL" },
      { name: "downloadUrl", desc: "Direct download URL for the .mcpack file" },
      { name: "downloadCount", desc: "Number of times this pack was applied via the app" },
      { name: "isActive", desc: "Whether the pack is currently listed publicly" },
    ],
  },
  {
    id: "packs-lookup",
    method: "GET",
    path: "/api/packs/lookup",
    title: "Pack Lookup",
    rateLimit: "60 req / min",
    description: "Look up a resource pack by its download URL. Returns pack metadata if the URL matches a known featured pack.",
    params: [
      { name: "url", in: "query", required: true, type: "string", description: "The full download URL of the resource pack" },
    ],
    example: {
      request: `GET ${API_BASE}/api/packs/lookup?url=https://example.com/pack.mcpack`,
      response: `{
  "pack": {
    "id": 1,
    "name": "Faithful 32x",
    "slug": "faithful-32x",
    "iconUrl": "https://..."
  }
}`,
    },
    responseFields: [
      { name: "pack", desc: "Pack metadata if found, null otherwise" },
    ],
  },
  {
    id: "featured-servers",
    method: "GET",
    path: "/api/featured-servers",
    title: "Featured Servers",
    rateLimit: "60 req / min",
    description:
      "The list of featured and partner Minecraft servers shown in the MCCompanion app.",
    params: [],
    example: {
      request: `GET ${API_BASE}/api/featured-servers`,
      response: `{
  "servers": [
    {
      "id": 3,
      "name": "ChillSMP",
      "address": "mc.chillsmp.org",
      "port": 19132,
      "description": "A relaxed survival server focused on community, building, and pure Minecraft fun.",
      "iconUrl": "https://raw.githubusercontent.com/NetherDevMc/NetherLinkData/main/featured/icons/chillsmp.png",
      "websiteUrl": "https://chillsmp.org",
      "featured": true,
      "createdAt": "2026-05-13T01:02:37.138Z",
      "updatedAt": "2026-05-14T01:14:52.694Z"
    }
  ]
}`,
    },
  },
  {
    id: "notification",
    method: "GET",
    path: "/notification",
    title: "App Notification",
    rateLimit: "60 req / min",
    description:
      "Current in-app notification shown to all MCCompanion users. Returns the active announcement title, message, and severity type.",
    params: [],
    example: {
      request: `GET ${API_BASE}/notification`,
      response: `{
  "title": "Relay Server Information",
  "message": "MCCompanion 4.0 is live, check out the new features in the app!",
  "type": "warning"
}`,
    },
    responseFields: [
      { name: "title", desc: "Short notification heading" },
      { name: "message", desc: "Full notification body text" },
      { name: "type", desc: 'Severity level: "info", "warning", "error"' },
    ],
  },
  {
    id: "version",
    method: "GET",
    path: "/api/version",
    title: "App Version",
    rateLimit: "60 req / min",
    description: "Current recommended version of the MCCompanion app.",
    params: [],
    example: {
      request: `GET ${API_BASE}/api/version`,
      response: `{
  "version": "3.5.4",
  "updated_at": "2026-05-12T23:26:18.992Z"
}`,
    },
  },
  {
    id: "user-profile",
    method: "GET",
    path: "/api/users/:username",
    title: "User Profile",
    rateLimit: "60 req / min",
    description:
      "Fetch the public profile of a MCCompanion user by username.",
    params: [
      {
        name: "username",
        in: "path",
        required: true,
        type: "string",
        description: "MCCompanion username (3–20 chars, a–z 0–9 _)",
      },
    ],
    example: {
      request: `GET ${API_BASE}/api/users/KobeNetwork`,
      response: `{
  "user": {
    "username": "KobeNetwork",
    "displayName": "Kobe",
    "avatarUrl": "https://...",
    "bio": "Minecraft enjoyer",
    "createdAt": "2026-01-10T12:00:00.000Z"
  }
}`,
    },
    responseFields: [
      { name: "user.username", desc: "Unique username" },
      { name: "user.displayName", desc: "Display name shown in the app" },
      { name: "user.avatarUrl", desc: "Profile picture URL" },
      { name: "user.bio", desc: "Short user bio" },
      { name: "user.createdAt", desc: "Account creation timestamp (ISO 8601)" },
    ],
  },
  {
    id: "feedback",
    method: "POST",
    path: "/api/feedback",
    title: "Submit Feedback",
    rateLimit: "60 req / min",
    description:
      "Submit a bug report or feature request. Creates a GitHub issue and returns the issue number and URL.",
    params: [
      { name: "type", in: "body", required: true, type: '"bug" | "feature"', description: "Type of feedback" },
      { name: "title", in: "body", required: true, type: "string", description: "Short title (5–200 chars)" },
      { name: "description", in: "body", required: true, type: "string", description: "Detailed description (10–3000 chars)" },
      { name: "platform", in: "body", required: true, type: '"android" | "ios" | "windows" | "macos" | "other"', description: "Platform the issue occurs on" },
      { name: "appVersion", in: "body", required: true, type: "string", description: "App version string" },
      { name: "email", in: "body", required: false, type: "string", description: "Contact email for follow-up (optional)" },
    ],
    example: {
      request: `POST ${API_BASE}/api/feedback\nContent-Type: application/json\n\n{\n  "type": "bug",\n  "title": "App crashes on connect",\n  "description": "When I tap connect the app crashes immediately.",\n  "platform": "ios",\n  "appVersion": "4.1.0",\n  "email": "user@example.com"\n}`,
      response: `{
  "ok": true,
  "issueNumber": 42,
  "issueUrl": "https://github.com/..."
}`,
    },
    responseFields: [
      { name: "ok", desc: "true when the issue was created successfully" },
      { name: "issueNumber", desc: "GitHub issue number" },
      { name: "issueUrl", desc: "Direct link to the created GitHub issue" },
    ],
  },
  {
    id: "health",
    method: "GET",
    path: "/api/health",
    title: "Health Check",
    rateLimit: "60 req / min",
    description:
      "Server health status, uptime, and cache size. Useful for monitoring whether the API is reachable.",
    params: [],
    example: {
      request: `GET ${API_BASE}/api/health`,
      response: `{
  "status": "ok",
  "time": "2026-05-28T12:00:00.000Z",
  "uptimeSeconds": 86412,
  "cache": {
    "size": 142
  }
}`,
    },
    responseFields: [
      { name: "status", desc: '"ok" when the server is healthy' },
      { name: "time", desc: "Current server time (ISO 8601)" },
      { name: "uptimeSeconds", desc: "Seconds since the process started" },
      { name: "cache.size", desc: "Number of entries currently in the player cache" },
    ],
  },
];

function MethodBadge({ method }) {
  const colors = {
    GET: { bg: "rgba(103,228,4,0.12)", border: "rgba(103,228,4,0.28)", color: "#67e404" },
    POST: { bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.28)", color: "#60a5fa" },
    DELETE: { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.28)", color: "#f87171" },
    PATCH: { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.28)", color: "#fbbf24" },
  };
  const c = colors[method] || colors.GET;
  return (
    <span style={{
      fontFamily: mono, fontSize: 11, fontWeight: 700,
      letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 5,
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      flexShrink: 0,
    }}>
      {method}
    </span>
  );
}

function RateBadge({ limit }) {
  return (
    <span style={{
      fontFamily: mono, fontSize: 10, fontWeight: 600,
      padding: "2px 7px", borderRadius: 5, flexShrink: 0,
      background: NL.subtle,
      border: `1px solid ${NL.border}`,
      color: NL.muted,
    }}>
      {limit}
    </span>
  );
}

function ParamBadge({ required }) {
  return required ? (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.22)", color: "#f87171", fontFamily: mono }}>required</span>
  ) : (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: NL.subtle, border: `1px solid ${NL.border}`, color: NL.muted, fontFamily: mono }}>optional</span>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }
  return (
    <button onClick={copy} style={{
      background: copied ? NL.successDim : NL.elevated,
      border: `1px solid ${copied ? NL.successBorder : NL.border}`,
      color: copied ? NL.success : NL.muted,
      borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600,
      cursor: "pointer", fontFamily: font,
      transition: "all 0.15s",
      flexShrink: 0,
    }}>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({ label, code }) {
  return (
    <div style={{ marginTop: 10 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px", fontFamily: mono }}>{label}</p>
      <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", background: "rgba(0,0,0,0.25)", border: `1px solid ${NL.border}` }}>
        <div style={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}>
          <CopyButton text={code} />
        </div>
        <pre style={{
          margin: 0, padding: "14px 16px", paddingRight: 70,
          fontFamily: mono, fontSize: 12, lineHeight: 1.65,
          color: NL.secondary, overflowX: "auto", whiteSpace: "pre",
        }}>
          {code}
        </pre>
      </div>
    </div>
  );
}

function EndpointCard({ ep }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      id={ep.id}
      style={{
        background: NL.surface,
        border: `1px solid ${NL.border}`,
        borderRadius: 14,
        overflow: "hidden",
        scrollMarginTop: 80,
        transition: "border-color 0.2s",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = NL.borderMid}
      onMouseLeave={e => e.currentTarget.style.borderColor = NL.border}
    >
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: "16px 18px", display: "flex", alignItems: "center", gap: 10,
          textAlign: "left",
        }}
      >
        <MethodBadge method={ep.method} />
        <code style={{ fontFamily: mono, fontSize: 13, color: NL.text, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ep.path}
        </code>
        <span style={{ fontSize: 13, fontWeight: 600, color: NL.secondary, flexShrink: 0, marginLeft: 4 }}>{ep.title}</span>
        {ep.rateLimit && <RateBadge limit={ep.rateLimit} />}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          style={{ flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none", color: NL.muted }}
        >
          <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{ borderTop: `1px solid ${NL.border}`, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 13, color: NL.secondary, margin: 0, lineHeight: 1.6 }}>{ep.description}</p>

          {ep.params.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px", fontFamily: mono }}>Parameters</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ep.params.map(p => (
                  <div key={p.name} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "10px 12px", borderRadius: 8,
                    background: NL.elevated, border: `1px solid ${NL.border}`,
                    flexWrap: "wrap",
                  }}>
                    <div style={{ minWidth: 120, flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <code style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: NL.accent }}>{p.name}</code>
                        <span style={{ fontSize: 10, color: NL.muted, background: NL.subtle, padding: "1px 6px", borderRadius: 4, border: `1px solid ${NL.border}`, fontFamily: mono }}>{p.in}</span>
                      </div>
                      <ParamBadge required={p.required} />
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <code style={{ fontFamily: mono, fontSize: 11, color: NL.secondary }}>{p.type}</code>
                      <p style={{ fontSize: 12, color: NL.muted, margin: "4px 0 0" }}>{p.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <CodeBlock label="Request" code={ep.example.request} />
          <CodeBlock label="Response" code={ep.example.response} />
          {ep.example.responseAlt && (
            <CodeBlock label="Response (Bedrock)" code={ep.example.responseAlt} />
          )}

          {ep.note && (
            <div style={{
              padding: "10px 14px", borderRadius: 8,
              background: "rgba(103,228,4,0.06)", border: `1px solid ${NL.accentBorder}`,
              fontSize: 12, color: NL.secondary, lineHeight: 1.6,
            }}>
              <span style={{ color: NL.accent, fontWeight: 600 }}>Note · </span>{ep.note}
            </div>
          )}

          {ep.responseFields && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: NL.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px", fontFamily: mono }}>Response fields</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {ep.responseFields.map(f => (
                  <div key={f.name} style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "7px 0", borderBottom: `1px solid ${NL.border}` }}>
                    <code style={{ fontFamily: mono, fontSize: 11, fontWeight: 600, color: NL.accent, flexShrink: 0, minWidth: 180 }}>{f.name}</code>
                    <span style={{ fontSize: 12, color: NL.muted }}>{f.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <Layout title="API Reference" description="MCCompanion public API endpoints">
      <div style={{ minHeight: "100vh", background: NL.bg, fontFamily: font, padding: "64px 16px 80px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>

          <div style={{ marginBottom: 40 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 11, padding: "4px 12px", borderRadius: 20, marginBottom: 16,
              background: NL.accentDim, border: `1px solid ${NL.accentBorder}`,
              color: NL.accent, fontFamily: mono,
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: NL.success }} />
              Public API
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: NL.text, letterSpacing: "-0.025em", margin: "0 0 10px" }}>
              API Reference
            </h1>
            <p style={{ fontSize: 14, color: NL.secondary, margin: "0 0 20px", lineHeight: 1.6, maxWidth: 520 }}>
              All endpoints are publicly accessible, no authentication required. The base URL is:
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: NL.elevated, border: `1px solid ${NL.border}` }}>
              <code style={{ fontFamily: mono, fontSize: 13, color: NL.accent }}>{API_BASE}</code>
              <CopyButton text={API_BASE} />
            </div>
          </div>

          <div style={{
            padding: "14px 16px", borderRadius: 12, marginBottom: 24,
            background: NL.warningDim, border: `1px solid ${NL.warningBorder}`,
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke={NL.warning} strokeWidth="2" />
                <path d="M12 8v4M12 16h.01" stroke={NL.warning} strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: NL.warning, fontFamily: mono, textTransform: "uppercase", letterSpacing: "0.06em" }}>Rate limits</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                { label: "Global (all endpoints)", value: "60 req / min per IP" },
                { label: "Player Lookup", value: "60 req / min per IP" },
                { label: "Featured Servers", value: "60 req / min per IP" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: NL.secondary }}>
                  <span style={{ minWidth: 160, color: NL.muted, fontFamily: mono, fontSize: 11 }}>{row.label}</span>
                  <span style={{ color: NL.text, fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: NL.muted, margin: 0, lineHeight: 1.5 }}>
              Exceeding the limit returns <code style={{ fontFamily: mono, color: NL.warning }}>429 Too Many Requests</code>. After 3 violations within 10 minutes your IP is permanently banned. To appeal, join our <a href="https://discord.gg/xvaNzE35Rs" target="_blank" rel="noreferrer" style={{ color: NL.accent }}>Discord</a>.
            </p>
          </div>

          <div style={{
            display: "flex", gap: 6, flexWrap: "wrap",
            padding: "12px 14px", borderRadius: 12,
            background: NL.surface, border: `1px solid ${NL.border}`,
            marginBottom: 24,
          }}>
            <span style={{ fontSize: 11, color: NL.muted, fontWeight: 600, alignSelf: "center", marginRight: 4, fontFamily: mono, textTransform: "uppercase", letterSpacing: "0.06em" }}>Jump to:</span>
            {ENDPOINTS.map(ep => (
              <a
                key={ep.id}
                href={`#${ep.id}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 12, padding: "4px 10px", borderRadius: 7,
                  background: NL.elevated, border: `1px solid ${NL.border}`,
                  color: NL.secondary, textDecoration: "none",
                  transition: "color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.borderColor = NL.borderMid; }}
                onMouseLeave={e => { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.borderColor = NL.border; }}
              >
                <MethodBadge method={ep.method} />
                {ep.title}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ENDPOINTS.map(ep => <EndpointCard key={ep.id} ep={ep} />)}
          </div>

          <p style={{ fontSize: 11, color: NL.muted, marginTop: 32, textAlign: "center" }}>
            All responses are JSON · HTTPS only · 60 req/min per IP
          </p>
        </div>
      </div>
    </Layout>
  );
}
