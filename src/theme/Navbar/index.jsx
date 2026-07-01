import { useState, useEffect, useRef } from "react";
import { FaDiscord, FaBook, FaChevronDown, FaSearch, FaCode, FaTachometerAlt, FaHandshake, FaHeart, FaBug, FaCircle, FaLayerGroup, FaFlask, FaUser, FaSignOutAlt, FaPalette, FaChartBar, FaStar, FaPlug, FaEnvelope, FaShieldAlt, FaFileAlt, FaGamepad, FaUsers, FaServer, FaWrench, FaQuestionCircle, FaBell } from "react-icons/fa";

const NOTIF_TEXT = {
  skin_liked:       n => `${n.actor_username} liked your skin "${n.target_name}"`,
  comment_received: n => `${n.actor_username} commented on "${n.target_name}"`,
  pack_approved:    n => `Your pack "${n.target_name}" has been approved!`,
  pack_rejected:    n => `Your pack "${n.target_name}" was not approved.`,
  friend_request:   n => `${n.actor_username} sent you a friend request`,
  friend_accepted:  n => `${n.actor_username} accepted your friend request`,
  message_received: n => `New message from ${n.actor_username}`,
};
import { useHistory, useLocation } from "@docusaurus/router";
import sidebars from "../../../sidebars.js";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseClient.js";
import { useAuth } from "../../useAuth.js";
import { API_BASE } from "../../lib/api";
import { T } from "../../lib/tokens";
import { timeAgo } from "../../lib/date-utils";

const NL = {
  ...T,
  elevated: T.raised,
  secondary: T.sub,
  accent: T.green,
};

const DOC_SIDEBAR = sidebars.tutorialSidebar || sidebars.geyserSidebar || [];
const H = 62;

function SidebarDropdown({ items, onClose, level = 0 }) {
  if (!items) return null;
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: level > 0 ? "4px 0 0 12px" : 0 }}>
      {items.map(item => {
        if (item.type === "doc") return (
          <li key={item.id}>
            <a
              href={`/docs/${item.id}`}
              onClick={onClose}
              style={{ display: "block", padding: "7px 10px", borderRadius: 6, color: NL.secondary, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" }}
              onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.background = NL.elevated; }}
              onMouseLeave={e => { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.background = "transparent"; }}
            >{item.label}</a>
          </li>
        );
        if (item.type === "category") return (
          <li key={item.label} style={{ marginTop: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, color: NL.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              <FaChevronDown style={{ fontSize: 9, opacity: 0.5 }} />{item.label}
            </div>
            <SidebarDropdown items={item.items} onClose={onClose} level={level + 1} />
          </li>
        );
        if (typeof item === "string") return (
          <li key={item}>
            <a
              href={`/docs/${item.replace(/\/?index$/, "")}`}
              onClick={onClose}
              style={{ display: "block", padding: "7px 10px", borderRadius: 6, color: NL.secondary, fontSize: 13, textDecoration: "none" }}
              onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.background = NL.elevated; }}
              onMouseLeave={e => { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.background = "transparent"; }}
            >{item.split("/").slice(-1)[0].replace(/-/g, " ")}</a>
          </li>
        );
        return null;
      })}
    </ul>
  );
}

const WIKI_GROUPS = [
  {
    label: "Connect from console",
    items: [
      { label: "Overview", desc: "How the relay works", path: "/docs/overview", icon: <FaBook size={13} /> },
      { label: "Friends Mode", desc: "Join via friend list", path: "/docs/howto/friend-howto", icon: <FaUsers size={13} /> },
      { label: "Java Mode", desc: "Connect to Java servers", path: "/docs/howto/java-howto", icon: <FaCode size={13} /> },
      { label: "Nintendo Switch", desc: "Setup guide for Switch", path: "/docs/howto/nintendo-howto", icon: <FaGamepad size={13} /> },
      { label: "PlayStation & Xbox", desc: "Setup for PS & Xbox", path: "/docs/howto/playstation-xbox-howto", icon: <FaGamepad size={13} /> },
    ],
  },
  {
    label: "Features",
    items: [
      { label: "Account & Profile", desc: "Manage your account", path: "/docs/features/account", icon: <FaUser size={13} /> },
      { label: "Player Lookup", desc: "Search any Bedrock player", path: "/docs/features/player-lookup", icon: <FaSearch size={13} /> },
      { label: "Server Tracker", desc: "Track servers in-app", path: "/docs/features/server-tracker", icon: <FaServer size={13} /> },
      { label: "Skins", desc: "Cloud skins & workshop", path: "/docs/features/skins", icon: <FaPalette size={13} /> },
      { label: "Friends & Chat", desc: "In-app social features", path: "/docs/features/friends-chat", icon: <FaUsers size={13} /> },
      { label: "Resource Packs", desc: "Browse & submit packs", path: "/docs/features/resource-packs", icon: <FaLayerGroup size={13} /> },
    ],
  },
  {
    label: "Server owners & help",
    items: [
      { label: "Partner Program", desc: "Feature your server", path: "/docs/partner-servers/partner-overview", icon: <FaHandshake size={13} /> },
      { label: "Discord Bot", desc: "Live status embeds", path: "/docs/discord-bot/discord-bot-setup", icon: <FaDiscord size={13} />, iconColor: "#7289da" },
      { label: "API", desc: "Integrate with our API", path: "/docs/api/api-overview", icon: <FaPlug size={13} /> },
      { label: "Nintendo DNS issue", desc: "Fix DNS not working", path: "/docs/issues/dns-issue", icon: <FaQuestionCircle size={13} /> },
      { label: "Not appearing", desc: "MCCompanion not showing", path: "/docs/issues/does-not-appear-issue", icon: <FaQuestionCircle size={13} /> },
      { label: "Friends mode fix", desc: "Friends mode not working", path: "/docs/issues/friend-issue", icon: <FaQuestionCircle size={13} /> },
      { label: "Connection failed", desc: "Multiplayer connection fix", path: "/docs/issues/mcf-issue", icon: <FaQuestionCircle size={13} /> },
    ],
  },
];

const MEGA_GROUPS = [
  {
    label: "TOOLS",
    items: [
      { label: "Skins", desc: "Browse community skins", path: "/skins", icon: <FaPalette size={14} /> },
      { label: "Skin Editor", desc: "Create & edit skins", path: "/skin-editor", icon: <FaPalette size={14} /> },
      { label: "Player Lookup", desc: "Find any Bedrock player", path: "/lookup", icon: <FaSearch size={14} /> },
      { label: "Resource Packs", desc: "Browse community packs", path: "/packs", icon: <FaLayerGroup size={14} /> },
      { label: "RP Editor", desc: "Merge & edit resource packs", path: "/rpeditor", icon: <FaCode size={14} /> },
      { label: "Server Metrics", desc: "Track server performance", path: "/metrics", icon: <FaChartBar size={14} /> },
    ],
  },
  {
    label: "COMMUNITY",
    items: [
      { label: "Leaderboards", desc: "Top skins & resource packs", path: "/leaderboards", icon: <FaChartBar size={14} /> },
      { label: "Discord", desc: "Chat with the community", href: "https://discord.gg/xvaNzE35Rs", icon: <FaDiscord size={14} />, iconColor: "#7289da" },
      { label: "Discord Bot", desc: "Live server status in Discord", path: "/discord-bot", icon: <FaDiscord size={14} />, iconColor: "#5865f2" },
      { label: "Partner Program", desc: "Grow with MCCompanion", path: "/partner", icon: <FaHandshake size={14} /> },
      { label: "Beta", desc: "Try new features early", path: "/beta", icon: <FaFlask size={14} /> },
      { label: "Bug Report", desc: "Report an issue", path: "/feedback", icon: <FaBug size={14} /> },
      { label: "Contact", desc: "Get in touch with us", path: "/contact", icon: <FaEnvelope size={14} /> },
      { label: "Sponsor", desc: "Support the project", href: "https://github.com/sponsors/MCCORG", icon: <FaHeart size={14} />, iconColor: "#f87171" },
    ],
  },
  {
    label: "MORE",
    items: [
      { label: "API Docs", desc: "Integrate with our API", path: "/api-docs", icon: <FaPlug size={14} /> },
      { label: "Status", desc: "Service health", path: "/status", icon: <FaCircle size={10} />, iconColor: "#67e404" },
      { label: "Privacy Policy", desc: "How we handle your data", path: "/privacy", icon: <FaShieldAlt size={14} /> },
      { label: "Terms of Service", desc: "Usage terms", path: "/terms", icon: <FaFileAlt size={14} /> },
    ],
  },
];

const btnReset = {
  background: "none", border: "none", cursor: "pointer",
  fontFamily: "'Inter', system-ui, sans-serif",
  padding: 0, margin: 0,
};

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [wikiDrop, setWikiDrop] = useState(false);
  const [wikiDropMobile, setWikiDropMobile] = useState(false);
  const [megaDrop, setMegaDrop] = useState(false);
  const [megaDropMobile, setMegaDropMobile] = useState({});
  const [userDrop, setUserDrop] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef();
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef();
  const hamburgerRef = useRef();
  const wikiRef = useRef();
  const megaRef = useRef();
  const userRef = useRef();
  const history = useHistory();
  const location = useLocation();
  const { user, role } = useAuth();

  useEffect(() => {
    function check() {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setDrawerOpen(false);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setDrawerOpen(false); setWikiDrop(false); setWikiDropMobile(false); setMegaDrop(false);
  }, [location.pathname]);

  useEffect(() => {
    const h = e => { if (wikiRef.current && !wikiRef.current.contains(e.target)) setWikiDrop(false); };
    if (wikiDrop) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [wikiDrop]);

  useEffect(() => {
    const h = e => { if (megaRef.current && !megaRef.current.contains(e.target)) setMegaDrop(false); };
    if (megaDrop) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [megaDrop]);

  useEffect(() => {
    const h = e => { if (userRef.current && !userRef.current.contains(e.target)) setUserDrop(false); };
    if (userDrop) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [userDrop]);

  useEffect(() => {
    const h = e => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        hamburgerRef.current && !hamburgerRef.current.contains(e.target)
      ) setDrawerOpen(false);
    };
    if (drawerOpen) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [drawerOpen]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    if (!user) { setNotifs([]); setUnreadCount(0); return; }
    const load = async () => {
      try {
        const token = await user.getIdToken();
        const r = await fetch(`${API_BASE}/api/notifications?limit=20`, { headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) return;
        const d = await r.json();
        setNotifs(d.notifications ?? []);
        setUnreadCount(d.unreadCount ?? 0);
      } catch (_) {}
    };
    load();
    const iv = setInterval(load, 60_000);
    return () => clearInterval(iv);
  }, [user]);

  useEffect(() => {
    if (!bellOpen) return;
    const h = e => { if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [bellOpen]);

  async function markAllRead() {
    if (!user || unreadCount === 0) return;
    try {
      const token = await user.getIdToken();
      await fetch(`${API_BASE}/api/notifications/read`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({}) });
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (_) {}
  }

  function navigate(path) {
    history.push(path);
    setDrawerOpen(false); setWikiDrop(false); setWikiDropMobile(false); setMegaDrop(false);
  }

  async function handleSignOut() {
    try { await signOut(auth); } catch (_) { }
    navigate("/");
  }

  const drawerBtn = (color = NL.secondary) => ({
    ...btnReset,
    display: "flex", alignItems: "center", gap: 8,
    width: "100%", padding: "11px 12px", borderRadius: 8,
    fontSize: 13, fontWeight: 500, color,
  });
  const drawerEnter = e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.background = NL.elevated; };
  const drawerLeave = (color = NL.secondary) => e => { e.currentTarget.style.color = color; e.currentTarget.style.background = "none"; };

  function MegaItem({ item }) {
    const [hov, setHov] = useState(false);
    const handleClick = () => {
      setMegaDrop(false); setWikiDrop(false);
      if (item.href) window.open(item.href, "_blank", "noopener,noreferrer");
      else navigate(item.path);
    };
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          ...btnReset,
          display: "flex", alignItems: "flex-start", gap: 10,
          width: "100%", padding: "9px 10px", borderRadius: 8, textAlign: "left",
          background: hov ? NL.elevated : "transparent",
          transition: "background 0.12s",
        }}
      >
        <span style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 30, height: 30, borderRadius: 7, flexShrink: 0,
          background: hov ? "rgba(103,228,4,0.1)" : "rgba(255,255,255,0.04)",
          color: item.iconColor || (hov ? NL.accent : NL.secondary),
          transition: "background 0.12s, color 0.12s",
        }}>{item.icon}</span>
        <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: hov ? NL.text : NL.text, lineHeight: 1.3 }}>{item.label}</span>
          <span style={{ fontSize: 11, color: NL.muted, lineHeight: 1.3 }}>{item.desc}</span>
        </span>
      </button>
    );
  }

  return (
    <>
      <style>{`
        div.navbar {
          padding: 0 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          flex-wrap: nowrap !important;
        }
        div.navbar .navbar__inner { display: none !important; }
      `}</style>
      <div className="navbar" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        height: H,
        background: NL.surface,
        borderBottom: `1px solid ${scrolled ? NL.border : "transparent"}`,
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.25)" : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        boxSizing: "border-box",
      }}>

        <div onClick={() => history.push("/")} style={{ display: "flex", alignItems: "center", cursor: "pointer", userSelect: "none", flexShrink: 0, height: H, overflow: "hidden" }}>
          <img src="/img/logo_big.png" alt="MCCompanion" style={{ height: 160, width: "auto" }} />
        </div>

        {!isMobile && (
          <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>

            <div ref={wikiRef} style={{ position: "relative" }}>
              <button onClick={() => setWikiDrop(x => !x)} style={{
                ...btnReset,
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "6px 10px", borderRadius: 8,
                fontSize: 13, fontWeight: 500,
                color: wikiDrop ? NL.text : NL.secondary,
                background: wikiDrop ? NL.elevated : "none",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.background = NL.elevated; }}
                onMouseLeave={e => { if (!wikiDrop) { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.background = "none"; } }}
              >
                <FaBook size={12} /> Wiki
                <FaChevronDown size={9} style={{ transition: "transform 0.2s", transform: wikiDrop ? "rotate(180deg)" : "none" }} />
              </button>
              {wikiDrop && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  background: NL.surface, border: `1px solid ${NL.borderMid}`,
                  borderRadius: 14, padding: 16,
                  boxShadow: "0 16px 48px rgba(0,0,0,0.5)", zIndex: 1001,
                  display: "flex", gap: 8, minWidth: 560,
                }}>
                  {WIKI_GROUPS.map(group => (
                    <div key={group.label} style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: NL.muted, textTransform: "uppercase", padding: "0 10px", marginBottom: 6 }}>{group.label}</div>
                      {group.items.map(item => <MegaItem key={item.label} item={{ ...item, _closeWiki: true }} />)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div ref={megaRef} style={{ position: "relative" }}>
              <button onClick={() => setMegaDrop(x => !x)} style={{
                ...btnReset,
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "6px 10px", borderRadius: 8,
                fontSize: 13, fontWeight: 500,
                color: megaDrop ? NL.text : NL.secondary,
                background: megaDrop ? NL.elevated : "none",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.background = NL.elevated; }}
                onMouseLeave={e => { if (!megaDrop) { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.background = "none"; } }}
              >
                Explore
                <FaChevronDown size={9} style={{ transition: "transform 0.2s", transform: megaDrop ? "rotate(180deg)" : "none" }} />
              </button>
              {megaDrop && (
                <div style={{
                  position: "absolute", right: 0,
                  top: "calc(100% + 8px)",
                  background: NL.surface, border: `1px solid ${NL.borderMid}`,
                  borderRadius: 14, padding: 16,
                  boxShadow: "0 16px 48px rgba(0,0,0,0.5)", zIndex: 1001,
                  display: "flex", gap: 8,
                  minWidth: 580,
                }}>
                  {MEGA_GROUPS.map(group => (
                    <div key={group.label} style={{ flex: group.items.length > 3 ? 1 : "0 0 160px", minWidth: 0 }}>
                      <div style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                        color: NL.muted, textTransform: "uppercase",
                        padding: "0 10px", marginBottom: 6,
                      }}>{group.label}</div>
                      {group.items.map(item => <MegaItem key={item.label} item={item} />)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <a href="https://github.com/sponsors/MCCORG" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 7, fontSize: 13, fontWeight: 600, color: NL.accent, textDecoration: "none", background: "rgba(103,228,4,0.08)", border: "1px solid rgba(103,228,4,0.20)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(103,228,4,0.15)"; e.currentTarget.style.borderColor = "rgba(103,228,4,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(103,228,4,0.08)"; e.currentTarget.style.borderColor = "rgba(103,228,4,0.20)"; }}
            >
              <FaHeart size={12} /> Sponsor
            </a>

            <span style={{ width: 1, height: 18, background: NL.border, margin: "0 4px" }} />

            {user && (
              <div ref={bellRef} style={{ position: "relative" }}>
                <button type="button" onClick={() => { setBellOpen(x => !x); if (!bellOpen) markAllRead(); }} style={{
                  ...btnReset, position: "relative",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 32, height: 32, borderRadius: "50%",
                  background: bellOpen ? NL.elevated : "transparent",
                  border: `1px solid ${bellOpen ? NL.borderMid : "transparent"}`,
                  color: unreadCount > 0 ? NL.accent : NL.secondary,
                  transition: "background 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = NL.elevated; e.currentTarget.style.borderColor = NL.borderMid; }}
                  onMouseLeave={e => { if (!bellOpen) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}
                  title="Notificaties"
                >
                  <FaBell size={13} />
                  {unreadCount > 0 && (
                    <span style={{ position: "absolute", top: 3, right: 3, width: 8, height: 8, borderRadius: "50%", background: "#f87171", border: "1.5px solid #0d1117" }} />
                  )}
                </button>
                {bellOpen && (
                  <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)", width: 320,
                    background: NL.surface, border: `1px solid ${NL.borderMid}`,
                    borderRadius: 12, overflow: "hidden",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.5)", zIndex: 1001,
                  }}>
                    <div style={{ padding: "10px 14px", borderBottom: `1px solid ${NL.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: NL.text }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button type="button" onClick={markAllRead} style={{ ...btnReset, fontSize: 11, color: NL.accent }}>Mark all read</button>
                      )}
                    </div>
                    <div style={{ maxHeight: 360, overflowY: "auto" }}>
                      {notifs.length === 0 ? (
                        <div style={{ padding: "24px 14px", textAlign: "center", color: NL.muted, fontSize: 13 }}>No notifications yet</div>
                      ) : notifs.map(n => (
                        <div key={n.id} style={{
                          display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px",
                          borderBottom: `1px solid ${NL.border}`,
                          background: n.read ? "transparent" : "rgba(103,228,4,0.04)",
                        }}>
                          {n.actor_avatar ? (
                            <img src={n.actor_avatar} alt="" style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, marginTop: 1 }} />
                          ) : (
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: NL.elevated, flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: NL.muted }}>
                              {(n.actor_username ?? "?")[0].toUpperCase()}
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 12, color: NL.text, lineHeight: 1.4 }}>
                              {NOTIF_TEXT[n.type]?.(n) ?? n.type}
                            </p>
                            <p style={{ margin: "2px 0 0", fontSize: 11, color: NL.muted }}>
                              {timeAgo(n.created_at)}
                            </p>
                          </div>
                          {!n.read && <span style={{ width: 7, height: 7, borderRadius: "50%", background: NL.accent, flexShrink: 0, marginTop: 4 }} />}
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: "8px 14px", borderTop: `1px solid ${NL.border}` }}>
                      <button type="button" onClick={() => { navigate("/account"); setBellOpen(false); }} style={{ ...btnReset, fontSize: 12, color: NL.accent }}>
                        Notification settings →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div ref={userRef} style={{ position: "relative" }}>
                <button onClick={() => setUserDrop(x => !x)} style={{
                  ...btnReset,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 32, height: 32, borderRadius: "50%",
                  background: userDrop ? "rgba(103,228,4,0.15)" : "rgba(103,228,4,0.08)",
                  border: `1px solid ${userDrop ? "rgba(103,228,4,0.4)" : "rgba(103,228,4,0.2)"}`,
                  color: NL.accent, fontSize: 13, fontWeight: 700,
                  transition: "background 0.15s, border-color 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(103,228,4,0.15)"; e.currentTarget.style.borderColor = "rgba(103,228,4,0.4)"; }}
                  onMouseLeave={e => { if (!userDrop) { e.currentTarget.style.background = "rgba(103,228,4,0.08)"; e.currentTarget.style.borderColor = "rgba(103,228,4,0.2)"; } }}
                  title="Account"
                >
                  {(user.displayName || user.email || "?")[0].toUpperCase()}
                </button>
                {userDrop && (
                  <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)", minWidth: 160,
                    background: NL.surface, border: `1px solid ${NL.borderMid}`,
                    borderRadius: 10, padding: 6,
                    boxShadow: "0 12px 40px rgba(0,0,0,0.4)", zIndex: 1001,
                  }}>
                    {[
                      { label: "Profile", path: "/account", icon: <FaUser size={11} /> },
                      (role === "partner" || role === "admin") && { label: "Partner", path: "/partner-portal", icon: <FaHandshake size={11} /> },
                      role === "admin" && { label: "Admin", path: "/admin", icon: <FaTachometerAlt size={11} /> },
                    ].filter(Boolean).map(item => (
                      <button key={item.path} onClick={() => { navigate(item.path); setUserDrop(false); }}
                        style={{ ...btnReset, display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", borderRadius: 6, fontSize: 13, color: NL.secondary }}
                        onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.background = NL.elevated; }}
                        onMouseLeave={e => { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.background = "transparent"; }}
                      >{item.icon} {item.label}</button>
                    ))}
                    <div style={{ height: 1, background: NL.border, margin: "4px 0" }} />
                    <button onClick={() => { handleSignOut(); setUserDrop(false); }}
                      style={{ ...btnReset, display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 10px", borderRadius: 6, fontSize: 13, color: NL.muted }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = NL.elevated; }}
                      onMouseLeave={e => { e.currentTarget.style.color = NL.muted; e.currentTarget.style.background = "transparent"; }}
                    ><FaSignOutAlt size={11} /> Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => navigate("/login")} style={{ ...btnReset, display: "inline-flex", alignItems: "center", padding: "6px 14px", borderRadius: 7, fontSize: 13, fontWeight: 500, color: NL.secondary, background: NL.elevated, border: `1px solid ${NL.border}` }}
                onMouseEnter={e => { e.currentTarget.style.color = NL.text; e.currentTarget.style.borderColor = NL.borderMid; }}
                onMouseLeave={e => { e.currentTarget.style.color = NL.secondary; e.currentTarget.style.borderColor = NL.border; }}
              >Sign in</button>
            )}
          </nav>
        )}

        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {user && (
              <div ref={bellRef} style={{ position: "relative" }}>
                <button type="button" onClick={() => { setBellOpen(x => !x); if (!bellOpen) markAllRead(); }} style={{
                  ...btnReset, position: "relative",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 32, height: 32, borderRadius: "50%",
                  color: unreadCount > 0 ? NL.accent : NL.secondary,
                }} title="Notifications">
                  <FaBell size={15} />
                  {unreadCount > 0 && (
                    <span style={{ position: "absolute", top: 3, right: 3, width: 8, height: 8, borderRadius: "50%", background: "#f87171", border: "1.5px solid #131820" }} />
                  )}
                </button>
                {bellOpen && (
                  <div style={{
                    position: "fixed", top: H + 6, right: 10, left: 10,
                    background: NL.surface, border: `1px solid ${NL.borderMid}`,
                    borderRadius: 12, overflow: "hidden",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.5)", zIndex: 1100,
                  }}>
                    <div style={{ padding: "10px 14px", borderBottom: `1px solid ${NL.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: NL.text }}>Notifications</span>
                      <button type="button" onClick={() => setBellOpen(false)} style={{ ...btnReset, fontSize: 11, color: NL.muted }}>✕</button>
                    </div>
                    <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
                      {notifs.length === 0 ? (
                        <div style={{ padding: "24px 14px", textAlign: "center", color: NL.muted, fontSize: 13 }}>No notifications yet</div>
                      ) : notifs.map(n => (
                        <div key={n.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", borderBottom: `1px solid ${NL.border}`, background: n.read ? "transparent" : "rgba(103,228,4,0.04)" }}>
                          {n.actor_avatar
                            ? <img src={n.actor_avatar} alt="" style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, marginTop: 1 }} />
                            : <div style={{ width: 28, height: 28, borderRadius: "50%", background: NL.elevated, flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: NL.muted }}>{(n.actor_username ?? "?")[0].toUpperCase()}</div>
                          }
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 12, color: NL.text, lineHeight: 1.4 }}>{NOTIF_TEXT[n.type]?.(n) ?? n.type}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 11, color: NL.muted }}>{timeAgo(n.created_at)}</p>
                          </div>
                          {!n.read && <span style={{ width: 7, height: 7, borderRadius: "50%", background: NL.accent, flexShrink: 0, marginTop: 4 }} />}
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: "8px 14px", borderTop: `1px solid ${NL.border}` }}>
                      <button type="button" onClick={() => { navigate("/account"); setBellOpen(false); }} style={{ ...btnReset, fontSize: 12, color: NL.accent }}>Notification settings →</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <button ref={hamburgerRef} onClick={() => setDrawerOpen(v => !v)} aria-label="Toggle menu"
              style={{ ...btnReset, display: "flex", flexDirection: "column", gap: 5, padding: 6 }}
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: "block", width: 22, height: 2, borderRadius: 1, background: NL.secondary,
                  transition: "transform 0.2s, opacity 0.2s",
                  transform: drawerOpen
                    ? i === 0 ? "translateY(7px) rotate(45deg)"
                      : i === 2 ? "translateY(-7px) rotate(-45deg)" : "none"
                    : "none",
                  opacity: drawerOpen && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        )}
      </div>

      {isMobile && (
        <div ref={menuRef} style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "min(78vw, 300px)",
          background: NL.surface, borderLeft: `1px solid ${NL.border}`,
          paddingTop: H + 8,
          display: "flex", flexDirection: "column",
          overflowY: "auto",
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s ease",
          zIndex: 999,
          boxShadow: drawerOpen ? "-12px 0 40px rgba(0,0,0,0.5)" : "none",
          boxSizing: "border-box",
        }}>
          <div style={{ padding: "0 10px", display: "flex", flexDirection: "column", gap: 2 }}>

            <button onClick={() => setWikiDropMobile(x => !x)} style={drawerBtn()}
              onMouseEnter={drawerEnter} onMouseLeave={drawerLeave()}
            >
              <FaBook size={14} /> Wiki
              <FaChevronDown size={10} style={{ marginLeft: "auto", transform: wikiDropMobile ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>
            {wikiDropMobile && DOC_SIDEBAR.length > 0 && (
              <div style={{ paddingLeft: 12, borderLeft: `2px solid ${NL.border}`, marginLeft: 12, marginBottom: 4 }}>
                <SidebarDropdown items={DOC_SIDEBAR} onClose={() => { setWikiDropMobile(false); setDrawerOpen(false); }} />
              </div>
            )}

            <div style={{ height: 1, background: NL.border, margin: "4px 0" }} />
            <div style={{ padding: "4px 12px 2px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: NL.muted, textTransform: "uppercase" }}>Tools</div>
            {MEGA_GROUPS[0].items.map(item => (
              <button key={item.label} onClick={() => navigate(item.path)} style={drawerBtn()}
                onMouseEnter={drawerEnter} onMouseLeave={drawerLeave()}
              >{item.icon} {item.label}</button>
            ))}

            <div style={{ height: 1, background: NL.border, margin: "4px 0" }} />
            <div style={{ padding: "4px 12px 2px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: NL.muted, textTransform: "uppercase" }}>Community</div>
            {MEGA_GROUPS[1].items.map(item => (
              item.href
                ? <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
                    onClick={() => setDrawerOpen(false)}
                    style={{ ...drawerBtn(item.iconColor || NL.secondary), textDecoration: "none" }}
                    onMouseEnter={drawerEnter} onMouseLeave={drawerLeave(item.iconColor || NL.secondary)}
                  ><span style={{ color: item.iconColor || NL.secondary }}>{item.icon}</span> {item.label}</a>
                : <button key={item.label} onClick={() => navigate(item.path)} style={drawerBtn()}
                    onMouseEnter={drawerEnter} onMouseLeave={drawerLeave()}
                  >{item.icon} {item.label}</button>
            ))}

            <div style={{ height: 1, background: NL.border, margin: "4px 0" }} />
            <div style={{ padding: "4px 12px 2px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: NL.muted, textTransform: "uppercase" }}>More</div>
            {MEGA_GROUPS[2].items.map(item => (
              <button key={item.label} onClick={() => navigate(item.path)} style={drawerBtn()}
                onMouseEnter={drawerEnter} onMouseLeave={drawerLeave()}
              >{item.icon} {item.label}</button>
            ))}

            <div style={{ height: 1, background: NL.border, margin: "4px 0" }} />

            {user ? (
              <>
                {[
                  { label: "Profile", path: "/account", icon: <FaUser size={13} /> },
                  (role === "partner" || role === "admin") && { label: "Partner", path: "/partner-portal", icon: <FaHandshake size={13} /> },
                  role === "admin" && { label: "Admin", path: "/admin", icon: <FaTachometerAlt size={13} /> },
                ].filter(Boolean).map(item => (
                  <button key={item.path} onClick={() => navigate(item.path)} style={drawerBtn()}
                    onMouseEnter={drawerEnter} onMouseLeave={drawerLeave()}
                  >{item.icon} {item.label}</button>
                ))}
                <button onClick={handleSignOut} style={{ ...drawerBtn("#f87171") }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#fca5a5"; e.currentTarget.style.background = NL.elevated; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "none"; }}
                ><FaSignOutAlt size={13} /> Sign out</button>
              </>
            ) : (
              <button onClick={() => navigate("/login")} style={drawerBtn()}
                onMouseEnter={drawerEnter} onMouseLeave={drawerLeave()}
              >Sign in</button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
